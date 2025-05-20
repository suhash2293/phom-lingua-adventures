
# Android Implementation Steps for Google Play Billing

After generating the Android project with Capacitor, follow these steps to implement Google Play Billing:

1. Add Google Play Billing Library to your Android project:

Add this to your app-level build.gradle dependencies:
```gradle
implementation 'com.android.billingclient:billing:6.2.0'
```

2. Create a BillingPlugin class to bridge between Capacitor and native Android:

```java
package app.lovable.phomshah;

import android.app.Activity;
import com.android.billingclient.api.*;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PluginMethod;

import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "GooglePlayBilling")
public class GooglePlayBillingPlugin extends Plugin {
    private BillingClient billingClient;
    private boolean isServiceConnected = false;
    
    @PluginMethod
    public void initialize(PluginCall call) {
        // Initialize billing client
        billingClient = BillingClient.newBuilder(getContext())
                .setListener((billingResult, purchases) -> {
                    // Handle purchase updates
                })
                .enablePendingPurchases()
                .build();
                
        connectToPlayBilling(call);
    }
    
    private void connectToPlayBilling(final PluginCall call) {
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    isServiceConnected = true;
                    JSObject result = new JSObject();
                    result.put("connected", true);
                    call.resolve(result);
                } else {
                    call.reject("Billing setup failed: " + billingResult.getDebugMessage());
                }
            }
            
            @Override
            public void onBillingServiceDisconnected() {
                isServiceConnected = false;
            }
        });
    }
    
    @PluginMethod
    public void purchaseDonation(PluginCall call) {
        if (!isServiceConnected) {
            call.reject("Billing service not connected");
            return;
        }
        
        String productId = call.getString("productId");
        if (productId == null) {
            call.reject("Product ID is required");
            return;
        }
        
        List<QueryProductDetailsParams.Product> productList = new ArrayList<>();
        productList.add(QueryProductDetailsParams.Product.newBuilder()
                .setProductId(productId)
                .setProductType(BillingClient.ProductType.INAPP)
                .build());

        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(productList)
                .build();
                
        billingClient.queryProductDetailsAsync(params, (billingResult, productDetailsList) -> {
            if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                call.reject("Failed to get product details: " + billingResult.getDebugMessage());
                return;
            }
            
            if (productDetailsList.isEmpty()) {
                call.reject("Product not found: " + productId);
                return;
            }
            
            Activity activity = getActivity();
            ProductDetails productDetails = productDetailsList.get(0);
            
            List<BillingFlowParams.ProductDetailsParams> productDetailsParamsList = new ArrayList<>();
            productDetailsParamsList.add(
                    BillingFlowParams.ProductDetailsParams.newBuilder()
                            .setProductDetails(productDetails)
                            .build()
            );
            
            BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(productDetailsParamsList)
                    .build();
                    
            billingClient.launchBillingFlow(activity, billingFlowParams);
        });
    }
    
    @PluginMethod
    public void acknowledgePurchase(PluginCall call) {
        String purchaseToken = call.getString("purchaseToken");
        if (purchaseToken == null) {
            call.reject("Purchase token is required");
            return;
        }
        
        AcknowledgePurchaseParams params = AcknowledgePurchaseParams.newBuilder()
                .setPurchaseToken(purchaseToken)
                .build();
                
        billingClient.acknowledgePurchase(params, billingResult -> {
            if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                JSObject result = new JSObject();
                result.put("acknowledged", true);
                call.resolve(result);
            } else {
                call.reject("Failed to acknowledge purchase: " + billingResult.getDebugMessage());
            }
        });
    }
}
```

3. Register the donation products in Google Play Console:

For each donation tier, create a consumable in-app product with the following IDs:
- donation_1
- donation_5
- donation_10
- donation_20
- donation_50
- donation_100
- donation_200
- donation_500
- donation_1000
- donation_2000
- donation_5000
- donation_10000

4. Add the required billing permission to AndroidManifest.xml:

```xml
<uses-permission android:name="com.android.vending.BILLING" />
```

5. Update capacitor.config.ts to include plugin configuration:

```typescript
plugins: {
  GooglePlayBilling: {
    // Any plugin configuration options can go here
  }
}
```
