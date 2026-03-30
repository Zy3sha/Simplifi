import Foundation
import Capacitor
import CoreLocation
import MapKit

/// Calculates driving travel time from the user's current location to a destination address
/// using Apple's MapKit MKDirections API — like Apple Calendar's "Time to Leave" feature.
@objc(OBTravelTime)
public class TravelTimePlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate {
    public let identifier = "OBTravelTime"
    public let jsName = "OBTravelTime"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "calculate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "geocode", returnType: CAPPluginReturnPromise),
    ]

    private var locationManager: CLLocationManager?
    private var pendingCall: CAPPluginCall?
    private var pendingAddress: String?

    /// Calculate travel time from current location to a destination address.
    /// Returns { travelMins: Int, distanceKm: Double, address: String }
    @objc func calculate(_ call: CAPPluginCall) {
        guard let address = call.getString("address"), !address.isEmpty else {
            call.reject("Address is required")
            return
        }

        // First geocode the address
        let geocoder = CLGeocoder()
        geocoder.geocodeAddressString(address) { [weak self] placemarks, error in
            guard let self = self else { return }

            if let error = error {
                call.reject("Could not find address: \(error.localizedDescription)")
                return
            }

            guard let destination = placemarks?.first?.location?.coordinate else {
                call.reject("Could not find coordinates for this address")
                return
            }

            // Now get current location and calculate route
            self.pendingCall = call
            self.pendingAddress = address
            self.calculateRoute(to: destination, call: call)
        }
    }

    /// Just geocode an address to coordinates (useful for validation).
    @objc func geocode(_ call: CAPPluginCall) {
        guard let address = call.getString("address"), !address.isEmpty else {
            call.reject("Address is required")
            return
        }

        let geocoder = CLGeocoder()
        geocoder.geocodeAddressString(address) { placemarks, error in
            if let error = error {
                call.reject("Geocode failed: \(error.localizedDescription)")
                return
            }

            guard let placemark = placemarks?.first,
                  let location = placemark.location else {
                call.reject("No results found")
                return
            }

            var result: [String: Any] = [
                "lat": location.coordinate.latitude,
                "lng": location.coordinate.longitude,
            ]

            // Build a formatted address from the placemark
            var parts: [String] = []
            if let name = placemark.name { parts.append(name) }
            if let locality = placemark.locality { parts.append(locality) }
            if let postalCode = placemark.postalCode { parts.append(postalCode) }
            result["formattedAddress"] = parts.joined(separator: ", ")

            call.resolve(result)
        }
    }

    private func calculateRoute(to destination: CLLocationCoordinate2D, call: CAPPluginCall) {
        // Try to get current location
        let locationManager = CLLocationManager()
        let authStatus = locationManager.authorizationStatus

        if authStatus == .notDetermined {
            // We don't have permission — estimate from a stored home location or return error
            call.reject("Location permission not granted. Please enable Location Services for OBubba.")
            return
        }

        if authStatus == .denied || authStatus == .restricted {
            // Fallback: use a rough estimate based on distance from centre of UK
            // This is better than nothing for users who deny location
            let defaultLocation = CLLocationCoordinate2D(latitude: 52.0, longitude: -1.5) // Central UK
            self.performRouteCalculation(from: defaultLocation, to: destination, call: call, approximate: true)
            return
        }

        // We have permission — get current location
        if let currentLocation = locationManager.location {
            self.performRouteCalculation(from: currentLocation.coordinate, to: destination, call: call, approximate: false)
        } else {
            // Location not available yet — use a rough estimate
            let defaultLocation = CLLocationCoordinate2D(latitude: 52.0, longitude: -1.5)
            self.performRouteCalculation(from: defaultLocation, to: destination, call: call, approximate: true)
        }
    }

    private func performRouteCalculation(from source: CLLocationCoordinate2D, to destination: CLLocationCoordinate2D, call: CAPPluginCall, approximate: Bool) {
        let request = MKDirections.Request()
        request.source = MKMapItem(placemark: MKPlacemark(coordinate: source))
        request.destination = MKMapItem(placemark: MKPlacemark(coordinate: destination))
        request.transportType = .automobile
        request.requestsAlternateRoutes = false

        let directions = MKDirections(request: request)
        directions.calculateETA { response, error in
            if let error = error {
                // Fallback: estimate based on straight-line distance
                let sourceLoc = CLLocation(latitude: source.latitude, longitude: source.longitude)
                let destLoc = CLLocation(latitude: destination.latitude, longitude: destination.longitude)
                let distanceKm = sourceLoc.distance(from: destLoc) / 1000.0
                // Rough estimate: 40 km/h average in UK with traffic + parking
                let estimatedMins = Int(ceil(distanceKm / 40.0 * 60.0)) + 10 // +10 for parking/walking
                call.resolve([
                    "travelMins": max(estimatedMins, 10),
                    "distanceKm": round(distanceKm * 10) / 10,
                    "approximate": true,
                    "error": error.localizedDescription
                ])
                return
            }

            guard let eta = response else {
                call.reject("Could not calculate route")
                return
            }

            let travelSeconds = eta.expectedTravelTime
            let travelMins = Int(ceil(travelSeconds / 60.0))
            let distanceMeters = eta.distance
            let distanceKm = distanceMeters / 1000.0

            // Add buffer: 5 min for short trips, 10 min for longer ones (parking, getting baby ready)
            let buffer = travelMins > 30 ? 15 : 10
            let totalMins = travelMins + buffer

            call.resolve([
                "travelMins": totalMins,
                "drivingMins": travelMins,
                "bufferMins": buffer,
                "distanceKm": round(distanceKm * 10) / 10,
                "approximate": approximate
            ])
        }
    }
}
