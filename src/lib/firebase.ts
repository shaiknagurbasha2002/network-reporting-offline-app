import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};
console.log("API KEY:", import.meta.env.VITE_FIREBASE_API_KEY);


export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

if (isFirebaseConfigured) {
  _app = initializeApp(firebaseConfig as any);
  _auth = getAuth(_app);
  _db = getFirestore(_app);
} else {
  // Avoid crashing into a blank page when .env isn't configured yet.
  console.warn(
    "[Firebase] Missing VITE_FIREBASE_* env vars. Add them to .env and restart the dev server."
  );
}

export const app = _app;
export const auth = _auth;
export const db = _db;
