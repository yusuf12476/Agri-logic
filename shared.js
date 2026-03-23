// AGRILOGIC SHARED.JS v4.0 — Fixed: language UI, offline banner, currency, filters
var DS = function(k) { try { return JSON.parse(localStorage.getItem('al_'+k)||'[]'); } catch(e) { return []; } };
var save = function(k,d) { try { localStorage.setItem('al_'+k,JSON.stringify(d)); } catch(e) {} };
var getProfile = function() { try { return JSON.parse(localStorage.getItem('al_farm')||'{}'); } catch(e) { return {}; } };
var saveProfile = function(p) { try { localStorage.setItem('al_farm',JSON.stringify(p)); } catch(e) {} };
var fmt = function(n) { return n!=null ? Number(n).toLocaleString(undefined,{maximumFractionDigits:1}) : '-'; };
var fmtI = function(n) { return n!=null ? Number(n).toLocaleString(undefined,{maximumFractionDigits:0}) : '-'; };
var today = function() { return new Date().toISOString().split('T')[0]; };
var thisMonth = function() { return today().slice(0,7); };
var escHtml = function(t) { return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
var parseAI = function(raw) { try { return JSON.parse(raw.replace(/```json|```/g,'').trim()); } catch(e) { return null; } };
var fileToB64 = function(file) { return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(e){res(e.target.result);}; r.onerror=function(){rej(new Error('fail'));}; r.readAsDataURL(file); }); };

// ─── LANGUAGE SYSTEM ────────────────────────────────────────────────────────
var currentLang = localStorage.getItem('al_lang') || 'en';

// UI translations for sidebar sections and common labels
var TRANSLATIONS = {
  en: {
    'Main':'Main','Analytics':'Analytics','Diagnosis & Planning':'Diagnosis & Planning',
    'Livestock & Production':'Livestock & Production','Finance & Support':'Finance & Support',
    'Operations':'Operations','Connect':'Connect',
    'Dashboard':'Dashboard','Farm Advisor':'Farm Advisor','Analytics':'Analytics',
    'Disease Diagnosis':'Disease Diagnosis','Soil Analyser':'Soil Analyser',
    'Planting Calendar':'Planting Calendar','Weather Advisor':'Weather Advisor',
    'Animal Registry':'Animal Registry','Milk Tracker':'Milk Tracker',
    'Egg Tracker':'Egg Tracker','Breeding Tracker':'Breeding Tracker',
    'Weight Tracker':'Weight Tracker','Feed Calculator':'Feed Calculator',
    'Profit Tracker':'Profit Tracker','Farm Bookkeeping':'Farm Bookkeeping',
    'Loan Calculator':'Loan Calculator','Insurance Calc':'Insurance Calc',
    'Subsidy Finder':'Subsidy Finder','Farm Reports':'Farm Reports',
    'Inventory':'Inventory','Task Manager':'Task Manager',
    'Labour Tracker':'Labour Tracker','Land Manager':'Land Manager',
    'Water Tracker':'Water Tracker','Marketplace':'Marketplace',
    'Vet Directory':'Vet Directory','Suppliers':'Suppliers',
    'My Farm':'My Farm','No farm info yet':'No farm info yet',
    'Edit Farm Info':'Edit Farm Info',
    'offline':'📡 You are offline. AI features require internet.'
  },
  sw: {
    'Main':'Kuu','Analytics':'Takwimu','Diagnosis & Planning':'Uchunguzi & Mipango',
    'Livestock & Production':'Mifugo & Uzalishaji','Finance & Support':'Fedha & Msaada',
    'Operations':'Uendeshaji','Connect':'Unganisha',
    'Dashboard':'Dashibodi','Farm Advisor':'Mshauri wa Shamba','Analytics':'Takwimu',
    'Disease Diagnosis':'Uchunguzi wa Magonjwa','Soil Analyser':'Kipimo cha Udongo',
    'Planting Calendar':'Kalenda ya Kupanda','Weather Advisor':'Mshauri wa Hali ya Hewa',
    'Animal Registry':'Rejista ya Wanyama','Milk Tracker':'Kufuatilia Maziwa',
    'Egg Tracker':'Kufuatilia Mayai','Breeding Tracker':'Kufuatilia Uzazi',
    'Weight Tracker':'Kufuatilia Uzito','Feed Calculator':'Hesabu ya Chakula',
    'Profit Tracker':'Kufuatilia Faida','Farm Bookkeeping':'Uhasibu wa Shamba',
    'Loan Calculator':'Hesabu ya Mkopo','Insurance Calc':'Hesabu ya Bima',
    'Subsidy Finder':'Tafuta Ruzuku','Farm Reports':'Ripoti za Shamba',
    'Inventory':'Hesabu ya Bidhaa','Task Manager':'Meneja wa Kazi',
    'Labour Tracker':'Kufuatilia Wafanyakazi','Land Manager':'Meneja wa Ardhi',
    'Water Tracker':'Kufuatilia Maji','Marketplace':'Soko',
    'Vet Directory':'Orodha ya Madaktari wa Mifugo','Suppliers':'Wasambazaji',
    'My Farm':'Shamba Langu','No farm info yet':'Hakuna taarifa za shamba bado',
    'Edit Farm Info':'Hariri Taarifa za Shamba',
    'offline':'📡 Uko nje ya mtandao. Vipengele vya AI vinahitaji intaneti.'
  },
  fr: {
    'Main':'Principal','Analytics':'Analytique','Diagnosis & Planning':'Diagnostic & Planification',
    'Livestock & Production':'Élevage & Production','Finance & Support':'Finance & Support',
    'Operations':'Opérations','Connect':'Connexion',
    'Dashboard':'Tableau de bord','Farm Advisor':'Conseiller agricole','Analytics':'Analytique',
    'Disease Diagnosis':'Diagnostic des maladies','Soil Analyser':'Analyseur de sol',
    'Planting Calendar':'Calendrier de plantation','Weather Advisor':'Conseiller météo',
    'Animal Registry':'Registre des animaux','Milk Tracker':'Suivi du lait',
    'Egg Tracker':'Suivi des œufs','Breeding Tracker':'Suivi de l\'élevage',
    'Weight Tracker':'Suivi du poids','Feed Calculator':'Calculateur d\'alimentation',
    'Profit Tracker':'Suivi des bénéfices','Farm Bookkeeping':'Comptabilité agricole',
    'Loan Calculator':'Calculateur de prêt','Insurance Calc':'Calcul d\'assurance',
    'Subsidy Finder':'Recherche de subventions','Farm Reports':'Rapports agricoles',
    'Inventory':'Inventaire','Task Manager':'Gestionnaire de tâches',
    'Labour Tracker':'Suivi du travail','Land Manager':'Gestionnaire des terres',
    'Water Tracker':'Suivi de l\'eau','Marketplace':'Marché',
    'Vet Directory':'Annuaire vétérinaire','Suppliers':'Fournisseurs',
    'My Farm':'Ma Ferme','No farm info yet':'Aucune info de ferme',
    'Edit Farm Info':'Modifier les infos','offline':'📡 Hors ligne. Les fonctions IA nécessitent internet.'
  },
  am: {
    'Main':'ዋና','Analytics':'ትንታኔ','Diagnosis & Planning':'ምርመራ እና እቅድ',
    'Livestock & Production':'ከብቶች እና ምርት','Finance & Support':'ፋይናንስ እና ድጋፍ',
    'Operations':'ስራ አስኪያጅ','Connect':'ተገናኝ',
    'Dashboard':'ዳሽቦርድ','Farm Advisor':'የእርሻ አማካሪ',
    'Disease Diagnosis':'የበሽታ ምርመራ','Soil Analyser':'የአፈር ትንታኔ',
    'Planting Calendar':'የመዝሪያ ቀን','Weather Advisor':'የአየር ሁኔታ አማካሪ',
    'Animal Registry':'የእንስሳት ምዝገባ','Milk Tracker':'የወተት ክትትል',
    'Egg Tracker':'የእንቁላል ክትትል','Breeding Tracker':'የርቢ ክትትል',
    'Weight Tracker':'የክብደት ክትትል','Feed Calculator':'የምግብ ስሌት',
    'Profit Tracker':'የትርፍ ክትትል','Farm Bookkeeping':'የእርሻ ሂሳብ',
    'Loan Calculator':'የብድር ስሌት','Insurance Calc':'የኢንሹራንስ ስሌት',
    'Subsidy Finder':'ድጎማ ፈላጊ','Farm Reports':'የእርሻ ሪፖርቶች',
    'Inventory':'ክምችት','Task Manager':'የተግባር አስተዳዳሪ',
    'Labour Tracker':'የሰራተኛ ክትትል','Land Manager':'የመሬት አስተዳዳሪ',
    'Water Tracker':'የውሃ ክትትል','Marketplace':'ገበያ',
    'Vet Directory':'የ獣醫 ማውጫ','Suppliers':'አቅራቢዎች',
    'My Farm':'የኔ እርሻ','No farm info yet':'እስካሁን የእርሻ መረጃ የለም',
    'Edit Farm Info':'የእርሻ መረጃ አርትዕ','offline':'📡 ከበይነ መረብ ውጭ ነዎት። AI ወደ ኢንተርኔት ያስፈልጋል።'
  },
  ki: {
    'Main':'Ndiini','Analytics':'Gwima Ndeto','Diagnosis & Planning':'Kũhinga Mirimu na Gũthura Njira',
    'Livestock & Production':'Thiome na Irio','Finance & Support':'Mbeca na Ũteithio',
    'Operations':'Miitire','Connect':'Hũthana',
    'Dashboard':'Ũrĩa wa Ndeto','Farm Advisor':'Mũthuri wa Mũgũnda',
    'Disease Diagnosis':'Kũhinga Mirimu','Soil Analyser':'Gwima Ithaka',
    'Planting Calendar':'Ndiaro ya Gũtema','Weather Advisor':'Mũthuri wa Riera',
    'Animal Registry':'Ndũika ya Nyamũirũ','Milk Tracker':'Gwima Iria',
    'Egg Tracker':'Gwima Maai ma Ngũkũ','Breeding Tracker':'Gwima Ũhiũ',
    'Weight Tracker':'Gwima Nduini','Feed Calculator':'Kũhesabu Irio',
    'Profit Tracker':'Gwima Unjuri','Farm Bookkeeping':'Ũandĩki wa Mũgũnda',
    'Loan Calculator':'Kũhesabu Ũndũ wa Deni','Insurance Calc':'Kũhesabu Bima',
    'Subsidy Finder':'Gũtũmbũra Ũteithio wa Gavamende','Farm Reports':'Maarifa ma Mũgũnda',
    'Inventory':'Gwima Indo','Task Manager':'Mũratairu wa Miitire',
    'Labour Tracker':'Gwima Arĩmi','Land Manager':'Mũratairu wa Ithaka',
    'Water Tracker':'Gwima Maĩ','Marketplace':'Mũhuro',
    'Vet Directory':'Ndũika ya Adaktari a Nyamũirũ','Suppliers':'Arĩndĩri a Indo',
    'My Farm':'Mũgũnda Wakwa','No farm info yet':'Ndĩrĩ ũhoro wa mũgũnda',
    'Edit Farm Info':'Hindura Ũhoro wa Mũgũnda','offline':'📡 Ũrĩ nja ya intaneti. AI ĩhitagie intaneti.'
  },
  lg: {
    'Main':'Omutwe','Analytics':'Enteekateeka','Diagnosis & Planning':'Obugumivu n\'Entegeka',
    'Livestock & Production':'Ebisolo n\'Ebikolwa','Finance & Support':'Ensimbi n\'Obuyambi',
    'Operations':'Omulimu','Connect':'Kwegattaanya',
    'Dashboard':'Dashibodi','Farm Advisor':'Omubonero w\'Ennimiro',
    'Disease Diagnosis':'Obugumivu bw\'Obulwadde','Soil Analyser':'Okusoma Ttaka',
    'Planting Calendar':'Kalandala ey\'Okusiga','Weather Advisor':'Omubonero w\'Obudde',
    'Animal Registry':'Ebitabo by\'Ebisolo','Milk Tracker':'Okugoberera Amata',
    'Egg Tracker':'Okugoberera Amagi','Breeding Tracker':'Okugoberera Okuzaala',
    'Weight Tracker':'Okugoberera Obuzito','Feed Calculator':'Kubala Emmere',
    'Profit Tracker':'Okugoberera Ennuma','Farm Bookkeeping':'Ebitabo by\'Ennimiro',
    'Loan Calculator':'Kubala Eddeni','Insurance Calc':'Kubala Inshuwalansi',
    'Subsidy Finder':'Noonya Obuyambi','Farm Reports':'Lipoota z\'Ennimiro',
    'Inventory':'Ebintu ebibaamu','Task Manager':'Omulabirizi w\'Emirimu',
    'Labour Tracker':'Okugoberera Abakozi','Land Manager':'Omulabirizi w\'Ettaka',
    'Water Tracker':'Okugoberera Amazzi','Marketplace':'Katale',
    'Vet Directory':'Ebitabo by\'Abadwaliro','Suppliers':'Abawaayo',
    'My Farm':'Ennimiro Yange','No farm info yet':'Tewali makulu ga nnimiro',
    'Edit Farm Info':'Kyusa Makulu ga Nnimiro','offline':'📡 Oli bweru w\'intaneti. AI eyagala intaneti.'
  }
};

var T = function(key) {
  var lang = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
  return lang[key] || TRANSLATIONS['en'][key] || key;
};

var isSwahili = function() { return currentLang !== 'en'; };
var langNote = function() {
  var notes = {sw:'Jibu kwa Kiswahili.',fr:'Repondez en francais.',am:'Respond in Amharic if possible.',ki:'Geria gũcooka na Gĩgĩkũyũ.',lg:'Ddamu mu Luganda.'};
  return notes[currentLang] || 'Respond in English.';
};

function setLang(code) {
  try {
    currentLang = code;
    localStorage.setItem('al_lang', code);
    buildTopbar();
    buildSidebar(window.AL_PAGE || 'dashboard');
    // Update offline banner text
    var banner = document.getElementById('offlineBanner');
    if (banner) banner.textContent = T('offline');
  } catch(e) {}
}

function buildLangToggle() {
  try {
    var el = document.getElementById('langToggle');
    if (!el) return;
    var langs = [{c:'en',l:'EN'},{c:'sw',l:'SW'},{c:'fr',l:'FR'},{c:'am',l:'AM'},{c:'ki',l:'GI'},{c:'lg',l:'LG'}];
    el.innerHTML = langs.map(function(lang) {
      var active = lang.c === currentLang ? ' active' : '';
      return '<button class="lang-btn' + active + '" data-lang="' + lang.c + '" onclick="setLang(this.dataset.lang)">' + lang.l + '</button>';
    }).join('');
  } catch(e) {}
}

async function callAI(prompt, isArray) {
  var messages = isArray ? prompt : [{role:'user',content:prompt}];
  var resp = await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:messages})});
  var data = await resp.json();
  return data.content ? data.content.map(function(c){return c.text||'';}).join('') : '';
}

async function callAIWithSystem(system, messages) {
  var resp = await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:system,messages:messages})});
  var data = await resp.json();
  return data.content ? data.content.map(function(c){return c.text||'';}).join('') : '';
}

var PAGES = [
  {id:'dashboard',label:'Dashboard',        icon:'&#127968;',href:'index.html',    section:'Main'},
  {id:'chat',     label:'Farm Advisor',     icon:'&#129302;',href:'chat.html',     section:'Main',badge:'AI'},
  {id:'analytics',label:'Analytics',        icon:'&#128200;',href:'analytics.html',section:'Analytics'},
  {id:'diagnosis',label:'Disease Diagnosis',icon:'&#128300;',href:'diagnosis.html',section:'Diagnosis & Planning'},
  {id:'soil',     label:'Soil Analyser',    icon:'&#129514;',href:'soil.html',     section:'Diagnosis & Planning'},
  {id:'calendar', label:'Planting Calendar',icon:'&#128197;',href:'calendar.html', section:'Diagnosis & Planning'},
  {id:'weather',  label:'Weather Advisor',  icon:'&#127780;',href:'weather.html',  section:'Diagnosis & Planning'},
  {id:'animals',  label:'Animal Registry',  icon:'&#128004;',href:'animals.html',  section:'Livestock & Production'},
  {id:'milk',     label:'Milk Tracker',     icon:'&#129371;',href:'milk.html',     section:'Livestock & Production'},
  {id:'eggs',     label:'Egg Tracker',      icon:'&#129370;',href:'eggs.html',     section:'Livestock & Production'},
  {id:'breeding', label:'Breeding Tracker', icon:'&#128035;',href:'breeding.html', section:'Livestock & Production'},
  {id:'weight',   label:'Weight Tracker',   icon:'&#9878;',  href:'weight.html',   section:'Livestock & Production'},
  {id:'feed',     label:'Feed Calculator',  icon:'&#129518;',href:'feed.html',     section:'Finance & Support'},
  {id:'profit',   label:'Profit Tracker',   icon:'&#128176;',href:'profit.html',   section:'Finance & Support'},
  {id:'books',    label:'Farm Bookkeeping', icon:'&#128218;',href:'books.html',    section:'Finance & Support'},
  {id:'loan',     label:'Loan Calculator',  icon:'&#128179;',href:'loan.html',     section:'Finance & Support'},
  {id:'insurance',label:'Insurance Calc',   icon:'&#128737;',href:'insurance.html',section:'Finance & Support'},
  {id:'subsidy',  label:'Subsidy Finder',   icon:'&#127963;',href:'subsidy.html',  section:'Finance & Support'},
  {id:'reports',  label:'Farm Reports',     icon:'&#128202;',href:'reports.html',  section:'Finance & Support'},
  {id:'inventory',label:'Inventory',        icon:'&#128230;',href:'inventory.html',section:'Operations'},
  {id:'tasks',    label:'Task Manager',     icon:'&#128203;',href:'tasks.html',    section:'Operations'},
  {id:'labour',   label:'Labour Tracker',   icon:'&#128119;',href:'labour.html',   section:'Operations'},
  {id:'land',     label:'Land Manager',     icon:'&#128506;',href:'land.html',     section:'Operations'},
  {id:'water',    label:'Water Tracker',    icon:'&#128167;',href:'water.html',    section:'Operations'},
  {id:'market',   label:'Marketplace',      icon:'&#127978;',href:'market.html',   section:'Connect'},
  {id:'vets',     label:'Vet Directory',    icon:'&#127973;',href:'vets.html',     section:'Connect'},
  {id:'suppliers',label:'Suppliers',        icon:'&#127980;',href:'suppliers.html',section:'Connect'}
];

function buildSidebar(activePage) {
  try {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    var profile = getProfile();
    var html = '';
    var lastSection = '';
    PAGES.forEach(function(p) {
      if (p.section !== lastSection) {
        if (lastSection) html += '</div>';
        html += '<div class="sb-section"><div class="sb-label">' + T(p.section) + '</div>';
        lastSection = p.section;
      }
      html += '<a class="sb-item' + (p.id===activePage?' active':'') + '" href="' + p.href + '">';
      html += '<span class="sb-icon">' + p.icon + '</span><span>' + T(p.label) + '</span>';
      if (p.badge) html += '<span class="sb-badge">' + p.badge + '</span>';
      html += '</a>';
    });
    html += '</div><div class="sb-divider"></div><div class="sb-farm"><div class="sb-farm-title">' + T('My Farm') + '</div><div id="sbFarmContent">';
    var items = [];
    if (profile.name)     items.push('&#127968; <span>'+escHtml(profile.name)+'</span>');
    if (profile.location) items.push('&#128205; <span>'+escHtml(profile.location)+'</span>');
    if (profile.animal)   items.push('&#128062; <span>'+escHtml(profile.animal)+'</span>');
    if (profile.crops)    items.push('&#127806; <span>'+escHtml(profile.crops)+'</span>');
    if (profile.size)     items.push('&#128208; <span>'+escHtml(profile.size)+'</span>');
    html += items.length ? items.map(function(i){return '<div class="sb-farm-item">'+i+'</div>';}).join('') : '<div class="sb-farm-item">' + T('No farm info yet') + '</div>';
    html += '</div><button class="sb-farm-edit" onclick="openFarmModal()">' + T('Edit Farm Info') + '</button></div>';
    sidebar.innerHTML = html;
  } catch(e) { console.log('buildSidebar error:',e); }
}

function toggleSidebar() {
  try {
    var s = document.getElementById('sidebar');
    var o = document.getElementById('sbOverlay');
    if (!s) return;
    var open = s.classList.toggle('open');
    if (o) o.style.display = open ? 'block' : 'none';
  } catch(e) {}
}

function openFarmModal() {
  try {
    var profile = getProfile();
    var modal = document.getElementById('farmModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'farmModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = '<div class="modal"><h3>My Farm Profile</h3><p class="modal-sub">Helps AI give personalised advice.</p><div class="modal-fields"><input type="text" id="fm-name" placeholder="Farm name"><input type="text" id="fm-location" placeholder="Location (e.g. Nakuru, Kenya)"><div class="sw"><select id="fm-animal"><option value="">Main livestock</option><option value="Broiler Chicken">Broiler Chickens</option><option value="Layer Chickens">Layer Chickens</option><option value="Bull">Bulls</option><option value="Dairy Cows">Dairy Cows</option><option value="Goats">Goats</option><option value="Sheep">Sheep</option><option value="Tilapia">Tilapia</option><option value="Catfish">Catfish</option></select></div><input type="text" id="fm-crops" placeholder="Main crops"><input type="text" id="fm-size" placeholder="Farm size (e.g. 2 acres)"><div class="sw"><select id="fm-exp"><option value="">Farming experience</option><option value="Beginner (0-2 years)">Beginner (0-2 years)</option><option value="Intermediate (3-7 years)">Intermediate (3-7 years)</option><option value="Experienced (7+ years)">Experienced (7+ years)</option></select></div></div><div class="modal-actions"><button class="modal-cancel" onclick="closeFarmModal()">Cancel</button><button class="modal-save" onclick="saveFarmProfileModal()">Save Profile</button></div></div>';
      document.body.appendChild(modal);
    }
    ['name','location','crops','size'].forEach(function(k){var el=document.getElementById('fm-'+k);if(el)el.value=profile[k]||'';});
    var an=document.getElementById('fm-animal');if(an)an.value=profile.animal||'';
    var ex=document.getElementById('fm-exp');if(ex)ex.value=profile.exp||'';
    modal.classList.add('open');
  } catch(e) { console.log('openFarmModal error:',e); }
}

function closeFarmModal() { var m=document.getElementById('farmModal');if(m)m.classList.remove('open'); }

function saveFarmProfileModal() {
  try {
    saveProfile({
      name:    (document.getElementById('fm-name')?document.getElementById('fm-name').value:'').trim(),
      location:(document.getElementById('fm-location')?document.getElementById('fm-location').value:'').trim(),
      animal:   document.getElementById('fm-animal')?document.getElementById('fm-animal').value:'',
      crops:   (document.getElementById('fm-crops')?document.getElementById('fm-crops').value:'').trim(),
      size:    (document.getElementById('fm-size')?document.getElementById('fm-size').value:'').trim(),
      exp:      document.getElementById('fm-exp')?document.getElementById('fm-exp').value:''
    });
    closeFarmModal();
    buildSidebar(window.AL_PAGE||'dashboard');
  } catch(e) {}
}

function buildTopbar() {
  try {
    var topbar = document.getElementById('topbar');
    if (!topbar) return;
    topbar.innerHTML = '<a class="logo" href="index.html"><div class="logo-icon">&#127807;</div><div class="logo-text">Agri<span>Logic</span></div></a><div class="topbar-right"><button class="install-btn" id="installBtn" onclick="installPWA()">Install App</button><div class="lang-toggle" id="langToggle"></div><button class="menu-toggle" onclick="toggleSidebar()">&#9776;</button></div>';
    buildLangToggle();
  } catch(e) { console.log('buildTopbar error:',e); }
}

var deferredInstall = null;

function setupPWA() {
  try {
    window.addEventListener('beforeinstallprompt',function(e){
      e.preventDefault();deferredInstall=e;
      var btn=document.getElementById('installBtn');if(btn)btn.classList.add('show');
    });

    // FIX: Only show offline banner on actual offline events, not on page load
    // navigator.onLine is unreliable on GitHub Pages and often returns false briefly
    var banner = document.getElementById('offlineBanner');
    if (banner) {
      // Set correct translated text
      banner.textContent = T('offline');
      // Only show if we're truly offline (hide by default, show on offline event)
      banner.classList.remove('show');
    }

    window.addEventListener('offline', function() {
      var b = document.getElementById('offlineBanner');
      if (b) { b.textContent = T('offline'); b.classList.add('show'); }
    });
    window.addEventListener('online', function() {
      var b = document.getElementById('offlineBanner');
      if (b) b.classList.remove('show');
    });
  } catch(e) {}
}

function installPWA() { if(!deferredInstall)return;deferredInstall.prompt();deferredInstall.userChoice.then(function(){deferredInstall=null;}); }

function initShared(activePage) {
  try {
    window.AL_PAGE = activePage;
    buildTopbar();
    buildSidebar(activePage);
    setupPWA();
    document.querySelectorAll('input[type="date"]').forEach(function(el){if(!el.value)el.value=today();});
  } catch(e) { console.log('initShared error:',e); }
}

function shareWhatsApp(text) { window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank'); }
