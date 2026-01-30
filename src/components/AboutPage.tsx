import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Signal, ArrowLeft, Mail, Linkedin, Github, Target, Users, BarChart3, Sparkles, Zap, Brain } from "lucide-react";
import { motion } from "motion/react";

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 100, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <motion.header 
        className="container mx-auto px-4 py-6 relative z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Button 
          onClick={() => onNavigate('home')} 
          variant="ghost"
          className="gap-2 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </motion.header>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-5xl relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Signal className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NetPulse
              </span>
              <p className="text-sm text-gray-600">Network Intelligence Platform</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">About NetPulse</h1>
          <p className="text-gray-700 max-w-3xl mx-auto text-lg leading-relaxed">
            A comprehensive platform for studying the correlation between network performance 
            and weather patterns through community-driven data collection.
          </p>
        </motion.div>

        {/* Project Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 mb-8 bg-white/80 backdrop-blur-sm border-2 shadow-2xl">
            <h2 className="mb-4 text-3xl font-bold text-gray-800">Project Overview</h2>
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              This project aims to study correlation between network performance and weather patterns.
              By collecting real-time network issue reports from users across different locations and weather conditions,
              we can analyze how environmental factors impact mobile connectivity.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Target, gradient: 'from-blue-500 to-blue-600', bg: 'from-blue-50 to-blue-100', title: 'Our Mission', desc: 'Improve network reliability through data-driven insights' },
                { icon: Users, gradient: 'from-purple-500 to-purple-600', bg: 'from-purple-50 to-purple-100', title: 'Community Driven', desc: 'Powered by real users reporting real problems' },
                { icon: BarChart3, gradient: 'from-green-500 to-emerald-600', bg: 'from-green-50 to-green-100', title: 'Data Analytics', desc: 'Advanced analysis of weather-network correlations' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  whileHover={{ y: -5, scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-opacity-20`}>
                    <item.icon className={`w-10 h-10 bg-gradient-to-br ${item.gradient} bg-clip-text`} style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text' }} />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                  <p className="text-gray-600">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-8 mb-8 bg-white/80 backdrop-blur-sm border-2 shadow-2xl">
            <h2 className="mb-6 text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              Key Features
            </h2>
            <div className="space-y-6">
              {[
                { num: 1, title: 'Real-time Issue Reporting', desc: 'Users can quickly report network issues with detailed information about signal strength, network type, and specific problems encountered.', icon: Signal },
                { num: 2, title: 'Weather Correlation Analysis', desc: 'Each report can include weather conditions, enabling comprehensive analysis of how different weather patterns affect network performance.', icon: BarChart3 },
                { num: 3, title: 'Gamification System', desc: 'Users earn points and badges for contributing reports, with a leaderboard system that encourages consistent participation and data quality.', icon: Zap },
                { num: 4, title: 'Comprehensive Analytics Dashboard', desc: 'Admin dashboard provides visualizations of network issues over time, by provider, weather conditions, and geographic location.', icon: BarChart3 },
                { num: 5, title: 'Network Speed Testing', desc: 'Built-in speed test meter allows users to measure download/upload speeds and ping, automatically populating issue reports with performance data.', icon: Zap },
                { num: 6, title: 'Future AI Integration', desc: 'Planned machine learning models will predict network outages based on weather forecasts and historical patterns, enabling proactive infrastructure management.', icon: Brain }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex gap-5 p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-bold text-lg">{feature.num}</span>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold flex items-center gap-2">
                      <feature.icon className="w-5 h-5 text-blue-600" />
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-8 mb-8 bg-white/80 backdrop-blur-sm border-2 shadow-2xl">
            <h2 className="mb-6 text-3xl font-bold text-gray-800">Technology Stack</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="mb-4 text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
                  Frontend
                </h3>
                <ul className="space-y-3 text-gray-700">
                  {[
                    'React with TypeScript',
                    'Tailwind CSS v4 for styling',
                    'Shadcn UI components',
                    'Motion (Framer Motion) for animations',
                    'Recharts for data visualization',
                    'Progressive Web App (PWA) support'
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-4 text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg" />
                  Planned Features
                </h3>
                <ul className="space-y-3 text-gray-700">
                  {[
                    'Backend API integration (Supabase)',
                    'Real-time Weather API integration',
                    'Machine learning prediction models',
                    'Real-time push notifications',
                    'Geolocation & mapping features',
                    'Mobile native applications'
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Developer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-10 mb-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
            
            <div className="relative z-10 text-center">
              <h2 className="mb-3 text-4xl font-bold">Developed By</h2>
              <p className="mb-2 text-2xl font-semibold">Shaik Nagur Basha</p>
              <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
                This project demonstrates the integration of data collection, analytics, gamification, and modern web technologies
                to solve real-world problems in network infrastructure and weather impact analysis.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="secondary" className="gap-2 text-lg px-6 py-6 rounded-xl shadow-lg">
                    <Mail className="w-5 h-5" />
                    Email
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="secondary" className="gap-2 text-lg px-6 py-6 rounded-xl shadow-lg">
                    <Linkedin className="w-5 h-5" />
                    LinkedIn
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="secondary" className="gap-2 text-lg px-6 py-6 rounded-xl shadow-lg">
                    <Github className="w-5 h-5" />
                    GitHub
                  </Button>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="p-10 bg-white/80 backdrop-blur-sm border-2 shadow-2xl">
            <h2 className="mb-4 text-3xl font-bold text-gray-800">Ready to Contribute?</h2>
            <p className="text-gray-700 mb-8 text-lg max-w-2xl mx-auto">
              Join our community of contributors and help us improve network connectivity for everyone.
              Every report makes a difference!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => onNavigate('login')} 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl text-lg px-8 py-6 rounded-xl gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Get Started
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => onNavigate('admin')} 
                  variant="outline"
                  className="border-2 hover:bg-blue-50 text-lg px-8 py-6 rounded-xl gap-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  View Analytics
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </main>

      <footer className="border-t-2 mt-16 py-8 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="mb-2">© 2025 NetPulse. All rights reserved.</p>
          <p className="text-sm">Making connectivity better, one report at a time. 📡</p>
        </div>
      </footer>
    </div>
  );
}
