// ═══════════════════════════════════════════════════
//  AGRILOGIC SHARED.JS v2.4 — Fixed apostrophes in translations
// ═══════════════════════════════════════════════════

const DS = k => JSON.parse(localStorage.getItem('al_' + k) || '[]');
const save = (k, d) => localStorage.setItem('al_' + k, JSON.stringify(d));
const getProfile = () => JSON.parse(localStorage.getItem('al_farm') || '{}');
const saveProfile = p => localStorage.setItem('al_farm', JSON.stringify(p));
const fmt  = n => n != null ? Number(n).toLocaleString(undefined, {maximumFractionDigits:1}) : '\u2014';
const fmtI = n => n != null ? Number(n).toLocaleString(undefined, {maximumFractionDigits:0}) : '\u2014';
const today     = () => new Date().toISOString().split('T')[0];
const thisMonth = () => today().slice(0, 7);
const escHtml   = t => String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ── LANGUAGE ──────────────────────────────────────────
let currentLang = localStorage.getItem('al_lang') || 'en';
const LANGS = { en:'EN', sw:'SW', ki:'GI', lg:'LG', am:'AM', fr:'FR' };

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
    myfarm:'My Farm', editfarm:'\u270f\ufe0f Edit Farm Info', nofarm:'No farm info yet',
    offline:'\ud83d\udce1 You are offline. AI features require internet.',
    install:'\ud83d\udcf2 Install App',
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
    myfarm:'Shamba Langu', editfarm:'\u270f\ufe0f Hariri Taarifa', nofarm:'Hakuna taarifa bado',
    offline:'\ud83d\udce1 Uko nje ya mtandao. AI inahitaji intaneti.',
    install:'\ud83d\udcf2 Sakinisha Programu',
    main:'Kuu', diagnose_s:'Uchunguzi na Mipango', livestock_s:'Mifugo na Uzalishaji',
    finance_s:'Fedha na Msaada', operations_s:'Uendeshaji', connect_s:'Unganika',
    analytics_s:'Takwimu'
  },
  ki: {
    dashboard:'Dashibodi', advisor:'Muteithia wa Mugunda', diagnosis:'Kugeria Murimu',
    soil:'Gutara Murimo wa Mugunda', calendar:'Thaa cia Gutema', weather:'Uhoro wa Ruua',
    animals:'Nduiroriria ya Nyamu', milk:'Gutara Iria', eggs:'Gutara Maai ma Ndimu',
    breeding:'Gutara Kuhururia', weight:'Gutara Irimo', feed:'Guhesabu Irio',
    profit:'Gutara Fiida', books:'Mawatho ma Mugunda', loan:'Guhesabu Utranio',
    insurance:'Guhesabu Bima', subsidy:'Guthondeka Ruzuku', reports:'Ripoti cia Mugunda',
    analytics:'Takwimu na Michoro', inventory:'Ndimagio', tasks:'Mwirithia wa Wira',
    labour:'Gutara Wira', land:'Mwirithia wa Mugunda', water:'Gutara Maai',
    market:'Githinjiro', vets:'Orodha ya Adaktari', suppliers:'Aria Makiha Irio',
    myfarm:'Mugunda Wakwa', editfarm:'\u270f\ufe0f Hindura Uhoro', nofarm:'Nduri uhoro o na umwe',
    offline:'\ud83d\udce1 Nduri intaneti. AI ihitaga intaneti.',
    install:'\ud83d\udcf2 Ikia Programu',
    main:'Kuu', diagnose_s:'Uchunguzi na Mipango', livestock_s:'Nyamu na Kuhanda',
    finance_s:'Mitheemba ya Migwanja', operations_s:'Kuenderia', connect_s:'Gutuurana',
    analytics_s:'Takwimu'
  },
  lg: {
    dashboard:'Dashibodi', advisor:'Omuteesa w\'Ennimiro', diagnosis:'Okugenza Obulwadde',
    soil:'Okusomesa Ettaka', calendar:'Olusozi lw\'Okusiga', weather:'Obubaka bw\'Obudde',
    animals:'Entebbe y\'Enyooma', milk:'Okukebera Amata', eggs:'Okukebera Amagi',
    breeding:'Okukebera Okuzaana', weight:'Okukebera Obuzito', feed:'Okubala Emmere',
    profit:'Okukebera Amagoba', books:'Okuteeka Ebitabo', loan:'Okubala Eddeni',
    insurance:'Okubala Inshuwalansi', subsidy:'Okununula Obuyambi', reports:'Lipoota ly\'Ennimiro',
    analytics:'Ebigezo n\'Ebiragiro', inventory:'Ebintu', tasks:'Omukuumi w\'Emirimu',
    labour:'Okukebera Omulimu', land:'Omukuumi w\'Ettaka', water:'Okukebera Amazzi',
    market:'Amasoko', vets:'Entebbe y\'Ennaalubale', suppliers:'Abatunda',
    myfarm:'Ennimiro Yange', editfarm:'\u270f\ufe0f Kyusa Ebimu', nofarm:'Tewali bimu nawo',
    offline:'\ud83d\udce1 Tolina Internet. AI yeetaaga Internet.',
    install:'\ud83d\udcf2 Yambika App',
    main:'Enkulu', diagnose_s:'Okugenza n\'Okuteekateeka', livestock_s:'Enyooma n\'Okuzala',
    finance_s:'Ensimbi n\'Obuyambi', operations_s:'Okulungamya', connect_s:'Okutegana',
    analytics_s:'Ebigezo'
  },
  am: {
    dashboard:'Dashbord', advisor:'Yemeda Amakari', diagnosis:'Yebeshita Miramera',
    soil:'Yeafar Tentany', calendar:'Yetekela Ye-qen Mequteria', weather:'Yeayer Huneta Mkr',
    animals:'Ye-ensasa Mezgeb', milk:'Yewetet Meketateya', eggs:'Yenquial Meketateya',
    breeding:'Yemerabia Meketateya', weight:'Yekibdet Meketateya', feed:'Yemigib Hisab',
    profit:'Yetirf Meketateya', books:'Yemeda Hisab', loan:'Yebdir Hisab',
    insurance:'Ye-inshuranis Hisab', subsidy:'Digoma Felagi', reports:'Yemeda Riportoch',
    analytics:'Tinatane na Gebatawoch', inventory:'Qiantawoch', tasks:'Yesira Asiteadari',
    labour:'Yesertegna Meketateya', land:'Yemeret Asiteadari', water:'Yewuha Meketateya',
    market:'Gebeya', vets:'Ye-enimal Daktereach', suppliers:'Aqrabiiwoch',
    myfarm:'Yene Meda', editfarm:'\u270f\ufe0f Mereja Artit', nofarm:'Eskahun mnim mereja yellem',
    offline:'\ud83d\udce1 Ke-Internet wuch newot. AI Internet yifelgal.',
    install:'\ud83d\udcf2 App Chan',
    main:'Wana', diagnose_s:'Miramera ena Iqid', livestock_s:'Ensasat ena Mrtoch',
    finance_s:'Fainans ena Digaf', operations_s:'Siraiwoch', connect_s:'Giniyunet',
    analytics_s:'Tinatane'
  },
  fr: {
    dashboard:'Tableau de Bord', advisor:'Conseiller Agricole', diagnosis:'Diagnostic Maladie',
    soil:'Analyseur de Sol', calendar:'Calendrier de Plantation', weather:'Conseiller Meteo',
    animals:'Registre des Animaux', milk:'Suivi du Lait', eggs:'Suivi des Oeufs',
    breeding:"Suivi de l\u2019Elevage", weight:'Suivi du Poids', feed:"Calculateur d\u2019Aliments",
    profit:'Suivi des Benefices', books:'Comptabilite Agricole', loan:'Calculateur de Pret',
    insurance:"Calculateur d\u2019Assurance", subsidy:'Recherche de Subventions', reports:'Rapports Agricoles',
    analytics:'Analyses et Graphiques', inventory:'Inventaire', tasks:'Gestionnaire de Taches',
    labour:'Suivi du Travail', land:'Gestionnaire Foncier', water:"Suivi de l\u2019Eau",
    market:'Marche', vets:'Repertoire Veterinaire', suppliers:'Fournisseurs',
    myfarm:'Ma Ferme', editfarm:'\u270f\ufe0f Modifier le Profil', nofarm:'Aucune information',
    offline:'\ud83d\udce1 Vous etes hors ligne. Les fonctions IA necessitent Internet.',
    install:'\ud83d\udcf2 Installer App',
    main:'Principal', diagnose_s:'Diagnostic et Planification', livestock_s:'Elevage et Production',
    finance_s:'Finance et Support', operations_s:'Operations', connect_s:'Connexion',
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
    ki: 'Cokio na Gikuyu. Igaruria mitugo ya kisayansi na Kiingereza.',
    lg: 'Ddamu mu Luganda. Siiga erinnya lya sayansi mu Lungereza.',
    am: 'Be-Amaregna yimelsu. Ye-sayansi simoch be-Engelizegna yiqu.',
    fr: 'Repondez en francais. Gardez les noms scientifiques en anglais.'
  };
  return notes[currentLang] || 'Respond in English.';
};

function setLang(langCode) {
  currentLang = langCode;
  localStorage.setItem('al_lang', langCode);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === langCode);
  });
  buildTopbar();
  buildSidebar(window.AL_PAGE || 'dashboard');
  const ob = document.getElementById('offlineBanner');
  if (ob) ob.textContent = t('offline');
}

function buildLangToggle() {
  const el = document.getElementById('langToggle');
  if (!el) return;
  el.innerHTML = Object.entries(LANGS).map(([code, label]) =>
    '<button class="lang-btn ' + (code === currentLang ? 'active' : '') + '" data-lang="' + code + '" onclick="setLang(\'' + code + '\')">' + label + '</button>'
  ).join('');
}

async function callAI(prompt, isArray) {
  isArray = isArray || false;
  const messages = isArray ? prompt : [{ role:'user', content:prompt }];
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages: messages })
  });
  const data = await resp.json();
  return data.content ? data.content.map(function(c){ return c.text || ''; }).join('') : '';
}

async function callAIWithSystem(system, messages) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, system: system, messages: messages })
  });
  const data = await resp.json();
  return data.content ? data.content.map(function(c){ return c.text || ''; }).join('') : '';
}

const parseAI = function(raw) {
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); }
  catch(e) { return null; }
};

const fileToB64 = function(file) {
  return new Promise(function(res, rej) {
    const r = new FileReader();
    r.onload  = function(e) { res(e.target.result); };
    r.onerror = function() { rej(new Error('read failed')); };
    r.readAsDataURL(file);
  });
};

const PAGES = [
  { id:'dashboard', key:'dashboard', icon:'&#127968;', href:'index.html',     section:'main' },
  { id:'chat',      key:'advisor',   icon:'&#129302;', href:'chat.html',      section:'main', badge:'AI' },
  { id:'analytics', key:'analytics', icon:'&#128200;', href:'analytics.html', section:'analytics' },
  { id:'diagnosis', key:'diagnosis', icon:'&#128300;', href:'diagnosis.html', section:'diagnose' },
  { id:'soil',      key:'soil',      icon:'&#129514;', href:'soil.html',      section:'diagnose' },
  { id:'calendar',  key:'calendar',  icon:'&#128197;', href:'calendar.html',  section:'diagnose' },
  { id:'weather',   key:'weather',   icon:'&#127780;', href:'weather.html',   section:'diagnose' },
  { id:'animals',   key:'animals',   icon:'&#128004;', href:'animals.html',   section:'livestock' },
  { id:'milk',      key:'milk',      icon:'&#129371;', href:'milk.html',      section:'livestock' },
  { id:'eggs',      key:'eggs',      icon:'&#129370;', href:'eggs.html',      section:'livestock' },
  { id:'breeding',  key:'breeding',  icon:'&#128035;', href:'breeding.html',  section:'livestock' },
  { id:'weight',    key:'weight',    icon:'&#9878;',   href:'weight.html',    section:'livestock' },
  { id:'feed',      key:'feed',      icon:'&#129518;', href:'feed.html',      section:'finance' },
  { id:'profit',    key:'profit',    icon:'&#128176;', href:'profit.html',    section:'finance' },
  { id:'books',     key:'books',     icon:'&#128218;', href:'books.html',     section:'finance' },
  { id:'loan',      key:'loan',      icon:'&#128179;', href:'loan.html',      section:'finance' },
  { id:'insurance', key:'insurance', icon:'&#128737;', href:'insurance.html', section:'finance' },
  { id:'subsidy',   key:'subsidy',   icon:'&#127963;', href:'subsidy.html',   section:'finance' },
  { id:'reports',   key:'reports',   icon:'&#128202;', href:'reports.html',   section:'finance' },
  { id:'inventory', key:'inventory', icon:'&#128230;', href:'inventory.html', section:'operations' },
  { id:'tasks',     key:'tasks',     icon:'&#128203;', href:'tasks.html',     section:'operations' },
  { id:'labour',    key:'labour',    icon:'&#128119;', href:'labour.html',    section:'operations' },
  { id:'land',      key:'land',      icon:'&#128506;', href:'land.html',      section:'operations' },
  { id:'water',     key:'water',     icon:'&#128167;', href:'water.html',     section:'operations' },
  { id:'market',    key:'market',    icon:'&#127978;', href:'market.html',    section:'connect' },
  { id:'vets',      key:'vets',      icon:'&#127973;', href:'vets.html',      section:'connect' },
  { id:'suppliers', key:'suppliers', icon:'&#127980;', href:'suppliers.html', section:'connect' }
];

const SECTION_KEYS = {
  main:'main', analytics:'analytics_s', diagnose:'diagnose_s',
  livestock:'livestock_s', finance:'finance_s', operations:'operations_s', connect:'connect_s'
};

function buildSidebar(activePage) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  const profile = getProfile();
  let html = '';
  let lastSection = '';

  PAGES.forEach(function(p) {
    if (p.section !== lastSection) {
      if (lastSection) html += '</div>';
      html += '<div class="sb-section"><div class="sb-label">' + t(SECTION_KEYS[p.section]) + '</div>';
      lastSection = p.section;
    }
    html += '<a class="sb-item ' + (p.id === activePage ? 'active' : '') + '" href="' + p.href + '">' +
      '<span class="sb-icon">' + p.icon + '</span>' +
      '<span>' + t(p.key) + '</span>' +
      (p.badge ? '<span class="sb-badge">' + p.badge + '</span>' : '') +
      '</a>';
  });
  html += '</div>';

  const fi = [];
  if (profile.name)     fi.push('&#127968; <span>' + escHtml(profile.name) + '</span>');
  if (profile.location) fi.push('&#128205; <span>' + escHtml(profile.location) + '</span>');
  if (profile.animal)   fi.push('&#128062; <span>' + escHtml(profile.animal) + '</span>');
  if (profile.crops)    fi.push('&#127806; <span>' + escHtml(profile.crops) + '</span>');
  if (profile.size)     fi.push('&#128208; <span>' + escHtml(profile.size) + '</span>');

  html += '<div class="sb-divider"></div>' +
    '<div class="sb-farm">' +
      '<div class="sb-farm-title">' + t('myfarm') + '</div>' +
      '<div id="sbFarmContent">' +
        (fi.length ? fi.map(function(i){ return '<div class="sb-farm-item">' + i + '</div>'; }).join('') : '<div class="sb-farm-item">' + t('nofarm') + '</div>') +
      '</div>' +
      '<button class="sb-farm-edit" onclick="openFarmModal()">' + t('editfarm') + '</button>' +
    '</div>';

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
    modal.innerHTML = '<div class="modal">' +
      '<h3>' + t('myfarm') + '</h3>' +
      '<p class="modal-sub">Helps AI give personalised advice throughout the app.</p>' +
      '<div class="modal-fields">' +
        '<input type="text" id="fm-name" placeholder="Farm name">' +
        '<input type="text" id="fm-location" placeholder="Location (e.g. Nakuru, Kenya)">' +
        '<div class="sw"><select id="fm-animal">' +
          '<option value="">Main livestock (optional)</option>' +
          '<option value="Broiler Chicken">Broiler Chickens</option>' +
          '<option value="Layer Chickens">Layer Chickens</option>' +
          '<option value="Bull">Bulls</option>' +
          '<option value="Dairy Cows">Dairy Cows</option>' +
          '<option value="Goats">Goats</option>' +
          '<option value="Sheep">Sheep</option>' +
          '<option value="Tilapia">Tilapia</option>' +
          '<option value="Catfish">Catfish</option>' +
        '</select></div>' +
        '<input type="text" id="fm-crops" placeholder="Main crops">' +
        '<input type="text" id="fm-size" placeholder="Farm size (e.g. 2 acres)">' +
        '<div class="sw"><select id="fm-exp">' +
          '<option value="">Farming experience</option>' +
          '<option value="Beginner (0-2 years)">Beginner (0-2 years)</option>' +
          '<option value="Intermediate (3-7 years)">Intermediate (3-7 years)</option>' +
          '<option value="Experienced (7+ years)">Experienced (7+ years)</option>' +
        '</select></div>' +
      '</div>' +
      '<div class="modal-actions">' +
        '<button class="modal-cancel" onclick="closeFarmModal()">Cancel</button>' +
        '<button class="modal-save" onclick="saveFarmProfileModal()">Save</button>' +
      '</div>' +
    '</div>';
    document.body.appendChild(modal);
  }
  ['name','location','crops','size'].forEach(function(k) {
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
    name:     (document.getElementById('fm-name') ? document.getElementById('fm-name').value : '').trim(),
    location: (document.getElementById('fm-location') ? document.getElementById('fm-location').value : '').trim(),
    animal:    document.getElementById('fm-animal') ? document.getElementById('fm-animal').value : '',
    crops:    (document.getElementById('fm-crops') ? document.getElementById('fm-crops').value : '').trim(),
    size:     (document.getElementById('fm-size') ? document.getElementById('fm-size').value : '').trim(),
    exp:       document.getElementById('fm-exp') ? document.getElementById('fm-exp').value : ''
  };
  saveProfile(profile);
  closeFarmModal();
  buildSidebar(window.AL_PAGE || 'dashboard');
}

function buildTopbar() {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;
  topbar.innerHTML =
    '<a class="logo" href="index.html">' +
      '<div class="logo-icon">&#127807;</div>' +
      '<div class="logo-text">Agri<span>Logic</span></div>' +
    '</a>' +
    '<div class="topbar-right">' +
      '<button class="install-btn" id="installBtn" onclick="installPWA()">' + t('install') + '</button>' +
      '<div class="lang-toggle" id="langToggle"></div>' +
      '<button class="menu-toggle" onclick="toggleSidebar()">&#9776;</button>' +
    '</div>';
  buildLangToggle();
}

let deferredInstall = null;
function setupPWA() {
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredInstall = e;
    const btn = document.getElementById('installBtn');
    if (btn) btn.classList.add('show');
  });
  function checkOnline() {
    const b = document.getElementById('offlineBanner');
    if (b) b.classList.toggle('show', !navigator.onLine);
  }
  window.addEventListener('online', checkOnline);
  window.addEventListener('offline', checkOnline);
  checkOnline();
}

function installPWA() {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  deferredInstall.userChoice.then(function() { deferredInstall = null; });
}

function initShared(activePage) {
  window.AL_PAGE = activePage;
  buildTopbar();
  buildSidebar(activePage);
  setupPWA();
  document.querySelectorAll('input[type="date"]').forEach(function(el) {
    if (!el.value) el.value = today();
  });
  const ob = document.getElementById('offlineBanner');
  if (ob) ob.textContent = t('offline');
}

function shareWhatsApp(text) {
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}