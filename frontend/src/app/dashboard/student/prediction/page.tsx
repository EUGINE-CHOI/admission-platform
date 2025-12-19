"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getApiUrl } from "@/lib/api";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  TrendingUp,
  School,
  Target,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ChevronRight,
  BarChart3,
  Award,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

interface PredictionResult {
  schoolId: string;
  schoolName: string;
  schoolType: string;
  predictionScore: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  factors: {
    category: string;
    score: number;
    weight: number;
    comment: string;
  }[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  historicalComparison: {
    avgCutoff: number | null;
    yourAvg: number | null;
    gap: number | null;
    trend: "ABOVE" | "BELOW" | "MATCH" | "N/A";
  };
}

interface SchoolRecommendation {
  schoolId: string;
  schoolName: string;
  schoolType: string;
  region: string;
  matchScore: number;
  reasons: string[];
  fitCategory: "SAFE" | "MATCH" | "REACH";
}

interface ComprehensiveAnalysis {
  overallReadiness: number;
  predictions: PredictionResult[];
  recommendations: SchoolRecommendation[];
  actionItems: string[];
  summary: string;
}

const fitCategoryColors: Record<string, { bg: string; text: string; label: string }> = {
  SAFE: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "안정권" },
  MATCH: { bg: "bg-amber-500/20", text: "text-amber-400", label: "적정" },
  REACH: { bg: "bg-rose-500/20", text: "text-rose-400", label: "상향" },
};

const confidenceLabels: Record<string, { color: string; label: string }> = {
  HIGH: { color: "text-emerald-400", label: "높음" },
  MEDIUM: { color: "text-amber-400", label: "보통" },
  LOW: { color: "text-slate-400", label: "낮음" },
};

export default function PredictionPage() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ComprehensiveAnalysis | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionResult | null>(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      const res = await fetch(`${API_URL}/v1/ai/prediction/analysis`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setAnalysis(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    if (score >= 40) return "text-orange-400";
    return "text-rose-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-rose-500";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "ABOVE": return <ArrowUp className="w-4 h-4 text-emerald-400" />;
      case "BELOW": return <ArrowDown className="w-4 h-4 text-rose-400" />;
      case "MATCH": return <Minus className="w-4 h-4 text-amber-400" />;
      default: return null;
    }
  };

  if (loading) {
    return <LoadingState message="AI가 분석 중입니다..." />;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">합격 예측 AI</h1>
            <p className="text-slate-400">AI가 합격 가능성을 분석하고 학교를 추천해드립니다</p>
          </div>
        </div>
        <Button onClick={fetchAnalysis} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          다시 분석
        </Button>
      </div>

      {analysis && (
        <>
          {/* 종합 준비도 */}
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg text-slate-400 mb-1">종합 입시 준비도</h2>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-bold ${getScoreColor(analysis.overallReadiness)}`}>
                      {analysis.overallReadiness}
                    </span>
                    <span className="text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className="w-32 h-32 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-slate-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(analysis.overallReadiness / 100) * 352} 352`}
                      className={getScoreColor(analysis.overallReadiness).replace("text", "stroke")}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Award className={`w-10 h-10 ${getScoreColor(analysis.overallReadiness)}`} />
                  </div>
                </div>
              </div>
              <p className="text-slate-300 mt-4">{analysis.summary}</p>
            </CardContent>
          </Card>

          {/* 실행 항목 */}
          {analysis.actionItems?.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  추천 행동
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.actionItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <Target className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className="text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 목표 학교 예측 */}
          {analysis.predictions?.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <School className="w-5 h-5 text-violet-400" />
                  목표 학교 합격 예측
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.predictions.map((pred) => (
                    <div
                      key={pred.schoolId}
                      className="p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                      onClick={() => setSelectedPrediction(selectedPrediction?.schoolId === pred.schoolId ? null : pred)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreBg(pred.predictionScore)}`}>
                            <span className="text-white font-bold">{pred.predictionScore}</span>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{pred.schoolName}</h4>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <span>{pred.schoolType}</span>
                              <span>•</span>
                              <span className={confidenceLabels[pred.confidence].color}>
                                신뢰도 {confidenceLabels[pred.confidence].label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {pred.historicalComparison.trend !== "N/A" && (
                            <div className="flex items-center gap-1">
                              {getTrendIcon(pred.historicalComparison.trend)}
                              <span className="text-sm text-slate-400">
                                합격선 {pred.historicalComparison.trend === "ABOVE" ? "상회" : pred.historicalComparison.trend === "BELOW" ? "미달" : "일치"}
                              </span>
                            </div>
                          )}
                          <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${selectedPrediction?.schoolId === pred.schoolId ? "rotate-90" : ""}`} />
                        </div>
                      </div>

                      {/* 상세 정보 */}
                      {selectedPrediction?.schoolId === pred.schoolId && (
                        <div className="mt-4 pt-4 border-t border-slate-700 space-y-4">
                          {/* 요인별 점수 */}
                          <div className="grid grid-cols-3 gap-3">
                            {pred.factors?.map((f, i) => (
                              <div key={i} className="p-3 bg-slate-900/50 rounded-lg">
                                <div className="text-sm text-slate-400 mb-1">{f.category}</div>
                                <div className={`text-xl font-bold ${getScoreColor(f.score)}`}>{f.score}</div>
                                <p className="text-xs text-slate-500 mt-1">{f.comment}</p>
                              </div>
                            ))}
                          </div>

                          {/* 강점/약점 */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-emerald-400 text-sm font-medium mb-2">강점</h5>
                              {pred.strengths?.map((s, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-slate-300 mb-1">
                                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                                  {s}
                                </div>
                              ))}
                            </div>
                            <div>
                              <h5 className="text-amber-400 text-sm font-medium mb-2">보완점</h5>
                              {pred.weaknesses?.map((w, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-slate-300 mb-1">
                                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                                  {w}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 추천 사항 */}
                          {pred.recommendations?.length > 0 && (
                            <div className="p-3 bg-violet-500/10 rounded-lg">
                              <h5 className="text-violet-400 text-sm font-medium mb-2 flex items-center gap-1">
                                <Sparkles className="w-4 h-4" />
                                AI 추천
                              </h5>
                              <ul className="space-y-1">
                                {pred.recommendations.map((r, i) => (
                                  <li key={i} className="text-sm text-slate-300">• {r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI 추천 학교 */}
          {analysis.recommendations?.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  AI 추천 학교
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.recommendations.map((rec) => {
                    const fit = fitCategoryColors[rec.fitCategory];
                    return (
                      <div key={rec.schoolId} className={`p-4 rounded-lg border ${fit.bg} border-slate-700`}>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${fit.bg} ${fit.text}`}>{fit.label}</Badge>
                          <span className={`text-lg font-bold ${getScoreColor(rec.matchScore)}`}>
                            {rec.matchScore}점
                          </span>
                        </div>
                        <h4 className="text-white font-medium mb-1">{rec.schoolName}</h4>
                        <p className="text-sm text-slate-400 mb-3">{rec.region} • {rec.schoolType}</p>
                        <div className="space-y-1">
                          {rec.reasons?.slice(0, 2).map((r, i) => (
                            <p key={i} className="text-xs text-slate-400">• {r}</p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* 데이터 없음 */}
      {!analysis && !loading && (
        <Card className="bg-slate-800/50">
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">분석 데이터가 없습니다.</p>
            <p className="text-sm text-slate-500 mt-1">성적과 활동 데이터를 먼저 입력해주세요.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

