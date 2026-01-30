import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { X, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function PWAConfig() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Add PWA meta tags dynamically
    const addMetaTag = (name: string, content: string) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement("meta");
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    const addLinkTag = (rel: string, href: string) => {
      if (!document.querySelector(`link[rel="${rel}"]`)) {
        const link = document.createElement("link");
        link.rel = rel;
        link.href = href;
        document.head.appendChild(link);
      }
    };

    // PWA Meta Tags
    addMetaTag("application-name", "NetPulse");
    addMetaTag("apple-mobile-web-app-capable", "yes");
    addMetaTag("apple-mobile-web-app-status-bar-style", "default");
    addMetaTag("apple-mobile-web-app-title", "NetPulse");
    addMetaTag("format-detection", "telephone=no");
    addMetaTag("mobile-web-app-capable", "yes");
    addMetaTag("theme-color", "#2563eb");
    
    // Viewport for mobile optimization
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover");
    }

    // Description
    addMetaTag("description", "Report mobile network issues and help analyze weather impact on connectivity. Earn rewards and climb the leaderboard!");

    // Touch Icons (using data URLs for demo)
    addLinkTag("apple-touch-icon", "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%232563eb' width='100' height='100'/%3E%3Ctext y='70' x='50' font-size='60' text-anchor='middle' fill='white'%3ENP%3C/text%3E%3C/svg%3E");

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt after 3 seconds if not installed
      setTimeout(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (!isStandalone) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log("PWA is installed");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  return (
    <AnimatePresence>
      {showInstallPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <Card className="p-4 shadow-2xl border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
            
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">NP</span>
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 mb-1">Install NetPulse</h3>
                <p className="text-sm text-gray-600">
                  Install our app for quick access and offline support!
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Download className="w-4 h-4" />
                Install App
              </Button>
              <Button
                onClick={() => setShowInstallPrompt(false)}
                variant="outline"
                className="flex-1"
              >
                Not Now
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
