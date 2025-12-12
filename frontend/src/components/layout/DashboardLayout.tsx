"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "PARENT" | "CONSULTANT" | "ADMIN";
}

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRole?: "STUDENT" | "PARENT" | "CONSULTANT" | "ADMIN";
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    
    if (requiredRole && parsedUser.role !== requiredRole) {
      router.push(`/dashboard/${parsedUser.role.toLowerCase()}`);
      return;
    }

    setUser(parsedUser);
    setIsLoading(false);
  }, [router, requiredRole]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar role={user.role} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50">
            <Sidebar role={user.role} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        <Header
          user={user}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

