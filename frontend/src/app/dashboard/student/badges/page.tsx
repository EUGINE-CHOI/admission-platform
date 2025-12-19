"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getApiUrl } from "@/lib/api";
import { 
  Trophy, 
  Star, 
  Target, 
  BookOpen, 
  Brain, 
  Calendar,
  Sparkles,
  Lock,
  CheckCircle,
  TrendingUp
} from "lucide-react";

interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  iconUrl: string | null;
  points: number;
  earnedAt?: string;
  isEarned: boolean;
}

interface BadgeSummary {
  totalBadges: number;
  earnedBadges: number;
  totalPoints: number;
  recentBadges: BadgeInfo[];
  badgesByCategory: Record<string, { earned: number; total: number }>;
}

const categoryIcons: Record<string, any> = {
  ATTENDANCE: Calendar,
  TASK: Target,
  DATA_INPUT: BookOpen,
  DIAGNOSIS: TrendingUp,
  AI_USAGE: Brain,
  MILESTONE: Star,
};

const categoryLabels: Record<string, string> = {
  ATTENDANCE: "출석",
  TASK: "Task 완료",
  DATA_INPUT: "데이터 입력",
  DIAGNOSIS: "진단",
  AI_USAGE: "AI 사용",
  MILESTONE: "마일스톤",
};

export default function BadgesPage() {
  const [summary, setSummary] = useState<BadgeSummary | null>(null);
  const [allBadges, setAllBadges] = useState<BadgeInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      const [summaryRes, badgesRes] = await Promise.all([
        fetch(`${API_URL}/v1/gamification/badges/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/v1/gamification/badges`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (summaryRes.ok) {
        setSummary(await summaryRes.json());
      }
      if (badgesRes.ok) {
        setAllBadges(await badgesRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = selectedCategory
    ? allBadges.filter((b) => b.category === selectedCategory)
    : allBadges;

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
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">성취 뱃지</h1>
          <p className="text-slate-400">활동을 통해 뱃지를 획득하세요</p>
        </div>
      </div>

      {/* 요약 카드 */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border-violet-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">획득한 뱃지</p>
                  <p className="text-3xl font-bold text-white">
                    {summary.earnedBadges}
                    <span className="text-lg text-slate-400">/{summary.totalBadges}</span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-violet-500/20">
                  <Trophy className="w-8 h-8 text-violet-400" />
                </div>
              </div>
              <div className="mt-4 bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                  style={{ width: `${(summary.earnedBadges / summary.totalBadges) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">총 포인트</p>
                  <p className="text-3xl font-bold text-white">{summary.totalPoints}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/20">
                  <Sparkles className="w-8 h-8 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">완료율</p>
                  <p className="text-3xl font-bold text-white">
                    {Math.round((summary.earnedBadges / summary.totalBadges) * 100)}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/20">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 최근 획득 뱃지 */}
      {summary && summary.recentBadges.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              최근 획득한 뱃지
            </h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {summary.recentBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-white font-medium">{badge.name}</span>
                  <Badge variant="warning">+{badge.points}P</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === null
              ? "bg-violet-500 text-white"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          전체
        </button>
        {Object.entries(categoryLabels).map(([key, label]) => {
          const IconComponent = categoryIcons[key];
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === key
                  ? "bg-violet-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* 뱃지 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const IconComponent = categoryIcons[badge.category] || Star;
          return (
            <Card
              key={badge.id}
              className={`relative overflow-hidden transition-all ${
                badge.isEarned
                  ? "bg-gradient-to-br from-slate-800 to-slate-900 border-violet-500/50"
                  : "bg-slate-800/50 border-slate-700/50 opacity-60"
              }`}
            >
              {badge.isEarned && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
              )}
              {!badge.isEarned && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      badge.isEarned
                        ? "bg-gradient-to-br from-amber-400 to-orange-500"
                        : "bg-slate-700"
                    }`}
                  >
                    <IconComponent
                      className={`w-6 h-6 ${badge.isEarned ? "text-white" : "text-slate-500"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${badge.isEarned ? "text-white" : "text-slate-400"}`}>
                      {badge.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{badge.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant={badge.isEarned ? "success" : "default"}>
                        {badge.points}P
                      </Badge>
                      <Badge variant="info">{categoryLabels[badge.category]}</Badge>
                    </div>
                    {badge.isEarned && badge.earnedAt && (
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(badge.earnedAt).toLocaleDateString("ko-KR")} 획득
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

