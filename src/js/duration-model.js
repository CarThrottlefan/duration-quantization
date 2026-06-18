/**
 * duration-model.js
 * ------------------------------------------------------------------
 * Pure data + math describing which note durations are representable
 * and how "played" durations get quantized/rounded onto them.
 * No DOM access and no mutable module state lives here — every
 * function takes the data it needs as arguments, so it can be unit
 * tested in isolation from rendering and UI wiring.
 * ------------------------------------------------------------------ */

export const BASE = [
  { v: 0.0625, name: '64th',   cat: 'base', hidden: true },
  { v: 0.125,  name: '32nd',   cat: 'base' },
  { v: 0.25,   name: '16th',   cat: 'base' },
  { v: 0.5,    name: 'eighth', cat: 'base' },
  { v: 1.0,    name: 'quarter',cat: 'base' },
  { v: 2.0,    name: 'half',   cat: 'base' },
  { v: 4.0,    name: 'whole',  cat: 'base', hidden: true },
];

export const MODIFIERS = {
  dots: [
    { v: 0.1875, name: 'dotted 32nd' },
    { v: 0.375,  name: 'dotted 16th' },
    { v: 0.75,   name: 'dotted eighth' },
    { v: 1.5,    name: 'dotted quarter' },
  ],
  ddots: [
    { v: 0.21875, name: 'dbl-dotted 32nd' },
    { v: 0.4375,  name: 'dbl-dotted 16th' },
    { v: 0.875,   name: 'dbl-dotted eighth' },
    { v: 1.75,    name: 'dbl-dotted quarter' },
  ],
  tuplets: [
    { v: 1 / 6, name: '16th triplet' },
    { v: 1 / 3, name: 'eighth triplet' },
    { v: 2 / 3, name: 'quarter triplet' },
    { v: 4 / 3, name: 'half triplet' },
  ],
  ties: [
    { v: 0.625, name: 'eighth+32nd' },
    { v: 1.25,  name: 'quarter+16th' },
    { v: 2.25,  name: 'half+16th' },
  ],
};

export const CAT_COLOR = {
  base: 'var(--base)',
  dots: 'var(--dots)',
  ddots: 'var(--ddots)',
  tuplets: 'var(--tuplets)',
  ties: 'var(--ties)',
};

export const VIEW_MAX = 2.2;
export const THRESHOLD_PCT = 10;

/** Build the sorted list of representable duration values for the
 *  currently-enabled modifier toggles. */
export function activeValues(toggles) {
  let vals = BASE.map(x => ({ ...x }));
  for (const k of ['dots', 'ddots', 'tuplets', 'ties']) {
    if (toggles[k]) vals.push(...MODIFIERS[k].map(x => ({ ...x, cat: k })));
  }
  return vals.sort((a, b) => a.v - b.v);
}

/** Convert a sorted value list into "catchment zones": the [lo, hi)
 *  range of played durations that round to each representable value. */
export function zonesOf(vals) {
  const z = [];
  let prevB = 0;
  for (let i = 0; i < vals.length; i++) {
    const nextB = i < vals.length - 1
      ? (vals[i].v + vals[i + 1].v) / 2
      : vals[i].v * 2 - prevB;
    z.push({ ...vals[i], lo: prevB, hi: nextB, width: nextB - prevB });
    prevB = nextB;
  }
  return z;
}

/** Find the nearest representable value to a played duration x. */
export function nearest(x, vals) {
  let best = vals[0], bd = Infinity;
  for (const v of vals) {
    const d = Math.abs(x - v.v);
    if (d < bd) { bd = d; best = v; }
  }
  return { value: best, error: bd };
}

/** Rounding error (in beats) at a given played duration x. */
export function errorAt(x, vals) {
  let m = Infinity;
  for (const v of vals) m = Math.min(m, Math.abs(x - v.v));
  return m;
}

/** Worst-case rounding error across the visible duration range. */
export function worstCaseError(vals, viewMax = VIEW_MAX) {
  let m = 0;
  for (let x = 0; x <= viewMax; x += 0.002) m = Math.max(m, errorAt(x, vals));
  return m;
}

export const beatsToMs = (beats, bpm) => beats * 60000 / bpm;
export const fmtMs = (beats, bpm) => Math.round(beatsToMs(beats, bpm)) + ' ms';
