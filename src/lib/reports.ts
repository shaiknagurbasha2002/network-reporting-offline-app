// src/services/reports.ts
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  addDoc,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebase";

export type Report = {
  id: string;
  userId: string;
  title?: string;
  description?: string;
  createdAt?: any;
  [k: string]: any;
};

export function listenUserReports(uid: string, cb: (items: Report[]) => void) {
  const q = query(
    collection(db, "reports"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as Report[];
      cb(items);
    },
    (err) => {
      console.error("[listenUserReports]", err);
      cb([]);
    }
  );
}

// Example create (if you store reports)
export async function createReport(uid: string, data: Omit<Report, "id" | "userId" | "createdAt">) {
  await addDoc(collection(db, "reports"), {
    ...data,
    userId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
