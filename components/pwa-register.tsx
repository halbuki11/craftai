"use client";

import { useEffect, useState } from "react";
import { Download, X, Share, PlusSquare, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "android" | "ios" | "desktop" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone)
  );
}

export function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Skip if already installed as PWA or already dismissed
    if (isStandalone()) return;
    if (localStorage.getItem("pwa-dismissed")) {
      setDismissed(true);
      return;
    }

    const plat = detectPlatform();
    setPlatform(plat);

    // Android: capture native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS/desktop: show guide after 3 seconds
    if (plat === "ios" || plat === "desktop") {
      const timer = setTimeout(() => setShowGuide(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowGuide(false);
    setInstallPrompt(null);
    localStorage.setItem("pwa-dismissed", "1");
  };

  // Nothing to show
  if (dismissed) return null;
  if (!installPrompt && !showGuide) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-card border border-border rounded-xl shadow-2xl p-5 animate-in slide-in-from-bottom">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 mb-3">
        <div className="p-2.5 bg-primary/10 rounded-xl flex-shrink-0">
          <Smartphone className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Sesli Ajan&#39;i Telefonuna Yukle
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            App Store veya Play Store&#39;a gerek yok!
          </p>
        </div>
      </div>

      {/* Android - native install */}
      {installPrompt && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Tek tikla ana ekranina ekle, uygulama gibi kullan.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" />
              Yukle
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sonra
            </button>
          </div>
        </div>
      )}

      {/* iOS guide */}
      {!installPrompt && platform === "ios" && (
        <div className="space-y-3">
          <div className="space-y-2.5 text-xs text-foreground">
            <div className="flex items-center gap-3 p-2.5 bg-accent/50 rounded-lg">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold flex-shrink-0">1</div>
              <div className="flex items-center gap-1.5">
                Alt bardaki <Share className="w-4 h-4 text-blue-500 inline" /> <span className="font-medium">Paylas</span> butonuna tikla
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-accent/50 rounded-lg">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold flex-shrink-0">2</div>
              <div className="flex items-center gap-1.5">
                <PlusSquare className="w-4 h-4 text-blue-500 inline" /> <span className="font-medium">Ana Ekrana Ekle</span> sec
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-accent/50 rounded-lg">
              <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold flex-shrink-0">3</div>
              <span className="font-medium">Ekle</span> tikla, hepsi bu!
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-1"
          >
            Anladim, kapat
          </button>
        </div>
      )}

      {/* Desktop guide */}
      {!installPrompt && platform === "desktop" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Tarayicinin adres cubugundaki <strong>yukle</strong> ikonuna tikla veya menu &gt; &quot;Uygulamayi yukle&quot; sec.
          </p>
          <button
            onClick={handleDismiss}
            className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-1"
          >
            Anladim, kapat
          </button>
        </div>
      )}
    </div>
  );
}
