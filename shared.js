// ═══════════════════════════════════════════════════
//  AGRILOGIC SHARED.JS v2.2 — FLAT STRUCTURE
//  Fixed: language switching (sw variable conflict),
//         sidebar rendering, flat file paths
// ═══════════════════════════════════════════════════

// ── DATA STORES ──────────────────────────────────────
const DS = k => JSON.parse(localStorage.getItem('al_' + k) || '[]');
const save = (k, d) => localStorage.setItem('al_' + k, JSON.stringify(d));
const getProfile = () => JSON.parse(localStorage.getItem('al_farm') || '{}');
const saveProfile = p => localStorage.setItem('al_farm', JSON.stringify(p));

// ── HELPERS ───────────────────────────────────────────
const fmt  = n => n != null ? Number(n).toLocaleString(undefined, {maximumFractionDigits:1}) : '—';
const fmtI = n => n != null ? Number(n).toLocaleString(undefined, {maximumFractionDigits:0}) : '—';
const today     = () => new Date().toISOString().split('T')[0];
const thisMonth = () => today().slice(0, 7);
const escHtml   = t => String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ── LANGUAGE ──────────────────────────────────────────
// FIX: renamed from 'sw' to 'isSwahili' to avoid conflict with language code 'sw'
let currentLang = localStorage.getItem('al_lang') || 'en';
const LANGS = { en:'EN', sw:'SW', ki:'GI', lg:'LG' };
const isSwahili = () => currentLang !== 'en';
const langNote  = () => isSwahili()
  ? 'Respond in Swahili. Keep scientific/disease/product names in English.'
  : 'Respond in English.';

function setLang(langCode) {
  currentLang = langCode;
  localStorage.setItem('al_lang', langCode);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === langCode);
  });
}

function buildLangToggle() {
  const el = document.getElementById('langToggle');
  if (!el) return;
  el.innerHTML = Object.entries(LANGS).map(([code, label]) =>
    `<button class="lang-btn ${code === currentLang ? 'active' : ''}" data-lang="${code}" onclick="setLang('${code}')">${label}</button>`
  ).join('');
}

// ── AI API ────────────────────────────────────────────
async function callAI(prompt, isArray = false) {
  const messages = isArray ? prompt : [{ role:'user', content:prompt }];
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages })
  });
  const data = await resp.json();
  return data.content?.map(c => c.text || '').join('') || '';
}

async function callAIWithSystem(system, messages) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, system, messages })
  });
  const data = await resp.json();
  return data.content?.map(c => c.text || '').join('') || '';
}

const parseAI = raw => {
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); }
  catch(e) { return null; }
};

const fileToB64 = file => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload  = e => res(e.target.result);
  r.onerror = () => rej(new Error('read failed'));
  r.readAsDataURL(file);
});

// ── PAGES — all files at root level ──────────────────
const PAGES = [
  { id:'dashboard', label:'Dashboard',        icon:'🏠', href:'index.html',     section:'main' },
  { id:'chat',      label:'Farm Advisor',      icon:'🤖', href:'chat.html',      section:'main', badge:'AI' },
  { id:'diagnosis', label:'Disease Diagnosis', icon:'🔬', href:'diagnosis.html', section:'diagnose' },
  { id:'soil',      label:'Soil Analyser',     icon:'🧪', href:'soil.html',      section:'diagnose' },
  { id:'calendar',  label:'Planting Calendar', icon:'📅', href:'calendar.html',  section:'diagnose' },
  { id:'weather',   label:'Weather Advisor',   icon:'🌤', href:'weather.html',   section:'diagnose' },
  { id:'animals',   label:'Animal Registry',   icon:'🐄', href:'animals.html',   section:'livestock' },
  { id:'milk',      label:'Milk Tracker',      icon:'🥛', href:'milk.html',      section:'livestock' },
  { id:'eggs',      label:'Egg Tracker',       icon:'🥚', href:'eggs.html',      section:'livestock' },
  { id:'breeding',  label:'Breeding Tracker',  icon:'🐣', href:'breeding.html',  section:'livestock' },
  { id:'weight',    label:'Weight Tracker',    icon:'⚖', href:'weight.html',    section:'livestock' },
  { id:'feed',      label:'Feed Calculator',   icon:'🧮', href:'feed.html',      section:'finance' },
  { id:'profit',    label:'Profit Tracker',    icon:'💰', href:'profit.html',    section:'finance' },
  { id:'books',     label:'Farm Bookkeeping',  icon:'📒', href:'books.html',     section:'finance' },
  { id:'loan',      label:'Loan Calculator',   icon:'💳', href:'loan.html',      section:'finance' },
  { id:'insurance', label:'Insurance Calc',    icon:'🛡', href:'insurance.html', section:'finance' },
  { id:'subsidy',   label:'Subsidy Finder',    icon:'🏛', href:'subsidy.html',   section:'finance' },
  { id:'reports',   label:'Farm Reports',      icon:'📊', href:'reports.html',   section:'finance' },
  { id:'inventory', label:'Inventory',         icon:'📦', href:'inventory.html', section:'operations' },
  { id:'tasks',     label:'Task Manager',      icon:'📋', href:'tasks.html',     section:'operations' },
  { id:'labour',    label:'Labour Tracker',    icon:'👷', href:'labour.html',    section:'operations' },
  { id:'land',      label:'Land Manager',      icon:'🗺', href:'land.html',      section:'operations' },
  { id:'water',     label:'Water Tracker',     icon:'💧', href:'water.html',     section:'operations' },
  { id:'market',    label:'Marketplace',       icon:'🏪', href:'market.html',    section:'connect' },
  { id:'vets',      label:'Vet Directory',     icon:'🏥', href:'vets.html',      section:'connect' },
  { id:'suppliers', label:'Suppliers',         icon:'🏬', href:'suppliers.html', section:'connect' },
];

const SECTION_LABELS = {
  main:'Main', diagnose:'Diagnosis & Planning',
  livestock:'Livestock & Production', finance:'Finance & Support',
  operations:'Operations', connect:'Connect'
};

// ── SIDEBAR ───────────────────────────────────────────
function buildSidebar(activePage) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  const profile = getProfile();
  let html = '', lastSection = '';

  PAGES.forEach(p => {
    if (p.section !== lastSection) {
      if (lastSection) html += '</div>';
      html += `<div class="sb-section"><div class="sb-label">${SECTION_LABELS[p.section]}</div>`;
      lastSection = p.section;
    }
    html += `<a class="sb-item ${p.id === activePage ? 'active' : ''}" href="${p.href}">
      <span class="sb-icon">${p.icon}</span>
      <span>${p.label}</span>
      ${p.badge ? `<span class="sb-badge">${p.badge}</span>` : ''}
    </a>`;
  });
  html += '</div>';

  const fi = [];
  if (profile.name)     fi.push(`🏡 <span>${escHtml(profile.name)}</span>`);
  if (profile.location) fi.push(`📍 <span>${escHtml(profile.location)}</span>`);
  if (profile.animal)   fi.push(`🐾 <span>${escHtml(profile.animal)}</span>`);
  if (profile.crops)    fi.push(`🌾 <span>${escHtml(profile.crops)}</span>`);
  if (profile.size)     fi.push(`📐 <span>${escHtml(profile.size)}</span>`);

  html += `<div class="sb-divider"></div>
  <div class="sb-farm">
    <div class="sb-farm-title">My Farm</div>
    <div id="sbFarmContent">
      ${fi.length ? fi.map(i=>`<div class="sb-farm-item">${i}</div>`).join('') : '<div class="sb-farm-item">No farm info yet</div>'}
    </div>
    <button class="sb-farm-edit" onclick="openFarmModal()">✏️ Edit Farm Info</button>
  </div>`;

  sidebar.innerHTML = html;
}

function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('sbOverlay');
  if (!s) return;
  const open = s.classList.toggle('open');
  if (o) o.style.display = open ? 'block' : 'none';
}

// ── FARM MODAL ────────────────────────────────────────
function openFarmModal() {
  const profile = getProfile();
  let modal = document.getElementById('farmModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'farmModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `<div class="modal">
      <h3>My Farm Profile</h3>
      <p class="modal-sub">Helps AI give personalised advice throughout the app.</p>
      <div class="modal-fields">
        <input type="text" id="fm-name" placeholder="🏡 Farm name">
        <input type="text" id="fm-location" placeholder="📍 Location (e.g. Nakuru, Kenya)">
        <div class="sw"><select id="fm-animal">
          <option value="">🐾 Main livestock (optional)</option>
          <option value="Broiler Chicken">🐔 Broiler Chickens</option>
          <option value="Layer Chickens">🥚 Layer Chickens</option>
          <option value="Bull">🐂 Bulls</option>
          <option value="Dairy Cows">🥛 Dairy Cows</option>
          <option value="Goats">🐐 Goats</option>
          <option value="Sheep">🐑 Sheep</option>
          <option value="Tilapia">🐟 Tilapia</option>
          <option value="Catfish">🐠 Catfish</option>
        </select></div>
        <input type="text" id="fm-crops" placeholder="🌾 Main crops (e.g. Maize, Tomatoes)">
        <input type="text" id="fm-size"  placeholder="📐 Farm size (e.g. 2 acres)">
        <div class="sw"><select id="fm-exp">
          <option value="">👨‍🌾 Farming experience</option>
          <option value="Beginner (0-2 years)">Beginner (0-2 years)</option>
          <option value="Intermediate (3-7 years)">Intermediate (3-7 years)</option>
          <option value="Experienced (7+ years)">Experienced (7+ years)</option>
        </select></div>
      </div>
      <div class="modal-actions">
        <button class="modal-cancel" onclick="closeFarmModal()">Cancel</button>
        <button class="modal-save" onclick="saveFarmProfileModal()">Save Profile</button>
      </div>
    </div>`;
    document.body.appendChild(modal);
  }
  // Populate fields
  ['name','location','crops','size'].forEach(k => {
    const el = document.getElementById('fm-'+k);
    if (el) el.value = profile[k] || '';
  });
  const an = document.getElementById('fm-animal'); if (an) an.value = profile.animal || '';
  const ex = document.getElementById('fm-exp');    if (ex) ex.value = profile.exp    || '';
  modal.classList.add('open');
}

function closeFarmModal() {
  const m = document.getElementById('farmModal');
  if (m) m.classList.remove('open');
}

function saveFarmProfileModal() {
  const profile = {
    name:     (document.getElementById('fm-name')?.value     || '').trim(),
    location: (document.getElementById('fm-location')?.value || '').trim(),
    animal:    document.getElementById('fm-animal')?.value   || '',
    crops:    (document.getElementById('fm-crops')?.value    || '').trim(),
    size:     (document.getElementById('fm-size')?.value     || '').trim(),
    exp:       document.getElementById('fm-exp')?.value      || '',
  };
  saveProfile(profile);
  closeFarmModal();
  buildSidebar(window.AL_PAGE || 'dashboard');
}

// ── TOPBAR ────────────────────────────────────────────
function buildTopbar() {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;
  topbar.innerHTML = `
    <a class="logo" href="index.html">
      <div class="logo-icon">🌿</div>
      <div class="logo-text">Agri<span>Logic</span></div>
    </a>
    <div class="topbar-right">
      <button class="install-btn" id="installBtn" onclick="installPWA()">📲 Install</button>
      <div class="lang-toggle" id="langToggle"></div>
      <button class="menu-toggle" onclick="toggleSidebar()">☰</button>
    </div>`;
  buildLangToggle();
}

// ── PWA ───────────────────────────────────────────────
let deferredInstall = null;

function setupPWA() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferredInstall = e;
    const btn = document.getElementById('installBtn');
    if (btn) btn.classList.add('show');
  });
  window.addEventListener('appinstalled', () => {
    const btn = document.getElementById('installBtn');
    if (btn) btn.classList.remove('show');
    deferredInstall = null;
  });
  const checkOnline = () => {
    const b = document.getElementById('offlineBanner');
    if (b) b.classList.toggle('show', !navigator.onLine);
  };
  window.addEventListener('online',  checkOnline);
  window.addEventListener('offline', checkOnline);
  checkOnline();
}

function installPWA() {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  deferredInstall.userChoice.then(r => {
    if (r.outcome === 'accepted') {
      const btn = document.getElementById('installBtn');
      if (btn) btn.classList.remove('show');
    }
    deferredInstall = null;
  });
}

// ── INIT — called at bottom of every page ────────────
function initShared(activePage) {
  window.AL_PAGE = activePage;
  buildTopbar();
  buildSidebar(activePage);
  setupPWA();
  document.querySelectorAll('input[type="date"]').forEach(el => {
    if (!el.value) el.value = today();
  });
}

// ── WHATSAPP ──────────────────────────────────────────
function shareWhatsApp(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
