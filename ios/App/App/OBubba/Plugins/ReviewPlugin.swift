import Foundation
import Capacitor
import StoreKit

/// Capacitor plugin for native in-app review prompts.
/// Uses SKStoreReviewController on iOS — Apple controls frequency
/// (max 3 times per 365-day period) and won't show if user already reviewed.
@objc(OBReview)
public class ReviewPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "OBReview"
    public let jsName = "OBReview"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestReview", returnType: CAPPluginReturnPromise),
    ]

    @objc func requestReview(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if #available(iOS 16.0, *) {
                if let scene = UIApplication.shared.connectedScenes
                    .first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene {
                    SKStoreReviewController.requestReview(in: scene)
                }
            } else if #available(iOS 14.0, *) {
                if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
                    SKStoreReviewController.requestReview(in: scene)
                }
            }
            call.resolve(["requested": true])
        }
    }
}
