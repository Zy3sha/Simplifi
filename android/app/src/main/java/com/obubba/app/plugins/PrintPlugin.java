package com.obubba.app.plugins;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.CancellationSignal;
import android.os.ParcelFileDescriptor;
import android.print.PageRange;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintDocumentInfo;
import android.print.PrintManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import androidx.core.content.FileProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

@CapacitorPlugin(name = "OBCareCard")
public class PrintPlugin extends Plugin {

    @PluginMethod
    public void printHTML(PluginCall call) {
        String html = call.getString("html");
        String jobName = call.getString("jobName", "OBubba Document");
        if (html == null) { call.reject("html required"); return; }

        getActivity().runOnUiThread(() -> {
            try {
                WebView webView = new WebView(getContext());
                webView.getSettings().setJavaScriptEnabled(true);
                webView.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        try {
                            PrintManager printManager = (PrintManager) getContext().getSystemService(Context.PRINT_SERVICE);
                            PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(jobName);
                            printManager.print(jobName, adapter, new PrintAttributes.Builder().build());
                            call.resolve();
                        } catch (Exception e) {
                            call.reject("Print failed: " + e.getMessage());
                        }
                    }
                });
                webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
            } catch (Exception e) {
                call.reject("Print setup failed: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void generatePDF(PluginCall call) {
        String html = call.getString("html");
        String fileName = call.getString("fileName", "document.pdf");
        if (html == null) { call.reject("html required"); return; }

        getActivity().runOnUiThread(() -> {
            try {
                WebView webView = new WebView(getContext());
                webView.getSettings().setJavaScriptEnabled(true);
                webView.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        try {
                            PrintManager printManager = (PrintManager) getContext().getSystemService(Context.PRINT_SERVICE);
                            PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(fileName);

                            // Use print dialog which allows "Save as PDF" on Android
                            PrintAttributes attrs = new PrintAttributes.Builder()
                                .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                .setResolution(new PrintAttributes.Resolution("pdf", "PDF", 300, 300))
                                .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                                .build();

                            printManager.print(fileName.replace(".pdf", ""), adapter, attrs);

                            JSObject ret = new JSObject();
                            ret.put("success", true);
                            call.resolve(ret);
                        } catch (Exception e) {
                            call.reject("PDF generation failed: " + e.getMessage());
                        }
                    }
                });
                webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
            } catch (Exception e) {
                call.reject("PDF setup failed: " + e.getMessage());
            }
        });
    }
}
