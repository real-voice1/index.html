/* RV_BUILD 30 */
/* REAL VOICE — v26 (Firebase + Agora + Lucky Gifts Atomic Engine + Auto-Room) */
(function (global) {
  "use strict";

  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyDyx4MBxvRM0L5FrrjVOfVePlKRSxGpMg4",
    authDomain: "real-voice-aec71.firebaseapp.com",
    databaseURL: "https://real-voice-aec71-default-rtdb.firebaseio.com",
    projectId: "real-voice-aec71",
    storageBucket: "real-voice-aec71.firebasestorage.app",
    messagingSenderId: "1051527775983",
    appId: "1:1051527775983:web:ae3794c162184fd56b7d1a"
  };

  var RTC_TOKEN_ENDPOINT = "https://indexhtml-production-8a2533cd.up.railway.app/rtc-token";
  var FALLBACK_TOKEN_URL = "https://indexhtml-production-8a2533cd.up.railway.app/rtc-token";
  var ECONOMY_API_BASE = "https://indexhtml-production-8a2533cd.up.railway.app";
  var FUNCTIONS_BASE = "https://us-central1-real-voice-aec71.cloudfunctions.net";

  var CONFIG = {
    storageKeyPrefix: "rv_state_v27_",
    guestStorageKey: "rv_guest_state_v27",
    guestSessionIdKey: "rv_guest_uid_v27",
    guestModeKey: "rv_guest_mode_v27",
    onboardDoneKeyPrefix: "rv_onboard_done_v27_",
    maxLevel: 100,
    xpPerLevel: 100,
    initialSpecialIdNumber: 1000001,
    maxSpecialIdNumber: 9999999,
    dmInitialLimit: 25,
    dmPageStep: 20,
    socialPageSize: 15,
    rateLimitWindowMs: 10000,
    rateLimitMaxActions: 15,
    badWords: ["شتيمة", "قذر", "حقير", "غبي", "كلب", "حمار"]
  };

  var VOICE_STATES = {
    DISCONNECTED: "DISCONNECTED",
    CONNECTING: "CONNECTING",
    CONNECTED: "CONNECTED",
    RECONNECTING: "RECONNECTING",
    FAILED: "FAILED"
  };

  var GIFT_COIN_PRICES = { heart: 10, rose: 25, crown: 150, car: 300, rocket: 500, diamond: 800, vip: 1500, castle: 3000 };
  var DEFAULT_GIFTS = [
    { id: "heart", e: "❤️", n: "قلب", p: 10, vipMin: 0 },
    { id: "rose", e: "🌹", n: "وردة", p: 25, vipMin: 0 },
    { id: "crown", e: "👑", n: "تاج", p: 150, vipMin: 0 },
    { id: "car", e: "🏎️", n: "سيارة", p: 300, vipMin: 0 },
    { id: "rocket", e: "🚀", n: "صاروخ", p: 500, vipMin: 1 },
    { id: "diamond", e: "💎", n: "ألماس", p: 800, vipMin: 1 },
    { id: "vip", e: "🦁", n: "أسد VIP", p: 1500, vipMin: 2 },
    { id: "castle", e: "🏰", n: "قصر متحرك", p: 3000, vipMin: 3 }
  ];

  /* كتالوج هدايا الحظ الـ 10 الثابتة بالترتيب المعتمد وأصول SVG محلية قابلة للاستبدال */
  var LUCKY_GIFT_ASSETS = {
    lucky_star: '<svg viewBox="0 0 64 64" width="38" height="38"><defs><linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient></defs><polygon points="32,6 39,23 58,24 43,36 48,55 32,45 16,55 21,36 6,24 25,23" fill="url(#lg1)" stroke="#fff7ed" stroke-width="2"/></svg>',
    lucky_rose: '<svg viewBox="0 0 64 64" width="38" height="38"><circle cx="32" cy="26" r="16" fill="#e11d48"/><circle cx="32" cy="24" r="10" fill="#fb7185"/><path d="M32 42 V58 M32 50 C22 46 18 40 24 38 M32 48 C42 44 46 38 40 36" stroke="#22c55e" stroke-width="4" fill="none" stroke-linecap="round"/></svg>',
    lucky_gem: '<svg viewBox="0 0 64 64" width="38" height="38"><polygon points="20,10 44,10 56,26 32,56 8,26" fill="#06b6d4" stroke="#cffafe" stroke-width="2"/><polygon points="20,10 32,26 44,10" fill="#67e8f9"/><polygon points="8,26 32,26 32,56" fill="#0891b2"/></svg>',
    lucky_crown: '<svg viewBox="0 0 64 64" width="38" height="38"><path d="M10 46 L14 20 L26 32 L32 14 L38 32 L50 20 L54 46 Z" fill="#f59e0b" stroke="#fef3c7" stroke-width="2"/><rect x="10" y="46" width="44" height="8" rx="3" fill="#d97706"/></svg>',
    lucky_chest: '<svg viewBox="0 0 64 64" width="38" height="38"><rect x="10" y="24" width="44" height="28" rx="6" fill="#92400e" stroke="#fbbf24" stroke-width="2"/><path d="M10 26 C10 14 54 14 54 26 Z" fill="#b45309" stroke="#fbbf24" stroke-width="2"/><rect x="28" y="22" width="8" height="14" rx="2" fill="#fde047"/></svg>',
    lucky_rocket: '<svg viewBox="0 0 64 64" width="38" height="38"><path d="M32 8 C42 18 44 34 40 46 L24 46 C20 34 22 18 32 8 Z" fill="#f43f5e"/><circle cx="32" cy="26" r="5" fill="#e0f2fe"/><path d="M24 40 L14 50 L24 46 Z M40 40 L50 50 L40 46 Z" fill="#f59e0b"/></svg>',
    lucky_planet: '<svg viewBox="0 0 64 64" width="38" height="38"><circle cx="32" cy="32" r="16" fill="#8b5cf6"/><ellipse cx="32" cy="32" rx="28" ry="8" transform="rotate(-22 32 32)" fill="none" stroke="#38bdf8" stroke-width="4"/></svg>',
    lucky_palace: '<svg viewBox="0 0 64 64" width="38" height="38"><path d="M16 28 C16 16 48 16 48 28 Z" fill="#f59e0b"/><rect x="12" y="28" width="40" height="26" rx="3" fill="#7c3aed" stroke="#fde68a" stroke-width="2"/><rect x="27" y="38" width="10" height="16" rx="5" fill="#fde047"/></svg>',
    lucky_galaxy: '<svg viewBox="0 0 64 64" width="38" height="38"><circle cx="32" cy="32" r="22" fill="#1e1b4b"/><path d="M32 14 C46 14 50 32 38 42 C26 52 14 40 20 26 C24 18 36 20 36 30" fill="none" stroke="#e879f9" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="32" r="4" fill="#fef08a"/></svg>',
    lucky_diamond: '<svg viewBox="0 0 64 64" width="38" height="38"><polygon points="18,8 46,8 58,24 32,58 6,24" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/><polygon points="18,8 32,24 46,8" fill="#bae6fd"/><polygon points="32,24 58,24 32,58" fill="#0284c7"/></svg>'
  };

  var DEFAULT_LUCKY_CATALOG = [
    { id: "lucky_star", nameAr: "نجمة الحظ", price: 100, recipientReward: 10, maxSenderReward: 1000, sortOrder: 1, active: true },
    { id: "lucky_rose", nameAr: "وردة الحظ", price: 200, recipientReward: 20, maxSenderReward: 2000, sortOrder: 2, active: true },
    { id: "lucky_gem", nameAr: "جوهرة الحظ", price: 300, recipientReward: 30, maxSenderReward: 3000, sortOrder: 3, active: true },
    { id: "lucky_crown", nameAr: "تاج الحظ", price: 500, recipientReward: 50, maxSenderReward: 5000, sortOrder: 4, active: true },
    { id: "lucky_chest", nameAr: "صندوق الحظ", price: 1000, recipientReward: 100, maxSenderReward: 10000, sortOrder: 5, active: true },
    { id: "lucky_rocket", nameAr: "صاروخ الحظ", price: 2000, recipientReward: 200, maxSenderReward: 20000, sortOrder: 6, active: true },
    { id: "lucky_planet", nameAr: "كوكب الحظ", price: 3000, recipientReward: 300, maxSenderReward: 30000, sortOrder: 7, active: true },
    { id: "lucky_palace", nameAr: "قصر الحظ", price: 5000, recipientReward: 500, maxSenderReward: 50000, sortOrder: 8, active: true },
    { id: "lucky_galaxy", nameAr: "مجرة الحظ", price: 7500, recipientReward: 750, maxSenderReward: 75000, sortOrder: 9, active: true },
    { id: "lucky_diamond", nameAr: "ألماسة الحظ", price: 10000, recipientReward: 1000, maxSenderReward: 100000, sortOrder: 10, active: true }
  ];

  var DEFAULT_LUCKY_ODDS = [
    { label: "0×", multiplierBps: 0, weight: 4500, pct: "45%" },
    { label: "0.5×", multiplierBps: 5000, weight: 2000, pct: "20%" },
    { label: "1×", multiplierBps: 10000, weight: 2000, pct: "20%" },
    { label: "2×", multiplierBps: 20000, weight: 1000, pct: "10%" },
    { label: "5×", multiplierBps: 50000, weight: 400, pct: "4%" },
    { label: "10×", multiplierBps: 100000, weight: 100, pct: "1%" }
  ];

  var VIP_TIERS = [
    { level: 1, name: "VIP فضي", badge: "🥈 VIP 1", perks: ["شارة VIP 1", "إطار مميز", "هدايا VIP 1+"] },
    { level: 2, name: "VIP ذهبي", badge: "🥇 VIP 2", perks: ["شارة VIP 2", "لون اسم ذهبي", "هدايا VIP 1-2"] },
    { level: 3, name: "VIP ملكي", badge: "👑 VIP 3", perks: ["شارة VIP 3", "دخول ملكي مميز", "جميع هدايا VIP"] }
  ];

  var EMOJIS = ["😀", "😂", "😍", "🔥", "👏", "❤️", "😎", "🎉", "🙏", "😢", "👍", "💎"];
  var CATEGORIES = { chat: "دردشة", games: "ألعاب", vip: "VIP", music: "موسيقى", friends: "أصدقاء" };
  var COVERS = ["#7c3aed", "#2563eb", "#db2777", "#0891b2", "#ea580c", "#16a34a"];
  var COVER_ICONS = ["🎙️", "🎮", "🎵", "👑", "☕", "🌙"];

  var DEFAULT_TRACKS = [
    { id: "t1", title: "Night Chill Beat", artist: "موسيقى هادئة", cover: "🎵", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: "t2", title: "Acoustic Vibes", artist: "جيتار ليلي", cover: "🎸", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: "t3", title: "Midnight Lounge", artist: "سهرة رايقة", cover: "🌙", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
  ];

  var STICKERS = [
    { id: "s1", e: "🥳", n: "حفلة" }, { id: "s2", e: "🎤", n: "غناء" }, { id: "s3", e: "👑", n: "ملكي" },
    { id: "s4", e: "🔥", n: "نار" }, { id: "s5", e: "💖", n: "حب" }, { id: "s6", e: "😂", n: "ضحك" }
  ];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function initials(n) { n = String(n || "").trim(); return n ? n.slice(0, 2) : "RV"; }
  function now() { return Date.now(); }
  function serverTs() {
    if (global.firebase && firebase.database && firebase.database.ServerValue && firebase.database.ServerValue.TIMESTAMP) {
      return firebase.database.ServerValue.TIMESTAMP;
    }
    return Date.now();
  }
  function timeStr(t) {
    var d = new Date(typeof t === "number" ? t : Date.now());
    var h = d.getHours(), m = d.getMinutes();
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }
  function dateTimeStr(t) {
    var d = new Date(typeof t === "number" ? t : Date.now());
    return d.toLocaleDateString("ar-EG") + " " + timeStr(t);
  }
  function uid() { return "u" + Math.random().toString(36).slice(2, 9); }
  function formatSpecialId(numVal) {
    var n = Math.max(CONFIG.initialSpecialIdNumber, Math.min(CONFIG.maxSpecialIdNumber, Math.floor(Number(numVal || CONFIG.initialSpecialIdNumber))));
    return String(n).padStart(7, "0");
  }
  function normalizeSpecialId(val, fallbackNum) {
    if (typeof val === "string" && /^\d{7}$/.test(val.trim())) {
      var parsed = Number(val.trim());
      if (parsed < CONFIG.initialSpecialIdNumber) return formatSpecialId(CONFIG.initialSpecialIdNumber);
      return val.trim();
    }
    if (typeof val === "string" && /^\d+$/.test(val.trim())) return formatSpecialId(Number(val.trim()));
    if (typeof val === "number" && isFinite(val) && val >= CONFIG.initialSpecialIdNumber) return formatSpecialId(val);
    if (typeof fallbackNum === "number" && isFinite(fallbackNum) && fallbackNum >= CONFIG.initialSpecialIdNumber) return formatSpecialId(fallbackNum);
    return formatSpecialId(CONFIG.initialSpecialIdNumber);
  }
  function displayUserId(u) {
    if (!u) return formatSpecialId(CONFIG.initialSpecialIdNumber);
    return normalizeSpecialId(u.specialId || (u.publicProfile && u.publicProfile.specialId), u.num);
  }
  function uidToAgoraNum(str) {
    var s = String(str || "rv"), h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (Math.abs(h) % 2147483646) + 1;
  }
  function dmThreadId(a, b) { return [String(a), String(b)].sort().join("__"); }

  function mapLuckyErrorArabic(rawMsg) {
    var s = String(rawMsg || "").toLowerCase();
    if (s.indexOf("feature_disabled") >= 0 || s.indexOf("معطلة") >= 0) return "ميزة هدايا الحظ متوقفة مؤقتاً من الإدارة.";
    if (s.indexOf("insufficient") >= 0 || s.indexOf("رصيد") >= 0) return "رصيدك الحالي غير كافٍ لإرسال هذه الهدية.";
    if (s.indexOf("daily_limit") >= 0 || s.indexOf("الحد اليومي") >= 0) return "تجاوزت الحد اليومي للإنفاق (20,000 عملة بتوقيت UTC).";
    if (s.indexOf("quote") >= 0 || s.indexOf("تغير") >= 0) return "تغيّر سعر الهدية أو إعداداتها، يرجى مراجعة السعر الجديد وتأكيد الإرسال.";
    if (s.indexOf("recipient") >= 0 || s.indexOf("المستلم") >= 0) return "المستلم غير متواجد داخل الغرفة حالياً أو غير مؤهل.";
    if (s.indexOf("self") >= 0) return "لا يمكنك إرسال هدية حظ إلى نفسك.";
    if (s.indexOf("auth") >= 0 || s.indexOf("token") >= 0 || s.indexOf("401") >= 0) return "انتهت جلستك، يرجى إعادة تسجيل الدخول.";
    if (s.indexOf("conflict") >= 0) return "حدث تعارض في بيانات الطلب، يرجى إعادة المحاولة.";
    if (s.indexOf("rate") >= 0 || s.indexOf("429") >= 0) return "طلبات متكررة بسرعة كبيرة، انتظر ثوانٍ ثم حاول مجدداً.";
    return rawMsg || "تعذر إتمام العملية بسبب مشكلة في الاتصال، يمكنك التحقق من السجل قبل إعادة المحاولة.";
  }

  var toastTimer = null;
  function toast(msg) {
    var t = $("toast");
    if (!t) return;
    t.textContent = String(msg || "");
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2700);
  }

  function hideSplash() {
    var sp = $("splash-screen");
    if (!sp) return;
    sp.style.opacity = "0";
    setTimeout(function () {
      sp.classList.add("hidden");
      sp.style.display = "none";
    }, 180);
  }

  function updateOverlayLock() {
    var roomOpen = $("room-view") && $("room-view").classList.contains("open");
    var dmOpen = $("chat-view") && $("chat-view").classList.contains("open");
    var lock = !!(roomOpen || dmOpen);
    document.body.classList.toggle("overlay-open", lock);
    var appEl = $("app"), navEl = document.querySelector(".bottom-nav");
    if (appEl) appEl.style.display = lock ? "none" : "";
    if (navEl) navEl.style.display = lock ? "none" : "";
  }

  function normWord(w) {
    return String(w).replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/[أإآ]/g, "ا").toLowerCase();
  }
  var BAD_SET = {};
  CONFIG.badWords.forEach(function (w) { BAD_SET[normWord(w)] = true; });
  function clean(text) {
    return String(text == null ? "" : text).replace(
      /(https?:\/\/\S+|www\.\S+)|([\u0600-\u06FFA-Za-z0-9_]+)/g,
      function (m, url, word) { return url ? m : (BAD_SET[normWord(word)] ? "***" : m); }
    );
  }

  var actionTimestamps = [];
  function allowActionRateLimit() {
    var t = now();
    actionTimestamps = actionTimestamps.filter(function (x) { return t - x < CONFIG.rateLimitWindowMs; });
    if (actionTimestamps.length >= CONFIG.rateLimitMaxActions) {
      toast("تم إرسال طلبات كثيرة خلال وقت قصير، انتظر ثوانٍ ⏳");
      return false;
    }
    actionTimestamps.push(t);
    return true;
  }

  function readImageFileAsDataUrl(file, maxSize, quality) {
    maxSize = maxSize || 180; quality = quality || 0.55;
    return new Promise(function (resolve, reject) {
      if (!file || !file.type || file.type.indexOf("image/") !== 0) { reject(new Error("اختر ملف صورة صحيح")); return; }
      if (file.size > 6 * 1024 * 1024) { reject(new Error("حجم الصورة كبير جداً (الحد الأقصى 6 ميجابايت)")); return; }
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var w = img.width || maxSize, h = img.height || maxSize;
          if (w > h) { if (w > maxSize) { h = Math.round((h * maxSize) / w); w = maxSize; } }
          else { if (h > maxSize) { w = Math.round((w * maxSize) / h); h = maxSize; } }
          var canvas = document.createElement("canvas");
          canvas.width = Math.max(1, w); canvas.height = Math.max(1, h);
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          try { resolve(canvas.toDataURL("image/jpeg", quality)); } catch (e) { resolve(String(reader.result || "")); }
        };
        img.onerror = function () { resolve(String(reader.result || "")); };
        img.src = String(reader.result || "");
      };
      reader.onerror = function () { reject(new Error("تعذر قراءة الصورة")); };
      reader.readAsDataURL(file);
    });
  }

  function computeLevelFromXp(xp) { return Math.max(1, Math.min(CONFIG.maxLevel, Math.floor(Math.max(0, Number(xp || 0)) / CONFIG.xpPerLevel) + 1)); }
  function getCharmLevel(charm) { return Math.max(1, Math.min(CONFIG.maxLevel, Math.floor(Math.max(0, Number(charm || 0)) / 100) + 1)); }

  function getActiveGifts() {
    if (S && Array.isArray(S.customGifts) && S.customGifts.length) return S.customGifts;
    return DEFAULT_GIFTS;
  }
  function getGiftMaps() {
    var byId = {}, byEmoji = {};
    getActiveGifts().forEach(function (g) { byId[g.id] = g; byEmoji[g.e] = g; });
    return { byId: byId, byEmoji: byEmoji };
  }
  function getEffectiveVip(u) {
    if (!u) return 0;
    var lv = Number(u.vip || 0);
    var exp = Number(u.vipExpiresAt || 0);
    if (lv > 0 && exp > 0 && now() > exp) return 0;
    return lv;
  }

  async function getIdTokenOrNull() {
    if (!cloud.on || !cloud.auth || !cloud.auth.currentUser || UI.isGuest) return null;
    try { return await cloud.auth.currentUser.getIdToken(false); } catch (e) { return null; }
  }

  async function callEconomyApi(endpoint, payload) {
    var token = await getIdTokenOrNull();
    if (!token || !ECONOMY_API_BASE) return { ok: false, error: "ابدأ التطبيق أولاً بحساب مسجل" };
    try {
      var response = await fetch(ECONOMY_API_BASE + "/" + endpoint, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(payload || {})
      });
      var data = await response.json();
      if (!response.ok || !data || !data.ok) return { ok: false, error: data && data.error ? data.error : "تعذر تنفيذ العملية" };
      return data;
    } catch (err) { return { ok: false, error: "تعذر الاتصال بخادم المحفظة." }; }
  }

  async function initializeMyWallet() {
    if (UI.isGuest || !S || !S.me || !S.me.id) return;
    var result = await callEconomyApi("initWallet", {});
    if (result.ok) {
      S.me.coins = Math.max(0, Number(result.balance || 0));
      saveLocal(); renderTop();
      if (UI.page === "profile") renderProfile();
      if (UI.roomId) renderRoom();
    }
  }

  function getTotalSpendableCoins() {
    var paid = Math.max(0, Number(S && S.me && S.me.coins || 0));
    var bonus = Math.max(0, Number(S && S.me && S.me.senderBonusBalance || 0));
    return paid + bonus;
  }

  function isStandaloneApp() {
    return (global.matchMedia && global.matchMedia("(display-mode: standalone)").matches) || !!global.navigator.standalone;
  }
  var deferredInstallPrompt = null;
  var waitingServiceWorker = null;

  function updateInstallBarVisibility() {
    var bar = $("install-app-bar");
    if (!bar) return;
    if (isStandaloneApp()) bar.classList.add("hidden");
    else bar.classList.remove("hidden");
  }

  async function triggerAutoInstall() {
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        var choice = await deferredInstallPrompt.userChoice;
        if (choice && choice.outcome === "accepted") toast("تم بدء تثبيت REAL VOICE على جوالك ✅");
        else toast("تم إلغاء التثبيت");
      } catch (e) { toast("تعذر تشغيل نافذة التثبيت"); }
      deferredInstallPrompt = null;
      updateInstallBarVisibility();
      return;
    }
    openSheet(
      "<h3>📲 تثبيت تطبيق REAL VOICE</h3>" +
      "<div class='actlist'>" +
        "<button type='button'><b>أندرويد (Chrome):</b> افتح قائمة المتصفح (⋮) واختر <b>«تثبيت التطبيق»</b> أو <b>«إضافة إلى الشاشة الرئيسية»</b>.</button>" +
        "<button type='button'><b>آيفون (Safari):</b> اضغط زر المشاركة (⬆️) ثم <b>«إضافة إلى الشاشة الرئيسية»</b>.</button>" +
      "</div>" +
      "<button class='btn block' id='ins-close' type='button'>حسناً</button>"
    );
    if ($("ins-close")) $("ins-close").onclick = closeSheet;
  }

  function initPwaInstall() {
    try {
      updateInstallBarVisibility();
      window.addEventListener("beforeinstallprompt", function (e) {
        e.preventDefault();
        deferredInstallPrompt = e;
        updateInstallBarVisibility();
      });
      window.addEventListener("appinstalled", function () {
        deferredInstallPrompt = null;
        updateInstallBarVisibility();
        toast("تم تثبيت REAL VOICE بنجاح ✅");
      });
      if ($("install-app-btn")) $("install-app-btn").onclick = triggerAutoInstall;
      if ($("update-app-btn")) {
        $("update-app-btn").onclick = function () {
          if (waitingServiceWorker) waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
          else location.reload();
        };
      }
    } catch (e) { /* */ }
  }

  /* ========= الصوت (Agora RTC) + الموسيقى المتزامنة ========= */
  var voice = {
    client: null, localTrack: null, channel: null, role: null, uidNum: 0,
    joining: false, connectionState: VOICE_STATES.DISCONNECTED,
    speakingNums: {}, localSpeaking: false, localLevelTimer: null
  };
  var musicState = { roomAudio: null, currentUrl: "", currentTitle: "", playing: false };

  function setVoiceConnectionState(stateVal, customLabel) {
    voice.connectionState = stateVal;
    var dot = $("voice-status-dot"), txt = $("voice-status-text");
    if (!dot || !txt) return;
    dot.classList.remove("live", "warn", "bad");
    if (stateVal === VOICE_STATES.CONNECTED) {
      dot.classList.add("live");
      txt.textContent = customLabel || "متصل بالصوت — الجميع يسمع بعضه 🔊";
    } else if (stateVal === VOICE_STATES.CONNECTING) {
      dot.classList.add("warn");
      txt.textContent = customLabel || "جاري الاتصال بالصوت...";
    } else if (stateVal === VOICE_STATES.RECONNECTING) {
      dot.classList.add("warn");
      txt.textContent = customLabel || "انقطع الاتصال مؤقتاً — جاري إعادة الاتصال...";
    } else if (stateVal === VOICE_STATES.FAILED) {
      dot.classList.add("bad");
      txt.textContent = customLabel || "فشل الاتصال الصوتي";
    } else {
      txt.textContent = customLabel || "غير متصل بالصوت";
    }
  }

  function computeMusicPositionSec(mObj) {
    if (!mObj || !mObj.url) return 0;
    var basePos = Math.max(0, Number(mObj.positionSec || 0));
    if (!mObj.playing) return basePos;
    var refTs = Number(mObj.updatedAt || now());
    var elapsedSec = Math.max(0, (now() - refTs) / 1000);
    return basePos + elapsedSec;
  }

  function syncRoomMusicPlayer(room) {
    var mm = $("music-mini");
    if (!room || !room.music || !room.music.url || !room.music.playing) {
      if (musicState.roomAudio) { try { musicState.roomAudio.pause(); } catch (e) { /* */ } }
      musicState.playing = false;
      if (mm) mm.classList.add("hidden");
      return;
    }
    var mObj = room.music;
    if (!musicState.roomAudio) {
      musicState.roomAudio = new Audio();
      musicState.roomAudio.addEventListener("ended", function () {
        var curR = getRoom(UI.roomId || UI.floatingRoomId);
        if (!curR) return;
        var pl = Array.isArray(curR.playlist) && curR.playlist.length ? curR.playlist : DEFAULT_TRACKS;
        var curIdx = pl.findIndex(function (t) { return t.url === curR.music.url; });
        var nextTrack = curIdx >= 0 && curIdx + 1 < pl.length ? pl[curIdx + 1] : null;
        if (canControlRoomMusic(curR)) {
          if (nextTrack) {
            setRoomMusicRemote(curR.id, { url: nextTrack.url, title: nextTrack.title, artist: nextTrack.artist || "", playing: true, positionSec: 0, updatedAt: now() });
          } else {
            setRoomMusicRemote(curR.id, { url: "", title: "", artist: "", playing: false, positionSec: 0, updatedAt: now() });
          }
        }
      });
    }
    var vol = typeof UI.musicVolume === "number" ? UI.musicVolume : 0.7;
    try { musicState.roomAudio.volume = Math.max(0, Math.min(1, vol)); } catch (e) { /* */ }

    if (musicState.currentUrl !== mObj.url) {
      musicState.roomAudio.src = mObj.url;
      musicState.currentUrl = mObj.url;
      musicState.roomAudio.onerror = function () { toast("تعذر تشغيل المقطع الصوتي — تحقق من صحة الرابط"); };
    }

    var targetPos = computeMusicPositionSec(mObj);
    try {
      if (musicState.roomAudio.readyState >= 1 && Math.abs((musicState.roomAudio.currentTime || 0) - targetPos) > 2.2) {
        musicState.roomAudio.currentTime = targetPos;
      }
    } catch (e) { /* */ }

    musicState.roomAudio.muted = !!UI.roomSpeakerMuted;
    musicState.currentTitle = (mObj.title || "أغنية") + (mObj.artist ? " — " + mObj.artist : "");
    musicState.playing = true;
    if (mm) {
      mm.classList.remove("hidden");
      $("music-mini-title").textContent = "🎵 " + musicState.currentTitle;
    }
    if (musicState.roomAudio.paused) musicState.roomAudio.play().catch(function () { /* */ });
  }

  function canControlRoomMusic(room) {
    if (!room) return false;
    if (room.owner === S.me.id) return true;
    return Array.isArray(room.mods) && room.mods.indexOf(S.me.id) >= 0;
  }

  function setRoomMusicRemote(roomId, musicObj) {
    if (!roomId) return;
    var r = getRoom(roomId);
    if (!canControlRoomMusic(r)) { toast("تشغيل وتغيير الموسيقى متاح لمالك الغرفة والمشرفين فقط"); return; }
    if (r) r.music = musicObj;
    if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + roomId + "/music").set(musicObj).catch(function () { /* */ });
    if (r && (UI.roomId === roomId || UI.floatingRoomId === roomId)) syncRoomMusicPlayer(r);
  }

  function showAudioUnlockBar(show) { var bar = $("audio-unlock-bar"); if (bar) bar.classList.toggle("hidden", !show); }
  function applyRoomSpeakerMuteState() {
    var muted = !!UI.roomSpeakerMuted;
    if (voice.client && Array.isArray(voice.client.remoteUsers)) {
      voice.client.remoteUsers.forEach(function (u) {
        if (u && u.audioTrack) { try { u.audioTrack.setVolume(muted ? 0 : 100); } catch (e) { /* */ } }
      });
    }
    if (musicState.roomAudio) { try { musicState.roomAudio.muted = muted; } catch (e) { /* */ } }
    var spkBtn = $("room-speaker-btn");
    if (spkBtn) {
      spkBtn.classList.toggle("spk-muted", muted);
      spkBtn.textContent = muted ? "🔇 مكتوم" : "🔊 السماعة";
    }
  }
  async function subscribeAndPlayRemoteUser(user, mediaType) {
    if (!voice.client || !user || (!UI.roomId && !UI.floatingRoomId)) return;
    try {
      await voice.client.subscribe(user, mediaType);
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.setVolume(UI.roomSpeakerMuted ? 0 : 100);
        try { user.audioTrack.play(); showAudioUnlockBar(false); } catch (e) { showAudioUnlockBar(true); }
      }
    } catch (e) { /* */ }
  }
  function resumeAllRemoteAudioTracks() {
    if (!voice.client || !Array.isArray(voice.client.remoteUsers)) return;
    voice.client.remoteUsers.forEach(function (u) {
      if (u && u.hasAudio) {
        if (u.audioTrack) {
          try { u.audioTrack.setVolume(UI.roomSpeakerMuted ? 0 : 100); u.audioTrack.play(); showAudioUnlockBar(false); } catch (e) { showAudioUnlockBar(true); }
        } else { subscribeAndPlayRemoteUser(u, "audio"); }
      }
    });
  }
  function startLocalVoiceMeter() {
    stopLocalVoiceMeter();
    voice.localLevelTimer = setInterval(function () {
      var active = false;
      if (voice.localTrack && !UI.micMuted && voice.client && voice.client.connectionState === "CONNECTED") {
        try {
          var lvl = typeof voice.localTrack.getVolumeLevel === "function" ? voice.localTrack.getVolumeLevel() : 0;
          active = lvl > 0.025;
        } catch (e) { active = false; }
      }
      if (active !== voice.localSpeaking) { voice.localSpeaking = active; updateSpeakingIndicators(); }
    }, 150);
  }
  function stopLocalVoiceMeter() {
    if (voice.localLevelTimer) { clearInterval(voice.localLevelTimer); voice.localLevelTimer = null; }
    voice.localSpeaking = false;
  }
  function setupAgoraClient() {
    if (voice.client || !global.AgoraRTC) return;
    try {
      AgoraRTC.onAutoplayFailed = function () { showAudioUnlockBar(true); };
      voice.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      voice.client.enableAudioVolumeIndicator();
      voice.client.on("connection-state-change", function (curState) {
        if (curState === "CONNECTING") setVoiceConnectionState(VOICE_STATES.CONNECTING);
        else if (curState === "CONNECTED") {
          setVoiceConnectionState(VOICE_STATES.CONNECTED);
          syncMicHardwareState();
        }
        else if (curState === "RECONNECTING") setVoiceConnectionState(VOICE_STATES.RECONNECTING);
        else if (curState === "DISCONNECTED") setVoiceConnectionState(VOICE_STATES.DISCONNECTED);
      });
      voice.client.on("user-published", async function (user, mediaType) { await subscribeAndPlayRemoteUser(user, mediaType); updateSpeakingIndicators(); });
      voice.client.on("user-unpublished", function (user) {
        if (user && user.audioTrack) { try { user.audioTrack.stop(); } catch (e) { /* */ } }
        if (user) delete voice.speakingNums[user.uid];
        updateSpeakingIndicators();
      });
      voice.client.on("user-left", function (user) { if (user) delete voice.speakingNums[user.uid]; updateSpeakingIndicators(); });
      voice.client.on("volume-indicator", function (volumes) {
        var active = {};
        (volumes || []).forEach(function (v) { if (v.level > 1.5) active[v.uid === 0 ? voice.uidNum : v.uid] = true; });
        voice.speakingNums = active;
        updateSpeakingIndicators();
      });
    } catch (e) { setVoiceConnectionState(VOICE_STATES.FAILED, "تعذر تهيئة محرك الصوت"); }
  }
  async function fetchRtcToken(channelName, uidNum, roleName) {
    var idToken = await getIdTokenOrNull();
    var headers = { "Content-Type": "application/json" };
    if (idToken) headers["Authorization"] = "Bearer " + idToken;

    if (RTC_TOKEN_ENDPOINT && !UI.isGuest && idToken) {
      try {
        var cRes = await fetch(RTC_TOKEN_ENDPOINT, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ channelName: channelName, uid: uidNum, role: roleName || "publisher" })
        });
        var cData = await cRes.json();
        if (cRes.ok && cData.token && cData.appId) return cData;
      } catch (e) { /* */ }
    }

    var url = new URL(FALLBACK_TOKEN_URL);
    url.searchParams.set("channelName", channelName);
    url.searchParams.set("uid", String(uidNum));
    url.searchParams.set("role", roleName || "publisher");
    var res = await fetch(url.toString(), { method: "GET", headers: idToken ? { "Authorization": "Bearer " + idToken } : {} });
    var data = await res.json();
    if (!res.ok || !data.token || !data.appId) throw new Error(data.error || "فشل جلب تصريح الصوت من الخادم");
    return data;
  }
  async function stopLocalMic() {
    stopLocalVoiceMeter();
    if (voice.localTrack) {
      try { if (voice.client && voice.client.connectionState === "CONNECTED") await voice.client.unpublish([voice.localTrack]); } catch (e) { /* */ }
      try { voice.localTrack.stop(); voice.localTrack.close(); } catch (e) { /* */ }
      voice.localTrack = null;
    }
  }
  async function publishLocalMic() {
    if (!voice.client || voice.client.connectionState !== "CONNECTED") return false;
    var room = getRoom(UI.roomId || UI.floatingRoomId);
    var mySeatIdx = room ? seatIndexOf(room, S.me.id) : -1;
    if (mySeatIdx < 0) { await stopLocalMic(); return false; }
    var muted = !!UI.micMuted || !!room.seats[mySeatIdx].muted;
    if (muted) {
      if (voice.localTrack) { try { await voice.localTrack.setEnabled(false); } catch (e) { /* */ } }
      return false;
    }
    try {
      if (!voice.localTrack) voice.localTrack = await AgoraRTC.createMicrophoneAudioTrack({ AEC: true, ANS: true, AGC: true });
      await voice.localTrack.setEnabled(true);
      var localTracks = voice.client.localTracks || [];
      if (localTracks.indexOf(voice.localTrack) < 0) await voice.client.publish([voice.localTrack]);
      startLocalVoiceMeter();
      resumeAllRemoteAudioTracks();
      return true;
    } catch (e) { toast("تعذر تشغيل الميكروفون — تأكد من إعطاء صلاحية الميكروفون"); return false; }
  }
  async function syncMicHardwareState() {
    var room = getRoom(UI.roomId || UI.floatingRoomId);
    if (!room) return;
    var mySeatIdx = seatIndexOf(room, S.me.id);
    if (mySeatIdx < 0) { await stopLocalMic(); updateSpeakingIndicators(); return; }
    var muted = !!UI.micMuted || !!room.seats[mySeatIdx].muted;
    if (!muted) {
      if (!voice.localTrack) await publishLocalMic();
      else {
        try { await voice.localTrack.setEnabled(true); } catch (e) { /* */ }
        if (voice.client && voice.client.connectionState === "CONNECTED") {
          var localTracks = voice.client.localTracks || [];
          if (localTracks.indexOf(voice.localTrack) < 0) { try { await voice.client.publish([voice.localTrack]); } catch (e) { /* */ } }
        }
        startLocalVoiceMeter();
      }
    } else {
      voice.localSpeaking = false;
      if (voice.localTrack) { try { await voice.localTrack.setEnabled(false); } catch (e) { /* */ } }
    }
    updateSpeakingIndicators();
  }
  async function joinVoiceChannel(channelName, desiredRole) {
    if (voice.joining) return false;
    if (voice.channel === channelName && voice.client && voice.client.connectionState === "CONNECTED") return true;
    if (!global.AgoraRTC) { setVoiceConnectionState(VOICE_STATES.FAILED, "مكتبة Agora الصوتية غير متاحة"); return false; }
    setupAgoraClient();
    if (!voice.client) { setVoiceConnectionState(VOICE_STATES.FAILED, "تعذر تهيئة الصوت"); return false; }
    voice.joining = true;
    setVoiceConnectionState(VOICE_STATES.CONNECTING, "جاري الاتصال بالصوت...");
    try {
      var targetUid = uidToAgoraNum(S.me.id);
      voice.uidNum = targetUid;
      if (voice.client.connectionState !== "DISCONNECTED") await leaveVoiceChannel(true);
      if (!UI.roomId && !UI.floatingRoomId) { voice.joining = false; return false; }
      var tokenData = await fetchRtcToken(channelName, targetUid, "publisher");
      await voice.client.join(tokenData.appId, channelName, tokenData.token, tokenData.uid || targetUid);
      voice.channel = channelName;
      voice.role = desiredRole || "publisher";
      if (Array.isArray(voice.client.remoteUsers)) {
        for (var i = 0; i < voice.client.remoteUsers.length; i++) {
          var ru = voice.client.remoteUsers[i];
          if (ru && ru.hasAudio) await subscribeAndPlayRemoteUser(ru, "audio");
        }
      }
      var room = getRoom(channelName);
      if (room && seatIndexOf(room, S.me.id) >= 0) await publishLocalMic();
      applyRoomSpeakerMuteState();
      setVoiceConnectionState(VOICE_STATES.CONNECTED, "متصل بالصوت — الجميع يسمع بعضه 🔊");
      return true;
    } catch (e) {
      setVoiceConnectionState(VOICE_STATES.FAILED, "فشل الاتصال الصوتي — أعد المحاولة");
      return false;
    } finally { voice.joining = false; }
  }
  async function leaveVoiceChannel(keepMusic) {
    showAudioUnlockBar(false);
    stopLocalVoiceMeter();
    if (!keepMusic) {
      if (musicState.roomAudio) {
        try { musicState.roomAudio.pause(); musicState.roomAudio.src = ""; } catch (e) { /* */ }
        musicState.roomAudio = null;
      }
      musicState.currentUrl = "";
      musicState.playing = false;
      var mm = $("music-mini");
      if (mm) mm.classList.add("hidden");
    }
    await stopLocalMic();
    if (voice.client) {
      try {
        (voice.client.remoteUsers || []).forEach(function (u) {
          if (u && u.audioTrack) { try { u.audioTrack.stop(); } catch (e) { /* */ } }
        });
      } catch (e) { /* */ }
      try { if (voice.client.connectionState !== "DISCONNECTED") await voice.client.leave(); } catch (e) { /* */ }
    }
    voice.channel = null;
    voice.role = null;
    voice.speakingNums = {};
    var spkEl = $("room-active-speaker");
    if (spkEl) spkEl.textContent = "";
    setVoiceConnectionState(VOICE_STATES.DISCONNECTED, "غير متصل بالصوت");
  }
  function updateSpeakingIndicators() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var activeNames = [];
    var seatEls = document.querySelectorAll("#room-seats .seat");
    room.seats.forEach(function (s, idx) {
      var el = seatEls[idx];
      if (!el) return;
      if (!s.uid) { el.classList.remove("speak"); return; }
      var u = resolveLiveUser(s.uid);
      var muted = s.muted || (s.uid === S.me.id && UI.micMuted);
      var isSelfSpeaking = (s.uid === S.me.id && !muted && voice.localSpeaking);
      var isRemoteSpeaking = (!muted && !!voice.speakingNums[uidToAgoraNum(s.uid)]);
      var isSpk = !muted && (isSelfSpeaking || isRemoteSpeaking);
      el.classList.toggle("speak", isSpk);
      if (isSpk) activeNames.push(u.name || "مستخدم");
    });
    var spkEl = $("room-active-speaker");
    if (spkEl) spkEl.textContent = activeNames.length ? ("🎤 يتحدث الآن: " + activeNames.slice(0, 2).join("، ")) : "";
  }

  /* ========= الحالة والمزامنة ========= */
  var cloud = { on: false, db: null, auth: null, usersMap: {}, roomMsgs: {}, synced: false, connected: true, lastInitError: "" };
  var S = null;
  var UI = {
    page: "home", filter: "all", rfilter: "public", ftab: "friends", pftab: "overview",
    query: "", findQ: "", pfSocialQ: "", roomId: null, roomSessionStart: 0, floatingRoomId: null, dmId: null,
    micMuted: false, roomSpeakerMuted: false, musicVolume: 0.7, giftSel: "heart", giftTarget: "",
    authReady: false, authSigningIn: false, isGuest: false, googleUser: null,
    onboardPhoto: "", onboardGender: "ذكر", loadingRooms: false,
    pfSocialLimit: CONFIG.socialPageSize,
    dmLimits: {},
    activeDmListenerLimits: {},
    inFlightActions: {},
    pendingSeatActionAt: 0
  };
  global.S = null;
  global.UI = UI;

  var listenersMap = {};
  var seenGiftEventIds = {};
  var giftRankEvents = {};
  var giftRankListeners = {};
  var dmRecorder = null, dmChunks = [], isRecordingDm = false;
  var renderRafId = null;

  function isActionLocked(key) { return !!UI.inFlightActions[key]; }
  function setActionLock(key, locked) {
    if (locked) UI.inFlightActions[key] = true;
    else delete UI.inFlightActions[key];
  }

  function scheduleRenderAll() {
    if (renderRafId) return;
    renderRafId = requestAnimationFrame(function () {
      renderRafId = null;
      renderTop();
      renderCurrentPage();
    });
  }

  function setAuthError(msg) {
    var box = $("auth-error-box");
    if (!box) return;
    if (msg) { box.textContent = msg; box.classList.remove("hidden"); }
    else { box.textContent = ""; box.classList.add("hidden"); }
  }
  function setOnboardError(msg) {
    var box = $("onboard-error-box");
    if (!box) return;
    if (msg) { box.textContent = msg; box.classList.remove("hidden"); }
    else { box.textContent = ""; box.classList.add("hidden"); }
  }
  function onDb(key, ref, ev, fn) {
    ref.on(ev, fn);
    (listenersMap[key] = listenersMap[key] || []).push({ ref: ref, ev: ev, fn: fn });
  }
  function offDb(key) {
    (listenersMap[key] || []).forEach(function (x) { try { x.ref.off(x.ev, x.fn); } catch (e) { /* */ } });
    listenersMap[key] = [];
  }
  function cleanupAllListeners() {
    Object.keys(listenersMap).forEach(function (k) { offDb(k); });
    UI.activeDmListenerLimits = {};
    cloud.synced = false;
    cloud.usersMap = {};
    cloud.roomMsgs = {};
    giftRankListeners = {}; giftRankEvents = {};
  }

  function makeSeats(n) {
    var arr = [];
    for (var i = 0; i < n; i++) arr.push({ uid: null, locked: false, muted: false, vip: i === 0 });
    return arr;
  }

  function baseEmptyState(userId, isGuestVal) {
    var id = userId || "guest_session";
    return {
      isGuest: !!isGuestVal,
      me: {
        id: id, num: uidToAgoraNum(id), specialId: "", name: "", gender: "ذكر", age: "", email: "",
        photo: "", coverPhoto: "", bio: "مرحباً بك في REAL VOICE",
        xp: 0, level: 1, charm: 0, charmLevel: 1,
        coins: 0, senderBonusBalance: 0, recipientRewardBalance: 0,
        vip: 0, vipExpiresAt: 0,
        verified: false, isAdmin: false, followersCount: 0, followingCount: 0, friendsCount: 0,
        gifts: 0, receivedGifts: {}, receivedGiftLog: {}, joined: now()
      },
      users: [], rooms: [], customGifts: DEFAULT_GIFTS.slice(),
      luckyCatalog: DEFAULT_LUCKY_CATALOG.slice(),
      luckyOdds: DEFAULT_LUCKY_ODDS.slice(),
      appSettings: { luckyGiftsEnabled: false, allowCreateRoom: true, giftsEnabled: true },
      reports: [],
      friends: [], requests: [], sentReq: [], blocked: [], blockedBy: [], follows: [], followersList: [],
      relMeta: { friends: {}, followers: {}, following: {}, received: {}, sent: {}, blocked: {} },
      dms: {}, unread: {}, notifs: [], banners: [],
      settings: { notif: true, sound: true, lightTheme: false, hideFromSearch: false, privateAccount: false, stopMusicOnLeave: true }
    };
  }

  function resetInMemoryStateForSession(userId, isGuestVal) {
    S = baseEmptyState(userId, isGuestVal);
    global.S = S;
    UI.dmId = null; UI.roomId = null; UI.floatingRoomId = null; UI.dmLimits = {}; UI.activeDmListenerLimits = {};
    UI.pfSocialQ = ""; UI.pfSocialLimit = CONFIG.socialPageSize; UI.pendingSeatActionAt = 0;
    if ($("chat-view")) $("chat-view").classList.remove("open");
    if ($("room-view")) $("room-view").classList.remove("open");
    updateOverlayLock();
    renderFloatingOrb();
    applyThemeMode();
  }

  function applyThemeMode() { document.body.classList.toggle("light-theme", !!(S && S.settings && S.settings.lightTheme)); }

  function getUserStorageKey(userId, isGuestVal) {
    if (isGuestVal) return CONFIG.guestStorageKey + "_" + String(userId || "anon");
    return CONFIG.storageKeyPrefix + String(userId || "anon");
  }

  function loadUserLocalCache(userId, isGuestVal) {
    resetInMemoryStateForSession(userId, isGuestVal);
    try {
      var raw = localStorage.getItem(getUserStorageKey(userId, isGuestVal));
      if (!raw) return;
      var p = JSON.parse(raw);
      if (p && p.me && p.me.id === userId) {
        S = Object.assign({}, baseEmptyState(userId, isGuestVal), p, {
          me: Object.assign({}, baseEmptyState(userId, isGuestVal).me, p.me, { id: userId, num: uidToAgoraNum(userId) }),
          settings: Object.assign({}, baseEmptyState(userId, isGuestVal).settings, p.settings || {})
        });
        global.S = S;
        applyThemeMode();
      }
    } catch (e) { /* */ }
  }

  function saveLocal() {
    if (!S || !S.me || !S.me.id) return;
    try { localStorage.setItem(getUserStorageKey(S.me.id, UI.isGuest), JSON.stringify(S)); } catch (e) { /* */ }
  }

  function isValidOtherUid(otherId) { return !!(otherId && typeof otherId === "string" && S && S.me && otherId !== S.me.id); }
  function isFriendWith(otherId) { return isValidOtherUid(otherId) && Array.isArray(S.friends) && S.friends.indexOf(otherId) >= 0; }
  function isFollowingUser(otherId) { return isValidOtherUid(otherId) && Array.isArray(S.follows) && S.follows.indexOf(otherId) >= 0; }
  function isFollowedByUser(otherId) { return isValidOtherUid(otherId) && Array.isArray(S.followersList) && S.followersList.indexOf(otherId) >= 0; }
  function hasBlockedUser(otherId) { return isValidOtherUid(otherId) && Array.isArray(S.blocked) && S.blocked.indexOf(otherId) >= 0; }
  function isBlockedByUser(otherId) { return isValidOtherUid(otherId) && Array.isArray(S.blockedBy) && S.blockedBy.indexOf(otherId) >= 0; }
  function isBlockedEitherWay(otherId) { return hasBlockedUser(otherId) || isBlockedByUser(otherId); }
  function hasSentFriendReq(otherId) { return isValidOtherUid(otherId) && Array.isArray(S.sentReq) && S.sentReq.indexOf(otherId) >= 0; }
  function hasReceivedFriendReq(otherId) { return isValidOtherUid(otherId) && Array.isArray(S.requests) && S.requests.indexOf(otherId) >= 0; }

  function getRelationshipStatus(otherId) {
    if (!otherId || otherId === S.me.id) return { state: "self", following: false, followedBy: false, label: "أنت" };
    if (hasBlockedUser(otherId)) return { state: "blocked_by_me", following: false, followedBy: false, label: "محظور" };
    if (isBlockedByUser(otherId)) return { state: "blocked_by_them", following: false, followedBy: false, label: "غير متاح" };
    var following = isFollowingUser(otherId), followedBy = isFollowedByUser(otherId), state = "none", label = "لا توجد علاقة";
    if (isFriendWith(otherId)) { state = "friends"; label = "صديق"; }
    else if (hasSentFriendReq(otherId)) { state = "request_sent"; label = "طلب صداقة مرسل"; }
    else if (hasReceivedFriendReq(otherId)) { state = "request_received"; label = "طلب صداقة وارد"; }
    else if (following && followedBy) label = "متابعة متبادلة";
    else if (following) label = "أنت تتابعه";
    else if (followedBy) label = "يتابعك";
    return { state: state, following: following, followedBy: followedBy, label: label };
  }

  function getMyFollowersCount() { return Array.isArray(S.followersList) ? S.followersList.filter(function (id) { return !isBlockedEitherWay(id); }).length : 0; }
  function getMyFollowingCount() { return Array.isArray(S.follows) ? S.follows.filter(function (id) { return !isBlockedEitherWay(id); }).length : 0; }
  function getMyFriendsCount() { return Array.isArray(S.friends) ? S.friends.filter(function (id) { return !isBlockedEitherWay(id); }).length : 0; }

  function updateProfileRelationshipCounts() {
    var fCount = getMyFollowersCount(), ingCount = getMyFollowingCount(), frCount = getMyFriendsCount(), blkCount = Array.isArray(S.blocked) ? S.blocked.length : 0;
    S.me.followersCount = fCount; S.me.followingCount = ingCount; S.me.friendsCount = frCount;
    if ($("pf-followers-count")) $("pf-followers-count").textContent = String(fCount);
    if ($("pf-following-count")) $("pf-following-count").textContent = String(ingCount);
    if ($("pf-friends-count")) $("pf-friends-count").textContent = String(frCount);
    if ($("pf-blocked-count")) $("pf-blocked-count").textContent = String(blkCount);
    if ($("req-count")) $("req-count").textContent = S.requests.length ? "(" + S.requests.length + ")" : "";
    if ($("sent-count")) $("sent-count").textContent = S.sentReq.length ? "(" + S.sentReq.length + ")" : "";
  }

  function pushNotification(item) {
    if (!S || !S.settings || S.settings.notif === false) return;
    if (item && item.actorId && isBlockedEitherWay(item.actorId)) return;
    var entry = { id: uid(), type: item.type || "info", text: item.text || "إشعار جديد", t: now(), read: false };
    S.notifs.unshift(entry);
    if (S.notifs.length > 50) S.notifs = S.notifs.slice(0, 50);
    if (S.settings.sound !== false) toast("🔔 " + entry.text);
    if (cloud.on && cloud.db && !UI.isGuest && S.me && S.me.id) {
      cloud.db.ref("notifications/" + S.me.id).push(entry).catch(function () { /* */ });
    }
  }

  function save() {
    saveLocal();
    if (!S || !S.me || !S.me.id || UI.isGuest) return;
    var xpVal = Number(S.me.xp || 0), charmVal = Number(S.me.charm || 0);
    var lv = computeLevelFromXp(xpVal), cLv = getCharmLevel(charmVal);
    var followersTotal = getMyFollowersCount(), followingTotal = getMyFollowingCount(), friendsTotal = getMyFriendsCount();
    var activeVip = getEffectiveVip(S.me);

    S.me.level = lv; S.me.charmLevel = cLv;
    S.me.followersCount = followersTotal; S.me.followingCount = followingTotal; S.me.friendsCount = friendsTotal;
    if (!S.me.receivedGifts || typeof S.me.receivedGifts !== "object") S.me.receivedGifts = {};

    var publicProfilePayload = {
      id: S.me.id, num: S.me.num, specialId: S.me.specialId || formatSpecialId(CONFIG.initialSpecialIdNumber),
      name: S.me.name || "مستخدم", username: S.me.name || "مستخدم",
      gender: S.me.gender || "ذكر", age: S.me.age || "",
      photo: S.me.photo || "", coverPhoto: S.me.coverPhoto || "", bio: S.me.bio || "",
      xp: xpVal, level: lv, charm: charmVal, charmLevel: cLv,
      vip: activeVip, vipExpiresAt: Number(S.me.vipExpiresAt || 0), verified: !!S.me.verified,
      followersCount: followersTotal, followingCount: followingTotal, friendsCount: friendsTotal,
      receivedGifts: S.me.receivedGifts, receivedGiftLog: S.me.receivedGiftLog || {}, gifts: Number(S.me.gifts || 0),
      hideFromSearch: !!(S.settings && S.settings.hideFromSearch),
      online: true, updatedAt: serverTs()
    };

    cloud.usersMap[S.me.id] = Object.assign({}, cloud.usersMap[S.me.id] || {}, publicProfilePayload);

    if (cloud.on && cloud.db) {
      var updates = {};
      updates["publicProfiles/" + S.me.id] = publicProfilePayload;
      updates["users/" + S.me.id + "/name"] = publicProfilePayload.name;
      updates["users/" + S.me.id + "/photo"] = publicProfilePayload.photo;
      updates["users/" + S.me.id + "/bio"] = publicProfilePayload.bio;
      updates["users/" + S.me.id + "/gender"] = publicProfilePayload.gender;
      updates["users/" + S.me.id + "/age"] = publicProfilePayload.age;
      if (S.me.specialId) updates["users/" + S.me.id + "/specialId"] = S.me.specialId;
      updates["users/" + S.me.id + "/online"] = true;
      updates["users/" + S.me.id + "/updatedAt"] = serverTs();
      cloud.db.ref().update(updates).catch(function () { /* */ });
    }
  }

  function resolveLiveUser(id) {
    if (!id) return { id: "", num: 0, specialId: formatSpecialId(CONFIG.initialSpecialIdNumber), name: "مستخدم", gender: "", age: "", photo: "", coverPhoto: "", bio: "", online: false, level: 1, vip: 0, verified: false, followersCount: 0, followingCount: 0, friendsCount: 0, receivedGifts: {}, exists: false };
    if (id === S.me.id) {
      return Object.assign({}, cloud.usersMap[id] || {}, S.me, {
        level: computeLevelFromXp(S.me.xp || 0), vip: getEffectiveVip(S.me),
        followersCount: getMyFollowersCount(), followingCount: getMyFollowingCount(), friendsCount: getMyFriendsCount(),
        me: true, exists: true
      });
    }
    var fromCloud = cloud.usersMap[id], fromLocal = null;
    for (var i = 0; i < (S.users || []).length; i++) {
      if (S.users[i].id === id) { fromLocal = S.users[i]; break; }
    }
    var exists = !!(fromCloud || fromLocal);
    var base = Object.assign({
      id: id, num: uidToAgoraNum(id), specialId: "", name: exists ? "مستخدم" : "حساب غير متاح",
      gender: "", age: "", photo: "", coverPhoto: "", bio: "", online: false, level: 1, vip: 0, verified: false,
      followersCount: 0, followingCount: 0, friendsCount: 0, receivedGifts: {}
    }, fromLocal || {}, fromCloud || {});
    base.vip = getEffectiveVip(base);
    base.exists = exists;
    if (!base.name) base.name = exists ? "مستخدم" : "حساب غير متاح";
    return base;
  }

  function ensureCloudReadyForWrite() {
    if (UI.isGuest) { toast("هذه الميزة تتطلب الاتصال بحساب التطبيق"); return false; }
    if (!cloud.on || !cloud.db) { toast("قاعدة البيانات غير متصلة حالياً"); return false; }
    if (!cloud.connected) { toast("لا يوجد اتصال بالإنترنت — تحقق من الشبكة"); return false; }
    return true;
  }

  function getOrCreateGuestId() {
    try {
      var existing = localStorage.getItem(CONFIG.guestSessionIdKey);
      if (existing && /^guest_[A-Za-z0-9_]+$/.test(existing)) return existing;
      var created = "guest_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
      localStorage.setItem(CONFIG.guestSessionIdKey, created);
      return created;
    } catch (e) {
      return "guest_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
    }
  }

  function isGuestSession() {
    try { return !UI.googleUser && localStorage.getItem(CONFIG.guestModeKey) === "1"; } catch (e) { return false; }
  }
  function setGuestSession(enabled) {
    UI.isGuest = !!enabled;
    try {
      if (enabled) localStorage.setItem(CONFIG.guestModeKey, "1");
      else localStorage.removeItem(CONFIG.guestModeKey);
    } catch (e) { /* */ }
  }
  function isOnboardDoneForUser(userId, isGuestVal) {
    if (!userId) return false;
    try {
      var flag = localStorage.getItem(CONFIG.onboardDoneKeyPrefix + (isGuestVal ? "guest_" : "") + userId) === "1";
      return flag || !!(S && S.me && S.me.id === userId && S.me.name && String(S.me.name).trim());
    } catch (e) { return false; }
  }
  function setOnboardDoneForUser(userId, isGuestVal, v) {
    if (!userId) return;
    try {
      var k = CONFIG.onboardDoneKeyPrefix + (isGuestVal ? "guest_" : "") + userId;
      if (v) localStorage.setItem(k, "1");
      else localStorage.removeItem(k);
    } catch (e) { /* */ }
  }

  function showAuthGate(show, step) {
    var g = $("auth-gate");
    if (!g) return;
    g.classList.toggle("hidden", !show);
    if (!show) return;
    var loginBox = $("auth-step-login");
    var obBox = $("auth-step-onboard");
    var hasActiveSession = !!UI.googleUser || isGuestSession();
    var targetStep = step || (hasActiveSession ? "onboard" : "login");
    if (loginBox) loginBox.classList.toggle("hidden", targetStep !== "login");
    if (obBox) obBox.classList.toggle("hidden", targetStep !== "onboard");
    if (targetStep === "onboard") {
      setOnboardError("");
      if ($("ob-name")) $("ob-name").value = (S && S.me && S.me.name) || "";
      if ($("ob-age")) $("ob-age").value = (S && S.me && S.me.age) || "";
      UI.onboardPhoto = (S && S.me && S.me.photo) || "";
      UI.onboardGender = (S && S.me && S.me.gender) || "ذكر";
      renderOnboardPreview();
      document.querySelectorAll(".gender-pill").forEach(function (p) {
        p.classList.toggle("active", p.getAttribute("data-gender") === UI.onboardGender);
      });
    }
  }

  function renderOnboardPreview() {
    var prev = $("ob-av-preview");
    if (!prev) return;
    var nm = ($("ob-name") && $("ob-name").value.trim()) || (S && S.me && S.me.name) || "RV";
    if (UI.onboardPhoto) prev.innerHTML = '<img src="' + esc(UI.onboardPhoto) + '" alt="" />';
    else prev.textContent = initials(nm);
  }

  function initCloud() {
    cloud.lastInitError = "";
    if (!global.firebase || !FIREBASE_CONFIG.apiKey) {
      cloud.on = false;
      cloud.lastInitError = "مكتبة Firebase غير متوفرة";
      return false;
    }
    try {
      var app = firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
      cloud.db = firebase.database(app);
      cloud.auth = firebase.auth(app);
      cloud.on = true;
      cloud.db.ref(".info/connected").on("value", function (snap) {
        cloud.connected = !!snap.val();
      });
      return true;
    } catch (e) {
      cloud.on = false;
      cloud.lastInitError = e && e.message ? e.message : "خطأ في تهيئة Firebase";
      return false;
    }
  }

  async function ensureSequentialSpecialId(userId) {
    if (!userId) return formatSpecialId(CONFIG.initialSpecialIdNumber);
    if (S.me.specialId && /^\d{7}$/.test(S.me.specialId) && Number(S.me.specialId) >= CONFIG.initialSpecialIdNumber) {
      return S.me.specialId;
    }
    if (!cloud.on || !cloud.db || UI.isGuest) {
      if (!S.me.specialId || Number(S.me.specialId) < CONFIG.initialSpecialIdNumber) {
        S.me.specialId = formatSpecialId(CONFIG.initialSpecialIdNumber);
      }
      return S.me.specialId;
    }

    try {
      var existingSnap = await cloud.db.ref("users/" + userId + "/specialId").once("value");
      var existingVal = existingSnap.val();
      if (typeof existingVal === "string" && /^\d{7}$/.test(existingVal.trim()) && Number(existingVal.trim()) >= CONFIG.initialSpecialIdNumber) {
        S.me.specialId = existingVal.trim();
        await cloud.db.ref("publicProfiles/" + userId + "/specialId").set(S.me.specialId);
        return S.me.specialId;
      }

      var profilesSnap = await cloud.db.ref("publicProfiles").once("value");
      var allProfiles = profilesSnap.val() || {};
      var maxExistingNum = CONFIG.initialSpecialIdNumber - 1;
      var usedIdsSet = {};
      Object.keys(allProfiles).forEach(function (k) {
        var sid = String((allProfiles[k] && allProfiles[k].specialId) || "").trim();
        if (/^\d{7}$/.test(sid)) {
          usedIdsSet[sid] = true;
          var numVal = Number(sid);
          if (numVal > maxExistingNum) maxExistingNum = numVal;
        }
      });

      var limitReached = false;
      var assigned = null;
      await cloud.db.ref("system/userIdCounter/lastAssignedId").transaction(function (curr) {
        var baseNum = typeof curr === "number" && isFinite(curr) ? Math.floor(curr) : (CONFIG.initialSpecialIdNumber - 1);
        if (maxExistingNum > baseNum) baseNum = maxExistingNum;
        if (baseNum >= CONFIG.maxSpecialIdNumber) { limitReached = true; return baseNum; }
        var candidateNum = Math.max(CONFIG.initialSpecialIdNumber, baseNum + 1);
        var candidateStr = formatSpecialId(candidateNum);
        while (usedIdsSet[candidateStr] && candidateNum < CONFIG.maxSpecialIdNumber) {
          candidateNum++;
          candidateStr = formatSpecialId(candidateNum);
        }
        if (candidateNum > CONFIG.maxSpecialIdNumber || usedIdsSet[candidateStr]) {
          limitReached = true;
          return baseNum;
        }
        assigned = candidateStr;
        return candidateNum;
      });

      if (!limitReached && assigned) {
        S.me.specialId = assigned;
        await cloud.db.ref("users/" + userId + "/specialId").set(assigned);
        await cloud.db.ref("publicProfiles/" + userId + "/specialId").set(assigned);
      }
      return S.me.specialId || formatSpecialId(CONFIG.initialSpecialIdNumber);
    } catch (e) {
      if (!S.me.specialId || Number(S.me.specialId) < CONFIG.initialSpecialIdNumber) {
        S.me.specialId = formatSpecialId(CONFIG.initialSpecialIdNumber);
      }
      return S.me.specialId;
    }
  }

  /* إنشاء غرفة تلقائية لكل مستخدم جديد وتظهر لجميع المستخدمين */
  async function ensureAutoPersonalRoom(userId, userName) {
    if (!userId || UI.isGuest || !cloud.on || !cloud.db) return null;
    try {
      var idxSnap = await cloud.db.ref("userRoomIndex/" + userId).once("value");
      var existingRoomId = idxSnap.val();
      if (existingRoomId) {
        var rmSnap = await cloud.db.ref("rooms/" + existingRoomId).once("value");
        if (rmSnap.exists()) return existingRoomId;
      }

      var myRoomsSnap = await cloud.db.ref("rooms").orderByChild("owner").equalTo(userId).limitToFirst(1).once("value");
      var myRoomsVal = myRoomsSnap.val();
      if (myRoomsVal) {
        var foundId = Object.keys(myRoomsVal)[0];
        if (foundId) {
          await cloud.db.ref("userRoomIndex/" + userId).set(foundId).catch(function () { /* */ });
          return foundId;
        }
      }

      var roomId = "room_" + userId;
      var reservation = await cloud.db.ref("userRoomIndex/" + userId).transaction(function (curr) {
        return curr == null ? roomId : undefined;
      });
      if (!reservation.committed) return reservation.snapshot.val();

      var cleanName = clean(userName || S.me.name || "عضو جديد").trim();
      var roomPayload = {
        name: "غرفة " + cleanName,
        desc: "أهلاً بكم في غرفة " + cleanName + " الصوتية 🎙️",
        cat: "chat",
        owner: userId,
        seatCount: 9,
        seats: makeSeats(9),
        micApprovalMode: false,
        priv: false,
        passcode: "",
        locked: false,
        adminOrder: 1000,
        created: serverTs(),
        color: uidToAgoraNum(userId) % COVERS.length,
        icon: uidToAgoraNum(userId) % COVER_ICONS.length,
        roomPhoto: S.me.photo || ""
      };
      await cloud.db.ref("rooms/" + roomId).set(roomPayload);
      await cloud.db.ref("users/" + userId + "/autoRoomCreated").set(true).catch(function () { /* */ });
      var norm = normalizeRoom(roomId, Object.assign({}, roomPayload, { created: now() }));
      S.rooms = dedupeRoomsList([norm].concat(S.rooms || []));
      saveLocal();
      return roomId;
    } catch (e) {
      return null;
    }
  }

  function normalizeRoom(id, r) {
    r = r || {};
    var existing = getRoom(id);
    var n = Number(r.seatCount) || (Array.isArray(r.seats) ? r.seats.length : (existing && existing.seats ? existing.seats.length : 9)) || 9;
    var seats = [];
    for (var i = 0; i < n; i++) {
      var s = (r.seats && r.seats[i]) || {};
      var prevS = (existing && existing.seats && existing.seats[i]) || {};
      seats.push({
        uid: s.uid != null ? s.uid : null,
        locked: s.locked != null ? !!s.locked : !!prevS.locked,
        muted: s.muted != null ? !!s.muted : !!prevS.muted,
        vip: s.vip != null ? !!s.vip : (prevS.vip != null ? !!prevS.vip : i === 0)
      });
    }

    var myId = S && S.me ? S.me.id : null;
    var isCurrentActiveRoom = myId && (UI.roomId === id || UI.floatingRoomId === id);
    if (isCurrentActiveRoom && existing && Array.isArray(existing.seats)) {
      var localMySeatIdx = -1;
      for (var k = 0; k < existing.seats.length; k++) {
        if (existing.seats[k] && existing.seats[k].uid === myId) { localMySeatIdx = k; break; }
      }
      var cloudHasMe = seats.some(function (x) { return x && x.uid === myId; });
      if (localMySeatIdx >= 0 && localMySeatIdx < seats.length && !cloudHasMe) {
        var recentLocalAction = (now() - (UI.pendingSeatActionAt || 0)) < 2500;
        var slotFreeInCloud = !seats[localMySeatIdx].uid && !seats[localMySeatIdx].locked;
        if (recentLocalAction || slotFreeInCloud) {
          seats[localMySeatIdx].uid = myId;
          seats[localMySeatIdx].muted = !!existing.seats[localMySeatIdx].muted;
        }
      }
    }

    var seenSeatUids = {};
    for (var j = 0; j < seats.length; j++) {
      var uOnSeat = seats[j].uid;
      if (uOnSeat) {
        if (seenSeatUids[uOnSeat]) { seats[j].uid = null; seats[j].muted = false; }
        else seenSeatUids[uOnSeat] = true;
      }
    }

    var listenersArr = Array.isArray(r.listeners) ? r.listeners : Object.keys(r.listeners || {}).filter(function (k) { return r.listeners[k]; });
    listenersArr = listenersArr.filter(function (lid) { return !seenSeatUids[lid]; });
    var handArr = Array.isArray(r.handRequests) ? r.handRequests : Object.keys(r.handRequests || {}).filter(function (k) { return r.handRequests[k]; });
    var modsArr = Array.isArray(r.mods) ? r.mods : Object.keys(r.mods || {}).filter(function (k) { return r.mods[k]; });
    var bansArr = Array.isArray(r.bans) ? r.bans : Object.keys(r.bans || {}).filter(function (k) { return r.bans[k]; });

    return {
      id: id, name: r.name || (existing && existing.name) || "غرفة",
      adminOrder: Number(r.adminOrder != null ? r.adminOrder : (existing && existing.adminOrder != null ? existing.adminOrder : 1000)),
      desc: r.desc != null ? r.desc : ((existing && existing.desc) || ""),
      cat: r.cat || "chat", owner: r.owner || "", mods: modsArr, seats: seats,
      listeners: listenersArr, handRequests: handArr,
      micApprovalMode: r.micApprovalMode != null ? !!r.micApprovalMode : !!(existing && existing.micApprovalMode),
      bans: bansArr, priv: !!r.priv, passcode: r.passcode || (existing && existing.passcode) || "",
      locked: !!r.locked, pinned: r.pinned != null ? r.pinned : ((existing && existing.pinned) || ""),
      created: typeof r.created === "number" ? r.created : ((existing && existing.created) || now()),
      color: r.color != null ? r.color : 0, icon: r.icon != null ? r.icon : 0,
      roomPhoto: r.roomPhoto || (existing && existing.roomPhoto) || "",
      music: r.music || null,
      playlist: Array.isArray(r.playlist) ? r.playlist : ((existing && existing.playlist) || DEFAULT_TRACKS.slice()),
      msgs: cloud.roomMsgs[id] || (existing && existing.msgs) || r.msgs || []
    };
  }

  function dedupeRoomsList(roomArr) {
    var seen = {}, out = [];
    (roomArr || []).forEach(function (rm) {
      if (!rm || !rm.id || seen[rm.id]) return;
      seen[rm.id] = true;
      out.push(rm);
    });
    return out;
  }

  function attachDmThreadListener(myId, peerId, customLimit) {
    if (!cloud.on || !cloud.db || !peerId || isBlockedEitherWay(peerId) || UI.isGuest) return;
    var limit = customLimit || UI.dmLimits[peerId] || CONFIG.dmInitialLimit;
    UI.dmLimits[peerId] = limit;
    var tid = dmThreadId(myId, peerId);
    if (UI.activeDmListenerLimits[tid] === limit) return;
    UI.activeDmListenerLimits[tid] = limit;
    var key = "dm_" + tid;
    offDb(key);
    onDb(key, cloud.db.ref("dms/" + tid).limitToLast(limit), "value", function (ms) {
      if (isBlockedEitherWay(peerId)) return;
      var v = ms.val() || {};
      var arr = Object.keys(v).map(function (k) { return Object.assign({ key: k }, v[k]); });
      arr.sort(function (a, b) { return (a.t || 0) - (b.t || 0); });
      var prevLen = (S.dms[peerId] || []).length;
      S.dms[peerId] = arr;
      if (arr.length > prevLen && UI.dmId !== peerId) {
        var last = arr[arr.length - 1];
        if (last && last.from !== myId && !isBlockedEitherWay(last.from)) {
          S.unread[peerId] = (S.unread[peerId] || 0) + 1;
          var senderU = resolveLiveUser(last.from);
          pushNotification({ type: "dm", actorId: last.from, text: "رسالة جديدة من " + senderU.name });
        }
      }
      if (UI.dmId === peerId) markThreadMessagesRead(peerId);
      saveLocal();
      if (UI.page === "messages") renderMessages();
      if (UI.dmId === peerId) renderDM();
      renderTop();
    });
  }

  function extractRelationKeys(obj) {
    if (!obj || typeof obj !== "object") return [];
    return Object.keys(obj).filter(function (k) { return !!obj[k]; });
  }

  function attachRealtimeListeners(myId) {
    if (!cloud.on || !cloud.db || cloud.synced || UI.isGuest) return;
    cloud.synced = true;
    UI.loadingRooms = true;
    initializeMyWallet();

    onDb("wallet_balance", cloud.db.ref("economy/wallets/" + myId), "value", function (snap) {
      var w = snap.val() || {};
      var bal = typeof w === "object" ? Number(w.balance != null ? w.balance : (w.coins != null ? w.coins : 0)) : Number(w || 0);
      var sBonus = typeof w === "object" ? Number(w.senderBonusBalance || 0) : 0;
      var rReward = typeof w === "object" ? Number(w.recipientRewardBalance || 0) : 0;
      S.me.coins = Math.max(0, Number.isFinite(bal) ? bal : 0);
      S.me.senderBonusBalance = Math.max(0, Number.isFinite(sBonus) ? sBonus : 0);
      S.me.recipientRewardBalance = Math.max(0, Number.isFinite(rReward) ? rReward : 0);
      saveLocal();
      renderTop();
      var totalSpendable = getTotalSpendableCoins();
      if ($("pf-wallet-coins")) $("pf-wallet-coins").textContent = totalSpendable.toLocaleString("en-US");
      if ($("pf-lucky-reward-bal")) $("pf-lucky-reward-bal").textContent = S.me.recipientRewardBalance.toLocaleString("en-US");
      if ($("room-wallet-balance")) $("room-wallet-balance").textContent = totalSpendable.toLocaleString("en-US");
      if (UI.page === "profile") renderProfile();
    });

    onDb("app", cloud.db.ref("app_settings"), "value", function (snap) {
      var st = snap.val() || {};
      S.appSettings = Object.assign({ luckyGiftsEnabled: false, allowCreateRoom: true, giftsEnabled: true }, st);
      var mBanner = $("maintenance-banner");
      if (mBanner) {
        if (st.maintenanceMode) {
          mBanner.textContent = st.maintenanceMessage || "التطبيق قيد الصيانة حالياً";
          mBanner.classList.remove("hidden");
        } else {
          mBanner.classList.add("hidden");
        }
      }
      saveLocal();
    });

    onDb("app", cloud.db.ref("luckyGifts/catalog"), "value", function (snap) {
      var val = snap.val();
      if (val && typeof val === "object") {
        var arr = Object.keys(val).map(function (k) { return Object.assign({ id: k }, val[k]); })
          .filter(function (x) { return x && x.active !== false; })
          .sort(function (a, b) { return Number(a.sortOrder || 99) - Number(b.sortOrder || 99); });
        if (arr.length) {
          S.luckyCatalog = arr;
          saveLocal();
        }
      }
    });

    try {
      var pubRef = cloud.db.ref("publicProfiles/" + myId);
      pubRef.child("online").onDisconnect().set(false);
      pubRef.update({ online: true, specialId: S.me.specialId || "" }).catch(function () { /* */ });
      var uRef = cloud.db.ref("users/" + myId);
      uRef.child("online").onDisconnect().set(false);
      uRef.update({ online: true }).catch(function () { /* */ });
    } catch (e) { /* */ }

    onDb("app", cloud.db.ref("gifts"), "value", function (giftSnap) {
      var rawGifts = giftSnap.val() || {};
      var remoteGifts = Object.keys(rawGifts).map(function (key) {
        var g = rawGifts[key] || {};
        return {
          id: String(g.id || key), e: String(g.e || g.emoji || "🎁"), n: String(g.n || g.name || "هدية"),
          p: Math.max(0, Number(g.p != null ? g.p : g.price || 0)), vipMin: Math.max(0, Number(g.vipMin || 0)),
          image: String(g.gifUrl || g.image || ""), active: g.active !== false, category: String(g.cat || g.category || "عام"), order: Number(g.order || 0)
        };
      }).filter(function (g) { return g.active; });
      if (S && remoteGifts.length) { S.customGifts = remoteGifts; saveLocal(); }
      if (S) S.boxGifts = remoteGifts.slice().sort(function (a, b) { return a.order - b.order; });
    });

    onDb("app", cloud.db.ref("publicProfiles"), "value", function (ps) {
      var val = ps.val() || {};
      cloud.usersMap = val;
      S.users = Object.keys(val).filter(function (k) { return k !== S.me.id; }).map(function (k) {
        return Object.assign({ id: k }, val[k]);
      });
      saveLocal();
      scheduleRenderAll();
    });

    var myUserBase = cloud.db.ref("users/" + myId);

    onDb("app", myUserBase, "value", function (us) {
      var priv = us.val() || {};
      if (typeof priv.vip === "number") S.me.vip = priv.vip;
      if (typeof priv.vipExpiresAt === "number") S.me.vipExpiresAt = priv.vipExpiresAt;
      if (typeof priv.charm === "number") S.me.charm = Math.max(Number(S.me.charm || 0), priv.charm);
      if (typeof priv.isAdmin === "boolean") S.me.isAdmin = priv.isAdmin;
      if (typeof priv.verified === "boolean") S.me.verified = priv.verified;
      if (typeof priv.specialId === "string" && /^\d{7}$/.test(priv.specialId.trim()) && Number(priv.specialId.trim()) >= CONFIG.initialSpecialIdNumber) {
        S.me.specialId = priv.specialId.trim();
      }
      if (priv.receivedGifts && typeof priv.receivedGifts === "object") S.me.receivedGifts = Object.assign({}, priv.receivedGifts);
      if (priv.receivedGiftLog && typeof priv.receivedGiftLog === "object") S.me.receivedGiftLog = Object.assign({}, priv.receivedGiftLog);
      saveLocal();
      scheduleRenderAll();
    });

    onDb("rel_followers", myUserBase.child("followers"), "value", function (snap) {
      var data = snap.val() || {};
      var prevFollowers = S.followersList || [];
      var newFollowers = extractRelationKeys(data);
      newFollowers.forEach(function (fId) {
        if (prevFollowers.indexOf(fId) < 0 && !isBlockedEitherWay(fId)) {
          pushNotification({ type: "follow", actorId: fId, text: "بدأ " + resolveLiveUser(fId).name + " بمتابعتك ✨" });
        }
      });
      S.relMeta.followers = data; S.followersList = newFollowers;
      updateProfileRelationshipCounts(); saveLocal(); scheduleRenderAll();
    });

    onDb("rel_following", myUserBase.child("following"), "value", function (snap) {
      var data = snap.val() || {};
      S.relMeta.following = data; S.follows = extractRelationKeys(data);
      updateProfileRelationshipCounts(); saveLocal(); scheduleRenderAll();
    });

    onDb("rel_friends", myUserBase.child("friends"), "value", function (snap) {
      var data = snap.val() || {};
      S.relMeta.friends = data; S.friends = extractRelationKeys(data);
      S.friends.forEach(function (fid) {
        if (!isBlockedEitherWay(fid)) {
          if (!S.dms[fid]) S.dms[fid] = [];
          attachDmThreadListener(myId, fid);
        }
      });
      if (UI.dmId && !isFriendWith(UI.dmId)) closeDM();
      updateProfileRelationshipCounts(); saveLocal(); scheduleRenderAll();
    });

    onDb("rel_req_in", myUserBase.child("friendRequestsReceived"), "value", function (snap) {
      var data = snap.val() || {};
      var prevReqs = S.requests || [];
      var newReqs = extractRelationKeys(data);
      newReqs.forEach(function (reqId) {
        if (prevReqs.indexOf(reqId) < 0 && !isBlockedEitherWay(reqId)) {
          pushNotification({ type: "friend_req", actorId: reqId, text: "طلب صداقة جديد من " + resolveLiveUser(reqId).name });
        }
      });
      S.relMeta.received = data; S.requests = newReqs;
      updateProfileRelationshipCounts(); saveLocal(); scheduleRenderAll();
    });

    onDb("rel_req_out", myUserBase.child("friendRequestsSent"), "value", function (snap) {
      var data = snap.val() || {};
      S.relMeta.sent = data; S.sentReq = extractRelationKeys(data);
      updateProfileRelationshipCounts(); saveLocal(); scheduleRenderAll();
    });

    onDb("rel_blocked", myUserBase.child("blockedUsers"), "value", function (snap) {
      var data = snap.val() || {};
      S.relMeta.blocked = data; S.blocked = extractRelationKeys(data);
      if (UI.dmId && isBlockedEitherWay(UI.dmId)) closeDM();
      updateProfileRelationshipCounts(); saveLocal(); scheduleRenderAll();
    });

    onDb("rel_blocked_by", myUserBase.child("blockedBy"), "value", function (snap) {
      var data = snap.val() || {};
      S.blockedBy = extractRelationKeys(data);
      if (UI.dmId && isBlockedEitherWay(UI.dmId)) closeDM();
      updateProfileRelationshipCounts(); saveLocal(); scheduleRenderAll();
    });

    onDb("app", cloud.db.ref("rooms"), "value", function (rs) {
      UI.loadingRooms = false;
      var val = rs.val() || {};
      var list = Object.keys(val).map(function (rid) { return normalizeRoom(rid, val[rid]); });
      S.rooms = dedupeRoomsList(list);
      syncGiftRankListeners(S.rooms);
      if (UI.roomId) {
        var cur = getRoom(UI.roomId);
        if (!cur || (Array.isArray(cur.bans) && cur.bans.indexOf(S.me.id) >= 0) || isBlockedEitherWay(cur.owner)) {
          leaveRoom(false);
        } else {
          syncMicHardwareState();
          syncRoomMusicPlayer(cur);
          renderRoom();
        }
      } else if (UI.floatingRoomId) {
        var fRoom = getRoom(UI.floatingRoomId);
        if (!fRoom) { UI.floatingRoomId = null; renderFloatingOrb(); }
        else syncRoomMusicPlayer(fRoom);
      }
      renderFloatingOrb();
      if (UI.page === "home") renderHome();
      else if (UI.page === "rooms") renderRooms();
      else if (UI.page === "friends") renderFriends();
    });

    onDb("app", cloud.db.ref("userDms/" + myId), "value", function (ds) {
      var threads = ds.val() || {};
      Object.keys(threads).forEach(function (peerId) {
        if (!threads[peerId]) return;
        if (!isBlockedEitherWay(peerId) && isFriendWith(peerId)) {
          if (!S.dms[peerId]) S.dms[peerId] = [];
          attachDmThreadListener(myId, peerId);
        }
      });
    });

    onDb("app", cloud.db.ref("banners"), "value", function (bs) {
      var bv = bs.val();
      if (Array.isArray(bv)) S.banners = bv.filter(Boolean);
      else if (bv && typeof bv === "object") S.banners = Object.keys(bv).map(function (k) { return bv[k]; }).filter(Boolean);
      saveLocal();
      if (UI.page === "home") renderHomeBanners();
    });
  }

  async function syncUserCloudProfile(targetId) {
    var myId = targetId;
    if (!myId) return;
    S.me.id = myId; S.me.num = uidToAgoraNum(myId);
    if (!cloud.on || !cloud.db || UI.isGuest) {
      await ensureSequentialSpecialId(myId);
      return;
    }
    try {
      var results = await Promise.all([
        cloud.db.ref("users/" + myId).once("value"),
        cloud.db.ref("publicProfiles/" + myId).once("value")
      ]);
      var priv = results[0].val() || {}, pub = results[1].val() || {};
      S.me = Object.assign({}, S.me, pub, priv, {
        id: myId, num: uidToAgoraNum(myId),
        name: (pub.name || priv.name || S.me.name || ""),
        email: (priv.email || S.me.email || ""),
        photo: (pub.photo || priv.photo || S.me.photo || ""),
        coverPhoto: (pub.coverPhoto || priv.coverPhoto || S.me.coverPhoto || ""),
        bio: (pub.bio || priv.bio || S.me.bio || ""),
        receivedGifts: Object.assign({}, priv.receivedGifts || pub.receivedGifts || {})
      });
      if (S.me.name && String(S.me.name).trim()) setOnboardDoneForUser(myId, false, true);
    } catch (e) { /* */ }
    await ensureSequentialSpecialId(myId);
    attachRealtimeListeners(myId);
  }

  async function handleAuthenticatedUser(gUser) {
    try {
      await handleAuthenticatedUserInner(gUser);
    } catch (err) {
      if (global.console) console.error("auth flow error:", err);
      try { UI.authReady = true; showAuthGate(false); scheduleRenderAll(); } catch (e2) { /* */ }
    } finally {
      hideSplash();
    }
  }

  async function handleAuthenticatedUserInner(gUser) {
    if (!gUser || !gUser.uid) return;
    setAuthError(""); setGuestSession(false); UI.googleUser = gUser;
    var uidVal = gUser.uid;
    loadUserLocalCache(uidVal, false);
    S.me.id = uidVal; S.me.num = uidToAgoraNum(uidVal);
    if (gUser.email) S.me.email = gUser.email;
    if (gUser.displayName && !S.me.name) S.me.name = clean(gUser.displayName);
    if (gUser.photoURL && !S.me.photo) S.me.photo = gUser.photoURL;

    await syncUserCloudProfile(uidVal);
    if (!S.me.name || !String(S.me.name).trim()) {
      S.me.name = clean(gUser.displayName || (gUser.email ? gUser.email.split("@")[0] : "مستخدم"));
    }
    setOnboardDoneForUser(uidVal, false, true);
    UI.authReady = true;
    showAuthGate(false);
    save();
    /* إنشاء غرفة تلقائية للمستخدم الجديد وتظهر لجميع المستخدمين */
    ensureAutoPersonalRoom(uidVal, S.me.name);
    scheduleRenderAll();
    hideSplash();
  }

  async function signInWithGoogleApp() {
    setAuthError("");
    if (UI.authSigningIn) return;
    if (!cloud.on || !cloud.auth) initCloud();
    if (!cloud.on || !cloud.auth) {
      setAuthError("تعذر تهيئة Firebase في الصفحة: " + (cloud.lastInitError || "تحقق من تحميل سكربتات Firebase"));
      return;
    }

    UI.authSigningIn = true;
    var btn = $("google-login-btn");
    if (btn) { btn.disabled = true; btn.textContent = "جاري الاتصال بـ Google..."; }
    try {
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      var res = await cloud.auth.signInWithPopup(provider);
      if (res && res.user) await handleAuthenticatedUser(res.user);
    } catch (e) {
      var code = e && e.code ? e.code : "";
      if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user" || code === "auth/operation-not-supported-in-this-environment") {
        try {
          var providerRedir = new firebase.auth.GoogleAuthProvider();
          providerRedir.setCustomParameters({ prompt: "select_account" });
          await cloud.auth.signInWithRedirect(providerRedir);
          return;
        } catch (redirErr) { e = redirErr; code = redirErr && redirErr.code ? redirErr.code : code; }
      }
      setAuthError("تعذر تسجيل الدخول بحساب Google (" + (code || "error") + "): " + (e && e.message ? e.message : "خطأ"));
    } finally {
      UI.authSigningIn = false;
      if (btn) { btn.disabled = false; btn.textContent = "تسجيل الدخول بحساب Google"; }
    }
  }

  async function startWithoutGoogle() {
    setAuthError("");
    if (UI.authSigningIn) return;
    if (!cloud.on || !cloud.auth) initCloud();
    UI.authSigningIn = true;
    var btn = $("guest-login-btn");
    if (btn) { btn.disabled = true; btn.textContent = "جاري بدء التطبيق..."; }
    try {
      if (cloud.on && cloud.auth) {
        var current = cloud.auth.currentUser;
        if (!current) await cloud.auth.signInAnonymously();
        else await handleAuthenticatedUser(current);
      } else {
        await signInAsGuest();
      }
    } catch (e) {
      await signInAsGuest();
    } finally {
      UI.authSigningIn = false;
      if (btn) { btn.disabled = false; btn.textContent = "الدخول كزائر"; }
    }
  }

  async function signInAsGuest() {
    setAuthError(""); UI.googleUser = null; setGuestSession(true);
    var guestId = getOrCreateGuestId();
    loadUserLocalCache(guestId, true);
    S.me.id = guestId; S.me.num = uidToAgoraNum(guestId); S.me.specialId = formatSpecialId(CONFIG.initialSpecialIdNumber);
    hideSplash();
    if (isOnboardDoneForUser(guestId, true)) {
      UI.authReady = true; showAuthGate(false); saveLocal(); scheduleRenderAll();
      toast("تم الدخول كزائر");
    } else {
      showAuthGate(true, "onboard");
    }
  }

  async function signOutApp() {
    closeSheet();
    if (UI.roomId || UI.floatingRoomId) await leaveRoom(true);
    if (UI.dmId) closeDM();
    if (cloud.on && cloud.db && !UI.isGuest && S && S.me && S.me.id) {
      try {
        await cloud.db.ref("publicProfiles/" + S.me.id + "/online").set(false);
        await cloud.db.ref("users/" + S.me.id + "/online").set(false);
      } catch (e) { /* */ }
    }
    cleanupAllListeners();
    var prevId = S && S.me ? S.me.id : null, wasGuest = UI.isGuest;
    try {
      if (prevId) localStorage.removeItem(getUserStorageKey(prevId, wasGuest));
      if (wasGuest) localStorage.removeItem(CONFIG.guestSessionIdKey);
    } catch (e) { /* */ }
    UI.googleUser = null; UI.authReady = false; setGuestSession(false);
    resetInMemoryStateForSession("guest_session", false); renderAll();
    if (cloud.on && cloud.auth && cloud.auth.currentUser) {
      try { await cloud.auth.signOut(); } catch (e) { /* */ }
    }
    showAuthGate(true, "login");
    toast("تم تسجيل الخروج بنجاح");
  }

  function completeOnboarding() {
    var nameInput = $("ob-name"), ageInput = $("ob-age");
    var nm = clean((nameInput && nameInput.value) || "").trim();
    var ag = ageInput ? String(ageInput.value || "").trim() : "";
    if (!nm) { setOnboardError("من فضلك اكتب اسمك أولاً"); toast("من فضلك اكتب اسمك أولاً"); return; }
    setOnboardError("");
    S.me.name = nm; S.me.age = ag; S.me.gender = UI.onboardGender || "ذكر";
    if (UI.onboardPhoto) S.me.photo = UI.onboardPhoto;
    setOnboardDoneForUser(S.me.id, UI.isGuest, true);
    UI.authReady = true; showAuthGate(false);
    if (UI.isGuest) saveLocal();
    else {
      attachRealtimeListeners(S.me.id);
      save();
      ensureAutoPersonalRoom(S.me.id, nm);
    }
    scheduleRenderAll(); toast("تم حفظ بياناتك وإنشاء غرفتك بنجاح ✅");
  }

  function getRoom(id) {
    if (!id || !S || !Array.isArray(S.rooms)) return null;
    for (var i = 0; i < S.rooms.length; i++) if (S.rooms[i].id === id) return S.rooms[i];
    return null;
  }

  function findUserCurrentRoom(userId) {
    if (!userId || isBlockedEitherWay(userId) || !S || !Array.isArray(S.rooms)) return null;
    for (var i = 0; i < S.rooms.length; i++) if (inRoom(S.rooms[i], userId)) return S.rooms[i];
    return null;
  }

  async function verifyTargetAccountExists(otherId) {
    if (!isValidOtherUid(otherId)) return false;
    if (cloud.usersMap && cloud.usersMap[otherId]) return true;
    if (!cloud.on || !cloud.db) return (S.users || []).some(function (u) { return u.id === otherId; });
    try {
      var snap = await cloud.db.ref("publicProfiles/" + otherId + "/id").once("value");
      return !!snap.val();
    } catch (e) { return false; }
  }

  async function sendFriendRequest(otherId) {
    if (!isValidOtherUid(otherId)) { toast("لا يمكنك إرسال طلب صداقة لنفسك"); return false; }
    if (isBlockedEitherWay(otherId)) { toast("لا يمكن إرسال طلب صداقة بسبب وجود حظر"); return false; }
    if (!allowActionRateLimit()) return false;
    var lockKey = "freq_" + otherId;
    if (isActionLocked(lockKey)) return false;
    setActionLock(lockKey, true);
    try {
      if (isFriendWith(otherId)) { toast("هذا المستخدم صديقك بالفعل"); return false; }
      if (hasSentFriendReq(otherId)) { toast("تم إرسال طلب الصداقة مسبقاً"); return false; }
      if (hasReceivedFriendReq(otherId)) return await acceptFriendRequest(otherId);
      if (!ensureCloudReadyForWrite()) return false;
      var exists = await verifyTargetAccountExists(otherId);
      if (!exists) { toast("هذا الحساب غير موجود"); return false; }
      var checks = await Promise.all([
        cloud.db.ref("users/" + otherId + "/blockedUsers/" + S.me.id).once("value"),
        cloud.db.ref("users/" + S.me.id + "/blockedUsers/" + otherId).once("value")
      ]);
      if (checks[0].val() || checks[1].val()) { toast("تعذر إرسال طلب الصداقة لوجود حظر"); return false; }
      var ts = serverTs(), ups = {};
      ups["users/" + S.me.id + "/friendRequestsSent/" + otherId] = { uid: otherId, status: "pending", createdAt: ts };
      ups["users/" + otherId + "/friendRequestsReceived/" + S.me.id] = { uid: S.me.id, status: "pending", createdAt: ts };
      await cloud.db.ref().update(ups);
      if (S.sentReq.indexOf(otherId) < 0) S.sentReq.push(otherId);
      saveLocal(); scheduleRenderAll(); toast("تم إرسال طلب الصداقة بنجاح ✅");
      return true;
    } catch (e) { toast("فشل إرسال طلب الصداقة"); return false; }
    finally { setActionLock(lockKey, false); }
  }

  async function cancelFriendRequest(otherId) {
    if (!isValidOtherUid(otherId)) return false;
    var lockKey = "freq_" + otherId;
    if (isActionLocked(lockKey)) return false;
    setActionLock(lockKey, true);
    try {
      if (!ensureCloudReadyForWrite()) return false;
      var ups = {};
      ups["users/" + S.me.id + "/friendRequestsSent/" + otherId] = null;
      ups["users/" + otherId + "/friendRequestsReceived/" + S.me.id] = null;
      await cloud.db.ref().update(ups);
      S.sentReq = (S.sentReq || []).filter(function (x) { return x !== otherId; });
      saveLocal(); scheduleRenderAll(); toast("تم إلغاء طلب الصداقة");
      return true;
    } catch (e) { toast("تعذر إلغاء طلب الصداقة"); return false; }
    finally { setActionLock(lockKey, false); }
  }

  async function rejectFriendRequest(otherId) {
    if (!isValidOtherUid(otherId)) return false;
    var lockKey = "freq_" + otherId;
    if (isActionLocked(lockKey)) return false;
    setActionLock(lockKey, true);
    try {
      if (!ensureCloudReadyForWrite()) return false;
      var ups = {};
      ups["users/" + S.me.id + "/friendRequestsReceived/" + otherId] = null;
      ups["users/" + otherId + "/friendRequestsSent/" + S.me.id] = null;
      await cloud.db.ref().update(ups);
      S.requests = (S.requests || []).filter(function (x) { return x !== otherId; });
      saveLocal(); scheduleRenderAll(); toast("تم رفض طلب الصداقة");
      return true;
    } catch (e) { toast("تعذر رفض طلب الصداقة"); return false; }
    finally { setActionLock(lockKey, false); }
  }

  async function acceptFriendRequest(otherId) {
    if (!isValidOtherUid(otherId)) return false;
    if (isBlockedEitherWay(otherId)) { toast("لا يمكن قبول الطلب لوجود حظر"); return false; }
    var lockKey = "freq_" + otherId;
    if (isActionLocked(lockKey)) return false;
    setActionLock(lockKey, true);
    try {
      if (!ensureCloudReadyForWrite()) return false;
      var wasFriend = isFriendWith(otherId), ts = serverTs(), ups = {};
      ups["users/" + S.me.id + "/friends/" + otherId] = { uid: otherId, createdAt: ts };
      ups["users/" + otherId + "/friends/" + S.me.id] = { uid: S.me.id, createdAt: ts };
      ups["users/" + S.me.id + "/friendRequestsReceived/" + otherId] = null;
      ups["users/" + otherId + "/friendRequestsSent/" + otherId] = null;
      ups["users/" + otherId + "/friendRequestsSent/" + S.me.id] = null;
      ups["users/" + otherId + "/friendRequestsReceived/" + S.me.id] = null;
      ups["userDms/" + S.me.id + "/" + otherId] = true;
      ups["userDms/" + otherId + "/" + S.me.id] = true;
      await cloud.db.ref().update(ups);
      if (S.friends.indexOf(otherId) < 0) S.friends.push(otherId);
      S.requests = (S.requests || []).filter(function (x) { return x !== otherId; });
      S.sentReq = (S.sentReq || []).filter(function (x) { return x !== otherId; });
      if (!Array.isArray(S.dms[otherId])) S.dms[otherId] = [];
      if (!wasFriend) {
        cloud.db.ref("dms/" + dmThreadId(S.me.id, otherId)).push({
          from: S.me.id, to: otherId, text: "مرحباً 👋 تم قبول طلب الصداقة.", status: "sent", read: false, t: now()
        }).catch(function () { /* */ });
      }
      attachDmThreadListener(S.me.id, otherId);
      updateProfileRelationshipCounts(); save(); scheduleRenderAll(); toast("تم قبول طلب الصداقة ✅");
      return true;
    } catch (e) { toast("تعذر قبول طلب الصداقة"); return false; }
    finally { setActionLock(lockKey, false); }
  }

  async function removeFriend(otherId) {
    if (!isValidOtherUid(otherId)) return false;
    var lockKey = "freq_" + otherId;
    if (isActionLocked(lockKey)) return false;
    setActionLock(lockKey, true);
    try {
      if (!ensureCloudReadyForWrite()) return false;
      var ups = {};
      ups["users/" + S.me.id + "/friends/" + otherId] = null;
      ups["users/" + otherId + "/friends/" + S.me.id] = null;
      await cloud.db.ref().update(ups);
      S.friends = (S.friends || []).filter(function (x) { return x !== otherId; });
      if (UI.dmId === otherId) closeDM();
      updateProfileRelationshipCounts(); save(); scheduleRenderAll(); toast("تمت إزالة الصديق");
      return true;
    } catch (e) { toast("تعذر إزالة الصديق"); return false; }
    finally { setActionLock(lockKey, false); }
  }

  async function followUser(otherId) {
    if (!isValidOtherUid(otherId)) { toast("لا يمكنك متابعة حسابك"); return false; }
    if (isBlockedEitherWay(otherId)) { toast("لا يمكن المتابعة لوجود حظر"); return false; }
    if (isFollowingUser(otherId)) { toast("أنت تتابع هذا الحساب بالفعل"); return true; }
    if (!allowActionRateLimit()) return false;
    var lockKey = "fol_" + otherId;
    if (isActionLocked(lockKey)) return false;
    setActionLock(lockKey, true);
    try {
      if (!ensureCloudReadyForWrite()) return false;
      var ts = serverTs(), ups = {};
      ups["users/" + S.me.id + "/following/" + otherId] = { uid: otherId, createdAt: ts };
      ups["users/" + otherId + "/followers/" + S.me.id] = { uid: S.me.id, createdAt: ts };
      await cloud.db.ref().update(ups);
      if (S.follows.indexOf(otherId) < 0) S.follows.push(otherId);
      updateProfileRelationshipCounts(); save(); scheduleRenderAll(); toast("تمت المتابعة بنجاح ✅");
      return true;
    } catch (e) { toast("فشل تنفيذ المتابعة"); return false; }
    finally { setActionLock(lockKey, false); }
  }

  async function unfollowUser(otherId) {
    if (!isValidOtherUid(otherId) || !isFollowingUser(otherId)) return true;
    var lockKey = "fol_" + otherId;
    if (isActionLocked(lockKey)) return false;
    setActionLock(lockKey, true);
    try {
      if (!ensureCloudReadyForWrite()) return false;
      var ups = {};
      ups["users/" + S.me.id + "/following/" + otherId] = null;
      ups["users/" + otherId + "/followers/" + S.me.id] = null;
      await cloud.db.ref().update(ups);
      S.follows = (S.follows || []).filter(function (x) { return x !== otherId; });
      updateProfileRelationshipCounts(); save(); scheduleRenderAll(); toast("تم إلغاء المتابعة");
      return true;
    } catch (e) { toast("فشل إلغاء المتابعة"); return false; }
    finally { setActionLock(lockKey, false); }
  }

  async function toggleFollowUser(otherId) {
    return isFollowingUser(otherId) ? await unfollowUser(otherId) : await followUser(otherId);
  }

  async function blockUser(otherId) {
    if (!isValidOtherUid(otherId)) return false;
    if (hasBlockedUser(otherId)) return true;
    var lockKey = "blk_" + otherId;
    if (isActionLocked(lockKey)) return false;
    setActionLock(lockKey, true);
    try {
      if (!ensureCloudReadyForWrite()) return false;
      var ts = serverTs(), ups = {};
      ups["users/" + S.me.id + "/blockedUsers/" + otherId] = { uid: otherId, createdAt: ts };
      ups["users/" + otherId + "/blockedBy/" + S.me.id] = { uid: S.me.id, createdAt: ts };
      ups["users/" + S.me.id + "/friends/" + otherId] = null;
      ups["users/" + otherId + "/friends/" + S.me.id] = null;
      ups["users/" + S.me.id + "/following/" + otherId] = null;
      ups["users/" + otherId + "/followers/" + S.me.id] = null;
      ups["users/" + otherId + "/following/" + S.me.id] = null;
      ups["users/" + S.me.id + "/followers/" + otherId] = null;
      ups["users/" + S.me.id + "/friendRequestsSent/" + otherId] = null;
      ups["users/" + otherId + "/friendRequestsReceived/" + S.me.id] = null;
      ups["users/" + otherId + "/friendRequestsSent/" + S.me.id] = null;
      ups["users/" + S.me.id + "/friendRequestsReceived/" + otherId] = null;
      await cloud.db.ref().update(ups);
      if (S.blocked.indexOf(otherId) < 0) S.blocked.push(otherId);
      S.friends = (S.friends || []).filter(function (x) { return x !== otherId; });
      S.follows = (S.follows || []).filter(function (x) { return x !== otherId; });
      S.followersList = (S.followersList || []).filter(function (x) { return x !== otherId; });
      S.requests = (S.requests || []).filter(function (x) { return x !== otherId; });
      S.sentReq = (S.sentReq || []).filter(function (x) { return x !== otherId; });
      delete S.dms[otherId]; delete S.unread[otherId];
      var tid = dmThreadId(S.me.id, otherId);
      offDb("dm_" + tid);
      delete UI.activeDmListenerLimits[tid];
      if (UI.dmId === otherId) closeDM();
      updateProfileRelationshipCounts(); save(); scheduleRenderAll(); toast("تم حظر المستخدم 🚫");
      return true;
    } catch (e) { toast("تعذر تنفيذ الحظر"); return false; }
    finally { setActionLock(lockKey, false); }
  }

  async function unblockUser(otherId) {
    if (!isValidOtherUid(otherId) || !hasBlockedUser(otherId)) return true;
    var lockKey = "blk_" + otherId;
    if (isActionLocked(lockKey)) return false;
    setActionLock(lockKey, true);
    try {
      if (!ensureCloudReadyForWrite()) return false;
      var ups = {};
      ups["users/" + S.me.id + "/blockedUsers/" + otherId] = null;
      ups["users/" + otherId + "/blockedBy/" + S.me.id] = null;
      await cloud.db.ref().update(ups);
      S.blocked = (S.blocked || []).filter(function (x) { return x !== otherId; });
      updateProfileRelationshipCounts(); save(); scheduleRenderAll(); toast("تم إلغاء الحظر ✅");
      return true;
    } catch (e) { toast("تعذر إلغاء الحظر"); return false; }
    finally { setActionLock(lockKey, false); }
  }

  function confirmBlockUserSheet(otherId, onDone) {
    var u = resolveLiveUser(otherId);
    openSheet(
      "<h3>🚫 تأكيد حظر المستخدم</h3>" +
      "<div class='confirm-box'>هل أنت متأكد من حظر <b>" + esc(u.name) + "</b>؟ سيتم إنهاء الصداقة والمتابعة والرسائل بينكما.</div>" +
      "<div style='display:flex;gap:8px'>" +
        "<button class='btn red' style='flex:1' id='confirm-blk-yes' type='button'>نعم، حظر</button>" +
        "<button class='btn ghost' style='flex:1' id='confirm-blk-no' type='button'>إلغاء</button>" +
      "</div>"
    );
    $("confirm-blk-yes").onclick = async function () {
      this.disabled = true;
      var ok = await blockUser(otherId);
      closeSheet();
      if (ok && typeof onDone === "function") onDone();
    };
    $("confirm-blk-no").onclick = closeSheet;
  }

  function confirmUnblockUserSheet(otherId, onDone) {
    var u = resolveLiveUser(otherId);
    openSheet(
      "<h3>🔓 تأكيد إلغاء الحظر</h3>" +
      "<div class='confirm-box' style='background:rgba(34,197,94,.12);border-color:rgba(34,197,94,.35)'>هل أنت متأكد من إلغاء الحظر عن <b>" + esc(u.name) + "</b>؟</div>" +
      "<div style='display:flex;gap:8px'>" +
        "<button class='btn ok' style='flex:1' id='confirm-unblk-yes' type='button'>نعم، إلغاء الحظر</button>" +
        "<button class='btn ghost' style='flex:1' id='confirm-unblk-no' type='button'>تراجع</button>" +
      "</div>"
    );
    $("confirm-unblk-yes").onclick = async function () {
      this.disabled = true;
      var ok = await unblockUser(otherId);
      closeSheet();
      if (ok && typeof onDone === "function") onDone();
    };
    $("confirm-unblk-no").onclick = closeSheet;
  }

  function submitUserReport(targetId, reason) {
    if (!targetId || targetId === S.me.id) return;
    var u = resolveLiveUser(targetId);
    var rep = {
      id: uid(), reporterId: S.me.id, reporterName: S.me.name || "مستخدم",
      targetId: targetId, targetName: u.name || "مستخدم",
      reason: clean(reason || "مخالفة قواعد الغرفة").trim(), status: "open", t: now()
    };
    S.reports.unshift(rep);
    if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("reports/" + rep.id).set(rep).catch(function () { /* */ });
    saveLocal(); toast("تم إرسال البلاغ للمراجعة ✅");
  }

  function inviteFriendToRoom(friendId, targetRoomId) {
    var room = getRoom(targetRoomId || UI.roomId || UI.floatingRoomId);
    if (!room) { toast("ادخل غرفة أولاً لإرسال دعوة"); return; }
    var u = resolveLiveUser(friendId);
    if (isBlockedEitherWay(friendId) || !isFriendWith(friendId)) { toast("الدعوة متاحة للأصدقاء فقط"); return; }
    var payload = {
      from: S.me.id, to: friendId,
      text: "🎙️ يدعوك " + (S.me.name || "صديقك") + " للانضمام إلى غرفة «" + room.name + "»",
      inviteRoomId: room.id, inviteRoomName: room.name, status: "sent", read: false, t: now()
    };
    if (!S.dms[friendId]) S.dms[friendId] = [];
    S.dms[friendId].push(payload);
    if (cloud.on && cloud.db && !UI.isGuest) {
      cloud.db.ref("dms/" + dmThreadId(S.me.id, friendId)).push(payload).catch(function () { /* */ });
      cloud.db.ref("userDms/" + S.me.id + "/" + friendId).set(true).catch(function () { /* */ });
      cloud.db.ref("userDms/" + friendId + "/" + S.me.id).set(true).catch(function () { /* */ });
    }
    pushRoomMsg(room, { sys: true, text: "📩 تم إرسال دعوة غرفة إلى " + u.name });
    saveLocal(); toast("تم إرسال دعوة الغرفة إلى " + u.name + " ✅");
  }

  function avatarInnerHTML(u) {
    if (u && u.photo) return '<img src="' + esc(u.photo) + '" alt="' + esc(u.name || "avatar") + '" loading="lazy" onerror="this.style.display=\'none\';this.parentNode.textContent=\'' + esc(initials(u && u.name)) + '\'" />';
    return esc(initials(u && u.name));
  }
  function avatarHTML(u, cls) {
    var vipCls = getEffectiveVip(u) > 0 ? " vip-ring" : "";
    return '<div class="avatar ' + (cls || "") + vipCls + '">' + avatarInnerHTML(u) + "</div>";
  }
  function setAvatarEl(el, u) {
    if (!el) return;
    el.classList.toggle("vip-ring", getEffectiveVip(u) > 0);
    el.innerHTML = avatarInnerHTML(u);
  }

  function roomSqMediaHTML(r, insideCount) {
    var bg = COVERS[(r.color || 0) % COVERS.length], ic = COVER_ICONS[(r.icon || 0) % COVER_ICONS.length];
    var inner = r.roomPhoto ? '<img src="' + esc(r.roomPhoto) + '" alt="' + esc(r.name || "") + '" loading="lazy" />' : "<span>" + ic + "</span>";
    return '<div class="room-sq-media" style="background:' + bg + '">' +
      '<span class="room-sq-live-pill">🎧 ' + insideCount + "</span>" +
      (r.micApprovalMode ? '<span class="room-sq-mode-pill">✋ بطلب</span>' : "") +
      (r.priv ? '<span class="room-sq-priv-pill">🔒 خاصة</span>' : "") + inner + "</div>";
  }

  function getRoomParticipantIds(room) {
    var seen = {}, ids = [];
    if (!room) return ids;
    (room.seats || []).forEach(function (s) { if (s && s.uid && !seen[s.uid]) { seen[s.uid] = true; ids.push(s.uid); } });
    (room.listeners || []).forEach(function (uidItem) { if (uidItem && !seen[uidItem]) { seen[uidItem] = true; ids.push(uidItem); } });
    return ids;
  }
  function count(room) { return getRoomParticipantIds(room).length; }
  function seatIndexOf(room, id) {
    if (!room || !Array.isArray(room.seats)) return -1;
    for (var i = 0; i < room.seats.length; i++) if (room.seats[i] && room.seats[i].uid === id) return i;
    return -1;
  }
  function inRoom(room, id) { return !!room && (seatIndexOf(room, id) >= 0 || (room.listeners || []).indexOf(id) >= 0); }
  function isRoomModOrOwner(room, userId) {
    if (!room || !userId) return false;
    if (room.owner === userId) return true;
    return Array.isArray(room.mods) && room.mods.indexOf(userId) >= 0;
  }

  function pushRoomMsg(room, msgObj) {
    if (!room) return;
    var tNow = now();
    if (!Array.isArray(room.msgs)) room.msgs = [];
    room.msgs.push(Object.assign({ key: uid() }, msgObj, { t: tNow }));
    if (UI.roomId === room.id) renderRoomChat();
    // Safe completion of the truncated upload: persist the latest 100 room messages.
    if (cloud.on && cloud.db && !UI.isGuest) {
      cloud.roomMsgs[room.id] = room.msgs.slice(-100);
      cloud.db.ref("rooms/" + room.id + "/msgs").set(cloud.roomMsgs[room.id]).catch(function () {
        /* A cloud write failure must not break the room UI. */
      });
    }
    saveLocal();
  }


  /* ===== UI layer: the uploaded script.js was cut off before this part, so it is rebuilt here ===== */
  function openSheet(html) {
    var sh = $("sheet"), sc = $("scrim");
    if (!sh || !sc) return;
    sh.innerHTML = '<div class="sheet-handle"></div>' + html;
    sh.classList.add("open"); sc.classList.add("open");
  }
  function closeSheet() {
    if ($("sheet")) $("sheet").classList.remove("open");
    if ($("scrim")) $("scrim").classList.remove("open");
  }

  function showPage(p) {
    UI.page = p;
    var pages = document.querySelectorAll(".page");
    for (var i = 0; i < pages.length; i++) pages[i].classList.toggle("active", pages[i].id === "page-" + p);
    var nb = document.querySelectorAll(".navbtn");
    for (var j = 0; j < nb.length; j++) nb[j].classList.toggle("active", nb[j].getAttribute("data-page") === p);
    window.scrollTo(0, 0);
    renderCurrentPage();
  }

  function setTabs(boxId, attr, val) {
    var t = document.querySelectorAll("#" + boxId + " .tab");
    for (var i = 0; i < t.length; i++) t[i].classList.toggle("active", t[i].getAttribute(attr) === val);
  }

  function renderTop() {
    if (!S) return;
    setAvatarEl($("avatar-top"), S.me);
    var pill = $("session-mode-pill");
    if (pill) { pill.textContent = UI.isGuest ? "زائر" : "Google"; pill.classList.toggle("guest", !!UI.isGuest); }
    var unread = (S.notifs || []).filter(function (n) { return n && !n.read; }).length;
    var b = $("notif-badge");
    if (b) { b.textContent = unread; b.classList.toggle("hidden", !unread); }
    var mb = $("msg-badge"), tot = 0;
    Object.keys(S.unread || {}).forEach(function (k) { tot += Number(S.unread[k]) || 0; });
    if (mb) { mb.textContent = tot; mb.classList.toggle("hidden", !tot); }
    var fb = $("friends-badge");
    if (fb) { fb.textContent = (S.requests || []).length; fb.classList.toggle("hidden", !(S.requests || []).length); }
  }

  function roomCardHTML(r) {
    return '<div class="room-sq" data-room="' + esc(r.id) + '">' + roomSqMediaHTML(r, count(r)) +
      '<div class="room-sq-name">' + esc(r.name || "غرفة") + "</div></div>";
  }
  function bindRoomCards(box) {
    var cs = box.querySelectorAll("[data-room]");
    for (var i = 0; i < cs.length; i++) cs[i].onclick = function () { openRoom(this.getAttribute("data-room")); };
  }
  function fillRooms(boxId, list) {
    var box = $(boxId);
    if (!box) return;
    box.innerHTML = list.length ? list.map(roomCardHTML).join("") : '<div class="gift-showcase-empty">لا توجد غرف حالياً</div>';
    bindRoomCards(box);
  }

  function renderHomeBanners() {
    var slot = $("home-banners-slot");
    if (!slot) return;
    slot.innerHTML = (S.banners || []).map(function (b) {
      var img = b.image || b.img || b.url || "";
      return '<div class="glass" style="padding:10px;margin-bottom:8px">' +
        (img ? '<img src="' + esc(img) + '" style="width:100%;border-radius:12px" alt="" />' : "") +
        (b.title ? "<b>" + esc(b.title) + "</b>" : "") + "</div>";
    }).join("");
  }

  function renderHome() {
    if (!S) return;
    var q = (UI.query || "").trim().toLowerCase();
    var list = (S.rooms || []).filter(function (r) { return !r.priv; });
    if (q) list = list.filter(function (r) { return String(r.name || "").toLowerCase().indexOf(q) >= 0 || String(r.id).toLowerCase().indexOf(q) >= 0; });
    if (UI.filter === "popular") list = list.slice().sort(function (a, b) { return count(b) - count(a); });
    else if (UI.filter === "new") list = list.slice().sort(function (a, b) { return (b.created || b.t || 0) - (a.created || a.t || 0); });
    else if (UI.filter === "friends") list = list.filter(function (r) { return isFriendWith(r.owner) || getRoomParticipantIds(r).some(isFriendWith); });
    else if (UI.filter === "vip") list = list.filter(function (r) { return r.vip || r.cat === "vip"; });
    else if (UI.filter === "games") list = list.filter(function (r) { return r.cat === "games"; });
    fillRooms("home-rooms", list);
    renderHomeBanners();
  }

  function renderRooms() {
    if (!S) return;
    var me = S.me.id;
    var list = (S.rooms || []).filter(function (r) {
      return UI.rfilter === "mine" ? (r.owner === me || (r.mods || []).indexOf(me) >= 0) : !r.priv;
    });
    fillRooms("rooms-list", list);
  }

  function personRow(id, extra) {
    var u = resolveLiveUser(id);
    return '<div class="glass" data-user="' + esc(id) + '" style="display:flex;align-items:center;gap:10px;padding:10px;margin-bottom:8px;cursor:pointer">' +
      avatarHTML(u, "") + '<div style="flex:1;min-width:0"><b>' + esc(u.name) + '</b><div class="meta">' + (extra || "") + "</div></div></div>";
  }
  function relId(x) { return x && typeof x === "object" ? x.id || x.uid : x; }

  function renderFriends() {
    if (!S) return;
    var box = $("friends-list"); if (!box) return;
    $("find-box").classList.toggle("hidden", UI.ftab !== "find");
    var ids = [];
    if (UI.ftab === "friends") ids = (S.friends || []).map(relId);
    else if (UI.ftab === "requests") ids = (S.requests || []).map(relId);
    else if (UI.ftab === "sent") ids = (S.sentReq || []).map(relId);
    else {
      var q = (UI.findQ || "").trim().toLowerCase();
      var all = Object.keys(cloud.usersMap || {}).filter(function (k) { return k !== S.me.id; });
      ids = q ? all.filter(function (k) { var u = resolveLiveUser(k); return String(u.name || "").toLowerCase().indexOf(q) >= 0 || String(u.specialId || "") === q; }).slice(0, 30) : [];
    }
    $("req-count").textContent = (S.requests || []).length ? "(" + S.requests.length + ")" : "";
    $("sent-count").textContent = (S.sentReq || []).length ? "(" + S.sentReq.length + ")" : "";
    box.innerHTML = ids.length ? ids.map(function (id) { return personRow(id, ""); }).join("") : '<div class="gift-showcase-empty">لا يوجد شيء هنا بعد</div>';
    var rows = box.querySelectorAll("[data-user]");
    for (var i = 0; i < rows.length; i++) rows[i].onclick = function () {
      var id = this.getAttribute("data-user");
      if (isFriendWith(id)) openDM(id); else showUserSheet(id);
    };
  }

  function showUserSheet(id) {
    var u = resolveLiveUser(id);
    openSheet("<h3>" + esc(u.name) + "</h3><div class='meta'>ID: " + esc(u.specialId || "") + "</div>" +
      "<div class='actlist'>" + (isFriendWith(id) ? "<button id='us-dm' type='button'>💬 مراسلة</button>" : "") +
      "<button class='danger' id='us-blk' type='button'>🚫 حظر</button></div>");
    if ($("us-dm")) $("us-dm").onclick = function () { closeSheet(); openDM(id); };
    $("us-blk").onclick = function () { confirmBlockUserSheet(id, renderCurrentPage); };
  }

  function renderMessages() {
    var box = $("dm-list"); if (!box || !S) return;
    var ids = Object.keys(S.dms || {}).filter(function (k) { return (S.dms[k] || []).length && !isBlockedEitherWay(k); });
    ids.sort(function (a, b) { var x = S.dms[a], y = S.dms[b]; return (y[y.length - 1].t || 0) - (x[x.length - 1].t || 0); });
    box.innerHTML = ids.length ? ids.map(function (id) {
      var m = S.dms[id][S.dms[id].length - 1], n = S.unread[id] || 0;
      return personRow(id, esc(String(m.text || "📷").slice(0, 40)) + (n ? " 🔴 " + n : ""));
    }).join("") : '<div class="gift-showcase-empty">لا توجد رسائل بعد</div>';
    var rows = box.querySelectorAll("[data-user]");
    for (var i = 0; i < rows.length; i++) rows[i].onclick = function () { openDM(this.getAttribute("data-user")); };
  }

  function renderProfile() {
    if (!S) return;
    var u = resolveLiveUser(S.me.id);
    setAvatarEl($("pf-avatar"), u);
    $("pf-name").textContent = u.name || "مستخدم";
    $("pf-id").textContent = "ID: " + (u.specialId || "—");
    $("pf-bio").textContent = u.bio || "";
    $("pf-gender-age").textContent = [u.gender, u.age].filter(Boolean).join(" • ") || "—";
    $("pf-followers-count").textContent = getMyFollowersCount();
    $("pf-following-count").textContent = getMyFollowingCount();
    $("pf-friends-count").textContent = getMyFriendsCount();
    $("pf-user-level").textContent = "Lv." + computeLevelFromXp(u.xp || 0) + " (" + (u.xp || 0) + ")";
    $("pf-charm-level").textContent = "Lv." + getCharmLevel(u.charm || 0) + " (" + (u.charm || 0) + ")";
    $("pf-vip-badge").textContent = "VIP " + (getEffectiveVip(u) || 0);
    $("pf-blocked-count").textContent = (S.blocked || []).length;
    $("pf-admin-btn").classList.toggle("hidden", !u.isAdmin);
    $("pf-verified-badge").classList.toggle("hidden", !u.verified);
    var social = UI.pftab !== "overview";
    $("pf-tab-overview").classList.toggle("hidden", social);
    $("pf-tab-social").classList.toggle("hidden", !social);
    if (social) {
      var src = UI.pftab === "friends" ? S.friends : UI.pftab === "followers" ? S.followersList : S.follows;
      var q = (UI.pfSocialQ || "").toLowerCase();
      var ids = (src || []).map(relId).filter(function (id) { return !q || String(resolveLiveUser(id).name).toLowerCase().indexOf(q) >= 0; });
      $("pf-social-tab-list").innerHTML = ids.slice(0, UI.pfSocialLimit).map(function (id) { return personRow(id, ""); }).join("") || '<div class="gift-showcase-empty">القائمة فارغة</div>';
      $("pf-social-load-more").classList.toggle("hidden", ids.length <= UI.pfSocialLimit);
    }
  }

  function renderCurrentPage() {
    if (!S) return;
    ({ home: renderHome, rooms: renderRooms, friends: renderFriends, messages: renderMessages, profile: renderProfile }[UI.page] || renderHome)();
  }
  function renderAll() {
    renderTop(); renderCurrentPage(); renderFloatingOrb();
    if (UI.roomId) renderRoom();
    if (UI.dmId) renderDM();
  }
  function syncGiftRankListeners() { /* gift-cup ranking lives in the part of the file that was cut off */ }

  /* ----- room ----- */
  function openRoom(id) {
    var r = getRoom(id);
    if (!r) { toast("الغرفة غير متاحة"); return; }
    if (UI.roomId && UI.roomId !== id) UI.floatingRoomId = null;
    UI.roomId = id; UI.floatingRoomId = null;
    $("room-view").classList.add("open");
    updateOverlayLock(); renderFloatingOrb(); renderRoom();
    history.pushState({ ov: "room" }, "");
  }
  function minimizeRoom() {
    if (!UI.roomId) return;
    UI.floatingRoomId = UI.roomId; UI.roomId = null;
    $("room-view").classList.remove("open");
    updateOverlayLock(); renderFloatingOrb(); renderCurrentPage();
  }
  async function leaveRoom(full) {
    if (!full) { minimizeRoom(); return; }
    UI.roomId = null; UI.floatingRoomId = null;
    $("room-view").classList.remove("open");
    updateOverlayLock(); renderFloatingOrb(); renderCurrentPage();
  }
  function renderFloatingOrb() {
    var o = $("floating-room-orb"); if (!o) return;
    var r = UI.floatingRoomId ? getRoom(UI.floatingRoomId) : null;
    o.classList.toggle("hidden", !r);
    if (r) $("floating-orb-label").textContent = r.name || "غرفة";
  }
  function renderRoom() {
    var r = getRoom(UI.roomId);
    if (!r) { leaveRoom(true); return; }
    $("room-title").textContent = r.name || "غرفة";
    $("room-right-id").textContent = "ID: " + r.id.replace("room_", "").slice(0, 7);
    $("room-online-count").textContent = count(r);
    $("room-seats").innerHTML = (r.seats || []).map(function (s, i) {
      var u = s.uid ? resolveLiveUser(s.uid) : null;
      return '<div class="seat"><div class="seat-orb">' + (u ? avatarInnerHTML(u) : (s.locked ? "🔒" : "🎙️")) + "</div>" +
        '<div class="seat-name">' + (u ? esc(u.name) : (i + 1)) + "</div></div>";
    }).join("");
    renderRoomChat();
  }
  function renderRoomChat() {
    var r = getRoom(UI.roomId), box = $("room-chat"); if (!r || !box) return;
    var near = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    box.innerHTML = (r.msgs || []).slice(-100).map(function (m) {
      var id = m.uid || m.from, u = id ? resolveLiveUser(id) : null;
      if (id && isBlockedEitherWay(id)) return "";
      return '<div class="room-msg"><b>' + (u ? esc(u.name) : "") + "</b> " + esc(m.text || "") + "</div>";
    }).join("");
    if (near) box.scrollTop = box.scrollHeight;
  }
  function sendRoomMsg() {
    var inp = $("room-input"), r = getRoom(UI.roomId);
    var text = clean((inp.value || "")).trim();
    if (!r || !text) return;
    if (!allowActionRateLimit || allowActionRateLimit("room-msg", 600) !== false) {
      pushRoomMsg(r, { uid: S.me.id, from: S.me.id, text: text, type: "text" });
      inp.value = "";
    }
  }

  /* ----- private chat ----- */
  function openDM(id) {
    UI.dmId = id; S.unread[id] = 0;
    attachDmThreadListener(S.me.id, id);
    $("chat-view").classList.add("open");
    updateOverlayLock(); renderDM(); renderTop();
    history.pushState({ ov: "dm" }, "");
  }
  function closeDM() {
    UI.dmId = null; $("chat-view").classList.remove("open");
    updateOverlayLock(); renderCurrentPage(); renderTop();
  }
  function markThreadMessagesRead(id) { if (S.unread) S.unread[id] = 0; saveLocal(); renderTop(); }
  function renderDM() {
    var id = UI.dmId; if (!id) return;
    var u = resolveLiveUser(id);
    setAvatarEl($("chat-avatar"), u);
    $("chat-title").textContent = u.name;
    $("chat-sub").textContent = u.online ? "متصل" : "غير متصل";
    var box = $("chat-msgs");
    box.innerHTML = (S.dms[id] || []).map(function (m) {
      var mine = m.from === S.me.id;
      return '<div class="dm-bubble ' + (mine ? "me" : "them") + '" style="align-self:' + (mine ? "flex-start" : "flex-end") + '">' + esc(m.text || "📷") + "</div>";
    }).join("");
    box.scrollTop = box.scrollHeight;
  }
  function sendDM() {
    var inp = $("chat-input"), id = UI.dmId;
    var text = clean(inp.value || "").trim();
    if (!id || !text || !cloud.on || !cloud.db) return;
    if (isBlockedEitherWay(id) || !isFriendWith(id)) { toast("لا يمكن إرسال رسالة"); return; }
    var msg = { from: S.me.id, to: id, text: text, t: now() };
    cloud.db.ref("dms/" + dmThreadId(S.me.id, id)).push(msg).catch(function () { toast("تعذر الإرسال"); });
    cloud.db.ref("userDms/" + S.me.id + "/" + id).set(true).catch(function () {});
    cloud.db.ref("userDms/" + id + "/" + S.me.id).set(true).catch(function () {});
    inp.value = "";
  }

  /* ----- events + boot ----- */
  function on(id, fn, ev) { var e = $(id); if (e) e.addEventListener(ev || "click", fn); }
  function tabsOf(boxId, attr, fn) {
    var box = $(boxId); if (!box) return;
    box.addEventListener("click", function (e) {
      var t = e.target.closest(".tab"); if (!t) return;
      var v = t.getAttribute(attr); setTabs(boxId, attr, v); fn(v);
    });
  }
  function wireUI() {
    var nb = document.querySelectorAll(".navbtn");
    for (var i = 0; i < nb.length; i++) nb[i].addEventListener("click", function () {
      if (UI.roomId) minimizeRoom();
      if (UI.dmId) closeDM();
      showPage(this.getAttribute("data-page"));
    });
    tabsOf("home-tabs", "data-filter", function (v) { UI.filter = v; renderHome(); });
    tabsOf("rooms-tabs", "data-rfilter", function (v) { UI.rfilter = v; renderRooms(); });
    tabsOf("friends-tabs", "data-ftab", function (v) { UI.ftab = v; renderFriends(); });
    tabsOf("profile-subtabs", "data-pftab", function (v) { UI.pftab = v; renderProfile(); });
    on("search-input", function () { UI.query = this.value; $("search-clear-btn").classList.toggle("hidden", !this.value); renderHome(); }, "input");
    on("search-clear-btn", function () { $("search-input").value = ""; UI.query = ""; this.classList.add("hidden"); renderHome(); });
    on("find-input", function () { UI.findQ = this.value; renderFriends(); }, "input");
    on("pf-social-search", function () { UI.pfSocialQ = this.value; renderProfile(); }, "input");
    on("pf-social-load-more", function () { UI.pfSocialLimit += CONFIG.socialPageSize; renderProfile(); });
    on("refresh-rooms", function () { renderHome(); toast("تم التحديث"); });
    on("avatar-top", function () { showPage("profile"); });
    on("theme-toggle-btn", function () { S.settings.lightTheme = !S.settings.lightTheme; applyThemeMode(); saveLocal(); });
    on("scrim", closeSheet);
    on("google-login-btn", signInWithGoogleApp);
    on("guest-login-btn", startWithoutGoogle);
    on("ob-submit-btn", completeOnboarding);
    on("ob-back-login-btn", function () { showAuthGate(true, "login"); });
    var gp = document.querySelectorAll(".gender-pill");
    for (var g = 0; g < gp.length; g++) gp[g].addEventListener("click", function () {
      UI.onboardGender = this.getAttribute("data-gender");
      for (var k = 0; k < gp.length; k++) gp[k].classList.toggle("active", gp[k] === this);
    });
    on("ob-photo-input", function () {
      var f = this.files && this.files[0]; if (!f) return;
      var fr = new FileReader();
      fr.onload = function () { UI.onboardPhoto = fr.result; renderOnboardPreview(); };
      fr.readAsDataURL(f);
    }, "change");
    on("room-back", function () { history.back(); });
    on("room-leave-top", function () { leaveRoom(true); });
    on("room-send", sendRoomMsg);
    on("room-input", function (e) { if (e.key === "Enter") sendRoomMsg(); }, "keydown");
    on("chat-back", function () { history.back(); });
    on("chat-send", sendDM);
    on("chat-input", function (e) { if (e.key === "Enter") sendDM(); }, "keydown");
    on("floating-room-orb", function (e) { if (e.target.id !== "floating-orb-leave") openRoom(UI.floatingRoomId); });
    on("floating-orb-leave", function (e) { e.stopPropagation(); leaveRoom(true); });
    on("pf-admin-btn", function () { location.href = "admin.html"; });
    on("pf-settings-btn", function () {
      openSheet("<h3>⚙️ الإعدادات</h3><div class='actlist'><button class='danger' id='st-out' type='button'>تسجيل الخروج</button></div>");
      $("st-out").onclick = function () { closeSheet(); signOutApp(); };
    });
    on("fab-create", function () { createRoomSheet(); });
    wireRoomExtras();
    /* Back button closes the top screen instead of leaving the app */
    window.addEventListener("popstate", function () {
      if ($("sheet").classList.contains("open")) closeSheet();
      else if (UI.dmId) closeDM();
      else if (UI.roomId) minimizeRoom();
    });
  }

  function boot() {
    global.__RV_BOOTED = true;
    resetInMemoryStateForSession("guest_session", false);
    wireUI();
    var cloudOk = initCloud();
    if (isGuestSession()) { signInAsGuest(); return; }
    if (cloudOk && cloud.auth) {
      cloud.auth.getRedirectResult().catch(function () {});
      cloud.auth.onAuthStateChanged(function (u) {
        if (u) handleAuthenticatedUser(u);
        else { hideSplash(); showAuthGate(true, "login"); }
      });
    } else { hideSplash(); showAuthGate(true, "login"); }
    setTimeout(function () {
      hideSplash();
      if (!UI.authReady && (!$("auth-gate") || $("auth-gate").classList.contains("hidden"))) {
        showAuthGate(true, "login");
        setAuthError("الاتصال بقاعدة البيانات بطيء أو قواعد Firebase ترفض القراءة. جرّب تسجيل الدخول مرة أخرى.");
      }
    }, 8000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();



  /* ===== Layer 2: rooms on Firebase, seats, Agora voice, create room, gifts ===== */
  function roomRef(id) { return cloud.db.ref("rooms/" + id); }
  function showRoomView() {
    $("room-view").classList.add("open");
    updateOverlayLock(); renderFloatingOrb(); renderRoom();
    history.pushState({ ov: "room" }, "");
  }

  async function openRoom(id) {
    var r = getRoom(id);
    if (!r) { toast("الغرفة غير متاحة"); return; }
    if (UI.floatingRoomId === id) { UI.roomId = id; UI.floatingRoomId = null; showRoomView(); return; }
    if (UI.roomId || UI.floatingRoomId) await leaveRoom(true);
    var me = S.me.id;
    if ((r.bans || []).indexOf(me) >= 0) { toast("أنت محظور من هذه الغرفة"); return; }
    if (isBlockedEitherWay(r.owner)) { toast("لا يمكن دخول هذه الغرفة"); return; }
    if (r.passcode && !isRoomModOrOwner(r, me)) {
      var p = global.prompt("كلمة سر الغرفة");
      if (p !== r.passcode) { toast("كلمة السر غير صحيحة"); return; }
    }
    UI.roomId = id; UI.roomSessionStart = now();
    showRoomView();
    if (cloud.on && cloud.db) {
      var lr = roomRef(id).child("listeners/" + me);
      lr.set(true).catch(function () { toast("تعذر الدخول للغرفة — راجع قواعد Firebase"); });
      lr.onDisconnect().remove();
    }
    joinVoiceChannel(id, "publisher");
  }

  function minimizeRoom() {
    if (!UI.roomId) return;
    UI.floatingRoomId = UI.roomId; UI.roomId = null;
    $("room-view").classList.remove("open");
    updateOverlayLock(); renderFloatingOrb(); renderCurrentPage();
  }

  async function leaveRoom(full) {
    if (!full) { minimizeRoom(); return; }
    var id = UI.roomId || UI.floatingRoomId, r = id ? getRoom(id) : null, me = S.me.id;
    UI.roomId = null; UI.floatingRoomId = null;
    $("room-view").classList.remove("open");
    updateOverlayLock(); renderFloatingOrb(); renderCurrentPage();
    if (id && cloud.on && cloud.db) {
      var idx = r ? seatIndexOf(r, me) : -1;
      try {
        await roomRef(id).child("listeners/" + me).remove();
        roomRef(id).child("listeners/" + me).onDisconnect().cancel();
        if (idx >= 0) {
          await roomRef(id).child("seats/" + idx + "/uid").set(null);
          roomRef(id).child("seats/" + idx + "/uid").onDisconnect().cancel();
        }
      } catch (e) { /* ignore */ }
    }
    try { await leaveVoiceChannel(false); } catch (e) { /* ignore */ }
  }

  function renderRoom() {
    var r = getRoom(UI.roomId);
    if (!r) { if (UI.roomId) leaveRoom(true); return; }
    $("room-title").textContent = r.name || "غرفة";
    $("room-right-id").textContent = "ID: " + String(r.id).replace(/^room_/, "").slice(0, 7);
    $("room-online-count").textContent = count(r);
    $("room-seats").innerHTML = (r.seats || []).map(function (s, i) {
      var u = s.uid ? resolveLiveUser(s.uid) : null;
      var inner = u ? avatarInnerHTML(u) : (s.locked ? "🔒" : "🎙️");
      return '<div class="seat" data-seat="' + i + '" data-uid="' + esc(s.uid || "") + '"><div class="seat-orb' + (u ? "" : " empty") + '">' + inner + (s.muted ? '<span class="seat-mute">🔇</span>' : "") + "</div>" +
        '<div class="seat-name">' + (u ? esc(u.name) : (i + 1)) + "</div></div>";
    }).join("");
    var mic = $("mic-btn"); if (mic) mic.textContent = UI.micMuted ? "🔇" : "🎙️";
    var pin = $("room-pinned-banner");
    if (pin) { pin.classList.toggle("hidden", !r.pinned); $("room-pinned-text").textContent = r.pinned || ""; }
    renderRoomChat();
  }

  async function takeSeat(i) {
    var r = getRoom(UI.roomId), me = S.me.id; if (!r || !cloud.on) return;
    var s = r.seats[i], mod = isRoomModOrOwner(r, me);
    if (s.uid) return;
    if (s.locked && !mod) { toast("هذا المقعد مقفل"); return; }
    if (s.vip && !mod && getEffectiveVip(S.me) < 1) { toast("مقعد VIP"); return; }
    if (r.micApprovalMode && !mod) {
      await roomRef(r.id).child("handRequests/" + me).set(true);
      toast("تم إرسال طلب المايك للمشرف"); return;
    }
    if (seatIndexOf(r, me) >= 0) { toast("أنت على مقعد بالفعل"); return; }
    UI.pendingSeatActionAt = now();
    var ref = roomRef(r.id).child("seats/" + i + "/uid");
    var res = await ref.transaction(function (c) { return c == null ? me : undefined; });
    if (!res.committed) { toast("المقعد اتحجز"); return; }
    ref.onDisconnect().set(null);
    roomRef(r.id).child("listeners/" + me).remove();
    UI.micMuted = false;
    syncMicHardwareState();
  }

  async function leaveSeat() {
    var r = getRoom(UI.roomId), idx = r ? seatIndexOf(r, S.me.id) : -1; if (idx < 0) return;
    UI.pendingSeatActionAt = now();
    await roomRef(r.id).child("seats/" + idx + "/uid").set(null);
    roomRef(r.id).child("listeners/" + S.me.id).set(true);
    syncMicHardwareState();
  }

  function seatTapped(i) {
    var r = getRoom(UI.roomId); if (!r) return;
    var s = r.seats[i], me = S.me.id, mod = isRoomModOrOwner(r, me);
    if (!s.uid) {
      if (mod) openSheet("<h3>المقعد " + (i + 1) + "</h3><div class='actlist'><button id='sa-take' type='button'>🎙️ اجلس هنا</button><button id='sa-lock' type='button'>" + (s.locked ? "🔓 فتح المقعد" : "🔒 قفل المقعد") + "</button></div>");
      else return takeSeat(i);
      $("sa-take").onclick = function () { closeSheet(); takeSeat(i); };
      $("sa-lock").onclick = function () { closeSheet(); roomRef(r.id).child("seats/" + i + "/locked").set(!s.locked); };
    } else if (s.uid === me) {
      openSheet("<h3>مقعدي</h3><div class='actlist'><button id='sa-leave' type='button'>⬇️ النزول من المقعد</button></div>");
      $("sa-leave").onclick = function () { closeSheet(); leaveSeat(); };
    } else {
      var u = resolveLiveUser(s.uid);
      openSheet("<h3>" + esc(u.name) + "</h3><div class='actlist'>" +
        "<button id='sa-prof' type='button'>👤 الملف الشخصي</button>" +
        (mod ? "<button id='sa-mute' type='button'>" + (s.muted ? "🔊 فك الكتم" : "🔇 كتم") + "</button><button class='danger' id='sa-kick' type='button'>⬇️ إنزال من المقعد</button>" : "") + "</div>");
      $("sa-prof").onclick = function () { showUserSheet(s.uid); };
      if (mod) {
        $("sa-mute").onclick = function () { closeSheet(); roomRef(r.id).child("seats/" + i + "/muted").set(!s.muted); };
        $("sa-kick").onclick = function () { closeSheet(); roomRef(r.id).child("seats/" + i + "/uid").set(null); };
      }
    }
  }

  function toggleMic() {
    var r = getRoom(UI.roomId);
    if (!r || seatIndexOf(r, S.me.id) < 0) { toast("اجلس على مقعد أولاً"); return; }
    UI.micMuted = !UI.micMuted; renderRoom(); syncMicHardwareState();
  }

  function createRoomSheet() {
    if (UI.isGuest || !cloud.on) { toast("سجّل بحساب Google لإنشاء غرفة"); return; }
    if (S.appSettings && S.appSettings.allowCreateRoom === false) { toast("إنشاء الغرف متوقف حالياً"); return; }
    openSheet("<h3>➕ إنشاء غرفة</h3><label>اسم الغرفة</label><input id='cr-name' maxlength='30' placeholder='مثال: سهرة الأصدقاء' />" +
      "<label>عدد المقاعد</label><div class='gender-row'><button class='gender-pill' data-n='5' type='button'>5</button><button class='gender-pill active' data-n='9' type='button'>9</button><button class='gender-pill' data-n='12' type='button'>12</button></div>" +
      "<button class='btn block' id='cr-go' type='button' style='margin-top:12px'>إنشاء</button>");
    var n = 9, pills = $("sheet").querySelectorAll(".gender-pill");
    for (var k = 0; k < pills.length; k++) pills[k].onclick = function () {
      n = Number(this.getAttribute("data-n"));
      for (var j = 0; j < pills.length; j++) pills[j].classList.toggle("active", pills[j] === this);
    };
    $("cr-go").onclick = async function () {
      var name = clean($("cr-name").value || "").trim();
      if (!name) { toast("اكتب اسم الغرفة"); return; }
      this.disabled = true;
      var id = "room_" + S.me.id + "_" + Date.now().toString(36);
      var payload = { name: name, desc: "", cat: "chat", owner: S.me.id, seatCount: n, seats: makeSeats(n), micApprovalMode: false, priv: false, passcode: "", locked: false, adminOrder: 1000, created: serverTs(), color: Math.floor(Math.random() * COVERS.length), icon: Math.floor(Math.random() * COVER_ICONS.length), roomPhoto: S.me.photo || "" };
      try {
        await roomRef(id).set(payload);
        S.rooms = dedupeRoomsList([normalizeRoom(id, Object.assign({}, payload, { created: now() }))].concat(S.rooms || []));
        closeSheet(); openRoom(id);
      } catch (e) { toast("تعذر إنشاء الغرفة — راجع قواعد Firebase"); this.disabled = false; }
    };
  }

  function roomMenuSheet() {
    var r = getRoom(UI.roomId); if (!r) return;
    var mod = isRoomModOrOwner(r, S.me.id), owner = r.owner === S.me.id;
    openSheet("<h3>خيارات الغرفة</h3><div class='actlist'>" +
      "<button id='rm-spk' type='button'>" + (UI.roomSpeakerMuted ? "🔊 تشغيل السماعة" : "🔇 كتم السماعة") + "</button>" +
      (mod ? "<button id='rm-appr' type='button'>✋ طلب المايك: " + (r.micApprovalMode ? "مفعّل" : "متوقف") + "</button>" : "") +
      (owner ? "<button id='rm-name' type='button'>✏️ تغيير الاسم</button><button class='danger' id='rm-del' type='button'>🗑️ حذف الغرفة</button>" : "") + "</div>");
    $("rm-spk").onclick = function () { closeSheet(); UI.roomSpeakerMuted = !UI.roomSpeakerMuted; applyRoomSpeakerMuteState(); };
    if ($("rm-appr")) $("rm-appr").onclick = function () { closeSheet(); roomRef(r.id).child("micApprovalMode").set(!r.micApprovalMode); };
    if ($("rm-name")) $("rm-name").onclick = function () { closeSheet(); var n = clean(global.prompt("الاسم الجديد", r.name) || "").trim(); if (n) roomRef(r.id).child("name").set(n); };
    if ($("rm-del")) $("rm-del").onclick = async function () { closeSheet(); if (!global.confirm("حذف الغرفة نهائياً؟")) return; var id = r.id; await leaveRoom(true); await roomRef(id).remove(); };
  }

  function presenceSheet() {
    var r = getRoom(UI.roomId); if (!r) return;
    openSheet("<h3>🎧 المتواجدون (" + count(r) + ")</h3>" + getRoomParticipantIds(r).map(function (id) { return personRow(id, ""); }).join(""));
    var rows = $("sheet").querySelectorAll("[data-user]");
    for (var i = 0; i < rows.length; i++) rows[i].onclick = function () { showUserSheet(this.getAttribute("data-user")); };
  }

  function giftSheet() {
    var r = getRoom(UI.roomId); if (!r) return;
    var targets = (r.seats || []).filter(function (s) { return s.uid && s.uid !== S.me.id; }).map(function (s) { return s.uid; });
    if (!targets.length) { toast("لا يوجد أحد على المايك لإرسال هدية"); return; }
    var sel = UI.giftTarget && targets.indexOf(UI.giftTarget) >= 0 ? UI.giftTarget : targets[0];
    var gifts = (S.customGifts || []).filter(function (g) { return g && g.id; });
    openSheet("<h3>🎁 إرسال هدية</h3><div class='meta'>رصيدك: " + (S.me.coins || 0) + " 🪙</div>" +
      "<select id='gf-to' style='width:100%;margin:8px 0'>" + targets.map(function (t) { return "<option value='" + esc(t) + "'>" + esc(resolveLiveUser(t).name) + "</option>"; }).join("") + "</select>" +
      "<div class='gift-showcase-grid'>" + gifts.map(function (g) { return "<button class='gb-slot' data-g='" + esc(g.id) + "' type='button'><div class='gb-e'>" + (g.e || "🎁") + "</div><small>" + esc(g.n || "") + "</small><div class='gb-p'>" + (g.p || 0) + "</div></button>"; }).join("") + "</div>");
    var bs = $("sheet").querySelectorAll("[data-g]");
    for (var i = 0; i < bs.length; i++) bs[i].onclick = async function () {
      var gid = this.getAttribute("data-g"), to = $("gf-to").value, g = gifts.filter(function (x) { return x.id === gid; })[0];
      var res = await callEconomyApi("sendGift", { roomId: r.id, toUid: to, giftId: gid });
      if (res && res.ok !== false) { closeSheet(); pushRoomMsg(r, { uid: S.me.id, from: S.me.id, text: "أرسل " + (g.e || "🎁") + " " + (g.n || "") + " إلى " + resolveLiveUser(to).name, type: "gift" }); }
      else toast((res && res.error) || "تعذر إرسال الهدية");
    };
  }

  function wireRoomExtras() {
    on("room-seats", function (e) { var s = e.target.closest(".seat"); if (s) seatTapped(Number(s.getAttribute("data-seat"))); });
    on("mic-btn", toggleMic);
    on("room-menu", roomMenuSheet);
    on("room-presence-btn", presenceSheet);
    on("room-speaker-btn", function () { UI.roomSpeakerMuted = !UI.roomSpeakerMuted; applyRoomSpeakerMuteState(); toast(UI.roomSpeakerMuted ? "تم كتم السماعة" : "تم تشغيل السماعة"); });
    on("audio-unlock-btn", function () { resumeAllRemoteAudioTracks(); showAudioUnlockBar(false); });
    var tb = document.querySelector(".room-toolbar");
    if (tb && !$("room-gift-btn")) {
      var b = document.createElement("button");
      b.className = "room-tool-pill"; b.id = "room-gift-btn"; b.type = "button"; b.textContent = "🎁 هدية";
      b.onclick = giftSheet; tb.insertBefore(b, tb.firstChild);
    }
  }

})(typeof window !== "undefined" ? window : globalThis);
