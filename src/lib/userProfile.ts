// src/services/userProfile.ts
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export type UserProfile = {
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null; // stored in Firestore (your uploaded pic)
  location?: string | null;
  reportsCount?: number;
  score?: number;
  lastLoginAt?: any;
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
  displayName?: string | null;
  photoURL?: string | null;
}) {
  const ref = userDocRef(params.uid);
  await setDoc(
    ref,
    {
      email: params.email ?? null,
      displayName: params.displayName ?? null,
      photoURL: params.photoURL ?? null,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
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
