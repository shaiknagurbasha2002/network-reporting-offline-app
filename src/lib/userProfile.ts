// src/services/userProfile.ts
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export type UserProfile = {
  uid: string;
  email?: string | null;
  name?: string | null;
  photoURL?: string | null; // stored in Firestore (your uploaded pic)
  authPhotoURL?: string | null; // from Google (fallback)
  updatedAt?: any;
  createdAt?: any;
};

export function userDocRef(uid: string) {
  return doc(db, "users", uid);
}

// Ensure a profile doc exists on login (idempotent)
export async function upsertUserProfileOnLogin(params: {
  uid: string;
  email?: string | null;
  name?: string | null;
  authPhotoURL?: string | null;
}) {
  const ref = userDocRef(params.uid);
  await setDoc(
    ref,
    {
      uid: params.uid,
      email: params.email ?? null,
      name: params.name ?? null,
      authPhotoURL: params.authPhotoURL ?? null,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Real-time listener for profile
export function listenUserProfile(uid: string, cb: (p: UserProfile | null) => void) {
  const ref = userDocRef(uid);
  return onSnapshot(
    ref,
    (snap) => {
      cb(snap.exists() ? (snap.data() as UserProfile) : null);
    },
    (err) => {
      console.error("[listenUserProfile]", err);
      cb(null);
    }
  );
}

// Save uploaded photo URL to profile
export async function saveProfilePhotoURL(uid: string, photoURL: string) {
  const ref = userDocRef(uid);
  await setDoc(ref, { photoURL, updatedAt: serverTimestamp() }, { merge: true });
}
