import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════
//  AGRILOGIC — COMPLETE FARM PLATFORM  v5.0
//  Professional React Rebuild — All 26 Modules + AI
// ═══════════════════════════════════════════════════════

const COLORS = {
  deep: "#0e1a12", surface: "#162019", surface2: "#1c2a20",
  green: "#52b788", greenMid: "#2d6a4f", greenDeep: "#1a3a2a",
  gold: "#d4a017", goldLight: "#f0c940",
  cream: "#f5f0e8", muted: "#4a7060", border: "rgba(82,183,136,0.1)",
  danger: "#c0392b", warn: "#e67e22", blue: "#2e86ab",
};

// ── Storage helpers ──────────────────────────────────────
const DS = (k) => { try { return JSON.parse(localStorage.getItem("al_" + k) || "[]"); } catch { return []; } };
const save = (k, d) => { try { localStorage.setItem("al_" + k, JSON.stringify(d)); } catch {} };
const getProfile = () => { try { return JSON.parse(localStorage.getItem("al_farm") || "{}"); } catch { return {}; } };
const saveProfile = (p) => { try { localStorage.setItem("al_farm", JSON.stringify(p)); } catch {} };
const today = () => new Date().toISOString().split("T")[0];
const thisMonth = () => today().slice(0, 7);
const fmt = (n) => n != null ? Number(n).toLocaleString(undefined, { maximumFractionDigits: 1 }) : "—";
const fmtI = (n) => n != null ? Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—";
const escHtml = (t) => String(t || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ── AI helper ────────────────────────────────────────────
async function callAI(messages, system = "") {
  try {
    const body = { model: "claude-sonnet-4-20250514", max_tokens: 1000, messages };
    if (system) body.system = system;
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    return d.content ? d.content.map(c => c.text || "").join("") : "";
  } catch { return ""; }
}

// ── Language system ──────────────────────────────────────
const LANGS = [
  { c: "en", l: "EN", name: "English" },
  { c: "sw", l: "SW", name: "Swahili" },
  { c: "fr", l: "FR", name: "French" },
  { c: "am", l: "AM", name: "Amharic" },
  { c: "ki", l: "GI", name: "Gikuyu" },
  { c: "lg", l: "LG", name: "Luganda" },
];

const T_MAP = {
  en: { dash:"Dashboard", advisor:"Farm Advisor", analytics:"Analytics", diagnosis:"Disease Diagnosis", soil:"Soil Analyser", calendar:"Planting Calendar", weather:"Weather Advisor", animals:"Animal Registry", milk:"Milk Tracker", eggs:"Egg Tracker", breeding:"Breeding Tracker", weight:"Weight Tracker", feed:"Feed Calculator", profit:"Profit Tracker", books:"Farm Bookkeeping", loan:"Loan Calculator", insurance:"Insurance Calc", subsidy:"Subsidy Finder", reports:"Farm Reports", inventory:"Inventory", tasks:"Task Manager", labour:"Labour Tracker", land:"Land Manager", water:"Water Tracker", market:"Marketplace", vets:"Vet Directory", suppliers:"Suppliers", main:"Main", operations:"Operations", finance:"Finance & Support", livestock:"Livestock & Production", diagPlanning:"Diagnosis & Planning", connect:"Connect", myFarm:"My Farm", editFarm:"Edit Farm Info", noFarm:"No farm info yet", morning:"Good morning", afternoon:"Good afternoon", evening:"Good evening", farmer:"Farmer", animals_n:"Animals", inv_n:"Inventory Items", tasks_n:"Tasks Pending", month_n:"This Month", registered:"Registered", instock:"In stock", duesoon:"Due soon", farmincome:"Farm income" },
  sw: { dash:"Dashibodi", advisor:"Mshauri wa Shamba", analytics:"Takwimu", diagnosis:"Uchunguzi wa Magonjwa", soil:"Kipimo cha Udongo", calendar:"Kalenda ya Kupanda", weather:"Mshauri wa Hali ya Hewa", animals:"Rejista ya Wanyama", milk:"Kufuatilia Maziwa", eggs:"Kufuatilia Mayai", breeding:"Kufuatilia Uzazi", weight:"Kufuatilia Uzito", feed:"Hesabu ya Chakula", profit:"Kufuatilia Faida", books:"Uhasibu wa Shamba", loan:"Hesabu ya Mkopo", insurance:"Hesabu ya Bima", subsidy:"Tafuta Ruzuku", reports:"Ripoti za Shamba", inventory:"Hesabu ya Bidhaa", tasks:"Meneja wa Kazi", labour:"Kufuatilia Wafanyakazi", land:"Meneja wa Ardhi", water:"Kufuatilia Maji", market:"Soko", vets:"Orodha ya Madaktari", suppliers:"Wasambazaji", main:"Kuu", operations:"Uendeshaji", finance:"Fedha & Msaada", livestock:"Mifugo & Uzalishaji", diagPlanning:"Uchunguzi & Mipango", connect:"Unganisha", myFarm:"Shamba Langu", editFarm:"Hariri Taarifa", noFarm:"Hakuna taarifa bado", morning:"Habari za asubuhi", afternoon:"Habari za mchana", evening:"Habari za jioni", farmer:"Mkulima", animals_n:"Wanyama", inv_n:"Bidhaa", tasks_n:"Kazi Zinazongoja", month_n:"Mwezi Huu", registered:"Wamesajiliwa", instock:"Kwa hisa", duesoon:"Zinakaribia", farmincome:"Mapato ya shamba" },
  fr: { dash:"Tableau de bord", advisor:"Conseiller agricole", analytics:"Analytique", diagnosis:"Diagnostic des maladies", soil:"Analyseur de sol", calendar:"Calendrier de plantation", weather:"Conseiller météo", animals:"Registre des animaux", milk:"Suivi du lait", eggs:"Suivi des œufs", breeding:"Suivi de l'élevage", weight:"Suivi du poids", feed:"Calculateur d'alimentation", profit:"Suivi des bénéfices", books:"Comptabilité agricole", loan:"Calculateur de prêt", insurance:"Calcul d'assurance", subsidy:"Recherche de subventions", reports:"Rapports agricoles", inventory:"Inventaire", tasks:"Gestionnaire de tâches", labour:"Suivi du travail", land:"Gestionnaire des terres", water:"Suivi de l'eau", market:"Marché", vets:"Annuaire vétérinaire", suppliers:"Fournisseurs", main:"Principal", operations:"Opérations", finance:"Finance & Support", livestock:"Élevage & Production", diagPlanning:"Diagnostic & Planification", connect:"Connexion", myFarm:"Ma Ferme", editFarm:"Modifier les infos", noFarm:"Aucune info de ferme", morning:"Bonjour", afternoon:"Bon après-midi", evening:"Bonsoir", farmer:"Agriculteur", animals_n:"Animaux", inv_n:"Articles d'inventaire", tasks_n:"Tâches en attente", month_n:"Ce mois", registered:"Enregistrés", instock:"En stock", duesoon:"Dues bientôt", farmincome:"Revenus de la ferme" },
  am: { dash:"ዳሽቦርድ", advisor:"የእርሻ አማካሪ", analytics:"ትንታኔ", diagnosis:"የበሽታ ምርመራ", soil:"የአፈር ትንታኔ", calendar:"የመዝሪያ ቀን", weather:"የአየር ሁኔታ አማካሪ", animals:"የእንስሳት ምዝገባ", milk:"የወተት ክትትል", eggs:"የእንቁላል ክትትል", breeding:"የርቢ ክትትል", weight:"የክብደት ክትትል", feed:"የምግብ ስሌት", profit:"የትርፍ ክትትል", books:"የእርሻ ሂሳብ", loan:"የብድር ስሌት", insurance:"የኢንሹራንስ ስሌት", subsidy:"ድጎማ ፈላጊ", reports:"የእርሻ ሪፖርቶች", inventory:"ክምችት", tasks:"የተግባር አስተዳዳሪ", labour:"የሰራተኛ ክትትል", land:"የመሬት አስተዳዳሪ", water:"የውሃ ክትትል", market:"ገበያ", vets:"የ獣醫 ማውጫ", suppliers:"አቅራቢዎች", main:"ዋና", operations:"ስራ አስኪያጅ", finance:"ፋይናንስ እና ድጋፍ", livestock:"ከብቶች እና ምርት", diagPlanning:"ምርመራ እና እቅድ", connect:"ተገናኝ", myFarm:"የኔ እርሻ", editFarm:"አርትዕ", noFarm:"መረጃ የለም", morning:"እንደምን አደሩ", afternoon:"እንደምን ዋሉ", evening:"እንደምን ዋሉ", farmer:"ገበሬ", animals_n:"እንስሳት", inv_n:"ዕቃዎች", tasks_n:"ተግባሮች", month_n:"ይህ ወር", registered:"ተመዝግቧል", instock:"በክምችት", duesoon:"ይደርሳሉ", farmincome:"የእርሻ ገቢ" },
  ki: { dash:"Ũrĩa wa Ndeto", advisor:"Mũthuri wa Mũgũnda", analytics:"Gwima Ndeto", diagnosis:"Kũhinga Mirimu", soil:"Gwima Ithaka", calendar:"Ndiaro ya Gũtema", weather:"Mũthuri wa Riera", animals:"Ndũika ya Nyamũirũ", milk:"Gwima Iria", eggs:"Gwima Maai ma Ngũkũ", breeding:"Gwima Ũhiũ", weight:"Gwima Nduini", feed:"Kũhesabu Irio", profit:"Gwima Unjuri", books:"Ũandĩki wa Mũgũnda", loan:"Kũhesabu Deni", insurance:"Kũhesabu Bima", subsidy:"Gũtũmbũra Ũteithio", reports:"Maarifa ma Mũgũnda", inventory:"Gwima Indo", tasks:"Mũratairu wa Miitire", labour:"Gwima Arĩmi", land:"Mũratairu wa Ithaka", water:"Gwima Maĩ", market:"Mũhuro", vets:"Ndũika ya Adaktari", suppliers:"Arĩndĩri a Indo", main:"Ndiini", operations:"Miitire", finance:"Mbeca na Ũteithio", livestock:"Thiome na Irio", diagPlanning:"Kũhinga na Gũthura", connect:"Hũthana", myFarm:"Mũgũnda Wakwa", editFarm:"Hindura Ũhoro", noFarm:"Ndĩrĩ ũhoro", morning:"Wĩmwega wa rũciĩnĩ", afternoon:"Wĩmwega wa mũthenya", evening:"Wĩmwega wa hwainĩ", farmer:"Mũrĩmi", animals_n:"Nyamũirũ", inv_n:"Indo", tasks_n:"Miitire", month_n:"Mweri Ũyũ", registered:"Andikĩtwo", instock:"Na hifadhi", duesoon:"Ĩhĩtĩkĩte", farmincome:"Unjuri wa mũgũnda" },
  lg: { dash:"Dashibodi", advisor:"Omubonero w'Ennimiro", analytics:"Enteekateeka", diagnosis:"Obugumivu bw'Obulwadde", soil:"Okusoma Ttaka", calendar:"Kalandala ey'Okusiga", weather:"Omubonero w'Obudde", animals:"Ebitabo by'Ebisolo", milk:"Okugoberera Amata", eggs:"Okugoberera Amagi", breeding:"Okugoberera Okuzaala", weight:"Okugoberera Obuzito", feed:"Kubala Emmere", profit:"Okugoberera Ennuma", books:"Ebitabo by'Ennimiro", loan:"Kubala Eddeni", insurance:"Kubala Inshuwalansi", subsidy:"Noonya Obuyambi", reports:"Lipoota z'Ennimiro", inventory:"Ebintu ebibaamu", tasks:"Omulabirizi w'Emirimu", labour:"Okugoberera Abakozi", land:"Omulabirizi w'Ettaka", water:"Okugoberera Amazzi", market:"Katale", vets:"Ebitabo by'Abadwaliro", suppliers:"Abawaayo", main:"Omutwe", operations:"Omulimu", finance:"Ensimbi n'Obuyambi", livestock:"Ebisolo n'Ebikolwa", diagPlanning:"Obugumivu n'Entegeka", connect:"Kwegattaanya", myFarm:"Ennimiro Yange", editFarm:"Kyusa Makulu", noFarm:"Tewali makulu", morning:"Wasuze otya", afternoon:"Osiibye otya", evening:"Okaaba otya", farmer:"Omulimi", animals_n:"Ebisolo", inv_n:"Ebintu", tasks_n:"Emirimu", month_n:"Omwezi Guno", registered:"Wandiikiddwa", instock:"Mu kibbo", duesoon:"Kutuuka", farmincome:"Ensimbi z'ennimiro" },
};

const T = (key, lang) => (T_MAP[lang] || T_MAP.en)[key] || (T_MAP.en)[key] || key;

// ── Nav pages ─────────────────────────────────────────────
const NAV = [
  { id:"dash",     icon:"🏠", section:"main" },
  { id:"advisor",  icon:"🤖", section:"main", badge:"AI" },
  { id:"analytics",icon:"📊", section:"main" },
  { id:"diagnosis",icon:"🔬", section:"diagPlanning" },
  { id:"soil",     icon:"🧪", section:"diagPlanning" },
  { id:"calendar", icon:"📅", section:"diagPlanning" },
  { id:"weather",  icon:"🌤️", section:"diagPlanning" },
  { id:"animals",  icon:"🐄", section:"livestock" },
  { id:"milk",     icon:"🥛", section:"livestock" },
  { id:"eggs",     icon:"🥚", section:"livestock" },
  { id:"breeding", icon:"🐣", section:"livestock" },
  { id:"weight",   icon:"⚖️", section:"livestock" },
  { id:"feed",     icon:"🌾", section:"finance" },
  { id:"profit",   icon:"💰", section:"finance" },
  { id:"books",    icon:"📒", section:"finance" },
  { id:"loan",     icon:"💳", section:"finance" },
  { id:"insurance",icon:"🛡️", section:"finance" },
  { id:"subsidy",  icon:"🏛️", section:"finance" },
  { id:"reports",  icon:"📈", section:"finance" },
  { id:"inventory",icon:"📦", section:"operations" },
  { id:"tasks",    icon:"📋", section:"operations" },
  { id:"labour",   icon:"👷", section:"operations" },
  { id:"land",     icon:"🗺️", section:"operations" },
  { id:"water",    icon:"💧", section:"operations" },
  { id:"market",   icon:"🏪", section:"connect" },
  { id:"vets",     icon:"🏥", section:"connect" },
  { id:"suppliers",icon:"🏬", section:"connect" },
];

const SECTIONS = ["main","diagPlanning","livestock","finance","operations","connect"];

// ─────────────────────────────────────────────────────────
//  SHARED UI COMPONENTS
// ─────────────────────────────────────────────────────────

const Spinner = () => (
  <div style={{ display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column",padding:"48px 20px", gap:14 }}>
    <div style={{ width:40,height:40,border:"3px solid rgba(82,183,136,0.15)",borderTopColor:"#52b788",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
    <div style={{ color:"#52b788",fontSize:13,fontWeight:600 }}>Thinking…</div>
  </div>
);

const PageHeader = ({ icon, badge, title, em, desc, badgeColor }) => (
  <div style={{ marginBottom:22 }}>
    <div style={{ display:"inline-flex",alignItems:"center",gap:5,borderRadius:16,padding:"4px 11px",fontSize:10,fontWeight:600,letterSpacing:0.4,textTransform:"uppercase",marginBottom:12,border:"1px solid",borderColor:badgeColor||"rgba(82,183,136,0.25)",background:badgeColor?"rgba(82,183,136,0.06)":"rgba(82,183,136,0.06)",color:badgeColor||"#52b788" }}>
      {icon} {badge}
    </div>
    <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(20px,3vw,28px)",fontWeight:900,lineHeight:1.1,marginBottom:5,color:"#f5f0e8" }}>
      {title}{em && <em style={{ fontStyle:"normal",color:"#52b788" }}> {em}</em>}
    </h2>
    {desc && <p style={{ fontSize:13,color:"#4a7060",lineHeight:1.6,maxWidth:560 }}>{desc}</p>}
  </div>
);

const Card = ({ title, icon, children, style }) => (
  <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(82,183,136,0.1)",borderRadius:16,overflow:"hidden",marginBottom:14,...style }}>
    {title && <div style={{ padding:"13px 18px",borderBottom:"1px solid rgba(82,183,136,0.1)",display:"flex",alignItems:"center",gap:9 }}>
      {icon && <span style={{ fontSize:16 }}>{icon}</span>}
      <h3 style={{ fontSize:13,fontWeight:600,color:"#f5f0e8" }}>{title}</h3>
    </div>}
    <div style={{ padding:18 }}>{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ display:"flex",flexDirection:"column",gap:5,marginBottom:12 }}>
    <div style={{ fontSize:10,fontWeight:600,color:"#4a7060",textTransform:"uppercase",letterSpacing:0.4 }}>{label}</div>
    {children}
  </div>
);

const inputStyle = { background:"rgba(255,255,255,0.05)",border:"1px solid rgba(82,183,136,0.13)",borderRadius:9,padding:"10px 13px",color:"#f5f0e8",fontFamily:"'DM Sans',sans-serif",fontSize:13,width:"100%",outline:"none",transition:"border-color 0.2s" };
const Inp = (props) => <input style={inputStyle} {...props} onFocus={e=>e.target.style.borderColor="#52b788"} onBlur={e=>e.target.style.borderColor="rgba(82,183,136,0.13)"} />;
const Sel = ({ children, ...props }) => (
  <div style={{ position:"relative" }}>
    <select style={{ ...inputStyle,paddingRight:30,appearance:"none",cursor:"pointer" }} {...props}
      onFocus={e=>e.target.style.borderColor="#52b788"} onBlur={e=>e.target.style.borderColor="rgba(82,183,136,0.13)"}>
      {children}
    </select>
    <span style={{ position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",color:"#4a7060",pointerEvents:"none",fontSize:12 }}>▾</span>
  </div>
);
const Textarea = (props) => <textarea rows={3} style={{ ...inputStyle,resize:"vertical" }} {...props} onFocus={e=>e.target.style.borderColor="#52b788"} onBlur={e=>e.target.style.borderColor="rgba(82,183,136,0.13)"} />;

const Btn = ({ variant="green", size="md", full, children, style, ...props }) => {
  const variants = {
    green: { background:"linear-gradient(135deg,#2d6a4f,#52b788)",color:"white" },
    gold: { background:"linear-gradient(135deg,#d4a017,#f0c940)",color:"#1a3a2a" },
    ghost: { background:"rgba(255,255,255,0.04)",border:"1px solid rgba(82,183,136,0.1)",color:"#4a7060" },
    danger: { background:"rgba(192,57,43,0.1)",border:"1px solid rgba(192,57,43,0.2)",color:"#e74c3c" },
    blue: { background:"linear-gradient(135deg,#1a5f7a,#2e86ab)",color:"white" },
  };
  return (
    <button style={{ padding:size==="sm"?"6px 12px":"10px 18px",border:"none",borderRadius:size==="sm"?7:10,fontFamily:"'DM Sans',sans-serif",fontSize:size==="sm"?11:13,fontWeight:600,cursor:"pointer",transition:"all 0.22s",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,width:full?"100%":"auto",...variants[variant],...style }} {...props}>
      {children}
    </button>
  );
};

const Alert = ({ type="warn", children }) => {
  const styles = {
    warn: { background:"rgba(230,126,34,0.08)",border:"1px solid rgba(230,126,34,0.2)",color:"#e67e22" },
    danger: { background:"rgba(192,57,43,0.08)",border:"1px solid rgba(192,57,43,0.2)",color:"#e74c3c" },
    success: { background:"rgba(82,183,136,0.08)",border:"1px solid rgba(82,183,136,0.2)",color:"#52b788" },
    info: { background:"rgba(46,134,171,0.08)",border:"1px solid rgba(46,134,171,0.2)",color:"#54c6eb" },
  };
  return <div style={{ borderRadius:10,padding:"10px 14px",fontSize:12,marginBottom:9,display:"flex",alignItems:"flex-start",gap:8,lineHeight:1.5,...styles[type] }}>{children}</div>;
};

const RBlock = ({ title, variant, children }) => {
  const variants = {
    warn:   { borderColor:"rgba(230,126,34,0.22)",background:"rgba(230,126,34,0.04)",titleColor:"#e67e22" },
    good:   { borderColor:"rgba(82,183,136,0.22)", background:"rgba(82,183,136,0.04)", titleColor:"#52b788" },
    gold:   { borderColor:"rgba(212,160,23,0.22)",background:"rgba(212,160,23,0.04)", titleColor:"#f0c940" },
    danger: { borderColor:"rgba(192,57,43,0.22)",background:"rgba(192,57,43,0.04)",   titleColor:"#e74c3c" },
    default:{ borderColor:"rgba(82,183,136,0.1)", background:"rgba(255,255,255,0.03)",titleColor:"#52b788" },
  };
  const v = variants[variant] || variants.default;
  return (
    <div style={{ border:`1px solid ${v.borderColor}`,borderRadius:13,padding:"16px 18px",marginBottom:10,background:v.background }}>
      {title && <h4 style={{ fontSize:11,fontWeight:600,color:v.titleColor,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8 }}>{title}</h4>}
      <div style={{ fontSize:13,lineHeight:1.7,color:"rgba(245,240,232,0.85)" }}>{children}</div>
    </div>
  );
};

const Modal = ({ open, onClose, title, sub, children, actions }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(5px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#192215",border:"1px solid rgba(82,183,136,0.18)",borderRadius:17,padding:24,width:"90%",maxWidth:460,maxHeight:"90vh",overflowY:"auto",animation:"fadeUp 0.3s ease both" }}>
        <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,marginBottom:4,color:"#f5f0e8" }}>{title}</h3>
        {sub && <p style={{ fontSize:12,color:"#4a7060",marginBottom:16,lineHeight:1.5 }}>{sub}</p>}
        {children}
        {actions && <div style={{ display:"flex",gap:9,justifyContent:"flex-end",marginTop:16 }}>{actions}</div>}
      </div>
    </div>
  );
};

const StatStrip = ({ stats }) => (
  <div style={{ display:"grid",gridTemplateColumns:`repeat(${Math.min(stats.length,4)},1fr)`,gap:10,marginBottom:16 }}>
    {stats.map(({ label, value, icon, color }) => (
      <div key={label} style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(82,183,136,0.1)",borderRadius:13,padding:14,textAlign:"center",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",right:9,top:7,fontSize:20,opacity:0.2 }}>{icon}</div>
        <div style={{ fontSize:10,fontWeight:600,color:"#4a7060",textTransform:"uppercase",letterSpacing:0.4,marginBottom:5 }}>{label}</div>
        <div style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:color||"#52b788" }}>{value}</div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ icon, text }) => (
  <div style={{ textAlign:"center",padding:32,color:"#4a7060",fontSize:13,background:"rgba(255,255,255,0.02)",border:"1px dashed rgba(82,183,136,0.1)",borderRadius:13 }}>
    <div style={{ fontSize:32,marginBottom:8 }}>{icon}</div>
    {text}
  </div>
);

const HistItem = ({ icon, title, meta, onClick }) => (
  <div onClick={onClick} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(82,183,136,0.1)",borderRadius:11,padding:"12px 15px",display:"flex",alignItems:"center",gap:11,cursor:"pointer",transition:"all 0.2s" }}
    onMouseEnter={e=>{e.currentTarget.style.background="rgba(82,183,136,0.05)";e.currentTarget.style.borderColor="rgba(82,183,136,0.18)"}}
    onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.02)";e.currentTarget.style.borderColor="rgba(82,183,136,0.1)"}}>
    <div style={{ width:36,height:36,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,background:"rgba(82,183,136,0.08)" }}>{icon}</div>
    <div style={{ flex:1,minWidth:0 }}>
      <div style={{ fontSize:12,fontWeight:500,color:"#f5f0e8",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{title}</div>
      <div style={{ fontSize:10,color:"#4a7060",marginTop:1 }}>{meta}</div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
//  PAGE COMPONENTS
// ─────────────────────────────────────────────────────────

// ── DASHBOARD ─────────────────────────────────────────────
function DashPage({ lang, setPage }) {
  const animals = DS("animals");
  const inv = DS("inventory");
  const tasks = DS("tasks").filter(t => !t.done);
  const books = DS("books");
  const monthIncome = books.filter(b => b.type === "income" && (b.date || "").startsWith(thisMonth())).reduce((s, b) => s + (b.amount || 0), 0);
  const profile = getProfile();
  const h = new Date().getHours();
  const greet = h < 12 ? T("morning",lang) : h < 17 ? T("afternoon",lang) : T("evening",lang);
  const overdue = DS("tasks").filter(t => !t.done && t.due && t.due < today());
  const vaccDue = animals.filter(a => { if (!a.next_vac) return false; return Math.ceil((new Date(a.next_vac) - new Date()) / 86400000) <= 7; });
  const lowStock = inv.filter(x => x.alert > 0 && x.qty <= x.alert);

  const MODULES = [
    ["🔬","diagnosis","Photo or symptoms → AI diagnosis"],
    ["🧪","soil","Soil test → fertilizer plan"],
    ["📅","calendar","12-month AI planting calendar"],
    ["🌤️","weather","Seasonal farming advice"],
    ["🐄","animals","Track every animal + health records"],
    ["🥛","milk","Daily milk yield per cow"],
    ["🥚","eggs","Daily egg counts & laying rates"],
    ["🐣","breeding","Pregnancies & birth records"],
    ["⚖️","weight","Growth curves per batch"],
    ["🌾","feed","Optimised feed formulas"],
    ["💰","profit","Per-batch profit & loss"],
    ["📒","books","Full income & expense journal"],
    ["💳","loan","Repayment plans"],
    ["🛡️","insurance","Coverage needs & premiums"],
    ["🏛️","subsidy","Government grants & programmes"],
    ["📈","reports","AI-generated farm reports"],
    ["📦","inventory","Stock with low-stock alerts"],
    ["📋","tasks","Tasks with priorities & reminders"],
    ["👷","labour","Employee hours & payroll"],
    ["🗺️","land","Register each field or plot"],
    ["💧","water","Irrigation logs & advice"],
    ["🏪","market","Sell produce & find supplies"],
    ["🏥","vets","Vet contacts & visit history"],
    ["🏬","suppliers","Feed & medicine suppliers"],
    ["🤖","advisor","Chat 24/7 with your AI expert"],
  ];

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(20px,3vw,30px)",fontWeight:900,lineHeight:1.15,marginBottom:5,color:"#f5f0e8" }}>
          {greet}, <em style={{ fontStyle:"normal",color:"#52b788" }}>{profile.name || T("farmer",lang)}</em> 🌿
        </h1>
        <p style={{ fontSize:13,color:"#4a7060" }}>Your complete AI-powered farm management platform — 26 tools in one place.</p>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20 }}>
        {[
          { label:T("animals_n",lang), val:animals.length, icon:"🐄", page:"animals", sub:T("registered",lang) },
          { label:T("inv_n",lang), val:inv.length, icon:"📦", page:"inventory", sub:T("instock",lang) },
          { label:T("tasks_n",lang), val:tasks.length, icon:"📋", page:"tasks", sub:T("duesoon",lang) },
          { label:T("month_n",lang), val:monthIncome>0?fmtI(monthIncome):"—", icon:"💰", page:"books", sub:T("farmincome",lang) },
        ].map(s => (
          <div key={s.label} onClick={()=>setPage(s.page)} style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(82,183,136,0.1)",borderRadius:13,padding:15,cursor:"pointer",transition:"all 0.2s",position:"relative",overflow:"hidden",textDecoration:"none",display:"block" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor="rgba(82,183,136,0.2)"}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor="rgba(82,183,136,0.1)"}}>
            <div style={{ position:"absolute",right:11,top:9,fontSize:22,opacity:0.18 }}>{s.icon}</div>
            <div style={{ fontSize:10,fontWeight:600,color:"#4a7060",textTransform:"uppercase",letterSpacing:0.4,marginBottom:6 }}>{s.label}</div>
            <div style={{ fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:"#52b788" }}>{s.val}</div>
            <div style={{ fontSize:10,color:"#4a7060",marginTop:2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {overdue.length > 0 && <Alert type="danger">🚨 <strong>{overdue.length} overdue task(s):</strong> {overdue.map(t=>t.title).join(", ")}</Alert>}
      {lowStock.length > 0 && <Alert type="warn">⚠️ <strong>Low stock:</strong> {lowStock.map(x=>x.name).join(", ")}</Alert>}
      {vaccDue.length > 0 && <Alert type="warn">💉 <strong>Vaccination due:</strong> {vaccDue.map(a=>a.id).join(", ")}</Alert>}

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10,marginBottom:20 }}>
        {MODULES.map(([emoji, id, desc]) => (
          <div key={id} onClick={()=>setPage(id)} style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(82,183,136,0.1)",borderRadius:13,padding:"16px 14px",cursor:"pointer",transition:"all 0.22s",position:"relative",overflow:"hidden" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor="rgba(82,183,136,0.22)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.25)"}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor="rgba(82,183,136,0.1)";e.currentTarget.style.boxShadow=""}}>
            <span style={{ fontSize:26,marginBottom:9,display:"block" }}>{emoji}</span>
            <div style={{ fontSize:12,fontWeight:600,color:"#f5f0e8",marginBottom:3 }}>{T(id,lang)}</div>
            <div style={{ fontSize:10,color:"#4a7060",lineHeight:1.4 }}>{desc}</div>
            <span style={{ position:"absolute",bottom:12,right:12,fontSize:14,color:"#4a7060" }}>→</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI ADVISOR (CHAT) ──────────────────────────────────────
function AdvisorPage({ lang }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const endRef = useRef();

  const profile = getProfile();
  const system = `You are AgriLogic FarmAdvisor, an expert AI agricultural and veterinary advisor for East African farmers. Help with animal diseases, pests, nutrition, crop management, planting calendars, profitability, market prices, government subsidies, farm insurance, labour management and land management.
${profile.location ? "Farmer location: " + profile.location + "." : ""} ${profile.animal ? "Main livestock: " + profile.animal + "." : ""} ${profile.crops ? "Main crops: " + profile.crops + "." : ""} ${profile.size ? "Farm size: " + profile.size + "." : ""}
Give practical, actionable advice for East African conditions. Be warm and speak like a trusted expert. Format using **bold** for key points and - for lists.`;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role:"user", content:text };
    const newHist = [...history, userMsg];
    setHistory(newHist);
    setMsgs(m => [...m, { role:"user", text }]);
    setInput("");
    setLoading(true);
    const reply = await callAI(newHist, system);
    setHistory(h => [...h, { role:"assistant", content:reply }]);
    setMsgs(m => [...m, { role:"ai", text:reply }]);
    setLoading(false);
  };

  const formatMsg = (t) => t
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^[-•] (.+)$/gm, "<div style='padding:2px 0 2px 14px;position:relative'><span style='position:absolute;left:0;color:#52b788'>→</span>$1</div>")
    .replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>");

  const topics = [
    { k:"disease", label:"🦠 Disease Help" },
    { k:"feed",    label:"🌾 Feed Advice" },
    { k:"profit",  label:"💰 Profit Analysis" },
    { k:"plant",   label:"🌱 Planting Tips" },
    { k:"market",  label:"🏪 Market Prices" },
    { k:"weather", label:"🌤️ Weather Planning" },
  ];

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <PageHeader icon="🤖" badge="AI Farm Advisor" title="AI Farm" em="Advisor" desc="Chat 24/7 with your expert agricultural AI — get diagnoses, planting advice, market insights & more." />

      <div style={{ flex:1,overflowY:"auto",minHeight:0 }}>
        {msgs.length === 0 ? (
          <div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:20 }}>
              {topics.map(t => (
                <div key={t.k} onClick={()=>send(`Tell me about ${t.k} advice for my farm`)} style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(82,183,136,0.1)",borderRadius:11,padding:"14px 12px",cursor:"pointer",fontSize:12,color:"#f5f0e8",transition:"all 0.2s",textAlign:"center" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(82,183,136,0.3)";e.currentTarget.style.background="rgba(82,183,136,0.06)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(82,183,136,0.1)";e.currentTarget.style.background="rgba(255,255,255,0.03)"}}>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display:"flex",gap:10,alignItems:"flex-start",flexDirection:m.role==="user"?"row-reverse":"row" }}>
                <div style={{ width:32,height:32,borderRadius:9,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,background:m.role==="user"?"rgba(82,183,136,0.15)":"rgba(212,160,23,0.12)" }}>
                  {m.role==="user"?"👤":"🧑‍🌾"}
                </div>
                <div style={{ maxWidth:"75%" }}>
                  <div style={{ background:m.role==="user"?"rgba(82,183,136,0.12)":"rgba(255,255,255,0.04)",border:"1px solid",borderColor:m.role==="user"?"rgba(82,183,136,0.2)":"rgba(82,183,136,0.08)",borderRadius:13,padding:"11px 14px",fontSize:13,lineHeight:1.7,color:"rgba(245,240,232,0.9)" }}
                    dangerouslySetInnerHTML={{ __html:formatMsg(m.text) }}/>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:"flex",gap:10 }}>
                <div style={{ width:32,height:32,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,background:"rgba(212,160,23,0.12)" }}>🧑‍🌾</div>
                <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(82,183,136,0.08)",borderRadius:13,padding:"11px 16px",display:"flex",gap:5,alignItems:"center" }}>
                  {[0,1,2].map(n => <div key={n} style={{ width:7,height:7,borderRadius:"50%",background:"#52b788",animation:`bounce 1s ${n*0.15}s ease-in-out infinite` }}/>)}
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>
        )}
      </div>

      <div style={{ padding:"14px 0 0",borderTop:"1px solid rgba(82,183,136,0.08)",marginTop:14 }}>
        <div style={{ display:"flex",gap:9 }}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(input);}}}
            placeholder="Ask your farm advisor anything…" rows={2}
            style={{ ...inputStyle,flex:1,resize:"none",lineHeight:1.5 }}/>
          <Btn onClick={()=>send(input)} disabled={loading||!input.trim()} style={{ alignSelf:"flex-end",padding:"10px 20px" }}>
            {loading ? "…" : "Send →"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── DISEASE DIAGNOSIS ──────────────────────────────────────
function DiagnosisPage({ lang }) {
  const [form, setForm] = useState({ category:"Poultry", animal:"", symptoms:"", duration:"", age:"", location:"" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(DS("diag"));

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const diagnose = async () => {
    if (!form.symptoms) return;
    setLoading(true); setResult(null);
    const prompt = `You are an expert veterinarian and crop disease specialist for East Africa. 
Animal/Crop: ${form.category} — ${form.animal}. Symptoms: ${form.symptoms}. Duration: ${form.duration||"unknown"}. Age: ${form.age||"unknown"}. Location: ${form.location||"East Africa"}.
Respond ONLY with JSON: { "disease": "...", "confidence": "High/Medium/Low", "description": "...", "causes": ["..."], "immediate_actions": ["..."], "treatment": "...", "prevention": ["..."], "vet_needed": true/false, "severity": "Mild/Moderate/Severe/Critical" }`;

    const raw = await callAI([{ role:"user",content:prompt }]);
    try {
      const d = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setResult(d);
      const entry = { id:uid(), date:today(), ...form, ...d };
      const h = [entry, ...DS("diag")].slice(0, 50);
      save("diag", h); setHistory(h);
    } catch { setResult({ disease:"Could not parse result", description:raw, confidence:"—", severity:"—" }); }
    setLoading(false);
  };

  return (
    <div>
      <PageHeader icon="🔬" badge="AI Powered" title="Disease &amp; Pest" em="Diagnosis" desc="Describe symptoms or upload a photo — get an instant AI diagnosis with treatment plan." />
      <Card title="Describe the Problem" icon="🔬">
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:11 }}>
          <Field label="Category">
            <Sel value={form.category} onChange={e=>set("category",e.target.value)}>
              {["Poultry","Cattle","Goats","Sheep","Crops","Fish","Other"].map(c=><option key={c}>{c}</option>)}
            </Sel>
          </Field>
          <Field label="Animal / Crop Name"><Inp value={form.animal} onChange={e=>set("animal",e.target.value)} placeholder="e.g. Broiler chicken"/></Field>
        </div>
        <Field label="Symptoms *"><Textarea value={form.symptoms} onChange={e=>set("symptoms",e.target.value)} placeholder="Describe all visible symptoms in detail…" rows={4}/></Field>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11 }}>
          <Field label="Duration"><Inp value={form.duration} onChange={e=>set("duration",e.target.value)} placeholder="e.g. 3 days"/></Field>
          <Field label="Age"><Inp value={form.age} onChange={e=>set("age",e.target.value)} placeholder="e.g. 4 weeks"/></Field>
          <Field label="Location"><Inp value={form.location} onChange={e=>set("location",e.target.value)} placeholder="e.g. Nakuru"/></Field>
        </div>
        <Btn full onClick={diagnose} disabled={loading||!form.symptoms} style={{ marginTop:4 }}>
          {loading ? "🤖 Analysing…" : "🔬 Get AI Diagnosis"}
        </Btn>
      </Card>

      {loading && <Spinner/>}

      {result && !loading && (
        <div style={{ animation:"fadeUp 0.4s ease both" }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
            <RBlock title="Diagnosis" variant={result.severity==="Critical"?"danger":result.severity==="Severe"?"warn":"good"}>
              <strong style={{ fontSize:16 }}>{result.disease}</strong>
              <div style={{ marginTop:6,display:"flex",gap:8,flexWrap:"wrap" }}>
                <span style={{ fontSize:11,padding:"3px 9px",borderRadius:10,background:"rgba(82,183,136,0.1)",color:"#52b788" }}>Confidence: {result.confidence}</span>
                <span style={{ fontSize:11,padding:"3px 9px",borderRadius:10,background:"rgba(230,126,34,0.1)",color:"#e67e22" }}>Severity: {result.severity}</span>
              </div>
            </RBlock>
            <RBlock title="Description">{result.description}</RBlock>
          </div>
          {result.immediate_actions?.length > 0 && <RBlock title="⚡ Immediate Actions" variant="warn"><ul style={{ listStyle:"none",paddingLeft:0 }}>{result.immediate_actions.map((a,i)=><li key={i} style={{ paddingLeft:16,position:"relative",marginBottom:5,fontSize:12,lineHeight:1.5 }}><span style={{ position:"absolute",left:0,color:"#52b788" }}>→</span>{a}</li>)}</ul></RBlock>}
          {result.treatment && <RBlock title="💊 Treatment Plan">{result.treatment}</RBlock>}
          {result.prevention?.length > 0 && <RBlock title="🛡️ Prevention"><ul style={{ listStyle:"none",paddingLeft:0 }}>{result.prevention.map((p,i)=><li key={i} style={{ paddingLeft:16,position:"relative",marginBottom:5,fontSize:12,lineHeight:1.5 }}><span style={{ position:"absolute",left:0,color:"#52b788" }}>→</span>{p}</li>)}</ul></RBlock>}
          {result.vet_needed && <Alert type="danger">🚨 <strong>Veterinary attention required.</strong> Please contact your vet as soon as possible.</Alert>}
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop:26 }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:12,color:"#f5f0e8",display:"flex",alignItems:"center",gap:8 }}>📋 Recent Diagnoses</h3>
          <div style={{ display:"grid",gap:7 }}>
            {history.slice(0,6).map(e => <HistItem key={e.id} icon="🔬" title={e.disease||e.symptoms} meta={`${e.category} · ${e.date} · ${e.severity||""}`} onClick={()=>setResult(e)}/>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ANIMAL REGISTRY ────────────────────────────────────────
function AnimalsPage({ lang }) {
  const [animals, setAnimals] = useState(DS("animals"));
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [healthModal, setHealthModal] = useState(null);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ id:"",name:"",type:"Broiler",breed:"",dob:"",sex:"Male",weight:"",status:"Active",last_vac:"",next_vac:"",last_deworm:"",notes:"" });
  const [healthForm, setHealthForm] = useState({ type:"Vaccination",date:today(),description:"" });

  const TYPES = ["Broiler","Layer","Chick","Bull","Dairy Cow","Goat","Sheep","Tilapia","Catfish","Other"];
  const EMOJIS = { Broiler:"🐔",Layer:"🥚",Chick:"🐣",Bull:"🐂","Dairy Cow":"🥛",Goat:"🐐",Sheep:"🐑",Tilapia:"🐟",Catfish:"🐠",Other:"🐾" };
  const STATUS_COLOR = { Active:"#52b788",Sick:"#e74c3c",Pregnant:"#f0c940",Sold:"#4a7060",Deceased:"#7f8c8d" };

  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const persist = (list) => { save("animals",list); setAnimals(list); };

  const openAdd = () => { setEditing(null); setForm({ id:"",name:"",type:"Broiler",breed:"",dob:today(),sex:"Male",weight:"",status:"Active",last_vac:"",next_vac:"",last_deworm:"",notes:"" }); setModal(true); };
  const openEdit = (a) => { setEditing(a.id); setForm({...a}); setModal(true); };
  const saveAnimal = () => {
    if (!form.id) return;
    const list = DS("animals");
    if (editing) persist(list.map(a=>a.id===editing?{...a,...form}:a));
    else persist([{ ...form, health_events:[] }, ...list]);
    setModal(false);
  };
  const del = (id) => { if(confirm("Delete animal?")) persist(DS("animals").filter(a=>a.id!==id)); };
  const addHealth = () => {
    const list = DS("animals");
    const upd = list.map(a => a.id===healthModal ? {...a, health_events:[healthForm,...(a.health_events||[])]} : a);
    persist(upd); setHealthModal(null);
  };

  const filtered = animals.filter(a => (!filter||a.type===filter) && (!search||(a.id+a.name).toLowerCase().includes(search.toLowerCase())));
  const vaccAlerts = animals.filter(a => a.next_vac && Math.ceil((new Date(a.next_vac)-new Date())/86400000)<=3);

  return (
    <div>
      <PageHeader icon="🐄" badge="Animal Registry" title="Animal" em="Registry" desc="Track every animal's health, vaccinations, breeding records and performance." />
      {vaccAlerts.length > 0 && <Alert type="warn">💉 Vaccinations due in ≤3 days: {vaccAlerts.map(a=>a.id).join(", ")}</Alert>}
      <div style={{ display:"flex",gap:9,marginBottom:14,flexWrap:"wrap" }}>
        <Btn onClick={openAdd}>+ Add Animal</Btn>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{ ...inputStyle,width:160,flex:"none" }}/>
        <Sel value={filter} onChange={e=>setFilter(e.target.value)} style={{ width:140 }}>
          <option value="">All Types</option>
          {TYPES.map(t=><option key={t}>{t}</option>)}
        </Sel>
      </div>
      <StatStrip stats={[
        { label:"Total", value:animals.length, icon:"🐾" },
        { label:"Active", value:animals.filter(a=>a.status==="Active").length, icon:"✅" },
        { label:"Sick", value:animals.filter(a=>a.status==="Sick").length, icon:"🤒", color:"#e74c3c" },
        { label:"Pregnant", value:animals.filter(a=>a.status==="Pregnant").length, icon:"🐣", color:"#f0c940" },
      ]}/>
      {filtered.length === 0 ? <EmptyState icon="🐾" text="No animals registered yet. Add your first animal to get started." /> : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:12 }}>
          {filtered.map(a => {
            const nvd = a.next_vac ? Math.ceil((new Date(a.next_vac)-new Date())/86400000) : null;
            return (
              <div key={a.id} style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(82,183,136,0.1)",borderRadius:14,padding:16,transition:"all 0.22s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor="rgba(82,183,136,0.22)"}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor="rgba(82,183,136,0.1)"}}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:26 }}>{EMOJIS[a.type]||"🐾"}</div>
                    <div style={{ fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginTop:4,color:"#f5f0e8" }}>{a.id}{a.name?" · "+a.name:""}</div>
                    <div style={{ fontSize:11,color:"#4a7060" }}>{a.breed||a.type}{a.sex?" · "+a.sex:""}</div>
                  </div>
                  <span style={{ padding:"3px 9px",borderRadius:10,fontSize:10,fontWeight:600,color:STATUS_COLOR[a.status]||"#52b788",background:"rgba(82,183,136,0.08)" }}>{a.status||"Active"}</span>
                </div>
                {nvd !== null && nvd <= 7 && <Alert type="warn" style={{ fontSize:11,padding:"7px 11px",marginBottom:8 }}>💉 Vaccination {nvd<=0?"OVERDUE":"in "+nvd+" days"}</Alert>}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:10,fontSize:11,color:"#4a7060" }}>
                  {a.dob && <div>🎂 <span style={{ color:"#f5f0e8" }}>{a.dob}</span></div>}
                  {a.weight && <div>⚖️ <span style={{ color:"#f5f0e8" }}>{a.weight}kg</span></div>}
                  {a.last_vac && <div>💉 <span style={{ color:"#f5f0e8" }}>{a.last_vac}</span></div>}
                  {a.last_deworm && <div>🪱 <span style={{ color:"#f5f0e8" }}>{a.last_deworm}</span></div>}
                </div>
                {(a.health_events||[]).slice(0,2).map((e,i) => <div key={i} style={{ fontSize:11,color:"#4a7060",padding:"3px 0",borderBottom:"1px solid rgba(82,183,136,0.06)" }}>{e.date} · {e.type} — {e.description}</div>)}
                <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginTop:10 }}>
                  <button onClick={()=>{setHealthModal(a.id);setHealthForm({type:"Vaccination",date:today(),description:""})}} style={{ flex:1,padding:"6px 9px",background:"rgba(82,183,136,0.1)",border:"1px solid rgba(82,183,136,0.2)",borderRadius:7,color:"#52b788",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>+ Health Event</button>
                  <button onClick={()=>openEdit(a)} style={{ padding:"6px 9px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(82,183,136,0.1)",borderRadius:7,color:"#4a7060",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Edit</button>
                  <button onClick={()=>del(a.id)} style={{ padding:"6px 9px",background:"rgba(192,57,43,0.08)",border:"1px solid rgba(192,57,43,0.18)",borderRadius:7,color:"#e74c3c",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Edit Animal":"Add Animal"} sub="Register and track a new animal"
        actions={[<button key="c" onClick={()=>setModal(false)} style={{ padding:"8px 15px",background:"transparent",border:"1px solid rgba(82,183,136,0.13)",borderRadius:8,color:"#4a7060",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12 }}>Cancel</button>, <Btn key="s" size="sm" onClick={saveAnimal}>Save</Btn>]}>
        <div style={{ display:"grid",gap:9 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9 }}>
            <Field label="Animal ID *"><Inp value={form.id} onChange={e=>setF("id",e.target.value)} placeholder="e.g. COW001"/></Field>
            <Field label="Name"><Inp value={form.name} onChange={e=>setF("name",e.target.value)} placeholder="Optional"/></Field>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9 }}>
            <Field label="Type"><Sel value={form.type} onChange={e=>setF("type",e.target.value)}>{TYPES.map(t=><option key={t}>{t}</option>)}</Sel></Field>
            <Field label="Breed"><Inp value={form.breed} onChange={e=>setF("breed",e.target.value)} placeholder="e.g. Fresian"/></Field>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9 }}>
            <Field label="Date of Birth"><Inp type="date" value={form.dob} onChange={e=>setF("dob",e.target.value)}/></Field>
            <Field label="Sex"><Sel value={form.sex} onChange={e=>setF("sex",e.target.value)}><option>Male</option><option>Female</option></Sel></Field>
            <Field label="Weight (kg)"><Inp type="number" value={form.weight} onChange={e=>setF("weight",e.target.value)}/></Field>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9 }}>
            <Field label="Status"><Sel value={form.status} onChange={e=>setF("status",e.target.value)}>{["Active","Sick","Pregnant","Sold","Deceased"].map(s=><option key={s}>{s}</option>)}</Sel></Field>
            <Field label="Last Vaccination"><Inp type="date" value={form.last_vac} onChange={e=>setF("last_vac",e.target.value)}/></Field>
            <Field label="Next Vaccination"><Inp type="date" value={form.next_vac} onChange={e=>setF("next_vac",e.target.value)}/></Field>
          </div>
          <Field label="Notes"><Textarea value={form.notes} onChange={e=>setF("notes",e.target.value)} rows={2}/></Field>
        </div>
      </Modal>

      <Modal open={!!healthModal} onClose={()=>setHealthModal(null)} title="Add Health Event" sub="Record a health event for this animal"
        actions={[<button key="c" onClick={()=>setHealthModal(null)} style={{ padding:"8px 15px",background:"transparent",border:"1px solid rgba(82,183,136,0.13)",borderRadius:8,color:"#4a7060",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12 }}>Cancel</button>,<Btn key="s" size="sm" onClick={addHealth}>Save</Btn>]}>
        <div style={{ display:"grid",gap:9 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9 }}>
            <Field label="Event Type"><Sel value={healthForm.type} onChange={e=>setHealthForm(f=>({...f,type:e.target.value}))}>{["Vaccination","Deworming","Treatment","Checkup","Injury","Other"].map(t=><option key={t}>{t}</option>)}</Sel></Field>
            <Field label="Date"><Inp type="date" value={healthForm.date} onChange={e=>setHealthForm(f=>({...f,date:e.target.value}))}/></Field>
          </div>
          <Field label="Description"><Textarea value={healthForm.description} onChange={e=>setHealthForm(f=>({...f,description:e.target.value}))} placeholder="Details of the event…" rows={3}/></Field>
        </div>
      </Modal>
    </div>
  );
}

// ── MILK TRACKER ───────────────────────────────────────────
function MilkPage({ lang }) {
  const [logs, setLogs] = useState(DS("milk"));
  const [form, setForm] = useState({ date:today(),animal:"",morning:"",evening:"",quality:"Grade A",price:""});
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const persist = (list) => { save("milk",list); setLogs(list); };
  const add = () => {
    if (!form.animal||!form.morning) return;
    persist([{ id:uid(),...form, total:Number(form.morning||0)+Number(form.evening||0) },...logs]);
    setForm(f=>({...f,animal:"",morning:"",evening:"",price:""}));
  };
  const total = logs.reduce((s,l)=>s+(l.total||0),0);
  const animals = [...new Set(DS("animals").filter(a=>["Dairy Cow","Goat","Sheep"].includes(a.type)).map(a=>a.id))];
  return (
    <div>
      <PageHeader icon="🥛" badge="Production Tracker" title="Milk" em="Tracker" desc="Log daily milk production per cow and track yield trends."/>
      <StatStrip stats={[
        { label:"Total Litres", value:fmt(total)+"L", icon:"🥛" },
        { label:"Records", value:logs.length, icon:"📋" },
        { label:"Today", value:fmt(logs.filter(l=>l.date===today()).reduce((s,l)=>s+(l.total||0),0))+"L", icon:"📅" },
        { label:"This Month", value:fmt(logs.filter(l=>l.date?.startsWith(thisMonth())).reduce((s,l)=>s+(l.total||0),0))+"L", icon:"📆" },
      ]}/>
      <Card title="Log Milk Production" icon="🥛">
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:11 }}>
          <Field label="Date"><Inp type="date" value={form.date} onChange={e=>setF("date",e.target.value)}/></Field>
          <Field label="Animal ID / Name">
            {animals.length > 0 ? <Sel value={form.animal} onChange={e=>setF("animal",e.target.value)}><option value="">Select animal…</option>{animals.map(a=><option key={a}>{a}</option>)}</Sel>
            : <Inp value={form.animal} onChange={e=>setF("animal",e.target.value)} placeholder="e.g. COW001"/>}
          </Field>
          <Field label="Morning Yield (L)"><Inp type="number" value={form.morning} onChange={e=>setF("morning",e.target.value)} placeholder="0.0"/></Field>
          <Field label="Evening Yield (L)"><Inp type="number" value={form.evening} onChange={e=>setF("evening",e.target.value)} placeholder="0.0"/></Field>
          <Field label="Quality"><Sel value={form.quality} onChange={e=>setF("quality",e.target.value)}>{["Grade A","Grade B","Grade C","Rejected"].map(q=><option key={q}>{q}</option>)}</Sel></Field>
          <Field label="Sale Price/L"><Inp type="number" value={form.price} onChange={e=>setF("price",e.target.value)} placeholder="0"/></Field>
        </div>
        <Btn full onClick={add} style={{ marginTop:4 }}>+ Log Milk Production</Btn>
      </Card>
      {logs.length === 0 ? <EmptyState icon="🥛" text="No milk records yet. Log your first production above."/> : (
        <div>
          <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:12,color:"#f5f0e8" }}>Recent Records</h3>
          <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(82,183,136,0.08)",borderRadius:13,overflow:"hidden" }}>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead><tr style={{ borderBottom:"1px solid rgba(82,183,136,0.1)" }}>{["Date","Animal","Morning","Evening","Total","Quality","Price"].map(h=><th key={h} style={{ textAlign:"left",padding:"9px 12px",fontSize:10,fontWeight:600,color:"#4a7060",textTransform:"uppercase",letterSpacing:0.4 }}>{h}</th>)}</tr></thead>
              <tbody>{logs.slice(0,20).map(l=>(
                <tr key={l.id} style={{ borderBottom:"1px solid rgba(82,183,136,0.04)" }}>
                  {[l.date,l.animal,fmt(l.morning)+"L",fmt(l.evening)+"L",<strong style={{ color:"#52b788" }}>{fmt(l.total)}L</strong>,l.quality,l.price?fmtI(l.total*l.price):"—"].map((c,i)=><td key={i} style={{ padding:"10px 12px",fontSize:12,color:"#f5f0e8" }}>{c}</td>)}
                  <td style={{ padding:"10px 12px" }}><button onClick={()=>{const l2=logs.filter(x=>x.id!==l.id);persist(l2)}} style={{ fontSize:11,color:"#e74c3c",background:"none",border:"none",cursor:"pointer" }}>✕</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TASK MANAGER ───────────────────────────────────────────
function TasksPage({ lang }) {
  const [tasks, setTasks] = useState(DS("tasks"));
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title:"",category:"health",priority:"Medium",due:today(),notes:"",done:false });
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const persist = (list) => { save("tasks",list); setTasks(list); };
  const add = () => { if(!form.title) return; persist([{ id:uid(),...form },...tasks]); setModal(false); setForm({ title:"",category:"health",priority:"Medium",due:today(),notes:"",done:false }); };
  const toggle = (id) => persist(tasks.map(t=>t.id===id?{...t,done:!t.done}:t));
  const del = (id) => persist(tasks.filter(t=>t.id!==id));
  const CAT_ICONS = { health:"💉",feed:"🌾",crop:"🌱",equipment:"🔧",market:"🏪",finance:"💰",other:"📋" };
  const PRIO_COLOR = { High:"#e74c3c",Medium:"#e67e22",Low:"#52b788" };
  const pending = tasks.filter(t=>!t.done);
  const done = tasks.filter(t=>t.done);
  const overdue = pending.filter(t=>t.due&&t.due<today());
  return (
    <div>
      <PageHeader icon="📋" badge="Task Manager" title="Task" em="Manager" desc="Stay organised with tasks, priorities and due date tracking."/>
      {overdue.length > 0 && <Alert type="danger">🚨 {overdue.length} overdue task(s): {overdue.map(t=>t.title).join(", ")}</Alert>}
      <StatStrip stats={[
        { label:"Pending", value:pending.length, icon:"⏳" },
        { label:"Overdue", value:overdue.length, icon:"🚨", color:overdue.length>0?"#e74c3c":"#52b788" },
        { label:"Done", value:done.length, icon:"✅", color:"#52b788" },
        { label:"Total", value:tasks.length, icon:"📋" },
      ]}/>
      <Btn onClick={()=>setModal(true)} style={{ marginBottom:16 }}>+ Add Task</Btn>
      {tasks.length === 0 ? <EmptyState icon="📋" text="No tasks yet. Add your first task above."/> : (
        <div style={{ display:"grid",gap:8 }}>
          {[...pending,...done].map(t=>(
            <div key={t.id} style={{ background:"rgba(255,255,255,0.03)",border:"1px solid",borderColor:t.done?"rgba(82,183,136,0.06)":"rgba(82,183,136,0.1)",borderRadius:11,padding:"12px 15px",display:"flex",alignItems:"center",gap:11,opacity:t.done?0.6:1 }}>
              <input type="checkbox" checked={t.done} onChange={()=>toggle(t.id)} style={{ width:16,height:16,cursor:"pointer",accentColor:"#52b788",flexShrink:0 }}/>
              <div style={{ width:36,height:36,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,background:"rgba(82,183,136,0.08)" }}>{CAT_ICONS[t.category]||"📋"}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:13,fontWeight:500,color:t.done?"#4a7060":"#f5f0e8",textDecoration:t.done?"line-through":"none" }}>{t.title}</div>
                <div style={{ fontSize:10,color:t.due&&t.due<today()&&!t.done?"#e74c3c":"#4a7060",marginTop:2 }}>
                  {t.due||"No date"} · <span style={{ color:PRIO_COLOR[t.priority]||"#4a7060" }}>{t.priority}</span>{t.notes&&" · "+t.notes}
                </div>
              </div>
              <button onClick={()=>del(t.id)} style={{ background:"none",border:"none",color:"#4a7060",cursor:"pointer",fontSize:14,padding:"4px" }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={()=>setModal(false)} title="Add Farm Task" sub="Create a new task with priority and due date"
        actions={[<button key="c" onClick={()=>setModal(false)} style={{ padding:"8px 15px",background:"transparent",border:"1px solid rgba(82,183,136,0.13)",borderRadius:8,color:"#4a7060",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12 }}>Cancel</button>,<Btn key="s" size="sm" onClick={add}>Add Task</Btn>]}>
        <div style={{ display:"grid",gap:9 }}>
          <Field label="Task Title *"><Inp value={form.title} onChange={e=>setF("title",e.target.value)} placeholder="What needs to be done?"/></Field>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9 }}>
            <Field label="Category"><Sel value={form.category} onChange={e=>setF("category",e.target.value)}>{["health","feed","crop","equipment","market","finance","other"].map(c=><option key={c}>{c}</option>)}</Sel></Field>
            <Field label="Priority"><Sel value={form.priority} onChange={e=>setF("priority",e.target.value)}>{["High","Medium","Low"].map(p=><option key={p}>{p}</option>)}</Sel></Field>
            <Field label="Due Date"><Inp type="date" value={form.due} onChange={e=>setF("due",e.target.value)}/></Field>
          </div>
          <Field label="Notes"><Textarea value={form.notes} onChange={e=>setF("notes",e.target.value)} rows={2}/></Field>
        </div>
      </Modal>
    </div>
  );
}

// ── FARM BOOKKEEPING ───────────────────────────────────────
function BooksPage({ lang }) {
  const [books, setBooks] = useState(DS("books"));
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ date:today(),type:"income",category:"Sales",amount:"",description:"",notes:"" });
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const persist = (list) => { save("books",list); setBooks(list); };
  const add = () => { if(!form.amount||!form.description) return; persist([{ id:uid(),...form,amount:Number(form.amount) },...books]); setModal(false); setForm({ date:today(),type:"income",category:"Sales",amount:"",description:"",notes:"" }); };
  const totalIncome = books.filter(b=>b.type==="income").reduce((s,b)=>s+b.amount,0);
  const totalExpense = books.filter(b=>b.type==="expense").reduce((s,b)=>s+b.amount,0);
  const balance = totalIncome - totalExpense;
  const mIncome = books.filter(b=>b.type==="income"&&b.date?.startsWith(thisMonth())).reduce((s,b)=>s+b.amount,0);
  const mExpense = books.filter(b=>b.type==="expense"&&b.date?.startsWith(thisMonth())).reduce((s,b)=>s+b.amount,0);
  const INCOME_CATS = ["Sales","Milk Sales","Egg Sales","Animal Sales","Subsidy","Other"];
  const EXPENSE_CATS = ["Feed","Medicine","Labour","Equipment","Transport","Utilities","Veterinary","Other"];
  return (
    <div>
      <PageHeader icon="📒" badge="Bookkeeping" title="Farm" em="Bookkeeping" desc="Track all farm income and expenses with a full financial journal."/>
      <StatStrip stats={[
        { label:"Total Income", value:fmtI(totalIncome), icon:"📈", color:"#52b788" },
        { label:"Total Expenses", value:fmtI(totalExpense), icon:"📉", color:"#e74c3c" },
        { label:"Balance", value:fmtI(balance), icon:"💰", color:balance>=0?"#52b788":"#e74c3c" },
        { label:"This Month", value:fmtI(mIncome-mExpense), icon:"📅", color:mIncome-mExpense>=0?"#52b788":"#e74c3c" },
      ]}/>
      <Btn onClick={()=>setModal(true)} style={{ marginBottom:16 }}>+ Add Entry</Btn>
      {books.length === 0 ? <EmptyState icon="📒" text="No financial records yet. Start logging your farm income and expenses."/> : (
        <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(82,183,136,0.08)",borderRadius:13,overflow:"hidden" }}>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead><tr style={{ borderBottom:"1px solid rgba(82,183,136,0.1)" }}>{["Date","Type","Category","Description","Amount"].map(h=><th key={h} style={{ textAlign:"left",padding:"9px 12px",fontSize:10,fontWeight:600,color:"#4a7060",textTransform:"uppercase",letterSpacing:0.4 }}>{h}</th>)}</tr></thead>
            <tbody>{books.slice(0,30).map(b=>(
              <tr key={b.id} style={{ borderBottom:"1px solid rgba(82,183,136,0.04)" }}>
                <td style={{ padding:"10px 12px",fontSize:12,color:"#f5f0e8" }}>{b.date}</td>
                <td style={{ padding:"10px 12px" }}><span style={{ padding:"3px 9px",borderRadius:10,fontSize:10,fontWeight:600,color:b.type==="income"?"#52b788":"#e74c3c",background:b.type==="income"?"rgba(82,183,136,0.1)":"rgba(192,57,43,0.1)" }}>{b.type}</span></td>
                <td style={{ padding:"10px 12px",fontSize:12,color:"#4a7060" }}>{b.category}</td>
                <td style={{ padding:"10px 12px",fontSize:12,color:"#f5f0e8" }}>{b.description}</td>
                <td style={{ padding:"10px 12px",fontSize:13,fontWeight:600,color:b.type==="income"?"#52b788":"#e74c3c" }}>{b.type==="income"?"+":"-"}{fmtI(b.amount)}</td>
                <td style={{ padding:"10px 12px" }}><button onClick={()=>persist(books.filter(x=>x.id!==b.id))} style={{ background:"none",border:"none",color:"#4a7060",cursor:"pointer",fontSize:12 }}>✕</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <Modal open={modal} onClose={()=>setModal(false)} title="Add Financial Entry" sub="Record income or expense"
        actions={[<button key="c" onClick={()=>setModal(false)} style={{ padding:"8px 15px",background:"transparent",border:"1px solid rgba(82,183,136,0.13)",borderRadius:8,color:"#4a7060",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12 }}>Cancel</button>,<Btn key="s" size="sm" onClick={add}>Save Entry</Btn>]}>
        <div style={{ display:"grid",gap:9 }}>
          <div style={{ display:"flex",gap:9 }}>
            {["income","expense"].map(t=>(
              <button key={t} onClick={()=>setF("type",t)} style={{ flex:1,padding:"9px",border:"1px solid",borderColor:form.type===t?"#52b788":"rgba(82,183,136,0.13)",borderRadius:9,background:form.type===t?"rgba(82,183,136,0.12)":"transparent",color:form.type===t?"#52b788":"#4a7060",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,textTransform:"capitalize" }}>
                {t==="income"?"💹 Income":"💸 Expense"}
              </button>
            ))}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9 }}>
            <Field label="Date"><Inp type="date" value={form.date} onChange={e=>setF("date",e.target.value)}/></Field>
            <Field label="Category"><Sel value={form.category} onChange={e=>setF("category",e.target.value)}>{(form.type==="income"?INCOME_CATS:EXPENSE_CATS).map(c=><option key={c}>{c}</option>)}</Sel></Field>
          </div>
          <Field label="Description *"><Inp value={form.description} onChange={e=>setF("description",e.target.value)} placeholder="e.g. Sold 200 broilers"/></Field>
          <Field label="Amount (KES) *"><Inp type="number" value={form.amount} onChange={e=>setF("amount",e.target.value)} placeholder="0"/></Field>
          <Field label="Notes"><Textarea value={form.notes} onChange={e=>setF("notes",e.target.value)} rows={2}/></Field>
        </div>
      </Modal>
    </div>
  );
}

// ── INVENTORY ──────────────────────────────────────────────
function InventoryPage({ lang }) {
  const [inv, setInv] = useState(DS("inventory"));
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:"",category:"Feed",qty:"",unit:"kg",price:"",alert:"",supplier:"",notes:"" });
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const persist = (list) => { save("inventory",list); setInv(list); };
  const openAdd = () => { setEditing(null); setForm({ name:"",category:"Feed",qty:"",unit:"kg",price:"",alert:"",supplier:"",notes:"" }); setModal(true); };
  const openEdit = (item) => { setEditing(item.id); setForm({...item}); setModal(true); };
  const saveItem = () => { if(!form.name||!form.qty) return; const list=DS("inventory"); if(editing) persist(list.map(x=>x.id===editing?{...x,...form,qty:Number(form.qty),price:Number(form.price)||0,alert:Number(form.alert)||0}:x)); else persist([{ id:uid(),...form,qty:Number(form.qty),price:Number(form.price)||0,alert:Number(form.alert)||0 },...list]); setModal(false); };
  const del = (id) => persist(inv.filter(x=>x.id!==id));
  const lowStock = inv.filter(x => x.alert > 0 && x.qty <= x.alert);
  const CAT_ICON = { Feed:"🌾",Medicine:"💊",Equipment:"🔧",Seeds:"🌱",Chemicals:"🧪",Other:"📦" };
  return (
    <div>
      <PageHeader icon="📦" badge="Inventory" title="Inventory" em="Management" desc="Track all farm supplies, feed, medicine and equipment with low-stock alerts."/>
      {lowStock.length > 0 && <Alert type="warn">⚠️ Low stock: {lowStock.map(x=>x.name).join(", ")}</Alert>}
      <StatStrip stats={[
        { label:"Total Items", value:inv.length, icon:"📦" },
        { label:"Low Stock", value:lowStock.length, icon:"⚠️", color:lowStock.length>0?"#e67e22":"#52b788" },
        { label:"Total Value", value:fmtI(inv.reduce((s,x)=>s+(x.qty*x.price||0),0)), icon:"💰" },
        { label:"Categories", value:new Set(inv.map(x=>x.category)).size, icon:"🏷️" },
      ]}/>
      <Btn onClick={openAdd} style={{ marginBottom:16 }}>+ Add Item</Btn>
      {inv.length === 0 ? <EmptyState icon="📦" text="No inventory items yet. Add your first item to track stock levels."/> : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12 }}>
          {inv.map(x=>(
            <div key={x.id} style={{ background:"rgba(255,255,255,0.03)",border:`1px solid ${x.alert>0&&x.qty<=x.alert?"rgba(230,126,34,0.3)":"rgba(82,183,136,0.1)"}`,borderRadius:14,padding:16 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:22,marginBottom:4 }}>{CAT_ICON[x.category]||"📦"}</div>
                  <div style={{ fontSize:14,fontWeight:600,color:"#f5f0e8" }}>{x.name}</div>
                  <div style={{ fontSize:11,color:"#4a7060" }}>{x.category}{x.supplier?" · "+x.supplier:""}</div>
                </div>
                {x.alert>0&&x.qty<=x.alert&&<span style={{ fontSize:10,padding:"3px 8px",borderRadius:8,background:"rgba(230,126,34,0.1)",color:"#e67e22",fontWeight:600 }}>LOW</span>}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12,fontSize:12 }}>
                <div style={{ color:"#4a7060" }}>Qty: <span style={{ color:"#f5f0e8",fontWeight:600 }}>{fmt(x.qty)} {x.unit}</span></div>
                <div style={{ color:"#4a7060" }}>Value: <span style={{ color:"#f5f0e8" }}>{fmtI(x.qty*x.price)}</span></div>
                {x.alert>0&&<div style={{ color:"#4a7060" }}>Alert at: <span style={{ color:"#e67e22" }}>{x.alert} {x.unit}</span></div>}
                {x.price>0&&<div style={{ color:"#4a7060" }}>Price/unit: <span style={{ color:"#f5f0e8" }}>{fmtI(x.price)}</span></div>}
              </div>
              <div style={{ display:"flex",gap:6 }}>
                <button onClick={()=>openEdit(x)} style={{ flex:1,padding:"6px 9px",background:"rgba(82,183,136,0.1)",border:"1px solid rgba(82,183,136,0.2)",borderRadius:7,color:"#52b788",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Edit</button>
                <button onClick={()=>del(x.id)} style={{ padding:"6px 9px",background:"rgba(192,57,43,0.08)",border:"1px solid rgba(192,57,43,0.18)",borderRadius:7,color:"#e74c3c",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Edit Item":"Add Inventory Item"} sub="Track stock levels and set low-stock alerts"
        actions={[<button key="c" onClick={()=>setModal(false)} style={{ padding:"8px 15px",background:"transparent",border:"1px solid rgba(82,183,136,0.13)",borderRadius:8,color:"#4a7060",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12 }}>Cancel</button>,<Btn key="s" size="sm" onClick={saveItem}>Save</Btn>]}>
        <div style={{ display:"grid",gap:9 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9 }}>
            <Field label="Item Name *"><Inp value={form.name} onChange={e=>setF("name",e.target.value)} placeholder="e.g. Broiler Finisher"/></Field>
            <Field label="Category"><Sel value={form.category} onChange={e=>setF("category",e.target.value)}>{["Feed","Medicine","Equipment","Seeds","Chemicals","Other"].map(c=><option key={c}>{c}</option>)}</Sel></Field>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9 }}>
            <Field label="Quantity *"><Inp type="number" value={form.qty} onChange={e=>setF("qty",e.target.value)}/></Field>
            <Field label="Unit"><Sel value={form.unit} onChange={e=>setF("unit",e.target.value)}>{["kg","L","bags","units","doses","boxes"].map(u=><option key={u}>{u}</option>)}</Sel></Field>
            <Field label="Price/Unit"><Inp type="number" value={form.price} onChange={e=>setF("price",e.target.value)}/></Field>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9 }}>
            <Field label="Low Stock Alert at"><Inp type="number" value={form.alert} onChange={e=>setF("alert",e.target.value)} placeholder="0 = disabled"/></Field>
            <Field label="Supplier"><Inp value={form.supplier} onChange={e=>setF("supplier",e.target.value)} placeholder="Optional"/></Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── SOIL ANALYSER ──────────────────────────────────────────
function SoilPage({ lang }) {
  const [form, setForm] = useState({ soil_type:"Loamy",pH:"",N:"",P:"",K:"",Ca:"",Mg:"",organic:"",previous_crop:"",target_crops:"",region:"" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const analyse = async () => {
    setLoading(true); setResult(null);
    const prompt = `You are an expert soil scientist for East Africa. Analyse this soil test: Type: ${form.soil_type}, pH: ${form.pH||"unknown"}, N: ${form.N||"?"}ppm, P: ${form.P||"?"}ppm, K: ${form.K||"?"}ppm, Ca: ${form.Ca||"?"}ppm, Mg: ${form.Mg||"?"}ppm, Organic Matter: ${form.organic||"?"}%, Previous crop: ${form.previous_crop||"none"}, Target crops: ${form.target_crops||"general"}, Region: ${form.region||"East Africa"}.
Respond ONLY with JSON: { "soil_health": "Excellent/Good/Fair/Poor", "pH_status": "...", "key_deficiencies": ["..."], "fertilizer_plan": { "primary": "...", "secondary": "...", "organic": "..." }, "application_rates": "...", "best_crops": ["..."], "amendments": ["..."], "warnings": ["..."] }`;
    const raw = await callAI([{ role:"user",content:prompt }]);
    try { setResult(JSON.parse(raw.replace(/```json|```/g,"").trim())); } catch { setResult({ soil_health:"Analysed", key_deficiencies:[], fertilizer_plan:{ primary:raw }, best_crops:[], amendments:[], warnings:[] }); }
    setLoading(false);
  };
  return (
    <div>
      <PageHeader icon="🧪" badge="AI Analysis" title="Soil" em="Analyser" desc="Enter your soil test results to get a personalised fertilizer plan."/>
      <Card title="Soil Test Results" icon="🧪">
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:11 }}>
          <Field label="Soil Type"><Sel value={form.soil_type} onChange={e=>setF("soil_type",e.target.value)}>{["Sandy","Loamy","Clay","Silt","Peat","Chalk","Loamy Sand"].map(t=><option key={t}>{t}</option>)}</Sel></Field>
          <Field label="Region"><Inp value={form.region} onChange={e=>setF("region",e.target.value)} placeholder="e.g. Rift Valley, Kenya"/></Field>
          <Field label="pH Level"><Inp type="number" value={form.pH} onChange={e=>setF("pH",e.target.value)} placeholder="e.g. 6.5" step="0.1"/></Field>
          <Field label="Organic Matter %"><Inp type="number" value={form.organic} onChange={e=>setF("organic",e.target.value)} placeholder="e.g. 2.5"/></Field>
          <Field label="Nitrogen (N) ppm"><Inp type="number" value={form.N} onChange={e=>setF("N",e.target.value)}/></Field>
          <Field label="Phosphorus (P) ppm"><Inp type="number" value={form.P} onChange={e=>setF("P",e.target.value)}/></Field>
          <Field label="Potassium (K) ppm"><Inp type="number" value={form.K} onChange={e=>setF("K",e.target.value)}/></Field>
          <Field label="Calcium (Ca) ppm"><Inp type="number" value={form.Ca} onChange={e=>setF("Ca",e.target.value)}/></Field>
          <Field label="Previous Crop"><Inp value={form.previous_crop} onChange={e=>setF("previous_crop",e.target.value)} placeholder="e.g. Maize"/></Field>
          <Field label="Target Crops"><Inp value={form.target_crops} onChange={e=>setF("target_crops",e.target.value)} placeholder="e.g. Tomato, Beans"/></Field>
        </div>
        <Btn full onClick={analyse} disabled={loading} style={{ marginTop:4 }}>{loading?"🤖 Analysing…":"🧪 Analyse & Get Fertilizer Plan"}</Btn>
      </Card>
      {loading && <Spinner/>}
      {result && !loading && (
        <div style={{ animation:"fadeUp 0.4s ease both" }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
            <RBlock title="Soil Health" variant={result.soil_health==="Excellent"||result.soil_health==="Good"?"good":"warn"}>
              <strong style={{ fontSize:18 }}>{result.soil_health}</strong>{result.pH_status&&<div style={{ marginTop:4,fontSize:12,color:"#4a7060" }}>{result.pH_status}</div>}
            </RBlock>
            {result.key_deficiencies?.length>0&&<RBlock title="Key Deficiencies" variant="warn"><ul style={{ listStyle:"none",paddingLeft:0 }}>{result.key_deficiencies.map((d,i)=><li key={i} style={{ paddingLeft:16,position:"relative",fontSize:12,lineHeight:1.6 }}><span style={{ position:"absolute",left:0,color:"#e67e22" }}>→</span>{d}</li>)}</ul></RBlock>}
          </div>
          {result.fertilizer_plan&&<RBlock title="🌱 Fertilizer Plan" variant="good"><strong>Primary:</strong> {result.fertilizer_plan.primary}<br/><strong>Secondary:</strong> {result.fertilizer_plan.secondary}<br/><strong>Organic:</strong> {result.fertilizer_plan.organic}</RBlock>}
          {result.application_rates&&<RBlock title="📏 Application Rates">{result.application_rates}</RBlock>}
          {result.best_crops?.length>0&&<RBlock title="🌾 Best Crops for This Soil"><div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>{result.best_crops.map((c,i)=><span key={i} style={{ padding:"4px 12px",borderRadius:14,background:"rgba(82,183,136,0.1)",border:"1px solid rgba(82,183,136,0.2)",color:"#52b788",fontSize:12 }}>{c}</span>)}</div></RBlock>}
          {result.warnings?.length>0&&<RBlock title="⚠️ Warnings" variant="warn"><ul style={{ listStyle:"none",paddingLeft:0 }}>{result.warnings.map((w,i)=><li key={i} style={{ paddingLeft:16,position:"relative",fontSize:12,lineHeight:1.6 }}><span style={{ position:"absolute",left:0,color:"#e67e22" }}>→</span>{w}</li>)}</ul></RBlock>}
        </div>
      )}
    </div>
  );
}

// ── PLANTING CALENDAR ──────────────────────────────────────
function CalendarPage({ lang }) {
  const [form, setForm] = useState({ region:"", crops:"", season:"Long Rains", soil:"Loamy", farm_size:"", irrigation:false });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const generate = async () => {
    setLoading(true); setResult(null);
    const prompt = `You are an expert agronomist for East Africa. Generate a 12-month planting calendar. Region: ${form.region||"East Africa"}, Crops: ${form.crops||"general"}, Season: ${form.season}, Soil: ${form.soil}, Farm size: ${form.farm_size||"small"}, Irrigation: ${form.irrigation?"Yes":"No"}.
Respond ONLY with JSON: { "overview": "...", "months": [{"month":"Jan","activity":"...","crops":"...","notes":"..."},...], "key_tips": ["..."], "season_outlook": "..." }`;
    const raw = await callAI([{ role:"user",content:prompt }]);
    try { setResult(JSON.parse(raw.replace(/```json|```/g,"").trim())); } catch { setResult({ overview:raw, months:[], key_tips:[], season_outlook:"" }); }
    setLoading(false);
  };
  const MONTH_COLORS = ["#52b788","#2d6a4f","#4a7060","#d4a017","#e67e22","#2e86ab","#52b788","#2d6a4f","#4a7060","#d4a017","#e67e22","#2e86ab"];
  return (
    <div>
      <PageHeader icon="📅" badge="AI Planting" title="Planting" em="Calendar" desc="Get a personalised 12-month AI planting calendar for your region and crops."/>
      <Card title="Your Farm Details" icon="📅">
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:11 }}>
          <Field label="Region / County"><Inp value={form.region} onChange={e=>setF("region",e.target.value)} placeholder="e.g. Kisumu, Kenya"/></Field>
          <Field label="Target Crops"><Inp value={form.crops} onChange={e=>setF("crops",e.target.value)} placeholder="e.g. Maize, Beans, Tomatoes"/></Field>
          <Field label="Season"><Sel value={form.season} onChange={e=>setF("season",e.target.value)}>{["Long Rains (Mar-May)","Short Rains (Oct-Dec)","Dry Season","Year-round Irrigation"].map(s=><option key={s}>{s}</option>)}</Sel></Field>
          <Field label="Soil Type"><Sel value={form.soil} onChange={e=>setF("soil",e.target.value)}>{["Sandy","Loamy","Clay","Silt","Mixed"].map(s=><option key={s}>{s}</option>)}</Sel></Field>
          <Field label="Farm Size"><Inp value={form.farm_size} onChange={e=>setF("farm_size",e.target.value)} placeholder="e.g. 2 acres"/></Field>
          <Field label="Has Irrigation?"><div style={{ display:"flex",gap:11,alignItems:"center",height:44 }}><input type="checkbox" checked={form.irrigation} onChange={e=>setF("irrigation",e.target.checked)} style={{ width:18,height:18,accentColor:"#52b788" }}/><span style={{ fontSize:13,color:"#4a7060" }}>Yes, I have irrigation</span></div></Field>
        </div>
        <Btn full onClick={generate} disabled={loading} style={{ marginTop:4 }}>{loading?"🤖 Generating…":"📅 Generate 12-Month Calendar"}</Btn>
      </Card>
      {loading && <Spinner/>}
      {result && !loading && (
        <div style={{ animation:"fadeUp 0.4s ease both" }}>
          {result.overview && <RBlock title="📋 Overview" variant="good">{result.overview}</RBlock>}
          {result.months?.length > 0 && (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10,marginBottom:14 }}>
              {result.months.map((m,i) => (
                <div key={i} style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(82,183,136,0.1)",borderRadius:13,padding:14,borderTop:`3px solid ${MONTH_COLORS[i%12]}` }}>
                  <div style={{ fontSize:11,fontWeight:700,color:MONTH_COLORS[i%12],textTransform:"uppercase",letterSpacing:0.5,marginBottom:6 }}>{m.month}</div>
                  <div style={{ fontSize:12,fontWeight:600,color:"#f5f0e8",marginBottom:4 }}>{m.activity}</div>
                  {m.crops && <div style={{ fontSize:11,color:"#52b788",marginBottom:4 }}>🌱 {m.crops}</div>}
                  {m.notes && <div style={{ fontSize:11,color:"#4a7060",lineHeight:1.4 }}>{m.notes}</div>}
                </div>
              ))}
            </div>
          )}
          {result.key_tips?.length>0&&<RBlock title="💡 Key Tips"><ul style={{ listStyle:"none",paddingLeft:0 }}>{result.key_tips.map((t,i)=><li key={i} style={{ paddingLeft:16,position:"relative",fontSize:12,lineHeight:1.6,marginBottom:4 }}><span style={{ position:"absolute",left:0,color:"#52b788" }}>→</span>{t}</li>)}</ul></RBlock>}
          {result.season_outlook&&<RBlock title="🌤️ Season Outlook" variant="gold">{result.season_outlook}</RBlock>}
        </div>
      )}
    </div>
  );
}

// ── WEATHER ADVISOR ────────────────────────────────────────
function WeatherPage({ lang }) {
  const [form, setForm] = useState({ region:"", crops:"", season:"Long Rains", concern:"" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const advise = async () => {
    setLoading(true); setResult(null);
    const prompt = `You are an expert agronomist for East Africa providing weather-based farming advice. Region: ${form.region||"East Africa"}, Crops/Livestock: ${form.crops||"general"}, Season: ${form.season}, Concern: ${form.concern||"general advice"}.
Respond ONLY with JSON: { "forecast_summary": "...", "risk_level": "Low/Medium/High/Critical", "farming_advice": ["..."], "irrigation_advice": "...", "pest_risk": "...", "market_timing": "...", "action_items": ["..."] }`;
    const raw = await callAI([{ role:"user",content:prompt }]);
    try { setResult(JSON.parse(raw.replace(/```json|```/g,"").trim())); } catch { setResult({ forecast_summary:raw, risk_level:"—", farming_advice:[], action_items:[] }); }
    setLoading(false);
  };
  const RISK_VARIANT = { Low:"good", Medium:"warn", High:"danger", Critical:"danger" };
  return (
    <div>
      <PageHeader icon="🌤️" badge="AI Weather" title="Weather" em="Advisor" desc="Get AI-powered seasonal farming advice based on your region and crops."/>
      <Card title="Your Location & Context" icon="🌤️">
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:11 }}>
          <Field label="Region / County"><Inp value={form.region} onChange={e=>setF("region",e.target.value)} placeholder="e.g. Nakuru, Kenya"/></Field>
          <Field label="Crops / Livestock"><Inp value={form.crops} onChange={e=>setF("crops",e.target.value)} placeholder="e.g. Maize, Dairy Cows"/></Field>
          <Field label="Season"><Sel value={form.season} onChange={e=>setF("season",e.target.value)}>{["Long Rains (Mar-May)","Short Rains (Oct-Dec)","Dry Season Jan-Feb","Dry Season Jun-Sep"].map(s=><option key={s}>{s}</option>)}</Sel></Field>
          <Field label="Specific Concern"><Inp value={form.concern} onChange={e=>setF("concern",e.target.value)} placeholder="e.g. worried about drought"/></Field>
        </div>
        <Btn full onClick={advise} disabled={loading} style={{ marginTop:4 }}>{loading?"🤖 Advising…":"🌤️ Get Weather Advice"}</Btn>
      </Card>
      {loading && <Spinner/>}
      {result && !loading && (
        <div style={{ animation:"fadeUp 0.4s ease both" }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
            <RBlock title="Forecast Summary" variant={RISK_VARIANT[result.risk_level]||"default"}>{result.forecast_summary}</RBlock>
            <RBlock title="Risk Level" variant={RISK_VARIANT[result.risk_level]||"default"}><strong style={{ fontSize:22 }}>{result.risk_level}</strong></RBlock>
          </div>
          {result.farming_advice?.length>0&&<RBlock title="🌱 Farming Advice"><ul style={{ listStyle:"none",paddingLeft:0 }}>{result.farming_advice.map((a,i)=><li key={i} style={{ paddingLeft:16,position:"relative",fontSize:12,lineHeight:1.6,marginBottom:4 }}><span style={{ position:"absolute",left:0,color:"#52b788" }}>→</span>{a}</li>)}</ul></RBlock>}
          {result.irrigation_advice&&<RBlock title="💧 Irrigation Advice" variant="gold">{result.irrigation_advice}</RBlock>}
          {result.pest_risk&&<RBlock title="🐛 Pest Risk" variant="warn">{result.pest_risk}</RBlock>}
          {result.market_timing&&<RBlock title="🏪 Market Timing">{result.market_timing}</RBlock>}
          {result.action_items?.length>0&&<RBlock title="⚡ Action Items" variant="warn"><ul style={{ listStyle:"none",paddingLeft:0 }}>{result.action_items.map((a,i)=><li key={i} style={{ paddingLeft:16,position:"relative",fontSize:12,lineHeight:1.6,marginBottom:4 }}><span style={{ position:"absolute",left:0,color:"#e67e22" }}>→</span>{a}</li>)}</ul></RBlock>}
        </div>
      )}
    </div>
  );
}

// ── GENERIC AI PAGE BUILDER ────────────────────────────────
function GenericAIPage({ id, lang }) {
  const configs = {
    feed: { icon:"🌾", badge:"Feed Calculator", title:"Feed", em:"Calculator", desc:"Get optimised feed formulas and cost calculations for your livestock.", fields:[{k:"animal_type",l:"Animal Type",type:"sel",opts:["Broiler","Layer","Dairy Cow","Goat","Beef Cattle","Pig","Rabbit"]},{k:"age",l:"Age/Stage",p:"e.g. 4 weeks or Finisher"},{k:"count",l:"Number of Animals",p:"e.g. 500",t:"number"},{k:"region",l:"Your Region",p:"e.g. Kisumu, Kenya"},{k:"budget",l:"Budget Constraint",p:"e.g. low cost, standard"}], prompt: (f)=>`You are an expert animal nutritionist for East Africa. Optimise feed for: Animal: ${f.animal_type||"Broiler"}, Age: ${f.age||"unknown"}, Count: ${f.count||"100"}, Region: ${f.region||"East Africa"}, Budget: ${f.budget||"standard"}. Respond ONLY with JSON: { "formula": [{"ingredient":"...","qty_per_100kg":"...","cost_estimate":"..."}], "total_cost_estimate":"...", "daily_ration_per_animal":"...", "key_nutrients":"...", "tips":["..."], "local_alternatives":["..."] }` },
    profit: { icon:"💰", badge:"Profit Tracker", title:"Profit", em:"Tracker", desc:"Calculate profit, loss and ROI for your farm batches.", fields:[{k:"animal_type",l:"Animal/Crop",p:"e.g. Broiler Chicken"},{k:"count",l:"Count/Quantity",p:"e.g. 500 birds",t:"number"},{k:"purchase_cost",l:"Total Purchase/Input Cost",p:"0",t:"number"},{k:"feed_cost",l:"Total Feed Cost",p:"0",t:"number"},{k:"other_costs",l:"Other Costs (med, labour)",p:"0",t:"number"},{k:"revenue",l:"Total Revenue (sales)",p:"0",t:"number"},{k:"duration",l:"Duration (days)",p:"e.g. 45 days"}], prompt: (f)=>`You are a farm financial analyst. Analyse: Animal: ${f.animal_type||"Broiler"}, Count: ${f.count||100}, Purchase: ${f.purchase_cost||0}, Feed: ${f.feed_cost||0}, Other costs: ${f.other_costs||0}, Revenue: ${f.revenue||0}, Duration: ${f.duration||"45 days"}. Total cost = ${(Number(f.purchase_cost||0)+Number(f.feed_cost||0)+Number(f.other_costs||0))}. Profit = ${Number(f.revenue||0)-(Number(f.purchase_cost||0)+Number(f.feed_cost||0)+Number(f.other_costs||0))}. Respond ONLY with JSON: { "total_cost": "...", "gross_profit": "...", "net_profit": "...", "roi_percent": "...", "profit_per_unit": "...", "breakeven": "...", "performance": "Excellent/Good/Fair/Poor", "improvements": ["..."], "benchmarks": "..." }` },
    loan: { icon:"💳", badge:"Loan Calculator", title:"Loan", em:"Calculator", desc:"Calculate loan repayment schedules and total interest.", fields:[{k:"amount",l:"Loan Amount",p:"e.g. 100000",t:"number"},{k:"rate",l:"Annual Interest Rate (%)",p:"e.g. 14",t:"number"},{k:"months",l:"Repayment Period (months)",p:"e.g. 24",t:"number"},{k:"purpose",l:"Loan Purpose",p:"e.g. Poultry expansion"}], prompt: (f)=>`Calculate loan: Amount: ${f.amount||100000}, Rate: ${f.rate||14}% per annum, Period: ${f.months||12} months, Purpose: ${f.purpose||"farming"}. Respond ONLY with JSON: { "monthly_payment": "...", "total_repayment": "...", "total_interest": "...", "effective_rate": "...", "schedule": [{"month":1,"payment":"...","principal":"...","interest":"...","balance":"..."},{"month":3,"payment":"...","principal":"...","interest":"...","balance":"..."},{"month":6,"payment":"...","principal":"...","interest":"...","balance":"..."}], "advice": "...", "warnings": ["..."] }` },
    insurance: { icon:"🛡️", badge:"Insurance Calc", title:"Insurance", em:"Calculator", desc:"Estimate farm insurance coverage needs and premium costs.", fields:[{k:"farm_type",l:"Farm Type",type:"sel",opts:["Poultry","Dairy","Crops","Mixed","Aquaculture"]},{k:"assets",l:"Total Asset Value",p:"e.g. 500000",t:"number"},{k:"location",l:"Location/Region",p:"e.g. Nakuru"},{k:"risk",l:"Main Risk Concern",p:"e.g. drought, disease"}], prompt: (f)=>`You are an agricultural insurance expert for East Africa. Farm: ${f.farm_type||"Mixed"}, Asset value: ${f.assets||"500000"}, Location: ${f.location||"Kenya"}, Risk: ${f.risk||"general"}. Respond ONLY with JSON: { "recommended_coverage": "...", "estimated_premium_monthly": "...", "estimated_premium_annual": "...", "coverage_types": ["..."], "tips": ["..."], "providers": ["..."] }` },
    subsidy: { icon:"🏛️", badge:"Subsidy Finder", title:"Subsidy", em:"Finder", desc:"Find government grants, subsidies and support programmes available to you.", fields:[{k:"country",l:"Country",type:"sel",opts:["Kenya","Uganda","Tanzania","Rwanda","Ethiopia","Ghana","Nigeria","South Africa","Other"]},{k:"farm_type",l:"Farm Type",p:"e.g. Poultry, Dairy, Crops"},{k:"farm_size",l:"Farm Size",p:"e.g. 5 acres"},{k:"category",l:"Farmer Category",type:"sel",opts:["Smallholder","Commercial","Cooperative","Youth Farmer","Women Farmer"]}], prompt: (f)=>`You are an agricultural policy expert. Find subsidies for: Country: ${f.country||"Kenya"}, Farm: ${f.farm_type||"mixed"}, Size: ${f.farm_size||"small"}, Category: ${f.category||"Smallholder"}. Respond ONLY with JSON: { "programs": [{"name":"...","description":"...","benefit":"...","eligibility":"...","how_to_apply":"..."}], "total_available_value": "...", "best_for_you": "...", "tips": ["..."] }` },
    reports: { icon:"📈", badge:"AI Reports", title:"Farm", em:"Reports", desc:"Generate comprehensive AI-powered farm performance reports.", fields:[{k:"farm_name",l:"Farm Name",p:"e.g. Green Valley Farm"},{k:"period",l:"Report Period",type:"sel",opts:["This Month","Last Quarter","This Year","Full Season"]},{k:"focus",l:"Report Focus",type:"sel",opts:["Financial Performance","Animal Health","Production Yield","All Areas"]},{k:"goals",l:"Key Goals",p:"e.g. reduce costs, improve yield"}], prompt: (f)=>{
      const books=DS("books"); const animals=DS("animals"); const tasks=DS("tasks");
      const income=books.filter(b=>b.type==="income").reduce((s,b)=>s+b.amount,0);
      const exp=books.filter(b=>b.type==="expense").reduce((s,b)=>s+b.amount,0);
      return `Generate a farm report. Farm: ${f.farm_name||"AgriLogic Farm"}, Period: ${f.period||"This Month"}, Focus: ${f.focus||"All Areas"}, Goals: ${f.goals||"improve performance"}. Data: Total income: ${income}, Total expenses: ${exp}, Animals: ${animals.length}, Pending tasks: ${tasks.filter(t=>!t.done).length}. Respond ONLY with JSON: { "executive_summary": "...", "financial_health": "Excellent/Good/Fair/Poor", "key_achievements": ["..."], "key_concerns": ["..."], "recommendations": ["..."], "next_steps": ["..."], "kpis": [{"name":"...","value":"...","trend":"↑↓→"}] }`;
    }},
    eggs: { icon:"🥚", badge:"Egg Tracker", title:"Egg", em:"Tracker", desc:"Track daily egg collection, laying rates and flock performance.", fields:[{k:"date",l:"Date",t:"date",p:today()},{k:"flock_id",l:"Flock / Pen ID",p:"e.g. PEN-A"},{k:"flock_size",l:"Flock Size",p:"e.g. 500",t:"number"},{k:"eggs",l:"Eggs Collected",p:"0",t:"number"},{k:"broken",l:"Broken/Rejected",p:"0",t:"number"},{k:"feed_kg",l:"Feed Used (kg)",p:"0",t:"number"},{k:"price",l:"Sale Price / Egg",p:"0",t:"number"}], prompt: ()=>"" },
    breeding: { icon:"🐣", badge:"Breeding Tracker", title:"Breeding", em:"Tracker", desc:"Record breeding events, pregnancies and birth outcomes.", fields:[{k:"date",l:"Date",t:"date",p:today()},{k:"animal_id",l:"Animal ID",p:"e.g. COW001"},{k:"method",l:"Method",type:"sel",opts:["Natural Mating","AI (Artificial Insemination)","Crossbreeding","Other"]},{k:"male_id",l:"Sire / Male ID",p:"Optional"},{k:"expected",l:"Expected Birth Date",t:"date",p:""},{k:"outcome",l:"Outcome",type:"sel",opts:["Bred","Confirmed Pregnant","Birthed - Success","Birthed - Complications","Aborted","Not Pregnant"]}], prompt: ()=>"" },
    weight: { icon:"⚖️", badge:"Weight Tracker", title:"Weight", em:"Tracker", desc:"Track animal growth curves and monitor weight gain per batch.", fields:[{k:"date",l:"Date",t:"date",p:today()},{k:"animal_id",l:"Animal ID / Batch",p:"e.g. BATCH-01"},{k:"animal_type",l:"Animal Type",type:"sel",opts:["Broiler","Bull","Dairy Cow","Goat","Sheep","Pig","Other"]},{k:"weight",l:"Weight (kg)",p:"e.g. 2.5",t:"number"},{k:"age_days",l:"Age (days)",p:"e.g. 35",t:"number"},{k:"count",l:"Number in Batch",p:"e.g. 500",t:"number"}], prompt: ()=>"" },
    labour: { icon:"👷", badge:"Labour Tracker", title:"Labour", em:"Tracker", desc:"Track employee hours, tasks and payroll for your farm workers.", fields:[{k:"date",l:"Date",t:"date",p:today()},{k:"worker",l:"Worker Name",p:"e.g. John Mwangi"},{k:"hours",l:"Hours Worked",p:"8",t:"number"},{k:"task",l:"Task Performed",p:"e.g. Feeding, cleaning"},{k:"wage",l:"Daily Wage",p:"500",t:"number"},{k:"notes",l:"Notes",p:"Optional"}], prompt: ()=>"" },
    land: { icon:"🗺️", badge:"Land Manager", title:"Land", em:"Manager", desc:"Register and manage your farm land parcels.", fields:[{k:"name",l:"Parcel Name",p:"e.g. North Field"},{k:"size",l:"Size (acres)",p:"e.g. 2.5",t:"number"},{k:"location",l:"Location",p:"e.g. GPS or description"},{k:"soil",l:"Soil Type",type:"sel",opts:["Sandy","Loamy","Clay","Mixed"]},{k:"use",l:"Current Use",p:"e.g. Maize, Pasture"},{k:"notes",l:"Notes",p:"Optional"}], prompt: ()=>"" },
    water: { icon:"💧", badge:"Water Tracker", title:"Water", em:"Tracker", desc:"Log irrigation water usage and get efficiency advice.", fields:[{k:"date",l:"Date",t:"date",p:today()},{k:"crop",l:"Crop / Area",p:"e.g. Maize field, North"},{k:"method",l:"Irrigation Method",type:"sel",opts:["Drip","Sprinkler","Flood","Furrow","Manual"]},{k:"duration",l:"Duration (minutes)",p:"60",t:"number"},{k:"litres",l:"Water Used (litres)",p:"0",t:"number"},{k:"stage",l:"Crop Stage",p:"e.g. Flowering"}], prompt: ()=>"" },
    market: { icon:"🏪", badge:"Marketplace", title:"Farm", em:"Marketplace", desc:"List farm produce for sale and find supply connections.", fields:[{k:"product",l:"Product",p:"e.g. 200 broilers"},{k:"quantity",l:"Quantity",p:"e.g. 200 kg"},{k:"price",l:"Asking Price",p:"e.g. 350/kg",t:"number"},{k:"location",l:"Your Location",p:"e.g. Nakuru Market"},{k:"contact",l:"Contact Number",p:"e.g. 0712345678"},{k:"notes",l:"Additional Info",p:"e.g. Fresh, Grade A"}], prompt: ()=>"" },
    vets: { icon:"🏥", badge:"Vet Directory", title:"Vet", em:"Directory", desc:"Manage your veterinary contacts and visit history.", fields:[{k:"name",l:"Vet Name",p:"e.g. Dr. Jane Wanjiku"},{k:"phone",l:"Phone Number",p:"e.g. 0712345678"},{k:"location",l:"Location",p:"e.g. Nakuru Town"},{k:"specialty",l:"Specialty",type:"sel",opts:["Poultry","Large Animals","Small Animals","Aquaculture","General"]},{k:"date",l:"Last Visit Date",t:"date",p:today()},{k:"notes",l:"Notes",p:"e.g. Recommend for vaccinations"}], prompt: ()=>"" },
    suppliers: { icon:"🏬", badge:"Suppliers", title:"Farm", em:"Suppliers", desc:"Maintain your list of feed, medicine and equipment suppliers.", fields:[{k:"name",l:"Supplier Name",p:"e.g. AgroVet Nakuru"},{k:"category",l:"Category",type:"sel",opts:["Feed","Medicine","Equipment","Seeds","Chemicals","General"]},{k:"contact",l:"Contact",p:"e.g. 0712345678"},{k:"location",l:"Location",p:"e.g. Nakuru Town"},{k:"rating",l:"Rating",type:"sel",opts:["★★★★★","★★★★","★★★","★★","★"]},{k:"notes",l:"Notes",p:"e.g. Bulk discounts available"}], prompt: ()=>"" },
    analytics: { icon:"📊", badge:"Analytics", title:"Farm", em:"Analytics", desc:"View comprehensive farm performance analytics and insights.", fields:[{k:"period",l:"Analysis Period",type:"sel",opts:["This Month","Last 3 Months","This Year","All Time"]},{k:"focus",l:"Focus Area",type:"sel",opts:["Financial","Production","Animals","All"]}], prompt: (f)=>{
      const books=DS("books"); const animals=DS("animals");
      const income=books.filter(b=>b.type==="income").reduce((s,b)=>s+b.amount,0);
      const exp=books.filter(b=>b.type==="expense").reduce((s,b)=>s+b.amount,0);
      return `Analyse farm data. Period: ${f.period||"All Time"}, Focus: ${f.focus||"All"}. Income: ${income}, Expenses: ${exp}, Net: ${income-exp}, Animals: ${animals.length}. Give insights. Respond ONLY with JSON: { "performance_score": "1-100", "strengths": ["..."], "weaknesses": ["..."], "opportunities": ["..."], "key_metrics": [{"name":"...","value":"...","status":"good/warn/bad"}], "recommendations": ["..."] }`;
    }},
  };

  const conf = configs[id];
  if (!conf) return <div style={{ padding:40,color:"#4a7060",textAlign:"center" }}>Page coming soon: {id}</div>;

  const storageKey = id;
  const [records, setRecords] = useState(DS(storageKey));
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));

  const hasAI = !!conf.prompt && conf.prompt({}) !== "";

  const add = () => {
    const nonEmpty = conf.fields.filter(f=>f.k!=="notes"&&f.k!=="date"&&f.k!=="expected");
    if (!nonEmpty.length || Object.values(form).filter(v=>v).length === 0) return;
    const list = [{ id:uid(), ...form }, ...DS(storageKey)];
    save(storageKey, list); setRecords(list);
    setForm({});
  };

  const del = (id) => { const l=records.filter(r=>r.id!==id); save(storageKey,l); setRecords(l); };

  const generate = async () => {
    if (!hasAI) return;
    setLoading(true); setResult(null);
    const raw = await callAI([{ role:"user",content:conf.prompt(form) }]);
    try { setResult(JSON.parse(raw.replace(/```json|```/g,"").trim())); }
    catch { setResult({ summary:raw }); }
    setLoading(false);
  };

  return (
    <div>
      <PageHeader icon={conf.icon} badge={conf.badge} title={conf.title} em={conf.em} desc={conf.desc}/>
      <Card title={`Log ${conf.title} ${conf.em}`} icon={conf.icon}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:11 }}>
          {conf.fields.map(f=>(
            <Field key={f.k} label={f.l}>
              {f.type==="sel" ? <Sel value={form[f.k]||""} onChange={e=>setF(f.k,e.target.value)}>{!f.opts?.includes("")&&<option value="">Select…</option>}{f.opts?.map(o=><option key={o}>{o}</option>)}</Sel>
                : <Inp type={f.t||"text"} value={form[f.k]||""} onChange={e=>setF(f.k,e.target.value)} placeholder={f.p}/>}
            </Field>
          ))}
        </div>
        <div style={{ display:"flex",gap:9,marginTop:4 }}>
          <Btn onClick={add} style={{ flex:1 }}>+ Save Record</Btn>
          {hasAI && <Btn variant="gold" onClick={generate} disabled={loading}>{loading?"🤖 Analysing…":"🤖 AI Analysis"}</Btn>}
        </div>
      </Card>

      {loading && <Spinner/>}

      {result && !loading && (
        <div style={{ animation:"fadeUp 0.4s ease both" }}>
          {Object.entries(result).map(([key,val])=>{
            if (!val || (Array.isArray(val)&&!val.length)) return null;
            const title = key.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());
            return (
              <RBlock key={key} title={title} variant={key.includes("concern")||key.includes("warning")||key.includes("weak")?"warn":key.includes("achiev")||key.includes("strength")||key.includes("good")?"good":"default"}>
                {Array.isArray(val)
                  ? typeof val[0]==="object"
                    ? <div style={{ overflowX:"auto" }}><table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}><tbody>{val.map((row,i)=><tr key={i}>{Object.values(row).map((c,j)=><td key={j} style={{ padding:"6px 10px",borderBottom:"1px solid rgba(82,183,136,0.06)",color:"#f5f0e8" }}>{String(c)}</td>)}</tr>)}</tbody></table></div>
                    : <ul style={{ listStyle:"none",paddingLeft:0 }}>{val.map((v,i)=><li key={i} style={{ paddingLeft:16,position:"relative",fontSize:12,lineHeight:1.6,marginBottom:4 }}><span style={{ position:"absolute",left:0,color:"#52b788" }}>→</span>{v}</li>)}</ul>
                  : typeof val==="object"
                    ? Object.entries(val).map(([k,v])=><div key={k} style={{ fontSize:12,marginBottom:4 }}><strong style={{ color:"#52b788" }}>{k.replace(/_/g," ")}: </strong>{String(v)}</div>)
                    : String(val)
                }
              </RBlock>
            );
          })}
        </div>
      )}

      {records.length > 0 && (
        <div style={{ marginTop:20 }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:12,color:"#f5f0e8" }}>Recent Records</h3>
          <div style={{ display:"grid",gap:7 }}>
            {records.slice(0,10).map(r=>(
              <div key={r.id} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(82,183,136,0.08)",borderRadius:11,padding:"12px 15px",display:"flex",alignItems:"center",gap:11 }}>
                <div style={{ width:36,height:36,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,background:"rgba(82,183,136,0.08)" }}>{conf.icon}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:12,fontWeight:500,color:"#f5f0e8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                    {Object.values(r).filter(v=>typeof v==="string"||typeof v==="number").slice(1,4).join(" · ")}
                  </div>
                  <div style={{ fontSize:10,color:"#4a7060",marginTop:1 }}>{r.date||r.id}</div>
                </div>
                <button onClick={()=>del(r.id)} style={{ background:"none",border:"none",color:"#4a7060",cursor:"pointer",fontSize:14,flexShrink:0 }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  FARM PROFILE MODAL
// ─────────────────────────────────────────────────────────
function FarmModal({ open, onClose }) {
  const [form, setForm] = useState(getProfile());
  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const save_ = () => { saveProfile(form); onClose(); };
  return (
    <Modal open={open} onClose={onClose} title="My Farm Profile" sub="Helps AI give personalised advice for your farm."
      actions={[<button key="c" onClick={onClose} style={{ padding:"8px 15px",background:"transparent",border:"1px solid rgba(82,183,136,0.13)",borderRadius:8,color:"#4a7060",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12 }}>Cancel</button>,<Btn key="s" size="sm" onClick={save_}>Save Profile</Btn>]}>
      <div style={{ display:"grid",gap:9 }}>
        <Field label="Farm Name"><Inp value={form.name||""} onChange={e=>setF("name",e.target.value)} placeholder="e.g. Green Valley Farm"/></Field>
        <Field label="Location"><Inp value={form.location||""} onChange={e=>setF("location",e.target.value)} placeholder="e.g. Nakuru, Kenya"/></Field>
        <Field label="Main Livestock"><Sel value={form.animal||""} onChange={e=>setF("animal",e.target.value)}><option value="">Select…</option>{["Broiler Chicken","Layer Chickens","Dairy Cows","Beef Cattle","Goats","Sheep","Tilapia","Catfish","Mixed"].map(a=><option key={a}>{a}</option>)}</Sel></Field>
        <Field label="Main Crops"><Inp value={form.crops||""} onChange={e=>setF("crops",e.target.value)} placeholder="e.g. Maize, Beans"/></Field>
        <Field label="Farm Size"><Inp value={form.size||""} onChange={e=>setF("size",e.target.value)} placeholder="e.g. 5 acres"/></Field>
        <Field label="Experience"><Sel value={form.exp||""} onChange={e=>setF("exp",e.target.value)}><option value="">Select…</option>{["Beginner (0-2 years)","Intermediate (3-7 years)","Experienced (7+ years)"].map(e=><option key={e}>{e}</option>)}</Sel></Field>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dash");
  const [lang, setLang] = useState(() => localStorage.getItem("al_lang") || "en");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [farmModal, setFarmModal] = useState(false);

  const changeLang = (l) => { setLang(l); localStorage.setItem("al_lang",l); };
  const profile = getProfile();

  const renderPage = () => {
    const props = { lang, setPage };
    if (page === "dash") return <DashPage {...props}/>;
    if (page === "advisor") return <AdvisorPage {...props}/>;
    if (page === "diagnosis") return <DiagnosisPage {...props}/>;
    if (page === "animals") return <AnimalsPage {...props}/>;
    if (page === "milk") return <MilkPage {...props}/>;
    if (page === "tasks") return <TasksPage {...props}/>;
    if (page === "books") return <BooksPage {...props}/>;
    if (page === "inventory") return <InventoryPage {...props}/>;
    if (page === "soil") return <SoilPage {...props}/>;
    if (page === "calendar") return <CalendarPage {...props}/>;
    if (page === "weather") return <WeatherPage {...props}/>;
    return <GenericAIPage id={page} lang={lang}/>;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        html,body,#root { height:100%; overflow:hidden; }
        body { font-family:'DM Sans',sans-serif; background:#0e1a12; color:#f5f0e8; }
        body::before { content:''; position:fixed; inset:0; background:radial-gradient(ellipse 70% 50% at 15% 10%,rgba(82,183,136,0.07) 0%,transparent 55%),radial-gradient(ellipse 50% 40% at 85% 85%,rgba(212,160,23,0.05) 0%,transparent 55%); pointer-events:none; z-index:0; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(82,183,136,0.18); border-radius:2px; }
        select option { background:#0e1a12; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
      `}</style>

      <div style={{ height:"100%",display:"flex",flexDirection:"column",position:"relative",zIndex:5 }}>
        {/* TOPBAR */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",height:54,borderBottom:"1px solid rgba(82,183,136,0.1)",background:"rgba(14,26,18,0.98)",backdropFilter:"blur(16px)",flexShrink:0,position:"relative",zIndex:50 }}>
          <div onClick={()=>setPage("dash")} style={{ display:"flex",alignItems:"center",gap:9,cursor:"pointer",textDecoration:"none" }}>
            <div style={{ width:32,height:32,background:"linear-gradient(135deg,#52b788,#d4a017)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15 }}>🌿</div>
            <div style={{ fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,color:"#f5f0e8" }}>Agri<span style={{ color:"#52b788" }}>Logic</span></div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ display:"flex",gap:3,background:"rgba(255,255,255,0.04)",borderRadius:7,padding:3 }}>
              {LANGS.map(l=>(
                <button key={l.c} onClick={()=>changeLang(l.c)} style={{ padding:"4px 10px",border:"none",borderRadius:5,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,cursor:"pointer",transition:"all 0.2s",background:lang===l.c?"#52b788":"transparent",color:lang===l.c?"#1a3a2a":"#4a7060" }}>
                  {l.l}
                </button>
              ))}
            </div>
            <button onClick={()=>setSidebarOpen(o=>!o)} style={{ background:"transparent",border:"none",color:"#f5f0e8",fontSize:20,cursor:"pointer",padding:4,display:"none" }} className="menu-toggle">
              ☰
            </button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ display:"flex",flex:1,overflow:"hidden",position:"relative",zIndex:5 }}>
          {/* SIDEBAR OVERLAY */}
          {sidebarOpen && <div onClick={()=>setSidebarOpen(false)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:90 }}/>}

          {/* SIDEBAR */}
          <div style={{ width:220,flexShrink:0,background:"rgba(20,30,22,0.98)",borderRight:"1px solid rgba(82,183,136,0.1)",display:"flex",flexDirection:"column",overflowY:"auto",transition:"transform 0.3s" }}>
            {SECTIONS.map(sec=>(
              <div key={sec} style={{ padding:"12px 10px 6px" }}>
                <div style={{ fontSize:9,fontWeight:700,color:"#4a7060",textTransform:"uppercase",letterSpacing:0.7,padding:"0 8px",marginBottom:4 }}>{T(sec,lang)}</div>
                {NAV.filter(n=>n.section===sec).map(n=>(
                  <a key={n.id} onClick={e=>{e.preventDefault();setPage(n.id);setSidebarOpen(false)}} href="#"
                    style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:9,cursor:"pointer",transition:"all 0.2s",border:"none",background:page===n.id?"rgba(82,183,136,0.12)":"transparent",width:"100%",textAlign:"left",fontFamily:"'DM Sans',sans-serif",color:page===n.id?"#52b788":"#4a7060",fontSize:12,fontWeight:500,position:"relative",textDecoration:"none" }}>
                    {page===n.id && <span style={{ position:"absolute",left:0,top:"25%",height:"50%",width:2,background:"#52b788",borderRadius:"0 2px 2px 0" }}/>}
                    <span style={{ fontSize:14,flexShrink:0 }}>{n.icon}</span>
                    <span>{T(n.id,lang)}</span>
                    {n.badge && <span style={{ fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:8,background:"rgba(82,183,136,0.15)",color:"#52b788",marginLeft:"auto" }}>{n.badge}</span>}
                  </a>
                ))}
              </div>
            ))}
            <div style={{ height:1,background:"rgba(82,183,136,0.1)",margin:"5px 10px" }}/>
            <div style={{ margin:10,background:"rgba(82,183,136,0.06)",border:"1px solid rgba(82,183,136,0.12)",borderRadius:11,padding:12 }}>
              <div style={{ fontSize:10,fontWeight:700,color:"#52b788",textTransform:"uppercase",letterSpacing:0.4,marginBottom:7 }}>{T("myFarm",lang)}</div>
              {profile.name&&<div style={{ fontSize:11,color:"#4a7060",marginBottom:3 }}>🏠 <span style={{ color:"#f5f0e8" }}>{profile.name}</span></div>}
              {profile.location&&<div style={{ fontSize:11,color:"#4a7060",marginBottom:3 }}>📍 <span style={{ color:"#f5f0e8" }}>{profile.location}</span></div>}
              {profile.animal&&<div style={{ fontSize:11,color:"#4a7060",marginBottom:3 }}>🐾 <span style={{ color:"#f5f0e8" }}>{profile.animal}</span></div>}
              {profile.crops&&<div style={{ fontSize:11,color:"#4a7060",marginBottom:3 }}>🌾 <span style={{ color:"#f5f0e8" }}>{profile.crops}</span></div>}
              {!profile.name&&!profile.location&&<div style={{ fontSize:11,color:"#4a7060" }}>{T("noFarm",lang)}</div>}
              <button onClick={()=>setFarmModal(true)} style={{ marginTop:8,width:"100%",padding:6,background:"transparent",border:"1px dashed rgba(82,183,136,0.22)",borderRadius:7,color:"#4a7060",fontFamily:"'DM Sans',sans-serif",fontSize:10,cursor:"pointer",transition:"all 0.2s" }}
                onMouseEnter={e=>{e.target.style.borderColor="#52b788";e.target.style.color="#52b788"}}
                onMouseLeave={e=>{e.target.style.borderColor="rgba(82,183,136,0.22)";e.target.style.color="#4a7060"}}>
                {T("editFarm",lang)}
              </button>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={{ flex:1,overflowY:"auto",overflowX:"hidden",position:"relative" }}>
            <div key={page} style={{ padding:26,minHeight:"100%",animation:"fadeUp 0.35s ease both" }}>
              {renderPage()}
            </div>
          </div>
        </div>
      </div>

      <FarmModal open={farmModal} onClose={()=>setFarmModal(false)}/>
    </>
  );
}
