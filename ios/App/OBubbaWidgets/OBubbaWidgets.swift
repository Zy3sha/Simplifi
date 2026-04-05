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
}

struct OBWidgetLogFeedIntent: AppIntent {
    static var title: LocalizedStringResource = "Quick Log Feed"
    static var description = IntentDescription("Log a feed from the widget")
    static var openAppWhenRun: Bool = true
    func perform() async throws -> some IntentResult {
        widgetStorePendingEntry(["type": "feed", "feedType": "bottle", "source": "widget"])
        return .result()
    }
}

struct OBWidgetLogNappyIntent: AppIntent {
    static var title: LocalizedStringResource = "Quick Log Nappy"
    static var description = IntentDescription("Log a nappy from the widget")
    static var openAppWhenRun: Bool = true
    func perform() async throws -> some IntentResult {
        widgetStorePendingEntry(["type": "poop", "poopType": "wet", "source": "widget"])
        return .result()
    }
}

struct OBWidgetToggleTimerIntent: AppIntent {
    static var title: LocalizedStringResource = "Toggle Timer"
    static var description = IntentDescription("Start or stop the nap timer from widget")
    static var openAppWhenRun: Bool = true
    func perform() async throws -> some IntentResult {
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
            widgetStorePendingEntry(["type": "nap_stop", "source": "widget"])
        } else {
            widgetStorePendingEntry(["type": "nap_start", "source": "widget"])
        }
        return .result()
    }
}

struct OBWidgetBreastLeftIntent: AppIntent {
    static var title: LocalizedStringResource = "Start Left Breast"
    static var description = IntentDescription("Start left breast feed timer from widget")
    static var openAppWhenRun: Bool = true
    func perform() async throws -> some IntentResult {
        widgetStorePendingEntry(["type": "breast_start", "side": "left", "source": "widget"])
        return .result()
    }
}

struct OBWidgetBreastRightIntent: AppIntent {
    static var title: LocalizedStringResource = "Start Right Breast"
    static var description = IntentDescription("Start right breast feed timer from widget")
    static var openAppWhenRun: Bool = true
    func perform() async throws -> some IntentResult {
        widgetStorePendingEntry(["type": "breast_start", "side": "right", "source": "widget"])
        return .result()
    }
}

// ══════════════════════════════════════════════════════════════════
// MARK: - Design System
// ══════════════════════════════════════════════════════════════════

private let brandRose    = Color(hex: "#C07088")
private let brandDeep    = Color(hex: "#5B4F5F")
private let brandWarm    = Color(hex: "#F0DDD6")
private let brandBg      = Color(hex: "#FBF5F3")
private let brandCream   = Color(hex: "#FAF0EB")
private let brandMint    = Color(hex: "#6FA898")
private let brandPurple  = Color(hex: "#8B7EC8")
private let brandSky     = Color(hex: "#7AABC4")
private let brandGold    = Color(hex: "#D4A855")

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
        case lastNappyTime, lastNappyType, nextPrediction, nextPredictionMs, nextPredictionLabel
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
        self.nextPrediction = nil; self.nextPredictionMs = nil; self.nextPredictionLabel = nil
        self.activeTimer = nil; self.timerStartTime = nil
        self.timerStartMs = nil; self.timerLabel = nil; self.breastSide = nil
        self.showNursing = nil; self.lastBreastSide = nil
    }

    var predictionTargetDate: Date? {
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
        let interval = entry.data.activeTimer != nil ? 1 : 15
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: interval, to: Date())!
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
    let icon: String
    let label: String
    let color: Color
    let filled: Bool

    init(icon: String, label: String, color: Color, filled: Bool = false) {
        self.icon = icon; self.label = label; self.color = color; self.filled = filled
    }

    var body: some View {
        VStack(spacing: 3) {
            Image(systemName: icon)
                .font(.system(size: 14, weight: .semibold))
            Text(label)
                .font(.system(size: 10, weight: .bold))
        }
        .foregroundColor(filled ? Color.white : color)
        .frame(maxWidth: .infinity)
        .frame(height: 48)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(filled ? color.opacity(0.85) : color.opacity(0.25))
        )
        .environment(\.colorScheme, .light)
    }
}

// ── Breast side button ───────────────────────────────────────────
struct BreastBtn: View {
    let letter: String
    let isNext: Bool

    var body: some View {
        VStack(spacing: 2) {
            Text(letter)
                .font(.system(size: 16, weight: .black, design: .rounded))
            if isNext {
                Text("next")
                    .font(.system(size: 8, weight: .bold))
                    .textCase(.uppercase)
            }
        }
        .foregroundColor(isNext ? Color.white : brandRose)
        .frame(maxWidth: .infinity)
        .frame(height: 48)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(isNext ? brandRose : brandRose.opacity(0.12))
        )
        .environment(\.colorScheme, .light)
    }
}

// Old small widget removed — new clean version below

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

    private let brandDeep = Color(red: 0.36, green: 0.31, blue: 0.37)
    private let brandMint = Color(red: 0.48, green: 0.65, blue: 0.55)
    private let brandRose = Color(red: 0.79, green: 0.44, blue: 0.36)
    private let brandPurple = Color(red: 0.55, green: 0.48, blue: 0.66)
    private let bgGrad = LinearGradient(
        colors: [Color(red: 0.98, green: 0.96, blue: 0.94), Color(red: 0.95, green: 0.91, blue: 0.88)],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )

    private var hasTimer: Bool {
        guard let timer = d.activeTimer, !timer.isEmpty, let startDate = d.timerStartDate else { return false }
        return Date().timeIntervalSince(startDate) < 14 * 3600
    }

    var body: some View {
        VStack(spacing: 6) {
            // Baby name — small, top
            Text(d.babyName)
                .font(.system(size: 11, weight: .semibold, design: .rounded))
                .foregroundColor(brandDeep.opacity(0.5))

                if hasTimer, let startDate = d.timerStartDate {
                    // ── Active timer mode ──
                    let icon = (d.activeTimer ?? "") == "feed" ? "🍼" : "💤"
                    let label = d.timerLabel ?? ((d.activeTimer ?? "").capitalized)

                    Text(icon)
                        .font(.system(size: 28))

                    Text(label)
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .foregroundColor(brandRose)

                    Text(startDate, style: .timer)
                        .font(.system(size: 24, weight: .heavy, design: .rounded))
                        .foregroundColor(brandDeep)
                        .monospacedDigit()

                } else if let targetDate = d.predictionTargetDate,
                          let label = d.nextPredictionLabel, !label.isEmpty {
                    // ── Prediction countdown mode ──
                    Text(label.hasPrefix("Nap") ? "😴" : "🌙")
                        .font(.system(size: 28))

                    Text(label)
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .foregroundColor(brandPurple)

                    Text(targetDate, style: .relative)
                        .font(.system(size: 22, weight: .heavy, design: .rounded))
                        .foregroundColor(brandDeep)
                        .monospacedDigit()

                    if let pred = d.nextPrediction, !pred.isEmpty {
                        let timeOnly = pred.replacingOccurrences(of: "Nap \\d+ ~", with: "", options: .regularExpression)
                            .replacingOccurrences(of: "Bed ~", with: "")
                            .trimmingCharacters(in: .whitespaces)
                        if !timeOnly.isEmpty {
                            Text("~\(timeOnly)")
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(brandPurple.opacity(0.5))
                        }
                    }

                } else {
                    // ── No timer, no prediction — show day at a glance ──
                    Text("☀️")
                        .font(.system(size: 22))

                    HStack(spacing: 8) {
                        VStack(spacing: 1) {
                            Text("\(d.feedCount)")
                                .font(.system(size: 18, weight: .heavy, design: .rounded))
                                .foregroundColor(brandRose)
                            Text("feeds")
                                .font(.system(size: 8, weight: .semibold))
                                .foregroundColor(brandDeep.opacity(0.45))
                        }
                        VStack(spacing: 1) {
                            Text("\(d.sleepCount)")
                                .font(.system(size: 18, weight: .heavy, design: .rounded))
                                .foregroundColor(brandPurple)
                            Text("naps")
                                .font(.system(size: 8, weight: .semibold))
                                .foregroundColor(brandDeep.opacity(0.45))
                        }
                        VStack(spacing: 1) {
                            let wet = d.wetNappyCount ?? 0
                            Text("\(wet)/6")
                                .font(.system(size: 18, weight: .heavy, design: .rounded))
                                .foregroundColor(wet >= 6 ? brandMint : brandDeep.opacity(0.6))
                            Text("wet")
                                .font(.system(size: 8, weight: .semibold))
                                .foregroundColor(brandDeep.opacity(0.45))
                        }
                    }

                    Text("today so far")
                        .font(.system(size: 9, weight: .medium))
                        .foregroundColor(brandDeep.opacity(0.4))
                }
        }
        .padding(12)
        .containerBackground(for: .widget) {
            bgGrad
        }
    }
}

// MARK: - Medium Widget (4×2) — Interactive
// ══════════════════════════════════════════════════════════════════

struct OBubbaMediumWidgetView: View {
    let entry: OBubbaEntry
    private var d: WidgetData { entry.data }

    private var hasTimer: Bool {
        guard let timer = d.activeTimer, !timer.isEmpty, let startDate = d.timerStartDate else { return false }
        // Safety: if timer has been running >14 hours, it's orphaned — ignore it
        let elapsed = Date().timeIntervalSince(startDate)
        return elapsed < 14 * 3600
    }

    var body: some View {
        VStack(spacing: 0) {

            // ── ROW 1: Header + Timer/Prediction ──
            HStack(alignment: .center) {
                HStack(spacing: 6) {
                    Text("🧸")
                        .font(.system(size: 15))
                    Text(d.babyName)
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundColor(brandDeep)
                }

                Spacer()

                if hasTimer, let startDate = d.timerStartDate {
                    VStack(alignment: .trailing, spacing: 2) {
                        HStack(spacing: 6) {
                            HStack(spacing: 4) {
                                Circle().fill(brandRose).frame(width: 6, height: 6)
                                Text(d.timerLabel ?? (d.activeTimer ?? "").capitalized)
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(brandRose)
                            }
                            Text(startDate, style: .timer)
                                .font(.system(size: 22, weight: .heavy, design: .rounded))
                                .foregroundColor(brandDeep)
                                .monospacedDigit()
                        }
                        // "since X:XX" line
                        if let startTime = d.timerStartTime, !startTime.isEmpty {
                            let parts = startTime.split(separator: ":").compactMap { Int($0) }
                            let sinceText: String = {
                                if parts.count >= 2 {
                                    let h = parts[0], m = parts[1]
                                    let suffix = h >= 12 ? "pm" : "am"
                                    let h12 = h == 0 ? 12 : h > 12 ? h - 12 : h
                                    return "since \(h12):\(String(format: "%02d", m))\(suffix)"
                                }
                                return "since \(startTime)"
                            }()
                            Text(sinceText)
                                .font(.system(size: 9, weight: .medium))
                                .foregroundColor(brandDeep.opacity(0.35))
                        }
                        if let s = d.breastSide {
                            Text(s.capitalized + " side")
                                .font(.system(size: 9, weight: .medium))
                                .foregroundColor(brandDeep.opacity(0.4))
                        }
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(brandRose.opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    .frame(maxWidth: .infinity, alignment: .trailing)
                } else if let targetDate = d.predictionTargetDate,
                          let label = d.nextPredictionLabel, !label.isEmpty {
                    VStack(alignment: .trailing, spacing: 1) {
                        Text(label)
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(brandPurple.opacity(0.7))
                        HStack(spacing: 4) {
                            Text(targetDate, style: .relative)
                                .font(.system(size: 13, weight: .heavy, design: .rounded))
                                .foregroundColor(brandPurple)
                                .monospacedDigit()
                            // Show predicted time next to countdown
                            if let pred = d.nextPrediction, !pred.isEmpty {
                                let timeOnly = pred.replacingOccurrences(of: "Nap \\d+ ~", with: "", options: .regularExpression)
                                    .replacingOccurrences(of: "Bed ~", with: "")
                                    .trimmingCharacters(in: .whitespaces)
                                if !timeOnly.isEmpty {
                                    Text(timeOnly)
                                        .font(.system(size: 9, weight: .semibold))
                                        .foregroundColor(brandPurple.opacity(0.5))
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(brandPurple.opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    .frame(maxWidth: .infinity, alignment: .trailing)
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
                    .background(brandPurple.opacity(0.08))
                    .clipShape(Capsule())
                    .frame(maxWidth: .infinity, alignment: .trailing)
                }
            }

            Spacer(minLength: 5)

            // ── ROW 2: Action Buttons (big, tappable via deep links) ──
            HStack(spacing: 8) {
                Link(destination: URL(string: "obubba://?action=quick_feed")!) {
                    ActionBtn(icon: "drop.fill", label: "Feed", color: brandRose)
                }
                if d.showNursing == true {
                    let leftIsNext = d.lastBreastSide != "left"
                    Link(destination: URL(string: "obubba://?action=breast_left")!) {
                        BreastBtn(letter: "L", isNext: leftIsNext)
                    }
                    Link(destination: URL(string: "obubba://?action=breast_right")!) {
                        BreastBtn(letter: "R", isNext: !leftIsNext)
                    }
                }
                Link(destination: URL(string: "obubba://?action=quick_nappy")!) {
                    ActionBtn(icon: "leaf.fill", label: "Nappy", color: brandMint)
                }
                if d.activeTimer == "bed" && hasTimer {
                    // Bedtime active — offer morning wake
                    Link(destination: URL(string: "obubba://?action=quick_wake")!) {
                        ActionBtn(icon: "sun.max.fill", label: "Wake", color: brandGold, filled: true)
                    }
                } else {
                    Link(destination: URL(string: "obubba://?action=stop_timer")!) {
                        ActionBtn(
                            icon: hasTimer ? "stop.fill" : "play.fill",
                            label: hasTimer ? "Stop" : "Nap",
                            color: hasTimer ? brandRose : brandPurple,
                            filled: hasTimer
                        )
                    }
                }
            }

            Spacer(minLength: 5)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .containerBackground(for: .widget) {
            ZStack {
                brandBg
                LinearGradient(
                    colors: [Color.white.opacity(0.6), brandWarm.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            }
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

    var body: some View {
        if let timer = d.activeTimer, !timer.isEmpty, let startDate = d.timerStartDate {
            // Timer active
            HStack(spacing: 8) {
                Image(systemName: timer == "feed" ? "drop.fill" : "moon.zzz.fill")
                    .font(.system(size: 13, weight: .semibold))
                VStack(alignment: .leading, spacing: 1) {
                    Text(d.babyName)
                        .font(.system(size: 12, weight: .bold, design: .rounded))
                    if let s = d.breastSide {
                        Text("\(s.capitalized) side")
                            .font(.system(size: 10))
                            .foregroundColor(.secondary)
                    }
                }
                Spacer()
                Text(startDate, style: .timer)
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                    .monospacedDigit()
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
                    Image(systemName: "leaf.fill").font(.system(size: 9))
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

    var body: some View {
        if let timer = d.activeTimer, !timer.isEmpty, let startDate = d.timerStartDate {
            HStack(spacing: 4) {
                Image(systemName: timer == "feed" ? "drop.fill" : "moon.zzz.fill").font(.caption2)
                Text(startDate, style: .timer)
                    .font(.system(.caption, design: .rounded)).bold()
                    .monospacedDigit()
            }
        } else {
            HStack(spacing: 4) {
                Image(systemName: "drop.fill").font(.caption2)
                Text("\(d.feedCount)").font(.system(.caption, design: .rounded)).bold()
                Text("·").foregroundColor(.secondary)
                Image(systemName: "moon.zzz.fill").font(.caption2)
                Text("\(d.sleepCount)").font(.system(.caption, design: .rounded)).bold()
                Text("·").foregroundColor(.secondary)
                Image(systemName: "leaf.fill").font(.caption2)
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
        if let nn = nextNap, !nn.isEmpty {
            let parts = nn.components(separatedBy: " ")
            if parts.count >= 2, parts[0] == "Nap" || parts[0] == "Bed" {
                return parts.prefix(2).joined(separator: " ")
            }
            return nn
        }
        return timerLabel(timerType)
    }

    var body: some WidgetConfiguration {
        ActivityConfiguration(for: OBubbaTimerAttributes.self) { context in
            // ── Lock Screen / Notification Banner ──
            HStack(spacing: 0) {
                // Left: icon circle + baby name below
                VStack(spacing: 2) {
                    ZStack {
                        Circle()
                            .fill(brandRose.opacity(0.15))
                            .frame(width: 34, height: 34)
                        Image(systemName: timerIcon(context.attributes.timerType))
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(brandRose)
                    }
                    Text(context.attributes.babyName)
                        .font(.system(size: 9, weight: .bold, design: .rounded))
                        .foregroundColor(brandDeep.opacity(0.5))
                        .lineLimit(1)
                }
                .frame(width: 48)
                .padding(.trailing, 4)

                // Middle: label + timer (centered)
                VStack(alignment: .center, spacing: 1) {
                    Text(smartLabel(nextNap: context.state.nextNap, timerType: context.attributes.timerType))
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(brandDeep.opacity(0.45))
                    Text(context.state.startTime, style: .timer)
                        .font(.system(size: 26, weight: .heavy, design: .rounded))
                        .foregroundColor(brandDeep)
                        .monospacedDigit()
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity, alignment: .center)
                    if let side = context.state.side {
                        Text("\(side.capitalized) side")
                            .font(.system(size: 9, weight: .medium))
                            .foregroundColor(brandDeep.opacity(0.35))
                    }
                }
                .frame(maxWidth: .infinity, alignment: .center)

                // Right: stop button
                Link(destination: URL(string: "obubba://?action=stop_timer")!) {
                    ZStack {
                        Circle()
                            .fill(brandRose.opacity(0.12))
                            .frame(width: 34, height: 34)
                        Image(systemName: "stop.fill")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(brandRose)
                    }
                }
                .frame(width: 48)
                .padding(.leading, 4)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(
                LinearGradient(
                    colors: [brandBg, brandCream],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )

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
                        Text(smartLabel(nextNap: context.state.nextNap, timerType: context.attributes.timerType))
                            .font(.system(size: 14, weight: .bold, design: .rounded))
                        if let side = context.state.side {
                            Text("\(side.capitalized) side")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.startTime, style: .timer)
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundColor(brandRose)
                        .monospacedDigit()
                }
            } compactLeading: {
                Image(systemName: timerIcon(context.attributes.timerType))
                    .foregroundColor(brandRose)
                    .font(.system(size: 12))
            } compactTrailing: {
                Text(context.state.startTime, style: .timer)
                    .font(.system(.caption2, design: .rounded))
                    .foregroundColor(brandRose)
                    .bold()
                    .monospacedDigit()
                    .frame(maxWidth: 52)
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
        label.lowercased().contains("bed") ? "moon.stars.fill" : "moon.zzz.fill"
    }

    var body: some WidgetConfiguration {
        ActivityConfiguration(for: OBubbaPredictionAttributes.self) { context in
            // ── Lock Screen / Notification Banner ──
            HStack(spacing: 0) {
                // Left: icon + baby name
                VStack(spacing: 2) {
                    ZStack {
                        Circle()
                            .fill(brandRose.opacity(0.15))
                            .frame(width: 34, height: 34)
                        Image(systemName: predIcon(context.state.label))
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(brandRose)
                    }
                    Text(context.attributes.babyName)
                        .font(.system(size: 9, weight: .bold, design: .rounded))
                        .foregroundColor(brandDeep.opacity(0.5))
                        .lineLimit(1)
                }
                .frame(width: 48)
                .padding(.trailing, 4)

                // Middle: label + time + countdown (centered)
                VStack(alignment: .center, spacing: 1) {
                    Text(context.state.label)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(brandDeep.opacity(0.45))
                    Text(context.state.timeFormatted)
                        .font(.system(size: 26, weight: .heavy, design: .rounded))
                        .foregroundColor(brandDeep)
                    Text(context.state.targetTime, style: .timer)
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundColor(brandPurple)
                        .monospacedDigit()
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity, alignment: .center)
                }
                .frame(maxWidth: .infinity, alignment: .center)

                // Right: start button — begins the predicted nap/bedtime
                Link(destination: URL(string: context.state.label.lowercased().contains("bed")
                    ? "obubba://?action=start_bedtime"
                    : "obubba://?action=toggle_nap")!) {
                    ZStack {
                        Circle()
                            .fill(brandPurple.opacity(0.12))
                            .frame(width: 34, height: 34)
                        Image(systemName: "play.fill")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(brandPurple)
                    }
                }
                .frame(width: 48)
                .padding(.leading, 4)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(
                LinearGradient(
                    colors: [brandBg, brandCream],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )

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
                            .font(.system(size: 22, weight: .heavy, design: .rounded))
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.targetTime, style: .timer)
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundColor(brandPurple)
                        .monospacedDigit()
                }
            } compactLeading: {
                Image(systemName: predIcon(context.state.label))
                    .foregroundColor(brandPurple)
                    .font(.system(size: 12))
            } compactTrailing: {
                Text(context.state.timeFormatted)
                    .font(.system(.caption2, design: .rounded))
                    .foregroundColor(brandPurple)
                    .bold()
                    .monospacedDigit()
                    .frame(maxWidth: 52)
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
    }
}

@available(iOS 16.0, *)
struct OBubbaLockScreenAccessoryWidget: Widget {
    let kind: String = "OBubbaLockScreen"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: OBubbaTimelineProvider()) { entry in
            if #available(iOS 16.0, *) {
                OBubbaLockScreenRectangular(entry: entry)
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
}
