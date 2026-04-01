import Foundation
import Capacitor
import StoreKit

/// Capacitor plugin for StoreKit 2 In-App Purchases.
/// Handles product loading, purchasing, restoring, and entitlement checking.
@objc(OBStore)
public class StorePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "OBStore"
    public let jsName = "OBStore"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getEntitlements", returnType: CAPPluginReturnPromise),
    ]

    // Product IDs — must match App Store Connect
    private let productIds: Set<String> = [
        "com.obubba.premium.monthly",
        "com.obubba.premium.annual",
        "com.obubba.premium.lifetime"
    ]

    /// Fetch products from App Store and return pricing info
    @objc func getProducts(_ call: CAPPluginCall) {
        Task {
            do {
                let products = try await Product.products(for: productIds)
                var result: [[String: Any]] = []
                for product in products {
                    var info: [String: Any] = [
                        "id": product.id,
                        "displayName": product.displayName,
                        "description": product.description,
                        "displayPrice": product.displayPrice,
                        "price": NSDecimalNumber(decimal: product.price).doubleValue,
                        "type": product.type == .autoRenewable ? "subscription" : "nonConsumable"
                    ]
                    // Add subscription period info
                    if let sub = product.subscription {
                        let period = sub.subscriptionPeriod
                        switch period.unit {
                        case .month: info["period"] = "monthly"
                        case .year: info["period"] = "annual"
                        default: info["period"] = "other"
                        }
                        info["periodValue"] = period.value
                    }
                    result.append(info)
                }
                print("[OBStore] Loaded \(result.count) products")
                call.resolve(["products": result])
            } catch {
                print("[OBStore] Failed to load products: \(error)")
                call.reject("Failed to load products: \(error.localizedDescription)")
            }
        }
    }

    /// Purchase a product by ID
    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId is required")
            return
        }

        Task {
            do {
                let products = try await Product.products(for: [productId])
                guard let product = products.first else {
                    call.reject("Product not found: \(productId)")
                    return
                }

                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    switch verification {
                    case .verified(let transaction):
                        await transaction.finish()
                        // Persist premium status
                        UserDefaults.standard.set(true, forKey: "ob_premium")
                        print("[OBStore] Purchase verified: \(transaction.productID)")
                        call.resolve([
                            "success": true,
                            "productId": transaction.productID,
                            "isPremium": true
                        ])
                    case .unverified(_, let error):
                        print("[OBStore] Purchase unverified: \(error)")
                        call.reject("Purchase verification failed")
                    }
                case .userCancelled:
                    call.resolve(["success": false, "cancelled": true, "isPremium": false])
                case .pending:
                    call.resolve(["success": false, "pending": true, "isPremium": false])
                @unknown default:
                    call.resolve(["success": false, "isPremium": false])
                }
            } catch {
                print("[OBStore] Purchase error: \(error)")
                call.reject("Purchase failed: \(error.localizedDescription)")
            }
        }
    }

    /// Restore purchases and check entitlements
    @objc func restore(_ call: CAPPluginCall) {
        Task {
            do {
                // Sync with App Store
                try await AppStore.sync()
                let hasPremium = await checkPremiumEntitlement()
                UserDefaults.standard.set(hasPremium, forKey: "ob_premium")
                print("[OBStore] Restore complete, isPremium: \(hasPremium)")
                call.resolve(["isPremium": hasPremium])
            } catch {
                print("[OBStore] Restore error: \(error)")
                call.reject("Restore failed: \(error.localizedDescription)")
            }
        }
    }

    /// Check current entitlements (for app launch / resume)
    @objc func getEntitlements(_ call: CAPPluginCall) {
        Task {
            let hasPremium = await checkPremiumEntitlement()
            UserDefaults.standard.set(hasPremium, forKey: "ob_premium")
            call.resolve(["isPremium": hasPremium])
        }
    }

    /// Internal: check if user has any active premium entitlement
    private func checkPremiumEntitlement() async -> Bool {
        for await result in Transaction.currentEntitlements {
            switch result {
            case .verified(let transaction):
                if productIds.contains(transaction.productID) {
                    // For subscriptions, check not expired/revoked
                    if transaction.revocationDate == nil {
                        return true
                    }
                }
            case .unverified:
                continue
            }
        }
        return false
    }
}
