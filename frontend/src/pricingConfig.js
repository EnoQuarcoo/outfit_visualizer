const MONTHLY_PRICE = 12.99;
const ANNUAL_PRICE = 129.99;

const annualPercentOff = Math.round(
  (1 - ANNUAL_PRICE / (MONTHLY_PRICE * 12)) * 100,
);

export const pricingConfig = {
  // Must match the entitlement identifier configured in the RevenueCat dashboard
  entitlementId: "Abrima Pro",
  plans: [
    { id: "monthly", label: "Monthly", price: MONTHLY_PRICE, period: "mo" },
    {
      id: "annual",
      label: "Annual",
      price: ANNUAL_PRICE,
      period: "yr",
      badge: `${annualPercentOff}% off`,
    },
  ],
  defaultPlanId: "annual",
};
