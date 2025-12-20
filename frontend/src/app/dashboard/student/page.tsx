"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  BookOpen,
  Target,
  Trophy,
  TrendingUp,
  Clock,
  Calendar,
  ChevronRight,
  Sparkles,
  CheckCircle,
  Circle,
  AlertCircle,
  ExternalLink,
  School,
  BarChart3,
  FileText,
  Brain,
  MessageSquare,
  Zap,
  Star,
  ArrowRight,
  Bot,
  Calculator,
  Award,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";
import { WidgetSettingsButton } from "@/components/dashboard/WidgetSettings";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent, StatCard } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";

// 차트 컴포넌트 동적 로딩
const CompetitionRateChart = dynamic(
  () => import("@/components/charts").then((mod) => ({ default: mod.CompetitionRateChart })),
  { ssr: false, loading: () => <div className="h-48 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg" /> }
);
const SkillRadarChart = dynamic(
  () => import("@/components/charts").then((mod) => ({ default: mod.SkillRadarChart })),
  { ssr: false, loading: () => <div className="h-48 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg" /> }
);

interface DashboardData {
  activityCount: number;
  targetSchoolCount: number;
  completedTasks: number;
  latestScore: number | null;
  todayTasks: Task[];
  upcomingSchedules: Schedule[];
  recentActivities: Activity[];
  planProgress: PlanProgress | null;
}

interface Task {
  id: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate?: string;
}

interface Schedule {
  id: string;
  title: string;
  date: string;
  type: string;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  createdAt: string;
}

interface PlanProgress {
  totalTasks: number;
  completedTasks: number;
  currentWeek: number;
  progress: number;
}

const sampleCompetitionData = [
  { name: "서울과학고", rate: 10.5, year: 2025 },
  { name: "한성과학고", rate: 7.8, year: 2025 },
  { name: "대원외고", rate: 2.2, year: 2025 },
  { name: "하나고", rate: 4.0, year: 2025 },
];

const sampleSkillData = [
  { skill: "학업성적", value: 85, fullMark: 100 },
  { skill: "비교과활동", value: 70, fullMark: 100 },
  { skill: "독서활동", value: 60, fullMark: 100 },
  { skill: "봉사활동", value: 45, fullMark: 100 },
  { skill: "자기소개서", value: 55, fullMark: 100 },
  { skill: "면접준비", value: 40, fullMark: 100 },
];

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  
  const { 
    widgets, 
    isWidgetEnabled, 
    toggleWidget, 
    reorderWidgets, 
    resetToDefault 
  } = useWidgetSettings('student');

  const downloadPdf = async () => {
    if (!user?.id) return;
    
    setDownloading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${getApiUrl()}/reports/my/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error("PDF 생성 실패");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${user.name || "student"}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("PDF download error:", error);
      alert("PDF 다운로드에 실패했습니다.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${getApiUrl()}/api/dashboard/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDashboard(data);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 핵심 서비스 카드
  const mainServices = [
    {
      icon: Target,
      title: "합격 분석",
      description: "목표 학교 적합도 분석",
      color: "from-violet-500 to-fuchsia-500",
      href: "/dashboard/student/diagnosis",
      badge: "BEST",
    },
    {
      icon: Brain,
      title: "AI 멘토",
      description: "24시간 맞춤형 조언",
      color: "from-blue-500 to-cyan-500",
      href: "/dashboard/student/ai",
      badge: "NEW",
    },
    {
      icon: Calculator,
      title: "합격 시뮬",
      description: "시뮬레이션 & 예측",
      color: "from-emerald-500 to-teal-500",
      href: "/dashboard/student/simulator",
      badge: "NEW",
    },
    {
      icon: MessageSquare,
      title: "면접 준비",
      description: "모의 면접 & 피드백",
      color: "from-amber-500 to-orange-500",
      href: "/dashboard/student/interview",
    },
  ];

  // 빠른 액션
  const quickActions = [
    { icon: BookOpen, title: "데이터 입력", href: "/dashboard/student/data", color: "from-pink-500 to-rose-500" },
    { icon: TrendingUp, title: "성적 분석", href: "/dashboard/student/grades", color: "from-cyan-500 to-blue-500" },
    { icon: FileText, title: "자기소개서", href: "/dashboard/student/statement", color: "from-purple-500 to-violet-500" },
    { icon: Calendar, title: "학습 캘린더", href: "/dashboard/student/calendar", color: "from-lime-500 to-green-500" },
    { icon: Clock, title: "D-Day", href: "/dashboard/student/dday", color: "from-red-500 to-pink-500" },
    { icon: Award, title: "성취 뱃지", href: "/dashboard/student/badges", color: "from-yellow-500 to-amber-500" },
  ];

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="space-y-6">
        {/* Welcome Banner - Premium Style */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-6 sm:p-8">
          {/* 위젯 설정 버튼 */}
          <div className="absolute top-4 right-4 z-20">
            <WidgetSettingsButton
              widgets={widgets}
              onToggle={toggleWidget}
              onReorder={reorderWidgets}
              onReset={resetToDefault}
            />
          </div>

          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full text-violet-300 text-sm mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>AI 맞춤 분석 제공 중</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  안녕하세요, {user?.name || "학생"}님! 👋
                </h1>
                <p className="text-slate-400 text-base sm:text-lg">
                  오늘도 합격을 향해 한 걸음 더 나아가세요!
                </p>

                {(user?.middleSchool || user?.schoolName || user?.grade) && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300">
                    <School className="w-4 h-4 text-violet-400" />
                    <span>
                      {user?.middleSchool?.name || user?.schoolName || "학교 미설정"}
                      {user?.grade && ` ${user.grade}학년`}
                    </span>
                    {user?.middleSchool?.website && (
                      <a
                        href={user.middleSchool.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Progress Card */}
              {dashboard?.planProgress && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 min-w-[280px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">액션 플랜 진행률</span>
                    <span className="text-2xl font-bold text-violet-400">{dashboard.planProgress.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
                      style={{ width: `${dashboard.planProgress.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    {dashboard.planProgress.currentWeek}주차 · {dashboard.planProgress.completedTasks}/{dashboard.planProgress.totalTasks} 완료
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={downloadPdf}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50"
              >
                {downloading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                내 리포트 PDF
              </button>
              <Link
                href="/dashboard/student/ai"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-violet-500/25"
              >
                <Bot className="w-4 h-4" />
                AI 분석 받기
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, title: "입력한 활동", value: dashboard?.activityCount || 0, color: "from-blue-500 to-cyan-500" },
            { icon: Target, title: "목표 학교", value: dashboard?.targetSchoolCount || 0, color: "from-violet-500 to-purple-500" },
            { icon: Trophy, title: "완료 태스크", value: dashboard?.completedTasks || 0, color: "from-amber-500 to-orange-500" },
            { icon: TrendingUp, title: "진단 점수", value: dashboard?.latestScore || "-", color: "from-emerald-500 to-teal-500" },
          ].map((stat, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-5 group hover:shadow-lg transition-all">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform`} />
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stat.value}
                {typeof stat.value === 'number' && <span className="text-sm font-normal text-slate-400 ml-1">{stat.title === "진단 점수" ? "점" : "개"}</span>}
              </p>
            </div>
          ))}
        </div>

        {/* Main Services - Card Style */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">핵심 서비스</h2>
            <span className="text-sm text-slate-500">AI 기반 분석</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {mainServices.map((service, i) => (
              <Link
                key={i}
                href={service.href}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                {service.badge && (
                  <span className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    service.badge === "BEST" 
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white" 
                      : "bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
                  }`}>
                    {service.badge}
                  </span>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{service.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{service.description}</p>
                <ChevronRight className="absolute bottom-5 right-5 w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">빠른 액션</h2>
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="group flex flex-col items-center p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:shadow-lg hover:border-violet-500/50 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">{action.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <CardHeader icon={<BarChart3 className="w-5 h-5" />}>
              목표 학교 경쟁률 비교
            </CardHeader>
            <CardContent>
              <CompetitionRateChart data={sampleCompetitionData} />
              <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
                2025학년도 예상 경쟁률
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader icon={<Target className="w-5 h-5" />}>
              역량 분석
            </CardHeader>
            <CardContent>
              <SkillRadarChart data={sampleSkillData} />
              <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
                현재 나의 준비 수준
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks & Schedules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader
              icon={<Clock className="w-5 h-5" />}
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/student/tasks")}>
                  전체 보기 <ChevronRight className="w-4 h-4" />
                </Button>
              }
            >
              오늘의 할 일
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard?.todayTasks && dashboard.todayTasks.length > 0 ? (
                  dashboard.todayTasks.slice(0, 5).map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))
                ) : (
                  <EmptyState icon={<CheckCircle className="w-8 h-8" />} message="오늘 예정된 태스크가 없습니다" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              icon={<Calendar className="w-5 h-5" />}
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/student/dday")}>
                  전체 보기 <ChevronRight className="w-4 h-4" />
                </Button>
              }
            >
              다가오는 일정
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard?.upcomingSchedules && dashboard.upcomingSchedules.length > 0 ? (
                  dashboard.upcomingSchedules.slice(0, 5).map((schedule) => (
                    <ScheduleItem key={schedule.id} schedule={schedule} />
                  ))
                ) : (
                  <EmptyState icon={<Calendar className="w-8 h-8" />} message="예정된 일정이 없습니다" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 p-6 sm:p-8">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-white">AI 맞춤 분석 받기</h3>
                <p className="text-white/80 text-sm">
                  데이터를 기반으로 AI가 맞춤형 조언을 제공합니다
                </p>
              </div>
            </div>
            <Button
              className="bg-white text-violet-600 hover:bg-white/90 w-full sm:w-auto font-semibold shadow-xl"
              onClick={() => router.push("/dashboard/student/ai")}
            >
              <Zap className="w-4 h-4 mr-2" />
              AI 조언 받기
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function TaskItem({ task }: { task: Task }) {
  const statusIcons = {
    PENDING: <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />,
    IN_PROGRESS: <AlertCircle className="w-5 h-5 text-amber-500" />,
    COMPLETED: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      {statusIcons[task.status]}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${
          task.status === "COMPLETED" ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-700 dark:text-slate-200"
        }`}>
          {task.title}
        </p>
        {task.dueDate && (
          <p className="text-xs text-slate-400 dark:text-slate-500">{task.dueDate}</p>
        )}
      </div>
      <Badge
        variant={task.status === "COMPLETED" ? "success" : task.status === "IN_PROGRESS" ? "warning" : "default"}
      >
        {task.status === "COMPLETED" ? "완료" : task.status === "IN_PROGRESS" ? "진행중" : "대기"}
      </Badge>
    </div>
  );
}

function ScheduleItem({ schedule }: { schedule: Schedule }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
      <div className="w-2 h-2 rounded-full bg-violet-500" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
          {schedule.title}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{schedule.date}</p>
      </div>
      <Badge variant="info">{schedule.type || "일정"}</Badge>
    </div>
  );
}

function EmptyState({ icon, message, action }: { icon: React.ReactNode; message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
      {icon}
      <p className="mt-2 text-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
