"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  Calendar,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Clock,
  Zap,
  Target,
  Lightbulb,
  School,
  Brain,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Star,
  MessageSquare,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Textarea, Select, Input } from "@/components/ui";
import { Badge } from "@/components/ui";

type AIFeature = 
  | "quick-advice" 
  | "comprehensive-analysis" 
  | "school-recommendation" 
  | "record-sentence" 
  | "recommend-club" 
  | "advice-subject" 
  | "recommend-reading" 
  | "action-plan";

interface AIOutput {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  feedback?: "positive" | "negative";
}

const features = [
  {
    id: "quick-advice" as AIFeature,
    icon: MessageSquare,
    title: "빠른 조언",
    description: "궁금한 것을 물어보세요",
    color: "violet",
    isNew: true,
  },
  {
    id: "comprehensive-analysis" as AIFeature,
    icon: Brain,
    title: "종합 분석",
    description: "학업/활동/진로 전체 분석",
    color: "sky",
    isNew: true,
  },
  {
    id: "school-recommendation" as AIFeature,
    icon: School,
    title: "학교 추천",
    description: "AI가 추천하는 적합한 학교",
    color: "emerald",
    isNew: true,
  },
  {
    id: "record-sentence" as AIFeature,
    icon: FileText,
    title: "생기부 문장",
    description: "활동 기반 문장 생성",
    color: "indigo",
  },
  {
    id: "recommend-club" as AIFeature,
    icon: Users,
    title: "동아리 추천",
    description: "관심사 기반 동아리 추천",
    color: "amber",
  },
  {
    id: "recommend-reading" as AIFeature,
    icon: BookOpen,
    title: "독서 추천",
    description: "진로 맞춤 도서 추천",
    color: "rose",
  },
  {
    id: "action-plan" as AIFeature,
    icon: Calendar,
    title: "액션 플랜",
    description: "12주 실행 계획 생성",
    color: "cyan",
  },
];

const colorClasses: Record<string, { bg: string; text: string; light: string }> = {
  violet: { bg: "bg-violet-100", text: "text-violet-600", light: "bg-violet-50" },
  sky: { bg: "bg-sky-100", text: "text-sky-600", light: "bg-sky-50" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600", light: "bg-emerald-50" },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-600", light: "bg-indigo-50" },
  amber: { bg: "bg-amber-100", text: "text-amber-600", light: "bg-amber-50" },
  rose: { bg: "bg-rose-100", text: "text-rose-600", light: "bg-rose-50" },
  cyan: { bg: "bg-cyan-100", text: "text-cyan-600", light: "bg-cyan-50" },
};

export default function AIAdvisePage() {
  const [selectedFeature, setSelectedFeature] = useState<AIFeature | null>(null);
  const [inputText, setInputText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [history, setHistory] = useState<AIOutput[]>([]);
  const [copied, setCopied] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [region, setRegion] = useState("");
  const [schoolTypes, setSchoolTypes] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  useEffect(() => {
    fetchHistory();
    fetchActivities();
  }, []);

  const getToken = () => localStorage.getItem("accessToken");

  const fetchHistory = async () => {
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/api/ai/record-sentence/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.outputs || []);
      }
    } catch (error) {
      console.error("Fetch history error:", error);
    }
  };

  const fetchActivities = async () => {
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/api/student/activities", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Fetch activities error:", error);
    }
  };

  const generateAI = async () => {
    if (!selectedFeature) return;
    
    setGenerating(true);
    setOutput(null);
    
    try {
      const token = getToken();
      let endpoint = "";
      let body: any = {};

      switch (selectedFeature) {
        case "quick-advice":
          endpoint = "http://localhost:3000/api/ai/advice/quick";
          body = { topic: inputText };
          break;
        case "comprehensive-analysis":
          endpoint = "http://localhost:3000/api/ai/analysis/comprehensive";
          body = {};
          break;
        case "school-recommendation":
          endpoint = "http://localhost:3000/api/ai/recommend/school";
          body = { region, schoolTypes };
          break;
        case "record-sentence":
          endpoint = selectedActivityId 
            ? `http://localhost:3000/api/ai/record-sentence/${selectedActivityId}`
            : "http://localhost:3000/api/ai/record-sentence";
          body = { activityDescription: inputText };
          break;
        case "recommend-club":
          endpoint = "http://localhost:3000/api/ai/recommend/club";
          body = { interests: inputText.split(",").map(s => s.trim()) };
          break;
        case "recommend-reading":
          endpoint = "http://localhost:3000/api/ai/recommend/reading";
          body = { genre: inputText };
          break;
        case "action-plan":
          endpoint = "http://localhost:3000/api/ai/action-plan";
          body = {};
          break;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setOutput(data.output || data);
        fetchHistory();
      } else {
        const error = await res.json();
        setOutput({ error: error.message || "AI 생성 중 오류가 발생했습니다." });
      }
    } catch (error) {
      console.error("AI generation error:", error);
      setOutput({ error: "AI 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요." });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const renderQuickAdviceResult = (data: any) => {
    const advice = data.advice || data;
    if (advice.raw) return <p className="whitespace-pre-wrap">{advice.raw}</p>;
    
    return (
      <div className="space-y-6">
        {advice.greeting && (
          <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl">
            <p className="text-lg font-medium text-violet-800">{advice.greeting}</p>
          </div>
        )}
        
        {advice.currentStatus && (
          <p className="text-slate-600">{advice.currentStatus}</p>
        )}

        {advice.mainAdvice && (
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              주요 조언
            </h4>
            {advice.mainAdvice.map((item: any, idx: number) => (
              <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <h5 className="font-medium text-slate-900 mb-2">{item.title}</h5>
                <p className="text-slate-600 text-sm mb-2">{item.content}</p>
                {item.actionable && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                    <Zap className="w-4 h-4" />
                    {item.actionable}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {advice.weeklyGoals && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-sky-500" />
              이번 주 목표
            </h4>
            <div className="space-y-2">
              {advice.weeklyGoals.map((goal: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-medium">
                    {idx + 1}
                  </div>
                  <span className="text-slate-700">{goal}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {advice.encouragement && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
            <p className="text-amber-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              {advice.encouragement}
            </p>
          </div>
        )}

        {advice.nextStep && (
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
            <h4 className="font-medium text-emerald-800 mb-1">다음 단계</h4>
            <p className="text-emerald-700">{advice.nextStep}</p>
          </div>
        )}
      </div>
    );
  };

  const renderComprehensiveAnalysis = (data: any) => {
    const analysis = data.analysis || data;
    if (analysis.raw) return <p className="whitespace-pre-wrap">{analysis.raw}</p>;

    return (
      <div className="space-y-6">
        {/* Overall Assessment */}
        {analysis.overallAssessment && (
          <div className="p-6 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-lg text-slate-900">종합 평가</h4>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-sky-600">
                  {analysis.overallAssessment.score}
                </span>
                <span className="text-slate-500">/100</span>
                <Badge variant={
                  analysis.overallAssessment.grade === 'A' ? 'success' :
                  analysis.overallAssessment.grade === 'B' ? 'info' :
                  analysis.overallAssessment.grade === 'C' ? 'warning' : 'danger'
                } size="lg">
                  {analysis.overallAssessment.grade}등급
                </Badge>
              </div>
            </div>
            <p className="text-slate-600">{analysis.overallAssessment.summary}</p>
          </div>
        )}

        {/* Academic Analysis */}
        {analysis.academicAnalysis && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('academic')}
              className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="font-semibold text-slate-900">학업 분석</span>
              </div>
              {expandedSections.includes('academic') ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>
            {expandedSections.includes('academic') && (
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <h5 className="text-sm font-medium text-emerald-800 mb-2">강점 과목</h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.academicAnalysis.strengths?.map((s: string, i: number) => (
                        <Badge key={i} variant="success">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h5 className="text-sm font-medium text-red-800 mb-2">보완 필요</h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.academicAnalysis.weaknesses?.map((w: string, i: number) => (
                        <Badge key={i} variant="danger">{w}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    성적 추세: <strong>{analysis.academicAnalysis.trend}</strong>
                  </span>
                </div>
                <p className="text-slate-600 text-sm">{analysis.academicAnalysis.advice}</p>
              </div>
            )}
          </div>
        )}

        {/* Activity Analysis */}
        {analysis.activityAnalysis && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('activity')}
              className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <span className="font-semibold text-slate-900">비교과 활동 분석</span>
              </div>
              {expandedSections.includes('activity') ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>
            {expandedSections.includes('activity') && (
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-xs text-slate-500">다양성</span>
                    <p className="font-medium text-slate-900">{analysis.activityAnalysis.diversity}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-xs text-slate-500">심화도</span>
                    <p className="font-medium text-slate-900">{analysis.activityAnalysis.depth}</p>
                  </div>
                </div>
                <h5 className="text-sm font-medium text-slate-700 mb-2">추천 활동</h5>
                <div className="flex flex-wrap gap-2">
                  {analysis.activityAnalysis.recommendations?.map((r: string, i: number) => (
                    <Badge key={i} variant="info">{r}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* School Fit Analysis */}
        {analysis.schoolFitAnalysis && analysis.schoolFitAnalysis.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('schoolFit')}
              className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <School className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="font-semibold text-slate-900">목표 학교 적합도</span>
              </div>
              {expandedSections.includes('schoolFit') ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>
            {expandedSections.includes('schoolFit') && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
                {analysis.schoolFitAnalysis.map((school: any, idx: number) => (
                  <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-slate-900">{school.schoolName}</h5>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          school.fitLevel === '최적합' ? 'success' :
                          school.fitLevel === '적합' ? 'info' :
                          school.fitLevel === '도전' ? 'warning' : 'danger'
                        }>
                          {school.fitLevel}
                        </Badge>
                        <span className="text-lg font-bold text-sky-600">{school.probability}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-500">주요 요인: </span>
                        <span className="text-slate-700">{school.keyFactors?.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">개선 필요: </span>
                        <span className="text-red-600">{school.improvementAreas?.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Items */}
        {analysis.actionItems && analysis.actionItems.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-rose-500" />
              실천 과제
            </h4>
            <div className="space-y-2">
              {analysis.actionItems.map((item: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <Badge variant={
                    item.priority === 'high' ? 'danger' :
                    item.priority === 'medium' ? 'warning' : 'info'
                  } size="sm">
                    {item.priority === 'high' ? '긴급' : item.priority === 'medium' ? '중요' : '권장'}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-slate-700">{item.task}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.category} • {item.timeline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivational Message */}
        {analysis.motivationalMessage && (
          <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
            <p className="text-violet-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-violet-500" />
              {analysis.motivationalMessage}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderSchoolRecommendations = (data: any) => {
    const recommendations = data.recommendations || [];
    const alternatives = data.alternativeOptions || [];
    const generalAdvice = data.generalAdvice || '';

    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {recommendations.map((school: any, idx: number) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border-2 ${
                idx === 0 ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50' :
                idx === 1 ? 'border-slate-300 bg-gradient-to-r from-slate-50 to-gray-50' :
                idx === 2 ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50' :
                'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    idx === 0 ? 'bg-amber-500' :
                    idx === 1 ? 'bg-slate-400' :
                    idx === 2 ? 'bg-orange-400' : 'bg-sky-500'
                  }`}>
                    {school.rank}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{school.schoolName}</h4>
                    <p className="text-sm text-slate-500">{school.schoolType} • {school.region}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-sky-600">{school.fitScore}</div>
                  <Badge variant={
                    school.fitLevel === '최적합' ? 'success' :
                    school.fitLevel === '적합' ? 'info' :
                    school.fitLevel === '도전' ? 'warning' : 'danger'
                  }>
                    {school.fitLevel}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-slate-700 mb-1">추천 이유</h5>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {school.reasons?.map((reason: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-slate-700 mb-1">합격을 위해 필요한 것</h5>
                  <div className="flex flex-wrap gap-2">
                    {school.requirements?.map((req: string, i: number) => (
                      <Badge key={i} variant="outline">{req}</Badge>
                    ))}
                  </div>
                </div>

                {school.admissionTips && (
                  <div className="p-3 bg-sky-50 rounded-lg">
                    <p className="text-sm text-sky-700">
                      <Lightbulb className="w-4 h-4 inline mr-1" />
                      {school.admissionTips}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {alternatives.length > 0 && (
          <div>
            <h4 className="font-medium text-slate-900 mb-3">대안 학교</h4>
            <div className="flex flex-wrap gap-3">
              {alternatives.map((alt: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-100 rounded-lg">
                  <span className="font-medium text-slate-800">{alt.schoolName}</span>
                  <p className="text-xs text-slate-500 mt-1">{alt.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {generalAdvice && (
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
            <h4 className="font-medium text-indigo-800 mb-2">전략 조언</h4>
            <p className="text-indigo-700 text-sm">{generalAdvice}</p>
          </div>
        )}
      </div>
    );
  };

  const renderClubRecommendations = (data: any) => {
    const recommendations = data.recommendations || [];
    const additionalAdvice = data.additionalAdvice || '';

    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {recommendations.map((club: any, idx: number) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{club.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="info">{club.category}</Badge>
                      <Badge variant="outline">{club.type}</Badge>
                    </div>
                  </div>
                </div>
                {club.matchScore && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-600">{club.matchScore}%</div>
                    <span className="text-xs text-slate-500">적합도</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">추천 이유</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{club.reason}</p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">주요 활동</h5>
                  <div className="flex flex-wrap gap-2">
                    {club.activities?.map((activity: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white dark:bg-slate-700 rounded-full text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>

                {club.benefits && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">입시 어필 포인트</h5>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {club.benefits.map((benefit: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {club.recordExample && (
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h5 className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">📝 생기부 기재 예시</h5>
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">{club.recordExample}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {additionalAdvice && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
            <h4 className="font-medium text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              동아리 활동 조언
            </h4>
            <p className="text-amber-700 dark:text-amber-300 text-sm">{additionalAdvice}</p>
          </div>
        )}
      </div>
    );
  };

  const renderReadingRecommendations = (data: any) => {
    const books = data.books || [];
    const readingStrategy = data.readingStrategy || '';
    const monthlyGoal = data.monthlyGoal || '';

    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {books.map((book: any, idx: number) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border-2 border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center text-white">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{book.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{book.author} {book.publisher && `| ${book.publisher}`}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="info">{book.genre}</Badge>
                      {book.difficulty && <Badge variant="outline">{book.difficulty}</Badge>}
                      {book.pageCount && <span className="text-xs text-slate-400">{book.pageCount}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">추천 이유</h5>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{book.reason}</p>
                </div>

                {book.keyPoints && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">핵심 내용</h5>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {book.keyPoints.map((point: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {book.relatedSubjects && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">관련 교과목</h5>
                    <div className="flex flex-wrap gap-2">
                      {book.relatedSubjects.map((subject: string, i: number) => (
                        <Badge key={i} variant="success">{subject}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {book.discussionTopics && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">독후 토론 주제</h5>
                    <div className="flex flex-wrap gap-2">
                      {book.discussionTopics.map((topic: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-white dark:bg-slate-700 rounded-full text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                          💬 {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {book.activityIdeas && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">독후 활동 아이디어</h5>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {book.activityIdeas.map((idea: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <Zap className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          {idea}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {book.interviewTip && (
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-rose-200 dark:border-rose-800">
                    <h5 className="text-xs font-medium text-rose-700 dark:text-rose-400 mb-1">🎤 면접 활용 팁</h5>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{book.interviewTip}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {readingStrategy && (
            <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl">
              <h4 className="font-medium text-rose-800 dark:text-rose-400 mb-2 flex items-center gap-2">
                <Target className="w-5 h-5" />
                독서 전략
              </h4>
              <p className="text-rose-700 dark:text-rose-300 text-sm">{readingStrategy}</p>
            </div>
          )}
          {monthlyGoal && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl">
              <h4 className="font-medium text-purple-800 dark:text-purple-400 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                월간 목표
              </h4>
              <p className="text-purple-700 dark:text-purple-300 text-sm">{monthlyGoal}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOutput = () => {
    if (!output) return null;
    
    if (output.error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600">{output.error}</p>
        </div>
      );
    }

    switch (selectedFeature) {
      case "quick-advice":
        return renderQuickAdviceResult(output);
      case "comprehensive-analysis":
        return renderComprehensiveAnalysis(output);
      case "school-recommendation":
        return renderSchoolRecommendations(output);
      case "recommend-club":
        return renderClubRecommendations(output);
      case "recommend-reading":
        return renderReadingRecommendations(output);
      default:
        return (
          <div className="p-4 bg-slate-50 rounded-xl">
            <pre className="whitespace-pre-wrap text-sm text-slate-700">
              {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
            </pre>
          </div>
        );
    }
  };

  const getPlaceholder = () => {
    switch (selectedFeature) {
      case "quick-advice":
        return "궁금한 것을 자유롭게 입력하세요. 예: 과학고 가려면 뭘 준비해야 해?, 수학 성적 올리는 방법";
      case "record-sentence":
        return "활동 내용을 입력하세요. 예: 과학 탐구 동아리에서 환경 문제 해결 프로젝트...";
      case "recommend-club":
        return "관심사를 쉼표로 구분하여 입력하세요. 예: 프로그래밍, 인공지능, 로봇";
      case "recommend-reading":
        return "관심 분야를 입력하세요. 예: 철학, 과학, 역사, 문학 등";
      default:
        return "입력하세요...";
    }
  };

  const renderInputSection = () => {
    switch (selectedFeature) {
      case "comprehensive-analysis":
        return (
          <div className="p-4 bg-sky-50 rounded-xl">
            <p className="text-sky-700 text-sm">
              <Brain className="w-4 h-4 inline mr-2" />
              버튼을 클릭하면 현재까지 입력된 모든 데이터(성적, 활동, 목표학교 등)를 분석하여 종합적인 평가를 제공합니다.
            </p>
          </div>
        );
      case "school-recommendation":
        return (
          <div className="space-y-4">
            <Select
              label="선호 지역 (선택)"
              options={[
                { value: "", label: "전체 지역" },
                { value: "서울", label: "서울" },
                { value: "경기", label: "경기" },
                { value: "인천", label: "인천" },
                { value: "부산", label: "부산" },
                { value: "대구", label: "대구" },
                { value: "대전", label: "대전" },
                { value: "광주", label: "광주" },
              ]}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                선호 학교 유형 (선택)
              </label>
              <div className="flex flex-wrap gap-2">
                {['SCIENCE', 'FOREIGN_LANGUAGE', 'INTERNATIONAL', 'ARTS', 'AUTONOMOUS_PRIVATE'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSchoolTypes(prev => 
                      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                    )}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      schoolTypes.includes(type)
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type === 'SCIENCE' ? '과학고' :
                     type === 'FOREIGN_LANGUAGE' ? '외국어고' :
                     type === 'INTERNATIONAL' ? '국제고' :
                     type === 'ARTS' ? '예술고' : '자사고'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case "action-plan":
        return (
          <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
            <p className="text-cyan-700 dark:text-cyan-300 text-sm">
              <Calendar className="w-4 h-4 inline mr-2" />
              진단 결과와 목표 학교를 기반으로 12주 맞춤형 액션 플랜을 생성합니다.
            </p>
          </div>
        );
      case "recommend-club":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                <Users className="w-4 h-4 inline mr-2" />
                관심사를 입력하면 목표 학교와 성적을 고려한 맞춤형 동아리를 추천해드립니다.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                관심 분야 선택 (복수 선택 가능)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {['과학/수학', '프로그래밍/IT', '언어/토론', '예술/음악', '체육/스포츠', '봉사/사회', '경제/경영', '역사/문화'].map((interest) => (
                  <button
                    key={interest}
                    onClick={() => {
                      const interests = inputText.split(',').map(s => s.trim()).filter(s => s);
                      if (interests.includes(interest)) {
                        setInputText(interests.filter(i => i !== interest).join(', '));
                      } else {
                        setInputText([...interests, interest].join(', '));
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      inputText.includes(interest)
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              label="추가 관심사 (직접 입력)"
              placeholder="위에서 선택하거나 직접 입력하세요. 예: 로봇공학, 인공지능, 환경문제"
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
        );
      case "recommend-reading":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
              <p className="text-rose-700 dark:text-rose-300 text-sm">
                <BookOpen className="w-4 h-4 inline mr-2" />
                관심 분야와 목적을 입력하면 입시에 도움이 되는 맞춤형 도서를 추천해드립니다.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                관심 장르 선택
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {['과학', '수학', '철학', '역사', '문학', '사회과학', '경제/경영', '예술', '자기계발', '에세이'].map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setInputText(genre)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      inputText === genre
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              label="관심 분야 / 독서 목적"
              placeholder="예: 과학고 입시를 위한 과학 교양서, 면접 대비를 위한 시사 도서"
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
        );
      case "record-sentence":
        return (
          <div className="space-y-4">
            {activities.length > 0 && (
              <Select
                label="활동 선택 (선택사항)"
                options={[
                  { value: "", label: "직접 입력" },
                  ...activities.map((a) => ({
                    value: a.id,
                    label: a.title,
                  })),
                ]}
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
              />
            )}
            <Textarea
              label="활동 내용"
              placeholder={getPlaceholder()}
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
        );
      default:
        return (
          <Textarea
            label="입력"
            placeholder={getPlaceholder()}
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        );
    }
  };

  const canGenerate = () => {
    switch (selectedFeature) {
      case "comprehensive-analysis":
      case "action-plan":
      case "school-recommendation":
        return true;
      default:
        return inputText.trim().length > 0;
    }
  };

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI 조언</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            AI가 맞춤형 분석과 조언을 제공합니다
          </p>
        </div>

        {/* Feature Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {features.map((feature) => {
            const colors = colorClasses[feature.color];
            return (
              <button
                key={feature.id}
                onClick={() => {
                  setSelectedFeature(feature.id);
                  setOutput(null);
                  setInputText("");
                  setExpandedSections([]);
                }}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  selectedFeature === feature.id
                    ? `border-${feature.color}-500 ${colors.light}`
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800"
                }`}
              >
                {feature.isNew && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full">
                    NEW
                  </span>
                )}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colors.bg} ${colors.text}`}>
                  <feature.icon className="w-4 h-4" />
                </div>
                <h3 className="font-medium text-slate-900 dark:text-white text-sm">
                  {feature.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {feature.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {selectedFeature ? (
              <Card>
                <CardHeader
                  icon={<Sparkles className="w-5 h-5" />}
                >
                  {features.find((f) => f.id === selectedFeature)?.title}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {renderInputSection()}

                    <div className="flex justify-end">
                      <Button
                        onClick={generateAI}
                        isLoading={generating}
                        disabled={!canGenerate()}
                        leftIcon={<Zap className="w-4 h-4" />}
                      >
                        {generating ? "분석 중..." : "AI 생성"}
                      </Button>
                    </div>

                    {/* Output */}
                    {output && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-900 dark:text-white">결과</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyToClipboard}
                            leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          >
                            {copied ? "복사됨" : "복사"}
                          </Button>
                        </div>
                        {renderOutput()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-violet-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    AI 기능을 선택하세요
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    위에서 원하는 AI 기능을 선택하면 맞춤형 분석과 조언을 받을 수 있습니다
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Status */}
            <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-100 dark:border-violet-800">
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-800 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">AI 상태</h4>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">활성화됨</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  GPT 기반 AI가 학생의 데이터를 분석하여 맞춤형 조언을 제공합니다.
                </p>
              </CardContent>
            </Card>

            {/* History */}
            <Card className="h-fit">
              <CardHeader
                icon={<Clock className="w-5 h-5" />}
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchHistory}
                    leftIcon={<RefreshCw className="w-3 h-3" />}
                  >
                    새로고침
                  </Button>
                }
              >
                최근 기록
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                    아직 생성된 내용이 없습니다
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {history.slice(0, 10).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" size="sm">
                            {item.type}
                          </Badge>
                          <span className="text-xs text-slate-400">{item.createdAt}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                          {item.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-100 dark:border-amber-800">
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-1">💡 팁</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      성적, 활동, 목표학교 데이터를 많이 입력할수록 AI가 더 정확한 분석을 제공합니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
