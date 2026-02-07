import { auth, db, storage } from "./firebase";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { updateProfile } from "firebase/auth";

export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  bio?: string | null;
  updatedAt?: any;
};

const MAX_BIO_LENGTH = 160;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function requireDb() {
  if (!db) throw new Error("Firebase is not configured. Please set VITE_FIREBASE_* in .env and restart.");
  return db;
}

function requireStorage() {
  if (!storage) throw new Error("Firebase Storage is not configured. Please set VITE_FIREBASE_* in .env and restart.");
  return storage;
}

function normalizeBio(bio: string) {
  return bio.trim().slice(0, MAX_BIO_LENGTH);
}

function buildDefaultProfile(uid: string): UserProfile {
  const email = auth?.currentUser?.email ?? "";
  const displayName =
    auth?.currentUser?.displayName ??
    (email ? email.split("@")[0] : "User");

  return {
    uid,
    email,
    displayName,
    photoURL: auth?.currentUser?.photoURL ?? null,
    bio: "",
    updatedAt: serverTimestamp(),
  };
}

async function ensureUserProfile(uid: string) {
  const refDoc = doc(requireDb(), "users", uid);
  const snap = await getDoc(refDoc);
  if (snap.exists()) return;

  const baseProfile = buildDefaultProfile(uid);
  await setDoc(
    refDoc,
    {
      email: baseProfile.email,
      displayName: baseProfile.displayName ?? null,
      photoURL: baseProfile.photoURL ?? null,
      bio: baseProfile.bio ?? "",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  await ensureUserProfile(uid);
  const refDoc = doc(requireDb(), "users", uid);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) return null;
  const data: any = snap.data();
  return {
    uid,
    email: data.email ?? "",
    displayName: data.displayName ?? null,
    photoURL: data.photoURL ?? null,
    bio: data.bio ?? "",
    updatedAt: data.updatedAt,
  };
}

export async function saveUserBio(uid: string, bio: string) {
  const refDoc = doc(requireDb(), "users", uid);
  await setDoc(refDoc, {
    bio: normalizeBio(bio),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export function subscribeUserProfile(uid: string, cb: (profile: UserProfile | null) => void) {
  const refDoc = doc(requireDb(), "users", uid);
  return onSnapshot(
    refDoc,
    async (snap) => {
      if (!snap.exists()) {
        try {
          await ensureUserProfile(uid);
        } catch (err) {
          console.error("[subscribeUserProfile] create error:", err);
        }
        cb(buildDefaultProfile(uid));
        return;
      }
      const data: any = snap.data();
      cb({
        uid,
        email: data.email ?? "",
        displayName: data.displayName ?? null,
        photoURL: data.photoURL ?? null,
        bio: data.bio ?? "",
        updatedAt: data.updatedAt,
      });
    },
    (err) => {
      console.error("[subscribeUserProfile]", err);
      cb(null);
    }
  );
}

export async function uploadProfilePic(
  uid: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Please upload a JPG, PNG, or WEBP image.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Image must be 2MB or smaller.");
  }

  const fileRef = ref(requireStorage(), `profilePics/${uid}`);
  const task = uploadBytesResumable(fileRef, file, { contentType: file.type });

  await new Promise<void>((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        const pct = snap.totalBytes
          ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
          : 0;
        onProgress?.(pct);
      },
      (err) => reject(err),
      () => resolve()
    );
  });
  const url = await getDownloadURL(fileRef);

  await setDoc(
    doc(requireDb(), "users", uid),
    {
      photoURL: url,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  if (auth?.currentUser && auth.currentUser.uid === uid) {
    await updateProfile(auth.currentUser, { photoURL: url });
  }

  return url;
}
