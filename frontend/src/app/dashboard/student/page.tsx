"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Download,
  FileText,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent, StatCard } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { CompetitionRateChart, ActivityProgressChart, SkillRadarChart } from "@/components/charts";

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

// 샘플 차트 데이터
const sampleCompetitionData = [
  { name: "서울과학고", rate: 10.5, year: 2025 },
  { name: "한성과학고", rate: 7.8, year: 2025 },
  { name: "대원외고", rate: 2.2, year: 2025 },
  { name: "하나고", rate: 4.0, year: 2025 },
];

const sampleActivityData = [
  { month: "9월", activities: 3, tasks: 5 },
  { month: "10월", activities: 5, tasks: 8 },
  { month: "11월", activities: 7, tasks: 12 },
  { month: "12월", activities: 4, tasks: 10 },
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

  // PDF 다운로드 함수
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
      const res = await fetch("${getApiUrl()}/api/dashboard/student", {
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

  const quickActions = [
    {
      icon: BookOpen,
      title: "데이터 입력",
      description: "성적, 활동, 독서 기록",
      color: "sky" as const,
      href: "/dashboard/student/data",
    },
    {
      icon: Target,
      title: "진단 실행",
      description: "목표 학교 적합도 분석",
      color: "indigo" as const,
      href: "/dashboard/student/diagnosis",
    },
    {
      icon: Sparkles,
      title: "AI 조언",
      description: "맞춤형 AI 분석",
      color: "purple" as const,
      href: "/dashboard/student/ai",
    },
    {
      icon: Calendar,
      title: "실행 계획",
      description: "태스크 및 일정 관리",
      color: "emerald" as const,
      href: "/dashboard/student/tasks",
    },
  ];

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-600 p-6 sm:p-8 text-white">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              안녕하세요, {user?.name || "학생"}님! 👋
            </h1>
            <p className="text-sky-100 text-base sm:text-lg mb-4">
              오늘도 목표를 향해 한 걸음 더 나아가세요!
            </p>
            <button
              onClick={downloadPdf}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  생성 중...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  내 리포트 PDF 다운로드
                </>
              )}
            </button>
            {(user?.middleSchool || user?.schoolName || user?.grade) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 bg-white/20 rounded-full text-sm flex items-center gap-2">
                  <School className="w-4 h-4" />
                  <span>
                    {user?.middleSchool?.name || user?.schoolName || "학교 미설정"}
                    {user?.middleSchool?.district && ` (${user.middleSchool.region} ${user.middleSchool.district})`}
                    {user?.grade && ` ${user.grade}학년`}
                  </span>
                  {user?.middleSchool?.website && (
                    <a
                      href={user.middleSchool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-sky-200 transition-colors ml-1"
                      title="학교 홈페이지 방문"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </span>
              </div>
            )}
            
            {dashboard?.planProgress && (
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">액션 플랜 진행률</span>
                  <span className="text-sm">{dashboard.planProgress.progress}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${dashboard.planProgress.progress}%` }}
                  />
                </div>
                <p className="text-xs text-sky-200 mt-2">
                  {dashboard.planProgress.currentWeek}주차 진행 중 · {dashboard.planProgress.completedTasks}/{dashboard.planProgress.totalTasks} 완료
                </p>
              </div>
            )}
          </div>
          
          {/* Decorative elements */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={<BookOpen className="w-5 sm:w-6 h-5 sm:h-6" />}
            title="입력한 활동"
            value={dashboard?.activityCount || 0}
            suffix="개"
            color="sky"
          />
          <StatCard
            icon={<Target className="w-5 sm:w-6 h-5 sm:h-6" />}
            title="목표 학교"
            value={dashboard?.targetSchoolCount || 0}
            suffix="개"
            color="indigo"
          />
          <StatCard
            icon={<Trophy className="w-5 sm:w-6 h-5 sm:h-6" />}
            title="완료 태스크"
            value={dashboard?.completedTasks || 0}
            suffix="개"
            color="amber"
          />
          <StatCard
            icon={<TrendingUp className="w-5 sm:w-6 h-5 sm:h-6" />}
            title="진단 점수"
            value={dashboard?.latestScore || "-"}
            suffix={dashboard?.latestScore ? "점" : ""}
            color="emerald"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              hover
              className="cursor-pointer group"
              onClick={() => router.push(action.href)}
            >
              <div className="flex flex-col items-start">
                <div
                  className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-transform group-hover:scale-110
                    ${action.color === "sky" ? "bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400" : ""}
                    ${action.color === "indigo" ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400" : ""}
                    ${action.color === "purple" ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400" : ""}
                    ${action.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400" : ""}
                  `}
                >
                  <action.icon className="w-5 sm:w-6 h-5 sm:h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base mb-1">{action.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{action.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Competition Rate Chart */}
          <Card>
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

          {/* Skill Radar Chart */}
          <Card>
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

        {/* Activity Progress Chart */}
        <Card>
          <CardHeader
            icon={<TrendingUp className="w-5 h-5" />}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/student/data")}
              >
                자세히 보기
                <ChevronRight className="w-4 h-4" />
              </Button>
            }
          >
            월별 활동 현황
          </CardHeader>
          <CardContent>
            <ActivityProgressChart data={sampleActivityData} />
          </CardContent>
        </Card>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Tasks */}
          <Card>
            <CardHeader
              icon={<Clock className="w-5 h-5" />}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard/student/tasks")}
                >
                  전체 보기
                  <ChevronRight className="w-4 h-4" />
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
                  <EmptyState
                    icon={<CheckCircle className="w-8 h-8" />}
                    message="오늘 예정된 태스크가 없습니다"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Schedules */}
          <Card>
            <CardHeader
              icon={<Calendar className="w-5 h-5" />}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard/student/diagnosis")}
                >
                  전체 보기
                  <ChevronRight className="w-4 h-4" />
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
                  <EmptyState
                    icon={<Calendar className="w-8 h-8" />}
                    message="예정된 일정이 없습니다"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader
            icon={<BookOpen className="w-5 h-5" />}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/student/data")}
              >
                더보기
                <ChevronRight className="w-4 h-4" />
              </Button>
            }
          >
            최근 입력한 활동
          </CardHeader>
          <CardContent>
            {dashboard?.recentActivities && dashboard.recentActivities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboard.recentActivities.slice(0, 6).map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<BookOpen className="w-8 h-8" />}
                message="아직 입력한 활동이 없습니다"
                action={
                  <Button
                    size="sm"
                    onClick={() => router.push("/dashboard/student/data")}
                  >
                    활동 입력하기
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        {/* CTA Banner */}
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI 맞춤 분석 받기</h3>
                <p className="text-indigo-100 text-sm">
                  데이터를 기반으로 AI가 맞춤형 조언을 제공합니다
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="bg-white text-indigo-600 hover:bg-indigo-50 w-full sm:w-auto"
              onClick={() => router.push("/dashboard/student/ai")}
            >
              AI 조언 받기
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
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
        variant={
          task.status === "COMPLETED"
            ? "success"
            : task.status === "IN_PROGRESS"
            ? "warning"
            : "default"
        }
      >
        {task.status === "COMPLETED" ? "완료" : task.status === "IN_PROGRESS" ? "진행중" : "대기"}
      </Badge>
    </div>
  );
}

function ScheduleItem({ schedule }: { schedule: Schedule }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
      <div className="w-2 h-2 rounded-full bg-indigo-500" />
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

function ActivityItem({ activity }: { activity: Activity }) {
  const typeLabels: Record<string, string> = {
    GRADE: "성적",
    ACTIVITY: "활동",
    READING: "독서",
    VOLUNTEER: "봉사",
  };

  const typeColors: Record<string, string> = {
    GRADE: "bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400",
    ACTIVITY: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
    READING: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",
    VOLUNTEER: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400",
  };

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <Badge className={typeColors[activity.type] || "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}>
          {typeLabels[activity.type] || activity.type}
        </Badge>
        <span className="text-xs text-slate-400 dark:text-slate-500">{activity.createdAt}</span>
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{activity.title}</p>
    </div>
  );
}

function EmptyState({
  icon,
  message,
  action,
}: {
  icon: React.ReactNode;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
      {icon}
      <p className="mt-2 text-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
