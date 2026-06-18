/**
 * state.js
 * ------------------------------------------------------------------
 * Single source of truth for mutable UI state. Everything else
 * (render, events) reads/writes through this object instead of
 * holding its own module-level globals.
 * ------------------------------------------------------------------ */

export const state = {
  toggles: { dots: true, ddots: false, tuplets: false, ties: false },
  handle: 0.42,   // currently "played" duration, in beats
  bpm: 90,
  history: [],    // {raw, quantized} pairs from past drags
  simNotes: [],   // {raw, quantized} pairs from the "sloppy triplets" demo
};
