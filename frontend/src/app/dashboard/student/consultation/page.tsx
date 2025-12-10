"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap,
  Calendar,
  User,
  Clock,
  FileText,
  LogOut,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ConsultationPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

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
      
      // 내 상담 목록
      const consultRes = await fetch("http://localhost:3000/api/consultations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (consultRes.ok) {
        const data = await consultRes.json();
        setConsultations(Array.isArray(data) ? data : []);
      }

      // 컨설턴트 목록
      const consultantsRes = await fetch("http://localhost:3000/api/consultants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (consultantsRes.ok) {
        const data = await consultantsRes.json();
        setConsultants(Array.isArray(data) ? data : []);
      }

      // 받은 리포트
      const reportsRes = await fetch("http://localhost:3000/api/reports/received", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReports(Array.isArray(data) ? data : []);
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
                  상담
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">상담</h1>
          <p className="text-gray-600">전문 컨설턴트와 1:1 상담을 받으세요</p>
        </div>

        {/* Booking Button */}
        <div className="bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">상담 예약</h2>
              <p className="text-sky-100">전문 컨설턴트와 입시 전략을 상담하세요</p>
            </div>
            <button
              onClick={() => setShowBooking(!showBooking)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-sky-600 rounded-lg font-semibold hover:bg-sky-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {showBooking ? "취소" : "예약하기"}
            </button>
          </div>
        </div>

        {/* Booking Form */}
        {showBooking && consultants.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">컨설턴트 선택</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultants.map((consultant) => (
                <ConsultantCard key={consultant.id} consultant={consultant} />
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">로딩 중...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Consultations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">내 상담</h3>
              {consultations.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">예약된 상담이 없습니다</p>
                  <p className="text-sm text-gray-400 mt-2">상단의 예약하기 버튼을 클릭하세요</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {consultations.map((consultation) => (
                    <ConsultationCard key={consultation.id} consultation={consultation} />
                  ))}
                </div>
              )}
            </div>

            {/* Received Reports */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">받은 리포트</h3>
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">받은 리포트가 없습니다</p>
                  <p className="text-sm text-gray-400 mt-2">상담 완료 후 리포트를 받을 수 있습니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <ReportCard key={report.id} report={report} />
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

function ConsultantCard({ consultant }: { consultant: any }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-sky-300 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-indigo-400 flex items-center justify-center text-white font-bold text-lg">
          {consultant.user?.name?.charAt(0) || "C"}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{consultant.user?.name || "컨설턴트"}</h4>
          <p className="text-sm text-gray-500">{consultant.specialization || "입시 전문"}</p>
        </div>
      </div>
    </div>
  );
}

function ConsultationCard({ consultation }: { consultation: any }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "확정";
      case "REJECTED":
        return "거절됨";
      case "COMPLETED":
        return "완료";
      case "PENDING":
        return "대기 중";
      case "CANCELLED":
        return "취소됨";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-50 border-green-200";
      case "REJECTED":
        return "bg-red-50 border-red-200";
      case "COMPLETED":
        return "bg-blue-50 border-blue-200";
      case "PENDING":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${getStatusColor(consultation.status)}`}>
      <div className="flex items-start gap-3">
        {getStatusIcon(consultation.status)}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{consultation.topic || "상담"}</h4>
            <span className="text-xs font-medium">{getStatusText(consultation.status)}</span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{consultation.consultant?.user?.name || "컨설턴트"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{consultation.scheduledAt ? new Date(consultation.scheduledAt).toLocaleDateString() : "미정"}</span>
            </div>
            {consultation.scheduledAt && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{new Date(consultation.scheduledAt).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ report }: { report: any }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors cursor-pointer">
      <div className="flex items-start gap-3">
        <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{report.consultation?.topic || "상담 리포트"}</h4>
          <p className="text-sm text-gray-600 mt-1">
            작성자: {report.consultation?.consultant?.user?.name || "컨설턴트"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {report.sharedAt ? new Date(report.sharedAt).toLocaleDateString() : "공유됨"}
          </p>
        </div>
      </div>
    </div>
  );
}



