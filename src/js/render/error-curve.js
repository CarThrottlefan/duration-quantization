/**
 * render/error-curve.js — the continuous rounding-error sawtooth as a
 * function of played duration.
 */
import { state } from '../state.js';
import { activeValues, errorAt, VIEW_MAX } from '../duration-model.js';
import { $, el, xScale, AX_W, PAD_L, PAD_R, ERR_H } from '../dom-utils.js';

export function renderError() {
  const ERR = $('#errSvg');
  ERR.setAttribute('width', AX_W);
  ERR.setAttribute('height', ERR_H);
  ERR.innerHTML = '';

  const vals = activeValues(state.toggles);
  const Y_MAX = 0.52;
  const yOf = err => 10 + (1 - Math.min(err, Y_MAX) / Y_MAX) * (ERR_H - 40);

  let d = `M ${PAD_L} ${yOf(errorAt(0, vals))}`;
  const step = 0.01;
  for (let x = step; x <= VIEW_MAX; x += step) {
    d += ` L ${xScale(x).toFixed(2)} ${yOf(errorAt(x, vals)).toFixed(2)}`;
  }
  const areaD = d + ` L ${xScale(VIEW_MAX)} ${ERR_H - 30} L ${PAD_L} ${ERR_H - 30} Z`;
  ERR.appendChild(el('path', { d: areaD, fill: 'color-mix(in srgb, var(--accent) 16%, transparent)' }));
  ERR.appendChild(el('path', { d, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 1.6 }));
  ERR.appendChild(el('line', { x1: PAD_L, y1: ERR_H - 30, x2: AX_W - PAD_R, y2: ERR_H - 30, stroke: '#3a4452', 'stroke-width': 1 }));

  const hx = xScale(state.handle), he = errorAt(state.handle, vals), hy = yOf(he);
  ERR.appendChild(el('line', {
    x1: hx, y1: hy, x2: hx, y2: ERR_H - 30,
    stroke: 'var(--accent)', 'stroke-width': 1, 'stroke-dasharray': '3,3',
  }));
  ERR.appendChild(el('circle', { cx: hx, cy: hy, r: 5, fill: 'var(--accent)', stroke: '#11141a', 'stroke-width': 1.5 }));
  const lbl = el('text', { x: hx, y: Math.max(12, hy - 10), fill: 'var(--ink)', 'text-anchor': 'middle', class: 'tick-label' });
  lbl.textContent = he.toFixed(3) + ' err';
  ERR.appendChild(lbl);
}
