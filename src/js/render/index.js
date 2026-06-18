/**
 * render/index.js — barrel file: re-exports each render module and
 * provides the single renderAll() entry point the rest of the app calls.
 */
import { state } from '../state.js';
import { $ } from '../dom-utils.js';
import { renderAxis, onHandleDrag } from './axis.js';
import { renderError } from './error-curve.js';
import { renderHistory } from './history.js';
import { renderVerdict, renderReadouts } from './status.js';

export { onHandleDrag, renderAxis, renderError, renderHistory, renderVerdict, renderReadouts };

export function syncHandleInput() {
  $('#handleInput').value = state.handle;
}

export function renderAll() {
  renderAxis();
  renderError();
  renderVerdict();
  renderReadouts();
  renderHistory();
}
