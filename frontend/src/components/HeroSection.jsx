import { useState, useEffect } from 'react';

// ── GetStartedBtn ─────────────────────────────────────────────────────────────
// The primary CTA button. Clicking it smooth-scrolls the page down to the
// waitlist section (identified by id="waitlist" on WaitlistSection).
// Hover state is tracked locally so we can brighten the border and background.
function GetStartedBtn() {
  const [hovered, setHovered] = useState(false);

  function handleClick() {
    const el = document.getElementById('cta');
    if (el) window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
  }

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      style={{
        fontFamily:          'var(--font-body)',
        fontSize:            15,
        fontWeight:          500,
        letterSpacing:       '0.06em',
        padding:             '14px 44px',
        cursor:              'pointer',
        whiteSpace:          'nowrap',
        // Background brightens slightly on hover
        background:          hovered ? 'rgba(247,230,202,0.18)' : 'rgba(247,230,202,0.1)',
        backdropFilter:      'blur(14px)',
        WebkitBackdropFilter:'blur(14px)',
        color:               'var(--acc)',
        // Border opacity increases on hover
        border:              `1px solid rgba(247,230,202,${hovered ? '0.5' : '0.3'})`,
        borderRadius:        'var(--radius)',
        transition:          'all 0.2s ease',
        transform:           hovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow:           hovered ? '0 8px 32px rgba(247,230,202,0.15)' : 'none',
      }}
    >
      Get Started
    </button>
  );
}

// ── HeroSection ───────────────────────────────────────────────────────────────
// Full-viewport opening section. Contains:
//   • "TBD" wordmark in large display font with a glimmer spotlight sweep
//   • "Envision the Fit." tagline in the script font
//   • One-line subtext
//   • Get Started button (scrolls to waitlist)
//   • Bobbing scroll cue arrow at the bottom
function HeroSection() {
  // `loaded` starts false and flips to true after a short delay.
  // This ensures the CSS animations play as an entrance sequence after paint,
  // rather than being skipped if they start before the browser renders.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      style={{
        minHeight:      '100vh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '80px 40px 60px',
        position:       'relative',
        overflow:       'hidden', // prevents the glimmer from creating a scrollbar
      }}
    >

      {/* ── App name / wordmark ──────────────────────────────────────────────
          Cormorant Garamond at a large fluid size (scales with viewport width). */}
      <div
        style={{
          fontFamily:    'var(--font-display)',
          fontSize:      'clamp(90px, 13vw, 150px)',
          fontWeight:    700,
          lineHeight:    1,
          letterSpacing: '-0.02em',
          color:         'var(--acc)',
          position:      'relative',
          animation:     loaded ? 'fadeUp 0.8s 0.1s ease both' : 'none',
        }}
      >
        ABIRIMA
      </div>

      {/* ── Tagline ──────────────────────────────────────────────────────────
          Dancing Script at a fluid size. Slightly overlaps the wordmark (negative margin)
          for the visual rhythm from the prototype. */}
      <div
        style={{
          fontFamily: 'var(--font-script)',
          fontSize:   'clamp(28px, 4vw, 52px)',
          color:      'var(--acc)',
          marginTop:  -8,                          // tucks up slightly under the wordmark
          whiteSpace: 'nowrap',
          animation:  loaded ? 'fadeUp 0.8s 0.5s ease both' : 'none',
        }}
      >
        Envision the Fit.
      </div>

      {/* ── Subtext ──────────────────────────────────────────────────────────
          Light-weight DM Sans. Fades in after the tagline (0.9s delay). */}
      <p
        style={{
          fontFamily:  'var(--font-body)',
          fontSize:    16,
          fontWeight:  300,
          color:       'var(--muted)',
          maxWidth:    420,
          textAlign:   'center',
          lineHeight:  1.6,
          marginTop:   4,
          animation:   loaded ? 'fadeUp 0.8s 0.9s ease both' : 'none',
        }}
      >
        Upload your clothes. Build the look. See it before you wear it.
      </p>

      {/* ── CTA button ───────────────────────────────────────────────────────
          Wrapped in a div so we can apply the entrance animation to the container
          without it fighting the hover transform inside GetStartedBtn. */}
      <div style={{ marginTop: 28, animation: loaded ? 'fadeUp 0.8s 1.1s ease both' : 'none' }}>
        <GetStartedBtn />
      </div>

      {/* ── Scroll cue ───────────────────────────────────────────────────────
          Positioned absolute at the bottom-centre of the section.
          `left: 50%` centres horizontally; the bobble keyframe uses
          `translateX(-50%)` to keep it centred while adding vertical movement. */}
      <div
        style={{
          position:  'absolute',
          bottom:    '32px',
          left:      '50%',
          animation: 'bobble 2s ease-in-out infinite',
          display:   'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap:        6,
          color:      'var(--muted)',
        }}
      >
        <span
          style={{
            fontSize:      11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily:    'var(--font-body)',
          }}
        >
          Scroll
        </span>
        {/* Down-arrow icon drawn with SVG — no image dependency */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 3v10M3 9l5 5 5-5"
            stroke="var(--muted)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

    </section>
  );
}

export default HeroSection;
