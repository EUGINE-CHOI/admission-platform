"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap,
  CheckCircle2,
  Circle,
  Calendar,
  Target,
  TrendingUp,
  LogOut,
  Clock
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
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
      
      // 태스크 목록
      const tasksRes = await fetch("http://localhost:3000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:3000/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Toggle task error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null;

  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

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
                  실행 계획
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">실행 계획</h1>
          <p className="text-gray-600">AI가 생성한 맞춤형 실행 계획을 관리하세요</p>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">전체 태스크</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">완료</p>
                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">완료율</p>
                <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">태스크 목록</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">로딩 중...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">아직 실행 계획이 없습니다</p>
              <p className="text-sm text-gray-400 mt-2">AI 조언 페이지에서 실행 계획을 생성하세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => handleToggleTask(task.id, task.status)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="mt-8 p-4 bg-sky-50 rounded-xl border border-sky-200">
          <p className="text-sm text-sky-700">
            💡 <strong>Tip:</strong> 태스크를 클릭하면 완료/미완료 상태를 변경할 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}

function TaskItem({ task, onToggle }: { task: any; onToggle: () => void }) {
  const isCompleted = task.status === "COMPLETED";

  return (
    <button
      onClick={onToggle}
      className={`w-full p-4 border rounded-lg text-left transition-all ${
        isCompleted
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-200 hover:border-sky-300"
      }`}
    >
      <div className="flex items-start gap-4">
        {isCompleted ? (
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
        ) : (
          <Circle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <h3 className={`font-medium ${isCompleted ? "text-gray-500 line-through" : "text-gray-900"}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            {task.weekNumber && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Week {task.weekNumber}
              </span>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}



