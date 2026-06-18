/* ===================================================================
   DURATION MODEL 
   All values are in beats, quarter note = 1 beat.
   =================================================================== */
const BASE = [
  {v:0.0625, name:'64th',  cat:'base', hidden:true},
  {v:0.125,  name:'32nd',  cat:'base'},
  {v:0.25,   name:'16th',  cat:'base'},
  {v:0.5,    name:'eighth',cat:'base'},
  {v:1.0,    name:'quarter',cat:'base'},
  {v:2.0,    name:'half',  cat:'base'},
  {v:4.0,    name:'whole', cat:'base', hidden:true},
];

const MODIFIERS = {
  dots:    [{v:0.1875,name:'dotted 32nd'},{v:0.375,name:'dotted 16th'},
            {v:0.75,  name:'dotted eighth'},{v:1.5,  name:'dotted quarter'}],
  ddots:   [{v:0.21875,name:'dbl-dotted 32nd'},{v:0.4375,name:'dbl-dotted 16th'},
            {v:0.875,  name:'dbl-dotted eighth'},{v:1.75,  name:'dbl-dotted quarter'}],
  tuplets: [{v:1/6,name:'16th triplet'},{v:1/3,name:'eighth triplet'},
            {v:2/3,name:'quarter triplet'},{v:4/3,name:'half triplet'}],
  ties:    [{v:0.625,name:'eighth+32nd'},{v:1.25,name:'quarter+16th'},
            {v:2.25, name:'half+16th'}],
};

const CAT_COLOR = {base:'var(--base)',dots:'var(--dots)',ddots:'var(--ddots)',
  tuplets:'var(--tuplets)',ties:'var(--ties)'};
const VIEW_MAX = 2.2;       
const THRESHOLD_PCT = 10;   

let TOGGLES = {dots:true, ddots:false, tuplets:false, ties:false};
let HANDLE = 0.42;          
let BPM = 90;
let HISTORY = []; 
let SIM_NOTES = []; 

function activeValues(){
  let vals = BASE.map(x=>({...x}));
  for(const k of ['dots','ddots','tuplets','ties']){
    if(TOGGLES[k]) vals.push(...MODIFIERS[k].map(x=>({...x, cat:k})));
  }
  return vals.sort((a,b)=>a.v-b.v);
}

function zonesOf(vals){
  const z=[]; let prevB=0;
  for(let i=0;i<vals.length;i++){
    const nextB = i<vals.length-1 ? (vals[i].v+vals[i+1].v)/2 : vals[i].v*2 - prevB;
    z.push({...vals[i], lo:prevB, hi:nextB, width:nextB-prevB});
    prevB = nextB;
  }
  return z;
}

function nearest(x, vals){
  let best=vals[0], bd=Infinity;
  for(const v of vals){ const d=Math.abs(x-v.v); if(d<bd){bd=d; best=v;} }
  return {value:best, error:bd};
}

function errorAt(x, vals){ let m=Infinity; for(const v of vals) m=Math.min(m,Math.abs(x-v.v)); return m; }

function worstCaseError(vals){
  let m=0; for(let x=0;x<=VIEW_MAX;x+=0.002) m=Math.max(m, errorAt(x,vals));
  return m;
}

const beatsToMs = (beats) => beats * 60000 / BPM;
const fmtMs = (b) => Math.round(beatsToMs(b))+' ms';

/* ===================================================================
   RENDERING
   =================================================================== */
const $ = s => document.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs){ const n=document.createElementNS(NS,tag);
  for(const k in attrs) n.setAttribute(k, attrs[k]); return n; }

const AX = $('#axisSvg'), ERR = $('#errSvg');
const PAD_L=20, PAD_R=20, AX_W=920, AX_H=130, ERR_H=130;
AX.setAttribute('width', AX_W); AX.setAttribute('height', AX_H);
ERR.setAttribute('width', AX_W); ERR.setAttribute('height', ERR_H);
const xScale = beats => PAD_L + (beats/VIEW_MAX)*(AX_W-PAD_L-PAD_R);
const xInv   = px => Math.max(0, Math.min(VIEW_MAX, ((px-PAD_L)/(AX_W-PAD_L-PAD_R))*VIEW_MAX));

function renderAxis(){
  AX.innerHTML='';
  const vals = activeValues();
  const visible = vals.filter(v=>!v.hidden && v.v<=VIEW_MAX);
  const zones = zonesOf(vals).filter(z=>!z.hidden);

  // zone bands
  zones.forEach((z,i)=>{
    const x0=xScale(Math.max(0,z.lo)), x1=xScale(Math.min(VIEW_MAX,z.hi));
    const inZone = HANDLE>=z.lo && HANDLE<z.hi;
    AX.appendChild(el('rect',{x:x0,y:30,width:Math.max(0,x1-x0),height:62,
      fill:inZone?'color-mix(in srgb, '+CAT_COLOR[z.cat]+' 22%, transparent)':'#1a1f28',
      stroke:'#262d38','stroke-width':1}));
  });

  // NEW: Draw Simulated Notes & Mistake Amplifier Lines
  SIM_NOTES.forEach(note => {
    const rawX = xScale(note.raw);
    const quantX = xScale(note.quantized);
    
    // Draw the raw input as a red dot
    AX.appendChild(el('circle', {cx: rawX, cy: 60, r: 4, fill: 'var(--bad)'}));
    
    // Draw an arrow/line showing where it gets quantized
    AX.appendChild(el('line', {
      x1: rawX, y1: 60, x2: quantX, y2: 60, 
      stroke: 'var(--bad)', 'stroke-width': 1.5, 'stroke-dasharray': '2,2'
    }));
    AX.appendChild(el('circle', {cx: quantX, cy: 60, r: 3, fill: 'var(--ink)'}));
  });

  // ticks + labels
  visible.forEach(v=>{
    const x=xScale(v.v);
    AX.appendChild(el('line',{x1:x,y1:30,x2:x,y2:92,stroke:CAT_COLOR[v.cat],'stroke-width':2.5}));
    const t=el('text',{x:x,y:106,fill:'var(--muted)','text-anchor':'middle',class:'tick-label'});
    t.textContent=v.name; AX.appendChild(t);
    const vt=el('text',{x:x,y:24,fill:CAT_COLOR[v.cat],'text-anchor':'middle',class:'tick-label'});
    vt.textContent=v.v.toFixed(3); AX.appendChild(vt);
  });

  // baseline
  AX.appendChild(el('line',{x1:PAD_L,y1:92,x2:AX_W-PAD_R,y2:92,stroke:'#3a4452','stroke-width':1}));

  // handle
  const hx = xScale(HANDLE);
  const grp = el('g',{class:'handle',tabindex:0,role:'slider','aria-label':'Played duration'});
  grp.appendChild(el('line',{x1:hx,y1:6,x2:hx,y2:118,stroke:'var(--accent)','stroke-width':2}));
  grp.appendChild(el('circle',{cx:hx,cy:14,r:7,fill:'var(--accent)'}));
  AX.appendChild(grp);

  attachDrag(AX, grp, hx2 => { HANDLE = xInv(hx2); syncHandleInput(); renderAll(); });
}

function attachDrag(svg, grabEl, onMove){
  let dragging=false;
  const getX = e => {
    const rect = svg.getBoundingClientRect();
    const scaleX = AX_W / rect.width;
    return (e.clientX - rect.left) * scaleX;
  };
  const start = e => { dragging=true; onMove(getX(e)); e.preventDefault(); };
  const move  = e => { if(dragging) onMove(getX(e)); };
  const end   = () => dragging=false;
  grabEl.addEventListener('pointerdown', start);
  svg.addEventListener('pointerdown', e=>{ if(e.target===svg||e.target.tagName==='rect') start(e); });
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
}

function renderError(){
  ERR.innerHTML='';
  const vals = activeValues();
  const Y_MAX = 0.52; 
  const yOf = err => 10 + (1 - Math.min(err,Y_MAX)/Y_MAX) * (ERR_H-40);

  let d = `M ${PAD_L} ${yOf(errorAt(0,vals))}`;
  const step = 0.01;
  for(let x=step; x<=VIEW_MAX; x+=step){
    d += ` L ${xScale(x).toFixed(2)} ${yOf(errorAt(x,vals)).toFixed(2)}`;
  }
  const areaD = d + ` L ${xScale(VIEW_MAX)} ${ERR_H-30} L ${PAD_L} ${ERR_H-30} Z`;
  ERR.appendChild(el('path',{d:areaD, fill:'color-mix(in srgb, var(--accent) 16%, transparent)'}));
  ERR.appendChild(el('path',{d, fill:'none', stroke:'var(--accent)','stroke-width':1.6}));
  ERR.appendChild(el('line',{x1:PAD_L,y1:ERR_H-30,x2:AX_W-PAD_R,y2:ERR_H-30,stroke:'#3a4452','stroke-width':1}));

  const hx=xScale(HANDLE), he=errorAt(HANDLE,vals), hy=yOf(he);
  ERR.appendChild(el('line',{x1:hx,y1:hy,x2:hx,y2:ERR_H-30,stroke:'var(--accent)','stroke-width':1,
    'stroke-dasharray':'3,3'}));
  ERR.appendChild(el('circle',{cx:hx,cy:hy,r:5,fill:'var(--accent)',stroke:'#11141a','stroke-width':1.5}));
  const lbl=el('text',{x:hx, y:Math.max(12,hy-10), fill:'var(--ink)','text-anchor':'middle',class:'tick-label'});
  lbl.textContent = he.toFixed(3)+' err';
  ERR.appendChild(lbl);
}

function renderVerdict(){
  const vals = activeValues();
  const {value, error} = nearest(HANDLE, vals);
  const errPct = (error/value.v)*100;
  const tooShort = HANDLE < value.v && errPct > THRESHOLD_PCT;
  const tooLong  = HANDLE > value.v && errPct > THRESHOLD_PCT;
  const status = tooShort ? 'too short' : tooLong ? 'too long' : 'good';
  const color  = status==='good' ? 'var(--good)' : 'var(--bad)';
  $('#verdict').innerHTML = `
    <span class="pill" style="background:color-mix(in srgb,${color} 22%, transparent);color:${color}">${status.toUpperCase()}</span>
    <span class="detail">Played <b>${HANDLE.toFixed(3)} beats</b> → nearest is
      <b>${value.name}</b> (<b>${value.v.toFixed(3)}</b> beats) →
      error <b>${error.toFixed(3)} beats</b> (<b>${errPct.toFixed(1)}%</b>,
      <b>${fmtMs(error)}</b> @ ${BPM} BPM)</span>`;
}

function renderHistory() {
  const HIST = $('#historySvg');
  HIST.setAttribute('width', AX_W);
  HIST.setAttribute('height', 180);
  HIST.innerHTML = '';

  const vals = activeValues().filter(v => !v.hidden && v.v <= VIEW_MAX);
  vals.forEach(v => {
    const x = xScale(v.v);
    HIST.appendChild(el('line', {x1: x, y1: 10, x2: x, y2: 170, stroke: '#262d38', 'stroke-width': 1}));
  });

  const maxAttempts = 15;
  const recentHistory = HISTORY.slice(-maxAttempts);
  
  recentHistory.forEach((attempt, i) => {
    const x = xScale(attempt.raw);
    const y = 20 + (i * 10); 
    
    const qX = xScale(attempt.quantized);
    HIST.appendChild(el('line', {x1: x, y1: y, x2: qX, y2: y, stroke: 'var(--faint)', 'stroke-width': 1}));
    HIST.appendChild(el('circle', {cx: x, cy: y, r: 4, fill: 'var(--accent)', opacity: 0.8}));
  });
}

function renderReadouts(){
  const vals = activeValues();
  const visibleCount = vals.filter(v=>!v.hidden && v.v<=VIEW_MAX).length;
  const worst = worstCaseError(vals);
  $('#roCount').textContent = visibleCount;
  $('#roWorst').textContent = worst.toFixed(3)+' beats';
  $('#roWorstMs').textContent = '≈ '+Math.round(beatsToMs(worst))+' ms';
}

function syncHandleInput(){ $('#handleInput').value = HANDLE; }

function renderAll(){ 
  renderAxis(); 
  renderError(); 
  renderVerdict(); 
  renderReadouts(); 
  renderHistory(); 
}

/* ---- wiring ---- */
$('#mods').addEventListener('click', e=>{
  const b = e.target.closest('.mod'); if(!b) return;
  const cat = b.dataset.cat;
  TOGGLES[cat] = !TOGGLES[cat];
  b.setAttribute('aria-pressed', TOGGLES[cat]);
  renderAll();
});

$('#handleInput').addEventListener('input', e=>{
  HANDLE = parseFloat(e.target.value); renderAll();
});

$('#bpm').addEventListener('input', e=>{
  BPM = parseFloat(e.target.value); $('#bpmLabel').textContent = BPM+' BPM';
  renderVerdict(); renderReadouts();
});

$('#randomize').addEventListener('click', ()=>{
  HANDLE = Math.random()*VIEW_MAX; syncHandleInput(); renderAll();
});

$('#onTarget').addEventListener('click', ()=>{
  const vals = activeValues().filter(v=>!v.hidden);
  HANDLE = vals[(Math.random()*vals.length)|0].v; syncHandleInput(); renderAll();
});

window.addEventListener('pointerup', () => {
  if (HANDLE > 0) {
    const vals = activeValues();
    const nearestVal = nearest(HANDLE, vals).value;
    HISTORY.push({ raw: HANDLE, quantized: nearestVal.v });
    renderHistory();
  }
});

$('#simRhythm').addEventListener('click', () => {
  const vals = activeValues();
  SIM_NOTES = [];
  
  const targetTriplets = [1/3, 2/3, 1.0, 4/3];
  
  targetTriplets.forEach(target => {
    const sloppyTiming = target + ((Math.random() * 0.16) - 0.08); 
    const nearestVal = nearest(sloppyTiming, vals).value;
    
    SIM_NOTES.push({ raw: sloppyTiming, quantized: nearestVal.v });
    HISTORY.push({ raw: sloppyTiming, quantized: nearestVal.v });
  });
  
  renderAll();
});

$('#clearHistory').addEventListener('click', () => {
  HISTORY = [];
  SIM_NOTES = [];
  renderAll();
});

$('#handleInput').max = VIEW_MAX;
syncHandleInput();
renderAll();