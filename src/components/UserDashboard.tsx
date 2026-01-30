import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { Signal, Award, Trophy, ArrowLeft, Menu, X, Sparkles } from "lucide-react";
import { SpeedTestMeter } from "./SpeedTestMeter";
import { motion } from "motion/react";
import { useState } from "react";

interface Report {
  id: number;
  provider: string;
  issueType: string;
  location: string;
  timestamp: string;
}

interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  timestamp: string;
}

interface UserDashboardProps {
  onNavigate: (page: string) => void;
  user: { name: string; email: string; location: string } | null;
  userReports: Report[];
  onLogout: () => void;
  onSpeedTestComplete?: (result: SpeedTestResult) => void;
}

const badges = [
  { id: 'first-report', name: 'First Report', icon: '🌱', description: 'Submitted your first report', earned: true },
  { id: 'consistent', name: 'Consistent Reporter', icon: '⚡', description: 'Submitted 5+ reports', earned: true },
  { id: 'weather-watcher', name: 'Weather Watcher', icon: '☀️', description: 'Reported during different weather conditions', earned: true },
  { id: 'network-guru', name: 'Network Guru', icon: '📡', description: 'Submitted 20+ reports', earned: false },
  { id: 'community-star', name: 'Community Star', icon: '⭐', description: 'Top 10 contributor', earned: false },
];

const leaderboard = [
  { rank: 1, name: 'Sarah Johnson', points: 850, reports: 85 },
  { rank: 2, name: 'Mike Chen', points: 720, reports: 72 },
  { rank: 3, name: 'Emma Davis', points: 680, reports: 68 },
  { rank: 4, name: 'Alex Kumar', points: 560, reports: 56 },
  { rank: 5, name: 'John Doe', points: 450, reports: 45 },
];

export function UserDashboard({ onNavigate, user, userReports, onLogout, onSpeedTestComplete }: UserDashboardProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userPoints = userReports.length * 10;
  const earnedBadges = badges.filter(b => b.earned);
  const nextLevel = Math.ceil(userPoints / 100) * 100;
  const progressToNextLevel = ((userPoints % 100) / 100) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 right-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b-2 border-blue-100 shadow-lg relative z-20 sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => onNavigate('home')} 
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Signal className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
                  NetPulse
                </span>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => onNavigate('report')} 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg gap-2"
                >
                  <Signal className="w-4 h-4" />
                  Report Issue
                </Button>
              </motion.div>
              <Button onClick={onLogout} variant="outline" className="border-2">
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              variant="ghost"
              size="sm"
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pb-4 flex flex-col gap-2 md:hidden"
            >
              <Button 
                onClick={() => { onNavigate('report'); setMobileMenuOpen(false); }} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white gap-2"
              >
                <Signal className="w-4 h-4" />
                Report Issue
              </Button>
              <Button onClick={onLogout} variant="outline" className="w-full">
                Logout
              </Button>
            </motion.div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Profile & Badges */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 shadow-xl">
                <div className="flex flex-col items-center text-center">
                  <motion.div whileHover={{ scale: 1.1, rotate: 360 }} transition={{ duration: 0.6 }}>
                    <Avatar className="w-24 h-24 mb-4 border-4 border-blue-200 shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl">
                        {user?.name.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  
                  <h2 className="mb-1 text-2xl font-bold text-gray-800">{user?.name || 'User'}</h2>
                  <p className="text-gray-600 mb-4 flex items-center gap-1">
                    <span className="text-sm">📍</span> {user?.location}
                  </p>
                  
                  <motion.div 
                    className="w-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl p-6 mb-4 shadow-xl relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm opacity-90 font-medium">Total Points</span>
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                      </div>
                      <div className="text-5xl font-bold mb-3">{userPoints}</div>
                      <Progress value={progressToNextLevel} className="h-2 bg-white/20 mb-2" />
                      <p className="text-xs opacity-90">
                        {nextLevel - userPoints} points to level {Math.ceil(userPoints / 100) + 1}
                      </p>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <motion.div 
                      className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-3xl font-bold text-blue-600 mb-1">{userReports.length}</div>
                      <p className="text-xs text-gray-600 font-medium">Reports</p>
                    </motion.div>
                    <motion.div 
                      className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-3xl font-bold text-purple-600 mb-1">{earnedBadges.length}</div>
                      <p className="text-xs text-gray-600 font-medium">Badges</p>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Badges Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-bold">Badges Earned</h3>
                </div>
                <div className="space-y-3">
                  {badges.map((badge, index) => (
                    <motion.div 
                      key={badge.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                        badge.earned 
                          ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 shadow-md' 
                          : 'bg-gray-50 opacity-50 border-2 border-gray-200'
                      }`}
                    >
                      <div className="text-3xl">{badge.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${badge.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                          {badge.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{badge.description}</p>
                      </div>
                      {badge.earned && (
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shrink-0">
                          ✓
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Reports & Actions */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Recent Reports */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 shadow-xl">
                <h2 className="text-2xl font-bold mb-4">Recent Reports</h2>
                {userReports.length === 0 ? (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Signal className="w-20 h-20 mx-auto mb-4 text-blue-300" />
                    </motion.div>
                    <p className="text-gray-500 mb-4 text-lg">No reports yet. Start reporting network issues!</p>
                    <Button 
                      onClick={() => onNavigate('report')} 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg gap-2"
                    >
                      <Signal className="w-4 h-4" />
                      Submit Your First Report
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userReports.slice(0, 5).map((report, index) => (
                      <motion.div 
                        key={report.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="flex items-center gap-3 md:gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <Signal className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-gray-800">
                            {report.issueType.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            📍 {report.location} • {report.provider}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <div className="text-sm text-gray-500 hidden sm:block">
                            {new Date(report.timestamp).toLocaleDateString()}
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                            +10 pts
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Leaderboard and Speed Test */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 shadow-xl h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                    <h2 className="text-xl font-bold">Leaderboard</h2>
                  </div>
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => (
                      <motion.div 
                        key={entry.rank}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          entry.name === user?.name 
                            ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 shadow-md' 
                            : 'bg-gray-50 border-2 border-gray-200'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg ${
                          entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' :
                          entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg' :
                          entry.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {entry.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="flex items-center gap-2 font-medium truncate">
                            {entry.name}
                            {entry.name === user?.name && (
                              <Badge variant="outline" className="text-xs bg-blue-50">You</Badge>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">{entry.reports} reports</p>
                        </div>
                        <div className="font-bold text-blue-600 shrink-0">{entry.points}</div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SpeedTestMeter onTestComplete={onSpeedTestComplete} />
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="p-6 cursor-pointer hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200" 
                  onClick={() => onNavigate('report')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                      <Signal className="w-7 h-7 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg mb-1">Report Issue</h3>
                      <p className="text-sm text-gray-600">Submit a new network report</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="p-6 cursor-pointer hover:shadow-xl transition-all bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200" 
                  onClick={() => onNavigate('admin')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                      <Trophy className="w-7 h-7 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg mb-1">View Analytics</h3>
                      <p className="text-sm text-gray-600">See community reports</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
