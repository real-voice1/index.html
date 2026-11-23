/* REAL VOICE — نسخة كاملة ومستقرة (Firebase + Agora + PWA) */
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
    storageKeyPrefix: "rv_state_v22_",
    guestStorageKey: "rv_guest_state_v22",
    guestSessionIdKey: "rv_guest_uid_v22",
    guestModeKey: "rv_guest_mode_v22",
    onboardDoneKeyPrefix: "rv_onboard_done_v22_",

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
    if (!token || !ECONOMY_API_BASE) return { ok: false, error: "ابدأ التطبيق أولاً" };
    try {
      var response = await fetch(ECONOMY_API_BASE + "/" + endpoint, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(payload || {})
      });
      var data = await response.json();
      if (!response.ok || !data || !data.ok) return { ok: false, error: data && data.error ? data.error : "تعذر تنفيذ العملية" };
      return data;
    } catch (err) { return { ok: false, error: "تعذر الاتصال بخادم المحفظة. تأكد من تشغيل سيرفر Railway." }; }
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
    openSheet("<h3>👛 محفظتي</h3><div class='rv-wallet-sheet'><div class='rv-wallet-coin'>🪙</div><div class='rv-wallet-label'>رصيد REAL VOICE</div><strong id='wallet-sheet-balance'>" + balance.toLocaleString("en-US") + "</strong><div class='meta'>رصيد العملات الخاص بحسابك</div></div><div class='notice' style='margin-top:12px'>يمكنك استخدام العملات لإرسال الهدايا داخل الغرف. شحن الرصيد يتم من إدارة التطبيق حالياً.</div><button class='btn block' id='wallet-history-btn' type='button'>📜 سجل حركات المحفظة</button><div id='wallet-history-list' class='list'></div>");
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
        xp: 0, level: 1, charm: 0, charmLevel: 1, coins: 0, vip: 0, vipExpiresAt: 0,
        verified: false, isAdmin: false, followersCount: 0, followingCount: 0, friendsCount: 0,
        gifts: 0, receivedGifts: {}, receivedGiftLog: {}, joined: now()
      },
      users: [], rooms: [], customGifts: DEFAULT_GIFTS.slice(), reports: [],
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
      if (btn) { btn.disabled = false; btn.textContent = "ابدأ الآن بدون حساب"; }
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

  function showFlyGiftToSeat(emoji, senderName, targetUid, targetName) {
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
    proj.innerHTML = emoji + "<small>" + esc(senderName) + " ➔ " + esc(targetName) + "</small>";
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
    var totals = {}, events = [];
    Object.keys(giftRankEvents).forEach(function (roomId) {
      Object.keys(giftRankEvents[roomId] || {}).forEach(function (eventId) {
        var ev = giftRankEvents[roomId][eventId];
        if (!ev || !ev.fromUid) return;
        events.push(ev);
        var uid = String(ev.fromUid);
        if (!totals[uid]) totals[uid] = { uid: uid, name: ev.fromName || resolveLiveUser(uid).name, count: 0, photo: ev.fromPhoto || resolveLiveUser(uid).photo || "" };
        totals[uid].count += Math.max(1, Number(ev.count || 1));
        if (ev.fromName) totals[uid].name = ev.fromName;
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
    var html = "<div class='cup-hero'><div class='cup-hero-icon'>🏆</div><div class='cup-hero-title'>أبطال غرف REAL VOICE</div><div class='cup-hero-sub'>ترتيب مرسلي الهدايا داخل الغرف حسب عدد الهدايا المسجلة</div></div>";
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
          Object.keys(fresh).forEach(function (k) { if (previous[k]) return; var ev = fresh[k]; if (!ev || !ev.emoji || Number(ev.createdAt || 0) < now() - 30000) return; showFlyGiftToSeat(ev.emoji, ev.fromName || "مستخدم", ev.toUid || "", ev.toName || "مستخدم"); });
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
      if (!uniqueMap[canonicalKey]) uniqueMap[canonicalKey] = { id: canonicalKey, e: giftDef ? giftDef.e : "🎁", n: giftDef ? giftDef.n : String(key), qty: 0 };
      uniqueMap[canonicalKey].qty += qty;
      totalCount += qty;
    });
    if (badge) badge.textContent = totalCount + " هدية";
    var items = Object.keys(uniqueMap).map(function (k) { return uniqueMap[k]; });
    var senderBox = $("pf-gift-senders");
    if (senderBox) {
      var logs = m && m.receivedGiftLog && typeof m.receivedGiftLog === "object" ? Object.keys(m.receivedGiftLog).map(function (k) { return m.receivedGiftLog[k]; }).filter(Boolean).sort(function (a, b) { return Number(b.createdAt || 0) - Number(a.createdAt || 0); }) : [];
      senderBox.innerHTML = logs.length ? logs.slice(0, 30).map(function (ev) { var donor = resolveLiveUser(ev.fromUid || ""); var giftEmoji = ev.emoji || "🎁"; return '<div class="row glass" style="margin-bottom:7px">' + avatarHTML({ id: ev.fromUid, name: ev.fromName, photo: ev.fromPhoto || donor.photo }, "sm") + '<div class="info"><div class="name">' + esc(ev.fromName || donor.name || "مستخدم") + '</div><div class="meta">أرسل ' + esc(giftEmoji) + ' ' + esc(ev.giftName || "هدية") + '</div></div><span class="tag">' + timeStr(ev.createdAt) + '</span></div>'; }).join("") : '<div class="empty">لم تصلك هدايا بعد 💌</div>';
    }
    if (!items.length) { grid.innerHTML = '<div class="gift-showcase-empty">لم تصلك هدايا بعد 🎁</div>'; return; }
    grid.innerHTML = items.map(function (it) {
      return '<div class="gift-showcase-item"><span class="gift-showcase-qty">x' + it.qty + '</span><span class="gift-showcase-emoji">' + esc(it.e) + '</span><div class="gift-showcase-name">' + esc(it.n) + "</div></div>";
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
    if ($("pf-wallet-coins")) $("pf-wallet-coins").textContent = Number(S.me.coins || 0).toLocaleString("en-US");

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
    openSheet("<h3>👑 عضويات VIP</h3><div class='meta'>مستواك الحالي VIP " + curVip + " — تفاصيل العضوية والمميزات فقط، بدون محفظة أو شراء عملات.</div><div class='list'>" + rows + "</div>");
  }

  function openAdminPanelSheet() {
    if (!S.me.isAdmin) { toast("هذه اللوحة متاحة للمشرفين المعتمدين فقط"); return; }
    var onlineUsersCount = 1 + (S.users || []).filter(function (u) { return u.online; }).length;
    var openReports = (S.reports || []).filter(function (r) { return r.status === "open"; });
    openSheet(
      "<h3>🛡️ لوحة إدارة REAL VOICE</h3>" +
      "<div class='stats-grid'><div class='stat-box'><b>" + (1 + (S.users || []).length) + "</b><span>المستخدمون</span></div><div class='stat-box'><b>" + (S.rooms || []).length + "</b><span>الغرف</span></div><div class='stat-box'><b>" + onlineUsersCount + "</b><span>متصل الآن</span></div></div>" +
      "<label>بحث مستخدم بالاسم أو ID</label><input id='adm-u-search' placeholder='مثال: 1000001 أو ليلى' />" +
      "<div id='adm-u-list' class='list' style='margin-top:8px'></div>" +
      "<label style='margin-top:12px'>إدارة البنرات (رابط صورة)</label>" +
      "<div style='display:flex;gap:6px'><input id='adm-banner-url' placeholder='https://...' /><button class='btn sm' id='adm-banner-save' type='button'>حفظ</button></div>" +
      "<label style='margin-top:12px'>البلاغات المفتوحة (" + openReports.length + ")</label>" +
      "<div class='list'>" + (openReports.length ? openReports.map(function (rp) {
        return "<div class='row glass'><div class='info'><div class='name'>بلاغ ضد: " + esc(rp.targetName) + "</div><div class='meta'>" + esc(rp.reason) + "</div></div><button class='btn sm ok' data-close-rep='" + esc(rp.id) + "' type='button'>إغلاق</button></div>";
      }).join("") : "<div class='empty'>لا توجد بلاغات مفتوحة</div>") + "</div>"
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
        var banned = !!u.banned;
        return "<div class='row glass'><div class='info'><div class='name'>" + esc(u.name) + " <span class='tag'>ID: " + esc(displayUserId(u)) + "</span></div><div class='meta'>" + (banned ? "محظور" : "نشط") + "</div></div>" +
          (u.id !== S.me.id ? "<button class='btn sm " + (banned ? "ok" : "red") + "' data-adm-ban='" + esc(u.id) + "' type='button'>" + (banned ? "فك الحظر" : "حظر") + "</button>" : "") + "</div>";
      }).join("");
    }
    renderAdminUsers("");
    if ($("adm-u-search")) $("adm-u-search").oninput = function () { renderAdminUsers(this.value); };
    if ($("adm-banner-save")) {
      $("adm-banner-save").onclick = function () {
        var bUrl = ($("adm-banner-url").value || "").trim();
        S.banners = bUrl ? [bUrl] : [];
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("banners").set(S.banners).catch(function () { /* */ });
        saveLocal(); renderHomeBanners(); toast("تم تحديث البنر ✅");
      };
    }
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
      '<button class="btn ghost block" id="set-logout" type="button">🚪 تسجيل الخروج</button>' +
      '<button class="btn red block" id="set-reset" type="button">إعادة ضبط الجلسة المحلية</button>');

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
    $("set-reset").onclick = function () {
      try {
        localStorage.removeItem(getUserStorageKey(m.id, UI.isGuest));
        if (UI.isGuest) localStorage.removeItem(CONFIG.guestSessionIdKey);
      } catch (e) { /* */ }
      setOnboardDoneForUser(m.id, UI.isGuest, false);
      if (!UI.isGuest) signOutApp();
      else { showAuthGate(true, "onboard"); toast("تمت إعادة ضبط بيانات الزائر"); }
    };
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
      cloud.db.ref("userRoomIndex/" + S.me.id).transaction(function (current) { return current == null ? ownedRoom.id : current; }).catch(function () { /* */ });
      toast("مسموح لك بإنشاء غرفة واحدة فقط. احذف غرفتك الحالية أولاً إذا أردت إنشاء غرفة جديدة.");
      return;
    }
    var cats = Object.keys(CATEGORIES).map(function (k) { return '<option value="' + k + '">' + CATEGORIES[k] + "</option>"; }).join("");
    openSheet("<h3>🎙️ إنشاء غرفة جديدة</h3>" +
      '<div class="meta" style="margin-bottom:10px">كل حساب يمكنه امتلاك غرفة واحدة فقط.</div>' +
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
      if (!/^image\//i.test(f.type)) { toast("اختار ملف صورة فقط"); this.value = ""; return; }
      if (f.size > 5 * 1024 * 1024) { toast("حجم الصورة يجب ألا يتجاوز 5 ميجابايت"); this.value = ""; return; }
      try {
        selectedRoomPhoto = await readImageFileAsDataUrl(f, 480, 0.62);
        $("cr-photo-preview").innerHTML = '<img src="' + esc(selectedRoomPhoto) + '" alt="معاينة صورة الغرفة" style="width:112px;height:112px;object-fit:cover;border-radius:18px;border:2px solid var(--accent,#a855f7)" />';
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
          toast("لديك غرفة بالفعل. لا يمكنك إنشاء غرفة ثانية قبل حذف غرفتك الحالية.");
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
        console.error("create room failed", err);
        toast("تعذر إنشاء الغرفة. تحقق من اتصال Firebase وصلاحياته.");
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
                showFlyGiftToSeat(mItem.gift.emoji || "🎁", mItem.gift.fromName || "مستخدم", mItem.gift.toUid || "", mItem.gift.toName || "مستخدم");
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

  function renderFloatingOrb() {
    var orb = $("floating-room-orb");
    if (!orb) return;
    if (!UI.floatingRoomId || UI.roomId) { orb.classList.add("hidden"); return; }
    var r = getRoom(UI.floatingRoomId);
    if (!r) { UI.floatingRoomId = null; orb.classList.add("hidden"); return; }
    orb.classList.remove("hidden");
    var lbl = $("floating-orb-label");
    if (lbl) lbl.textContent = (musicState.playing ? "🎵 " : "🎙️ ") + r.name;
    var av = $("floating-orb-avatar");
    if (av) {
      if (r.roomPhoto) av.innerHTML = '<img src="' + esc(r.roomPhoto) + '" alt="" />';
      else av.textContent = COVER_ICONS[(r.icon || 0) % COVER_ICONS.length];
    }
  }

  function minimizeRoomToFloatingOrb() {
    if (!UI.roomId) return;
    var r = getRoom(UI.roomId);
    UI.floatingRoomId = UI.roomId; UI.roomId = null;
    closeSheet();
    if ($("room-view")) $("room-view").classList.remove("open");
    renderFloatingOrb(); renderHome(); renderRooms();
    toast(r ? "تم تصغير «" + r.name + "» والاستمرار في الاستماع 🎧" : "تم تصغير الغرفة");
  }

  async function leaveRoom(fullLeave) {
    if (fullLeave === undefined) fullLeave = true;
    var targetId = UI.roomId || UI.floatingRoomId;
    var r = getRoom(targetId);
    if (r) {
      var idx = seatIndexOf(r, S.me.id);
      if (idx >= 0 && fullLeave) {
        r.seats[idx].uid = null; r.seats[idx].muted = false;
        if (cloud.on && cloud.db && !UI.isGuest) {
          cloud.db.ref("rooms/" + r.id + "/seats/" + idx).update({ uid: null, muted: false }).catch(function () { /* */ });
        }
      }
      if (fullLeave) {
        r.listeners = (r.listeners || []).filter(function (x) { return x !== S.me.id; });
        r.handRequests = (r.handRequests || []).filter(function (x) { return x !== S.me.id; });
        if (cloud.on && cloud.db && !UI.isGuest) {
          cloud.db.ref("rooms/" + r.id + "/listeners/" + S.me.id).remove().catch(function () { /* */ });
          cloud.db.ref("rooms/" + r.id + "/handRequests/" + S.me.id).remove().catch(function () { /* */ });
        }
        pushRoomMsg(r, { sys: true, text: (S.me.name || "مستخدم") + " غادر الغرفة" });
      }
    }
    offDb("room");
    if (fullLeave) {
      UI.roomId = null; UI.floatingRoomId = null; UI.roomSessionStart = 0;
      $("room-view").classList.remove("open");
      var stopMusic = !(S && S.settings && S.settings.stopMusicOnLeave === false);
      await leaveVoiceChannel(!stopMusic);
    } else if (!UI.roomId && UI.floatingRoomId) {
      UI.floatingRoomId = null;
      await leaveVoiceChannel(false);
    }
    renderFloatingOrb(); renderHome(); renderRooms();
  }

  function renderRoom() {
    var r = getRoom(UI.roomId); if (!r) return;
    $("room-title").textContent = r.name;
    var rIdEl = $("room-right-id");
    if (rIdEl) rIdEl.textContent = "ID: " + displayUserId({ id: r.owner || r.id, num: uidToAgoraNum(r.owner || r.id) });
    var thumbEl = $("room-top-thumb");
    if (thumbEl) {
      if (r.roomPhoto) thumbEl.innerHTML = '<img src="' + esc(r.roomPhoto) + '" alt="" />';
      else thumbEl.innerHTML = '<span id="room-top-thumb-inner">' + COVER_ICONS[(r.icon || 0) % COVER_ICONS.length] + "</span>";
    }
    $("room-online-count").textContent = count(r);
    var pBar = $("room-pinned-banner");
    if (r.pinned) { pBar.classList.remove("hidden"); $("room-pinned-text").textContent = r.pinned; }
    else pBar.classList.add("hidden");

    var handReqs = Array.isArray(r.handRequests) ? r.handRequests : [];
    var raiseBtn = $("raise-hand-btn"), raiseBadge = $("raise-badge");
    if (raiseBadge) {
      if (isRoomModOrOwner(r, S.me.id)) {
        raiseBadge.textContent = String(handReqs.length);
        raiseBadge.classList.toggle("hidden", handReqs.length === 0);
      } else raiseBadge.classList.add("hidden");
    }
    var mySeatIdx = seatIndexOf(r, S.me.id), iAmRaised = handReqs.indexOf(S.me.id) >= 0;
    if (raiseBtn) {
      if (r.micApprovalMode && mySeatIdx < 0 && !isRoomModOrOwner(r, S.me.id)) {
        raiseBtn.classList.remove("hidden");
        raiseBtn.classList.toggle("active", iAmRaised);
        raiseBtn.title = iAmRaised ? "إلغاء طلب المايك" : "رفع اليد لطلب المايك";
      } else raiseBtn.classList.add("hidden");
    }

    var spkBtn = $("room-speaker-btn");
    if (spkBtn) { spkBtn.classList.toggle("spk-muted", !!UI.roomSpeakerMuted); spkBtn.textContent = UI.roomSpeakerMuted ? "🔇" : "🔊"; }

    var html = "";
    r.seats.forEach(function (s, i) {
      var u = s.uid ? resolveLiveUser(s.uid) : null, isMe = s.uid === S.me.id;
      var muted = s.muted || (isMe && UI.micMuted);
      var vipLv = u ? getEffectiveVip(u) : 0;
      var cls = "seat" + (s.uid ? " occ" : "") + (s.locked ? " locked" : "");
      var orbInner = s.locked ? "🔒" : (u ? '<div class="seatav">' + avatarInnerHTML(u) + "</div>" : "🎙️");
      var sub = s.locked ? "مقفل" : (u ? (isRoomModOrOwner(r, s.uid) ? (r.owner === s.uid ? "👑 المالك" : "🛡️ مشرف") : (muted ? "🔇 مكتوم" : "🎙️ على المايك")) : (s.vip ? "👑 مقعد مميز" : "فارغ"));
      html += '<div class="' + cls + '" data-seat="' + i + '"><div class="seat-orb">' + orbInner + '<span class="seat-num-badge">' + (i + 1) + "</span>" + (muted && s.uid ? '<span class="mutedmark">🔇</span>' : "") + '</div><div class="seat-meta-pill"><div class="seatname-full ' + (vipLv >= 2 ? "vip-gold" : "") + '">' + (u ? esc(u.name) : "مقعد " + (i + 1)) + '</div><div class="seatsub">' + sub + "</div></div></div>";
    });
    $("room-seats").innerHTML = html;
    syncRoomMusicPlayer(r);
    renderRoomChat();
    updateSpeakingIndicators();
    var mb = $("mic-btn");
    if (mb) { mb.classList.toggle("rec-on", UI.micMuted); mb.textContent = UI.micMuted ? "🔇" : "🎙️"; }
    if ($("room-wallet-balance")) $("room-wallet-balance").textContent = Number(S.me.coins || 0).toLocaleString("en-US");
  }

  function renderRoomChat() {
    var r = getRoom(UI.roomId); if (!r) return;
    var box = $("room-chat");
    var msgs = (r.msgs || []).filter(function (m) { return !m.from || !isBlockedEitherWay(m.from); });
    box.innerHTML = msgs.slice(-60).map(function (m) {
      if (m.sys) return '<div class="msg sys">' + esc(m.text) + "</div>";
      var me = m.from === S.me.id, u = resolveLiveUser(m.from), senderName = me ? "أنت" : ((m.fromName && u.name === "مستخدم") ? m.fromName : u.name);
      var body = m.img ? '<img src="' + esc(m.img) + '" style="max-width:190px;border-radius:10px;display:block" loading="lazy" />' : esc(m.text);
      return '<div class="msg ' + (me ? "me" : "") + '">' + (!me ? '<div class="who" data-profile="' + esc(m.from) + '" style="cursor:pointer">' + esc(senderName) + "</div>" : "") + "<div>" + body + '</div><div class="tm">' + timeStr(m.t) + "</div></div>";
    }).join("");
    box.scrollTop = box.scrollHeight;
  }

  function applySeatMutation(r, idx, mutatorFn, toastText) {
    if (!r || !r.seats[idx]) return;
    UI.pendingSeatActionAt = now();
    mutatorFn(r.seats[idx]);
    if (cloud.on && cloud.db && !UI.isGuest) {
      cloud.db.ref("rooms/" + r.id + "/seats/" + idx).set({
        uid: r.seats[idx].uid || null, locked: !!r.seats[idx].locked, muted: !!r.seats[idx].muted, vip: !!r.seats[idx].vip
      }).catch(function () { /* */ });
      if (r.seats[idx].uid) {
        cloud.db.ref("rooms/" + r.id + "/listeners/" + r.seats[idx].uid).remove().catch(function () { /* */ });
        cloud.db.ref("rooms/" + r.id + "/handRequests/" + r.seats[idx].uid).remove().catch(function () { /* */ });
      }
    }
    syncMicHardwareState(); renderRoom(); renderHome();
    if (toastText) toast(toastText);
  }

  function onSeatClick(i) {
    var r = getRoom(UI.roomId); if (!r) return;
    var s = r.seats[i]; if (!s) return;
    var mod = isRoomModOrOwner(r, S.me.id), curIdx = seatIndexOf(r, S.me.id);

    if (s.uid && s.uid !== S.me.id) {
      var u = resolveLiveUser(s.uid);
      var html = "<h3>" + esc(u.name) + '</h3><div class="meta">مقعد #' + (i + 1) + (getEffectiveVip(u) > 0 ? " • VIP " + getEffectiveVip(u) : "") + '</div><div class="actlist" style="margin-top:10px">' +
        '<button data-act="prof" type="button">👤 عرض الملف الشخصي</button><button data-act="gift" type="button">🎁 إرسال هدية</button>';
      if (mod) {
        html += '<button data-act="mute" type="button">' + (s.muted ? "🔊 فك كتم المايك" : "🔇 كتم المايك") + "</button>" +
          '<button data-act="kickseat" class="danger" type="button">⬇ إنزال من المقعد</button>' +
          '<button data-act="banroom" class="danger" type="button">🚫 طرد وحظر من الغرفة</button>';
      }
      html += "</div>";
      openSheet(html);
      $("sheet").querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () {
          var act = b.getAttribute("data-act"); closeSheet();
          if (act === "prof") openUserProfileSheet(s.uid);
          else if (act === "gift") openGiftSheet(s.uid);
          else if (act === "mute") applySeatMutation(r, i, function (seat) { seat.muted = !seat.muted; }, s.muted ? "تم فك الكتم" : "تم كتم المقعد");
          else if (act === "kickseat") {
            var kickedId = s.uid;
            applySeatMutation(r, i, function (seat) { seat.uid = null; seat.muted = false; }, "تم إنزال المستخدم من المقعد");
            if (cloud.on && cloud.db && !UI.isGuest && kickedId) cloud.db.ref("rooms/" + r.id + "/listeners/" + kickedId).set(true).catch(function () { /* */ });
          } else if (act === "banroom") {
            if (!Array.isArray(r.bans)) r.bans = [];
            if (r.bans.indexOf(s.uid) < 0) r.bans.push(s.uid);
            r.listeners = (r.listeners || []).filter(function (x) { return x !== s.uid; });
            applySeatMutation(r, i, function (seat) { seat.uid = null; seat.muted = false; }, "تم حظر المستخدم من الغرفة");
            if (cloud.on && cloud.db && !UI.isGuest) {
              cloud.db.ref("rooms/" + r.id + "/bans/" + s.uid).set(true).catch(function () { /* */ });
              cloud.db.ref("rooms/" + r.id + "/listeners/" + s.uid).remove().catch(function () { /* */ });
            }
          }
        };
      });
      return;
    }

    if (s.uid === S.me.id) {
      openSheet("<h3>مقعدك #" + (i + 1) + '</h3><div class="actlist">' +
        '<button data-act="selfmute" type="button">' + (UI.micMuted ? "🎙️ فتح الميكروفون" : "🔇 كتم الميكروفون") + "</button>" +
        '<button data-act="leave" class="danger" type="button">⬇ النزول من المقعد</button></div>');
      $("sheet").querySelectorAll("[data-act]").forEach(function (b) {
        b.onclick = function () {
          var act = b.getAttribute("data-act"); closeSheet();
          if (act === "selfmute") {
            UI.micMuted = !UI.micMuted;
            if (!UI.micMuted) s.muted = false;
            applySeatMutation(r, i, function (seat) { if (!UI.micMuted) seat.muted = false; }, UI.micMuted ? "تم كتم الميكروفون" : "تم فتح الميكروفون");
          } else if (act === "leave") {
            applySeatMutation(r, i, function (seat) { seat.uid = null; seat.muted = false; }, "نزلت من المقعد");
            if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/listeners/" + S.me.id).set(true).catch(function () { /* */ });
          }
        };
      });
      return;
    }

    if (s.locked) {
      if (!mod) { toast("هذا المقعد مقفل 🔒"); return; }
      openSheet("<h3>مقعد مقفل #" + (i + 1) + '</h3><div class="actlist"><button data-act="unlock" type="button">🔓 فتح المقعد</button></div>');
      $("sheet").querySelector("[data-act='unlock']").onclick = function () { closeSheet(); applySeatMutation(r, i, function (seat) { seat.locked = false; }, "تم فتح المقعد"); };
      return;
    }

    if (r.micApprovalMode && !mod) {
      if (!Array.isArray(r.handRequests)) r.handRequests = [];
      if (r.handRequests.indexOf(S.me.id) < 0) {
        r.handRequests.push(S.me.id);
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/handRequests/" + S.me.id).set(true).catch(function () { /* */ });
        renderRoom(); toast("تم إرسال طلب الصعود للمايك ✋");
      } else toast("طلبك قيد الانتظار لدى إدارة الغرفة");
      return;
    }

    if (curIdx >= 0) applySeatMutation(r, curIdx, function (seat) { seat.uid = null; seat.muted = false; });
    UI.micMuted = false;
    r.listeners = (r.listeners || []).filter(function (x) { return x !== S.me.id; });
    r.handRequests = (r.handRequests || []).filter(function (x) { return x !== S.me.id; });
    applySeatMutation(r, i, function (seat) { seat.uid = S.me.id; seat.muted = false; }, "صعدت إلى المقعد #" + (i + 1) + " 🎙️");
  }

  function openRoomPresenceSheet() {
    var r = getRoom(UI.roomId); if (!r) return;
    var mod = isRoomModOrOwner(r, S.me.id), handReqs = Array.isArray(r.handRequests) ? r.handRequests : [], pIds = getRoomParticipantIds(r);
    var html = "<h3>🎧 المتواجدون في الغرفة (" + pIds.length + ")</h3>";
    if (mod && handReqs.length) {
      html += "<label>✋ طلبات المايك (" + handReqs.length + ')</label><div class="list" style="margin-bottom:10px">';
      handReqs.forEach(function (reqUid) {
        var ru = resolveLiveUser(reqUid);
        html += '<div class="row glass">' + avatarHTML(ru, "sm") + '<div class="info"><div class="name">' + esc(ru.name) + '</div><div class="meta">يطلب الصعود للمايك</div></div><div class="row-actions"><button class="btn sm ok" data-approve-hand="' + esc(reqUid) + '" type="button">قبول</button><button class="btn sm ghost" data-reject-hand="' + esc(reqUid) + '" type="button">رفض</button></div></div>';
      });
      html += "</div>";
    }
    html += '<div class="list">' + (pIds.length ? pIds.map(function (pid) {
      var pu = resolveLiveUser(pid), onSeat = seatIndexOf(r, pid) >= 0;
      return '<div class="row glass" data-profile="' + esc(pid) + '">' + avatarHTML(pu, "sm") + '<div class="info"><div class="name">' + esc(pu.name) + (r.owner === pid ? ' <span class="tag vip">مالك</span>' : (isRoomModOrOwner(r, pid) ? ' <span class="tag">مشرف</span>' : "")) + '</div><div class="meta">' + (onSeat ? "🎙️ على مقعد" : "🎧 مستمع") + "</div></div></div>";
    }).join("") : '<div class="empty">لا يوجد متواجدون حالياً</div>') + "</div>";
    openSheet(html);
    $("sheet").querySelectorAll("[data-approve-hand]").forEach(function (b) {
      b.onclick = function () {
        var targetUid = b.getAttribute("data-approve-hand");
        var freeIdx = r.seats.findIndex(function (st) { return !st.uid && !st.locked; });
        if (freeIdx < 0) { toast("لا يوجد مقعد فارغ حالياً"); return; }
        r.handRequests = (r.handRequests || []).filter(function (x) { return x !== targetUid; });
        r.listeners = (r.listeners || []).filter(function (x) { return x !== targetUid; });
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/handRequests/" + targetUid).remove().catch(function () { /* */ });
        applySeatMutation(r, freeIdx, function (seat) { seat.uid = targetUid; seat.muted = false; }, "تم صعود " + resolveLiveUser(targetUid).name + " للمقعد #" + (freeIdx + 1));
        closeSheet();
      };
    });
    $("sheet").querySelectorAll("[data-reject-hand]").forEach(function (b) {
      b.onclick = function () {
        var targetUid = b.getAttribute("data-reject-hand");
        r.handRequests = (r.handRequests || []).filter(function (x) { return x !== targetUid; });
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/handRequests/" + targetUid).remove().catch(function () { /* */ });
        renderRoom(); openRoomPresenceSheet();
      };
    });
  }

  function openRoomMenu() {
    var r = getRoom(UI.roomId); if (!r) return;
    var mod = isRoomModOrOwner(r, S.me.id), isOwner = r.owner === S.me.id;
    var html = "<h3>خيارات الغرفة</h3>" + (r.desc ? '<div class="meta" style="margin-bottom:8px">' + esc(r.desc) + "</div>" : "") + '<div class="actlist"><button data-m="hide" type="button">⬇️ تصغير الغرفة (الاستمرار في الاستماع)</button><button data-m="music" type="button">🎵 مشغل الموسيقى</button><button data-m="friends" type="button">👥 دعوة الأصدقاء</button>';
    if (mod) {
      html += '<button data-m="rename" type="button">✏️ تعديل اسم ووصف الغرفة</button><button data-m="pin" type="button">📌 تثبيت رسالة / إعلان</button><button data-m="approval" type="button">' + (r.micApprovalMode ? "🔓 إيقاف وضع طلب المايك" : "✋ تفعيل وضع طلب المايك") + "</button>";
    }
    if (isOwner) html += '<button data-m="delete" class="danger" type="button">🗑️ حذف الغرفة</button>';
    html += '<button data-m="leave" class="danger" type="button">🚪 مغادرة الغرفة</button></div>';
    openSheet(html);
    $("sheet").querySelectorAll("[data-m]").forEach(function (b) {
      b.onclick = async function () {
        var m = b.getAttribute("data-m");
        if (m === "hide") { minimizeRoomToFloatingOrb(); return; }
        if (m === "music") { openMusicSheet(); return; }
        if (m === "friends") { openRoomFriendsInviteSheet(); return; }
        if (m === "rename") { openRenameRoomSheet(r); return; }
        closeSheet();
        if (m === "pin") {
          var p = prompt("اكتب الإعلان المثبت (أو اتركه فارغاً للإزالة):", r.pinned || "");
          if (p !== null) {
            r.pinned = clean(p.trim());
            if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/pinned").set(r.pinned).catch(function () { /* */ });
            renderRoom(); toast("تم تحديث التثبيت");
          }
        } else if (m === "approval") {
          r.micApprovalMode = !r.micApprovalMode;
          if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/micApprovalMode").set(r.micApprovalMode).catch(function () { /* */ });
          renderRoom(); toast(r.micApprovalMode ? "تم تفعيل وضع طلب المايك" : "تم إيقاف وضع طلب المايك");
        } else if (m === "delete") {
          if (!isOwner) { toast("حذف الغرفة متاح لمالك الغرفة فقط"); return; }
          var rid = r.id;
          S.rooms = (S.rooms || []).filter(function (x) { return x && x.id !== rid; });
          await leaveRoom(true);
          if (cloud.on && cloud.db && !UI.isGuest) {
            try { await cloud.db.ref("rooms/" + rid).remove(); } catch (_) {}
            try { await cloud.db.ref("roomMessages/" + rid).remove(); } catch (_) {}
            try { await cloud.db.ref("userRoomIndex/" + S.me.id).transaction(function (curr) { return curr === rid ? null : curr; }); } catch (_) {}
          }
          saveLocal(); renderAll(); toast("تم حذف الغرفة");
        } else if (m === "leave") { await leaveRoom(true); }
      };
    });
  }

  function openMusicSheet() {
    var r = getRoom(UI.roomId || UI.floatingRoomId); if (!r) return;
    var canCtrl = canControlRoomMusic(r), pl = Array.isArray(r.playlist) && r.playlist.length ? r.playlist : DEFAULT_TRACKS;
    var curPlaying = !!(r.music && r.music.playing && r.music.url), curPosSec = Math.floor(computeMusicPositionSec(r.music));
    var curTitle = (r.music && r.music.title) || "لا يوجد مقطع قيد التشغيل";

    var html = "<h3>🎵 مشغل موسيقى الغرفة</h3><div class='row glass' style='margin-bottom:8px'><div class='info'><div class='name'>" + esc(curTitle) + "</div><div class='meta'>" + (curPlaying ? "▶ يعمل الآن (" + curPosSec + " ثانية) • متزامن للجميع" : "⏸ متوقف") + " • " + (canCtrl ? "لديك صلاحية التحكم" : "مستمع") + '</div></div><div class="row-actions">' + (canCtrl ? '<button class="btn sm ' + (curPlaying ? "ghost" : "ok") + '" id="m-play-pause" type="button">' + (curPlaying ? "⏸ إيقاف" : "▶ تشغيل") + "</button>" : "") + "</div></div>" +
      '<div class="switchrow"><span>مستوى صوت الموسيقى (' + Math.round((UI.musicVolume || 0.7) * 100) + '%)</span><input type="range" id="m-vol-slider" min="0" max="100" value="' + Math.round((UI.musicVolume || 0.7) * 100) + '" style="width:120px" /></div>' +
      "<label>قائمة الأغاني</label>" + pl.map(function (t, idx) {
        return '<div class="track-row" data-track-idx="' + idx + '"><div style="font-size:22px">' + esc(t.cover || "🎵") + '</div><div class="info"><div class="name">' + esc(t.title) + '</div><div class="meta">' + esc(t.artist || "مقطع صوتي") + "</div></div>" + (canCtrl ? '<button class="btn sm" type="button">▶ تشغيل</button>' : "") + "</div>";
      }).join("");

    if (canCtrl) {
      html += "<label style='margin-top:10px'>إضافة أغنية جديدة (عنوان + رابط MP3 مباشر)</label><input id='m-new-title' placeholder='اسم الأغنية' style='margin-bottom:6px' /><input id='m-new-url' placeholder='https://example.com/song.mp3' /><button class='btn sm block' id='m-add-track' type='button'>+ إضافة للقائمة وتشغيلها</button>";
    }
    openSheet(html);

    if ($("m-vol-slider")) {
      $("m-vol-slider").oninput = function () {
        UI.musicVolume = Number(this.value) / 100;
        if (musicState.roomAudio) { try { musicState.roomAudio.volume = UI.musicVolume; } catch (e) { /* */ } }
      };
    }
    if ($("m-play-pause") && canCtrl) {
      $("m-play-pause").onclick = function () {
        if (curPlaying) {
          setRoomMusicRemote(r.id, { url: r.music.url, title: r.music.title, artist: r.music.artist || "", playing: false, positionSec: computeMusicPositionSec(r.music), updatedAt: now() });
        } else {
          var first = (r.music && r.music.url) ? r.music : pl[0];
          if (!first || !first.url) { toast("أضف رابط أغنية أولاً"); return; }
          setRoomMusicRemote(r.id, { url: first.url, title: first.title, artist: first.artist || "", playing: true, positionSec: computeMusicPositionSec(r.music), updatedAt: now() });
        }
        openMusicSheet();
      };
    }
    $("sheet").querySelectorAll("[data-track-idx]").forEach(function (row) {
      row.onclick = function () {
        if (!canCtrl) { toast("التحكم بالموسيقى متاح لمالك الغرفة والمشرفين فقط"); return; }
        var idx = Number(row.getAttribute("data-track-idx")), tr = pl[idx];
        if (!tr || !tr.url) return;
        setRoomMusicRemote(r.id, { url: tr.url, title: tr.title, artist: tr.artist || "", playing: true, positionSec: 0, updatedAt: now() });
        openMusicSheet(); toast("تم تشغيل «" + tr.title + "» للجميع 🎵");
      };
    });
    if ($("m-add-track") && canCtrl) {
      $("m-add-track").onclick = function () {
        var title = clean(($("m-new-title").value || "").trim()), url = ($("m-new-url").value || "").trim();
        if (!title || !/^https?:\/\/\S+/i.test(url)) { toast("أدخل عنواناً ورابطاً صحيحاً يبدأ بـ http أو https"); return; }
        var newTrack = { id: uid(), title: title, artist: "مضافة للغرفة", cover: "🎶", url: url };
        r.playlist = (Array.isArray(r.playlist) ? r.playlist : DEFAULT_TRACKS.slice()).concat([newTrack]);
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/playlist").set(r.playlist).catch(function () { /* */ });
        setRoomMusicRemote(r.id, { url: newTrack.url, title: newTrack.title, artist: newTrack.artist, playing: true, positionSec: 0, updatedAt: now() });
        openMusicSheet(); toast("تمت إضافة وتشغيل «" + title + "» ✅");
      };
    }
  }

  function openEmojiSheet(onPick) {
    openSheet("<h3>😀 اختر إيموجي</h3><div class='emojigrid'>" + EMOJIS.map(function (e) { return '<button type="button">' + e + "</button>"; }).join("") + "</div>");
    $("sheet").querySelectorAll("button").forEach(function (b) { b.onclick = function () { closeSheet(); onPick(b.textContent); }; });
  }
  function openStickerSheet(onPick) {
    openSheet("<h3>🎭 اختر ملصقاً</h3><div class='giftgrid'>" + STICKERS.map(function (s) { return '<div class="gift" data-s="' + esc(s.e) + '"><div class="e">' + s.e + "</div><small>" + esc(s.n) + "</small></div>"; }).join("") + "</div>");
    $("sheet").querySelectorAll("[data-s]").forEach(function (el) { el.onclick = function () { closeSheet(); onPick(el.getAttribute("data-s")); }; });
  }

  function openGiftSheet(preselectedTargetId) {
    var r = getRoom(UI.roomId || UI.floatingRoomId), targets = [];
    if (r) {
      var seen = {};
      r.seats.forEach(function (s, i) {
        if (s.uid && s.uid !== S.me.id && !seen[s.uid] && !isBlockedEitherWay(s.uid)) {
          seen[s.uid] = true;
          targets.push({ id: s.uid, label: resolveLiveUser(s.uid).name + " (#" + (i + 1) + ")" });
        }
      });
      (r.listeners || []).forEach(function (lid) {
        if (lid && lid !== S.me.id && !seen[lid] && !isBlockedEitherWay(lid)) {
          seen[lid] = true;
          targets.push({ id: lid, label: resolveLiveUser(lid).name + " (مستمع)" });
        }
      });
    }
    if (preselectedTargetId && preselectedTargetId !== S.me.id && !isBlockedEitherWay(preselectedTargetId) && !targets.some(function (t) { return t.id === preselectedTargetId; })) {
      targets.unshift({ id: preselectedTargetId, label: resolveLiveUser(preselectedTargetId).name });
    }
    if (!targets.length) { toast("لا يوجد مستخدمون آخرون متاحون للإهداء حالياً"); return; }
    UI.giftTarget = (preselectedTargetId && targets.some(function (t) { return t.id === preselectedTargetId; })) ? preselectedTargetId : targets[0].id;
    var myVip = getEffectiveVip(S.me), gifts = getActiveGifts();
    if (!gifts.some(function (g) { return g.id === UI.giftSel; })) UI.giftSel = gifts[0].id;

    var coinBal = Math.max(0, Number(S && S.me && S.me.coins || 0));
    openSheet("<h3>🎁 إرسال هدية</h3><div class='rv-gift-wallet'>رصيدك الحالي: <b id='gift-sheet-coins'>" + coinBal.toLocaleString("en-US") + "</b> 🪙</div><label>اختر المستلم</label><div class='gift-targets-bar'>" + targets.map(function (t) { var tu = resolveLiveUser(t.id); return '<button class="gt-photo ' + (t.id === UI.giftTarget ? "sel" : "") + '" data-gt="' + esc(t.id) + '" type="button">' + avatarHTML(tu, "sm") + '<span>' + esc(tu.name || t.label) + '</span></button>'; }).join("") + "</div><label>اختر الهدية</label><div class='giftgrid'>" + gifts.map(function (g) { var price = Number(g.p != null ? g.p : (GIFT_COIN_PRICES[g.id] || 10)); return '<div class="gift ' + (g.id === UI.giftSel ? "sel" : "") + '" data-g="' + esc(g.id) + '"><div class="e">' + g.e + "</div><small>" + esc(g.n) + '</small><span class="p">' + price + " 🪙</span></div>"; }).join("") + "</div><button class='btn gold block' id='send-gift-go' type='button'>إرسال الهدية الآن 🎁</button>");

    $("sheet").querySelectorAll("[data-gt]").forEach(function (el) {
      el.onclick = function () {
        UI.giftTarget = el.getAttribute("data-gt");
        $("sheet").querySelectorAll("[data-gt]").forEach(function (x) { x.classList.toggle("sel", x === el); });
      };
    });
    $("sheet").querySelectorAll("[data-g]").forEach(function (el) {
      el.onclick = function () {
        UI.giftSel = el.getAttribute("data-g");
        $("sheet").querySelectorAll("[data-g]").forEach(function (x) { x.classList.toggle("sel", x === el); });
      };
    });

    $("send-gift-go").onclick = async function () {
      var btn = $("send-gift-go");
      if (btn.disabled) return;
      var g = gifts.find(function (x) { return x.id === UI.giftSel; }) || gifts[0];
      if (!g) return;
      var gPrice = Number(g.p != null ? g.p : (GIFT_COIN_PRICES[g.id] || 10));
      if (Number(g.vipMin || 0) > myVip) {
        toast("هذه الهدية تتطلب عضوية VIP " + g.vipMin + " أو أعلى");
        return;
      }
      if (!UI.giftTarget || UI.giftTarget === S.me.id) {
        toast("اختر مستلماً آخر");
        return;
      }
      if (isBlockedEitherWay(UI.giftTarget)) {
        toast("تعذر إرسال الهدية بسبب وجود حظر");
        return;
      }
      var targetU = resolveLiveUser(UI.giftTarget);
      if (UI.isGuest) {
        toast("إرسال الهدايا بالعملات متاح للحسابات المسجلة فقط");
        return;
      }
      btn.disabled = true;
      btn.textContent = "جارٍ الإرسال...";
      var apiRes = await callEconomyApi("sendGift", {
        toUid: UI.giftTarget,
        giftId: g.id,
        giftName: g.n,
        emoji: g.e,
        price: gPrice,
        roomId: r ? r.id : null
      });
      if (!apiRes.ok) {
        toast(apiRes.error || "رصيدك غير كافٍ أو تعذر إرسال الهدية");
        btn.disabled = false;
        btn.textContent = "إرسال الهدية الآن 🎁";
        return;
      }
      if (apiRes.balance != null) {
        S.me.coins = Math.max(0, Number(apiRes.balance || 0));
      } else {
        S.me.coins = Math.max(0, Number(S.me.coins || 0) - gPrice);
      }
      S.me.xp = Number(S.me.xp || 0) + Math.max(5, Math.round(gPrice / 5));
      var eventId = apiRes.eventId || ("gift_" + now() + "_" + Math.random().toString(36).slice(2, 7));
      seenGiftEventIds[eventId] = true;
      save();
      closeSheet();
      renderTop();
      if (UI.page === "profile") renderProfile();
      if (UI.roomId) renderRoom();
      if (r) {
        pushRoomMsg(r, {
          from: S.me.id,
          fromName: S.me.name || "مستخدم",
          text: "أهدى " + g.e + " " + g.n + " (" + gPrice + " 🪙) إلى " + targetU.name,
          gift: { eventId: eventId, emoji: g.e, fromUid: S.me.id, fromName: S.me.name || "مستخدم", toUid: UI.giftTarget, toName: targetU.name }
        });
      }
      showFlyGiftToSeat(g.e, S.me.name || "مستخدم", UI.giftTarget, targetU.name);
      toast("تم إرسال " + g.e + " " + g.n + " إلى " + targetU.name + " ✅");
    };
  }

  function openUserProfileSheet(targetId) {
    if (!targetId) return;
    if (targetId === S.me.id) { go("profile"); return; }
    var u = resolveLiveUser(targetId), vipLv = getEffectiveVip(u), rel = getRelationshipStatus(targetId), curRoom = findUserCurrentRoom(targetId);
    var rawMap = (u && u.receivedGifts && typeof u.receivedGifts === "object") ? u.receivedGifts : {}, maps = getGiftMaps(), gItems = [];
    Object.keys(rawMap).forEach(function (k) {
      var qty = Math.max(0, Math.floor(Number(rawMap[k] || 0)));
      if (!qty) return;
      var def = maps.byId[k] || maps.byEmoji[k];
      gItems.push('<span class="tag">' + (def ? def.e + " " + esc(def.n) : "🎁 " + esc(k)) + " ×" + qty + "</span>");
    });

    var actionButtonsHtml = "";
    if (rel.state === "blocked_by_me") actionButtonsHtml = '<button class="btn sm ok" data-unblock-user="' + esc(targetId) + '" type="button">🔓 إلغاء الحظر</button>';
    else if (rel.state === "blocked_by_them") actionButtonsHtml = '<span class="tag">الحساب غير متاح</span>';
    else {
      actionButtonsHtml += '<button class="btn sm ghost" data-follow-user="' + esc(targetId) + '" type="button">' + (rel.following ? "إلغاء المتابعة" : "+ متابعة") + "</button>";
      if (rel.state === "friends") {
        actionButtonsHtml += '<button class="btn sm" data-dm="' + esc(targetId) + '" type="button">💬 مراسلة خاصة</button><button class="btn sm red" data-remove-friend="' + esc(targetId) + '" type="button">إزالة الصديق</button>';
      } else if (rel.state === "request_sent") actionButtonsHtml += '<button class="btn sm ghost" data-cancelfreq="' + esc(targetId) + '" type="button">طلب صداقة مرسل (إلغاء)</button>';
      else if (rel.state === "request_received") actionButtonsHtml += '<button class="btn sm ok" data-accept="' + esc(targetId) + '" type="button">قبول طلب الصداقة</button><button class="btn sm ghost" data-reject="' + esc(targetId) + '" type="button">رفض</button>';
      else actionButtonsHtml += '<button class="btn sm" data-addfriend="' + esc(targetId) + '" type="button">+ إضافة صديق</button>';
      actionButtonsHtml += '<button class="btn sm gold" data-gift-to="' + esc(targetId) + '" type="button">🎁 إرسال هدية</button><button class="btn sm red" data-block-user="' + esc(targetId) + '" type="button">🚫 حظر</button><button class="btn sm ghost" id="prof-report-btn" type="button">🚩 إبلاغ</button>';
    }

    openSheet('<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">' + avatarHTML(u, "lg") + '<div class="info"><div class="' + (vipLv >= 2 ? "name vip-gold" : "name") + '" style="font-size:17px">' + esc(u.name) + (vipLv > 0 ? ' <span class="tag vip">VIP ' + vipLv + "</span>" : "") + (u.verified ? ' <span class="tag verified">✓</span>' : "") + '</div><div class="meta">ID: ' + esc(displayUserId(u)) + ' • <span class="tag rel">' + esc(rel.label) + "</span></div>" + (u.gender || u.age ? '<div class="meta">' + (u.gender ? esc(u.gender) : "") + (u.gender && u.age ? " • " : "") + (u.age ? esc(u.age) + " سنة" : "") + "</div>" : "") + (curRoom ? '<span class="room-pill-tag" data-enter="' + esc(curRoom.id) + '">🎙️ متواجد في: ' + esc(curRoom.name) + "</span>" : "") + '</div></div><div class="pf-bio-box" style="margin-bottom:10px">' + esc(u.bio || "لا توجد نبذة تعريفية") + '</div><div class="stats-grid"><div class="stat-box"><b>' + Number(u.followersCount || 0) + '</b><span>المتابعون</span></div><div class="stat-box"><b>' + Number(u.followingCount || 0) + '</b><span>أتابع</span></div><div class="stat-box"><b>' + Number(u.friendsCount || 0) + "</b><span>الأصدقاء</span></div></div>" + (gItems.length ? '<div style="margin-bottom:10px"><label>🎁 هدايا الحساب</label><div style="display:flex;gap:6px;flex-wrap:wrap">' + gItems.join("") + "</div></div>" : "") + '<div class="row-actions">' + actionButtonsHtml + "</div>");

    if ($("prof-report-btn")) {
      $("prof-report-btn").onclick = function () {
        var reason = prompt("اكتب سبب البلاغ ضد " + u.name + ":");
        if (reason && reason.trim()) { submitUserReport(targetId, reason.trim()); closeSheet(); }
      };
    }
  }

  function markThreadMessagesRead(peerId) {
    if (!peerId) return;
    S.unread[peerId] = 0;
    var list = S.dms[peerId] || [], tid = dmThreadId(S.me.id, peerId);
    list.forEach(function (m) {
      if (m && m.from !== S.me.id && !m.read) {
        m.read = true; m.status = "seen";
        if (cloud.on && cloud.db && !UI.isGuest && m.key) cloud.db.ref("dms/" + tid + "/" + m.key).update({ read: true, status: "seen" }).catch(function () { /* */ });
      }
    });
  }

  function openDM(id) {
    if (!id || id === S.me.id) return;
    if (isBlockedEitherWay(id)) { toast("لا يمكنك فتح محادثة لوجود حظر"); return; }
    if (!isFriendWith(id)) { toast("المحادثة الخاصة متاحة للأصدقاء فقط — أرسل طلب صداقة أولاً"); return; }
    closeSheet();
    if (UI.roomId) minimizeRoomToFloatingOrb();
    UI.dmId = id;
    if (!UI.dmLimits[id]) UI.dmLimits[id] = CONFIG.dmInitialLimit;
    if (!Array.isArray(S.dms[id])) S.dms[id] = [];
    markThreadMessagesRead(id);
    if (cloud.on && cloud.db && !UI.isGuest) {
      cloud.db.ref("userDms/" + S.me.id + "/" + id).set(true).catch(function () { /* */ });
      cloud.db.ref("userDms/" + id + "/" + S.me.id).set(true).catch(function () { /* */ });
      attachDmThreadListener(S.me.id, id, UI.dmLimits[id]);
    }
    var u = resolveLiveUser(id);
    setAvatarEl($("chat-avatar"), u);
    $("chat-title").textContent = u.name;
    $("chat-sub").textContent = "صديق • ID: " + displayUserId(u) + " • " + (u.online ? "متصل" : "غير متصل");
    $("chat-view").classList.add("open");
    saveLocal(); renderDM(); renderTop();
  }

  function closeDM() {
    UI.dmId = null;
    if ($("chat-view")) $("chat-view").classList.remove("open");
    renderMessages(); renderTop();
  }

  function renderDM() {
    var id = UI.dmId; if (!id) return;
    if (!isFriendWith(id) || isBlockedEitherWay(id)) { closeDM(); return; }
    var box = $("chat-msgs"), list = (S.dms[id] || []).filter(function (m) { return !m.from || !isBlockedEitherWay(m.from); });
    var olderBtn = list.length >= (UI.dmLimits[id] || CONFIG.dmInitialLimit) ? '<button class="btn sm ghost" id="dm-load-older" style="align-self:center;margin-bottom:6px" type="button">⬆️ تحميل رسائل أقدم</button>' : "";
    box.innerHTML = olderBtn + list.map(function (m) {
      var me = m.from === S.me.id, body = "";
      if (m.audio) body = '<audio controls src="' + esc(m.audio) + '" style="max-width:210px;height:34px"></audio>';
      else if (m.img) body = '<img src="' + esc(m.img) + '" style="max-width:190px;border-radius:10px;display:block" loading="lazy" />';
      else {
        body = esc(m.text);
        if (m.inviteRoomId) body += '<div><button class="invite-join-chip" data-join-invite="' + esc(m.inviteRoomId) + '" type="button">🎙️ دخول الغرفة</button></div>';
      }
      var stIcon = me ? (m.read || m.status === "seen" ? " ✓✓" : " ✓") : "";
      return '<div class="msg ' + (me ? "me" : "") + '"><div>' + body + '</div><div class="tm">' + timeStr(m.t) + stIcon + "</div></div>";
    }).join("");
    if ($("dm-load-older")) {
      $("dm-load-older").onclick = function () {
        UI.dmLimits[id] = (UI.dmLimits[id] || CONFIG.dmInitialLimit) + CONFIG.dmPageStep;
        attachDmThreadListener(S.me.id, id, UI.dmLimits[id]);
      };
    }
    box.querySelectorAll("[data-join-invite]").forEach(function (btn) {
      btn.onclick = function () { var rid = btn.getAttribute("data-join-invite"); closeDM(); enterRoom(rid); };
    });
    box.scrollTop = box.scrollHeight;
  }

  async function sendDM(payload) {
    var id = UI.dmId; if (!id) return;
    if (isBlockedEitherWay(id)) { toast("لا يمكن الإرسال لوجود حظر"); return; }
    if (!isFriendWith(id)) { toast("المحادثة الخاصة متاحة للأصدقاء فقط"); closeDM(); return; }
    if (!allowActionRateLimit()) return;
    var msgObj = typeof payload === "string" ? { text: clean(payload.trim()) } : Object.assign({}, payload);
    if (msgObj.text !== undefined && !msgObj.text && !msgObj.img && !msgObj.audio) return;
    msgObj.from = S.me.id; msgObj.to = id; msgObj.status = "sent"; msgObj.read = false; msgObj.t = now();
    if (!Array.isArray(S.dms[id])) S.dms[id] = [];
    S.dms[id].push(msgObj);
    saveLocal(); renderDM(); renderMessages();
    if (cloud.on && cloud.db && !UI.isGuest) {
      try {
        var tid = dmThreadId(S.me.id, id);
        await cloud.db.ref("userDms/" + S.me.id + "/" + id).set(true);
        await cloud.db.ref("userDms/" + id + "/" + S.me.id).set(true);
        var pushed = await cloud.db.ref("dms/" + tid).push(msgObj);
        msgObj.key = pushed.key;
        saveLocal();
      } catch (e) { toast("تعذر إرسال الرسالة سحابياً"); }
    }
  }

  async function toggleDmVoiceNote() {
    if (!UI.dmId) return;
    if (!isFriendWith(UI.dmId) || isBlockedEitherWay(UI.dmId)) { toast("الإرسال الصوتي متاح للأصدقاء غير المحظورين فقط"); return; }
    var btn = $("chat-voice");
    if (!isRecordingDm) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { toast("المتصفح لا يدعم تسجيل الصوت"); return; }
      try {
        var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        dmChunks = [];
        dmRecorder = new MediaRecorder(stream);
        dmRecorder.ondataavailable = function (ev) { if (ev.data && ev.data.size > 0) dmChunks.push(ev.data); };
        dmRecorder.onstop = function () {
          stream.getTracks().forEach(function (tr) { tr.stop(); });
          var blob = new Blob(dmChunks, { type: "audio/webm" });
          if (blob.size > 900000) { toast("الرسالة الصوتية طويلة جداً"); return; }
          var reader = new FileReader();
          reader.onload = function () { sendDM({ audio: String(reader.result || "") }); };
          reader.readAsDataURL(blob);
        };
        dmRecorder.start(); isRecordingDm = true;
        if (btn) btn.classList.add("rec-on");
        toast("🎙️ جاري التسجيل... اضغط مرة أخرى للإرسال");
      } catch (e) { toast("تعذر الوصول للميكروفون"); }
    } else {
      isRecordingDm = false;
      if (btn) btn.classList.remove("rec-on");
      try { if (dmRecorder && dmRecorder.state !== "inactive") dmRecorder.stop(); } catch (e) { /* */ }
    }
  }

  function openNotifications() {
    var list = S.notifs || [];
    (S.notifs || []).forEach(function (n) { n.read = true; });
    saveLocal(); renderTop();
    openSheet("<h3>🔔 الإشعارات</h3>" + (list.length ? '<div class="list">' + list.slice(0, 25).map(function (n) {
      return '<div class="row glass"><div class="info"><div class="name">' + esc(n.text) + '</div><div class="meta">' + timeStr(n.t) + "</div></div></div>";
    }).join("") + '</div><button class="btn sm ghost block" id="clear-notifs" type="button">مسح الإشعارات</button>' : '<div class="empty">لا توجد إشعارات بعد</div>'));
    if ($("clear-notifs")) {
      $("clear-notifs").onclick = function () { S.notifs = []; saveLocal(); renderTop(); openNotifications(); };
    }
  }

  function bindEvents() {
    $("google-login-btn").onclick = signInWithGoogleApp;
    $("guest-login-btn").onclick = startWithoutGoogle;
    $("ob-back-login-btn").onclick = async function () {
      setGuestSession(false); UI.googleUser = null;
      if (cloud.on && cloud.auth && cloud.auth.currentUser) { try { await cloud.auth.signOut(); } catch (e) { /* */ } }
      showAuthGate(true, "login");
    };
    $("ob-photo-input").onchange = async function () {
      var f = this.files && this.files[0]; if (!f) return;
      try { UI.onboardPhoto = await readImageFileAsDataUrl(f, 180, 0.55); renderOnboardPreview(); toast("تم اختيار الصورة الشخصية ✅"); }
      catch (e) { setOnboardError(e.message); toast(e.message); }
    };
    $("ob-name").oninput = renderOnboardPreview;
    document.querySelectorAll(".gender-pill").forEach(function (pill) {
      pill.onclick = function () {
        UI.onboardGender = pill.getAttribute("data-gender") || "ذكر";
        document.querySelectorAll(".gender-pill").forEach(function (p) { p.classList.toggle("active", p === pill); });
      };
    });
    $("ob-submit-btn").onclick = completeOnboarding;

    document.querySelectorAll(".navbtn").forEach(function (b) { b.onclick = function () { go(b.getAttribute("data-page")); }; });
    $("avatar-top").onclick = function () { go("profile"); };
    $("theme-toggle-btn").onclick = function () {
      S.settings.lightTheme = !S.settings.lightTheme;
      applyThemeMode(); saveLocal(); renderTop();
    };
    $("notif-btn").onclick = openNotifications;
    if ($("gift-cup-banner")) $("gift-cup-banner").onclick = openGiftCupSheet;
    if ($("gift-cup-back")) $("gift-cup-back").onclick = closeGiftCupPage;

    $("search-input").oninput = function () { UI.query = this.value; renderHome(); };
    $("search-go-btn").onclick = function () { UI.query = $("search-input").value; renderHome(); };
    $("search-clear-btn").onclick = function () { $("search-input").value = ""; UI.query = ""; renderHome(); };
    document.querySelectorAll("#home-tabs .tab").forEach(function (t) { t.onclick = function () { UI.filter = t.getAttribute("data-filter"); renderHome(); }; });
    $("refresh-rooms").onclick = function () { renderHome(); toast("تم تحديث الغرف"); };

    document.querySelectorAll("#rooms-tabs .tab").forEach(function (t) { t.onclick = function () { UI.rfilter = t.getAttribute("data-rfilter"); renderRooms(); }; });
    $("fab-create").onclick = openCreateRoom;

    document.querySelectorAll("#friends-tabs .tab").forEach(function (t) { t.onclick = function () { UI.ftab = t.getAttribute("data-ftab"); renderFriends(); }; });
    $("find-input").oninput = function () { UI.findQ = this.value; renderFriends(); };

    document.querySelectorAll("#profile-subtabs .tab").forEach(function (t) {
      t.onclick = function () {
        UI.pftab = t.getAttribute("data-pftab") || "overview";
        UI.pfSocialQ = ""; UI.pfSocialLimit = CONFIG.socialPageSize;
        if ($("pf-social-search")) $("pf-social-search").value = "";
        renderProfile();
      };
    });
    if ($("pf-social-search")) $("pf-social-search").oninput = function () { UI.pfSocialQ = this.value; renderProfileSocialTab(); };
    $("pf-vip-btn").onclick = openVipSheet;
    $("pf-settings-btn").onclick = openProfileSettingsSheet;
    if ($("pf-wallet-open")) $("pf-wallet-open").onclick = openWalletSheet;
    if ($("room-wallet-open")) $("room-wallet-open").onclick = openWalletSheet;
    if ($("pf-admin-btn")) $("pf-admin-btn").onclick = openAdminPanelSheet;
    if ($("pf-blocked-btn")) $("pf-blocked-btn").onclick = function () { openSocialListSheet("blocked"); };
    $("pf-copy-id").onclick = function () {
      var idTxt = displayUserId(S.me);
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(idTxt).catch(function () { /* */ });
      toast("تم نسخ ID: " + idTxt);
    };
    $("pf-stat-followers-btn").onclick = function () { UI.pftab = "followers"; renderProfile(); };
    $("pf-stat-following-btn").onclick = function () { UI.pftab = "following"; renderProfile(); };
    $("pf-stat-friends-btn").onclick = function () { UI.pftab = "friends"; renderProfile(); };

    $("room-back").onclick = minimizeRoomToFloatingOrb;
    $("floating-orb-label").onclick = function () { if (UI.floatingRoomId) enterRoom(UI.floatingRoomId); };
    $("floating-orb-avatar").onclick = function () { if (UI.floatingRoomId) enterRoom(UI.floatingRoomId); };
    $("floating-orb-leave").onclick = function (e) { e.stopPropagation(); leaveRoom(false); };
    $("room-presence-btn").onclick = openRoomPresenceSheet;
    $("room-friends-btn").onclick = openRoomFriendsInviteSheet;
    $("room-speaker-btn").onclick = function () {
      UI.roomSpeakerMuted = !UI.roomSpeakerMuted;
      applyRoomSpeakerMuteState();
      toast(UI.roomSpeakerMuted ? "تم كتم صوت الغرفة والسماعات" : "تم تشغيل صوت الغرفة والسماعات 🔊");
    };
    if ($("room-leave-top")) $("room-leave-top").onclick = function () { leaveRoom(true); };
    $("audio-unlock-btn").onclick = function () { resumeAllRemoteAudioTracks(); };
    $("room-menu").onclick = openRoomMenu;
    $("mmini-toggle").onclick = function () {
      var r = getRoom(UI.roomId || UI.floatingRoomId);
      if (!r || !r.music || !r.music.url || !canControlRoomMusic(r)) { toast("التحكم بالموسيقى متاح لمالك الغرفة والمشرفين فقط"); return; }
      var nowPlay = !r.music.playing;
      setRoomMusicRemote(r.id, { url: r.music.url, title: r.music.title, artist: r.music.artist || "", playing: nowPlay, positionSec: computeMusicPositionSec(r.music), updatedAt: now() });
    };
    $("mmini-skip").onclick = function () {
      var r = getRoom(UI.roomId || UI.floatingRoomId);
      if (!r || !r.music || !canControlRoomMusic(r)) { toast("التحكم بالموسيقى متاح لمالك الغرفة والمشرفين فقط"); return; }
      var pl = Array.isArray(r.playlist) && r.playlist.length ? r.playlist : DEFAULT_TRACKS;
      var idx = pl.findIndex(function (t) { return t.url === r.music.url; });
      var next = pl[(idx + 1) % pl.length];
      if (next) setRoomMusicRemote(r.id, { url: next.url, title: next.title, artist: next.artist || "", playing: true, positionSec: 0, updatedAt: now() });
    };
    $("mmini-open").onclick = openMusicSheet;

    $("room-seats").onclick = function (e) {
      var seat = e.target.closest(".seat");
      if (seat) onSeatClick(Number(seat.getAttribute("data-seat")));
    };
    $("mic-btn").onclick = function () {
      var r = getRoom(UI.roomId); if (!r) return;
      var idx = seatIndexOf(r, S.me.id);
      if (idx < 0) {
        if (r.micApprovalMode && !isRoomModOrOwner(r, S.me.id)) {
          if (!Array.isArray(r.handRequests)) r.handRequests = [];
          if (r.handRequests.indexOf(S.me.id) < 0) {
            r.handRequests.push(S.me.id);
            if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/handRequests/" + S.me.id).set(true).catch(function () { /* */ });
            renderRoom(); toast("تم إرسال طلب الصعود للمايك ✋");
          } else toast("طلبك قيد الانتظار لدى إدارة الغرفة");
          return;
        }
        var free = r.seats.findIndex(function (s) { return !s.uid && !s.locked; });
        if (free < 0) { toast("لا يوجد مقعد فارغ"); return; }
        UI.micMuted = false;
        r.listeners = (r.listeners || []).filter(function (x) { return x !== S.me.id; });
        applySeatMutation(r, free, function (seat) { seat.uid = S.me.id; seat.muted = false; }, "صعدت إلى المقعد #" + (free + 1) + " 🎙️");
        return;
      }
      UI.micMuted = !UI.micMuted;
      if (!UI.micMuted) r.seats[idx].muted = false;
      applySeatMutation(r, idx, function (seat) { if (!UI.micMuted) seat.muted = false; }, UI.micMuted ? "تم كتم الميكروفون" : "تم فتح الميكروفون");
    };
    if ($("raise-hand-btn")) {
      $("raise-hand-btn").onclick = function () {
        var r = getRoom(UI.roomId); if (!r) return;
        if (!Array.isArray(r.handRequests)) r.handRequests = [];
        var idx = r.handRequests.indexOf(S.me.id);
        if (idx >= 0) {
          r.handRequests.splice(idx, 1);
          if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/handRequests/" + S.me.id).remove().catch(function () { /* */ });
          renderRoom(); toast("تم إلغاء طلب المايك");
        } else {
          r.handRequests.push(S.me.id);
          if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/handRequests/" + S.me.id).set(true).catch(function () { /* */ });
          renderRoom(); toast("تم رفع اليد لطلب المايك ✋");
        }
      };
    }

    function sendRoomText() {
      var r = getRoom(UI.roomId), inp = $("room-input");
      if (!r || !inp) return;
      var txt = inp.value.trim();
      if (!txt) return;
      if (!allowActionRateLimit()) return;
      inp.value = "";
      pushRoomMsg(r, { from: S.me.id, fromName: S.me.name || "مستخدم", text: clean(txt) });
    }
    $("room-send").onclick = sendRoomText;
    $("room-input").onkeydown = function (e) { if (e.key === "Enter") sendRoomText(); };
    $("room-emoji").onclick = function () { openEmojiSheet(function (em) { $("room-input").value += em; $("room-input").focus(); }); };
    $("room-sticker").onclick = function () {
      openStickerSheet(function (st) {
        var r = getRoom(UI.roomId); if (!r) return;
        pushRoomMsg(r, { from: S.me.id, fromName: S.me.name || "مستخدم", text: st });
      });
    };
    $("room-music").onclick = openMusicSheet;
    $("room-gift").onclick = function () { openGiftSheet(); };

    if ($("room-photo-btn")) {
      $("room-photo-btn").onclick = function () {
        var r = getRoom(UI.roomId);
        if (!r || !isRoomModOrOwner(r, S.me.id)) { toast("تغيير صورة الغرفة متاح لمالك الغرفة والمشرفين فقط"); return; }
        $("room-photo-input").click();
      };
    }
    if ($("room-photo-input")) {
      $("room-photo-input").onchange = async function () {
        var f = this.files && this.files[0]; this.value = "";
        if (!f) return;
        var r = getRoom(UI.roomId);
        if (!r || !isRoomModOrOwner(r, S.me.id)) { toast("تغيير صورة الغرفة متاح لمالك الغرفة والمشرفين فقط"); return; }
        try {
          var photoData = await readImageFileAsDataUrl(f, 360, 0.58);
          r.roomPhoto = photoData;
          if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/roomPhoto").set(photoData).catch(function () { /* */ });
          saveLocal(); renderRoom(); renderFloatingOrb(); renderHome(); renderRooms();
          toast("تم تحديث صورة الغرفة ✅");
        } catch (e) { toast(e.message); }
      };
    }
    if ($("room-chat-img")) {
      $("room-chat-img").onchange = async function () {
        var f = this.files && this.files[0]; this.value = "";
        var r = getRoom(UI.roomId);
        if (!f || !r) return;
        try {
          var imgData = await readImageFileAsDataUrl(f, 280, 0.52);
          pushRoomMsg(r, { from: S.me.id, fromName: S.me.name || "مستخدم", img: imgData });
        } catch (e) { toast(e.message); }
      };
    }

    $("chat-back").onclick = closeDM;
    function sendDmText() {
      var inp = $("chat-input");
      if (!inp) return;
      var txt = inp.value.trim();
      if (!txt) return;
      inp.value = "";
      sendDM(txt);
    }
    $("chat-send").onclick = sendDmText;
    $("chat-input").onkeydown = function (e) { if (e.key === "Enter") sendDmText(); };
    $("chat-emoji").onclick = function () { openEmojiSheet(function (em) { $("chat-input").value += em; $("chat-input").focus(); }); };
    $("chat-voice").onclick = toggleDmVoiceNote;
    $("chat-photo").onclick = function () { $("chat-img-input").click(); };
    $("chat-img-input").onchange = async function () {
      var f = this.files && this.files[0]; this.value = "";
      if (!f || !UI.dmId) return;
      try { var imgData = await readImageFileAsDataUrl(f, 280, 0.52); sendDM({ img: imgData }); }
      catch (e) { toast(e.message); }
    };

    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-enter], [data-profile], [data-dm], [data-addfriend], [data-cancelfreq], [data-accept], [data-reject], [data-remove-friend], [data-follow-user], [data-block-user], [data-unblock-user], [data-gift-to], [data-invite-friend], [data-del-thread], [data-adm-ban], [data-close-rep]");
      if (!el) return;
      if (el.hasAttribute("data-enter")) enterRoom(el.getAttribute("data-enter"));
      else if (el.hasAttribute("data-profile")) openUserProfileSheet(el.getAttribute("data-profile"));
      else if (el.hasAttribute("data-dm")) openDM(el.getAttribute("data-dm"));
      else if (el.hasAttribute("data-addfriend")) sendFriendRequest(el.getAttribute("data-addfriend"));
      else if (el.hasAttribute("data-cancelfreq")) cancelFriendRequest(el.getAttribute("data-cancelfreq"));
      else if (el.hasAttribute("data-accept")) acceptFriendRequest(el.getAttribute("data-accept"));
      else if (el.hasAttribute("data-reject")) rejectFriendRequest(el.getAttribute("data-reject"));
      else if (el.hasAttribute("data-remove-friend")) removeFriend(el.getAttribute("data-remove-friend"));
      else if (el.hasAttribute("data-follow-user")) toggleFollowUser(el.getAttribute("data-follow-user"));
      else if (el.hasAttribute("data-block-user")) confirmBlockUserSheet(el.getAttribute("data-block-user"));
      else if (el.hasAttribute("data-unblock-user")) confirmUnblockUserSheet(el.getAttribute("data-unblock-user"), function () { if (UI.page === "profile") renderProfile(); });
      else if (el.hasAttribute("data-gift-to")) openGiftSheet(el.getAttribute("data-gift-to"));
      else if (el.hasAttribute("data-invite-friend")) inviteFriendToRoom(el.getAttribute("data-invite-friend"));
      else if (el.hasAttribute("data-del-thread")) { e.stopPropagation(); deleteDmThread(el.getAttribute("data-del-thread")); }
      else if (el.hasAttribute("data-adm-ban")) {
        var uidBan = el.getAttribute("data-adm-ban"), targetU = resolveLiveUser(uidBan), nextBan = !targetU.banned;
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("users/" + uidBan + "/banned").set(nextBan).catch(function () { /* */ });
        if (cloud.usersMap[uidBan]) cloud.usersMap[uidBan].banned = nextBan;
        toast(nextBan ? "تم حظر المستخدم" : "تم فك الحظر");
        openAdminPanelSheet();
      } else if (el.hasAttribute("data-close-rep")) {
        var repId = el.getAttribute("data-close-rep");
        S.reports = (S.reports || []).map(function (rp) { return rp.id === repId ? Object.assign({}, rp, { status: "closed" }) : rp; });
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("reports/" + repId + "/status").set("closed").catch(function () { /* */ });
        saveLocal(); toast("تم إغلاق البلاغ"); openAdminPanelSheet();
      }
    });

    $("scrim").onclick = closeSheet;
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    try {
      var swCode = [
        "const CACHE_NAME = 'real-voice-cache-v22';",
        "self.addEventListener('install', event => {",
        "  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(['./']).catch(() => {})).then(() => self.skipWaiting()));",
        "});",
        "self.addEventListener('activate', event => {",
        "  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));",
        "});",
        "self.addEventListener('message', event => {",
        "  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();",
        "});",
        "self.addEventListener('fetch', event => {",
        "  if (event.request.method !== 'GET') return;",
        "  const url = new URL(event.request.url);",
        "  if (url.origin !== self.location.origin) return;",
        "  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {",
        "    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));",
        "    return;",
        "  }",
        "  event.respondWith(",
        "    caches.match(event.request).then(cached => {",
        "      const networkFetch = fetch(event.request).then(res => {",
        "        if (res && res.status === 200 && res.type === 'basic') {",
        "          const clone = res.clone();",
        "          caches.open(CACHE_NAME).then(c => c.put(event.request, clone)).catch(() => {});",
        "        }",
        "        return res;",
        "      }).catch(() => cached);",
        "      return cached || networkFetch;",
        "    })",
        "  );",
        "});"
      ].join("\n");
      var blob = new Blob([swCode], { type: "application/javascript" });
      var swUrl = URL.createObjectURL(blob);
      navigator.serviceWorker.register(swUrl, { scope: "./" }).then(function (reg) {
        if (reg.waiting) {
          waitingServiceWorker = reg.waiting;
          var uBar = $("update-app-bar");
          if (uBar) uBar.classList.remove("hidden");
        }
        reg.addEventListener("updatefound", function () {
          var newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", function () {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              waitingServiceWorker = newWorker;
              var uBar = $("update-app-bar");
              if (uBar) uBar.classList.remove("hidden");
            }
          });
        });
      }).catch(function () { /* */ });
      var refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    } catch (e) { /* */ }
  }

  function init() {
    resetInMemoryStateForSession("guest_session", false);
    bindEvents();
    initPwaInstall();
    registerServiceWorker();
    renderAll();

    var cloudOk = initCloud();
    var safetyHideTimer = setTimeout(function () {
      hideSplash();
      if (!UI.authReady) showAuthGate(true, isGuestSession() ? "onboard" : "login");
    }, 3500);

    if (!cloudOk || !cloud.auth) {
      clearTimeout(safetyHideTimer);
      hideSplash();
      setAuthError("تعذر تهيئة Firebase (" + (cloud.lastInitError || "تحقق من اتصال الإنترنت") + "). يمكنك الدخول كزائر.");
      if (isGuestSession()) signInAsGuest();
      else showAuthGate(true, "login");
      return;
    }

    cloud.auth.getRedirectResult().then(async function (res) {
      if (res && res.user) {
        clearTimeout(safetyHideTimer);
        await handleAuthenticatedUser(res.user);
      }
    }).catch(function (err) {
      if (err && err.code) {
        setAuthError("خطأ أثناء العودة من Google (" + err.code + "): " + (err.message || ""));
      }
    });

    cloud.auth.onAuthStateChanged(async function (user) {
      clearTimeout(safetyHideTimer);
      if (user) {
        await handleAuthenticatedUser(user);
      } else {
        UI.googleUser = null;
        if (isGuestSession()) {
          await signInAsGuest();
        } else {
          UI.authReady = false;
          resetInMemoryStateForSession("guest_session", false);
          renderAll();
          hideSplash();
          showAuthGate(true, "login");
        }
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window);
