"use client";

import { useEffect, useState } from "react";
import {
  CheckSquare,
  Circle,
  CheckCircle,
  Clock,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Target,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { getToken, getApiUrl } from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Select } from "@/components/ui";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  weekNum: number;
  dueDate?: string;
  planId: string;
  plan?: {
    title: string;
  };
}

interface ActionPlan {
  id: string;
  title: string;
  weekCount: number;
  createdAt: string;
}

interface WeekProgress {
  weekNum: number;
  total: number;
  completed: number;
  percentage: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [currentWeek, setCurrentWeek] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<WeekProgress[]>([]);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (selectedPlanId) {
      fetchTasks();
      fetchProgress();
    }
  }, [selectedPlanId, currentWeek]);

  const fetchPlans = async () => {
    try {
      const token = getToken();
      const res = await fetch("${getApiUrl()}/api/ai/action-plan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const plansArray = Array.isArray(data) ? data : [];
        setPlans(plansArray);
        if (plansArray.length > 0) {
          setSelectedPlanId(plansArray[0].id);
        }
      }
    } catch (error) {
      console.error("Fetch plans error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${getApiUrl()}/api/tasks/plan/${selectedPlanId}/week/${currentWeek}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
    }
  };

  const fetchProgress = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${getApiUrl()}/api/tasks/plan/${selectedPlanId}/progress`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setProgress(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch progress error:", error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const token = getToken();
      await fetch(`${getApiUrl()}/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchTasks();
      fetchProgress();
    } catch (error) {
      console.error("Update task error:", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter === "all") return true;
    return task.status === statusFilter;
  });

  const currentPlan = plans.find((p) => p.id === selectedPlanId);
  const totalWeeks = currentPlan?.weekCount || 12;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "IN_PROGRESS":
        return <Play className="w-5 h-5 text-amber-500" />;
      case "CANCELLED":
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
      default:
        return <Circle className="w-5 h-5 text-slate-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">완료</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="warning">진행중</Badge>;
      case "CANCELLED":
        return <Badge variant="default">취소</Badge>;
      default:
        return <Badge variant="outline">대기</Badge>;
    }
  };

  const getCurrentWeekProgress = () => {
    const weekData = progress.find((p) => p.weekNum === currentWeek);
    return weekData || { total: 0, completed: 0, percentage: 0 };
  };

  const getOverallProgress = () => {
    if (progress.length === 0) return 0;
    const totalCompleted = progress.reduce((sum, p) => sum + p.completed, 0);
    const total = progress.reduce((sum, p) => sum + p.total, 0);
    return total > 0 ? Math.round((totalCompleted / total) * 100) : 0;
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="STUDENT">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (plans.length === 0) {
    return (
      <DashboardLayout requiredRole="STUDENT">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">실행 계획</h1>
            <p className="text-slate-500 mt-1">
              태스크를 관리하고 진행 상황을 확인하세요
            </p>
          </div>

          <Card className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                액션 플랜이 없습니다
              </h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm">
                AI 조언 페이지에서 액션 플랜을 먼저 생성해주세요
              </p>
              <Button onClick={() => window.location.href = "/dashboard/student/ai"}>
                액션 플랜 생성하기
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">실행 계획</h1>
            <p className="text-slate-500 mt-1">
              태스크를 관리하고 진행 상황을 확인하세요
            </p>
          </div>
          <div className="flex gap-2">
            <Select
              options={plans.map((p) => ({ value: p.id, label: p.title }))}
              value={selectedPlanId}
              onChange={(e) => {
                setSelectedPlanId(e.target.value);
                setCurrentWeek(1);
              }}
            />
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-sky-500 to-sky-600 text-white border-0">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sky-100 text-sm">전체 진행률</p>
                  <p className="text-3xl font-bold mt-1">{getOverallProgress()}%</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center">
                  <Target className="w-8 h-8 text-white/80" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">현재 주차</p>
                  <p className="text-2xl font-bold text-slate-900">{currentWeek}주차</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">이번 주 완료</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {getCurrentWeekProgress().completed}/{getCurrentWeekProgress().total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Week Navigation */}
        <Card>
          <CardContent className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                disabled={currentWeek === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                이전 주
              </Button>
              <span className="font-medium text-slate-900">{currentWeek}주차</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentWeek(Math.min(totalWeeks, currentWeek + 1))}
                disabled={currentWeek === totalWeeks}
              >
                다음 주
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Week Progress Bar */}
            <div className="flex gap-1">
              {Array.from({ length: totalWeeks }).map((_, i) => {
                const weekNum = i + 1;
                const weekProgress = progress.find((p) => p.weekNum === weekNum);
                const isComplete = weekProgress?.percentage === 100;
                const isPartial = (weekProgress?.percentage || 0) > 0 && !isComplete;
                const isCurrent = weekNum === currentWeek;

                return (
                  <button
                    key={weekNum}
                    onClick={() => setCurrentWeek(weekNum)}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      isComplete
                        ? "bg-emerald-500"
                        : isPartial
                        ? "bg-amber-400"
                        : "bg-slate-200"
                    } ${isCurrent ? "ring-2 ring-sky-400 ring-offset-2" : ""}`}
                    title={`${weekNum}주차 - ${weekProgress?.percentage || 0}%`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>1주차</span>
              <span>{totalWeeks}주차</span>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <Card>
          <CardHeader
            icon={<CheckSquare className="w-5 h-5" />}
            action={
              <Select
                options={[
                  { value: "all", label: "전체" },
                  { value: "PENDING", label: "대기" },
                  { value: "IN_PROGRESS", label: "진행중" },
                  { value: "COMPLETED", label: "완료" },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            }
          >
            {currentWeek}주차 태스크
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <CheckSquare className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">
                  {tasks.length === 0
                    ? "이번 주에 예정된 태스크가 없습니다"
                    : "필터 조건에 맞는 태스크가 없습니다"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      task.status === "COMPLETED"
                        ? "bg-emerald-50 border-emerald-200"
                        : task.status === "IN_PROGRESS"
                        ? "bg-amber-50 border-amber-200"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <button
                      onClick={() => {
                        const nextStatus =
                          task.status === "PENDING"
                            ? "IN_PROGRESS"
                            : task.status === "IN_PROGRESS"
                            ? "COMPLETED"
                            : "PENDING";
                        updateTaskStatus(task.id, nextStatus);
                      }}
                      className="mt-0.5 transition-transform hover:scale-110"
                    >
                      {getStatusIcon(task.status)}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`font-medium ${
                            task.status === "COMPLETED"
                              ? "text-slate-400 line-through"
                              : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </h4>
                        {getStatusBadge(task.status)}
                      </div>
                      {task.description && (
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {task.dueDate}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      {task.status === "IN_PROGRESS" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateTaskStatus(task.id, "PENDING")}
                          title="일시정지"
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      {task.status === "COMPLETED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateTaskStatus(task.id, "PENDING")}
                          title="다시 시작"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
