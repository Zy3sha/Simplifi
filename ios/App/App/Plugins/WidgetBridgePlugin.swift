import Foundation
import Capacitor
import WidgetKit

/// Bridges widget data between the web app and iOS WidgetKit.
/// Writes data to a shared App Group container file so widgets can read it.
/// Uses file-based sharing instead of UserDefaults to avoid CFPrefs container issues.
@objc(OBWidgetBridge)
public class WidgetBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "OBWidgetBridge"
    public let jsName = "OBWidgetBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setData", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reloadAll", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setTheme", returnType: CAPPluginReturnPromise),
    ]

    private let appGroupId = "group.com.obubba.app"
    private let maxWidgetDataBytes = 16 * 1024

    /// Returns the shared file URL for widget data
    private func sharedFileURL() -> URL? {
        FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupId)?
            .appendingPathComponent("widgetData.json")
    }

    private func safeWidgetJSON(_ rawJSON: String?) throws -> String {
        guard let rawJSON = rawJSON, let data = rawJSON.data(using: .utf8) else {
            throw NSError(domain: "OBWidgetBridge", code: 1, userInfo: nil)
        }
        guard data.count <= maxWidgetDataBytes else {
            throw NSError(domain: "OBWidgetBridge", code: 2, userInfo: nil)
        }
        guard (try JSONSerialization.jsonObject(with: data)) is [String: Any] else {
            throw NSError(domain: "OBWidgetBridge", code: 3, userInfo: nil)
        }
        return rawJSON
    }

    private func safeWidgetTheme(_ rawTheme: String?) -> String {
        let theme = rawTheme ?? "auto"
        switch theme {
        case "auto", "rose", "lavender", "mint", "sky", "dark":
            return theme
        default:
            return "auto"
        }
    }

    @objc func setData(_ call: CAPPluginCall) {
        let json: String
        do {
            json = try safeWidgetJSON(call.getString("json"))
        } catch {
            call.reject("Invalid widget data")
            return
        }

        // Method 1: Write to shared file (primary — most reliable)
        if let fileURL = sharedFileURL() {
            do {
                try json.write(to: fileURL, atomically: true, encoding: .utf8)
                print("[OBWidgetBridge] Wrote \(json.count) bytes to \(fileURL.path)")
            } catch {
                print("[OBWidgetBridge] File write error: \(error)")
            }
        } else {
            print("[OBWidgetBridge] ERROR: Could not get App Group container URL")
        }

        // Method 2: Also write to UserDefaults (backup)
        if let defaults = UserDefaults(suiteName: appGroupId) {
            defaults.set(json, forKey: "widgetData")
            defaults.synchronize()
        }

        // Tell WidgetKit to refresh
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }

        call.resolve(["saved": true])
    }

    @objc func setTheme(_ call: CAPPluginCall) {
        let theme = safeWidgetTheme(call.getString("theme"))

        if let defaults = UserDefaults(suiteName: appGroupId) {
            defaults.set(theme, forKey: "ob_widget_theme")
            defaults.synchronize()
            print("[OBWidgetBridge] Widget theme set to: \(theme)")
        }

        // Reload widgets so they pick up the new theme
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }

        call.resolve(["theme": theme])
    }

    @objc func reloadAll(_ call: CAPPluginCall) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        call.resolve()
    }
}
