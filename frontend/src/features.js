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
  // Controls whether the sliding garment pieces appear in the visualization section.
  // Set to false to hide only the flat-lay clothing images that slide toward the model.
  // The model, AI renders, sidebars, scroll progress, and pip indicators still work normally.
  vizAnimation: false,
};
