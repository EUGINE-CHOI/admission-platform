"use client";

import { useEffect, useState } from "react";
import {
  Target,
  Search,
  Plus,
  Trash2,
  Play,
  TrendingUp,
  TrendingDown,
  Minus,
  School,
  MapPin,
  Users,
  Clock,
  ChevronRight,
  RefreshCw,
  Star,
  AlertCircle,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { getToken } from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Modal } from "@/components/ui";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

interface School {
  id: string;
  name: string;
  type: string;
  region: string;
  description?: string;
  website?: string;
}

interface TargetSchool {
  id: string;
  school: School;
  priority: number;
}

interface DiagnosisResult {
  id: string;
  school: School;
  result: "FIT" | "CHALLENGE" | "UNLIKELY";
  matchScore: number;
  gradeScore?: number;
  activityScore?: number;
  attendanceScore?: number;
  volunteerScore?: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  createdAt: string;
}

interface Recommendation {
  school: School;
  score: number;
  reason: string;
}

export default function DiagnosisPage() {
  const [targetSchools, setTargetSchools] = useState<TargetSchool[]>([]);
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResult[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [diagnosing, setDiagnosing] = useState(false);
  const [isSchoolSearchOpen, setIsSchoolSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<School[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<DiagnosisResult | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      const [targetsRes, resultsRes, recsRes] = await Promise.all([
        fetch("http://localhost:3000/api/diagnosis/target-schools", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3000/api/diagnosis/results", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3000/api/diagnosis/recommendations", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (targetsRes.ok) {
        const data = await targetsRes.json();
        // API returns { targetSchools: [...] } format
        const targets = data.targetSchools || data;
        setTargetSchools(Array.isArray(targets) ? targets : []);
      }
      if (resultsRes.ok) {
        const data = await resultsRes.json();
        setDiagnosisResults(Array.isArray(data) ? data : []);
      }
      if (recsRes.ok) {
        const data = await recsRes.json();
        setRecommendations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchSchools = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const token = getToken();
      const res = await fetch(`http://localhost:3000/api/school?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // API returns { schools: [...] } format
        const schools = data.schools || data;
        setSearchResults(Array.isArray(schools) ? schools : []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const addTargetSchool = async (schoolId: string) => {
    try {
      const token = getToken();
      console.log("Adding target school:", schoolId);
      
      const res = await fetch("http://localhost:3000/api/diagnosis/target-schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schoolId }),
      });
      
      console.log("Response status:", res.status);
      
      if (res.ok) {
        setIsSchoolSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        fetchData();
        alert("목표 학교가 추가되었습니다!");
      } else {
        const errorText = await res.text();
        console.error("Add school error:", errorText);
        alert(`학교 추가 실패: ${errorText}`);
      }
    } catch (error: any) {
      console.error("Add target school error:", error);
      alert(`오류: ${error.message}`);
    }
  };

  const removeTargetSchool = async (schoolId: string) => {
    try {
      const token = getToken();
      await fetch(`http://localhost:3000/api/diagnosis/target-schools/${schoolId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (error) {
      console.error("Remove target school error:", error);
    }
  };

  const runDiagnosis = async () => {
    setDiagnosing(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/api/diagnosis/run", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Diagnosis error:", error);
    } finally {
      setDiagnosing(false);
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case "FIT":
        return { variant: "success" as const, label: "적합", icon: TrendingUp };
      case "CHALLENGE":
        return { variant: "warning" as const, label: "도전", icon: Minus };
      case "UNLIKELY":
        return { variant: "danger" as const, label: "어려움", icon: TrendingDown };
      default:
        return { variant: "default" as const, label: result, icon: Minus };
    }
  };

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">입시 진단</h1>
            <p className="text-slate-500 mt-1">
              목표 학교를 설정하고 적합도를 진단받으세요
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsSchoolSearchOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              목표 학교 추가
            </Button>
            <Button
              onClick={runDiagnosis}
              isLoading={diagnosing}
              disabled={targetSchools.length === 0}
              leftIcon={<Play className="w-4 h-4" />}
            >
              진단 실행
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Target Schools */}
            <div className="lg:col-span-1 space-y-6">
              {/* Target Schools */}
              <Card>
                <CardHeader icon={<Target className="w-5 h-5" />}>
                  목표 학교
                </CardHeader>
                <CardContent>
                  {targetSchools.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <School className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 mb-4">
                        목표 학교가 없습니다
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsSchoolSearchOpen(true)}
                      >
                        학교 추가하기
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {targetSchools.map((target, index) => (
                        <div
                          key={target.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                        >
                          <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 font-medium text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900 truncate">
                                {target.school.name}
                              </p>
                              {target.school.website && (
                                <a
                                  href={target.school.website.startsWith('http') ? target.school.website : `http://${target.school.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1 text-sky-500 hover:text-sky-700 hover:bg-sky-100 rounded transition-colors"
                                  title="학교 홈페이지 방문"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              {target.school.region} · {target.school.type === 'SPECIAL' ? '특목고' : target.school.type === 'AUTONOMOUS' ? '자사고' : target.school.type}
                            </p>
                          </div>
                          <button
                            onClick={() => removeTargetSchool(target.school.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card>
                <CardHeader
                  icon={<Star className="w-5 h-5" />}
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchData}
                      leftIcon={<RefreshCw className="w-3 h-3" />}
                    >
                      새로고침
                    </Button>
                  }
                >
                  AI 추천 학교
                </CardHeader>
                <CardContent>
                  {recommendations.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                      데이터를 더 입력하면 추천을 받을 수 있습니다
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recommendations.slice(0, 3).map((rec, index) => (
                        <div
                          key={rec.school.id}
                          className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 font-medium text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900">
                              {rec.school.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {rec.reason}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 rounded-full"
                                  style={{ width: `${rec.score}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-amber-600">
                                {rec.score}%
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => addTargetSchool(rec.school.id)}
                            className="p-1.5 text-amber-500 hover:bg-amber-100 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Diagnosis Results */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader
                  icon={<TrendingUp className="w-5 h-5" />}
                  action={
                    diagnosisResults.length > 0 && (
                      <p className="text-sm text-slate-500">
                        마지막 진단: {diagnosisResults[0]?.createdAt || "없음"}
                      </p>
                    )
                  }
                >
                  진단 결과
                </CardHeader>
                <CardContent>
                  {diagnosisResults.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        진단 결과가 없습니다
                      </h3>
                      <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                        목표 학교를 설정하고 진단을 실행하면 
                        적합도 분석 결과를 확인할 수 있습니다
                      </p>
                      <Button
                        onClick={runDiagnosis}
                        disabled={targetSchools.length === 0}
                        leftIcon={<Play className="w-4 h-4" />}
                      >
                        진단 실행하기
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {diagnosisResults.map((result) => {
                        const badge = getResultBadge(result.result);
                        return (
                          <div
                            key={result.id}
                            className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors cursor-pointer"
                            onClick={() => setSelectedResult(result)}
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-slate-900">
                                      {result.school.name}
                                    </h3>
                                    <Badge variant={badge.variant}>
                                      <badge.icon className="w-3 h-3 mr-1" />
                                      {badge.label}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {result.school.region}
                                    </span>
                                    <span>{result.school.type}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-slate-900">
                                    {result.matchScore}
                                    <span className="text-sm font-normal text-slate-400">점</span>
                                  </div>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="mt-4">
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      result.result === "FIT"
                                        ? "bg-emerald-500"
                                        : result.result === "CHALLENGE"
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{ width: `${result.matchScore}%` }}
                                  />
                                </div>
                              </div>

                              {/* Quick Summary */}
                              <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs font-medium text-slate-500 mb-1">강점</p>
                                  <p className="text-sm text-emerald-600 truncate">
                                    {result.strengths[0] || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-slate-500 mb-1">보완점</p>
                                  <p className="text-sm text-amber-600 truncate">
                                    {result.weaknesses[0] || "-"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="px-4 py-2 bg-slate-50 flex items-center justify-between text-sm">
                              <span className="text-slate-500">자세히 보기</span>
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* School Search Modal */}
        <Modal
          isOpen={isSchoolSearchOpen}
          onClose={() => {
            setIsSchoolSearchOpen(false);
            setSearchQuery("");
            setSearchResults([]);
          }}
          title="목표 학교 검색"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              placeholder="학교 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchSchools(e.target.value);
              }}
              leftIcon={<Search className="w-4 h-4" />}
            />

            <div className="max-h-80 overflow-y-auto">
              {searching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-sky-600 border-t-transparent" />
                </div>
              ) : searchResults.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8">
                  {searchQuery ? "검색 결과가 없습니다" : "학교 이름을 입력하세요"}
                </p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((school) => (
                    <button
                      key={school.id}
                      onClick={() => addTargetSchool(school.id)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                        <School className="w-5 h-5 text-sky-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900">{school.name}</p>
                        <p className="text-sm text-slate-500">
                          {school.region} · {school.type}
                        </p>
                      </div>
                      <Plus className="w-5 h-5 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>

        {/* Result Detail Modal */}
        <Modal
          isOpen={!!selectedResult}
          onClose={() => setSelectedResult(null)}
          title={selectedResult?.school.name || "진단 결과"}
          size="xl"
        >
          {selectedResult && (
            <div className="space-y-6">
              {/* Score Header */}
              <div className="text-center p-6 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl">
                <div className="text-5xl font-bold text-slate-900 mb-2">
                  {selectedResult.matchScore}
                  <span className="text-xl font-normal text-slate-400">점</span>
                </div>
                <Badge variant={getResultBadge(selectedResult.result).variant} size="md">
                  {getResultBadge(selectedResult.result).label}
                </Badge>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-sky-500" />
                    영역별 분석
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        data={[
                          { subject: "성적", value: selectedResult.gradeScore || 75, fullMark: 100 },
                          { subject: "활동", value: selectedResult.activityScore || 70, fullMark: 100 },
                          { subject: "출결", value: selectedResult.attendanceScore || 90, fullMark: 100 },
                          { subject: "봉사", value: selectedResult.volunteerScore || 65, fullMark: 100 },
                          { subject: "종합", value: selectedResult.matchScore, fullMark: 100 },
                        ]}
                      >
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                        <Radar
                          name="점수"
                          dataKey="value"
                          stroke="#0ea5e9"
                          fill="#0ea5e9"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    점수 비교
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "성적", score: selectedResult.gradeScore || 75, color: "#0ea5e9" },
                          { name: "활동", score: selectedResult.activityScore || 70, color: "#8b5cf6" },
                          { name: "출결", score: selectedResult.attendanceScore || 90, color: "#10b981" },
                          { name: "봉사", score: selectedResult.volunteerScore || 65, color: "#f59e0b" },
                        ]}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
                        <YAxis dataKey="name" type="category" tick={{ fill: "#64748b", fontSize: 12 }} width={40} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value: number) => [`${value}점`, "점수"]}
                        />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                          {[
                            { name: "성적", color: "#0ea5e9" },
                            { name: "활동", color: "#8b5cf6" },
                            { name: "출결", color: "#10b981" },
                            { name: "봉사", color: "#f59e0b" },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Score Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "성적", score: selectedResult.gradeScore || 75, color: "sky" },
                  { label: "활동", score: selectedResult.activityScore || 70, color: "purple" },
                  { label: "출결", score: selectedResult.attendanceScore || 90, color: "emerald" },
                  { label: "봉사", score: selectedResult.volunteerScore || 65, color: "amber" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`p-3 rounded-xl border ${
                      item.color === "sky" ? "bg-sky-50 border-sky-200" :
                      item.color === "purple" ? "bg-purple-50 border-purple-200" :
                      item.color === "emerald" ? "bg-emerald-50 border-emerald-200" :
                      "bg-amber-50 border-amber-200"
                    }`}
                  >
                    <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                    <p className={`text-xl font-bold ${
                      item.color === "sky" ? "text-sky-600" :
                      item.color === "purple" ? "text-purple-600" :
                      item.color === "emerald" ? "text-emerald-600" :
                      "text-amber-600"
                    }`}>
                      {item.score}점
                    </p>
                  </div>
                ))}
              </div>

              {/* Strengths */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  강점
                </h4>
                <ul className="space-y-2">
                  {selectedResult.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-amber-500" />
                  보완점
                </h4>
                <ul className="space-y-2">
                  {selectedResult.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-sky-500" />
                  추천 사항
                </h4>
                <ul className="space-y-2">
                  {selectedResult.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
