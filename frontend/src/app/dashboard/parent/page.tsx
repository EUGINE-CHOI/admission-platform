"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users,
  GraduationCap,
  Calendar,
  FileText,
  LogOut,
  ChevronRight,
  Bell
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ParentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
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
  }, [router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      
      // 대시보드 데이터
      const dashRes = await fetch("http://localhost:3000/api/dashboard/parent", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (dashRes.ok) {
        const data = await dashRes.json();
        setDashboard(data);
      }

      // 자녀 목록
      const childRes = await fetch("http://localhost:3000/api/family/children", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (childRes.ok) {
        const data = await childRes.json();
        setChildren(data);
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
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-rose-600" />
              <span className="text-xl font-bold text-gray-900">입시로드맵</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              </button>
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
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            안녕하세요, {user.name}님! 👨‍👩‍👧
          </h1>
          <p className="text-rose-100">
            자녀의 입시 준비 현황을 확인하세요
          </p>
        </div>

        {/* Children List */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">내 자녀</h2>
          {children.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => (
                <ChildCard key={child.id} child={child} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">연결된 자녀가 없습니다</p>
              <p className="text-sm text-gray-400">
                자녀 계정에서 가족 초대 코드를 받아 연결하세요
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 상담 예약 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-rose-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">상담 예약</h2>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              전문 컨설턴트와 1:1 상담을 예약하세요
            </p>
            <button className="w-full py-3 bg-rose-50 text-rose-600 rounded-lg font-medium hover:bg-rose-100 transition-colors">
              상담 예약하기
            </button>
          </div>

          {/* 리포트 확인 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">리포트</h2>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              상담 리포트와 진단 결과를 확인하세요
            </p>
            <button className="w-full py-3 bg-amber-50 text-amber-600 rounded-lg font-medium hover:bg-amber-100 transition-colors">
              리포트 보기
            </button>
          </div>
        </div>

        {/* Swagger Link */}
        <div className="mt-8 p-4 bg-rose-50 rounded-xl border border-rose-200">
          <p className="text-sm text-rose-700">
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

function ChildCard({ child }: { child: any }) {
  const router = useRouter();
  
  return (
    <div 
      onClick={() => router.push(`/dashboard/parent/child/${child.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-rose-300 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white font-bold text-lg">
            {child.name?.charAt(0) || "?"}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{child.name}</h3>
            <p className="text-sm text-gray-500">{child.schoolGrade || "정보 없음"}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}

