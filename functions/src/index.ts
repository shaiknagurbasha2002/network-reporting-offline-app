import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

async function updateUserFromReport(data: admin.firestore.DocumentData) {
  const uid = data.userId;
  if (!uid) return;

  await db.doc(`users/${uid}`).set(
    {
      displayName: data.userName ?? data.name ?? null,
      email: data.userEmail ?? data.email ?? "",
      photoURL: data.userPhotoURL ?? data.photoURL ?? null,
      reportsCount: FieldValue.increment(1),
      score: FieldValue.increment(10),
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

async function updateLeaderboardFromReport(data: admin.firestore.DocumentData, delta: number) {
  const uid = data.userId;
  if (!uid) return;

  await db.doc(`leaderboard/${uid}`).set(
    {
      displayName: data.userName ?? data.name ?? null,
      email: data.userEmail ?? data.email ?? "",
      photoURL: data.userPhotoURL ?? data.photoURL ?? null,
      reportsCount: FieldValue.increment(delta),
      score: FieldValue.increment(delta * 10),
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

async function ensureReportFields(ref: admin.firestore.DocumentReference, data: admin.firestore.DocumentData) {
  const updates: Record<string, unknown> = {};

  if (!data.createdAt) {
    updates.createdAt = FieldValue.serverTimestamp();
  }
  if (!data.updatedAt) {
    updates.updatedAt = FieldValue.serverTimestamp();
  }
  if (!data.userEmail && data.email) {
    updates.userEmail = data.email;
  }
  if (!data.userName && data.name) {
    updates.userName = data.name;
  }

  if (Object.keys(updates).length > 0) {
    await ref.set(updates, { merge: true });
  }
}

export const onNetworkReportCreated = functions.firestore
  .document("network_reports/{reportId}")
  .onCreate(async (snap) => {
    const data = snap.data() || {};
    await ensureReportFields(snap.ref, data);
    await updateUserFromReport(data);
    await updateLeaderboardFromReport(data, 1);
  });

export const onNetworkReportDeleted = functions.firestore
  .document("network_reports/{reportId}")
  .onDelete(async (snap) => {
    const data = snap.data() || {};
    const uid = data.userId;
    if (!uid) return;
    await db.doc(`users/${uid}`).set(
      {
        reportsCount: FieldValue.increment(-1),
        score: FieldValue.increment(-10),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    await updateLeaderboardFromReport(data, -1);
  });

export const onLegacyReportCreated = functions.firestore
  .document("reports/{reportId}")
  .onCreate(async (snap) => {
    const data = snap.data() || {};
    await ensureReportFields(snap.ref, data);
    await updateUserFromReport(data);
    await updateLeaderboardFromReport(data, 1);
  });

export const onLegacyReportDeleted = functions.firestore
  .document("reports/{reportId}")
  .onDelete(async (snap) => {
    const data = snap.data() || {};
    const uid = data.userId;
    if (!uid) return;
    await db.doc(`users/${uid}`).set(
      {
        reportsCount: FieldValue.increment(-1),
        score: FieldValue.increment(-10),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    await updateLeaderboardFromReport(data, -1);
  });
