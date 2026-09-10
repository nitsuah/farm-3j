// Feature carousel tuning constants for the home page.
// Kept out of FeatureCarousel.tsx so timing/gesture tuning isn't hardcoded
// inline in component logic (see repo coding guidelines).

/**
 * Milliseconds between automatic slide advances (paused on hover/focus).
 * Must match the `.animate-carousel-progress` keyframe duration in
 * `app/globals.css` — the progress bar and the auto-advance timer are
 * driven independently but are meant to stay visually in sync.
 */
export const AUTO_ADVANCE_MS = 6000;

/** Minimum horizontal swipe distance (px) before a touch gesture counts as a slide change. */
export const SWIPE_THRESHOLD = 40;
