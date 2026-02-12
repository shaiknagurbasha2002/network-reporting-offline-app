import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

function requireDb() {
  if (!db)
    throw new Error(
      "Firebase is not configured. Please set VITE_FIREBASE_* in .env and restart."
    );
  return db;
}

export function listenAdmin(uid: string, cb: (isAdmin: boolean) => void) {
  if (!uid) {
    cb(false);
    return () => {};
  }

  const ref = doc(requireDb(), "admins", uid);
  return onSnapshot(
    ref,
    (snap) => cb(snap.exists()),
    () => cb(false)
  );
}

export async function getAdminOnce(uid: string): Promise<boolean> {
  if (!uid) return false;
  const ref = doc(requireDb(), "admins", uid);
  const snap = await getDoc(ref);
  return snap.exists();
}

export async function createAdmin(uid: string) {
  if (!uid) throw new Error("Admin UID is required.");
  const ref = doc(requireDb(), "admins", uid);
  await setDoc(
    ref,
    {
      role: "admin",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function createAdminByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error("Admin email is required.");

  const q = query(
    collection(requireDb(), "users"),
    where("emailLower", "==", normalized)
  );
  const snap = await getDocs(q);
  const docSnap = snap.docs[0];

  if (!docSnap) {
    throw new Error("No user found with that email.");
  }

  await createAdmin(docSnap.id);
}
