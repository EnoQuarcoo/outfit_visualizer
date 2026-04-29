import { useState, useEffect } from 'react';

// ── useInView ─────────────────────────────────────────────────────────────────
// A custom hook that watches a DOM element and returns true once it enters
// the visible area of the screen (the "viewport").
//
// How to use it:
//   const ref = useRef(null);
//   const visible = useInView(ref);
//   return <div ref={ref} className={visible ? 'reveal visible' : 'reveal'}>...</div>
//
// Parameters:
//   ref       — a React ref attached to the element you want to watch
//   threshold — how much of the element must be on screen before it counts as
//               "in view" (0.15 = 15% visible). Default is 0.15.
//
// Once the element becomes visible it stays visible — this hook never flips
// back to false when the user scrolls away.

export function useInView(ref, threshold = 0.15) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // IntersectionObserver is a built-in browser API that fires a callback
    // whenever the observed element enters or leaves the viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        // entry.isIntersecting is true when the element is on screen
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);

    // Cleanup: stop watching when the component unmounts
    return () => observer.disconnect();
  }, []); // empty array = run once on mount, never re-run

  return visible;
}
