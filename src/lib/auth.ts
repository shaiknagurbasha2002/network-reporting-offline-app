// src/services/auth.ts
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
  Unsubscribe,
  UserCredential,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

/**
 * Listen to real-time authentication changes.
 * Automatically keeps user session in sync across tabs and route changes.
 * 
 * @param cb Callback invoked every time the auth state changes.
 * @returns Firebase Unsubscribe function
 */
export function listenAuth(cb: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, cb);
}

/**
 * Trigger Google Sign-In popup and sign in the user.
 * This uses the reusable provider from firebase.ts to ensure consistent parameters.
 * 
 * Creates a persistent session automatically via browserLocalPersistence (set in firebase.ts).
 */
export async function signInWithGoogle(): Promise<User> {
  googleProvider.setCustomParameters({ prompt: "select_account" });

  const res: UserCredential = await signInWithPopup(auth, googleProvider);
  return res.user;
}

/**
 * Logs out current Firebase user and clears local session.
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("[Auth] Logout failed:", err);
    throw err;
  }
}
