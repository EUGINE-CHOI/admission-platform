"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap,
  BookOpen,
  Trophy,
  Calendar,
  LogOut,
  Target,
  TrendingUp,
  Clock,
  Users
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "STUDENT") {
      router.push("/login");
      return;
    }
    
    setUser(parsedUser);
    fetchDashboard();
  }, [router]);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:3000/api/dashboard/student", {
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-sky-600" />
              <span className="text-xl font-bold text-gray-900">입시로드맵</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.name} 학생</span>
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
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            안녕하세요, {user.name}님! 🎓
          </h1>
          <p className="text-sky-100">
            오늘도 목표를 향해 한 걸음 더 나아가세요!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            title="입력한 활동"
            value={dashboard?.activityCount || 0}
            suffix="개"
            color="sky"
          />
          <StatCard
            icon={Target}
            title="목표 학교"
            value={dashboard?.targetSchoolCount || 0}
            suffix="개"
            color="indigo"
          />
          <StatCard
            icon={Trophy}
            title="완료한 태스크"
            value={dashboard?.completedTasks || 0}
            suffix="개"
            color="amber"
          />
          <StatCard
            icon={TrendingUp}
            title="진단 점수"
            value={dashboard?.latestScore || "-"}
            suffix="점"
            color="emerald"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <QuickActionCard
            icon={BookOpen}
            title="데이터 입력"
            description="성적, 활동, 독서 등 입력"
            color="sky"
            onClick={() => router.push("/dashboard/student/data")}
          />
          <QuickActionCard
            icon={Target}
            title="진단 실행"
            description="입시 진단 받기"
            color="indigo"
            onClick={() => router.push("/dashboard/student/diagnosis")}
          />
          <QuickActionCard
            icon={TrendingUp}
            title="AI 조언"
            description="AI 맞춤 조언"
            color="purple"
            onClick={() => router.push("/dashboard/student/ai")}
          />
          <QuickActionCard
            icon={Calendar}
            title="실행 계획"
            description="태스크 관리"
            color="emerald"
            onClick={() => router.push("/dashboard/student/tasks")}
          />
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => router.push("/dashboard/student/consultation")}
            className="p-6 rounded-xl border-2 border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-rose-300 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">상담 예약</h3>
                <p className="text-sm text-gray-500">전문 컨설턴트와 1:1 상담</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => window.open("http://localhost:3000/api-docs", "_blank")}
            className="p-6 rounded-xl border-2 border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-amber-300 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">API 문서</h3>
                <p className="text-sm text-gray-500">Swagger UI (개발자용)</p>
              </div>
            </div>
          </button>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 오늘의 할 일 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-sky-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">오늘의 할 일</h2>
            </div>
            <div className="space-y-3">
              {dashboard?.todayTasks?.length > 0 ? (
                dashboard.todayTasks.map((task: any, i: number) => (
                  <TaskItem key={i} task={task} />
                ))
              ) : (
                <p className="text-gray-500 text-sm py-4 text-center">
                  오늘 예정된 태스크가 없습니다
                </p>
              )}
            </div>
          </div>

          {/* 다가오는 일정 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">다가오는 일정</h2>
            </div>
            <div className="space-y-3">
              {dashboard?.upcomingSchedules?.length > 0 ? (
                dashboard.upcomingSchedules.map((schedule: any, i: number) => (
                  <ScheduleItem key={i} schedule={schedule} />
                ))
              ) : (
                <p className="text-gray-500 text-sm py-4 text-center">
                  예정된 일정이 없습니다
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Swagger Link */}
        <div className="mt-8 p-4 bg-sky-50 rounded-xl border border-sky-200">
          <p className="text-sm text-sky-700">
            💡 <strong>개발자 모드:</strong> API 테스트는{" "}
            <a
              href="http://localhost:3000/api-docs"
              target="_blank"
              className="underline font-semibold"
            >
              Swagger UI
            </a>
            에서 할 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, suffix, color }: {
  icon: any;
  title: string;
  value: number | string;
  suffix: string;
  color: "sky" | "indigo" | "amber" | "emerald";
}) {
  const colors = {
    sky: "bg-sky-100 text-sky-600",
    indigo: "bg-indigo-100 text-indigo-600",
    amber: "bg-amber-100 text-amber-600",
    emerald: "bg-emerald-100 text-emerald-600",
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

function TaskItem({ task }: { task: any }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
      <span className="text-sm text-gray-700">{task.title || task}</span>
    </div>
  );
}

function ScheduleItem({ schedule }: { schedule: any }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="w-2 h-2 rounded-full bg-indigo-500" />
      <div>
        <p className="text-sm font-medium text-gray-700">{schedule.title || schedule}</p>
        <p className="text-xs text-gray-500">{schedule.date || ""}</p>
      </div>
    </div>
  );
}

function QuickActionCard({ icon: Icon, title, description, color, onClick }: {
  icon: any;
  title: string;
  description: string;
  color: "sky" | "indigo" | "purple" | "emerald";
  onClick: () => void;
}) {
  const colors = {
    sky: "bg-sky-100 text-sky-600 hover:bg-sky-200",
    indigo: "bg-indigo-100 text-indigo-600 hover:bg-indigo-200",
    purple: "bg-purple-100 text-purple-600 hover:bg-purple-200",
    emerald: "bg-emerald-100 text-emerald-600 hover:bg-emerald-200",
  };

  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-xl border-2 border-transparent hover:border-gray-300 transition-all text-left bg-white shadow-sm hover:shadow-md`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </button>
  );
}

