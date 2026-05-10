import { TUNE }             from './theme.js';
import { buildFamilyPanel } from './panel.js';
import { FAMILIES_DATA }    from './data.js';

// Sujet de prévisualisation : Français > Dictée > Mots courants
const PREVIEW_FAMILY = FAMILIES_DATA['Dictée'][0];
const PREVIEW_COLOR  = 0xff4466;

const SLIDERS = [
  { key: 'bgMult',    label: 'Fond R,G',     min: 0,    max: 0.5, step: 0.005, fmt: v => v.toFixed(3) },
  { key: 'bgBMult',   label: 'Fond B',       min: 0,    max: 0.5, step: 0.005, fmt: v => v.toFixed(3) },
  { key: 'bgAlpha',   label: 'Fond alpha',   min: 0.5,  max: 1,   step: 0.01,  fmt: v => v.toFixed(2) },
  { key: 'cardMult',  label: 'Carte R,G',    min: 0,    max: 0.5, step: 0.005, fmt: v => v.toFixed(3) },
  { key: 'cardBMult', label: 'Carte B',      min: 0,    max: 0.5, step: 0.005, fmt: v => v.toFixed(3) },
  { key: 'cardAlpha', label: 'Carte alpha',  min: 0.5,  max: 1,   step: 0.01,  fmt: v => v.toFixed(2) },
];

// ── DOM ──────────────────────────────────────────────────────────
const overlay = document.createElement('div');
overlay.id = 'debug-overlay';
Object.assign(overlay.style, {
  display:        'none',
  position:       'fixed',
  inset:          '0',
  background:     'rgba(4,6,18,0.97)',
  zIndex:         '200',
  overflowY:      'auto',
  fontFamily:     "'Segoe UI', system-ui, sans-serif",
  color:          '#fff',
  padding:        '28px 32px',
  boxSizing:      'border-box',
});
document.body.appendChild(overlay);

// Titre
const title = document.createElement('div');
title.textContent = 'Balance couleurs — Français › Dictée › Mots courants';
Object.assign(title.style, {
  fontSize:      '11px',
  letterSpacing: '2.5px',
  textTransform: 'uppercase',
  opacity:       '0.45',
  marginBottom:  '20px',
});
overlay.appendChild(title);

// ── Previews ─────────────────────────────────────────────────────
const previewRow = document.createElement('div');
Object.assign(previewRow.style, {
  display:       'flex',
  gap:           '28px',
  marginBottom:  '28px',
  alignItems:    'flex-start',
  flexWrap:      'wrap',
});
overlay.appendChild(previewRow);

function makePreviewBox(labelText) {
  const box = document.createElement('div');
  const lbl = document.createElement('div');
  lbl.textContent = labelText;
  Object.assign(lbl.style, {
    fontSize:      '10px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    opacity:       '0.4',
    marginBottom:  '8px',
  });
  box.appendChild(lbl);
  return box;
}

// Canvas preview
const cvBox  = makePreviewBox('Canvas — carrousel (opacité simulée)');
const cvWrap = document.createElement('div');
Object.assign(cvWrap.style, {
  position:     'relative',
  width:        '480px',
  height:       '270px',
  background:   'radial-gradient(ellipse at 28% 38%, #0d1535 0%, #060612 65%)',
  borderRadius: '10px',
  overflow:     'hidden',
});
const cvImg = document.createElement('img');
cvImg.id = 'dbg-canvas-img';
Object.assign(cvImg.style, {
  position:     'absolute',
  inset:        '0',
  width:        '100%',
  height:       '100%',
  borderRadius: '10px',
  display:      'block',
});
cvWrap.appendChild(cvImg);
cvBox.appendChild(cvWrap);
previewRow.appendChild(cvBox);

// HTML preview
const htmlBox  = makePreviewBox('HTML — panneau zoom');
const htmlWrap = document.createElement('div');
Object.assign(htmlWrap.style, {
  width:        '480px',
  height:       '270px',
  background:   'radial-gradient(ellipse at 28% 38%, #0d1535 0%, #060612 65%)',
  borderRadius: '10px',
  overflow:     'hidden',
  position:     'relative',
});
htmlBox.appendChild(htmlWrap);
previewRow.appendChild(htmlBox);

// ── Opacité simulée ───────────────────────────────────────────────
let previewOpacity = 0.85;

const opRow = document.createElement('div');
Object.assign(opRow.style, { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' });
const opLabel = document.createElement('span');
opLabel.textContent = 'Opacité carrousel (THREE)';
Object.assign(opLabel.style, { fontSize: '12px', letterSpacing: '1px', opacity: '0.7', width: '200px', flexShrink: '0' });
const opInput = document.createElement('input');
opInput.type = 'range'; opInput.min = 0.3; opInput.max = 1; opInput.step = 0.01; opInput.value = previewOpacity;
opInput.style.cssText = 'flex: 1; max-width: 300px; accent-color: #33ffaa;';
const opVal = document.createElement('span');
opVal.textContent = previewOpacity.toFixed(2);
Object.assign(opVal.style, { fontFamily: 'monospace', fontSize: '12px', width: '40px', textAlign: 'right' });
opInput.addEventListener('input', () => {
  previewOpacity = parseFloat(opInput.value);
  opVal.textContent = previewOpacity.toFixed(2);
  cvImg.style.opacity = previewOpacity;
});
opRow.append(opLabel, opInput, opVal);
overlay.appendChild(opRow);

// ── Sliders couleurs ─────────────────────────────────────────────
const sep = document.createElement('div');
Object.assign(sep.style, { borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' });
overlay.appendChild(sep);

const slidersGrid = document.createElement('div');
Object.assign(slidersGrid.style, {
  display:             'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
  gap:                 '14px 48px',
  maxWidth:            '960px',
  marginBottom:        '28px',
});
overlay.appendChild(slidersGrid);

const valSpans = {};

SLIDERS.forEach(s => {
  const row = document.createElement('div');
  Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '12px' });

  const label = document.createElement('span');
  label.textContent = s.label;
  Object.assign(label.style, {
    width:         '90px',
    fontSize:      '12px',
    letterSpacing: '1px',
    opacity:       '0.65',
    flexShrink:    '0',
  });

  const input = document.createElement('input');
  input.type  = 'range';
  input.min   = s.min;
  input.max   = s.max;
  input.step  = s.step;
  input.value = TUNE[s.key];
  input.style.cssText = 'flex: 1; accent-color: #4488ff;';

  const val = document.createElement('span');
  val.textContent = s.fmt(TUNE[s.key]);
  Object.assign(val.style, {
    fontFamily: 'monospace',
    fontSize:   '12px',
    width:      '44px',
    textAlign:  'right',
  });
  valSpans[s.key] = val;

  input.addEventListener('input', () => {
    TUNE[s.key] = parseFloat(input.value);
    val.textContent = s.fmt(TUNE[s.key]);
    refresh();
  });

  row.append(label, input, val);
  slidersGrid.appendChild(row);
});

// ── Résumé des valeurs ────────────────────────────────────────────
const summary = document.createElement('div');
Object.assign(summary.style, {
  fontFamily:    'monospace',
  fontSize:      '11px',
  background:    'rgba(255,255,255,0.04)',
  border:        '1px solid rgba(255,255,255,0.1)',
  borderRadius:  '8px',
  padding:       '12px 16px',
  maxWidth:      '600px',
  letterSpacing: '0.5px',
  lineHeight:    '1.8',
  marginBottom:  '16px',
});
overlay.appendChild(summary);

function updateSummary() {
  summary.innerHTML = SLIDERS.map(s =>
    `<span style="opacity:0.45">${s.key.padEnd(12)}</span>  ${s.fmt(TUNE[s.key])}`
  ).join('<br>') +
  `<br><span style="opacity:0.45">prismOpacity</span>  ${previewOpacity.toFixed(2)}`;
}

// ── Hint ─────────────────────────────────────────────────────────
const hint = document.createElement('div');
hint.textContent = 'D  —  fermer';
Object.assign(hint.style, { fontSize: '10px', letterSpacing: '2px', opacity: '0.25', textTransform: 'uppercase' });
overlay.appendChild(hint);

// ── Refresh ───────────────────────────────────────────────────────
function refresh() {
  const panel = buildFamilyPanel(PREVIEW_FAMILY, PREVIEW_COLOR);

  // Canvas preview (via tex.image)
  const tex = panel.toTexture();
  cvImg.src = tex.image.toDataURL();
  cvImg.style.opacity = previewOpacity;
  tex.dispose();

  // HTML preview (scaled 0.5 inside 480×270 container)
  htmlWrap.innerHTML = '';
  const hp = panel.toHTML(() => {});
  hp.style.transform       = 'scale(0.5)';
  hp.style.transformOrigin = 'top left';
  hp.style.backdropFilter  = 'none';
  hp.style.webkitBackdropFilter = 'none';
  htmlWrap.appendChild(hp);

  updateSummary();
}

// ── Toggle D ─────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if ((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.metaKey) {
    const open = overlay.style.display === 'none';
    overlay.style.display = open ? 'block' : 'none';
    if (open) refresh();
  }
});
