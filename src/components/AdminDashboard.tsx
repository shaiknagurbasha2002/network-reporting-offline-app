import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Signal, ArrowLeft, Download, TrendingUp, Users, CloudRain, BarChart3, LogOut, Sparkles, Menu, X } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "motion/react";
import { toast } from "sonner@2.0.3";

interface Report {
  id: number;
  provider: string;
  signalStrength: string;
  networkType: string;
  issueType: string;
  location: string;
  weather: string;
  timestamp: string;
  userName: string;
}

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  allReports: Report[];
  onLogout: () => void;
}

// Mock data for charts
const reportsOverTime = [
  { date: 'Oct 28', reports: 12 },
  { date: 'Oct 29', reports: 19 },
  { date: 'Oct 30', reports: 15 },
  { date: 'Oct 31', reports: 25 },
  { date: 'Nov 1', reports: 22 },
  { date: 'Nov 2', reports: 30 },
];

const providerData = [
  { name: 'Airtel', value: 30, color: '#ef4444' },
  { name: 'Jio', value: 25, color: '#3b82f6' },
  { name: 'Verizon', value: 20, color: '#10b981' },
  { name: 'T-Mobile', value: 15, color: '#f59e0b' },
  { name: 'AT&T', value: 10, color: '#8b5cf6' },
];

const issueTypeData = [
  { type: 'Call Drop', count: 45 },
  { type: 'No Signal', count: 38 },
  { type: 'Slow Internet', count: 52 },
  { type: 'Intermittent', count: 28 },
];

const weatherImpact = [
  { weather: 'Sunny', reports: 25, avgSignal: 4.2 },
  { weather: 'Cloudy', reports: 30, avgSignal: 3.8 },
  { weather: 'Rainy', reports: 45, avgSignal: 2.5 },
  { weather: 'Stormy', reports: 35, avgSignal: 1.8 },
];

export function AdminDashboard({ onNavigate, allReports, onLogout }: AdminDashboardProps) {
  const [filterProvider, setFilterProvider] = useState("all");
  const [filterWeather, setFilterWeather] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalReports = allReports.length || 186;
  const uniqueUsers = 342;
  const avgResponseTime = "2.3 hrs";

  const handleDownloadCSV = () => {
    const csvContent = [
      ['ID', 'Date', 'Provider', 'Signal', 'Network Type', 'Issue Type', 'Location', 'Weather', 'User'],
      ...allReports.map(r => [
        r.id,
        new Date(r.timestamp).toLocaleString(),
        r.provider,
        r.signalStrength,
        r.networkType,
        r.issueType,
        r.location,
        r.weather || 'N/A',
        r.userName
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netpulse-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("CSV downloaded successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <motion.header 
        className="bg-white/80 backdrop-blur-md border-b-2 border-blue-100 shadow-lg relative z-20 sticky top-0"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
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
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Signal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    NetPulse
                  </span>
                  <p className="text-xs text-gray-600 hidden sm:block">Admin Dashboard</p>
                </div>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleDownloadCSV}
                  variant="outline"
                  className="gap-2 border-2 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </Button>
              </motion.div>
              <Button 
                onClick={onLogout}
                variant="outline"
                className="gap-2 border-2 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
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
                onClick={() => { handleDownloadCSV(); setMobileMenuOpen(false); }}
                variant="outline"
                className="w-full gap-2"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </Button>
              <Button onClick={onLogout} variant="outline" className="w-full gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </motion.div>
          )}
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-6 md:py-8 relative z-10">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-700 text-lg">Monitor network performance and analyze weather correlations</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[
            { label: 'Total Reports', value: totalReports, trend: '↑ 12%', icon: BarChart3, gradient: 'from-blue-500 to-blue-600', bg: 'from-blue-50 to-blue-100', delay: 0.1 },
            { label: 'Active Users', value: uniqueUsers, trend: '↑ 8%', icon: Users, gradient: 'from-purple-500 to-purple-600', bg: 'from-purple-50 to-purple-100', delay: 0.2 },
            { label: 'Weather Reports', value: 124, trend: '67%', icon: CloudRain, gradient: 'from-green-500 to-emerald-600', bg: 'from-green-50 to-green-100', delay: 0.3 },
            { label: 'Avg Response', value: avgResponseTime, trend: '↓ 15%', icon: TrendingUp, gradient: 'from-orange-500 to-orange-600', bg: 'from-orange-50 to-orange-100', delay: 0.4 }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: stat.delay }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className={`p-6 transition-all hover:shadow-2xl bg-gradient-to-br ${stat.bg} border-2`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-700 font-medium">{stat.label}</p>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  {stat.trend} <span className="text-xs">from last week</span>
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm border-2 shadow-xl">
            <h3 className="mb-4 text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Filters
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Network Provider</label>
                <Select value={filterProvider} onValueChange={setFilterProvider}>
                  <SelectTrigger className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    <SelectItem value="airtel">Airtel</SelectItem>
                    <SelectItem value="jio">Jio</SelectItem>
                    <SelectItem value="verizon">Verizon</SelectItem>
                    <SelectItem value="tmobile">T-Mobile</SelectItem>
                    <SelectItem value="att">AT&T</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Weather Type</label>
                <Select value={filterWeather} onValueChange={setFilterWeather}>
                  <SelectTrigger className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Weather</SelectItem>
                    <SelectItem value="sunny">Sunny</SelectItem>
                    <SelectItem value="cloudy">Cloudy</SelectItem>
                    <SelectItem value="rainy">Rainy</SelectItem>
                    <SelectItem value="stormy">Stormy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">City</label>
                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    <SelectItem value="newark">Newark, NJ</SelectItem>
                    <SelectItem value="nyc">New York, NY</SelectItem>
                    <SelectItem value="jersey">Jersey City, NJ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 shadow-xl">
              <h3 className="mb-4 text-xl font-bold">Reports Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #3b82f6' }} />
                  <Legend />
                  <Line type="monotone" dataKey="reports" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 shadow-xl">
              <h3 className="mb-4 text-xl font-bold">Reports by Provider</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={providerData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {providerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #3b82f6' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 shadow-xl">
              <h3 className="mb-4 text-xl font-bold">Issue Types Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={issueTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="type" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #8b5cf6' }} />
                  <Legend />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 shadow-xl">
              <h3 className="mb-4 text-xl font-bold">Weather Impact Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weatherImpact}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="weather" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #3b82f6' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="reports" fill="#3b82f6" name="Reports" radius={[8, 8, 0, 0]} />
                  <Bar yAxisId="right" dataKey="avgSignal" fill="#10b981" name="Avg Signal" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Future AI Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="p-8 mb-8 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border-2 border-purple-300 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-32 -mt-32" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Future AI Analysis Results</h3>
              </div>
              <p className="text-gray-800 mb-6 text-lg">
                Advanced machine learning models will be integrated here to predict network issues based on weather patterns,
                time of day, and historical data. This section will display:
              </p>
              <ul className="grid sm:grid-cols-2 gap-3 text-gray-800">
                {[
                  'Predictive alerts for network outages',
                  'Weather-based network performance forecasting',
                  'Correlation coefficients and statistical insights',
                  'Recommended actions for network providers'
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-center gap-3 bg-white/60 p-3 rounded-xl"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex-shrink-0" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </Card>
        </motion.div>

        {/* Recent Reports Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 shadow-xl">
            <h3 className="mb-4 text-2xl font-bold">Recent Reports</h3>
            {allReports.length === 0 ? (
              <div className="text-center py-12">
                <Signal className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">No reports yet. Data will appear here as users submit reports.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border-2">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                      <TableHead className="font-bold">Date & Time</TableHead>
                      <TableHead className="font-bold">User</TableHead>
                      <TableHead className="font-bold">Provider</TableHead>
                      <TableHead className="font-bold">Issue Type</TableHead>
                      <TableHead className="font-bold">Signal</TableHead>
                      <TableHead className="font-bold">Location</TableHead>
                      <TableHead className="font-bold">Weather</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allReports.slice(0, 10).map((report) => (
                      <TableRow key={report.id} className="hover:bg-blue-50 transition-colors">
                        <TableCell>{new Date(report.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{report.userName}</TableCell>
                        <TableCell className="capitalize">{report.provider}</TableCell>
                        <TableCell className="capitalize">{report.issueType.replace('-', ' ')}</TableCell>
                        <TableCell>{report.signalStrength} bars</TableCell>
                        <TableCell>{report.location}</TableCell>
                        <TableCell className="capitalize">{report.weather || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
