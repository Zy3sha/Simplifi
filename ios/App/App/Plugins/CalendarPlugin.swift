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
    ]

    private let eventStore = EKEventStore()

    @objc func addEvent(_ call: CAPPluginCall) {
        guard let date = call.getString("date"), !date.isEmpty else {
            call.reject("date is required")
            return
        }

        DispatchQueue.main.async {
            let allDay = call.getBool("allDay") ?? false
            let startDate = self.makeDate(date: date, time: allDay ? "00:00" : (call.getString("time") ?? "09:00"))
            guard let startDate else {
                call.reject("Invalid start date")
                return
            }

            let endDate = self.makeEndDate(
                startDate: startDate,
                endDate: call.getString("endDate") ?? date,
                endTime: call.getString("endTime"),
                allDay: allDay
            )

            let event = EKEvent(eventStore: self.eventStore)
            event.title = call.getString("title") ?? "OBubba appointment"
            event.startDate = startDate
            event.endDate = endDate
            event.isAllDay = allDay
            event.location = call.getString("location") ?? ""
            event.notes = call.getString("note") ?? ""

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

    public func eventEditViewController(_ controller: EKEventEditViewController, didCompleteWith action: EKEventEditViewAction) {
        controller.dismiss(animated: true)
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
