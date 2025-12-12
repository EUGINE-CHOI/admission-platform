"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Home,
  BookOpen,
  Target,
  Sparkles,
  CheckSquare,
  Users,
  Settings,
  BarChart3,
  UserCheck,
  School,
  CreditCard,
  FileText,
  MessageSquare,
  Calendar,
  Trophy,
  Database,
} from "lucide-react";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface SidebarProps {
  role: "STUDENT" | "PARENT" | "CONSULTANT" | "ADMIN";
}

const menuItems: Record<string, MenuItem[]> = {
  STUDENT: [
    { icon: Home, label: "대시보드", href: "/dashboard/student" },
    { icon: BookOpen, label: "데이터 입력", href: "/dashboard/student/data" },
    { icon: Trophy, label: "동아리", href: "/dashboard/student/clubs" },
    { icon: Target, label: "진단", href: "/dashboard/student/diagnosis" },
    { icon: Sparkles, label: "AI 조언", href: "/dashboard/student/ai" },
    { icon: CheckSquare, label: "실행 계획", href: "/dashboard/student/tasks" },
    { icon: Users, label: "상담", href: "/dashboard/student/consultation" },
  ],
  PARENT: [
    { icon: Home, label: "대시보드", href: "/dashboard/parent" },
    { icon: Users, label: "자녀 관리", href: "/dashboard/parent/children" },
    { icon: Calendar, label: "일정", href: "/dashboard/parent/calendar" },
    { icon: FileText, label: "리포트", href: "/dashboard/parent/reports" },
    { icon: CreditCard, label: "구독 관리", href: "/dashboard/parent/subscription" },
  ],
  CONSULTANT: [
    { icon: Home, label: "대시보드", href: "/dashboard/consultant" },
    { icon: MessageSquare, label: "상담 관리", href: "/dashboard/consultant/consultations" },
    { icon: Users, label: "학생 목록", href: "/dashboard/consultant/students" },
    { icon: Calendar, label: "일정 관리", href: "/dashboard/consultant/schedule" },
    { icon: FileText, label: "리포트 작성", href: "/dashboard/consultant/reports" },
    { icon: Settings, label: "프로필 설정", href: "/dashboard/consultant/settings" },
  ],
  ADMIN: [
    { icon: Home, label: "대시보드", href: "/dashboard/admin" },
    { icon: BarChart3, label: "통계", href: "/dashboard/admin/stats" },
    { icon: Users, label: "사용자 관리", href: "/dashboard/admin/users" },
    { icon: UserCheck, label: "컨설턴트 승인", href: "/dashboard/admin/consultants" },
    { icon: School, label: "학교 관리", href: "/dashboard/admin/schools" },
    { icon: Database, label: "크롤러", href: "/dashboard/admin/crawler" },
    { icon: CreditCard, label: "결제 관리", href: "/dashboard/admin/payments" },
    { icon: Sparkles, label: "AI 품질", href: "/dashboard/admin/ai-quality" },
  ],
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = menuItems[role] || [];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-40 flex flex-col transition-colors">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
          입시로드맵
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                    }
                  `}
                >
                  <item.icon
                    className={`w-5 h-5 ${isActive ? "text-sky-600 dark:text-sky-400" : ""}`}
                  />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-400" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-colors"
        >
          <Settings className="w-5 h-5" />
          설정
        </Link>
      </div>
    </aside>
  );
}

