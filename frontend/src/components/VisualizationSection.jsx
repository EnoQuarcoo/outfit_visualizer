import { useRef, useState, useEffect } from 'react';
import { FEATURES } from '../features';

// ── Image slots ───────────────────────────────────────────────────────────────
// These constants are where you'll plug in real images later.
// Once you have the asset files, replace each empty string with an import, e.g.:
//   import modelImg from '../assets/model.png';
//   const MODEL_SRC = modelImg;
//
// For now they're empty strings — the <img> tags render but show nothing,
// which is fine while we build the structure.
const MODEL_SRC      = ''; // the base model photo (no clothing)
const TANK_SRC       = ''; // flat-lay white tank top
const JEANS_SRC      = ''; // flat-lay baggy jeans
const SWEATER_SRC    = ''; // flat-lay varsity cardigan
const SKIRT_SRC      = ''; // flat-lay mini skirt
const FLAT_KENTE_SRC = ''; // flat-lay kente dress
const RENDER1_SRC    = ''; // AI-generated model wearing tank + jeans
const RENDER2_SRC    = ''; // AI-generated model wearing sweater + skirt
const RENDER3_SRC    = ''; // AI-generated model wearing kente dress

// ── Math helpers ──────────────────────────────────────────────────────────────
// These are small pure functions used to calculate opacity and position values
// from the scroll progress (a number from 0 to 1).

// Clamp keeps a value inside a [lo, hi] range
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Ramp maps the global progress p into a 0→1 value within the window [a, b].
// Example: ramp(0.5, 0.4, 0.6) → 0.5 (halfway through that window)
function ramp(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }

// Ease-in-out smooths a linear 0→1 value into an S-curve so motion doesn't
// look mechanical (starts slow, speeds up, slows down again at the end).
function eio(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

// Convenience: apply ease-in-out over a progress window
function er(p, a, b) { return eio(ramp(p, a, b)); }

// ── SideCard ──────────────────────────────────────────────────────────────────
// A small thumbnail card shown in the left/right sidebars.
// `active` is true when this garment's outfit is currently on display.
function SideCard({ item, active }) {
  return (
    <div
      style={{
        width:      82,
        padding:    '7px 7px 5px',
        borderRadius: 8,
        border:     `1px solid ${active ? 'rgba(247,230,202,0.5)' : 'rgba(247,230,202,0.1)'}`,
        background: active ? 'rgba(247,230,202,0.09)' : 'rgba(247,230,202,0.02)',
        boxShadow:  active ? '0 0 28px rgba(247,230,202,0.18)' : 'none',
        transform:  active ? 'scale(1.1)' : 'scale(0.92)',
        opacity:    active ? 1 : 0.35,
        transition: 'all 0.4s ease',
      }}
    >
      <img
        src={item.src}
        alt={item.name}
        style={{
          width:          '100%',
          height:         72,
          objectFit:      'contain',
          objectPosition: 'center top',
          display:        'block',
        }}
      />
      <div
        style={{
          fontSize:      8.5,
          color:         active ? 'var(--acc)' : 'var(--muted)',
          textAlign:     'center',
          marginTop:     4,
          fontFamily:    'var(--font-body)',
          letterSpacing: '0.04em',
          lineHeight:    1.3,
        }}
      >
        {item.name}
      </div>
    </div>
  );
}

// ── VisualizationSection ──────────────────────────────────────────────────────
// A "sticky scroll" section: the section itself is 500vh tall (five screen-heights),
// but the visible panel inside it stays pinned to the top of the viewport while
// the user scrolls. We track how far through the 500vh the user is (0→1) and use
// that number to drive all the animations: which garments are visible, how far
// they've slid toward the model, and whether the AI render has faded in.
//
// Three outfits play out in sequence:
//   Outfit 1 — White Tank (left) + Baggy Jeans (right) → AI render 1
//   Outfit 2 — Varsity Cardigan (left) + Mini Skirt (right) → AI render 2
//   Outfit 3 — Kente Dress (left only) → AI render 3

function VisualizationSection() {
  const sectionRef = useRef(null);

  // progress: 0 = user at the very top of this section, 1 = at the very bottom
  const [progress, setProgress] = useState(0);

  // Scroll listener — recalculates progress whenever the user scrolls.
  // We also need to check FEATURES here so we don't add a scroll listener
  // when the section is disabled. (Hooks must always be called, so the check
  // happens inside useEffect, not before the hooks.)
  useEffect(() => {
    if (!FEATURES.vizAnimation) return;

    function onScroll() {
      const el = sectionRef.current;
      if (!el) return;
      // scrollable = total scroll distance through this section
      const scrollable = el.offsetHeight - window.innerHeight;
      // getBoundingClientRect().top is negative once we've scrolled past the top
      const p = Math.max(0, Math.min(1, -el.getBoundingClientRect().top / scrollable));
      setProgress(p);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // set correct initial value (in case the user reloads mid-scroll)
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Feature-flag early return — must come AFTER hooks (React rule)
  if (!FEATURES.vizAnimation) return null;

  // ── Scroll timeline ────────────────────────────────────────────────────────
  // Each outfit has three phases: slide-in, swap (pieces → render), exit.
  // The numbers (e.g. 0.08, 0.20) are progress values — fractions of the
  // total scroll distance when each phase starts and ends.
  //
  // Outfit 1 — White Tank + Baggy Jeans
  //   0.08 → 0.20   garment pieces slide in from the sides
  //   0.20 → 0.27   pieces fade out, AI render fades in (the "magic moment")
  //   0.27 → 0.44   AI render holds on screen
  //   0.44 → 0.52   AI render fades, bare model returns
  //
  // Outfit 2 — Varsity Cardigan + Mini Skirt
  //   0.52 → 0.64   slide in
  //   0.64 → 0.71   swap → render 2
  //   0.71 → 0.84   hold
  //   0.84 → 0.90   exit
  //
  // Outfit 3 — Kente Dress (left side only, no bottom piece)
  //   0.90 → 0.97   flat kente slides in from left
  //   0.97 → 1.00   swap → render 3 (stays visible — end of the section)

  const slide1  = er(progress, 0.08, 0.20);
  const swap1   = er(progress, 0.20, 0.27);
  const exit1   = er(progress, 0.44, 0.52);
  // pieces1: visible while sliding in, fades to 0 once the swap starts
  const pieces1 = slide1 * (1 - swap1);
  // render1: fades in during swap, fades out on exit
  const render1 = swap1  * (1 - exit1);

  const slide2  = er(progress, 0.52, 0.64);
  const swap2   = er(progress, 0.64, 0.71);
  const exit2   = er(progress, 0.84, 0.90);
  const pieces2 = slide2 * (1 - swap2);
  const render2 = swap2  * (1 - exit2);

  const slide3  = er(progress, 0.90, 0.97);
  const swap3   = er(progress, 0.97, 1.00);
  const pieces3 = slide3 * (1 - swap3);
  const render3 = swap3;  // kente render stays once it appears (no exit)

  // The base model photo fades out whenever any AI render is showing
  const anyRender    = Math.min(1, render1 + render2 + render3);
  const modelOpacity = 1 - anyRender;

  // ── Sliding positions ──────────────────────────────────────────────────────
  // Garment pieces travel from the edge of the screen (±42vw from centre) to a
  // resting point near the model (±9vw). The slide value (0→1) interpolates between.
  const EDGE = 42, STOP = 9;
  // fromLeft returns a negative vw (left of centre), moving right as p increases
  const fromLeft  = (p) => -(EDGE - (EDGE - STOP) * p);
  // fromRight returns a positive vw (right of centre), moving left as p increases
  const fromRight = (p) =>   (EDGE - (EDGE - STOP) * p);

  // ── Active outfit index ────────────────────────────────────────────────────
  // Determines which sidebar thumbnail card should be highlighted.
  //   -1 = no outfit active yet
  //    0 = outfit 1 (tank + jeans)
  //    1 = outfit 2 (sweater + skirt)
  //    2 = outfit 3 (kente)
  const activeOutfit =
      render3 > 0.2 || pieces3 > 0.1 ? 2
    : render2 > 0.2 || pieces2 > 0.1 ? 1
    : render1 > 0.2 || pieces1 > 0.1 ? 0
    : -1;

  const outfitLabel =
      activeOutfit === 0 ? 'White Tank + Baggy Jeans'
    : activeOutfit === 1 ? 'Varsity Cardigan + Mini Skirt'
    : activeOutfit === 2 ? 'Kente Dress'
    : '';

  // The left sidebar fades out entirely when render3 is fully shown.
  // The right sidebar (bottoms) also hides for outfit 3 since the kente is a full dress.
  const sidebarOpacity      = render3 > 0.7 ? 0 : 1;
  const rightSidebarOpacity = activeOutfit === 2 ? 0 : sidebarOpacity;

  // Garment data for each sidebar column
  const leftItems = [
    { name: 'White Tank',       src: TANK_SRC,       idx: 0 },
    { name: 'Varsity Cardigan', src: SWEATER_SRC,    idx: 1 },
    { name: 'Kente Dress',      src: FLAT_KENTE_SRC, idx: 2 },
  ];
  const rightItems = [
    { name: 'Baggy Jeans', src: JEANS_SRC, idx: 0 },
    { name: 'Mini Skirt',  src: SKIRT_SRC,  idx: 1 },
  ];

  return (
    // 500vh = five screen-heights of scroll distance for the animation to play through
    <section
      ref={sectionRef}
      style={{ height: '500vh', borderTop: '1px solid var(--border)', position: 'relative' }}
    >
      {/* ── Sticky panel ────────────────────────────────────────────────────
          position:sticky + top:0 means this div pins to the top of the viewport
          while the parent section is in the scroll range. height:100vh fills the screen.
          overflow:hidden prevents sliding garment images from causing scrollbars. */}
      <div
        style={{
          position: 'sticky',
          top:      0,
          height:   '100vh',
          overflow: 'hidden',
          background: 'var(--bg)',
        }}
      >

        {/* ── Section header ─────────────────────────────────────────────── */}
        <div
          style={{
            position:      'absolute',
            top:           36,
            left:          0,
            right:         0,
            textAlign:     'center',
            zIndex:        10,
            pointerEvents: 'none', // doesn't block scroll
          }}
        >
          <div className="section-label" style={{ maxWidth: 280, margin: '0 auto 8px' }}>
            SCROLL TO DRESS
          </div>
          {/* Active outfit name fades in/out as outfits change */}
          <div
            style={{
              fontFamily: 'var(--font-script)',
              fontSize:   'clamp(16px, 2.2vw, 26px)',
              color:      'var(--acc)',
              minHeight:  30,
              opacity:    outfitLabel ? 1 : 0.3,
              transition: 'opacity 0.5s',
            }}
          >
            {outfitLabel || 'Scroll to dress her'}
          </div>
        </div>

        {/* ── Left sidebar — tops + kente ───────────────────────────────── */}
        <div
          style={{
            position:   'absolute',
            left:       '3%',
            top:        '50%',
            transform:  'translateY(-50%)',
            zIndex:     6,
            display:    'flex',
            flexDirection: 'column',
            gap:        12,
            alignItems: 'center',
            opacity:    sidebarOpacity,
            transition: 'opacity 0.6s',
          }}
        >
          <div
            style={{
              fontSize:      9,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         'var(--muted)',
              fontFamily:    'var(--font-body)',
              marginBottom:  2,
            }}
          >
            Tops
          </div>
          {leftItems.map((item) => (
            <SideCard key={item.idx} item={item} active={activeOutfit === item.idx} />
          ))}
        </div>

        {/* ── Right sidebar — bottoms ───────────────────────────────────── */}
        <div
          style={{
            position:   'absolute',
            right:      '3%',
            top:        '50%',
            transform:  'translateY(-50%)',
            zIndex:     6,
            display:    'flex',
            flexDirection: 'column',
            gap:        12,
            alignItems: 'center',
            opacity:    rightSidebarOpacity,
            transition: 'opacity 0.6s',
          }}
        >
          <div
            style={{
              fontSize:      9,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         'var(--muted)',
              fontFamily:    'var(--font-body)',
              marginBottom:  2,
            }}
          >
            Bottoms
          </div>
          {rightItems.map((item) => (
            <SideCard key={item.idx} item={item} active={activeOutfit === item.idx} />
          ))}
        </div>

        {/* ── Centre stage ─────────────────────────────────────────────────
            This is where the model, renders, and sliding garment pieces all live.
            Positioned at 50% from left and 52% from top (slightly below centre
            to account for the header above). */}
        <div
          style={{
            position:  'absolute',
            left:      '50%',
            top:       '52%',
            transform: 'translate(-50%, -50%)',
            zIndex:    5,
          }}
        >
          {/* Ambient glow — a soft radial gradient behind the model that pulses */}
          <div
            style={{
              position:  'absolute',
              top:       '-10%',
              left:      '50%',
              transform: 'translateX(-50%)',
              width:     '220%',
              height:    '130%',
              background: 'radial-gradient(ellipse 55% 60% at 50% 30%, rgba(247,230,202,0.1) 0%, transparent 70%)',
              animation:  'glow-pulse 3s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />

          {/* ── Model container ────────────────────────────────────────────
              Sized to the model image's aspect ratio: 752px wide × 1388px tall.
              In vh units: width = (752/1388) × 68vh ≈ 36.84vh, height = 68vh.

              The sliding garment pieces live inside this outer div but OUTSIDE
              the inner clipped div, so they can visually travel in from off-screen
              without being cut off. Only the model photo and AI renders are
              inside the clipped area. */}
          <div style={{ position: 'relative', width: '36.84vh', height: '68vh' }}>

            {/* Inner clipped area — overflow:hidden stops render images from bleeding out */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>

              {/* Base model — fades to invisible whenever an AI render is showing */}
              <img
                src={MODEL_SRC}
                alt="model"
                style={{
                  position:   'absolute',
                  width:      '100%',
                  height:     '100%',
                  objectFit:  'cover',
                  top:        0,
                  left:       0,
                  zIndex:     1,
                  opacity:    modelOpacity,
                  transition: 'opacity 0.3s ease',
                }}
              />

              {/* ── AI renders ─────────────────────────────────────────────
                  Each render image is scaled so the person inside it aligns
                  exactly with the base model. The sizing math accounts for
                  how much of each render image is empty space around the person.

                  Render 1: person fills 78.6% of image height, starts at 7.4% from top
                    → image height = 68vh × (59.3/46.6) ≈ 75.44vh  (person height / person%)
                    → image top    = 8.5vh - (0.074 × 75.44vh) ≈ 2.92vh */}
              <img
                src={RENDER1_SRC}
                alt=""
                style={{
                  position:      'absolute',
                  height:        '75.44vh',
                  width:         'auto',
                  top:           '2.92vh',
                  left:          '50%',
                  transform:     'translateX(-50%)',
                  zIndex:        2,
                  opacity:       render1,
                  transition:    'opacity 0.3s ease',
                  pointerEvents: 'none',
                }}
              />

              {/* Render 2: person fills 92.8% of image height, starts at 6.9% from top
                    → height = 63.9vh, top = 4.09vh */}
              <img
                src={RENDER2_SRC}
                alt=""
                style={{
                  position:      'absolute',
                  height:        '63.9vh',
                  width:         'auto',
                  top:           '4.09vh',
                  left:          '50%',
                  transform:     'translateX(-50%)',
                  zIndex:        2,
                  opacity:       render2,
                  transition:    'opacity 0.3s ease',
                  pointerEvents: 'none',
                }}
              />

              {/* Render 3: person fills 96.9% of image height, starts at 1.6% from top
                    → height = 61.2vh, top = 7.52vh */}
              <img
                src={RENDER3_SRC}
                alt=""
                style={{
                  position:      'absolute',
                  height:        '61.2vh',
                  width:         'auto',
                  top:           '7.52vh',
                  left:          '50%',
                  transform:     'translateX(-50%)',
                  zIndex:        3,
                  opacity:       render3,
                  transition:    'opacity 0.3s ease',
                  pointerEvents: 'none',
                }}
              />

            </div>{/* end inner clip */}

            {/* ── Sliding garment pieces ─────────────────────────────────
                These are positioned inside the outer (non-clipped) container
                so they can slide in from off-screen.

                Each piece uses translateX(calc(-50% + Nvw)):
                  -50%  centres the image on left:50%
                  Nvw   is a signed offset — negative for left pieces, positive for right

                `pieces1` opacity is the combined slide × (1 - swap) value,
                so the piece is fully visible while sliding in, then fades out
                as the AI render fades in. */}

            {/* Outfit 1 — White Tank slides in from the LEFT */}
            <img
              src={TANK_SRC}
              alt=""
              style={{
                height:        '25.84vh', // covers shoulder to beltline on the model
                width:         'auto',
                position:      'absolute',
                top:           '10.06%',  // aligns with shoulder zone
                left:          '50%',
                transform:     `translateX(calc(-50% + ${fromLeft(slide1)}vw))`,
                zIndex:        4,
                opacity:       pieces1,
                pointerEvents: 'none',
                filter:        'drop-shadow(0 6px 24px rgba(0,0,0,0.5))',
              }}
            />

            {/* Outfit 1 — Baggy Jeans slide in from the RIGHT */}
            <img
              src={JEANS_SRC}
              alt=""
              style={{
                height:        '33.48vh', // covers beltline to feet
                width:         'auto',
                position:      'absolute',
                top:           '50.38%',  // aligns with beltline zone
                left:          '50%',
                transform:     `translateX(calc(-50% + ${fromRight(slide1)}vw))`,
                zIndex:        4,
                opacity:       pieces1,
                pointerEvents: 'none',
                filter:        'drop-shadow(0 6px 24px rgba(0,0,0,0.5))',
              }}
            />

            {/* Outfit 2 — Varsity Cardigan slides in from the LEFT */}
            <img
              src={SWEATER_SRC}
              alt=""
              style={{
                height:        '25.84vh',
                width:         'auto',
                position:      'absolute',
                top:           '5.46%',
                left:          '50%',
                transform:     `translateX(calc(-50% + ${fromLeft(slide2)}vw))`,
                zIndex:        4,
                opacity:       pieces2,
                pointerEvents: 'none',
                filter:        'drop-shadow(0 6px 24px rgba(0,0,0,0.5))',
              }}
            />

            {/* Outfit 2 — Mini Skirt slides in from the RIGHT */}
            <img
              src={SKIRT_SRC}
              alt=""
              style={{
                height:        '18vh',   // shorter — above-knee mini
                width:         'auto',
                position:      'absolute',
                top:           '43.59%',
                left:          '50%',
                transform:     `translateX(calc(-50% + ${fromRight(slide2)}vw))`,
                zIndex:        4,
                opacity:       pieces2,
                pointerEvents: 'none',
                filter:        'drop-shadow(0 6px 24px rgba(0,0,0,0.5))',
              }}
            />

            {/* Outfit 3 — Flat Kente slides in from the LEFT (full-length, no bottom piece) */}
            <img
              src={FLAT_KENTE_SRC}
              alt=""
              style={{
                height:        '59.3vh', // full shoulder-to-feet coverage
                width:         'auto',
                position:      'absolute',
                top:           '-1.65%', // starts slightly above the container top
                left:          '50%',
                transform:     `translateX(calc(-50% + ${fromLeft(slide3)}vw))`,
                zIndex:        4,
                opacity:       pieces3,
                pointerEvents: 'none',
                // Warm amber glow for the kente pattern
                filter:        'drop-shadow(0 8px 32px rgba(247,140,0,0.4))',
              }}
            />

          </div>{/* end model container */}

          {/* Active outfit name below the model */}
          <div style={{ textAlign: 'center', marginTop: 10, height: 20 }}>
            {outfitLabel && (
              // key={outfitLabel} causes React to re-mount this element when the
              // outfit changes, which re-triggers the fadeIn animation each time
              <div
                key={outfitLabel}
                style={{
                  fontFamily:    'var(--font-body)',
                  fontSize:      11,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  color:         'var(--muted)',
                  animation:     'fadeIn 0.5s ease',
                }}
              >
                {outfitLabel}
              </div>
            )}
          </div>

        </div>{/* end centre stage */}

        {/* ── Progress pips ───────────────────────────────────────────────
            Three dots at the bottom, one per outfit. The active pip stretches
            into a pill shape (width: 28px → 8px). */}
        <div
          style={{
            position:        'absolute',
            bottom:          44,
            left:            0,
            right:           0,
            display:         'flex',
            justifyContent:  'center',
            gap:             8,
            zIndex:          10,
          }}
        >
          {[[render1, pieces1], [render2, pieces2], [render3, pieces3]].map(([r, p], i) => (
            <div
              key={i}
              style={{
                width:      (r + p) > 0.3 ? 28 : 8,
                height:     8,
                borderRadius: 4,
                background: (r + p) > 0.3 ? 'var(--acc)' : 'rgba(247,230,202,0.2)',
                transition: 'all 0.4s',
              }}
            />
          ))}
        </div>

        {/* "Keep scrolling" hint — disappears once the kente render is fully shown */}
        <div
          style={{
            position:      'absolute',
            bottom:        24,
            left:          0,
            right:         0,
            textAlign:     'center',
            fontSize:      11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color:         'var(--muted)',
            fontFamily:    'var(--font-body)',
            opacity:       render3 > 0.8 ? 0 : 1,
            transition:    'opacity 0.5s',
          }}
        >
          keep scrolling →
        </div>

      </div>{/* end sticky panel */}
    </section>
  );
}

export default VisualizationSection;
