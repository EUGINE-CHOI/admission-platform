"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Briefcase,
  Calendar,
  Users,
  FileText,
  LogOut,
  Clock,
  CheckCircle
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ConsultantDashboard() {
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
    if (parsedUser.role !== "CONSULTANT") {
      router.push("/login");
      return;
    }
    
    setUser(parsedUser);
    fetchDashboard();
  }, [router]);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:3000/api/consultant/dashboard", {
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">컨설턴트 대시보드</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.name} 컨설턴트</span>
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
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            안녕하세요, {user.name}님! 💼
          </h1>
          <p className="text-emerald-100">
            오늘도 학생들의 꿈을 함께 만들어가세요
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Calendar}
            title="예정된 상담"
            value={dashboard?.upcomingConsultations || 0}
            color="emerald"
          />
          <StatCard
            icon={CheckCircle}
            title="완료된 상담"
            value={dashboard?.completedConsultations || 0}
            color="teal"
          />
          <StatCard
            icon={Users}
            title="담당 학생"
            value={dashboard?.totalStudents || 0}
            color="cyan"
          />
          <StatCard
            icon={FileText}
            title="작성한 리포트"
            value={dashboard?.totalReports || 0}
            color="blue"
          />
        </div>

        {/* Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">오늘의 상담</h2>
            </div>
            <div className="space-y-3">
              {dashboard?.todayConsultations?.length > 0 ? (
                dashboard.todayConsultations.map((consultation: any, i: number) => (
                  <ConsultationItem key={i} consultation={consultation} />
                ))
              ) : (
                <p className="text-gray-500 text-sm py-4 text-center">
                  오늘 예정된 상담이 없습니다
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">대기 중인 리포트</h2>
            </div>
            <div className="space-y-3">
              {dashboard?.pendingReports?.length > 0 ? (
                dashboard.pendingReports.map((report: any, i: number) => (
                  <ReportItem key={i} report={report} />
                ))
              ) : (
                <p className="text-gray-500 text-sm py-4 text-center">
                  작성 대기 중인 리포트가 없습니다
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Swagger Link */}
        <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <p className="text-sm text-emerald-700">
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

function StatCard({ icon: Icon, title, value, color }: {
  icon: any;
  title: string;
  value: number;
  color: "emerald" | "teal" | "cyan" | "blue";
}) {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-600",
    teal: "bg-teal-100 text-teal-600",
    cyan: "bg-cyan-100 text-cyan-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ConsultationItem({ consultation }: { consultation: any }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        <div>
          <p className="text-sm font-medium text-gray-700">
            {consultation.studentName || consultation.topic || "상담"}
          </p>
          <p className="text-xs text-gray-500">{consultation.time || ""}</p>
        </div>
      </div>
      <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">
        예정
      </span>
    </div>
  );
}

function ReportItem({ report }: { report: any }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="text-sm font-medium text-gray-700">{report.studentName || report}</p>
        <p className="text-xs text-gray-500">{report.date || "작성 필요"}</p>
      </div>
      <button className="text-xs bg-teal-100 text-teal-600 px-3 py-1 rounded-full hover:bg-teal-200 transition-colors">
        작성하기
      </button>
    </div>
  );
}



