/**
 * render/history.js — 2D plot of recent attempts: raw played duration
 * vs. quantized target, stacked by recency.
 */
import { state } from '../state.js';
import { activeValues, VIEW_MAX } from '../duration-model.js';
import { $, el, xScale, AX_W } from '../dom-utils.js';

export function renderHistory() {
  const HIST = $('#historySvg');
  HIST.setAttribute('width', AX_W);
  HIST.setAttribute('height', 180);
  HIST.innerHTML = '';

  const vals = activeValues(state.toggles).filter(v => !v.hidden && v.v <= VIEW_MAX);
  vals.forEach(v => {
    const x = xScale(v.v);
    HIST.appendChild(el('line', { x1: x, y1: 10, x2: x, y2: 170, stroke: '#262d38', 'stroke-width': 1 }));
  });

  const maxAttempts = 15;
  const recentHistory = state.history.slice(-maxAttempts);

  recentHistory.forEach((attempt, i) => {
    const x = xScale(attempt.raw);
    const y = 20 + i * 10;
    const qX = xScale(attempt.quantized);
    HIST.appendChild(el('line', { x1: x, y1: y, x2: qX, y2: y, stroke: 'var(--faint)', 'stroke-width': 1 }));
    HIST.appendChild(el('circle', { cx: x, cy: y, r: 4, fill: 'var(--accent)', opacity: 0.8 }));
  });
}
