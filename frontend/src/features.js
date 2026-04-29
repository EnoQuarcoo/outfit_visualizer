// ── Feature flags ────────────────────────────────────────────────────────────
// A "feature flag" is a simple on/off switch for a feature.
// Instead of deleting code to disable something, you flip the flag to false.
// This is useful for A/B testing (showing different versions to different users)
// or for turning off an unfinished section without removing it from the codebase.
//
// How to use:
//   import { FEATURES } from '../features';
//   if (FEATURES.vizAnimation) { /* show the visualization */ }

export const FEATURES = {
  // Controls whether the scroll-driven clothing visualization section appears.
  // Set to false to skip it entirely (VisualizationSection renders nothing).
  vizAnimation: true,
};
