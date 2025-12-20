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
  Bot,
  ChevronRight,
} from "lucide-react";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
  color?: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface SidebarProps {
  role: "STUDENT" | "PARENT" | "CONSULTANT" | "ADMIN";
  onClose?: () => void;
  isMobile?: boolean;
}

const menuGroups: Record<string, MenuGroup[]> = {
  STUDENT: [
    {
      title: "메인",
      items: [
        { icon: LayoutDashboard, label: "홈", href: "/dashboard/student", color: "from-violet-500 to-purple-600" },
        { icon: User, label: "내 프로필", href: "/dashboard/student/data", color: "from-blue-500 to-cyan-500" },
      ],
    },
    {
      title: "학업 관리",
      items: [
        { icon: TrendingUp, label: "성적 분석", href: "/dashboard/student/grades", badge: "NEW", color: "from-emerald-500 to-teal-500" },
        { icon: Target, label: "목표 성적", href: "/dashboard/student/goals", color: "from-amber-500 to-orange-500" },
        { icon: Activity, label: "비교과", href: "/dashboard/student/clubs", color: "from-pink-500 to-rose-500" },
        { icon: CalendarCheck, label: "플래너", href: "/dashboard/student/tasks", color: "from-indigo-500 to-blue-500" },
      ],
    },
    {
      title: "입시 준비",
      items: [
        { icon: Target, label: "입시 분석", href: "/dashboard/student/diagnosis", badge: "BEST", color: "from-red-500 to-pink-500" },
        { icon: Calculator, label: "합격 시뮬", href: "/dashboard/student/simulator", badge: "NEW", color: "from-cyan-500 to-blue-500" },
        { icon: GitCompare, label: "학교 비교", href: "/dashboard/student/compare", color: "from-purple-500 to-violet-500" },
        { icon: Sparkles, label: "합격 예측", href: "/dashboard/student/prediction", badge: "NEW", color: "from-yellow-500 to-amber-500" },
        { icon: MessageSquare, label: "면접 준비", href: "/dashboard/student/interview", color: "from-teal-500 to-emerald-500" },
        { icon: FileText, label: "자기소개서", href: "/dashboard/student/statement", color: "from-orange-500 to-red-500" },
      ],
    },
    {
      title: "AI 도우미",
      items: [
        { icon: Bot, label: "AI 튜터", href: "/dashboard/student/tutor", badge: "HOT", color: "from-fuchsia-500 to-pink-500" },
        { icon: Brain, label: "AI 멘토", href: "/dashboard/student/ai", color: "from-violet-500 to-fuchsia-500" },
      ],
    },
    {
      title: "일정 & 소통",
      items: [
        { icon: Clock, label: "D-Day", href: "/dashboard/student/dday", color: "from-rose-500 to-red-500" },
        { icon: Calendar, label: "학습 캘린더", href: "/dashboard/student/calendar", color: "from-sky-500 to-blue-500" },
        { icon: MessageCircle, label: "1:1 상담", href: "/dashboard/student/consultation", color: "from-indigo-500 to-purple-500" },
      ],
    },
    {
      title: "커뮤니티",
      items: [
        { icon: Newspaper, label: "최신뉴스", href: "/dashboard/student/news", color: "from-slate-500 to-gray-600" },
        { icon: Trophy, label: "성취 뱃지", href: "/dashboard/student/badges", color: "from-yellow-500 to-orange-500" },
        { icon: HelpCircle, label: "Q&A", href: "/dashboard/student/qna", color: "from-green-500 to-emerald-500" },
        { icon: BookOpen, label: "합격 후기", href: "/dashboard/student/stories", color: "from-amber-500 to-yellow-500" },
        { icon: Heart, label: "보호자 연결", href: "/dashboard/family", color: "from-pink-500 to-red-500" },
      ],
    },
  ],
  PARENT: [
    {
      title: "메인",
      items: [
        { icon: LayoutDashboard, label: "홈", href: "/dashboard/parent", color: "from-violet-500 to-purple-600" },
        { icon: GraduationCap, label: "학생 현황", href: "/dashboard/parent/children", color: "from-blue-500 to-cyan-500" },
      ],
    },
    {
      title: "관리",
      items: [
        { icon: Clock, label: "D-Day", href: "/dashboard/student/dday", color: "from-rose-500 to-red-500" },
        { icon: Calendar, label: "캘린더", href: "/dashboard/parent/calendar", color: "from-sky-500 to-blue-500" },
        { icon: Newspaper, label: "최신뉴스", href: "/dashboard/student/news", color: "from-slate-500 to-gray-600" },
        { icon: FileBarChart, label: "분석 리포트", href: "/dashboard/parent/reports", color: "from-emerald-500 to-teal-500" },
        { icon: Crown, label: "멤버십", href: "/dashboard/subscription", color: "from-yellow-500 to-amber-500" },
      ],
    },
  ],
  CONSULTANT: [
    {
      title: "메인",
      items: [
        { icon: LayoutDashboard, label: "홈", href: "/dashboard/consultant", color: "from-violet-500 to-purple-600" },
        { icon: MessageCircle, label: "상담", href: "/dashboard/consultant/consultations", color: "from-blue-500 to-cyan-500" },
      ],
    },
    {
      title: "관리",
      items: [
        { icon: Users, label: "담당 학생", href: "/dashboard/consultant/students", color: "from-emerald-500 to-teal-500" },
        { icon: Calendar, label: "스케줄", href: "/dashboard/consultant/schedule", color: "from-amber-500 to-orange-500" },
        { icon: FileBarChart, label: "리포트", href: "/dashboard/consultant/reports", color: "from-pink-500 to-rose-500" },
        { icon: User, label: "프로필", href: "/dashboard/consultant/settings", color: "from-indigo-500 to-blue-500" },
      ],
    },
  ],
  ADMIN: [
    {
      title: "메인",
      items: [
        { icon: LayoutDashboard, label: "홈", href: "/dashboard/admin", color: "from-violet-500 to-purple-600" },
        { icon: BarChart3, label: "애널리틱스", href: "/dashboard/admin/stats", color: "from-blue-500 to-cyan-500" },
      ],
    },
    {
      title: "관리",
      items: [
        { icon: Users, label: "유저", href: "/dashboard/admin/users", color: "from-emerald-500 to-teal-500" },
        { icon: UserCheck, label: "컨설턴트", href: "/dashboard/admin/consultants", color: "from-amber-500 to-orange-500" },
        { icon: School, label: "학교 DB", href: "/dashboard/admin/schools", color: "from-pink-500 to-rose-500" },
        { icon: Database, label: "크롤러", href: "/dashboard/admin/crawler", color: "from-indigo-500 to-blue-500" },
        { icon: CreditCard, label: "결제", href: "/dashboard/admin/payments", color: "from-cyan-500 to-blue-500" },
        { icon: Zap, label: "AI 모니터링", href: "/dashboard/admin/ai-quality", color: "from-fuchsia-500 to-pink-500" },
      ],
    },
  ],
};

export function Sidebar({ role, onClose, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const groups = menuGroups[role] || [];

  return (
    <aside className={`fixed left-0 top-0 h-screen w-[280px] bg-[#0c0c14] z-40 flex flex-col ${isMobile ? 'animate-slide-in-left' : ''}`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-600/5 via-transparent to-fuchsia-600/5 pointer-events-none" />
      
      {/* Logo */}
      <div className="relative h-16 flex items-center justify-between px-5 border-b border-white/5">
          <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-white tracking-tight">3m5m</span>
            <span className="text-[10px] text-slate-500 -mt-0.5 tracking-wider">3 Minutes Input, 5 Minutes Strategy</span>
          </div>
        </div>
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
      <nav className="relative flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            {/* Group Title */}
            <div className="flex items-center gap-2 px-2 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-violet-500/50 to-transparent" />
              <h3 className="text-[11px] font-bold text-violet-400 uppercase tracking-widest">
                {group.title}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-l from-violet-500/50 to-transparent" />
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 gap-2">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 min-h-[85px] overflow-hidden
                      ${isActive
                        ? "bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 ring-1 ring-violet-500/50 shadow-lg shadow-violet-500/10"
                        : "bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-violet-500/30"
                      }
                    `}
                  >
                    {/* Hover Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color || 'from-violet-500 to-fuchsia-500'} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    {/* Icon */}
                    <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 bg-gradient-to-br ${item.color || 'from-violet-500 to-fuchsia-500'} shadow-lg
                      ${isActive ? 'scale-110 shadow-xl' : 'group-hover:scale-105 group-hover:shadow-xl'}
                    `}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    
                    {/* Label */}
                    <span className={`relative text-xs font-semibold text-center leading-tight transition-colors
                      ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}
                    `}>
                      {item.label}
                    </span>

                    {/* Badge */}
                    {item.badge && (
                      <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded-md shadow-sm
                        ${item.badge === "BEST" 
                          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white" 
                          : item.badge === "HOT"
                          ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                          : "bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full bg-gradient-to-b from-violet-400 to-fuchsia-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="relative p-3 border-t border-white/5">
        <Link
          href="/dashboard/settings"
          className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
            ${pathname === '/dashboard/settings' 
              ? 'bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 ring-1 ring-violet-500/50' 
              : 'bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-violet-500/30'
            }
          `}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-slate-500 to-slate-600 transition-transform group-hover:scale-105`}>
            <Settings className="w-4 h-4 text-white" />
          </div>
          <span className={`text-sm font-medium ${pathname === '/dashboard/settings' ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
            설정
          </span>
          <ChevronRight className={`w-4 h-4 ml-auto ${pathname === '/dashboard/settings' ? 'text-violet-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
        </Link>

        {/* Branding */}
        <div className="mt-3 px-4 py-2 text-center">
          <p className="text-[10px] text-slate-600">
            © 2025 3m5m v1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
