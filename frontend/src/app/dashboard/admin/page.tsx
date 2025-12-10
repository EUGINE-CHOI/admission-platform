"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  TrendingUp, 
  LogOut,
  BarChart3,
  Brain,
  CreditCard
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "ADMIN") {
      router.push("/login");
      return;
    }
    
    setUser(parsedUser);
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:3000/api/admin/stats/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Stats fetch error:", error);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">관리자 대시보드</span>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          안녕하세요, {user.name}님! 👋
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="전체 사용자"
            value={stats?.totalUsers || 0}
            color="blue"
          />
          <StatCard
            icon={Activity}
            title="오늘 활성 사용자"
            value={stats?.activeToday || 0}
            color="green"
          />
          <StatCard
            icon={Brain}
            title="AI 사용량"
            value={stats?.aiUsage || 0}
            color="purple"
          />
          <StatCard
            icon={CreditCard}
            title="프리미엄 구독자"
            value={stats?.premiumUsers || 0}
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickAction
              icon={Users}
              title="사용자 통계"
              description="사용자 현황 상세 보기"
              onClick={() => window.open("http://localhost:3000/api-docs", "_blank")}
            />
            <QuickAction
              icon={BarChart3}
              title="KPI 대시보드"
              description="핵심 지표 분석"
              onClick={() => window.open("http://localhost:3000/api-docs", "_blank")}
            />
            <QuickAction
              icon={TrendingUp}
              title="AI 품질 분석"
              description="AI 출력 품질 모니터링"
              onClick={() => window.open("http://localhost:3000/api-docs", "_blank")}
            />
          </div>
        </div>

        {/* Swagger Link */}
        <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
          <p className="text-sm text-indigo-700">
            💡 <strong>Tip:</strong> 전체 API 문서는{" "}
            <a
              href="http://localhost:3000/api-docs"
              target="_blank"
              className="underline font-semibold"
            >
              Swagger UI
            </a>
            에서 확인할 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }: {
  icon: any;
  title: string;
  value: number;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, title, description, onClick }: {
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left"
    >
      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </button>
  );
}



