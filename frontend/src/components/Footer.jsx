// ── Footer ────────────────────────────────────────────────────────────────────
// A single horizontal bar at the bottom of the page.
// Three items in a row (space-between): brand name, script tagline, legal links.
// flexWrap: 'wrap' lets it stack on very narrow screens.

function Footer() {
  return (
    <footer
      style={{
        padding:         '28px 48px',
        borderTop:       '1px solid var(--border)',
        background:      '#040404',
        color:           'var(--muted)',
        display:         'flex',
        justifyContent:  'space-between',
        alignItems:      'center',
        fontSize:        13,
        flexWrap:        'wrap',
        gap:             12,
        fontFamily:      'var(--font-body)',
      }}
    >
      {/* Brand name + year */}
      <span>ABIRIMA &copy; 2026</span>

      {/* Tagline in the script font — intentionally faint */}
      <span
        style={{
          fontFamily: 'var(--font-script)',
          fontSize:   16,
          color:      'rgba(247,230,202,0.3)',
        }}
      >
        Envision the Fit.
      </span>

      {/* Legal links — dots are a middot character (·) not a hyphen */}
      <span>Privacy &middot; Terms</span>
    </footer>
  );
}

export default Footer;
