import Foundation
import Capacitor
import EventKit
import EventKitUI

@objc(OBCalendar)
public class CalendarPlugin: CAPPlugin, CAPBridgedPlugin, EKEventEditViewDelegate {
    public let identifier = "OBCalendar"
    public let jsName = "OBCalendar"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "addEvent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addEvents", returnType: CAPPluginReturnPromise),
    ]

    private let eventStore = EKEventStore()

    @objc func addEvent(_ call: CAPPluginCall) {
        guard let eventData = makeEventData(from: call) else {
            call.reject("date is required")
            return
        }

        if call.getBool("direct") ?? false {
            saveEvents([eventData], call: call)
            return
        }

        DispatchQueue.main.async {
            let event = self.makeEvent(from: eventData)

            let editor = EKEventEditViewController()
            editor.eventStore = self.eventStore
            editor.event = event
            editor.editViewDelegate = self

            guard let presenter = self.bridge?.viewController else {
                call.reject("No view controller available")
                return
            }

            presenter.present(editor, animated: true)
            call.resolve(["opened": true])
        }
    }

    @objc func addEvents(_ call: CAPPluginCall) {
        guard let rawEvents = call.getArray("events") else {
            call.reject("events are required")
            return
        }

        let events = rawEvents.compactMap { item -> CalendarEventData? in
            guard let object = item as? JSObject else { return nil }
            return makeEventData(from: object)
        }

        guard !events.isEmpty else {
            call.reject("No valid calendar events")
            return
        }

        saveEvents(events, call: call)
    }

    public func eventEditViewController(_ controller: EKEventEditViewController, didCompleteWith action: EKEventEditViewAction) {
        controller.dismiss(animated: true)
    }

    private struct CalendarEventData {
        let title: String
        let date: String
        let time: String
        let endDate: String
        let endTime: String?
        let allDay: Bool
        let location: String
        let note: String
        let alarm: Int
    }

    private func makeEventData(from call: CAPPluginCall) -> CalendarEventData? {
        guard let date = call.getString("date"), !date.isEmpty else { return nil }
        let allDay = call.getBool("allDay") ?? false
        return CalendarEventData(
            title: call.getString("title") ?? "OBubba appointment",
            date: date,
            time: allDay ? "00:00" : (call.getString("time") ?? "09:00"),
            endDate: call.getString("endDate") ?? date,
            endTime: call.getString("endTime"),
            allDay: allDay,
            location: call.getString("location") ?? "",
            note: call.getString("note") ?? "",
            alarm: call.getInt("alarm") ?? 0
        )
    }

    private func makeEventData(from object: JSObject) -> CalendarEventData? {
        guard let date = object["date"] as? String, !date.isEmpty else { return nil }
        let allDay = (object["allDay"] as? Bool) ?? false
        return CalendarEventData(
            title: (object["title"] as? String) ?? "OBubba appointment",
            date: date,
            time: allDay ? "00:00" : ((object["time"] as? String) ?? "09:00"),
            endDate: (object["endDate"] as? String) ?? date,
            endTime: object["endTime"] as? String,
            allDay: allDay,
            location: (object["location"] as? String) ?? "",
            note: (object["note"] as? String) ?? "",
            alarm: (object["alarm"] as? Int) ?? 0
        )
    }

    private func makeEvent(from data: CalendarEventData) -> EKEvent {
        let startDate = makeDate(date: data.date, time: data.allDay ? "00:00" : data.time) ?? Date()
        let endDate = makeEndDate(
            startDate: startDate,
            endDate: data.endDate,
            endTime: data.endTime,
            allDay: data.allDay
        )

        let event = EKEvent(eventStore: eventStore)
        event.title = data.title
        event.startDate = startDate
        event.endDate = endDate
        event.isAllDay = data.allDay
        event.location = data.location
        event.notes = data.note
        if data.alarm > 0 {
            event.addAlarm(EKAlarm(relativeOffset: TimeInterval(-data.alarm * 60)))
        }
        return event
    }

    private func saveEvents(_ events: [CalendarEventData], call: CAPPluginCall) {
        requestCalendarWriteAccess { granted, message in
            DispatchQueue.main.async {
                guard granted else {
                    call.reject(message ?? "Calendar permission denied")
                    return
                }

                guard let calendar = self.eventStore.defaultCalendarForNewEvents else {
                    call.reject("No writable calendar found")
                    return
                }

                do {
                    var eventIds: [String] = []
                    for data in events {
                        let event = self.makeEvent(from: data)
                        event.calendar = calendar
                        try self.eventStore.save(event, span: .thisEvent, commit: false)
                        if let id = event.eventIdentifier { eventIds.append(id) }
                    }
                    try self.eventStore.commit()
                    call.resolve(["saved": events.count, "eventIds": eventIds])
                } catch {
                    self.eventStore.reset()
                    call.reject("Could not save calendar event: \(error.localizedDescription)")
                }
            }
        }
    }

    private func requestCalendarWriteAccess(_ completion: @escaping (Bool, String?) -> Void) {
        let status = EKEventStore.authorizationStatus(for: .event)

        if #available(iOS 17.0, *) {
            switch status {
            case .fullAccess, .writeOnly, .authorized:
                completion(true, nil)
            case .notDetermined:
                eventStore.requestWriteOnlyAccessToEvents { granted, error in
                    completion(granted, error?.localizedDescription)
                }
            case .denied, .restricted:
                completion(false, "Calendar access is off. Enable Calendar access in Settings to add events.")
            @unknown default:
                completion(false, "Calendar access is unavailable.")
            }
            return
        }

        if status == .authorized {
            completion(true, nil)
            return
        }
        if status == .notDetermined {
            eventStore.requestAccess(to: .event) { granted, error in
                completion(granted, error?.localizedDescription)
            }
            return
        }
        if status == .denied || status == .restricted {
            completion(false, "Calendar access is off. Enable Calendar access in Settings to add events.")
            return
        }
        completion(false, "Calendar access is unavailable.")
    }

    private func makeDate(date: String, time: String) -> Date? {
        var comps = DateComponents()
        let dateParts = date.split(separator: "-").compactMap { Int($0) }
        guard dateParts.count == 3 else { return nil }
        let timeParts = time.split(separator: ":").compactMap { Int($0) }
        comps.year = dateParts[0]
        comps.month = dateParts[1]
        comps.day = dateParts[2]
        comps.hour = timeParts.indices.contains(0) ? timeParts[0] : 9
        comps.minute = timeParts.indices.contains(1) ? timeParts[1] : 0
        return Calendar.current.date(from: comps)
    }

    private func makeEndDate(startDate: Date, endDate: String, endTime: String?, allDay: Bool) -> Date {
        if allDay {
            let base = makeDate(date: endDate, time: "00:00") ?? startDate
            return Calendar.current.date(byAdding: .day, value: 1, to: base) ?? startDate.addingTimeInterval(86400)
        }

        if let endTime, !endTime.isEmpty, let parsedEnd = makeDate(date: endDate, time: endTime) {
            if parsedEnd > startDate { return parsedEnd }
            return Calendar.current.date(byAdding: .day, value: 1, to: parsedEnd)
                ?? startDate.addingTimeInterval(3600)
        }

        return startDate.addingTimeInterval(3600)
    }
}
