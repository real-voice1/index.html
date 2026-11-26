/* RV_BUILD 30 */
/* REAL VOICE \u2014 v26 (Firebase + Agora + Lucky Gifts Atomic Engine + Auto-Room) */
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
    badWords: ["\u0634\u062a\u064a\u0645\u0629", "\u0642\u0630\u0631", "\u062d\u0642\u064a\u0631", "\u063a\u0628\u064a", "\u0643\u0644\u0628", "\u062d\u0645\u0627\u0631"]
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
    { id: "heart", e: "\u2764\ufe0f", n: "\u0642\u0644\u0628", p: 10, vipMin: 0 },
    { id: "rose", e: "\ud83c\udf39", n: "\u0648\u0631\u062f\u0629", p: 25, vipMin: 0 },
    { id: "crown", e: "\ud83d\udc51", n: "\u062a\u0627\u062c", p: 150, vipMin: 0 },
    { id: "car", e: "\ud83c\udfce\ufe0f", n: "\u0633\u064a\u0627\u0631\u0629", p: 300, vipMin: 0 },
    { id: "rocket", e: "\ud83d\ude80", n: "\u0635\u0627\u0631\u0648\u062e", p: 500, vipMin: 1 },
    { id: "diamond", e: "\ud83d\udc8e", n: "\u0623\u0644\u0645\u0627\u0633", p: 800, vipMin: 1 },
    { id: "vip", e: "\ud83e\udd81", n: "\u0623\u0633\u062f VIP", p: 1500, vipMin: 2 },
    { id: "castle", e: "\ud83c\udff0", n: "\u0642\u0635\u0631 \u0645\u062a\u062d\u0631\u0643", p: 3000, vipMin: 3 }
  ];

  /* \u0643\u062a\u0627\u0644\u0648\u062c \u0647\u062f\u0627\u064a\u0627 \u0627\u0644\u062d\u0638 \u0627\u0644\u0640 10 \u0627\u0644\u062b\u0627\u0628\u062a\u0629 \u0628\u0627\u0644\u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0645\u0639\u062a\u0645\u062f \u0648\u0623\u0635\u0648\u0644 SVG \u0645\u062d\u0644\u064a\u0629 \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u0627\u0633\u062a\u0628\u062f\u0627\u0644 */
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
    { id: "lucky_star", nameAr: "\u0646\u062c\u0645\u0629 \u0627\u0644\u062d\u0638", price: 100, recipientReward: 10, maxSenderReward: 1000, sortOrder: 1, active: true },
    { id: "lucky_rose", nameAr: "\u0648\u0631\u062f\u0629 \u0627\u0644\u062d\u0638", price: 200, recipientReward: 20, maxSenderReward: 2000, sortOrder: 2, active: true },
    { id: "lucky_gem", nameAr: "\u062c\u0648\u0647\u0631\u0629 \u0627\u0644\u062d\u0638", price: 300, recipientReward: 30, maxSenderReward: 3000, sortOrder: 3, active: true },
    { id: "lucky_crown", nameAr: "\u062a\u0627\u062c \u0627\u0644\u062d\u0638", price: 500, recipientReward: 50, maxSenderReward: 5000, sortOrder: 4, active: true },
    { id: "lucky_chest", nameAr: "\u0635\u0646\u062f\u0648\u0642 \u0627\u0644\u062d\u0638", price: 1000, recipientReward: 100, maxSenderReward: 10000, sortOrder: 5, active: true },
    { id: "lucky_rocket", nameAr: "\u0635\u0627\u0631\u0648\u062e \u0627\u0644\u062d\u0638", price: 2000, recipientReward: 200, maxSenderReward: 20000, sortOrder: 6, active: true },
    { id: "lucky_planet", nameAr: "\u0643\u0648\u0643\u0628 \u0627\u0644\u062d\u0638", price: 3000, recipientReward: 300, maxSenderReward: 30000, sortOrder: 7, active: true },
    { id: "lucky_palace", nameAr: "\u0642\u0635\u0631 \u0627\u0644\u062d\u0638", price: 5000, recipientReward: 500, maxSenderReward: 50000, sortOrder: 8, active: true },
    { id: "lucky_galaxy", nameAr: "\u0645\u062c\u0631\u0629 \u0627\u0644\u062d\u0638", price: 7500, recipientReward: 750, maxSenderReward: 75000, sortOrder: 9, active: true },
    { id: "lucky_diamond", nameAr: "\u0623\u0644\u0645\u0627\u0633\u0629 \u0627\u0644\u062d\u0638", price: 10000, recipientReward: 1000, maxSenderReward: 100000, sortOrder: 10, active: true }
  ];

  var DEFAULT_LUCKY_ODDS = [
    { label: "0\u00d7", multiplierBps: 0, weight: 4500, pct: "45%" },
    { label: "0.5\u00d7", multiplierBps: 5000, weight: 2000, pct: "20%" },
    { label: "1\u00d7", multiplierBps: 10000, weight: 2000, pct: "20%" },
    { label: "2\u00d7", multiplierBps: 20000, weight: 1000, pct: "10%" },
    { label: "5\u00d7", multiplierBps: 50000, weight: 400, pct: "4%" },
    { label: "10\u00d7", multiplierBps: 100000, weight: 100, pct: "1%" }
  ];

  var VIP_TIERS = [
    { level: 1, name: "VIP \u0641\u0636\u064a", badge: "\ud83e\udd48 VIP 1", perks: ["\u0634\u0627\u0631\u0629 VIP 1", "\u0625\u0637\u0627\u0631 \u0645\u0645\u064a\u0632", "\u0647\u062f\u0627\u064a\u0627 VIP 1+"] },
    { level: 2, name: "VIP \u0630\u0647\u0628\u064a", badge: "\ud83e\udd47 VIP 2", perks: ["\u0634\u0627\u0631\u0629 VIP 2", "\u0644\u0648\u0646 \u0627\u0633\u0645 \u0630\u0647\u0628\u064a", "\u0647\u062f\u0627\u064a\u0627 VIP 1-2"] },
    { level: 3, name: "VIP \u0645\u0644\u0643\u064a", badge: "\ud83d\udc51 VIP 3", perks: ["\u0634\u0627\u0631\u0629 VIP 3", "\u062f\u062e\u0648\u0644 \u0645\u0644\u0643\u064a \u0645\u0645\u064a\u0632", "\u062c\u0645\u064a\u0639 \u0647\u062f\u0627\u064a\u0627 VIP"] }
  ];

  var EMOJIS = ["\ud83d\ude00", "\ud83d\ude02", "\ud83d\ude0d", "\ud83d\udd25", "\ud83d\udc4f", "\u2764\ufe0f", "\ud83d\ude0e", "\ud83c\udf89", "\ud83d\ude4f", "\ud83d\ude22", "\ud83d\udc4d", "\ud83d\udc8e"];
  var CATEGORIES = { chat: "\u062f\u0631\u062f\u0634\u0629", games: "\u0623\u0644\u0639\u0627\u0628", vip: "VIP", music: "\u0645\u0648\u0633\u064a\u0642\u0649", friends: "\u0623\u0635\u062f\u0642\u0627\u0621" };
  var COVERS = ["#7c3aed", "#2563eb", "#db2777", "#0891b2", "#ea580c", "#16a34a"];
  var COVER_ICONS = ["\ud83c\udf99\ufe0f", "\ud83c\udfae", "\ud83c\udfb5", "\ud83d\udc51", "\u2615", "\ud83c\udf19"];

  var DEFAULT_TRACKS = [
    { id: "t1", title: "Night Chill Beat", artist: "\u0645\u0648\u0633\u064a\u0642\u0649 \u0647\u0627\u062f\u0626\u0629", cover: "\ud83c\udfb5", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: "t2", title: "Acoustic Vibes", artist: "\u062c\u064a\u062a\u0627\u0631 \u0644\u064a\u0644\u064a", cover: "\ud83c\udfb8", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: "t3", title: "Midnight Lounge", artist: "\u0633\u0647\u0631\u0629 \u0631\u0627\u064a\u0642\u0629", cover: "\ud83c\udf19", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
  ];

  var STICKERS = [
    { id: "s1", e: "\ud83e\udd73", n: "\u062d\u0641\u0644\u0629" }, { id: "s2", e: "\ud83c\udfa4", n: "\u063a\u0646\u0627\u0621" }, { id: "s3", e: "\ud83d\udc51", n: "\u0645\u0644\u0643\u064a" },
    { id: "s4", e: "\ud83d\udd25", n: "\u0646\u0627\u0631" }, { id: "s5", e: "\ud83d\udc96", n: "\u062d\u0628" }, { id: "s6", e: "\ud83d\ude02", n: "\u0636\u062d\u0643" }
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
    if (s.indexOf("feature_disabled") >= 0 || s.indexOf("\u0645\u0639\u0637\u0644\u0629") >= 0) return "\u0645\u064a\u0632\u0629 \u0647\u062f\u0627\u064a\u0627 \u0627\u0644\u062d\u0638 \u0645\u062a\u0648\u0642\u0641\u0629 \u0645\u0624\u0642\u062a\u0627\u064b \u0645\u0646 \u0627\u0644\u0625\u062f\u0627\u0631\u0629.";
    if (s.indexOf("insufficient") >= 0 || s.indexOf("\u0631\u0635\u064a\u062f") >= 0) return "\u0631\u0635\u064a\u062f\u0643 \u0627\u0644\u062d\u0627\u0644\u064a \u063a\u064a\u0631 \u0643\u0627\u0641\u064d \u0644\u0625\u0631\u0633\u0627\u0644 \u0647\u0630\u0647 \u0627\u0644\u0647\u062f\u064a\u0629.";
    if (s.indexOf("daily_limit") >= 0 || s.indexOf("\u0627\u0644\u062d\u062f \u0627\u0644\u064a\u0648\u0645\u064a") >= 0) return "\u062a\u062c\u0627\u0648\u0632\u062a \u0627\u0644\u062d\u062f \u0627\u0644\u064a\u0648\u0645\u064a \u0644\u0644\u0625\u0646\u0641\u0627\u0642 (20,000 \u0639\u0645\u0644\u0629 \u0628\u062a\u0648\u0642\u064a\u062a UTC).";
    if (s.indexOf("quote") >= 0 || s.indexOf("\u062a\u063a\u064a\u0631") >= 0) return "\u062a\u063a\u064a\u0651\u0631 \u0633\u0639\u0631 \u0627\u0644\u0647\u062f\u064a\u0629 \u0623\u0648 \u0625\u0639\u062f\u0627\u062f\u0627\u062a\u0647\u0627\u060c \u064a\u0631\u062c\u0649 \u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u062c\u062f\u064a\u062f \u0648\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0625\u0631\u0633\u0627\u0644.";
    if (s.indexOf("recipient") >= 0 || s.indexOf("\u0627\u0644\u0645\u0633\u062a\u0644\u0645") >= 0) return "\u0627\u0644\u0645\u0633\u062a\u0644\u0645 \u063a\u064a\u0631 \u0645\u062a\u0648\u0627\u062c\u062f \u062f\u0627\u062e\u0644 \u0627\u0644\u063a\u0631\u0641\u0629 \u062d\u0627\u0644\u064a\u0627\u064b \u0623\u0648 \u063a\u064a\u0631 \u0645\u0624\u0647\u0644.";
    if (s.indexOf("self") >= 0) return "\u0644\u0627 \u064a\u0645\u0643\u0646\u0643 \u0625\u0631\u0633\u0627\u0644 \u0647\u062f\u064a\u0629 \u062d\u0638 \u0625\u0644\u0649 \u0646\u0641\u0633\u0643.";
    if (s.indexOf("auth") >= 0 || s.indexOf("token") >= 0 || s.indexOf("401") >= 0) return "\u0627\u0646\u062a\u0647\u062a \u062c\u0644\u0633\u062a\u0643\u060c \u064a\u0631\u062c\u0649 \u0625\u0639\u0627\u062f\u0629 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644.";
    if (s.indexOf("conflict") >= 0) return "\u062d\u062f\u062b \u062a\u0639\u0627\u0631\u0636 \u0641\u064a \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0637\u0644\u0628\u060c \u064a\u0631\u062c\u0649 \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629.";
    if (s.indexOf("rate") >= 0 || s.indexOf("429") >= 0) return "\u0637\u0644\u0628\u0627\u062a \u0645\u062a\u0643\u0631\u0631\u0629 \u0628\u0633\u0631\u0639\u0629 \u0643\u0628\u064a\u0631\u0629\u060c \u0627\u0646\u062a\u0638\u0631 \u062b\u0648\u0627\u0646\u064d \u062b\u0645 \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b.";
    return rawMsg || "\u062a\u0639\u0630\u0631 \u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u0639\u0645\u0644\u064a\u0629 \u0628\u0633\u0628\u0628 \u0645\u0634\u0643\u0644\u0629 \u0641\u064a \u0627\u0644\u0627\u062a\u0635\u0627\u0644\u060c \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0633\u062c\u0644 \u0642\u0628\u0644 \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629.";
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
    return String(w).replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/[\u0623\u0625\u0622]/g, "\u0627").toLowerCase();
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
      toast("\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628\u0627\u062a \u0643\u062b\u064a\u0631\u0629 \u062e\u0644\u0627\u0644 \u0648\u0642\u062a \u0642\u0635\u064a\u0631\u060c \u0627\u0646\u062a\u0638\u0631 \u062b\u0648\u0627\u0646\u064d \u23f3");
      return false;
    }
    actionTimestamps.push(t);
    return true;
  }

  function readImageFileAsDataUrl(file, maxSize, quality) {
    maxSize = maxSize || 180; quality = quality || 0.55;
    return new Promise(function (resolve, reject) {
      if (!file || !file.type || file.type.indexOf("image/") !== 0) { reject(new Error("\u0627\u062e\u062a\u0631 \u0645\u0644\u0641 \u0635\u0648\u0631\u0629 \u0635\u062d\u064a\u062d")); return; }
      if (file.size > 6 * 1024 * 1024) { reject(new Error("\u062d\u062c\u0645 \u0627\u0644\u0635\u0648\u0631\u0629 \u0643\u0628\u064a\u0631 \u062c\u062f\u0627\u064b (\u0627\u0644\u062d\u062f \u0627\u0644\u0623\u0642\u0635\u0649 6 \u0645\u064a\u062c\u0627\u0628\u0627\u064a\u062a)")); return; }
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
      reader.onerror = function () { reject(new Error("\u062a\u0639\u0630\u0631 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0635\u0648\u0631\u0629")); };
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
    if (!token || !ECONOMY_API_BASE) return { ok: false, error: "\u0627\u0628\u062f\u0623 \u0627\u0644\u062a\u0637\u0628\u064a\u0642 \u0623\u0648\u0644\u0627\u064b \u0628\u062d\u0633\u0627\u0628 \u0645\u0633\u062c\u0644" };
    try {
      var response = await fetch(ECONOMY_API_BASE + "/" + endpoint, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(payload || {})
      });
      var data = await response.json();
      if (!response.ok || !data || !data.ok) return { ok: false, error: data && data.error ? data.error : "\u062a\u0639\u0630\u0631 \u062a\u0646\u0641\u064a\u0630 \u0627\u0644\u0639\u0645\u0644\u064a\u0629" };
      return data;
    } catch (err) { return { ok: false, error: "\u062a\u0639\u0630\u0631 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u062e\u0627\u062f\u0645 \u0627\u0644\u0645\u062d\u0641\u0638\u0629." }; }
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
        if (choice && choice.outcome === "accepted") toast("\u062a\u0645 \u0628\u062f\u0621 \u062a\u062b\u0628\u064a\u062a REAL VOICE \u0639\u0644\u0649 \u062c\u0648\u0627\u0644\u0643 \u2705");
        else toast("\u062a\u0645 \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u062a\u062b\u0628\u064a\u062a");
      } catch (e) { toast("\u062a\u0639\u0630\u0631 \u062a\u0634\u063a\u064a\u0644 \u0646\u0627\u0641\u0630\u0629 \u0627\u0644\u062a\u062b\u0628\u064a\u062a"); }
      deferredInstallPrompt = null;
      updateInstallBarVisibility();
      return;
    }
    openSheet(
      "<h3>\ud83d\udcf2 \u062a\u062b\u0628\u064a\u062a \u062a\u0637\u0628\u064a\u0642 REAL VOICE</h3>" +
      "<div class='actlist'>" +
        "<button type='button'><b>\u0623\u0646\u062f\u0631\u0648\u064a\u062f (Chrome):</b> \u0627\u0641\u062a\u062d \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u062a\u0635\u0641\u062d (\u22ee) \u0648\u0627\u062e\u062a\u0631 <b>\u00ab\u062a\u062b\u0628\u064a\u062a \u0627\u0644\u062a\u0637\u0628\u064a\u0642\u00bb</b> \u0623\u0648 <b>\u00ab\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0634\u0627\u0634\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629\u00bb</b>.</button>" +
        "<button type='button'><b>\u0622\u064a\u0641\u0648\u0646 (Safari):</b> \u0627\u0636\u063a\u0637 \u0632\u0631 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 (\u2b06\ufe0f) \u062b\u0645 <b>\u00ab\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0634\u0627\u0634\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629\u00bb</b>.</button>" +
      "</div>" +
      "<button class='btn block' id='ins-close' type='button'>\u062d\u0633\u0646\u0627\u064b</button>"
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
        toast("\u062a\u0645 \u062a\u062b\u0628\u064a\u062a REAL VOICE \u0628\u0646\u062c\u0627\u062d \u2705");
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

  /* ========= \u0627\u0644\u0635\u0648\u062a (Agora RTC) + \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649 \u0627\u0644\u0645\u062a\u0632\u0627\u0645\u0646\u0629 ========= */
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
      txt.textContent = customLabel || "\u0645\u062a\u0635\u0644 \u0628\u0627\u0644\u0635\u0648\u062a \u2014 \u0627\u0644\u062c\u0645\u064a\u0639 \u064a\u0633\u0645\u0639 \u0628\u0639\u0636\u0647 \ud83d\udd0a";
    } else if (stateVal === VOICE_STATES.CONNECTING) {
      dot.classList.add("warn");
      txt.textContent = customLabel || "\u062c\u0627\u0631\u064a \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0627\u0644\u0635\u0648\u062a...";
    } else if (stateVal === VOICE_STATES.RECONNECTING) {
      dot.classList.add("warn");
      txt.textContent = customLabel || "\u0627\u0646\u0642\u0637\u0639 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0645\u0624\u0642\u062a\u0627\u064b \u2014 \u062c\u0627\u0631\u064a \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0627\u062a\u0635\u0627\u0644...";
    } else if (stateVal === VOICE_STATES.FAILED) {
      dot.classList.add("bad");
      txt.textContent = customLabel || "\u0641\u0634\u0644 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0627\u0644\u0635\u0648\u062a\u064a";
    } else {
      txt.textContent = customLabel || "\u063a\u064a\u0631 \u0645\u062a\u0635\u0644 \u0628\u0627\u0644\u0635\u0648\u062a";
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
      musicState.roomAudio.onerror = function () { toast("\u062a\u0639\u0630\u0631 \u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u0642\u0637\u0639 \u0627\u0644\u0635\u0648\u062a\u064a \u2014 \u062a\u062d\u0642\u0642 \u0645\u0646 \u0635\u062d\u0629 \u0627\u0644\u0631\u0627\u0628\u0637"); };
    }

    var targetPos = computeMusicPositionSec(mObj);
    try {
      if (musicState.roomAudio.readyState >= 1 && Math.abs((musicState.roomAudio.currentTime || 0) - targetPos) > 2.2) {
        musicState.roomAudio.currentTime = targetPos;
      }
    } catch (e) { /* */ }

    musicState.roomAudio.muted = !!UI.roomSpeakerMuted;
    musicState.currentTitle = (mObj.title || "\u0623\u063a\u0646\u064a\u0629") + (mObj.artist ? " \u2014 " + mObj.artist : "");
    musicState.playing = true;
    if (mm) {
      mm.classList.remove("hidden");
      $("music-mini-title").textContent = "\ud83c\udfb5 " + musicState.currentTitle;
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
    if (!canControlRoomMusic(r)) { toast("\u062a\u0634\u063a\u064a\u0644 \u0648\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649 \u0645\u062a\u0627\u062d \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u063a\u0631\u0641\u0629 \u0648\u0627\u0644\u0645\u0634\u0631\u0641\u064a\u0646 \u0641\u0642\u0637"); return; }
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
      spkBtn.textContent = muted ? "\ud83d\udd07 \u0645\u0643\u062a\u0648\u0645" : "\ud83d\udd0a \u0627\u0644\u0633\u0645\u0627\u0639\u0629";
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
    } catch (e) { setVoiceConnectionState(VOICE_STATES.FAILED, "\u062a\u0639\u0630\u0631 \u062a\u0647\u064a\u0626\u0629 \u0645\u062d\u0631\u0643 \u0627\u0644\u0635\u0648\u062a"); }
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
    if (!res.ok || !data.token || !data.appId) throw new Error(data.error || "\u0641\u0634\u0644 \u062c\u0644\u0628 \u062a\u0635\u0631\u064a\u062d \u0627\u0644\u0635\u0648\u062a \u0645\u0646 \u0627\u0644\u062e\u0627\u062f\u0645");
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
    } catch (e) { toast("\u062a\u0639\u0630\u0631 \u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0645\u064a\u0643\u0631\u0648\u0641\u0648\u0646 \u2014 \u062a\u0623\u0643\u062f \u0645\u0646 \u0625\u0639\u0637\u0627\u0621 \u0635\u0644\u0627\u062d\u064a\u0629 \u0627\u0644\u0645\u064a\u0643\u0631\u0648\u0641\u0648\u0646"); return false; }
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
    if (!global.AgoraRTC) { setVoiceConnectionState(VOICE_STATES.FAILED, "\u0645\u0643\u062a\u0628\u0629 Agora \u0627\u0644\u0635\u0648\u062a\u064a\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629"); return false; }
    setupAgoraClient();
    if (!voice.client) { setVoiceConnectionState(VOICE_STATES.FAILED, "\u062a\u0639\u0630\u0631 \u062a\u0647\u064a\u0626\u0629 \u0627\u0644\u0635\u0648\u062a"); return false; }
    voice.joining = true;
    setVoiceConnectionState(VOICE_STATES.CONNECTING, "\u062c\u0627\u0631\u064a \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0627\u0644\u0635\u0648\u062a...");
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
      setVoiceConnectionState(VOICE_STATES.CONNECTED, "\u0645\u062a\u0635\u0644 \u0628\u0627\u0644\u0635\u0648\u062a \u2014 \u0627\u0644\u062c\u0645\u064a\u0639 \u064a\u0633\u0645\u0639 \u0628\u0639\u0636\u0647 \ud83d\udd0a");
      return true;
    } catch (e) {
      setVoiceConnectionState(VOICE_STATES.FAILED, "\u0641\u0634\u0644 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0627\u0644\u0635\u0648\u062a\u064a \u2014 \u0623\u0639\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629");
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
    setVoiceConnectionState(VOICE_STATES.DISCONNECTED, "\u063a\u064a\u0631 \u0645\u062a\u0635\u0644 \u0628\u0627\u0644\u0635\u0648\u062a");
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
      if (isSpk) activeNames.push(u.name || "\u0645\u0633\u062a\u062e\u062f\u0645");
    });
    var spkEl = $("room-active-speaker");
    if (spkEl) spkEl.textContent = activeNames.length ? ("\ud83c\udfa4 \u064a\u062a\u062d\u062f\u062b \u0627\u0644\u0622\u0646: " + activeNames.slice(0, 2).join("\u060c ")) : "";
  }

  /* ========= \u0627\u0644\u062d\u0627\u0644\u0629 \u0648\u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629 ========= */
  var cloud = { on: false, db: null, auth: null, usersMap: {}, roomMsgs: {}, synced: false, connected: true, lastInitError: "" };
  var S = null;
  var UI = {
    page: "home", filter: "all", rfilter: "public", ftab: "friends", pftab: "overview",
    query: "", findQ: "", pfSocialQ: "", roomId: null, roomSessionStart: 0, floatingRoomId: null, dmId: null,
    micMuted: false, roomSpeakerMuted: false, musicVolume: 0.7, giftSel: "heart", giftTarget: "",
    authReady: false, authSigningIn: false, isGuest: false, googleUser: null,
    onboardPhoto: "", onboardGender: "\u0630\u0643\u0631", loadingRooms: false,
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
        id: id, num: uidToAgoraNum(id), specialId: "", name: "", gender: "\u0630\u0643\u0631", age: "", email: "",
        photo: "", coverPhoto: "", bio: "\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0643 \u0641\u064a REAL VOICE",
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
    if (!otherId || otherId === S.me.id) return { state: "self", following: false, followedBy: false, label: "\u0623\u0646\u062a" };
    if (hasBlockedUser(otherId)) return { state: "blocked_by_me", following: false, followedBy: false, label: "\u0645\u062d\u0638\u0648\u0631" };
    if (isBlockedByUser(otherId)) return { state: "blocked_by_them", following: false, followedBy: false, label: "\u063a\u064a\u0631 \u0645\u062a\u0627\u062d" };
    var following = isFollowingUser(otherId), followedBy = isFollowedByUser(otherId), state = "none", label = "\u0644\u0627 \u062a\u0648\u062c\u062f \u0639\u0644\u0627\u0642\u0629";
    if (isFriendWith(otherId)) { state = "friends"; label = "\u0635\u062f\u064a\u0642"; }
    else if (hasSentFriendReq(otherId)) { state = "request_sent"; label = "\u0637\u0644\u0628 \u0635\u062f\u0627\u0642\u0629 \u0645\u0631\u0633\u0644"; }
    else if (hasReceivedFriendReq(otherId)) { state = "request_received"; label = "\u0637\u0644\u0628 \u0635\u062f\u0627\u0642\u0629 \u0648\u0627\u0631\u062f"; }
    else if (following && followedBy) label = "\u0645\u062a\u0627\u0628\u0639\u0629 \u0645\u062a\u0628\u0627\u062f\u0644\u0629";
    else if (following) label = "\u0623\u0646\u062a \u062a\u062a\u0627\u0628\u0639\u0647";
    else if (followedBy) label = "\u064a\u062a\u0627\u0628\u0639\u0643";
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
    var entry = { id: uid(), type: item.type || "info", text: item.text || "\u0625\u0634\u0639\u0627\u0631 \u062c\u062f\u064a\u062f", t: now(), read: false };
    S.notifs.unshift(entry);
    if (S.notifs.length > 50) S.notifs = S.notifs.slice(0, 50);
    if (S.settings.sound !== false) toast("\ud83d\udd14 " + entry.text);
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
      name: S.me.name || "\u0645\u0633\u062a\u062e\u062f\u0645", username: S.me.name || "\u0645\u0633\u062a\u062e\u062f\u0645",
      gender: S.me.gender || "\u0630\u0643\u0631", age: S.me.age || "",
      photo: S.me.photo || "", coverPhoto: S.me.coverPhoto || "", bio: S.me.bio || "",
      xp: xpVal, level: lv, charm: charmVal, charmLevel: cLv,
      vip: activeVip, vipExpiresAt: Number(S.me.vipExpiresAt || 0), verified: !!S.me.verified,
      followersCount: followersTotal, followingCount: followingTotal, friendsCount: friendsTotal,
      receivedGifts: S.me.receivedGifts, receivedGiftLog: S.me.receivedGiftLog || {}, gifts: Number(S.me.gifts || 0),
      activeProfileFrame: (cloud.usersMap[S.me.id] || {}).activeProfileFrame || S.me.activeProfileFrame || null,
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
    if (!id) return { id: "", num: 0, specialId: formatSpecialId(CONFIG.initialSpecialIdNumber), name: "\u0645\u0633\u062a\u062e\u062f\u0645", gender: "", age: "", photo: "", coverPhoto: "", bio: "", online: false, level: 1, vip: 0, verified: false, followersCount: 0, followingCount: 0, friendsCount: 0, receivedGifts: {}, exists: false };
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
      id: id, num: uidToAgoraNum(id), specialId: "", name: exists ? "\u0645\u0633\u062a\u062e\u062f\u0645" : "\u062d\u0633\u0627\u0628 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d",
      gender: "", age: "", photo: "", coverPhoto: "", bio: "", online: false, level: 1, vip: 0, verified: false,
      followersCount: 0, followingCount: 0, friendsCount: 0, receivedGifts: {}
    }, fromLocal || {}, fromCloud || {});
    base.vip = getEffectiveVip(base);
    base.exists = exists;
    if (!base.name) base.name = exists ? "\u0645\u0633\u062a\u062e\u062f\u0645" : "\u062d\u0633\u0627\u0628 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d";
    return base;
  }

  function ensureCloudReadyForWrite() {
    if (UI.isGuest) { toast("\u0647\u0630\u0647 \u0627\u0644\u0645\u064a\u0632\u0629 \u062a\u062a\u0637\u0644\u0628 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u062d\u0633\u0627\u0628 \u0627\u0644\u062a\u0637\u0628\u064a\u0642"); return false; }
    if (!cloud.on || !cloud.db) { toast("\u0642\u0627\u0639\u062f\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u063a\u064a\u0631 \u0645\u062a\u0635\u0644\u0629 \u062d\u0627\u0644\u064a\u0627\u064b"); return false; }
    if (!cloud.connected) { toast("\u0644\u0627 \u064a\u0648\u062c\u062f \u0627\u062a\u0635\u0627\u0644 \u0628\u0627\u0644\u0625\u0646\u062a\u0631\u0646\u062a \u2014 \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0634\u0628\u0643\u0629"); return false; }
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
      UI.onboardGender = (S && S.me && S.me.gender) || "\u0630\u0643\u0631";
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
      cloud.lastInitError = "\u0645\u0643\u062a\u0628\u0629 Firebase \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631\u0629";
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
      cloud.lastInitError = e && e.message ? e.message : "\u062e\u0637\u0623 \u0641\u064a \u062a\u0647\u064a\u0626\u0629 Firebase";
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

  /* \u0625\u0646\u0634\u0627\u0621 \u063a\u0631\u0641\u0629 \u062a\u0644\u0642\u0627\u0626\u064a\u0629 \u0644\u0643\u0644 \u0645\u0633\u062a\u062e\u062f\u0645 \u062c\u062f\u064a\u062f \u0648\u062a\u0638\u0647\u0631 \u0644\u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646 */
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

      var cleanName = clean(userName || S.me.name || "\u0639\u0636\u0648 \u062c\u062f\u064a\u062f").trim();
      var roomPayload = {
        name: "\u063a\u0631\u0641\u0629 " + cleanName,
        desc: "\u0623\u0647\u0644\u0627\u064b \u0628\u0643\u0645 \u0641\u064a \u063a\u0631\u0641\u0629 " + cleanName + " \u0627\u0644\u0635\u0648\u062a\u064a\u0629 \ud83c\udf99\ufe0f",
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
      id: id, name: r.name || (existing && existing.name) || "\u063a\u0631\u0641\u0629",
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
      seatHearts: r.seatHearts || {}, giftTotal: Number(r.giftTotal || 0),
      msgs: (r.msgs ? (Array.isArray(r.msgs) ? r.msgs : Object.keys(r.msgs).map(function (k) { return r.msgs[k]; })).filter(Boolean) : null) || cloud.roomMsgs[id] || (existing && existing.msgs) || []
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
          pushNotification({ type: "dm", actorId: last.from, text: "\u0631\u0633\u0627\u0644\u0629 \u062c\u062f\u064a\u062f\u0629 \u0645\u0646 " + senderU.name });
          if (document.visibilityState === "visible") toast("\ud83d\udcac \u0631\u0633\u0627\u0644\u0629 \u062e\u0627\u0635\u0629 \u062c\u062f\u064a\u062f\u0629 \u0645\u0646 " + senderU.name);
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
          mBanner.textContent = st.maintenanceMessage || "\u0627\u0644\u062a\u0637\u0628\u064a\u0642 \u0642\u064a\u062f \u0627\u0644\u0635\u064a\u0627\u0646\u0629 \u062d\u0627\u0644\u064a\u0627\u064b";
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
          id: String(g.id || key), e: String(g.e || g.emoji || "\ud83c\udf81"), n: String(g.n || g.name || "\u0647\u062f\u064a\u0629"),
          p: Math.max(0, Number(g.p != null ? g.p : g.price || 0)), vipMin: Math.max(0, Number(g.vipMin || 0)),
          image: String(g.gifUrl || g.image || ""), active: g.active !== false, category: String(g.cat || g.category || "\u0639\u0627\u0645"), order: Number(g.order || 0)
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

    onDb("my_profile_frames", myUserBase.child("profileFrames"), "value", function (snap) {
      S.me.profileFrames = snap.val() || {};
      saveLocal();
      if (UI.page === "profile") renderProfile();
    });
    onDb("my_active_profile_frame", myUserBase.child("activeProfileFrame"), "value", function (snap) {
      S.me.activeProfileFrame = snap.val() || null;
      cloud.usersMap[myId] = Object.assign({}, cloud.usersMap[myId] || {}, { activeProfileFrame: S.me.activeProfileFrame });
      saveLocal(); scheduleRenderAll();
    });

    onDb("rel_followers", myUserBase.child("followers"), "value", function (snap) {
      var data = snap.val() || {};
      var prevFollowers = S.followersList || [];
      var newFollowers = extractRelationKeys(data);
      newFollowers.forEach(function (fId) {
        if (prevFollowers.indexOf(fId) < 0 && !isBlockedEitherWay(fId)) {
          pushNotification({ type: "follow", actorId: fId, text: "\u0628\u062f\u0623 " + resolveLiveUser(fId).name + " \u0628\u0645\u062a\u0627\u0628\u0639\u062a\u0643 \u2728" });
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
          pushNotification({ type: "friend_req", actorId: reqId, text: "\u0637\u0644\u0628 \u0635\u062f\u0627\u0642\u0629 \u062c\u062f\u064a\u062f \u0645\u0646 " + resolveLiveUser(reqId).name });
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
      S.me.name = clean(gUser.displayName || (gUser.email ? gUser.email.split("@")[0] : "\u0645\u0633\u062a\u062e\u062f\u0645"));
    }
    setOnboardDoneForUser(uidVal, false, true);
    UI.authReady = true;
    showAuthGate(false);
    save();
    /* \u0625\u0646\u0634\u0627\u0621 \u063a\u0631\u0641\u0629 \u062a\u0644\u0642\u0627\u0626\u064a\u0629 \u0644\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u062c\u062f\u064a\u062f \u0648\u062a\u0638\u0647\u0631 \u0644\u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646 */
    ensureAutoPersonalRoom(uidVal, S.me.name);
    scheduleRenderAll();
    hideSplash();
  }

  async function signInWithGoogleApp() {
    setAuthError("");
    if (UI.authSigningIn) return;
    if (!cloud.on || !cloud.auth) initCloud();
    if (!cloud.on || !cloud.auth) {
      setAuthError("\u062a\u0639\u0630\u0631 \u062a\u0647\u064a\u0626\u0629 Firebase \u0641\u064a \u0627\u0644\u0635\u0641\u062d\u0629: " + (cloud.lastInitError || "\u062a\u062d\u0642\u0642 \u0645\u0646 \u062a\u062d\u0645\u064a\u0644 \u0633\u0643\u0631\u0628\u062a\u0627\u062a Firebase"));
      return;
    }

    UI.authSigningIn = true;
    var btn = $("google-login-btn");
    if (btn) { btn.disabled = true; btn.textContent = "\u062c\u0627\u0631\u064a \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0640 Google..."; }
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
      setAuthError("\u062a\u0639\u0630\u0631 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u062d\u0633\u0627\u0628 Google (" + (code || "error") + "): " + (e && e.message ? e.message : "\u062e\u0637\u0623"));
    } finally {
      UI.authSigningIn = false;
      if (btn) { btn.disabled = false; btn.textContent = "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u062d\u0633\u0627\u0628 Google"; }
    }
  }

  async function startWithoutGoogle() {
    setAuthError("");
    if (UI.authSigningIn) return;
    if (!cloud.on || !cloud.auth) initCloud();
    UI.authSigningIn = true;
    var btn = $("guest-login-btn");
    if (btn) { btn.disabled = true; btn.textContent = "\u062c\u0627\u0631\u064a \u0628\u062f\u0621 \u0627\u0644\u062a\u0637\u0628\u064a\u0642..."; }
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
      if (btn) { btn.disabled = false; btn.textContent = "\u0627\u0644\u062f\u062e\u0648\u0644 \u0643\u0632\u0627\u0626\u0631"; }
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
      toast("\u062a\u0645 \u0627\u0644\u062f\u062e\u0648\u0644 \u0643\u0632\u0627\u0626\u0631");
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
    toast("\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c \u0628\u0646\u062c\u0627\u062d");
  }

  function completeOnboarding() {
    var nameInput = $("ob-name"), ageInput = $("ob-age");
    var nm = clean((nameInput && nameInput.value) || "").trim();
    var ag = ageInput ? String(ageInput.value || "").trim() : "";
    if (!nm) { setOnboardError("\u0645\u0646 \u0641\u0636\u0644\u0643 \u0627\u0643\u062a\u0628 \u0627\u0633\u0645\u0643 \u0623\u0648\u0644\u0627\u064b"); toast("\u0645\u0646 \u0641\u0636\u0644\u0643 \u0627\u0643\u062a\u0628 \u0627\u0633\u0645\u0643 \u0623\u0648\u0644\u0627\u064b"); return; }
    setOnboardError("");
    S.me.name = nm; S.me.age = ag; S.me.gender = UI.onboardGender || "\u0630\u0643\u0631";
    if (UI.onboardPhoto) S.me.photo = UI.onboardPhoto;
    setOnboardDoneForUser(S.me.id, UI.isGuest, true);
    UI.authReady = true; showAuthGate(false);
    if (UI.isGuest) saveLocal();
    else {
      attachRealtimeListeners(S.me.id);
      save();
      ensureAutoPersonalRoom(S.me.id, nm);
    }
    scheduleRenderAll(); toast("\u062a\u0645 \u062d\u0641\u0638 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0648\u0625\u0646\u0634\u0627\u0621 \u063a\u0631\u0641\u062a\u0643 \u0628\u0646\u062c\u0627\u062d \u2705");
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
    if (!isValidOtherUid(otherId)) { toast("\u0644\u0627 \u064a\u0645\u0643\u0646\u0643 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0635\u062f\u0627\u0642\u0629 \u0644\u0646\u0641\u0633\u0643"); return false; }
    if (isBlockedEitherWay(otherId)) { toast("\u0644\u0627 \u064a\u0645\u0643\u0646 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0635\u062f\u0627\u0642\u0629 \u0628\u0633\u0628\u0628 \u0648\u062c\u0648\u062f \u062d\u0638\u0631"); return false; }
    if (!allowActionRateLimit()) return false;
    var lockKey = "freq_" + otherId;
    if (isActionLocked(lockKey)) return false;
    setActionLock(lockKey, true);
    try {
      if (isFriendWith(otherId)) { toast("\u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u0635\u062f\u064a\u0642\u0643 \u0628\u0627\u0644\u0641\u0639\u0644"); return false; }
      if (hasSentFriendReq(otherId)) { toast("\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0627\u0644\u0635\u062f\u0627\u0642\u0629 \u0645\u0633\u0628\u0642\u0627\u064b"); return false; }
      if (hasReceivedFriendReq(otherId)) return await acceptFriendRequest(otherId);
      if (!ensureCloudReadyForWrite()) return false;
      var exists = await verifyTargetAccountExists(otherId);
      if (!exists) { toast("\u0647\u0630\u0627 \u0627\u0644\u062d\u0633\u0627\u0628 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f"); return false; }
      var checks = await Promise.all([
        cloud.db.ref("users/" + otherId + "/blockedUsers/" + S.me.id).once("value"),
        cloud.db.ref("users/" + S.me.id + "/blockedUsers/" + otherId).once("value")
      ]);
      if (checks[0].val() || checks[1].val()) { toast("\u062a\u0639\u0630\u0631 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0627\u0644\u0635\u062f\u0627\u0642\u0629 \u0644\u0648\u062c\u0648\u062f \u062d\u0638\u0631"); return false; }
      var ts = serverTs(), ups = {};
      ups["users/" + S.me.id + "/friendRequestsSent/" + otherId] = { uid: otherId, status: "pending", createdAt: ts };
      ups["users/" + otherId + "/friendRequestsReceived/" + S.me.id] = { uid: S.me.id, status: "pending", createdAt: ts };
      await cloud.db.ref().update(ups);
      if (S.sentReq.indexOf(otherId) < 0) S.sentReq.push(otherId);
      saveLocal(); scheduleRenderAll(); toast("\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0627\u0644\u0635\u062f\u0627\u0642\u0629 \u0628\u0646\u062c\u0627\u062d \u2705");
      return true;
    } catch (e) { toast("\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0627\u0644\u0635\u062f\u0627\u0642\u0629"); return false; }
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
      saveLocal(); scheduleRenderAll(); toast("\u062a\u0645 \u0625\u0644\u063a\u0627\u0621 \u0637\u0644\u0628 \u0627\u0644\u0635\u062f\u0627\u0642\u0629");
      return true;
    } catch (e) { toast("\u062a\u0639\u0630\u0631 \u0625\u0644\u063a\u0627\u0621 \u0637\u0644\u0628 \u0627\u0644\u0635\u062f\u0627\u0642\u0629"); return false; }
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
      saveLocal(); scheduleRenderAll(); toast("\u062a\u0645 \u0631\u0641\u0636 \u0637\u0644\u0628 \u0627\u0644\u0635\u062f\u0627\u0642\u0629");
      return true;
    } catch (e) { toast("\u062a\u0639\u0630\u0631 \u0631\u0641\u0636 \u0637\u0644\u0628 \u0627\u0644\u0635\u062f\u0627\u0642\u0629"); return false; }
    finally { setActionLock(lockKey, false); }
  }

  async function acceptFriendRequest(otherId) {
    if (!isValidOtherUid(otherId)) return false;
    if (isBlockedEitherWay(otherId)) { toast("\u0644\u0627 \u064a\u0645\u0643\u0646 \u0642\u0628\u0648\u0644 \u0627\u0644\u0637\u0644\u0628 \u0644\u0648\u062c\u0648\u062f \u062d\u0638\u0631"); return false; }
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
          from: S.me.id, to: otherId, text: "\u0645\u0631\u062d\u0628\u0627\u064b \ud83d\udc4b \u062a\u0645 \u0642\u0628\u0648\u0644 \u0637\u0644\u0628 \u0627\u0644\u0635\u062f\u0627\u0642\u0629.", status: "sent", read: false, t: now()
        }).catch(function () { /* */ });
      }
      attachDmThreadListener(S.me.id, otherId);
      updateProfileRelationshipCounts(); save(); scheduleRenderAll(); toast("\u062a\u0645 \u0642\u0628\u0648\u0644 \u0637\u0644\u0628 \u0627\u0644\u0635\u062f\u0627\u0642\u0629 \u2705");
      return true;
    } catch (e) { toast("\u062a\u0639\u0630\u0631 \u0642\u0628\u0648\u0644 \u0637\u0644\u0628 \u0627\u0644\u0635\u062f\u0627\u0642\u0629"); return false; }
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
      updateProfileRelationshipCounts(); save(); scheduleRenderAll(); toast("\u062a\u0645\u062a \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0635\u062f\u064a\u0642");
      return true;
    } catch (e) { toast("\u062a\u0639\u0630\u0631 \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0635\u062f\u064a\u0642"); return false; }
    finally { setActionLock(lockKey, false); }
  }

  async function followUser(otherId) {
    if (!isValidOtherUid(otherId)) { toast("\u0644\u0627 \u064a\u0645\u0643\u0646\u0643 \u0645\u062a\u0627\u0628\u0639\u0629 \u062d\u0633\u0627\u0628\u0643"); return false; }
    if (isBlockedEitherWay(otherId)) { toast("\u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629 \u0644\u0648\u062c\u0648\u062f \u062d\u0638\u0631"); return false; }
    if (isFollowingUser(otherId)) { toast("\u0623\u0646\u062a \u062a\u062a\u0627\u0628\u0639 \u0647\u0630\u0627 \u0627\u0644\u062d\u0633\u0627\u0628 \u0628\u0627\u0644\u0641\u0639\u0644"); return true; }
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
      updateProfileRelationshipCounts(); save(); scheduleRenderAll(); toast("\u062a\u0645\u062a \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629 \u0628\u0646\u062c\u0627\u062d \u2705");
      return true;
    } catch (e) { toast("\u0641\u0634\u0644 \u062a\u0646\u0641\u064a\u0630 \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629"); return false; }
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
      updateProfileRelationshipCounts(); save(); scheduleRenderAll(); toast("\u062a\u0645 \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629");
      return true;
    } catch (e) { toast("\u0641\u0634\u0644 \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629"); return false; }
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
      updateProfileRelationshipCounts(); save(); scheduleRenderAll(); toast("\u062a\u0645 \u062d\u0638\u0631 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \ud83d\udeab");
      return true;
    } catch (e) { toast("\u062a\u0639\u0630\u0631 \u062a\u0646\u0641\u064a\u0630 \u0627\u0644\u062d\u0638\u0631"); return false; }
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
      updateProfileRelationshipCounts(); save(); scheduleRenderAll(); toast("\u062a\u0645 \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u062d\u0638\u0631 \u2705");
      return true;
    } catch (e) { toast("\u062a\u0639\u0630\u0631 \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u062d\u0638\u0631"); return false; }
    finally { setActionLock(lockKey, false); }
  }

  function confirmBlockUserSheet(otherId, onDone) {
    var u = resolveLiveUser(otherId);
    openSheet(
      "<h3>\ud83d\udeab \u062a\u0623\u0643\u064a\u062f \u062d\u0638\u0631 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645</h3>" +
      "<div class='confirm-box'>\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0638\u0631 <b>" + esc(u.name) + "</b>\u061f \u0633\u064a\u062a\u0645 \u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u0635\u062f\u0627\u0642\u0629 \u0648\u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629 \u0648\u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0628\u064a\u0646\u0643\u0645\u0627.</div>" +
      "<div style='display:flex;gap:8px'>" +
        "<button class='btn red' style='flex:1' id='confirm-blk-yes' type='button'>\u0646\u0639\u0645\u060c \u062d\u0638\u0631</button>" +
        "<button class='btn ghost' style='flex:1' id='confirm-blk-no' type='button'>\u0625\u0644\u063a\u0627\u0621</button>" +
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
      "<h3>\ud83d\udd13 \u062a\u0623\u0643\u064a\u062f \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u062d\u0638\u0631</h3>" +
      "<div class='confirm-box' style='background:rgba(34,197,94,.12);border-color:rgba(34,197,94,.35)'>\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u062d\u0638\u0631 \u0639\u0646 <b>" + esc(u.name) + "</b>\u061f</div>" +
      "<div style='display:flex;gap:8px'>" +
        "<button class='btn ok' style='flex:1' id='confirm-unblk-yes' type='button'>\u0646\u0639\u0645\u060c \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u062d\u0638\u0631</button>" +
        "<button class='btn ghost' style='flex:1' id='confirm-unblk-no' type='button'>\u062a\u0631\u0627\u062c\u0639</button>" +
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
      id: uid(), reporterId: S.me.id, reporterName: S.me.name || "\u0645\u0633\u062a\u062e\u062f\u0645",
      targetId: targetId, targetName: u.name || "\u0645\u0633\u062a\u062e\u062f\u0645",
      reason: clean(reason || "\u0645\u062e\u0627\u0644\u0641\u0629 \u0642\u0648\u0627\u0639\u062f \u0627\u0644\u063a\u0631\u0641\u0629").trim(), status: "open", t: now()
    };
    S.reports.unshift(rep);
    if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("reports/" + rep.id).set(rep).catch(function () { /* */ });
    saveLocal(); toast("\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u0644\u0627\u063a \u0644\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u2705");
  }

  function inviteFriendToRoom(friendId, targetRoomId) {
    var room = getRoom(targetRoomId || UI.roomId || UI.floatingRoomId);
    if (!room) { toast("\u0627\u062f\u062e\u0644 \u063a\u0631\u0641\u0629 \u0623\u0648\u0644\u0627\u064b \u0644\u0625\u0631\u0633\u0627\u0644 \u062f\u0639\u0648\u0629"); return; }
    var u = resolveLiveUser(friendId);
    if (isBlockedEitherWay(friendId) || !isFriendWith(friendId)) { toast("\u0627\u0644\u062f\u0639\u0648\u0629 \u0645\u062a\u0627\u062d\u0629 \u0644\u0644\u0623\u0635\u062f\u0642\u0627\u0621 \u0641\u0642\u0637"); return; }
    var payload = {
      from: S.me.id, to: friendId,
      text: "\ud83c\udf99\ufe0f \u064a\u062f\u0639\u0648\u0643 " + (S.me.name || "\u0635\u062f\u064a\u0642\u0643") + " \u0644\u0644\u0627\u0646\u0636\u0645\u0627\u0645 \u0625\u0644\u0649 \u063a\u0631\u0641\u0629 \u00ab" + room.name + "\u00bb",
      inviteRoomId: room.id, inviteRoomName: room.name, status: "sent", read: false, t: now()
    };
    if (!S.dms[friendId]) S.dms[friendId] = [];
    S.dms[friendId].push(payload);
    if (cloud.on && cloud.db && !UI.isGuest) {
      cloud.db.ref("dms/" + dmThreadId(S.me.id, friendId)).push(payload).catch(function () { /* */ });
      cloud.db.ref("userDms/" + S.me.id + "/" + friendId).set(true).catch(function () { /* */ });
      cloud.db.ref("userDms/" + friendId + "/" + S.me.id).set(true).catch(function () { /* */ });
    }
    pushRoomMsg(room, { sys: true, text: "\ud83d\udce9 \u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u062f\u0639\u0648\u0629 \u063a\u0631\u0641\u0629 \u0625\u0644\u0649 " + u.name });
    saveLocal(); toast("\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u062f\u0639\u0648\u0629 \u0627\u0644\u063a\u0631\u0641\u0629 \u0625\u0644\u0649 " + u.name + " \u2705");
  }

  function avatarInnerHTML(u) {
    var photo = u && u.photo ? '<img class="avatar-photo" src="' + esc(u.photo) + '" alt="' + esc(u.name || "avatar") + '" loading="lazy" onerror="this.style.display=\'none\';" />' : '<span>' + esc(initials(u && u.name)) + '</span>';
    var f = u && u.activeProfileFrame;
    var validFrame = f && f.imageUrl && (!Number(f.expiresAt) || Number(f.expiresAt) > Date.now());
    return photo + (validFrame ? '<img class="profile-frame-overlay" src="' + esc(f.imageUrl) + '" alt="" aria-hidden="true" />' : '');
  }
  function avatarHTML(u, cls) {
    var vipCls = getEffectiveVip(u) > 0 ? " vip-ring" : "";
    var f = u && u.activeProfileFrame, hasFrame = !!(f && f.imageUrl && (!Number(f.expiresAt) || Number(f.expiresAt) > Date.now()));
    return '<div class="avatar ' + (cls || "") + vipCls + (hasFrame ? " has-profile-frame" : "") + '">' + avatarInnerHTML(u) + "</div>";
  }
  function setAvatarEl(el, u) {
    if (!el) return;
    el.classList.toggle("vip-ring", getEffectiveVip(u) > 0);
    var f = u && u.activeProfileFrame;
    el.classList.toggle("has-profile-frame", !!(f && f.imageUrl && (!Number(f.expiresAt) || Number(f.expiresAt) > Date.now())));
    el.innerHTML = avatarInnerHTML(u);
  }

  function roomSqMediaHTML(r, insideCount) {
    var bg = COVERS[(r.color || 0) % COVERS.length], ic = COVER_ICONS[(r.icon || 0) % COVER_ICONS.length];
    var inner = r.roomPhoto ? '<img src="' + esc(r.roomPhoto) + '" alt="' + esc(r.name || "") + '" loading="lazy" />' : "<span>" + ic + "</span>";
    return '<div class="room-sq-media" style="background:' + bg + '">' +
      '<span class="room-sq-live-pill">\ud83c\udfa7 ' + insideCount + "</span>" +
      (r.micApprovalMode ? '<span class="room-sq-mode-pill">\u270b \u0628\u0637\u0644\u0628</span>' : "") +
      (r.priv ? '<span class="room-sq-priv-pill">\ud83d\udd12 \u062e\u0627\u0635\u0629</span>' : "") + inner + "</div>";
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
    var m = Object.assign({ key: uid() }, msgObj, { t: now() });
    if (!cloud.on || !cloud.db || UI.isGuest) {
      if (!Array.isArray(room.msgs)) room.msgs = [];
      room.msgs.push(m); if (UI.roomId === room.id) renderRoomChat(); saveLocal(); return;
    }
    cloud.db.ref("rooms/" + room.id + "/msgs").transaction(function (cur) {
      var a = Array.isArray(cur) ? cur : (cur ? Object.keys(cur).map(function (k) { return cur[k]; }) : []);
      a.push(m); return a.slice(-100);
    }).catch(function () { toast("\u062a\u0639\u0630\u0631 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629"); });
    if (!Array.isArray(room.msgs)) room.msgs = [];
    room.msgs = room.msgs.concat([m]).slice(-100);
    if (UI.roomId === room.id) renderRoomChat();
  }
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
    if (pill) { pill.textContent = UI.isGuest ? "\u0632\u0627\u0626\u0631" : "Google"; pill.classList.toggle("guest", !!UI.isGuest); }
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
      '<div class="room-sq-name">' + esc(r.name || "\u063a\u0631\u0641\u0629") + "</div></div>";
  }
  function bindRoomCards(box) {
    var cs = box.querySelectorAll("[data-room]");
    for (var i = 0; i < cs.length; i++) cs[i].onclick = function () { openRoom(this.getAttribute("data-room")); };
  }
  function fillRooms(boxId, list) {
    var box = $(boxId);
    if (!box) return;
    box.innerHTML = list.length ? list.map(roomCardHTML).join("") : '<div class="gift-showcase-empty">\u0644\u0627 \u062a\u0648\u062c\u062f \u063a\u0631\u0641 \u062d\u0627\u0644\u064a\u0627\u064b</div>';
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
    box.innerHTML = ids.length ? ids.map(function (id) { return personRow(id, ""); }).join("") : '<div class="gift-showcase-empty">\u0644\u0627 \u064a\u0648\u062c\u062f \u0634\u064a\u0621 \u0647\u0646\u0627 \u0628\u0639\u062f</div>';
    var rows = box.querySelectorAll("[data-user]");
    for (var i = 0; i < rows.length; i++) rows[i].onclick = function () {
      var id = this.getAttribute("data-user");
      if (isFriendWith(id)) openDM(id); else showUserSheet(id);
    };
  }

  function showUserSheet(id, seatIdx) {
    var u = resolveLiveUser(id), me = S.me.id, r = UI.roomId ? getRoom(UI.roomId) : null;
    var mod = r && isRoomModOrOwner(r, me), mine = id === me;
    var si = r ? (seatIdx != null ? seatIdx : seatIndexOf(r, id)) : -1;
    var seat = r && si >= 0 ? r.seats[si] : null;
    openSheet("<div class='rv-mini'><div class='rv-mini-av'>" + avatarHTML(u, "lg") + "</div><div class='rv-mini-name'>" + esc(u.name) + (mine ? " (\u0623\u0646\u0627)" : "") + "</div>" +
      "<div class='rv-mini-id'>ID: " + esc(u.specialId || "\u2014") + "</div>" +
      "<div class='rv-mini-btns'>" +
      (r ? "<button id='us-gift' type='button'>\ud83c\udf81<small>\u0647\u062f\u064a\u0629</small></button>" : "") +
      (!mine && isFriendWith(id) ? "<button id='us-dm' type='button'>\ud83d\udcac<small>\u0645\u0631\u0627\u0633\u0644\u0629</small></button>" : "") +
      (mine && seat ? "<button id='us-leave' type='button'>\u2b07\ufe0f<small>\u0646\u0632\u0648\u0644</small></button>" : "") +
      (!mine && seat && mod ? "<button id='us-mute' type='button'>" + (seat.muted ? "\ud83d\udd0a" : "\ud83d\udd07") + "<small>" + (seat.muted ? "\u0641\u0643 \u0627\u0644\u0643\u062a\u0645" : "\u0643\u062a\u0645") + "</small></button><button id='us-kick' type='button'>\u2b07\ufe0f<small>\u0625\u0646\u0632\u0627\u0644</small></button>" : "") +
      (!mine ? "<button class='danger' id='us-blk' type='button'>\ud83d\udeab<small>\u062d\u0638\u0631</small></button>" : "") + "</div></div>");
    if ($("us-gift")) $("us-gift").onclick = function () { UI.giftTarget = id; closeSheet(); setTimeout(giftSheet, 60); };
    if ($("us-dm")) $("us-dm").onclick = function () { closeSheet(); openDM(id); };
    if ($("us-leave")) $("us-leave").onclick = function () { closeSheet(); leaveSeat(); };
    if ($("us-mute")) $("us-mute").onclick = function () { closeSheet(); roomRef(r.id).child("seats/" + si + "/muted").set(!seat.muted); };
    if ($("us-kick")) $("us-kick").onclick = function () { closeSheet(); roomRef(r.id).child("seats/" + si + "/uid").set(null); };
    if ($("us-blk")) $("us-blk").onclick = function () { confirmBlockUserSheet(id, renderCurrentPage); };
  }

  function renderMessages() {
    var box = $("dm-list"); if (!box || !S) return;
    var ids = Object.keys(S.dms || {}).filter(function (k) { return (S.dms[k] || []).length && !isBlockedEitherWay(k); });
    ids.sort(function (a, b) { var x = S.dms[a], y = S.dms[b]; return (y[y.length - 1].t || 0) - (x[x.length - 1].t || 0); });
    box.innerHTML = ids.length ? ids.map(function (id) {
      var m = S.dms[id][S.dms[id].length - 1], n = S.unread[id] || 0;
      return personRow(id, esc(String(m.text || "\ud83d\udcf7").slice(0, 40)) + (n ? " \ud83d\udd34 " + n : ""));
    }).join("") : '<div class="gift-showcase-empty">\u0644\u0627 \u062a\u0648\u062c\u062f \u0631\u0633\u0627\u0626\u0644 \u0628\u0639\u062f</div>';
    var rows = box.querySelectorAll("[data-user]");
    for (var i = 0; i < rows.length; i++) rows[i].onclick = function () { openDM(this.getAttribute("data-user")); };
  }

  function getOwnedProfileFrames() {
    var raw = S && S.me && S.me.profileFrames && typeof S.me.profileFrames === "object" ? S.me.profileFrames : {};
    var t = Date.now();
    return Object.keys(raw).map(function (id) { return raw[id] || {}; }).filter(function (f) {
      return !!(f.id && f.imageUrl && (!Number(f.expiresAt) || Number(f.expiresAt) > t));
    }).sort(function (a, b) { return Number(b.grantedAt || 0) - Number(a.grantedAt || 0); });
  }
  function renderProfileFramesBag() {
    var box = $("pf-frames-list"); if (!box || !S || !S.me) return;
    var frames = getOwnedProfileFrames();
    var active = S.me.activeProfileFrame || (cloud.usersMap[S.me.id] || {}).activeProfileFrame || null;
    if (!frames.length) { box.innerHTML = '<div class="meta">\u062d\u0642\u064a\u0628\u062a\u0643 \u0641\u0627\u0631\u063a\u0629 \u062d\u0627\u0644\u064a\u0627\u064b \u2014 \u0627\u0637\u0644\u0628 \u0645\u0646 \u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u0625\u0631\u0633\u0627\u0644 \u0625\u0637\u0627\u0631 \u0644\u0643 \ud83c\udf81</div>'; return; }
    box.innerHTML = frames.map(function (f) {
      var isActive = !!(active && active.id === f.id);
      var expiry = Number(f.expiresAt) ? '\u064a\u0646\u062a\u0647\u064a: ' + esc(new Date(Number(f.expiresAt)).toLocaleDateString('ar-EG')) : '\u0628\u062f\u0648\u0646 \u0627\u0646\u062a\u0647\u0627\u0621';
      return '<div class="pf-frame-item"><div class="pf-frame-preview"><img src="' + esc(f.imageUrl) + '" alt="' + esc(f.name || '\u0625\u0637\u0627\u0631') + '" loading="lazy"></div>' +
        '<div class="pf-frame-info"><b>' + esc(f.name || '\u0625\u0637\u0627\u0631 \u0634\u062e\u0635\u064a') + '</b><small>' + expiry + '</small><small>' + (isActive ? '\u2705 \u0645\u0633\u062a\u062e\u062f\u0645 \u062d\u0627\u0644\u064a\u0627\u064b' : '\ud83d\udce6 \u062f\u0627\u062e\u0644 \u0627\u0644\u062d\u0642\u064a\u0628\u0629') + '</small></div>' +
        '<button class="btn sm ' + (isActive ? 'ghost' : 'ok') + '" type="button" data-frame-action="' + (isActive ? 'remove' : 'equip') + '" data-frame-id="' + esc(f.id) + '">' + (isActive ? '\u0625\u0632\u0627\u0644\u0629' : '\u0627\u0633\u062a\u062e\u062f\u0627\u0645') + '</button></div>';
    }).join('');
  }
  async function setProfileFrame(frameId) {
    if (!S || !S.me || !cloud.on || !cloud.db || UI.isGuest) { toast('\u0633\u062c\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u062d\u0642\u064a\u0628\u0629'); return; }
    var frames = getOwnedProfileFrames(), chosen = frames.find(function (f) { return f.id === frameId; });
    if (frameId && !chosen) { toast('\u0647\u0630\u0627 \u0627\u0644\u0625\u0637\u0627\u0631 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f \u0641\u064a \u062d\u0642\u064a\u0628\u062a\u0643 \u0623\u0648 \u0627\u0646\u062a\u0647\u062a \u0635\u0644\u0627\u062d\u064a\u062a\u0647'); return; }
    var active = chosen ? { id: chosen.id, name: chosen.name || '\u0625\u0637\u0627\u0631 \u0634\u062e\u0635\u064a', imageUrl: chosen.imageUrl, expiresAt: Number(chosen.expiresAt || 0) } : null;
    var uid = S.me.id, updates = {};
    updates['publicProfiles/' + uid + '/activeProfileFrame'] = active;
    updates['users/' + uid + '/activeProfileFrame'] = active;
    try {
      await cloud.db.ref().update(updates);
      S.me.activeProfileFrame = active;
      cloud.usersMap[uid] = Object.assign({}, cloud.usersMap[uid] || {}, { activeProfileFrame: active });
      renderProfile(); renderRoom(); toast(active ? '\u062a\u0645 \u062a\u0631\u0643\u064a\u0628 \u0627\u0644\u0625\u0637\u0627\u0631 \u062d\u0648\u0644 \u0635\u0648\u0631\u062a\u0643 \ud83d\udc51' : '\u062a\u0645\u062a \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0625\u0637\u0627\u0631');
    } catch (e) { toast('\u062a\u0639\u0630\u0631 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0625\u0637\u0627\u0631\u060c \u062a\u062d\u0642\u0642 \u0645\u0646 \u0642\u0648\u0627\u0639\u062f Firebase'); }
  }

  function renderProfile() {
    if (!S) return;
    var u = resolveLiveUser(S.me.id);
    setAvatarEl($("pf-avatar"), u);
    $("pf-name").textContent = u.name || "\u0645\u0633\u062a\u062e\u062f\u0645";
    $("pf-id").textContent = "ID: " + (u.specialId || "\u2014");
    $("pf-bio").textContent = u.bio || "";
    $("pf-gender-age").textContent = [u.gender, u.age].filter(Boolean).join(" \u2022 ") || "\u2014";
    $("pf-followers-count").textContent = getMyFollowersCount();
    $("pf-following-count").textContent = getMyFollowingCount();
    $("pf-friends-count").textContent = getMyFriendsCount();
    $("pf-user-level").textContent = "Lv." + computeLevelFromXp(u.xp || 0) + " (" + (u.xp || 0) + ")";
    $("pf-charm-level").textContent = "Lv." + getCharmLevel(u.charm || 0) + " (" + (u.charm || 0) + ")";
    $("pf-vip-badge").textContent = "VIP " + (getEffectiveVip(u) || 0);
    renderProfileFramesBag();
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
      $("pf-social-tab-list").innerHTML = ids.slice(0, UI.pfSocialLimit).map(function (id) { return personRow(id, ""); }).join("") || '<div class="gift-showcase-empty">\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0641\u0627\u0631\u063a\u0629</div>';
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
    if (!r) { toast("\u0627\u0644\u063a\u0631\u0641\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629"); return; }
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
    if (r) $("floating-orb-label").textContent = r.name || "\u063a\u0631\u0641\u0629";
  }
  function renderRoom() {
    var r = getRoom(UI.roomId);
    if (!r) { leaveRoom(true); return; }
    $("room-title").textContent = r.name || "\u063a\u0631\u0641\u0629";
    $("room-right-id").textContent = "ID: " + r.id.replace("room_", "").slice(0, 7);
    $("room-online-count").textContent = count(r);
    $("room-seats").innerHTML = (r.seats || []).map(function (s, i) {
      var u = s.uid ? resolveLiveUser(s.uid) : null;
      return '<div class="seat"><div class="seat-orb">' + (u ? avatarInnerHTML(u) : (s.locked ? "\ud83d\udd12" : "\ud83c\udf99\ufe0f")) + "</div>" +
        '<div class="seat-name">' + (u ? esc(u.name) : (i + 1)) + "</div></div>";
    }).join("");
    renderRoomChat();
  }
  function renderRoomChat() {
    var r = getRoom(UI.roomId), box = $("room-chat"); if (!r || !box) return;
    var tab = UI.roomTab || "all";
    var near = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    var head = "";
    if (tab === "all") {
      head = '<div class="rv-card rv-ann"><b>\ud83d\udce2 \u0625\u0639\u0644\u0627\u0646 \u0631\u0633\u0645\u064a: REAL VOICE</b><br>' + esc(r.pinned || "\u0623\u0647\u0644\u0627\u064b \u0628\u0643 \u0641\u064a REAL VOICE \u2014 \u063a\u0631\u0641 \u0635\u0648\u062a\u064a\u0629 \u0648\u062f\u0631\u062f\u0634\u0629 \u0645\u0628\u0627\u0634\u0631\u0629. \u0627\u0644\u062a\u0632\u0645 \u0628\u0627\u0644\u0622\u062f\u0627\u0628 \u0627\u0644\u0639\u0627\u0645\u0629\u060c \u0648\u062a\u062c\u0646\u0628 \u0645\u0634\u0627\u0631\u0643\u0629 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0627\u0644\u0634\u062e\u0635\u064a\u0629 \u0623\u0648 \u0627\u0644\u062a\u062d\u0648\u064a\u0644\u0627\u062a \u0627\u0644\u0645\u0627\u0644\u064a\u0629.") + '</div>' +
        '<div class="rv-card rv-row">\ud83d\udea9 \u0623\u0628\u0644\u063a \u0627\u0644\u0645\u0639\u062c\u0628\u064a\u0646 \u0644\u0644\u0645\u0633\u0627\u0639\u062f\u0629 \u0641\u064a \u062c\u0639\u0644 \u0627\u0644\u063a\u0631\u0641\u0629 \u0623\u0643\u062b\u0631 \u0634\u0639\u0628\u064a\u0629</div>' +
        '<div class="rv-pill-sys">\ud83d\udc4b \u062f\u062e\u0644 \u0627\u0644\u063a\u0631\u0641\u0629 <b>' + esc(r.name || "REAL VOICE") + '</b></div>' +
        '<div class="rv-card rv-row">\u270f\ufe0f \u0645\u0648\u0627\u0636\u064a\u0639 \u0644\u0645\u0634\u0627\u0631\u0643\u062a\u0647\u0627 \u0645\u0639 \u0627\u0644\u062c\u0645\u064a\u0639</div>';
    }
    var body = (r.msgs || []).slice(-100).filter(function (m) {
      if (tab === "gifts") return m.type === "gift";
      if (tab === "chat") return m.type !== "gift";
      return true;
    }).map(function (m) {
      var id = m.uid || m.from, u = id ? resolveLiveUser(id) : null;
      if (id && isBlockedEitherWay(id)) return "";
      var body2 = m.img ? '<br><img class="rv-msg-img" src="' + esc(m.img) + '" alt="">' : (m.type === "sticker" ? '<span class="rv-sticker">' + esc(m.text || "") + "</span>" : esc(m.text || ""));
      return '<div class="room-msg' + (m.type === "gift" ? " gift" : "") + '"><b>' + (u ? esc(u.name) : "") + "</b> " + body2 + "</div>";
    }).join("");
    if (tab === "gifts" && !body) body = '<div class="rv-card rv-row">\ud83c\udf81 \u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0643\u0627\u0641\u0622\u062a \u0628\u0639\u062f</div>';
    box.innerHTML = head + body;
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
    $("chat-sub").textContent = u.online ? "\u0645\u062a\u0635\u0644" : "\u063a\u064a\u0631 \u0645\u062a\u0635\u0644";
    var box = $("chat-msgs");
    box.innerHTML = (S.dms[id] || []).map(function (m) {
      var mine = m.from === S.me.id;
      return '<div class="dm-bubble ' + (mine ? "me" : "them") + '" style="align-self:' + (mine ? "flex-start" : "flex-end") + '">' + esc(m.text || "\ud83d\udcf7") + "</div>";
    }).join("");
    box.scrollTop = box.scrollHeight;
  }
  function sendDM() {
    var inp = $("chat-input"), id = UI.dmId;
    var text = clean(inp.value || "").trim();
    if (!id || !text || !cloud.on || !cloud.db) return;
    if (isBlockedEitherWay(id) || !isFriendWith(id)) { toast("\u0644\u0627 \u064a\u0645\u0643\u0646 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629"); return; }
    var msg = { from: S.me.id, to: id, text: text, t: now() };
    cloud.db.ref("dms/" + dmThreadId(S.me.id, id)).push(msg).catch(function () { toast("\u062a\u0639\u0630\u0631 \u0627\u0644\u0625\u0631\u0633\u0627\u0644"); });
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
    on("pf-frames-list", function (e) {
      var b = e.target.closest('[data-frame-action]'); if (!b) return;
      var id = b.getAttribute('data-frame-id');
      setProfileFrame(b.getAttribute('data-frame-action') === 'remove' ? '' : id);
    });
    on("refresh-rooms", function () { renderHome(); toast("\u062a\u0645 \u0627\u0644\u062a\u062d\u062f\u064a\u062b"); });
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
      openSheet("<h3>\u2699\ufe0f \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a</h3><div class='actlist'><button class='danger' id='st-out' type='button'>\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c</button></div>");
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
        setAuthError("\u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0642\u0627\u0639\u062f\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0628\u0637\u064a\u0621 \u0623\u0648 \u0642\u0648\u0627\u0639\u062f Firebase \u062a\u0631\u0641\u0636 \u0627\u0644\u0642\u0631\u0627\u0621\u0629. \u062c\u0631\u0651\u0628 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.");
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
    if (!r) { toast("\u0627\u0644\u063a\u0631\u0641\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629"); return; }
    if (UI.floatingRoomId === id) { UI.roomId = id; UI.floatingRoomId = null; showRoomView(); return; }
    if (UI.roomId || UI.floatingRoomId) await leaveRoom(true);
    var me = S.me.id;
    if ((r.bans || []).indexOf(me) >= 0) { toast("\u0623\u0646\u062a \u0645\u062d\u0638\u0648\u0631 \u0645\u0646 \u0647\u0630\u0647 \u0627\u0644\u063a\u0631\u0641\u0629"); return; }
    if (isBlockedEitherWay(r.owner)) { toast("\u0644\u0627 \u064a\u0645\u0643\u0646 \u062f\u062e\u0648\u0644 \u0647\u0630\u0647 \u0627\u0644\u063a\u0631\u0641\u0629"); return; }
    if (r.passcode && !isRoomModOrOwner(r, me)) {
      var p = global.prompt("\u0643\u0644\u0645\u0629 \u0633\u0631 \u0627\u0644\u063a\u0631\u0641\u0629");
      if (p !== r.passcode) { toast("\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629"); return; }
    }
    UI.roomId = id; UI.roomSessionStart = now();
    showRoomView();
    if (cloud.on && cloud.db) {
      var lr = roomRef(id).child("listeners/" + me);
      lr.set(true).catch(function () { toast("\u062a\u0639\u0630\u0631 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0644\u063a\u0631\u0641\u0629 \u2014 \u0631\u0627\u062c\u0639 \u0642\u0648\u0627\u0639\u062f Firebase"); });
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

  function roomDisplayId(r) {
    var o = r && r.owner ? resolveLiveUser(r.owner) : null;
    if (o && o.specialId) return String(o.specialId);
    var h = 0, k = String(r && r.id || "");
    for (var i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) % 9000000;
    return String(1000000 + h);
  }
  function renderRoom() {
    var r = getRoom(UI.roomId);
    if (!r) { if (UI.roomId) leaveRoom(true); return; }
    $("room-title").textContent = r.name || "REAL VOICE";
    $("room-right-id").textContent = "ID:" + roomDisplayId(r);
    $("room-online-count").textContent = count(r);
    var tp = $("room-topic"); if (tp) tp.textContent = r.desc || r.topic || "\u0627\u0633\u062a\u0645\u0639 \u0625\u0644\u0649 \u0627\u0644\u0623\u063a\u0627\u0646\u064a \u0648\u062a\u062d\u062f\u062b \u0645\u0639\u064b\u0627";
    var th = $("room-top-thumb");
    if (th) th.innerHTML = r.roomPhoto ? '<img src="' + esc(r.roomPhoto) + '" alt="" />' : '<span>\ud83c\udf99\ufe0f</span>';
    $("room-seats").innerHTML = (r.seats || []).map(function (s, i) {
      var u = s.uid ? resolveLiveUser(s.uid) : null;
      var inner = u ? avatarInnerHTML(u) : (s.locked ? "\ud83d\udd12" : "\ud83d\udecb\ufe0f");
      var hasFrame = !!(u && u.activeProfileFrame && u.activeProfileFrame.imageUrl && (!Number(u.activeProfileFrame.expiresAt) || Number(u.activeProfileFrame.expiresAt) > Date.now()));
      var speaking = !!(u && (s.speaking || s.isSpeaking));
      var hearts = Number((r.seatHearts && s.uid && r.seatHearts[s.uid]) || 0);
      return '<div class="seat' + (u ? ' occ' : '') + (speaking ? ' speak' : '') + (s.locked ? ' locked' : '') + (i === 0 ? ' host' : '') + '" data-seat="' + i + '" data-uid="' + esc(s.uid || '') + '"><div class="seat-orb' + (u ? "" : " empty") + (hasFrame ? " has-profile-frame" : "") + '">' + inner + (s.muted ? '<span class="mutedmark">\ud83d\udd07</span>' : "") + "</div>" +
        '<div class="seat-name">' + (u ? esc(u.name) : "No." + (i + 1)) + '</div><div class="seat-heart">' + hearts + ' <i>\ud83d\udc97</i></div></div>';
    }).join("");
    var mic = $("mic-btn"); if (mic) mic.textContent = UI.micMuted ? "\ud83d\udd07" : "\ud83c\udf99\ufe0f";
    var rh = $("raise-hand-btn");
    if (rh) { var amMod = isRoomModOrOwner(r, S.me.id); rh.classList.toggle("hidden", !(r.micApprovalMode && (amMod || seatIndexOf(r, S.me.id) < 0))); var rb = $("raise-badge"); if (rb) { rb.textContent = (r.handRequests || []).length; rb.classList.toggle("hidden", !amMod || !(r.handRequests || []).length); } }
    var pin = $("room-pinned-banner");
    if (pin) { pin.classList.toggle("hidden", !r.pinned); $("room-pinned-text").textContent = r.pinned || ""; }
    renderRoomChat();
  }

  async function takeSeat(i) {
    var r = getRoom(UI.roomId), me = S.me.id; if (!r || !cloud.on) return;
    var s = r.seats[i], mod = isRoomModOrOwner(r, me);
    if (s.uid) return;
    if (s.locked && !mod) { toast("\u0647\u0630\u0627 \u0627\u0644\u0645\u0642\u0639\u062f \u0645\u0642\u0641\u0644"); return; }
    if (s.vip && !mod && getEffectiveVip(S.me) < 1) { toast("\u0645\u0642\u0639\u062f VIP"); return; }
    var oldIdx = seatIndexOf(r, me);
    if (oldIdx >= 0) {
      UI.pendingSeatActionAt = now();
      var nref = roomRef(r.id).child("seats/" + i + "/uid");
      var nres = await nref.transaction(function (c) { return c == null ? me : undefined; });
      if (!nres.committed) { toast("\u0627\u0644\u0645\u0642\u0639\u062f \u0627\u062a\u062d\u062c\u0632"); return; }
      nref.onDisconnect().set(null);
      await roomRef(r.id).child("seats/" + oldIdx + "/uid").set(null);
      syncMicHardwareState(); return;
    }
    if (r.micApprovalMode && !mod) {
      await roomRef(r.id).child("handRequests/" + me).set(true);
      toast("\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0627\u0644\u0645\u0627\u064a\u0643 \u0644\u0644\u0645\u0634\u0631\u0641"); return;
    }
    if (seatIndexOf(r, me) >= 0) { toast("\u0623\u0646\u062a \u0639\u0644\u0649 \u0645\u0642\u0639\u062f \u0628\u0627\u0644\u0641\u0639\u0644"); return; }
    UI.pendingSeatActionAt = now();
    var ref = roomRef(r.id).child("seats/" + i + "/uid");
    var res = await ref.transaction(function (c) { return c == null ? me : undefined; });
    if (!res.committed) { toast("\u0627\u0644\u0645\u0642\u0639\u062f \u0627\u062a\u062d\u062c\u0632"); return; }
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
      if (mod) {
        openSheet("<h3>\u0627\u0644\u0645\u0642\u0639\u062f " + (i + 1) + "</h3><div class='actlist'><button id='sa-take' type='button'>\ud83c\udf99\ufe0f " + (seatIndexOf(r, me) >= 0 ? "\u0627\u0646\u0642\u0644\u0646\u064a \u0647\u0646\u0627" : "\u0627\u062c\u0644\u0633 \u0647\u0646\u0627") + "</button><button id='sa-lock' type='button'>" + (s.locked ? "\ud83d\udd13 \u0641\u062a\u062d \u0627\u0644\u0645\u0642\u0639\u062f" : "\ud83d\udd12 \u0642\u0641\u0644 \u0627\u0644\u0645\u0642\u0639\u062f") + "</button></div>");
        $("sa-take").onclick = function () { closeSheet(); takeSeat(i); };
        $("sa-lock").onclick = function () { closeSheet(); roomRef(r.id).child("seats/" + i + "/locked").set(!s.locked); };
      } else takeSeat(i);
      return;
    }
    showUserSheet(s.uid, i);
  }

  function toggleMic() {
    var r = getRoom(UI.roomId);
    if (!r || seatIndexOf(r, S.me.id) < 0) { toast("\u0627\u062c\u0644\u0633 \u0639\u0644\u0649 \u0645\u0642\u0639\u062f \u0623\u0648\u0644\u0627\u064b"); return; }
    UI.micMuted = !UI.micMuted; renderRoom(); syncMicHardwareState();
  }

  function createRoomSheet() {
    if (UI.isGuest || !cloud.on) { toast("\u0633\u062c\u0651\u0644 \u0628\u062d\u0633\u0627\u0628 Google \u0644\u0625\u0646\u0634\u0627\u0621 \u063a\u0631\u0641\u0629"); return; }
    if (S.appSettings && S.appSettings.allowCreateRoom === false) { toast("\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u063a\u0631\u0641 \u0645\u062a\u0648\u0642\u0641 \u062d\u0627\u0644\u064a\u0627\u064b"); return; }
    openSheet("<h3>\u2795 \u0625\u0646\u0634\u0627\u0621 \u063a\u0631\u0641\u0629</h3><label>\u0627\u0633\u0645 \u0627\u0644\u063a\u0631\u0641\u0629</label><input id='cr-name' maxlength='30' placeholder='\u0645\u062b\u0627\u0644: \u0633\u0647\u0631\u0629 \u0627\u0644\u0623\u0635\u062f\u0642\u0627\u0621' />" +
      "<label>\u0639\u062f\u062f \u0627\u0644\u0645\u0642\u0627\u0639\u062f</label><div class='gender-row'><button class='gender-pill' data-n='5' type='button'>5</button><button class='gender-pill active' data-n='9' type='button'>9</button><button class='gender-pill' data-n='12' type='button'>12</button></div>" +
      "<button class='btn block' id='cr-go' type='button' style='margin-top:12px'>\u0625\u0646\u0634\u0627\u0621</button>");
    var n = 9, pills = $("sheet").querySelectorAll(".gender-pill");
    for (var k = 0; k < pills.length; k++) pills[k].onclick = function () {
      n = Number(this.getAttribute("data-n"));
      for (var j = 0; j < pills.length; j++) pills[j].classList.toggle("active", pills[j] === this);
    };
    $("cr-go").onclick = async function () {
      var name = clean($("cr-name").value || "").trim();
      if (!name) { toast("\u0627\u0643\u062a\u0628 \u0627\u0633\u0645 \u0627\u0644\u063a\u0631\u0641\u0629"); return; }
      this.disabled = true;
      var id = "room_" + S.me.id + "_" + Date.now().toString(36);
      var payload = { name: name, desc: "", cat: "chat", owner: S.me.id, seatCount: n, seats: makeSeats(n), micApprovalMode: false, priv: false, passcode: "", locked: false, adminOrder: 1000, created: serverTs(), color: Math.floor(Math.random() * COVERS.length), icon: Math.floor(Math.random() * COVER_ICONS.length), roomPhoto: S.me.photo || "" };
      try {
        await roomRef(id).set(payload);
        S.rooms = dedupeRoomsList([normalizeRoom(id, Object.assign({}, payload, { created: now() }))].concat(S.rooms || []));
        closeSheet(); openRoom(id);
      } catch (e) { toast("\u062a\u0639\u0630\u0631 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u063a\u0631\u0641\u0629 \u2014 \u0631\u0627\u062c\u0639 \u0642\u0648\u0627\u0639\u062f Firebase"); this.disabled = false; }
    };
  }

  function roomMenuSheet() {
    var r = getRoom(UI.roomId); if (!r) return;
    var mod = isRoomModOrOwner(r, S.me.id), owner = r.owner === S.me.id;
    openSheet("<h3>\u062e\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u063a\u0631\u0641\u0629</h3><div class='actlist'>" +
      "<button id='rm-spk' type='button'>" + (UI.roomSpeakerMuted ? "\ud83d\udd0a \u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0633\u0645\u0627\u0639\u0629" : "\ud83d\udd07 \u0643\u062a\u0645 \u0627\u0644\u0633\u0645\u0627\u0639\u0629") + "</button>" +
      (mod ? "<button id='rm-appr' type='button'>\u270b \u0637\u0644\u0628 \u0627\u0644\u0645\u0627\u064a\u0643: " + (r.micApprovalMode ? "\u0645\u0641\u0639\u0651\u0644" : "\u0645\u062a\u0648\u0642\u0641") + "</button>" : "") +
      (owner ? "<button id='rm-name' type='button'>\u270f\ufe0f \u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0627\u0633\u0645</button><button class='danger' id='rm-del' type='button'>\ud83d\uddd1\ufe0f \u062d\u0630\u0641 \u0627\u0644\u063a\u0631\u0641\u0629</button>" : "") + "</div>");
    $("rm-spk").onclick = function () { closeSheet(); UI.roomSpeakerMuted = !UI.roomSpeakerMuted; applyRoomSpeakerMuteState(); };
    if ($("rm-appr")) $("rm-appr").onclick = function () { closeSheet(); roomRef(r.id).child("micApprovalMode").set(!r.micApprovalMode); };
    if ($("rm-name")) $("rm-name").onclick = function () { closeSheet(); var n = clean(global.prompt("\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u062c\u062f\u064a\u062f", r.name) || "").trim(); if (n) roomRef(r.id).child("name").set(n); };
    if ($("rm-del")) $("rm-del").onclick = async function () { closeSheet(); if (!global.confirm("\u062d\u0630\u0641 \u0627\u0644\u063a\u0631\u0641\u0629 \u0646\u0647\u0627\u0626\u064a\u0627\u064b\u061f")) return; var id = r.id; await leaveRoom(true); await roomRef(id).remove(); };
  }

  function presenceSheet() {
    var r = getRoom(UI.roomId); if (!r) return;
    openSheet("<h3>\ud83c\udfa7 \u0627\u0644\u0645\u062a\u0648\u0627\u062c\u062f\u0648\u0646 (" + count(r) + ")</h3>" + getRoomParticipantIds(r).map(function (id) { return personRow(id, ""); }).join(""));
    var rows = $("sheet").querySelectorAll("[data-user]");
    for (var i = 0; i < rows.length; i++) rows[i].onclick = function () { showUserSheet(this.getAttribute("data-user")); };
  }

  function giftSheet() {
    var r = getRoom(UI.roomId); if (!r) return;
    var me = S.me.id, targets = [me];
    (r.seats || []).forEach(function (s) { if (s.uid && s.uid !== me) targets.push(s.uid); });
    var sel = UI.giftTarget && (targets.indexOf(UI.giftTarget) >= 0 || getRoomParticipantIds(r).indexOf(UI.giftTarget) >= 0) ? UI.giftTarget : targets[targets.length > 1 ? 1 : 0];
    if (targets.indexOf(sel) < 0) targets.push(sel);
    var gifts = getActiveGifts().filter(function (g) { return g && g.id; });
    var chosen = null;
    openSheet("<h3>\ud83c\udf81 \u0635\u0646\u062f\u0648\u0642 \u0627\u0644\u0647\u062f\u0627\u064a\u0627</h3><div class='meta'>\u0631\u0635\u064a\u062f\u0643: " + getTotalSpendableCoins() + " \ud83e\ude99</div>" +
      "<select id='gf-to' style='width:100%;margin:8px 0'>" + targets.map(function (t) { return "<option value='" + esc(t) + "'" + (t === sel ? " selected" : "") + ">" + esc(resolveLiveUser(t).name) + (t === me ? " (\u0623\u0646\u0627)" : "") + "</option>"; }).join("") + "</select>" +
      "<div class='gb-grid'>" + gifts.map(function (g) { return "<button class='gb-slot has' data-g='" + esc(g.id) + "' type='button'><div class='gb-e'>" + (g.img ? "<img src='" + esc(g.img) + "' alt=''>" : (g.e || "\ud83c\udf81")) + "</div><small>" + esc(g.n || "") + "</small><div class='gb-p'>" + (g.p || 0) + "\ud83e\ude99</div></button>"; }).join("") + "</div>" +
      "<button class='btn block' id='gf-send' type='button' disabled>\u0627\u062e\u062a\u0631 \u0647\u062f\u064a\u0629</button>");
    var bs = $("sheet").querySelectorAll("[data-g]");
    for (var i = 0; i < bs.length; i++) bs[i].onclick = function () {
      chosen = this.getAttribute("data-g");
      for (var k = 0; k < bs.length; k++) bs[k].classList.toggle("sel", bs[k] === this);
      var g = gifts.filter(function (x) { return x.id === chosen; })[0];
      $("gf-send").disabled = false; $("gf-send").textContent = "\u0625\u0631\u0633\u0627\u0644 " + (g.e || "\ud83c\udf81") + " " + (g.n || "") + " \u2014 " + (g.p || 0) + " \ud83e\ude99";
    };
    $("gf-send").onclick = async function () {
      if (!chosen) return;
      var to = $("gf-to").value, g = gifts.filter(function (x) { return x.id === chosen; })[0];
      this.disabled = true;
      var res = await callEconomyApi("sendGift", { roomId: r.id, toUid: to, giftId: chosen });
      if (res && res.ok !== false) {
        closeSheet();
        if (res.balance != null) { S.me.coins = Math.max(0, Number(res.balance)); if (typeof renderTop === "function") renderTop(); }
        pushRoomMsg(r, { uid: me, from: me, text: "\u0623\u0631\u0633\u0644 " + (g.e || "\ud83c\udf81") + " " + (g.n || "") + " \u0625\u0644\u0649 " + (to === me ? "\u0646\u0641\u0633\u0647" : resolveLiveUser(to).name), type: "gift" });
        roomRef(r.id).child("seatHearts/" + to).transaction(function (c) { return (Number(c) || 0) + (Number(g.p) || 0); });
        roomRef(r.id).child("giftTotal").transaction(function (c) { return (Number(c) || 0) + (Number(g.p) || 0); });
      } else { this.disabled = false; toast((res && res.error) || "\u062a\u0639\u0630\u0631 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0647\u062f\u064a\u0629"); }
    };
  }

  function renderGiftCup() {
    var list = (S.rooms || []).slice().sort(function (a, b) { return (b.giftTotal || 0) - (a.giftTotal || 0); }).slice(0, 20);
    $("gift-cup-page-content").innerHTML = '<div class="cup-hero"><div class="cup-hero-icon">\ud83c\udfc6</div><div class="cup-hero-title">\u0643\u0623\u0633 \u0627\u0644\u063a\u0631\u0641</div><div class="cup-hero-sub">\u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u063a\u0631\u0641 \u062d\u0633\u0628 \u0627\u0644\u0647\u062f\u0627\u064a\u0627</div></div>' +
      list.map(function (x, i) { return '<div class="cup-rank-row"><span class="cup-rank-number">' + (i < 3 ? ["\ud83e\udd47", "\ud83e\udd48", "\ud83e\udd49"][i] : i + 1) + '</span><b style="flex:1">' + esc(x.name) + '</b><span>' + (x.giftTotal || 0) + ' \ud83e\ude99</span></div>'; }).join("");
  }
  function openGiftCup() { renderGiftCup(); $("gift-cup-page").classList.add("open"); }

  function wireRoomExtras() {
    on("room-seats", function (e) { var s = e.target.closest(".seat"); if (s) seatTapped(Number(s.getAttribute("data-seat"))); });
    on("mic-btn", toggleMic);
    on("room-menu", roomMenuSheet);
    on("room-info-btn", function () {
      var r = getRoom(UI.roomId); if (!r) return;
      var topic = r.desc || r.topic || "\u0627\u0633\u062a\u0645\u0639 \u0625\u0644\u0649 \u0627\u0644\u0623\u063a\u0627\u0646\u064a \u0648\u062a\u062d\u062f\u062b \u0645\u0639\u064b\u0627";
      var row = function (label, val, id) { return '<div class="rvi-row"' + (id ? ' id="' + id + '"' : '') + '><span class="rvi-l">' + label + '</span><span class="rvi-v">' + val + ' <i>\u2039</i></span></div>'; };
      openSheet('<div class="rv-info"><div class="rvi-title">\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u063a\u0631\u0641\u0629</div>' +
        row("\u063a\u0637\u0627\u0621 \u0627\u0644\u063a\u0631\u0641\u0629", r.roomPhoto ? '<img src="' + esc(r.roomPhoto) + '" class="rvi-cover" alt="">' : "\ud83d\uddbc\ufe0f") +
        '<div class="rvi-row"><span class="rvi-l">\u0627\u0644\u063a\u0631\u0641\u0629 ID</span><span class="rvi-v">' + esc(roomDisplayId(r)) + '</span></div>' +
        row("\u0627\u0633\u0645 \u0627\u0644\u063a\u0631\u0641\u0629", esc(r.name || "REAL VOICE")) +
        row("\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u063a\u0631\u0641\u0629", "Lv.0 \ud83c\udfe0") +
        '<div class="rvi-gap"></div>' +
        row("\u0625\u0639\u0644\u0627\u0646 \u0627\u0644\u063a\u0631\u0641\u0629", esc((r.pinned || "").slice(0, 24))) +
        row("\u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u063a\u0631\u0641\u0629", esc(topic)) +
        row("\u0632\u062e\u0631\u0641\u0629 \u0627\u0644\u063a\u0631\u0641\u0629", "") +
        '<div class="rvi-row"><span class="rvi-l">\u063a\u0631\u0641\u0629 \u062e\u0627\u0635\u0629</span><span class="rvi-sw' + (r.priv ? " on" : "") + '"></span></div>' +
        '<div class="rvi-gap"></div>' +
        row("\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0639\u0636\u0627\u0621", count(r) + " \u0634\u062e\u0635", "rvi-members") +
        row("\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0639\u0636\u0648", "") +
        '<div class="rvi-row"><span class="rvi-l">\u062f\u0648\u0644\u0629 \u0627\u0644\u063a\u0631\u0641\u0629</span><span class="rvi-v">\ud83c\uddea\ud83c\uddec \u0645\u0635\u0631</span></div>' +
        row("\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062d\u0638\u0631", "") + '</div>');
      var m = $("rvi-members"); if (m) m.onclick = function () { presenceSheet(); };
    });
    var tabs = document.getElementById("room-tabs");
    if (tabs && !tabs.__w) {
      tabs.__w = 1;
      tabs.addEventListener("click", function (e) {
        var b = e.target.closest("[data-rtab]"); if (!b) return;
        UI.roomTab = b.getAttribute("data-rtab");
        var all = tabs.querySelectorAll("[data-rtab]");
        for (var i = 0; i < all.length; i++) all[i].classList.toggle("active", all[i] === b);
        renderRoomChat();
        var bx = $("room-chat"); if (bx) bx.scrollTop = bx.scrollHeight;
      });
    }
    on("room-gift-dock", giftSheet);
    on("room-games-dock", function () { toast("\ud83c\udfae \u0627\u0644\u0623\u0644\u0639\u0627\u0628 \u0642\u0631\u064a\u0628\u0627\u064b"); });
    var tbx = document.querySelector(".room-toolbar");
    on("room-grid-btn", function () { if (tbx) tbx.classList.toggle("show"); });
    if (tbx) tbx.addEventListener("click", function (e) { if (e.target.closest(".room-tool-pill, .dock-ic")) setTimeout(function () { tbx.classList.remove("show"); }, 120); });
    function openInvite() {
      var ids = (S.friends || []).map(function (x) { return x && typeof x === "object" ? x.id || x.uid : x; });
      openSheet("<h3>\ud83d\udc65 \u062f\u0639\u0648\u0629 \u0623\u0635\u062f\u0642\u0627\u0621</h3>" + (ids.length ? ids.map(function (id) { return personRow(id, "\u0627\u0636\u063a\u0637 \u0644\u0644\u062f\u0639\u0648\u0629"); }).join("") : "<div class='empty'>\u0644\u0627 \u064a\u0648\u062c\u062f \u0623\u0635\u062f\u0642\u0627\u0621 \u0628\u0639\u062f</div>"));
      var rows = $("sheet").querySelectorAll("[data-user]");
      for (var i = 0; i < rows.length; i++) rows[i].onclick = function () { inviteFriendToRoom(this.getAttribute("data-user")); closeSheet(); toast("\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062f\u0639\u0648\u0629 \u2705"); };
    }
    on("room-friends-btn", openInvite); on("room-mail-btn", openInvite);
    on("room-cup-btn", openGiftCup); on("room-cup-top", openGiftCup); on("gift-cup-banner", openGiftCup);
    on("gift-cup-back", function () { $("gift-cup-page").classList.remove("open"); });
    on("room-info-top", function () { $("room-info-btn").click(); });
    on("room-chat-btn", function () { var d = $("room-dock-input"); var open = d.style.display === "none"; d.style.display = open ? "flex" : "none"; if (open) $("room-input").focus(); });
    on("room-emoji", function () {
      var E = "\ud83d\ude00\ud83d\ude02\ud83d\ude0d\ud83e\udd70\ud83d\ude0e\ud83e\udd29\ud83d\ude22\ud83d\ude21\ud83d\udc4d\ud83d\udc4f\ud83d\ude4f\ud83d\udd25\ud83d\udc96\ud83c\udf89\ud83c\udf39\ud83d\udc8e\ud83d\udc51\ud83c\udfa7\ud83c\udfa4".match(/./gu) || [];
      openSheet("<h3>\ud83d\ude00 \u0625\u064a\u0645\u0648\u062c\u064a</h3><div class='emojigrid'>" + E.map(function (x) { return "<button type='button' data-e='" + x + "'>" + x + "</button>"; }).join("") + "</div>");
      var b = $("sheet").querySelectorAll("[data-e]");
      for (var i = 0; i < b.length; i++) b[i].onclick = function () { var d = $("room-dock-input"); d.style.display = "flex"; $("room-input").value += this.getAttribute("data-e"); closeSheet(); $("room-input").focus(); };
    });
    on("room-sticker", function () {
      var E = "\ud83c\udfad\ud83e\udd73\ud83d\ude3b\ud83d\ude48\ud83e\udd23\ud83d\ude34\ud83e\udd2f\ud83e\udef6\ud83d\udc83\ud83d\udd7a\ud83d\udc31\ud83e\udd81\ud83d\ude80\ud83c\udf82\ud83c\udf55\u26bd".match(/./gu) || [];
      openSheet("<h3>\ud83c\udfad \u0645\u0644\u0635\u0642\u0627\u062a</h3><div class='emojigrid'>" + E.map(function (x) { return "<button type='button' data-s='" + x + "'>" + x + "</button>"; }).join("") + "</div>");
      var b = $("sheet").querySelectorAll("[data-s]");
      for (var i = 0; i < b.length; i++) b[i].onclick = function () { var r = getRoom(UI.roomId); closeSheet(); pushRoomMsg(r, { uid: S.me.id, from: S.me.id, text: this.getAttribute("data-s"), type: "sticker" }); };
    });
    on("room-chat-img", function () {
      var f = this.files && this.files[0], r = getRoom(UI.roomId); if (!f || !r) return; var inp = this;
      readImageFileAsDataUrl(f, 520, 0.6).then(function (d) { pushRoomMsg(r, { uid: S.me.id, from: S.me.id, text: "\ud83d\udcf7", img: d, type: "image" }); inp.value = ""; }).catch(function () { toast("\u062a\u0639\u0630\u0631 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0635\u0648\u0631\u0629"); });
    }, "change");
    on("room-photo-btn", function () { var r = getRoom(UI.roomId); if (r && isRoomModOrOwner(r, S.me.id)) $("room-photo-input").click(); else toast("\u0644\u0644\u0645\u0634\u0631\u0641\u064a\u0646 \u0641\u0642\u0637"); });
    on("room-photo-input", function () {
      var f = this.files && this.files[0], r = getRoom(UI.roomId); if (!f || !r) return;
      readImageFileAsDataUrl(f, 600, 0.8).then(function (d) { roomRef(r.id).child("roomPhoto").set(d); toast("\u062a\u0645 \u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u063a\u0644\u0627\u0641 \u2705"); });
    }, "change");
    on("room-music", function () {
      var r = getRoom(UI.roomId); if (!r) return;
      var pl = Array.isArray(r.playlist) && r.playlist.length ? r.playlist : DEFAULT_TRACKS;
      openSheet("<h3>\ud83c\udfb5 \u0627\u0644\u0645\u0648\u0633\u064a\u0642\u0649</h3><div class='actlist'>" + pl.map(function (t, i) { return "<button type='button' data-t='" + i + "'>" + esc(t.cover || "\ud83c\udfb5") + " " + esc(t.title) + "</button>"; }).join("") + "<button class='danger' id='mu-stop' type='button'>\u23f9\ufe0f \u0625\u064a\u0642\u0627\u0641</button></div>");
      var b = $("sheet").querySelectorAll("[data-t]");
      for (var i = 0; i < b.length; i++) b[i].onclick = function () {
        if (!canControlRoomMusic(r)) { toast("\u0644\u0644\u0645\u0634\u0631\u0641\u064a\u0646 \u0641\u0642\u0637"); return; }
        var t = pl[Number(this.getAttribute("data-t"))]; closeSheet();
        setRoomMusicRemote(r.id, { url: t.url, title: t.title, artist: t.artist || "", playing: true, positionSec: 0, updatedAt: now() });
      };
      $("mu-stop").onclick = function () { closeSheet(); if (canControlRoomMusic(r)) setRoomMusicRemote(r.id, { url: "", title: "", artist: "", playing: false, positionSec: 0, updatedAt: now() }); };
    });
    on("raise-hand-btn", function () {
      var r = getRoom(UI.roomId); if (!r) return;
      if (!isRoomModOrOwner(r, S.me.id)) { roomRef(r.id).child("handRequests/" + S.me.id).set(true); toast("\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0627\u0644\u0645\u0627\u064a\u0643 \u270b"); return; }
      var hs = r.handRequests || [];
      openSheet("<h3>\u270b \u0637\u0644\u0628\u0627\u062a \u0627\u0644\u0645\u0627\u064a\u0643</h3>" + (hs.length ? hs.map(function (id) { return personRow(id, "\u0627\u0636\u063a\u0637 \u0644\u0644\u0645\u0648\u0627\u0641\u0642\u0629"); }).join("") : "<div class='empty'>\u0644\u0627 \u062a\u0648\u062c\u062f \u0637\u0644\u0628\u0627\u062a</div>"));
      var rows = $("sheet").querySelectorAll("[data-user]");
      for (var i = 0; i < rows.length; i++) rows[i].onclick = async function () {
        var uid2 = this.getAttribute("data-user"), idx = r.seats.findIndex(function (s) { return !s.uid && !s.locked; });
        closeSheet(); if (idx < 0) { toast("\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u0642\u0639\u062f \u0641\u0627\u0636\u064a"); return; }
        await roomRef(r.id).child("seats/" + idx + "/uid").set(uid2); roomRef(r.id).child("handRequests/" + uid2).remove();
      };
    });
    on("room-presence-btn", presenceSheet);
    on("room-speaker-btn", function () { UI.roomSpeakerMuted = !UI.roomSpeakerMuted; applyRoomSpeakerMuteState(); toast(UI.roomSpeakerMuted ? "\u062a\u0645 \u0643\u062a\u0645 \u0627\u0644\u0633\u0645\u0627\u0639\u0629" : "\u062a\u0645 \u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0633\u0645\u0627\u0639\u0629"); });
    on("audio-unlock-btn", function () { resumeAllRemoteAudioTracks(); showAudioUnlockBar(false); });
    var tb = document.querySelector(".room-toolbar");
    if (tb && !$("room-gift-btn")) {
      var b = document.createElement("button");
      b.className = "room-tool-pill"; b.id = "room-gift-btn"; b.type = "button"; b.textContent = "\ud83c\udf81 \u0647\u062f\u064a\u0629";
      b.onclick = giftSheet; tb.insertBefore(b, tb.firstChild);
    }
  }

  global.__RV_SCRIPT_END = true;

})(typeof window !== "undefined" ? window : globalThis);
