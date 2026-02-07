import { db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export type UserProfile = {
  uid: string;
  name: string;
  displayName?: string;
  email: string;
  location: string;
  photoURL?: string | null;
  reportsCount?: number;
  createdAt?: any;
  isAdmin?: boolean;
};

function requireDb() {
  if (!db) throw new Error("Firebase is not configured. Please set VITE_FIREBASE_* in .env and restart.");
  return db;
}

export async function upsertUserProfile(profile: UserProfile) {
  const ref = doc(requireDb(), "users", profile.uid);
  await setDoc(
    ref,
    {
      name: profile.name,
      displayName: profile.displayName ?? profile.name,
      email: profile.email,
      location: profile.location,
      photoURL: profile.photoURL ?? null,
      reportsCount: typeof profile.reportsCount === "number" ? profile.reportsCount : 0,
      createdAt: serverTimestamp(),
      isAdmin: !!profile.isAdmin,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(requireDb(), "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data: any = snap.data();
  return {
    uid,
    name: data.name ?? "User",
    displayName: data.displayName ?? data.name ?? "User",
    email: data.email ?? "",
    location: data.location ?? "",
    photoURL: data.photoURL ?? null,
    reportsCount: Number(data.reportsCount ?? 0),
    createdAt: data.createdAt,
    isAdmin: !!data.isAdmin,
  };
}

// Backwards-compatible export for older imports
export async function getUserProfileOnce(uid: string): Promise<UserProfile | null> {
  return getUserProfile(uid);
}
