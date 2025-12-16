"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNavBar } from "./MobileNavBar";
import { OnboardingTour, useOnboarding } from "@/components/onboarding";

interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "PARENT" | "CONSULTANT" | "ADMIN";
}

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRole?: "STUDENT" | "PARENT" | "CONSULTANT" | "ADMIN" | ("STUDENT" | "PARENT")[];
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showTour, completeTour } = useOnboarding();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    
    // 역할 검증
    if (requiredRole) {
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!allowedRoles.includes(parsedUser.role)) {
        router.push(`/dashboard/${parsedUser.role.toLowerCase()}`);
        return;
      }
    }

    setUser(parsedUser);
    setIsLoading(false);
  }, [router, requiredRole]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors">
      {/* Onboarding Tour */}
      {showTour && (user.role === "STUDENT" || user.role === "PARENT") && (
        <OnboardingTour role={user.role} onComplete={completeTour} />
      )}

      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar role={user.role} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50">
            <Sidebar 
              role={user.role} 
              onClose={() => setIsMobileMenuOpen(false)}
              isMobile={true}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        <Header
          user={user}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="p-4 sm:p-6 pb-24 lg:pb-6">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavBar role={user.role} />
    </div>
  );
}

