import WidgetKit
import SwiftUI
import AppIntents
import ActivityKit

// ══════════════════════════════════════════════════════════════════
// OBubba Widgets — Home Screen, Lock Screen, Live Activity & Interactive
// Premium redesign — clean, airy, elegant
// ══════════════════════════════════════════════════════════════════

// ── Widget AppIntents (must be in widget target) ─────────────────

private let widgetAppGroupId = "group.com.obubba.app"

private func widgetStorePendingEntry(_ dict: [String: Any]) {
    var entry = dict
    let fmt = DateFormatter()
    fmt.dateFormat = "HH:mm"
    fmt.locale = Locale(identifier: "en_US_POSIX")  // Force 24-hour regardless of device setting
    entry["time"] = fmt.string(from: Date())
    guard let data = try? JSONSerialization.data(withJSONObject: entry),
          let json = String(data: data, encoding: .utf8) else { return }

    // Write to BOTH UserDefaults AND file for reliability (cross-process race condition)
    if let defaults = UserDefaults(suiteName: widgetAppGroupId) {
        defaults.set(json, forKey: "pendingSiriEntry")
        defaults.synchronize()
    }

    // Also write to shared file — more reliable across processes
    if let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: widgetAppGroupId) {
        let fileURL = containerURL.appendingPathComponent("pendingWidgetEntry.json")
        try? json.write(to: fileURL, atomically: true, encoding: .utf8)
    }

    // Refresh widget timeline so Siri-logged entries appear on widget immediately
    if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
    }
}

struct OBWidgetLogFeedIntent: AppIntent {
    static var title: LocalizedStringResource = "Log a feed"
    static var description = IntentDescription("Log a bottle feed in OBubba")
    static var openAppWhenRun: Bool = false
    func perform() async throws -> some IntentResult & ReturnsValue<String> {
        widgetStorePendingEntry(["type": "feed", "feedType": "bottle", "source": "siri"])
        return .result(value: "Feed logged ✓")
    }
}

struct OBWidgetLogNappyIntent: AppIntent {
    static var title: LocalizedStringResource = "Log a nappy"
    static var description = IntentDescription("Log a nappy change in OBubba")
    static var openAppWhenRun: Bool = false
    func perform() async throws -> some IntentResult & ReturnsValue<String> {
        widgetStorePendingEntry(["type": "poop", "poopType": "wet", "source": "siri"])
        return .result(value: "Nappy logged ✓")
    }
}

struct OBWidgetToggleTimerIntent: AppIntent {
    static var title: LocalizedStringResource = "Toggle nap timer"
    static var description = IntentDescription("Start or stop the nap timer in OBubba")
    static var openAppWhenRun: Bool = false
    func perform() async throws -> some IntentResult & ReturnsValue<String> {
        let defaults = UserDefaults(suiteName: widgetAppGroupId)
        let hasActiveTimer: Bool
        if let json = defaults?.string(forKey: "widgetData"),
           let data = json.data(using: .utf8),
           let dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let timer = dict["activeTimer"] as? String, !timer.isEmpty {
            hasActiveTimer = true
        } else {
            hasActiveTimer = false
        }
        if hasActiveTimer {
            widgetStorePendingEntry(["type": "nap_stop", "source": "siri"])
            clearActiveTimer()
            return .result(value: "Timer stopped ✓")
        } else {
            // Check if next prediction is bedtime — start bed timer instead of nap
            var isBedtime = false
            if let json = defaults?.string(forKey: "widgetData"),
               let data = json.data(using: .utf8),
               let dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let label = dict["nextPredictionLabel"] as? String {
                isBedtime = label.lowercased().contains("bed")
            }
            if isBedtime {
                widgetStorePendingEntry(["type": "sleep", "source": "widget"])
                return .result(value: "Bedtime started ✓")
            } else {
                widgetStorePendingEntry(["type": "nap_start", "source": "widget"])
                return .result(value: "Nap timer started ✓")
            }
        }
    }
}

struct OBNextPredictionIntent: AppIntent {
    static var title: LocalizedStringResource = "When is the next nap"
    static var description = IntentDescription("Ask OBubba when baby's next nap or feed is")
    static var openAppWhenRun: Bool = false
    func perform() async throws -> some IntentResult & ReturnsValue<String> {
        guard let defaults = UserDefaults(suiteName: widgetAppGroupId),
              let json = defaults.string(forKey: "widgetData"),
              let data = json.data(using: .utf8),
              let dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return .result(value: "I don't have enough data yet. Open OBubba and log a wake to get predictions.")
        }
        let baby = dict["babyName"] as? String ?? "Baby"
        var parts: [String] = []
        if let timer = dict["activeTimer"] as? String, !timer.isEmpty {
            let label = dict["timerLabel"] as? String ?? timer
            parts.append("\(baby) is currently \(label.lowercased()).")
        }
        if let nextFeed = dict["nextFeedEstimate"] as? String, !nextFeed.isEmpty {
            parts.append("Next feed estimated around \(nextFeed).")
        }
        if let nextPred = dict["nextPredictionLabel"] as? String, !nextPred.isEmpty {
            parts.append("Next up: \(nextPred).")
        }
        if parts.isEmpty {
            return .result(value: "No predictions right now. Log a wake and a nap to start getting predictions for \(baby).")
        }
        return .result(value: parts.joined(separator: " "))
    }
}

struct OBStopTimerIntent: AppIntent {
    static var title: LocalizedStringResource = "Stop timer"
    static var description = IntentDescription("Stop the active nap, sleep, or feed timer in OBubba")
    static var openAppWhenRun: Bool = false
    func perform() async throws -> some IntentResult & ReturnsValue<String> {
        let defaults = UserDefaults(suiteName: widgetAppGroupId)
        let activeTimer: String?
        if let json = defaults?.string(forKey: "widgetData"),
           let data = json.data(using: .utf8),
           let dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            activeTimer = dict["activeTimer"] as? String
        } else {
            activeTimer = nil
        }
        if activeTimer == "feed" {
            widgetStorePendingEntry(["type": "breast_stop", "source": "siri"])
            clearActiveTimer()
            return .result(value: "Feed timer stopped ✓")
        }
        widgetStorePendingEntry(["type": "nap_stop", "source": "siri"])
        clearActiveTimer()
        return .result(value: "Timer stopped ✓")
    }
}

/// Clears the active timer from widgetData so the widget immediately stops showing it.
/// Also ends any running Live Activity.
private func clearActiveTimer() {
    guard let defaults = UserDefaults(suiteName: widgetAppGroupId) else { return }
    // Read current widgetData, clear activeTimer + timerStart
    if let json = defaults.string(forKey: "widgetData"),
       let data = json.data(using: .utf8),
       var dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
        dict["activeTimer"] = ""
        dict["timerStart"] = ""
        dict["timerStartTime"] = ""
        dict["timerStartMs"] = ""
        dict["timerLabel"] = ""
        dict["breastSide"] = ""
        if let updated = try? JSONSerialization.data(withJSONObject: dict),
           let updatedJson = String(data: updated, encoding: .utf8) {
            defaults.set(updatedJson, forKey: "widgetData")
            defaults.synchronize()
            // Also update the shared file so the widget reads the cleared timer immediately
            if let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: widgetAppGroupId) {
                let fileURL = containerURL.appendingPathComponent("widgetData.json")
                try? updatedJson.write(to: fileURL, atomically: true, encoding: .utf8)
            }
        }
    }
    // End any Live Activity
    if #available(iOS 16.2, *) {
        Task {
            for activity in Activity<OBubbaTimerAttributes>.activities {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
        }
    }
    // Refresh widget
    if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
    }
}

struct OBWidgetBreastLeftIntent: AppIntent {
    static var title: LocalizedStringResource = "Start left breast"
    static var description = IntentDescription("Start left breast feed timer in OBubba")
    static var openAppWhenRun: Bool = false
    func perform() async throws -> some IntentResult & ReturnsValue<String> {
        widgetStorePendingEntry(["type": "breast_start", "side": "left", "source": "siri"])
        return .result(value: "Left breast timer started ✓")
    }
}

struct OBWidgetBreastRightIntent: AppIntent {
    static var title: LocalizedStringResource = "Start right breast"
    static var description = IntentDescription("Start right breast feed timer in OBubba")
    static var openAppWhenRun: Bool = false
    func perform() async throws -> some IntentResult & ReturnsValue<String> {
        widgetStorePendingEntry(["type": "breast_start", "side": "right", "source": "siri"])
        return .result(value: "Right breast timer started ✓")
    }
}

// ── Siri Shortcuts Provider — registers phrases for voice commands ──
@available(iOS 16.0, *)
struct OBubbaShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: OBWidgetLogFeedIntent(), phrases: [
            "Log a feed in \(.applicationName)",
            "Log feed in \(.applicationName)",
            "\(.applicationName) log feed"
        ], shortTitle: "Log Feed", systemImageName: "drop.fill")

        AppShortcut(intent: OBWidgetLogNappyIntent(), phrases: [
            "Log a nappy in \(.applicationName)",
            "Log nappy in \(.applicationName)",
            "\(.applicationName) log nappy"
        ], shortTitle: "Log Nappy", systemImageName: "pin.fill")

        AppShortcut(intent: OBStopTimerIntent(), phrases: [
            "Stop timer in \(.applicationName)",
            "Stop nap in \(.applicationName)",
            "\(.applicationName) stop timer"
        ], shortTitle: "Stop Timer", systemImageName: "stop.fill")

        AppShortcut(intent: OBWidgetToggleTimerIntent(), phrases: [
            "Start nap in \(.applicationName)",
            "Toggle timer in \(.applicationName)",
            "\(.applicationName) start nap"
        ], shortTitle: "Toggle Timer", systemImageName: "timer")
    }
}

// ══════════════════════════════════════════════════════════════════
// MARK: - Design System
// ══════════════════════════════════════════════════════════════════

// Adaptive colours — light/dark mode
private let brandRose    = Color(hex: "#C07088")
private let brandDeep    = Color(light: "#5B4F5F", dark: "#E8DDE0")
private let brandWarm    = Color(light: "#F0DDD6", dark: "#3A2E35")
private let brandBg      = Color(light: "#FBF5F3", dark: "#1C1820")
private let brandCream   = Color(light: "#FAF0EB", dark: "#252028")
private let brandMint    = Color(hex: "#6FA898")
private let brandPurple  = Color(hex: "#8B7EC8")
private let brandSky     = Color(hex: "#7AABC4")
private let brandGold    = Color(hex: "#D4A855")
private let appNightFaceTop = Color(hex: "#122741")
private let appNightFaceBottom = Color(hex: "#081527")
private let appNightFaceSoftTop = Color(hex: "#162D46")
private let appNightFaceSoftBottom = Color(hex: "#0A192C")
private let appNightText = Color(hex: "#F5F0F5")
private let appNightWarmText = Color(hex: "#FFF4EA")
private let appNightRimCream = Color(hex: "#FFD2A6")
private let appNightRimOrange = Color(hex: "#FF8B56")
private let appNightRimMilk = Color(hex: "#FFECD6")
private let appNightRimHot = Color(hex: "#FF6C3E")
private let lockNightA    = Color(hex: "#151B2A")
private let lockNightB    = Color(hex: "#211827")
private let lockCreamText = Color(hex: "#FFF0D6")
private let lockRoseGlow  = Color(hex: "#E5A0B2")

private func obLockLabel(_ raw: String?, fallback: String = "Next") -> String {
    let cleaned = (raw ?? "")
        .replacingOccurrences(of: "·", with: " ")
        .replacingOccurrences(of: "•", with: " ")
        .trimmingCharacters(in: .whitespacesAndNewlines)
    guard !cleaned.isEmpty else { return fallback }
    let lower = cleaned.lowercased()
    if lower.hasPrefix("bed") || lower.contains("bedtime") { return "Bedtime" }
    if lower.hasPrefix("nap") {
        let parts = cleaned.components(separatedBy: .whitespaces).filter { !$0.isEmpty }
        if parts.count > 1, Int(parts[1]) != nil { return "Nap \(parts[1])" }
        return "Nap"
    }
    if lower.contains("feed") { return "Feed" }
    if lower.contains("sleep") { return "Sleep" }
    return cleaned
}

private func obLockIcon(label: String, timerType: String? = nil) -> String {
    if timerType == "feed" || label.lowercased().contains("feed") { return "drop.fill" }
    if label.lowercased().contains("bed") { return "moon.stars.fill" }
    return "moon.zzz.fill"
}

private func normalizedBreastSide(_ raw: String?) -> String? {
    switch (raw ?? "").trimmingCharacters(in: .whitespacesAndNewlines).lowercased() {
    case "l", "left":
        return "left"
    case "r", "right":
        return "right"
    default:
        return nil
    }
}

private func breastSideLetter(_ raw: String?) -> String? {
    switch normalizedBreastSide(raw) {
    case "left":
        return "L"
    case "right":
        return "R"
    default:
        return nil
    }
}

private func breastSideName(_ raw: String?) -> String? {
    switch normalizedBreastSide(raw) {
    case "left":
        return "Left"
    case "right":
        return "Right"
    default:
        return nil
    }
}

private func widgetAccent(label: String?, timerType: String? = nil) -> Color {
    let lower = (label ?? "").lowercased()
    if timerType == "feed" || lower.contains("feed") || lower.contains("nursing") { return brandRose }
    if lower.contains("nap") || lower.contains("bed") || lower.contains("sleep") { return brandPurple }
    return brandMint
}

private func widgetIcon(label: String?, timerType: String? = nil) -> String {
    let lower = (label ?? "").lowercased()
    if timerType == "feed" || lower.contains("feed") || lower.contains("nursing") { return "drop.fill" }
    if lower.contains("bed") { return "moon.stars.fill" }
    if lower.contains("wake") { return "sun.max.fill" }
    return "moon.zzz.fill"
}

private func widgetTimerStatusTitle(label: String?, timerType: String?, breastSide: String?) -> String {
    let lower = ((label ?? "") + " " + (timerType ?? "")).lowercased()
    if timerType == "feed" || lower.contains("feed") || lower.contains("nursing") {
        if let letter = breastSideLetter(breastSide) { return "Nursing \(letter)" }
        return "Feeding"
    }
    if lower.contains("bed") || lower.contains("sleep") { return "Sleeping" }
    if lower.contains("nap") { return "Napping" }
    return obLockLabel(label, fallback: "Timer")
}

private func widgetPredictionTimeHint(_ prediction: String?) -> String? {
    guard let prediction, !prediction.isEmpty else { return nil }
    let timeOnly = prediction.replacingOccurrences(of: "^.*~\\s*", with: "", options: .regularExpression)
        .trimmingCharacters(in: .whitespaces)
    guard !timeOnly.isEmpty, timeOnly != prediction else { return nil }
    return timeOnly
}

private func widgetFriendlyClock(_ clock: String?) -> String? {
    guard let clock, !clock.isEmpty else { return nil }
    let parts = clock.split(separator: ":").compactMap { Int($0) }
    guard parts.count >= 2 else { return clock }
    let h = parts[0], m = parts[1]
    guard h >= 0, h <= 23, m >= 0, m <= 59 else { return clock }
    let suffix = h >= 12 ? "pm" : "am"
    let h12 = h == 0 ? 12 : h > 12 ? h - 12 : h
    return "\(h12):\(String(format: "%02d", m))\(suffix)"
}

// SwiftUI helper: conditionally apply a modifier
extension View {
    @ViewBuilder func ifLet<T, Content: View>(_ value: T?, transform: (Self, T) -> Content) -> some View {
        if let value = value {
            transform(self, value)
        } else {
            self
        }
    }
}

// Widget theme backgrounds — user can pick in Settings
private func widgetThemeBackground() -> some View {
    WidgetGlassBackground()
}

private struct WidgetGlassBackground: View {
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        let theme = UserDefaults(suiteName: "group.com.obubba.app")?.string(forKey: "ob_widget_theme") ?? "auto"
        let isDark = theme == "dark" || (theme == "auto" && colorScheme == .dark)

        if isDark {
            ZStack {
                RoundedRectangle(cornerRadius: 26, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                appNightFaceTop.opacity(0.996),
                                appNightFaceBottom.opacity(0.992)
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                RadialGradient(
                    colors: [appNightRimOrange.opacity(0.17), Color.clear],
                    center: .bottomLeading,
                    startRadius: 8,
                    endRadius: 230
                )
                RadialGradient(
                    colors: [brandPurple.opacity(0.14), Color.clear],
                    center: .topTrailing,
                    startRadius: 12,
                    endRadius: 220
                )
                LinearGradient(
                    colors: [appNightWarmText.opacity(0.10), Color.clear, appNightRimHot.opacity(0.06)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                RoundedRectangle(cornerRadius: 26, style: .continuous)
                    .stroke(
                        LinearGradient(
                            colors: [
                                appNightRimCream.opacity(0.76),
                                appNightRimOrange.opacity(0.50),
                                appNightRimMilk.opacity(0.18),
                                appNightRimHot.opacity(0.28)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1.35
                    )
                RoundedRectangle(cornerRadius: 25, style: .continuous)
                    .stroke(appNightWarmText.opacity(0.12), lineWidth: 0.7)
                    .padding(1)
            }
        } else {
            let sheenStart = Color.white.opacity(0.72)
            let sheenMid = Color.white.opacity(0.32)
            let cornerGlow = Color(hex: "#DDF2FF").opacity(0.34)
            let violetGlow = brandPurple.opacity(0.09)
            let blueGlow = Color(hex: "#BEE5FF").opacity(0.30)
            let lowerGlow = Color(hex: "#DCEFFF").opacity(0.18)

            ZStack {
                RoundedRectangle(cornerRadius: 26, style: .continuous)
                    .fill(.ultraThinMaterial)
                widgetGlassBaseGradient(theme: theme, isDark: false)
                RadialGradient(
                    colors: [cornerGlow, Color.clear],
                    center: .topLeading,
                    startRadius: 4,
                    endRadius: 230
                )
                RadialGradient(
                    colors: [blueGlow, Color.clear],
                    center: .topTrailing,
                    startRadius: 10,
                    endRadius: 220
                )
                RadialGradient(
                    colors: [violetGlow, Color.clear],
                    center: .bottomTrailing,
                    startRadius: 8,
                    endRadius: 210
                )
                LinearGradient(
                    colors: [sheenStart, sheenMid, Color.white.opacity(0.07), Color.clear],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                LinearGradient(
                    colors: [Color.clear, lowerGlow],
                    startPoint: .top,
                    endPoint: .bottom
                )
                RoundedRectangle(cornerRadius: 26, style: .continuous)
                    .stroke(
                        LinearGradient(
                            colors: [
                                Color.white.opacity(0.82),
                                Color(hex: "#B9DCFF").opacity(0.34),
                                brandPurple.opacity(0.10)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 0.9
                    )
                    .padding(0.5)
                RoundedRectangle(cornerRadius: 25, style: .continuous)
                    .stroke(Color.black.opacity(0.018), lineWidth: 0.6)
                    .padding(1.2)
            }
        }
    }
}

private func widgetGlassBaseGradient(theme: String, isDark: Bool) -> LinearGradient {
    if isDark {
        return LinearGradient(
            colors: [
                appNightFaceTop.opacity(0.996),
                appNightFaceBottom.opacity(0.992)
            ],
            startPoint: .top,
            endPoint: .bottom
        )
    }

    switch theme {
    case "rose":
        return LinearGradient(
            colors: [Color.white.opacity(0.60), Color(hex: "#F6E8E4").opacity(0.38), Color(hex: "#F2DCE5").opacity(0.28)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    case "lavender":
        return LinearGradient(
            colors: [Color.white.opacity(0.60), Color(hex: "#EDEAF7").opacity(0.38), Color(hex: "#E6F3F7").opacity(0.26)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    case "mint":
        return LinearGradient(
            colors: [Color.white.opacity(0.60), Color(hex: "#EAF6F0").opacity(0.36), Color(hex: "#F2ECE8").opacity(0.26)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    case "sky":
        return LinearGradient(
            colors: [Color.white.opacity(0.60), Color(hex: "#EAF1F7").opacity(0.36), Color(hex: "#F2F5F7").opacity(0.26)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    default:
        return LinearGradient(
            colors: [Color.white.opacity(0.58), Color(hex: "#F8FCFF").opacity(0.42), Color(hex: "#EAF6FF").opacity(0.30), Color(hex: "#F0DDD6").opacity(0.18)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

private func widgetForcedScheme() -> ColorScheme? {
    let theme = UserDefaults(suiteName: "group.com.obubba.app")?.string(forKey: "ob_widget_theme") ?? "auto"
    switch theme {
    case "dark":
        return .dark
    case "auto":
        return nil
    default:
        return .light
    }
}

private func widgetThemePrefersDark() -> Bool {
    let theme = UserDefaults(suiteName: "group.com.obubba.app")?.string(forKey: "ob_widget_theme") ?? "auto"
    return theme == "dark"
}

// ══════════════════════════════════════════════════════════════════
// MARK: - Data Model
// ══════════════════════════════════════════════════════════════════

struct WidgetData: Codable {
    let babyName: String
    let feedCount: Int
    let sleepCount: Int
    let nappyCount: Int
    let wetNappyCount: Int?
    let lastFeedTime: String?
    let lastFeedType: String?
    let lastSleepTime: String?
    let nextFeedEstimate: String?
    let theme: String
    let updatedAt: Double
    let lastFeedAmount: Double?
    let lastNappyTime: String?
    let lastNappyType: String?
    let nextPrediction: String?
    let nextPredictionMs: Double?
    let nextPredictionLabel: String?
    let nextPredictionUnlocked: Bool?
    let activeTimer: String?
    let timerStartTime: String?
    let timerStartMs: Double?
    let timerLabel: String?
    let breastSide: String?
    let showNursing: Bool?
    let lastBreastSide: String?

    enum CodingKeys: String, CodingKey {
        case babyName, feedCount, sleepCount, nappyCount, wetNappyCount
        case lastFeedTime, lastFeedType, lastSleepTime, nextFeedEstimate
        case theme, updatedAt, lastFeedAmount
        case lastNappyTime, lastNappyType, nextPrediction, nextPredictionMs, nextPredictionLabel, nextPredictionUnlocked
        case activeTimer, timerStartTime, timerStartMs, timerLabel
        case breastSide, showNursing, lastBreastSide
    }

    private static func flexInt(_ c: KeyedDecodingContainer<CodingKeys>, _ key: CodingKeys) -> Int {
        if let v = try? c.decodeIfPresent(Int.self, forKey: key) { return v }
        if let v = try? c.decodeIfPresent(Double.self, forKey: key) { return Int(v) }
        if let s = try? c.decodeIfPresent(String.self, forKey: key), let v = Int(s) { return v }
        return 0
    }
    private static func flexDouble(_ c: KeyedDecodingContainer<CodingKeys>, _ key: CodingKeys) -> Double? {
        if let v = try? c.decodeIfPresent(Double.self, forKey: key) { return v }
        if let v = try? c.decodeIfPresent(Int.self, forKey: key) { return Double(v) }
        if let s = try? c.decodeIfPresent(String.self, forKey: key), let v = Double(s) { return v }
        return nil
    }
    private static func flexString(_ c: KeyedDecodingContainer<CodingKeys>, _ key: CodingKeys) -> String? {
        if let v = try? c.decodeIfPresent(String.self, forKey: key) { return v }
        if let v = try? c.decodeIfPresent(Double.self, forKey: key) { return String(v) }
        if let v = try? c.decodeIfPresent(Int.self, forKey: key) { return String(v) }
        return nil
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        babyName = (try? c.decodeIfPresent(String.self, forKey: .babyName)) ?? "Baby"
        feedCount = Self.flexInt(c, .feedCount)
        sleepCount = Self.flexInt(c, .sleepCount)
        nappyCount = Self.flexInt(c, .nappyCount)
        wetNappyCount = Self.flexInt(c, .wetNappyCount)
        lastFeedTime = Self.flexString(c, .lastFeedTime)
        lastFeedType = Self.flexString(c, .lastFeedType)
        lastSleepTime = Self.flexString(c, .lastSleepTime)
        nextFeedEstimate = Self.flexString(c, .nextFeedEstimate)
        theme = (try? c.decodeIfPresent(String.self, forKey: .theme)) ?? "light"
        updatedAt = Self.flexDouble(c, .updatedAt) ?? 0
        lastFeedAmount = Self.flexDouble(c, .lastFeedAmount)
        lastNappyTime = Self.flexString(c, .lastNappyTime)
        lastNappyType = Self.flexString(c, .lastNappyType)
        nextPrediction = Self.flexString(c, .nextPrediction)
        nextPredictionMs = Self.flexDouble(c, .nextPredictionMs)
        nextPredictionLabel = Self.flexString(c, .nextPredictionLabel)
        nextPredictionUnlocked = (try? c.decodeIfPresent(Bool.self, forKey: .nextPredictionUnlocked)) ?? false
        activeTimer = Self.flexString(c, .activeTimer)
        timerStartTime = Self.flexString(c, .timerStartTime)
        timerStartMs = Self.flexDouble(c, .timerStartMs)
        timerLabel = Self.flexString(c, .timerLabel)
        breastSide = Self.flexString(c, .breastSide)
        showNursing = (try? c.decodeIfPresent(Bool.self, forKey: .showNursing)) ?? false
        lastBreastSide = Self.flexString(c, .lastBreastSide)
    }

    init(babyName: String, feedCount: Int, sleepCount: Int, nappyCount: Int,
         lastFeedTime: String?, lastFeedType: String?, lastSleepTime: String?,
         nextFeedEstimate: String?, theme: String, updatedAt: Double) {
        self.babyName = babyName; self.feedCount = feedCount; self.sleepCount = sleepCount
        self.nappyCount = nappyCount; self.wetNappyCount = nil; self.lastFeedTime = lastFeedTime
        self.lastFeedType = lastFeedType; self.lastSleepTime = lastSleepTime
        self.nextFeedEstimate = nextFeedEstimate; self.theme = theme; self.updatedAt = updatedAt
        self.lastFeedAmount = nil; self.lastNappyTime = nil; self.lastNappyType = nil
        self.nextPrediction = nil; self.nextPredictionMs = nil; self.nextPredictionLabel = nil; self.nextPredictionUnlocked = false
        self.activeTimer = nil; self.timerStartTime = nil
        self.timerStartMs = nil; self.timerLabel = nil; self.breastSide = nil
        self.showNursing = nil; self.lastBreastSide = nil
    }

    var predictionTargetDate: Date? {
        guard nextPredictionUnlocked == true else { return nil }
        guard let ms = nextPredictionMs, ms > 1_000_000_000_000 else { return nil }
        let date = Date(timeIntervalSince1970: ms / 1000.0)
        // Only return if in the future
        return date > Date() ? date : nil
    }

    var timerStartDate: Date? {
        if let ms = timerStartMs, ms > 1_000_000_000_000 {
            return Date(timeIntervalSince1970: ms / 1000.0)
        }
        if let ms = timerStartMs, ms > 0 {
            let cal = Calendar.current; let now = Date()
            var comp = cal.dateComponents([.year, .month, .day], from: now)
            comp.hour = Int(ms) / 60; comp.minute = Int(ms) % 60
            if let d = cal.date(from: comp) { return d > now ? cal.date(byAdding: .day, value: -1, to: d) : d }
        }
        if let t = timerStartTime {
            let parts = t.split(separator: ":").compactMap { Int($0) }
            if parts.count >= 2 {
                let cal = Calendar.current; let now = Date()
                var comp = cal.dateComponents([.year, .month, .day], from: now)
                comp.hour = parts[0]; comp.minute = parts[1]
                if let d = cal.date(from: comp) { return d > now ? cal.date(byAdding: .day, value: -1, to: d) : d }
            }
        }
        return nil
    }
}

// ══════════════════════════════════════════════════════════════════
// MARK: - Timeline Provider
// ══════════════════════════════════════════════════════════════════

struct OBubbaTimelineProvider: TimelineProvider {
    private let appGroupId = "group.com.obubba.app"

    func placeholder(in context: Context) -> OBubbaEntry {
        OBubbaEntry(date: Date(), data: WidgetData(
            babyName: "Oliver", feedCount: 4, sleepCount: 2, nappyCount: 3,
            lastFeedTime: "10:30", lastFeedType: "bottle",
            lastSleepTime: "09:15", nextFeedEstimate: "13:30",
            theme: "light", updatedAt: Date().timeIntervalSince1970 * 1000
        ))
    }

    func getSnapshot(in context: Context, completion: @escaping (OBubbaEntry) -> Void) {
        completion(loadEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<OBubbaEntry>) -> Void) {
        let entry = loadEntry()
        let hasActiveTimer = entry.data.activeTimer != nil && !entry.data.activeTimer!.isEmpty
        let hasPredictionCountdown = entry.data.predictionTargetDate != nil
        let interval = (hasActiveTimer || hasPredictionCountdown) ? 1 : 15
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: interval, to: Date()) ?? Date().addingTimeInterval(TimeInterval(interval * 60))
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    private func sharedFileURL() -> URL? {
        FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupId)?
            .appendingPathComponent("widgetData.json")
    }

    private func loadEntry() -> OBubbaEntry {
        let fallback = OBubbaEntry(date: Date(), data: WidgetData(
            babyName: "Baby", feedCount: 0, sleepCount: 0, nappyCount: 0,
            lastFeedTime: nil, lastFeedType: nil, lastSleepTime: nil, nextFeedEstimate: nil,
            theme: "light", updatedAt: Date().timeIntervalSince1970 * 1000
        ))
        if let fileURL = sharedFileURL(), let jsonData = try? Data(contentsOf: fileURL) {
            if let data = try? JSONDecoder().decode(WidgetData.self, from: jsonData) {
                return OBubbaEntry(date: Date(), data: data)
            }
        }
        if let defaults = UserDefaults(suiteName: appGroupId),
           let json = defaults.string(forKey: "widgetData"),
           let jsonData = json.data(using: .utf8),
           let data = try? JSONDecoder().decode(WidgetData.self, from: jsonData) {
            return OBubbaEntry(date: Date(), data: data)
        }
        return fallback
    }
}

struct OBubbaEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
}

// ══════════════════════════════════════════════════════════════════
// MARK: - Reusable Components
// ══════════════════════════════════════════════════════════════════

// ── Stat Ring: circular icon badge with count ────────────────────
struct StatRing: View {
    let icon: String
    let count: Int
    let color: Color
    let size: CGFloat

    init(icon: String, count: Int, color: Color, size: CGFloat = 36) {
        self.icon = icon; self.count = count; self.color = color; self.size = size
    }

    var body: some View {
        VStack(spacing: 3) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.12))
                    .frame(width: size, height: size)
                Image(systemName: icon)
                    .font(.system(size: size * 0.33, weight: .semibold))
                    .foregroundColor(color)
            }
            Text("\(count)")
                .font(.system(size: 15, weight: .bold, design: .rounded))
                .foregroundColor(brandDeep)
        }
    }
}

// ── Action Button for medium widget ──────────────────────────────
struct ActionBtn: View {
    @Environment(\.colorScheme) private var colorScheme

    let icon: String
    let label: String
    let color: Color
    let filled: Bool
    let emoji: String?

    init(icon: String, label: String, color: Color, filled: Bool = false, emoji: String? = nil) {
        self.icon = icon; self.label = label; self.color = color; self.filled = filled; self.emoji = emoji
    }

    var body: some View {
        let isDark = colorScheme == .dark || widgetThemePrefersDark()
        let dayBlueGlass = Color(hex: "#DFF3FF")

        HStack(spacing: 6) {
            if let emoji = emoji {
                Text(emoji).font(.system(size: 13))
            } else {
                Image(systemName: icon)
                    .font(.system(size: 13, weight: .semibold))
            }
            Text(label)
                .font(.system(size: 10, weight: .bold, design: .rounded))
                .lineLimit(1)
                .minimumScaleFactor(0.78)
        }
        .foregroundColor(isDark ? (filled ? appNightWarmText : color) : (filled ? Color.white : color))
        .frame(maxWidth: .infinity)
        .frame(height: 40)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: isDark
                            ? [
                                appNightFaceSoftTop.opacity(0.988),
                                appNightFaceSoftBottom.opacity(0.982),
                                color.opacity(filled ? 0.24 : 0.13)
                            ]
                            : filled
                                ? [Color.white.opacity(0.18), color.opacity(0.76), color.opacity(0.56)]
                                : [Color.white.opacity(0.62), dayBlueGlass.opacity(0.38), color.opacity(0.11)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [(isDark ? appNightWarmText.opacity(0.12) : Color.white.opacity(0.34)), Color.clear],
                        startPoint: .topLeading,
                        endPoint: .center
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(
                    LinearGradient(
                        colors: [
                            (isDark ? appNightRimCream.opacity(0.42) : Color(hex: "#FFF0D6").opacity(filled ? 0.62 : 0.78)),
                            (isDark ? appNightRimOrange.opacity(filled ? 0.34 : 0.24) : color.opacity(0.18)),
                            (isDark ? appNightRimMilk.opacity(0.16) : Color.white.opacity(0.38)),
                            (isDark ? appNightRimHot.opacity(0.18) : color.opacity(0.10))
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 0.85
                )
        )
        .shadow(color: Color.black.opacity(isDark ? 0.28 : 0.065), radius: isDark ? 9 : 7, x: 0, y: isDark ? 5 : 4)
        .shadow(color: (isDark ? appNightRimHot : Color(hex: "#8CCBFF")).opacity(isDark ? 0.14 : 0.15), radius: isDark ? 12 : 11, x: 0, y: isDark ? 2 : 3)
        .shadow(color: color.opacity(isDark ? 0.10 : 0.08), radius: 9, x: 0, y: 3)
    }
}

struct LockActivityBadge: View {
    let icon: String
    let title: String
    let accent: Color

    var body: some View {
        VStack(spacing: 3) {
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [accent.opacity(0.30), lockNightB.opacity(0.92)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 38, height: 38)
                    .overlay(Circle().stroke(lockCreamText.opacity(0.18), lineWidth: 0.8))
                    .shadow(color: accent.opacity(0.28), radius: 8, x: 0, y: 3)
                Image(systemName: icon)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(lockCreamText)
            }
            Text(title)
                .font(.system(size: 9, weight: .heavy, design: .rounded))
                .foregroundColor(lockCreamText.opacity(0.86))
                .lineLimit(1)
                .minimumScaleFactor(0.72)
        }
    }
}

struct LockActivityFace: View {
    let accent: Color

    var body: some View {
        RoundedRectangle(cornerRadius: 24, style: .continuous)
            .fill(
                LinearGradient(
                    colors: [lockNightA.opacity(0.98), lockNightB.opacity(0.96), Color(hex: "#120F18").opacity(0.98)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .stroke(
                        LinearGradient(
                            colors: [lockCreamText.opacity(0.18), accent.opacity(0.28), Color.white.opacity(0.06)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [Color.white.opacity(0.08), Color.clear, accent.opacity(0.08)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            )
    }
}

struct LockActivityAction: View {
    let icon: String
    let accent: Color

    var body: some View {
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [accent.opacity(0.30), accent.opacity(0.13)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 38, height: 38)
                .overlay(Circle().stroke(lockCreamText.opacity(0.14), lineWidth: 0.8))
            Image(systemName: icon)
                .font(.system(size: 12, weight: .heavy))
                .foregroundColor(lockCreamText)
        }
    }
}

// ── Breast side button ───────────────────────────────────────────
struct BreastBtn: View {
    @Environment(\.colorScheme) private var colorScheme

    let letter: String
    let isNext: Bool

    var body: some View {
        let isDark = colorScheme == .dark || widgetThemePrefersDark()

        HStack(spacing: 5) {
            Text(letter)
                .font(.system(size: 16, weight: .black, design: .rounded))
            if isNext {
                Text("next")
                    .font(.system(size: 8, weight: .bold, design: .rounded))
                    .textCase(.uppercase)
            }
        }
        .foregroundColor(isNext ? Color.white : brandRose)
        .frame(maxWidth: .infinity)
        .frame(height: 40)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: isNext
                            ? (isDark
                                ? [appNightFaceSoftTop.opacity(0.988), appNightFaceSoftBottom.opacity(0.982), brandRose.opacity(0.24)]
                                : [brandRose.opacity(0.90), brandRose.opacity(0.68)])
                            : isDark
                                ? [appNightFaceSoftTop.opacity(0.988), appNightFaceSoftBottom.opacity(0.982), brandRose.opacity(0.13)]
                                : [Color.white.opacity(0.68), brandRose.opacity(0.12), Color.white.opacity(0.38)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(
                    LinearGradient(
                        colors: [
                            (isDark ? appNightRimCream.opacity(isNext ? 0.44 : 0.32) : Color.white.opacity(isNext ? 0.32 : 0.62)),
                            (isDark ? appNightRimOrange.opacity(isNext ? 0.32 : 0.22) : brandRose.opacity(0.20)),
                            (isDark ? appNightRimMilk.opacity(0.14) : Color.white.opacity(0.28)),
                            (isDark ? appNightRimHot.opacity(0.16) : brandRose.opacity(0.08))
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 0.85
                )
        )
        .shadow(color: Color.black.opacity(isDark ? 0.28 : 0.06), radius: isDark ? 9 : 6, x: 0, y: isDark ? 5 : 3)
        .shadow(color: appNightRimHot.opacity(isDark ? 0.12 : 0.0), radius: 10, x: 0, y: 3)
        .shadow(color: brandRose.opacity(isDark ? 0.10 : 0.07), radius: 8, x: 0, y: 3)
    }
}

// Old small widget removed — new clean version below

struct SmallMetric: View {
    @Environment(\.colorScheme) private var colorScheme

    let value: String
    let label: String
    let color: Color

    var body: some View {
        let isDark = colorScheme == .dark || widgetThemePrefersDark()

        VStack(spacing: 1) {
            Text(value)
                .font(.system(size: 17, weight: .heavy, design: .rounded))
                .foregroundColor(color)
                .lineLimit(1)
                .minimumScaleFactor(0.66)
            Text(label)
                .font(.system(size: 7.8, weight: .heavy, design: .rounded))
                .foregroundColor(brandDeep.opacity(isDark ? 0.66 : 0.44))
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: isDark
                            ? [appNightFaceSoftTop.opacity(0.988), appNightFaceSoftBottom.opacity(0.982), color.opacity(0.13)]
                            : [Color.white.opacity(0.46), Color.white.opacity(0.36)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(isDark ? appNightRimCream.opacity(0.22) : Color.white.opacity(0.42), lineWidth: 0.7)
        )
    }
}

struct MediumStatusPanel: View {
    @Environment(\.colorScheme) private var colorScheme

    let accent: Color
    let icon: String
    let title: String
    let detail: String?
    let date: Date?
    let fontSize: CGFloat
    let primaryColor: Color

    var body: some View {
        let isDark = colorScheme == .dark || widgetThemePrefersDark()
        let glassBlue = Color(hex: "#DFF3FF")

        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 7) {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: isDark
                                    ? [accent.opacity(0.26), Color.white.opacity(0.10)]
                                    : [accent.opacity(0.18), Color.white.opacity(0.74)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 24, height: 24)
                        .overlay(Circle().stroke((isDark ? appNightRimCream.opacity(0.30) : Color.white.opacity(0.72)), lineWidth: 0.8))
                    Image(systemName: icon)
                        .font(.system(size: 10, weight: .heavy))
                        .foregroundColor(accent)
                }

                VStack(alignment: .leading, spacing: 1) {
                    Text(title)
                        .font(.system(size: 10, weight: .heavy, design: .rounded))
                        .foregroundColor(isDark ? appNightWarmText : accent)
                        .lineLimit(1)
                        .minimumScaleFactor(0.70)
                    if let detail, !detail.isEmpty {
                        Text(detail)
                            .font(.system(size: 8.2, weight: .semibold, design: .rounded))
                            .foregroundColor((isDark ? appNightWarmText : brandDeep).opacity(isDark ? 0.70 : 0.44))
                            .lineLimit(1)
                            .minimumScaleFactor(0.72)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            if let date {
                Text(date, style: .timer)
                    .font(.system(size: fontSize, weight: .heavy, design: .rounded))
                    .foregroundColor(primaryColor)
                    .monospacedDigit()
                    .lineLimit(1)
                    .minimumScaleFactor(0.58)
                    .allowsTightening(true)
                    .layoutPriority(10)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding(.horizontal, 9)
        .padding(.vertical, 6)
        .background(
            ZStack {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: isDark
                                ? [appNightFaceSoftTop.opacity(0.988), appNightFaceSoftBottom.opacity(0.982), accent.opacity(0.13)]
                                : [Color.white.opacity(0.62), glassBlue.opacity(0.38), accent.opacity(0.10)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(
                        RadialGradient(
                            colors: [
                                (isDark ? appNightRimOrange : Color(hex: "#8BCBFF")).opacity(isDark ? 0.12 : 0.20),
                                Color.clear
                            ],
                            center: .topTrailing,
                            startRadius: 4,
                            endRadius: 120
                        )
                    )
            }
        )
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [(isDark ? appNightWarmText.opacity(0.10) : Color.white.opacity(0.20)), Color.clear],
                        startPoint: .topLeading,
                        endPoint: .center
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(
                    LinearGradient(
                        colors: isDark
                            ? [
                                appNightRimCream.opacity(0.42),
                                appNightRimOrange.opacity(0.28),
                                appNightRimMilk.opacity(0.14),
                                appNightRimHot.opacity(0.16)
                            ]
                            : [Color.white.opacity(0.84), accent.opacity(0.20), Color.white.opacity(0.34)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 0.9
                )
        )
        .shadow(color: Color.black.opacity(isDark ? 0.30 : 0.065), radius: isDark ? 11 : 8, x: 0, y: isDark ? 5 : 4)
        .shadow(color: (isDark ? appNightRimHot : Color(hex: "#8CCBFF")).opacity(isDark ? 0.14 : 0.16), radius: isDark ? 13 : 12, x: 0, y: 3)
        .shadow(color: accent.opacity(isDark ? 0.10 : 0.08), radius: 10, x: 0, y: 3)
        .frame(maxWidth: .infinity, minHeight: 52, alignment: .leading)
    }
}

// ══════════════════════════════════════════════════════════════════
// MARK: - Adaptive Widget View (switches layout by family size)
// ══════════════════════════════════════════════════════════════════

struct OBubbaAdaptiveWidgetView: View {
    @Environment(\.widgetFamily) var family
    let entry: OBubbaEntry

    var body: some View {
        if family == .systemSmall {
            OBubbaSmallWidgetView(entry: entry)
        } else {
            OBubbaMediumWidgetView(entry: entry)
        }
    }
}

// MARK: - Small Widget (2×2) — Next Event + Countdown
// ══════════════════════════════════════════════════════════════════

struct OBubbaSmallWidgetView: View {
    let entry: OBubbaEntry
    private var d: WidgetData { entry.data }

    @Environment(\.colorScheme) private var colorScheme
    private let brandDeep = Color(light: "#5B4F5F", dark: "#E8DDE0")
    private let brandMint = Color(red: 0.48, green: 0.65, blue: 0.55)
    private let brandRose = Color(red: 0.79, green: 0.44, blue: 0.36)
    private let brandPurple = Color(red: 0.55, green: 0.48, blue: 0.66)
    private var bgGrad: LinearGradient {
        colorScheme == .dark
            ? LinearGradient(colors: [Color(hex: "#1C1820"), Color(hex: "#252028")], startPoint: .topLeading, endPoint: .bottomTrailing)
            : LinearGradient(colors: [Color(red: 0.98, green: 0.96, blue: 0.94), Color(red: 0.95, green: 0.91, blue: 0.88)], startPoint: .topLeading, endPoint: .bottomTrailing)
    }

    static func formatBedtime(_ date: Date) -> String {
        let fmt = DateFormatter()
        fmt.dateFormat = "h:mma"
        fmt.locale = Locale(identifier: "en_US_POSIX")
        return fmt.string(from: date).lowercased()
    }

    private var hasTimer: Bool {
        guard let timer = d.activeTimer, !timer.isEmpty, let startDate = d.timerStartDate else { return false }
        return Date().timeIntervalSince(startDate) < 14 * 3600
    }

    var body: some View {
        let isNightTheme = colorScheme == .dark || widgetThemePrefersDark()
        let panelGlass = LinearGradient(
            colors: isNightTheme
                ? [Color(hex: "#182842").opacity(0.88), Color(hex: "#0D182B").opacity(0.92), Color(hex: "#FFD39A").opacity(0.10)]
                : [Color.white.opacity(0.60), Color(hex: "#DFF3FF").opacity(0.34), Color.white.opacity(0.20)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )

        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .top, spacing: 8) {
                VStack(alignment: .leading, spacing: 1) {
                    Text("OBUBBA")
                        .font(.system(size: 8.5, weight: .heavy, design: .rounded))
                        .foregroundColor(brandDeep.opacity(0.42))
                    Text(d.babyName)
                        .font(.system(size: 17, weight: .heavy, design: .rounded))
                        .foregroundColor(brandDeep)
                        .lineLimit(1)
                        .minimumScaleFactor(0.64)
                }
                Spacer(minLength: 4)
                Text("Today")
                    .font(.system(size: 9, weight: .heavy, design: .rounded))
                    .foregroundColor(brandDeep.opacity(0.52))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Capsule().fill(isNightTheme ? Color(hex: "#1A2942").opacity(0.82) : Color.white.opacity(0.46)))
            }

            if hasTimer, let startDate = d.timerStartDate {
                let label = d.timerLabel ?? ((d.activeTimer ?? "").capitalized)
                let accent = widgetAccent(label: label, timerType: d.activeTimer)

                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Image(systemName: widgetIcon(label: label, timerType: d.activeTimer))
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(accent)
                        Text(label)
                            .font(.system(size: 11, weight: .heavy, design: .rounded))
                            .foregroundColor(accent)
                            .lineLimit(1)
                            .minimumScaleFactor(0.72)
                    }
                    Text(startDate, style: .timer)
                        .font(.system(size: 23, weight: .heavy, design: .rounded))
                        .foregroundColor(brandDeep)
                        .monospacedDigit()
                        .lineLimit(1)
                        .minimumScaleFactor(0.44)
                        .allowsTightening(true)
                        .layoutPriority(10)
                    Text(label.lowercased().contains("feed") ? "tap to stop when done" : "since \(Self.formatBedtime(startDate))")
                        .font(.system(size: 9, weight: .semibold, design: .rounded))
                        .foregroundColor(brandDeep.opacity(0.46))
                        .lineLimit(1)
                        .minimumScaleFactor(0.78)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 10)
                .padding(.vertical, 9)
                .background(
                    RoundedRectangle(cornerRadius: 17, style: .continuous)
                        .fill(panelGlass)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 17, style: .continuous)
                        .stroke(accent.opacity(0.16), lineWidth: 0.8)
                )

            } else if let targetDate = d.predictionTargetDate,
                      let label = d.nextPredictionLabel, !label.isEmpty {
                let accent = widgetAccent(label: label)

                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Image(systemName: widgetIcon(label: label))
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(accent)
                        Text(label)
                            .font(.system(size: 11, weight: .heavy, design: .rounded))
                            .foregroundColor(accent)
                            .lineLimit(1)
                            .minimumScaleFactor(0.72)
                    }
                    Text(targetDate, style: .timer)
                        .font(.system(size: 21, weight: .heavy, design: .rounded))
                        .foregroundColor(brandDeep)
                        .monospacedDigit()
                        .lineLimit(1)
                        .minimumScaleFactor(0.44)
                        .allowsTightening(true)
                        .layoutPriority(10)
                    Text(widgetPredictionTimeHint(d.nextPrediction).map { "around \($0)" } ?? "next rhythm cue")
                        .font(.system(size: 9, weight: .semibold, design: .rounded))
                        .foregroundColor(brandDeep.opacity(0.48))
                        .lineLimit(1)
                        .minimumScaleFactor(0.78)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 10)
                .padding(.vertical, 9)
                .background(
                    RoundedRectangle(cornerRadius: 17, style: .continuous)
                        .fill(panelGlass)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 17, style: .continuous)
                        .stroke(accent.opacity(0.16), lineWidth: 0.8)
                )

            } else {
                HStack(spacing: 6) {
                    SmallMetric(value: "\(d.feedCount)", label: "feeds", color: brandRose)
                    SmallMetric(value: "\(d.sleepCount)", label: "naps", color: brandPurple)
                    SmallMetric(value: "\((d.wetNappyCount ?? 0))/6", label: "wet", color: (d.wetNappyCount ?? 0) >= 6 ? brandMint : brandSky)
                }

                Text("quietly keeping track")
                    .font(.system(size: 9.5, weight: .semibold, design: .rounded))
                    .foregroundColor(brandDeep.opacity(0.56))
                    .lineLimit(1)
                    .minimumScaleFactor(0.76)
            }
        }
        .padding(11)
        .ifLet(widgetForcedScheme()) { view, scheme in
            view.environment(\.colorScheme, scheme)
        }
        .containerBackground(for: .widget) {
            widgetThemeBackground()
        }
    }
}

// MARK: - Medium Widget (4×2) — Interactive
// ══════════════════════════════════════════════════════════════════

struct OBubbaMediumWidgetView: View {
    @Environment(\.colorScheme) private var colorScheme

    let entry: OBubbaEntry
    private var d: WidgetData { entry.data }

    private var hasTimer: Bool {
        guard let timer = d.activeTimer, !timer.isEmpty, let startDate = d.timerStartDate else { return false }
        // Safety: if timer has been running >14 hours, it's orphaned — ignore it
        let elapsed = Date().timeIntervalSince(startDate)
        return elapsed < 14 * 3600
    }

    var body: some View {
        let activeBreastSide = normalizedBreastSide(d.breastSide)
        let lastSide = normalizedBreastSide(d.lastBreastSide)
        let showsBreastControls = d.showNursing == true || d.activeTimer == "feed" || activeBreastSide != nil || lastSide != nil
        let actionSpacing: CGFloat = showsBreastControls ? 4 : 6
        let timerFontSize: CGFloat = showsBreastControls ? 17 : 19
        let predictionFontSize: CGFloat = showsBreastControls ? 16 : 18
        let isNightTheme = colorScheme == .dark || widgetThemePrefersDark()
        let timerTextColor = isNightTheme ? appNightWarmText : brandDeep

        VStack(spacing: 8) {

            // ── ROW 1: Header + Timer/Prediction ──
            HStack(alignment: .center, spacing: 8) {
                HStack(spacing: 6) {
                    Text("🧸")
                        .font(.system(size: 15))
                    Text(d.babyName)
                        .font(.system(size: 17, weight: .bold, design: .rounded))
                        .foregroundColor(isNightTheme ? appNightWarmText : brandDeep)
                        .lineLimit(1)
                        .minimumScaleFactor(0.72)
                }
                .frame(width: 108, alignment: .leading)

                if hasTimer, let startDate = d.timerStartDate {
                    let timerAccent = d.activeTimer == "feed" ? brandRose : brandPurple
                    let timerTitle = d.timerLabel ?? (d.activeTimer ?? "").capitalized
                    let sinceClock = widgetFriendlyClock(d.timerStartTime)
                    let baseTimerStatusTitle = widgetTimerStatusTitle(label: timerTitle, timerType: d.activeTimer, breastSide: activeBreastSide)
                    let timerStatusTitle = baseTimerStatusTitle
                    let timerDetails = [
                        sinceClock.map { "since \($0)" },
                        d.activeTimer == "feed" ? breastSideName(activeBreastSide).map { "\($0) side" } : nil
                    ].compactMap { $0 }.joined(separator: " · ")
                    MediumStatusPanel(
                        accent: timerAccent,
                        icon: widgetIcon(label: timerTitle, timerType: d.activeTimer),
                        title: timerStatusTitle,
                        detail: timerDetails.isEmpty ? nil : timerDetails,
                        date: startDate,
                        fontSize: timerFontSize,
                        primaryColor: timerTextColor
                    )
                } else if let targetDate = d.predictionTargetDate,
                          let label = d.nextPredictionLabel, !label.isEmpty {
                    let accent = widgetAccent(label: label)
                    MediumStatusPanel(
                        accent: accent,
                        icon: widgetIcon(label: label),
                        title: label,
                        detail: widgetPredictionTimeHint(d.nextPrediction).map { "around \($0)" } ?? "next rhythm cue",
                        date: targetDate,
                        fontSize: predictionFontSize,
                        primaryColor: accent
                    )
                } else if let pred = d.nextPrediction, !pred.isEmpty {
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(.system(size: 9, weight: .semibold))
                            .foregroundColor(brandPurple)
                        Text(pred)
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(brandDeep.opacity(0.6))
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Color.white.opacity(0.48))
                    .overlay(
                        Capsule()
                            .stroke(brandPurple.opacity(0.18), lineWidth: 0.8)
                    )
                    .clipShape(Capsule())
                    .frame(maxWidth: .infinity, alignment: .trailing)
                }
            }

            // ── ROW 2: Action Buttons (big, tappable via deep links) ──
            HStack(spacing: actionSpacing) {
                Link(destination: URL(string: "obubba://?action=quick_feed")!) {
                    ActionBtn(icon: "drop.fill", label: "Feed", color: brandRose)
                }
                if showsBreastControls {
                    let leftIsNext = lastSide != "left"
                    Link(destination: URL(string: "obubba://?action=breast_left")!) {
                        BreastBtn(letter: "L", isNext: leftIsNext)
                    }
                    Link(destination: URL(string: "obubba://?action=breast_right")!) {
                        BreastBtn(letter: "R", isNext: !leftIsNext)
                    }
                }
                Link(destination: URL(string: "obubba://?action=quick_nappy")!) {
                    ActionBtn(icon: "pin.fill", label: "Nappy", color: brandMint, emoji: "🧷")
                }
                if d.activeTimer == "bed" && hasTimer {
                    // Bedtime active — offer morning wake
                    Link(destination: URL(string: "obubba://?action=quick_wake")!) {
                        ActionBtn(icon: "sun.max.fill", label: "Wake", color: brandGold, filled: true)
                    }
                } else if hasTimer {
                    Link(destination: URL(string: "obubba://?action=stop_timer")!) {
                        ActionBtn(icon: "stop.fill", label: "Stop", color: brandRose, filled: true)
                    }
                } else if (d.nextPredictionLabel ?? "").lowercased().contains("bed") {
                    Link(destination: URL(string: "obubba://?action=start_bedtime")!) {
                        ActionBtn(icon: "moon.zzz.fill", label: "Sleep", color: brandPurple, filled: false)
                    }
                } else {
                    Link(destination: URL(string: "obubba://?action=toggle_nap")!) {
                        ActionBtn(icon: "moon.zzz.fill", label: "Nap", color: brandPurple, filled: false)
                    }
                }
            }

        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .ifLet(widgetForcedScheme()) { view, scheme in
            view.environment(\.colorScheme, scheme)
        }
        .containerBackground(for: .widget) {
            widgetThemeBackground()
        }
    }
}

// ══════════════════════════════════════════════════════════════════
// MARK: - Lock Screen Widgets
// ══════════════════════════════════════════════════════════════════

@available(iOS 16.0, *)
struct OBubbaLockScreenRectangular: View {
    let entry: OBubbaEntry
    private var d: WidgetData { entry.data }
    private var predictionLabel: String {
        obLockLabel(d.nextPredictionLabel)
    }

    var body: some View {
        if let timer = d.activeTimer, !timer.isEmpty, let startDate = d.timerStartDate {
            // Timer active
            let sideLetter = breastSideLetter(d.breastSide)
            let label = timer == "feed" && sideLetter != nil ? "Nursing \(sideLetter!)" : obLockLabel(d.timerLabel, fallback: timer == "feed" ? "Feed" : "Bedtime")
            HStack(spacing: 7) {
                Image(systemName: obLockIcon(label: label, timerType: timer))
                    .font(.system(size: 12, weight: .bold))
                VStack(alignment: .leading, spacing: 1) {
                    Text(label)
                        .font(.system(size: 11.5, weight: .heavy, design: .rounded))
                    Text(timer == "feed" ? (breastSideName(d.breastSide).map { "\($0) side" } ?? d.babyName) : "\(d.babyName) asleep")
                        .font(.system(size: 9.5, weight: .semibold, design: .rounded))
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
                Spacer()
                Text(startDate, style: .timer)
                    .font(.system(size: 13, weight: .heavy, design: .rounded))
                    .monospacedDigit()
                    .lineLimit(1)
                    .minimumScaleFactor(0.34)
                    .allowsTightening(true)
                    .frame(minWidth: 78, alignment: .trailing)
                    .layoutPriority(10)
            }
        } else if let targetDate = d.predictionTargetDate {
            HStack(spacing: 8) {
                Image(systemName: obLockIcon(label: predictionLabel))
                    .font(.system(size: 12, weight: .bold))
                VStack(alignment: .leading, spacing: 1) {
                    Text(predictionLabel)
                        .font(.system(size: 11.5, weight: .heavy, design: .rounded))
                    Text(d.babyName)
                        .font(.system(size: 9.5, weight: .semibold, design: .rounded))
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
                Spacer()
                Text(targetDate, style: .timer)
                    .font(.system(size: 13, weight: .heavy, design: .rounded))
                    .monospacedDigit()
                    .lineLimit(1)
                    .minimumScaleFactor(0.5)
                    .allowsTightening(true)
                    .frame(minWidth: 68, alignment: .trailing)
                    .layoutPriority(10)
            }
        } else {
            // Stats
            HStack(spacing: 10) {
                Text(d.babyName)
                    .font(.system(size: 12, weight: .bold, design: .rounded))

                Spacer()

                HStack(spacing: 3) {
                    Image(systemName: "drop.fill").font(.system(size: 9))
                    Text("\(d.feedCount)").font(.system(size: 13, weight: .bold, design: .rounded))
                }

                HStack(spacing: 3) {
                    Image(systemName: "moon.zzz.fill").font(.system(size: 9))
                    Text("\(d.sleepCount)").font(.system(size: 13, weight: .bold, design: .rounded))
                }

                HStack(spacing: 3) {
                    Text("🧷").font(.system(size: 9))
                    Text("\(d.nappyCount)").font(.system(size: 13, weight: .bold, design: .rounded))
                }
            }
        }
    }
}

@available(iOS 16.0, *)
struct OBubbaLockScreenInline: View {
    let entry: OBubbaEntry
    private var d: WidgetData { entry.data }
    private var predictionLabel: String {
        obLockLabel(d.nextPredictionLabel)
    }

    var body: some View {
        if let timer = d.activeTimer, !timer.isEmpty, let startDate = d.timerStartDate {
            let sideLetter = breastSideLetter(d.breastSide)
            let label = timer == "feed" && sideLetter != nil ? "Nursing \(sideLetter!)" : obLockLabel(d.timerLabel, fallback: timer == "feed" ? "Feed" : "Bedtime")
            HStack(spacing: 4) {
                Image(systemName: obLockIcon(label: label, timerType: timer)).font(.caption2)
                Text(label).font(.system(.caption, design: .rounded)).bold()
                Text(startDate, style: .timer)
                    .font(.system(.caption, design: .rounded)).bold()
                    .monospacedDigit()
                    .lineLimit(1)
                    .minimumScaleFactor(0.34)
                    .allowsTightening(true)
                    .layoutPriority(10)
            }
        } else if let targetDate = d.predictionTargetDate {
            HStack(spacing: 4) {
                Image(systemName: obLockIcon(label: predictionLabel)).font(.caption2)
                Text(predictionLabel).font(.system(.caption, design: .rounded)).bold()
                Text(targetDate, style: .timer)
                    .font(.system(.caption, design: .rounded)).bold()
                    .monospacedDigit()
                    .lineLimit(1)
                    .minimumScaleFactor(0.42)
                    .allowsTightening(true)
                    .layoutPriority(6)
            }
        } else {
            HStack(spacing: 4) {
                Image(systemName: "drop.fill").font(.caption2)
                Text("\(d.feedCount)").font(.system(.caption, design: .rounded)).bold()
                Text("·").foregroundColor(.secondary)
                Image(systemName: "moon.zzz.fill").font(.caption2)
                Text("\(d.sleepCount)").font(.system(.caption, design: .rounded)).bold()
                Text("·").foregroundColor(.secondary)
                Text("🧷").font(.caption2)
                Text("\(d.nappyCount)").font(.system(.caption, design: .rounded)).bold()
            }
        }
    }
}

// ══════════════════════════════════════════════════════════════════
// MARK: - Live Activity
// ══════════════════════════════════════════════════════════════════

struct OBubbaTimerAttributes: ActivityAttributes {
    let timerType: String
    let babyName: String
    struct ContentState: Codable, Hashable {
        let startTime: Date
        let elapsed: Int
        let side: String?
        let nextNap: String?    // e.g. "Nap 2:00pm" or "Bed 7:30pm"
    }
}

struct OBubbaPredictionAttributes: ActivityAttributes {
    let babyName: String
    struct ContentState: Codable, Hashable {
        let targetTime: Date       // The predicted nap/bedtime
        let label: String          // e.g. "Nap 2" or "Bedtime"
        let timeFormatted: String  // e.g. "2:00 pm" or "7:30 pm"
    }
}

@available(iOS 16.1, *)
struct OBubbaTimerLiveActivity: Widget {
    let kind: String = "OBubbaTimer"

    private func timerIcon(_ type: String) -> String {
        type == "feed" ? "drop.fill" : "moon.zzz.fill"
    }
    private func timerLabel(_ type: String) -> String {
        type == "feed" ? "Feed" : "Sleeping"
    }

    /// Smart label: use nextNap ("Nap 1 2:00pm" → "Nap 1") if available, else "Sleep"/"Feed"
    private func smartLabel(nextNap: String?, timerType: String) -> String {
        obLockLabel(nextNap, fallback: timerLabel(timerType))
    }

    private func displayLabel(nextNap: String?, timerType: String, side: String?) -> String {
        if timerType == "feed", let letter = breastSideLetter(side) {
            return "Nursing \(letter)"
        }
        return smartLabel(nextNap: nextNap, timerType: timerType)
    }

    var body: some WidgetConfiguration {
        ActivityConfiguration(for: OBubbaTimerAttributes.self) { context in
            // ── Lock Screen / Notification Banner ──
            let label = displayLabel(nextNap: context.state.nextNap, timerType: context.attributes.timerType, side: context.state.side)
            let icon = obLockIcon(label: label, timerType: context.attributes.timerType)
            HStack(spacing: 0) {
                // Left: icon circle + baby name below
                LockActivityBadge(icon: icon, title: context.attributes.babyName, accent: lockRoseGlow)
                    .frame(width: 54)
                    .padding(.trailing, 2)

                // Middle: label + timer (centered)
                VStack(alignment: .center, spacing: 0) {
                    Text(label)
                        .font(.system(size: 11.5, weight: .heavy, design: .rounded))
                        .foregroundColor(lockCreamText.opacity(0.62))
                        .lineLimit(1)
                    Text(context.state.startTime, style: .timer)
                        .font(.system(size: 21, weight: .heavy, design: .rounded))
                        .foregroundColor(lockCreamText)
                        .monospacedDigit()
                        .lineLimit(1)
                        .minimumScaleFactor(0.42)
                        .allowsTightening(true)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .layoutPriority(10)
                    if let sideName = breastSideName(context.state.side) {
                        Text("\(sideName) side")
                            .font(.system(size: 9, weight: .medium))
                            .foregroundColor(lockCreamText.opacity(0.48))
                    }
                }
                .frame(maxWidth: .infinity, alignment: .center)

                // Right: stop button
                Link(destination: URL(string: "obubba://?action=stop_timer")!) {
                    LockActivityAction(icon: "stop.fill", accent: lockRoseGlow)
                }
                .frame(width: 54)
                .padding(.leading, 2)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 9)
            .background(LockActivityFace(accent: lockRoseGlow))
            .activityBackgroundTint(
                Color(light: "#211827", dark: "#151B2A")
            )
            .activitySystemActionForegroundColor(lockRoseGlow)

        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    ZStack {
                        Circle()
                            .fill(brandRose.opacity(0.12))
                            .frame(width: 36, height: 36)
                        Image(systemName: timerIcon(context.attributes.timerType))
                            .foregroundColor(brandRose)
                            .font(.system(size: 16, weight: .semibold))
                    }
                }
                DynamicIslandExpandedRegion(.center) {
                    VStack(spacing: 2) {
                        Text(displayLabel(nextNap: context.state.nextNap, timerType: context.attributes.timerType, side: context.state.side))
                            .font(.system(size: 14, weight: .bold, design: .rounded))
                        if let sideName = breastSideName(context.state.side) {
                            Text("\(sideName) side")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.startTime, style: .timer)
                        .font(.system(size: 16, weight: .heavy, design: .rounded))
                        .foregroundColor(brandRose)
                        .monospacedDigit()
                        .lineLimit(1)
                        .minimumScaleFactor(0.42)
                        .allowsTightening(true)
                        .frame(minWidth: 82, alignment: .trailing)
                        .layoutPriority(10)
                }
            } compactLeading: {
                Image(systemName: timerIcon(context.attributes.timerType))
                    .foregroundColor(brandRose)
                    .font(.system(size: 12))
            } compactTrailing: {
                Text(context.state.startTime, style: .timer)
                    .font(.system(size: 10, weight: .bold, design: .rounded))
                    .foregroundColor(brandRose)
                    .monospacedDigit()
                    .lineLimit(1)
                    .minimumScaleFactor(0.38)
                    .allowsTightening(true)
                    .frame(width: 64, alignment: .trailing)
            } minimal: {
                Image(systemName: timerIcon(context.attributes.timerType))
                    .foregroundColor(brandRose)
                    .font(.system(size: 12))
            }
        }
    }
}

// ══════════════════════════════════════════════════════════════════
// MARK: - Prediction Countdown Live Activity
// ══════════════════════════════════════════════════════════════════

@available(iOS 16.1, *)
struct OBubbaPredictionLiveActivity: Widget {
    let kind: String = "OBubbaPrediction"

    private func predIcon(_ label: String) -> String {
        obLockIcon(label: label)
    }

    var body: some WidgetConfiguration {
        ActivityConfiguration(for: OBubbaPredictionAttributes.self) { context in
            // ── Lock Screen / Notification Banner ──
            let label = obLockLabel(context.state.label)
            HStack(spacing: 0) {
                // Left: icon + baby name
                LockActivityBadge(icon: predIcon(label), title: context.attributes.babyName, accent: brandPurple)
                    .frame(width: 54)
                    .padding(.trailing, 2)

                // Middle: label + time + countdown (centered)
                VStack(alignment: .center, spacing: 0) {
                    Text(label)
                        .font(.system(size: 11.5, weight: .heavy, design: .rounded))
                        .foregroundColor(lockCreamText.opacity(0.62))
                        .lineLimit(1)
                    Text(context.state.timeFormatted)
                        .font(.system(size: 23, weight: .heavy, design: .rounded))
                        .foregroundColor(lockCreamText)
                    Text(context.state.targetTime, style: .timer)
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundColor(Color(hex: "#D6CCFF"))
                        .monospacedDigit()
                        .lineLimit(1)
                        .minimumScaleFactor(0.42)
                        .allowsTightening(true)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .layoutPriority(6)
                }
                .frame(maxWidth: .infinity, alignment: .center)

                // Right: start button — begins the predicted nap/bedtime
                Link(destination: URL(string: label.lowercased().contains("bed")
                    ? "obubba://?action=start_bedtime"
                    : "obubba://?action=toggle_nap")!) {
                    LockActivityAction(icon: "play.fill", accent: brandPurple)
                }
                .frame(width: 54)
                .padding(.leading, 2)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 9)
            .background(LockActivityFace(accent: brandPurple))
            .activityBackgroundTint(
                Color(light: "#211827", dark: "#151B2A")
            )
            .activitySystemActionForegroundColor(brandPurple)

        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    VStack(spacing: 2) {
                        Image(systemName: predIcon(context.state.label))
                            .foregroundColor(brandPurple)
                            .font(.system(size: 16, weight: .semibold))
                        Text(context.attributes.babyName)
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(.secondary)
                    }
                }
                DynamicIslandExpandedRegion(.center) {
                    VStack(spacing: 2) {
                        Text(context.state.label)
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.secondary)
                        Text(context.state.timeFormatted)
                            .font(.system(size: 20, weight: .heavy, design: .rounded))
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.targetTime, style: .timer)
                        .font(.system(size: 13, weight: .heavy, design: .rounded))
                        .foregroundColor(brandPurple)
                        .monospacedDigit()
                        .lineLimit(1)
                        .minimumScaleFactor(0.42)
                        .allowsTightening(true)
                        .frame(minWidth: 82, alignment: .trailing)
                        .layoutPriority(10)
                }
            } compactLeading: {
                Image(systemName: predIcon(context.state.label))
                    .foregroundColor(brandPurple)
                    .font(.system(size: 12))
            } compactTrailing: {
                Text(context.state.timeFormatted)
                    .font(.system(size: 11, weight: .bold, design: .rounded))
                    .foregroundColor(brandPurple)
                    .monospacedDigit()
                    .lineLimit(1)
                    .minimumScaleFactor(0.5)
                    .frame(width: 58, alignment: .trailing)
            } minimal: {
                ZStack {
                    Circle()
                        .fill(brandRose)
                        .frame(width: 22, height: 22)
                    Image(systemName: predIcon(context.state.label))
                        .foregroundColor(.white)
                        .font(.system(size: 10, weight: .bold))
                }
            }
        }
    }
}

// ══════════════════════════════════════════════════════════════════
// MARK: - Widget Configurations
// ══════════════════════════════════════════════════════════════════

struct OBubbaSummaryWidget: Widget {
    let kind: String = "OBubbaSummary"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: OBubbaTimelineProvider()) { entry in
            OBubbaAdaptiveWidgetView(entry: entry)
        }
        .configurationDisplayName("Baby Summary")
        .description("Feeds, sleeps, nappies and quick actions at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

@available(iOS 16.0, *)
struct OBubbaLockScreenSwitcher: View {
    let entry: OBubbaEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .accessoryInline:
            OBubbaLockScreenInline(entry: entry)
        default:
            OBubbaLockScreenRectangular(entry: entry)
        }
    }
}

@available(iOS 16.0, *)
struct OBubbaLockScreenAccessoryWidget: Widget {
    let kind: String = "OBubbaLockScreen"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: OBubbaTimelineProvider()) { entry in
            if #available(iOS 16.0, *) {
                OBubbaLockScreenSwitcher(entry: entry)
            }
        }
        .configurationDisplayName("Baby Stats")
        .description("Quick baby stats on your Lock Screen.")
        .supportedFamilies([.accessoryRectangular, .accessoryInline])
    }
}

// ── Widget Bundle ────────────────────────────────────────────────
@main
struct OBubbaWidgetBundle: WidgetBundle {
    var body: some Widget {
        OBubbaSummaryWidget()
        if #available(iOS 16.0, *) {
            OBubbaLockScreenAccessoryWidget()
        }
        if #available(iOS 16.1, *) {
            OBubbaTimerLiveActivity()
            OBubbaPredictionLiveActivity()
        }
    }
}

// ══════════════════════════════════════════════════════════════════
// MARK: - Color Helper
// ══════════════════════════════════════════════════════════════════

extension Color {
    init(hex: String) {
        let h = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: h).scanHexInt64(&int)
        let r, g, b: Double
        switch h.count {
        case 6:
            r = Double((int >> 16) & 0xFF) / 255
            g = Double((int >> 8) & 0xFF) / 255
            b = Double(int & 0xFF) / 255
        default:
            r = 1; g = 1; b = 1
        }
        self.init(red: r, green: g, blue: b)
    }
    /// Adaptive colour — light hex in light mode, dark hex in dark mode
    init(light: String, dark: String) {
        self.init(uiColor: UIColor { traits in
            traits.userInterfaceStyle == .dark ? UIColor(Color(hex: dark)) : UIColor(Color(hex: light))
        })
    }
}
