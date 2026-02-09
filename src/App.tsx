import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Toaster } from "./components/ui/sonner";
import { PWAConfig } from "./components/PWAConfig";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import ReportIssuePage from "./components/ReportIssuePage"; // ✅ old beautiful frontend
import { UserDashboard } from "./components/UserDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { AboutPage } from "./components/AboutPage";
import { ProfilePage } from "./components/ProfilePage";
import { listenAuth, logOut } from "@/lib/authService";
import { getUserProfile, upsertUserProfile } from "@/lib/userService";
import { subscribeReports, subscribeUserReports, type NetworkReport } from "@/lib/reportsService";
import { auth } from "@/lib/firebase";
import { ensureUserDoc, subscribeUserProfile } from "@/lib/profileService";

type Page =
  | "home"
  | "login"
  | "adminLogin"
  | "report"
  | "dashboard"
  | "profile"
  | "admin"
  | "about";

interface User {
  uid: string;
  name: string;
  email: string;
  location: string;
  photoURL?: string | null;
  reportsCount?: number;
  isAdmin?: boolean;
}

interface Report {
  id: string;
  provider: string;
  signalStrength: string;
  networkType: string;
  issueType: string;
  location: string;
  weather: string;
  comments: string;
  timestamp: string;
  userName: string;
}

interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  timestamp: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [user, setUser] = useState<User | null>(null);
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [speedTestResult, setSpeedTestResult] =
    useState<SpeedTestResult | null>(null);

    // ---------- Firebase Auth (UI stays exactly same) ----------
  useEffect(() => {
    let cancelled = false;

    const unsub = listenAuth(async (fbUser) => {
      if (cancelled) return;

      if (!fbUser) {
        setAuthUid(null);
        setUser(null);
        return;
      }

      setAuthUid(fbUser.uid);
      ensureUserDoc(fbUser.uid).catch(console.error);

      // Profile stored in Firestore under users/{uid}
      const profile = await getUserProfile(fbUser.uid);
      if (cancelled) return;

      const email = fbUser.email ?? "";
      const fallbackName = email ? email.split("@")[0] : "User";

      if (!profile) {
        const newProfile = {
          uid: fbUser.uid,
          name: fallbackName,
          displayName: fbUser.displayName ?? fallbackName,
          email,
          location: "",
          photoURL: fbUser.photoURL ?? null,
          reportsCount: 0,
          isAdmin: false,
        };
        await upsertUserProfile(newProfile);
        if (cancelled) return;
        setUser({
          uid: fbUser.uid,
          name: newProfile.name,
          email: newProfile.email,
          location: newProfile.location,
          photoURL: newProfile.photoURL ?? null,
          reportsCount: newProfile.reportsCount ?? 0,
          isAdmin: newProfile.isAdmin,
        });
      } else {
        setUser({
          uid: fbUser.uid,
          name: profile.name,
          email: profile.email || email,
          location: profile.location,
          photoURL: profile.photoURL ?? null,
          reportsCount: profile.reportsCount ?? 0,
          isAdmin: !!profile.isAdmin,
        });
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!authUid) return;
    const unsub = subscribeUserProfile(authUid, (profile) => {
      if (!profile) return;
      setUser((prev) => ({
        uid: authUid,
        name: profile.displayName ?? prev?.name ?? "User",
        email: profile.email ?? prev?.email ?? "",
        location: prev?.location ?? "",
        photoURL: profile.photoURL ?? prev?.photoURL ?? null,
        reportsCount: profile.reportsCount ?? prev?.reportsCount ?? 0,
        isAdmin: prev?.isAdmin ?? false,
      }));
    });
    return () => unsub();
  }, [authUid]);

    // Load reports + subscribe for real-time updates (Firestore)
  useEffect(() => {
    let unsub: null | (() => void) = null;
    let cancelled = false;
    const uid = authUid;

    if (!uid) {
      setAllReports([]);
      return;
    }

    try {
      const handler = (rows: NetworkReport[]) => {
        if (cancelled) return;
        // Map Firestore model to existing UI model (keep UI same)
        const mapped: Report[] = rows.map((r) => ({
          id: r.id,
          provider: r.provider,
          signalStrength: r.signalStrength,
          networkType: r.networkType,
          issueType: r.issueType,
          location: r.location,
          weather: r.weather,
          comments: r.comments,
          timestamp: r.timestamp,
          userName: r.userName,
        }));
        setAllReports(mapped);
      };

      unsub = user?.isAdmin
        ? subscribeReports(handler)
        : subscribeUserReports(uid, auth?.currentUser?.email, handler);
    } catch (err) {
      console.error("Failed to subscribe reports:", err);
    }

    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [user?.isAdmin, authUid]);

  const handleNavigate = (page: Page) => {
    if (page === "admin" && (!user || !user.isAdmin)) {
      setCurrentPage("adminLogin");
      return;
    }
    if ((page === "dashboard" || page === "report" || page === "profile") && !user) {
      setCurrentPage("login");
      return;
    }
    setCurrentPage(page);
  };

  const handleLogin = (userData: User, redirectTo: "dashboard" | "admin") => {
    setUser(userData);
    setCurrentPage(redirectTo);
  };

  const handleLogout = () => {
    logOut().catch(console.error);
    setUser(null);
    setCurrentPage("home");
  };

  const handleSubmitReport = (report: Report) => {
    // Local optimistic update (Realtime will also sync)
    setAllReports((prev) => [report, ...prev]);
  };

  const handleSpeedTestComplete = (result: SpeedTestResult) => {
    setSpeedTestResult(result);
  };

  const userReports = useMemo(() => allReports, [allReports]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4,
  };

  return (
    <>
      <PWAConfig />
      <AnimatePresence mode="wait">
        {currentPage === "home" && (
          <motion.div
            key="home"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <LandingPage
              onNavigate={handleNavigate}
              isAdmin={user?.isAdmin}
              isAuthenticated={!!user}
            />
          </motion.div>
        )}

        {currentPage === "login" && (
          <motion.div
            key="login"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <LoginPage
              onNavigate={handleNavigate}
              onLogin={handleLogin}
              isAdminLogin={false}
            />
          </motion.div>
        )}

        {currentPage === "adminLogin" && (
          <motion.div
            key="adminLogin"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <LoginPage
              onNavigate={handleNavigate}
              onLogin={handleLogin}
              isAdminLogin={true}
            />
          </motion.div>
        )}

        {currentPage === "report" && (
          <motion.div
            key="report"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <ReportIssuePage
              onNavigate={handleNavigate}
              onSubmitReport={handleSubmitReport}
              user={user}
              speedTestResult={speedTestResult}
            />
          </motion.div>
        )}

        {currentPage === "dashboard" && (
          <motion.div
            key="dashboard"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <UserDashboard
              onNavigate={handleNavigate}
              user={user}
              userReports={userReports}
              onLogout={handleLogout}
              onSpeedTestComplete={handleSpeedTestComplete}
            />
          </motion.div>
        )}

        {currentPage === "profile" && (
          <motion.div
            key="profile"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <ProfilePage onNavigate={handleNavigate} />
          </motion.div>
        )}

        {currentPage === "admin" && (
          <motion.div
            key="admin"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <AdminDashboard
              onNavigate={handleNavigate}
              allReports={allReports}
              onLogout={handleLogout}
            />
          </motion.div>
        )}

        {currentPage === "about" && (
          <motion.div
            key="about"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <AboutPage onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster />
    </>
  );
}
