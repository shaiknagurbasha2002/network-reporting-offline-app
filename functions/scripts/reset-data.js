const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage().bucket();

const collections = [
  "network_reports",
  "reports",
  "speed_tests",
  "leaderboard",
  "users",
  "admins",
];

async function deleteCollection(name) {
  const snap = await db.collection(name).limit(500).get();
  if (snap.empty) return;
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  await deleteCollection(name);
}

async function main() {
  for (const col of collections) {
    console.log("Deleting collection:", col);
    await deleteCollection(col);
  }

  console.log("Deleting storage folder: profilePics/");
  await storage.deleteFiles({ prefix: "profilePics/" });

  console.log("Reset complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
