import { useState, useEffect } from 'react';
import './HeroSection.css';

function GetStartedBtn() {
  function handleClick() {
    const el = document.getElementById('cta');
    if (el) window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
  }

  return (
    <button onClick={handleClick} className="get-started-btn">
      Get Started
    </button>
  );
}

function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const cls = loaded ? ' loaded' : '';

  return (
    <section className="hero-section">

      <div className={`hero-wordmark${cls}`}>
        ABIRIMA
      </div>

      <div className={`hero-tagline${cls}`}>
        Envision the Fit.
      </div>

      <p className={`hero-subtext${cls}`}>
        Upload your clothes. Build the look. See it before you wear it.
      </p>

      <div className={`hero-cta-wrapper${cls}`}>
        <GetStartedBtn />
      </div>

      <div className="hero-scroll-cue">
        <span className="hero-scroll-label">Scroll</span>
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
