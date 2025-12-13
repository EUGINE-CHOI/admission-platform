"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  FileText,
  Bell,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Target,
  BookOpen,
  CreditCard,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent, StatCard } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";

interface Child {
  id: string;
  name: string;
  grade: string;
  targetSchoolCount: number;
  pendingApprovals: number;
  planProgress: number;
}

interface DashboardData {
  children: Child[];
  upcomingSchedules: Schedule[];
  pendingApprovals: Approval[];
  recentReports: Report[];
}

interface Schedule {
  id: string;
  title: string;
  date: string;
  childName: string;
}

interface Approval {
  id: string;
  type: string;
  title: string;
  childName: string;
  createdAt: string;
}

interface Report {
  id: string;
  title: string;
  childName: string;
  createdAt: string;
}

export default function ParentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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
      const res = await fetch("http://localhost:3000/api/dashboard/parent", {
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

  const children = dashboard?.children || [];
  const pendingCount = children.reduce((sum, c) => sum + c.pendingApprovals, 0);

  return (
    <DashboardLayout requiredRole="PARENT">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-8 text-white">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              안녕하세요, {user?.name || "보호자"}님! 👋
            </h1>
            <p className="text-indigo-100 text-lg">
              자녀의 입시 준비 현황을 한눈에 확인하세요
            </p>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="등록된 자녀"
            value={children.length}
            suffix="명"
            color="indigo"
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            title="승인 대기"
            value={pendingCount}
            suffix="건"
            color="amber"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            title="목표 학교"
            value={children.reduce((sum, c) => sum + c.targetSchoolCount, 0)}
            suffix="개"
            color="sky"
          />
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            title="받은 리포트"
            value={dashboard?.recentReports?.length || 0}
            suffix="개"
            color="emerald"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Children List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                icon={<Users className="w-5 h-5" />}
                action={
                  <Button variant="ghost" size="sm">
                    자녀 추가
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                }
              >
                자녀 현황
              </CardHeader>
              <CardContent>
                {children.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      등록된 자녀가 없습니다
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      자녀의 초대 코드를 입력하여 연결하세요
                    </p>
                    <Button>자녀 연결하기</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {children.map((child) => (
                      <div
                        key={child.id}
                        className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => router.push(`/dashboard/parent/child/${child.id}`)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                              {child.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                {child.name}
                              </h3>
                              <p className="text-sm text-slate-500">{child.grade}</p>
                            </div>
                          </div>
                          {child.pendingApprovals > 0 && (
                            <Badge variant="warning">
                              승인 대기 {child.pendingApprovals}건
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-2 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500">목표 학교</p>
                            <p className="text-lg font-bold text-slate-900">
                              {child.targetSchoolCount}
                            </p>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500">플랜 진행률</p>
                            <p className="text-lg font-bold text-indigo-600">
                              {child.planProgress}%
                            </p>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500">승인 대기</p>
                            <p className="text-lg font-bold text-amber-600">
                              {child.pendingApprovals}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pending Approvals */}
            <Card>
              <CardHeader icon={<CheckCircle className="w-5 h-5" />}>
                승인 대기 항목
              </CardHeader>
              <CardContent>
                {dashboard?.pendingApprovals?.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">
                    승인 대기 중인 항목이 없습니다
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboard?.pendingApprovals?.slice(0, 5).map((approval) => (
                      <div
                        key={approval.id}
                        className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {approval.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {approval.childName} · {approval.type}
                          </p>
                        </div>
                        <Button size="sm">승인</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Schedules */}
            <Card>
              <CardHeader icon={<Calendar className="w-5 h-5" />}>
                다가오는 일정
              </CardHeader>
              <CardContent>
                {dashboard?.upcomingSchedules?.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">
                    예정된 일정이 없습니다
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboard?.upcomingSchedules?.slice(0, 5).map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                      >
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {schedule.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {schedule.childName} · {schedule.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            hover
            className="cursor-pointer"
            onClick={() => router.push("/dashboard/parent/subscription")}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">구독 관리</h3>
                <p className="text-sm text-slate-500">플랜 확인 및 변경</p>
              </div>
            </div>
          </Card>
          <Card
            hover
            className="cursor-pointer"
            onClick={() => router.push("/dashboard/parent/reports")}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">리포트 보기</h3>
                <p className="text-sm text-slate-500">상담 및 진단 리포트</p>
              </div>
            </div>
          </Card>
          <Card
            hover
            className="cursor-pointer"
            onClick={() => router.push("/dashboard/parent/calendar")}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">일정 캘린더</h3>
                <p className="text-sm text-slate-500">입시 일정 관리</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
