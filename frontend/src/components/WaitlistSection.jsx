import { useState, useRef } from "react";
import { useInView } from "../hooks/useInView";

// ── SectionReveal ─────────────────────────────────────────────────────────────
// A wrapper that fades-and-slides its children into view when the user scrolls
// to this part of the page.
//
// How it works:
//   1. useInView() watches the wrapper element with an IntersectionObserver.
//   2. When the element enters the viewport, `visible` flips to true.
//   3. The .reveal CSS class (defined in index.css) starts elements invisible
//      and shifted down. Adding .visible triggers the CSS transition.
function SectionReveal({ children, style = {} }) {
  const ref = useRef(null);
  const visible = useInView(ref);

  return (
    <div
      ref={ref}
      className={`reveal${visible ? " visible" : ""}`}
      style={style}
    >
      {children}
    </div>
  );
}

// Shared input style object — reused for both the first name and email fields
const inputStyle = {
  fontFamily: "var(--font-body)",
  fontSize: 16,
  padding: "14px 20px",
  background: "rgba(247,230,202,0.05)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  outline: "none", // removes the browser's default blue focus ring
  borderRadius: "var(--radius)",
  width: 220,
};

// ── WaitlistSection ───────────────────────────────────────────────────────────
// The email signup section. Has two states:
//   'idle'      → shows the form (headline + first name + email + Join Waitlist button)
//   'submitted' → shows a thank-you message and a secondary beta-tester prompt
//
// The beta prompt inside the submitted state also has two states:
//   'idle'    → shows "Apply for early access" button
//   'applied' → shows "Application received" confirmation

function WaitlistSection() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState("idle"); // 'idle' | 'submitted'
  const [betaState, setBetaState] = useState("idle"); // 'idle' | 'applied'
  const [hasError, setHasError] = useState(false);

  // Only submit if the email field has content (basic guard)
  // Send post request to backend
  async function handleSubmit(e) {
    e.preventDefault();
    try {
    const response = await fetch("https://outfitvisualizer-production.up.railway.app/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: firstName, email: email }),
    });
    if (response.ok) {
      setFormState("submitted");
    } else {
      setHasError(true);
      console.error("Submission failed:", response.status);
    }} catch {
      setHasError(true)
    }
  }

  return (
    <section
      id="waitlist" // this id is what GetStartedBtn scrolls to
      style={{
        padding: "120px 48px",
        borderTop: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 32,
        textAlign: "center",
        background: "#040404", // slightly darker than --bg for separation
      }}
    >
      {/* ── Idle state: the signup form ─────────────────────────────────── */}
      {formState === "idle" && (
        // SectionReveal wraps the whole form so it animates in as you scroll to it
        <SectionReveal
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            width: "100%",
          }}
        >
          {/* "BE FIRST" label — text-transform:uppercase is applied by the CSS class */}
          <div
            className="section-label"
            style={{ width: "100%", maxWidth: 480 }}
          >
            Be first
          </div>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 5vw, 58px)",
              fontWeight: 600,
              lineHeight: 1.1,
              maxWidth: 560,
              color: "var(--acc)",
            }}
          >
            See your outfit
            <br />
            before you wear it.
          </h2>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 16,
              fontWeight: 300,
              maxWidth: 400,
              color: "var(--acc)",
            }}
          >
            Join the waitlist and be the first to know when we launch.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap", // wraps to a second line on small screens
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <input
              value={firstName}
              onChange={(e) => {setFirstName(e.target.value);  setHasError(false);}}
              placeholder="First name"
              type="text"
              style={inputStyle}
            />
            <input
              value={email}
              onChange={(e) => {setEmail(e.target.value); setHasError(false);}}
              placeholder="Email address"
              type="email"
              style={{ ...inputStyle, width: 260 }}
            />
            <button
              type="submit"
              // These hover handlers are inline because the button needs a different
              // style from a plain CSS hover — the values reference JS variables.
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(247,230,202,0.2)";
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 8px 28px rgba(247,230,202,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(247,230,202,0.1)";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: "0.06em",
                padding: "14px 36px",
                background: "rgba(247,230,202,0.1)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(247,230,202,0.35)",
                color: "var(--acc)",
                cursor: "pointer",
                borderRadius: "var(--radius)",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              Join Waitlist
            </button>
          </form>

          <p
            style={{
              fontSize: 13,
              color: "var(--muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            No spam. Unsubscribe anytime.
          </p>
        </SectionReveal>
      )}

      {/* ── Submitted state: thank-you + beta prompt ────────────────────── */}
      {formState === "submitted" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            animation: "fadeUp 0.6s ease both",
          }}
        >
          {/* Primary confirmation */}
          <div
            style={{
              fontFamily: "var(--font-script)",
              fontSize: 52,
              color: "var(--acc)",
            }}
          >
            You&apos;re in. ✦
          </div>
          <p
            style={{
              fontSize: 18,
              color: "var(--muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            We&apos;ll reach out the moment TBD is ready.
          </p>

          {/* Thin horizontal rule as a visual separator */}
          <div style={{ width: 60, height: 1, background: "var(--border)" }} />

          {/* Beta tester prompt — only shown until the user clicks "Apply" */}
          {betaState === "idle" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                maxWidth: 460,
              }}
            >
              <p
                style={{
                  fontSize: 17,
                  color: "var(--muted)",
                  lineHeight: 1.6,
                  fontFamily: "var(--font-body)",
                }}
              >
                Want to help shape the product?{" "}
                <span style={{ color: "var(--acc)", fontWeight: 500 }}>
                  Give us your best feature idea or sign up to be a beta tester.
                </span>{" "}
              </p>
              <button
                onClick={() => setBetaState("applied")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(247,230,202,0.18)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 20px rgba(247,230,202,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(247,230,202,0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  padding: "14px 36px",
                  background: "rgba(247,230,202,0.08)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(247,230,202,0.3)",
                  color: "var(--acc)",
                  cursor: "pointer",
                  borderRadius: "var(--radius)",
                  transition: "all 0.2s",
                }}
              >
                Get Involved
              </button>
            </div>
          )}

          {/* Beta application confirmation */}
          {betaState === "applied" && (
            <div style={{ animation: "fadeUp 0.5s ease both" }}>
              <div
                style={{
                  fontFamily: "var(--font-script)",
                  fontSize: 36,
                  color: "var(--acc)",
                  marginBottom: 8,
                }}
              >
                Application received ✦
              </div>
              <p
                style={{
                  fontSize: 16,
                  color: "var(--muted)",
                  fontFamily: "var(--font-body)",
                }}
              >
                We&apos;ll be in touch. Thank you for helping build TBD.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── If Error detected on submission ──────────────────────────────── */}
      {hasError && (
        <p
          style={{ color: "red", fontFamily: "var(--font-body)", fontSize: 14 }}
        >
          Something went wrong. Please try again.
        </p>
      )}
    </section>
  );
}

export default WaitlistSection;
