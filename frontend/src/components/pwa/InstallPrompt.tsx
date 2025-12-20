"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWA 설치 프롬프트 컴포넌트
 * 설치 가능한 환경에서만 표시됨
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 이미 설치됨 또는 이전에 거부함
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) return;

    // iOS 감지
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;
    
    if (isIOSDevice && !isInStandaloneMode) {
      setIsIOS(true);
      setShowPrompt(true);
      return;
    }

    // Android/Desktop - beforeinstallprompt 이벤트 리스너
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up"
      role="dialog"
      aria-labelledby="install-prompt-title"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-sky-600 dark:text-sky-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 id="install-prompt-title" className="font-semibold text-slate-900 dark:text-slate-100">
              앱으로 설치하기
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              홈 화면에 추가하면 더 빠르게 접근할 수 있어요
            </p>
            
            {isIOS ? (
              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg p-2">
                <p className="flex items-center gap-1">
                  Safari에서 <span className="inline-block px-1 bg-slate-200 dark:bg-slate-600 rounded">공유</span> 버튼을 누르고
                </p>
                <p className="mt-1">
                  <span className="inline-block px-1 bg-slate-200 dark:bg-slate-600 rounded">홈 화면에 추가</span>를 선택하세요
                </p>
              </div>
            ) : (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  leftIcon={<Download className="w-4 h-4" />}
                  aria-label="앱 설치하기"
                >
                  설치
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  aria-label="나중에 하기"
                >
                  나중에
                </Button>
              </div>
            )}
          </div>
          
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

