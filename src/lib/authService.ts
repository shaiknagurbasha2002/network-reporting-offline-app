import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "./firebase";

function requireAuth() {
  if (!auth) throw new Error("Firebase is not configured. Please set VITE_FIREBASE_* in .env and restart.");
  return auth;
}

export function listenAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(requireAuth(), cb);
}

export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(requireAuth(), email, password);
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(requireAuth(), email, password);
}

export async function logOut() {
  return signOut(requireAuth());
}
