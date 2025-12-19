"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getApiUrl } from "@/lib/api";
import { getCurrentYear } from "@/lib/utils";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Trash2,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

interface GradeGoalWithProgress {
  id: string;
  subject: string;
  targetRank: number;
  targetYear: number;
  targetSemester: number;
  currentRank: number | null;
  gap: number | null;
  progress: number;
  status: "ACHIEVED" | "ON_TRACK" | "BEHIND" | "NOT_STARTED";
  trend: "UP" | "DOWN" | "FLAT" | "N/A";
}

interface GoalSummary {
  totalGoals: number;
  achievedGoals: number;
  onTrackGoals: number;
  behindGoals: number;
  overallProgress: number;
  subjectGoals: GradeGoalWithProgress[];
}

interface RecommendedGoal {
  subject: string;
  targetRank: number;
  targetYear: number;
  targetSemester: number;
}

const trendIcons = {
  UP: TrendingUp,
  DOWN: TrendingDown,
  FLAT: Minus,
  "N/A": Clock,
};

const trendColors = {
  UP: "text-emerald-400",
  DOWN: "text-red-400",
  FLAT: "text-yellow-400",
  "N/A": "text-slate-400",
};

const statusConfig = {
  ACHIEVED: { label: "달성", color: "success", icon: CheckCircle },
  ON_TRACK: { label: "순조로움", color: "info", icon: TrendingUp },
  BEHIND: { label: "노력 필요", color: "warning", icon: AlertCircle },
  NOT_STARTED: { label: "시작 전", color: "default", icon: Clock },
};

export default function GoalsPage() {
  const [summary, setSummary] = useState<GoalSummary | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    subject: "",
    targetRank: 3,
    targetYear: getCurrentYear(),
    targetSemester: 1,
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      const [summaryRes, recsRes] = await Promise.all([
        fetch(`${API_URL}/v1/goals/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/v1/goals/recommendations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (summaryRes.ok) {
        setSummary(await summaryRes.json());
      }
      if (recsRes.ok) {
        setRecommendations(await recsRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.subject) return;

    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      const res = await fetch(`${API_URL}/v1/goals`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGoal),
      });

      if (res.ok) {
        setShowAddForm(false);
        setNewGoal({ subject: "", targetRank: 3, targetYear: getCurrentYear(), targetSemester: 1 });
        fetchGoals();
      }
    } catch (error) {
      console.error("Failed to add goal:", error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      const res = await fetch(`${API_URL}/v1/goals/${goalId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchGoals();
      }
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const applyRecommendation = (rec: RecommendedGoal) => {
    setNewGoal(rec);
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">목표 성적 트래커</h1>
            <p className="text-slate-400">과목별 목표를 설정하고 진행 상황을 추적하세요</p>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          목표 추가
        </Button>
      </div>

      {/* 요약 카드 */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{summary.totalGoals}</p>
              <p className="text-sm text-slate-400">전체 목표</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-500/20 border-emerald-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">{summary.achievedGoals}</p>
              <p className="text-sm text-slate-400">달성</p>
            </CardContent>
          </Card>
          <Card className="bg-sky-500/20 border-sky-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-sky-400">{summary.onTrackGoals}</p>
              <p className="text-sm text-slate-400">순조로움</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/20 border-amber-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-400">{summary.behindGoals}</p>
              <p className="text-sm text-slate-400">노력 필요</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 전체 진행률 */}
      {summary && summary.totalGoals > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">전체 진행률</span>
              <span className="text-2xl font-bold text-violet-400">{summary.overallProgress}%</span>
            </div>
            <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${summary.overallProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 목표 추가 폼 */}
      {showAddForm && (
        <Card className="border-violet-500/50">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">새 목표 추가</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">과목</label>
                <input
                  type="text"
                  value={newGoal.subject}
                  onChange={(e) => setNewGoal({ ...newGoal, subject: e.target.value })}
                  placeholder="예: 국어, 수학"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">목표 등급</label>
                <select
                  value={newGoal.targetRank}
                  onChange={(e) => setNewGoal({ ...newGoal, targetRank: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => (
                    <option key={r} value={r}>{r}등급</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">목표 년도</label>
                <select
                  value={newGoal.targetYear}
                  onChange={(e) => setNewGoal({ ...newGoal, targetYear: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  {[2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">목표 학기</label>
                <select
                  value={newGoal.targetSemester}
                  onChange={(e) => setNewGoal({ ...newGoal, targetSemester: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value={1}>1학기</option>
                  <option value={2}>2학기</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addGoal}>저장</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>취소</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI 추천 목표 */}
      {recommendations.length > 0 && (
        <Card className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/30">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              AI 추천 목표
            </h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {recommendations.slice(0, 5).map((rec, idx) => (
                <button
                  key={idx}
                  onClick={() => applyRecommendation(rec)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 hover:border-violet-500 transition-colors"
                >
                  <span className="text-white">{rec.subject}</span>
                  <Badge variant="info">{rec.targetRank}등급</Badge>
                  <Plus className="w-4 h-4 text-violet-400" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 목표 목록 */}
      {summary && summary.subjectGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.subjectGoals.map((goal) => {
            const TrendIcon = trendIcons[goal.trend];
            const StatusConfig = statusConfig[goal.status];
            const StatusIcon = StatusConfig.icon;

            return (
              <Card key={goal.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{goal.subject}</h3>
                      <p className="text-sm text-slate-400">
                        {goal.targetYear}년 {goal.targetSemester}학기
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={StatusConfig.color as any}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {StatusConfig.label}
                      </Badge>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {goal.currentRank || "-"}
                      </p>
                      <p className="text-xs text-slate-400">현재 등급</p>
                    </div>
                    <div className="text-center flex flex-col items-center justify-center">
                      <TrendIcon className={`w-6 h-6 ${trendColors[goal.trend]}`} />
                      <p className="text-xs text-slate-400 mt-1">추세</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-violet-400">
                        {goal.targetRank}
                      </p>
                      <p className="text-xs text-slate-400">목표 등급</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">진행률</span>
                      <span className="text-white font-medium">{goal.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          goal.status === "ACHIEVED"
                            ? "bg-emerald-500"
                            : goal.status === "ON_TRACK"
                            ? "bg-sky-500"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  {goal.gap !== null && goal.gap > 0 && (
                    <p className="text-sm text-amber-400 mt-3">
                      목표까지 {goal.gap}등급 남음
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-12 text-center">
            <Target className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">아직 설정된 목표가 없습니다.</p>
            <p className="text-sm text-slate-500 mt-1">위의 &apos;목표 추가&apos; 버튼을 클릭하여 목표를 설정하세요.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

