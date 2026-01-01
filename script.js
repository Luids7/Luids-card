/* =========================
   ✅ 0) 你的設定（只要改這裡）
========================= */

// 1) Discord 使用者 ID（不是邀請碼！）
// 把這行換成你的數字 ID，例如： "123456789012345678"
const DISCORD_USER_ID = "1180760727942860820";

// 2) 預設語言： "zh" 或 "en"
const DEFAULT_LANG = "zh";

/* =========================
   ✅ 1) 年份
========================= */
const y = document.getElementById("y");
if (y) y.textContent = new Date().getFullYear();

/* =========================
   ✅ 2) Ripple 效果
========================= */
function addRipple(el, x, y){
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.2;
  const ink = document.createElement("span");
  ink.className = "ripple-ink";
  ink.style.width = ink.style.height = `${size}px`;
  ink.style.left = `${x - rect.left - size/2}px`;
  ink.style.top  = `${y - rect.top  - size/2}px`;
  el.appendChild(ink);
  ink.addEventListener("animationend", () => ink.remove());
}

document.addEventListener("pointerdown", (e) => {
  const target = e.target.closest(".ripple");
  if (!target) return;
  addRipple(target, e.clientX, e.clientY);
});

/* =========================
   ✅ 3) 中/英切換（含記憶）
========================= */
const I18N = {
  zh: {
    bio: "數位創作者｜Discord 社群經營",
    discord: "Discord",
    all_links: "All links",
    back: "← 返回",
    links_desc: "所有個人連結一覽",
    discord_server: "Discord 社群",
    github_profile: "GitHub 個人頁",
    status_online: "線上",
    status_idle: "閒置",
    status_dnd: "請勿打擾",
    status_offline: "離線",
  },
  en: {
    bio: "Digital creator · Discord community",
    discord: "Discord",
    all_links: "All links",
    back: "← Back",
    links_desc: "All links in one place",
    discord_server: "Discord server",
    github_profile: "GitHub profile",
    status_online: "Online",
    status_idle: "Idle",
    status_dnd: "Do not disturb",
    status_offline: "Offline",
  }
};

function getLang(){
  return localStorage.getItem("lang") || DEFAULT_LANG;
}
function setLang(lang){
  localStorage.setItem("lang", lang);
  document.documentElement.lang = (lang === "zh") ? "zh-Hant" : "en";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (I18N[lang] && I18N[lang][key]) el.textContent = I18N[lang][key];
  });
  // 同步 status 文字
  updatePresenceText();
}

const langBtn = document.getElementById("langBtn");
if (langBtn){
  langBtn.addEventListener("click", () => {
    const next = getLang() === "zh" ? "en" : "zh";
    setLang(next);
  });
}
setLang(getLang());

/* =========================
   ✅ 4) Discord 真實在線狀態（Lanyard）
   - 需要你加入 Lanyard Discord（一次）
   - 不需要 token
========================= */
const presenceEl = document.getElementById("presence");

let lastPresence = "offline";

function mapLanyardStatus(s){
  // Lanyard: online | idle | dnd | offline
  if (s === "online" || s === "idle" || s === "dnd" || s === "offline") return s;
  return "offline";
}

function updatePresenceText(){
  if (!presenceEl) return;
  const lang = getLang();
  const t = I18N[lang];

  const textEl = presenceEl.querySelector(".status-text");
  if (!textEl) return;

  const key = `status_${lastPresence}`;
  textEl.textContent = t[key] || lastPresence;
  presenceEl.title = `Discord: ${textEl.textContent}`;
}

async function fetchPresenceOnce(){
  if (!presenceEl) return;
  // 若你還沒填 ID，直接顯示離線
  if (!DISCORD_USER_ID || DISCORD_USER_ID.includes("1180760727942860820")){
    presenceEl.dataset.status = "offline";
    lastPresence = "offline";
    updatePresenceText();
    return;
  }

  try{
    const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`, { cache: "no-store" });
    if (!res.ok) throw new Error("lanyard failed");
    const json = await res.json();
    const status = mapLanyardStatus(json?.data?.discord_status);
    presenceEl.dataset.status = status;
    lastPresence = status;
    updatePresenceText();
  }catch(e){
    // 失敗就維持離線（不影響網站其他功能）
    presenceEl.dataset.status = "offline";
    lastPresence = "offline";
    updatePresenceText();
  }
}

// 每 20 秒更新一次（夠用又不會太頻繁）
fetchPresenceOnce();
setInterval(fetchPresenceOnce, 20000);

