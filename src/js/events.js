/**
 * events.js — wires DOM controls (modifier toggles, sliders, demo
 * buttons) to state mutations + re-renders. No rendering logic lives
 * here; it only ever calls into render/index.js after updating state.
 */
import { state } from './state.js';
import { activeValues, nearest, VIEW_MAX } from './duration-model.js';
import { $ } from './dom-utils.js';
import {
  renderAll, renderVerdict, renderReadouts, renderHistory,
  syncHandleInput, onHandleDrag,
} from './render/index.js';

export function wireEvents() {
  onHandleDrag(() => { syncHandleInput(); renderAll(); });

  $('#mods').addEventListener('click', e => {
    const b = e.target.closest('.mod');
    if (!b) return;
    const cat = b.dataset.cat;
    state.toggles[cat] = !state.toggles[cat];
    b.setAttribute('aria-pressed', state.toggles[cat]);
    renderAll();
  });

  $('#handleInput').addEventListener('input', e => {
    state.handle = parseFloat(e.target.value);
    renderAll();
  });

  $('#bpm').addEventListener('input', e => {
    state.bpm = parseFloat(e.target.value);
    $('#bpmLabel').textContent = state.bpm + ' BPM';
    renderVerdict();
    renderReadouts();
  });

  $('#randomize').addEventListener('click', () => {
    state.handle = Math.random() * VIEW_MAX;
    syncHandleInput();
    renderAll();
  });

  $('#onTarget').addEventListener('click', () => {
    const vals = activeValues(state.toggles).filter(v => !v.hidden);
    state.handle = vals[(Math.random() * vals.length) | 0].v;
    syncHandleInput();
    renderAll();
  });

  window.addEventListener('pointerup', () => {
    if (state.handle > 0) {
      const vals = activeValues(state.toggles);
      const nearestVal = nearest(state.handle, vals).value;
      state.history.push({ raw: state.handle, quantized: nearestVal.v });
      renderHistory();
    }
  });

  $('#simRhythm').addEventListener('click', () => {
    const vals = activeValues(state.toggles);
    state.simNotes = [];

    const targetTriplets = [1 / 3, 2 / 3, 1.0, 4 / 3];
    targetTriplets.forEach(target => {
      const sloppyTiming = target + (Math.random() * 0.16 - 0.08);
      const nearestVal = nearest(sloppyTiming, vals).value;
      state.simNotes.push({ raw: sloppyTiming, quantized: nearestVal.v });
      state.history.push({ raw: sloppyTiming, quantized: nearestVal.v });
    });

    renderAll();
  });

  $('#clearHistory').addEventListener('click', () => {
    state.history = [];
    state.simNotes = [];
    renderAll();
  });
}
