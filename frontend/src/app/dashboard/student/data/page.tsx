"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap,
  BookOpen,
  Trophy,
  Calendar,
  Heart,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Save,
  X
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

type DataType = "grades" | "activities" | "readings" | "attendances" | "volunteers";

export default function StudentDataPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<DataType>("grades");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
    fetchData("grades");
  }, [router]);

  const fetchData = async (type: DataType) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:3000/api/student/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        setData(Array.isArray(result) ? result : []);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Data fetch error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (type: DataType) => {
    setActiveTab(type);
    setShowForm(false);
    setEditingId(null);
    fetchData(type);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null;

  const tabs = [
    { id: "grades" as DataType, label: "성적", icon: GraduationCap },
    { id: "activities" as DataType, label: "활동", icon: Trophy },
    { id: "readings" as DataType, label: "독서", icon: BookOpen },
    { id: "attendances" as DataType, label: "출결", icon: Calendar },
    { id: "volunteers" as DataType, label: "봉사", icon: Heart },
  ];

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
                  데이터 입력
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">데이터 입력</h1>
          <p className="text-gray-600">입시 준비에 필요한 데이터를 입력하세요</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-sky-500 text-sky-600 bg-sky-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Header with Add Button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {tabs.find((t) => t.id === activeTab)?.label} 목록
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              {showForm ? (
                <>
                  <X className="w-5 h-5" />
                  취소
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  추가
                </>
              )}
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <DataForm
              type={activeTab}
              onSuccess={() => {
                setShowForm(false);
                fetchData(activeTab);
              }}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Data List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">로딩 중...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">아직 등록된 데이터가 없습니다</p>
              <p className="text-sm text-gray-400 mt-2">상단의 추가 버튼을 클릭해서 데이터를 입력하세요</p>
            </div>
          ) : (
            <DataList
              type={activeTab}
              data={data}
              onRefresh={() => fetchData(activeTab)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// 데이터 입력 폼 컴포넌트
function DataForm({ type, onSuccess, onCancel }: {
  type: DataType;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:3000/api/student/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "저장에 실패했습니다");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderFields = () => {
    switch (type) {
      case "grades":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="학년"
                value={formData.schoolYear || ""}
                onChange={(e) => setFormData({ ...formData, schoolYear: parseInt(e.target.value) })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
              <select
                value={formData.semester || ""}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              >
                <option value="">학기 선택</option>
                <option value="1">1학기</option>
                <option value="2">2학기</option>
              </select>
              <input
                type="text"
                placeholder="과목"
                value={formData.subject || ""}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="성적"
                value={formData.score || ""}
                onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
            </div>
          </>
        );
      case "activities":
        return (
          <>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="활동명"
                value={formData.activityName || ""}
                onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="역할"
                value={formData.role || ""}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  placeholder="시작일"
                  value={formData.startDate || ""}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
                <input
                  type="date"
                  placeholder="종료일"
                  value={formData.endDate || ""}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <textarea
                placeholder="활동 내용"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                rows={4}
              />
            </div>
          </>
        );
      case "readings":
        return (
          <>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="도서명"
                value={formData.bookTitle || ""}
                onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="저자"
                value={formData.author || ""}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <input
                type="date"
                placeholder="독서일"
                value={formData.readDate || ""}
                onChange={(e) => setFormData({ ...formData, readDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <textarea
                placeholder="독후감"
                value={formData.summary || ""}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                rows={4}
              />
            </div>
          </>
        );
      default:
        return <p className="text-gray-500">준비 중입니다...</p>;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-6 bg-sky-50 rounded-lg border border-sky-200">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
      {renderFields()}
      <div className="flex items-center gap-3 mt-4">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:bg-sky-400 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          취소
        </button>
      </div>
    </form>
  );
}

// 데이터 목록 컴포넌트
function DataList({ type, data, onRefresh }: {
  type: DataType;
  data: any[];
  onRefresh: () => void;
}) {
  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:3000/api/student/${type}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div
          key={item.id}
          className="p-4 border border-gray-200 rounded-lg hover:border-sky-300 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {type === "grades" && (
                <>
                  <h3 className="font-semibold text-gray-900">{item.subject}</h3>
                  <p className="text-sm text-gray-600">
                    {item.schoolYear}학년 {item.semester}학기 - 성적: {item.score}
                  </p>
                </>
              )}
              {type === "activities" && (
                <>
                  <h3 className="font-semibold text-gray-900">{item.activityName}</h3>
                  <p className="text-sm text-gray-600">{item.role}</p>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                </>
              )}
              {type === "readings" && (
                <>
                  <h3 className="font-semibold text-gray-900">{item.bookTitle}</h3>
                  <p className="text-sm text-gray-600">{item.author}</p>
                  <p className="text-sm text-gray-500 mt-1">{item.summary}</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

