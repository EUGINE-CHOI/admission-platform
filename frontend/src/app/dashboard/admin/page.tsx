"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  School,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  CreditCard,
  Sparkles,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Target,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent, StatCard } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";

interface StatsOverview {
  totalUsers: number;
  activeUsers: number;
  totalStudents: number;
  totalParents: number;
  totalConsultants: number;
  pendingConsultants: number;
  totalSchools: number;
  totalDiagnoses: number;
}

interface KPIData {
  activityRate: number;
  diagnosisRate: number;
  conversionRate: number;
  taskCompletionRate: number;
}

interface AIQuality {
  averageScore: number;
  positiveRate: number;
  totalOutputs: number;
  alerts: Alert[];
}

interface Alert {
  id: string;
  type: string;
  message: string;
  severity: "low" | "medium" | "high";
}

interface RecentEvent {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [kpi, setKpi] = useState<KPIData | null>(null);
  const [aiQuality, setAiQuality] = useState<AIQuality | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, kpiRes, aiRes, eventsRes] = await Promise.all([
        fetch("http://localhost:3000/api/admin/stats/overview", { headers }),
        fetch("http://localhost:3000/api/admin/kpi", { headers }),
        fetch("http://localhost:3000/api/admin/ai/quality", { headers }),
        fetch("http://localhost:3000/api/admin/stats/events", { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (kpiRes.ok) setKpi(await kpiRes.json());
      if (aiRes.ok) setAiQuality(await aiRes.json());
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setRecentEvents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-amber-600 bg-amber-100";
      default:
        return "text-slate-600 bg-slate-100";
    }
  };

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">관리자 대시보드</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              시스템 현황과 핵심 지표를 확인하세요
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchData}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            새로고침
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* User Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Users className="w-6 h-6" />}
                title="전체 사용자"
                value={stats?.totalUsers || 0}
                suffix="명"
                color="sky"
              />
              <StatCard
                icon={<Activity className="w-6 h-6" />}
                title="활성 사용자"
                value={stats?.activeUsers || 0}
                suffix="명"
                color="emerald"
              />
              <StatCard
                icon={<UserCheck className="w-6 h-6" />}
                title="승인 대기 컨설턴트"
                value={stats?.pendingConsultants || 0}
                suffix="명"
                color="amber"
              />
              <StatCard
                icon={<School className="w-6 h-6" />}
                title="등록된 학교"
                value={stats?.totalSchools || 0}
                suffix="개"
                color="indigo"
              />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="활동 입력률"
                value={kpi?.activityRate || 0}
                icon={<BookOpen className="w-5 h-5" />}
                trend={5}
                color="sky"
              />
              <KPICard
                title="진단 실행률"
                value={kpi?.diagnosisRate || 0}
                icon={<Target className="w-5 h-5" />}
                trend={-2}
                color="indigo"
              />
              <KPICard
                title="프리미엄 전환률"
                value={kpi?.conversionRate || 0}
                icon={<CreditCard className="w-5 h-5" />}
                trend={3}
                color="emerald"
              />
              <KPICard
                title="태스크 완료율"
                value={kpi?.taskCompletionRate || 0}
                icon={<CheckCircle className="w-5 h-5" />}
                trend={8}
                color="amber"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Breakdown */}
              <Card>
                <CardHeader icon={<Users className="w-5 h-5" />}>
                  사용자 구성
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <UserTypeBar
                      label="학생"
                      count={stats?.totalStudents || 0}
                      total={stats?.totalUsers || 1}
                      color="sky"
                    />
                    <UserTypeBar
                      label="보호자"
                      count={stats?.totalParents || 0}
                      total={stats?.totalUsers || 1}
                      color="indigo"
                    />
                    <UserTypeBar
                      label="컨설턴트"
                      count={stats?.totalConsultants || 0}
                      total={stats?.totalUsers || 1}
                      color="emerald"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* AI Quality */}
              <Card>
                <CardHeader
                  icon={<Sparkles className="w-5 h-5" />}
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/dashboard/admin/ai-quality")}
                    >
                      자세히
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  }
                >
                  AI 품질
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white mb-3">
                      <span className="text-3xl font-bold">
                        {aiQuality?.averageScore?.toFixed(1) || "0"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">평균 품질 점수</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {aiQuality?.positiveRate || 0}%
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">긍정 피드백</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {aiQuality?.totalOutputs || 0}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">총 생성 수</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card>
                <CardHeader icon={<AlertCircle className="w-5 h-5" />}>
                  시스템 알림
                </CardHeader>
                <CardContent>
                  {!aiQuality?.alerts || aiQuality.alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">
                        현재 알림이 없습니다
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {aiQuality.alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-xl ${getSeverityColor(alert.severity)}`}
                        >
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">{alert.type}</p>
                              <p className="text-xs opacity-80">{alert.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Recent Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader icon={<BarChart3 className="w-5 h-5" />}>
                  빠른 메뉴
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <QuickActionButton
                      icon={<UserCheck className="w-5 h-5" />}
                      label="컨설턴트 승인"
                      count={stats?.pendingConsultants}
                      onClick={() => router.push("/dashboard/admin/consultants")}
                    />
                    <QuickActionButton
                      icon={<Users className="w-5 h-5" />}
                      label="사용자 관리"
                      onClick={() => router.push("/dashboard/admin/users")}
                    />
                    <QuickActionButton
                      icon={<School className="w-5 h-5" />}
                      label="학교 관리"
                      onClick={() => router.push("/dashboard/admin/schools")}
                    />
                    <QuickActionButton
                      icon={<CreditCard className="w-5 h-5" />}
                      label="결제 관리"
                      onClick={() => router.push("/dashboard/admin/payments")}
                    />
                    <QuickActionButton
                      icon={<Sparkles className="w-5 h-5" />}
                      label="AI 품질 관리"
                      onClick={() => router.push("/dashboard/admin/ai-quality")}
                    />
                    <QuickActionButton
                      icon={<BarChart3 className="w-5 h-5" />}
                      label="상세 통계"
                      onClick={() => router.push("/dashboard/admin/stats")}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Events */}
              <Card>
                <CardHeader icon={<Activity className="w-5 h-5" />}>
                  최근 활동
                </CardHeader>
                <CardContent>
                  {recentEvents.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                      최근 활동이 없습니다
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentEvents.slice(0, 6).map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                        >
                          <div className="w-2 h-2 rounded-full bg-sky-500 mt-2" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-900 dark:text-slate-100 truncate">
                              {event.description}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{event.createdAt}</p>
                          </div>
                          <Badge variant="outline" size="sm">
                            {event.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function KPICard({
  title,
  value,
  icon,
  trend,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  color: "sky" | "indigo" | "emerald" | "amber";
}) {
  const colors = {
    sky: "from-sky-500 to-sky-600",
    indigo: "from-indigo-500 to-indigo-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
  };

  return (
    <Card className={`bg-gradient-to-br ${colors[color]} text-white border-0`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}%</p>
        </div>
        <div className="p-2 bg-white/20 rounded-lg">{icon}</div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-3 text-sm">
          {trend >= 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{trend >= 0 ? "+" : ""}{trend}% 지난 주 대비</span>
        </div>
      )}
    </Card>
  );
}

function UserTypeBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: "sky" | "indigo" | "emerald";
}) {
  const percentage = Math.round((count / total) * 100);
  const colors = {
    sky: "bg-sky-500",
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-medium text-slate-900 dark:text-slate-100">{count}명</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function QuickActionButton({
  icon,
  label,
  count,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-left"
    >
      <div className="text-slate-600 dark:text-slate-400">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
        {count !== undefined && count > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400">{count}건 대기</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400" />
    </button>
  );
}
