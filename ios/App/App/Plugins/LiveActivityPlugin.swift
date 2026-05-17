import Foundation
import Capacitor
import ActivityKit

/// Manages Live Activities for active feed/sleep timers on the Lock Screen and Dynamic Island.
@objc(OBLiveActivity)
public class LiveActivityPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "OBLiveActivity"
    public let jsName = "OBLiveActivity"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCurrentTimer", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startPrediction", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updatePrediction", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopPrediction", returnType: CAPPluginReturnPromise),
    ]

    private func safeText(_ value: String?, fallback: String, maxLength: Int) -> String {
        let raw = value ?? fallback
        let cleaned = raw
            .replacingOccurrences(of: #"[<>\r\n]+"#, with: " ", options: .regularExpression)
            .replacingOccurrences(of: #"\s+"#, with: " ", options: .regularExpression)
            .trimmingCharacters(in: .whitespacesAndNewlines)
        let text = cleaned.isEmpty ? fallback : cleaned
        return String(text.prefix(maxLength))
    }

    private func safeTimerType(_ value: String?) -> String {
        switch value {
        case "feed", "nap", "sleep", "bed":
            return value ?? "feed"
        default:
            return "feed"
        }
    }

    private func safeSide(_ value: String?) -> String? {
        switch value {
        case "left", "right":
            return value
        default:
            return nil
        }
    }

    private func safeStartDate(_ startMs: Double?) -> Date {
        let now = Date()
        guard let startMs = startMs, startMs.isFinite else { return now }
        var startDate = Date(timeIntervalSince1970: startMs / 1000)
        if startDate > now.addingTimeInterval(60) {
            startDate = startDate.addingTimeInterval(-86400)
        }
        if startDate > now.addingTimeInterval(60) || startDate < now.addingTimeInterval(-16 * 3600) {
            return now
        }
        return startDate
    }

    private func safeElapsed(_ value: Int?) -> Int {
        min(max(value ?? 0, 0), 16 * 3600)
    }

    private func safePredictionDate(_ targetMs: Double?) -> Date? {
        let now = Date()
        guard let targetMs = targetMs, targetMs.isFinite, targetMs > 0 else { return nil }
        let target = Date(timeIntervalSince1970: targetMs / 1000)
        guard target > now.addingTimeInterval(-300), target < now.addingTimeInterval(36 * 3600) else { return nil }
        return target
    }

    @objc func isAvailable(_ call: CAPPluginCall) {
        if #available(iOS 16.1, *) {
            call.resolve(["available": ActivityAuthorizationInfo().areActivitiesEnabled])
        } else {
            call.resolve(["available": false])
        }
    }

    @objc func start(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.reject("Live Activities require iOS 16.1+")
            return
        }

        let type = safeTimerType(call.getString("type"))
        let babyName = safeText(call.getString("babyName"), fallback: "Baby", maxLength: 40)
        let side = safeSide(call.getString("side"))
        let nextNap = safeText(call.getString("nextNap"), fallback: "", maxLength: 60)
        let startDate = safeStartDate(call.getDouble("startTime"))
        let elapsed = Date().timeIntervalSince(startDate)
        print("[OBLiveActivity] start() — startDate=\(startDate), elapsed=\(Int(elapsed))s (\(String(format: "%.0f", elapsed/3600))h), now=\(Date())")

        let state = OBubbaTimerAttributes.ContentState(
            startTime: startDate,
            elapsed: 0,
            side: side,
            nextNap: nextNap.isEmpty ? nil : nextNap
        )

        Task {
            // If the same kind of LA is already active, update it. Activity
            // attributes are immutable, so sleep -> feed or feed -> sleep must
            // end and recreate; otherwise the Dynamic Island can look stuck on
            // the previous mode.
            let existing = Activity<OBubbaTimerAttributes>.activities
            if let current = existing.first {
                if current.attributes.timerType == type && current.attributes.babyName == babyName {
                    await current.update(.init(state: state, staleDate: nil))
                    print("[OBLiveActivity] Updated existing LA — startDate=\(startDate), elapsed=\(elapsed)s")
                    call.resolve(["activityId": current.id])
                    return
                }
                for activity in existing {
                    await activity.end(nil, dismissalPolicy: .immediate)
                }
            }

            // No existing activity — create a new one
            let attributes = OBubbaTimerAttributes(
                timerType: type,
                babyName: babyName
            )

            do {
                let activity = try Activity.request(
                    attributes: attributes,
                    content: .init(state: state, staleDate: nil),
                    pushType: nil
                )
                print("[OBLiveActivity] Created new LA: \(activity.id)")
                call.resolve(["activityId": activity.id])
            } catch {
                call.reject("Failed to start Live Activity: \(error.localizedDescription)")
            }
        }
    }

    @objc func update(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.reject("Live Activities require iOS 16.1+")
            return
        }

        let elapsed = safeElapsed(call.getInt("elapsed"))
        let side = safeSide(call.getString("side"))
        let nextNap = safeText(call.getString("nextNap"), fallback: "", maxLength: 60)

        let state = OBubbaTimerAttributes.ContentState(
            startTime: Date(timeIntervalSinceNow: -Double(elapsed)),
            elapsed: elapsed,
            side: side,
            nextNap: nextNap.isEmpty ? nil : nextNap
        )

        Task {
            for activity in Activity<OBubbaTimerAttributes>.activities {
                await activity.update(.init(state: state, staleDate: nil))
            }
            call.resolve()
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.resolve()
            return
        }

        Task {
            for activity in Activity<OBubbaTimerAttributes>.activities {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
            call.resolve()
        }
    }

    @objc func getCurrentTimer(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.resolve(["active": false])
            return
        }

        Task {
            guard let activity = Activity<OBubbaTimerAttributes>.activities.first else {
                call.resolve(["active": false])
                return
            }

            let state = activity.content.state
            let startMs = state.startTime.timeIntervalSince1970 * 1000
            let elapsed = min(max(Int(Date().timeIntervalSince(state.startTime)), 0), 16 * 3600)
            call.resolve([
                "active": true,
                "type": activity.attributes.timerType,
                "babyName": activity.attributes.babyName,
                "startTimeMs": startMs,
                "elapsed": elapsed,
                "side": state.side ?? "",
                "nextNap": state.nextNap ?? ""
            ])
        }
    }

    // ── Prediction Countdown Live Activity ──

    @objc func startPrediction(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.reject("Live Activities require iOS 16.1+")
            return
        }

        let babyName = safeText(call.getString("babyName"), fallback: "Baby", maxLength: 40)
        guard let targetDate = safePredictionDate(call.getDouble("targetTime")) else {
            call.reject("Invalid prediction target")
            return
        }
        let label = safeText(call.getString("label"), fallback: "Nap", maxLength: 40)
        let timeFormatted = safeText(call.getString("timeFormatted"), fallback: "", maxLength: 40)

        let attributes = OBubbaPredictionAttributes(babyName: babyName)
        let state = OBubbaPredictionAttributes.ContentState(
            targetTime: targetDate,
            label: label,
            timeFormatted: timeFormatted
        )

        Task {
            // Prediction countdowns and timer activities use different ActivityKit
            // attribute types, so iOS can show both at once. End timer activities
            // here too, otherwise a stale bedtime/night timer can look stuck even
            // after the app has moved back to next-event countdown mode.
            for timer in Activity<OBubbaTimerAttributes>.activities {
                await timer.end(nil, dismissalPolicy: .immediate)
            }

            // End any existing prediction activities
            for existing in Activity<OBubbaPredictionAttributes>.activities {
                await existing.end(nil, dismissalPolicy: .immediate)
            }

            do {
                let activity = try Activity.request(
                    attributes: attributes,
                    content: .init(state: state, staleDate: nil),
                    pushType: nil
                )
                call.resolve(["activityId": activity.id])
            } catch {
                call.reject("Failed to start Prediction LA: \(error.localizedDescription)")
            }
        }
    }

    @objc func updatePrediction(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.reject("Live Activities require iOS 16.1+")
            return
        }

        guard let targetDate = safePredictionDate(call.getDouble("targetTime")) else {
            call.reject("Invalid prediction target")
            return
        }
        let label = safeText(call.getString("label"), fallback: "Nap", maxLength: 40)
        let timeFormatted = safeText(call.getString("timeFormatted"), fallback: "", maxLength: 40)

        let state = OBubbaPredictionAttributes.ContentState(
            targetTime: targetDate,
            label: label,
            timeFormatted: timeFormatted
        )

        Task {
            for activity in Activity<OBubbaPredictionAttributes>.activities {
                await activity.update(.init(state: state, staleDate: nil))
            }
            call.resolve()
        }
    }

    @objc func stopPrediction(_ call: CAPPluginCall) {
        guard #available(iOS 16.1, *) else {
            call.resolve()
            return
        }

        Task {
            for activity in Activity<OBubbaPredictionAttributes>.activities {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
            call.resolve()
        }
    }
}
