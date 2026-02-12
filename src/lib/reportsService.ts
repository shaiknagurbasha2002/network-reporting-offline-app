import { auth, db } from "./firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  setDoc,
  increment,
  where,
  limit,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";

function requireDb() {
  if (!db) throw new Error("Firebase is not configured. Please set VITE_FIREBASE_* in .env and restart.");
  return db;
}

export type NetworkReport = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhotoURL?: string;
  provider: string;
  signalStrength: number;
  networkType: string;
  issueType: string;
  location: string;
  weather: string;
  comments: string;
  createdAt?: any;
  updatedAt?: any;
};

export type SpeedTest = {
  id: string;
  reportId: string;
  userId: string;
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  createdAt?: any;
  updatedAt?: any;
};

export async function createReport(input: Omit<NetworkReport, "id">): Promise<string> {
  const ref = await addDoc(collection(requireDb(), "network_reports"), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(
    doc(requireDb(), "users", input.userId),
    {
      uid: input.userId,
      displayName: input.userName ?? null,
      email: input.userEmail ?? "",
      photoURL: input.userPhotoURL ?? null,
      reportsCount: increment(1),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(
    doc(requireDb(), "leaderboard", input.userId),
    {
      displayName: input.userName ?? auth?.currentUser?.displayName ?? null,
      email: input.userEmail ?? auth?.currentUser?.email ?? "",
      photoURL: input.userPhotoURL ?? auth?.currentUser?.photoURL ?? null,
      reportsCount: increment(1),
      score: increment(10),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return ref.id;
}

export async function createSpeedTest(input: Omit<SpeedTest, "id" | "createdAt" | "updatedAt">) {
  await addDoc(collection(requireDb(), "speed_tests"), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

function mapReportSnapshot(snap: QuerySnapshot<DocumentData>, source: "network_reports" | "reports") {
  return snap.docs.map((d) => {
    const data: any = d.data();
    return {
      id: `${source}:${d.id}`,
      userId: data.userId ?? "",
      userName: data.userName ?? data.name ?? undefined,
      userEmail: data.userEmail ?? data.email ?? undefined,
      userPhotoURL: data.userPhotoURL ?? data.photoURL ?? "",
      provider: data.provider ?? data.title ?? "",
      signalStrength: Number(data.signalStrength ?? 0),
      networkType: data.networkType ?? "",
      issueType: data.issueType ?? data.description ?? "",
      location: data.location ?? "",
      weather: data.weather ?? "",
      comments: data.comments ?? "",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as NetworkReport;
  });
}

export function subscribeReports(cb: (reports: NetworkReport[]) => void) {
  const qPrimary = query(
    collection(requireDb(), "network_reports"),
    orderBy("createdAt", "desc")
  );
  const qLegacy = query(
    collection(requireDb(), "reports"),
    orderBy("createdAt", "desc")
  );

  let primaryRows: NetworkReport[] = [];
  let legacyRows: NetworkReport[] = [];

  const emit = () => {
    const merged = [...primaryRows, ...legacyRows];
    const sorted = merged.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
      const bTime = b.createdAt?.toDate?.()?.getTime?.() ?? 0;
      return bTime - aTime;
    });
    cb(sorted);
  };

  const unsubPrimary = onSnapshot(
    qPrimary,
    (snap) => {
      primaryRows = mapReportSnapshot(snap, "network_reports");
      emit();
    },
    (err) => {
      console.error("[subscribeReports]", err);
      primaryRows = [];
      emit();
    }
  );

  const unsubLegacy = onSnapshot(
    qLegacy,
    (snap) => {
      legacyRows = mapReportSnapshot(snap, "reports");
      emit();
    },
    (err) => {
      console.error("[subscribeReports:legacy]", err);
      legacyRows = [];
      emit();
    }
  );

  return () => {
    unsubPrimary();
    unsubLegacy();
  };
}

export function subscribeUserReports(
  uid: string,
  email: string | null | undefined,
  cb: (reports: NetworkReport[]) => void,
  maxRows?: number
) {
  const primaryConstraints = [
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
  ];
  if (typeof maxRows === "number" && maxRows > 0) {
    primaryConstraints.push(limit(maxRows));
  }
  const qPrimary = query(collection(requireDb(), "network_reports"), ...primaryConstraints);

  const legacyConstraints = [
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
  ];
  if (typeof maxRows === "number" && maxRows > 0) {
    legacyConstraints.push(limit(maxRows));
  }
  const qLegacy = query(collection(requireDb(), "reports"), ...legacyConstraints);

  let primaryRows: NetworkReport[] = [];
  let legacyRows: NetworkReport[] = [];

  const emit = () => {
    const merged = [...primaryRows, ...legacyRows];
    const unique = new Map<string, NetworkReport>();
    merged.forEach((row) => unique.set(row.id, row));
    const sorted = Array.from(unique.values()).sort((a, b) => {
      const aTime = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
      const bTime = b.createdAt?.toDate?.()?.getTime?.() ?? 0;
      return bTime - aTime;
    });
    cb(sorted);
  };

  const unsubPrimary = onSnapshot(
    qPrimary,
    (snap) => {
      primaryRows = mapReportSnapshot(snap, "network_reports");
      emit();
    },
    (err) => {
      console.error("[subscribeUserReports]", err);
      primaryRows = [];
      emit();
    }
  );

  const unsubLegacy = onSnapshot(
    qLegacy,
    (snap) => {
      legacyRows = mapReportSnapshot(snap, "reports");
      emit();
    },
    (err) => {
      console.error("[subscribeUserReports:legacy]", err);
      legacyRows = [];
      emit();
    }
  );

  return () => {
    unsubPrimary();
    unsubLegacy();
  };
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
