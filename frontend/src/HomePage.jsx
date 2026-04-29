// ── HomePage ──────────────────────────────────────────────────────────────────
// The single page that makes up the pre-launch site.
// It imports each section component and renders them in order.
//
// At launch, when the waitlist becomes the full app, you'll replace
// WaitlistSection here with your authenticated app shell — nothing else changes.

import HeroSection         from './components/HeroSection';
import VisualizationSection from './components/VisualizationSection';
import WaitlistSection      from './components/WaitlistSection';
import Footer               from './components/Footer';

function HomePage() {
  return (
    <>
      {/* 1. Full-viewport hero with the TBD wordmark and tagline */}
      <HeroSection />

      {/* 2. Scroll-driven animation (internally gated by FEATURES.vizAnimation) */}
      <VisualizationSection />

      {/* 3. Email waitlist signup */}
      <WaitlistSection />

      {/* 4. Footer bar */}
      <Footer />
    </>
  );
}

export default HomePage;
