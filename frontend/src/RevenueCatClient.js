import { Purchases, PURCHASES_ERROR_CODE } from "@revenuecat/purchases-capacitor";
import { Capacitor } from "@capacitor/core";
import { config } from "./config";
import { pricingConfig } from "./pricingConfig";

export async function configureRevenueCat() {
  await Purchases.configure({ apiKey: config.revenueCatApiKey });
}

// Ties the RevenueCat customer to our own Supabase user_id, so a purchase
// event (and the future backend webhook) can be matched back to the right row.
export async function loginRevenueCatUser(userId) {
  await Purchases.logIn({ appUserID: userId });
}

// Maps our own plan ids ("monthly"/"annual") to the actual RevenueCat
// package. The Test Store packages use custom identifiers ("monthly"/
// "yearly"), while the real App Store packages use RevenueCat's reserved
// monthly/annual slots (offering.monthly/offering.annual) — so both are
// looked up both ways, whichever store the app is currently configured
// against.
async function getPlanPackages() {
  const offerings = await Purchases.getOfferings();
  const offering = offerings.current;
  if (!offering) return {};

  const findByIdentifier = (identifier) =>
    offering.availablePackages.find((pkg) => pkg.identifier === identifier);

  return {
    monthly: offering.monthly || findByIdentifier("monthly"),
    annual: offering.annual || findByIdentifier("yearly"),
  };
}

function hasActiveEntitlement(customerInfo) {
  return Boolean(customerInfo?.entitlements?.active?.[pricingConfig.entitlementId]);
}

// Triggers a native purchase for the given plan id ("monthly" | "annual").
// Returns { success, cancelled, message } — success is only true once the
// entitlement is confirmed active, not just once the store call resolves.
export async function purchasePlan(planId) {
  if (!Capacitor.isNativePlatform()) {
    return {
      success: false,
      cancelled: false,
      message: "Subscriptions are only available in the mobile app right now.",
    };
  }

  const packages = await getPlanPackages();
  const aPackage = packages[planId];

  if (!aPackage) {
    return {
      success: false,
      cancelled: false,
      message: "This plan isn't available right now.",
    };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage });
    return { success: hasActiveEntitlement(customerInfo), cancelled: false };
  } catch (error) {
    const cancelled = error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
    return {
      success: false,
      cancelled,
      message: cancelled ? null : error.message || "Purchase failed.",
    };
  }
}
