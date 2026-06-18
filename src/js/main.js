/**
 * main.js — application entry point. Loaded as a module from index.html.
 */
import { VIEW_MAX } from './duration-model.js';
import { $ } from './dom-utils.js';
import { renderAll, syncHandleInput } from './render/index.js';
import { wireEvents } from './events.js';

$('#handleInput').max = VIEW_MAX;
syncHandleInput();
wireEvents();
renderAll();
