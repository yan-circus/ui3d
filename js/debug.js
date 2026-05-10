import { TUNE } from './theme.js';

const SLIDERS = [
  { key: 'bgMult',    label: 'Fond R,G',     min: 0,   max: 0.5, step: 0.005, fmt: v => v.toFixed(3) },
  { key: 'bgBMult',   label: 'Fond B',       min: 0,   max: 0.5, step: 0.005, fmt: v => v.toFixed(3) },
  { key: 'bgAlpha',   label: 'Fond alpha',   min: 0.5, max: 1,   step: 0.01,  fmt: v => v.toFixed(2) },
  { key: 'cardMult',  label: 'Carte R,G',    min: 0,   max: 0.5, step: 0.005, fmt: v => v.toFixed(3) },
  { key: 'cardBMult', label: 'Carte B',      min: 0,   max: 0.5, step: 0.005, fmt: v => v.toFixed(3) },
  { key: 'cardAlpha', label: 'Carte alpha',  min: 0.5, max: 1,   step: 0.01,  fmt: v => v.toFixed(2) },
];

// ── Panneau flottant ─────────────────────────────────────────────
const panel = document.createElement('div');
Object.assign(panel.style, {
  display:         'none',
  position:        'fixed',
  bottom:          '24px',
  right:           '24px',
  width:           '290px',
  padding:         '14px 16px 12px',
  borderRadius:    '14px',
  background:      'rgba(4,6,18,0.82)',
  border:          '1px solid rgba(255,255,255,0.12)',
  backdropFilter:  'blur(18px)',
  webkitBackdropFilter: 'blur(18px)',
  fontFamily:      "'Segoe UI', system-ui, sans-serif",
  color:           '#fff',
  zIndex:          '300',
  boxSizing:       'border-box',
});
document.body.appendChild(panel);

// En-tête
const header = document.createElement('div');
Object.assign(header.style, {
  display:       'flex',
  justifyContent:'space-between',
  alignItems:    'center',
  marginBottom:  '12px',
});
const headerTitle = document.createElement('span');
headerTitle.textContent = 'Balance couleurs';
Object.assign(headerTitle.style, { fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: '0.5' });
const headerHint = document.createElement('span');
headerHint.textContent = 'D  ✕';
Object.assign(headerHint.style, { fontSize: '10px', opacity: '0.3', cursor: 'pointer', letterSpacing: '1px' });
headerHint.addEventListener('click', hide);
header.append(headerTitle, headerHint);
panel.appendChild(header);

// Sliders
const rows = document.createElement('div');
Object.assign(rows.style, { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' });

SLIDERS.forEach(s => {
  const row = document.createElement('div');
  Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '8px' });

  const label = document.createElement('span');
  label.textContent = s.label;
  Object.assign(label.style, { width: '76px', fontSize: '11px', opacity: '0.6', flexShrink: '0' });

  const input = document.createElement('input');
  input.type = 'range'; input.min = s.min; input.max = s.max;
  input.step = s.step; input.value = TUNE[s.key];
  Object.assign(input.style, { flex: '1', accentColor: '#4488ff' });

  const val = document.createElement('span');
  val.textContent = s.fmt(TUNE[s.key]);
  Object.assign(val.style, { fontFamily: 'monospace', fontSize: '11px', width: '36px', textAlign: 'right', opacity: '0.85' });

  input.addEventListener('input', () => {
    TUNE[s.key] = parseFloat(input.value);
    val.textContent = s.fmt(TUNE[s.key]);
    updateSummary();
    window.dispatchEvent(new Event('tune-changed'));
  });

  row.append(label, input, val);
  rows.appendChild(row);
});
panel.appendChild(rows);

// Résumé copiable
const summary = document.createElement('pre');
Object.assign(summary.style, {
  margin:       '0',
  padding:      '8px 10px',
  borderRadius: '8px',
  background:   'rgba(255,255,255,0.04)',
  border:       '1px solid rgba(255,255,255,0.07)',
  fontSize:     '10px',
  fontFamily:   'monospace',
  lineHeight:   '1.7',
  opacity:      '0.75',
  userSelect:   'text',
  webkitUserSelect: 'text',
  cursor:       'text',
  whiteSpace:   'pre',
});
panel.appendChild(summary);

function updateSummary() {
  summary.textContent = SLIDERS.map(s => `${s.key.padEnd(11)} ${s.fmt(TUNE[s.key])}`).join('\n');
}
updateSummary();

// ── Toggle ────────────────────────────────────────────────────────
function show() { panel.style.display = 'block'; }
function hide() { panel.style.display = 'none'; }

document.addEventListener('keydown', e => {
  if ((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.metaKey && !e.altKey) {
    panel.style.display === 'none' ? show() : hide();
  }
});
