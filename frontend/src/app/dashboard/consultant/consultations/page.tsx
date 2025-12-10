"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Briefcase,
  Calendar,
  User,
  Clock,
  FileText,
  LogOut,
  CheckCircle,
  XCircle,
  MessageSquare,
  Send
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ConsultationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    fetchConsultations();
  }, [router]);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:3000/api/consultations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConsultations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:3000/api/consultations/${id}/confirm`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchConsultations();
      }
    } catch (error) {
      console.error("Confirm error:", error);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:3000/api/consultations/${id}/complete`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("상담이 완료되었습니다!");
        fetchConsultations();
      }
    } catch (error) {
      console.error("Complete error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null;

  const selectedConsultation = selectedId 
    ? consultations.find(c => c.id === selectedId)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => router.push("/dashboard/consultant")}
              >
                <Briefcase className="w-8 h-8 text-emerald-600" />
                <span className="text-xl font-bold text-gray-900">컨설턴트 대시보드</span>
              </div>
              <nav className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => router.push("/dashboard/consultant")}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  대시보드
                </button>
                <button className="text-sm text-emerald-600 font-semibold">
                  상담 관리
                </button>
              </nav>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">상담 관리</h1>
          <p className="text-gray-600">예약된 상담을 관리하고 리포트를 작성하세요</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">로딩 중...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Consultations List */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">상담 목록</h2>
              {consultations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">상담이 없습니다</p>
              ) : (
                <div className="space-y-3">
                  {consultations.map((consultation) => (
                    <ConsultationListItem
                      key={consultation.id}
                      consultation={consultation}
                      isSelected={selectedId === consultation.id}
                      onClick={() => setSelectedId(consultation.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Consultation Detail */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {selectedConsultation ? (
                <ConsultationDetail
                  consultation={selectedConsultation}
                  onConfirm={() => handleConfirm(selectedConsultation.id)}
                  onComplete={() => handleComplete(selectedConsultation.id)}
                  onCreateReport={() => router.push(`/dashboard/consultant/report/${selectedConsultation.id}`)}
                />
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">상담을 선택하세요</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ConsultationListItem({ consultation, isSelected, onClick }: {
  consultation: any;
  isSelected: boolean;
  onClick: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "bg-green-100 text-green-600";
      case "COMPLETED": return "bg-blue-100 text-blue-600";
      case "PENDING": return "bg-yellow-100 text-yellow-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "확정";
      case "COMPLETED": return "완료";
      case "PENDING": return "대기";
      case "REJECTED": return "거절";
      case "CANCELLED": return "취소";
      default: return status;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg border text-left transition-all ${
        isSelected
          ? "border-emerald-500 bg-emerald-50"
          : "border-gray-200 hover:border-emerald-300"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{consultation.topic || "상담"}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(consultation.status)}`}>
          {getStatusText(consultation.status)}
        </span>
      </div>
      <p className="text-sm text-gray-600">{consultation.student?.name || "학생"}</p>
      <p className="text-xs text-gray-400 mt-1">
        {consultation.scheduledAt ? new Date(consultation.scheduledAt).toLocaleDateString() : "일정 미정"}
      </p>
    </button>
  );
}

function ConsultationDetail({ consultation, onConfirm, onComplete, onCreateReport }: {
  consultation: any;
  onConfirm: () => void;
  onComplete: () => void;
  onCreateReport: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{consultation.topic || "상담 상세"}</h2>
        <div className="flex items-center gap-2">
          {consultation.status === "PENDING" && (
            <button
              onClick={onConfirm}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              승인
            </button>
          )}
          {consultation.status === "CONFIRMED" && (
            <button
              onClick={onComplete}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              완료
            </button>
          )}
          {consultation.status === "COMPLETED" && (
            <button
              onClick={onCreateReport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              리포트 작성
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <InfoRow icon={User} label="학생" value={consultation.student?.name || "-"} />
        <InfoRow 
          icon={Calendar} 
          label="일정" 
          value={consultation.scheduledAt ? new Date(consultation.scheduledAt).toLocaleString() : "미정"} 
        />
        <InfoRow icon={MessageSquare} label="상담 주제" value={consultation.topic || "-"} />
        
        {consultation.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">상담 노트</h3>
            <p className="text-sm text-gray-600">{consultation.notes}</p>
          </div>
        )}

        {consultation.report && (
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h3 className="font-semibold text-gray-900 mb-2">작성된 리포트</h3>
            <p className="text-sm text-gray-600">{consultation.report.summary || "리포트가 작성되었습니다"}</p>
            <button
              onClick={onCreateReport}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              리포트 보기 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <Icon className="w-5 h-5 text-gray-400" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}



