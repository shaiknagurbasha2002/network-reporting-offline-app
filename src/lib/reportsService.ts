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
  userName: string;
  userEmail: string;
  userPhotoURL?: string;
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

  await setDoc(
    doc(requireDb(), "users", input.userId),
    {
      uid: input.userId,
      displayName: input.userName ?? "User",
      name: input.userName ?? "User",
      email: input.userEmail ?? "",
      photoURL: input.userPhotoURL ?? null,
      reportsCount: increment(1),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return ref.id;
}

export async function createSpeedTest(input: Omit<SpeedTest, "id" | "timestamp"> & { timestamp?: string }) {
  await addDoc(collection(requireDb(), "speed_tests"), {
    ...input,
    timestamp: input.timestamp ?? new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
}

function mapReportSnapshot(snap: QuerySnapshot<DocumentData>, source: "network_reports" | "reports") {
  return snap.docs.map((d) => {
    const data: any = d.data();
    const createdAtIso =
      data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString();

    return {
      id: `${source}:${d.id}`,
      userId: data.userId ?? "",
      userName: data.userName ?? data.name ?? "Anonymous",
      userEmail: data.userEmail ?? data.email ?? "",
      userPhotoURL: data.userPhotoURL ?? data.photoURL ?? "",
      provider: data.provider ?? data.title ?? "",
      signalStrength: data.signalStrength ?? "",
      networkType: data.networkType ?? "",
      issueType: data.issueType ?? data.description ?? "",
      location: data.location ?? "",
      weather: data.weather ?? "",
      comments: data.comments ?? "",
      timestamp: data.timestamp ?? createdAtIso,
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
    cb(merged);
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
  ];
  if (typeof maxRows === "number" && maxRows > 0) {
    primaryConstraints.push(limit(maxRows));
  }
  const qPrimary = query(collection(requireDb(), "network_reports"), ...primaryConstraints);

  const qPrimaryByEmail = email
    ? (() => {
        const emailConstraints = [
          where("userEmail", "==", email),
        ];
        if (typeof maxRows === "number" && maxRows > 0) {
          emailConstraints.push(limit(maxRows));
        }
        return query(collection(requireDb(), "network_reports"), ...emailConstraints);
      })()
    : null;
  const qPrimaryByLegacyEmail = email
    ? (() => {
        const legacyEmailConstraints = [
          where("email", "==", email),
        ];
        if (typeof maxRows === "number" && maxRows > 0) {
          legacyEmailConstraints.push(limit(maxRows));
        }
        return query(collection(requireDb(), "network_reports"), ...legacyEmailConstraints);
      })()
    : null;

  const legacyConstraints = [
    where("userId", "==", uid),
  ];
  if (typeof maxRows === "number" && maxRows > 0) {
    legacyConstraints.push(limit(maxRows));
  }
  const qLegacy = query(collection(requireDb(), "reports"), ...legacyConstraints);

  const qLegacyByEmail = email
    ? (() => {
        const legacyEmailConstraints = [
          where("userEmail", "==", email),
        ];
        if (typeof maxRows === "number" && maxRows > 0) {
          legacyEmailConstraints.push(limit(maxRows));
        }
        return query(collection(requireDb(), "reports"), ...legacyEmailConstraints);
      })()
    : null;
  const qLegacyByLegacyEmail = email
    ? (() => {
        const legacyEmailConstraints = [
          where("email", "==", email),
        ];
        if (typeof maxRows === "number" && maxRows > 0) {
          legacyEmailConstraints.push(limit(maxRows));
        }
        return query(collection(requireDb(), "reports"), ...legacyEmailConstraints);
      })()
    : null;

  let primaryRows: NetworkReport[] = [];
  let primaryEmailRows: NetworkReport[] = [];
  let primaryLegacyEmailRows: NetworkReport[] = [];
  let legacyRows: NetworkReport[] = [];
  let legacyEmailRows: NetworkReport[] = [];
  let legacyLegacyEmailRows: NetworkReport[] = [];

  const emit = () => {
    const merged = [
      ...primaryRows,
      ...primaryEmailRows,
      ...primaryLegacyEmailRows,
      ...legacyRows,
      ...legacyEmailRows,
      ...legacyLegacyEmailRows,
    ];
    const unique = new Map<string, NetworkReport>();
    merged.forEach((row) => unique.set(row.id, row));
    const sorted = Array.from(unique.values()).sort((a, b) => {
      const aTime = Date.parse(a.timestamp || "") || 0;
      const bTime = Date.parse(b.timestamp || "") || 0;
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

  const unsubPrimaryByEmail = qPrimaryByEmail
    ? onSnapshot(
        qPrimaryByEmail,
        (snap) => {
          primaryEmailRows = mapReportSnapshot(snap, "network_reports");
          emit();
        },
        (err) => {
          console.error("[subscribeUserReports:email]", err);
          primaryEmailRows = [];
          emit();
        }
      )
    : null;
  const unsubPrimaryByLegacyEmail = qPrimaryByLegacyEmail
    ? onSnapshot(
        qPrimaryByLegacyEmail,
        (snap) => {
          primaryLegacyEmailRows = mapReportSnapshot(snap, "network_reports");
          emit();
        },
        (err) => {
          console.error("[subscribeUserReports:legacyEmailField]", err);
          primaryLegacyEmailRows = [];
          emit();
        }
      )
    : null;

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

  const unsubLegacyByEmail = qLegacyByEmail
    ? onSnapshot(
        qLegacyByEmail,
        (snap) => {
          legacyEmailRows = mapReportSnapshot(snap, "reports");
          emit();
        },
        (err) => {
          console.error("[subscribeUserReports:legacyEmail]", err);
          legacyEmailRows = [];
          emit();
        }
      )
    : null;
  const unsubLegacyByLegacyEmail = qLegacyByLegacyEmail
    ? onSnapshot(
        qLegacyByLegacyEmail,
        (snap) => {
          legacyLegacyEmailRows = mapReportSnapshot(snap, "reports");
          emit();
        },
        (err) => {
          console.error("[subscribeUserReports:legacyEmailField:legacy]", err);
          legacyLegacyEmailRows = [];
          emit();
        }
      )
    : null;

  return () => {
    unsubPrimary();
    if (unsubPrimaryByEmail) unsubPrimaryByEmail();
    if (unsubPrimaryByLegacyEmail) unsubPrimaryByLegacyEmail();
    unsubLegacy();
    if (unsubLegacyByEmail) unsubLegacyByEmail();
    if (unsubLegacyByLegacyEmail) unsubLegacyByLegacyEmail();
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
