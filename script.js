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
  var cloud = { on: false, db: null, auth: null, usersMap: {}, roomMsgs: {}, synced: false, connected: true };
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
    if (!global.firebase || !FIREBASE_CONFIG.apiKey) return false;
    try {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      cloud.db = firebase.database();
      cloud.auth = firebase.auth();
      cloud.on = true;
      cloud.db.ref(".info/connected").on("value", function (snap) {
        cloud.connected = !!snap.val();
      });
      return true;
    } catch (e) { cloud.on = false; return false; }
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

  async function startWithoutGoogle() {
    setAuthError("");
    if (UI.authSigningIn) return;
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
        if (UI.page === "home") renderHome();
      });
      onDb("room", cloud.db.ref("roomMessages/" + id).limitToLast(100), "value", function (ms) {
        var mv = ms.val() || {}, arr = Object.keys(mv).map(function (k) { return Object.assign({ key: k }, mv[k]); });
        cloud.roomMsgs[id] = arr;
        var r = getRoom(id);
        if (r) r.msgs = arr;
        renderRoomChat();
        var last = arr[arr.length - 1];
        if (last && last.joinUser && last.joinUser.uid !== S.me.id && (now() - (last.t || 0) < 8000)) showEntryBanner(last.joinUser);
      });
      onDb("room", cloud.db.ref("giftEvents/" + id).limitToLast(40), "value", function (giftSnap) {
        var events = giftSnap.val() || {};
        Object.keys(events).forEach(function (eventId) {
          var ev = events[eventId];
          if (!ev || seenGiftEventIds[eventId]) return;
          seenGiftEventIds[eventId] = true;
          if (ev.fromUid === S.me.id || now() - Number(ev.createdAt || 0) > 20000) return;
          showFlyGiftToSeat(ev.emoji || "🎁", ev.fromName || "مستخدم", ev.toUid, ev.toName || "مستخدم");
        });
      });
    }
    joinVoiceChannel(id, seatIndexOf(room, S.me.id) >= 0 ? "publisher" : "subscriber");
  }

  async function leaveRoom(silent) {
    closeSheet(); offDb("room");
    var targetRoomId = UI.roomId || UI.floatingRoomId, room = getRoom(targetRoomId);
    var stopMusic = !(S && S.settings && S.settings.stopMusicOnLeave === false);
    UI.roomId = null; UI.roomSessionStart = 0; UI.floatingRoomId = null; UI.pendingSeatActionAt = 0;
    $("room-view").classList.remove("open");
    renderFloatingOrb();
    await leaveVoiceChannel(false);

    if (room) {
      var si = seatIndexOf(room, S.me.id);
      if (si >= 0) { room.seats[si].uid = null; room.seats[si].muted = false; }
      room.listeners = (room.listeners || []).filter(function (x) { return x !== S.me.id; });
      room.handRequests = (room.handRequests || []).filter(function (x) { return x !== S.me.id; });
      var noOneLeft = count(room) === 0;
      if ((noOneLeft || (room.owner === S.me.id && stopMusic)) && room.music && room.music.playing) {
        room.music = { url: "", title: "", artist: "", playing: false, positionSec: 0, updatedAt: now() };
      }
      if (cloud.on && cloud.db && !UI.isGuest) {
        var ups = {};
        if (si >= 0) { ups["rooms/" + room.id + "/seats/" + si + "/uid"] = null; ups["rooms/" + room.id + "/seats/" + si + "/muted"] = false; }
        ups["rooms/" + room.id + "/listeners/" + S.me.id] = null;
        ups["rooms/" + room.id + "/handRequests/" + S.me.id] = null;
        if (noOneLeft || (room.owner === S.me.id && stopMusic)) ups["rooms/" + room.id + "/music"] = null;
        cloud.db.ref().update(ups).catch(function () { /* */ });
      }
      pushRoomMsg(room, { sys: true, text: (S.me.name || "مستخدم") + " غادر الغرفة" });
    }
    if (!silent) renderAll();
  }

  function renderFloatingOrb() {
    var orb = $("floating-room-orb");
    if (!orb) return;
    if (!UI.floatingRoomId) { orb.classList.add("hidden"); return; }
    var r = getRoom(UI.floatingRoomId);
    if (!r) { UI.floatingRoomId = null; orb.classList.add("hidden"); return; }
    orb.classList.remove("hidden");
    $("floating-orb-avatar").innerHTML = r.roomPhoto ? '<img src="' + esc(r.roomPhoto) + '" alt="" />' : esc(COVER_ICONS[(r.icon || 0) % COVER_ICONS.length]);
    $("floating-orb-label").textContent = r.name || "روم";
  }

  function toggleHandRaise(room) {
    if (!room) return;
    if (!Array.isArray(room.handRequests)) room.handRequests = [];
    var idx = room.handRequests.indexOf(S.me.id);
    if (idx >= 0) {
      room.handRequests.splice(idx, 1);
      if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + room.id + "/handRequests/" + S.me.id).remove().catch(function () { /* */ });
      toast("تم إلغاء طلب الصعود للمايك");
    } else {
      room.handRequests.push(S.me.id);
      if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + room.id + "/handRequests/" + S.me.id).set(true).catch(function () { /* */ });
      pushRoomMsg(room, { sys: true, text: "✋ " + (S.me.name || "مستخدم") + " يطلب الصعود إلى المايك" });
      toast("تم إرسال طلب الصعود للمايك ✋");
    }
    renderRoom();
  }

  function renderRoom() {
    var r = getRoom(UI.roomId); if (!r) return;
    $("room-title").textContent = r.name;
    var ownerU = resolveLiveUser(r.owner);
    if ($("room-right-id")) $("room-right-id").textContent = "ID: " + displayUserId(ownerU);
    $("room-meta").textContent = (CATEGORIES[r.cat] || r.cat) + " • " + count(r) + " داخل الغرفة" + (r.micApprovalMode ? " • ✋ المايك بطلب" : "") + (r.priv ? " • 🔒 خاصة" : "");
    var p = $("room-pinned");
    p.classList.toggle("hidden", !r.pinned);
    if (r.pinned) p.textContent = "📌 تنبيه: " + r.pinned;

    var mySeatIdx = seatIndexOf(r, S.me.id), onSeat = mySeatIdx >= 0;
    var micBtn = $("room-mic-btn");
    if (micBtn) {
      micBtn.classList.toggle("hidden", !onSeat);
      if (onSeat) {
        var isSeatMuted = !!r.seats[mySeatIdx].muted;
        var effMuted = UI.micMuted || isSeatMuted;
        micBtn.classList.toggle("muted", effMuted);
        micBtn.textContent = effMuted ? "🔇" : "🎤";
        micBtn.title = isSeatMuted ? "مكتوم من الإدارة" : (UI.micMuted ? "فتح المايك" : "كتم المايك");
      }
    }
    var spkBtn = $("room-speaker-btn");
    if (spkBtn) { spkBtn.classList.toggle("spk-muted", !!UI.roomSpeakerMuted); spkBtn.textContent = UI.roomSpeakerMuted ? "🔇" : "🔊"; }
    if ($("room-wallet-balance")) $("room-wallet-balance").textContent = Number(S.me.coins || 0).toLocaleString("en-US");

    var handBtn = $("room-hand-btn");
    if (handBtn) {
      var showHand = !onSeat && !!r.micApprovalMode;
      handBtn.classList.toggle("hidden", !showHand);
      if (showHand) {
        var raised = Array.isArray(r.handRequests) && r.handRequests.indexOf(S.me.id) >= 0;
        handBtn.classList.toggle("active-hand", raised);
        handBtn.textContent = raised ? "✋ تم رفع اليد" : "✋ طلب مايك";
      }
    }

    var n = r.seats.length;
    $("room-seats").className = "seats s" + n;
    $("room-seats").innerHTML = r.seats.map(function (s, i) {
      var u = s.uid ? resolveLiveUser(s.uid) : null, isOwnerSeat = i === 0, vipLv = u ? getEffectiveVip(u) : 0;
      var cls = "seat" + (s.uid ? " occ" : "") + (s.locked ? " locked" : "") + (isOwnerSeat ? " owner-seat" : "") + (vipLv > 0 ? " vip-seat" : "");
      var badge = isOwnerSeat ? '<span class="seat-badge owner">👑 المالك</span>' : (vipLv > 0 ? '<span class="seat-badge vip">VIP ' + vipLv + "</span>" : "");
      var top = badge + (s.muted ? '<span class="seat-mute">🔇</span>' : "");
      if (s.uid) {
        return '<div class="' + cls + '" data-seat="' + i + '">' + top + '<div class="avatar">' + avatarInnerHTML(u) + '</div><div class="sname">' + esc(u.name) + "</div></div>";
      }
      return '<div class="' + cls + '" data-seat="' + i + '">' + top + '<div class="avatar">' + (s.locked ? "🔒" : "🎙️") + '</div><div class="sname">' + (s.locked ? "مقفل" : "مقعد " + (i + 1)) + "</div></div>";
    }).join("");

    renderRoomChat(); updateSpeakingIndicators();
  }

  function renderRoomChat() {
    var r = getRoom(UI.roomId); if (!r) return;
    var box = $("room-chat");
    var visibleMsgs = (r.msgs || []).filter(function (m) { return !m.from || !isBlockedEitherWay(m.from); });
    box.innerHTML = visibleMsgs.slice(-60).map(function (m) {
      if (m.sys) return '<div class="msg sys">' + esc(m.text) + "</div>";
      var sender = resolveLiveUser(m.from);
      var senderName = (m.from === S.me.id ? (S.me.name || sender.name) : sender.name) || m.name || "مستخدم";
      var vipLv = getEffectiveVip(sender);
      var tag = m.from === r.owner ? '<span class="tag owner">مالك</span>' : (vipLv > 0 ? '<span class="tag vip">VIP ' + vipLv + "</span>" : "");
      if (m.gift) {
        return '<div class="msg gift"><div class="m-top"><span class="m-name" data-profile="' + esc(m.from) + '">' + esc(senderName) + "</span>" + tag + '<span class="m-time">' + timeStr(m.t) + '</span></div><div class="gift-banner"><span>' + esc(m.gift) + "</span><span>" + esc(clean(m.text)) + "</span></div></div>";
      }
      return '<div class="msg"><div class="m-top"><span class="m-name" data-profile="' + esc(m.from) + '">' + esc(senderName) + "</span>" + tag + '<span class="m-time">' + timeStr(m.t) + '</span></div><div class="m-txt">' + esc(clean(m.text)) + "</div></div>";
    }).join("");
    box.scrollTop = box.scrollHeight;
  }

  async function takeSeat(i) {
    var r = getRoom(UI.roomId); if (!r) return;
    var s = r.seats[i]; if (!s) return;
    var isMod = isRoomModOrOwner(r, S.me.id), curIdx = seatIndexOf(r, S.me.id);

    if (s.uid === S.me.id) {
      openSheet("<h3>🎙️ مقعدك الحالي (#" + (i + 1) + ")</h3><button class='btn red block' id='leave-seat-btn' type='button'>النزول من المايك</button>");
      $("leave-seat-btn").onclick = function () { leaveSeat(r, i); closeSheet(); };
      return;
    }
    if (s.uid && s.uid !== S.me.id) { openUserProfileSheet(s.uid); return; }
    if (s.locked && !isMod) { toast("هذا المقعد مقفل 🔒"); return; }
    if (r.micApprovalMode && !isMod && curIdx < 0) {
      if (!Array.isArray(r.handRequests)) r.handRequests = [];
      if (r.handRequests.indexOf(S.me.id) < 0) {
        r.handRequests.push(S.me.id);
        if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/handRequests/" + S.me.id).set(true).catch(function () { /* */ });
        pushRoomMsg(r, { sys: true, text: "✋ " + (S.me.name || "مستخدم") + " يطلب الصعود إلى المقعد #" + (i + 1) });
      }
      toast("الغرفة بنظام طلب المايك — تم إرسال طلبك للمشرف ✋");
      renderRoom(); return;
    }

    UI.pendingSeatActionAt = now();
    if (curIdx >= 0 && curIdx !== i) { r.seats[curIdx].uid = null; r.seats[curIdx].muted = false; }
    s.uid = S.me.id; s.muted = false;
    r.listeners = (r.listeners || []).filter(function (x) { return x !== S.me.id; });
    r.handRequests = (r.handRequests || []).filter(function (x) { return x !== S.me.id; });
    UI.micMuted = false;

    if (cloud.on && cloud.db && !UI.isGuest) {
      var ups = {};
      if (curIdx >= 0 && curIdx !== i) { ups["rooms/" + r.id + "/seats/" + curIdx + "/uid"] = null; ups["rooms/" + r.id + "/seats/" + curIdx + "/muted"] = false; }
      ups["rooms/" + r.id + "/seats/" + i + "/uid"] = S.me.id;
      ups["rooms/" + r.id + "/seats/" + i + "/muted"] = false;
      ups["rooms/" + r.id + "/listeners/" + S.me.id] = null;
      ups["rooms/" + r.id + "/handRequests/" + S.me.id] = null;
      try {
        var sRef = cloud.db.ref("rooms/" + r.id + "/seats/" + i + "/uid");
        sRef.onDisconnect().set(null);
      } catch (e) { /* */ }
      cloud.db.ref().update(ups).catch(function () { /* */ });
    }
    pushRoomMsg(r, { sys: true, text: (S.me.name || "مستخدم") + " صعد إلى المقعد #" + (i + 1) + " 🎤" });
    renderRoom();
    if (voice.client && voice.client.connectionState === "CONNECTED") await publishLocalMic();
    else await joinVoiceChannel(r.id, "publisher");
  }

  async function leaveSeat(r, i) {
    if (!r || !r.seats[i]) return;
    var targetUid = r.seats[i].uid, isSelf = targetUid === S.me.id;
    UI.pendingSeatActionAt = now();
    r.seats[i].uid = null; r.seats[i].muted = false;
    if (isSelf) {
      if (!Array.isArray(r.listeners)) r.listeners = [];
      if (r.listeners.indexOf(S.me.id) < 0) r.listeners.push(S.me.id);
      await stopLocalMic();
    }
    if (cloud.on && cloud.db && !UI.isGuest) {
      var ups = {};
      ups["rooms/" + r.id + "/seats/" + i + "/uid"] = null;
      ups["rooms/" + r.id + "/seats/" + i + "/muted"] = false;
      if (isSelf) ups["rooms/" + r.id + "/listeners/" + S.me.id] = true;
      cloud.db.ref().update(ups).catch(function () { /* */ });
    }
    pushRoomMsg(r, { sys: true, text: (isSelf ? (S.me.name || "مستخدم") : resolveLiveUser(targetUid).name) + " نزل من المقعد #" + (i + 1) });
    renderRoom();
  }

  function openSeatMenu(i) {
    var r = getRoom(UI.roomId); if (!r) return;
    var s = r.seats[i], isMod = isRoomModOrOwner(r, S.me.id);
    if (!isMod) { takeSeat(i); return; }

    var h = "<h3>🎛️ إدارة المقعد #" + (i + 1) + "</h3><div class='actlist'>";
    if (!s.uid) {
      if (seatIndexOf(r, S.me.id) !== i) h += '<button data-act="take" type="button">🎤 الصعود إلى هذا المقعد</button>';
      h += '<button data-act="lock" type="button">' + (s.locked ? "🔓 فتح قفل المقعد" : "🔒 قفل المقعد") + "</button>";
    } else {
      var u = resolveLiveUser(s.uid);
      h += '<button data-act="profile" type="button">👤 عرض ملف ' + esc(u.name) + "</button>";
      if (s.uid !== S.me.id) {
        h += '<button data-act="gift" type="button">🎁 إرسال هدية إلى ' + esc(u.name) + "</button>";
        h += '<button data-act="kickseat" type="button">⬇️ إنزال من المقعد</button>';
        h += '<button data-act="banroom" type="button">🚫 طرد وحظر من الغرفة</button>';
      } else h += '<button data-act="leaveseat" type="button">⬇️ النزول من المقعد</button>';
      h += '<button data-act="mute" type="button">' + (s.muted ? "🔊 فك كتم المايك" : "🔇 كتم مايك المقعد") + "</button>";
    }
    h += "</div>"; openSheet(h);

    $("sheet").querySelectorAll("[data-act]").forEach(function (b) {
      b.onclick = function () {
        var act = b.getAttribute("data-act"); closeSheet();
        if (act === "take") takeSeat(i);
        else if (act === "leaveseat" || act === "kickseat") leaveSeat(r, i);
        else if (act === "lock") {
          s.locked = !s.locked;
          if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/seats/" + i + "/locked").set(s.locked).catch(function () { /* */ });
          renderRoom();
        } else if (act === "mute") {
          s.muted = !s.muted;
          if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/seats/" + i + "/muted").set(s.muted).catch(function () { /* */ });
          if (s.uid === S.me.id) syncMicHardwareState();
          renderRoom();
        } else if (act === "profile") openUserProfileSheet(s.uid);
        else if (act === "gift") openGiftSheet(s.uid);
        else if (act === "banroom") {
          var kickedUid = s.uid;
          if (!Array.isArray(r.bans)) r.bans = [];
          if (r.bans.indexOf(kickedUid) < 0) r.bans.push(kickedUid);
          s.uid = null; s.muted = false;
          r.listeners = (r.listeners || []).filter(function (x) { return x !== kickedUid; });
          if (cloud.on && cloud.db && !UI.isGuest) {
            cloud.db.ref().update({
              ["rooms/" + r.id + "/bans/" + kickedUid]: true,
              ["rooms/" + r.id + "/seats/" + i + "/uid"]: null,
              ["rooms/" + r.id + "/seats/" + i + "/muted"]: false,
              ["rooms/" + r.id + "/listeners/" + kickedUid]: null
            }).catch(function () { /* */ });
          }
          pushRoomMsg(r, { sys: true, text: "🚫 تم حظر " + resolveLiveUser(kickedUid).name + " من الغرفة" });
          renderRoom();
        }
      };
    });
  }

  function openRoomMenu() {
    var r = getRoom(UI.roomId); if (!r) return;
    var isOwner = r.owner === S.me.id, isMod = isRoomModOrOwner(r, S.me.id);
    var h = "<h3>⚙️ خيارات الغرفة</h3><div class='actlist'>";
    h += '<button data-m="minimize" type="button">🫧 تصغير الغرفة (نافذة عائمة)</button>';
    h += '<button data-m="invite" type="button">📩 دعوة صديق للغرفة</button>';
    h += '<button data-m="participants" type="button">👥 المتواجدون في الغرفة (' + count(r) + ")</button>";
    if (isMod) {
      h += '<button data-m="rename" type="button">✏️ تعديل اسم ووصف الغرفة</button>';
      h += '<button data-m="pin" type="button">📌 تثبيت / تعديل إعلان الغرفة</button>';
      h += '<button data-m="approval" type="button">' + (r.micApprovalMode ? "✅ إيقاف وضع طلب المايك" : "✋ تفعيل وضع طلب المايك") + "</button>";
      h += '<button data-m="lockroom" type="button">' + (r.locked ? "🔓 فتح قفل الغرفة" : "🔒 قفل الغرفة") + "</button>";
    }
    if (isOwner) h += '<button data-m="delete" style="color:var(--bad)" type="button">🗑️ حذف الغرفة نهائياً</button>';
    h += '<button data-m="leave" style="color:var(--bad)" type="button">🚪 مغادرة الغرفة</button></div>';
    openSheet(h);

    $("sheet").querySelectorAll("[data-m]").forEach(function (b) {
      b.onclick = function () {
        var m = b.getAttribute("data-m"); closeSheet();
        if (m === "minimize") {
          UI.floatingRoomId = r.id; UI.roomId = null;
          $("room-view").classList.remove("open");
          renderFloatingOrb(); renderAll();
          toast("تم تصغير الغرفة — الصوت مستمر 🎧");
        } else if (m === "invite") openRoomFriendsInviteSheet();
        else if (m === "participants") {
          var ids = getRoomParticipantIds(r);
          var listHtml = ids.length ? ids.map(function (pid) {
            var pu = resolveLiveUser(pid), onMic = seatIndexOf(r, pid) >= 0;
            return '<div class="row glass" data-profile="' + esc(pid) + '">' + avatarHTML(pu, "sm") + '<div class="info"><div class="name">' + esc(pu.name) + '</div><div class="meta">' + (onMic ? "🎤 على المايك" : "🎧 مستمع") + "</div></div></div>";
          }).join("") : '<div class="empty">لا يوجد متواجدون</div>';
          openSheet("<h3>👥 المتواجدون في الغرفة</h3><div class='list'>" + listHtml + "</div>");
        } else if (m === "rename") openRenameRoomSheet(r);
        else if (m === "pin") {
          openSheet("<h3>📌 إعلان الغرفة</h3><input id='pin-in' maxlength='120' value='" + esc(r.pinned || "") + "' /><button class='btn block' id='pin-save' type='button'>حفظ الإعلان</button>");
          $("pin-save").onclick = function () {
            r.pinned = clean($("pin-in").value.trim());
            if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/pinned").set(r.pinned).catch(function () { /* */ });
            closeSheet(); renderRoom();
          };
        } else if (m === "approval") {
          r.micApprovalMode = !r.micApprovalMode;
          if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/micApprovalMode").set(r.micApprovalMode).catch(function () { /* */ });
          renderRoom(); toast(r.micApprovalMode ? "تم تفعيل وضع طلب المايك ✋" : "تم إيقاف وضع طلب المايك");
        } else if (m === "lockroom") {
          r.locked = !r.locked;
          if (cloud.on && cloud.db && !UI.isGuest) cloud.db.ref("rooms/" + r.id + "/locked").set(r.locked).catch(function () { /* */ });
          renderRoom(); toast(r.locked ? "تم قفل الغرفة 🔒" : "تم فتح الغرفة 🔓");
        } else if (m === "delete") {
          var roomIdToDelete = r.id, roomOwnerId = r.owner || S.me.id;
          leaveRoom(true).then(function () {
            S.rooms = (S.rooms || []).filter(function (item) { return item.id !== roomIdToDelete; });
            if (cloud.on && cloud.db && !UI.isGuest) {
              cloud.db.ref("rooms/" + roomIdToDelete).remove().catch(function () { /* */ });
              cloud.db.ref("roomMessages/" + roomIdToDelete).remove().catch(function () { /* */ });
              cloud.db.ref("giftEvents/" + roomIdToDelete).remove().catch(function () { /* */ });
              if (roomOwnerId) cloud.db.ref("userRoomIndex/" + roomOwnerId).transaction(function (current) { return current === roomIdToDelete ? null : current; }).catch(function () { /* */ });
            }
            saveLocal(); renderAll(); toast("تم حذف الغرفة نهائياً 🗑️");
          });
        } else if (m === "leave") leaveRoom(false);
      };
    });
  }

  function openMusicSheet() {
    var r = getRoom(UI.roomId || UI.floatingRoomId); if (!r) return;
    var canCtrl = canControlRoomMusic(r), pl = Array.isArray(r.playlist) && r.playlist.length ? r.playlist : DEFAULT_TRACKS;
    var curMusic = r.music || {}, isPlaying = !!(curMusic && curMusic.playing && curMusic.url);
    var volPct = Math.round((typeof UI.musicVolume === "number" ? UI.musicVolume : 0.7) * 100);

    var tracksHtml = pl.map(function (t, idx) {
      var active = curMusic.url === t.url && isPlaying;
      return '<div class="row glass" style="margin-bottom:6px"><div class="avatar sm">' + esc(t.cover || "🎵") + '</div><div class="info"><div class="name">' + esc(t.title) + '</div><div class="meta">' + esc(t.artist || "موسيقى الغرفة") + (active ? " • ▶️ قيد التشغيل" : "") + '</div></div>' + (canCtrl ? '<button class="btn sm ' + (active ? "ghost" : "ok") + '" data-play-track="' + idx + '" type="button">' + (active ? "إيقاف" : "تشغيل") + "</button>" : "") + "</div>";
    }).join("");

    openSheet("<h3>🎵 موسيقى الغرفة المتزامنة</h3>" +
      (!canCtrl ? '<div class="notice">الموسيقى تُبث لجميع المتواجدين في الغرفة. التحكم بالتشغيل والإيقاف متاح لمالك الغرفة والمشرفين.</div>' : "") +
      (isPlaying ? '<div class="row glass" style="margin-bottom:8px"><div class="info"><div class="name">🎶 يعمل الآن: ' + esc(curMusic.title || "مقطع صوتي") + '</div><div class="meta">متزامن مع جميع الحضور</div></div>' + (canCtrl ? '<button class="btn sm red" id="mus-stop-btn" type="button">⏹ إيقاف</button>' : "") + "</div>" : "") +
      "<label>مستوى صوت الموسيقى لديك (" + volPct + "%)</label><input id='mus-vol-slider' type='range' min='0' max='100' value='" + volPct + "' style='width:100%' />" +
      (canCtrl ? "<label style='margin-top:10px'>تشغيل رابط صوتي مباشر (MP3 / Stream)</label><div style='display:flex;gap:6px'><input id='mus-url-input' placeholder='https://example.com/song.mp3' /><button class='btn sm ok' id='mus-url-play' type='button'>بث</button></div>" : "") +
      "<label style='margin-top:10px'>قائمة الأغاني</label><div class='list'>" + tracksHtml + "</div>");

    if ($("mus-vol-slider")) {
      $("mus-vol-slider").oninput = function () {
        UI.musicVolume = Number(this.value || 70) / 100;
        if (musicState.roomAudio) { try { musicState.roomAudio.volume = UI.musicVolume; } catch (e) { /* */ } }
      };
    }
    if ($("mus-stop-btn")) {
      $("mus-stop-btn").onclick = function () {
        setRoomMusicRemote(r.id, { url: "", title: "", artist: "", playing: false, positionSec: 0, updatedAt: now() });
        openMusicSheet();
      };
    }
    if ($("mus-url-play")) {
      $("mus-url-play").onclick = function () {
        var uVal = ($("mus-url-input").value || "").trim();
        if (!/^https?:\/\//i.test(uVal)) { toast("أدخل رابط صوتي صحيح يبدأ بـ http أو https"); return; }
        setRoomMusicRemote(r.id, { url: uVal, title: "بث صوتي مخصص", artist: "موسيقى الغرفة", playing: true, positionSec: 0, updatedAt: now() });
        closeSheet(); toast("تم تشغيل المقطع للجميع 🎵");
      };
    }
    $("sheet").querySelectorAll("[data-play-track]").forEach(function (btn) {
      btn.onclick = function () {
        var idx = Number(btn.getAttribute("data-play-track")), tr = pl[idx];
        if (!tr) return;
        if (curMusic.url === tr.url && isPlaying) setRoomMusicRemote(r.id, { url: tr.url, title: tr.title, artist: tr.artist || "", playing: false, positionSec: computeMusicPositionSec(curMusic), updatedAt: now() });
        else setRoomMusicRemote(r.id, { url: tr.url, title: tr.title, artist: tr.artist || "", playing: true, positionSec: 0, updatedAt: now() });
        openMusicSheet();
      };
    });
  }

  function openGiftSheet(preTarget) {
    var r = getRoom(UI.roomId || UI.floatingRoomId);
    if (!r) { toast("يجب التواجد داخل غرفة لإرسال الهدايا"); return; }
    var activeGifts = getActiveGifts(), myCoins = Math.max(0, Number(S.me.coins || 0)), myVip = getEffectiveVip(S.me);
    var targets = [];
    (r.seats || []).forEach(function (s, idx) {
      if (s && s.uid && s.uid !== S.me.id && !isBlockedEitherWay(s.uid)) {
        var u = resolveLiveUser(s.uid);
        targets.push({ id: s.uid, label: "مقعد #" + (idx + 1) + " — " + u.name });
      }
    });
    if (!targets.length) { openSheet("<h3>🎁 إرسال هدية</h3><div class='empty'>لا يوجد مستخدمون آخرون على المقاعد حالياً لإرسال هدية لهم</div>"); return; }
    if (!preTarget || !targets.some(function (t) { return t.id === preTarget; })) UI.giftTarget = targets[0].id;
    else UI.giftTarget = preTarget;
    if (!activeGifts.some(function (g) { return g.id === UI.giftSel; })) UI.giftSel = activeGifts[0].id;

    var opts = targets.map(function (t) { return '<option value="' + esc(t.id) + '"' + (UI.giftTarget === t.id ? " selected" : "") + ">" + esc(t.label) + "</option>"; }).join("");
    var grid = activeGifts.map(function (g) {
      var price = Number(g.p || GIFT_COIN_PRICES[g.id] || 10), lockedVip = Number(g.vipMin || 0) > myVip;
      return '<div class="gitem' + (UI.giftSel === g.id ? " sel" : "") + (lockedVip ? " locked-gift" : "") + '" data-g="' + esc(g.id) + '"><b>' + esc(g.e) + '</b><span>' + esc(g.n) + "</span><small>" + (lockedVip ? "🔒 VIP " + g.vipMin : (price.toLocaleString("en-US") + " 🪙")) + "</small></div>";
    }).join("");

    openSheet("<h3>🎁 إرسال هدية</h3><div class='gift-balance-bar'><span>رصيدك الحالي:</span><strong id='gift-sheet-coins'>" + myCoins.toLocaleString("en-US") + " 🪙</strong></div><label>إلى</label><select id='g-to'>" + opts + "</select><div class='ggrid'>" + grid + "</div><button class='btn block' id='g-send' type='button'>إرسال الهدية</button>");
    $("g-to").onchange = function () { UI.giftTarget = this.value; };
    $("sheet").querySelectorAll(".gitem").forEach(function (el) {
      el.onclick = function () {
        var gid = el.getAttribute("data-g"), gObj = activeGifts.find(function (x) { return x.id === gid; });
        if (gObj && Number(gObj.vipMin || 0) > getEffectiveVip(S.me)) { toast("هذه الهدية تتطلب عضوية VIP " + gObj.vipMin); return; }
        UI.giftSel = gid;
        $("sheet").querySelectorAll(".gitem").forEach(function (x) { x.classList.toggle("sel", x === el); });
      };
    });
    $("g-send").onclick = async function () {
      var btn = $("g-send");
      if (btn.disabled) return;
      var to = $("g-to").value;
      var g = activeGifts.find(function (x) { return x.id === UI.giftSel; }) || activeGifts[0];
      if (!to || !g) return;
      if (isBlockedEitherWay(to)) { toast("تعذر إرسال الهدية لوجود حظر"); return; }
      if (Number(g.vipMin || 0) > getEffectiveVip(S.me)) { toast("هذه الهدية تتطلب عضوية VIP " + g.vipMin); return; }
      var price = Number(g.p || GIFT_COIN_PRICES[g.id] || 10);
      if (UI.isGuest) { toast("إرسال الهدايا بالعملات متاح للحسابات المسجلة فقط"); return; }
      if (Number(S.me.coins || 0) < price) { toast("رصيد عملاتك غير كافٍ لإرسال هذه الهدية"); return; }
      btn.disabled = true; btn.textContent = "جاري الإرسال...";
      var apiRes = await callEconomyApi("sendGift", { roomId: r.id, toUid: to, giftId: g.id, emoji: g.e, giftName: g.n, amount: price });
      if (!apiRes.ok) { btn.disabled = false; btn.textContent = "إرسال الهدية"; toast(apiRes.error || "تعذر إرسال الهدية"); return; }
      S.me.coins = Math.max(0, Number(apiRes.balance != null ? apiRes.balance : (Number(S.me.coins || 0) - price)));
      S.me.xp = Number(S.me.xp || 0) + Math.max(5, Math.round(price / 5));
      S.me.level = computeLevelFromXp(S.me.xp);
      S.me.gifts = Number(S.me.gifts || 0) + 1;
      var toName = resolveLiveUser(to).name;
      pushRoomMsg(r, { from: S.me.id, name: S.me.name, gift: g.e, text: "أرسل " + g.n + " (" + price.toLocaleString("en-US") + " 🪙) إلى " + toName });
      if (cloud.on && cloud.db && !UI.isGuest) {
        var gEvRef = cloud.db.ref("giftEvents/" + r.id).push();
        if (gEvRef && gEvRef.key) seenGiftEventIds[gEvRef.key] = true;
        gEvRef.set({ fromUid: S.me.id, fromName: S.me.name || "مستخدم", fromPhoto: S.me.photo || "", toUid: to, toName: toName, giftId: g.id, giftName: g.n, emoji: g.e, coins: price, count: 1, createdAt: serverTs() }).catch(function () { /* */ });
      }
      showFlyGiftToSeat(g.e, S.me.name || "مستخدم", to, toName);
      save(); closeSheet(); renderRoom(); renderTop();
      toast("تم إرسال " + g.n + " بنجاح 🎁");
    };
  }

  function openUserProfileSheet(targetId) {
    if (!targetId) return;
    if (targetId === S.me.id) { go("profile"); return; }
    if (isBlockedByUser(targetId)) { toast("هذا الحساب غير متاح"); return; }
    var u = resolveLiveUser(targetId), vipLv = getEffectiveVip(u), rel = getRelationshipStatus(targetId), curRoom = findUserCurrentRoom(targetId);
    var actionsHtml = "";
    if (rel.state === "blocked_by_me") {
      actionsHtml = '<button class="btn ok" id="ups-unblock" type="button">🔓 إلغاء الحظر</button>';
    } else {
      actionsHtml += '<button class="btn ghost" id="ups-follow" type="button">' + (rel.following ? "إلغاء المتابعة" : "+ متابعة") + "</button>";
      if (rel.state === "friends") {
        actionsHtml += '<button class="btn" id="ups-dm" type="button">💬 مراسلة خاصة</button><button class="btn red" id="ups-remove-friend" type="button">إزالة الصديق</button>';
      } else if (rel.state === "request_sent") actionsHtml += '<button class="btn ghost" id="ups-cancel-req" type="button">طلب مرسل (إلغاء)</button>';
      else if (rel.state === "request_received") actionsHtml += '<button class="btn ok" id="ups-accept-req" type="button">قبول الطلب</button><button class="btn ghost" id="ups-reject-req" type="button">رفض</button>';
      else actionsHtml += '<button class="btn" id="ups-add-friend" type="button">+ إضافة صديق</button>';
      if (UI.roomId || UI.floatingRoomId) actionsHtml += '<button class="btn gold" id="ups-gift" type="button">🎁 إرسال هدية</button>';
      actionsHtml += '<button class="btn red" id="ups-block" type="button">🚫 حظر</button><button class="btn ghost" id="ups-report" type="button">🚩 إبلاغ</button>';
    }

    openSheet('<div class="ups-head">' + avatarHTML(u, "lg") + '<div class="info"><div class="' + (vipLv >= 2 ? "name vip-gold" : "name") + '" style="font-size:17px">' + esc(u.name) + (vipLv > 0 ? ' <span class="tag vip">VIP ' + vipLv + "</span>" : "") + (u.verified ? ' <span class="tag verified">✓ موثق</span>' : "") + '</div><div class="meta">ID: ' + esc(displayUserId(u)) + " • " + (u.online ? "🟢 متصل الآن" : "⚫ غير متصل") + '</div><div class="meta" style="margin-top:3px">العلاقة: <b>' + esc(rel.label) + "</b>" + (curRoom ? " • 🎙️ في غرفة: <b>" + esc(curRoom.name) + "</b>" : "") + "</div></div></div>" +
      '<div class="ups-bio">' + esc(u.bio || "مرحباً بك في REAL VOICE") + "</div>" +
      '<div class="stats-grid"><div class="stat-box"><b>Lv.' + computeLevelFromXp(u.xp || 0) + '</b><span>المستوى</span></div><div class="stat-box"><b>' + Number(u.followersCount || 0) + '</b><span>المتابعون</span></div><div class="stat-box"><b>' + Number(u.friendsCount || 0) + '</b><span>الأصدقاء</span></div></div>' +
      '<div class="ups-actions">' + actionsHtml + "</div>");

    if ($("ups-follow")) $("ups-follow").onclick = async function () { this.disabled = true; await toggleFollowUser(targetId); openUserProfileSheet(targetId); };
    if ($("ups-add-friend")) $("ups-add-friend").onclick = async function () { this.disabled = true; await sendFriendRequest(targetId); openUserProfileSheet(targetId); };
    if ($("ups-cancel-req")) $("ups-cancel-req").onclick = async function () { this.disabled = true; await cancelFriendRequest(targetId); openUserProfileSheet(targetId); };
    if ($("ups-accept-req")) $("ups-accept-req").onclick = async function () { this.disabled = true; await acceptFriendRequest(targetId); openUserProfileSheet(targetId); };
    if ($("ups-reject-req")) $("ups-reject-req").onclick = async function () { this.disabled = true; await rejectFriendRequest(targetId); openUserProfileSheet(targetId); };
    if ($("ups-remove-friend")) $("ups-remove-friend").onclick = async function () { this.disabled = true; await removeFriend(targetId); openUserProfileSheet(targetId); };
    if ($("ups-dm")) $("ups-dm").onclick = function () { closeSheet(); openDM(targetId); };
    if ($("ups-gift")) $("ups-gift").onclick = function () { closeSheet(); openGiftSheet(targetId); };
    if ($("ups-block")) $("ups-block").onclick = function () { confirmBlockUserSheet(targetId, function () { openUserProfileSheet(targetId); }); };
    if ($("ups-unblock")) $("ups-unblock").onclick = function () { confirmUnblockUserSheet(targetId, function () { openUserProfileSheet(targetId); }); };
    if ($("ups-report")) {
      $("ups-report").onclick = function () {
        openSheet("<h3>🚩 إبلاغ عن «" + esc(u.name) + "»</h3><label>سبب البلاغ</label><select id='rep-reason'><option value='إساءة لفظية أو مضايقة'>إساءة لفظية أو مضايقة</option><option value='محتوى غير لائق'>محتوى غير لائق</option><option value='إزعاج في الغرفة الصوتية'>إزعاج في الغرفة الصوتية</option><option value='حساب مزيف أو سبام'>حساب مزيف أو سبام</option></select><button class='btn red block' id='rep-send' type='button'>إرسال البلاغ</button>");
        $("rep-send").onclick = function () { submitUserReport(targetId, $("rep-reason").value); closeSheet(); };
      };
    }
  }

  function openDM(id) {
    if (!id || id === S.me.id) return;
    if (isBlockedEitherWay(id)) { toast("لا يمكن المراسلة بسبب وجود حظر"); return; }
    if (!isFriendWith(id)) { toast("الرسائل الخاصة متاحة بين الأصدقاء فقط — أرسل طلب صداقة أولاً"); return; }
    closeSheet(); UI.dmId = id; S.unread[id] = 0;
    if (!Array.isArray(S.dms[id])) S.dms[id] = [];
    attachDmThreadListener(S.me.id, id, UI.dmLimits[id] || CONFIG.dmInitialLimit);
    markThreadMessagesRead(id);
    var u = resolveLiveUser(id);
    $("dm-name").textContent = u.name;
    $("dm-status").textContent = u.online ? "🟢 متصل الآن" : "⚫ غير متصل";
    setAvatarEl($("dm-avatar"), u);
    $("chat-view").classList.add("open");
    renderDM(); renderTop();
  }

  function closeDM() {
    if (isRecordingDm && dmRecorder) { try { dmRecorder.stop(); } catch (e) { /* */ } isRecordingDm = false; }
    UI.dmId = null;
    if ($("chat-view")) $("chat-view").classList.remove("open");
    renderTop();
  }

  function markThreadMessagesRead(peerId) {
    if (!peerId || !cloud.on || !cloud.db || UI.isGuest || !S || !S.me || !S.me.id) return;
    var tid = dmThreadId(S.me.id, peerId), thread = S.dms[peerId] || [];
    thread.forEach(function (m) {
      if (m && m.key && m.from === peerId && !m.read) {
        m.read = true;
        cloud.db.ref("dms/" + tid + "/" + m.key).update({ read: true, status: "read" }).catch(function () { /* */ });
      }
    });
  }

  function renderDM() {
    var id = UI.dmId; if (!id) return;
    var box = $("dm-msgs"), list = S.dms[id] || [];
    var loadMoreHtml = list.length >= (UI.dmLimits[id] || CONFIG.dmInitialLimit)
      ? '<div style="text-align:center;margin-bottom:8px"><button class="btn sm ghost" id="dm-load-older-btn" type="button">⬆️ تحميل رسائل أقدم</button></div>' : "";
    box.innerHTML = loadMoreHtml + list.map(function (m) {
      var mine = m.from === S.me.id, cls = "chat-msg " + (mine ? "me" : "them"), body = "";
      if (m.img) body += '<img src="' + esc(m.img) + '" alt="" style="max-width:190px;border-radius:10px;display:block;margin-bottom:4px" />';
      if (m.audio) body += '<audio controls src="' + esc(m.audio) + '" style="max-width:210px;height:34px;display:block;margin-bottom:4px"></audio>';
      if (m.text) body += "<div>" + esc(clean(m.text)) + "</div>";
      if (m.inviteRoomId) body += '<button class="btn sm ok" style="margin-top:6px" data-join-invite="' + esc(m.inviteRoomId) + '" type="button">🎙️ انضمام للغرفة</button>';
      var statusTick = mine ? (' <span class="msg-tick ' + (m.read ? "read" : "") + '">' + (m.read ? "✓✓" : "✓") + "</span>") : "";
      return '<div class="' + cls + '">' + body + '<span class="chat-t">' + timeStr(m.t) + statusTick + "</span></div>";
    }).join("");
    if ($("dm-load-older-btn")) {
      $("dm-load-older-btn").onclick = function () {
        var nextLim = (UI.dmLimits[id] || CONFIG.dmInitialLimit) + CONFIG.dmPageStep;
        UI.dmLimits[id] = nextLim; delete UI.activeDmListenerLimits[dmThreadId(S.me.id, id)];
        attachDmThreadListener(S.me.id, id, nextLim);
      };
    }
    box.scrollTop = box.scrollHeight;
  }

  function sendDM(extra) {
    var id = UI.dmId; if (!id) return;
    if (isBlockedEitherWay(id)) { toast("لا يمكن إرسال رسائل بسبب وجود حظر"); return; }
    if (!isFriendWith(id)) { toast("الرسائل الخاصة متاحة بين الأصدقاء فقط"); return; }
    if (!allowActionRateLimit()) return;
    var inp = $("dm-input"), txt = extra && extra.text != null ? extra.text : inp.value.trim();
    if (!txt && !(extra && (extra.img || extra.audio))) return;
    var msg = Object.assign({ from: S.me.id, to: id, text: txt, status: "sent", read: false, t: now() }, extra || {});
    if (!Array.isArray(S.dms[id])) S.dms[id] = [];
    S.dms[id].push(msg);
    if (!extra || extra.text != null) inp.value = "";
    renderDM(); renderMessages(); saveLocal();
    if (cloud.on && cloud.db && !UI.isGuest) {
      var tid = dmThreadId(S.me.id, id);
      cloud.db.ref("dms/" + tid).push(msg).then(function (ref) {
        if (ref && ref.key) msg.key = ref.key;
        cloud.db.ref("userDms/" + S.me.id + "/" + id).set(true).catch(function () { /* */ });
        cloud.db.ref("userDms/" + id + "/" + S.me.id).set(true).catch(function () { /* */ });
      }).catch(function () { toast("تعذر إرسال الرسالة للسحابة"); });
    }
  }

  function openNotifs() {
    var list = (S.notifs || []).filter(function (n) { return !n.actorId || !isBlockedEitherWay(n.actorId); });
    (S.notifs || []).forEach(function (n) { n.read = true; });
    saveLocal(); renderTop();
    var html = list.length ? list.map(function (n) {
      return '<div class="row glass"><div class="info"><div class="name">' + esc(n.text) + '</div><div class="meta">' + timeStr(n.t) + "</div></div></div>";
    }).join("") : '<div class="empty">لا توجد إشعارات بعد</div>';
    openSheet("<h3>🔔 الإشعارات</h3><div class='list'>" + html + "</div>");
  }

  function bindEvents() {
    document.querySelectorAll(".navbtn").forEach(function (b) { b.onclick = function () { go(b.getAttribute("data-page")); }; });
    if ($("avatar-top")) $("avatar-top").onclick = function () { go("profile"); };
    if ($("notif-btn")) $("notif-btn").onclick = openNotifs;
    if ($("theme-toggle-btn")) {
      $("theme-toggle-btn").onclick = function () {
        S.settings.lightTheme = !S.settings.lightTheme;
        applyThemeMode(); saveLocal(); renderTop();
      };
    }
    if ($("gift-cup-banner")) $("gift-cup-banner").onclick = openGiftCupSheet;
    if ($("gift-cup-back-btn")) $("gift-cup-back-btn").onclick = closeGiftCupPage;
    if ($("floating-room-orb")) {
      $("floating-room-orb").onclick = function () {
        if (UI.floatingRoomId) { var rid = UI.floatingRoomId; UI.floatingRoomId = null; renderFloatingOrb(); enterRoom(rid, true); }
      };
    }

    if ($("guest-login-btn")) $("guest-login-btn").onclick = startWithoutGoogle;
    if ($("ob-photo-input")) {
      $("ob-photo-input").onchange = async function () {
        var f = this.files && this.files[0]; if (!f) return;
        try { UI.onboardPhoto = await readImageFileAsDataUrl(f, 180, 0.55); renderOnboardPreview(); toast("تم اختيار الصورة الشخصية ✅"); }
        catch (e) { setOnboardError(e.message); toast(e.message); }
      };
    }
    document.querySelectorAll(".gender-pill").forEach(function (pill) {
      pill.onclick = function () {
        UI.onboardGender = pill.getAttribute("data-gender") || "ذكر";
        document.querySelectorAll(".gender-pill").forEach(function (p) { p.classList.toggle("active", p === pill); });
      };
    });
    if ($("ob-name")) $("ob-name").oninput = renderOnboardPreview;
    if ($("ob-submit-btn")) $("ob-submit-btn").onclick = completeOnboarding;
    if ($("ob-back-login-btn")) {
      $("ob-back-login-btn").onclick = function () {
        if (UI.googleUser) signOutApp();
        else { setGuestSession(false); showAuthGate(true, "login"); }
      };
    }

    if ($("search-input")) {
      $("search-input").oninput = function () { UI.query = this.value; renderHome(); };
    }
    if ($("search-clear-btn")) {
      $("search-clear-btn").onclick = function () { UI.query = ""; if ($("search-input")) $("search-input").value = ""; renderHome(); };
    }
    document.querySelectorAll("#home-tabs .tab").forEach(function (t) {
      t.onclick = function () { UI.filter = t.getAttribute("data-filter"); renderHome(); };
    });
    if ($("fab-create")) $("fab-create").onclick = openCreateRoom;
    document.querySelectorAll("#rooms-tabs .tab").forEach(function (t) {
      t.onclick = function () { UI.rfilter = t.getAttribute("data-rfilter"); renderRooms(); };
    });

    document.querySelectorAll("#friends-tabs .tab").forEach(function (t) {
      t.onclick = function () { UI.ftab = t.getAttribute("data-ftab"); renderFriends(); };
    });
    if ($("find-input")) $("find-input").oninput = function () { UI.findQ = this.value; renderFriends(); };

    document.querySelectorAll("#profile-subtabs .tab").forEach(function (t) {
      t.onclick = function () {
        UI.pftab = t.getAttribute("data-pftab"); UI.pfSocialLimit = CONFIG.socialPageSize; UI.pfSocialQ = "";
        if ($("pf-social-search")) $("pf-social-search").value = "";
        renderProfile();
      };
    });
    if ($("pf-social-search")) {
      $("pf-social-search").oninput = function () { UI.pfSocialQ = this.value; UI.pfSocialLimit = CONFIG.socialPageSize; renderProfileSocialTab(); };
    }
    if ($("pf-followers-card")) $("pf-followers-card").onclick = function () { openSocialListSheet("followers"); };
    if ($("pf-following-card")) $("pf-following-card").onclick = function () { openSocialListSheet("following"); };
    if ($("pf-friends-card")) $("pf-friends-card").onclick = function () { openSocialListSheet("friends"); };
    if ($("pf-blocked-card")) $("pf-blocked-card").onclick = function () { openSocialListSheet("blocked"); };
    if ($("pf-wallet-card")) $("pf-wallet-card").onclick = openWalletSheet;
    if ($("pf-vip-card")) $("pf-vip-card").onclick = openVipSheet;
    if ($("pf-admin-btn")) $("pf-admin-btn").onclick = openAdminPanelSheet;
    if ($("pf-settings-btn")) $("pf-settings-btn").onclick = openProfileSettingsSheet;

    $("scrim").onclick = closeSheet;
    $("room-back").onclick = function () { leaveRoom(false); };
    $("room-menu-btn").onclick = openRoomMenu;
    if ($("room-friends-btn")) $("room-friends-btn").onclick = openRoomFriendsInviteSheet;
    if ($("room-wallet-chip")) $("room-wallet-chip").onclick = openWalletSheet;
    if ($("room-hand-btn")) {
      $("room-hand-btn").onclick = function () {
        var r = getRoom(UI.roomId);
        if (r) toggleHandRaise(r);
      };
    }
    if ($("audio-unlock-btn")) {
      $("audio-unlock-btn").onclick = function () { resumeAllRemoteAudioTracks(); showAudioUnlockBar(false); toast("تم تفعيل الصوت بنجاح 🔊"); };
    }
    if ($("music-mini-open")) $("music-mini-open").onclick = openMusicSheet;
    if ($("music-mini-stop")) {
      $("music-mini-stop").onclick = function () {
        var r = getRoom(UI.roomId || UI.floatingRoomId);
        if (!r) return;
        if (canControlRoomMusic(r)) setRoomMusicRemote(r.id, { url: "", title: "", artist: "", playing: false, positionSec: 0, updatedAt: now() });
        else { UI.roomSpeakerMuted = !UI.roomSpeakerMuted; applyRoomSpeakerMuteState(); renderRoom(); }
      };
    }

    $("room-mic-btn").onclick = async function () {
      var r = getRoom(UI.roomId); if (!r) return;
      var si = seatIndexOf(r, S.me.id);
      if (si < 0) { toast("اصعد على مقعد أولاً لتفعيل المايك 🎤"); return; }
      if (r.seats[si].muted) { toast("المايك مكتوم من قِبل إدارة الغرفة 🔇"); return; }
      UI.micMuted = !UI.micMuted;
      await syncMicHardwareState();
      renderRoom();
      toast(UI.micMuted ? "تم كتم المايك 🔇" : "تم فتح المايك 🎤");
    };

    if ($("room-speaker-btn")) {
      $("room-speaker-btn").onclick = function () {
        UI.roomSpeakerMuted = !UI.roomSpeakerMuted;
        applyRoomSpeakerMuteState();
        renderRoom();
        toast(UI.roomSpeakerMuted ? "تم كتم صوت الغرفة 🔇" : "تم تشغيل صوت الغرفة 🔊");
      };
    }

    $("room-gift-btn").onclick = function () { openGiftSheet(); };
    if ($("room-music-btn")) $("room-music-btn").onclick = openMusicSheet;

    $("room-emoji-btn").onclick = function () {
      openSheet("<h3>اختر إيموجي</h3><div class='egrid'>" + EMOJIS.map(function (e) { return '<div class="eitem">' + e + "</div>"; }).join("") + "</div>");
      $("sheet").querySelectorAll(".eitem").forEach(function (el) {
        el.onclick = function () { $("room-input").value += el.textContent; closeSheet(); $("room-input").focus(); };
      });
    };

    function sendRoomChat() {
      var r = getRoom(UI.roomId); if (!r) return;
      if (!allowActionRateLimit()) return;
      var inp = $("room-input"), t = inp.value.trim(); if (!t) return;
      pushRoomMsg(r, { from: S.me.id, name: S.me.name, text: t });
      inp.value = "";
    }
    $("room-send").onclick = sendRoomChat;
    $("room-input").onkeydown = function (e) { if (e.key === "Enter") { e.preventDefault(); sendRoomChat(); } };

    $("room-seats").onclick = function (e) {
      var s = e.target.closest(".seat");
      if (s) openSeatMenu(Number(s.getAttribute("data-seat")));
    };

    $("dm-back").onclick = closeDM;
    $("dm-send").onclick = function () { sendDM(); };
    $("dm-input").onkeydown = function (e) { if (e.key === "Enter") { e.preventDefault(); sendDM(); } };
    if ($("dm-profile-btn")) $("dm-profile-btn").onclick = function () { if (UI.dmId) openUserProfileSheet(UI.dmId); };
    if ($("dm-block-btn")) {
      $("dm-block-btn").onclick = function () {
        if (!UI.dmId) return;
        confirmBlockUserSheet(UI.dmId, function () { closeDM(); renderMessages(); });
      };
    }
    if ($("dm-sticker-btn")) {
      $("dm-sticker-btn").onclick = function () {
        openSheet("<h3>إرسال ملصق</h3><div class='egrid'>" + STICKERS.map(function (st) { return '<div class="eitem" data-sticker="' + esc(st.e) + '" title="' + esc(st.n) + '">' + esc(st.e) + "</div>"; }).join("") + "</div>");
        $("sheet").querySelectorAll("[data-sticker]").forEach(function (el) {
          el.onclick = function () { var em = el.getAttribute("data-sticker"); closeSheet(); sendDM({ text: em }); };
        });
      };
    }
    if ($("dm-img-btn") && $("dm-img-file")) {
      $("dm-img-btn").onclick = function () { $("dm-img-file").click(); };
      $("dm-img-file").onchange = async function () {
        var f = this.files && this.files[0]; this.value = ""; if (!f) return;
        try { var dataUrl = await readImageFileAsDataUrl(f, 480, 0.65); sendDM({ img: dataUrl, text: "" }); }
        catch (e) { toast(e.message); }
      };
    }
    if ($("dm-mic-btn")) {
      $("dm-mic-btn").onclick = async function () {
        if (!UI.dmId || isBlockedEitherWay(UI.dmId) || !isFriendWith(UI.dmId)) { toast("الرسائل الصوتية متاحة للأصدقاء فقط"); return; }
        if (isRecordingDm && dmRecorder) { try { dmRecorder.stop(); } catch (e) { /* */ } return; }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !global.MediaRecorder) { toast("المتصفح لا يدعم تسجيل الرسائل الصوتية"); return; }
        try {
          var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          dmChunks = [];
          dmRecorder = new MediaRecorder(stream);
          isRecordingDm = true;
          this.classList.add("recording");
          toast("جاري التسجيل... اضغط زر المايك مجدداً للإرسال 🎙️");
          var selfBtn = this;
          dmRecorder.ondataavailable = function (ev) { if (ev.data && ev.data.size > 0) dmChunks.push(ev.data); };
          dmRecorder.onstop = function () {
            stream.getTracks().forEach(function (tr) { tr.stop(); });
            isRecordingDm = false; selfBtn.classList.remove("recording");
            var blob = new Blob(dmChunks, { type: "audio/webm" }); dmChunks = [];
            if (blob.size < 200) return;
            var reader = new FileReader();
            reader.onloadend = function () { sendDM({ audio: String(reader.result || ""), text: "" }); };
            reader.readAsDataURL(blob);
          };
          dmRecorder.start();
        } catch (e) { toast("تعذر الوصول إلى الميكروفون"); }
      };
    }

    document.addEventListener("click", function (e) {
      var t = e.target;
      var joinInv = t.closest("[data-join-invite]");
      if (joinInv) { var invRoomId = joinInv.getAttribute("data-join-invite"); closeDM(); enterRoom(invRoomId); return; }
      var delTh = t.closest("[data-del-thread]");
      if (delTh) { e.stopPropagation(); deleteDmThread(delTh.getAttribute("data-del-thread")); return; }
      var invBtn = t.closest("[data-invite-friend]");
      if (invBtn) { e.stopPropagation(); inviteFriendToRoom(invBtn.getAttribute("data-invite-friend")); return; }
      var folBtn = t.closest("[data-follow-user]");
      if (folBtn) { e.stopPropagation(); followUser(folBtn.getAttribute("data-follow-user")); return; }
      var unblkBtn = t.closest("[data-unblock-user]");
      if (unblkBtn) { e.stopPropagation(); confirmUnblockUserSheet(unblkBtn.getAttribute("data-unblock-user")); return; }
      var remFrBtn = t.closest("[data-remove-friend]");
      if (remFrBtn) { e.stopPropagation(); removeFriend(remFrBtn.getAttribute("data-remove-friend")); return; }
      var prof = t.closest("[data-profile]");
      if (prof) { e.stopPropagation(); openUserProfileSheet(prof.getAttribute("data-profile")); return; }
      var ent = t.closest("[data-enter]");
      if (ent) { e.stopPropagation(); enterRoom(ent.getAttribute("data-enter")); return; }
      var add = t.closest("[data-addfriend]");
      if (add) { e.stopPropagation(); sendFriendRequest(add.getAttribute("data-addfriend")); return; }
      var canReq = t.closest("[data-cancelfreq]");
      if (canReq) { e.stopPropagation(); cancelFriendRequest(canReq.getAttribute("data-cancelfreq")); return; }
      var rej = t.closest("[data-reject]");
      if (rej) { e.stopPropagation(); rejectFriendRequest(rej.getAttribute("data-reject")); return; }
      var acc = t.closest("[data-accept]");
      if (acc) { e.stopPropagation(); acceptFriendRequest(acc.getAttribute("data-accept")); return; }
      var dm = t.closest("[data-dm]");
      if (dm && !t.closest("button")) { e.stopPropagation(); openDM(dm.getAttribute("data-dm")); }
    });
  }

  async function init() {
    initPwaInstall();
    bindEvents();
    resetInMemoryStateForSession("guest_session", false);
    renderAll();
    initCloud();

    var safetyHideTimer = setTimeout(function () { hideSplash(); }, 1200);

    if (cloud.on && cloud.auth) {
      var handledInitialAuth = false;
      cloud.auth.onAuthStateChanged(async function (authUser) {
        if (handledInitialAuth && !authUser) return;
        if (authUser) {
          handledInitialAuth = true;
          await handleAuthenticatedUser(authUser);
          return;
        }
        if (!handledInitialAuth) {
          handledInitialAuth = true;
          try {
            await cloud.auth.signInAnonymously();
          } catch (authErr) {
            clearTimeout(safetyHideTimer);
            hideSplash();
            showAuthGate(true, "login");
            setAuthError("فعّل تسجيل الدخول المجهول (Anonymous) من Firebase Authentication ثم اضغط ابدأ الآن.");
          }
        }
      });
      return;
    }

    clearTimeout(safetyHideTimer);
    hideSplash();
    UI.authReady = false;
    showAuthGate(true, "login");
    setAuthError("تعذر تحميل Firebase. يمكنك المحاولة كزائر مؤقت.");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window);
