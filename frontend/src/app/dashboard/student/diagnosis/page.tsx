"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap,
  Target,
  TrendingUp,
  School,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  LogOut,
  ChevronRight
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function DiagnosisPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [targetSchools, setTargetSchools] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
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
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      // 목표 학교
      const schoolsRes = await fetch("http://localhost:3000/api/diagnosis/target-schools", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (schoolsRes.ok) {
        const schools = await schoolsRes.json();
        setTargetSchools(Array.isArray(schools) ? schools : []);
      }

      // 진단 결과
      const resultsRes = await fetch("http://localhost:3000/api/diagnosis/results", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resultsRes.ok) {
        const data = await resultsRes.json();
        setResults(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDiagnosis = async () => {
    if (targetSchools.length === 0) {
      alert("먼저 목표 학교를 추가해주세요!");
      return;
    }

    setRunning(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:3000/api/diagnosis/run", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("진단이 완료되었습니다!");
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || "진단 실행에 실패했습니다");
      }
    } catch (error) {
      alert("진단 실행 중 오류가 발생했습니다");
    } finally {
      setRunning(false);
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
            <div className="flex items-center gap-6">
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => router.push("/dashboard/student")}
              >
                <GraduationCap className="w-8 h-8 text-sky-600" />
                <span className="text-xl font-bold text-gray-900">입시로드맵</span>
              </div>
              <nav className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => router.push("/dashboard/student")}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  대시보드
                </button>
                <button className="text-sm text-sky-600 font-semibold">
                  진단
                </button>
              </nav>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">입시 진단</h1>
          <p className="text-gray-600">목표 학교에 대한 합격 가능성을 진단합니다</p>
        </div>

        {/* Run Diagnosis Button */}
        <div className="bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">진단 실행</h2>
              <p className="text-sky-100">현재 입력된 데이터를 바탕으로 합격 가능성을 분석합니다</p>
            </div>
            <button
              onClick={handleRunDiagnosis}
              disabled={running || targetSchools.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white text-sky-600 rounded-lg font-semibold hover:bg-sky-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            >
              <Play className="w-5 h-5" />
              {running ? "진단 중..." : "진단 실행"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">로딩 중...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Target Schools */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">목표 학교</h3>
              {targetSchools.length === 0 ? (
                <div className="text-center py-8">
                  <School className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">목표 학교가 없습니다</p>
                  <p className="text-sm text-gray-400 mt-2">학교 정보 페이지에서 추가하세요</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {targetSchools.map((school) => (
                    <div
                      key={school.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-sky-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{school.school?.name || "학교명"}</h4>
                          <p className="text-sm text-gray-500">우선순위: {school.priority}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Diagnosis Results */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">진단 결과</h3>
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">진단 결과가 없습니다</p>
                  <p className="text-sm text-gray-400 mt-2">진단을 실행해주세요</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result) => (
                    <DiagnosisResultCard key={result.id} result={result} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function DiagnosisResultCard({ result }: { result: any }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SAFE":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "CHALLENGE":
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case "REACH":
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SAFE":
        return "bg-green-50 border-green-200";
      case "CHALLENGE":
        return "bg-yellow-50 border-yellow-200";
      case "REACH":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "SAFE":
        return "안전";
      case "CHALLENGE":
        return "적정";
      case "REACH":
        return "도전";
      default:
        return "분석 중";
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}>
      <div className="flex items-start gap-4">
        {getStatusIcon(result.status)}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{result.school?.name || "학교명"}</h4>
          <p className="text-sm text-gray-600 mt-1">
            상태: <span className="font-medium">{getStatusText(result.status)}</span>
          </p>
          {result.score && (
            <p className="text-sm text-gray-600">
              예상 점수: <span className="font-medium">{result.score}점</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

