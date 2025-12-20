"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Brain,
  Newspaper,
  User,
  Calendar,
  FileBarChart,
  MessageCircle,
  Users,
  BarChart3,
} from "lucide-react";

interface MobileNavBarProps {
  role: "STUDENT" | "PARENT" | "CONSULTANT" | "ADMIN";
}

const navItems: Record<string, { icon: React.ElementType; label: string; href: string }[]> = {
  STUDENT: [
    { icon: LayoutDashboard, label: "홈", href: "/dashboard/student" },
    { icon: Target, label: "분석", href: "/dashboard/student/diagnosis" },
    { icon: Brain, label: "AI", href: "/dashboard/student/ai" },
    { icon: Newspaper, label: "뉴스", href: "/dashboard/student/news" },
    { icon: User, label: "더보기", href: "/dashboard/student/data" },
  ],
  PARENT: [
    { icon: LayoutDashboard, label: "홈", href: "/dashboard/parent" },
    { icon: Users, label: "학생", href: "/dashboard/parent/children" },
    { icon: Calendar, label: "캘린더", href: "/dashboard/parent/calendar" },
    { icon: Newspaper, label: "뉴스", href: "/dashboard/student/news" },
    { icon: FileBarChart, label: "리포트", href: "/dashboard/parent/reports" },
  ],
  CONSULTANT: [
    { icon: LayoutDashboard, label: "홈", href: "/dashboard/consultant" },
    { icon: MessageCircle, label: "상담", href: "/dashboard/consultant/consultations" },
    { icon: Users, label: "학생", href: "/dashboard/consultant/students" },
    { icon: Calendar, label: "스케줄", href: "/dashboard/consultant/schedule" },
    { icon: User, label: "더보기", href: "/dashboard/consultant/settings" },
  ],
  ADMIN: [
    { icon: LayoutDashboard, label: "홈", href: "/dashboard/admin" },
    { icon: BarChart3, label: "통계", href: "/dashboard/admin/stats" },
    { icon: Users, label: "유저", href: "/dashboard/admin/users" },
    { icon: MessageCircle, label: "컨설턴트", href: "/dashboard/admin/consultants" },
    { icon: User, label: "더보기", href: "/dashboard/admin/schools" },
  ],
};

export function MobileNavBar({ role }: MobileNavBarProps) {
  const pathname = usePathname();
  const items = navItems[role] || navItems.STUDENT;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-violet-100 dark:bg-violet-500/20"
                    : "bg-transparent"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "scale-110" : ""
                  }`}
                />
              </div>
              <span
                className={`text-[10px] mt-0.5 font-medium ${
                  isActive ? "text-violet-600 dark:text-violet-400" : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}



