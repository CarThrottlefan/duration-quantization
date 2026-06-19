# Harmonic X-Ray — The Snap Line

This project is an interactive tool that explains the representable-duration quantization mechanism described in Section IV-C (Figure 11) of the following paper:

> Heyen, Gleicher & Sedlmair, "Make the Unhearable Visible", IEEE TVCG.

The paper explains that when a note is played, it is rounded to the nearest representable duration, which creates unevenly sized "catchment zones". I turned this idea into a draggable visualization with a continuous-duration axis, a rounding-error curve, and a practice-history view. I built everything using only HTML, CSS, and JavaScript, without any external charting or music-theory libraries.

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
