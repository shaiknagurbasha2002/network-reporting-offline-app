import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
  FirestoreError,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { NetworkReport } from "./reportsService";

export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  userEmail?: string;
  photoURL?: string;
  reportCountAllTime: number;
  reportCountThisWeek: number;
  lastReportAt?: any;
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
    collection(requireDb(), "leaderboard_stats"),
    orderBy("reportCountAllTime", "desc"),
    limit(maxRows)
  );

  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          userId: data.userId ?? d.id,
          displayName: data.displayName ?? "User",
          userEmail: data.userEmail ?? "",
          photoURL: data.photoURL ?? "",
          reportCountAllTime: Number(data.reportCountAllTime ?? 0),
          reportCountThisWeek: Number(data.reportCountThisWeek ?? 0),
          lastReportAt: data.lastReportAt,
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

export function subscribeWeeklyLeaderboard(
  cb: (rows: LeaderboardEntry[]) => void,
  maxRows = 50
) {
  const q = query(
    collection(requireDb(), "leaderboard_stats"),
    orderBy("reportCountThisWeek", "desc"),
    limit(maxRows)
  );

  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          userId: data.userId ?? d.id,
          displayName: data.displayName ?? "User",
          userEmail: data.userEmail ?? "",
          photoURL: data.photoURL ?? "",
          reportCountAllTime: Number(data.reportCountAllTime ?? 0),
          reportCountThisWeek: Number(data.reportCountThisWeek ?? 0),
          lastReportAt: data.lastReportAt,
          updatedAt: data.updatedAt,
        };
      });
      cb(rows);
    },
    (err: FirestoreError) => {
      console.error("[subscribeWeeklyLeaderboard] Firestore error:", err);
      cb([]);
    }
  );
}

let backfillAttempted = false;

export async function backfillLeaderboardFromReports() {
  if (backfillAttempted) return;
  backfillAttempted = true;

  const snap = await getDocs(collection(requireDb(), "network_reports"));
  const counts = new Map<
    string,
    {
      displayName: string;
      userEmail?: string;
      photoURL?: string;
      reportCountAllTime: number;
      reportCountThisWeek: number;
      lastReportAt?: any;
    }
  >();

  snap.docs.forEach((d) => {
    const data: any = d.data();
    const userId = data.userId;
    if (!userId) return;

    const existing = counts.get(userId);
    const displayName = data.userName ?? "User";
    const userEmail = data.userEmail ?? "";
    const photoURL = data.userPhotoURL ?? "";
    const lastReportAt = data.createdAt ?? data.updatedAt ?? null;
    const createdTime = data.createdAt?.toMillis?.() ?? Date.parse(data.timestamp ?? "");
    const isThisWeek = Number.isFinite(createdTime)
      ? createdTime >= Date.now() - 7 * 24 * 60 * 60 * 1000
      : false;

    if (!existing) {
      counts.set(userId, {
        displayName,
        userEmail,
        photoURL,
        reportCountAllTime: 1,
        reportCountThisWeek: isThisWeek ? 1 : 0,
        lastReportAt,
      });
    } else {
      existing.reportCountAllTime += 1;
      if (isThisWeek) existing.reportCountThisWeek += 1;
      if (photoURL && !existing.photoURL) existing.photoURL = photoURL;
      if (lastReportAt && !existing.lastReportAt) {
        existing.lastReportAt = lastReportAt;
      }
    }
  });

  await Promise.all(
    Array.from(counts.entries()).map(([userId, data]) =>
      setDoc(
        doc(requireDb(), "leaderboard_stats", userId),
        {
          userId,
          displayName: data.displayName,
          userEmail: data.userEmail ?? "",
          photoURL: data.photoURL ?? "",
          reportCountAllTime: data.reportCountAllTime,
          reportCountThisWeek: data.reportCountThisWeek,
          lastReportAt: data.lastReportAt ?? null,
          updatedAt: data.lastReportAt ?? null,
        },
        { merge: true }
      )
    )
  );
}

export async function upsertLeaderboardStatsForUser(params: {
  userId: string;
  displayName: string;
  userEmail?: string;
  photoURL?: string;
  reports: NetworkReport[];
}) {
  let lastTime = 0;
  let lastReportAt: any = null;
  let weeklyCount = 0;
  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;

  params.reports.forEach((report) => {
    const createdDate =
      report.createdAt?.toDate?.() ??
      (typeof report.timestamp === "string" ? new Date(report.timestamp) : null);

    if (createdDate instanceof Date && !Number.isNaN(createdDate.getTime())) {
      const time = createdDate.getTime();
      if (time >= weekStart) weeklyCount += 1;
      if (time > lastTime) {
        lastTime = time;
        lastReportAt = report.createdAt ?? report.updatedAt ?? report.timestamp ?? null;
      }
    }
  });

  await setDoc(
    doc(requireDb(), "leaderboard_stats", params.userId),
    {
      userId: params.userId,
      displayName: params.displayName ?? "User",
      userEmail: params.userEmail ?? "",
      photoURL: params.photoURL ?? "",
      reportCountAllTime: params.reports.length,
      reportCountThisWeek: weeklyCount,
      lastReportAt,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
