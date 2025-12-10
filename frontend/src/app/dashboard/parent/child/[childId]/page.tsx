"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  GraduationCap,
  BookOpen,
  Trophy,
  Calendar,
  TrendingUp,
  LogOut,
  ArrowLeft,
  User,
  Target
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ChildDetailPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.childId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [child, setChild] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "PARENT") {
      router.push("/login");
      return;
    }
    
    setUser(parsedUser);
    fetchData();
  }, [router, childId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      // 자녀 정보
      const childRes = await fetch(`http://localhost:3000/api/family/children/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (childRes.ok) {
        const data = await childRes.json();
        setChild(data);
      }

      // 자녀 대시보드
      const dashRes = await fetch(`http://localhost:3000/api/dashboard/parent/children/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (dashRes.ok) {
        const data = await dashRes.json();
        setDashboard(data);
      }
    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => router.push("/dashboard/parent")}
              >
                <GraduationCap className="w-8 h-8 text-rose-600" />
                <span className="text-xl font-bold text-gray-900">입시로드맵</span>
              </div>
              <button
                onClick={() => router.push("/dashboard/parent")}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                뒤로 가기
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.name}님</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">로딩 중...</p>
          </div>
        ) : child ? (
          <>
            {/* Child Info Header */}
            <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl p-8 text-white mb-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold">
                  {child.name?.charAt(0) || "?"}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{child.name}</h1>
                  <p className="text-rose-100">{child.schoolGrade || "학년 정보 없음"}</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={BookOpen}
                title="입력한 활동"
                value={dashboard?.activityCount || 0}
                suffix="개"
                color="rose"
              />
              <StatCard
                icon={Target}
                title="목표 학교"
                value={dashboard?.targetSchoolCount || 0}
                suffix="개"
                color="amber"
              />
              <StatCard
                icon={Trophy}
                title="완료한 태스크"
                value={dashboard?.completedTasks || 0}
                suffix="개"
                color="emerald"
              />
              <StatCard
                icon={TrendingUp}
                title="진단 점수"
                value={dashboard?.latestScore || "-"}
                suffix="점"
                color="indigo"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ActionCard
                icon={BookOpen}
                title="활동 기록 보기"
                description="자녀의 학업 및 비교과 활동 확인"
                onClick={() => router.push(`/dashboard/parent/child/${childId}/activities`)}
              />
              <ActionCard
                icon={TrendingUp}
                title="진단 결과 보기"
                description="입시 진단 및 분석 결과 확인"
                onClick={() => router.push(`/dashboard/parent/child/${childId}/diagnosis`)}
              />
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">최근 활동</h2>
              {dashboard?.recentActivities?.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.recentActivities.map((activity: any, i: number) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900">{activity.activityName || activity.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{activity.description || activity.role}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">최근 활동이 없습니다</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">자녀 정보를 찾을 수 없습니다</p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, suffix, color }: {
  icon: any;
  title: string;
  value: number | string;
  suffix: string;
  color: "rose" | "amber" | "emerald" | "indigo";
}) {
  const colors = {
    rose: "bg-rose-100 text-rose-600",
    amber: "bg-amber-100 text-amber-600",
    emerald: "bg-emerald-100 text-emerald-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}<span className="text-lg font-normal text-gray-400 ml-1">{suffix}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, onClick }: {
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-6 rounded-xl border-2 border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-rose-300 transition-all text-left"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
          <Icon className="w-6 h-6 text-rose-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );
}



