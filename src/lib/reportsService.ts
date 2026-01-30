import { db } from "./firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";

function requireDb() {
  if (!db) throw new Error("Firebase is not configured. Please set VITE_FIREBASE_* in .env and restart.");
  return db;
}

export type NetworkReport = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  provider: string;
  signalStrength: string;
  networkType: string;
  issueType: string;
  location: string;
  weather: string;
  comments: string;
  timestamp: string;
};

export type SpeedTest = {
  id: string;
  reportId: string;
  userId: string;
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  timestamp: string;
};

export async function createReport(input: Omit<NetworkReport, "id">): Promise<string> {
  const ref = await addDoc(collection(requireDb(), "network_reports"), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function createSpeedTest(input: Omit<SpeedTest, "id" | "timestamp"> & { timestamp?: string }) {
  await addDoc(collection(requireDb(), "speed_tests"), {
    ...input,
    timestamp: input.timestamp ?? new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
}

export function subscribeReports(cb: (reports: NetworkReport[]) => void) {
  const q = query(collection(requireDb(), "network_reports"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => {
      const data: any = d.data();
      return {
        id: d.id,
        userId: data.userId ?? "",
        userName: data.userName ?? "Anonymous",
        userEmail: data.userEmail ?? "",
        provider: data.provider ?? "",
        signalStrength: data.signalStrength ?? "",
        networkType: data.networkType ?? "",
        issueType: data.issueType ?? "",
        location: data.location ?? "",
        weather: data.weather ?? "",
        comments: data.comments ?? "",
        timestamp: data.timestamp ?? new Date().toISOString(),
      } as NetworkReport;
    });
    cb(rows);
  });
}

export async function updateReport(
  id: string,
  patch: Partial<
    Pick<
      NetworkReport,
      | "comments"
      | "issueType"
      | "weather"
      | "location"
      | "signalStrength"
      | "networkType"
      | "provider"
    >
  >
) {
  await updateDoc(doc(requireDb(), "network_reports", id), patch);
}
