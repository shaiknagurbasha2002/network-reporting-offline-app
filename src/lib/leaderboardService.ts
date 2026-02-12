import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
  FirestoreError,
} from "firebase/firestore";

export type LeaderboardEntry = {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string | null;
  reportsCount: number;
  score?: number;
  createdAt?: any;
  updatedAt?: any;
};

function requireDb() {
  if (!db)
    throw new Error(
      "Firebase is not configured. Please set VITE_FIREBASE_* in .env and restart."
    );
  return db;
}

export function subscribeLeaderboard(
  cb: (rows: LeaderboardEntry[]) => void,
  maxRows = 50
) {
  const q = query(
    collection(requireDb(), "leaderboard"),
    orderBy("reportsCount", "desc"),
    limit(maxRows)
  );

  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          uid: d.id,
          displayName: data.displayName ?? "User",
          email: data.email ?? "",
          photoURL: data.photoURL ?? null,
          reportsCount: Number(data.reportsCount ?? 0),
          score: Number(data.score ?? 0),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });
      cb(rows);
    },
    (err: FirestoreError) => {
      console.error("[subscribeLeaderboard] Firestore error:", err);
      cb([]);
    }
  );
}
