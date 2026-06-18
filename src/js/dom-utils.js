/**
 * dom-utils.js
 * ------------------------------------------------------------------
 * Thin DOM/SVG helpers and the shared layout constants used to
 * convert between "beats" (model space) and pixels (screen space).
 * ------------------------------------------------------------------ */
import { VIEW_MAX } from './duration-model.js';

export const $ = s => document.querySelector(s);
export const NS = 'http://www.w3.org/2000/svg';

export function el(tag, attrs) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}

export const PAD_L = 20, PAD_R = 20, AX_W = 920, AX_H = 130, ERR_H = 130;

export const xScale = beats => PAD_L + (beats / VIEW_MAX) * (AX_W - PAD_L - PAD_R);
export const xInv = px => Math.max(0, Math.min(VIEW_MAX, ((px - PAD_L) / (AX_W - PAD_L - PAD_R)) * VIEW_MAX));

/** Wire pointer-drag behavior on an SVG handle/background. */
export function attachDrag(svg, grabEl, onMove) {
  let dragging = false;
  const getX = e => {
    const rect = svg.getBoundingClientRect();
    const scaleX = AX_W / rect.width;
    return (e.clientX - rect.left) * scaleX;
  };
  const start = e => { dragging = true; onMove(getX(e)); e.preventDefault(); };
  const move = e => { if (dragging) onMove(getX(e)); };
  const end = () => { dragging = false; };
  grabEl.addEventListener('pointerdown', start);
  svg.addEventListener('pointerdown', e => {
    if (e.target === svg || e.target.tagName === 'rect') start(e);
  });
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
}
