package com.obubba.app.plugins

import android.app.Activity
import android.util.Log
import com.android.billingclient.api.*
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * Capacitor plugin for Google Play Billing (In-App Subscriptions & Purchases).
 * Mirrors the iOS StorePlugin interface: getProducts, purchase, restore, getEntitlements.
 * Uses Google Play Billing Library v7.
 */
@CapacitorPlugin(name = "OBStore")
class StorePlugin : Plugin(), PurchasesUpdatedListener {

    companion object {
        private const val TAG = "OBStore"
    }

    // Product IDs -- must match Google Play Console
    private val productIds = listOf(
        "com.obubba.premium.monthly",
        "com.obubba.premium.annual",
        "com.obubba.premium.lifetime"
    )

    // Subscription product IDs (auto-renewable)
    private val subscriptionIds = setOf(
        "com.obubba.premium.monthly",
        "com.obubba.premium.annual"
    )

    // In-app (one-time) product IDs
    private val inAppIds = setOf(
        "com.obubba.premium.lifetime"
    )

    private lateinit var billingClient: BillingClient
    private var pendingPurchaseCall: PluginCall? = null

    // Cache product details after loading
    private var cachedProductDetails: MutableMap<String, ProductDetails> = mutableMapOf()

    override fun load() {
        billingClient = BillingClient.newBuilder(context)
            .setListener(this)
            .enablePendingPurchases()
            .build()

        // Connect eagerly so products are ready when needed
        ensureConnected {}
    }

    // ── Connection helper ──────────────────────────────────────────

    private fun ensureConnected(onReady: () -> Unit) {
        if (billingClient.isReady) {
            onReady()
            return
        }
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
                if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                    Log.d(TAG, "Billing client connected")
                    onReady()
                } else {
                    Log.e(TAG, "Billing setup failed: ${result.debugMessage}")
                }
            }

            override fun onBillingServiceDisconnected() {
                Log.w(TAG, "Billing service disconnected")
            }
        })
    }

    // ── getProducts ────────────────────────────────────────────────
    // Returns product info with prices, matching iOS format:
    // { products: [{ id, displayName, description, displayPrice, price, type, period, periodValue }] }

    @PluginMethod
    fun getProducts(call: PluginCall) {
        ensureConnected {
            queryAllProducts(call)
        }
    }

    private fun queryAllProducts(call: PluginCall) {
        val allProducts = mutableListOf<JSObject>()
        var queriesRemaining = 2 // subs + inapp

        // Query subscriptions
        val subParams = QueryProductDetailsParams.newBuilder()
            .setProductList(
                subscriptionIds.map { id ->
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(id)
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build()
                }
            )
            .build()

        billingClient.queryProductDetailsAsync(subParams) { result, detailsList ->
            if (result.responseCode == BillingClient.BillingResponseCode.OK && detailsList != null) {
                for (details in detailsList) {
                    cachedProductDetails[details.productId] = details
                    allProducts.add(productDetailsToJS(details))
                }
            }
            synchronized(this) {
                queriesRemaining--
                if (queriesRemaining == 0) {
                    resolveProducts(call, allProducts)
                }
            }
        }

        // Query in-app (lifetime)
        val inAppParams = QueryProductDetailsParams.newBuilder()
            .setProductList(
                inAppIds.map { id ->
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(id)
                        .setProductType(BillingClient.ProductType.INAPP)
                        .build()
                }
            )
            .build()

        billingClient.queryProductDetailsAsync(inAppParams) { result, detailsList ->
            if (result.responseCode == BillingClient.BillingResponseCode.OK && detailsList != null) {
                for (details in detailsList) {
                    cachedProductDetails[details.productId] = details
                    allProducts.add(productDetailsToJS(details))
                }
            }
            synchronized(this) {
                queriesRemaining--
                if (queriesRemaining == 0) {
                    resolveProducts(call, allProducts)
                }
            }
        }
    }

    private fun resolveProducts(call: PluginCall, products: List<JSObject>) {
        val ret = JSObject()
        val arr = JSArray()
        for (p in products) {
            arr.put(p)
        }
        ret.put("products", arr)
        Log.d(TAG, "Loaded ${products.size} products")
        call.resolve(ret)
    }

    private fun productDetailsToJS(details: ProductDetails): JSObject {
        val obj = JSObject()
        obj.put("id", details.productId)
        obj.put("displayName", details.name)
        obj.put("description", details.description)

        if (details.productType == BillingClient.ProductType.SUBS) {
            obj.put("type", "subscription")
            // Use the first pricing phase of the first offer (base plan)
            val offer = details.subscriptionOfferDetails?.firstOrNull()
            val pricingPhase = offer?.pricingPhases?.pricingPhaseList?.firstOrNull()
            if (pricingPhase != null) {
                obj.put("displayPrice", pricingPhase.formattedPrice)
                obj.put("price", pricingPhase.priceAmountMicros / 1_000_000.0)
                // Parse billing period (ISO 8601 duration: P1M, P1Y, etc.)
                val period = pricingPhase.billingPeriod
                when {
                    period.contains("Y") -> {
                        obj.put("period", "annual")
                        obj.put("periodValue", 1)
                    }
                    period.contains("M") -> {
                        obj.put("period", "monthly")
                        obj.put("periodValue", 1)
                    }
                    else -> {
                        obj.put("period", "other")
                        obj.put("periodValue", 1)
                    }
                }
            }
        } else {
            // In-app product (lifetime)
            obj.put("type", "nonConsumable")
            val oneTimePurchaseOfferDetails = details.oneTimePurchaseOfferDetails
            if (oneTimePurchaseOfferDetails != null) {
                obj.put("displayPrice", oneTimePurchaseOfferDetails.formattedPrice)
                obj.put("price", oneTimePurchaseOfferDetails.priceAmountMicros / 1_000_000.0)
            }
        }

        return obj
    }

    // ── purchase ───────────────────────────────────────────────────
    // Expects { productId: "com.obubba.premium.monthly" }
    // Returns { success, productId, isPremium } or { success: false, cancelled: true }

    @PluginMethod
    fun purchase(call: PluginCall) {
        val productId = call.getString("productId")
        if (productId == null) {
            call.reject("productId is required")
            return
        }

        ensureConnected {
            launchPurchaseFlow(call, productId)
        }
    }

    private fun launchPurchaseFlow(call: PluginCall, productId: String) {
        val details = cachedProductDetails[productId]
        if (details == null) {
            // Product not cached yet -- query first
            val productType = if (subscriptionIds.contains(productId))
                BillingClient.ProductType.SUBS else BillingClient.ProductType.INAPP

            val params = QueryProductDetailsParams.newBuilder()
                .setProductList(
                    listOf(
                        QueryProductDetailsParams.Product.newBuilder()
                            .setProductId(productId)
                            .setProductType(productType)
                            .build()
                    )
                )
                .build()

            billingClient.queryProductDetailsAsync(params) { result, detailsList ->
                if (result.responseCode == BillingClient.BillingResponseCode.OK && detailsList != null) {
                    val fetched = detailsList.firstOrNull()
                    if (fetched != null) {
                        cachedProductDetails[productId] = fetched
                        startBillingFlow(call, fetched)
                    } else {
                        call.reject("Product not found: $productId")
                    }
                } else {
                    call.reject("Failed to query product: ${result.debugMessage}")
                }
            }
        } else {
            startBillingFlow(call, details)
        }
    }

    private fun startBillingFlow(call: PluginCall, details: ProductDetails) {
        val activity = activity
        if (activity == null) {
            call.reject("Activity not available")
            return
        }

        pendingPurchaseCall = call

        val productDetailsParamsBuilder = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(details)

        // For subscriptions, we must set the offer token
        if (details.productType == BillingClient.ProductType.SUBS) {
            val offerToken = details.subscriptionOfferDetails?.firstOrNull()?.offerToken
            if (offerToken != null) {
                productDetailsParamsBuilder.setOfferToken(offerToken)
            }
        }

        val flowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(listOf(productDetailsParamsBuilder.build()))
            .build()

        val result = billingClient.launchBillingFlow(activity, flowParams)
        if (result.responseCode != BillingClient.BillingResponseCode.OK) {
            pendingPurchaseCall = null
            call.reject("Failed to launch billing flow: ${result.debugMessage}")
        }
    }

    // ── PurchasesUpdatedListener callback ──────────────────────────

    override fun onPurchasesUpdated(result: BillingResult, purchases: MutableList<Purchase>?) {
        val call = pendingPurchaseCall
        pendingPurchaseCall = null

        when (result.responseCode) {
            BillingClient.BillingResponseCode.OK -> {
                if (purchases != null && purchases.isNotEmpty()) {
                    // Acknowledge/consume all purchases
                    for (purchase in purchases) {
                        handlePurchase(purchase, call)
                    }
                } else {
                    call?.resolve(JSObject().apply {
                        put("success", false)
                        put("isPremium", false)
                    })
                }
            }
            BillingClient.BillingResponseCode.USER_CANCELED -> {
                Log.d(TAG, "Purchase cancelled by user")
                call?.resolve(JSObject().apply {
                    put("success", false)
                    put("cancelled", true)
                    put("isPremium", false)
                })
            }
            BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED -> {
                Log.d(TAG, "Item already owned")
                setPremiumFlag(true)
                call?.resolve(JSObject().apply {
                    put("success", true)
                    put("isPremium", true)
                })
            }
            else -> {
                Log.e(TAG, "Purchase error: ${result.responseCode} - ${result.debugMessage}")
                call?.reject("Purchase failed: ${result.debugMessage}")
            }
        }
    }

    private fun handlePurchase(purchase: Purchase, call: PluginCall?) {
        if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
            // Acknowledge the purchase if not already acknowledged
            if (!purchase.isAcknowledged) {
                val ackParams = AcknowledgePurchaseParams.newBuilder()
                    .setPurchaseToken(purchase.purchaseToken)
                    .build()

                billingClient.acknowledgePurchase(ackParams) { ackResult ->
                    if (ackResult.responseCode == BillingClient.BillingResponseCode.OK) {
                        Log.d(TAG, "Purchase acknowledged: ${purchase.products}")
                        setPremiumFlag(true)
                        call?.resolve(JSObject().apply {
                            put("success", true)
                            put("productId", purchase.products.firstOrNull() ?: "")
                            put("isPremium", true)
                        })
                    } else {
                        Log.e(TAG, "Acknowledge failed: ${ackResult.debugMessage}")
                        // Still grant premium -- acknowledgement can be retried
                        setPremiumFlag(true)
                        call?.resolve(JSObject().apply {
                            put("success", true)
                            put("productId", purchase.products.firstOrNull() ?: "")
                            put("isPremium", true)
                        })
                    }
                }
            } else {
                setPremiumFlag(true)
                call?.resolve(JSObject().apply {
                    put("success", true)
                    put("productId", purchase.products.firstOrNull() ?: "")
                    put("isPremium", true)
                })
            }
        } else if (purchase.purchaseState == Purchase.PurchaseState.PENDING) {
            Log.d(TAG, "Purchase pending")
            call?.resolve(JSObject().apply {
                put("success", false)
                put("pending", true)
                put("isPremium", false)
            })
        } else {
            call?.resolve(JSObject().apply {
                put("success", false)
                put("isPremium", false)
            })
        }
    }

    // ── restore ────────────────────────────────────────────────────
    // Queries Google Play for existing purchases. Returns { isPremium: bool }

    @PluginMethod
    fun restore(call: PluginCall) {
        ensureConnected {
            checkAllPurchases { hasPremium ->
                setPremiumFlag(hasPremium)
                Log.d(TAG, "Restore complete, isPremium: $hasPremium")
                call.resolve(JSObject().apply {
                    put("isPremium", hasPremium)
                })
            }
        }
    }

    // ── getEntitlements ────────────────────────────────────────────
    // Check current active entitlements. Returns { isPremium: bool }

    @PluginMethod
    fun getEntitlements(call: PluginCall) {
        ensureConnected {
            checkAllPurchases { hasPremium ->
                setPremiumFlag(hasPremium)
                call.resolve(JSObject().apply {
                    put("isPremium", hasPremium)
                })
            }
        }
    }

    // ── Internal helpers ───────────────────────────────────────────

    /**
     * Check both subscription and in-app purchases for any active premium entitlement.
     */
    private fun checkAllPurchases(callback: (Boolean) -> Unit) {
        var hasPremium = false
        var queriesRemaining = 2

        // Check subscriptions
        val subParams = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.SUBS)
            .build()

        billingClient.queryPurchasesAsync(subParams) { result, purchases ->
            if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                for (purchase in purchases) {
                    if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                        for (product in purchase.products) {
                            if (productIds.contains(product)) {
                                hasPremium = true
                                // Acknowledge if needed
                                acknowledgePurchaseIfNeeded(purchase)
                            }
                        }
                    }
                }
            }
            synchronized(this) {
                queriesRemaining--
                if (queriesRemaining == 0) {
                    callback(hasPremium)
                }
            }
        }

        // Check in-app purchases (lifetime)
        val inAppParams = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.INAPP)
            .build()

        billingClient.queryPurchasesAsync(inAppParams) { result, purchases ->
            if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                for (purchase in purchases) {
                    if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                        for (product in purchase.products) {
                            if (productIds.contains(product)) {
                                hasPremium = true
                                acknowledgePurchaseIfNeeded(purchase)
                            }
                        }
                    }
                }
            }
            synchronized(this) {
                queriesRemaining--
                if (queriesRemaining == 0) {
                    callback(hasPremium)
                }
            }
        }
    }

    private fun acknowledgePurchaseIfNeeded(purchase: Purchase) {
        if (!purchase.isAcknowledged && purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
            val ackParams = AcknowledgePurchaseParams.newBuilder()
                .setPurchaseToken(purchase.purchaseToken)
                .build()
            billingClient.acknowledgePurchase(ackParams) { result ->
                if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                    Log.d(TAG, "Retroactively acknowledged: ${purchase.products}")
                } else {
                    Log.w(TAG, "Failed to acknowledge: ${result.debugMessage}")
                }
            }
        }
    }

    /**
     * Persist premium status to SharedPreferences so it survives restarts.
     */
    private fun setPremiumFlag(isPremium: Boolean) {
        context.getSharedPreferences("obubba_prefs", android.content.Context.MODE_PRIVATE)
            .edit()
            .putBoolean("ob_premium", isPremium)
            .apply()
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        if (::billingClient.isInitialized) {
            billingClient.endConnection()
        }
    }
}
