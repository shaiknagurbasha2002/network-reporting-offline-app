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
import { listenAuth, logOut } from "@/lib/authService";
import { getUserProfile, upsertUserProfile } from "@/lib/userService";
import { subscribeReports, type NetworkReport } from "@/lib/reportsService";

type Page =
  | "home"
  | "login"
  | "adminLogin"
  | "report"
  | "dashboard"
  | "admin"
  | "about";

interface User {
  name: string;
  email: string;
  location: string;
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
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [speedTestResult, setSpeedTestResult] =
    useState<SpeedTestResult | null>(null);

    // ---------- Firebase Auth (UI stays exactly same) ----------
  useEffect(() => {
    let cancelled = false;

    const unsub = listenAuth(async (fbUser) => {
      if (cancelled) return;

      if (!fbUser) {
        setUser(null);
        return;
      }

      // Profile stored in Firestore under users/{uid}
      const profile = await getUserProfile(fbUser.uid);
      if (cancelled) return;

      const email = fbUser.email ?? "";
      const fallbackName = email ? email.split("@")[0] : "User";

      if (!profile) {
        const newProfile = {
          uid: fbUser.uid,
          name: fallbackName,
          email,
          location: "",
          isAdmin: false,
        };
        await upsertUserProfile(newProfile);
        if (cancelled) return;
        setUser({
          name: newProfile.name,
          email: newProfile.email,
          location: newProfile.location,
          isAdmin: newProfile.isAdmin,
        });
      } else {
        setUser({
          name: profile.name,
          email: profile.email || email,
          location: profile.location,
          isAdmin: !!profile.isAdmin,
        });
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

    // Load reports + subscribe for real-time updates (Firestore)
  useEffect(() => {
    let unsub: null | (() => void) = null;
    let cancelled = false;

    try {
      unsub = subscribeReports((rows: NetworkReport[]) => {
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
      });
    } catch (err) {
      console.error("Failed to subscribe reports:", err);
    }

    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, []);

  const handleNavigate = (page: Page) => {
    if (page === "admin" && (!user || !user.isAdmin)) {
      setCurrentPage("adminLogin");
      return;
    }
    if ((page === "dashboard" || page === "report") && !user) {
      setCurrentPage("login");
      return;
    }
    setCurrentPage(page);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
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

  const userReports = useMemo(
    () => allReports.filter((report) => report.userName === user?.name),
    [allReports, user?.name]
  );

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
            <LandingPage onNavigate={handleNavigate} isAdmin={user?.isAdmin} />
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
