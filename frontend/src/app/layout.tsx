import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { SkipToContent } from "@/components/a11y";
import { InstallPrompt } from "@/components/pwa";
import { ToastProvider } from "@/components/ui";

export const metadata: Metadata = {
  title: "3m5m | 생기부 입력 3분, 합격 전략 5분",
  description: "AI 기반 고입 컨설팅 플랫폼. 생기부만 입력하면 5분 안에 맞춤 합격 전략을 받아보세요.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "3m5m",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0ea5e9" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
        <SkipToContent />
        <SWRProvider>
          <ThemeProvider>
            <ToastProvider>
              {children}
              <InstallPrompt />
            </ToastProvider>
          </ThemeProvider>
        </SWRProvider>
      </body>
    </html>
  );
}




