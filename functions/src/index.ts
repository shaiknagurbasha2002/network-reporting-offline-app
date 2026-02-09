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
      uid,
      displayName: data.userName ?? data.name ?? "User",
      name: data.userName ?? data.name ?? "User",
      email: data.userEmail ?? data.email ?? "",
      photoURL: data.userPhotoURL ?? data.photoURL ?? null,
      reportsCount: FieldValue.increment(1),
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
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

export const onLegacyReportCreated = functions.firestore
  .document("reports/{reportId}")
  .onCreate(async (snap) => {
    const data = snap.data() || {};
    await ensureReportFields(snap.ref, data);
    await updateUserFromReport(data);
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
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });
