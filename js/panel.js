import * as THREE from 'three';
import { THEME, TUNE } from './theme.js';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function buildFamilyPanel(family, actColor) {
  const r   = (actColor >> 16) & 0xff;
  const g   = (actColor >>  8) & 0xff;
  const b   =  actColor        & 0xff;
  const rgb = `${r},${g},${b}`;

  const lum  = v  => Math.min(255, Math.round(v  * TUNE.brightness));
  const lumA = op => Math.min(1,   op * TUNE.brightness);
  const colors = {
    titleColor:         `rgba(${lum(r)},${lum(g)},${lum(b)},0.95)`,
    sepColor:           `rgba(${lum(r)},${lum(g)},${lum(b)},0.35)`,
    borderColor:        `rgba(${lum(r)},${lum(g)},${lum(b)},0.40)`,
    cardBgUnlocked:     `rgba(${lum(r*TUNE.cardMult)},${lum(g*TUNE.cardMult)},${lum(b*TUNE.cardBMult)},${TUNE.cardAlpha})`,
    cardBorderUnlocked: `rgba(${lum(r)},${lum(g)},${lum(b)},0.40)`,
    bgFrom:             `rgba(${lum(r*TUNE.bgMult)},${lum(g*TUNE.bgMult)},${lum(b*TUNE.bgBMult)},${TUNE.bgAlpha})`,
    bgTo:               `rgba(6,8,20,0.96)`,
    cardBgLocked:       `rgba(255,255,255,${lumA(0.04).toFixed(3)})`,
    cardBorderLocked:   `rgba(255,255,255,${lumA(0.07).toFixed(3)})`,
    lockIconOpacity:    lumA(0.35).toFixed(3),
  };

  const T     = THEME;
  const sepY  = T.padTop + T.titleSz + T.sepMargin;
  const gridY = sepY + 1 + T.gridMargin;
  const n     = family.levels.length;
  const cols  = n <= 4 ? 2 : 4;

  return {
    toTexture() {
      const TW = 640, TH = 360, CS = 2;
      const K  = (TW * CS) / T.panelW;   // converts logical panelW-space to canvas pixels
      const cv = document.createElement('canvas');
      cv.width = TW * CS; cv.height = TH * CS;
      const ctx = cv.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 0, TH * CS);
      grad.addColorStop(0, colors.bgFrom);
      grad.addColorStop(1, colors.bgTo);
      ctx.fillStyle = grad;
      roundRect(ctx, 0, 0, TW * CS, TH * CS, T.panelRadius * K);
      ctx.fill();

      ctx.strokeStyle = colors.borderColor;
      ctx.lineWidth = K;
      roundRect(ctx, K * 0.5, K * 0.5, TW * CS - K, TH * CS - K, (T.panelRadius - 0.5) * K);
      ctx.stroke();

      ctx.fillStyle = colors.titleColor;
      ctx.font = `bold ${T.titleSz * K}px 'Segoe UI', system-ui, sans-serif`;
      ctx.letterSpacing = (T.titleLS * K) + 'px';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(family.name.toUpperCase(), TW * CS / 2, (T.padTop + T.titleSz / 2) * K);
      ctx.letterSpacing = '0px';

      ctx.strokeStyle = colors.sepColor;
      ctx.lineWidth = K;
      ctx.beginPath();
      ctx.moveTo(T.padH * K, sepY * K);
      ctx.lineTo((T.panelW - T.padH) * K, sepY * K);
      ctx.stroke();

      const rows   = Math.ceil(n / cols);
      const gridW  = T.panelW - T.padH * 2;
      const gridHt = T.panelH - gridY - T.padBot;
      const cw     = (gridW - (cols - 1) * T.gap) / cols;
      const ch     = (gridHt - (rows - 1) * T.gap) / rows;

      family.levels.forEach((lvl, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx  = (T.padH + col * (cw + T.gap)) * K;
        const cy  = (gridY  + row * (ch + T.gap)) * K;
        const cws = cw * K, chs = ch * K;

        ctx.fillStyle = lvl.locked ? colors.cardBgLocked : colors.cardBgUnlocked;
        roundRect(ctx, cx, cy, cws, chs, T.cardRadius * K);
        ctx.fill();

        ctx.strokeStyle = lvl.locked ? colors.cardBorderLocked : colors.cardBorderUnlocked;
        ctx.lineWidth = K;
        roundRect(ctx, cx, cy, cws, chs, T.cardRadius * K);
        ctx.stroke();

        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (lvl.locked) {
          ctx.font = `${T.starsSz * K}px system-ui`;
          ctx.fillStyle = `rgba(255,255,255,${colors.lockIconOpacity})`;
          ctx.fillText('🔒', cx + cws / 2, cy + chs / 2);
        } else {
          ctx.font = `bold ${T.levelSz * K}px 'Segoe UI', system-ui, sans-serif`;
          ctx.fillStyle = 'rgba(255,255,255,0.92)';
          ctx.fillText(lvl.name, cx + cws / 2, cy + chs * 0.36);
          const stars = Array(5).fill(0).map((_, si) => si < lvl.stars ? '★' : '☆').join('');
          ctx.font = `${T.starsSz * K}px system-ui`;
          ctx.fillStyle = lvl.stars > 0 ? '#ffcc44' : 'rgba(255,255,255,0.15)';
          ctx.fillText(stars, cx + cws / 2, cy + chs * 0.70);
        }
      });

      return new THREE.CanvasTexture(cv);
    },

    toHTML(onLevelClick) {
      const panel = document.createElement('div');
      panel.className = 'family-panel';
      panel.style.cssText = `
        background: linear-gradient(180deg, ${colors.bgFrom} 0%, ${colors.bgTo} 100%);
        border: 1px solid ${colors.borderColor};
      `;

      const header = document.createElement('div');
      header.className = 'family-panel-header';
      header.textContent = family.name.toUpperCase();
      header.style.color = colors.titleColor;
      panel.appendChild(header);

      const sep = document.createElement('div');
      sep.className = 'family-panel-sep';
      sep.style.borderTopColor = colors.sepColor;
      panel.appendChild(sep);

      const grid = document.createElement('div');
      grid.className = 'family-panel-grid';
      grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      panel.appendChild(grid);

      family.levels.forEach((lvl) => {
        const btn = document.createElement('button');
        btn.className = 'level-card' + (lvl.locked ? ' locked' : '');
        if (lvl.locked) {
          btn.innerHTML = '<span class="lock-icon">🔒</span>';
          btn.disabled = true;
          btn.style.background   = colors.cardBgLocked;
          btn.style.borderColor  = colors.cardBorderLocked;
          btn.querySelector('.lock-icon').style.opacity = colors.lockIconOpacity;
        } else {
          const stars = Array(5).fill(0).map((_, si) =>
            `<span class="${si < lvl.stars ? 'star-filled' : 'star-empty'}">★</span>`
          ).join('');
          btn.innerHTML = `<span class="level-name">${lvl.name}</span><span class="level-stars">${stars}</span>`;
          btn.style.cssText = `
            background: ${colors.cardBgUnlocked};
            border-color: ${colors.cardBorderUnlocked};
          `;
          btn.addEventListener('click', e => { e.stopPropagation(); onLevelClick(lvl.name); });
        }
        grid.appendChild(btn);
      });

      return panel;
    }
  };
}
