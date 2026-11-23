const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } else {
    admin.initializeApp({
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  }
}

const db = admin.database();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Economy server is running" });
});

async function verifyUser(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return res.status(401).json({ ok: false, error: "غير مصرح" });
  try {
    req.user = await admin.auth().verifyIdToken(token);
    return next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: "رمز الدخول غير صالح" });
  }
}

app.post("/initWallet", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  const walletRef = db.ref(`economy/wallets/${uid}`);
  await walletRef.transaction((cur) => {
    if (!cur) return { balance: 100, updatedAt: Date.now() };
    return cur;
  });
  const snap = await walletRef.once("value");
  const val = snap.val() || { balance: 0 };
  res.json({ ok: true, balance: Number(val.balance || 0) });
});

app.post("/spendCoinsGift", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  const { toUserId, giftId, giftName, unitPrice, quantity, roomId } = req.body || {};
  const qty = Math.max(1, Math.min(100, Math.floor(Number(quantity || 1))));
  const price = Math.max(0, Math.floor(Number(unitPrice || 0)));
  const totalCost = price * qty;

  if (!toUserId || toUserId === uid) {
    return res.status(400).json({ ok: false, error: "مستلم غير صالح" });
  }

  let newBalance = 0;
  let enoughCoins = true;

  await db.ref(`economy/wallets/${uid}/balance`).transaction((cur) => {
    const v = Number(cur || 0);
    if (v < totalCost) {
      enoughCoins = false;
      newBalance = v;
      return cur;
    }
    enoughCoins = true;
    newBalance = v - totalCost;
    return newBalance;
  });

  if (!enoughCoins) {
    return res.status(400).json({ ok: false, error: "رصيد العملات غير كافٍ" });
  }

  const txId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  await db.ref(`economy/ledger/${uid}/${txId}`).set({
    title: `إرسال هدية ${giftName || giftId} ×${qty}`,
    amount: -totalCost,
    toUserId,
    roomId: roomId || "",
    createdAt: Date.now()
  });

  res.json({ ok: true, balance: newBalance, txId });
});

app.post("/openLuckyBox", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  const { boxId, roomId } = req.body || {};
  const boxSnap = await db.ref(`lucky_boxes/${boxId}`).once("value");
  const box = boxSnap.val();

  if (!box || box.active === false || !Array.isArray(box.rewards) || !box.rewards.length) {
    return res.status(400).json({ ok: false, error: "الصندوق غير متاح" });
  }

  const price = Math.max(0, Number(box.price || 0));
  let enoughCoins = true;
  let newBalance = 0;

  await db.ref(`economy/wallets/${uid}/balance`).transaction((cur) => {
    const v = Number(cur || 0);
    if (v < price) {
      enoughCoins = false;
      newBalance = v;
      return cur;
    }
    enoughCoins = true;
    newBalance = v - price;
    return newBalance;
  });

  if (!enoughCoins) {
    return res.status(400).json({ ok: false, error: "رصيدك غير كافٍ لفتح الصندوق" });
  }

  const totalProb = box.rewards.reduce((sum, r) => sum + Math.max(0, Number(r.probability || 0)), 0);
  let pick = Math.random() * (totalProb > 0 ? totalProb : box.rewards.length);
  let acc = 0;
  let won = box.rewards[0];

  for (const r of box.rewards) {
    acc += totalProb > 0 ? Math.max(0, Number(r.probability || 0)) : 1;
    if (pick <= acc) {
      won = r;
      break;
    }
  }

  if (won.rewardType === "coins") {
    const bonus = Math.max(0, Number(won.value || 0));
    await db.ref(`economy/wallets/${uid}/balance`).transaction((cur) => Number(cur || 0) + bonus);
    newBalance += bonus;
  } else if (won.rewardType === "vip") {
    const vLv = Math.max(1, Number(won.value || 1));
    const vDays = Math.max(1, Number(won.days || 3));
    const exp = Date.now() + vDays * 86400000;
    await db.ref(`users/${uid}`).update({ vip: vLv, vipExpiresAt: exp });
    await db.ref(`publicProfiles/${uid}`).update({ vip: vLv, vipExpiresAt: exp });
  }

  const drawId = `ld_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const rewardPayload = {
    id: drawId,
    boxId,
    boxName: box.name,
    title: won.title,
    rewardType: won.rewardType,
    value: won.value,
    emoji: won.emoji || "🎁",
    rarity: won.rarity || "rare",
    userId: uid,
    roomId: roomId || "",
    t: Date.now()
  };

  await db.ref(`lucky_draws/${drawId}`).set(rewardPayload);
  await db.ref(`economy/ledger/${uid}/${drawId}`).set({
    title: `${box.name}: ${won.title}`,
    amount: won.rewardType === "coins" ? Number(won.value || 0) - price : -price,
    createdAt: Date.now()
  });

  res.json({ ok: true, balance: newBalance, reward: rewardPayload });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("REAL VOICE Economy Server running on", PORT));
