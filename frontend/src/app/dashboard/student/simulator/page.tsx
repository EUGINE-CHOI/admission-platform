"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getApiUrl, handleApiError } from "@/lib/api";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  Calculator,
  School,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Target,
  ArrowRight,
  Lightbulb,
  BarChart3,
  Play,
} from "lucide-react";

interface SimulationResult {
  schoolName: string;
  schoolType: string;
  currentLevel: string;
  currentScore: number;
  simulatedLevel: string;
  simulatedScore: number;
  scoreDifference: number;
  levelChanged: boolean;
  changeFactors: {
    factor: string;
    impact: number;
    description: string;
  }[];
  recommendations: string[];
  probabilityEstimate: number;
}

interface ScenarioComparison {
  baseCase: SimulationResult;
  scenarios: {
    name: string;
    result: SimulationResult;
    improvement: number;
  }[];
}

interface TargetSchool {
  schoolId: string;
  schoolName: string;
  priority: number;
  currentLevel: string;
  probabilityEstimate: number;
}

const levelColors = {
  FIT: "text-emerald-400",
  CHALLENGE: "text-amber-400",
  UNLIKELY: "text-red-400",
};

const levelBadgeVariants: Record<string, "success" | "warning" | "danger"> = {
  FIT: "success",
  CHALLENGE: "warning",
  UNLIKELY: "danger",
};

const levelLabels = {
  FIT: "적합",
  CHALLENGE: "도전",
  UNLIKELY: "어려움",
};

export default function SimulatorPage() {
  const [targetSchools, setTargetSchools] = useState<TargetSchool[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [comparison, setComparison] = useState<ScenarioComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // 시뮬레이션 입력값
  const [simInput, setSimInput] = useState({
    gradeChange: 0, // -2 ~ +2 등급 변화
    activityAdd: 0,
    volunteerAdd: 0,
  });

  useEffect(() => {
    fetchTargetSchools();
  }, []);

  const fetchTargetSchools = async () => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      const res = await fetch(`${API_URL}/v1/simulator/targets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setTargetSchools(await res.json());
      }
    } catch (error) {
      handleApiError(error, "학교 목록 조회");
    } finally {
      setLoading(false);
    }
  };

  const runScenarioComparison = async (schoolId: string) => {
    setSimulating(true);
    setSelectedSchool(schoolId);

    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      const res = await fetch(`${API_URL}/v1/simulator/compare/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setComparison(await res.json());
      }
    } catch (error) {
      handleApiError(error, "시뮬레이션 실행");
    } finally {
      setSimulating(false);
    }
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 70) return "text-emerald-400";
    if (prob >= 40) return "text-amber-400";
    return "text-red-400";
  };

  if (loading) {
    return <LoadingState message="시뮬레이터를 불러오는 중..." />;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">합격 예측 시뮬레이션</h1>
          <p className="text-slate-400">&quot;만약 성적이 변하면?&quot; 시나리오 분석</p>
        </div>
      </div>

      {/* 목표 학교 목록 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <School className="w-5 h-5 text-violet-400" />
            목표 학교 현황
          </h3>
        </CardHeader>
        <CardContent>
          {targetSchools.length > 0 ? (
            <div className="space-y-3">
              {targetSchools.map((school) => (
                <div
                  key={school.schoolId}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedSchool === school.schoolId
                      ? "bg-violet-500/20 border-violet-500"
                      : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                  }`}
                  onClick={() => runScenarioComparison(school.schoolId)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                      {school.priority}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{school.schoolName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={levelBadgeVariants[school.currentLevel] || "default"}>
                          {levelLabels[school.currentLevel as keyof typeof levelLabels] || school.currentLevel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getProbabilityColor(school.probabilityEstimate)}`}>
                      {school.probabilityEstimate}%
                    </p>
                    <p className="text-xs text-slate-400">예상 합격률</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <School className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">목표 학교를 먼저 설정해주세요.</p>
              <Button variant="outline" className="mt-4">
                목표 학교 설정하기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 시뮬레이션 결과 */}
      {simulating && (
        <Card className="border-violet-500/50">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-white">시뮬레이션 분석 중...</p>
          </CardContent>
        </Card>
      )}

      {comparison && !simulating && (
        <>
          {/* 현재 상태 vs 시나리오 비교 */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-violet-400" />
                시나리오 비교 분석
              </h3>
            </CardHeader>
            <CardContent>
              {/* 기본 케이스 */}
              <div className="p-4 rounded-lg bg-slate-700/50 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">현재 상태</p>
                    <p className="text-xl font-bold text-white">{comparison.baseCase.schoolName}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={levelBadgeVariants[comparison.baseCase.currentLevel] || "default"} className="text-lg px-3 py-1">
                      {levelLabels[comparison.baseCase.currentLevel as keyof typeof levelLabels]}
                    </Badge>
                    <p className="text-slate-400 text-sm mt-1">점수: {comparison.baseCase.currentScore}점</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1 h-3 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        comparison.baseCase.probabilityEstimate >= 70
                          ? "bg-emerald-500"
                          : comparison.baseCase.probabilityEstimate >= 40
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${comparison.baseCase.probabilityEstimate}%` }}
                    />
                  </div>
                  <span className={`font-bold ${getProbabilityColor(comparison.baseCase.probabilityEstimate)}`}>
                    {comparison.baseCase.probabilityEstimate}%
                  </span>
                </div>
              </div>

              {/* 시나리오 목록 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparison.scenarios.map((scenario, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      scenario.result.levelChanged
                        ? "bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border-violet-500/50"
                        : "bg-slate-800/50 border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{scenario.name}</h4>
                      <Badge variant={scenario.improvement > 0 ? "success" : "default"}>
                        {scenario.improvement > 0 ? "+" : ""}{scenario.improvement.toFixed(1)}점
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant={levelBadgeVariants[comparison.baseCase.currentLevel] || "default"}>
                        {levelLabels[comparison.baseCase.currentLevel as keyof typeof levelLabels]}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <Badge variant={levelBadgeVariants[scenario.result.simulatedLevel] || "default"}>
                        {levelLabels[scenario.result.simulatedLevel as keyof typeof levelLabels]}
                      </Badge>
                      {scenario.result.levelChanged && (
                        <Zap className="w-4 h-4 text-amber-400" />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            scenario.result.probabilityEstimate >= 70
                              ? "bg-emerald-500"
                              : scenario.result.probabilityEstimate >= 40
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${scenario.result.probabilityEstimate}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${getProbabilityColor(scenario.result.probabilityEstimate)}`}>
                        {scenario.result.probabilityEstimate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 추천 사항 */}
          {comparison.baseCase.recommendations.length > 0 && (
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
              <CardHeader>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  맞춤 추천
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {comparison.baseCase.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <Target className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 변화 요인 분석 */}
          {comparison.scenarios[3]?.result.changeFactors.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">종합 개선 시 변화 요인</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {comparison.scenarios[3].result.changeFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{factor.factor}</p>
                        <p className="text-sm text-slate-400">{factor.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {factor.impact > 0 ? (
                          <TrendingUp className="w-5 h-5 text-emerald-400" />
                        ) : factor.impact < 0 ? (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        ) : (
                          <Minus className="w-5 h-5 text-slate-400" />
                        )}
                        <span className={`font-bold ${
                          factor.impact > 0 ? "text-emerald-400" : factor.impact < 0 ? "text-red-400" : "text-slate-400"
                        }`}>
                          {factor.impact > 0 ? "+" : ""}{factor.impact.toFixed(1)}점
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* 안내 메시지 */}
      {targetSchools.length > 0 && !comparison && !simulating && (
        <Card className="border-dashed border-slate-600">
          <CardContent className="p-8 text-center">
            <Play className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">위의 목표 학교를 클릭하여 시뮬레이션을 시작하세요.</p>
            <p className="text-sm text-slate-500 mt-1">
              성적 변화, 활동 추가, 봉사활동 등 다양한 시나리오를 분석합니다.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

