// AGRILOGIC SHARED.JS v3.0 - Ultra stable, no special chars
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

var currentLang = localStorage.getItem('al_lang') || 'en';
var isSwahili = function() { return currentLang !== 'en'; };
var langNote = function() {
  var notes = {sw:'Jibu kwa Kiswahili.',fr:'Repondez en francais.',am:'Respond in Amharic if possible.',ki:'Cokio na Gikuyu.',lg:'Ddamu mu Luganda.'};
  return notes[currentLang] || 'Respond in English.';
};

function setLang(code) {
  try {
    currentLang = code;
    localStorage.setItem('al_lang', code);
    buildTopbar();
    buildSidebar(window.AL_PAGE || 'dashboard');
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
        html += '<div class="sb-section"><div class="sb-label">' + p.section + '</div>';
        lastSection = p.section;
      }
      html += '<a class="sb-item' + (p.id===activePage?' active':'') + '" href="' + p.href + '">';
      html += '<span class="sb-icon">' + p.icon + '</span><span>' + p.label + '</span>';
      if (p.badge) html += '<span class="sb-badge">' + p.badge + '</span>';
      html += '</a>';
    });
    html += '</div><div class="sb-divider"></div><div class="sb-farm"><div class="sb-farm-title">My Farm</div><div id="sbFarmContent">';
    var items = [];
    if (profile.name)     items.push('&#127968; <span>'+escHtml(profile.name)+'</span>');
    if (profile.location) items.push('&#128205; <span>'+escHtml(profile.location)+'</span>');
    if (profile.animal)   items.push('&#128062; <span>'+escHtml(profile.animal)+'</span>');
    if (profile.crops)    items.push('&#127806; <span>'+escHtml(profile.crops)+'</span>');
    if (profile.size)     items.push('&#128208; <span>'+escHtml(profile.size)+'</span>');
    html += items.length ? items.map(function(i){return '<div class="sb-farm-item">'+i+'</div>';}).join('') : '<div class="sb-farm-item">No farm info yet</div>';
    html += '</div><button class="sb-farm-edit" onclick="openFarmModal()">Edit Farm Info</button></div>';
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
    window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredInstall=e;var btn=document.getElementById('installBtn');if(btn)btn.classList.add('show');});
    var chk=function(){var b=document.getElementById('offlineBanner');if(b)b.classList.toggle('show',!navigator.onLine);};
    window.addEventListener('online',chk);window.addEventListener('offline',chk);chk();
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
