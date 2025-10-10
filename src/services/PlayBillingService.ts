
/**
 * Service for handling Google Play Billing operations
 */
import { Capacitor } from '@capacitor/core';

interface DonationTier {
  id: string;
  amount: number;
  minAmount: number;
  maxAmount: number;
}

interface PurchaseResult {
  success: boolean;
  transactionData?: {
    orderId: string;
    productId: string;
    purchaseTime: number;
    purchaseToken: string;
    acknowledged: boolean;
  };
}

export class PlayBillingService {
  // Donation tiers according to Google Play requirements
  static DONATION_TIERS: DonationTier[] = [
    { id: 'donation_1', amount: 1, minAmount: 1, maxAmount: 1 },
    { id: 'donation_5', amount: 5, minAmount: 2, maxAmount: 7 },
    { id: 'donation_10', amount: 10, minAmount: 8, maxAmount: 14 },
    { id: 'donation_20', amount: 20, minAmount: 15, maxAmount: 29 },
    { id: 'donation_50', amount: 50, minAmount: 30, maxAmount: 74 },
    { id: 'donation_100', amount: 100, minAmount: 75, maxAmount: 149 },
    { id: 'donation_200', amount: 200, minAmount: 150, maxAmount: 299 },
    { id: 'donation_500', amount: 500, minAmount: 300, maxAmount: 749 },
    { id: 'donation_1000', amount: 1000, minAmount: 750, maxAmount: 1499 },
    { id: 'donation_2000', amount: 2000, minAmount: 1500, maxAmount: 2999 },
    { id: 'donation_5000', amount: 5000, minAmount: 3000, maxAmount: 7499 },
    { id: 'donation_10000', amount: 10000, minAmount: 7500, maxAmount: 14999 },
    // Extended tiers for much larger donations
    { id: 'donation_20000', amount: 20000, minAmount: 15000, maxAmount: 29999 },
    { id: 'donation_50000', amount: 50000, minAmount: 30000, maxAmount: 74999 },
    { id: 'donation_100000', amount: 100000, minAmount: 75000, maxAmount: 149999 },
    { id: 'donation_200000', amount: 200000, minAmount: 150000, maxAmount: 299999 },
    { id: 'donation_500000', amount: 500000, minAmount: 300000, maxAmount: 749999 },
    { id: 'donation_1000000', amount: 1000000, minAmount: 750000, maxAmount: 1499999 },
    { id: 'donation_2000000', amount: 2000000, minAmount: 1500000, maxAmount: 2999999 },
    { id: 'donation_5000000', amount: 5000000, minAmount: 3000000, maxAmount: 7499999 },
    { id: 'donation_10000000', amount: 10000000, minAmount: 7500000, maxAmount: 100000000 },
  ];

  /**
   * Maps a user input amount to the closest donation tier
   * @param amount The amount entered by the user
   * @returns The matching donation tier
   */
  static mapAmountToDonationTier(amount: number): DonationTier | null {
    if (amount < 1) {
      return null;
    }

    return this.DONATION_TIERS.find(
      tier => amount >= tier.minAmount && amount <= tier.maxAmount
    ) || this.DONATION_TIERS[this.DONATION_TIERS.length - 1]; // Return highest tier if above all ranges
  }

  /**
   * Initializes the Google Play Billing connection
   * On Android, calls the native plugin
   * On other platforms, returns a mock success
   */
  static async initialize(): Promise<boolean> {
    console.log('Initializing Google Play Billing');
    
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      try {
        // @ts-ignore - The GooglePlayBilling plugin will be available at runtime
        const result = await Capacitor.Plugins.GooglePlayBilling.initialize();
        return result.connected === true;
      } catch (err) {
        console.error('Error initializing Google Play Billing:', err);
        return false;
      }
    }
    
    // Not available on non-Android platforms
    console.log('Google Play Billing not available on this platform');
    return false;
  }

  /**
   * Checks if the billing service is available (device supports Google Play Billing)
   */
  static async isBillingAvailable(): Promise<boolean> {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      try {
        // @ts-ignore - The GooglePlayBilling plugin will be available at runtime
        const result = await Capacitor.Plugins.GooglePlayBilling.isBillingAvailable();
        return result.available === true;
      } catch (err) {
        console.error('Error checking billing availability:', err);
        return false;
      }
    }
    
    // Not available on non-Android platforms
    console.log('Billing not available on this platform');
    return false;
  }

  /**
   * Starts the donation purchase flow for a specific product ID
   * @param productId The Google Play product ID to purchase
   */
  static async purchaseDonation(productId: string): Promise<PurchaseResult> {
    console.log(`Purchasing donation product: ${productId}`);
    
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      try {
        // @ts-ignore - The GooglePlayBilling plugin will be available at runtime
        const result = await Capacitor.Plugins.GooglePlayBilling.purchaseDonation({
          productId: productId
        });
        
        return {
          success: result.success,
          transactionData: result.transactionData
        };
      } catch (err) {
        console.error('Error purchasing donation:', err);
        return { success: false };
      }
    }
    
    // Not available on non-Android platforms
    console.log('Purchase not available on this platform');
    return { success: false };
  }

  /**
   * Acknowledges a purchase to Google Play to prevent refund windows
   * @param purchaseToken The token from the purchase
   */
  static async acknowledgePurchase(purchaseToken: string): Promise<boolean> {
    console.log(`Acknowledging purchase: ${purchaseToken}`);
    
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      try {
        // @ts-ignore - The GooglePlayBilling plugin will be available at runtime
        const result = await Capacitor.Plugins.GooglePlayBilling.acknowledgePurchase({
          purchaseToken: purchaseToken
        });
        
        return result.acknowledged === true;
      } catch (err) {
        console.error('Error acknowledging purchase:', err);
        return false;
      }
    }
    
    // Not available on non-Android platforms
    console.log('Acknowledgment not available on this platform');
    return false;
  }
}
