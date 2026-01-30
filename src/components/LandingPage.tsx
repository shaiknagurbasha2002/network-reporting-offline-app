import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Signal, TrendingUp, Award, Cloud, Shield, Sparkles, Zap, Users } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
  isAdmin?: boolean;
}

export function LandingPage({ onNavigate, isAdmin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="container mx-auto px-4 py-6 flex items-center justify-between relative z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="relative"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Signal className="w-6 h-6 text-white" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NetPulse
            </span>
            <p className="text-xs text-gray-600">Network Intelligence</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => onNavigate('admin')} 
                variant="outline"
                className="gap-2 border-2 hover:bg-white/80 backdrop-blur-sm"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden md:inline">Admin Panel</span>
              </Button>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => onNavigate('login')} 
              variant="outline"
              className="border-2 hover:bg-white/80 backdrop-blur-sm"
            >
              Login
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border-2 border-blue-200 shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
          >
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Powered by Community Intelligence</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Report Network Issues,
            </span>
            <br />
            <span className="text-gray-800">
              Improve Connectivity
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your reports help us analyze weather impact on mobile networks.
            Join <span className="font-bold text-purple-600">342+ contributors</span> and make connectivity better for everyone.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => onNavigate('report')} 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-6 rounded-xl gap-2"
              >
                <Signal className="w-5 h-5" />
                Report Issue Now
              </Button>
            </motion.div>
            {isAdmin && (
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => onNavigate('admin')} 
                  variant="outline" 
                  size="lg"
                  className="gap-2 border-2 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg text-lg px-8 py-6 rounded-xl"
                >
                  <Shield className="w-5 h-5" />
                  Admin Dashboard
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {[
            { 
              icon: Signal, 
              gradient: 'from-blue-500 to-blue-600',
              bgGradient: 'from-blue-50 to-blue-100',
              title: 'Track Network Issues', 
              desc: 'Report signal strength, call drops, and connectivity problems in real-time with our intuitive interface.', 
              delay: 0.3 
            },
            { 
              icon: Cloud, 
              gradient: 'from-green-500 to-emerald-600',
              bgGradient: 'from-green-50 to-green-100',
              title: 'Weather Correlation', 
              desc: 'Help us understand how weather conditions affect network performance with AI-powered analysis.', 
              delay: 0.4 
            },
            { 
              icon: Award, 
              gradient: 'from-purple-500 to-pink-600',
              bgGradient: 'from-purple-50 to-pink-100',
              title: 'Earn Rewards', 
              desc: 'Get points and badges for contributing reports. Climb the leaderboard and become a network hero!', 
              delay: 0.5 
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: feature.delay }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="p-6 text-center h-full transition-all duration-300 hover:shadow-2xl border-2 bg-white/80 backdrop-blur-sm">
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-br ${feature.bgGradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className={`w-8 h-8 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text' }} />
                </motion.div>
                <h3 className="mb-3 text-xl font-bold text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div 
          className="mt-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
          
          <div className="relative z-10">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Community Impact
            </motion.h2>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-all">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <TrendingUp className="w-8 h-8" />
                    <span className="text-5xl font-bold">1,247</span>
                  </div>
                  <p className="text-white/90 font-medium text-lg">Reports Submitted</p>
                  <p className="text-white/70 text-sm mt-1">↑ 12% this week</p>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-all">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Users className="w-8 h-8" />
                    <span className="text-5xl font-bold">342</span>
                  </div>
                  <p className="text-white/90 font-medium text-lg">Active Contributors</p>
                  <p className="text-white/70 text-sm mt-1">↑ 8% this week</p>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-all">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Zap className="w-8 h-8" />
                    <span className="text-5xl font-bold">89%</span>
                  </div>
                  <p className="text-white/90 font-medium text-lg">Accuracy Rate</p>
                  <p className="text-white/70 text-sm mt-1">Weather correlation</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="p-8 md:p-12 bg-white/80 backdrop-blur-sm border-2 shadow-xl max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ready to Make an Impact?
            </h2>
            <p className="text-gray-700 text-lg mb-6">
              Join our community and help improve network connectivity for everyone.
              Every report counts!
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => onNavigate('login')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg text-lg px-10 py-6 rounded-xl"
              >
                Get Started Free
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 mb-2">NetPulse - Developed by Shaik Nagur Basha</p>
          <p className="text-sm text-gray-500 mb-3">Making network connectivity better, one report at a time.</p>
          <Button 
            onClick={() => onNavigate('about')} 
            variant="link"
            className="text-blue-600 hover:text-purple-600"
          >
            Learn More About Us
          </Button>
        </div>
      </footer>
    </div>
  );
}
