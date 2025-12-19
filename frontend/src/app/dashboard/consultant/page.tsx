"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Star,
  Clock,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Video,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { getApiUrl } from "@/lib/api";
import { Card, CardHeader, CardContent, StatCard } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";

interface DashboardData {
  todayConsultations: Consultation[];
  pendingRequests: number;
  completedThisMonth: number;
  averageRating: number;
  upcomingConsultations: Consultation[];
  recentReviews: Review[];
}

interface Consultation {
  id: string;
  student: {
    id: string;
    name: string;
  };
  parent: {
    name: string;
  };
  scheduledAt: string;
  status: string;
  topic?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  studentName: string;
  createdAt: string;
}

export default function ConsultantDashboard() {
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
      const res = await fetch("${getApiUrl()}/api/consultant/dashboard", {
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

  const confirmConsultation = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`${getApiUrl()}/api/consultations/${id}/confirm`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDashboard();
    } catch (error) {
      console.error("Confirm error:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="success">확정</Badge>;
      case "PENDING":
        return <Badge variant="warning">대기</Badge>;
      case "COMPLETED":
        return <Badge variant="info">완료</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout requiredRole="CONSULTANT">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-8 text-white">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              안녕하세요, {user?.name || "컨설턴트"}님! 👋
            </h1>
            <p className="text-emerald-100 text-lg">
              오늘도 학생들의 미래를 함께 만들어가세요
            </p>
            {dashboard?.todayConsultations && dashboard.todayConsultations.length > 0 && (
              <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-md">
                <p className="text-sm font-medium mb-1">오늘 예정된 상담</p>
                <p className="text-2xl font-bold">{dashboard.todayConsultations.length}건</p>
              </div>
            )}
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            title="대기 중인 요청"
            value={dashboard?.pendingRequests || 0}
            suffix="건"
            color="amber"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="이번 달 상담"
            value={dashboard?.completedThisMonth || 0}
            suffix="건"
            color="emerald"
          />
          <StatCard
            icon={<Star className="w-6 h-6" />}
            title="평균 평점"
            value={dashboard?.averageRating?.toFixed(1) || "0.0"}
            suffix="점"
            color="amber"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="오늘 상담"
            value={dashboard?.todayConsultations?.length || 0}
            suffix="건"
            color="sky"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                icon={<Calendar className="w-5 h-5" />}
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/dashboard/consultant/consultations")}
                  >
                    전체 보기
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                }
              >
                오늘의 상담
              </CardHeader>
              <CardContent>
                {!dashboard?.todayConsultations || dashboard.todayConsultations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      오늘 예정된 상담이 없습니다
                    </h3>
                    <p className="text-sm text-slate-500">
                      대기 중인 상담 요청을 확인해보세요
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboard.todayConsultations.map((consultation) => (
                      <div
                        key={consultation.id}
                        className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
                        onClick={() =>
                          router.push(`/dashboard/consultant/consultations/${consultation.id}`)
                        }
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold">
                          {consultation.student.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">
                              {consultation.student.name}
                            </h3>
                            {getStatusBadge(consultation.status)}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {consultation.scheduledAt}
                            </span>
                            <span>{consultation.parent.name} 보호자</span>
                          </div>
                          {consultation.topic && (
                            <p className="text-sm text-slate-600 mt-1 truncate">
                              📋 {consultation.topic}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {consultation.status === "PENDING" && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmConsultation(consultation.id);
                              }}
                            >
                              확정
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Video className="w-4 h-4" />}
                          >
                            입장
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Consultations */}
            <Card className="mt-6">
              <CardHeader icon={<Clock className="w-5 h-5" />}>
                예정된 상담
              </CardHeader>
              <CardContent>
                {!dashboard?.upcomingConsultations || dashboard.upcomingConsultations.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">
                    예정된 상담이 없습니다
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.upcomingConsultations.slice(0, 5).map((consultation) => (
                      <div
                        key={consultation.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium">
                            {consultation.student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {consultation.student.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {consultation.scheduledAt}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(consultation.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader icon={<MessageSquare className="w-5 h-5" />}>
                빠른 메뉴
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/dashboard/consultant/consultations")}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    상담 관리
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/dashboard/consultant/students")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    학생 목록
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/dashboard/consultant/schedule")}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    일정 관리
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/dashboard/consultant/reports")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    리포트 작성
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader icon={<Star className="w-5 h-5" />}>
                최근 리뷰
              </CardHeader>
              <CardContent>
                {!dashboard?.recentReviews || dashboard.recentReviews.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">
                    아직 리뷰가 없습니다
                  </p>
                ) : (
                  <div className="space-y-4">
                    {dashboard.recentReviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900 text-sm">
                            {review.studentName}
                          </span>
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating ? "fill-current" : "text-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {review.comment}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{review.createdAt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
