import UIKit
import Capacitor
import WebKit

class OBubbaBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(CareCardPlugin())
        bridge?.registerPluginInstance(DisableBouncePlugin())
        bridge?.registerPluginInstance(LiveActivityPlugin())
        bridge?.registerPluginInstance(SiriShortcutsPlugin())
        bridge?.registerPluginInstance(WidgetBridgePlugin())
        bridge?.registerPluginInstance(TravelTimePlugin())
        bridge?.registerPluginInstance(StorePlugin())
        bridge?.registerPluginInstance(ReviewPlugin())
    }

    override open func viewDidLoad() {
        super.viewDidLoad()
        disableBounce()
        // Match the splash/launch screen background so the WebView doesn't flash white
        view.backgroundColor = UIColor(red: 0.941, green: 0.867, blue: 0.839, alpha: 1.0)
        webView?.isOpaque = false
        webView?.backgroundColor = UIColor(red: 0.941, green: 0.867, blue: 0.839, alpha: 1.0)
        webView?.scrollView.backgroundColor = UIColor(red: 0.941, green: 0.867, blue: 0.839, alpha: 1.0)
    }

    override open func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        disableBounce()
    }

    private func disableBounce() {
        guard let wv = webView else { return }
        wv.scrollView.bounces = false
        wv.scrollView.alwaysBounceVertical = false
        wv.scrollView.alwaysBounceHorizontal = false
        wv.scrollView.isDirectionalLockEnabled = true
        wv.scrollView.contentInsetAdjustmentBehavior = .never
        // Disable back/forward swipe navigation — prevents page "sliding" sideways
        wv.allowsBackForwardNavigationGestures = false
    }
}
