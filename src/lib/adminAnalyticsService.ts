import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";

export type AdminAnalyticsFilters = {
  provider?: string;
  weather?: string;
  city?: string;
  range?: "7d" | "30d" | "90d" | "all";
};

export type AdminReport = {
  id: string;
  provider: string;
  signalStrength: number;
  networkType: string;
  issueType: string;
  location: string;
  weather: string;
  status?: string;
  userId: string;
  userName?: string;
  createdAt?: any;
  resolvedAt?: any;
};

export type AdminAnalytics = {
  reports: AdminReport[];
  totalReports: number;
  uniqueUsers: number;
  weatherReports: number;
  avgResponseMs: number | null;
  reportsByProvider: Record<string, number>;
  reportsByIssueType: Record<string, number>;
  reportsByWeather: Record<string, number>;
  reportsByDay: Record<string, number>;
};

function requireDb() {
  if (!db) {
    throw new Error(
      "Firebase is not configured. Please set VITE_FIREBASE_* in .env and restart."
    );
  }
  return db;
}

function getRangeStart(range: AdminAnalyticsFilters["range"]) {
  if (!range || range === "all") return null;
  const days =
    range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 0;
  if (!days) return null;
  const start = new Date();
  start.setDate(start.getDate() - days);
  return start;
}

function normalizeReport(id: string, data: DocumentData): AdminReport {
  return {
    id,
    provider: data.provider ?? "",
    signalStrength: Number(data.signalStrength ?? 0),
    networkType: data.networkType ?? "",
    issueType: data.issueType ?? "",
    location: data.location ?? "",
    weather: data.weather ?? "",
    status: data.status ?? undefined,
    userId: data.userId ?? "",
    userName: data.userName ?? undefined,
    createdAt: data.createdAt,
    resolvedAt: data.resolvedAt ?? undefined,
  };
}

function getDayKey(createdAt: any) {
  const date = createdAt?.toDate?.() ?? null;
  if (!date) return "unknown";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function subscribeAdminAnalytics(
  filters: AdminAnalyticsFilters,
  cb: (analytics: AdminAnalytics) => void
) {
  const constraints: QueryConstraint[] = [];

  if (filters.provider && filters.provider !== "all") {
    constraints.push(where("provider", "==", filters.provider));
  }
  if (filters.weather && filters.weather !== "all") {
    constraints.push(where("weather", "==", filters.weather));
  }
  if (filters.city && filters.city !== "all") {
    constraints.push(where("location", "==", filters.city));
  }

  const rangeStart = getRangeStart(filters.range);
  if (rangeStart) {
    constraints.push(where("createdAt", ">=", rangeStart));
  }

  constraints.push(orderBy("createdAt", "desc"));

  const q = query(collection(requireDb(), "network_reports"), ...constraints);

  return onSnapshot(
    q,
    (snap) => {
      const reports = snap.docs.map((d) => normalizeReport(d.id, d.data()));
      const uniqueUsers = new Set(reports.map((r) => r.userId).filter(Boolean));
      const reportsByProvider: Record<string, number> = {};
      const reportsByIssueType: Record<string, number> = {};
      const reportsByWeather: Record<string, number> = {};
      const reportsByDay: Record<string, number> = {};
      let weatherReports = 0;
      let totalResponseMs = 0;
      let responseCount = 0;

      reports.forEach((r) => {
        if (r.provider) {
          reportsByProvider[r.provider] =
            (reportsByProvider[r.provider] ?? 0) + 1;
        }
        if (r.issueType) {
          reportsByIssueType[r.issueType] =
            (reportsByIssueType[r.issueType] ?? 0) + 1;
        }
        if (r.weather) {
          weatherReports += 1;
          reportsByWeather[r.weather] = (reportsByWeather[r.weather] ?? 0) + 1;
        }
        const dayKey = getDayKey(r.createdAt);
        reportsByDay[dayKey] = (reportsByDay[dayKey] ?? 0) + 1;

        if (r.createdAt?.toDate && r.resolvedAt?.toDate) {
          const start = r.createdAt.toDate().getTime();
          const end = r.resolvedAt.toDate().getTime();
          if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
            totalResponseMs += end - start;
            responseCount += 1;
          }
        }
      });

      cb({
        reports,
        totalReports: reports.length,
        uniqueUsers: uniqueUsers.size,
        weatherReports,
        avgResponseMs: responseCount ? totalResponseMs / responseCount : null,
        reportsByProvider,
        reportsByIssueType,
        reportsByWeather,
        reportsByDay,
      });
    },
    (err) => {
      console.error("[subscribeAdminAnalytics]", err);
      cb({
        reports: [],
        totalReports: 0,
        uniqueUsers: 0,
        weatherReports: 0,
        avgResponseMs: null,
        reportsByProvider: {},
        reportsByIssueType: {},
        reportsByWeather: {},
        reportsByDay: {},
      });
    }
  );
}
