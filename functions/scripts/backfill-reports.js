const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

async function loadUsers() {
  const snap = await db.collection("users").get();
  const byEmail = new Map();
  const byUid = new Map();
  const allUids = new Set();
  snap.docs.forEach((doc) => {
    const data = doc.data() || {};
    const uid = doc.id;
    allUids.add(uid);
    const email = (data.email || "").toLowerCase();
    if (email) byEmail.set(email, uid);
    byUid.set(uid, {
      displayName: data.displayName || null,
      email: data.email || "",
      photoURL: data.photoURL || null,
    });
  });
  return { byEmail, byUid, allUids };
}

async function scanReportsCollection(name, userByEmail, counts) {
  let lastDoc = null;
  let totalDocs = 0;
  let updatedDocs = 0;

  while (true) {
    let q = db.collection(name).orderBy(admin.firestore.FieldPath.documentId()).limit(500);
    if (lastDoc) q = q.startAfter(lastDoc);
    const snap = await q.get();
    if (snap.empty) break;
    lastDoc = snap.docs[snap.docs.length - 1];

    const batch = db.batch();
    let batchOps = 0;

    for (const doc of snap.docs) {
      totalDocs += 1;
      const data = doc.data() || {};
      const updates = {};

      const email =
        (data.userEmail || data.email || "").toLowerCase();

      let uid = data.userId;
      if (!uid && email && userByEmail.has(email)) {
        uid = userByEmail.get(email);
        updates.userId = uid;
      }

      if (!data.userEmail && data.email) {
        updates.userEmail = data.email;
      }
      if (!data.userName && data.name) {
        updates.userName = data.name;
      }
      if (!data.createdAt) {
        updates.createdAt = FieldValue.serverTimestamp();
      }

      if (Object.keys(updates).length > 0) {
        batch.set(doc.ref, updates, { merge: true });
        batchOps += 1;
        updatedDocs += 1;
      }

      if (uid) {
        counts.set(uid, (counts.get(uid) || 0) + 1);
      }

      if (batchOps >= 400) {
        await batch.commit();
        batchOps = 0;
      }
    }

    if (batchOps > 0) {
      await batch.commit();
    }
  }

  return { totalDocs, updatedDocs };
}

async function updateUserCounts(counts) {
  const entries = Array.from(counts.entries());
  let idx = 0;

  while (idx < entries.length) {
    const batch = db.batch();
    const slice = entries.slice(idx, idx + 400);
    slice.forEach(([uid, count]) => {
      const ref = db.doc(`users/${uid}`);
      batch.set(
        ref,
        {
          reportsCount: count,
          score: count * 10,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });
    await batch.commit();
    idx += slice.length;
  }
}

async function main() {
  console.log("Loading users...");
  const { byEmail, byUid } = await loadUsers();

  const counts = new Map();

  console.log("Scanning network_reports...");
  const primary = await scanReportsCollection("network_reports", byEmail, counts);
  console.log("network_reports:", primary);

  console.log("Scanning reports (legacy)...");
  const legacy = await scanReportsCollection("reports", byEmail, counts);
  console.log("reports:", legacy);

  console.log("Updating user counts...");
  await updateUserCounts(counts);

  console.log("Updating leaderboard...");
  const leaderboardEntries = Array.from(counts.entries());
  let idx = 0;
  while (idx < leaderboardEntries.length) {
    const batch = db.batch();
    const slice = leaderboardEntries.slice(idx, idx + 400);
    slice.forEach(([uid, count]) => {
      const user = byUid.get(uid) || {};
      const ref = db.doc(`leaderboard/${uid}`);
      batch.set(
        ref,
        {
          displayName: user.displayName ?? null,
          email: user.email ?? "",
          photoURL: user.photoURL ?? null,
          reportsCount: count,
          score: count * 10,
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });
    await batch.commit();
    idx += slice.length;
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
