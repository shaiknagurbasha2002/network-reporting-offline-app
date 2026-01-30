import { useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "motion/react";
import { Toaster } from "./components/ui/sonner";
import { PWAConfig } from "./components/PWAConfig";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { Progress } from "./components/ui/progress";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { 
  Home, 
  Signal, 
  User, 
  TrendingUp, 
  Award,
  Trophy,
  Sparkles,
  Download,
  Upload,
  Gauge,
  Wifi,
  RotateCw,
  CheckCircle,
  ArrowLeft,
  Menu,
  X,
  BarChart3,
  LogOut
} from "lucide-react";
import { toast } from "sonner@2.0.3";

type Page = 'home' | 'report' | 'dashboard' | 'leaderboard';

interface User {
  name: string;
  email: string;
  location: string;
}

interface Report {
  id: number;
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

const leaderboard = [
  { rank: 1, name: 'Sarah Johnson', points: 850, reports: 85 },
  { rank: 2, name: 'Mike Chen', points: 720, reports: 72 },
  { rank: 3, name: 'Emma Davis', points: 680, reports: 68 },
  { rank: 4, name: 'Alex Kumar', points: 560, reports: 56 },
  { rank: 5, name: 'John Doe', points: 450, reports: 45 },
  { rank: 6, name: 'Lisa Wang', points: 420, reports: 42 },
  { rank: 7, name: 'Chris Brown', points: 390, reports: 39 },
  { rank: 8, name: 'Anna Smith', points: 360, reports: 36 },
];

const badges = [
  { id: 'first-report', name: 'First Report', icon: '🌱', earned: true },
  { id: 'consistent', name: 'Consistent', icon: '⚡', earned: true },
  { id: 'weather-watcher', name: 'Weather Expert', icon: '☀️', earned: true },
  { id: 'network-guru', name: 'Network Guru', icon: '📡', earned: false },
  { id: 'community-star', name: 'Community Star', icon: '⭐', earned: false },
];

export default function MobileApp() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>({ name: 'John Doe', email: 'john@example.com', location: 'Newark, NJ' });
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [speedTestResult, setSpeedTestResult] = useState<SpeedTestResult | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Report form state
  const [provider, setProvider] = useState("");
  const [signalStrength, setSignalStrength] = useState("");
  const [networkType, setNetworkType] = useState("");
  const [issueType, setIssueType] = useState("");
  const [location, setLocation] = useState(user?.location || "");
  const [weather, setWeather] = useState("");
  const [comments, setComments] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const userReports = allReports.filter(report => report.userName === user?.name);
  const userPoints = userReports.length * 10;
  const earnedBadges = badges.filter(b => b.earned);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    
    const report: Report = {
      id: Date.now(),
      provider,
      signalStrength,
      networkType,
      issueType,
      location,
      weather,
      comments,
      timestamp: new Date().toISOString(),
      userName: user?.name || "Anonymous",
    };

    setAllReports(prev => [report, ...prev]);
    setReportSubmitted(true);
    toast.success("Report submitted! +10 points");

    setTimeout(() => {
      setReportSubmitted(false);
      setCurrentPage('dashboard');
      // Reset form
      setProvider("");
      setSignalStrength("");
      setNetworkType("");
      setIssueType("");
      setWeather("");
      setComments("");
    }, 2000);
  };

  const runSpeedTest = async () => {
    setIsRunningTest(true);
    setTestProgress(0);

    const interval = setInterval(() => {
      setTestProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 3;
      });
    }, 50);

    setTimeout(() => {
      const result: SpeedTestResult = {
        downloadSpeed: Math.floor(Math.random() * 80) + 20,
        uploadSpeed: Math.floor(Math.random() * 40) + 10,
        ping: Math.floor(Math.random() * 30) + 10,
        timestamp: new Date().toISOString(),
      };
      setSpeedTestResult(result);
      setIsRunningTest(false);
      clearInterval(interval);
    }, 3500);
  };

  const getSpeedColor = (speed: number, isDownload: boolean) => {
    const threshold = isDownload ? 50 : 25;
    if (speed >= threshold) return "text-green-600";
    if (speed >= threshold / 2) return "text-yellow-600";
    return "text-red-600";
  };

  // Swipe handling
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    const pages: Page[] = ['home', 'report', 'dashboard', 'leaderboard'];
    const currentIndex = pages.indexOf(currentPage);

    if (info.offset.x > threshold && currentIndex > 0) {
      setCurrentPage(pages[currentIndex - 1]);
    } else if (info.offset.x < -threshold && currentIndex < pages.length - 1) {
      setCurrentPage(pages[currentIndex + 1]);
    }
  };

  const pageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      <PWAConfig />
      
      {/* Top Header */}
      <motion.header 
        className="bg-white/90 backdrop-blur-md border-b-2 border-blue-100 shadow-lg px-4 py-3 flex items-center justify-between relative z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Signal className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NetPulse
            </span>
            <p className="text-xs text-gray-600">Mobile</p>
          </div>
        </div>
        
        <Button
          onClick={() => setMenuOpen(!menuOpen)}
          variant="ghost"
          size="sm"
          className="rounded-full w-10 h-10 p-0"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </motion.header>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 p-6"
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Menu</h2>
                <Button onClick={() => setMenuOpen(false)} variant="ghost" size="sm">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-3 mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                <Avatar className="w-14 h-14 border-2 border-blue-200">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-lg">
                    {user?.name.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-gray-800">{user?.name}</p>
                  <p className="text-sm text-gray-600">{userPoints} points</p>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => { setCurrentPage('home'); setMenuOpen(false); }}
                >
                  <Home className="w-5 h-5" />
                  Home
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => { setCurrentPage('dashboard'); setMenuOpen(false); }}
                >
                  <User className="w-5 h-5" />
                  My Profile
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => { setCurrentPage('leaderboard'); setMenuOpen(false); }}
                >
                  <Trophy className="w-5 h-5" />
                  Leaderboard
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full gap-2 border-2"
                  onClick={() => toast.info("Logout functionality")}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area - Swipeable */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            className="h-full overflow-y-auto pb-20"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", damping: 25 }}
          >
            {/* HOME PAGE */}
            {currentPage === 'home' && (
              <div className="p-4 space-y-4">
                {/* Welcome Card */}
                <Card className="p-6 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-blue-100 text-sm">Welcome back,</p>
                      <h2 className="text-2xl font-bold">{user?.name}</h2>
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-10 h-10" />
                    </motion.div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold">{userReports.length}</div>
                      <div className="text-xs text-blue-100">Reports</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold">{userPoints}</div>
                      <div className="text-xs text-blue-100">Points</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold">{earnedBadges.length}</div>
                      <div className="text-xs text-blue-100">Badges</div>
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Card 
                      className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 cursor-pointer"
                      onClick={() => setCurrentPage('report')}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                        <Signal className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold mb-1">Report Issue</h3>
                      <p className="text-xs text-gray-600">Submit network problem</p>
                    </Card>
                  </motion.div>

                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Card 
                      className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 cursor-pointer"
                      onClick={runSpeedTest}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                        <Gauge className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold mb-1">Speed Test</h3>
                      <p className="text-xs text-gray-600">Test your network</p>
                    </Card>
                  </motion.div>
                </div>

                {/* Speed Test Results */}
                {(isRunningTest || speedTestResult) && (
                  <Card className="p-5 bg-white/90 backdrop-blur-sm border-2 shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Gauge className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold">Speed Test</h3>
                    </div>

                    {isRunningTest ? (
                      <div className="space-y-3">
                        <motion.div
                          className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Wifi className="w-8 h-8 text-blue-600" />
                        </motion.div>
                        <Progress value={testProgress} className="h-2" />
                        <p className="text-center text-sm text-gray-600">Testing... {Math.round(testProgress)}%</p>
                      </div>
                    ) : speedTestResult && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center border-2 border-blue-200">
                            <Download className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                            <div className={`text-xl font-bold ${getSpeedColor(speedTestResult.downloadSpeed, true)}`}>
                              {speedTestResult.downloadSpeed}
                            </div>
                            <div className="text-xs text-gray-600">Mbps</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 text-center border-2 border-purple-200">
                            <Upload className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                            <div className={`text-xl font-bold ${getSpeedColor(speedTestResult.uploadSpeed, false)}`}>
                              {speedTestResult.uploadSpeed}
                            </div>
                            <div className="text-xs text-gray-600">Mbps</div>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center border-2 border-green-200">
                            <Signal className="w-4 h-4 mx-auto mb-1 text-green-600" />
                            <div className="text-xl font-bold text-green-600">{speedTestResult.ping}</div>
                            <div className="text-xs text-gray-600">ms</div>
                          </div>
                        </div>
                        <Button onClick={runSpeedTest} variant="outline" className="w-full gap-2">
                          <RotateCw className="w-4 h-4" />
                          Test Again
                        </Button>
                      </div>
                    )}
                  </Card>
                )}

                {/* Recent Activity */}
                <Card className="p-5 bg-white/90 backdrop-blur-sm border-2 shadow-xl">
                  <h3 className="font-bold mb-4">Recent Reports</h3>
                  {userReports.length === 0 ? (
                    <div className="text-center py-6">
                      <Signal className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-500">No reports yet</p>
                      <Button 
                        onClick={() => setCurrentPage('report')}
                        className="mt-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        size="sm"
                      >
                        Submit First Report
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userReports.slice(0, 3).map((report) => (
                        <div key={report.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Signal className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {report.issueType.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </p>
                            <p className="text-xs text-gray-600 truncate">{report.location}</p>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                            +10
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* REPORT PAGE */}
            {currentPage === 'report' && (
              <div className="p-4">
                {reportSubmitted ? (
                  <div className="flex items-center justify-center min-h-[60vh]">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-center"
                    >
                      <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <CheckCircle className="w-14 h-14 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
                      <p className="text-gray-600 mb-4">Report submitted</p>
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-full border-2 border-blue-200">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        <span className="font-bold text-blue-600">+10 Points!</span>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <Card className="p-5 bg-white/90 backdrop-blur-sm border-2 shadow-xl">
                    <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Report Issue
                    </h2>
                    
                    <form onSubmit={handleSubmitReport} className="space-y-4">
                      <div>
                        <Label className="text-sm font-semibold">Network Provider *</Label>
                        <Select value={provider} onValueChange={setProvider} required>
                          <SelectTrigger className="mt-1 border-2 h-12">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="airtel">Airtel</SelectItem>
                            <SelectItem value="jio">Jio</SelectItem>
                            <SelectItem value="verizon">Verizon</SelectItem>
                            <SelectItem value="tmobile">T-Mobile</SelectItem>
                            <SelectItem value="att">AT&T</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm font-semibold">Signal *</Label>
                          <Select value={signalStrength} onValueChange={setSignalStrength} required>
                            <SelectTrigger className="mt-1 border-2 h-12">
                              <SelectValue placeholder="Signal" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Bar</SelectItem>
                              <SelectItem value="2">2 Bars</SelectItem>
                              <SelectItem value="3">3 Bars</SelectItem>
                              <SelectItem value="4">4 Bars</SelectItem>
                              <SelectItem value="5">5 Bars</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-semibold">Network *</Label>
                          <Select value={networkType} onValueChange={setNetworkType} required>
                            <SelectTrigger className="mt-1 border-2 h-12">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5g">5G</SelectItem>
                              <SelectItem value="4g">4G</SelectItem>
                              <SelectItem value="lte">LTE</SelectItem>
                              <SelectItem value="3g">3G</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">Issue Type *</Label>
                        <Select value={issueType} onValueChange={setIssueType} required>
                          <SelectTrigger className="mt-1 border-2 h-12">
                            <SelectValue placeholder="Select issue" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="call-drop">Call Drop</SelectItem>
                            <SelectItem value="no-signal">No Signal</SelectItem>
                            <SelectItem value="slow-internet">Slow Internet</SelectItem>
                            <SelectItem value="intermittent">Intermittent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">Location *</Label>
                        <Input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Newark, NJ"
                          required
                          className="mt-1 border-2 h-12"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">Weather (Optional)</Label>
                        <Select value={weather} onValueChange={setWeather}>
                          <SelectTrigger className="mt-1 border-2 h-12">
                            <SelectValue placeholder="Select weather" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sunny">☀️ Sunny</SelectItem>
                            <SelectItem value="cloudy">☁️ Cloudy</SelectItem>
                            <SelectItem value="rainy">🌧️ Rainy</SelectItem>
                            <SelectItem value="stormy">⛈️ Stormy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">Comments (Optional)</Label>
                        <Textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="Additional details..."
                          rows={3}
                          className="mt-1 border-2"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white h-12 text-lg shadow-lg"
                      >
                        Submit Report
                      </Button>
                    </form>
                  </Card>
                )}
              </div>
            )}

            {/* DASHBOARD PAGE */}
            {currentPage === 'dashboard' && (
              <div className="p-4 space-y-4">
                {/* Profile Header */}
                <Card className="p-5 bg-white/90 backdrop-blur-sm border-2 shadow-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-16 h-16 border-4 border-blue-200">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xl">
                        {user?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold">{user?.name}</h2>
                      <p className="text-sm text-gray-600">📍 {user?.location}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-5 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm opacity-90">Total Points</span>
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div className="text-4xl font-bold mb-2">{userPoints}</div>
                    <Progress value={((userPoints % 100) / 100) * 100} className="h-2 bg-white/20" />
                    <p className="text-xs mt-2 opacity-90">
                      {100 - (userPoints % 100)} points to next level
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border-2 border-blue-200">
                      <div className="text-3xl font-bold text-blue-600">{userReports.length}</div>
                      <div className="text-xs text-gray-600">Reports</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border-2 border-purple-200">
                      <div className="text-3xl font-bold text-purple-600">{earnedBadges.length}</div>
                      <div className="text-xs text-gray-600">Badges</div>
                    </div>
                  </div>
                </Card>

                {/* Badges */}
                <Card className="p-5 bg-white/90 backdrop-blur-sm border-2 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold">Badges</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {badges.map((badge) => (
                      <div
                        key={badge.id}
                        className={`flex items-center gap-2 p-3 rounded-xl ${
                          badge.earned
                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200'
                            : 'bg-gray-50 opacity-50 border-2 border-gray-200'
                        }`}
                      >
                        <div className="text-2xl">{badge.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{badge.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Recent Reports */}
                <Card className="p-5 bg-white/90 backdrop-blur-sm border-2 shadow-xl">
                  <h3 className="font-bold mb-4">My Reports</h3>
                  {userReports.length === 0 ? (
                    <div className="text-center py-6">
                      <Signal className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-500 mb-3">No reports yet</p>
                      <Button 
                        onClick={() => setCurrentPage('report')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        size="sm"
                      >
                        Submit First Report
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userReports.slice(0, 5).map((report) => (
                        <div key={report.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Signal className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {report.issueType.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </p>
                            <p className="text-xs text-gray-600 truncate">{report.location}</p>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs shrink-0">
                            +10
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* LEADERBOARD PAGE */}
            {currentPage === 'leaderboard' && (
              <div className="p-4 space-y-4">
                <Card className="p-5 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold">Leaderboard</h2>
                      <p className="text-blue-100 text-sm">Top Contributors</p>
                    </div>
                    <Trophy className="w-12 h-12" />
                  </div>
                </Card>

                <Card className="p-5 bg-white/90 backdrop-blur-sm border-2 shadow-xl">
                  <div className="space-y-2">
                    {leaderboard.map((entry) => (
                      <motion.div
                        key={entry.rank}
                        className={`flex items-center gap-3 p-4 rounded-xl ${
                          entry.name === user?.name
                            ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300'
                            : 'bg-gray-50 border-2 border-gray-200'
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                            entry.rank === 1
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                              : entry.rank === 2
                              ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                              : entry.rank === 3
                              ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {entry.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate flex items-center gap-2">
                            {entry.name}
                            {entry.name === user?.name && (
                              <Badge variant="outline" className="text-xs bg-blue-50">You</Badge>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">{entry.reports} reports</p>
                        </div>
                        <div className="font-bold text-blue-600 text-lg shrink-0">{entry.points}</div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <motion.nav 
        className="bg-white/90 backdrop-blur-md border-t-2 border-blue-100 shadow-2xl px-4 py-3 flex items-center justify-around relative z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, delay: 0.2 }}
      >
        {[
          { page: 'home' as Page, icon: Home, label: 'Home' },
          { page: 'report' as Page, icon: Signal, label: 'Report' },
          { page: 'dashboard' as Page, icon: User, label: 'Profile' },
          { page: 'leaderboard' as Page, icon: Trophy, label: 'Leaders' },
        ].map((item) => (
          <motion.button
            key={item.page}
            onClick={() => setCurrentPage(item.page)}
            className="flex flex-col items-center gap-1 relative"
            whileTap={{ scale: 0.9 }}
          >
            <div
              className={`p-2 rounded-xl transition-all ${
                currentPage === item.page
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400'
              }`}
            >
              <item.icon className="w-6 h-6" />
            </div>
            <span
              className={`text-xs font-medium transition-all ${
                currentPage === item.page ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              {item.label}
            </span>
            {currentPage === item.page && (
              <motion.div
                layoutId="activeTab"
                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
              />
            )}
          </motion.button>
        ))}
      </motion.nav>

      <Toaster />
    </div>
  );
}
