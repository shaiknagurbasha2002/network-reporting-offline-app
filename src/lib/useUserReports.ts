// src/hooks/useUserReports.ts
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { listenUserReports, Report } from "../services/reports";

export function useUserReports(authUser: User | null) {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    if (!authUser?.uid) {
      setReports([]);
      return;
    }
    const unsub = listenUserReports(authUser.uid, setReports);
    return () => unsub();
  }, [authUser?.uid]);

  return reports;
}
