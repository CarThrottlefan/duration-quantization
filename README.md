# Harmonic X-Ray — The Snap Line

An interactive explainer for the **representable-duration quantization**
mechanism described in Sec. IV-C / Fig. 11 of:

> Heyen, Gleicher & Sedlmair, *"Make the Unhearable Visible"*, IEEE TVCG.

The paper states in prose that a played note gets rounded to the nearest
representable duration, and that the resulting "catchment zones" are
unevenly sized. This project turns that single sentence into something
draggable: a duration axis, a continuous rounding-error curve, and a
practice-history view, all built with plain HTML/CSS/JS — no charting or
music-theory libraries.

## Project structure

```
harmonic-xray/
├── README.md
├── package.json
├── .gitignore
└── src/
    ├── index.html              # page shell, markup only
    ├── css/
    │   ├── tokens.css          # color/typography/spacing variables
    │   ├── base.css            # resets, page layout, header/footer
    │   ├── components.css      # cards, toggles, readouts, buttons, verdict
    │   └── visualization.css   # SVG-specific styling
    └── js/
        ├── main.js             # entry point: bootstraps state + first render
        ├── state.js            # single mutable app-state object
        ├── duration-model.js   # pure music-duration math (no DOM)
        ├── dom-utils.js        # SVG element helpers, beat<->pixel scales
        ├── events.js           # DOM event wiring → state mutation → re-render
        └── render/
            ├── index.js        # renderAll() barrel / orchestration
            ├── axis.js         # draggable duration axis + catchment zones
            ├── error-curve.js  # continuous rounding-error sawtooth
            ├── history.js      # practice-history scatter plot
            └── status.js       # verdict pill + numeric readouts
```

**Why split it this way:** `duration-model.js` is pure data/math and has
no DOM dependency, so the quantization logic itself (the actual point of
the seminar deliverable) can be reasoned about — or unit tested — in
isolation. `state.js` is the one place mutable app state lives. `events.js`
only ever mutates state and calls into `render/`; it never touches the DOM
directly except through `dom-utils.js`. Each file under `render/` owns one
visual (axis, error curve, history, status) so a change to one chart can't
accidentally break another.

## Running it

No build step or bundler is required — this is plain ES modules served as
static files. You only need *some* local web server, because browsers
block `fetch`/module imports from `file://` URLs.

### Option 1 — npm script (no install required)

```bash
npm start
```

This runs `npx serve src` and opens the app at **http://localhost:5173**.

### Option 2 — Python (already on most machines)

```bash
cd src
python3 -m http.server 5173
```

Then open **http://localhost:5173**.

### Option 3 — VS Code Live Server

Open the `src/` folder in VS Code and use the **Live Server** extension's
"Go Live" button on `index.html`.

## Notes

- All visualization code is hand-rolled SVG/DOM (`dom-utils.js`'s `el()`
  helper) — there is intentionally no D3, Chart.js, or similar dependency.
- State (toggled modifiers, played duration, tempo, attempt history) lives
  entirely in `src/js/state.js` and is not persisted between page loads.
