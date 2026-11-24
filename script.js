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
    storageKeyPrefix: "rv_state_v26_",
    guestStorageKey: "rv_guest_state_v26",
    guestSessionIdKey: "rv_guest_uid_v26",
    guestModeKey: "rv_guest_mode_v26",
    onboardDoneKeyPrefix: "rv_onboard_done_v26_",
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
    document.body.classList.toggle("overlay-open", !!(roomOpen || dmOpen));
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

  function openWalletSheet() {
    var paidBal = Math.max(0, Number(S && S.me && S.me.coins || 0));
    var senderBonus = Math.max(0, Number(S && S.me && S.me.senderBonusBalance || 0));
    var recipientReward = Math.max(0, Number(S && S.me && S.me.recipientRewardBalance || 0));
    openSheet(
      "<h3>👛 محفظتي والأرصدة المفصولة</h3>" +
      "<div class='stats-grid' style='margin-bottom:10px'>" +
        "<div class='stat-box'><b>" + paidBal.toLocaleString("en-US") + "</b><span>الرصيد الأساسي 🪙</span></div>" +
        "<div class='stat-box'><b>" + senderBonus.toLocaleString("en-US") + "</b><span>مكافآت المرسل 🎲</span></div>" +
        "<div class='stat-box'><b>" + recipientReward.toLocaleString("en-US") + "</b><span>استحقاق المستلم 🎁</span></div>" +
      "</div>" +
      "<div class='notice'>يُستخدم الرصيد الأساسي ومكافآت المرسل في إرسال الهدايا. استحقاق المستلم (10% من هدايا الحظ) هو رصيد مكافآت تجريبي غير قابل للسحب تلقائياً.</div>" +
      "<div style='display:flex;gap:8px;margin-top:8px'>" +
        "<button class='btn' style='flex:1' id='wallet-history-btn' type='button'>📜 سجل المحفظة</button>" +
        "<button class='btn gold' style='flex:1' id='wallet-lucky-log-btn' type='button'>🎲 سجل هدايا الحظ</button>" +
      "</div>" +
      "<div id='wallet-history-list' class='list' style='margin-top:8px'></div>"
    );
    if ($("wallet-lucky-log-btn")) $("wallet-lucky-log-btn").onclick = function () { openLuckyHistorySheet(1); };
    if ($("wallet-history-btn")) $("wallet-history-btn").onclick = async function () {
      var box = $("wallet-history-list");
      box.innerHTML = '<div class="empty">جاري تحميل السجل…</div>';
      try {
        var snap = await cloud.db.ref("economy/ledger/" + S.me.id).limitToLast(30).once("value");
        var data = snap.val() || {};
        var rows = Object.keys(data).map(function (k) { return data[k]; }).sort(function (a, b) { return Number(b.createdAt || 0) - Number(a.createdAt || 0); });
        box.innerHTML = rows.length ? rows.map(function (x) {
          var positive = Number(x.amount || 0) >= 0;
          return '<div class="row glass" style="margin:4px 0"><div class="info"><div class="name">' + esc(x.title || x.reason || "حركة محفظة") + '</div><div class="meta">' + dateTimeStr(x.createdAt) + '</div></div><b style="color:' + (positive ? '#22c55e' : '#f87171') + '">' + (positive ? '+' : '') + Number(x.amount || 0).toLocaleString("en-US") + ' 🪙</b></div>';
        }).join("") : '<div class="empty">لا توجد حركات حتى الآن</div>';
      } catch (e) { box.innerHTML = '<div class="empty">تعذر تحميل سجل المحفظة</div>'; }
    };
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
          image: String(g.gifUrl || g.image || ""), active: g.active !== false, category: String(g.cat || g.category || "عام")
        };
      }).filter(function (g) { return g.active; });
      if (S && remoteGifts.length) { S.customGifts = remoteGifts; saveLocal(); }
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
    if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("roomMessages/" + room.id).push(Object.assign({}, msgObj, { t: tNow })).catch(function () { /* */ });
  }

  function showEntryBanner(userObj) {
    var wrap = $("entry-banner-wrap");
    if (!wrap || !userObj) return;
    var u = typeof userObj === "string" ? resolveLiveUser(userObj) : userObj;
    if (u.id && isBlockedEitherWay(u.id)) return;
    var vipLv = getEffectiveVip(u);
    var ribbon = document.createElement("div");
    ribbon.className = "entry-ribbon";
    ribbon.textContent = (vipLv >= 3 ? "👑 دخول ملكي: " : (vipLv > 0 ? "✨ VIP دخل الغرفة: " : "✨ دخل الغرفة: ")) + (u.name || "مستخدم");
    wrap.appendChild(ribbon);
    setTimeout(function () { if (ribbon.parentNode) ribbon.parentNode.removeChild(ribbon); }, 3000);
  }

  function showFlyGiftToSeat(emojiOrSvg, senderName, targetUid, targetName) {
    var reduceMotion = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    var room = getRoom(UI.roomId || UI.floatingRoomId);
    var startX = window.innerWidth / 2, startY = window.innerHeight - 90;
    var endX = window.innerWidth / 2, endY = window.innerHeight * 0.28;
    var targetSeatIdx = -1;
    if (room && targetUid && targetUid !== "room" && UI.roomId) {
      targetSeatIdx = seatIndexOf(room, targetUid);
      if (targetSeatIdx >= 0) {
        var seatEl = document.querySelector('#room-seats .seat[data-seat="' + targetSeatIdx + '"]');
        if (seatEl) { var rect = seatEl.getBoundingClientRect(); endX = rect.left + rect.width / 2; endY = rect.top + rect.height / 2; }
      }
    }
    var proj = document.createElement("div");
    proj.className = "gift-projectile";
    proj.style.left = startX + "px"; proj.style.top = startY + "px";
    proj.innerHTML = emojiOrSvg + "<small>" + esc(senderName) + " ➔ " + esc(targetName) + "</small>";
    document.body.appendChild(proj);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        proj.style.left = endX + "px"; proj.style.top = endY + "px";
        proj.style.transform = "translate(-50%,-50%) scale(1.2)";
      });
    });
    setTimeout(function () {
      if (targetSeatIdx >= 0) {
        var hitEl = document.querySelector('#room-seats .seat[data-seat="' + targetSeatIdx + '"]');
        if (hitEl) { hitEl.classList.add("gift-hit"); setTimeout(function () { hitEl.classList.remove("gift-hit"); }, 1400); }
      }
    }, 750);
    setTimeout(function () { proj.style.opacity = "0"; }, 1900);
    setTimeout(function () { if (proj.parentNode) proj.parentNode.removeChild(proj); }, 2400);
  }

  function giftRankTotals() {
    var totals = {};
    Object.keys(giftRankEvents).forEach(function (roomId) {
      Object.keys(giftRankEvents[roomId] || {}).forEach(function (eventId) {
        var ev = giftRankEvents[roomId][eventId];
        if (!ev || !ev.fromUid) return;
        var uid = String(ev.fromUid);
        if (!totals[uid]) totals[uid] = { uid: uid, name: ev.fromName || resolveLiveUser(uid).name, count: 0, photo: ev.fromPhoto || resolveLiveUser(uid).photo || "" };
        totals[uid].count += Math.max(1, Number(ev.count || 1));
        if (ev.fromName) totals[uid].name = ev.fromName;
      });
    });
    return Object.keys(totals).map(function (k) {
      var u = resolveLiveUser(k);
      totals[k].name = u.name || totals[k].name;
      totals[k].photo = u.photo || totals[k].photo;
      return totals[k];
    }).sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name); });
  }
  function renderGiftCupBanner() {
    var sub = $("gift-cup-subtitle"); if (!sub) return;
    var ranks = giftRankTotals();
    if (!ranks.length) { sub.textContent = "اضغط لمشاهدة ترتيب Top 1 و2 و3 — يبدأ الترتيب مع تسجيل هدايا الغرف"; return; }
    sub.textContent = "🥇 " + ranks[0].name + " • " + ranks[0].count + " هدية" + (ranks[1] ? "   🥈 " + ranks[1].name : "") + (ranks[2] ? "   🥉 " + ranks[2].name : "");
  }
  function renderGiftCupPage() {
    var page = $("gift-cup-page-content"); if (!page) return;
    var ranks = giftRankTotals();
    var html = "<div class='cup-hero'><div class='cup-hero-icon'>🏆</div><div class='cup-hero-title'>أبطال غرف REAL VOICE</div><div class='cup-hero-sub'>ترتيب مرسلي الهدايا داخل الغرف حسب عدد الهدايا المسجلة</div></div>";
    if (!ranks.length) { page.innerHTML = html + "<div class='empty'>لا توجد هدايا مسجلة بعد.</div>"; return; }
    var podium = [1, 0, 2].filter(function (i) { return !!ranks[i]; }).map(function (i) {
      var u = ranks[i], medal = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉", cls = i === 0 ? "first" : "";
      return "<div class='cup-podium-card " + cls + "'><div>" + medal + "</div><div style='margin:4px auto'>" + avatarHTML(u, "sm") + "</div><div style='font-weight:800;font-size:12.5px'>" + esc(u.name) + "</div><div class='meta'>" + u.count + " هدية</div></div>";
    }).join("");
    html += "<div class='cup-podium'>" + podium + "</div>";
    html += ranks.slice(0, 100).map(function (u, i) {
      var medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1);
      return "<div class='cup-rank-row'><div class='cup-rank-number'>" + medal + "</div>" + avatarHTML(u, "sm") + "<div class='info'><div class='name'>" + esc(u.name) + "</div><div class='meta'>" + u.count + " هدية مرسلة</div></div></div>";
    }).join("");
    page.innerHTML = html;
  }
  function openGiftCupSheet() {
    var page = $("gift-cup-page"); if (!page) return;
    renderGiftCupPage(); page.classList.add("open"); page.setAttribute("aria-hidden", "false");
  }
  function closeGiftCupPage() {
    var page = $("gift-cup-page"); if (!page) return;
    page.classList.remove("open"); page.setAttribute("aria-hidden", "true");
  }
  function syncGiftRankListeners(roomList) {
    if (!cloud.on || !cloud.db || UI.isGuest) return;
    var ids = (roomList || []).map(function (r) { return String(r.id); });
    ids.forEach(function (rid) {
      if (giftRankListeners[rid]) return; giftRankListeners[rid] = true;
      onDb("gift_rank_" + rid, cloud.db.ref("giftEvents/" + rid).limitToLast(200), "value", function (snap) {
        var fresh = snap.val() || {}, previous = giftRankEvents[rid] || {};
        giftRankEvents[rid] = fresh;
        if (UI.roomId === rid || UI.floatingRoomId === rid) {
          Object.keys(fresh).forEach(function (k) {
            if (previous[k]) return;
            var ev = fresh[k];
            if (!ev || Number(ev.createdAt || 0) < now() - 30000) return;
            var visual = ev.giftId && LUCKY_GIFT_ASSETS[ev.giftId] ? LUCKY_GIFT_ASSETS[ev.giftId] : (ev.emoji || "🎁");
            showFlyGiftToSeat(visual, ev.fromName || "مستخدم", ev.toUid || "", ev.toName || "مستخدم");
          });
        }
        renderGiftCupBanner();
      });
    });
    Object.keys(giftRankListeners).forEach(function (rid) {
      if (ids.indexOf(rid) < 0) { offDb("gift_rank_" + rid); delete giftRankListeners[rid]; delete giftRankEvents[rid]; }
    });
  }

  function renderHomeBanners() {
    renderGiftCupBanner();
    var slot = $("home-banners-slot");
    if (!slot) return;
    if (!S || !Array.isArray(S.banners) || !S.banners.length) {
      slot.innerHTML = '<div class="banners-placeholder">🖼️ مساحة البنرات الإعلانية — تدار من لوحة التحكم</div>';
      return;
    }
    slot.innerHTML = S.banners.map(function (url, i) { return '<img src="' + esc(url) + '" alt="Banner ' + (i + 1) + '" loading="lazy" />'; }).join("");
  }

  function go(page) {
    closeSheet();
    UI.page = page;
    document.querySelectorAll(".page").forEach(function (p) { p.classList.toggle("active", p.id === "page-" + page); });
    document.querySelectorAll(".navbtn").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-page") === page); });
    window.scrollTo({ top: 0, behavior: "auto" });
    renderCurrentPage();
  }

  function renderTop() {
    if (!S || !S.me) return;
    setAvatarEl($("avatar-top"), resolveLiveUser(S.me.id));
    var pill = $("session-mode-pill");
    if (pill) {
      if (UI.isGuest) { pill.textContent = "زائر"; pill.classList.add("guest"); }
      else if (UI.googleUser) { pill.textContent = "Google"; pill.classList.remove("guest"); }
      else { pill.textContent = "حساب نشط"; pill.classList.remove("guest"); }
    }
    var tBtn = $("theme-toggle-btn");
    if (tBtn) tBtn.textContent = (S.settings && S.settings.lightTheme) ? "🌙" : "☀️";
    var unread = (S.notifs || []).filter(function (n) { return !n.read; }).length;
    var b = $("notif-badge");
    if (b) { b.textContent = unread; b.classList.toggle("hidden", unread === 0); }
    var mu = 0;
    for (var k in S.unread) if (isFriendWith(k) && !isBlockedEitherWay(k)) mu += S.unread[k] || 0;
    var mb = $("msg-badge");
    if (mb) { mb.textContent = mu; mb.classList.toggle("hidden", mu === 0); }
    var fb = $("friends-badge");
    if (fb) { fb.textContent = (S.requests || []).length; fb.classList.toggle("hidden", (S.requests || []).length === 0); }
  }

  function roomCard(r) {
    var inside = count(r);
    return '<div class="room-sq-card" data-enter="' + esc(r.id) + '">' +
      roomSqMediaHTML(r, inside) +
      '<div class="room-sq-footer">' +
        '<div class="room-sq-name-full">' + esc(r.name) + "</div>" +
        '<div class="room-sq-inside-count">داخل الغرفة: ' + inside + "</div>" +
      "</div></div>";
  }

  function skeletonCardsHTML() {
    return '<div class="skeleton-grid" style="grid-column:1/-1"><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div></div>';
  }

  function buildDynamicRelationButtons(targetId, options) {
    options = options || {};
    var rel = getRelationshipStatus(targetId);
    if (rel.state === "self") return '<span class="tag">أنت</span>';
    if (rel.state === "blocked_by_me") return '<button class="btn sm ok" data-unblock-user="' + esc(targetId) + '" type="button">🔓 إلغاء الحظر</button>';
    if (rel.state === "blocked_by_them") return '<span class="tag">غير متاح</span>';
    var btns = "";
    var folLocked = isActionLocked("fol_" + targetId) ? " disabled" : "";
    var freqLocked = isActionLocked("freq_" + targetId) ? " disabled" : "";
    btns += '<button class="btn sm ghost" data-follow-user="' + esc(targetId) + '"' + folLocked + ' type="button">' + (rel.following ? "إلغاء المتابعة" : "+ متابعة") + "</button>";
    if (rel.state === "friends") {
      if (options.showDm) btns += '<button class="btn sm" data-dm="' + esc(targetId) + '" type="button">💬 خاص</button>';
      if (options.showRemoveFriend) btns += '<button class="btn sm red" data-remove-friend="' + esc(targetId) + '"' + freqLocked + ' type="button">إزالة الصديق</button>';
    } else if (rel.state === "request_sent") {
      btns += '<button class="btn sm ghost" data-cancelfreq="' + esc(targetId) + '"' + freqLocked + ' type="button">طلب مرسل (إلغاء)</button>';
    } else if (rel.state === "request_received") {
      btns += '<button class="btn sm ok" data-accept="' + esc(targetId) + '"' + freqLocked + ' type="button">قبول الطلب</button>' +
        '<button class="btn sm ghost" data-reject="' + esc(targetId) + '"' + freqLocked + ' type="button">رفض</button>';
    } else {
      btns += '<button class="btn sm" data-addfriend="' + esc(targetId) + '"' + freqLocked + ' type="button">+ إضافة صديق</button>';
    }
    if (options.showProfileBtn) btns += '<button class="btn sm ghost" data-profile="' + esc(targetId) + '" type="button">👤</button>';
    return btns;
  }

  function renderIdSearchHighlight(q) {
    var box = $("id-search-result-box");
    if (!box) return;
    if (!q) { box.classList.add("hidden"); box.innerHTML = ""; return; }
    var allIds = [S.me.id].concat(Object.keys(cloud.usersMap || {}), (S.users || []).map(function (u) { return u.id; }));
    var uniqueIds = [], seen = {};
    allIds.forEach(function (id) {
      if (id && !seen[id] && !isBlockedEitherWay(id)) {
        var uTmp = resolveLiveUser(id);
        if (id === S.me.id || !uTmp.hideFromSearch) { seen[id] = true; uniqueIds.push(id); }
      }
    });
    var matched = [];
    uniqueIds.forEach(function (id) {
      var u = resolveLiveUser(id);
      if (displayUserId(u).toLowerCase().indexOf(q) >= 0 || String(u.id || "").toLowerCase().indexOf(q) >= 0 || String(u.name || "").toLowerCase().indexOf(q) >= 0) matched.push(u);
    });
    if (!matched.length) { box.classList.add("hidden"); box.innerHTML = ""; return; }
    box.classList.remove("hidden");
    box.innerHTML = matched.slice(0, 3).map(function (u) {
      var rel = getRelationshipStatus(u.id);
      var acts = u.id !== S.me.id ? buildDynamicRelationButtons(u.id, { showDm: true, showProfileBtn: true }) : '<span class="tag">أنت</span>';
      return '<div class="id-result-banner"><div style="display:flex;align-items:center;gap:12px">' +
        '<div data-profile="' + esc(u.id) + '" style="cursor:pointer">' + avatarHTML(u) + "</div>" +
        '<div class="info" data-profile="' + esc(u.id) + '" style="cursor:pointer">' +
          '<div class="name">' + esc(u.name) + ' <span class="tag verified">ID: ' + esc(displayUserId(u)) + '</span> <span class="tag rel">' + esc(rel.label) + "</span></div>" +
          '<div class="meta">' + (u.gender ? esc(u.gender) + " • " : "") + (u.age ? esc(u.age) + " سنة • " : "") + (u.online ? "متصل الآن" : "حساب مسجل") + "</div>" +
        "</div><div class='row-actions'>" + acts + "</div></div></div>";
    }).join("");
  }

  function renderHome() {
    if (!S) return;
    renderHomeBanners();
    if (UI.loadingRooms && (!S.rooms || !S.rooms.length) && !UI.isGuest) {
      $("home-rooms").innerHTML = skeletonCardsHTML();
      return;
    }
    var q = UI.query.trim().toLowerCase();
    var clrBtn = $("search-clear-btn");
    if (clrBtn) clrBtn.classList.toggle("hidden", !q);
    renderIdSearchHighlight(q);

    var list = dedupeRoomsList(S.rooms).filter(function (r) {
      if (isBlockedEitherWay(r.owner)) return false;
      if (Array.isArray(r.bans) && r.bans.indexOf(S.me.id) >= 0) return false;
      return !r.priv || r.owner === S.me.id || isRoomModOrOwner(r, S.me.id) || inRoom(r, S.me.id);
    });
    if (q) list = list.filter(function (r) { return r.name.toLowerCase().indexOf(q) >= 0 || r.id.toLowerCase().indexOf(q) >= 0; });
    list = list.slice().sort(function (a, b) { return (Number(a.adminOrder || 1000) - Number(b.adminOrder || 1000)) || ((b.created || 0) - (a.created || 0)); });
    if (UI.filter === "popular") list = list.slice().sort(function (a, b) { return count(b) - count(a); });
    else if (UI.filter === "new") list = list.slice().sort(function (a, b) { return (b.created || 0) - (a.created || 0); });
    else if (UI.filter === "friends") list = list.filter(function (r) { return S.friends.some(function (fid) { return inRoom(r, fid); }); });
    else if (UI.filter === "vip") list = list.filter(function (r) { return r.cat === "vip"; });
    else if (UI.filter === "games") list = list.filter(function (r) { return r.cat === "games"; });

    $("home-rooms").innerHTML = list.length ? list.map(roomCard).join("") : '<div class="empty" style="grid-column:1/-1">لا توجد غرف مطابقة — يمكنك إنشاء غرفة جديدة من تبويب الغرف</div>';

    var uBox = $("search-users");
    if (q) {
      var us = S.users.filter(function (u) {
        if (isBlockedEitherWay(u.id)) return false;
        var live = resolveLiveUser(u.id);
        if (live.hideFromSearch) return false;
        return displayUserId(live).toLowerCase().indexOf(q) >= 0 || String(live.id || "").toLowerCase().indexOf(q) >= 0 || (live.name || "").toLowerCase().indexOf(q) >= 0;
      });
      uBox.classList.toggle("hidden", us.length === 0);
      uBox.innerHTML = us.slice(0, 15).map(function (u) {
        return personRow(resolveLiveUser(u.id), buildDynamicRelationButtons(u.id, { showDm: true, showProfileBtn: true }));
      }).join("");
    } else { uBox.classList.add("hidden"); }

    document.querySelectorAll("#home-tabs .tab").forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-filter") === UI.filter); });
  }

  function renderRooms() {
    if (!S) return;
    var uniqueRooms = dedupeRoomsList(S.rooms);
    var list = UI.rfilter === "mine"
      ? uniqueRooms.filter(function (r) { return r.owner === S.me.id || isRoomModOrOwner(r, S.me.id); })
      : uniqueRooms.filter(function (r) {
          return !isBlockedEitherWay(r.owner) &&
            !(Array.isArray(r.bans) && r.bans.indexOf(S.me.id) >= 0) &&
            (!r.priv || r.owner === S.me.id || isRoomModOrOwner(r, S.me.id));
        });
    $("rooms-list").innerHTML = list.length ? list.map(roomCard).join("") : '<div class="empty" style="grid-column:1/-1">لا توجد غرف — اضغط (+ إنشاء غرفة)</div>';
    document.querySelectorAll("#rooms-tabs .tab").forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-rfilter") === UI.rfilter); });
  }

  function personRow(u, actions) {
    var live = resolveLiveUser(u.id);
    var curRoom = findUserCurrentRoom(live.id);
    var vipLv = getEffectiveVip(live);
    var rel = getRelationshipStatus(live.id);
    var vipTag = vipLv > 0 ? ' <span class="tag vip">VIP ' + vipLv + "</span>" : "";
    var verTag = live.verified ? ' <span class="tag verified">✓</span>' : "";
    var relTag = live.id !== S.me.id ? ' <span class="tag rel">' + esc(rel.label) + "</span>" : "";
    var roomBadge = curRoom ? '<span class="room-pill-tag" data-enter="' + esc(curRoom.id) + '">🎙️ في: ' + esc(curRoom.name) + "</span>" : "";
    return '<div class="row glass"><div data-profile="' + esc(live.id) + '" style="position:relative;cursor:pointer">' + avatarHTML(live) + '<span class="dot ' + (live.online ? "on" : "") + '"></span></div>' +
      '<div class="info" data-profile="' + esc(live.id) + '" style="cursor:pointer"><div class="' + (vipLv >= 2 ? "name vip-gold" : "name") + '">' + esc(live.name) + vipTag + verTag + relTag + '</div><div class="meta">ID: ' + esc(displayUserId(live)) + " • " + (live.online ? "متصل" : "غير متصل") + "</div>" + roomBadge + "</div>" +
      '<div class="row-actions">' + actions + "</div></div>";
  }

  function renderFriends() {
    if (!S) return;
    updateProfileRelationshipCounts();
    document.querySelectorAll("#friends-tabs .tab").forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-ftab") === UI.ftab); });
    $("find-box").classList.toggle("hidden", UI.ftab !== "find");
    var html = "", activeRoomId = UI.roomId || UI.floatingRoomId;

    if (UI.ftab === "friends") {
      var fr = (S.friends || []).filter(function (id) { return !isBlockedEitherWay(id); }).map(resolveLiveUser);
      html = fr.length ? fr.map(function (u) {
        var curRoom = findUserCurrentRoom(u.id), rBtn = "";
        if (curRoom && curRoom.id !== activeRoomId) rBtn = '<button class="btn sm ok" data-enter="' + esc(curRoom.id) + '" type="button">دخول</button>';
        else if (activeRoomId && !inRoom(getRoom(activeRoomId), u.id)) rBtn = '<button class="btn sm gold" data-invite-friend="' + esc(u.id) + '" type="button">دعوة</button>';
        return personRow(u, '<button class="btn sm ghost" data-follow-user="' + esc(u.id) + '" type="button">' + (isFollowingUser(u.id) ? "إلغاء المتابعة" : "+ متابعة") + "</button>" + rBtn + '<button class="btn sm" data-dm="' + esc(u.id) + '" type="button">💬 خاص</button>');
      }).join("") : '<div class="empty">لا يوجد أصدقاء بعد — ابحث عن مستخدم وأرسل له طلب صداقة</div>';
    } else if (UI.ftab === "requests") {
      var validReqs = (S.requests || []).filter(function (id) { return !isBlockedEitherWay(id); });
      html = validReqs.length ? validReqs.map(function (id) {
        return personRow(resolveLiveUser(id), '<button class="btn sm ok" data-accept="' + esc(id) + '" type="button">قبول الطلب</button><button class="btn sm ghost" data-reject="' + esc(id) + '" type="button">رفض</button>');
      }).join("") : '<div class="empty">لا توجد طلبات صداقة واردة حالياً</div>';
    } else if (UI.ftab === "sent") {
      var validSent = (S.sentReq || []).filter(function (id) { return !isBlockedEitherWay(id); });
      html = validSent.length ? validSent.map(function (id) {
        return personRow(resolveLiveUser(id), '<button class="btn sm ghost" data-cancelfreq="' + esc(id) + '" type="button">إلغاء الطلب</button>');
      }).join("") : '<div class="empty">لا توجد طلبات صداقة مرسلة حالياً</div>';
    } else {
      var q = UI.findQ.trim().toLowerCase();
      var res = S.users.filter(function (u) {
        if (isBlockedEitherWay(u.id)) return false;
        var live = resolveLiveUser(u.id);
        if (live.hideFromSearch) return false;
        return !q || (live.name || "").toLowerCase().indexOf(q) >= 0 || displayUserId(live).toLowerCase().indexOf(q) >= 0 || String(live.id || "").toLowerCase().indexOf(q) >= 0;
      }).slice(0, 30);
      html = res.length ? res.map(function (u) {
        return personRow(resolveLiveUser(u.id), buildDynamicRelationButtons(u.id, { showDm: true, showProfileBtn: true }));
      }).join("") : '<div class="empty">لا توجد نتائج مطابقة</div>';
    }
    $("friends-list").innerHTML = html;
  }

  function deleteDmThread(peerId) {
    if (!peerId) return;
    var tid = dmThreadId(S.me.id, peerId);
    offDb("dm_" + tid);
    delete UI.activeDmListenerLimits[tid];
    delete S.dms[peerId]; delete S.unread[peerId];
    if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("userDms/" + S.me.id + "/" + peerId).remove().catch(function () { /* */ });
    if (UI.dmId === peerId) closeDM();
    saveLocal(); renderMessages(); renderTop(); toast("تم حذف المحادثة");
  }

  function renderMessages() {
    if (!S) return;
    var seen = {}, ids = [];
    (S.friends || []).forEach(function (id) { if (id && id !== S.me.id && !seen[id] && !isBlockedEitherWay(id)) { seen[id] = true; ids.push(id); } });
    Object.keys(S.dms || {}).forEach(function (id) { if (id && id !== S.me.id && !seen[id] && isFriendWith(id) && !isBlockedEitherWay(id)) { seen[id] = true; ids.push(id); } });

    $("dm-list").innerHTML = ids.length ? ids.map(function (id) {
      var u = resolveLiveUser(id), thread = S.dms[id] || [], last = thread[thread.length - 1], un = S.unread[id] || 0;
      var lastLabel = last ? (last.audio ? "🎙️ رسالة صوتية" : (last.img ? "📷 صورة" : (last.text || "رسالة"))) : "صديق • اضغط لبدء الدردشة الخاصة";
      return '<div class="row glass" data-dm="' + esc(id) + '">' + avatarHTML(u) +
        '<div class="info"><div class="name">' + esc(u.name) + (un > 0 ? ' <span class="tag verified">' + un + " جديد</span>" : ' <span class="tag">صديق</span>') + '</div><div class="meta">' + esc(lastLabel) + '</div></div>' +
        '<div class="row-actions"><span class="meta">' + (last ? timeStr(last.t) : "💬") + '</span><button class="btn sm ghost" data-del-thread="' + esc(id) + '" type="button">🗑️</button></div></div>';
    }).join("") : '<div class="empty">أضف صديقاً ليظهر فوراً في قائمة الرسائل الخاصة 💬</div>';
  }

  function buildSocialListRowHTML(targetId, mode) {
    var u = resolveLiveUser(targetId);
    if (mode === "blocked") {
      return '<div class="row glass"><div data-profile="' + esc(targetId) + '" style="cursor:pointer">' + avatarHTML(u, "sm") + "</div>" +
        '<div class="info" data-profile="' + esc(targetId) + '" style="cursor:pointer"><div class="name">' + esc(u.name) + '</div><div class="meta">ID: ' + esc(displayUserId(u)) + " • محظور</div></div>" +
        '<div class="row-actions"><button class="btn sm ghost" data-profile="' + esc(targetId) + '" type="button">البروفايل</button><button class="btn sm ok" data-unblock-user="' + esc(targetId) + '" type="button">إلغاء الحظر</button></div></div>';
    }
    return '<div class="row glass"><div data-profile="' + esc(targetId) + '" style="cursor:pointer;position:relative">' + avatarHTML(u, "sm") + '<span class="dot ' + (u.online ? "on" : "") + '"></span></div>' +
      '<div class="info" data-profile="' + esc(targetId) + '" style="cursor:pointer"><div class="name">' + esc(u.name) + '</div><div class="meta">ID: ' + esc(displayUserId(u)) + " • " + (u.online ? "متصل" : "غير متصل") + "</div></div>" +
      '<div class="row-actions">' + buildDynamicRelationButtons(targetId, { showDm: true, showProfileBtn: true }) + "</div></div>";
  }

  function loadFollowers(limit) { var list = (S.followersList || []).filter(function (id) { return !isBlockedEitherWay(id); }); return typeof limit === "number" ? list.slice(0, limit) : list; }
  function loadFollowing(limit) { var list = (S.follows || []).filter(function (id) { return !isBlockedEitherWay(id); }); return typeof limit === "number" ? list.slice(0, limit) : list; }
  function loadFriends(limit) { var list = (S.friends || []).filter(function (id) { return !isBlockedEitherWay(id); }); return typeof limit === "number" ? list.slice(0, limit) : list; }
  function loadBlockedUsers(limit) { var list = (S.blocked || []).slice(); return typeof limit === "number" ? list.slice(0, limit) : list; }

  function openSocialListSheet(mode, customLimit) {
    var limit = customLimit || CONFIG.socialPageSize, title = "", allIds = [], emptyMsg = "";
    if (mode === "friends") { allIds = loadFriends(); title = "👥 الأصدقاء (" + allIds.length + ")"; emptyMsg = "لا يوجد أصدقاء مضافون بعد"; }
    else if (mode === "following") { allIds = loadFollowing(); title = "➕ أتابعهم (" + allIds.length + ")"; emptyMsg = "أنت لا تتابع أي حساب حالياً"; }
    else if (mode === "blocked") { allIds = loadBlockedUsers(); title = "🚫 الحسابات المحظورة (" + allIds.length + ")"; emptyMsg = "قائمة الحظر فارغة"; }
    else { allIds = loadFollowers(); title = "👁️ المتابعون (" + allIds.length + ")"; emptyMsg = "لا يوجد متابعون لحسابك بعد"; }

    if (!allIds.length) { openSheet("<h3>" + esc(title) + "</h3><div class='empty'>" + esc(emptyMsg) + "</div>"); return; }
    var visibleIds = allIds.slice(0, limit);
    var rows = visibleIds.map(function (id) { return buildSocialListRowHTML(id, mode); }).join("");
    var moreBtn = allIds.length > limit ? '<button class="btn sm ghost block" id="sheet-social-more" type="button">عرض المزيد (' + (allIds.length - limit) + " متبقي)</button>" : "";
    openSheet("<h3>" + esc(title) + "</h3><div class='list'>" + rows + "</div>" + moreBtn);
    if ($("sheet-social-more")) $("sheet-social-more").onclick = function () { openSocialListSheet(mode, limit + CONFIG.socialPageSize); };
  }

  function renderProfileGifts(m) {
    var grid = $("pf-gifts-grid"), badge = $("pf-gifts-total-badge");
    if (!grid) return;
    var maps = getGiftMaps(), rawMap = (m && m.receivedGifts && typeof m.receivedGifts === "object") ? m.receivedGifts : {}, uniqueMap = {}, totalCount = 0;
    Object.keys(rawMap).forEach(function (key) {
      var qty = Math.max(0, Math.floor(Number(rawMap[key] || 0)));
      if (!qty) return;
      var giftDef = maps.byId[key] || maps.byEmoji[key] || null;
      var canonicalKey = giftDef ? giftDef.id : String(key);
      if (!uniqueMap[canonicalKey]) {
        uniqueMap[canonicalKey] = {
          id: canonicalKey,
          visual: LUCKY_GIFT_ASSETS[canonicalKey] || (giftDef ? esc(giftDef.e) : "🎁"),
          n: giftDef ? giftDef.n : String(key),
          qty: 0
        };
      }
      uniqueMap[canonicalKey].qty += qty;
      totalCount += qty;
    });
    if (badge) badge.textContent = totalCount + " هدية";
    var items = Object.keys(uniqueMap).map(function (k) { return uniqueMap[k]; });
    var senderBox = $("pf-gift-senders");
    if (senderBox) {
      var logs = m && m.receivedGiftLog && typeof m.receivedGiftLog === "object" ? Object.keys(m.receivedGiftLog).map(function (k) { return m.receivedGiftLog[k]; }).filter(Boolean).sort(function (a, b) { return Number(b.createdAt || 0) - Number(a.createdAt || 0); }) : [];
      senderBox.innerHTML = logs.length ? logs.slice(0, 30).map(function (ev) {
        var donor = resolveLiveUser(ev.fromUid || "");
        var giftEmoji = ev.emoji || "🎁";
        return '<div class="row glass" style="margin-bottom:7px">' + avatarHTML({ id: ev.fromUid, name: ev.fromName, photo: ev.fromPhoto || donor.photo }, "sm") + '<div class="info"><div class="name">' + esc(ev.fromName || donor.name || "مستخدم") + '</div><div class="meta">أرسل ' + esc(giftEmoji) + ' ' + esc(ev.giftName || "هدية") + '</div></div><span class="tag">' + timeStr(ev.createdAt) + '</span></div>';
      }).join("") : '<div class="empty">لم تصلك هدايا بعد 💌</div>';
    }
    if (!items.length) { grid.innerHTML = '<div class="gift-showcase-empty">لم تصلك هدايا بعد 🎁</div>'; return; }
    grid.innerHTML = items.map(function (it) {
      return '<div class="gift-showcase-item"><span class="gift-showcase-qty">x' + it.qty + '</span><span class="gift-showcase-emoji">' + it.visual + '</span><div class="gift-showcase-name">' + esc(it.n) + "</div></div>";
    }).join("");
  }

  function renderProfileSocialTab() {
    var listBox = $("pf-social-tab-list"), moreBtn = $("pf-social-load-more");
    if (!listBox) return;
    var allIds = [], emptyMsg = "";
    if (UI.pftab === "friends") { allIds = loadFriends(); emptyMsg = "لا يوجد أصدقاء في قائمتك بعد"; }
    else if (UI.pftab === "followers") { allIds = loadFollowers(); emptyMsg = "لا يوجد متابعون لحسابك بعد"; }
    else if (UI.pftab === "following") { allIds = loadFollowing(); emptyMsg = "أنت لا تتابع أي حساب حالياً"; }

    var q = (UI.pfSocialQ || "").trim().toLowerCase();
    if (q) {
      allIds = allIds.filter(function (id) {
        var u = resolveLiveUser(id);
        return String(u.name || "").toLowerCase().indexOf(q) >= 0 || displayUserId(u).toLowerCase().indexOf(q) >= 0;
      });
    }
    if (!allIds.length) {
      listBox.innerHTML = '<div class="empty">' + esc(emptyMsg) + "</div>";
      if (moreBtn) moreBtn.classList.add("hidden");
      return;
    }
    listBox.innerHTML = allIds.slice(0, UI.pfSocialLimit).map(function (id) { return buildSocialListRowHTML(id, UI.pftab); }).join("");
    if (moreBtn) {
      moreBtn.classList.toggle("hidden", allIds.length <= UI.pfSocialLimit);
      moreBtn.onclick = function () { UI.pfSocialLimit += CONFIG.socialPageSize; renderProfileSocialTab(); };
    }
  }

  function renderProfile() {
    if (!S || !S.me) return;
    var m = resolveLiveUser(S.me.id), vipLv = getEffectiveVip(m);
    var covEl = $("pf-cover"), coverBg = m.coverPhoto || m.photo;
    if (covEl) covEl.style.backgroundImage = coverBg ? 'url("' + String(coverBg).replace(/"/g, '\\"') + '")' : "linear-gradient(135deg,#7c3aed,#db2777,#0891b2)";
    setAvatarEl($("pf-avatar"), m);
    var pfNameEl = $("pf-name");
    pfNameEl.textContent = m.name || "مستخدم";
    pfNameEl.classList.toggle("vip-gold", vipLv >= 2);
    $("pf-id").textContent = "ID: " + displayUserId(m);
    var ga = [];
    if (m.gender) ga.push(m.gender);
    if (m.age) ga.push(m.age + " سنة");
    $("pf-gender-age").textContent = ga.length ? ga.join(" • ") : "—";
    var verBadge = $("pf-verified-badge");
    if (verBadge) verBadge.classList.toggle("hidden", !m.verified);
    var bioEl = $("pf-bio");
    if (bioEl) bioEl.textContent = m.bio || "مرحباً بك في REAL VOICE";
    var vipBadge = $("pf-vip-badge");
    if (vipBadge) {
      if (vipLv > 0 && m.vipExpiresAt) {
        var remDays = Math.max(1, Math.ceil((Number(m.vipExpiresAt) - now()) / 86400000));
        vipBadge.textContent = "👑 VIP " + vipLv + " (" + remDays + "ي)";
      } else vipBadge.textContent = "VIP " + vipLv;
    }
    if ($("pf-user-level")) $("pf-user-level").textContent = "Lv." + computeLevelFromXp(m.xp || 0) + " (" + Number(m.xp || 0) + ")";
    $("pf-charm-level").textContent = "Lv." + getCharmLevel(m.charm || 0) + " (" + Number(m.charm || 0) + ")";
    updateProfileRelationshipCounts();
    if ($("pf-wallet-coins")) $("pf-wallet-coins").textContent = getTotalSpendableCoins().toLocaleString("en-US");
    if ($("pf-lucky-reward-bal")) $("pf-lucky-reward-bal").textContent = Number(S.me.recipientRewardBalance || 0).toLocaleString("en-US");

    document.querySelectorAll("#profile-subtabs .tab").forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-pftab") === UI.pftab); });
    var ovBox = $("pf-tab-overview"), socBox = $("pf-tab-social");
    if (ovBox) ovBox.classList.toggle("hidden", UI.pftab !== "overview");
    if (socBox) socBox.classList.toggle("hidden", UI.pftab === "overview");

    if (UI.pftab === "overview") {
      var admBtn = $("pf-admin-btn");
      if (admBtn) admBtn.classList.toggle("hidden", !S.me.isAdmin);
      renderProfileGifts(m);
    } else renderProfileSocialTab();
  }

  function renderCurrentPage() {
    if (UI.page === "home") renderHome();
    else if (UI.page === "rooms") renderRooms();
    else if (UI.page === "friends") renderFriends();
    else if (UI.page === "messages") renderMessages();
    else if (UI.page === "profile") renderProfile();
  }
  function renderAll() { renderTop(); renderCurrentPage(); }

  function openSheet(html) {
    var sh = $("sheet"), sc = $("scrim");
    if (!sh || !sc) return;
    sh.innerHTML = '<div class="sheet-handle"></div>' + html;
    sh.scrollTop = 0; sc.classList.add("open"); sh.classList.add("open");
  }
  function closeSheet() {
    var sh = $("sheet"), sc = $("scrim");
    if (sc) sc.classList.remove("open");
    if (sh) sh.classList.remove("open");
  }

  function openVipSheet() {
    var curVip = getEffectiveVip(S.me);
    var rows = VIP_TIERS.map(function (t) {
      return '<div class="row glass"><div class="info"><div class="name">' + esc(t.badge + " — " + t.name) + '</div><div class="meta">' + esc(t.perks.join(" • ")) + '</div></div></div>';
    }).join("");
    openSheet("<h3>👑 عضويات VIP</h3><div class='meta'>مستواك الحالي VIP " + curVip + "</div><div class='list'>" + rows + "</div>");
  }

  function openAdminPanelSheet() {
    if (!S.me.isAdmin) { toast("هذه اللوحة متاحة للمشرفين المعتمدين فقط"); return; }
    openSheet(
      "<h3>🛡️ لوحة إدارة REAL VOICE</h3>" +
      "<div class='notice'>لإدارة العملات، تعديل أرقام ID، ونظام «هدايا الحظ» والتقارير الإحصائية التفصيلية، افتح لوحة الإدارة المتقدمة أو استخدم الإجراءات السريعة أدناه.</div>" +
      "<a class='btn block' href='./admin.html' target='_blank' style='display:block;text-align:center;text-decoration:none;margin-top:10px'>🚀 فتح لوحة الإدارة الكاملة (admin.html)</a>" +
      "<label style='margin-top:12px'>بحث مستخدم بالاسم أو ID</label><input id='adm-u-search' placeholder='مثال: 1000001' />" +
      "<div id='adm-u-list' class='list' style='margin-top:8px'></div>"
    );
    function renderAdminUsers(qStr) {
      qStr = String(qStr || "").trim().toLowerCase();
      var pool = [S.me].concat(S.users || []).filter(function (u) {
        if (!qStr) return true;
        return String(u.name || "").toLowerCase().indexOf(qStr) >= 0 || displayUserId(u).toLowerCase().indexOf(qStr) >= 0;
      }).slice(0, 6);
      var box = $("adm-u-list");
      if (!box) return;
      box.innerHTML = pool.map(function (u) {
        return "<div class='row glass'><div class='info'><div class='name'>" + esc(u.name) + " <span class='tag'>ID: " + esc(displayUserId(u)) + "</span></div></div></div>";
      }).join("");
    }
    renderAdminUsers("");
    if ($("adm-u-search")) $("adm-u-search").oninput = function () { renderAdminUsers(this.value); };
  }

  function openRoomFriendsInviteSheet() {
    var fr = (S.friends || []).filter(function (id) { return !isBlockedEitherWay(id); }).map(resolveLiveUser);
    var activeRoomId = UI.roomId || UI.floatingRoomId, activeRoom = getRoom(activeRoomId);
    if (!fr.length) { openSheet("<h3>👥 الأصدقاء</h3><div class='empty'>لا يوجد أصدقاء في قائمتك بعد</div>"); return; }
    var rows = fr.map(function (u) {
      var curRoom = findUserCurrentRoom(u.id), alreadyHere = activeRoom && inRoom(activeRoom, u.id);
      var btnHtml = alreadyHere ? '<span class="tag verified">داخل الغرفة</span>' : '<button class="btn sm gold" data-invite-friend="' + esc(u.id) + '" type="button">📩 دعوة للغرفة</button>';
      return '<div class="row glass">' + avatarHTML(u, "sm") + '<div class="info"><div class="name">' + esc(u.name) + '</div><div class="meta">' + (curRoom ? "في: " + esc(curRoom.name) : (u.online ? "متصل" : "غير متصل")) + '</div></div><div class="row-actions">' + btnHtml + '<button class="btn sm ghost" data-dm="' + esc(u.id) + '" type="button">💬</button></div></div>';
    }).join("");
    openSheet("<h3>👥 أصدقاؤك ودعوتهم للغرفة</h3><div class='list'>" + rows + "</div>");
  }

  function openProfileSettingsSheet() {
    var m = S.me, nextPhoto = m.photo || "", nextCover = m.coverPhoto || "";
    openSheet("<h3>⚙️ إعدادات الملف الشخصي والخصوصية</h3>" +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px"><div class="avatar lg" id="set-av-live">' + (nextPhoto ? '<img src="' + esc(nextPhoto) + '" alt="" />' : esc(initials(m.name))) + '</div><div class="info"><div class="name">' + esc(m.name || "مستخدم") + '</div><div class="meta">ID: ' + esc(displayUserId(m)) + " • REAL VOICE" + "</div></div></div>" +
      "<label>الاسم</label><input id='set-name' maxlength='24' value='" + esc(m.name) + "' />" +
      "<label>العمر</label><input id='set-age' type='number' min='10' max='99' value='" + esc(m.age || "") + "' />" +
      "<label>النوع</label><select id='set-gender'><option value='ذكر' " + (m.gender !== "أنثى" ? "selected" : "") + ">ذكر</option><option value='أنثى' " + (m.gender === "أنثى" ? "selected" : "") + ">أنثى</option></select>" +
      "<label>النبذة التعريفية</label><textarea id='set-bio' rows='2' maxlength='140'>" + esc(m.bio || "") + "</textarea>" +
      "<label>تغيير صورة البروفايل</label><input id='set-photo-file' type='file' accept='image/*' />" +
      "<label>تغيير صورة الغلاف</label><input id='set-cover-file' type='file' accept='image/*' />" +
      '<button class="btn block" id="set-save-profile" type="button">💾 حفظ ونشر البيانات</button>' +
      '<button class="btn ghost block" id="set-blocked-list" type="button">🚫 إدارة الحسابات المحظورة (' + (S.blocked || []).length + ")</button>" +
      '<div class="switchrow" style="margin-top:8px"><span>إخفاء حسابي من البحث</span><input type="checkbox" id="set-hide-search" ' + (S.settings.hideFromSearch ? "checked" : "") + " /></div>" +
      '<div class="switchrow"><span>إيقاف الموسيقى تلقائياً عند مغادرة الغرفة</span><input type="checkbox" id="set-stop-music" ' + (S.settings.stopMusicOnLeave !== false ? "checked" : "") + " /></div>" +
      '<div class="switchrow"><span>الوضع النهاري</span><input type="checkbox" id="set-theme" ' + (S.settings.lightTheme ? "checked" : "") + " /></div>" +
      '<div class="switchrow"><span>إشعارات التطبيق</span><input type="checkbox" id="set-notif" ' + (S.settings.notif !== false ? "checked" : "") + " /></div>" +
      '<button class="btn ghost block" id="set-logout" type="button">🚪 تسجيل الخروج</button>');

    $("set-photo-file").onchange = async function () {
      var f = this.files && this.files[0]; if (!f) return;
      try {
        nextPhoto = await readImageFileAsDataUrl(f, 180, 0.55);
        var avEl = $("set-av-live"); if (avEl) avEl.innerHTML = '<img src="' + esc(nextPhoto) + '" alt="" />';
        toast("تم تحميل الصورة الشخصية — اضغط حفظ ✅");
      } catch (e) { toast(e.message); }
    };
    $("set-cover-file").onchange = async function () {
      var f = this.files && this.files[0]; if (!f) return;
      try { nextCover = await readImageFileAsDataUrl(f, 420, 0.6); toast("تم تحميل صورة الغلاف — اضغط حفظ ✅"); }
      catch (e) { toast(e.message); }
    };
    $("set-save-profile").onclick = function () {
      var n = $("set-name").value.trim();
      if (!n) { toast("الاسم مطلوب"); return; }
      m.name = clean(n); m.age = $("set-age").value.trim(); m.gender = $("set-gender").value;
      m.bio = clean($("set-bio").value.trim()); m.photo = nextPhoto; m.coverPhoto = nextCover;
      S.settings.hideFromSearch = !!$("set-hide-search").checked;
      S.settings.stopMusicOnLeave = !!$("set-stop-music").checked;
      save(); closeSheet(); renderAll(); if (UI.roomId) renderRoom();
      toast("تم تحديث ملفك الشخصي بنجاح ✅");
    };
    if ($("set-blocked-list")) $("set-blocked-list").onclick = function () { openSocialListSheet("blocked"); };
    $("set-theme").onchange = function () { S.settings.lightTheme = this.checked; applyThemeMode(); saveLocal(); renderTop(); };
    $("set-notif").onchange = function () { S.settings.notif = this.checked; saveLocal(); };
    $("set-logout").onclick = function () { signOutApp(); };
  }

  function openRenameRoomSheet(room) {
    if (!room || !isRoomModOrOwner(room, S.me.id)) { toast("تعديل بيانات الغرفة متاح لمالك الغرفة والمشرفين فقط"); return; }
    openSheet("<h3>✏️ تعديل معلومات الغرفة</h3><label>اسم الغرفة</label><input id='rn-input' maxlength='40' value='" + esc(room.name) + "' /><label>وصف الغرفة</label><textarea id='rn-desc' rows='2' maxlength='120'>" + esc(room.desc || "") + "</textarea><button class='btn block' id='rn-ok' type='button'>حفظ التعديلات</button>");
    $("rn-ok").onclick = function () {
      var nextName = clean($("rn-input").value.trim()), nextDesc = clean($("rn-desc").value.trim());
      if (!nextName) { toast("اكتب اسم الغرفة"); return; }
      room.name = nextName; room.desc = nextDesc;
      if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + room.id).update({ name: nextName, desc: nextDesc }).catch(function () { /* */ });
      saveLocal(); closeSheet(); renderRoom(); renderFloatingOrb(); renderHome(); renderRooms();
      toast("تم تحديث معلومات الغرفة ✅");
    };
  }

  function openCreateRoom() {
    if (UI.isGuest || !cloud.on || !cloud.db || !cloud.auth || !cloud.auth.currentUser) {
      toast("إنشاء غرفة عامة يتطلب اتصالاً بحساب التطبيق");
      return;
    }
    var ownedRoom = (S.rooms || []).find(function (r) { return r && r.owner === S.me.id; });
    if (ownedRoom) {
      toast("لديك غرفة بالفعل («" + ownedRoom.name + "»)، يمكنك الدخول إليها أو تعديلها.");
      enterRoom(ownedRoom.id);
      return;
    }
    var cats = Object.keys(CATEGORIES).map(function (k) { return '<option value="' + k + '">' + CATEGORIES[k] + "</option>"; }).join("");
    openSheet("<h3>🎙️ إنشاء غرفة جديدة</h3>" +
      '<label>اسم الغرفة</label><input id="cr-name" maxlength="40" placeholder="مثال: سهرة الأصدقاء" />' +
      '<label>صورة الغرفة</label><input id="cr-photo-file" type="file" accept="image/*" />' +
      '<div id="cr-photo-preview" style="margin:8px 0;text-align:center"></div>' +
      '<label>وصف الغرفة (اختياري)</label><input id="cr-desc" maxlength="100" placeholder="مثال: سوالف وموسيقى" />' +
      '<label>التصنيف</label><select id="cr-cat">' + cats + "</select>" +
      '<label>عدد المقاعد</label><select id="cr-seats"><option value="6">6 مقاعد</option><option value="9" selected>9 مقاعد</option><option value="12">12 مقعد</option></select>' +
      '<div class="switchrow"><span>غرفة خاصة</span><input type="checkbox" id="cr-priv" /></div>' +
      '<div id="cr-pass-wrap" class="hidden"><label>كلمة مرور الغرفة الخاصة</label><input id="cr-pass" type="password" maxlength="20" placeholder="أدخل كلمة مرور..." /></div>' +
      '<div class="switchrow"><span>وضع طلب المايك (رفع اليد)</span><input type="checkbox" id="cr-approval" /></div>' +
      '<button class="btn block" id="cr-ok" type="button">إنشاء الغرفة</button>');

    var selectedRoomPhoto = "";
    $("cr-photo-file").onchange = async function () {
      var f = this.files && this.files[0]; if (!f) return;
      try {
        selectedRoomPhoto = await readImageFileAsDataUrl(f, 480, 0.62);
        $("cr-photo-preview").innerHTML = '<img src="' + esc(selectedRoomPhoto) + '" alt="" style="width:112px;height:112px;object-fit:cover;border-radius:18px" />';
      } catch (e) { toast(e.message || "تعذر قراءة الصورة"); }
    };
    $("cr-priv").onchange = function () { $("cr-pass-wrap").classList.toggle("hidden", !this.checked); };
    $("cr-ok").onclick = async function () {
      var btn = $("cr-ok"); if (btn.disabled) return;
      var name = $("cr-name").value.trim();
      if (!name) { toast("اكتب اسم الغرفة"); return; }
      var isPriv = !!($("cr-priv") && $("cr-priv").checked);
      var pass = isPriv && $("cr-pass") ? String($("cr-pass").value || "").trim() : "";
      if (isPriv && !pass) { toast("أدخل كلمة مرور للغرفة الخاصة"); return; }
      var n = Number($("cr-seats").value), approval = !!($("cr-approval") && $("cr-approval").checked);
      var roomId = "r" + Math.random().toString(36).slice(2, 10);
      var room = {
        id: roomId, name: clean(name), desc: clean(($("cr-desc") && $("cr-desc").value) || ""), cat: $("cr-cat").value,
        owner: S.me.id, mods: [], seats: makeSeats(n), listeners: [], handRequests: [], micApprovalMode: approval, bans: [],
        priv: isPriv, passcode: pass, locked: false, pinned: "", created: now(), msgs: [],
        color: Math.floor(Math.random() * COVERS.length), icon: Math.floor(Math.random() * COVER_ICONS.length), roomPhoto: selectedRoomPhoto, music: null, playlist: DEFAULT_TRACKS.slice()
      };
      btn.disabled = true; btn.textContent = "جارٍ إنشاء الغرفة...";
      var indexRef = cloud.db.ref("userRoomIndex/" + S.me.id);
      try {
        var reservation = await indexRef.transaction(function (current) { return current == null ? roomId : undefined; });
        if (!reservation.committed) {
          toast("لديك غرفة بالفعل.");
          btn.disabled = false; btn.textContent = "إنشاء الغرفة"; return;
        }
        await cloud.db.ref("rooms/" + roomId).set({
          name: room.name, desc: room.desc, cat: room.cat, owner: room.owner, seatCount: n,
          micApprovalMode: approval, priv: isPriv, passcode: pass, created: serverTs(), color: room.color, icon: room.icon, roomPhoto: selectedRoomPhoto
        });
        S.rooms = dedupeRoomsList([room].concat(S.rooms || []));
        save(); closeSheet(); renderAll(); enterRoom(roomId);
        toast("تم إنشاء غرفتك بنجاح 🎉");
      } catch (err) {
        try { await indexRef.transaction(function (current) { return current === roomId ? null : current; }); } catch (_) {}
        toast("تعذر إنشاء الغرفة.");
        btn.disabled = false; btn.textContent = "إنشاء الغرفة";
      }
    };
  }

  function enterRoom(id, bypassPasscheck) {
    closeSheet();
    var room = getRoom(id);
    if (!room) { toast("الغرفة غير موجودة"); return; }
    if (isBlockedEitherWay(room.owner)) { toast("لا يمكنك دخول هذه الغرفة بسبب الحظر 🚫"); return; }
    if (Array.isArray(room.bans) && room.bans.indexOf(S.me.id) >= 0) { toast("أنت محظور من دخول هذه الغرفة"); return; }
    if (room.priv && room.passcode && room.owner !== S.me.id && !isRoomModOrOwner(room, S.me.id) && !bypassPasscheck) {
      openSheet("<h3>🔒 غرفة خاصة</h3><div class='meta' style='margin-bottom:8px'>أدخل كلمة المرور للدخول إلى «" + esc(room.name) + "»</div><input id='rm-pass-input' type='password' /><button class='btn block' id='rm-pass-go' type='button'>دخول الغرفة</button>");
      $("rm-pass-go").onclick = function () {
        if ((($("rm-pass-input").value || "").trim()) !== room.passcode) { toast("كلمة المرور غير صحيحة ❌"); return; }
        enterRoom(id, true);
      };
      return;
    }

    var wasAlreadyInRoom = inRoom(room, S.me.id), resumingFromOrb = (UI.floatingRoomId === id);
    offDb("room");
    UI.roomId = id;
    if (!UI.roomSessionStart) UI.roomSessionStart = now();
    UI.floatingRoomId = null;
    renderFloatingOrb();
    $("room-view").classList.add("open");
    updateOverlayLock();

    if (!wasAlreadyInRoom) {
      if (!Array.isArray(room.listeners)) room.listeners = [];
      if (room.listeners.indexOf(S.me.id) < 0) room.listeners.push(S.me.id);
      if (cloud.on && cloud.db && !UI.isGuest) {
        var lRef = cloud.db.ref("rooms/" + id + "/listeners/" + S.me.id);
        try { lRef.onDisconnect().remove(); } catch (e) { /* */ }
        lRef.set(true).catch(function () { /* */ });
      }
      pushRoomMsg(room, { sys: true, joinUser: { uid: S.me.id, name: S.me.name || "مستخدم" }, text: (S.me.name || "مستخدم") + " دخل الغرفة 👋" });
      showEntryBanner(S.me);
    } else if (!resumingFromOrb && cloud.on && cloud.db && !UI.isGuest) {
      var curSeatIdx = seatIndexOf(room, S.me.id);
      if (curSeatIdx >= 0) cloud.db.ref("rooms/" + id + "/seats/" + curSeatIdx + "/uid").set(S.me.id).catch(function () { /* */ });
    }

    syncRoomMusicPlayer(room); renderRoom(); renderHome();
    if (cloud.on && cloud.db && !UI.isGuest) {
      onDb("room", cloud.db.ref("rooms/" + id + "/listeners"), "value", function (lsSnap) {
        var r = getRoom(id);
        if (!r) return;
        var lObj = lsSnap.val() || {};
        var seatUids = {};
        (r.seats || []).forEach(function (st) { if (st && st.uid) seatUids[st.uid] = true; });
        r.listeners = Object.keys(lObj).filter(function (k) { return !!lObj[k] && !seatUids[k]; });
        if (UI.roomId === id) renderRoom();
      });

      onDb("room", cloud.db.ref("roomMessages/" + id).limitToLast(60), "value", function (ms) {
        var r = getRoom(id);
        if (!r) return;
        var v = ms.val() || {}, prevKeys = {}, hadInitial = Array.isArray(cloud.roomMsgs[id]) && cloud.roomMsgs[id].length > 0;
        (cloud.roomMsgs[id] || []).forEach(function (mItem) { if (mItem && mItem.key) prevKeys[mItem.key] = true; });
        var arr = Object.keys(v).map(function (k) { return Object.assign({ key: k }, v[k]); });
        arr.sort(function (a, b) { return (a.t || 0) - (b.t || 0); });
        if (hadInitial) {
          arr.forEach(function (mItem) {
            if (!mItem || prevKeys[mItem.key]) return;
            if (mItem.sys && mItem.joinUser && mItem.joinUser.uid && mItem.joinUser.uid !== S.me.id && !isBlockedEitherWay(mItem.joinUser.uid)) {
              showEntryBanner(resolveLiveUser(mItem.joinUser.uid));
            }
            if (mItem.gift && mItem.gift.eventId && !seenGiftEventIds[mItem.gift.eventId]) {
              seenGiftEventIds[mItem.gift.eventId] = true;
              if (mItem.gift.fromUid !== S.me.id) {
                var vis = mItem.gift.giftId && LUCKY_GIFT_ASSETS[mItem.gift.giftId] ? LUCKY_GIFT_ASSETS[mItem.gift.giftId] : (mItem.gift.emoji || "🎁");
                showFlyGiftToSeat(vis, mItem.gift.fromName || "مستخدم", mItem.gift.toUid || "", mItem.gift.toName || "مستخدم");
              }
            }
          });
        } else {
          arr.forEach(function (mItem) { if (mItem && mItem.gift && mItem.gift.eventId) seenGiftEventIds[mItem.gift.eventId] = true; });
        }
        cloud.roomMsgs[id] = arr; r.msgs = arr;
        if (UI.roomId === id) renderRoomChat();
      });
    }
    joinVoiceChannel(id, "publisher").then(function () {
      var curR = getRoom(id);
      if (curR && seatIndexOf(curR, S.me.id) >= 0) syncMicHardwareState();
    });
  }

  function minimizeRoom() {
    if (!UI.roomId) return;
    UI.floatingRoomId = UI.roomId;
    UI.roomId = null;
    $("room-view").classList.remove("open");
    updateOverlayLock();
    renderFloatingOrb();
    renderAll();
  }

  function renderFloatingOrb() {
    var orb = $("floating-room-orb");
    if (!orb) return;
    var room = getRoom(UI.floatingRoomId);
    if (!room) {
      orb.classList.add("hidden");
      return;
    }
    orb.classList.remove("hidden");
    var av = $("floating-orb-avatar");
    if (av) {
      if (room.roomPhoto) av.innerHTML = '<img src="' + esc(room.roomPhoto) + '" alt="" />';
      else av.textContent = COVER_ICONS[(room.icon || 0) % COVER_ICONS.length];
    }
    if ($("floating-orb-label")) $("floating-orb-label").textContent = room.name;
  }

  async function leaveRoom(notifyOthers) {
    var rid = UI.roomId || UI.floatingRoomId;
    var room = getRoom(rid);
    offDb("room");
    UI.roomId = null;
    UI.floatingRoomId = null;
    UI.roomSessionStart = 0;
    $("room-view").classList.remove("open");
    updateOverlayLock();
    renderFloatingOrb();

    if (room) {
      var sIdx = seatIndexOf(room, S.me.id);
      if (sIdx >= 0) {
        room.seats[sIdx].uid = null;
        room.seats[sIdx].muted = false;
        if (cloud.on && cloud.db && !UI.isGuest) {
          cloud.db.ref("rooms/" + rid + "/seats/" + sIdx).update({ uid: null, muted: false }).catch(function () { /* */ });
        }
      }
      room.listeners = (room.listeners || []).filter(function (x) { return x !== S.me.id; });
      if (cloud.on && cloud.db && !UI.isGuest) {
        cloud.db.ref("rooms/" + rid + "/listeners/" + S.me.id).remove().catch(function () { /* */ });
      }
      if (notifyOthers !== false) {
        pushRoomMsg(room, { sys: true, text: (S.me.name || "مستخدم") + " غادر الغرفة" });
      }
    }

    var stopMusic = !(S && S.settings && S.settings.stopMusicOnLeave === false);
    await leaveVoiceChannel(!stopMusic);
    renderAll();
  }

  function renderRoom() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var owner = resolveLiveUser(room.owner);
    $("room-title").textContent = room.name;
    $("room-right-id").textContent = "ID: " + displayUserId(owner);
    $("room-online-count").textContent = String(count(room));
    $("room-wallet-balance").textContent = getTotalSpendableCoins().toLocaleString("en-US");

    var thumb = $("room-top-thumb");
    if (thumb) {
      if (room.roomPhoto) thumb.innerHTML = '<img src="' + esc(room.roomPhoto) + '" alt="" />';
      else thumb.innerHTML = '<span>' + COVER_ICONS[(room.icon || 0) % COVER_ICONS.length] + '</span>';
    }

    var pinBanner = $("room-pinned-banner");
    if (pinBanner) {
      pinBanner.classList.toggle("hidden", !room.pinned);
      if ($("room-pinned-text")) $("room-pinned-text").textContent = room.pinned || "";
    }

    var seatsGrid = $("room-seats");
    seatsGrid.setAttribute("data-n", String(room.seats.length));
    seatsGrid.innerHTML = room.seats.map(function (s, idx) {
      var u = s.uid ? resolveLiveUser(s.uid) : null;
      var muted = s.muted || (s.uid === S.me.id && UI.micMuted);
      var cls = "seat" + (u ? " occ" : "") + (s.locked ? " locked" : "");
      var inner = s.locked ? "🔒" : (u ? '<div class="seatav">' + avatarInnerHTML(u) + "</div>" : (s.vip ? "👑" : "+"));
      var nameLabel = s.locked ? "مقفل" : (u ? u.name : "مقعد " + (idx + 1));
      var subLabel = u ? (s.uid === room.owner ? "المالك" : (isRoomModOrOwner(room, s.uid) ? "مشرف" : "متحدث")) : (s.vip ? "VIP" : "متاح");
      return '<div class="' + cls + '" data-seat="' + idx + '">' +
        '<div class="seat-orb"><span class="seat-num-badge">' + (idx + 1) + "</span>" + inner + (u && muted ? '<span class="mutedmark">🔇</span>' : "") + "</div>" +
        '<div class="seat-meta-pill"><div class="seatname-full">' + esc(nameLabel) + '</div><div class="seatsub">' + esc(subLabel) + "</div></div></div>";
    }).join("");

    var mySeatIdx = seatIndexOf(room, S.me.id);
    var micBtn = $("mic-btn");
    if (micBtn) {
      micBtn.classList.toggle("hidden", mySeatIdx < 0);
      var isMuted = mySeatIdx >= 0 && (UI.micMuted || room.seats[mySeatIdx].muted);
      micBtn.textContent = isMuted ? "🔇" : "🎙️";
    }

    var handBtn = $("raise-hand-btn");
    var isMod = isRoomModOrOwner(room, S.me.id);
    if (handBtn) {
      handBtn.classList.toggle("hidden", !room.micApprovalMode && !isMod);
      var reqCount = (room.handRequests || []).length;
      var rBadge = $("raise-badge");
      if (rBadge) { rBadge.textContent = String(reqCount); rBadge.classList.toggle("hidden", !isMod || reqCount === 0); }
    }

    var photoBtn = $("room-photo-btn");
    if (photoBtn) photoBtn.classList.toggle("hidden", !isMod);

    applyRoomSpeakerMuteState();
    renderRoomChat();
    updateSpeakingIndicators();
  }

  function renderRoomChat() {
    var room = getRoom(UI.roomId);
    var box = $("room-chat");
    if (!room || !box) return;
    var msgs = (room.msgs || []).slice(-60);
    box.innerHTML = msgs.map(function (m) {
      if (m.sys) return '<div class="msg sys">' + esc(m.text || "") + "</div>";
      var isMe = m.uid === S.me.id;
      var body = m.img ? '<img src="' + esc(m.img) + '" style="max-width:190px;border-radius:10px;display:block;margin-top:4px" alt="" />' : esc(m.text || "");
      return '<div class="msg ' + (isMe ? "me" : "") + '">' +
        (!isMe ? '<div class="who" data-profile="' + esc(m.uid || "") + '" style="cursor:pointer">' + esc(m.name || "مستخدم") + "</div>" : "") +
        "<div>" + body + '</div><div class="tm">' + timeStr(m.t) + "</div></div>";
    }).join("");
    box.scrollTop = box.scrollHeight;
  }

  async function handleSeatClick(idx) {
    var room = getRoom(UI.roomId);
    if (!room || !room.seats[idx]) return;
    var seat = room.seats[idx];
    var isMod = isRoomModOrOwner(room, S.me.id);
    var mySeatIdx = seatIndexOf(room, S.me.id);

    if (seat.uid) {
      if (seat.uid === S.me.id) {
        openSheet(
          "<h3>🎙️ خيارات مقعدك</h3><div class='actlist'>" +
            "<button id='st-toggle-mic' type='button'>" + (UI.micMuted ? "🔊 فتح الميكروفون" : "🔇 كتم الميكروفون") + "</button>" +
            "<button id='st-leave-seat' class='danger' type='button'>⬇️ النزول من المايك</button>" +
          "</div>"
        );
        $("st-toggle-mic").onclick = function () { closeSheet(); toggleRoomMic(); };
        $("st-leave-seat").onclick = function () { closeSheet(); leaveCurrentSeat(room); };
      } else {
        openUserProfileSheet(seat.uid, room, idx);
      }
      return;
    }

    if (seat.locked && !isMod) {
      toast("هذا المقعد مقفل من الإدارة 🔒");
      return;
    }

    if (seat.locked && isMod) {
      openSheet("<h3>🔒 مقعد مقفل</h3><div class='actlist'><button id='st-unlock' type='button'>🔓 فتح قفل المقعد</button></div>");
      $("st-unlock").onclick = function () {
        seat.locked = false;
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + room.id + "/seats/" + idx + "/locked").set(false);
        closeSheet(); renderRoom();
      };
      return;
    }

    if (room.micApprovalMode && !isMod && mySeatIdx < 0) {
      if ((room.handRequests || []).indexOf(S.me.id) < 0) {
        room.handRequests.push(S.me.id);
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + room.id + "/handRequests/" + S.me.id).set(true);
        pushRoomMsg(room, { sys: true, text: "✋ طلب " + S.me.name + " الصعود للمايك" });
      }
      toast("تم إرسال طلب الصعود للمايك ✋");
      return;
    }

    UI.pendingSeatActionAt = now();
    if (mySeatIdx >= 0) {
      room.seats[mySeatIdx].uid = null;
      room.seats[mySeatIdx].muted = false;
      if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + room.id + "/seats/" + mySeatIdx).update({ uid: null, muted: false });
    }
    seat.uid = S.me.id;
    seat.muted = false;
    UI.micMuted = false;
    room.listeners = (room.listeners || []).filter(function (x) { return x !== S.me.id; });

    if (cloud.on && cloud.db && !UI.isGuest) {
      var ups = {};
      ups["rooms/" + room.id + "/seats/" + idx] = { uid: S.me.id, locked: false, muted: false, vip: !!seat.vip };
      ups["rooms/" + room.id + "/listeners/" + S.me.id] = null;
      ups["rooms/" + room.id + "/handRequests/" + S.me.id] = null;
      await cloud.db.ref().update(ups).catch(function () { /* */ });
    }
    renderRoom();
    syncMicHardwareState();
  }

  function leaveCurrentSeat(room) {
    if (!room) return;
    var idx = seatIndexOf(room, S.me.id);
    if (idx < 0) return;
    UI.pendingSeatActionAt = now();
    room.seats[idx].uid = null;
    room.seats[idx].muted = false;
    if ((room.listeners || []).indexOf(S.me.id) < 0) room.listeners.push(S.me.id);
    if (cloud.on && cloud.db && !UI.isGuest) {
      var ups = {};
      ups["rooms/" + room.id + "/seats/" + idx] = { uid: null, locked: !!room.seats[idx].locked, muted: false, vip: !!room.seats[idx].vip };
      ups["rooms/" + room.id + "/listeners/" + S.me.id] = true;
      cloud.db.ref().update(ups).catch(function () { /* */ });
    }
    stopLocalMic();
    renderRoom();
  }

  function toggleRoomMic() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var idx = seatIndexOf(room, S.me.id);
    if (idx < 0) { toast("اصعد على مقعد أولاً للتحدث"); return; }
    UI.micMuted = !UI.micMuted;
    room.seats[idx].muted = UI.micMuted;
    if (cloud.on && cloud.db && !UI.isGuest) {
      cloud.db.ref("rooms/" + room.id + "/seats/" + idx + "/muted").set(UI.micMuted).catch(function () { /* */ });
    }
    renderRoom();
    syncMicHardwareState();
  }

  function openRoomMenuSheet() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var isMod = isRoomModOrOwner(room, S.me.id);
    var isOwner = room.owner === S.me.id;
    var acts = "<div class='actlist'>";
    if (isMod) {
      acts += "<button id='rm-opt-edit' type='button'>✏️ تعديل اسم ووصف الغرفة</button>";
      acts += "<button id='rm-opt-pin' type='button'>📌 تثبيت رسالة إعلانية في الغرفة</button>";
      acts += "<button id='rm-opt-approval' type='button'>" + (room.micApprovalMode ? "🔓 إلغاء نظام طلب المايك" : "✋ تفعيل نظام طلب المايك") + "</button>";
    }
    acts += "<button id='rm-opt-lucky-log' type='button'>🎲 سجل هدايا الحظ الخاص بي</button>";
    acts += "<button id='rm-opt-min' type='button'>⬇️ تصغير الغرفة والبقاء متصلاً</button>";
    if (isOwner && !String(room.id).startsWith("room_")) {
      acts += "<button id='rm-opt-del' class='danger' type='button'>🗑️ حذف الغرفة</button>";
    }
    acts += "<button id='rm-opt-leave' class='danger' type='button'>🚪 مغادرة الغرفة نهائياً</button></div>";
    openSheet("<h3>⚙️ خيارات الغرفة</h3>" + acts);

    if ($("rm-opt-edit")) $("rm-opt-edit").onclick = function () { openRenameRoomSheet(room); };
    if ($("rm-opt-pin")) $("rm-opt-pin").onclick = function () {
      openSheet("<h3>📌 رسالة مثبتة</h3><input id='pin-val' maxlength='120' value='" + esc(room.pinned || "") + "' placeholder='اكتب الرسالة أو اتركها فارغة للإزالة...' /><button class='btn block' id='pin-save' type='button'>حفظ</button>");
      $("pin-save").onclick = function () {
        var txt = clean($("pin-val").value.trim());
        room.pinned = txt;
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + room.id + "/pinned").set(txt);
        closeSheet(); renderRoom();
      };
    };
    if ($("rm-opt-approval")) $("rm-opt-approval").onclick = function () {
      room.micApprovalMode = !room.micApprovalMode;
      if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + room.id + "/micApprovalMode").set(room.micApprovalMode);
      closeSheet(); renderRoom();
    };
    if ($("rm-opt-lucky-log")) $("rm-opt-lucky-log").onclick = function () { openLuckyHistorySheet(1); };
    if ($("rm-opt-min")) $("rm-opt-min").onclick = function () { closeSheet(); minimizeRoom(); };
    if ($("rm-opt-leave")) $("rm-opt-leave").onclick = function () { closeSheet(); leaveRoom(true); };
    if ($("rm-opt-del")) $("rm-opt-del").onclick = async function () {
      if (cloud.on && cloud.db && !UI.isGuest) {
        await cloud.db.ref("rooms/" + room.id).remove().catch(function () { /* */ });
        await cloud.db.ref("userRoomIndex/" + S.me.id).remove().catch(function () { /* */ });
      }
      S.rooms = (S.rooms || []).filter(function (x) { return x.id !== room.id; });
      closeSheet(); leaveRoom(false); toast("تم حذف الغرفة");
    };
  }

  function openRoomPresenceSheet() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var ids = getRoomParticipantIds(room);
    var rows = ids.map(function (id) {
      var u = resolveLiveUser(id);
      var role = id === room.owner ? "المالك" : (seatIndexOf(room, id) >= 0 ? "على المايك" : "مستمع");
      return '<div class="row glass" data-profile="' + esc(id) + '" style="cursor:pointer">' + avatarHTML(u, "sm") +
        '<div class="info"><div class="name">' + esc(u.name) + ' <span class="tag">' + role + '</span></div><div class="meta">ID: ' + esc(displayUserId(u)) + '</div></div></div>';
    }).join("");
    openSheet("<h3>🎧 المتواجدون في الغرفة (" + ids.length + ")</h3><div class='list'>" + (rows || "<div class='empty'>لا يوجد متواجدون</div>") + "</div>");
  }

  function openUserProfileSheet(targetId, roomCtx, seatIdxCtx) {
    if (!targetId) return;
    if (targetId === S.me.id) { closeSheet(); if (UI.roomId) minimizeRoom(); go("profile"); return; }
    var u = resolveLiveUser(targetId);
    var rel = getRelationshipStatus(targetId);
    var curRoom = roomCtx || getRoom(UI.roomId);
    var isMod = curRoom && isRoomModOrOwner(curRoom, S.me.id);

    var modHtml = "";
    if (isMod && curRoom && targetId !== curRoom.owner) {
      modHtml += "<div class='sec-head'><h4 class='sec-title'>🛡️ إجراءات الإدارة</h4></div><div class='actlist'>";
      if (typeof seatIdxCtx === "number" && seatIdxCtx >= 0) {
        modHtml += "<button id='mod-mute-seat' type='button'>🔇 كتم/فك كتم المايك</button>";
        modHtml += "<button id='mod-kick-seat' type='button'>⬇️ إنزال من المايك</button>";
      }
      modHtml += "<button id='mod-ban-room' class='danger' type='button'>🚫 طرد وحظر من الغرفة</button></div>";
    }

    openSheet(
      "<div style='display:flex;align-items:center;gap:12px'>" + avatarHTML(u, "lg") +
        "<div class='info'><div class='name'>" + esc(u.name) + " <span class='tag verified'>ID: " + esc(displayUserId(u)) + "</span></div>" +
        "<div class='meta'>" + esc(rel.label) + " • " + esc(u.bio || "") + "</div></div></div>" +
      "<div style='display:flex;gap:6px;flex-wrap:wrap;margin-top:12px'>" +
        buildDynamicRelationButtons(targetId, { showDm: true, showRemoveFriend: true }) +
        (curRoom && inRoom(curRoom, targetId) ? "<button class='btn sm gold' id='up-send-gift' type='button'>🎁 إرسال هدية</button>" : "") +
      "</div>" +
      modHtml +
      "<div style='display:flex;gap:8px;margin-top:12px'>" +
        "<button class='btn sm ghost' style='flex:1' id='up-report' type='button'>🚩 إبلاغ</button>" +
        (hasBlockedUser(targetId)
          ? "<button class='btn sm ok' style='flex:1' id='up-unblock' type='button'>🔓 إلغاء الحظر</button>"
          : "<button class='btn sm red' style='flex:1' id='up-block' type='button'>🚫 حظر</button>") +
      "</div>"
    );

    if ($("up-send-gift")) $("up-send-gift").onclick = function () { UI.giftTarget = targetId; openGiftSheet("lucky"); };
    if ($("up-report")) $("up-report").onclick = function () { submitUserReport(targetId, "إبلاغ من البروفايل"); closeSheet(); };
    if ($("up-block")) $("up-block").onclick = function () { confirmBlockUserSheet(targetId); };
    if ($("up-unblock")) $("up-unblock").onclick = function () { confirmUnblockUserSheet(targetId); };
    if ($("mod-mute-seat") && curRoom) $("mod-mute-seat").onclick = function () {
      curRoom.seats[seatIdxCtx].muted = !curRoom.seats[seatIdxCtx].muted;
      if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + curRoom.id + "/seats/" + seatIdxCtx + "/muted").set(curRoom.seats[seatIdxCtx].muted);
      closeSheet(); renderRoom();
    };
    if ($("mod-kick-seat") && curRoom) $("mod-kick-seat").onclick = function () {
      curRoom.seats[seatIdxCtx].uid = null;
      curRoom.seats[seatIdxCtx].muted = false;
      if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + curRoom.id + "/seats/" + seatIdxCtx).update({ uid: null, muted: false });
      closeSheet(); renderRoom();
    };
    if ($("mod-ban-room") && curRoom) $("mod-ban-room").onclick = function () {
      if (curRoom.bans.indexOf(targetId) < 0) curRoom.bans.push(targetId);
      var sIdx = seatIndexOf(curRoom, targetId);
      if (sIdx >= 0) curRoom.seats[sIdx].uid = null;
      curRoom.listeners = (curRoom.listeners || []).filter(function (x) { return x !== targetId; });
      if (cloud.on && cloud.db && !UI.isGuest) {
        var ups = {};
        ups["rooms/" + curRoom.id + "/bans/" + targetId] = true;
        ups["rooms/" + curRoom.id + "/listeners/" + targetId] = null;
        if (sIdx >= 0) ups["rooms/" + curRoom.id + "/seats/" + sIdx + "/uid"] = null;
        cloud.db.ref().update(ups);
      }
      closeSheet(); renderRoom(); toast("تم حظر المستخدم من الغرفة");
    };
  }

  /* ================= نظام الهدايا العادية + «هدايا الحظ» المتكامل ================= */
  var LUCKY_UI = {
    tab: "lucky",
    selectedId: "lucky_star",
    inFlight: false,
    quoteVersion: "v1_default"
  };

  function makeIdempotencyKey(roomId, recipientId, giftId) {
    var rnd = (global.crypto && global.crypto.randomUUID)
      ? global.crypto.randomUUID()
      : (Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 12));
    return "lk_" + S.me.id + "_" + roomId + "_" + recipientId + "_" + giftId + "_" + rnd;
  }

  function openGiftSheet(initialTab) {
    var room = getRoom(UI.roomId);
    if (!room) return;
    if (initialTab) LUCKY_UI.tab = initialTab;

    var participants = getRoomParticipantIds(room).filter(function (id) { return id !== S.me.id && !isBlockedEitherWay(id); });
    if (!participants.length) {
      openSheet("<h3>🎁 صندوق الهدايا</h3><div class='empty'>لا يوجد أعضاء آخرون داخل الغرفة حالياً للإرسال إليهم.</div>");
      return;
    }
    if (!UI.giftTarget || participants.indexOf(UI.giftTarget) < 0) UI.giftTarget = participants[0];

    var targetsHtml = participants.map(function (id) {
      var u = resolveLiveUser(id);
      var sel = UI.giftTarget === id ? " sel" : "";
      return '<button type="button" class="gt-photo' + sel + '" data-gtarget="' + esc(id) + '">' + avatarHTML(u, "sm") + '<span>' + esc(u.name) + '</span></button>';
    }).join("");

    var luckyList = (Array.isArray(S.luckyCatalog) && S.luckyCatalog.length) ? S.luckyCatalog : DEFAULT_LUCKY_CATALOG;
    if (!luckyList.some(function (g) { return g.id === LUCKY_UI.selectedId; })) LUCKY_UI.selectedId = luckyList[0].id;
    var selLucky = luckyList.find(function (g) { return g.id === LUCKY_UI.selectedId; }) || luckyList[0];

    var luckyEnabled = !!(S.appSettings && S.appSettings.luckyGiftsEnabled);
    var totalSpendable = getTotalSpendableCoins();

    var bodyHtml = "";
    if (LUCKY_UI.tab === "lucky") {
      var cardsHtml = luckyList.map(function (g) {
        var isSel = g.id === selLucky.id ? " sel" : "";
        var svg = LUCKY_GIFT_ASSETS[g.id] || "🎲";
        return '<button type="button" class="gift' + isSel + '" data-lucky-id="' + esc(g.id) + '">' +
          '<div class="e">' + svg + '</div>' +
          '<small>' + esc(g.nameAr) + '</small>' +
          '<span class="p">🪙 ' + Number(g.price).toLocaleString("en-US") + '</span>' +
        '</button>';
      }).join("");

      bodyHtml =
        (!luckyEnabled ? "<div class='confirm-box'>⚠️ ميزة «هدايا الحظ» معطلة حالياً من إعدادات الإدارة. يمكنك تفعيلها من لوحة الإدارة.</div>" : "") +
        "<div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:8px'>" +
          "<span style='font-size:12px;color:var(--muted)'>المستلم يحصل على <b>10% ثابتة</b> (" + Number(selLucky.recipientReward).toLocaleString("en-US") + " عملة)</span>" +
          "<button class='btn sm ghost' id='lucky-odds-info-btn' type='button'>ℹ️ الاحتمالات والشروط</button>" +
        "</div>" +
        "<div class='giftgrid'>" + cardsHtml + "</div>" +
        "<div class='lucky-odds-box'>" +
          "<div><b>تأكيد الإرسال:</b> هدية <b>" + esc(selLucky.nameAr) + "</b> بتكلفة <b>" + Number(selLucky.price).toLocaleString("en-US") + "</b> عملة إلى <b>" + esc(resolveLiveUser(UI.giftTarget).name) + "</b>.</div>" +
          "<div class='meta' style='margin-top:4px'>• مصدر الخصم: الرصيد الأساسي ومكافآت المرسل (المتاح: " + totalSpendable.toLocaleString("en-US") + " عملة).</div>" +
          "<div class='meta'>• نتيجة السحب عشوائية من الخادم وغير مضمونة (0× تعني عدم إضافة مكافأة للمرسل، و1× تعيد قيمة الهدية فقط دون ربح صافٍ).</div>" +
        "</div>" +
        "<button class='btn gold block' id='send-lucky-confirm-btn' type='button'" + (!luckyEnabled || LUCKY_UI.inFlight ? " disabled" : "") + ">" +
          (LUCKY_UI.inFlight ? "⏳ جاري تنفيذ السحب..." : ("🎲 تأكيد إرسال " + esc(selLucky.nameAr) + " (" + Number(selLucky.price).toLocaleString("en-US") + " 🪙)")) +
        "</button>";
    } else {
      var stdList = getActiveGifts();
      if (!stdList.some(function (g) { return g.id === UI.giftSel; })) UI.giftSel = stdList[0].id;
      var selStd = stdList.find(function (g) { return g.id === UI.giftSel; }) || stdList[0];
      var stdCards = stdList.map(function (g) {
        var isSel = g.id === selStd.id ? " sel" : "";
        return '<button type="button" class="gift' + isSel + '" data-std-id="' + esc(g.id) + '">' +
          '<div class="e">' + esc(g.e) + '</div>' +
          '<small>' + esc(g.n) + '</small>' +
          '<span class="p">🪙 ' + Number(g.p).toLocaleString("en-US") + '</span>' +
        '</button>';
      }).join("");

      bodyHtml =
        "<div class='giftgrid'>" + stdCards + "</div>" +
        "<button class='btn block' id='send-std-gift-btn' type='button'>🎁 إرسال " + esc(selStd.n) + " (" + Number(selStd.p).toLocaleString("en-US") + " 🪙)</button>";
    }

    openSheet(
      "<div style='display:flex;align-items:center;justify-content:space-between'>" +
        "<h3 style='margin:0'>🎁 صندوق الهدايا</h3>" +
        "<span class='tag vip'>رصيدك: " + totalSpendable.toLocaleString("en-US") + " 🪙</span>" +
      "</div>" +
      "<div class='gift-tabs-bar'>" +
        "<button type='button' class='gift-tab-btn" + (LUCKY_UI.tab === "lucky" ? " active" : "") + "' id='gtab-lucky'>🎲 هدايا الحظ</button>" +
        "<button type='button' class='gift-tab-btn" + (LUCKY_UI.tab === "standard" ? " active" : "") + "' id='gtab-standard'>🎁 الهدايا العادية</button>" +
      "</div>" +
      "<div style='font-size:11.5px;color:var(--muted);margin-bottom:4px'>اختر المستلم (مستلم واحد فقط):</div>" +
      "<div class='gift-targets-bar'>" + targetsHtml + "</div>" +
      bodyHtml
    );

    $("gtab-lucky").onclick = function () { openGiftSheet("lucky"); };
    $("gtab-standard").onclick = function () { openGiftSheet("standard"); };

    document.querySelectorAll("[data-gtarget]").forEach(function (btn) {
      btn.onclick = function () { UI.giftTarget = btn.getAttribute("data-gtarget"); openGiftSheet(LUCKY_UI.tab); };
    });
    document.querySelectorAll("[data-lucky-id]").forEach(function (btn) {
      btn.onclick = function () { LUCKY_UI.selectedId = btn.getAttribute("data-lucky-id"); openGiftSheet("lucky"); };
    });
    document.querySelectorAll("[data-std-id]").forEach(function (btn) {
      btn.onclick = function () { UI.giftSel = btn.getAttribute("data-std-id"); openGiftSheet("standard"); };
    });

    if ($("lucky-odds-info-btn")) {
      $("lucky-odds-info-btn").onclick = function () {
        var oddsRows = DEFAULT_LUCKY_ODDS.map(function (o) {
          var rewardVal = Math.floor((selLucky.price * o.multiplierBps) / 10000);
          return "<span>" + o.label + " (" + o.pct + ") = " + rewardVal.toLocaleString("en-US") + " عملة</span>";
        }).join("");
        openSheet(
          "<h3>ℹ️ جدول احتمالات «هدايا الحظ»</h3>" +
          "<div class='notice'>• جميع هدايا الحظ تستخدم جدول الاحتمالات نفسه؛ ارتفاع السعر لا يزيد احتمال الفوز.<br>" +
          "• يحصل المستلم على <b>10% ثابتة</b> من سعر الهدية في جميع العمليات المكتملة كرصيد مكافآت.<br>" +
          "• المضاعف يمثل إجمالي المكافأة المضافة للمرسل وليس صافي الربح (مثلاً 1× تعيد قيمة الهدية فقط).<br>" +
          "• حد الإنفاق اليومي: 20,000 عملة بتوقيت UTC.</div>" +
          "<div class='lucky-odds-box'><b>المكافآت لهدية " + esc(selLucky.nameAr) + " (" + selLucky.price + " 🪙):</b><div class='lucky-odds-grid'>" + oddsRows + "</div></div>" +
          "<button class='btn block' id='back-to-lucky-btn' type='button'>العودة للإرسال</button>"
        );
        $("back-to-lucky-btn").onclick = function () { openGiftSheet("lucky"); };
      };
    }

    if ($("send-lucky-confirm-btn")) {
      $("send-lucky-confirm-btn").onclick = function () { sendLuckyGiftAtomic(selLucky); };
    }
    if ($("send-std-gift-btn")) {
      $("send-std-gift-btn").onclick = function () { sendStandardGift(UI.giftSel); };
    }
  }

  async function sendLuckyGiftAtomic(giftObj) {
    if (LUCKY_UI.inFlight) return;
    var room = getRoom(UI.roomId);
    if (!room) { toast("يجب التواجد داخل غرفة لإرسال الهدية"); return; }
    var recipientId = UI.giftTarget;
    if (!recipientId || recipientId === S.me.id) { toast("لا يمكنك الإرسال لنفسك"); return; }
    if (!inRoom(room, recipientId)) { toast("المستلم غادر الغرفة"); return; }

    var token = await getIdTokenOrNull();
    if (!token) { toast("يرجى تسجيل الدخول بحساب Google أولاً"); return; }

    LUCKY_UI.inFlight = true;
    var btn = $("send-lucky-confirm-btn");
    if (btn) { btn.disabled = true; btn.textContent = "⏳ جاري تنفيذ المعاملة الذرية..."; }

    var idemKey = makeIdempotencyKey(room.id, recipientId, giftObj.id);
    var payload = {
      giftId: giftObj.id,
      roomId: room.id,
      recipientId: recipientId,
      quoteVersion: LUCKY_UI.quoteVersion,
      idempotencyKey: idemKey
    };

    try {
      var res = await fetch(FUNCTIONS_BASE + "/sendLuckyGift", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "X-Idempotency-Key": idemKey
        },
        body: JSON.stringify(payload)
      });
      var data = await res.json();
      if (!res.ok || !data || !data.ok) {
        toast(mapLuckyErrorArabic(data && (data.code || data.error)));
        return;
      }

      var tx = data.transaction;
      var netDelta = Number(tx.senderReward || 0) - Number(tx.price || 0);
      var multLabel = tx.multiplierLabel || "0×";
      var outcomeDesc = Number(tx.multiplierBps || 0) === 0
        ? "لم تحصل على مكافأة إضافية في هذه المحاولة (0×)."
        : (Number(tx.multiplierBps || 0) < 10000
            ? "استرداد جزئي (" + multLabel + ") — صافي التغير: " + netDelta + " عملة."
            : (Number(tx.multiplierBps || 0) === 10000
                ? "استرداد كامل قيمة الهدية (1×) — صافي التغير: 0 عملة."
                : "مكافأة مضاعفة (" + multLabel + ") — صافي الزيادة: +" + netDelta + " عملة!"));

      var vis = LUCKY_GIFT_ASSETS[giftObj.id] || "🎲";
      showFlyGiftToSeat(vis, S.me.name || "أنت", recipientId, resolveLiveUser(recipientId).name);

      openSheet(
        "<h3>🎲 نتيجة إرسال هدية الحظ</h3>" +
        "<div class='glass' style='padding:14px;text-align:center;margin:10px 0'>" +
          "<div style='margin-bottom:6px'>" + vis + "</div>" +
          "<div style='font-size:18px;font-weight:900;color:var(--gold)'>المضاعف: " + esc(multLabel) + "</div>" +
          "<div class='meta' style='margin-top:4px'>" + esc(outcomeDesc) + "</div>" +
        "</div>" +
        "<div class='stats-grid'>" +
          "<div class='stat-box'><b>-" + Number(tx.price).toLocaleString("en-US") + "</b><span>التكلفة</span></div>" +
          "<div class='stat-box'><b>+" + Number(tx.senderReward).toLocaleString("en-US") + "</b><span>مكافأتك</span></div>" +
          "<div class='stat-box'><b>" + (netDelta >= 0 ? "+" : "") + netDelta.toLocaleString("en-US") + "</b><span>صافي التغير</span></div>" +
        "</div>" +
        "<div class='meta' style='margin-top:8px'>استحقاق المستلم الثابت (10%): +" + Number(tx.recipientReward).toLocaleString("en-US") + " عملة مكافآت</div>" +
        "<button class='btn block' id='lucky-res-close' type='button'>تم</button>"
      );
      $("lucky-res-close").onclick = closeSheet;
    } catch (err) {
      toast("انقطع الاتصال أثناء الإرسال — تحقق من سجل هدايا الحظ قبل إعادة المحاولة.");
    } finally {
      LUCKY_UI.inFlight = false;
      if ($("send-lucky-confirm-btn")) {
        $("send-lucky-confirm-btn").disabled = false;
      }
    }
  }

  async function sendStandardGift(giftId) {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var stdList = getActiveGifts();
    var g = stdList.find(function (x) { return x.id === giftId; });
    if (!g) return;
    var targetId = UI.giftTarget;
    if (!targetId || targetId === S.me.id) { toast("اختر مستلماً آخر"); return; }

    var res = await callEconomyApi("sendGift", {
      roomId: room.id,
      toUid: targetId,
      giftId: g.id,
      giftName: g.n,
      emoji: g.e,
      price: Number(g.p || 0)
    });
    if (!res.ok) {
      toast(res.error || "تعذر إرسال الهدية");
      return;
    }
    var targetU = resolveLiveUser(targetId);
    showFlyGiftToSeat(esc(g.e), S.me.name || "مستخدم", targetId, targetU.name);
    pushRoomMsg(room, {
      sys: true,
      gift: { eventId: uid(), fromUid: S.me.id, fromName: S.me.name, toUid: targetId, toName: targetU.name, emoji: g.e },
      text: "🎁 أرسل " + S.me.name + " " + g.e + " (" + g.n + ") إلى " + targetU.name
    });
    closeSheet();
    toast("تم إرسال الهدية بنجاح 🎁");
  }

  function openLuckyHistorySheet(pageNum) {
    var page = Math.max(1, Number(pageNum || 1));
    var pageSize = 10;
    openSheet(
      "<h3>🎲 سجل هدايا الحظ واستحقاقات المستلم</h3>" +
      "<div class='stats-grid' style='margin-bottom:10px'>" +
        "<div class='stat-box'><b>" + Number(S.me.coins || 0).toLocaleString("en-US") + "</b><span>الرصيد الأساسي</span></div>" +
        "<div class='stat-box'><b>" + Number(S.me.senderBonusBalance || 0).toLocaleString("en-US") + "</b><span>مكافآت المرسل</span></div>" +
        "<div class='stat-box'><b>" + Number(S.me.recipientRewardBalance || 0).toLocaleString("en-US") + "</b><span>استحقاقات المستلم</span></div>" +
      "</div>" +
      "<div id='lucky-hist-body'><div class='empty'>جاري تحميل السجل...</div></div>"
    );

    if (!cloud.on || !cloud.db || UI.isGuest) {
      $("lucky-hist-body").innerHTML = "<div class='empty'>سجل هدايا الحظ متاح للحسابات المسجلة فقط.</div>";
      return;
    }

    cloud.db.ref("luckyGifts/userHistory/" + S.me.id).limitToLast(100).once("value").then(function (snap) {
      var raw = snap.val() || {};
      var all = Object.keys(raw).map(function (k) { return raw[k]; }).filter(Boolean)
        .sort(function (a, b) { return Number(b.createdAt || 0) - Number(a.createdAt || 0); });
      var body = $("lucky-hist-body");
      if (!body) return;
      if (!all.length) {
        body.innerHTML = "<div class='empty'>لا توجد عمليات هدايا حظ مسجلة بعد.</div>";
        return;
      }
      var totalPages = Math.max(1, Math.ceil(all.length / pageSize));
      if (page > totalPages) page = totalPages;
      var slice = all.slice((page - 1) * pageSize, page * pageSize);

      var rowsHtml = slice.map(function (item) {
        var isSender = item.role === "sender" || item.senderId === S.me.id;
        var net = isSender ? (Number(item.senderReward || 0) - Number(item.price || 0)) : Number(item.recipientReward || 0);
        return "<div class='row glass' style='margin-bottom:7px'>" +
          "<div class='info'>" +
            "<div class='name'>" + esc(item.giftName || item.giftId) + " <span class='tag " + (isSender ? "vip" : "ok") + "'>" + (isSender ? ("إرسال • " + esc(item.multiplierLabel || "0×")) : "استلام +10%") + "</span></div>" +
            "<div class='meta'>" + dateTimeStr(item.createdAt) + " • الغرفة: " + esc(item.roomName || item.roomId || "—") + "</div>" +
            "<div class='meta'>التكلفة: " + Number(item.price || 0) + " • مكافأة المرسل: " + Number(item.senderReward || 0) + " • الحالة: مكتملة</div>" +
          "</div>" +
          "<b style='color:" + (net >= 0 ? "#22c55e" : "#f87171") + "'>" + (net >= 0 ? "+" : "") + net + " 🪙</b>" +
        "</div>";
      }).join("");

      body.innerHTML = rowsHtml +
        "<div style='display:flex;align-items:center;justify-content:space-between;margin-top:10px'>" +
          "<button class='btn sm ghost' id='lk-pg-prev' type='button'" + (page <= 1 ? " disabled" : "") + ">السابق</button>" +
          "<span class='meta'>صفحة " + page + " من " + totalPages + "</span>" +
          "<button class='btn sm ghost' id='lk-pg-next' type='button'" + (page >= totalPages ? " disabled" : "") + ">التالي</button>" +
        "</div>";

      if ($("lk-pg-prev")) $("lk-pg-prev").onclick = function () { openLuckyHistorySheet(page - 1); };
      if ($("lk-pg-next")) $("lk-pg-next").onclick = function () { openLuckyHistorySheet(page + 1); };
    }).catch(function () {
      if ($("lucky-hist-body")) $("lucky-hist-body").innerHTML = "<div class='empty'>تعذر تحميل السجل حالياً.</div>";
    });
  }

  /* ========= الموسيقى والإيموجي والملصقات ========= */
  function openMusicSheet() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var tracks = Array.isArray(room.playlist) && room.playlist.length ? room.playlist : DEFAULT_TRACKS;
    var canCtrl = canControlRoomMusic(room);
    var rows = tracks.map(function (t, i) {
      return '<div class="row glass"><div class="info"><div class="name">' + esc((t.cover || "🎵") + " " + t.title) + '</div><div class="meta">' + esc(t.artist || "") + '</div></div>' +
        (canCtrl ? '<button class="btn sm" data-play-track="' + i + '" type="button">تشغيل</button>' : '') + '</div>';
    }).join("");
    openSheet("<h3>🎵 موسيقى الغرفة</h3><div class='list'>" + rows + "</div>" +
      (canCtrl ? "<button class='btn red block' id='stop-room-music' type='button'>⏹️ إيقاف الموسيقى</button>" : "<div class='meta' style='margin-top:8px'>التحكم بالموسيقى متاح للمالك والمشرفين.</div>"));
    document.querySelectorAll("[data-play-track]").forEach(function (b) {
      b.onclick = function () {
        var tr = tracks[Number(b.getAttribute("data-play-track"))];
        if (tr) setRoomMusicRemote(room.id, { url: tr.url, title: tr.title, artist: tr.artist || "", playing: true, positionSec: 0, updatedAt: now() });
        closeSheet();
      };
    });
    if ($("stop-room-music")) $("stop-room-music").onclick = function () {
      setRoomMusicRemote(room.id, { url: "", title: "", artist: "", playing: false, positionSec: 0, updatedAt: now() });
      closeSheet();
    };
  }

  function openEmojiPicker(onPick) {
    openSheet("<h3>😀 اختر إيموجي</h3><div class='emojigrid'>" +
      EMOJIS.map(function (e) { return '<button type="button" data-pick-emoji="' + esc(e) + '">' + esc(e) + "</button>"; }).join("") +
      "</div>");
    document.querySelectorAll("[data-pick-emoji]").forEach(function (b) {
      b.onclick = function () { var val = b.getAttribute("data-pick-emoji"); closeSheet(); onPick(val); };
    });
  }

  function openStickerPicker() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    openSheet("<h3>🎭 الملصقات</h3><div class='emojigrid'>" +
      STICKERS.map(function (s) { return '<button type="button" data-pick-stk="' + esc(s.e) + '">' + esc(s.e) + "</button>"; }).join("") +
      "</div>");
    document.querySelectorAll("[data-pick-stk]").forEach(function (b) {
      b.onclick = function () {
        var e = b.getAttribute("data-pick-stk");
        closeSheet();
        pushRoomMsg(room, { uid: S.me.id, name: S.me.name || "مستخدم", text: e });
      };
    });
  }

  /* ========= الدردشة الخاصة ========= */
  function markThreadMessagesRead(peerId) {
    if (!peerId) return;
    S.unread[peerId] = 0;
  }

  function openDM(peerId) {
    if (!peerId || isBlockedEitherWay(peerId)) return;
    if (!isFriendWith(peerId)) { toast("الدردشة الخاصة متاحة للأصدقاء فقط"); return; }
    closeSheet();
    UI.dmId = peerId;
    markThreadMessagesRead(peerId);
    attachDmThreadListener(S.me.id, peerId);
    $("chat-view").classList.add("open");
    updateOverlayLock();
    renderDM();
    renderTop();
  }

  function closeDM() {
    UI.dmId = null;
    if ($("chat-view")) $("chat-view").classList.remove("open");
    updateOverlayLock();
  }

  function renderDM() {
    var peerId = UI.dmId;
    if (!peerId) return;
    var u = resolveLiveUser(peerId);
    setAvatarEl($("chat-avatar"), u);
    $("chat-title").textContent = u.name || "صديق";
    $("chat-sub").textContent = u.online ? "متصل الآن" : "غير متصل";
    var msgs = S.dms[peerId] || [];
    var box = $("chat-msgs");
    box.innerHTML = msgs.length ? msgs.map(function (m) {
      var isMe = m.from === S.me.id;
      var content = m.img ? '<img src="' + esc(m.img) + '" style="max-width:200px;border-radius:10px;display:block" alt="" />' : esc(m.text || "");
      var inv = m.inviteRoomId ? '<br><button class="invite-join-chip" data-enter="' + esc(m.inviteRoomId) + '" type="button">دخول الغرفة 🎙️</button>' : "";
      return '<div class="msg ' + (isMe ? "me" : "") + '"><div>' + content + inv + '</div><div class="tm">' + timeStr(m.t) + "</div></div>";
    }).join("") : '<div class="empty">ابدأ المحادثة مع ' + esc(u.name) + ' 👋</div>';
    box.scrollTop = box.scrollHeight;
  }

  function sendDmMessage(payload) {
    var peerId = UI.dmId;
    if (!peerId || isBlockedEitherWay(peerId) || !isFriendWith(peerId)) return;
    var msg = Object.assign({ from: S.me.id, to: peerId, t: now(), read: false }, payload);
    if (!Array.isArray(S.dms[peerId])) S.dms[peerId] = [];
    S.dms[peerId].push(msg);
    if (cloud.on && cloud.db && !UI.isGuest) {
      cloud.db.ref("dms/" + dmThreadId(S.me.id, peerId)).push(msg).catch(function () { /* */ });
      cloud.db.ref("userDms/" + S.me.id + "/" + peerId).set(true).catch(function () { /* */ });
      cloud.db.ref("userDms/" + peerId + "/" + S.me.id).set(true).catch(function () { /* */ });
    }
    saveLocal();
    renderDM();
    renderMessages();
  }

  function openNotificationsSheet() {
    (S.notifs || []).forEach(function (n) { n.read = true; });
    renderTop();
    saveLocal();
    var list = S.notifs || [];
    openSheet("<h3>🔔 الإشعارات</h3><div class='list'>" +
      (list.length ? list.map(function (n) {
        return '<div class="row glass"><div class="info"><div class="name">' + esc(n.text) + '</div><div class="meta">' + dateTimeStr(n.t) + '</div></div></div>';
      }).join("") : "<div class='empty'>لا توجد إشعارات حالياً</div>") + "</div>");
  }

  /* ========= ربط الأحداث ========= */
  function bindEvents() {
    document.querySelectorAll(".navbtn").forEach(function (b) {
      b.onclick = function () { go(b.getAttribute("data-page")); };
    });

    if ($("avatar-top")) $("avatar-top").onclick = function () { go("profile"); };
    if ($("theme-toggle-btn")) $("theme-toggle-btn").onclick = function () {
      S.settings.lightTheme = !S.settings.lightTheme;
      applyThemeMode(); saveLocal(); renderTop();
    };
    if ($("notif-btn")) $("notif-btn").onclick = openNotificationsSheet;

    if ($("search-input")) {
      $("search-input").oninput = function () { UI.query = this.value; renderHome(); };
    }
    if ($("search-clear-btn")) {
      $("search-clear-btn").onclick = function () { UI.query = ""; $("search-input").value = ""; renderHome(); };
    }
    if ($("search-go-btn")) {
      $("search-go-btn").onclick = function () { UI.query = $("search-input").value; renderHome(); };
    }

    document.querySelectorAll("#home-tabs .tab").forEach(function (t) {
      t.onclick = function () { UI.filter = t.getAttribute("data-filter"); renderHome(); };
    });
    document.querySelectorAll("#rooms-tabs .tab").forEach(function (t) {
      t.onclick = function () { UI.rfilter = t.getAttribute("data-rfilter"); renderRooms(); };
    });
    document.querySelectorAll("#friends-tabs .tab").forEach(function (t) {
      t.onclick = function () { UI.ftab = t.getAttribute("data-ftab"); renderFriends(); };
    });
    document.querySelectorAll("#profile-subtabs .tab").forEach(function (t) {
      t.onclick = function () { UI.pftab = t.getAttribute("data-pftab"); renderProfile(); };
    });

    if ($("find-input")) $("find-input").oninput = function () { UI.findQ = this.value; renderFriends(); };
    if ($("pf-social-search")) $("pf-social-search").oninput = function () { UI.pfSocialQ = this.value; renderProfileSocialTab(); };

    if ($("gift-cup-banner")) $("gift-cup-banner").onclick = openGiftCupSheet;
    if ($("gift-cup-back")) $("gift-cup-back").onclick = closeGiftCupPage;
    if ($("refresh-rooms")) $("refresh-rooms").onclick = function () { renderHome(); toast("تم تحديث الغرف 🔄"); };
    if ($("fab-create")) $("fab-create").onclick = openCreateRoom;

    if ($("pf-vip-btn")) $("pf-vip-btn").onclick = openVipSheet;
    if ($("pf-admin-btn")) $("pf-admin-btn").onclick = openAdminPanelSheet;
    if ($("pf-settings-btn")) $("pf-settings-btn").onclick = openProfileSettingsSheet;
    if ($("pf-wallet-open")) $("pf-wallet-open").onclick = openWalletSheet;
    if ($("pf-lucky-log-open")) $("pf-lucky-log-open").onclick = function () { openLuckyHistorySheet(1); };
    if ($("pf-lucky-history-btn")) $("pf-lucky-history-btn").onclick = function () { openLuckyHistorySheet(1); };
    if ($("pf-stat-followers-btn")) $("pf-stat-followers-btn").onclick = function () { openSocialListSheet("followers"); };
    if ($("pf-stat-following-btn")) $("pf-stat-following-btn").onclick = function () { openSocialListSheet("following"); };
    if ($("pf-stat-friends-btn")) $("pf-stat-friends-btn").onclick = function () { openSocialListSheet("friends"); };
    if ($("pf-blocked-btn")) $("pf-blocked-btn").onclick = function () { openSocialListSheet("blocked"); };
    if ($("pf-copy-id")) $("pf-copy-id").onclick = function () {
      var idVal = displayUserId(S.me);
      if (navigator.clipboard) navigator.clipboard.writeText(idVal).catch(function () { /* */ });
      toast("تم نسخ ID: " + idVal + " 📋");
    };

    /* أحداث الغرفة */
    if ($("room-back")) $("room-back").onclick = minimizeRoom;
    if ($("room-leave-top")) $("room-leave-top").onclick = function () { leaveRoom(true); };
    if ($("room-menu")) $("room-menu").onclick = openRoomMenuSheet;
    if ($("room-wallet-open")) $("room-wallet-open").onclick = openWalletSheet;
    if ($("room-speaker-btn")) $("room-speaker-btn").onclick = function () { UI.roomSpeakerMuted = !UI.roomSpeakerMuted; applyRoomSpeakerMuteState(); };
    if ($("room-presence-btn")) $("room-presence-btn").onclick = openRoomPresenceSheet;
    if ($("room-friends-btn")) $("room-friends-btn").onclick = openRoomFriendsInviteSheet;
    if ($("room-photo-btn")) $("room-photo-btn").onclick = function () { $("room-photo-input").click(); };
    if ($("room-photo-input")) $("room-photo-input").onchange = async function () {
      var room = getRoom(UI.roomId);
      if (!room || !isRoomModOrOwner(room, S.me.id)) return;
      var f = this.files && this.files[0]; if (!f) return;
      try {
        var url = await readImageFileAsDataUrl(f, 480, 0.62);
        room.roomPhoto = url;
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + room.id + "/roomPhoto").set(url);
        renderRoom(); renderHome(); renderRooms(); toast("تم تحديث صورة الغرفة ✅");
      } catch (e) { toast(e.message); }
    };
    if ($("audio-unlock-btn")) $("audio-unlock-btn").onclick = resumeAllRemoteAudioTracks;
    if ($("mmini-open")) $("mmini-open").onclick = openMusicSheet;
    if ($("mmini-toggle")) $("mmini-toggle").onclick = function () {
      var r = getRoom(UI.roomId || UI.floatingRoomId);
      if (!r || !r.music) return;
      setRoomMusicRemote(r.id, Object.assign({}, r.music, { playing: !r.music.playing, updatedAt: now() }));
    };
    if ($("mmini-skip")) $("mmini-skip").onclick = openMusicSheet;

    if ($("room-emoji")) $("room-emoji").onclick = function () {
      openEmojiPicker(function (e) { $("room-input").value += e; $("room-input").focus(); });
    };
    if ($("room-sticker")) $("room-sticker").onclick = openStickerPicker;
    if ($("room-music")) $("room-music").onclick = openMusicSheet;
    if ($("room-lucky-quick")) $("room-lucky-quick").onclick = function () { openGiftSheet("lucky"); };
    if ($("room-gift")) $("room-gift").onclick = function () { openGiftSheet("lucky"); };
    if ($("mic-btn")) $("mic-btn").onclick = toggleRoomMic;

    if ($("room-chat-img")) $("room-chat-img").onchange = async function () {
      var room = getRoom(UI.roomId);
      if (!room) return;
      var f = this.files && this.files[0]; if (!f) return;
      try {
        var url = await readImageFileAsDataUrl(f, 360, 0.6);
        pushRoomMsg(room, { uid: S.me.id, name: S.me.name || "مستخدم", img: url });
      } catch (e) { toast(e.message); }
      this.value = "";
    };

    function submitRoomChat() {
      var room = getRoom(UI.roomId);
      if (!room) return;
      var inp = $("room-input");
      var txt = clean((inp && inp.value) || "").trim();
      if (!txt) return;
      inp.value = "";
      pushRoomMsg(room, { uid: S.me.id, name: S.me.name || "مستخدم", text: txt });
    }
    if ($("room-send")) $("room-send").onclick = submitRoomChat;
    if ($("room-input")) $("room-input").onkeydown = function (e) { if (e.key === "Enter") submitRoomChat(); };

    /* Floating orb */
    if ($("floating-orb-avatar")) $("floating-orb-avatar").onclick = function () { if (UI.floatingRoomId) enterRoom(UI.floatingRoomId, true); };
    if ($("floating-orb-label")) $("floating-orb-label").onclick = function () { if (UI.floatingRoomId) enterRoom(UI.floatingRoomId, true); };
    if ($("floating-orb-leave")) $("floating-orb-leave").onclick = function (e) { e.stopPropagation(); leaveRoom(true); };

    /* DM */
    if ($("chat-back")) $("chat-back").onclick = closeDM;
    if ($("chat-send")) $("chat-send").onclick = function () {
      var inp = $("chat-input");
      var txt = clean((inp && inp.value) || "").trim();
      if (!txt) return;
      inp.value = "";
      sendDmMessage({ text: txt });
    };
    if ($("chat-input")) $("chat-input").onkeydown = function (e) {
      if (e.key === "Enter") $("chat-send").click();
    };
    if ($("chat-emoji")) $("chat-emoji").onclick = function () {
      openEmojiPicker(function (e) { $("chat-input").value += e; $("chat-input").focus(); });
    };
    if ($("chat-photo")) $("chat-photo").onclick = function () { $("chat-img-input").click(); };
    if ($("chat-img-input")) $("chat-img-input").onchange = async function () {
      var f = this.files && this.files[0]; if (!f) return;
      try {
        var url = await readImageFileAsDataUrl(f, 360, 0.6);
        sendDmMessage({ img: url });
      } catch (e) { toast(e.message); }
      this.value = "";
    };

    /* Scrim & Auth */
    if ($("scrim")) $("scrim").onclick = closeSheet;
    if ($("google-login-btn")) $("google-login-btn").onclick = signInWithGoogleApp;
    if ($("guest-login-btn")) $("guest-login-btn").onclick = startWithoutGoogle;
    if ($("ob-submit-btn")) $("ob-submit-btn").onclick = completeOnboarding;
    if ($("ob-back-login-btn")) $("ob-back-login-btn").onclick = function () { showAuthGate(true, "login"); };
    if ($("ob-name")) $("ob-name").oninput = renderOnboardPreview;
    if ($("ob-photo-input")) $("ob-photo-input").onchange = async function () {
      var f = this.files && this.files[0]; if (!f) return;
      try { UI.onboardPhoto = await readImageFileAsDataUrl(f, 180, 0.55); renderOnboardPreview(); }
      catch (e) { toast(e.message); }
    };
    document.querySelectorAll(".gender-pill").forEach(function (p) {
      p.onclick = function () {
        UI.onboardGender = p.getAttribute("data-gender");
        document.querySelectorAll(".gender-pill").forEach(function (x) { x.classList.toggle("active", x === p); });
      };
    });

    /* تفويض النقرات العام */
    document.addEventListener("click", function (e) {
      var seatEl = e.target.closest("[data-seat]");
      if (seatEl) { handleSeatClick(Number(seatEl.getAttribute("data-seat"))); return; }

      var enterEl = e.target.closest("[data-enter]");
      if (enterEl) { enterRoom(enterEl.getAttribute("data-enter")); return; }

      var profEl = e.target.closest("[data-profile]");
      if (profEl) { openUserProfileSheet(profEl.getAttribute("data-profile")); return; }

      var dmEl = e.target.closest("[data-dm]");
      if (dmEl && !e.target.closest("[data-del-thread]")) { openDM(dmEl.getAttribute("data-dm")); return; }

      var delTh = e.target.closest("[data-del-thread]");
      if (delTh) { e.stopPropagation(); deleteDmThread(delTh.getAttribute("data-del-thread")); return; }

      var folEl = e.target.closest("[data-follow-user]");
      if (folEl) { toggleFollowUser(folEl.getAttribute("data-follow-user")); return; }

      var addFr = e.target.closest("[data-addfriend]");
      if (addFr) { sendFriendRequest(addFr.getAttribute("data-addfriend")); return; }

      var canFr = e.target.closest("[data-cancelfreq]");
      if (canFr) { cancelFriendRequest(canFr.getAttribute("data-cancelfreq")); return; }

      var accFr = e.target.closest("[data-accept]");
      if (accFr) { acceptFriendRequest(accFr.getAttribute("data-accept")); return; }

      var rejFr = e.target.closest("[data-reject]");
      if (rejFr) { rejectFriendRequest(rejFr.getAttribute("data-reject")); return; }

      var remFr = e.target.closest("[data-remove-friend]");
      if (remFr) { removeFriend(remFr.getAttribute("data-remove-friend")); return; }

      var unblkEl = e.target.closest("[data-unblock-user]");
      if (unblkEl) { confirmUnblockUserSheet(unblkEl.getAttribute("data-unblock-user")); return; }

      var invEl = e.target.closest("[data-invite-friend]");
      if (invEl) { inviteFriendToRoom(invEl.getAttribute("data-invite-friend")); return; }
    });
  }

  function boot() {
    resetInMemoryStateForSession("guest_session", false);
    initPwaInstall();
    bindEvents();

    var hasCloud = initCloud();
    if (hasCloud && cloud.auth) {
      cloud.auth.getRedirectResult().catch(function () { /* */ });
      cloud.auth.onAuthStateChanged(function (user) {
        if (user) {
          handleAuthenticatedUser(user);
        } else if (isGuestSession()) {
          signInAsGuest();
        } else {
          hideSplash();
          showAuthGate(true, "login");
        }
      });
    } else {
      hideSplash();
      showAuthGate(true, "login");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
