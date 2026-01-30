import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Gauge, Wifi, Download, Upload, RotateCw } from "lucide-react";
import { motion } from "motion/react";

interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  timestamp: string;
}

interface SpeedTestMeterProps {
  onTestComplete?: (result: SpeedTestResult) => void;
}

export function SpeedTestMeter({ onTestComplete }: SpeedTestMeterProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState<"download" | "upload" | "ping" | null>(null);
  const [result, setResult] = useState<SpeedTestResult | null>(null);

  const runSpeedTest = async () => {
    setIsRunning(true);
    setProgress(0);
    setResult(null);

    // Simulate ping test
    setCurrentTest("ping");
    await simulateProgress(0, 30);

    // Simulate download test
    setCurrentTest("download");
    await simulateProgress(30, 70);

    // Simulate upload test
    setCurrentTest("upload");
    await simulateProgress(70, 100);

    // Generate random but realistic speed test results
    const testResult: SpeedTestResult = {
      downloadSpeed: Math.floor(Math.random() * 80) + 20, // 20-100 Mbps
      uploadSpeed: Math.floor(Math.random() * 40) + 10, // 10-50 Mbps
      ping: Math.floor(Math.random() * 30) + 10, // 10-40 ms
      timestamp: new Date().toISOString(),
    };

    setResult(testResult);
    setCurrentTest(null);
    setIsRunning(false);
    
    if (onTestComplete) {
      onTestComplete(testResult);
    }
  };

  const simulateProgress = (start: number, end: number) => {
    return new Promise<void>((resolve) => {
      let current = start;
      const interval = setInterval(() => {
        current += 2;
        setProgress(current);
        if (current >= end) {
          clearInterval(interval);
          resolve();
        }
      }, 40);
    });
  };

  const getSpeedColor = (speed: number, isDownload: boolean) => {
    const threshold = isDownload ? 50 : 25;
    if (speed >= threshold) return "text-green-600";
    if (speed >= threshold / 2) return "text-yellow-600";
    return "text-red-600";
  };

  const getSpeedQuality = (speed: number, isDownload: boolean) => {
    const threshold = isDownload ? 50 : 25;
    if (speed >= threshold) return "Excellent";
    if (speed >= threshold / 2) return "Good";
    return "Poor";
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 shadow-xl h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Gauge className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold">Speed Test</h2>
      </div>

      {!result && !isRunning && (
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Wifi className="w-12 h-12 text-blue-600" />
          </motion.div>
          <p className="text-gray-600 mb-6 text-lg">Test your network speed</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={runSpeedTest}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg text-lg px-8 py-6 rounded-xl"
            >
              Start Speed Test
            </Button>
          </motion.div>
        </div>
      )}

      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 flex-1 flex flex-col justify-center"
        >
          <div className="text-center">
            <motion.div
              className="w-28 h-28 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-2 bg-white rounded-full" />
              <Wifi className="w-14 h-14 text-blue-600 relative z-10" />
            </motion.div>
            <motion.p 
              className="text-gray-700 mb-2 text-lg font-medium"
              key={currentTest}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {currentTest === "ping" && "🔍 Testing connection..."}
              {currentTest === "download" && "⬇️ Testing download speed..."}
              {currentTest === "upload" && "⬆️ Testing upload speed..."}
            </motion.p>
          </div>
          <div className="space-y-3">
            <Progress value={progress} className="h-3 bg-gray-200" />
            <p className="text-center font-bold text-2xl text-blue-600">{Math.round(progress)}%</p>
          </div>
        </motion.div>
      )}

      {result && !isRunning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 flex-1"
        >
          <div className="grid grid-cols-1 gap-4">
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200 shadow-md"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-700">Download</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className={`text-4xl font-bold ${getSpeedColor(result.downloadSpeed, true)}`}>
                  {result.downloadSpeed}
                </div>
                <span className="text-gray-600 text-lg">Mbps</span>
              </div>
              <p className="text-sm text-gray-600">
                {getSpeedQuality(result.downloadSpeed, true)} connection
              </p>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200 shadow-md"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-700">Upload</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className={`text-4xl font-bold ${getSpeedColor(result.uploadSpeed, false)}`}>
                  {result.uploadSpeed}
                </div>
                <span className="text-gray-600 text-lg">Mbps</span>
              </div>
              <p className="text-sm text-gray-600">
                {getSpeedQuality(result.uploadSpeed, false)} connection
              </p>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-5 border-2 border-green-200 shadow-md"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">Ping</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-green-700">{result.ping}</div>
                    <span className="text-gray-600">ms</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border-2 border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              ⏱️ Tested at {new Date(result.timestamp).toLocaleTimeString()}
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={runSpeedTest}
              variant="outline"
              className="w-full gap-2 border-2 hover:bg-blue-50 py-6 text-lg rounded-xl"
            >
              <RotateCw className="w-5 h-5" />
              Test Again
            </Button>
          </motion.div>
        </motion.div>
      )}
    </Card>
  );
}
