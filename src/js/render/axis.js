/**
 * render/axis.js — the draggable duration-axis SVG (catchment zones,
 * tick marks for representable values, the drag handle, and any
 * simulated/historical note markers drawn on top).
 */
import { state } from '../state.js';
import { activeValues, zonesOf, CAT_COLOR, VIEW_MAX } from '../duration-model.js';
import { $, el, xScale, xInv, AX_W, attachDrag } from '../dom-utils.js';

let onHandleMoved = null;
/** Register the callback fired when the user drags the handle. */
export function onHandleDrag(cb) { onHandleMoved = cb; }

export function renderAxis() {
  const AX = $('#axisSvg');
  AX.setAttribute('width', AX_W);
  AX.setAttribute('height', 130);
  AX.innerHTML = '';

  const vals = activeValues(state.toggles);
  const visible = vals.filter(v => !v.hidden && v.v <= VIEW_MAX);
  const zones = zonesOf(vals).filter(z => !z.hidden);

  // zone bands
  zones.forEach(z => {
    const x0 = xScale(Math.max(0, z.lo)), x1 = xScale(Math.min(VIEW_MAX, z.hi));
    const inZone = state.handle >= z.lo && state.handle < z.hi;
    AX.appendChild(el('rect', {
      x: x0, y: 30, width: Math.max(0, x1 - x0), height: 62,
      fill: inZone ? 'color-mix(in srgb, ' + CAT_COLOR[z.cat] + ' 22%, transparent)' : '#1a1f28',
      stroke: '#262d38', 'stroke-width': 1,
    }));
  });

  // simulated notes & mistake-amplifier lines
  state.simNotes.forEach(note => {
    const rawX = xScale(note.raw);
    const quantX = xScale(note.quantized);
    AX.appendChild(el('circle', { cx: rawX, cy: 60, r: 4, fill: 'var(--bad)' }));
    AX.appendChild(el('line', {
      x1: rawX, y1: 60, x2: quantX, y2: 60,
      stroke: 'var(--bad)', 'stroke-width': 1.5, 'stroke-dasharray': '2,2',
    }));
    AX.appendChild(el('circle', { cx: quantX, cy: 60, r: 3, fill: 'var(--ink)' }));
  });

  // ticks + labels
  visible.forEach(v => {
    const x = xScale(v.v);
    AX.appendChild(el('line', { x1: x, y1: 30, x2: x, y2: 92, stroke: CAT_COLOR[v.cat], 'stroke-width': 2.5 }));
    const t = el('text', { x, y: 106, fill: 'var(--muted)', 'text-anchor': 'middle', class: 'tick-label' });
    t.textContent = v.name;
    AX.appendChild(t);
    const vt = el('text', { x, y: 24, fill: CAT_COLOR[v.cat], 'text-anchor': 'middle', class: 'tick-label' });
    vt.textContent = v.v.toFixed(3);
    AX.appendChild(vt);
  });

  // baseline
  AX.appendChild(el('line', { x1: 20, y1: 92, x2: AX_W - 20, y2: 92, stroke: '#3a4452', 'stroke-width': 1 }));

  // handle
  const hx = xScale(state.handle);
  const grp = el('g', { class: 'handle', tabindex: 0, role: 'slider', 'aria-label': 'Played duration' });
  grp.appendChild(el('line', { x1: hx, y1: 6, x2: hx, y2: 118, stroke: 'var(--accent)', 'stroke-width': 2 }));
  grp.appendChild(el('circle', { cx: hx, cy: 14, r: 7, fill: 'var(--accent)' }));
  AX.appendChild(grp);

  attachDrag(AX, grp, hx2 => {
    state.handle = xInv(hx2);
    if (onHandleMoved) onHandleMoved();
  });
}
