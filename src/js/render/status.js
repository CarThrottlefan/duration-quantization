/**
 * render/status.js — the "too short / good / too long" verdict pill
 * and the small numeric readouts (zone count, worst-case error).
 */
import { state } from '../state.js';
import {
  activeValues, nearest, worstCaseError, beatsToMs, fmtMs, VIEW_MAX, THRESHOLD_PCT,
} from '../duration-model.js';
import { $ } from '../dom-utils.js';

export function renderVerdict() {
  const vals = activeValues(state.toggles);
  const { value, error } = nearest(state.handle, vals);
  const errPct = (error / value.v) * 100;
  const tooShort = state.handle < value.v && errPct > THRESHOLD_PCT;
  const tooLong = state.handle > value.v && errPct > THRESHOLD_PCT;
  const status = tooShort ? 'too short' : tooLong ? 'too long' : 'good';
  const color = status === 'good' ? 'var(--good)' : 'var(--bad)';

  $('#verdict').innerHTML = `
    <span class="pill" style="background:color-mix(in srgb,${color} 22%, transparent);color:${color}">${status.toUpperCase()}</span>
    <span class="detail">Played <b>${state.handle.toFixed(3)} beats</b> → nearest is
      <b>${value.name}</b> (<b>${value.v.toFixed(3)}</b> beats) →
      error <b>${error.toFixed(3)} beats</b> (<b>${errPct.toFixed(1)}%</b>,
      <b>${fmtMs(error, state.bpm)}</b> @ ${state.bpm} BPM)</span>`;
}

export function renderReadouts() {
  const vals = activeValues(state.toggles);
  const visibleCount = vals.filter(v => !v.hidden && v.v <= VIEW_MAX).length;
  const worst = worstCaseError(vals);
  $('#roCount').textContent = visibleCount;
  $('#roWorst').textContent = worst.toFixed(3) + ' beats';
  $('#roWorstMs').textContent = '≈ ' + Math.round(beatsToMs(worst, state.bpm)) + ' ms';
}
