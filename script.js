/* REAL VOICE — نسخة كاملة ومطورة (Firebase + Agora + هدايا ثابتة + هدايا حظ + PWA) */
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

  var CONFIG = {
    storageKeyPrefix: "rv_state_v24_",
    guestStorageKey: "rv_guest_state_v24",
    guestSessionIdKey: "rv_guest_uid_v24",
    guestModeKey: "rv_guest_mode_v24",
    onboardDoneKeyPrefix: "rv_onboard_done_v24_",

    maxLevel: 100,
    xpPerLevel: 100,
    initialSpecialIdNumber: 1000001,
    maxSpecialIdNumber: 9999999,
    dmInitialLimit: 25,
    dmPageStep: 20,
    socialPageSize: 15,
    rateLimitWindowMs: 10000,
    rateLimitMaxActions: 18,
    badWords: ["شتيمة", "قذر", "حقير", "غبي", "كلب", "حمار"]
  };

  var VOICE_STATES = {
    DISCONNECTED: "DISCONNECTED",
    CONNECTING: "CONNECTING",
    CONNECTED: "CONNECTED",
    RECONNECTING: "RECONNECTING",
    FAILED: "FAILED"
  };

  var DEFAULT_GIFT_CATEGORIES = [
    { id: "all", name: "الكل" },
    { id: "popular", name: "شائعة" },
    { id: "free", name: "مجانية" },
    { id: "vip", name: "VIP" },
    { id: "events", name: "مناسبات" }
  ];

  var DEFAULT_GIFTS = [
    { id: "free_wave", e: "👋", gifUrl: "", n: "تحية مجانية", p: 0, isFree: true, isEvent: false, active: true, cat: "free", vipMin: 0 },
    { id: "heart", e: "❤️", gifUrl: "", n: "قلب", p: 10, isFree: false, isEvent: false, active: true, cat: "popular", vipMin: 0 },
    { id: "rose", e: "🌹", gifUrl: "", n: "وردة", p: 25, isFree: false, isEvent: false, active: true, cat: "popular", vipMin: 0 },
    { id: "crown", e: "👑", gifUrl: "", n: "تاج", p: 150, isFree: false, isEvent: false, active: true, cat: "popular", vipMin: 0 },
    { id: "car", e: "🏎️", gifUrl: "", n: "سيارة", p: 300, isFree: false, isEvent: false, active: true, cat: "popular", vipMin: 0 },
    { id: "rocket", e: "🚀", gifUrl: "", n: "صاروخ", p: 500, isFree: false, isEvent: true, active: true, cat: "events", vipMin: 1 },
    { id: "diamond", e: "💎", gifUrl: "", n: "ألماس", p: 800, isFree: false, isEvent: false, active: true, cat: "vip", vipMin: 1 },
    { id: "vip", e: "🦁", gifUrl: "", n: "أسد VIP", p: 1500, isFree: false, isEvent: false, active: true, cat: "vip", vipMin: 2 },
    { id: "castle", e: "🏰", gifUrl: "", n: "قصر متحرك", p: 3000, isFree: false, isEvent: true, active: true, cat: "events", vipMin: 3 }
  ];

  var DEFAULT_LUCKY_BOXES = [
    {
      id: "box_normal",
      name: "صندوق الحظ العادي",
      icon: "📦",
      imageUrl: "",
      type: "normal",
      price: 50,
      active: true,
      rewards: [
        { id: "r_n1", title: "25 عملة", rewardType: "coins", value: 25, emoji: "🪙", rarity: "common", probability: 45 },
        { id: "r_n2", title: "100 عملة", rewardType: "coins", value: 100, emoji: "💰", rarity: "rare", probability: 25 },
        { id: "r_n3", title: "هدية وردة ×2", rewardType: "gift", giftId: "rose", value: 2, emoji: "🌹", rarity: "rare", probability: 20 },
        { id: "r_n4", title: "إطار متألق", rewardType: "frame", value: "frame_glow", emoji: "✨", rarity: "epic", probability: 10 }
      ]
    },
    {
      id: "box_special",
      name: "صندوق الحظ المميز",
      icon: "🎁",
      imageUrl: "",
      type: "special",
      price: 150,
      active: true,
      rewards: [
        { id: "r_s1", title: "120 عملة", rewardType: "coins", value: 120, emoji: "🪙", rarity: "common", probability: 40 },
        { id: "r_s2", title: "هدية تاج ×1", rewardType: "gift", giftId: "crown", value: 1, emoji: "👑", rarity: "rare", probability: 30 },
        { id: "r_s3", title: "إطار دخول ملكي", rewardType: "entry_frame", value: "entry_royal", emoji: "🚪", rarity: "epic", probability: 20 },
        { id: "r_s4", title: "عضوية VIP 1 (3 أيام)", rewardType: "vip", value: 1, days: 3, emoji: "🥈", rarity: "legendary", probability: 10 }
      ]
    },
    {
      id: "box_rare",
      name: "صندوق الحظ النادر",
      icon: "💠",
      imageUrl: "",
      type: "rare",
      price: 350,
      active: true,
      rewards: [
        { id: "r_r1", title: "300 عملة", rewardType: "coins", value: 300, emoji: "💰", rarity: "rare", probability: 40 },
        { id: "r_r2", title: "هدية ألماس ×1", rewardType: "gift", giftId: "diamond", value: 1, emoji: "💎", rarity: "epic", probability: 30 },
        { id: "r_r3", title: "شارة النجم النادر", rewardType: "badge", value: "badge_rare_star", emoji: "🌟", rarity: "epic", probability: 20 },
        { id: "r_r4", title: "عضوية VIP 2 (5 أيام)", rewardType: "vip", value: 2, days: 5, emoji: "🥇", rarity: "legendary", probability: 10 }
      ]
    },
    {
      id: "box_legendary",
      name: "الصندوق الأسطوري",
      icon: "👑",
      imageUrl: "",
      type: "legendary",
      price: 800,
      active: true,
      rewards: [
        { id: "r_l1", title: "700 عملة", rewardType: "coins", value: 700, emoji: "🤑", rarity: "rare", probability: 35 },
        { id: "r_l2", title: "هدية قصر متحرك ×1", rewardType: "gift", giftId: "castle", value: 1, emoji: "🏰", rarity: "legendary", probability: 25 },
        { id: "r_l3", title: "شارة الأسطورة", rewardType: "badge", value: "badge_legend", emoji: "🏆", rarity: "legendary", probability: 25 },
        { id: "r_l4", title: "عضوية VIP 3 (7 أيام)", rewardType: "vip", value: 3, days: 7, emoji: "👑", rarity: "mythic", probability: 15 }
      ]
    },
    {
      id: "box_event",
      name: "صندوق المناسبات الخاص",
      icon: "🎉",
      imageUrl: "",
      type: "event",
      price: 200,
      active: true,
      rewards: [
        { id: "r_e1", title: "180 عملة", rewardType: "coins", value: 180, emoji: "🪙", rarity: "common", probability: 45 },
        { id: "r_e2", title: "هدية صاروخ ×1", rewardType: "gift", giftId: "rocket", value: 1, emoji: "🚀", rarity: "rare", probability: 30 },
        { id: "r_e3", title: "ميزة دخول بارز", rewardType: "perk", value: "perk_spotlight", emoji: "⚡", rarity: "epic", probability: 15 },
        { id: "r_e4", title: "عضوية VIP 2 (3 أيام)", rewardType: "vip", value: 2, days: 3, emoji: "🥇", rarity: "legendary", probability: 10 }
      ]
    }
  ];

  var DEFAULT_APP_SETTINGS = {
    appName: "REAL VOICE",
    logoEmoji: "🎙️",
    welcomeText: "سجّل الدخول بحساب Google أو ابدأ كزائر وادخل إلى الغرف الصوتية.",
    maintenanceMode: false,
    maintenanceMessage: "التطبيق قيد الصيانة والتحديث حالياً، سنعود قريباً.",
    giftsEnabled: true,
    luckyGiftsEnabled: true,
    coinsTransferEnabled: true,
    notificationsEnabled: true,
    allowCreateRoom: true
  };

  var RARITY_LABELS = {
    common: "عادي",
    rare: "نادر",
    epic: "ملحمي",
    legendary: "أسطوري",
    mythic: "خرافي"
  };

  var VIP_TIERS = [
    { level: 1, name: "VIP فضي", badge: "🥈 VIP 1", perks: ["شارة VIP 1", "إطار مميز", "هدايا VIP 1+"] },
    { level: 2, name: "VIP ذهبي", badge: "🥇 VIP 2", perks: ["شارة VIP 2", "لون اسم ذهبي", "هدايا VIP 1-2"] },
    { level: 3, name: "VIP ملكي", badge: "👑 VIP 3", perks: ["شارة VIP 3", "دخول ملكي مميز", "جميع هدايا VIP"] }
  ];

  var EMOJIS = ["😀", "😂", "😍", "🔥", "👏", "❤️", "😎", "🎉", "🙏", "😢", "👍", "💎"];
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

  var toastTimer = null;
  function toast(msg) {
    var t = $("toast");
    if (!t) return;
    t.textContent = String(msg || "");
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
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

  function getAppSettings() {
    return Object.assign({}, DEFAULT_APP_SETTINGS, (S && S.appSettings) || {});
  }

  function applyAppBranding() {
    var st = getAppSettings();
    document.querySelectorAll(".app-brand-label").forEach(function (el) {
      el.textContent = st.appName || "REAL VOICE";
    });
    if ($("auth-welcome-sub") && st.welcomeText) {
      $("auth-welcome-sub").textContent = st.welcomeText;
    }
    if (st.appName) document.title = st.appName + " — غرف صوتية ودردشة مباشرة";

    var maintBar = $("maintenance-banner");
    if (maintBar) {
      var isMaint = !!st.maintenanceMode && !(S && S.me && (S.me.isAdmin || S.me.adminRole));
      maintBar.classList.toggle("hidden", !isMaint);
      if (isMaint) maintBar.textContent = "🛠️ " + (st.maintenanceMessage || DEFAULT_APP_SETTINGS.maintenanceMessage);
    }
  }

  function getActiveGifts(includeInactive) {
    var raw = (S && Array.isArray(S.customGifts) && S.customGifts.length) ? S.customGifts : DEFAULT_GIFTS;
    return raw.map(function (g) {
      return Object.assign({
        isFree: Number(g.p || 0) === 0,
        isEvent: g.cat === "events",
        active: true,
        cat: "popular",
        gifUrl: ""
      }, g);
    }).filter(function (g) {
      return includeInactive ? true : g.active !== false;
    });
  }

  function getGiftCategories() {
    if (S && Array.isArray(S.giftCategories) && S.giftCategories.length) return S.giftCategories;
    return DEFAULT_GIFT_CATEGORIES;
  }

  function getActiveLuckyBoxes(includeInactive) {
    var raw = (S && Array.isArray(S.luckyBoxes) && S.luckyBoxes.length) ? S.luckyBoxes : DEFAULT_LUCKY_BOXES;
    return raw.filter(function (b) { return includeInactive ? true : b.active !== false; });
  }

  function giftVisualHTML(g) {
    if (g && g.gifUrl) {
      return '<img src="' + esc(g.gifUrl) + '" alt="' + esc(g.n || "هدية") + '" loading="lazy" />';
    }
    return esc((g && g.e) || "🎁");
  }

  function getGiftMaps() {
    var byId = {}, byEmoji = {};
    getActiveGifts(true).forEach(function (g) {
      byId[g.id] = g;
      if (g.e) byEmoji[g.e] = g;
    });
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
    if (!token || !ECONOMY_API_BASE) return { ok: false, error: "ابدأ التطبيق أولاً" };
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

  function openWalletSheet() {
    var balance = Math.max(0, Number(S && S.me && S.me.coins || 0));
    openSheet("<h3>👛 محفظتي</h3><div class='rv-wallet-sheet'><div class='rv-wallet-coin'>🪙</div><div class='rv-wallet-label'>رصيد " + esc(getAppSettings().appName || "REAL VOICE") + "</div><strong id='wallet-sheet-balance'>" + balance.toLocaleString("en-US") + "</strong><div class='meta'>رصيد العملات الخاص بحسابك</div></div><div class='notice' style='margin-top:12px'>يمكنك استخدام العملات لإرسال الهدايا الثابتة وفتح صناديق الحظ. شحن وتعديل الرصيد يتم عبر السيرفر والإدارة.</div><button class='btn block' id='wallet-history-btn' type='button'>📜 سجل حركات المحفظة</button><div id='wallet-history-list' class='list'></div>");
    if ($("wallet-history-btn")) $("wallet-history-btn").onclick = async function () {
      var box = $("wallet-history-list"); box.innerHTML = '<div class="empty">جاري تحميل السجل…</div>';
      try {
        var snap = await cloud.db.ref("economy/ledger/" + S.me.id).limitToLast(30).once("value"), data = snap.val() || {}, rows = Object.keys(data).map(function (k) { return data[k]; }).sort(function (a, b) { return Number(b.createdAt || 0) - Number(a.createdAt || 0); });
        box.innerHTML = rows.length ? rows.map(function (x) {
          var positive = Number(x.amount || 0) >= 0;
          return '<div class="row glass" style="margin:6px 0"><div class="info"><div class="name">' + esc(x.title || x.reason || "حركة محفظة") + '</div><div class="meta">' + timeStr(x.createdAt) + '</div></div><b style="color:' + (positive ? '#22c55e' : '#f87171') + '">' + (positive ? '+' : '') + Number(x.amount || 0).toLocaleString("en-US") + ' 🪙</b></div>';
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
      } catch (e) {
        toast("تعذر تشغيل نافذة التثبيت، جرّب من قائمة المتصفح");
      }
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
        toast("تم تثبيت REAL VOICE على جوالك بنجاح ✅");
      });
      var btn = $("install-app-btn");
      if (btn) btn.onclick = triggerAutoInstall;

      var updBtn = $("update-app-btn");
      if (updBtn) {
        updBtn.onclick = function () {
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
    if (spkBtn) { spkBtn.classList.toggle("spk-muted", muted); spkBtn.textContent = muted ? "🔇" : "🔊"; }
  }
  async function subscribeAndPlayRemoteUser(user, mediaType) {
    if (!voice.client || !user || (!UI.roomId && !UI.floatingRoomId)) return;
    try {
      await voice.client.subscribe(user, mediaType);
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.setVolume(UI.roomSpeakerMuted ? 0 : 100);
        try { user.audioTrack.play(); showAudioUnlockBar(false); } catch (e) { showAudioUnlockBar(true); }
      }
    } catch (e) { toast("تعذر تشغيل صوت أحد المتحدثين"); }
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
    page: "home", filter: "all", rfilter: "mine", ftab: "friends", pftab: "overview",
    giftTab: "normal", giftCat: "all", giftNote: "",
    query: "", findQ: "", pfSocialQ: "", roomId: null, roomSessionStart: 0, floatingRoomId: null, dmId: null,
    micMuted: false, roomSpeakerMuted: false, musicVolume: 0.7,
    giftSel: "heart", giftQty: 1, giftTarget: "", luckyBoxSel: "box_normal", lastLuckyReward: null,
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
      applyAppBranding();
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
        xp: 0, level: 1, charm: 0, charmLevel: 1, coins: 0, vip: 0, vipExpiresAt: 0,
        verified: false, isAdmin: false, adminRole: "", followersCount: 0, followingCount: 0, friendsCount: 0,
        gifts: 0, receivedGifts: {}, receivedGiftLog: {},
        frames: [], entryFrames: [], badges: [], perks: [], luckyWins: [],
        joined: now()
      },
      users: [], rooms: [],
      customGifts: DEFAULT_GIFTS.slice(),
      giftCategories: DEFAULT_GIFT_CATEGORIES.slice(),
      luckyBoxes: DEFAULT_LUCKY_BOXES.slice(),
      luckyDraws: [],
      appSettings: Object.assign({}, DEFAULT_APP_SETTINGS),
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
    renderFloatingOrb();
    applyThemeMode();
    applyAppBranding();
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
          settings: Object.assign({}, baseEmptyState(userId, isGuestVal).settings, p.settings || {}),
          appSettings: Object.assign({}, DEFAULT_APP_SETTINGS, p.appSettings || {})
        });
        global.S = S;
        applyThemeMode();
        applyAppBranding();
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
    var st = getAppSettings();
    if (st.notificationsEnabled === false) return;
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
      badges: Array.isArray(S.me.badges) ? S.me.badges : [],
      frames: Array.isArray(S.me.frames) ? S.me.frames : [],
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
    applyAppBranding();
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
      cloud.lastInitError = "مكتبة Firebase أو مفتاح apiKey غير متوفر";
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
        if (baseNum >= CONFIG.maxSpecialIdNumber) {
          limitReached = true;
          return baseNum;
        }
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
      } else if (limitReached) {
        toast("تم الوصول إلى الحد الأقصى لأرقام ID المتسلسلة");
      }
      return S.me.specialId || formatSpecialId(CONFIG.initialSpecialIdNumber);
    } catch (e) {
      if (!S.me.specialId || Number(S.me.specialId) < CONFIG.initialSpecialIdNumber) {
        S.me.specialId = formatSpecialId(CONFIG.initialSpecialIdNumber);
      }
      return S.me.specialId;
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
      var w = snap.val();
      var bal = 0;
      if (w && typeof w === "object") {
        bal = Number(w.balance != null ? w.balance : (w.coins != null ? w.coins : 0));
      } else if (w != null) {
        bal = Number(w || 0);
      }
      S.me.coins = Math.max(0, Number.isFinite(bal) ? bal : 0);
      saveLocal();
      renderTop();
      if ($("pf-wallet-coins")) $("pf-wallet-coins").textContent = Number(S.me.coins || 0).toLocaleString("en-US");
      if ($("room-wallet-balance")) $("room-wallet-balance").textContent = Number(S.me.coins || 0).toLocaleString("en-US");
      if ($("wallet-sheet-balance")) $("wallet-sheet-balance").textContent = Number(S.me.coins || 0).toLocaleString("en-US");
      if (UI.page === "profile") renderProfile();
      if (UI.roomId) renderRoom();
    });

    onDb("catalog_gifts", cloud.db.ref("gifts"), "value", function (snap) {
      var gVal = snap.val();
      if (Array.isArray(gVal) && gVal.length) {
        S.customGifts = gVal.filter(Boolean);
      } else if (gVal && typeof gVal === "object") {
        var gArr = Object.keys(gVal).map(function (k) { return Object.assign({ id: k }, gVal[k]); });
        if (gArr.length) S.customGifts = gArr;
      }
      saveLocal();
    });

    onDb("catalog_gift_cats", cloud.db.ref("gift_categories"), "value", function (snap) {
      var cVal = snap.val();
      if (Array.isArray(cVal) && cVal.length) S.giftCategories = cVal.filter(Boolean);
      else if (cVal && typeof cVal === "object") {
        var cArr = Object.keys(cVal).map(function (k) { return Object.assign({ id: k }, cVal[k]); });
        if (cArr.length) S.giftCategories = cArr;
      }
      saveLocal();
    });

    onDb("catalog_lucky_boxes", cloud.db.ref("lucky_boxes"), "value", function (snap) {
      var bVal = snap.val();
      if (Array.isArray(bVal) && bVal.length) {
        S.luckyBoxes = bVal.filter(Boolean);
      } else if (bVal && typeof bVal === "object") {
        var bArr = Object.keys(bVal).map(function (k) { return Object.assign({ id: k }, bVal[k]); });
        if (bArr.length) S.luckyBoxes = bArr;
      }
      saveLocal();
    });

    onDb("app_settings", cloud.db.ref("app_settings"), "value", function (snap) {
      var stVal = snap.val();
      if (stVal && typeof stVal === "object") {
        S.appSettings = Object.assign({}, DEFAULT_APP_SETTINGS, stVal);
        saveLocal();
        applyAppBranding();
      }
    });

    onDb("broadcast_notifs", cloud.db.ref("broadcast_notifications").limitToLast(15), "value", function (snap) {
      var nVal = snap.val() || {};
      Object.keys(nVal).forEach(function (k) {
        var nItem = nVal[k];
        if (!nItem || !nItem.text) return;
        var exists = (S.notifs || []).some(function (x) { return x.id === (nItem.id || k); });
        if (!exists) {
          S.notifs.unshift({
            id: nItem.id || k,
            type: nItem.type || "broadcast",
            text: (nItem.title ? nItem.title + ": " : "") + nItem.text,
            t: Number(nItem.createdAt || now()),
            read: false
          });
        }
      });
      saveLocal();
      renderTop();
    });

    try {
      var pubRef = cloud.db.ref("publicProfiles/" + myId);
      pubRef.child("online").onDisconnect().set(false);
      pubRef.update({ online: true, specialId: S.me.specialId || "" }).catch(function () { /* */ });
      var uRef = cloud.db.ref("users/" + myId);
      uRef.child("online").onDisconnect().set(false);
      uRef.update({ online: true }).catch(function () { /* */ });
    } catch (e) { /* */ }

    onDb("app", cloud.db.ref("publicProfiles"), "value", function (ps) {
      var val = ps.val() || {};
      cloud.usersMap = val;
      S.users = Object.keys(val).filter(function (k) { return k !== S.me.id; }).map(function (k) {
        return Object.assign({ id: k }, val[k]);
      });
      saveLocal();
      scheduleRenderAll();
      if (UI.roomId) renderRoom();
    });

    var myUserBase = cloud.db.ref("users/" + myId);

    onDb("app", myUserBase, "value", function (us) {
      var priv = us.val() || {};
      if (typeof priv.vip === "number") S.me.vip = priv.vip;
      if (typeof priv.vipExpiresAt === "number") S.me.vipExpiresAt = priv.vipExpiresAt;
      if (typeof priv.charm === "number") S.me.charm = Math.max(Number(S.me.charm || 0), priv.charm);
      if (typeof priv.xp === "number") S.me.xp = Math.max(Number(S.me.xp || 0), priv.xp);
      if (typeof priv.isAdmin === "boolean") S.me.isAdmin = priv.isAdmin;
      if (typeof priv.adminRole === "string") S.me.adminRole = priv.adminRole;
      if (typeof priv.verified === "boolean") S.me.verified = priv.verified;
      if (Array.isArray(priv.frames)) S.me.frames = priv.frames;
      if (Array.isArray(priv.entryFrames)) S.me.entryFrames = priv.entryFrames;
      if (Array.isArray(priv.badges)) S.me.badges = priv.badges;
      if (Array.isArray(priv.perks)) S.me.perks = priv.perks;
      if (Array.isArray(priv.luckyWins)) S.me.luckyWins = priv.luckyWins;
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
        if (!cur || cur.locked || (Array.isArray(cur.bans) && cur.bans.indexOf(S.me.id) >= 0) || isBlockedEitherWay(cur.owner)) {
          if (cur && cur.locked && !isRoomModOrOwner(cur, S.me.id)) {
            toast("تم إغلاق الغرفة من الإدارة");
            leaveRoom(true);
          } else if (!cur) {
            leaveRoom(true);
          } else {
            syncMicHardwareState();
            syncRoomMusicPlayer(cur);
            renderRoom();
          }
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
      if (res && res.user) {
        await handleAuthenticatedUser(res.user);
      }
    } catch (e) {
      var code = e && e.code ? e.code : "";
      if (
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user" ||
        code === "auth/operation-not-supported-in-this-environment"
      ) {
        try {
          var providerRedir = new firebase.auth.GoogleAuthProvider();
          providerRedir.setCustomParameters({ prompt: "select_account" });
          await cloud.auth.signInWithRedirect(providerRedir);
          return;
        } catch (redirErr) {
          e = redirErr;
          code = redirErr && redirErr.code ? redirErr.code : code;
        }
      }
      var msg = e && e.message ? e.message : "خطأ غير معروف";
      setAuthError("تعذر تسجيل الدخول بحساب Google (" + (code || "error") + "): " + msg);
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
      var msg = "تعذر الاتصال بحساب Firebase المجهول. تأكد من تفعيل Anonymous في Firebase Authentication.";
      setAuthError(msg); toast(msg);
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
    else { attachRealtimeListeners(S.me.id); save(); }
    scheduleRenderAll(); toast("تم حفظ بياناتك بنجاح ✅");
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
      ups["users/" + otherId + "/followers/" + S.me.id] = null;
      ups["users/" + S.me.id + "/friendRequestsSent/" + otherId] = null;
      ups["users/" + otherId + "/friendRequestsReceived/" + S.me.id] = null;
      ups["users/" + otherId + "/friendRequestsSent/" + S.me.id] = null;
      ups["users/" + otherId + "/friendRequestsReceived/" + S.me.id] = null;
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
      (r.priv ? '<span class="room-sq-priv-pill">🔒 خاصة</span>' : "") +
      (r.locked ? '<span class="room-sq-priv-pill" style="left:7px;right:auto">🔐 مقفلة</span>' : "") + inner + "</div>";
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

  function showFlyGiftToSeat(visual, senderName, targetUid, targetName) {
    var room = getRoom(UI.roomId || UI.floatingRoomId), appEl = $("app");
    if (!appEl) return;
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
    var iconHtml = /^https?:\/\//i.test(String(visual || ""))
      ? '<img src="' + esc(visual) + '" alt="" style="width:44px;height:44px;object-fit:contain;border-radius:8px" />'
      : esc(visual || "🎁");
    proj.innerHTML = iconHtml + "<small>" + esc(senderName) + " ➔ " + esc(targetName) + "</small>";
    appEl.appendChild(proj);
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
        var uidVal = String(ev.fromUid);
        if (!totals[uidVal]) totals[uidVal] = { uid: uidVal, name: ev.fromName || resolveLiveUser(uidVal).name, count: 0, photo: ev.fromPhoto || resolveLiveUser(uidVal).photo || "" };
        totals[uidVal].count += Math.max(1, Number(ev.count || 1));
        if (ev.fromName) totals[uidVal].name = ev.fromName;
      });
    });
    return Object.keys(totals).map(function (k) { var u = resolveLiveUser(k); totals[k].name = u.name || totals[k].name; totals[k].photo = u.photo || totals[k].photo; return totals[k]; }).sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name); });
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
    var html = "<div class='cup-hero'><div class='cup-hero-icon'>🏆</div><div class='cup-hero-title'>أبطال غرف " + esc(getAppSettings().appName || "REAL VOICE") + "</div><div class='cup-hero-sub'>ترتيب مرسلي الهدايا داخل الغرف حسب عدد الهدايا المسجلة</div></div>";
    if (!ranks.length) { page.innerHTML = html + "<div class='empty'>لسه مفيش هدايا مسجلة في كأس الغرف. أول ما تتسجل هدايا حقيقية هتظهر هنا تلقائيًا.</div>"; return; }
    var podium = [1, 0, 2].filter(function (i) { return !!ranks[i]; }).map(function (i) {
      var u = ranks[i], medal = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉", cls = i === 0 ? "first" : "";
      return "<div class='cup-podium-card " + cls + "'><div class='cup-podium-medal'>" + medal + "</div><div class='cup-podium-avatar'>" + avatarHTML(u, "sm") + "</div><div class='cup-podium-name'>" + esc(u.name) + "</div><div class='cup-podium-count'>" + u.count + " هدية</div><button class='btn sm ghost' style='margin-top:7px' data-cup-profile='" + esc(u.uid) + "' type='button'>الملف</button></div>";
    }).join("");
    html += "<div class='cup-podium'>" + podium + "</div><div class='cup-list-title'>📊 ترتيب المرسلين</div>";
    html += ranks.slice(0, 100).map(function (u, i) { var medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1); return "<div class='cup-rank-row'><div class='cup-rank-number'>" + medal + "</div>" + avatarHTML(u, "sm") + "<div class='info'><div class='name'>" + esc(u.name) + "</div><div class='meta'>" + u.count + " هدية مرسلة</div></div><button class='btn sm ghost' data-cup-profile='" + esc(u.uid) + "' type='button'>الملف</button></div>"; }).join("");
    page.innerHTML = html;
    page.querySelectorAll("[data-cup-profile]").forEach(function (b) { b.onclick = function () { openUserProfileSheet(b.getAttribute("data-cup-profile")); }; });
  }
  function openGiftCupSheet() {
    var page = $("gift-cup-page"); if (!page) return;
    renderGiftCupPage(); page.classList.add("open"); page.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeGiftCupPage() {
    var page = $("gift-cup-page"); if (!page) return;
    page.classList.remove("open"); page.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
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
          Object.keys(fresh).forEach(function (k) { if (previous[k]) return; var ev = fresh[k]; if (!ev || (!ev.emoji && !ev.gifUrl) || Number(ev.createdAt || 0) < now() - 30000) return; showFlyGiftToSeat(ev.gifUrl || ev.emoji, ev.fromName || "مستخدم", ev.toUid || "", ev.toName || "مستخدم"); });
        }
        renderGiftCupBanner();
        if ($("gift-cup-page") && $("gift-cup-page").classList.contains("open")) renderGiftCupPage();
      });
    });
    Object.keys(giftRankListeners).forEach(function (rid) { if (ids.indexOf(rid) < 0) { offDb("gift_rank_" + rid); delete giftRankListeners[rid]; delete giftRankEvents[rid]; } });
  }

  function renderHomeBanners() {
    renderGiftCupBanner();
    var slot = $("home-banners-slot");
    if (!slot) return;
    if (!S || !Array.isArray(S.banners) || !S.banners.length) {
      slot.innerHTML = '<div class="banners-placeholder">🖼️ مكان البنرات — سيتم إضافتها لاحقاً</div>';
      return;
    }
    slot.innerHTML = S.banners.map(function (url, i) { return '<img src="' + esc(url) + '" alt="Banner ' + (i + 1) + '" loading="lazy" />'; }).join("");
  }

  function go(page) {
    closeSheet(); UI.page = page;
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
      else { pill.textContent = "حساب مجهول"; pill.classList.remove("guest"); }
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
    $("rooms-list").innerHTML = list.length ? list.map(roomCard).join("") : '<div class="empty" style="grid-column:1/-1">لا توجد غرف — اضغط (+) لإنشاء غرفة</div>';
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
      if (!uniqueMap[canonicalKey]) uniqueMap[canonicalKey] = { id: canonicalKey, e: giftDef ? giftDef.e : "🎁", gifUrl: giftDef ? giftDef.gifUrl : "", n: giftDef ? giftDef.n : String(key), qty: 0 };
      uniqueMap[canonicalKey].qty += qty;
      totalCount += qty;
    });
    if (badge) badge.textContent = totalCount + " هدية";
    var items = Object.keys(uniqueMap).map(function (k) { return uniqueMap[k]; });
    var senderBox = $("pf-gift-senders");
    if (senderBox) {
      var logs = m && m.receivedGiftLog && typeof m.receivedGiftLog === "object" ? Object.keys(m.receivedGiftLog).map(function (k) { return m.receivedGiftLog[k]; }).filter(Boolean).sort(function (a, b) { return Number(b.createdAt || 0) - Number(a.createdAt || 0); }) : [];
      senderBox.innerHTML = logs.length ? logs.slice(0, 30).map(function (ev) { var donor = resolveLiveUser(ev.fromUid || ""); var giftEmoji = ev.emoji || "🎁"; return '<div class="row glass" style="margin-bottom:7px">' + avatarHTML({ id: ev.fromUid, name: ev.fromName, photo: ev.fromPhoto || donor.photo }, "sm") + '<div class="info"><div class="name">' + esc(ev.fromName || donor.name || "مستخدم") + '</div><div class="meta">أرسل ' + esc(giftEmoji) + ' ' + esc(ev.giftName || "هدية") + (ev.note ? ' — "' + esc(ev.note) + '"' : '') + '</div></div><span class="tag">' + timeStr(ev.createdAt) + '</span></div>'; }).join("") : '<div class="empty">لم تصلك هدايا بعد 💌</div>';
    }
    if (!items.length) { grid.innerHTML = '<div class="gift-showcase-empty">لم تصلك هدايا بعد 🎁</div>'; return; }
    grid.innerHTML = items.map(function (it) {
      return '<div class="gift-showcase-item"><span class="gift-showcase-qty">x' + it.qty + '</span><span class="gift-showcase-emoji">' + giftVisualHTML(it) + '</span><div class="gift-showcase-name">' + esc(it.n) + "</div></div>";
    }).join("");
  }

  function openLuckyHistorySheet() {
    var wins = Array.isArray(S && S.me && S.me.luckyWins) ? S.me.luckyWins : [];
    openSheet(
      "<h3>🎰 سجل جوائز الحظ (" + wins.length + ")</h3>" +
      (wins.length ? '<div class="list">' + wins.slice().reverse().slice(0, 30).map(function (w) {
        return '<div class="row glass"><div style="font-size:24px">' + esc(w.emoji || "🎁") + '</div><div class="info"><div class="name">' + esc(w.title || "جائزة") + ' <span class="tag vip">' + esc(RARITY_LABELS[w.rarity] || w.rarity || "مميز") + '</span></div><div class="meta">من: ' + esc(w.boxName || "صندوق حظ") + ' • ' + timeStr(w.t) + '</div></div></div>';
      }).join("") + "</div>" : '<div class="empty">لم تفتح صناديق حظ بعد أو لم تُسجل جوائز بعد</div>')
    );
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
    if ($("pf-lucky-wins-count")) $("pf-lucky-wins-count").textContent = String((m.luckyWins || []).length);
    updateProfileRelationshipCounts();
    if ($("pf-wallet-coins")) $("pf-wallet-coins").textContent = Number(S.me.coins || 0).toLocaleString("en-US");

    var perksBox = $("pf-perks-tags");
    if (perksBox) {
      var tags = [];
      (m.badges || []).forEach(function (b) { tags.push('<span class="tag vip">🏅 ' + esc(b) + '</span>'); });
      (m.frames || []).forEach(function (fr) { tags.push('<span class="tag rel">🖼️ ' + esc(fr) + '</span>'); });
      (m.entryFrames || []).forEach(function (ef) { tags.push('<span class="tag event">🚪 ' + esc(ef) + '</span>'); });
      (m.perks || []).forEach(function (pk) { tags.push('<span class="tag free">⚡ ' + esc(pk) + '</span>'); });
      perksBox.innerHTML = tags.join("");
    }

    document.querySelectorAll("#profile-subtabs .tab").forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-pftab") === UI.pftab); });
    var ovBox = $("pf-tab-overview"), socBox = $("pf-tab-social");
    if (ovBox) ovBox.classList.toggle("hidden", UI.pftab !== "overview");
    if (socBox) socBox.classList.toggle("hidden", UI.pftab === "overview");

    if (UI.pftab === "overview") {
      var admBtn = $("pf-admin-btn");
      if (admBtn) admBtn.classList.toggle("hidden", !(S.me.isAdmin || S.me.adminRole));
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
    openSheet("<h3>👑 عضويات VIP</h3><div class='meta'>مستواك الحالي VIP " + curVip + " — يمكن الحصول على VIP من الإدارة أو عبر صناديق الحظ.</div><div class='list'>" + rows + "</div>");
  }

  function openAdminPanelSheet() {
    if (!S.me.isAdmin && !S.me.adminRole) { toast("هذه اللوحة متاحة للمشرفين المعتمدين فقط"); return; }
    var onlineUsersCount = 1 + (S.users || []).filter(function (u) { return u.online; }).length;
    var openReports = (S.reports || []).filter(function (r) { return r.status !== "closed"; }).length;
    openSheet(
      "<h3>🛡️ لوحة الإدارة السريعة</h3>" +
      "<div class='stats-grid'><div class='stat-box'><b>" + S.rooms.length + "</b><span>الغرف</span></div><div class='stat-box'><b>" + onlineUsersCount + "</b><span>المتصلون</span></div><div class='stat-box'><b>" + openReports + "</b><span>البلاغات</span></div></div>" +
      "<div class='actlist'>" +
        "<button id='adm-open-full-panel' type='button'>🎛️ فتح لوحة التحكم الكاملة (admin.html)</button>" +
        "<button id='adm-open-banners' type='button'>🖼️ إدارة البنرات</button>" +
        "<button id='adm-open-reports' type='button'>🚨 مراجعة البلاغات (" + openReports + ")</button>" +
        "<button id='adm-open-users' type='button'>👥 إدارة الأعضاء والصلاحيات</button>" +
      "</div>"
    );
    $("adm-open-full-panel").onclick = function () { window.open("./admin.html", "_blank"); };
    $("adm-open-banners").onclick = function () {
      openSheet("<h3>🖼️ إدارة البنرات</h3><label>روابط صور البنرات (رابط في كل سطر)</label><textarea id='adm-banners-txt' rows='4'>" + esc((S.banners || []).join("\n")) + "</textarea><button class='btn block' id='adm-save-banners' type='button'>حفظ البنرات</button>");
      $("adm-save-banners").onclick = function () {
        var urls = ($("adm-banners-txt").value || "").split(/\r?\n/).map(function (s) { return s.trim(); }).filter(function (s) { return /^https?:\/\//i.test(s); });
        S.banners = urls;
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("banners").set(urls).catch(function () { /* */ });
        saveLocal(); renderHomeBanners(); closeSheet(); toast("تم تحديث البنرات ✅");
      };
    };
    $("adm-open-reports").onclick = function () {
      var list = S.reports || [];
      openSheet("<h3>🚨 البلاغات (" + list.length + ")</h3>" + (list.length ? list.map(function (r) {
        return '<div class="row glass"><div class="info"><div class="name">' + esc(r.targetName) + ' <span class="tag">' + esc(r.status) + '</span></div><div class="meta">السبب: ' + esc(r.reason) + ' • المبلغ: ' + esc(r.reporterName) + '</div></div></div>';
      }).join("") : '<div class="empty">لا توجد بلاغات حالياً</div>'));
    };
    $("adm-open-users").onclick = function () {
      var allU = [S.me].concat(S.users || []).slice(0, 25);
      openSheet("<h3>👥 الأعضاء</h3>" + allU.map(function (u) {
        var live = resolveLiveUser(u.id);
        return '<div class="row glass">' + avatarHTML(live, "sm") + '<div class="info"><div class="name">' + esc(live.name) + '</div><div class="meta">ID: ' + esc(displayUserId(live)) + ' • VIP ' + getEffectiveVip(live) + '</div></div></div>';
      }).join(""));
    };
  }

  function openUserProfileSheet(targetId) {
    if (!targetId) return;
    if (targetId === S.me.id) { go("profile"); return; }
    if (isBlockedByUser(targetId)) { toast("هذا الحساب غير متاح"); return; }
    var u = resolveLiveUser(targetId);
    if (!u.exists && !cloud.usersMap[targetId]) { toast("تعذر العثور على هذا الحساب"); return; }
    var vipLv = getEffectiveVip(u), rel = getRelationshipStatus(targetId), curRoom = findUserCurrentRoom(targetId);
    var followBtnHtml = '<button class="btn sm ghost" id="sheet-follow-btn" type="button">' + (rel.following ? "إلغاء المتابعة" : "+ متابعة") + "</button>";
    var friendBtnHtml = "";
    if (rel.state === "friends") friendBtnHtml = '<button class="btn sm" id="sheet-dm-btn" type="button">💬 مراسلة</button><button class="btn sm red" id="sheet-remove-friend-btn" type="button">إزالة الصديق</button>';
    else if (rel.state === "request_sent") friendBtnHtml = '<button class="btn sm ghost" id="sheet-cancel-freq-btn" type="button">طلب مرسل (إلغاء)</button>';
    else if (rel.state === "request_received") friendBtnHtml = '<button class="btn sm ok" id="sheet-accept-freq-btn" type="button">قبول الصداقة</button><button class="btn sm ghost" id="sheet-reject-freq-btn" type="button">رفض</button>';
    else if (rel.state !== "blocked_by_me") friendBtnHtml = '<button class="btn sm" id="sheet-add-friend-btn" type="button">+ إضافة صديق</button>';

    var blockBtnHtml = rel.state === "blocked_by_me"
      ? '<button class="btn sm ok" id="sheet-unblock-btn" type="button">🔓 إلغاء الحظر</button>'
      : '<button class="btn sm red" id="sheet-block-btn" type="button">🚫 حظر</button>';

    openSheet(
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">' + avatarHTML(u, "lg") +
        '<div style="flex:1;min-width:0"><div class="' + (vipLv >= 2 ? "name vip-gold" : "name") + '" style="font-size:17px;font-weight:800">' + esc(u.name) + (vipLv > 0 ? ' <span class="tag vip">VIP ' + vipLv + "</span>" : "") + (u.verified ? ' <span class="tag verified">✓</span>' : "") + "</div>" +
          '<div class="meta">ID: ' + esc(displayUserId(u)) + " • " + (u.online ? "متصل الآن" : "غير متصل") + "</div>" +
          '<div class="meta">الحالة: <b>' + esc(rel.label) + "</b>" + (curRoom ? " • في غرفة: <b>" + esc(curRoom.name) + "</b>" : "") + "</div></div></div>" +
      '<div class="stats-grid" style="margin-bottom:10px"><div class="stat-box"><b>' + Number(u.followersCount || 0) + '</b><span>المتابعون</span></div><div class="stat-box"><b>' + Number(u.followingCount || 0) + '</b><span>أتابع</span></div><div class="stat-box"><b>' + Number(u.friendsCount || 0) + '</b><span>الأصدقاء</span></div></div>' +
      '<div class="pf-bio-box" style="margin-bottom:12px">' + esc(u.bio || "مرحباً بك في REAL VOICE") + "</div>" +
      '<div style="display:flex;gap:7px;flex-wrap:wrap">' + followBtnHtml + friendBtnHtml + blockBtnHtml +
        (curRoom ? '<button class="btn sm ok" id="sheet-join-room-btn" type="button">🎙️ دخول الغرفة</button>' : "") +
        '<button class="btn sm ghost" id="sheet-report-btn" type="button">🚨 إبلاغ</button></div>'
    );

    if ($("sheet-follow-btn")) $("sheet-follow-btn").onclick = async function () { this.disabled = true; await toggleFollowUser(targetId); openUserProfileSheet(targetId); };
    if ($("sheet-add-friend-btn")) $("sheet-add-friend-btn").onclick = async function () { this.disabled = true; await sendFriendRequest(targetId); openUserProfileSheet(targetId); };
    if ($("sheet-cancel-freq-btn")) $("sheet-cancel-freq-btn").onclick = async function () { this.disabled = true; await cancelFriendRequest(targetId); openUserProfileSheet(targetId); };
    if ($("sheet-accept-freq-btn")) $("sheet-accept-freq-btn").onclick = async function () { this.disabled = true; await acceptFriendRequest(targetId); openUserProfileSheet(targetId); };
    if ($("sheet-reject-freq-btn")) $("sheet-reject-freq-btn").onclick = async function () { this.disabled = true; await rejectFriendRequest(targetId); openUserProfileSheet(targetId); };
    if ($("sheet-remove-friend-btn")) $("sheet-remove-friend-btn").onclick = async function () { this.disabled = true; await removeFriend(targetId); openUserProfileSheet(targetId); };
    if ($("sheet-dm-btn")) $("sheet-dm-btn").onclick = function () { closeSheet(); openDM(targetId); };
    if ($("sheet-block-btn")) $("sheet-block-btn").onclick = function () { confirmBlockUserSheet(targetId, function () { openUserProfileSheet(targetId); }); };
    if ($("sheet-unblock-btn")) $("sheet-unblock-btn").onclick = function () { confirmUnblockUserSheet(targetId, function () { openUserProfileSheet(targetId); }); };
    if ($("sheet-join-room-btn") && curRoom) $("sheet-join-room-btn").onclick = function () { closeSheet(); enterRoom(curRoom.id); };
    if ($("sheet-report-btn")) $("sheet-report-btn").onclick = function () {
      openSheet("<h3>🚨 إبلاغ عن " + esc(u.name) + "</h3><label>سبب البلاغ</label><select id='rep-reason'><option value='إساءة أو ألفاظ غير لائقة'>إساءة أو ألفاظ غير لائقة</option><option value='إزعاج في الغرفة الصوتية'>إزعاج في الغرفة الصوتية</option><option value='انتحال شخصية أو احتيال'>انتحال شخصية أو احتيال</option><option value='محتوى مخالف'>محتوى مخالف</option></select><button class='btn red block' id='rep-send-btn' type='button'>إرسال البلاغ</button>");
      $("rep-send-btn").onclick = function () { submitUserReport(targetId, $("rep-reason").value); closeSheet(); };
    };
  }

  function openSettingsSheet() {
    var st = S.settings || {};
    var m = resolveLiveUser(S.me.id);
    openSheet(
      "<h3>⚙️ الإعدادات والملف الشخصي</h3>" +
      "<label>الاسم</label><input id='set-name' maxlength='24' value='" + esc(m.name || "") + "' />" +
      "<label>النبذة التعريفية</label><textarea id='set-bio' rows='2' maxlength='140'>" + esc(m.bio || "") + "</textarea>" +
      "<div style='display:flex;gap:8px;margin-top:8px'><div style='flex:1'><label>العمر</label><input id='set-age' type='number' min='10' max='99' value='" + esc(m.age || "") + "' /></div>" +
      "<div style='flex:1'><label>النوع</label><select id='set-gender'><option value='ذكر'" + (m.gender === "ذكر" ? " selected" : "") + ">ذكر</option><option value='أنثى'" + (m.gender === "أنثى" ? " selected" : "") + ">أنثى</option></select></div></div>" +
      "<div style='display:flex;gap:8px;margin-top:10px'><label class='btn sm ghost' for='set-avatar-file' style='flex:1;text-align:center;margin:0;cursor:pointer'>🖼️ تغيير الصورة الشخصية</label><label class='btn sm ghost' for='set-cover-file' style='flex:1;text-align:center;margin:0;cursor:pointer'>🌄 تغيير صورة الغلاف</label></div>" +
      "<input id='set-avatar-file' type='file' accept='image/*' class='hidden' /><input id='set-cover-file' type='file' accept='image/*' class='hidden' />" +
      "<div class='switchrow'><span>الوضع النهاري</span><input type='checkbox' id='set-light'" + (st.lightTheme ? " checked" : "") + " /></div>" +
      "<div class='switchrow'><span>إشعارات التطبيق</span><input type='checkbox' id='set-notif'" + (st.notif !== false ? " checked" : "") + " /></div>" +
      "<div class='switchrow'><span>أصوات التنبيه</span><input type='checkbox' id='set-sound'" + (st.sound !== false ? " checked" : "") + " /></div>" +
      "<div class='switchrow'><span>إخفاء حسابي من البحث</span><input type='checkbox' id='set-hide'" + (st.hideFromSearch ? " checked" : "") + " /></div>" +
      "<button class='btn block' id='set-save' type='button'>حفظ التغييرات ✅</button>" +
      "<button class='btn ghost block' id='set-install' type='button'>📲 تثبيت التطبيق على الجهاز</button>" +
      "<button class='btn red block' id='set-logout' type='button'>تسجيل الخروج</button>"
    );

    $("set-avatar-file").onchange = async function () {
      if (!this.files || !this.files[0]) return;
      try { S.me.photo = await readImageFileAsDataUrl(this.files[0], 180, 0.55); save(); renderAll(); toast("تم تحديث الصورة الشخصية ✅"); }
      catch (err) { toast(err.message || "تعذر رفع الصورة"); }
    };
    $("set-cover-file").onchange = async function () {
      if (!this.files || !this.files[0]) return;
      try { S.me.coverPhoto = await readImageFileAsDataUrl(this.files[0], 420, 0.55); save(); renderAll(); toast("تم تحديث صورة الغلاف ✅"); }
      catch (err) { toast(err.message || "تعذر رفع الغلاف"); }
    };
    $("set-save").onclick = function () {
      var nm = clean($("set-name").value || "").trim();
      if (!nm) { toast("الاسم مطلوب"); return; }
      S.me.name = nm; S.me.bio = clean($("set-bio").value || "").trim();
      S.me.age = ($("set-age").value || "").trim(); S.me.gender = $("set-gender").value || "ذكر";
      S.settings.lightTheme = !!$("set-light").checked; S.settings.notif = !!$("set-notif").checked;
      S.settings.sound = !!$("set-sound").checked; S.settings.hideFromSearch = !!$("set-hide").checked;
      applyThemeMode(); save(); renderAll(); closeSheet(); toast("تم حفظ الإعدادات ✅");
    };
    $("set-install").onclick = function () { closeSheet(); triggerAutoInstall(); };
    $("set-logout").onclick = signOutApp;
  }

  function openNotifsSheet() {
    (S.notifs || []).forEach(function (n) { n.read = true; });
    saveLocal(); renderTop();
    var list = S.notifs || [];
    openSheet("<h3>🔔 الإشعارات</h3>" + (list.length ? list.slice(0, 30).map(function (n) {
      return '<div class="row glass"><div class="info"><div class="name">' + esc(n.text) + '</div><div class="meta">' + timeStr(n.t) + "</div></div></div>";
    }).join("") : '<div class="empty">لا توجد إشعارات حالياً</div>'));
  }

  function openCreateRoomSheet() {
    var appSt = getAppSettings();
    if (appSt.allowCreateRoom === false && !(S.me.isAdmin || S.me.adminRole)) {
      toast("إنشاء الغرف متوقف مؤقتاً من إدارة التطبيق");
      return;
    }
    var pickedPhoto = "";
    openSheet(
      "<h3>🎙️ إنشاء غرفة صوتية جديدة</h3>" +
      "<label>اسم الغرفة</label><input id='cr-name' maxlength='30' placeholder='مثال: سهرة شباب' />" +
      "<label>التصنيف</label><select id='cr-cat'><option value='chat'>دردشة</option><option value='games'>ألعاب</option><option value='vip'>VIP</option><option value='music'>موسيقى</option><option value='friends'>أصدقاء</option></select>" +
      "<label>عدد المقاعد</label><select id='cr-seats'><option value='6'>6 مقاعد</option><option value='9' selected>9 مقاعد</option><option value='12'>12 مقعد</option></select>" +
      "<label>صورة الغرفة (اختياري)</label><input id='cr-photo' type='file' accept='image/*' />" +
      "<div class='switchrow'><span>غرفة خاصة (بكلمة مرور)</span><input type='checkbox' id='cr-priv' /></div>" +
      "<div id='cr-pass-wrap' class='hidden'><label>كلمة المرور</label><input id='cr-pass' placeholder='أدخل كلمة مرور الغرفة' /></div>" +
      "<button class='btn block' id='cr-submit' type='button'>إنشاء ودخول الغرفة ✅</button>"
    );
    $("cr-priv").onchange = function () { $("cr-pass-wrap").classList.toggle("hidden", !this.checked); };
    $("cr-photo").onchange = async function () {
      if (!this.files || !this.files[0]) return;
      try { pickedPhoto = await readImageFileAsDataUrl(this.files[0], 260, 0.55); toast("تم اختيار صورة الغرفة"); }
      catch (err) { toast(err.message || "تعذر قراءة الصورة"); }
    };
    $("cr-submit").onclick = async function () {
      var name = clean($("cr-name").value || "").trim();
      if (!name) { toast("اكتب اسم الغرفة أولاً"); return; }
      var seatCount = Number($("cr-seats").value || 9), priv = !!$("cr-priv").checked, passcode = ($("cr-pass") && $("cr-pass").value) || "";
      if (priv && !passcode.trim()) { toast("اكتب كلمة مرور للغرفة الخاصة"); return; }
      var rid = "r_" + now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
      var seats = makeSeats(seatCount);
      var roomObj = {
        id: rid, name: name, desc: "", cat: $("cr-cat").value || "chat", seatCount: seatCount,
        owner: S.me.id, mods: [], seats: seats, listeners: [], handRequests: [], micApprovalMode: false,
        bans: [], priv: priv, passcode: passcode, locked: false, pinned: "", created: now(),
        color: Math.floor(Math.random() * COVERS.length), icon: Math.floor(Math.random() * COVER_ICONS.length),
        roomPhoto: pickedPhoto, music: null, playlist: DEFAULT_TRACKS.slice()
      };
      S.rooms.unshift(normalizeRoom(rid, roomObj));
      if (cloud.on && cloud.db && !UI.isGuest) {
        try { await cloud.db.ref("rooms/" + rid).set(roomObj); } catch (e) { /* */ }
      }
      saveLocal(); closeSheet(); enterRoom(rid);
    };
  }

  function renderFloatingOrb() {
    var orb = $("floating-room-orb");
    if (!orb) return;
    if (!UI.floatingRoomId || UI.roomId === UI.floatingRoomId) { orb.classList.add("hidden"); return; }
    var r = getRoom(UI.floatingRoomId);
    if (!r) { UI.floatingRoomId = null; orb.classList.add("hidden"); return; }
    orb.classList.remove("hidden");
    var av = $("floating-orb-avatar"), lbl = $("floating-orb-label");
    if (av) {
      if (r.roomPhoto) av.innerHTML = '<img src="' + esc(r.roomPhoto) + '" alt="" />';
      else av.textContent = COVER_ICONS[(r.icon || 0) % COVER_ICONS.length];
    }
    if (lbl) lbl.textContent = r.name + " (" + count(r) + ")";
  }

  function minimizeRoomToFloatingOrb() {
    if (!UI.roomId) return;
    var rid = UI.roomId;
    UI.floatingRoomId = rid; UI.roomId = null;
    if ($("room-view")) $("room-view").classList.remove("open");
    renderFloatingOrb(); renderAll();
    toast("الغرفة مستمرة في الخلفية 🎧");
  }

  async function enterRoom(roomId, bypassPasscode) {
    var r = getRoom(roomId);
    if (!r && cloud.on && cloud.db && !UI.isGuest) {
      try {
        var snap = await cloud.db.ref("rooms/" + roomId).once("value");
        if (snap.exists()) { r = normalizeRoom(roomId, snap.val()); S.rooms.push(r); }
      } catch (e) { /* */ }
    }
    if (!r) { toast("الغرفة غير موجودة"); return; }
    if (isBlockedEitherWay(r.owner)) { toast("لا يمكنك دخول هذه الغرفة"); return; }
    if (Array.isArray(r.bans) && r.bans.indexOf(S.me.id) >= 0) { toast("أنت محظور من دخول هذه الغرفة"); return; }
    if (r.locked && !isRoomModOrOwner(r, S.me.id)) { toast("الغرفة مغلقة حالياً"); return; }
    if (r.priv && !bypassPasscode && r.owner !== S.me.id && !isRoomModOrOwner(r, S.me.id) && !inRoom(r, S.me.id)) {
      openSheet("<h3>🔒 غرفة خاصة</h3><label>أدخل كلمة المرور</label><input id='rp-input' type='password' placeholder='كلمة المرور' /><button class='btn block' id='rp-go' type='button'>دخول الغرفة</button>");
      $("rp-go").onclick = function () {
        if (($("rp-input").value || "") === String(r.passcode || "")) { closeSheet(); enterRoom(roomId, true); }
        else toast("كلمة المرور غير صحيحة");
      };
      return;
    }

    if (UI.floatingRoomId && UI.floatingRoomId !== roomId) await leaveRoom(true, UI.floatingRoomId);
    UI.floatingRoomId = null; UI.roomId = roomId; UI.roomSessionStart = now(); UI.micMuted = false;

    if (!inRoom(r, S.me.id)) {
      if (!Array.isArray(r.listeners)) r.listeners = [];
      if (r.listeners.indexOf(S.me.id) < 0) r.listeners.push(S.me.id);
      if (cloud.on && cloud.db && !UI.isGuest) {
        cloud.db.ref("rooms/" + roomId + "/listeners").set(r.listeners).catch(function () { /* */ });
        pushRoomMsg(r, { sys: true, text: "انضم " + (S.me.name || "مستخدم") + " إلى الغرفة" });
      }
      showEntryBanner(resolveLiveUser(S.me.id));
    }

    renderFloatingOrb();
    if ($("room-view")) $("room-view").classList.add("open");
    renderRoom(); syncRoomMusicPlayer(r); applyRoomSpeakerMuteState();
    joinVoiceChannel(roomId, "publisher");
  }

  async function leaveRoom(silent, specificRoomId) {
    var rid = specificRoomId || UI.roomId || UI.floatingRoomId;
    var r = getRoom(rid);
    var isViewingThisRoom = UI.roomId === rid;

    if (isViewingThisRoom) {
      if (UI.roomSessionStart && S && S.me) {
        var mins = Math.max(1, Math.floor((now() - UI.roomSessionStart) / 60000));
        S.me.xp = Number(S.me.xp || 0) + mins * 2;
        S.me.level = computeLevelFromXp(S.me.xp);
      }
      UI.roomId = null; UI.roomSessionStart = 0;
      if ($("room-view")) $("room-view").classList.remove("open");
    }
    if (UI.floatingRoomId === rid) UI.floatingRoomId = null;
    renderFloatingOrb();

    if (r && S && S.me && S.me.id) {
      var changed = false;
      (r.seats || []).forEach(function (s) { if (s && s.uid === S.me.id) { s.uid = null; s.muted = false; changed = true; } });
      if (Array.isArray(r.listeners)) {
        var idx = r.listeners.indexOf(S.me.id);
        if (idx >= 0) { r.listeners.splice(idx, 1); changed = true; }
      }
      if (Array.isArray(r.handRequests)) {
        var hIdx = r.handRequests.indexOf(S.me.id);
        if (hIdx >= 0) { r.handRequests.splice(hIdx, 1); changed = true; }
      }
      if (changed && cloud.on && cloud.db && !UI.isGuest) {
        cloud.db.ref("rooms/" + rid).update({ seats: r.seats, listeners: r.listeners, handRequests: r.handRequests }).catch(function () { /* */ });
        if (!silent) pushRoomMsg(r, { sys: true, text: "غادر " + (S.me.name || "مستخدم") + " الغرفة" });
      }
    }

    if (!UI.roomId && !UI.floatingRoomId) await leaveVoiceChannel(false);
    save(); renderAll();
  }

  function renderRoom() {
    var r = getRoom(UI.roomId);
    if (!r) return;
    $("room-title").textContent = r.name;
    $("room-right-id").textContent = "ID: " + displayUserId(resolveLiveUser(r.owner || r.id));
    $("room-online-count").textContent = String(count(r));
    if ($("room-wallet-balance")) $("room-wallet-balance").textContent = Number(S.me.coins || 0).toLocaleString("en-US");

    var thumb = $("room-top-thumb-inner");
    if (thumb) {
      if (r.roomPhoto) thumb.innerHTML = '<img src="' + esc(r.roomPhoto) + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:12px" />';
      else thumb.textContent = COVER_ICONS[(r.icon || 0) % COVER_ICONS.length];
    }

    var pinBar = $("room-pinned-banner");
    if (pinBar) { pinBar.classList.toggle("hidden", !r.pinned); if (r.pinned) $("room-pinned-text").textContent = r.pinned; }

    var mySeatIdx = seatIndexOf(r, S.me.id), canMod = isRoomModOrOwner(r, S.me.id);
    var raiseBtn = $("raise-hand-btn"), micBtn = $("mic-btn"), raiseBadge = $("raise-badge");
    var handReqs = Array.isArray(r.handRequests) ? r.handRequests : [];
    if (raiseBadge) { raiseBadge.textContent = String(handReqs.length); raiseBadge.classList.toggle("hidden", !canMod || handReqs.length === 0); }

    if (mySeatIdx >= 0) {
      if (raiseBtn) raiseBtn.classList.add("hidden");
      if (micBtn) {
        micBtn.classList.remove("hidden");
        var seatMuted = !!r.seats[mySeatIdx].muted;
        micBtn.classList.toggle("rec-on", UI.micMuted || seatMuted);
        micBtn.textContent = (UI.micMuted || seatMuted) ? "🔇" : "🎙️";
      }
    } else if (r.micApprovalMode && !canMod) {
      if (micBtn) micBtn.classList.add("hidden");
      if (raiseBtn) {
        raiseBtn.classList.remove("hidden");
        var raised = handReqs.indexOf(S.me.id) >= 0;
        raiseBtn.classList.toggle("active", raised);
        raiseBtn.title = raised ? "إلغاء طلب المايك" : "طلب المايك";
      }
    } else {
      if (raiseBtn) raiseBtn.classList.add("hidden");
      if (micBtn) {
        micBtn.classList.remove("hidden");
        micBtn.classList.toggle("rec-on", UI.micMuted);
        micBtn.textContent = UI.micMuted ? "🔇" : "🎙️";
      }
    }

    var seatsHtml = (r.seats || []).map(function (s, i) {
      var u = s.uid ? resolveLiveUser(s.uid) : null;
      var cls = "seat" + (s.uid ? " occ" : "") + (s.locked ? " locked" : "");
      var inner = u ? '<div class="seatav">' + avatarInnerHTML(u) + "</div>" : (s.locked ? "🔒" : "+");
      var sub = u ? (s.uid === r.owner ? "👑 المالك" : (isRoomModOrOwner(r, s.uid) ? "🛡️ مشرف" : "على المايك")) : (s.locked ? "مقفل" : "فارغ");
      return '<div class="' + cls + '" data-seat="' + i + '"><div class="seat-orb"><span class="seat-num-badge">' + (i + 1) + "</span>" + inner + (s.muted ? '<span class="mutedmark">🔇</span>' : "") + '</div><div class="seat-meta-pill"><div class="seatname-full">' + esc(u ? u.name : "مقعد " + (i + 1)) + '</div><div class="seatsub">' + sub + "</div></div></div>";
    }).join("");
    $("room-seats").innerHTML = seatsHtml;
    updateSpeakingIndicators();
    renderRoomChat();
    syncRoomMusicPlayer(r);
  }

  function renderRoomChat() {
    var r = getRoom(UI.roomId);
    if (!r) return;
    var box = $("room-chat");
    if (!box) return;
    var msgs = (r.msgs || []).filter(function (m) { return !m.from || !isBlockedEitherWay(m.from); }).slice(-80);
    box.innerHTML = msgs.map(function (m) {
      if (m.sys) return '<div class="msg sys">' + esc(m.text) + "</div>";
      var isMe = m.from === S.me.id, body = "";
      if (m.gift) {
        var gVis = m.gifUrl ? '<img src="' + esc(m.gifUrl) + '" alt="" style="width:28px;height:28px;vertical-align:middle;border-radius:6px" />' : esc(m.gift);
        body = '<div style="font-size:20px;font-weight:800">' + gVis + ' ×' + esc(m.count || 1) + ' ➔ ' + esc(m.toName || "") + "</div>" + (m.text ? "<div>" + esc(m.text) + "</div>" : "");
      } else if (m.sticker) body = '<div style="font-size:34px">' + esc(m.sticker) + "</div>";
      else if (m.img) body = '<img src="' + esc(m.img) + '" style="max-width:190px;border-radius:10px;display:block" alt="" />';
      else body = esc(m.text || "");
      return '<div class="msg ' + (isMe ? "me" : "") + '">' + (!isMe ? '<div class="who">' + esc(m.fromName || "مستخدم") + "</div>" : "") + body + '<div class="tm">' + timeStr(m.t) + "</div></div>";
    }).join("");
    box.scrollTop = box.scrollHeight;
  }

  function sendRoomMessage(textVal, extra) {
    var r = getRoom(UI.roomId);
    if (!r) return;
    if (Array.isArray(r.bans) && r.bans.indexOf(S.me.id) >= 0) { toast("أنت محظور في هذه الغرفة"); return; }
    var cleanTxt = clean(textVal || "").trim();
    if (!cleanTxt && (!extra || (!extra.sticker && !extra.img && !extra.gift))) return;
    pushRoomMsg(r, Object.assign({ from: S.me.id, fromName: S.me.name || "مستخدم", text: cleanTxt }, extra || {}));
  }

  function syncRoomSeatsToCloud(r) {
    if (!r || !cloud.on || !cloud.db || UI.isGuest) return;
    cloud.db.ref("rooms/" + r.id).update({ seats: r.seats, listeners: r.listeners || [], handRequests: r.handRequests || [] }).catch(function () { /* */ });
  }

  function onSeatClick(idx) {
    var r = getRoom(UI.roomId);
    if (!r) return;
    var s = r.seats[idx];
    if (!s) return;
    var canMod = isRoomModOrOwner(r, S.me.id);

    if (s.uid && s.uid !== S.me.id) {
      var targetU = resolveLiveUser(s.uid), acts = "";
      if (canMod) {
        acts += '<button id="sa-kick" type="button">⬇️ إنزال من المايك</button>';
        acts += '<button id="sa-mute" type="button">' + (s.muted ? "🔊 فك كتم المقعد" : "🔇 كتم المقعد") + "</button>";
        if (r.owner === S.me.id) {
          var isMod = Array.isArray(r.mods) && r.mods.indexOf(s.uid) >= 0;
          acts += '<button id="sa-mod" type="button">' + (isMod ? "إزالة الإشراف" : "تعيين مشرف") + "</button>";
        }
        acts += '<button class="danger" id="sa-ban" type="button">🚫 حظر من الغرفة</button>';
      }
      acts += '<button id="sa-gift" type="button">🎁 إرسال هدية</button><button id="sa-prof" type="button">👤 عرض الملف الشخصي</button>';
      openSheet("<h3>مقعد " + (idx + 1) + " — " + esc(targetU.name) + '</h3><div class="actlist">' + acts + "</div>");
      if ($("sa-kick")) $("sa-kick").onclick = function () { s.uid = null; s.muted = false; syncRoomSeatsToCloud(r); renderRoom(); closeSheet(); };
      if ($("sa-mute")) $("sa-mute").onclick = function () { s.muted = !s.muted; syncRoomSeatsToCloud(r); renderRoom(); closeSheet(); };
      if ($("sa-mod")) $("sa-mod").onclick = function () {
        r.mods = r.mods || [];
        var p = r.mods.indexOf(s.uid);
        if (p >= 0) r.mods.splice(p, 1); else r.mods.push(s.uid);
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/mods").set(r.mods).catch(function () { /* */ });
        renderRoom(); closeSheet(); toast("تم تحديث صلاحية الإشراف");
      };
      if ($("sa-ban")) $("sa-ban").onclick = function () {
        r.bans = r.bans || [];
        if (r.bans.indexOf(s.uid) < 0) r.bans.push(s.uid);
        s.uid = null; s.muted = false;
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id).update({ bans: r.bans, seats: r.seats }).catch(function () { /* */ });
        renderRoom(); closeSheet(); toast("تم حظر العضو من الغرفة");
      };
      $("sa-gift").onclick = function () { closeSheet(); openGiftSheet(s.uid); };
      $("sa-prof").onclick = function () { closeSheet(); openUserProfileSheet(s.uid); };
      return;
    }

    if (s.uid === S.me.id) {
      openSheet("<h3>مقعدي (" + (idx + 1) + ')</h3><div class="actlist"><button id="sm-mic" type="button">' + (UI.micMuted ? "🎙️ فتح الميكروفون" : "🔇 كتم الميكروفون") + '</button><button class="danger" id="sm-down" type="button">⬇️ النزول من المايك</button></div>');
      $("sm-mic").onclick = async function () { UI.micMuted = !UI.micMuted; await syncMicHardwareState(); renderRoom(); closeSheet(); };
      $("sm-down").onclick = async function () { s.uid = null; s.muted = false; UI.pendingSeatActionAt = now(); syncRoomSeatsToCloud(r); await stopLocalMic(); renderRoom(); closeSheet(); };
      return;
    }

    if (s.locked && !canMod) { toast("هذا المقعد مقفل 🔒"); return; }
    if (r.micApprovalMode && !canMod) {
      r.handRequests = r.handRequests || [];
      if (r.handRequests.indexOf(S.me.id) < 0) r.handRequests.push(S.me.id);
      syncRoomSeatsToCloud(r); renderRoom(); toast("تم إرسال طلب الصعود للمايك ✋");
      return;
    }

    for (var k = 0; k < r.seats.length; k++) {
      if (r.seats[k] && r.seats[k].uid === S.me.id) { r.seats[k].uid = null; r.seats[k].muted = false; }
    }
    s.uid = S.me.id; s.muted = false; UI.micMuted = false; UI.pendingSeatActionAt = now();
    if (Array.isArray(r.listeners)) r.listeners = r.listeners.filter(function (x) { return x !== S.me.id; });
    if (Array.isArray(r.handRequests)) r.handRequests = r.handRequests.filter(function (x) { return x !== S.me.id; });
    syncRoomSeatsToCloud(r);
    if (voice.client && voice.client.connectionState === "CONNECTED") publishLocalMic();
    else joinVoiceChannel(r.id, "publisher");
    renderRoom();
  }

  function openRoomPresenceSheet() {
    var r = getRoom(UI.roomId);
    if (!r) return;
    var canMod = isRoomModOrOwner(r, S.me.id), handReqs = Array.isArray(r.handRequests) ? r.handRequests : [], ids = getRoomParticipantIds(r), html = "";
    if (canMod && handReqs.length) {
      html += '<div class="sec-head"><h4 class="sec-title">✋ طلبات المايك (' + handReqs.length + ")</h4></div><div class='list' style='margin-bottom:12px'>";
      handReqs.forEach(function (reqUid) {
        var u = resolveLiveUser(reqUid);
        html += '<div class="row glass">' + avatarHTML(u, "sm") + '<div class="info"><div class="name">' + esc(u.name) + '</div><div class="meta">طلب صعود للمايك</div></div><div class="row-actions"><button class="btn sm ok" data-approve-hand="' + esc(reqUid) + '" type="button">قبول</button><button class="btn sm ghost" data-reject-hand="' + esc(reqUid) + '" type="button">رفض</button></div></div>';
      });
      html += "</div>";
    }
    html += '<div class="sec-head"><h4 class="sec-title">🎧 المتواجدون في الغرفة (' + ids.length + ")</h4></div><div class='list'>";
    if (!ids.length) html += '<div class="empty">لا يوجد متواجدون حالياً</div>';
    else {
      ids.forEach(function (uidItem) {
        var u = resolveLiveUser(uidItem), onSeat = seatIndexOf(r, uidItem) >= 0, acts = "";
        if (uidItem !== S.me.id) {
          acts += '<button class="btn sm ghost" data-pres-prof="' + esc(uidItem) + '" type="button">👤</button>';
          if (isFriendWith(uidItem)) acts += '<button class="btn sm" data-pres-dm="' + esc(uidItem) + '" type="button">💬</button>';
          if (canMod && onSeat) acts += '<button class="btn sm red" data-pres-down="' + esc(uidItem) + '" type="button">إنزال</button>';
        } else acts += '<span class="tag">أنت</span>';
        html += '<div class="row glass">' + avatarHTML(u, "sm") + '<div class="info"><div class="name">' + esc(u.name) + (onSeat ? ' <span class="tag vip">على المايك</span>' : ' <span class="tag">مستمع</span>') + '</div><div class="meta">ID: ' + esc(displayUserId(u)) + '</div></div><div class="row-actions">' + acts + "</div></div>";
      });
    }
    html += "</div>";
    openSheet("<h3>🎧 المتواجدون وطلبات المايك</h3>" + html);
    document.querySelectorAll("[data-approve-hand]").forEach(function (b) {
      b.onclick = function () {
        var targetUid = b.getAttribute("data-approve-hand"), freeIdx = -1;
        for (var i = 0; i < r.seats.length; i++) if (!r.seats[i].uid && !r.seats[i].locked) { freeIdx = i; break; }
        if (freeIdx < 0) { toast("لا يوجد مقعد فارغ حالياً"); return; }
        r.seats[freeIdx].uid = targetUid; r.seats[freeIdx].muted = false;
        r.handRequests = (r.handRequests || []).filter(function (x) { return x !== targetUid; });
        r.listeners = (r.listeners || []).filter(function (x) { return x !== targetUid; });
        syncRoomSeatsToCloud(r); renderRoom(); openRoomPresenceSheet();
      };
    });
    document.querySelectorAll("[data-reject-hand]").forEach(function (b) {
      b.onclick = function () {
        var targetUid = b.getAttribute("data-reject-hand");
        r.handRequests = (r.handRequests || []).filter(function (x) { return x !== targetUid; });
        syncRoomSeatsToCloud(r); renderRoom(); openRoomPresenceSheet();
      };
    });
    document.querySelectorAll("[data-pres-down]").forEach(function (b) {
      b.onclick = function () {
        var targetUid = b.getAttribute("data-pres-down");
        r.seats.forEach(function (s) { if (s.uid === targetUid) { s.uid = null; s.muted = false; } });
        syncRoomSeatsToCloud(r); renderRoom(); openRoomPresenceSheet();
      };
    });
    document.querySelectorAll("[data-pres-prof]").forEach(function (b) { b.onclick = function () { openUserProfileSheet(b.getAttribute("data-pres-prof")); }; });
    document.querySelectorAll("[data-pres-dm]").forEach(function (b) { b.onclick = function () { closeSheet(); openDM(b.getAttribute("data-pres-dm")); }; });
  }

  function openRoomFriendsSheet() {
    var r = getRoom(UI.roomId);
    if (!r) return;
    var fr = (S.friends || []).filter(function (id) { return !isBlockedEitherWay(id); }).map(resolveLiveUser);
    openSheet("<h3>👥 الأصدقاء والدعوة</h3>" + (fr.length ? '<div class="list">' + fr.map(function (u) {
      var alreadyIn = inRoom(r, u.id);
      return '<div class="row glass">' + avatarHTML(u, "sm") + '<div class="info"><div class="name">' + esc(u.name) + '</div><div class="meta">' + (alreadyIn ? "داخل الغرفة الآن" : (u.online ? "متصل" : "غير متصل")) + '</div></div><div class="row-actions">' + (alreadyIn ? '<span class="tag verified">في الغرفة</span>' : '<button class="btn sm gold" data-inv-uid="' + esc(u.id) + '" type="button">دعوة</button>') + '<button class="btn sm" data-frdm-uid="' + esc(u.id) + '" type="button">💬</button></div></div>';
    }).join("") + "</div>" : '<div class="empty">لا يوجد أصدقاء بعد</div>'));
    document.querySelectorAll("[data-inv-uid]").forEach(function (b) { b.onclick = function () { inviteFriendToRoom(b.getAttribute("data-inv-uid"), r.id); }; });
    document.querySelectorAll("[data-frdm-uid]").forEach(function (b) { b.onclick = function () { closeSheet(); openDM(b.getAttribute("data-frdm-uid")); }; });
  }

  function openRoomMenuSheet() {
    var r = getRoom(UI.roomId);
    if (!r) return;
    var canMod = isRoomModOrOwner(r, S.me.id), isOwner = r.owner === S.me.id, html = '<div class="actlist">';
    html += '<button id="rm-min" type="button">⬇️ تصغير الغرفة (الاستمرار في الاستماع)</button>';
    html += '<button id="rm-voice-rejoin" type="button">🔄 إعادة الاتصال بالصوت</button>';
    if (canMod) {
      html += '<button id="rm-pin" type="button">📌 تثبيت / تعديل إعلان الغرفة</button>';
      html += '<button id="rm-mode" type="button">' + (r.micApprovalMode ? "🎙️ تحويل المايك إلى مفتوح للجميع" : "✋ تفعيل نظام طلب المايك (موافقة)") + "</button>";
      html += '<button id="rm-lockall" type="button">' + (r.locked ? "🔓 فتح الغرفة" : "🔒 إغلاق الغرفة") + "</button>";
      html += '<button id="rm-seatlocks" type="button">🪑 قفل / فتح المقاعد</button>';
    }
    if (isOwner) {
      html += '<button id="rm-edit" type="button">✏️ تعديل اسم وصورة الغرفة</button>';
      html += '<button class="danger" id="rm-del" type="button">🗑️ حذف الغرفة نهائياً</button>';
    }
    html += '<button class="danger" id="rm-leave" type="button">🚪 مغادرة الغرفة</button></div>';
    openSheet("<h3>⚙️ خيارات الغرفة</h3>" + html);

    $("rm-min").onclick = function () { closeSheet(); minimizeRoomToFloatingOrb(); };
    $("rm-voice-rejoin").onclick = async function () { closeSheet(); await leaveVoiceChannel(true); await joinVoiceChannel(r.id, "publisher"); toast("تمت إعادة الاتصال بالصوت ✅"); };
    $("rm-leave").onclick = function () { closeSheet(); leaveRoom(false); };

    if (canMod) {
      $("rm-pin").onclick = function () {
        openSheet("<h3>📌 تثبيت إعلان الغرفة</h3><input id='rm-pin-in' value='" + esc(r.pinned || "") + "' placeholder='اكتب نص الإعلان المثبت...' /><button class='btn block' id='rm-pin-save' type='button'>حفظ الإعلان</button>");
        $("rm-pin-save").onclick = function () {
          r.pinned = clean($("rm-pin-in").value || "").trim();
          if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/pinned").set(r.pinned).catch(function () { /* */ });
          renderRoom(); closeSheet(); toast("تم تحديث الإعلان المثبت");
        };
      };
      $("rm-mode").onclick = function () {
        r.micApprovalMode = !r.micApprovalMode;
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/micApprovalMode").set(r.micApprovalMode).catch(function () { /* */ });
        renderRoom(); closeSheet(); toast(r.micApprovalMode ? "تم تفعيل وضع طلب المايك ✋" : "تم فتح المايك للجميع 🎙️");
      };
      $("rm-lockall").onclick = function () {
        r.locked = !r.locked;
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/locked").set(r.locked).catch(function () { /* */ });
        renderRoom(); closeSheet(); toast(r.locked ? "تم إغلاق الغرفة" : "تم فتح الغرفة");
      };
      $("rm-seatlocks").onclick = function () {
        openSheet("<h3>🪑 قفل وفتح المقاعد</h3><div class='actlist'>" + r.seats.map(function (s, idx) {
          return '<button data-tog-seat="' + idx + '" type="button">مقعد ' + (idx + 1) + ": " + (s.locked ? "🔒 مقفل (اضغط للفتح)" : "🔓 مفتوح (اضغط للقفل)") + "</button>";
        }).join("") + "</div>");
        document.querySelectorAll("[data-tog-seat]").forEach(function (b) {
          b.onclick = function () {
            var idx = Number(b.getAttribute("data-tog-seat"));
            r.seats[idx].locked = !r.seats[idx].locked;
            if (r.seats[idx].locked && r.seats[idx].uid) { r.seats[idx].uid = null; r.seats[idx].muted = false; }
            syncRoomSeatsToCloud(r); renderRoom(); $("rm-seatlocks").click();
          };
        });
      };
    }
    if (isOwner) {
      $("rm-edit").onclick = function () {
        var newPhoto = r.roomPhoto || "";
        openSheet("<h3>✏️ تعديل الغرفة</h3><label>اسم الغرفة</label><input id='re-name' maxlength='30' value='" + esc(r.name) + "' /><label>تغيير صورة الغرفة</label><input id='re-photo' type='file' accept='image/*' /><button class='btn block' id='re-save' type='button'>حفظ التعديلات</button>");
        $("re-photo").onchange = async function () {
          if (!this.files || !this.files[0]) return;
          try { newPhoto = await readImageFileAsDataUrl(this.files[0], 260, 0.55); toast("تم اختيار الصورة الجديدة"); }
          catch (err) { toast(err.message || "تعذر قراءة الصورة"); }
        };
        $("re-save").onclick = function () {
          var nm = clean($("re-name").value || "").trim();
          if (!nm) { toast("اسم الغرفة مطلوب"); return; }
          r.name = nm; r.roomPhoto = newPhoto;
          if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id).update({ name: r.name, roomPhoto: r.roomPhoto }).catch(function () { /* */ });
          renderRoom(); renderAll(); closeSheet(); toast("تم تحديث الغرفة ✅");
        };
      };
      $("rm-del").onclick = async function () {
        closeSheet();
        var rid = r.id;
        S.rooms = S.rooms.filter(function (x) { return x.id !== rid; });
        if (cloud.on && cloud.db && !UI.isGuest) { try { await cloud.db.ref("rooms/" + rid).remove(); } catch (e) { /* */ } }
        await leaveRoom(true, rid);
        toast("تم حذف الغرفة");
      };
    }
  }

  /* ========= الهدايا الثابتة + صناديق الحظ (Lucky Gifts) ========= */
  function openGiftSheet(preselectedUid) {
    var st = getAppSettings();
    var r = getRoom(UI.roomId || UI.floatingRoomId);
    var gifts = getActiveGifts(false);
    var cats = getGiftCategories();
    var boxes = getActiveLuckyBoxes(false);

    var targetIds = [], seen = {};
    if (r) {
      (r.seats || []).forEach(function (s) { if (s && s.uid && s.uid !== S.me.id && !seen[s.uid] && !isBlockedEitherWay(s.uid)) { seen[s.uid] = true; targetIds.push(s.uid); } });
      (r.listeners || []).forEach(function (uidItem) { if (uidItem && uidItem !== S.me.id && !seen[uidItem] && !isBlockedEitherWay(uidItem)) { seen[uidItem] = true; targetIds.push(uidItem); } });
    }
    (S.friends || []).forEach(function (fid) { if (fid && fid !== S.me.id && !seen[fid] && !isBlockedEitherWay(fid)) { seen[fid] = true; targetIds.push(fid); } });

    if (preselectedUid && preselectedUid !== S.me.id && !isBlockedEitherWay(preselectedUid)) {
      UI.giftTarget = preselectedUid;
      if (!seen[preselectedUid]) targetIds.unshift(preselectedUid);
    } else if (!UI.giftTarget || UI.giftTarget === S.me.id || isBlockedEitherWay(UI.giftTarget) || (targetIds.length && targetIds.indexOf(UI.giftTarget) < 0)) {
      UI.giftTarget = targetIds[0] || "";
    }

    var filteredGifts = gifts.filter(function (g) {
      if (!UI.giftCat || UI.giftCat === "all") return true;
      if (UI.giftCat === "free") return !!g.isFree || Number(g.p || 0) === 0;
      if (UI.giftCat === "events") return !!g.isEvent || g.cat === "events";
      return g.cat === UI.giftCat;
    });
    if (!filteredGifts.length) filteredGifts = gifts;

    if (!filteredGifts.some(function (g) { return g.id === UI.giftSel; })) {
      UI.giftSel = (filteredGifts[0] && filteredGifts[0].id) || "heart";
    }

    var targetsHtml = targetIds.length
      ? targetIds.map(function (id) {
          var u = resolveLiveUser(id), selCls = UI.giftTarget === id ? " sel" : "";
          return '<button class="gt-photo' + selCls + '" data-gtarget="' + esc(id) + '" type="button">' + avatarHTML(u, "sm") + "<span>" + esc(u.name) + "</span></button>";
        }).join("")
      : '<div class="meta">لا يوجد مستلمون متاحون حالياً</div>';

    var catTabsHtml = cats.map(function (c) {
      return '<button class="tab' + (UI.giftCat === c.id ? " active" : "") + '" data-gcat="' + esc(c.id) + '" type="button">' + esc(c.name) + "</button>";
    }).join("");

    var giftsHtml = filteredGifts.map(function (g) {
      var isFree = !!g.isFree || Number(g.p || 0) === 0;
      var priceLabel = isFree ? "مجانية" : ("🪙 " + Number(g.p || 0));
      return '<div class="gift' + (UI.giftSel === g.id ? " sel" : "") + '" data-gid="' + esc(g.id) + '">' +
        (g.isEvent ? '<span class="tag event" style="position:absolute;top:4px;right:4px;font-size:9px;padding:1px 5px">مناسبة</span>' : "") +
        '<div class="e">' + giftVisualHTML(g) + "</div>" +
        "<small>" + esc(g.n) + "</small>" +
        '<span class="p' + (isFree ? " free" : "") + '">' + priceLabel + "</span>" +
      "</div>";
    }).join("");

    var selectedBox = boxes.find(function (b) { return b.id === UI.luckyBoxSel; }) || boxes[0] || null;
    if (selectedBox) UI.luckyBoxSel = selectedBox.id;

    var luckyBoxesHtml = boxes.map(function (b) {
      var sel = selectedBox && selectedBox.id === b.id;
      return '<div class="lucky-box-card" style="' + (sel ? "border-color:var(--gold);box-shadow:0 0 0 1px var(--gold)" : "") + '" data-lbox="' + esc(b.id) + '">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">' +
          '<div style="display:flex;align-items:center;gap:10px">' +
            '<div style="font-size:32px">' + (b.imageUrl ? '<img src="' + esc(b.imageUrl) + '" alt="" style="width:42px;height:42px;border-radius:10px;object-fit:cover" />' : esc(b.icon || "🎁")) + '</div>' +
            '<div><div style="font-weight:800;font-size:14px">' + esc(b.name) + '</div><div class="meta">سعر الفتح: <b style="color:var(--gold)">🪙 ' + Number(b.price || 0) + '</b> • الجوائز: ' + ((b.rewards && b.rewards.length) || 0) + '</div></div>' +
          '</div>' +
          '<button class="btn sm ' + (sel ? "gold" : "ghost") + '" data-lbox="' + esc(b.id) + '" type="button">' + (sel ? "محدد" : "اختيار") + '</button>' +
        '</div>' +
      '</div>';
    }).join("");

    var rewardsPreviewHtml = "";
    if (selectedBox && Array.isArray(selectedBox.rewards)) {
      rewardsPreviewHtml = '<div class="meta" style="margin:6px 0"><b>الجوائز والاحتمالات في ' + esc(selectedBox.name) + ':</b></div><div class="list">' +
        selectedBox.rewards.map(function (rw) {
          return '<div class="row glass" style="padding:8px 10px"><div style="font-size:20px">' + esc(rw.emoji || "🎁") + '</div><div class="info"><div class="name">' + esc(rw.title) + ' <span class="tag vip">' + esc(RARITY_LABELS[rw.rarity] || rw.rarity || "جائزة") + '</span></div><div class="meta">احتمال الفوز: ' + Number(rw.probability || 0) + '%</div></div></div>';
        }).join("") + '</div>';
    }

    var revealHtml = "";
    if (UI.lastLuckyReward) {
      var lr = UI.lastLuckyReward;
      revealHtml = '<div class="lucky-reveal-box"><div style="font-size:40px">' + esc(lr.emoji || "🎉") + '</div><div style="font-weight:900;font-size:16px;margin-top:6px">مبروك! ربحت: ' + esc(lr.title) + '</div><div class="meta" style="margin-top:4px">الندرة: ' + esc(RARITY_LABELS[lr.rarity] || lr.rarity || "مميز") + ' • من ' + esc(lr.boxName || "") + '</div></div>';
    }

    var activeGiftObj = filteredGifts.find(function (x) { return x.id === UI.giftSel; }) || filteredGifts[0];
    var estCost = (activeGiftObj && (activeGiftObj.isFree || Number(activeGiftObj.p || 0) === 0)) ? 0 : (Number((activeGiftObj && activeGiftObj.p) || 0) * Number(UI.giftQty || 1));

    openSheet(
      "<h3>🎁 الهدايا وصناديق الحظ</h3>" +
      '<div class="rv-gift-wallet">🪙 رصيدك الحالي: <b id="gift-sheet-coins">' + Number(S.me.coins || 0).toLocaleString("en-US") + '</b> عملة</div>' +
      '<div class="tabs" style="margin-bottom:10px">' +
        '<button class="tab' + (UI.giftTab === "normal" ? " active" : "") + '" id="gtab-normal" type="button">🎁 الهدايا الثابتة</button>' +
        '<button class="tab' + (UI.giftTab === "lucky" ? " active" : "") + '" id="gtab-lucky" type="button">🎰 صناديق الحظ (Lucky)</button>' +
      '</div>' +
      '<div id="gpanel-normal" class="' + (UI.giftTab !== "normal" ? "hidden" : "") + '">' +
        (st.giftsEnabled === false
          ? '<div class="empty">نظام الهدايا متوقف مؤقتاً من الإدارة</div>'
          : '<label>اختر المستلم</label><div class="gift-targets-bar">' + targetsHtml + '</div>' +
            '<div class="tabs">' + catTabsHtml + '</div>' +
            '<div class="giftgrid">' + giftsHtml + '</div>' +
            '<input id="gift-note-input" maxlength="60" placeholder="رسالة قصيرة مع الهدية (اختياري)..." value="' + esc(UI.giftNote || "") + '" style="margin-top:10px" />' +
            '<div style="display:flex;align-items:center;gap:8px;margin-top:10px">' +
              '<label style="margin:0">العدد:</label>' +
              '<select id="gift-qty" style="width:92px">' +
                '<option value="1"' + (UI.giftQty === 1 ? " selected" : "") + '>×1</option>' +
                '<option value="5"' + (UI.giftQty === 5 ? " selected" : "") + '>×5</option>' +
                '<option value="10"' + (UI.giftQty === 10 ? " selected" : "") + '>×10</option>' +
                '<option value="25"' + (UI.giftQty === 25 ? " selected" : "") + '>×25</option>' +
                '<option value="50"' + (UI.giftQty === 50 ? " selected" : "") + '>×50</option>' +
              '</select>' +
              '<button class="btn" style="flex:1" id="send-gift-btn" type="button">إرسال (' + estCost + ' 🪙) 🚀</button>' +
            '</div>') +
      '</div>' +
      '<div id="gpanel-lucky" class="' + (UI.giftTab !== "lucky" ? "hidden" : "") + '">' +
        (st.luckyGiftsEnabled === false
          ? '<div class="empty">صناديق الحظ متوقفة مؤقتاً من الإدارة</div>'
          : revealHtml + luckyBoxesHtml +
            (selectedBox ? '<button class="btn gold block" id="open-lucky-box-btn" type="button">🎲 فتح ' + esc(selectedBox.name) + ' (🪙 ' + Number(selectedBox.price || 0) + ')</button>' : '') +
            rewardsPreviewHtml +
            '<button class="btn ghost block" id="open-my-lucky-log" type="button">📜 سجل جوائزي</button>') +
      '</div>'
    );

    if ($("gtab-normal")) $("gtab-normal").onclick = function () { UI.giftTab = "normal"; openGiftSheet(UI.giftTarget); };
    if ($("gtab-lucky")) $("gtab-lucky").onclick = function () { UI.giftTab = "lucky"; openGiftSheet(UI.giftTarget); };

    document.querySelectorAll("[data-gtarget]").forEach(function (b) {
      b.onclick = function () { UI.giftTarget = b.getAttribute("data-gtarget"); openGiftSheet(UI.giftTarget); };
    });
    document.querySelectorAll("[data-gcat]").forEach(function (b) {
      b.onclick = function () { UI.giftCat = b.getAttribute("data-gcat"); openGiftSheet(UI.giftTarget); };
    });
    document.querySelectorAll("[data-gid]").forEach(function (el) {
      el.onclick = function () { UI.giftSel = el.getAttribute("data-gid"); openGiftSheet(UI.giftTarget); };
    });
    if ($("gift-note-input")) $("gift-note-input").oninput = function () { UI.giftNote = this.value || ""; };
    if ($("gift-qty")) $("gift-qty").onchange = function () { UI.giftQty = Number(this.value || 1); openGiftSheet(UI.giftTarget); };

    if ($("send-gift-btn")) $("send-gift-btn").onclick = async function () {
      if (!UI.giftTarget || UI.giftTarget === S.me.id) { toast("اختر مستلماً صحيحاً أولاً"); return; }
      if (isBlockedEitherWay(UI.giftTarget)) { toast("لا يمكن إرسال هدية بسبب وجود حظر"); return; }
      var giftObj = gifts.find(function (x) { return x.id === UI.giftSel; }) || gifts[0];
      if (!giftObj) { toast("الهدية غير متاحة"); return; }
      var qty = Math.max(1, Number(($("gift-qty") && $("gift-qty").value) || UI.giftQty || 1));
      var noteTxt = clean(($("gift-note-input") && $("gift-note-input").value) || "").trim();
      UI.giftNote = "";
      var unitPrice = (giftObj.isFree || Number(giftObj.p || 0) === 0) ? 0 : Math.max(0, Number(giftObj.p || 0));
      var totalCost = unitPrice * qty;
      var toU = resolveLiveUser(UI.giftTarget);

      if (totalCost > 0 && Number(S.me.coins || 0) < totalCost) {
        toast("رصيد العملات غير كافٍ (المطلوب " + totalCost + " عملة)");
        return;
      }

      this.disabled = true;
      var serverDone = false;
      if (!UI.isGuest && cloud.on && totalCost > 0) {
        var apiRes = await callEconomyApi("spendCoinsGift", {
          toUserId: UI.giftTarget,
          giftId: giftObj.id,
          giftName: giftObj.n,
          unitPrice: unitPrice,
          quantity: qty,
          totalCost: totalCost,
          roomId: (r && r.id) || ""
        });
        if (!apiRes.ok) {
          this.disabled = false;
          toast(apiRes.error || "تعذر إتمام عملية خصم العملات");
          return;
        }
        serverDone = true;
        if (typeof apiRes.balance === "number") S.me.coins = Math.max(0, apiRes.balance);
      } else if (totalCost > 0) {
        S.me.coins = Math.max(0, Number(S.me.coins || 0) - totalCost);
      }

      if (!serverDone && totalCost > 0 && cloud.on && cloud.db && !UI.isGuest) {
        await cloud.db.ref("economy/wallets/" + S.me.id + "/balance").transaction(function (cur) {
          var v = Number(cur || 0);
          return v >= totalCost ? v - totalCost : cur;
        });
      }

      var xpGain = Math.max(10, totalCost);
      S.me.xp = Number(S.me.xp || 0) + xpGain;
      S.me.level = computeLevelFromXp(S.me.xp);

      var giftEventId = "ge_" + now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
      var giftLogPayload = {
        id: giftEventId,
        giftId: giftObj.id,
        giftName: giftObj.n,
        emoji: giftObj.e || "🎁",
        gifUrl: giftObj.gifUrl || "",
        note: noteTxt,
        count: qty,
        totalCost: totalCost,
        fromUid: S.me.id,
        fromName: S.me.name || "مستخدم",
        fromPhoto: S.me.photo || "",
        toUid: UI.giftTarget,
        toName: toU.name || "مستخدم",
        roomId: (r && r.id) || "",
        createdAt: now()
      };

      if (cloud.on && cloud.db && !UI.isGuest) {
        var updates = {};
        updates["users/" + UI.giftTarget + "/receivedGifts/" + giftObj.id] = firebase.database.ServerValue.increment(qty);
        updates["users/" + UI.giftTarget + "/receivedGifts/" + (giftObj.e || "gift")] = firebase.database.ServerValue.increment(qty);
        updates["users/" + UI.giftTarget + "/receivedGiftLog/" + giftEventId] = giftLogPayload;
        updates["users/" + UI.giftTarget + "/charm"] = firebase.database.ServerValue.increment(Math.max(10, totalCost));
        updates["publicProfiles/" + UI.giftTarget + "/receivedGifts/" + giftObj.id] = firebase.database.ServerValue.increment(qty);
        updates["publicProfiles/" + UI.giftTarget + "/receivedGiftLog/" + giftEventId] = giftLogPayload;
        updates["gift_transactions/" + giftEventId] = giftLogPayload;
        if (r && r.id) {
          updates["giftEvents/" + r.id + "/" + giftEventId] = giftLogPayload;
        }
        await cloud.db.ref().update(updates).catch(function () { /* */ });
      }

      if (r && UI.roomId === r.id) {
        pushRoomMsg(r, {
          from: S.me.id,
          fromName: S.me.name || "مستخدم",
          gift: giftObj.e || "🎁",
          gifUrl: giftObj.gifUrl || "",
          count: qty,
          toName: toU.name || "مستخدم",
          text: noteTxt || ("أرسل " + (giftObj.n || "هدية") + " إلى " + (toU.name || "مستخدم"))
        });
      }

      showFlyGiftToSeat(giftObj.gifUrl || giftObj.e || "🎁", S.me.name || "مستخدم", UI.giftTarget, toU.name || "مستخدم");
      save(); renderTop(); if (UI.page === "profile") renderProfile();
      closeSheet();
      toast("تم إرسال " + giftObj.n + " (×" + qty + ") إلى " + toU.name + " ✅");
    };

    document.querySelectorAll("[data-lbox]").forEach(function (el) {
      el.onclick = function () {
        UI.luckyBoxSel = el.getAttribute("data-lbox");
        UI.lastLuckyReward = null;
        openGiftSheet(UI.giftTarget);
      };
    });

    if ($("open-my-lucky-log")) $("open-my-lucky-log").onclick = openLuckyHistorySheet;

    if ($("open-lucky-box-btn") && selectedBox) {
      $("open-lucky-box-btn").onclick = async function () {
        var boxPrice = Math.max(0, Number(selectedBox.price || 0));
        if (boxPrice > 0 && Number(S.me.coins || 0) < boxPrice) {
          toast("رصيدك غير كافٍ لفتح " + selectedBox.name);
          return;
        }
        this.disabled = true;
        var wonReward = null;
        var serverDraw = null;

        if (!UI.isGuest && cloud.on) {
          serverDraw = await callEconomyApi("openLuckyBox", {
            boxId: selectedBox.id,
            roomId: (r && r.id) || ""
          });
        }

        if (serverDraw && serverDraw.ok && serverDraw.reward) {
          wonReward = serverDraw.reward;
          if (typeof serverDraw.balance === "number") S.me.coins = Math.max(0, serverDraw.balance);
        } else {
          if (boxPrice > 0) {
            if (!UI.isGuest && cloud.on && cloud.db) {
              var txOk = false;
              await cloud.db.ref("economy/wallets/" + S.me.id + "/balance").transaction(function (cur) {
                var v = Number(cur || 0);
                if (v < boxPrice) return cur;
                txOk = true;
                return v - boxPrice;
              });
              if (!txOk) {
                this.disabled = false;
                toast("رصيدك غير كافٍ لفتح الصندوق");
                return;
              }
            } else {
              S.me.coins = Math.max(0, Number(S.me.coins || 0) - boxPrice);
            }
          }
          var pool = Array.isArray(selectedBox.rewards) && selectedBox.rewards.length ? selectedBox.rewards : [];
          var totalProb = pool.reduce(function (acc, item) { return acc + Math.max(0, Number(item.probability || 0)); }, 0);
          var pickVal = Math.random() * (totalProb > 0 ? totalProb : pool.length);
          var accProb = 0;
          for (var i = 0; i < pool.length; i++) {
            accProb += totalProb > 0 ? Math.max(0, Number(pool[i].probability || 0)) : 1;
            if (pickVal <= accProb) { wonReward = pool[i]; break; }
          }
          if (!wonReward && pool.length) wonReward = pool[0];
        }

        if (!wonReward) {
          this.disabled = false;
          toast("تعذر سحب الجائزة");
          return;
        }

        if (wonReward.rewardType === "coins") {
          var bonusCoins = Math.max(0, Number(wonReward.value || 0));
          if (!serverDraw || !serverDraw.ok) {
            S.me.coins = Number(S.me.coins || 0) + bonusCoins;
            if (!UI.isGuest && cloud.on && cloud.db) {
              cloud.db.ref("economy/wallets/" + S.me.id + "/balance").transaction(function (cur) {
                return Number(cur || 0) + bonusCoins;
              }).catch(function () { /* */ });
            }
          }
        } else if (wonReward.rewardType === "gift") {
          var gKey = wonReward.giftId || wonReward.value || "rose";
          var gQty = Math.max(1, Number(wonReward.value || 1));
          if (!S.me.receivedGifts) S.me.receivedGifts = {};
          S.me.receivedGifts[gKey] = Number(S.me.receivedGifts[gKey] || 0) + gQty;
        } else if (wonReward.rewardType === "frame") {
          if (!Array.isArray(S.me.frames)) S.me.frames = [];
          if (S.me.frames.indexOf(wonReward.value) < 0) S.me.frames.push(wonReward.value);
        } else if (wonReward.rewardType === "entry_frame") {
          if (!Array.isArray(S.me.entryFrames)) S.me.entryFrames = [];
          if (S.me.entryFrames.indexOf(wonReward.value) < 0) S.me.entryFrames.push(wonReward.value);
        } else if (wonReward.rewardType === "badge") {
          if (!Array.isArray(S.me.badges)) S.me.badges = [];
          if (S.me.badges.indexOf(wonReward.value) < 0) S.me.badges.push(wonReward.value);
        } else if (wonReward.rewardType === "perk") {
          if (!Array.isArray(S.me.perks)) S.me.perks = [];
          if (S.me.perks.indexOf(wonReward.value) < 0) S.me.perks.push(wonReward.value);
        } else if (wonReward.rewardType === "vip") {
          var vLv = Math.max(1, Number(wonReward.value || 1));
          var vDays = Math.max(1, Number(wonReward.days || 3));
          S.me.vip = Math.max(Number(S.me.vip || 0), vLv);
          S.me.vipExpiresAt = Math.max(Number(S.me.vipExpiresAt || 0), now()) + vDays * 86400000;
        }

        if (!Array.isArray(S.me.luckyWins)) S.me.luckyWins = [];
        var winRecord = {
          id: "lw_" + now().toString(36),
          boxId: selectedBox.id,
          boxName: selectedBox.name,
          title: wonReward.title,
          emoji: wonReward.emoji || "🎁",
          rarity: wonReward.rarity || "rare",
          t: now()
        };
        S.me.luckyWins.push(winRecord);
        UI.lastLuckyReward = winRecord;

        if (!UI.isGuest && cloud.on && cloud.db) {
          var drawLog = Object.assign({}, winRecord, { userId: S.me.id, userName: S.me.name || "مستخدم" });
          cloud.db.ref("lucky_draws/" + drawLog.id).set(drawLog).catch(function () { /* */ });
          cloud.db.ref("users/" + S.me.id + "/luckyWins").set(S.me.luckyWins).catch(function () { /* */ });
        }

        if (r && UI.roomId === r.id) {
          pushRoomMsg(r, { sys: true, text: "🎰 " + (S.me.name || "مستخدم") + " فتح " + selectedBox.name + " وربح: " + (wonReward.emoji || "🎁") + " " + wonReward.title });
        }

        save(); renderTop();
        openGiftSheet(UI.giftTarget);
        toast("🎉 مبروك! ربحت " + wonReward.title);
      };
    }
  }

  function openEmojiSheet(forDm) {
    openSheet("<h3>😀 إيموجي</h3><div class='emojigrid'>" + EMOJIS.map(function (e) { return '<button data-em="' + esc(e) + '" type="button">' + e + "</button>"; }).join("") + "</div>");
    document.querySelectorAll("[data-em]").forEach(function (b) {
      b.onclick = function () {
        var em = b.getAttribute("data-em");
        if (forDm) { var inp = $("chat-input"); if (inp) { inp.value += em; inp.focus(); } }
        else { var rInp = $("room-input"); if (rInp) { rInp.value += em; rInp.focus(); } }
        closeSheet();
      };
    });
  }

  function openStickerSheet() {
    openSheet("<h3>🎭 ملصقات الغرفة</h3><div class='emojigrid'>" + STICKERS.map(function (s) { return '<button data-st="' + esc(s.e) + '" type="button" title="' + esc(s.n) + '">' + s.e + "</button>"; }).join("") + "</div>");
    document.querySelectorAll("[data-st]").forEach(function (b) {
      b.onclick = function () { var st = b.getAttribute("data-st"); closeSheet(); sendRoomMessage("", { sticker: st }); };
    });
  }

  function openMusicSheet() {
    var r = getRoom(UI.roomId || UI.floatingRoomId);
    if (!r) return;
    var pl = Array.isArray(r.playlist) && r.playlist.length ? r.playlist : DEFAULT_TRACKS;
    var canCtl = canControlRoomMusic(r);
    var volPct = Math.round((typeof UI.musicVolume === "number" ? UI.musicVolume : 0.7) * 100);
    var html = "<h3>🎵 موسيقى الغرفة</h3>";
    if (!canCtl) html += '<div class="notice">تشغيل وتغيير الموسيقى متاح لمالك الغرفة والمشرفين فقط. يمكنك التحكم في مستوى صوتك.</div>';
    html += '<div class="switchrow"><span>مستوى صوت الموسيقى (' + volPct + '%)</span><input type="range" id="mus-vol-slider" min="0" max="100" value="' + volPct + '" style="width:130px" /></div>';
    html += '<div class="list" style="margin-top:8px">' + pl.map(function (t, idx) {
      return '<div class="row glass"><div style="font-size:24px">' + esc(t.cover || "🎵") + '</div><div class="info"><div class="name">' + esc(t.title) + '</div><div class="meta">' + esc(t.artist || "مقطع صوتي") + '</div></div>' + (canCtl ? '<button class="btn sm ok" data-play-idx="' + idx + '" type="button">▶ تشغيل</button>' : '') + "</div>";
    }).join("") + "</div>";
    if (canCtl) {
      html += '<label>إضافة مقطع صوتي مخصص (رابط MP3)</label><input id="mus-custom-title" placeholder="اسم المقطع" style="margin-bottom:6px" /><input id="mus-custom-url" placeholder="https://example.com/song.mp3" /><button class="btn block" id="mus-add-play" type="button">إضافة وتشغيل للجميع</button>';
      if (r.music && r.music.playing) html += '<button class="btn red block" id="mus-stop-all" type="button">⏹️ إيقاف الموسيقى</button>';
    }
    openSheet(html);

    if ($("mus-vol-slider")) {
      $("mus-vol-slider").oninput = function () {
        UI.musicVolume = Number(this.value || 70) / 100;
        if (musicState.roomAudio) { try { musicState.roomAudio.volume = UI.musicVolume; } catch (e) { /* */ } }
      };
    }

    document.querySelectorAll("[data-play-idx]").forEach(function (b) {
      b.onclick = function () {
        var tr = pl[Number(b.getAttribute("data-play-idx"))];
        if (!tr) return;
        setRoomMusicRemote(r.id, { url: tr.url, title: tr.title, artist: tr.artist || "", playing: true, positionSec: 0, updatedAt: now() });
        closeSheet(); toast("تم تشغيل: " + tr.title);
      };
    });
    if ($("mus-add-play")) {
      $("mus-add-play").onclick = function () {
        var title = clean($("mus-custom-title").value || "مقطع صوتي").trim();
        var url = ($("mus-custom-url").value || "").trim();
        if (!/^https?:\/\//i.test(url)) { toast("أدخل رابط صوتي صحيح يبدأ بـ http أو https"); return; }
        r.playlist = pl.concat([{ id: uid(), title: title, artist: "مخصص", cover: "🎧", url: url }]);
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/playlist").set(r.playlist).catch(function () { /* */ });
        setRoomMusicRemote(r.id, { url: url, title: title, artist: "مخصص", playing: true, positionSec: 0, updatedAt: now() });
        closeSheet(); toast("تم تشغيل المقطع للجميع ✅");
      };
    }
    if ($("mus-stop-all")) {
      $("mus-stop-all").onclick = function () {
        var curPos = computeMusicPositionSec(r.music);
        setRoomMusicRemote(r.id, { url: "", title: "", artist: "", playing: false, positionSec: curPos, updatedAt: now() });
        closeSheet(); toast("تم إيقاف الموسيقى");
      };
    }
  }

  function markThreadMessagesRead(peerId) {
    if (!peerId || !S.dms[peerId]) return;
    S.unread[peerId] = 0;
    if (cloud.on && cloud.db && !UI.isGuest) {
      var tid = dmThreadId(S.me.id, peerId);
      S.dms[peerId].forEach(function (m) {
        if (m.key && m.from !== S.me.id && !m.read) { m.read = true; cloud.db.ref("dms/" + tid + "/" + m.key + "/read").set(true).catch(function () { /* */ }); }
      });
    }
  }

  function openDM(peerId) {
    if (!peerId || peerId === S.me.id) return;
    if (isBlockedEitherWay(peerId)) { toast("لا يمكن فتح المحادثة بسبب وجود حظر"); return; }
    if (!isFriendWith(peerId)) { toast("الدردشة الخاصة متاحة بين الأصدقاء فقط"); return; }
    UI.dmId = peerId;
    if (!S.dms[peerId]) S.dms[peerId] = [];
    markThreadMessagesRead(peerId);
    attachDmThreadListener(S.me.id, peerId);
    var u = resolveLiveUser(peerId);
    setAvatarEl($("chat-avatar"), u);
    $("chat-name").textContent = u.name;
    $("chat-sub").textContent = u.online ? "متصل الآن • صديق" : "غير متصل • صديق";
    $("chat-view").classList.add("open");
    renderDM(); renderTop();
  }

  function closeDM() {
    UI.dmId = null;
    if ($("chat-view")) $("chat-view").classList.remove("open");
    if (isRecordingDm && dmRecorder) { try { dmRecorder.stop(); } catch (e) { /* */ } }
    renderTop();
  }

  function renderDM() {
    var peerId = UI.dmId;
    if (!peerId) return;
    if (!isFriendWith(peerId) || isBlockedEitherWay(peerId)) { closeDM(); return; }
    var msgs = (S.dms[peerId] || []).filter(function (m) { return !m.from || !isBlockedEitherWay(m.from); });
    var box = $("chat-msgs"), moreHtml = "";
    if (msgs.length >= (UI.dmLimits[peerId] || CONFIG.dmInitialLimit)) {
      moreHtml = '<div style="text-align:center;margin-bottom:8px"><button class="btn sm ghost" id="dm-load-older" type="button">تحميل رسائل أقدم</button></div>';
    }
    box.innerHTML = moreHtml + msgs.map(function (m) {
      var isMe = m.from === S.me.id, content = "";
      if (m.inviteRoomId) {
        content = "<div>" + esc(m.text) + '</div><button class="btn sm ok" style="margin-top:6px" data-join-invite="' + esc(m.inviteRoomId) + '" type="button">🎙️ دخول الغرفة</button>';
      } else if (m.audio) content = '<audio controls src="' + esc(m.audio) + '" style="max-width:210px;height:36px"></audio>';
      else if (m.img) content = '<img src="' + esc(m.img) + '" style="max-width:190px;border-radius:10px;display:block" alt="" />';
      else content = esc(m.text || "");
      return '<div class="msg ' + (isMe ? "me" : "") + '">' + content + '<div class="tm">' + timeStr(m.t) + (isMe ? (m.read ? " • ✓✓" : " • ✓") : "") + "</div></div>";
    }).join("");
    box.scrollTop = box.scrollHeight;
    box.querySelectorAll("[data-join-invite]").forEach(function (b) { b.onclick = function () { var rid = b.getAttribute("data-join-invite"); closeDM(); enterRoom(rid); }; });
    if ($("dm-load-older")) $("dm-load-older").onclick = function () {
      var nextLim = (UI.dmLimits[peerId] || CONFIG.dmInitialLimit) + CONFIG.dmPageStep;
      delete UI.activeDmListenerLimits[dmThreadId(S.me.id, peerId)];
      attachDmThreadListener(S.me.id, peerId, nextLim);
    };
  }

  function sendDM(textVal, extra) {
    var peerId = UI.dmId;
    if (!peerId || !isFriendWith(peerId) || isBlockedEitherWay(peerId)) { toast("الدردشة الخاصة متاحة للأصدقاء فقط"); return; }
    if (!allowActionRateLimit()) return;
    var cleanTxt = clean(textVal || "").trim();
    if (!cleanTxt && (!extra || (!extra.img && !extra.audio))) return;
    var msg = Object.assign({ from: S.me.id, to: peerId, text: cleanTxt, status: "sent", read: false, t: now() }, extra || {});
    if (!S.dms[peerId]) S.dms[peerId] = [];
    S.dms[peerId].push(msg);
    if (cloud.on && cloud.db && !UI.isGuest) {
      var tid = dmThreadId(S.me.id, peerId);
      cloud.db.ref("dms/" + tid).push(msg).catch(function () { /* */ });
      cloud.db.ref("userDms/" + S.me.id + "/" + peerId).set(true).catch(function () { /* */ });
      cloud.db.ref("userDms/" + peerId + "/" + S.me.id).set(true).catch(function () { /* */ });
    }
    saveLocal(); renderDM(); renderMessages();
  }

  function bindEvents() {
    document.querySelectorAll(".navbtn").forEach(function (b) { b.onclick = function () { go(b.getAttribute("data-page")); }; });
    if ($("avatar-top")) $("avatar-top").onclick = function () { go("profile"); };
    if ($("theme-toggle-btn")) $("theme-toggle-btn").onclick = function () {
      S.settings.lightTheme = !S.settings.lightTheme; applyThemeMode(); save(); renderTop();
    };
    if ($("notif-btn")) $("notif-btn").onclick = openNotifsSheet;
    if ($("scrim")) $("scrim").onclick = closeSheet;

    if ($("search-input")) {
      $("search-input").oninput = function () { UI.query = this.value || ""; renderHome(); };
    }
    if ($("search-clear-btn")) {
      $("search-clear-btn").onclick = function () { UI.query = ""; if ($("search-input")) $("search-input").value = ""; renderHome(); };
    }

    document.querySelectorAll("#home-tabs .tab").forEach(function (t) {
      t.onclick = function () { UI.filter = t.getAttribute("data-filter") || "all"; renderHome(); };
    });
    if ($("gift-cup-banner")) $("gift-cup-banner").onclick = openGiftCupSheet;
    if ($("gift-cup-close-btn")) $("gift-cup-close-btn").onclick = closeGiftCupPage;

    document.querySelectorAll("#rooms-tabs .tab").forEach(function (t) {
      t.onclick = function () { UI.rfilter = t.getAttribute("data-rfilter") || "mine"; renderRooms(); };
    });
    if ($("open-create-room")) $("open-create-room").onclick = openCreateRoomSheet;

    document.querySelectorAll("#friends-tabs .tab").forEach(function (t) {
      t.onclick = function () { UI.ftab = t.getAttribute("data-ftab") || "friends"; renderFriends(); };
    });
    if ($("find-input")) $("find-input").oninput = function () { UI.findQ = this.value || ""; renderFriends(); };

    document.body.addEventListener("click", function (e) {
      var target = e.target;
      if (!target) return;
      var enterEl = target.closest("[data-enter]");
      if (enterEl) { e.stopPropagation(); enterRoom(enterEl.getAttribute("data-enter")); return; }
      var profEl = target.closest("[data-profile]");
      if (profEl) { e.stopPropagation(); openUserProfileSheet(profEl.getAttribute("data-profile")); return; }
      var delThreadEl = target.closest("[data-del-thread]");
      if (delThreadEl) { e.stopPropagation(); deleteDmThread(delThreadEl.getAttribute("data-del-thread")); return; }
      var dmEl = target.closest("[data-dm]");
      if (dmEl) { e.stopPropagation(); openDM(dmEl.getAttribute("data-dm")); return; }
      var folEl = target.closest("[data-follow-user]");
      if (folEl) { e.stopPropagation(); toggleFollowUser(folEl.getAttribute("data-follow-user")); return; }
      var addFrEl = target.closest("[data-addfriend]");
      if (addFrEl) { e.stopPropagation(); sendFriendRequest(addFrEl.getAttribute("data-addfriend")); return; }
      var canFrEl = target.closest("[data-cancelfreq]");
      if (canFrEl) { e.stopPropagation(); cancelFriendRequest(canFrEl.getAttribute("data-cancelfreq")); return; }
      var accEl = target.closest("[data-accept]");
      if (accEl) { e.stopPropagation(); acceptFriendRequest(accEl.getAttribute("data-accept")); return; }
      var rejEl = target.closest("[data-reject]");
      if (rejEl) { e.stopPropagation(); rejectFriendRequest(rejEl.getAttribute("data-reject")); return; }
      var remFrEl = target.closest("[data-remove-friend]");
      if (remFrEl) { e.stopPropagation(); removeFriend(remFrEl.getAttribute("data-remove-friend")); return; }
      var unblkEl = target.closest("[data-unblock-user]");
      if (unblkEl) { e.stopPropagation(); confirmUnblockUserSheet(unblkEl.getAttribute("data-unblock-user")); return; }
      var invEl = target.closest("[data-invite-friend]");
      if (invEl) { e.stopPropagation(); inviteFriendToRoom(invEl.getAttribute("data-invite-friend")); return; }
    });

    if ($("pf-edit-btn")) $("pf-edit-btn").onclick = openSettingsSheet;
    if ($("pf-settings-btn")) $("pf-settings-btn").onclick = openSettingsSheet;
    if ($("pf-vip-btn")) $("pf-vip-btn").onclick = openVipSheet;
    if ($("pf-admin-btn")) $("pf-admin-btn").onclick = openAdminPanelSheet;
    if ($("pf-wallet-card")) $("pf-wallet-card").onclick = openWalletSheet;
    if ($("pf-lucky-wins-card")) $("pf-lucky-wins-card").onclick = openLuckyHistorySheet;
    if ($("pf-followers-card")) $("pf-followers-card").onclick = function () { openSocialListSheet("followers"); };
    if ($("pf-following-card")) $("pf-following-card").onclick = function () { openSocialListSheet("following"); };
    if ($("pf-friends-card")) $("pf-friends-card").onclick = function () { openSocialListSheet("friends"); };
    if ($("pf-blocked-card")) $("pf-blocked-card").onclick = function () { openSocialListSheet("blocked"); };
    document.querySelectorAll("#profile-subtabs .tab").forEach(function (t) {
      t.onclick = function () { UI.pftab = t.getAttribute("data-pftab") || "overview"; UI.pfSocialLimit = CONFIG.socialPageSize; renderProfile(); };
    });
    if ($("pf-social-search")) $("pf-social-search").oninput = function () { UI.pfSocialQ = this.value || ""; renderProfileSocialTab(); };

    if ($("room-back")) $("room-back").onclick = minimizeRoomToFloatingOrb;
    if ($("room-leave-btn")) $("room-leave-btn").onclick = function () { leaveRoom(false); };
    if ($("room-menu")) $("room-menu").onclick = openRoomMenuSheet;
    if ($("room-presence-btn")) $("room-presence-btn").onclick = openRoomPresenceSheet;
    if ($("room-friends-btn")) $("room-friends-btn").onclick = openRoomFriendsSheet;
    if ($("room-wallet-btn")) $("room-wallet-btn").onclick = openWalletSheet;
    if ($("room-speaker-btn")) $("room-speaker-btn").onclick = function () {
      UI.roomSpeakerMuted = !UI.roomSpeakerMuted;
      applyRoomSpeakerMuteState();
      if (!UI.roomSpeakerMuted) resumeAllRemoteAudioTracks();
      toast(UI.roomSpeakerMuted ? "تم كتم صوت الغرفة والسماعة 🔇" : "تم تشغيل صوت الغرفة 🔊");
    };
    if ($("unlock-audio-btn")) $("unlock-audio-btn").onclick = function () { resumeAllRemoteAudioTracks(); showAudioUnlockBar(false); toast("تم تفعيل الصوت بنجاح 🔊"); };
    if ($("floating-room-orb")) $("floating-room-orb").onclick = function (e) {
      if (e.target && e.target.closest("#floating-orb-leave")) { e.stopPropagation(); leaveRoom(false, UI.floatingRoomId); return; }
      if (UI.floatingRoomId) enterRoom(UI.floatingRoomId);
    };
    if ($("music-mini-stop")) $("music-mini-stop").onclick = function () {
      var r = getRoom(UI.roomId || UI.floatingRoomId);
      if (!r) return;
      if (canControlRoomMusic(r)) {
        setRoomMusicRemote(r.id, { url: "", title: "", artist: "", playing: false, positionSec: computeMusicPositionSec(r.music), updatedAt: now() });
      } else {
        UI.roomSpeakerMuted = true;
        applyRoomSpeakerMuteState();
      }
    };

    if ($("room-seats")) $("room-seats").onclick = function (e) {
      var seatEl = e.target.closest("[data-seat]");
      if (seatEl) onSeatClick(Number(seatEl.getAttribute("data-seat")));
    };

    if ($("mic-btn")) $("mic-btn").onclick = async function () {
      var r = getRoom(UI.roomId);
      if (!r) return;
      var mySeatIdx = seatIndexOf(r, S.me.id);
      if (mySeatIdx < 0) {
        var freeIdx = -1;
        for (var i = 0; i < r.seats.length; i++) if (!r.seats[i].uid && !r.seats[i].locked) { freeIdx = i; break; }
        if (freeIdx < 0) { toast("لا يوجد مقعد فارغ حالياً — اضغط على مقعد فارغ"); return; }
        onSeatClick(freeIdx);
        return;
      }
      if (r.seats[mySeatIdx].muted) { toast("المقعد مكتوم من مشرف الغرفة 🔇"); return; }
      UI.micMuted = !UI.micMuted;
      await syncMicHardwareState();
      renderRoom();
      toast(UI.micMuted ? "تم كتم الميكروفون 🔇" : "تم فتح الميكروفون 🎙️");
    };

    if ($("raise-hand-btn")) $("raise-hand-btn").onclick = function () {
      var r = getRoom(UI.roomId);
      if (!r) return;
      r.handRequests = r.handRequests || [];
      var idx = r.handRequests.indexOf(S.me.id);
      if (idx >= 0) { r.handRequests.splice(idx, 1); toast("تم إلغاء طلب المايك"); }
      else { r.handRequests.push(S.me.id); toast("تم إرسال طلب المايك ✋"); }
      syncRoomSeatsToCloud(r); renderRoom();
    };

    if ($("gift-btn")) $("gift-btn").onclick = function () { openGiftSheet(); };
    if ($("emoji-btn")) $("emoji-btn").onclick = function () { openEmojiSheet(false); };
    if ($("sticker-btn")) $("sticker-btn").onclick = openStickerSheet;
    if ($("music-btn")) $("music-btn").onclick = openMusicSheet;
    if ($("img-btn")) $("img-btn").onclick = function () { if ($("room-img-file")) $("room-img-file").click(); };
    if ($("room-img-file")) $("room-img-file").onchange = async function () {
      if (!this.files || !this.files[0]) return;
      try { var dataUrl = await readImageFileAsDataUrl(this.files[0], 320, 0.55); sendRoomMessage("", { img: dataUrl }); }
      catch (err) { toast(err.message || "تعذر إرسال الصورة"); }
      this.value = "";
    };
    if ($("room-send")) $("room-send").onclick = function () {
      var inp = $("room-input");
      if (!inp) return;
      sendRoomMessage(inp.value);
      inp.value = "";
    };
    if ($("room-input")) $("room-input").onkeydown = function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if ($("room-send")) $("room-send").click(); }
    };

    if ($("chat-back")) $("chat-back").onclick = closeDM;
    if ($("chat-send")) $("chat-send").onclick = function () {
      var inp = $("chat-input");
      if (!inp) return;
      sendDM(inp.value);
      inp.value = "";
    };
    if ($("chat-input")) $("chat-input").onkeydown = function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if ($("chat-send")) $("chat-send").click(); }
    };
    if ($("chat-emoji")) $("chat-emoji").onclick = function () { openEmojiSheet(true); };
    if ($("chat-img")) $("chat-img").onclick = function () { if ($("dm-img-file")) $("dm-img-file").click(); };
    if ($("dm-img-file")) $("dm-img-file").onchange = async function () {
      if (!this.files || !this.files[0]) return;
      try { var dataUrl = await readImageFileAsDataUrl(this.files[0], 320, 0.55); sendDM("", { img: dataUrl }); }
      catch (err) { toast(err.message || "تعذر إرسال الصورة"); }
      this.value = "";
    };
    if ($("chat-mic")) $("chat-mic").onclick = async function () {
      if (!isRecordingDm) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !global.MediaRecorder) {
          toast("التسجيل الصوتي غير مدعوم في هذا المتصفح");
          return;
        }
        try {
          var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          dmChunks = [];
          dmRecorder = new MediaRecorder(stream);
          dmRecorder.ondataavailable = function (ev) { if (ev.data && ev.data.size > 0) dmChunks.push(ev.data); };
          dmRecorder.onstop = function () {
            stream.getTracks().forEach(function (tr) { tr.stop(); });
            var blob = new Blob(dmChunks, { type: "audio/webm" });
            var reader = new FileReader();
            reader.onload = function () { sendDM("", { audio: String(reader.result || "") }); };
            reader.readAsDataURL(blob);
          };
          dmRecorder.start();
          isRecordingDm = true;
          this.classList.add("rec-on");
          toast("جاري تسجيل رسالة صوتية... اضغط مجدداً للإرسال");
        } catch (err) { toast("تعذر الوصول للميكروفون"); }
      } else {
        isRecordingDm = false;
        this.classList.remove("rec-on");
        try { if (dmRecorder) dmRecorder.stop(); } catch (e) { /* */ }
      }
    };

    if ($("google-login-btn")) $("google-login-btn").onclick = signInWithGoogleApp;
    if ($("guest-login-btn")) $("guest-login-btn").onclick = startWithoutGoogle;
    document.querySelectorAll(".gender-pill").forEach(function (p) {
      p.onclick = function () {
        UI.onboardGender = p.getAttribute("data-gender") || "ذكر";
        document.querySelectorAll(".gender-pill").forEach(function (x) { x.classList.toggle("active", x === p); });
      };
    });
    if ($("ob-name")) $("ob-name").oninput = renderOnboardPreview;
    if ($("ob-photo-file")) $("ob-photo-file").onchange = async function () {
      if (!this.files || !this.files[0]) return;
      try { UI.onboardPhoto = await readImageFileAsDataUrl(this.files[0], 180, 0.55); renderOnboardPreview(); toast("تم اختيار الصورة"); }
      catch (err) { toast(err.message || "تعذر قراءة الصورة"); }
    };
    if ($("ob-submit")) $("ob-submit").onclick = completeOnboarding;
  }

  function boot() {
    initPwaInstall();
    bindEvents();
    var cloudOk = initCloud();
    resetInMemoryStateForSession("guest_session", false);
    renderAll();

    if (cloudOk && cloud.auth) {
      cloud.auth.getRedirectResult().catch(function () { /* */ });
      cloud.auth.onAuthStateChanged(async function (user) {
        if (user) {
          await handleAuthenticatedUser(user);
        } else {
          UI.googleUser = null;
          if (isGuestSession()) {
            await signInAsGuest();
          } else {
            UI.authReady = false;
            hideSplash();
            showAuthGate(true, "login");
          }
        }
      });
    } else {
      hideSplash();
      if (isGuestSession()) signInAsGuest();
      else showAuthGate(true, "login");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
