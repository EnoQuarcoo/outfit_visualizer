import { useState } from "react";
import Button from "./Button";
import "./PaywallModal.css";

// variant is a styling/analytics hook (e.g. "upgrade", "limitReached").
// features/plans are optional — omit both for a plain informational modal
// (e.g. a paid user who's simply out of credits this month). When plans is
// provided, onSubscribe is called with the selected plan's id; otherwise
// it's called with no arguments. Omitting onSubscribe renders a dismiss-only
// modal (nothing to sell, just an "OK").
const PaywallModal = ({
  variant,
  title,
  message,
  features,
  plans,
  defaultPlanId,
  ctaLabel,
  onSubscribe,
  onClose,
  disabled = false,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState(
    defaultPlanId || plans?.[0]?.id,
  );

  const handleCtaClick = () => {
    if (!onSubscribe) {
      onClose();
      return;
    }
    onSubscribe(plans ? selectedPlanId : undefined);
  };

  return (
    <div className="paywall-overlay" onClick={onClose}>
      <div
        className={`paywall-card paywall-card--${variant}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="paywall-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h2 className="paywall-title">{title}</h2>
        <p className="paywall-message">{message}</p>

        {features && (
          <ul className="paywall-features">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        )}

        {plans && (
          <div className="paywall-plans">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className={`paywall-plan${
                  selectedPlanId === plan.id ? " paywall-plan--selected" : ""
                }`}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                <span className="paywall-plan-label">{plan.label}</span>
                <span className="paywall-plan-price">
                  ${plan.price.toFixed(2)}/{plan.period}
                </span>
                {plan.badge && (
                  <span className="paywall-plan-badge">{plan.badge}</span>
                )}
              </button>
            ))}
          </div>
        )}

        <Button text={ctaLabel} onClick={handleCtaClick} disabled={disabled} />
      </div>
    </div>
  );
};

export default PaywallModal;
