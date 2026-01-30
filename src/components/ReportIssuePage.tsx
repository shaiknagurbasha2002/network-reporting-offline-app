import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Signal,
  ArrowLeft,
  CheckCircle,
  Download,
  Upload,
  Gauge,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";
import { auth } from "@/lib/firebase";
import { createReport, createSpeedTest } from "@/lib/reportsService";

interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  timestamp: string;
}

interface ReportIssuePageProps {
  onNavigate: (page: string) => void;
  onSubmitReport: (report: any) => void;
  user: { name: string; email: string; location: string } | null;
  speedTestResult?: SpeedTestResult | null;
}

export default function ReportIssuePage({
  onNavigate,
  onSubmitReport,
  user,
  speedTestResult,
}: ReportIssuePageProps) {
  const [provider, setProvider] = useState("");
  const [signalStrength, setSignalStrength] = useState("");
  const [networkType, setNetworkType] = useState("");
  const [issueType, setIssueType] = useState("");
  const [location, setLocation] = useState(user?.location || "");
  const [weather, setWeather] = useState("");
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-populate issue type from speed test
  useEffect(() => {
    if (speedTestResult && !issueType) {
      if (
        speedTestResult.downloadSpeed < 10 ||
        speedTestResult.uploadSpeed < 5
      ) {
        setIssueType("slow-internet");
      }
    }
  }, [speedTestResult, issueType]);

    // ✅ Firebase: save report + speed test (UI stays exactly same)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) throw new Error("Please log in first.");

      const reportToSave = {
        userId: currentUser.uid,
        userName: user?.name || "Anonymous",
        userEmail: currentUser.email || user?.email || "",
        provider,
        signalStrength,
        networkType,
        issueType,
        location,
        weather,
        comments,
        timestamp: new Date().toISOString(),
      };

      const reportId = await createReport(reportToSave);

      if (speedTestResult) {
        await createSpeedTest({
          reportId,
          userId: currentUser.uid,
          downloadSpeed: speedTestResult.downloadSpeed,
          uploadSpeed: speedTestResult.uploadSpeed,
          ping: speedTestResult.ping,
          timestamp: speedTestResult.timestamp,
        });
      }

      const reportForUI = { id: reportId, ...reportToSave };
      onSubmitReport(reportForUI);
      setSubmitted(true);
      toast.success("✅ Report submitted successfully! +10 points earned");

      setTimeout(() => {
        setSubmitted(false);
        onNavigate("dashboard");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      toast.error("❌ " + (err?.message || "Failed to submit report"));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Confirmation screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 relative overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative z-10"
        >
          <Card className="p-8 md:p-12 max-w-md text-center bg-white/90 backdrop-blur-sm border-2 shadow-2xl">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-green-600 mb-3 text-3xl font-bold">
              Thank You!
            </h2>
            <p className="text-gray-700 mb-6 text-lg">
              Your report has been submitted successfully.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-200">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <p className="text-2xl font-bold text-blue-600">+10 Points!</p>
              </div>
              <p className="text-sm text-gray-600">
                Added to your total score
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ✅ Main Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <motion.header
        className="container mx-auto px-4 py-6 flex items-center justify-between relative z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          onClick={() => onNavigate("home")}
          variant="ghost"
          className="gap-2 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Signal className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NetPulse
          </span>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-3xl relative z-10">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Report Network Issue
          </h1>
          <p className="text-gray-700 text-lg">
            Help us improve connectivity by reporting your network problems
          </p>
        </motion.div>

        <Card className="p-6 md:p-8 bg-white/90 backdrop-blur-sm border-2 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ✅ Speed Test Display */}
            {speedTestResult && (
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-5 rounded-2xl border-2 border-blue-200 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Gauge className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-gray-900 text-lg font-bold">
                    Speed Test Results
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl p-4 text-center border-2 border-blue-100">
                    <Download className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">
                      {speedTestResult.downloadSpeed}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Mbps Down</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center border-2 border-purple-100">
                    <Upload className="w-5 h-5 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-600">
                      {speedTestResult.uploadSpeed}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Mbps Up</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center border-2 border-green-100">
                    <Signal className="w-5 h-5 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">
                      {speedTestResult.ping}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">ms Ping</p>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ Form Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Network Provider *</Label>
                <Select value={provider} onValueChange={setProvider} required>
                  <SelectTrigger className="mt-2 border-2 focus:border-blue-400 h-12">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="airtel">Airtel</SelectItem>
                    <SelectItem value="jio">Jio</SelectItem>
                    <SelectItem value="verizon">Verizon</SelectItem>
                    <SelectItem value="tmobile">T-Mobile</SelectItem>
                    <SelectItem value="att">AT&T</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Signal Strength *</Label>
                <Select
                  value={signalStrength}
                  onValueChange={setSignalStrength}
                  required
                >
                  <SelectTrigger className="mt-2 border-2 focus:border-blue-400 h-12">
                    <SelectValue placeholder="Select strength" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">📶 1 Bar (Very Weak)</SelectItem>
                    <SelectItem value="2">📶 2 Bars (Weak)</SelectItem>
                    <SelectItem value="3">📶 3 Bars (Moderate)</SelectItem>
                    <SelectItem value="4">📶 4 Bars (Good)</SelectItem>
                    <SelectItem value="5">📶 5 Bars (Excellent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Network Type *</Label>
                <Select
                  value={networkType}
                  onValueChange={setNetworkType}
                  required
                >
                  <SelectTrigger className="mt-2 border-2 focus:border-blue-400 h-12">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5g">🚀 5G</SelectItem>
                    <SelectItem value="4g">📱 4G</SelectItem>
                    <SelectItem value="lte">📶 LTE</SelectItem>
                    <SelectItem value="3g">📡 3G</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Issue Type *</Label>
                <Select value={issueType} onValueChange={setIssueType} required>
                  <SelectTrigger className="mt-2 border-2 focus:border-blue-400 h-12">
                    <SelectValue placeholder="Select issue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call-drop">📞 Call Drop</SelectItem>
                    <SelectItem value="no-signal">🚫 No Signal</SelectItem>
                    <SelectItem value="slow-internet">
                      🐌 Slow Internet
                    </SelectItem>
                    <SelectItem value="intermittent">
                      ⚡ Intermittent Connection
                    </SelectItem>
                    <SelectItem value="other">❓ Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Location *</Label>
              <Input
                type="text"
                placeholder="Newark, NJ"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="mt-2 border-2 focus:border-blue-400 h-12"
              />
            </div>

            <div>
              <Label>Weather Conditions (Optional)</Label>
              <Select value={weather} onValueChange={setWeather}>
                <SelectTrigger className="mt-2 border-2 focus:border-blue-400 h-12">
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunny">☀️ Sunny</SelectItem>
                  <SelectItem value="cloudy">☁️ Cloudy</SelectItem>
                  <SelectItem value="rainy">🌧️ Rainy</SelectItem>
                  <SelectItem value="stormy">⛈️ Stormy</SelectItem>
                  <SelectItem value="snowy">❄️ Snowy</SelectItem>
                  <SelectItem value="foggy">🌫️ Foggy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Additional Comments (Optional)</Label>
              <Textarea
                placeholder="Describe the issue in more detail..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="mt-2 border-2 focus:border-blue-400 resize-none"
              />
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl text-lg py-6 rounded-xl"
              >
                {loading
                  ? "Submitting Report..."
                  : "Submit Report & Earn 10 Points"}
              </Button>
            </motion.div>
          </form>
        </Card>
      </main>
    </div>
  );
}
