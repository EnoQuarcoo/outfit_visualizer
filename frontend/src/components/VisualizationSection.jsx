import { useRef, useState, useEffect } from 'react';
import { FEATURES } from '../features';
import tankSrc from '../assets/TANK_SRC.png'
import jeansSrc from '../assets/JEANS_SRC.png'
import sweaterSrc from '../assets/SWEATER_SRC.png'
import skirtSrc from '../assets/SKIRT_SRC.png'
import kenteSrc from '../assets/KENTE_SRC.png'
import modelSrc from '../assets/MODEL_IMG.png'
import render1Src from "../assets/RENDER1_SRC.png"
import render2Src from "../assets/RENDER2_SRC.png"
import render3Src from "../assets/RENDER3_SRC.png"
import './VisualizationSection.css';

const MODEL_SRC      = modelSrc;
const TANK_SRC       = tankSrc;
const JEANS_SRC      = jeansSrc;
const SWEATER_SRC    = sweaterSrc;
const SKIRT_SRC      = skirtSrc;
const FLAT_KENTE_SRC = kenteSrc;
const RENDER1_SRC    = render1Src;
const RENDER2_SRC    = render2Src;
const RENDER3_SRC    = render3Src;

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function ramp(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
function eio(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
function er(p, a, b) { return eio(ramp(p, a, b)); }

function SideCard({ item, active }) {
  return (
    <div className={`side-card ${active ? 'side-card--active' : 'side-card--inactive'}`}>
      <img src={item.src} alt={item.name} className="side-card-img" />
      <div className={`side-card-label ${active ? 'side-card-label--active' : 'side-card-label--inactive'}`}>
        {item.name}
      </div>
    </div>
  );
}

function VisualizationSection() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = sectionRef.current;
      if (!el) return;
      const scrollable = el.offsetHeight - window.innerHeight;
      const p = Math.max(0, Math.min(1, -el.getBoundingClientRect().top / scrollable));
      setProgress(p);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const slide1  = er(progress, 0.08, 0.20);
  const swap1   = er(progress, 0.20, 0.27);
  const pieces1 = slide1 * (1 - swap1);

  const slide2  = er(progress, 0.52, 0.64);
  const swap2   = er(progress, 0.64, 0.71);
  const pieces2 = slide2 * (1 - swap2);

  const slide3  = er(progress, 0.90, 0.97);
  const swap3   = er(progress, 0.97, 1.00);
  const pieces3 = slide3 * (1 - swap3);

  const render1 = swap1 * (1 - swap2);
  const render2 = swap2 * (1 - swap3);
  const render3 = swap3;

  const anyRender    = Math.min(1, render1 + render2 + render3);
  const modelOpacity = 1 - anyRender;

  const EDGE = 42, STOP = 9;
  const fromLeft  = (p) => -(EDGE - (EDGE - STOP) * p);
  const fromRight = (p) =>   (EDGE - (EDGE - STOP) * p);

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

  const sidebarOpacity      = render3 > 0.7 ? 0 : 1;
  const rightSidebarOpacity = sidebarOpacity;

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
    <section ref={sectionRef} className="viz-section">
      <div className="viz-sticky">

        <div className="viz-header">
          <div className="section-label viz-section-label">
            SCROLL TO DRESS
          </div>
        </div>

        {/* Left sidebar — tops + kente */}
        <div
          className="viz-sidebar viz-sidebar--left"
          style={{ opacity: sidebarOpacity }}
        >
          <div className="viz-sidebar-label">Tops</div>
          {leftItems.map((item) => (
            <SideCard key={item.idx} item={item} active={activeOutfit === item.idx} />
          ))}
        </div>

        {/* Right sidebar — bottoms */}
        <div
          className="viz-sidebar viz-sidebar--right"
          style={{ opacity: rightSidebarOpacity }}
        >
          <div className="viz-sidebar-label">Bottoms</div>
          {rightItems.map((item) => (
            <SideCard key={item.idx} item={item} active={activeOutfit === item.idx} />
          ))}
        </div>

        {/* Centre stage */}
        <div className="viz-center-stage">
          <div className="viz-ambient-glow" />

          <div className="viz-model-container">

            <div className="viz-inner-clip">

              {/* Base model */}
              <img
                src={MODEL_SRC}
                alt="model"
                className="viz-model-img"
                style={{ opacity: modelOpacity }}
              />

              {/* AI render 1 */}
              <img
                src={RENDER1_SRC}
                alt=""
                className="viz-render viz-render--1"
                style={{ opacity: render1 }}
              />

              {/* AI render 2 */}
              <img
                src={RENDER2_SRC}
                alt=""
                className="viz-render viz-render--2"
                style={{ opacity: render2 }}
              />

              {/* AI render 3 */}
              <img
                src={RENDER3_SRC}
                alt=""
                className="viz-render viz-render--3"
                style={{ opacity: render3 }}
              />

            </div>

            {FEATURES.vizAnimation && (
              <>
                {/* Outfit 1 — White Tank */}
                <img
                  src={TANK_SRC}
                  alt=""
                  className="viz-garment viz-garment--tank"
                  style={{
                    transform: `translateX(calc(-50% + ${fromLeft(slide1)}vw))`,
                    opacity:   pieces1,
                  }}
                />

                {/* Outfit 1 — Baggy Jeans */}
                <img
                  src={JEANS_SRC}
                  alt=""
                  className="viz-garment viz-garment--jeans"
                  style={{
                    transform: `translateX(calc(-50% + ${fromRight(slide1)}vw))`,
                    opacity:   pieces1,
                  }}
                />

                {/* Outfit 2 — Varsity Cardigan */}
                <img
                  src={SWEATER_SRC}
                  alt=""
                  className="viz-garment viz-garment--sweater"
                  style={{
                    transform: `translateX(calc(-50% + ${fromLeft(slide2)}vw))`,
                    opacity:   pieces2,
                  }}
                />

                {/* Outfit 2 — Mini Skirt */}
                <img
                  src={SKIRT_SRC}
                  alt=""
                  className="viz-garment viz-garment--skirt"
                  style={{
                    transform: `translateX(calc(-50% + ${fromRight(slide2)}vw))`,
                    opacity:   pieces2,
                  }}
                />

                {/* Outfit 3 — Flat Kente */}
                <img
                  src={FLAT_KENTE_SRC}
                  alt=""
                  className="viz-garment viz-garment--kente"
                  style={{
                    transform: `translateX(calc(-50% + ${fromLeft(slide3)}vw))`,
                    opacity:   pieces3,
                  }}
                />
              </>
            )}

          </div>

          <div className="viz-outfit-label-container">
            {outfitLabel && (
              <div key={outfitLabel} className="viz-outfit-label">
                {outfitLabel}
              </div>
            )}
          </div>

        </div>

        {/* Progress pips */}
        <div className="viz-progress-pips">
          {[[render1, pieces1], [render2, pieces2], [render3, pieces3]].map(([r, p], i) => (
            <div
              key={i}
              className="viz-pip"
              style={{
                width:      (r + p) > 0.3 ? 28 : 8,
                background: (r + p) > 0.3 ? 'var(--acc)' : 'rgba(247,230,202,0.2)',
              }}
            />
          ))}
        </div>

        <div
          className="viz-keep-scrolling"
          style={{ opacity: render3 > 0.8 ? 0 : 1 }}
        >
          keep scrolling →
        </div>

      </div>
    </section>
  );
}

export default VisualizationSection;
