import { db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  location: string;
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
      email: profile.email,
      location: profile.location,
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
    email: data.email ?? "",
    location: data.location ?? "",
    isAdmin: !!data.isAdmin,
  };
}
