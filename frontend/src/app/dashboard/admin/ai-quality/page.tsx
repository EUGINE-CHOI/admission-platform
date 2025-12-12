"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  RefreshCw,
  BarChart3,
  FileText,
  Zap,
  CheckCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Select } from "@/components/ui";

interface AIQualityData {
  averageScore: number;
  positiveRate: number;
  negativeRate: number;
  totalOutputs: number;
  outputsByType: { type: string; count: number; avgScore: number }[];
  recentFeedback: Feedback[];
  alerts: Alert[];
  editPatterns: EditPattern[];
}

interface Feedback {
  id: string;
  type: string;
  isPositive: boolean;
  comment?: string;
  createdAt: string;
}

interface Alert {
  id: string;
  type: string;
  message: string;
  severity: "low" | "medium" | "high";
}

interface EditPattern {
  type: string;
  pattern: string;
  count: number;
  suggestion: string;
}

export default function AIQualityPage() {
  const [data, setData] = useState<AIQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  useEffect(() => {
    fetchData();
  }, [period]);

  const getToken = () => localStorage.getItem("accessToken");

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const [qualityRes, feedbackRes, patternsRes] = await Promise.all([
        fetch("http://localhost:3000/api/admin/ai/quality", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3000/api/admin/ai/feedback-stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3000/api/admin/ai/quality/edit-patterns", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let qualityData: any = {};
      let feedbackData: any = {};
      let patternsData: any = [];

      if (qualityRes.ok) qualityData = await qualityRes.json();
      if (feedbackRes.ok) feedbackData = await feedbackRes.json();
      if (patternsRes.ok) patternsData = await patternsRes.json();

      setData({
        averageScore: qualityData.averageScore || 0,
        positiveRate: feedbackData.positiveRate || 0,
        negativeRate: feedbackData.negativeRate || 0,
        totalOutputs: qualityData.totalOutputs || 0,
        outputsByType: qualityData.outputsByType || [],
        recentFeedback: feedbackData.recentFeedback || [],
        alerts: qualityData.alerts || [],
        editPatterns: Array.isArray(patternsData) ? patternsData : [],
      });
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI 품질 관리</h1>
            <p className="text-slate-500 mt-1">
              AI 생성 품질과 사용자 피드백을 모니터링하세요
            </p>
          </div>
          <div className="flex gap-2">
            <Select
              options={[
                { value: "7d", label: "최근 7일" },
                { value: "30d", label: "최근 30일" },
                { value: "90d", label: "최근 90일" },
              ]}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
            <Button variant="outline" onClick={fetchData} leftIcon={<RefreshCw className="w-4 h-4" />}>
              새로고침
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
          </div>
        ) : data ? (
          <>
            {/* Quality Score */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">평균 품질 점수</p>
                      <p className="text-4xl font-bold mt-1">
                        {data.averageScore.toFixed(1)}
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-7 h-7" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <ThumbsUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">긍정 피드백</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {data.positiveRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                      <ThumbsDown className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">부정 피드백</p>
                      <p className="text-2xl font-bold text-red-600">
                        {data.negativeRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">총 생성 수</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {data.totalOutputs.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Output by Type */}
              <Card>
                <CardHeader icon={<BarChart3 className="w-5 h-5" />}>
                  AI 기능별 통계
                </CardHeader>
                <CardContent>
                  {data.outputsByType.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">
                      데이터가 없습니다
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {data.outputsByType.map((item) => (
                        <div key={item.type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">
                              {item.type}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-500">
                                {item.count}회
                              </span>
                              <Badge
                                variant={
                                  item.avgScore >= 4
                                    ? "success"
                                    : item.avgScore >= 3
                                    ? "warning"
                                    : "danger"
                                }
                              >
                                {item.avgScore.toFixed(1)}점
                              </Badge>
                            </div>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.avgScore >= 4
                                  ? "bg-emerald-500"
                                  : item.avgScore >= 3
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${(item.avgScore / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card>
                <CardHeader icon={<AlertCircle className="w-5 h-5" />}>
                  품질 알림
                </CardHeader>
                <CardContent>
                  {data.alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <p className="text-slate-500">현재 알림이 없습니다</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-4 rounded-xl border ${getSeverityColor(alert.severity)}`}
                        >
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">{alert.type}</p>
                              <p className="text-sm opacity-80 mt-1">{alert.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Feedback */}
            <Card>
              <CardHeader icon={<FileText className="w-5 h-5" />}>
                최근 피드백
              </CardHeader>
              <CardContent>
                {data.recentFeedback.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">
                    피드백이 없습니다
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.recentFeedback.slice(0, 10).map((feedback) => (
                      <div
                        key={feedback.id}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            feedback.isPositive
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {feedback.isPositive ? (
                            <ThumbsUp className="w-5 h-5" />
                          ) : (
                            <ThumbsDown className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{feedback.type}</Badge>
                            <span className="text-xs text-slate-400">
                              {feedback.createdAt}
                            </span>
                          </div>
                          {feedback.comment && (
                            <p className="text-sm text-slate-600 truncate">
                              {feedback.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit Patterns */}
            {data.editPatterns.length > 0 && (
              <Card>
                <CardHeader icon={<TrendingUp className="w-5 h-5" />}>
                  수정 패턴 분석
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.editPatterns.map((pattern, idx) => (
                      <div
                        key={idx}
                        className="p-4 border border-slate-200 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge>{pattern.type}</Badge>
                          <span className="text-sm text-slate-500">
                            {pattern.count}회 발생
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">
                          <strong>패턴:</strong> {pattern.pattern}
                        </p>
                        <p className="text-sm text-emerald-600">
                          <strong>개선 제안:</strong> {pattern.suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="bg-sky-50 border-sky-200">
              <CardContent>
                <h4 className="font-medium text-sky-900 mb-2">💡 AI 품질 개선 팁</h4>
                <ul className="text-sm text-sky-700 space-y-1">
                  <li>• 부정 피드백이 많은 기능의 프롬프트를 검토하세요</li>
                  <li>• 수정 패턴을 분석하여 AI 출력 품질을 개선할 수 있습니다</li>
                  <li>• 평균 점수가 3점 이하인 기능은 즉시 개선이 필요합니다</li>
                </ul>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

