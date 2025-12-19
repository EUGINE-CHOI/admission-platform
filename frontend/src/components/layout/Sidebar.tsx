"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  User,
  Target,
  Brain,
  CalendarCheck,
  Users,
  Settings,
  BarChart3,
  UserCheck,
  School,
  CreditCard,
  FileBarChart,
  MessageCircle,
  Calendar,
  Activity,
  Database,
  Crown,
  Zap,
  Heart,
  Newspaper,
  X,
  TrendingUp,
  GitCompare,
  MessageSquare,
  Clock,
  Trophy,
  Calculator,
  HelpCircle,
  BookOpen,
  FileText,
  Sparkles,
} from "lucide-react";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
}

interface SidebarProps {
  role: "STUDENT" | "PARENT" | "CONSULTANT" | "ADMIN";
  onClose?: () => void;
  isMobile?: boolean;
}

const menuItems: Record<string, MenuItem[]> = {
  STUDENT: [
    { icon: LayoutDashboard, label: "홈", href: "/dashboard/student" },
    { icon: User, label: "내 프로필", href: "/dashboard/student/data" },
    { icon: TrendingUp, label: "성적 분석", href: "/dashboard/student/grades", badge: "NEW" },
    { icon: Target, label: "목표 성적", href: "/dashboard/student/goals", badge: "NEW" },
    { icon: Activity, label: "비교과", href: "/dashboard/student/clubs" },
    { icon: Target, label: "입시 분석", href: "/dashboard/student/diagnosis" },
    { icon: Calculator, label: "합격 시뮬", href: "/dashboard/student/simulator", badge: "NEW" },
    { icon: GitCompare, label: "학교 비교", href: "/dashboard/student/compare" },
    { icon: Clock, label: "D-Day", href: "/dashboard/student/dday" },
    { icon: Calendar, label: "학습 캘린더", href: "/dashboard/student/calendar", badge: "NEW" },
    { icon: MessageCircle, label: "상담 채팅", href: "/dashboard/student/chat", badge: "NEW" },
    { icon: Clock, label: "학습 시간", href: "/dashboard/student/study-time", badge: "NEW" },
    { icon: MessageSquare, label: "면접 준비", href: "/dashboard/student/interview" },
    { icon: FileText, label: "자기소개서", href: "/dashboard/student/statement", badge: "NEW" },
    { icon: Sparkles, label: "합격 예측", href: "/dashboard/student/prediction", badge: "NEW" },
    { icon: Brain, label: "AI 멘토", href: "/dashboard/student/ai" },
    { icon: Newspaper, label: "최신뉴스", href: "/dashboard/student/news" },
    { icon: CalendarCheck, label: "플래너", href: "/dashboard/student/tasks" },
    { icon: Trophy, label: "성취 뱃지", href: "/dashboard/student/badges" },
    { icon: HelpCircle, label: "Q&A", href: "/dashboard/student/qna", badge: "NEW" },
    { icon: BookOpen, label: "합격 후기", href: "/dashboard/student/stories", badge: "NEW" },
    { icon: MessageCircle, label: "1:1 상담", href: "/dashboard/student/consultation" },
    { icon: Heart, label: "보호자 연결", href: "/dashboard/family" },
  ],
  PARENT: [
    { icon: LayoutDashboard, label: "홈", href: "/dashboard/parent" },
    { icon: GraduationCap, label: "학생 현황", href: "/dashboard/parent/children" },
    { icon: Clock, label: "D-Day", href: "/dashboard/student/dday", badge: "NEW" },
    { icon: Calendar, label: "캘린더", href: "/dashboard/parent/calendar" },
    { icon: Newspaper, label: "최신뉴스", href: "/dashboard/student/news" },
    { icon: FileBarChart, label: "분석 리포트", href: "/dashboard/parent/reports" },
    { icon: Crown, label: "멤버십", href: "/dashboard/subscription" },
  ],
  CONSULTANT: [
    { icon: LayoutDashboard, label: "홈", href: "/dashboard/consultant" },
    { icon: MessageCircle, label: "상담", href: "/dashboard/consultant/consultations" },
    { icon: Users, label: "담당 학생", href: "/dashboard/consultant/students" },
    { icon: Calendar, label: "스케줄", href: "/dashboard/consultant/schedule" },
    { icon: FileBarChart, label: "리포트", href: "/dashboard/consultant/reports" },
    { icon: User, label: "프로필", href: "/dashboard/consultant/settings" },
  ],
  ADMIN: [
    { icon: LayoutDashboard, label: "홈", href: "/dashboard/admin" },
    { icon: BarChart3, label: "애널리틱스", href: "/dashboard/admin/stats" },
    { icon: Users, label: "유저", href: "/dashboard/admin/users" },
    { icon: UserCheck, label: "컨설턴트", href: "/dashboard/admin/consultants" },
    { icon: School, label: "학교 DB", href: "/dashboard/admin/schools" },
    { icon: Database, label: "크롤러", href: "/dashboard/admin/crawler" },
    { icon: CreditCard, label: "결제", href: "/dashboard/admin/payments" },
    { icon: Zap, label: "AI 모니터링", href: "/dashboard/admin/ai-quality" },
  ],
};

export function Sidebar({ role, onClose, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const items = menuItems[role] || [];

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 z-40 flex flex-col ${isMobile ? 'animate-slide-in-left' : ''}`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-white tracking-tight">
              입시로드맵
            </span>
            <span className="text-[10px] text-slate-500 -mt-0.5">ADMISSION ROADMAP</span>
          </div>
        </div>
        {/* Mobile Close Button */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <div className={`p-1.5 rounded-md transition-colors ${
                    isActive 
                      ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25" 
                      : "bg-slate-800 group-hover:bg-slate-700"
                  }`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/50">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-sm"
        >
          <div className="p-1.5 rounded-md bg-slate-800">
            <Settings className="w-4 h-4" />
          </div>
          <span>설정</span>
        </Link>
      </div>
    </aside>
  );
}

