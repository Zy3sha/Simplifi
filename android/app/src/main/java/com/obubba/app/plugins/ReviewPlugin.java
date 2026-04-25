package com.obubba.app.plugins;

import android.app.Activity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.play.core.review.ReviewInfo;
import com.google.android.play.core.review.ReviewManager;
import com.google.android.play.core.review.ReviewManagerFactory;

/**
 * Capacitor plugin for Google Play In-App Review.
 * Google controls frequency and won't show if user already reviewed.
 */
@CapacitorPlugin(name = "OBReview")
public class ReviewPlugin extends Plugin {

    @PluginMethod
    public void requestReview(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            JSObject ret = new JSObject();
            ret.put("requested", false);
            call.resolve(ret);
            return;
        }

        ReviewManager manager = ReviewManagerFactory.create(activity);
        manager.requestReviewFlow().addOnCompleteListener(task -> {
            if (task.isSuccessful()) {
                ReviewInfo reviewInfo = task.getResult();
                manager.launchReviewFlow(activity, reviewInfo).addOnCompleteListener(flowTask -> {
                    JSObject ret = new JSObject();
                    ret.put("requested", true);
                    call.resolve(ret);
                });
            } else {
                JSObject ret = new JSObject();
                ret.put("requested", false);
                call.resolve(ret);
            }
        });
    }
}
