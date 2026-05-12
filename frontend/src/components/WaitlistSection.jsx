import { useState, useRef } from "react";
import { useInView } from "../hooks/useInView";
import './WaitlistSection.css';

function SectionReveal({ children, className = '' }) {
  const ref = useRef(null);
  const visible = useInView(ref);

  return (
    <div ref={ref} className={`reveal${visible ? " visible" : ""} ${className}`.trim()}>
      {children}
    </div>
  );
}

function WaitlistSection() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState("idle");
  const [betaState, setBetaState] = useState("idle");
  const [hasError, setHasError] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://outfitvisualizer-production.up.railway.app/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: firstName, email: email }),
        },
      );
      if (response.ok) {
        setFormState("submitted");
      } else {
        setHasError(true);
        console.error("Submission failed:", response.status);
      }
    } catch {
      setHasError(true);
    }
  }

  return (
    <section id="cta" className="waitlist-section">

      {/* Idle state: the signup form */}
      {formState === "idle" && (
        <SectionReveal className="waitlist-form-reveal">

          <div className="section-label waitlist-section-label">
            Be first
          </div>

          <h2 className="waitlist-headline">
            <span className="waitlist-headline-line">
              For anyone who&apos;s ever stared at a full closet
            </span>
            <span className="waitlist-headline-line">
              and felt they had nothing to wear.
            </span>
          </h2>

          <p className="waitlist-description">
            Join the waitlist and be the first to know when we launch.
          </p>

          <form onSubmit={handleSubmit} className="waitlist-form">
            <input
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setHasError(false); }}
              placeholder="First name"
              type="text"
              className="waitlist-input"
            />
            <input
              value={email}
              onChange={(e) => { setEmail(e.target.value); setHasError(false); }}
              placeholder="Email address"
              type="email"
              className="waitlist-input waitlist-input--email"
            />
            <button type="submit" className="waitlist-btn">
              Sign Up
            </button>
          </form>

          <p className="waitlist-disclaimer">
            No spam. Unsubscribe anytime.
          </p>

        </SectionReveal>
      )}

      {/* Submitted state: thank-you + beta prompt */}
      {formState === "submitted" && (
        <div className="waitlist-submitted">

          <div className="waitlist-confirmation-heading">
            You&apos;re in. ✦
          </div>
          <p className="waitlist-confirmation-text">
            We&apos;ll reach out the moment TBD is ready.
          </p>

          <div className="waitlist-divider" />

          {betaState === "idle" && (
            <div className="waitlist-beta-prompt">
              <p className="waitlist-beta-text">
                Want to help shape the product?{" "}
                <span className="waitlist-beta-highlight">
                  We&apos;re looking for beta testers to try the very first version.
                </span>{" "}
              </p>
              <button
                onClick={() => {
                  window.open("https://form.typeform.com/to/kfkR385c", "_blank");
                  setBetaState("applied");
                }}
                className="beta-btn"
              >
                Apply for early access
              </button>
            </div>
          )}

          {betaState === "applied" && (
            <div className="waitlist-applied">
              <div className="waitlist-applied-heading">
                Application received ✦
              </div>
              <p className="waitlist-applied-text">
                We&apos;ll be in touch. Thank you for helping build this.
              </p>
            </div>
          )}

        </div>
      )}

      {hasError && (
        <p className="waitlist-error">
          Something went wrong. Please try again.
        </p>
      )}

    </section>
  );
}

export default WaitlistSection;
