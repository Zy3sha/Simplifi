import Foundation
import Capacitor
import WebKit

@objc(DisableBounce)
public class DisableBouncePlugin: CAPPlugin, CAPBridgedPlugin, UIScrollViewDelegate {
    public let identifier = "DisableBounce"
    public let jsName = "DisableBounce"
    public let pluginMethods: [CAPPluginMethod] = []

    override public func load() {
        DispatchQueue.main.async { [weak self] in
            guard let webView = self?.bridge?.webView else { return }
            let sv = webView.scrollView
            sv.bounces = false
            sv.alwaysBounceVertical = false
            sv.alwaysBounceHorizontal = false
            sv.isDirectionalLockEnabled = true
            sv.showsHorizontalScrollIndicator = false
            sv.contentInsetAdjustmentBehavior = .never
            // Set delegate to prevent horizontal scroll entirely
            sv.delegate = self
        }
    }

    // Prevent any horizontal scrolling — lock contentOffset.x to 0
    public func scrollViewDidScroll(_ scrollView: UIScrollView) {
        if scrollView.contentOffset.x != 0 {
            scrollView.contentOffset.x = 0
        }
    }
}
