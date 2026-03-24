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

// ─── PAGE-LEVEL TRANSLATIONS ─────────────────────────────────────────────────
var PAGE_TRANSLATIONS = {
  sw: {
    '+ Log Entry':'+ Ingiza Rekodi','+ Add Animal':'+ Ongeza Mnyama','+ Add Worker':'+ Ongeza Mfanyakazi',
    '+ Add Task':'+ Ongeza Kazi','+ Add Item':'+ Ongeza Bidhaa','+ Add Parcel':'+ Ongeza Kipande cha Ardhi',
    '+ Add Expense':'+ Ongeza Gharama','+ Add Income':'+ Ongeza Mapato','+ Add Ingredient':'+ Ongeza Kiungo',
    '+ Add Cost Item':'+ Ongeza Gharama','+ Add Vet Contact':'+ Ongeza Daktari','+ Add Supplier':'+ Ongeza Msambazaji',
    '+ Log Breeding Event':'+ Rekodi ya Uzazi','+ Log Labour Entry':'+ Rekodi ya Kazi ya Wafanyakazi',
    '+ Log Vet Visit':'+ Rekodi ya Daktari','+ Log Weight Entry':'+ Rekodi ya Uzito',
    '+ New Batch':'+ Kundi Jipya','Add Farm Task':'Ongeza Kazi ya Shamba','Add Health Event':'Ongeza Tukio la Afya',
    'Add Worker':'Ongeza Mfanyakazi','Generate Report':'Tengeneza Ripoti',
    'Log Milk Production':'Rekodi ya Maziwa','Log Egg Collection':'Rekodi ya Mayai',
    'Log Water Usage':'Rekodi ya Matumizi ya Maji','Log Labour Entry':'Rekodi ya Kazi',
    'Log Vet Visit':'Rekodi ya Ziara ya Daktari','Log Weight':'Rekodi ya Uzito',
    'Summary':'Muhtasari','Batch Info':'Maelezo ya Kundi','Farm Details':'Maelezo ya Shamba',
    'Ingredients & Prices':'Viungo na Bei','Feed Formula':'Fomula ya Chakula',
    'Cost Breakdown':'Mgawanyo wa Gharama','Soil Test Results':'Matokeo ya Mtihani wa Udongo',
    'Location & Context':'Mahali na Muktadha','Current Conditions':'Hali ya Sasa',
    'Current Weather':'Hali ya Hewa Sasa','Loan Details':'Maelezo ya Mkopo',
    'Farm Assets':'Mali za Shamba','Your Farm Profile':'Wasifu wa Shamba Lako',
    'Farm Revenue Context':'Muktadha wa Mapato ya Shamba','Coverage Preferences':'Mapendeleo ya Bima',
    'Flock Stats':'Takwimu za Kundi','Growth Summary':'Muhtasari wa Ukuaji',
    'AI Irrigation Advice':'Ushauri wa AI wa Umwagiliaji',
    'Date':'Tarehe','Notes':'Maelezo','Location':'Mahali','Category':'Kategoria',
    'Currency':'Sarafu','Animal ID / Name':'Kitambulisho / Jina la Mnyama',
    'Animal Type':'Aina ya Mnyama','Animal ID / Batch':'Kitambulisho / Kundi',
    'Morning Yield (L)':'Mazao ya Asubuhi (L)','Evening Yield (L)':'Mazao ya Jioni (L)',
    'Quality':'Ubora','Sale Price/L':'Bei ya Uuzaji/L','Sale Price / Egg':'Bei/Yai',
    'Sale Price / Unit':'Bei/Kitengo','Sale Price/Unit':'Bei/Kitengo',
    'Eggs Collected':'Mayai Yaliyokusanywa','Broken/Rejected':'Yaliyovunjika/Kukataliwa',
    'Flock / Pen ID':'Kitambulisho cha Kundi','Flock Size':'Ukubwa wa Kundi',
    'Feed Used (kg)':'Chakula Kilichotumika (kg)','Weight (kg)':'Uzito (kg)',
    'Age (days)':'Umri (siku)','Start Date':'Tarehe ya Kuanza','End Date':'Tarehe ya Mwisho',
    'Stage':'Hatua','Method':'Njia','Duration (minutes)':'Muda (dakika)',
    'Water Used (litres)':'Maji Yaliyotumika (lita)','Irrigation':'Umwagiliaji',
    'Soil Type':'Aina ya Udongo','pH Level':'Kiwango cha pH',
    'Nitrogen (N) ppm':'Nitrojeni (N) ppm','Phosphorus (P)':'Fosfori (P)',
    'Potassium (K)':'Potasiamu (K)','Calcium (Ca)':'Kalsiamu (Ca)',
    'Magnesium (Mg)':'Magnesiamu (Mg)','Organic Matter %':'Viumbe Hai %',
    'Previous Crop':'Zao la Awali','Target Crops':'Mazao Yanayolengwa',
    'Select Crops':'Chagua Mazao','Crop':'Zao','Crop Stage':'Hatua ya Zao',
    'Crop / Area':'Zao / Eneo','Crop Area (acres)':'Eneo la Zao (ekari)',
    'Crop Expected Value':'Thamani Inayotarajiwa ya Zao',
    'Season':'Msimu','Altitude':'Mwinuko','Region / County':'Mkoa / Kaunti',
    'County / Region':'Kaunti / Mkoa','Country':'Nchi','Country / Region':'Nchi / Mkoa',
    'Farm Size':'Ukubwa wa Shamba','Farm Size (acres)':'Ukubwa wa Shamba (ekari)',
    'Farm Type':'Aina ya Shamba','Farmer Category':'Aina ya Mkulima',
    'Farming Experience':'Uzoefu wa Kilimo','Goal':'Lengo','Urgency':'Kiwango cha Haraka',
    'Describe symptoms':'Eleza dalili','Other Crops':'Mazao Mengine',
    'Main Concern':'Tatizo Kuu','Active Crops / Animals':'Mazao/Wanyama Wanaoshughulika',
    'Loan Amount':'Kiasi cha Mkopo','Loan Type':'Aina ya Mkopo',
    'Loan Purpose':'Madhumuni ya Mkopo','Annual Interest Rate (%)':'Riba ya Mwaka (%)',
    'Term (months)':'Muda (miezi)','Payment Frequency':'Mzunguko wa Malipo',
    'Annual Farm Income':'Mapato ya Kila Mwaka ya Shamba',
    'Livestock Total Value':'Thamani Jumla ya Mifugo',
    'Livestock Count':'Idadi ya Mifugo','Equipment Value':'Thamani ya Vifaa',
    'Coverage Type':'Aina ya Bima','Annual Budget for Premium':'Bajeti ya Kila Mwaka kwa Bima',
    'Main Product':'Bidhaa Kuu','Main Risks (hold Ctrl/Cmd for multiple)':'Hatari Kuu (shikilia Ctrl/Cmd kwa zaidi)',
    'Animals Count':'Idadi ya Wanyama','Batches / Year':'Makundi kwa Mwaka',
    'Units / Batch':'Vitengo kwa Kundi','Units Sold':'Vitengo Vilivyouzwa',
    'Mortality (units)':'Vifo (vitengo)','By-product Revenue':'Mapato ya Bidhaa Nyingine',
    'Batch Name':'Jina la Kundi','Batch Size (kg)':'Ukubwa wa Kundi (kg)',
    'Revenue':'Mapato','Report Type':'Aina ya Ripoti','Period':'Kipindi',
    'Month':'Mwezi','Sample Size':'Ukubwa wa Sampuli',
    'Count':'Hesabu','Unit':'Kitengo','Cost / Unit':'Gharama / Kitengo',
    'What are you looking for?':'Unatafuta nini?',
    'Farm Revenue Context':'Muktadha wa Mapato ya Shamba',
    '🌤️ Get Weather Farming Advice':'🌤️ Pata Ushauri wa Hali ya Hewa',
    '🏛️ Find My Subsidies & Grants':'🏛️ Tafuta Ruzuku na Misaada',
    '💧 Get Irrigation Advice':'💧 Pata Ushauri wa Umwagiliaji',
    '💳 Calculate Repayment Plan':'💳 Hesabu Mpango wa Kulipa',
    '📅 Generate My Planting Calendar':'📅 Tengeneza Kalenda ya Kupanda',
    '📊 Analyse Profit & Loss':'📊 Changanua Faida na Hasara',
    '📊 Generate AI Farm Report':'📊 Tengeneza Ripoti ya AI',
    '📋 Copy Report':'📋 Nakili Ripoti',
    '📱 Share Calendar on WhatsApp':'📱 Shiriki kwenye WhatsApp',
    '📱 Share Monthly Report on WhatsApp':'📱 Shiriki Ripoti kwenye WhatsApp',
    '📱 Share Result on WhatsApp':'📱 Shiriki Matokeo kwenye WhatsApp',
    '📱 Share Summary':'📱 Shiriki Muhtasari','📱 Share on WhatsApp':'📱 Shiriki kwenye WhatsApp',
    '🔬 Diagnose Now':'🔬 Chunguza Sasa','🗑 Clear':'🗑 Futa',
    '🛡️ Calculate My Insurance Needs':'🛡️ Hesabu Mahitaji ya Bima',
    '🧪 Analyse My Soil':'🧪 Changanua Udongo Wangu',
    '🧮 Calculate Feed Formula':'🧮 Hesabu Fomula ya Chakula',
    "📤 I'm Selling":"📤 Ninauz","📥 I'm Buying":"📥 Ninanunua"
  },
  ki: {
    '+ Log Entry':'+ Andika Ũhoro','+ Add Animal':'+ Ongera Nyamũirũ','+ Add Worker':'+ Ongera Mũrũtĩ',
    '+ Add Task':'+ Ongera Ũndũ','+ Add Item':'+ Ongera Kĩndu','+ Add Parcel':'+ Ongera Githaka',
    '+ Add Expense':'+ Ongera Iheo','+ Add Income':'+ Ongera Unjuri','+ Add Ingredient':'+ Ongera Kĩndu kĩa Irio',
    '+ Add Cost Item':'+ Ongera Iheo','+ Add Vet Contact':'+ Ongera Adaktari a Nyamũirũ',
    '+ Add Supplier':'+ Ongera Mũrindĩri','+ Log Breeding Event':'+ Andika Ũhoro wa Ũhiũ',
    '+ Log Labour Entry':'+ Andika Mũrithi wa Arĩmi',
    '+ Log Vet Visit':'+ Andika Kwendwo kwa Adaktari','+ Log Weight Entry':'+ Andika Nduini',
    '+ New Batch':'+ Kirĩndo Kĩpya','Add Farm Task':'Ongera Ũndũ wa Mũgũnda',
    'Add Health Event':'Ongera Ũhoro wa Afya','Add Worker':'Ongera Mũrũtĩ',
    'Generate Report':'Handa Maarifa ma Mũgũnda',
    'Log Milk Production':'Andika Ũhoro wa Iria','Log Egg Collection':'Andika Maai ma Ngũkũ',
    'Log Water Usage':'Andika Maĩ Maarũmũ','Log Labour Entry':'Andika Mũrithi wa Arĩmi',
    'Log Vet Visit':'Andika Kwendwo kwa Adaktari','Log Weight':'Andika Nduini',
    'Summary':'Maarifa Mahĩũ','Batch Info':'Ũhoro wa Kirĩndo','Farm Details':'Ũhoro wa Mũgũnda',
    'Ingredients & Prices':'Indo na Thogora ciazo','Feed Formula':'Njira ya Irio cia Nyamũirũ',
    'Cost Breakdown':'Kugawĩra Iheo','Soil Test Results':'Matũũranio ma Gwima Ithaka',
    'Location & Context':'Mahali na Ũhoro wake','Current Conditions':'Hali ya Uguo',
    'Current Weather':'Riera ya Mũthenya Uguo','Loan Details':'Ũhoro wa Deni',
    'Farm Assets':'Indo cia Mũgũnda','Your Farm Profile':'Ũhoro wa Mũgũnda Wakwa',
    'Farm Revenue Context':'Ũhoro wa Unjuri wa Mũgũnda','Coverage Preferences':'Mapendeleo ma Bima',
    'Flock Stats':'Ndeto cia Kirĩnda kia Ngũkũ','Growth Summary':'Maarifa ma Gũkua',
    'AI Irrigation Advice':'Ũhoro wa AI wa Gũnyũha Mũgũnda',
    'Date':'Mũthenya','Notes':'Maandĩki','Location':'Mahali','Category':'Kĩheha',
    'Currency':'Mũthemba wa Mbeca','Animal ID / Name':'Nambari / Rĩĩtwa ria Nyamũirũ',
    'Animal Type':'Mũthemba wa Nyamũirũ','Animal ID / Batch':'Nambari / Kirĩndo',
    'Morning Yield (L)':'Iria cia Rũciinĩ (L)','Evening Yield (L)':'Iria cia Hwaĩnĩ (L)',
    'Quality':'Ũnoru wa Iria','Sale Price/L':'Thogora ya Kuuzĩria/L',
    'Sale Price / Egg':'Thogora/Ĩĩ','Sale Price / Unit':'Thogora/Kĩndu','Sale Price/Unit':'Thogora/Kĩndu',
    'Eggs Collected':'Maai ma Ngũkũ Maahotanĩtwe','Broken/Rejected':'Yaraũrĩte/Yakataĩtwe',
    'Flock / Pen ID':'Nambari ya Kirĩnda kia Ngũkũ','Flock Size':'Mũhiano wa Kirĩnda',
    'Feed Used (kg)':'Irio Ĩaarũmĩtwe (kg)','Weight (kg)':'Nduini (kg)',
    'Age (days)':'Mĩaka ya Mathiku','Start Date':'Mũthenya wa Kũambĩrĩria',
    'End Date':'Mũthenya wa Gũthia','Stage':'Nthĩ ya Ũndũ','Method':'Njira',
    'Duration (minutes)':'Mũthenya wa Njohi (dakika)',
    'Water Used (litres)':'Maĩ Maarũmĩtwe (lita)','Irrigation':'Gũnyũha Mũgũnda',
    'Soil Type':'Mũthemba wa Ithaka','pH Level':'Kĩĩmĩ kia pH',
    'Nitrogen (N) ppm':'Nitrojeni (N) ppm','Phosphorus (P)':'Fosforasi (P)',
    'Potassium (K)':'Potasiamu (K)','Calcium (Ca)':'Kalsiamu (Ca)',
    'Magnesium (Mg)':'Magnesiamu (Mg)','Organic Matter %':'Viumbe vya Ithaka (%)',
    'Previous Crop':'Mũmera wa Mbere','Target Crops':'Mĩmera Ĩngĩrĩtwo',
    'Select Crops':'Chagũra Mĩmera','Crop':'Mũmera','Crop Stage':'Nthĩ ya Mũmera',
    'Crop / Area':'Mũmera / Ithaka','Crop Area (acres)':'Ithaka cia Mũmera (ekari)',
    'Crop Expected Value':'Thogora Ĩngĩrĩtwo ya Mũmera',
    'Season':'Kĩhĩndu','Altitude':'Gũtũũrĩra kwa Juu','Region / County':'Kaũnti / Gĩtũũra',
    'County / Region':'Kaũnti','Country':'Nchi','Country / Region':'Nchi / Kaũnti',
    'Farm Size':'Ũnene wa Mũgũnda','Farm Size (acres)':'Ũnene wa Mũgũnda (ekari)',
    'Farm Type':'Mũthemba wa Mũgũnda','Farmer Category':'Kĩheha kia Mũrĩmi',
    'Farming Experience':'Ũmenyo wa Ũrĩmi','Goal':'Kĩheo kĩa Mũgũnda','Urgency':'Njohi ya Ũndũ',
    'Describe symptoms':'Ũhora Thimu cia Mũrimũ','Other Crops':'Mĩmera Ĩngĩ',
    'Main Concern':'Ũndũ Mũnene wa Gũĩĩka','Active Crops / Animals':'Mĩmera/Nyamũirũ cia Uguo',
    'Loan Amount':'Mũhiano wa Deni','Loan Type':'Mũthemba wa Deni',
    'Loan Purpose':'Kĩheo kia Gũhĩtĩkĩa Deni','Annual Interest Rate (%)':'Rĩbĩ ya Mwaka (%)',
    'Term (months)':'Mũthenya wa Miezi','Payment Frequency':'Mara cia Gũcooria Mbeca',
    'Annual Farm Income':'Unjuri wa Mũgũnda kwa Mwaka',
    'Livestock Total Value':'Thogora Yothe ya Nyamũirũ',
    'Livestock Count':'Mũhiano wa Nyamũirũ','Equipment Value':'Thogora ya Indo cia Ũrĩmi',
    'Coverage Type':'Mũthemba wa Bima','Annual Budget for Premium':'Bajeti ya Bima kwa Mwaka',
    'Main Product':'Kĩndu Kĩnene kĩa Kuuzĩria',
    'Main Risks (hold Ctrl/Cmd for multiple)':'Ũogwo Mũnene (Ctrl/Cmd kwa mairũ)',
    'Animals Count':'Mũhiano wa Nyamũirũ','Batches / Year':'Virĩndo kwa Mwaka',
    'Units / Batch':'Vĩndu kwa Kirĩndo','Units Sold':'Vĩndu Vĩarutĩtwo',
    'Mortality (units)':'Ifu (vĩndu)','By-product Revenue':'Unjuri wa Indo Ĩngĩ',
    'Batch Name':'Rĩĩtwa ria Kirĩndo','Batch Size (kg)':'Ũnene wa Kirĩndo (kg)',
    'Revenue':'Unjuri wa Mbeca','Report Type':'Mũthemba wa Maarifa','Period':'Njohi ya Mũthenya',
    'Month':'Mweri','Sample Size':'Ũnene wa Sampuli',
    'Count':'Mũhiano','Unit':'Kĩndu','Cost / Unit':'Iheo / Kĩndu',
    'What are you looking for?':'Nĩ kĩĩ gĩkũhĩthiaga?',
    'Farm Revenue Context':'Ũhoro wa Unjuri wa Mũgũnda',
    '🌤️ Get Weather Farming Advice':'🌤️ Ũhoro wa Riera wa Ũrĩmi',
    '🏛️ Find My Subsidies & Grants':'🏛️ Tũmbũra Ũteithio wa Gavamende',
    '💧 Get Irrigation Advice':'💧 Ũhoro wa Gũnyũha Mũgũnda',
    '💳 Calculate Repayment Plan':'💳 Hesabu Njira ya Gũcooria Deni',
    '📅 Generate My Planting Calendar':'📅 Handa Ndiaro ya Gũtema',
    '📊 Analyse Profit & Loss':'📊 Gwima Unjuri na Mwanangĩ',
    '📊 Generate AI Farm Report':'📊 Handa Maarifa ma AI',
    '📋 Copy Report':'📋 Nakiri Maarifa',
    '📱 Share Calendar on WhatsApp':'📱 Tũma kũrĩa wa WhatsApp',
    '📱 Share Monthly Report on WhatsApp':'📱 Tũma Maarifa kũrĩa wa WhatsApp',
    '📱 Share Result on WhatsApp':'📱 Tũma Matũũranio kũrĩa wa WhatsApp',
    '📱 Share Summary':'📱 Tũma Maarifa Mahĩũ','📱 Share on WhatsApp':'📱 Tũma kũrĩa wa WhatsApp',
    '🔬 Diagnose Now':'🔬 Hinga Mũrimũ Uguo','🗑 Clear':'🗑 Sũna Indo',
    '🛡️ Calculate My Insurance Needs':'🛡️ Hesabu Bima Yakwa',
    '🧪 Analyse My Soil':'🧪 Gwima Ithaka Yakwa',
    '🧮 Calculate Feed Formula':'🧮 Hesabu Irio cia Nyamũirũ',
    "📤 I'm Selling":"📤 Nĩ Ndĩũzĩtia","📥 I'm Buying":"📥 Nĩ Ndĩgũraga"
  },
  fr: {
    '+ Log Entry':'+ Ajouter une entrée','+ Add Animal':'+ Ajouter un animal',
    '+ Add Worker':'+ Ajouter un travailleur','+ Add Task':'+ Ajouter une tâche',
    '+ Add Item':'+ Ajouter un article','+ Add Parcel':'+ Ajouter une parcelle',
    '+ Add Expense':'+ Ajouter une dépense','+ Add Income':'+ Ajouter un revenu',
    '+ Add Ingredient':'+ Ajouter un ingrédient','+ Add Cost Item':'+ Ajouter un coût',
    '+ Add Vet Contact':'+ Ajouter un vétérinaire','+ Add Supplier':'+ Ajouter un fournisseur',
    '+ Log Breeding Event':'+ Enregistrer élevage','+ Log Labour Entry':'+ Enregistrer main-d\'œuvre',
    '+ Log Vet Visit':'+ Enregistrer visite vétérinaire','+ Log Weight Entry':'+ Enregistrer poids',
    '+ New Batch':'+ Nouveau lot','Add Farm Task':'Ajouter une tâche','Add Health Event':'Ajouter un événement santé',
    'Add Worker':'Ajouter un travailleur','Generate Report':'Générer un rapport',
    'Log Milk Production':'Enregistrer la production de lait','Log Egg Collection':'Enregistrer la collecte d\'œufs',
    'Log Water Usage':'Enregistrer l\'utilisation d\'eau','Log Labour Entry':'Enregistrer la main-d\'œuvre',
    'Log Vet Visit':'Enregistrer la visite vétérinaire','Log Weight':'Enregistrer le poids',
    'Summary':'Résumé','Batch Info':'Infos du lot','Farm Details':'Détails de la ferme',
    'Ingredients & Prices':'Ingrédients et prix','Feed Formula':'Formule alimentaire',
    'Cost Breakdown':'Répartition des coûts','Soil Test Results':'Résultats du test de sol',
    'Location & Context':'Lieu et contexte','Current Conditions':'Conditions actuelles',
    'Current Weather':'Météo actuelle','Loan Details':'Détails du prêt',
    'Farm Assets':'Actifs agricoles','Your Farm Profile':'Profil de votre ferme',
    'Farm Revenue Context':'Contexte des revenus','Coverage Preferences':'Préférences de couverture',
    'Flock Stats':'Statistiques du troupeau','Growth Summary':'Résumé de croissance',
    'AI Irrigation Advice':'Conseils d\'irrigation par IA',
    'Date':'Date','Notes':'Notes','Location':'Emplacement','Category':'Catégorie',
    'Currency':'Devise','Animal ID / Name':'ID / Nom de l\'animal',
    'Animal Type':'Type d\'animal','Animal ID / Batch':'ID / Lot d\'animal',
    'Morning Yield (L)':'Production du matin (L)','Evening Yield (L)':'Production du soir (L)',
    'Quality':'Qualité','Sale Price/L':'Prix de vente/L','Sale Price / Egg':'Prix/Œuf',
    'Sale Price / Unit':'Prix/Unité','Sale Price/Unit':'Prix/Unité',
    'Eggs Collected':'Œufs collectés','Broken/Rejected':'Cassés/Rejetés',
    'Flock / Pen ID':'ID du troupeau','Flock Size':'Taille du troupeau',
    'Feed Used (kg)':'Aliment utilisé (kg)','Weight (kg)':'Poids (kg)',
    'Age (days)':'Âge (jours)','Start Date':'Date de début','End Date':'Date de fin',
    'Stage':'Stade','Method':'Méthode','Duration (minutes)':'Durée (minutes)',
    'Water Used (litres)':'Eau utilisée (litres)','Irrigation':'Irrigation',
    'Soil Type':'Type de sol','pH Level':'Niveau de pH',
    'Nitrogen (N) ppm':'Azote (N) ppm','Phosphorus (P)':'Phosphore (P)',
    'Potassium (K)':'Potassium (K)','Calcium (Ca)':'Calcium (Ca)',
    'Magnesium (Mg)':'Magnésium (Mg)','Organic Matter %':'Matière organique %',
    'Previous Crop':'Culture précédente','Target Crops':'Cultures cibles',
    'Select Crops':'Sélectionner les cultures','Crop':'Culture','Crop Stage':'Stade de culture',
    'Crop / Area':'Culture / Zone','Crop Area (acres)':'Surface de culture (acres)',
    'Crop Expected Value':'Valeur attendue de la culture',
    'Season':'Saison','Altitude':'Altitude','Region / County':'Région / Département',
    'County / Region':'Département / Région','Country':'Pays','Country / Region':'Pays / Région',
    'Farm Size':'Superficie de la ferme','Farm Size (acres)':'Superficie (acres)',
    'Farm Type':'Type de ferme','Farmer Category':'Catégorie d\'agriculteur',
    'Farming Experience':'Expérience agricole','Goal':'Objectif','Urgency':'Urgence',
    'Describe symptoms':'Décrire les symptômes','Other Crops':'Autres cultures',
    'Main Concern':'Préoccupation principale','Active Crops / Animals':'Cultures/animaux actifs',
    'Loan Amount':'Montant du prêt','Loan Type':'Type de prêt',
    'Loan Purpose':'Objet du prêt','Annual Interest Rate (%)':'Taux d\'intérêt annuel (%)',
    'Term (months)':'Durée (mois)','Payment Frequency':'Fréquence de paiement',
    'Annual Farm Income':'Revenu agricole annuel',
    'Livestock Total Value':'Valeur totale du bétail',
    'Livestock Count':'Nombre de bétail','Equipment Value':'Valeur des équipements',
    'Coverage Type':'Type de couverture','Annual Budget for Premium':'Budget annuel pour la prime',
    'Main Product':'Produit principal',
    'Main Risks (hold Ctrl/Cmd for multiple)':'Risques principaux (Ctrl/Cmd pour plusieurs)',
    'Animals Count':'Nombre d\'animaux','Batches / Year':'Lots par an',
    'Units / Batch':'Unités par lot','Units Sold':'Unités vendues',
    'Mortality (units)':'Mortalité (unités)','By-product Revenue':'Revenus sous-produits',
    'Batch Name':'Nom du lot','Batch Size (kg)':'Taille du lot (kg)',
    'Revenue':'Revenus','Report Type':'Type de rapport','Period':'Période',
    'Month':'Mois','Sample Size':'Taille de l\'échantillon',
    'Count':'Nombre','Unit':'Unité','Cost / Unit':'Coût / Unité',
    'What are you looking for?':'Que cherchez-vous ?',
    'Farm Revenue Context':'Contexte des revenus de la ferme',
    '🌤️ Get Weather Farming Advice':'🌤️ Obtenir des conseils météo',
    '🏛️ Find My Subsidies & Grants':'🏛️ Trouver mes subventions',
    '💧 Get Irrigation Advice':'💧 Conseils d\'irrigation',
    '💳 Calculate Repayment Plan':'💳 Calculer le plan de remboursement',
    '📅 Generate My Planting Calendar':'📅 Générer mon calendrier de plantation',
    '📊 Analyse Profit & Loss':'📊 Analyser profits et pertes',
    '📊 Generate AI Farm Report':'📊 Générer un rapport IA',
    '📋 Copy Report':'📋 Copier le rapport',
    '📱 Share Calendar on WhatsApp':'📱 Partager sur WhatsApp',
    '📱 Share Monthly Report on WhatsApp':'📱 Partager le rapport sur WhatsApp',
    '📱 Share Result on WhatsApp':'📱 Partager les résultats sur WhatsApp',
    '📱 Share Summary':'📱 Partager le résumé','📱 Share on WhatsApp':'📱 Partager sur WhatsApp',
    '🔬 Diagnose Now':'🔬 Diagnostiquer maintenant','🗑 Clear':'🗑 Effacer',
    '🛡️ Calculate My Insurance Needs':'🛡️ Calculer mes besoins en assurance',
    '🧪 Analyse My Soil':'🧪 Analyser mon sol',
    '🧮 Calculate Feed Formula':'🧮 Calculer la formule alimentaire',
    "📤 I'm Selling":"📤 Je vends","📥 I'm Buying":"📥 J'achète"
  },
  am: {
    '+ Log Entry':'+ ምዝገባ ያክሉ','+ Add Animal':'+ እንስሳ ያክሉ','+ Add Worker':'+ ሰራተኛ ያክሉ',
    '+ Add Task':'+ ተግባር ያክሉ','+ Add Item':'+ ዕቃ ያክሉ','+ Add Parcel':'+ ቦታ ያክሉ',
    '+ Add Expense':'+ ወጪ ያክሉ','+ Add Income':'+ ገቢ ያክሉ','+ Add Ingredient':'+ ቁሳቁስ ያክሉ',
    '+ Add Cost Item':'+ ወጪ ያክሉ','+ Add Vet Contact':'+ የእንስሳ ሐኪም ያክሉ',
    '+ Add Supplier':'+ አቅራቢ ያክሉ','+ Log Breeding Event':'+ የርቢ ምዝገባ',
    '+ Log Labour Entry':'+ የሠራ ምዝገባ','+ Log Vet Visit':'+ የሐኪም ምዝገባ',
    '+ Log Weight Entry':'+ የክብደት ምዝገባ','+ New Batch':'+ አዲስ ቡድን',
    'Add Farm Task':'ተግባር ያክሉ','Add Health Event':'የጤና ሁኔታ ያክሉ',
    'Add Worker':'ሰራተኛ ያክሉ','Generate Report':'ሪፖርት ያዘጋጁ',
    'Log Milk Production':'የወተት ምዝገባ','Log Egg Collection':'የእንቁላል ምዝገባ',
    'Log Water Usage':'የውሃ ምዝገባ','Log Labour Entry':'የሠራ ምዝገባ',
    'Log Vet Visit':'የሐኪም ምዝገባ','Log Weight':'የክብደት ምዝገባ',
    'Summary':'ማጠቃለያ','Batch Info':'የቡድን መረጃ','Farm Details':'የእርሻ ዝርዝር',
    'Ingredients & Prices':'ቁሳቁስ እና ዋጋ','Feed Formula':'የምግብ ቀመር',
    'Cost Breakdown':'የወጪ ዝርዝር','Soil Test Results':'የአፈር ምርምር ውጤቶች',
    'Location & Context':'ቦታ እና አውድ','Current Conditions':'አሁናዊ ሁኔታ',
    'Current Weather':'አሁናዊ የአየር ሁኔታ','Loan Details':'የብድር ዝርዝር',
    'Farm Assets':'የእርሻ ንብረቶች','Your Farm Profile':'የእርሻ መገለጫ',
    'Farm Revenue Context':'የገቢ አውድ','Coverage Preferences':'የሽፋን ምርጫ',
    'Flock Stats':'የቡድን ስታቲስቲክስ','Growth Summary':'የዕድገት ማጠቃለያ',
    'AI Irrigation Advice':'AI የመስኖ ምክር',
    'Date':'ቀን','Notes':'ማስታወሻ','Location':'ቦታ','Category':'ምድብ',
    'Currency':'ምንዛሬ','Animal ID / Name':'የእንስሳ ቁጥር / ስም',
    'Animal Type':'የእንስሳ ዓይነት','Animal ID / Batch':'የእንስሳ ቁጥር / ቡድን',
    'Morning Yield (L)':'የጠዋት ወተት (L)','Evening Yield (L)':'የምሽት ወተት (L)',
    'Quality':'ጥራት','Sale Price/L':'የሽያጭ ዋጋ/L','Sale Price / Egg':'ዋጋ/እንቁላል',
    'Sale Price / Unit':'ዋጋ/ክፍል','Sale Price/Unit':'ዋጋ/ክፍል',
    'Eggs Collected':'የተሰበሰቡ እንቁላሎች','Broken/Rejected':'የተሰበሩ/የተቀቡ',
    'Flock / Pen ID':'የቡድን ቁጥር','Flock Size':'የቡድን ብዛት',
    'Feed Used (kg)':'ምግብ ጥቅም (kg)','Weight (kg)':'ክብደት (kg)',
    'Age (days)':'ዕድሜ (ቀናት)','Start Date':'የጀምር ቀን','End Date':'የማጠናቀቂያ ቀን',
    'Stage':'ደረጃ','Method':'ዘዴ','Duration (minutes)':'ጊዜ (ደቂቃ)',
    'Water Used (litres)':'ውሃ ጥቅም (ሊትር)','Irrigation':'መስኖ',
    'Soil Type':'የአፈር ዓይነት','pH Level':'pH ደረጃ',
    'Nitrogen (N) ppm':'ናይትሮጅን (N) ppm','Phosphorus (P)':'ፎስፎረስ (P)',
    'Potassium (K)':'ፖታሲየም (K)','Calcium (Ca)':'ካልሲየም (Ca)',
    'Magnesium (Mg)':'ማግኒዚየም (Mg)','Organic Matter %':'ኦርጋኒክ ቁስ %',
    'Previous Crop':'ቀዳሚ ሰብል','Target Crops':'ዒላማ ሰብሎች',
    'Select Crops':'ሰብሎችን ይምረጡ','Crop':'ሰብል','Crop Stage':'የሰብል ደረጃ',
    'Crop / Area':'ሰብል / ቦታ','Crop Area (acres)':'የሰብል ቦታ (ሄክታር)',
    'Crop Expected Value':'የሰብል ተጠቃሚ ዋጋ',
    'Season':'ወቅት','Altitude':'ከፍታ','Region / County':'ክልል / ወረዳ',
    'County / Region':'ወረዳ / ክልል','Country':'አገር','Country / Region':'አገር / ክልል',
    'Farm Size':'የእርሻ ስፋት','Farm Size (acres)':'የእርሻ ስፋት (ሄክታር)',
    'Farm Type':'የእርሻ ዓይነት','Farmer Category':'የገበሬ ምድብ',
    'Farming Experience':'የእርሻ ልምድ','Goal':'ዓላማ','Urgency':'አስቸኳይነት',
    'Describe symptoms':'ምልክቶቹን ይግለጹ','Other Crops':'ሌሎች ሰብሎች',
    'Main Concern':'ዋና ስጋት','Active Crops / Animals':'ንቁ ሰብሎች / እንስሳት',
    'Loan Amount':'የብድር መጠን','Loan Type':'የብድር ዓይነት',
    'Loan Purpose':'የብድር ዓላማ','Annual Interest Rate (%)':'ዓመታዊ ወለድ (%)',
    'Term (months)':'ጊዜ (ወራት)','Payment Frequency':'የክፍያ ድግግሞሽ',
    'Annual Farm Income':'ዓመታዊ የእርሻ ገቢ',
    'Livestock Total Value':'ጠቅላላ የእንስሳት ዋጋ',
    'Livestock Count':'የእንስሳት ቁጥር','Equipment Value':'የቁሳቁስ ዋጋ',
    'Coverage Type':'የሽፋን ዓይነት','Annual Budget for Premium':'ዓመታዊ ፕሪሚየም በጀት',
    'Main Product':'ዋና ምርት',
    'Main Risks (hold Ctrl/Cmd for multiple)':'ዋና አደጋዎች (Ctrl/Cmd ለብዙ)',
    'Animals Count':'የእንስሳት ቁጥር','Batches / Year':'ቡድኖች / ዓመት',
    'Units / Batch':'ክፍሎች / ቡድን','Units Sold':'የተሸጡ ክፍሎች',
    'Mortality (units)':'ሞት (ክፍሎች)','By-product Revenue':'ከተዋጽኦ ምርቶች ገቢ',
    'Batch Name':'የቡድን ስም','Batch Size (kg)':'የቡድን ብዛት (kg)',
    'Revenue':'ገቢ','Report Type':'የሪፖርት ዓይነት','Period':'ጊዜ',
    'Month':'ወር','Sample Size':'የናሙና ብዛት',
    'Count':'ቁጥር','Unit':'ክፍል','Cost / Unit':'ወጪ / ክፍል',
    'What are you looking for?':'ምን እየፈለጉ ነው?',
    'Farm Revenue Context':'የእርሻ ገቢ አውድ',
    '🌤️ Get Weather Farming Advice':'🌤️ የአየር ሁኔታ ምክር ያግኙ',
    '🏛️ Find My Subsidies & Grants':'🏛️ ድጎማዎቼን ፈልጉ',
    '💧 Get Irrigation Advice':'💧 የመስኖ ምክር ያግኙ',
    '💳 Calculate Repayment Plan':'💳 የሚከፈልበት ዕቅድ አስሉ',
    '📅 Generate My Planting Calendar':'📅 የዘር ቀን ዝርዝር ያዘጋጁ',
    '📊 Analyse Profit & Loss':'📊 ትርፍ እና ኪሳራ ተንትኑ',
    '📊 Generate AI Farm Report':'📊 AI ሪፖርት ያዘጋጁ',
    '📋 Copy Report':'📋 ሪፖርት ቅዱ',
    '📱 Share Calendar on WhatsApp':'📱 በWhatsApp ያጋሩ',
    '📱 Share Monthly Report on WhatsApp':'📱 ሪፖርቱን በWhatsApp ያጋሩ',
    '📱 Share Result on WhatsApp':'📱 ውጤቱን በWhatsApp ያጋሩ',
    '📱 Share Summary':'📱 ማጠቃለያ ያጋሩ','📱 Share on WhatsApp':'📱 በWhatsApp ያጋሩ',
    '🔬 Diagnose Now':'🔬 አሁን ምርምር ያድርጉ','🗑 Clear':'🗑 ያጽዱ',
    '🛡️ Calculate My Insurance Needs':'🛡️ የኢንሹራንስ ፍላጎቴን አስሉ',
    '🧪 Analyse My Soil':'🧪 አፈሬን ይተንትኑ',
    '🧮 Calculate Feed Formula':'🧮 የምግብ ቀመር አስሉ',
    "📤 I'm Selling":"📤 እሸጣለሁ","📥 I'm Buying":"📥 እገዛለሁ"
  },
  lg: {
    '+ Log Entry':'+ Yingiza Ekyokulemba','+ Add Animal':'+ Gattamu Ensolo',
    '+ Add Worker':'+ Gattamu Omukozi','+ Add Task':'+ Gattamu Omulimu',
    '+ Add Item':'+ Gattamu Ekintu','+ Add Parcel':'+ Gattamu Ettaka',
    '+ Add Expense':'+ Gattamu Ennyiga','+ Add Income':'+ Gattamu Ensimbi',
    '+ Add Ingredient':'+ Gattamu Ekintu ky\'Emmere','+ Add Cost Item':'+ Gattamu Ennyiga',
    '+ Add Vet Contact':'+ Gattamu Omusawo w\'Ebisolo',
    '+ Add Supplier':'+ Gattamu Omuwaayo','+ Log Breeding Event':'+ Yingiza Okuzaala',
    '+ Log Labour Entry':'+ Yingiza Omulimu','+ Log Vet Visit':'+ Yingiza Omusawo',
    '+ Log Weight Entry':'+ Yingiza Obuzito','+ New Batch':'+ Ekibiina Ekipya',
    'Add Farm Task':'Gattamu Omulimu w\'Ennimiro','Add Health Event':'Gattamu Obutuufu bw\'Obulamu',
    'Add Worker':'Gattamu Omukozi','Generate Report':'Kola Lipoota',
    'Log Milk Production':'Yingiza Ebyerekeye Amata','Log Egg Collection':'Yingiza Ebyerekeye Amagi',
    'Log Water Usage':'Yingiza Ebyerekeye Amazzi','Log Labour Entry':'Yingiza Omulimu gw\'Abakozi',
    'Log Vet Visit':'Yingiza Okukyala Omusawo','Log Weight':'Yingiza Obuzito',
    'Summary':'Akatabo k\'Ennyiga','Batch Info':'Amakulu g\'Ekibiina','Farm Details':'Amakulu g\'Ennimiro',
    'Ingredients & Prices':'Ebintu n\'Ebbeeyi','Feed Formula':'Fomula y\'Emmere y\'Ebisolo',
    'Cost Breakdown':'Okugabanya Ennyiga','Soil Test Results':'Ebikolwa by\'Okukebera Ettaka',
    'Location & Context':'Ahabwa n\'Eby\'okukwata','Current Conditions':'Obutuufu bw\'Ennaku Zino',
    'Current Weather':'Obudde bw\'Ennaku Zino','Loan Details':'Amakulu g\'Eddeni',
    'Farm Assets':'Ebintu by\'Ennimiro','Your Farm Profile':'Ebyogerwa by\'Ennimiro Yo',
    'Farm Revenue Context':'Eby\'okukwata ku Nsimbi z\'Ennimiro',
    'Coverage Preferences':'Okulonda Enkola y\'Okukwata',
    'Flock Stats':'Amakulu g\'Ekibiina ky\'Ebisolo','Growth Summary':'Akatabo k\'Okukulaakulana',
    'AI Irrigation Advice':'AI Obubonero bw\'Okuwuukuusa',
    'Date':'Ennaku','Notes':'Amawaandiiko','Location':'Ahabwa','Category':'Ekika',
    'Currency':'Ensimbi y\'Ensi','Animal ID / Name':'Namba / Erinnya ly\'Ensolo',
    'Animal Type':'Ekika ky\'Ensolo','Animal ID / Batch':'Namba / Ekibiina',
    'Morning Yield (L)':'Amata g\'Enkya (L)','Evening Yield (L)':'Amata g\'Omukaaga (L)',
    'Quality':'Omutindo','Sale Price/L':'Ebbeeyi y\'Okuguza/L','Sale Price / Egg':'Ebbeeyi/Egi',
    'Sale Price / Unit':'Ebbeeyi/Ekintu','Sale Price/Unit':'Ebbeeyi/Ekintu',
    'Eggs Collected':'Amagi Agakuŋŋaanyiziddwa','Broken/Rejected':'Ebyamenneka/Ebyakakataazibwa',
    'Flock / Pen ID':'Namba y\'Ekibiina ky\'Ebisolo','Flock Size':'Obunene bw\'Ekibiina',
    'Feed Used (kg)':'Emmere Ekozeseddwa (kg)','Weight (kg)':'Obuzito (kg)',
    'Age (days)':'Emyaka mu Ennaku','Start Date':'Ennaku y\'Okutandika',
    'End Date':'Ennaku y\'Okuggwaako','Stage':'Ennyiriri','Method':'Enkola',
    'Duration (minutes)':'Ekiseera (edakiika)','Water Used (litres)':'Amazzi Agakozeseddwa (lita)',
    'Irrigation':'Okuwuukuusa Ennimiro','Soil Type':'Ekika ky\'Ettaka','pH Level':'Ekitiinitiini kya pH',
    'Nitrogen (N) ppm':'Nayitrojeni (N) ppm','Phosphorus (P)':'Fosiforasi (P)',
    'Potassium (K)':'Potasiamu (K)','Calcium (Ca)':'Kalisiamu (Ca)',
    'Magnesium (Mg)':'Maganiziamu (Mg)','Organic Matter %':'Ebintu Ebyakulaakulana %',
    'Previous Crop':'Embuto Eyayita','Target Crops':'Embuto Ezilengeddwa',
    'Select Crops':'Londa Embuto','Crop':'Embuto','Crop Stage':'Ennyiriri y\'Embuto',
    'Crop / Area':'Embuto / Obugulumivu','Crop Area (acres)':'Obugulumivu bw\'Embuto (ekali)',
    'Crop Expected Value':'Ebbeeyi Etegerwako y\'Embuto',
    'Season':'Ekiseera ky\'Obudde','Altitude':'Obuwanvu',
    'Region / County':'Saza / Akaawuka','County / Region':'Saza','Country':'Nsi',
    'Country / Region':'Nsi / Saza','Farm Size':'Obunene bw\'Ennimiro',
    'Farm Size (acres)':'Obunene bw\'Ennimiro (ekali)','Farm Type':'Ekika ky\'Ennimiro',
    'Farmer Category':'Ekika ky\'Omulimi','Farming Experience':'Olukiikiriza mu Kulima',
    'Goal':'Ekigendererwa','Urgency':'Amangu g\'Ekintu',
    'Describe symptoms':'Tegeeza Obubonero bw\'Obulwadde','Other Crops':'Embuto Endala',
    'Main Concern':'Ekyokwekuuma Ekinene','Active Crops / Animals':'Embuto/Ebisolo Ebikolwa',
    'Loan Amount':'Omuwendo gw\'Eddeni','Loan Type':'Ekika ky\'Eddeni',
    'Loan Purpose':'Ekigendererwa ky\'Eddeni',
    'Annual Interest Rate (%)':'Omuwendo gw\'Ennume mu Mwaka (%)',
    'Term (months)':'Ekiseera (emezi)','Payment Frequency':'Emirundi gy\'Okwefuula',
    'Annual Farm Income':'Ensimbi z\'Ennimiro mu Mwaka',
    'Livestock Total Value':'Omuwendo Gwona gw\'Ebisolo',
    'Livestock Count':'Omuwendo gw\'Ebisolo','Equipment Value':'Omuwendo gw\'Ebikozesebwa',
    'Coverage Type':'Ekika ky\'Okukwata','Annual Budget for Premium':'Bajeti y\'Omwaka wa Inshuwalansi',
    'Main Product':'Ekintu Ekinene Ekyaguuzibwa',
    'Main Risks (hold Ctrl/Cmd for multiple)':'Engeri z\'Obubi (Ctrl/Cmd eza nyingi)',
    'Animals Count':'Omuwendo gw\'Ebisolo','Batches / Year':'Ebibiina / Mwaka',
    'Units / Batch':'Ebintu / Ekibiina','Units Sold':'Ebintu Ebyatundibwa',
    'Mortality (units)':'Okufa (ebintu)','By-product Revenue':'Ensimbi z\'Ebintu Ebirala',
    'Batch Name':'Erinnya ly\'Ekibiina','Batch Size (kg)':'Obunene bw\'Ekibiina (kg)',
    'Revenue':'Ensimbi','Report Type':'Ekika ky\'Lipoota','Period':'Ekiseera',
    'Month':'Omwezi','Sample Size':'Obunene bw\'Okugeraageranya',
    'Count':'Omuwendo','Unit':'Ekintu','Cost / Unit':'Ennyiga / Ekintu',
    'What are you looking for?':'Oli kunoonya ki?',
    '🌤️ Get Weather Farming Advice':'🌤️ Nzija Obubonero bw\'Obudde',
    '🏛️ Find My Subsidies & Grants':'🏛️ Noonya Obuyambi',
    '💧 Get Irrigation Advice':'💧 Obubonero bw\'Okuwuukuusa',
    '💳 Calculate Repayment Plan':'💳 Bala Entegeka y\'Okuddiza',
    '📅 Generate My Planting Calendar':'📅 Kola Kalandala y\'Okusiga',
    '📊 Analyse Profit & Loss':'📊 Kebera Ennuma n\'Eggwanga',
    '📊 Generate AI Farm Report':'📊 Kola AI Lipoota',
    '📋 Copy Report':'📋 Koppa Lipoota',
    '📱 Share Calendar on WhatsApp':'📱 Gaba ku WhatsApp',
    '📱 Share Monthly Report on WhatsApp':'📱 Gaba Lipoota ku WhatsApp',
    '📱 Share Result on WhatsApp':'📱 Gaba Ebikolwa ku WhatsApp',
    '📱 Share Summary':'📱 Gaba Akatabo','📱 Share on WhatsApp':'📱 Gaba ku WhatsApp',
    '🔬 Diagnose Now':'🔬 Kebera Obulwadde Kaakano','🗑 Clear':'🗑 Sazaamu',
    '🛡️ Calculate My Insurance Needs':'🛡️ Bala Inshuwalansi Yange',
    '🧪 Analyse My Soil':'🧪 Linnya Ttaka Lyange',
    '🧮 Calculate Feed Formula':'🧮 Bala Emmere y\'Ebisolo',
    "📤 I'm Selling":"📤 Ndi Mutunzi","📥 I'm Buying":"📥 Ndi Mugula"
  }
};

function translatePage() {
  try {
    var dict = currentLang !== 'en' ? (PAGE_TRANSLATIONS[currentLang] || {}) : {};
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      var val = dict[key] !== undefined ? dict[key] : key;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.textContent = val;
      }
    });
  } catch(e) { console.log('translatePage error:', e); }
}

function setLang(code) {
  try {
    currentLang = code;
    localStorage.setItem('al_lang', code);
    buildTopbar();
    buildSidebar(window.AL_PAGE || 'dashboard');
    translatePage();
    var banner = document.getElementById('offlineBanner');
    if (banner) banner.textContent = T('offline');
    // Rebuild any JS-generated page content that uses lang
    // Fire event so page-specific renderers can respond
    document.dispatchEvent(new Event('al:langchange'));
    if (typeof renderList === 'function') renderList();
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
    translatePage();
    setupPWA();
    document.querySelectorAll('input[type="date"]').forEach(function(el){if(!el.value)el.value=today();});
  } catch(e) { console.log('initShared error:',e); }
}

function shareWhatsApp(text) { window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank'); }
