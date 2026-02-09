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
  location?: string | null;
  reportsCount?: number;
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
    reportsCount: 0,
    updatedAt: serverTimestamp(),
  };
}

export async function ensureUserDoc(uid: string) {
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
      reportsCount: 0,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  await ensureUserDoc(uid);
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
    location: data.location ?? null,
    reportsCount: Number(data.reportsCount ?? 0),
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
          await ensureUserDoc(uid);
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
        location: data.location ?? null,
        reportsCount: Number(data.reportsCount ?? 0),
        updatedAt: data.updatedAt,
      });
    },
    (err) => {
      console.error("[subscribeUserProfile]", err);
      cb(null);
    }
  );
}

export async function updateUserProfile(params: {
  uid: string;
  displayName?: string;
  bio?: string;
  photoURL?: string | null;
  email?: string;
}) {
  const refDoc = doc(requireDb(), "users", params.uid);
  await setDoc(
    refDoc,
    {
      email: params.email ?? auth?.currentUser?.email ?? "",
      displayName: params.displayName ?? auth?.currentUser?.displayName ?? null,
      photoURL: params.photoURL ?? auth?.currentUser?.photoURL ?? null,
      bio: params.bio ?? "",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  if (auth?.currentUser && auth.currentUser.uid === params.uid) {
    await updateProfile(auth.currentUser, {
      displayName: params.displayName ?? auth.currentUser.displayName ?? undefined,
      photoURL: params.photoURL ?? auth.currentUser.photoURL ?? undefined,
    });
  }
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
    throw new Error("Image must be 10MB or smaller.");
  }

  const fileRef = ref(requireStorage(), `profilePics/${uid}`);
  const task = uploadBytesResumable(fileRef, file, { contentType: file.type });
  const timeoutMs = 60000;

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      try {
        task.cancel();
      } catch {
        // ignore cancel errors
      }
      reject(new Error("Upload timed out. Please try again."));
    }, timeoutMs);

    task.on(
      "state_changed",
      (snap) => {
        const pct = snap.totalBytes
          ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
          : 0;
        onProgress?.(pct);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
      () => {
        clearTimeout(timer);
        resolve();
      }
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
