package com.obubba.app.plugins;

import android.app.Activity;
import android.content.SharedPreferences;
import android.util.Log;
import androidx.annotation.NonNull;
import com.android.billingclient.api.*;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import com.getcapacitor.JSArray;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@CapacitorPlugin(name = "OBStore")
public class StorePlugin extends Plugin implements PurchasesUpdatedListener {

    private static final String TAG = "OBStore";
    // v1 kept for existing subscribers (Google grandfathers their price)
    private static final List<String> PRODUCT_IDS = Arrays.asList(
        "com.obubba.premium.monthly",
        "com.obubba.premium.annual",
        "com.obubba.premium.lifetime",
        "com.obubba.premium.monthly.v2",
        "com.obubba.premium.annual.v2",
        "com.obubba.premium.lifetime.v2"
    );
    private static final List<String> SUB_IDS = Arrays.asList(
        "com.obubba.premium.monthly",
        "com.obubba.premium.annual",
        "com.obubba.premium.monthly.v2",
        "com.obubba.premium.annual.v2"
    );
    private static final List<String> LIFETIME_IDS = Arrays.asList(
        "com.obubba.premium.lifetime",
        "com.obubba.premium.lifetime.v2"
    );

    private BillingClient billingClient;
    private PluginCall pendingPurchaseCall;
    private List<ProductDetails> cachedProducts = new ArrayList<>();
    private boolean billingConnecting = false;
    private final List<Runnable> billingConnectedQueue = new ArrayList<>();
    private final List<Runnable> billingFailedQueue = new ArrayList<>();

    @Override
    public void load() {
        billingClient = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder()
                    .enableOneTimeProducts()
                    .build()
            )
            .enableAutoServiceReconnection()
            .build();
        connectBilling(null);
    }

    private void connectBilling(Runnable onConnected) {
        connectBilling(onConnected, null);
    }

    private void connectBilling(Runnable onConnected, Runnable onFailed) {
        try {
            if (billingClient.isReady()) {
                if (onConnected != null) onConnected.run();
                return;
            }
            synchronized (this) {
                if (billingConnecting) {
                    if (onConnected != null) billingConnectedQueue.add(onConnected);
                    if (onFailed != null) billingFailedQueue.add(onFailed);
                    return;
                }
                billingConnecting = true;
            }
            billingClient.startConnection(new BillingClientStateListener() {
                @Override
                public void onBillingSetupFinished(@NonNull BillingResult result) {
                    try {
                        List<Runnable> successCallbacks = new ArrayList<>();
                        List<Runnable> failureCallbacks = new ArrayList<>();
                        synchronized (StorePlugin.this) {
                            billingConnecting = false;
                            if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                                if (onConnected != null) successCallbacks.add(onConnected);
                                successCallbacks.addAll(billingConnectedQueue);
                            } else {
                                if (onFailed != null) failureCallbacks.add(onFailed);
                                failureCallbacks.addAll(billingFailedQueue);
                            }
                            billingConnectedQueue.clear();
                            billingFailedQueue.clear();
                        }
                        if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                            Log.i(TAG, "Billing connected");
                            runCallbacks(successCallbacks);
                        } else {
                            Log.w(TAG, "Billing connect failed: " + result.getDebugMessage());
                            runCallbacks(failureCallbacks);
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Billing setup callback error", e);
                        if (onFailed != null) onFailed.run();
                    }
                }
                @Override
                public void onBillingServiceDisconnected() {
                    Log.w(TAG, "Billing disconnected");
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Billing connect error", e);
            List<Runnable> failureCallbacks = new ArrayList<>();
            synchronized (this) {
                billingConnecting = false;
                if (onFailed != null) failureCallbacks.add(onFailed);
                failureCallbacks.addAll(billingFailedQueue);
                billingConnectedQueue.clear();
                billingFailedQueue.clear();
            }
            runCallbacks(failureCallbacks);
        }
    }

    private void runCallbacks(List<Runnable> callbacks) {
        for (Runnable callback : callbacks) {
            try {
                if (callback != null) callback.run();
            } catch (Exception e) {
                Log.e(TAG, "Billing callback error", e);
            }
        }
    }

    @PluginMethod
    public void getProducts(PluginCall call) {
        connectBilling(() -> {
            // Query subscriptions
            QueryProductDetailsParams subParams = QueryProductDetailsParams.newBuilder()
                .setProductList(buildProductList(SUB_IDS, BillingClient.ProductType.SUBS))
                .build();

            QueryProductDetailsParams inappParams = QueryProductDetailsParams.newBuilder()
                .setProductList(buildProductList(LIFETIME_IDS, BillingClient.ProductType.INAPP))
                .build();

            billingClient.queryProductDetailsAsync(subParams, (subResult, subQueryResult) -> {
                billingClient.queryProductDetailsAsync(inappParams, (inappResult, inappQueryResult) -> {
                    cachedProducts.clear();
                    if (subResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        Log.w(TAG, "Subscription products query failed: " + subResult.getDebugMessage());
                    }
                    if (inappResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        Log.w(TAG, "In-app products query failed: " + inappResult.getDebugMessage());
                    }
                    List<ProductDetails> subDetails = productDetailsFrom(subQueryResult);
                    List<ProductDetails> inappDetails = productDetailsFrom(inappQueryResult);
                    if (subDetails != null) cachedProducts.addAll(subDetails);
                    if (inappDetails != null) cachedProducts.addAll(inappDetails);

                    JSArray products = new JSArray();
                    for (ProductDetails pd : cachedProducts) {
                        JSObject p = new JSObject();
                        p.put("id", pd.getProductId());
                        p.put("displayName", pd.getName());
                        p.put("description", pd.getDescription());

                        if (pd.getProductType().equals(BillingClient.ProductType.SUBS)) {
                            ProductDetails.PricingPhase phase = getDisplayPricingPhase(pd);
                            if (phase != null) {
                                p.put("displayPrice", phase.getFormattedPrice());
                                p.put("price", phase.getPriceAmountMicros() / 1_000_000.0);
                                p.put("currencyCode", phase.getPriceCurrencyCode());
                            }
                            p.put("type", "subscription");
                            p.put("period", periodForProduct(pd, phase));
                        } else {
                            ProductDetails.OneTimePurchaseOfferDetails otpd = pd.getOneTimePurchaseOfferDetails();
                            if (otpd != null) {
                                p.put("displayPrice", otpd.getFormattedPrice());
                                p.put("price", otpd.getPriceAmountMicros() / 1_000_000.0);
                                p.put("currencyCode", otpd.getPriceCurrencyCode());
                            }
                            p.put("type", "nonConsumable");
                            p.put("period", "lifetime");
                        }
                        products.put(p);
                    }

                    Log.i(TAG, "Loaded " + cachedProducts.size() + " products");
                    JSObject ret = new JSObject();
                    ret.put("products", products);
                    call.resolve(ret);
                });
            });
        }, () -> {
            JSObject ret = new JSObject();
            ret.put("products", new JSArray());
            ret.put("error", "billing_unavailable");
            call.resolve(ret);
        });
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String productId = call.getString("productId");
        if (productId == null) { call.reject("productId required"); return; }

        connectBilling(() -> {
            ProductDetails target = null;
            for (ProductDetails pd : cachedProducts) {
                if (pd.getProductId().equals(productId)) { target = pd; break; }
            }
            if (target != null) {
                launchPurchaseFlow(call, target);
            } else {
                // Product not cached — query on-demand before purchasing
                String productType = SUB_IDS.contains(productId)
                    ? BillingClient.ProductType.SUBS : BillingClient.ProductType.INAPP;
                QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                    .setProductList(Arrays.asList(
                        QueryProductDetailsParams.Product.newBuilder()
                            .setProductId(productId)
                            .setProductType(productType)
                            .build()))
                    .build();
                billingClient.queryProductDetailsAsync(params, (result, queryResult) -> {
                    List<ProductDetails> detailsList = productDetailsFrom(queryResult);
                    if (result.getResponseCode() == BillingClient.BillingResponseCode.OK
                            && detailsList != null && !detailsList.isEmpty()) {
                        ProductDetails fetched = detailsList.get(0);
                        cachedProducts.add(fetched);
                        launchPurchaseFlow(call, fetched);
                    } else {
                        call.reject("Product not found: " + productId);
                    }
                });
            }
        }, () -> call.reject("Billing unavailable"));
    }

    private ProductDetails.SubscriptionOfferDetails chooseOffer(ProductDetails target) {
        List<ProductDetails.SubscriptionOfferDetails> offers = target.getSubscriptionOfferDetails();
        if (offers == null || offers.isEmpty()) return null;

        String wantedPeriod = periodForProduct(target, null);
        ProductDetails.SubscriptionOfferDetails fallback = offers.get(0);
        for (ProductDetails.SubscriptionOfferDetails offer : offers) {
            List<ProductDetails.PricingPhase> phases = offer.getPricingPhases().getPricingPhaseList();
            if (phases == null || phases.isEmpty()) continue;
            for (ProductDetails.PricingPhase phase : phases) {
                String phasePeriod = periodForBillingPeriod(phase.getBillingPeriod());
                if (phase.getPriceAmountMicros() > 0 && phasePeriod.equals(wantedPeriod)) {
                    return offer;
                }
            }
        }
        return fallback;
    }

    private ProductDetails.PricingPhase getDisplayPricingPhase(ProductDetails target) {
        ProductDetails.SubscriptionOfferDetails offer = chooseOffer(target);
        if (offer == null || offer.getPricingPhases() == null) return null;
        List<ProductDetails.PricingPhase> phases = offer.getPricingPhases().getPricingPhaseList();
        if (phases == null || phases.isEmpty()) return null;

        String wantedPeriod = periodForProduct(target, null);
        ProductDetails.PricingPhase fallbackPaid = null;
        ProductDetails.PricingPhase lastPhase = phases.get(phases.size() - 1);
        for (ProductDetails.PricingPhase phase : phases) {
            if (phase.getPriceAmountMicros() > 0) {
                fallbackPaid = phase;
                if (periodForBillingPeriod(phase.getBillingPeriod()).equals(wantedPeriod)) {
                    return phase;
                }
            }
        }
        return fallbackPaid != null ? fallbackPaid : lastPhase;
    }

    private String periodForProduct(ProductDetails product, ProductDetails.PricingPhase phase) {
        String id = product.getProductId();
        if (id != null) {
            if (id.contains("lifetime")) return "lifetime";
            if (id.contains("annual") || id.contains("year")) return "annual";
            if (id.contains("monthly") || id.contains("month")) return "monthly";
        }
        if (phase != null) return periodForBillingPeriod(phase.getBillingPeriod());
        return "monthly";
    }

    private String periodForBillingPeriod(String billingPeriod) {
        if (billingPeriod == null) return "monthly";
        return billingPeriod.contains("Y") ? "annual" : "monthly";
    }

    private boolean isRecognizedPurchase(Purchase purchase, boolean lifetimeOnly) {
        if (purchase == null || purchase.getPurchaseState() != Purchase.PurchaseState.PURCHASED) return false;
        if (purchase.isSuspended()) return false;
        for (String pid : purchase.getProducts()) {
            if (lifetimeOnly) {
                if (LIFETIME_IDS.contains(pid)) return true;
            } else if (PRODUCT_IDS.contains(pid)) {
                return true;
            }
        }
        return false;
    }

    private void launchPurchaseFlow(PluginCall call, ProductDetails target) {
        Activity activity = getActivity();
        if (activity == null) { call.reject("Activity not available"); return; }

        pendingPurchaseCall = call;

        BillingFlowParams.ProductDetailsParams.Builder pdpBuilder =
            BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(target);

        if (target.getProductType().equals(BillingClient.ProductType.SUBS)) {
            ProductDetails.SubscriptionOfferDetails offer = chooseOffer(target);
            if (offer != null) {
                pdpBuilder.setOfferToken(offer.getOfferToken());
            }
        }

        BillingFlowParams flowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(Arrays.asList(pdpBuilder.build()))
            .build();

        BillingResult flowResult = billingClient.launchBillingFlow(activity, flowParams);
        if (flowResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
            pendingPurchaseCall = null;
            call.reject("Failed to launch billing: " + flowResult.getDebugMessage());
        }
    }

    @Override
    public void onPurchasesUpdated(@NonNull BillingResult result, List<Purchase> purchases) {
        if (result.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
            boolean foundPremium = false;
            for (Purchase purchase : purchases) {
                if (isRecognizedPurchase(purchase, false)) {
                    foundPremium = true;
                    acknowledgePurchase(purchase);
                }
            }
            setPremium(foundPremium);
            if (pendingPurchaseCall != null) {
                JSObject ret = new JSObject();
                ret.put("success", foundPremium);
                ret.put("isPremium", foundPremium);
                pendingPurchaseCall.resolve(ret);
                pendingPurchaseCall = null;
            }
        } else if (result.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            if (pendingPurchaseCall != null) {
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("cancelled", true);
                ret.put("isPremium", false);
                pendingPurchaseCall.resolve(ret);
                pendingPurchaseCall = null;
            }
        } else {
            if (pendingPurchaseCall != null) {
                pendingPurchaseCall.reject("Purchase failed: " + result.getDebugMessage());
                pendingPurchaseCall = null;
            }
        }
    }

    private void acknowledgePurchase(Purchase purchase) {
        if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED && !purchase.isAcknowledged()) {
            AcknowledgePurchaseParams params = AcknowledgePurchaseParams.newBuilder()
                .setPurchaseToken(purchase.getPurchaseToken())
                .build();
            billingClient.acknowledgePurchase(params, result ->
                Log.i(TAG, "Acknowledge: " + result.getResponseCode()));
        }
    }

    @PluginMethod
    public void restore(PluginCall call) {
        connectBilling(() -> {
            boolean[] found = {false};

            // Check subscriptions
            billingClient.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.SUBS).build(),
                (subResult, subPurchases) -> {
                    if (subPurchases != null) {
                        for (Purchase p : subPurchases) {
                            if (isRecognizedPurchase(p, false)) {
                                found[0] = true;
                                acknowledgePurchase(p);
                                break;
                            }
                        }
                    }

                    // Check in-app (lifetime)
                    billingClient.queryPurchasesAsync(
                        QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),
                        (inappResult, inappPurchases) -> {
                            if (inappPurchases != null) {
                                for (Purchase p : inappPurchases) {
                                    if (isRecognizedPurchase(p, true)) {
                                        found[0] = true;
                                        acknowledgePurchase(p);
                                        break;
                                    }
                                }
                            }

                            setPremium(found[0]);
                            Log.i(TAG, "Restore: isPremium=" + found[0]);
                            JSObject ret = new JSObject();
                            ret.put("isPremium", found[0]);
                            call.resolve(ret);
                        });
                });
        }, () -> {
            setPremium(false);
            JSObject ret = new JSObject();
            ret.put("isPremium", false);
            ret.put("error", "billing_unavailable");
            call.resolve(ret);
        });
    }

    @PluginMethod
    public void getEntitlements(PluginCall call) {
        restore(call); // Same logic — check active purchases
    }

    private void setPremium(boolean premium) {
        SharedPreferences prefs = getContext().getSharedPreferences("obubba_prefs", android.content.Context.MODE_PRIVATE);
        prefs.edit().putBoolean("ob_premium", premium).apply();
    }

    private List<QueryProductDetailsParams.Product> buildProductList(List<String> ids, String type) {
        List<QueryProductDetailsParams.Product> list = new ArrayList<>();
        for (String id : ids) {
            list.add(QueryProductDetailsParams.Product.newBuilder()
                .setProductId(id)
                .setProductType(type)
                .build());
        }
        return list;
    }

    private List<ProductDetails> productDetailsFrom(QueryProductDetailsResult queryResult) {
        if (queryResult == null || queryResult.getProductDetailsList() == null) return new ArrayList<>();
        return queryResult.getProductDetailsList();
    }
}
