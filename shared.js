// ═══════════════════════════════════════════════════
//  AGRILOGIC SHARED.JS v2.3
//  Added: 6 languages, analytics page link
// ═══════════════════════════════════════════════════

const DS = k => JSON.parse(localStorage.getItem('al_' + k) || '[]');
const save = (k, d) => localStorage.setItem('al_' + k, JSON.stringify(d));
const getProfile = () => JSON.parse(localStorage.getItem('al_farm') || '{}');
const saveProfile = p => localStorage.setItem('al_farm', JSON.stringify(p));
const fmt  = n => n != null ? Number(n).toLocaleString(undefined, {maximumFractionDigits:1}) : '—';
const fmtI = n => n != null ? Number(n).toLocaleString(undefined, {maximumFractionDigits:0}) : '—';
const today     = () => new Date().toISOString().split('T')[0];
const thisMonth = () => today().slice(0, 7);
const escHtml   = t => String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ── LANGUAGE ──────────────────────────────────────────
let currentLang = localStorage.getItem('al_lang') || 'en';

// 6 languages: English, Swahili, Kikuyu, Luganda, Amharic, French
const LANGS = { en:'EN', sw:'SW', ki:'GĨ', lg:'LG', am:'አም', fr:'FR' };

const TRANSLATIONS = {
  en: {
    dashboard:'Dashboard', advisor:'Farm Advisor', diagnosis:'Disease Diagnosis',
    soil:'Soil Analyser', calendar:'Planting Calendar', weather:'Weather Advisor',
    animals:'Animal Registry', milk:'Milk Tracker', eggs:'Egg Tracker',
    breeding:'Breeding Tracker', weight:'Weight Tracker', feed:'Feed Calculator',
    profit:'Profit Tracker', books:'Farm Bookkeeping', loan:'Loan Calculator',
    insurance:'Insurance Calc', subsidy:'Subsidy Finder', reports:'Farm Reports',
    analytics:'Analytics & Charts', inventory:'Inventory', tasks:'Task Manager',
    labour:'Labour Tracker', land:'Land Manager', water:'Water Tracker',
    market:'Marketplace', vets:'Vet Directory', suppliers:'Suppliers',
    myfarm:'My Farm', editfarm:'✏️ Edit Farm Info', nofarm:'No farm info yet',
    offline:'📡 You are offline. AI features require internet.',
    install:'📲 Install App',
    main:'Main', diagnose_s:'Diagnosis & Planning', livestock_s:'Livestock & Production',
    finance_s:'Finance & Support', operations_s:'Operations', connect_s:'Connect',
    analytics_s:'Analytics'
  },
  sw: {
    dashboard:'Dashibodi', advisor:'Mshauri wa Shamba', diagnosis:'Uchunguzi wa Magonjwa',
    soil:'Mchambuzi wa Udongo', calendar:'Kalenda ya Kupanda', weather:'Ushauri wa Hali ya Hewa',
    animals:'Usajili wa Wanyama', milk:'Kufuatilia Maziwa', eggs:'Kufuatilia Mayai',
    breeding:'Kufuatilia Uzazi', weight:'Kufuatilia Uzito', feed:'Kikokotoo cha Chakula',
    profit:'Kufuatilia Faida', books:'Uhasibu wa Shamba', loan:'Kikokotoo cha Mkopo',
    insurance:'Kikokotoo cha Bima', subsidy:'Kutafuta Ruzuku', reports:'Ripoti za Shamba',
    analytics:'Takwimu na Grafu', inventory:'Hesabu ya Bidhaa', tasks:'Meneja wa Kazi',
    labour:'Kufuatilia Wafanyakazi', land:'Meneja wa Ardhi', water:'Kufuatilia Maji',
    market:'Soko', vets:'Orodha ya Madaktari', suppliers:'Wasambazaji',
    myfarm:'Shamba Langu', editfarm:'✏️ Hariri Taarifa', nofarm:'Hakuna taarifa bado',
    offline:'📡 Uko nje ya mtandao. AI inahitaji intaneti.',
    install:'📲 Sakinisha Programu',
    main:'Kuu', diagnose_s:'Uchunguzi na Mipango', livestock_s:'Mifugo na Uzalishaji',
    finance_s:'Fedha na Msaada', operations_s:'Uendeshaji', connect_s:'Unganika',
    analytics_s:'Takwimu'
  },
  ki: {
    dashboard:'Dashibodi', advisor:'Mũteithia wa Mũgũnda', diagnosis:'Kugeria Mũrimũ',
    soil:'Gũtara Mũrĩmo wa Mũgũnda', calendar:'Thaa cia Gũtema', weather:'Ũhoro wa Rũũa',
    animals:'Ndũirĩriria ya Nyamũ', milk:'Gũtara Iria', eggs:'Gũtara Maai ma Ndimu',
    breeding:'Gũtara Kũhũrũria', weight:'Gũtara Irĩmo', feed:'Gũhesabu Irio',
    profit:'Gũtara Fĩida', books:'Mawatho ma Mũgũnda', loan:'Gũhesabu Ũtũranio',
    insurance:'Gũhesabu Bima', subsidy:'Gũthondeka Ruzuku', reports:'Rĩpoti cia Mũgũnda',
    analytics:'Takwimu na Michoro', inventory:'Ndimagio', tasks:'Mwĩrithia wa Wĩra',
    labour:'Gũtara Wĩra', land:'Mwĩrithia wa Mũgũnda', water:'Gũtara Maaĩ',
    market:'Gĩthĩnjĩro', vets:'Orodha ya Adaktari', suppliers:'Arĩa Makĩha Irio',
    myfarm:'Mũgũnda Wakwa', editfarm:'✏️ Hindũra Ũhoro', nofarm:'Ndũrĩ ũhoro o na ũmwe',
    offline:'📡 Ndũrĩ intaneti. AI ĩhitaga intaneti.',
    install:'📲 Ikia Programu',
    main:'Kũu', diagnose_s:'Uchunguzi na Mipango', livestock_s:'Nyamũ na Kũhanda',
    finance_s:'Mĩthemba ya Mĩgwanja', operations_s:'Kũenderia', connect_s:'Gũtũũrana',
    analytics_s:'Takwimu'
  },
  lg: {
    dashboard:'Dashibodi', advisor:'Omuteesa w'Ennimiro', diagnosis:'Okugenza Obulwadde',
    soil:'Okusomesa Ettaka', calendar:'Olusozi lw'Okusiga', weather:'Obubaka bw'Obudde',
    animals:'Entebbe y'Enyooma', milk:'Okukebera Amata', eggs:'Okukebera Amagi',
    breeding:'Okukebera Okuzaana', weight:'Okukebera Obuzito', feed:'Okubala Emmere',
    profit:'Okukebera Amagoba', books:'Okuteeka Ebitabo', loan:'Okubala Eddeni',
    insurance:'Okubala Inshuwalansi', subsidy:'Okununula Obuyambi', reports:'Lipoota ly'Ennimiro',
    analytics:'Ebigezo n'Ebiragiro', inventory:'Ebintu', tasks:'Omukuumi w'Emirimu',
    labour:'Okukebera Omulimu', land:'Omukuumi w'Ettaka', water:'Okukebera Amazzi',
    market:'Amasoko', vets:'Entebbe y'Ennaalubale', suppliers:'Abatunda',
    myfarm:'Ennimiro Yange', editfarm:'✏️ Kyusa Ebimu', nofarm:'Tewali bimu nawo',
    offline:'📡 Tolina интернет. AI yeetaaga интернет.',
    install:'📲 Yambika App',
    main:'Enkulu', diagnose_s:'Okugenza n'Okuteekateeka', livestock_s:'Enyooma n'Okuzala',
    finance_s:'Ensimbi n'Obuyambi', operations_s:'Okulungamya', connect_s:'Okutegana',
    analytics_s:'Ebigezo'
  },
  am: {
    dashboard:'ዳሽቦርድ', advisor:'የሜዳ አማካሪ', diagnosis:'የበሽታ ምርመራ',
    soil:'የአፈር ተንታኝ', calendar:'የተከላ የቀን መቁጠሪያ', weather:'የአየር ሁኔታ ምክር',
    animals:'የእንስሳ መዝገብ', milk:'የወተት መከታተያ', eggs:'የእንቁላል መከታተያ',
    breeding:'የመራቢያ መከታተያ', weight:'የክብደት መከታተያ', feed:'የምግብ ሂሳብ ማሽን',
    profit:'የትርፍ መከታተያ', books:'የሜዳ ሂሳብ', loan:'የብድር ሂሳብ ማሽን',
    insurance:'የኢንሹራንስ ሂሳብ', subsidy:'ድጎማ ፈላጊ', reports:'የሜዳ ሪፖርቶች',
    analytics:'ትንታኔ እና ገበታዎች', inventory:'ዕቃዎች', tasks:'የስራ አስተዳዳሪ',
    labour:'የሰራተኛ መከታተያ', land:'የመሬት አስተዳዳሪ', water:'የውሃ መከታተያ',
    market:'ገበያ', vets:'የ獣医 ዳይሬክቶሪ', suppliers:'አቅራቢዎች',
    myfarm:'የእኔ ሜዳ', editfarm:'✏️ መረጃ አርትዕ', nofarm:'እስካሁን ምንም መረጃ የለም',
    offline:'📡 ከኢንተርኔት ውጭ ነዎት። AI ኢንተርኔት ይፈልጋል።',
    install:'📲 አፕ ጫን',
    main:'ዋና', diagnose_s:'ምርመራ እና እቅድ', livestock_s:'እንስሳት እና ምርት',
    finance_s:'ፋይናንስ እና ድጋፍ', operations_s:'ስራዎች', connect_s:'ግንኙነት',
    analytics_s:'ትንታኔ'
  },
  fr: {
    dashboard:'Tableau de Bord', advisor:'Conseiller Agricole', diagnosis:'Diagnostic Maladie',
    soil:'Analyseur de Sol', calendar:'Calendrier de Plantation', weather:'Conseiller Météo',
    animals:'Registre des Animaux', milk:'Suivi du Lait', eggs:'Suivi des Œufs',
    breeding:'Suivi de l'Élevage', weight:'Suivi du Poids', feed:'Calculateur d'Aliments',
    profit:'Suivi des Bénéfices', books:'Comptabilité Agricole', loan:'Calculateur de Prêt',
    insurance:'Calculateur d'Assurance', subsidy:'Recherche de Subventions', reports:'Rapports Agricoles',
    analytics:'Analyses et Graphiques', inventory:'Inventaire', tasks:'Gestionnaire de Tâches',
    labour:'Suivi du Travail', land:'Gestionnaire Foncier', water:'Suivi de l'Eau',
    market:'Marché', vets:'Répertoire Vétérinaire', suppliers:'Fournisseurs',
    myfarm:'Ma Ferme', editfarm:'✏️ Modifier le Profil', nofarm:'Aucune information',
    offline:'📡 Vous êtes hors ligne. Les fonctions IA nécessitent Internet.',
    install:'📲 Installer l'App',
    main:'Principal', diagnose_s:'Diagnostic & Planification', livestock_s:'Élevage & Production',
    finance_s:'Finance & Support', operations_s:'Opérations', connect_s:'Connexion',
    analytics_s:'Analyses'
  }
};

const t = (key) => {
  const lang = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
  return lang[key] || TRANSLATIONS['en'][key] || key;
};

const isSwahili = () => currentLang !== 'en';
const langNote  = () => {
  const notes = {
    sw: 'Jibu kwa Kiswahili. Weka majina ya kisayansi kwa Kiingereza.',
    ki: 'Ũcokio na Gĩkũyũ. Igarũria mĩtugo ya kisayansi na Kĩingereza.',
    lg: 'Ddamu mu Luganda. Siiga erinnya lya sayansi mu Lungereza.',
    am: 'በአማርኛ ይመልሱ። የሳይንስ ስሞችን በእንግሊዝኛ ያቆዩ።',
    fr: 'Répondez en français. Gardez les noms scientifiques en anglais.'
  };
  return notes[currentLang] || 'Respond in English.';
};

function setLang(langCode) {
  currentLang = langCode;
  localStorage.setItem('al_lang', langCode);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === langCode);
  });
  // Rebuild sidebar and topbar with new language
  buildTopbar();
  buildSidebar(window.AL_PAGE || 'dashboard');
  // Update offline banner
  const ob = document.getElementById('offlineBanner');
  if (ob) ob.textContent = t('offline');
}

function buildLangToggle() {
  const el = document.getElementById('langToggle');
  if (!el) return;
  el.innerHTML = Object.entries(LANGS).map(([code, label]) =>
    `<button class="lang-btn ${code === currentLang ? 'active' : ''}" data-lang="${code}" onclick="setLang('${code}')" title="${TRANSLATIONS[code]?.dashboard||code}">${label}</button>`
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

// ── PAGES ─────────────────────────────────────────────
const PAGES = [
  { id:'dashboard', key:'dashboard', icon:'🏠', href:'index.html',     section:'main' },
  { id:'chat',      key:'advisor',   icon:'🤖', href:'chat.html',      section:'main', badge:'AI' },
  { id:'analytics', key:'analytics', icon:'📈', href:'analytics.html', section:'analytics' },
  { id:'diagnosis', key:'diagnosis', icon:'🔬', href:'diagnosis.html', section:'diagnose' },
  { id:'soil',      key:'soil',      icon:'🧪', href:'soil.html',      section:'diagnose' },
  { id:'calendar',  key:'calendar',  icon:'📅', href:'calendar.html',  section:'diagnose' },
  { id:'weather',   key:'weather',   icon:'🌤', href:'weather.html',   section:'diagnose' },
  { id:'animals',   key:'animals',   icon:'🐄', href:'animals.html',   section:'livestock' },
  { id:'milk',      key:'milk',      icon:'🥛', href:'milk.html',      section:'livestock' },
  { id:'eggs',      key:'eggs',      icon:'🥚', href:'eggs.html',      section:'livestock' },
  { id:'breeding',  key:'breeding',  icon:'🐣', href:'breeding.html',  section:'livestock' },
  { id:'weight',    key:'weight',    icon:'⚖', href:'weight.html',    section:'livestock' },
  { id:'feed',      key:'feed',      icon:'🧮', href:'feed.html',      section:'finance' },
  { id:'profit',    key:'profit',    icon:'💰', href:'profit.html',    section:'finance' },
  { id:'books',     key:'books',     icon:'📒', href:'books.html',     section:'finance' },
  { id:'loan',      key:'loan',      icon:'💳', href:'loan.html',      section:'finance' },
  { id:'insurance', key:'insurance', icon:'🛡', href:'insurance.html', section:'finance' },
  { id:'subsidy',   key:'subsidy',   icon:'🏛', href:'subsidy.html',   section:'finance' },
  { id:'reports',   key:'reports',   icon:'📊', href:'reports.html',   section:'finance' },
  { id:'inventory', key:'inventory', icon:'📦', href:'inventory.html', section:'operations' },
  { id:'tasks',     key:'tasks',     icon:'📋', href:'tasks.html',     section:'operations' },
  { id:'labour',    key:'labour',    icon:'👷', href:'labour.html',    section:'operations' },
  { id:'land',      key:'land',      icon:'🗺', href:'land.html',      section:'operations' },
  { id:'water',     key:'water',     icon:'💧', href:'water.html',     section:'operations' },
  { id:'market',    key:'market',    icon:'🏪', href:'market.html',    section:'connect' },
  { id:'vets',      key:'vets',      icon:'🏥', href:'vets.html',      section:'connect' },
  { id:'suppliers', key:'suppliers', icon:'🏬', href:'suppliers.html', section:'connect' },
];

const SECTION_KEYS = {
  main:'main', analytics:'analytics_s', diagnose:'diagnose_s',
  livestock:'livestock_s', finance:'finance_s', operations:'operations_s', connect:'connect_s'
};

function buildSidebar(activePage) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  const profile = getProfile();
  let html = '', lastSection = '';

  PAGES.forEach(p => {
    if (p.section !== lastSection) {
      if (lastSection) html += '</div>';
      html += `<div class="sb-section"><div class="sb-label">${t(SECTION_KEYS[p.section])}</div>`;
      lastSection = p.section;
    }
    html += `<a class="sb-item ${p.id === activePage ? 'active' : ''}" href="${p.href}">
      <span class="sb-icon">${p.icon}</span>
      <span>${t(p.key)}</span>
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
    <div class="sb-farm-title">${t('myfarm')}</div>
    <div id="sbFarmContent">
      ${fi.length ? fi.map(i=>`<div class="sb-farm-item">${i}</div>`).join('') : `<div class="sb-farm-item">${t('nofarm')}</div>`}
    </div>
    <button class="sb-farm-edit" onclick="openFarmModal()">${t('editfarm')}</button>
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

function openFarmModal() {
  const profile = getProfile();
  let modal = document.getElementById('farmModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'farmModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `<div class="modal">
      <h3>${t('myfarm')}</h3>
      <p class="modal-sub">Helps AI give personalised advice throughout the app.</p>
      <div class="modal-fields">
        <input type="text" id="fm-name" placeholder="🏡 Farm name">
        <input type="text" id="fm-location" placeholder="📍 Location (e.g. Nakuru, Kenya)">
        <div class="sw"><select id="fm-animal">
          <option value="">🐾 Main livestock</option>
          <option value="Broiler Chicken">🐔 Broiler Chickens</option>
          <option value="Layer Chickens">🥚 Layer Chickens</option>
          <option value="Bull">🐂 Bulls</option>
          <option value="Dairy Cows">🥛 Dairy Cows</option>
          <option value="Goats">🐐 Goats</option>
          <option value="Sheep">🐑 Sheep</option>
          <option value="Tilapia">🐟 Tilapia</option>
          <option value="Catfish">🐠 Catfish</option>
        </select></div>
        <input type="text" id="fm-crops" placeholder="🌾 Main crops">
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
        <button class="modal-save" onclick="saveFarmProfileModal()">Save</button>
      </div>
    </div>`;
    document.body.appendChild(modal);
  }
  ['name','location','crops','size'].forEach(k => {
    const el = document.getElementById('fm-'+k);
    if (el) el.value = profile[k] || '';
  });
  const an = document.getElementById('fm-animal'); if (an) an.value = profile.animal || '';
  const ex = document.getElementById('fm-exp');    if (ex) ex.value = profile.exp    || '';
  modal.classList.add('open');
}

function closeFarmModal() {
  const m = document.getElementById('farmModal'); if (m) m.classList.remove('open');
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

function buildTopbar() {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;
  topbar.innerHTML = `
    <a class="logo" href="index.html">
      <div class="logo-icon">🌿</div>
      <div class="logo-text">Agri<span>Logic</span></div>
    </a>
    <div class="topbar-right">
      <button class="install-btn" id="installBtn" onclick="installPWA()">${t('install')}</button>
      <div class="lang-toggle" id="langToggle"></div>
      <button class="menu-toggle" onclick="toggleSidebar()">☰</button>
    </div>`;
  buildLangToggle();
}

let deferredInstall = null;
function setupPWA() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferredInstall = e;
    const btn = document.getElementById('installBtn');
    if (btn) btn.classList.add('show');
  });
  const checkOnline = () => {
    const b = document.getElementById('offlineBanner');
    if (b) b.classList.toggle('show', !navigator.onLine);
  };
  window.addEventListener('online', checkOnline);
  window.addEventListener('offline', checkOnline);
  checkOnline();
}
function installPWA() {
  if (!deferredInstall) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) { showIOSInstall(); return; }
    return;
  }
  deferredInstall.prompt();
  deferredInstall.userChoice.then(() => { deferredInstall = null; });
}
function showIOSInstall() {
  let tip = document.getElementById('iosTip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'iosTip';
    tip.className = 'modal-overlay open';
    tip.innerHTML = `<div class="modal" style="text-align:center"><div style="font-size:36px;margin-bottom:12px">📲</div><h3>Install AgriLogic</h3><p class="modal-sub">Add to your home screen:</p><div style="background:rgba(82,183,136,0.07);border:1px solid rgba(82,183,136,0.15);border-radius:12px;padding:16px;margin-bottom:16px;text-align:left"><div style="font-size:13px;margin-bottom:10px">1️⃣ Tap <strong style="color:var(--green)">Share ⬆️</strong> in Safari</div><div style="font-size:13px;margin-bottom:10px">2️⃣ Tap <strong style="color:var(--green)">"Add to Home Screen"</strong></div><div style="font-size:13px">3️⃣ Tap <strong style="color:var(--green)">"Add"</strong></div></div><button class="modal-save" onclick="document.getElementById('iosTip').classList.remove('open')">Got it ✓</button></div>`;
    document.body.appendChild(tip);
  } else { tip.classList.add('open'); }
}

function initShared(activePage) {
  window.AL_PAGE = activePage;
  buildTopbar();
  buildSidebar(activePage);
  setupPWA();
  document.querySelectorAll('input[type="date"]').forEach(el => {
    if (!el.value) el.value = today();
  });
  // Apply current language to offline banner
  const ob = document.getElementById('offlineBanner');
  if (ob) ob.textContent = t('offline');
}

function shareWhatsApp(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}