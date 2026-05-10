import * as THREE from 'three';
import { FAMILIES_DATA }          from './data.js';
import { applyThemeVars }         from './theme.js';
import { buildFamilyPanel }       from './panel.js';

applyThemeVars();

// ── RENDERER ────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const W = () => window.innerWidth;
const H = () => window.innerHeight;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(W(), H());
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(48, W() / H(), 0.1, 200);

let   camDist     = 12.0;
const CAM_PHI_MIN = -30 * Math.PI / 180;
const CAM_PHI_MAX =  30 * Math.PI / 180;
let   camPhi      =  30 * Math.PI / 180;

function updateCamera() {
  camera.position.set(0, camDist * Math.sin(camPhi), camDist * Math.cos(camPhi));
  camera.lookAt(0, 0, 0);
}
updateCamera();

// ── LUMIÈRES ────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x1a2a55, 2));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
keyLight.position.set(5, 10, 6);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0x3355ff, 1.0);
fillLight.position.set(-8, -5, -5);
scene.add(fillLight);

// ── ÉTOILES ─────────────────────────────────────────────────────
(() => {
  const n = 1200, pos = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i++) pos[i] = (Math.random() - 0.5) * 120;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.09, sizeAttenuation: true,
    transparent: true, opacity: 0.55
  })));
})();

const texLoader = new THREE.TextureLoader();

// ── DONNÉES DES ACTIVITÉS ───────────────────────────────────────
const ACTIVITIES = [
  {
    name: 'Mathématiques',
    color: 0x4488ff, emissive: 0x0a1a3a,
    makeGeo: () => new THREE.SphereGeometry(0.72, 32, 32),
    games: ['Addition', 'Multiplication', 'Géométrie']
  },
  {
    name: 'Français',
    color: 0xff4466, emissive: 0x3a0a14,
    makeGeo: () => new THREE.SphereGeometry(0.72, 32, 32),
    texturePath: 'assets/sphere_french_map.jpg',
    games: ['Grammaire', 'Conjugaison', 'Lecture', 'Dictée']
  },
  {
    name: 'Anglais',
    color: 0x33ffaa, emissive: 0x0a3a22,
    makeGeo: () => new THREE.SphereGeometry(0.72, 32, 32),
    games: ['Vocabulary', 'Grammar', 'Listening', 'Speaking', 'Reading', 'Writing']
  },
  {
    name: 'Géographie',
    color: 0xffaa33, emissive: 0x3a2200,
    makeGeo: () => new THREE.SphereGeometry(0.72, 32, 32),
    games: ['Capitales']
  }
];

const HOME_R         = 3.5;
const GAME_R         = 2.8;
const PRISM_R        = 2.2;
const FACE_W         = 3.2;
const FACE_H         = 1.8;
const PRISM_CAM_DIST = 9.0;
const ZOOM_CAM_DIST  = 4.5;

// ── GROUPES ─────────────────────────────────────────────────────
const homeGroup  = new THREE.Group();
const actGroup   = new THREE.Group();
const prismGroup = new THREE.Group();
scene.add(homeGroup, actGroup, prismGroup);
actGroup.visible   = false;
prismGroup.visible = false;

// ── HELPERS ─────────────────────────────────────────────────────
function makeMat(color, emissive, extraOpts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: new THREE.Color(emissive),
    roughness: 0.28, metalness: 0.62,
    transparent: true, opacity: 1,
    ...extraOpts
  });
}

function addOrbitRing(radius, parent) {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.012, 8, 128),
    new THREE.MeshBasicMaterial({ color: 0x2a3a66, transparent: true, opacity: 0.38 })
  );
  mesh.rotation.x = Math.PI / 2;
  parent.add(mesh);
  return mesh;
}

// ── SCÈNE ACCUEIL ───────────────────────────────────────────────
const homeRing = addOrbitRing(HOME_R, homeGroup);

const homeGems = [];

const homeSats = ACTIVITIES.map((act, i) => {
  const angle = (i / ACTIVITIES.length) * Math.PI * 2;
  const mesh  = new THREE.Mesh(act.makeGeo(), makeMat(act.color, act.emissive));
  mesh.position.set(Math.cos(angle) * HOME_R, 0, Math.sin(angle) * HOME_R);
  mesh.userData = { type: 'activity', idx: i };

  mesh.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 12, 12),
    new THREE.MeshBasicMaterial({ color: act.color, transparent: true, opacity: 0.055, side: THREE.BackSide })
  ));

  if (act.texturePath) {
    texLoader.load(act.texturePath, tex => {
      mesh.material.map = tex;
      mesh.material.color.set(0xffffff);
      mesh.material.needsUpdate = true;
    });
  }

  homeGroup.add(mesh);
  return mesh;
});

ACTIVITIES.forEach((act, i) => {
  const actAngle = (i / ACTIVITIES.length) * Math.PI * 2;
  const ax = Math.cos(actAngle) * HOME_R;
  const az = Math.sin(actAngle) * HOME_R;
  act.games.forEach((_, j) => {
    const m = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.13, 0),
      makeMat(act.color, act.emissive, { opacity: 0, roughness: 0.06, metalness: 0.05 })
    );
    m.scale.y = 1.56;
    homeGroup.add(m);
    homeGems.push({ mesh: m, actIdx: i, gemIdx: j, ax, az });
  });
});

// ── SCÈNE ACTIVITÉ ──────────────────────────────────────────────
let centerMesh = null;
let gameSats   = [];

function buildActScene(idx) {
  while (actGroup.children.length) actGroup.remove(actGroup.children[0]);
  gameSats = []; centerMesh = null;

  const act = ACTIVITIES[idx];

  centerMesh = new THREE.Mesh(act.makeGeo(), makeMat(act.color, act.emissive));
  centerMesh.scale.setScalar(1.5);
  if (act.texturePath) {
    texLoader.load(act.texturePath, tex => {
      centerMesh.material.map = tex;
      centerMesh.material.color.set(0xffffff);
      centerMesh.material.needsUpdate = true;
    });
  }
  actGroup.add(centerMesh);

  addOrbitRing(GAME_R, actGroup);

  act.games.forEach((name, j) => {
    const angle = (j / act.games.length) * Math.PI * 2;
    const m = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.38, 0),
      makeMat(act.color, act.emissive, { opacity: 0, roughness: 0.06, metalness: 0.05 })
    );
    m.position.set(Math.cos(angle) * GAME_R, 0, Math.sin(angle) * GAME_R);
    m.userData = { type: 'game', name };
    actGroup.add(m);
    gameSats.push(m);
  });
}

// ── LABELS HTML ─────────────────────────────────────────────────
function mkLabel(text) {
  const el = document.createElement('div');
  el.className = 'label';
  el.textContent = text;
  document.body.appendChild(el);
  return el;
}

const homeLabels = ACTIVITIES.map(a => mkLabel(a.name));
let   gameLabels = [];
const _v = new THREE.Vector3();

function posLabel(el, mesh) {
  mesh.getWorldPosition(_v);
  _v.project(camera);
  el.style.left = ((_v.x *  0.5 + 0.5) * W()) + 'px';
  el.style.top  = ((-_v.y * 0.5 + 0.5) * H() + 52) + 'px';
}
function hideLabels(els) { els.forEach(el => { el.style.display = 'none'; }); }

// ── PRISME ───────────────────────────────────────────────────────
let prismFaces    = [];
let frontFace     = null;
let prismActIdx   = -1;
let currentPrismR = PRISM_R;

function computePrismR(N) {
  if (N <= 1) return PRISM_R;
  const R_bord = FACE_W / (2 * Math.tan(Math.PI / N));
  return Math.max(PRISM_R, R_bord);
}

function buildPrism(gameName, actIdx) {
  while (prismGroup.children.length) prismGroup.remove(prismGroup.children[0]);
  prismFaces  = [];
  prismActIdx = actIdx;

  const families = FAMILIES_DATA[gameName] ?? [];
  const act      = ACTIVITIES[actIdx];
  const N        = families.length;
  if (!N) return;

  currentPrismR = computePrismR(N);

  families.forEach((fam, i) => {
    const angle = (i / N) * Math.PI * 2;
    const tex   = buildFamilyPanel(fam, act.color).toTexture();
    const mat   = new THREE.MeshStandardMaterial({
      map: tex, transparent: true, opacity: 0,
      roughness: 0.15, metalness: 0.05,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(FACE_W, FACE_H), mat);
    mesh.position.set(Math.sin(angle) * currentPrismR, 0, Math.cos(angle) * currentPrismR);
    mesh.rotation.y = angle;
    mesh.userData   = { type: 'face', familyIdx: i, gameName };
    prismGroup.add(mesh);
    prismFaces.push(mesh);
  });
}

function updateFrontFace() {
  if (state !== 'prism' && state !== 'prism-zoom') { frontFace = null; return; }
  let minDist = Infinity;
  frontFace = null;
  prismFaces.forEach(m => {
    m.getWorldPosition(_v);
    const d = camera.position.distanceToSquared(_v);
    if (d < minDist) { minDist = d; frontFace = m; }
  });
}

// ── PANEL OVERLAY ────────────────────────────────────────────────
const panelOverlay = document.getElementById('panel-overlay');

panelOverlay.addEventListener('click', () => {
  if (state === 'prism-zoom') zoomOutFace();
});

function applyPanelScale() {
  const panel = panelOverlay.querySelector('.family-panel');
  if (!panel) return;
  const scaleX = (window.innerWidth  * 0.88) / 960;
  const scaleY = (window.innerHeight * 0.85) / 540;
  panel.style.transform = `scale(${Math.min(scaleX, scaleY)})`;
}

function showPanelOverlay(face) {
  const { familyIdx, gameName } = face.userData;
  const family = FAMILIES_DATA[gameName]?.[familyIdx];
  if (!family) return;

  const panel = buildFamilyPanel(family, ACTIVITIES[prismActIdx].color).toHTML(levelName => {
    showToast(levelName);
  });
  panel.addEventListener('click', e => e.stopPropagation());

  panelOverlay.innerHTML = '';
  panelOverlay.appendChild(panel);
  applyPanelScale();
  panelOverlay.style.opacity = '1';
  panelOverlay.style.pointerEvents = 'auto';
}

function hidePanelOverlay() {
  panelOverlay.style.opacity = '0';
  panelOverlay.style.pointerEvents = 'none';
}

// ── SCINTILLEMENT ────────────────────────────────────────────────
function makeSparkleTexture() {
  const s = 64, c = s / 2;
  const cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0,    'rgba(255,255,255,1)');
  g.addColorStop(0.15, 'rgba(255,255,255,0.8)');
  g.addColorStop(0.5,  'rgba(255,255,255,0.2)');
  g.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(c, 4);   ctx.lineTo(c, s - 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(4, c);   ctx.lineTo(s - 4, c); ctx.stroke();
  return new THREE.CanvasTexture(cv);
}

const sparkleTex = makeSparkleTexture();
const SPARK_N    = 40;
const sparkles   = [];

for (let i = 0; i < SPARK_N; i++) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({
    map: sparkleTex, blending: THREE.NormalBlending,
    transparent: true, opacity: 0, depthWrite: false
  }));
  sp.scale.setScalar(0.01);
  sp.userData = { active: false, life: 0, maxLife: 1, vx: 0, vy: 0, vz: 0, sz: 0.1 };
  scene.add(sp);
  sparkles.push(sp);
}

const _sp = new THREE.Vector3();

function resetSparkle(sp, origin) {
  const angle = Math.random() * Math.PI * 2;
  const r     = Math.random() * 0.5;
  sp.position.set(
    origin.x + Math.cos(angle) * r,
    origin.y + (Math.random() - 0.3) * 0.5,
    origin.z + Math.sin(angle) * r
  );
  const d   = sp.userData;
  d.vx      = (Math.random() - 0.5) * 0.018;
  d.vy      = 0.013 + Math.random() * 0.022;
  d.vz      = (Math.random() - 0.5) * 0.018;
  d.maxLife = 55 + Math.random() * 65;
  d.life    = 0;
  d.sz      = 0.08 + Math.random() * 0.14;
  d.active  = true;
}

// ── ÉTAT ────────────────────────────────────────────────────────
// 'home' | 'act' | 'prism' | 'prism-zoom' | 'busy'
let state        = 'home';
let currentIdx   = -1;
let prevFrontSat = null;

const titleEl = document.getElementById('title');
const backBtn = document.getElementById('back-btn');
const toastEl = document.getElementById('toast');
let   toastTimer = null;

// ── DRAG ────────────────────────────────────────────────────────
let dragging  = false, dragMoved = false;
let px0 = 0, pxLast = 0, vel  = 0;
let py0 = 0, pyLast = 0, velY = 0;

const curGroup = () => {
  if (state === 'act')                             return actGroup;
  if (state === 'prism' || state === 'prism-zoom') return prismGroup;
  return homeGroup;
};

function startDrag(x, y) {
  dragging = true; dragMoved = false;
  px0 = pxLast = x; vel  = 0;
  py0 = pyLast = y; velY = 0;
  canvas.style.cursor = 'grabbing';
}
function doDrag(x, y) {
  if (!dragging) return;
  const dx = x - pxLast;
  const dy = y - pyLast;
  if (Math.abs(x - px0) > 4 || Math.abs(y - py0) > 4) dragMoved = true;
  if (state !== 'prism-zoom') {
    curGroup().rotation.y += dx * 0.007;
    camPhi = Math.max(CAM_PHI_MIN, Math.min(CAM_PHI_MAX, camPhi + dy * 0.005));
    vel = dx; velY = dy;
  }
  pxLast = x; pyLast = y;
}
function endDrag(x, y) {
  if (!dragging) return;
  dragging = false;
  canvas.style.cursor = hovered ? 'pointer' : 'grab';
  if (!dragMoved) handleClick(x, y);
}

canvas.addEventListener('mousedown',  e => startDrag(e.clientX, e.clientY));
canvas.addEventListener('mousemove',  e => doDrag(e.clientX, e.clientY));
canvas.addEventListener('mouseup',    e => endDrag(e.clientX, e.clientY));
canvas.addEventListener('mouseleave', () => { dragging = false; canvas.style.cursor = 'grab'; });
canvas.addEventListener('touchstart', e => startDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
canvas.addEventListener('touchmove',  e => { e.preventDefault(); doDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
canvas.addEventListener('touchend',   e => endDrag(e.changedTouches[0].clientX, e.changedTouches[0].clientY));
canvas.addEventListener('contextmenu', e => e.preventDefault());

// ── RAYCAST ─────────────────────────────────────────────────────
const rc = new THREE.Raycaster();
const m2 = new THREE.Vector2();

function rootSat(obj) { while (obj && !obj.userData.type) obj = obj.parent; return obj; }

function handleClick(cx, cy) {
  if (state === 'busy' || navigating) return;
  m2.set((cx / W()) * 2 - 1, -(cy / H()) * 2 + 1);
  rc.setFromCamera(m2, camera);

  if (state === 'home' || state === 'act') {
    const pool = state === 'home' ? homeSats : gameSats;
    const hits = rc.intersectObjects(pool, true);
    if (!hits.length) return;
    const sat = rootSat(hits[0].object);
    if (!sat || sat !== frontSat) return;
    if (state === 'home' && sat.userData.type === 'activity') toActivity(sat.userData.idx);
    if (state === 'act'  && sat.userData.type === 'game')     toPrism(sat.userData.name);
  }

  if (state === 'prism') {
    const hits = rc.intersectObjects(prismFaces, false);
    if (hits.length && hits[0].object === frontFace) zoomInFace();
  }
}

// ── SATELLITE / FACE DE DEVANT ───────────────────────────────────
let frontSat = null;

function updateFrontSat() {
  const sats = state === 'home' ? homeSats : state === 'act' ? gameSats : [];
  let minDist = Infinity;
  frontSat = null;
  sats.forEach(m => {
    m.getWorldPosition(_v);
    const d = camera.position.distanceToSquared(_v);
    if (d < minDist) { minDist = d; frontSat = m; }
  });
}

// ── HOVER ────────────────────────────────────────────────────────
let hovered = null;

canvas.addEventListener('mousemove', e => {
  if (dragging || state === 'busy') return;
  m2.set((e.clientX / W()) * 2 - 1, -(e.clientY / H()) * 2 + 1);
  rc.setFromCamera(m2, camera);
  const pool = state === 'home' ? homeSats : (state === 'act' ? gameSats : []);
  const hit  = rc.intersectObjects(pool, true).map(h => rootSat(h.object))[0] ?? null;
  const sat  = hit === frontSat ? hit : null;
  if (sat !== hovered) {
    hovered = sat;
    canvas.style.cursor = sat ? 'pointer' : 'grab';
  }
});

// ── TWEEN HELPER ─────────────────────────────────────────────────
function tween(ms, onTick, onDone) {
  const t0   = performance.now();
  const ease = t => t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
  const tick = () => {
    const raw = Math.min((performance.now() - t0) / ms, 1);
    onTick(ease(raw));
    raw < 1 ? requestAnimationFrame(tick) : onDone?.();
  };
  requestAnimationFrame(tick);
}

// ── NAVIGATION ───────────────────────────────────────────────────
let navigating = false;

const easeOutBack = t => {
  const c1 = 1.2, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

function navigateOrbit(dir) {
  if (navigating || state === 'busy' || !frontSat) return;
  const sats  = state === 'home' ? homeSats : gameSats;
  const n     = sats.length;
  const k     = sats.indexOf(frontSat);
  const nextK = (k - dir + n) % n;
  const alpha    = (nextK / n) * Math.PI * 2;
  const rawTheta = alpha - Math.PI / 2;
  const group    = curGroup();
  const current  = group.rotation.y;
  let   target   = rawTheta;
  while (target - current >  Math.PI) target -= Math.PI * 2;
  while (target - current < -Math.PI) target += Math.PI * 2;
  navigating = true;
  vel = 0; velY = 0;
  tween(440, t => {
    group.rotation.y = current + (target - current) * easeOutBack(t);
  }, () => { group.rotation.y = target; navigating = false; });
}

function navigatePrism(dir) {
  if (navigating || state !== 'prism' || !frontFace) return;
  const n     = prismFaces.length;
  const k     = prismFaces.indexOf(frontFace);
  const nextK = (k + dir + n) % n;
  const current = prismGroup.rotation.y;
  let   target  = -(nextK / n) * Math.PI * 2;
  while (target - current >  Math.PI) target -= Math.PI * 2;
  while (target - current < -Math.PI) target += Math.PI * 2;
  navigating = true;
  vel = 0;
  tween(440, t => {
    prismGroup.rotation.y = current + (target - current) * easeOutBack(t);
  }, () => { prismGroup.rotation.y = target; navigating = false; });
}

// ── TRANSITIONS ─────────────────────────────────────────────────
function toActivity(idx) {
  if (state !== 'home') return;
  state = 'busy'; currentIdx = idx; hovered = null;

  buildActScene(idx);
  gameLabels.forEach(l => l.remove());
  gameLabels = ACTIVITIES[idx].games.map(g => mkLabel(g));
  hideLabels(homeLabels);

  tween(480, t => {
    homeSats.forEach(m => { m.material.opacity = 1 - t; });
    homeRing.material.opacity = 0.38 * (1 - t);
  }, () => {
    homeGroup.visible = false;
    actGroup.visible  = true;
    actGroup.rotation.y = 0;
    titleEl.textContent   = ACTIVITIES[idx].name;
    backBtn.style.display = 'block';
    tween(500, t => {
      gameSats.forEach(m => { m.material.opacity = t * 0.5; });
    }, () => { state = 'act'; });
  });
}

function toHome() {
  if (state !== 'act') return;
  state = 'busy'; hovered = null;
  hideLabels(gameLabels);

  tween(400, t => {
    gameSats.forEach(m => { m.material.opacity = 0.5 * (1 - t); });
  }, () => {
    actGroup.visible  = false;
    homeGroup.visible = true;
    homeSats.forEach(m => { m.material.opacity = 1; });
    homeRing.material.opacity = 0.38;
    titleEl.textContent   = 'Choisir une activité';
    backBtn.style.display = 'none';
    gameLabels.forEach(l => l.remove());
    gameLabels = [];
    currentIdx = -1;
    state = 'home';
  });
}

function toPrism(gameName) {
  if (state !== 'act') return;
  state = 'busy'; hovered = null;

  buildPrism(gameName, currentIdx);
  prismGroup.visible    = true;
  prismGroup.rotation.y = 0;
  camPhi = 30 * Math.PI / 180;
  titleEl.textContent   = gameName;
  const startDist = camDist;

  tween(440, t => {
    camDist = startDist + (PRISM_CAM_DIST - startDist) * t;
    gameSats.forEach(m => { m.material.opacity = 0.5 * (1 - t); });
    prismFaces.forEach(m => { m.material.opacity = t * 0.65; });
  }, () => {
    actGroup.visible = false;
    state = 'prism';
  });
}

function backFromPrism() {
  if (state !== 'prism' && state !== 'prism-zoom') return;
  state = 'busy';
  hidePanelOverlay();
  const startDist = camDist;

  tween(400, t => {
    camDist = startDist + (12 - startDist) * t;
    prismFaces.forEach(m => { m.material.opacity = 1 - t; });
    gameSats.forEach(m => { m.material.opacity = t * 0.5; });
  }, () => {
    prismGroup.visible = false;
    actGroup.visible   = true;
    camDist = 12;
    titleEl.textContent = ACTIVITIES[currentIdx].name;
    state = 'act';
  });
}

function zoomInFace() {
  if (state !== 'prism') return;
  state = 'busy';

  const faceToBring    = frontFace;
  const k              = prismFaces.indexOf(faceToBring);
  const N              = prismFaces.length;
  const startDist      = camDist;
  const startPhi       = camPhi;
  const startGroupRotY = prismGroup.rotation.y;

  let deltaRot = (-(k / N) * Math.PI * 2) - startGroupRotY;
  while (deltaRot >  Math.PI) deltaRot -= Math.PI * 2;
  while (deltaRot < -Math.PI) deltaRot += Math.PI * 2;

  tween(500, t => {
    camDist               = startDist + (ZOOM_CAM_DIST - startDist) * t;
    camPhi                = startPhi  + (0 - startPhi) * t;
    prismGroup.rotation.y = startGroupRotY + deltaRot * t;
    prismFaces.forEach(m => {
      const target = m === faceToBring ? 1.0 : 0.0;
      m.material.opacity += (target - m.material.opacity) * 0.12;
    });
  }, () => {
    camDist               = ZOOM_CAM_DIST;
    camPhi                = 0;
    prismGroup.rotation.y = startGroupRotY + deltaRot;
    state = 'prism-zoom';
    showPanelOverlay(faceToBring);
  });
}

function zoomOutFace() {
  if (state !== 'prism-zoom') return;
  state = 'busy';
  hidePanelOverlay();

  const startDist   = camDist;
  const startPhi    = camPhi;
  const currentFace = frontFace;

  tween(400, t => {
    camDist = startDist + (PRISM_CAM_DIST - startDist) * t;
    camPhi  = startPhi  + (30 * Math.PI / 180 - startPhi) * t;
    prismFaces.forEach(m => {
      const target = (m === currentFace) ? 1.0 : 0.65;
      m.material.opacity += (target - m.material.opacity) * 0.1;
    });
  }, () => {
    camDist = PRISM_CAM_DIST;
    camPhi  = 30 * Math.PI / 180;
    state   = 'prism';
  });
}

backBtn.addEventListener('click', () => {
  if (state === 'prism' || state === 'prism-zoom') backFromPrism();
  else toHome();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (state === 'prism-zoom') { zoomOutFace(); return; }
    if (state === 'prism')      { backFromPrism(); return; }
    toHome(); return;
  }
  if (state === 'prism') {
    if (e.key === 'ArrowLeft')  navigatePrism(+1);
    if (e.key === 'ArrowRight') navigatePrism(-1);
    if (e.key === 'Enter' && frontFace) zoomInFace();
    return;
  }
  if (state === 'prism-zoom') return;
  if (state === 'busy') return;
  if (e.key === 'ArrowLeft')  navigateOrbit(+1);
  if (e.key === 'ArrowRight') navigateOrbit(-1);
  if (e.key === 'Enter' && frontSat) {
    if (state === 'home') toActivity(frontSat.userData.idx);
    if (state === 'act')  toPrism(frontSat.userData.name);
  }
});

// ── TOAST ────────────────────────────────────────────────────────
function showToast(name) {
  clearTimeout(toastTimer);
  toastEl.textContent = `${name} — page à venir`;
  toastEl.style.opacity = '1';
  toastTimer = setTimeout(() => { toastEl.style.opacity = '0'; }, 2000);
}

// ── BOUCLE D'ANIMATION ───────────────────────────────────────────
const clock = new THREE.Clock();
const _s    = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  if (!dragging) {
    vel  *= 0.91;
    velY *= 0.91;
    curGroup().rotation.y += vel * 0.007;
    camPhi = Math.max(CAM_PHI_MIN, Math.min(CAM_PHI_MAX, camPhi - velY * 0.005));
  }
  updateCamera();

  updateFrontSat();
  updateFrontFace();

  // Scintillement
  if (frontSat !== prevFrontSat) {
    sparkles.forEach(sp => { sp.userData.active = false; sp.material.opacity = 0; });
    prevFrontSat = frontSat;
  }
  if (frontSat && state !== 'busy' && !navigating && !dragging && Math.abs(vel) < 1.5) {
    frontSat.getWorldPosition(_sp);
    sparkles.forEach(sp => {
      if (!sp.userData.active) resetSparkle(sp, _sp);
      sp.material.color.setHex(0xffdd44);
      const d = sp.userData;
      d.life++;
      sp.position.x += d.vx;
      sp.position.y += d.vy;
      sp.position.z += d.vz;
      d.vy *= 0.986;
      const p     = d.life / d.maxLife;
      const alpha = p < 0.25 ? p / 0.25 : 1 - (p - 0.25) / 0.75;
      sp.material.opacity = alpha * 0.88;
      sp.scale.setScalar(d.sz * (0.4 + alpha * 0.6));
      if (d.life >= d.maxLife) d.active = false;
    });
  } else {
    sparkles.forEach(sp => {
      sp.userData.active  = false;
      sp.material.opacity = Math.max(0, sp.material.opacity - 0.06);
    });
    prevFrontSat = null;
  }

  // Mini gemmes accueil
  homeGems.forEach(({ mesh, actIdx, gemIdx, ax, az }) => {
    const n          = ACTIVITIES[actIdx].games.length;
    const orbitAngle = (gemIdx / n) * Math.PI * 2 + t * 0.4;
    const r          = 1.15;
    mesh.position.set(
      ax + Math.cos(orbitAngle) * r,
      Math.sin(t * 0.9 + gemIdx * 1.3) * 0.13,
      az + Math.sin(orbitAngle) * r
    );
    mesh.rotation.y = t * 0.6;
    const targetOp = homeSats[actIdx].material.opacity * 0.55;
    mesh.material.opacity += (targetOp - mesh.material.opacity) * 0.08;
  });

  // Accueil
  homeSats.forEach((m, i) => {
    m.rotation.y = t * (0.25 + i * 0.07);
    m.rotation.x = Math.sin(t * 0.45 + i * 1.3) * 0.16;
    const isFront = m === frontSat;
    const s = hovered === m ? 1.22 : isFront ? 1 + Math.sin(t * 1.6 + i * 1.7) * 0.045 : 0.88;
    m.scale.lerp(_s.setScalar(s), 0.1);
    if (state !== 'busy') {
      m.material.opacity += ((isFront ? 1.0 : 0.25) - m.material.opacity) * 0.06;
    }
  });

  // Objet central activité
  if (centerMesh) {
    centerMesh.rotation.y = t * 0.35;
    centerMesh.rotation.x = Math.sin(t * 0.28) * 0.1;
  }

  // Gemmes jeux
  gameSats.forEach((m, i) => {
    m.rotation.y = t * (0.3 + i * 0.1);
    const isFront = m === frontSat;
    const s = hovered === m ? 1.22 : isFront ? 1 + Math.sin(t * 1.8 + i * 1.5) * 0.04 : 0.88;
    m.scale.x = THREE.MathUtils.lerp(m.scale.x, s, 0.1);
    m.scale.z = THREE.MathUtils.lerp(m.scale.z, s, 0.1);
    m.scale.y = THREE.MathUtils.lerp(m.scale.y, s * 1.56, 0.1);
    if (state !== 'busy') {
      m.material.opacity += ((isFront ? 0.5 : 0.12) - m.material.opacity) * 0.06;
    }
  });

  // Faces du prisme
  if (state === 'prism' && prismFaces.length) {
    prismFaces.forEach(m => {
      const target = (m === frontFace) ? 1.0 : 0.65;
      m.material.opacity += (target - m.material.opacity) * 0.07;
    });
  }
  if (state === 'prism-zoom' && prismFaces.length) {
    prismFaces.forEach(m => {
      m.material.opacity += (0 - m.material.opacity) * 0.07;
    });
  }

  // Labels
  if (state === 'home' && frontSat) {
    hideLabels(homeLabels);
    const idx = frontSat.userData.idx;
    homeLabels[idx].style.display = 'block';
    posLabel(homeLabels[idx], frontSat);
  }
  if (state === 'act' && frontSat) {
    hideLabels(gameLabels);
    const idx = gameSats.indexOf(frontSat);
    if (idx >= 0 && gameLabels[idx]) {
      gameLabels[idx].style.display = 'block';
      posLabel(gameLabels[idx], frontSat);
    }
  }
  if (state !== 'home') hideLabels(homeLabels);
  if (state !== 'act')  hideLabels(gameLabels);

  renderer.render(scene, camera);
}

animate();
canvas.style.cursor = 'grab';

// ── RESIZE ───────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = W() / H();
  camera.updateProjectionMatrix();
  renderer.setSize(W(), H());
  applyPanelScale();
});
