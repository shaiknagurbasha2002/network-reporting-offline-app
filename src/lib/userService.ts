import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export type UserProfile = {
  uid: string;
  displayName?: string;
  email: string;
  photoURL?: string | null;
  bio?: string | null;
  location?: string | null;
  reportsCount?: number;
  score?: number;
  createdAt?: any;
  updatedAt?: any;
  lastLoginAt?: any;
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
      displayName: profile.displayName ?? null,
      email: profile.email,
      photoURL: profile.photoURL ?? null,
      bio: profile.bio ?? "",
      location: profile.location ?? null,
      reportsCount: typeof profile.reportsCount === "number" ? profile.reportsCount : 0,
      score: typeof profile.score === "number" ? profile.score : 0,
      createdAt: profile.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: profile.lastLoginAt ?? serverTimestamp(),
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
    displayName: data.displayName ?? "User",
    email: data.email ?? "",
    photoURL: data.photoURL ?? null,
    bio: data.bio ?? "",
    location: data.location ?? null,
    reportsCount: Number(data.reportsCount ?? 0),
    score: Number(data.score ?? 0),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    lastLoginAt: data.lastLoginAt,
  };
}

export async function setUserReportsCount(uid: string, count: number) {
  const ref = doc(requireDb(), "users", uid);
  await setDoc(
    ref,
    {
      reportsCount: count,
      score: count * 10,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(
    doc(requireDb(), "leaderboard", uid),
    {
      displayName: auth?.currentUser?.displayName ?? null,
      email: auth?.currentUser?.email ?? "",
      photoURL: auth?.currentUser?.photoURL ?? null,
      reportsCount: count,
      score: count * 10,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function setUserLastLogin(uid: string) {
  const ref = doc(requireDb(), "users", uid);
  await setDoc(
    ref,
    {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function upsertLeaderboardEntry(params: {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  reportsCount?: number;
  score?: number;
  createdAt?: any;
}) {
  const ref = doc(requireDb(), "leaderboard", params.uid);
  await setDoc(
    ref,
    {
      displayName: params.displayName ?? null,
      email: params.email ?? "",
      photoURL: params.photoURL ?? null,
      reportsCount: typeof params.reportsCount === "number" ? params.reportsCount : 0,
      score: typeof params.score === "number" ? params.score : 0,
      createdAt: params.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Backwards-compatible export for older imports
export async function getUserProfileOnce(uid: string): Promise<UserProfile | null> {
  return getUserProfile(uid);
}
