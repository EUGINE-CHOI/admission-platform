"use client";

import { useEffect, useState } from "react";
import {
  Sparkles, BookOpen, Users, GraduationCap, FileText, Calendar, RefreshCw,
  Copy, Check, Clock, Zap, Target, Lightbulb, School, Brain, TrendingUp,
  Award, ChevronDown, ChevronUp, Star, MessageSquare, ArrowRight, Wand2,
  Send, Bot, User,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";

type AIFeature =
  | "quick-advice"
  | "comprehensive-analysis"
  | "school-recommendation"
  | "record-sentence"
  | "recommend-club"
  | "recommend-reading"
  | "action-plan";

const features = [
  {
    id: "quick-advice" as AIFeature,
    icon: MessageSquare,
    title: "빠른 질문",
    description: "무엇이든 물어보세요",
    gradient: "from-violet-500 to-purple-600",
    isNew: true,
  },
  {
    id: "comprehensive-analysis" as AIFeature,
    icon: Brain,
    title: "종합 분석",
    description: "전체 역량 분석",
    gradient: "from-cyan-500 to-blue-600",
    isNew: true,
  },
  {
    id: "school-recommendation" as AIFeature,
    icon: School,
    title: "학교 추천",
    description: "맞춤 학교 추천",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "record-sentence" as AIFeature,
    icon: FileText,
    title: "생기부 문장",
    description: "활동 기록 생성",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    id: "recommend-club" as AIFeature,
    icon: Users,
    title: "동아리 추천",
    description: "맞춤 동아리",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "recommend-reading" as AIFeature,
    icon: BookOpen,
    title: "독서 추천",
    description: "추천 도서 목록",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    id: "action-plan" as AIFeature,
    icon: Calendar,
    title: "액션 플랜",
    description: "12주 실행 계획",
    gradient: "from-sky-500 to-cyan-600",
  },
];

export default function AIAdvisePage() {
  const [selectedFeature, setSelectedFeature] = useState<AIFeature | null>(null);
  const [inputText, setInputText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [region, setRegion] = useState("");
  const [schoolTypes, setSchoolTypes] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const getToken = () => localStorage.getItem("token") || localStorage.getItem("accessToken");

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
          body = { interests: inputText.split(",").map((s) => s.trim()) };
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setOutput(data.output || data);
      } else {
        const error = await res.json();
        setOutput({ error: error.message || "AI 생성 중 오류가 발생했습니다." });
      }
    } catch (error) {
      console.error("AI generation error:", error);
      setOutput({ error: "AI 서비스에 연결할 수 없습니다." });
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
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const getPlaceholder = () => {
    switch (selectedFeature) {
      case "quick-advice":
        return "예: 과학고 가려면 뭘 준비해야 해?";
      case "record-sentence":
        return "활동 내용을 자세히 입력하세요...";
      case "recommend-club":
        return "예: 프로그래밍, 과학, 토론";
      case "recommend-reading":
        return "예: 과학, 철학, 역사";
      default:
        return "입력하세요...";
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

  const renderQuickTags = () => {
    const tags: Record<AIFeature, string[]> = {
      "quick-advice": ["과학고 준비법", "외고 vs 자사고", "내신 관리법", "비교과 추천"],
      "recommend-club": ["과학/수학", "프로그래밍", "토론/영어", "예술/음악", "봉사활동"],
      "recommend-reading": ["과학", "인문학", "경제", "자기계발", "문학"],
      "record-sentence": [],
      "comprehensive-analysis": [],
      "school-recommendation": [],
      "action-plan": [],
    };

    const currentTags = selectedFeature ? tags[selectedFeature] : [];
    if (currentTags.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {currentTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setInputText(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              inputText === tag
                ? "bg-violet-500 text-white"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    );
  };

  const renderOutput = () => {
    if (!output) return null;

    if (output.error) {
      return (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400">{output.error}</p>
        </div>
      );
    }

    const advice = output.advice || output.analysis || output;
    const content = advice.raw || advice.greeting || JSON.stringify(output, null, 2);

    return (
      <div className="space-y-4">
        {/* AI Response Header */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-white">AI 멘토</span>
          <button
            onClick={copyToClipboard}
            className="ml-auto p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
          {/* Greeting */}
          {advice.greeting && (
            <div className="mb-6 p-4 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-xl border border-violet-500/20">
              <p className="text-violet-300 font-medium">{advice.greeting}</p>
            </div>
          )}

          {/* Current Status */}
          {advice.currentStatus && (
            <p className="text-slate-400 mb-6">{advice.currentStatus}</p>
          )}

          {/* Main Advice */}
          {advice.mainAdvice && (
            <div className="space-y-4 mb-6">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                핵심 조언
              </h4>
              {advice.mainAdvice.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-white/[0.03] rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                >
                  <h5 className="font-medium text-white mb-2">{item.title}</h5>
                  <p className="text-slate-400 text-sm mb-3">{item.content}</p>
                  {item.actionable && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 rounded-lg w-fit">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-sm">{item.actionable}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Weekly Goals */}
          {advice.weeklyGoals && (
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                이번 주 목표
              </h4>
              <div className="space-y-2">
                {advice.weeklyGoals.map((goal: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20"
                  >
                    <div className="w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <span className="text-slate-300">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Encouragement */}
          {advice.encouragement && (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
              <p className="text-amber-300 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                {advice.encouragement}
              </p>
            </div>
          )}

          {/* Next Step */}
          {advice.nextStep && (
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
              <h5 className="text-emerald-400 font-medium mb-1">다음 단계</h5>
              <p className="text-emerald-300/80">{advice.nextStep}</p>
            </div>
          )}

          {/* Raw content fallback */}
          {!advice.greeting && !advice.mainAdvice && (
            <pre className="text-slate-300 whitespace-pre-wrap text-sm">
              {typeof content === "string" ? content : JSON.stringify(content, null, 2)}
            </pre>
          )}
        </div>
      </div>
    );
  };

  const selectedFeatureData = features.find((f) => f.id === selectedFeature);

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-transparent border border-white/10 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-[80px]" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI 멘토</h1>
                <p className="text-slate-400 text-sm">맞춤형 입시 전략을 제안합니다</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-medium">온라인</span>
              </div>
              <span className="text-slate-500 text-xs">Gemini AI</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => {
                setSelectedFeature(feature.id);
                setOutput(null);
                setInputText("");
              }}
              className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
                selectedFeature === feature.id
                  ? "bg-white/[0.08] border-white/20 scale-[1.02]"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
              }`}
            >
              {feature.isNew && (
                <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[9px] font-bold rounded-full shadow-lg">
                  NEW
                </span>
              )}
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}
              >
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-medium text-white text-sm mb-0.5">{feature.title}</h3>
              <p className="text-[10px] text-slate-500 leading-tight">{feature.description}</p>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input & Output Section */}
          <div className="lg:col-span-2 space-y-6">
            {selectedFeature ? (
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                {/* Feature Header */}
                <div
                  className={`p-6 bg-gradient-to-r ${selectedFeatureData?.gradient} bg-opacity-10`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedFeatureData?.gradient} flex items-center justify-center shadow-lg`}
                    >
                      {selectedFeatureData && <selectedFeatureData.icon className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {selectedFeatureData?.title}
                      </h2>
                      <p className="text-sm text-slate-400">{selectedFeatureData?.description}</p>
                    </div>
                  </div>
                </div>

                {/* Input Section */}
                <div className="p-6 border-b border-white/5">
                  {renderQuickTags()}

                  {selectedFeature === "comprehensive-analysis" ||
                  selectedFeature === "action-plan" ? (
                    <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                      <p className="text-slate-400 text-sm flex items-center gap-2">
                        <Brain className="w-4 h-4 text-cyan-400" />
                        {selectedFeature === "comprehensive-analysis"
                          ? "입력된 성적, 활동, 목표학교를 분석합니다"
                          : "12주 맞춤형 실행 계획을 생성합니다"}
                      </p>
                    </div>
                  ) : selectedFeature === "school-recommendation" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">선호 지역</label>
                        <select
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50"
                        >
                          <option value="" className="bg-slate-900">전체</option>
                          <option value="서울" className="bg-slate-900">서울</option>
                          <option value="경기" className="bg-slate-900">경기</option>
                          <option value="인천" className="bg-slate-900">인천</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">학교 유형</label>
                        <div className="flex flex-wrap gap-2">
                          {["과학고", "외고", "국제고", "자사고", "예고"].map((type, i) => {
                            const typeKey = ["SCIENCE", "FOREIGN_LANGUAGE", "INTERNATIONAL", "AUTONOMOUS_PRIVATE", "ARTS"][i];
                            return (
                              <button
                                key={type}
                                onClick={() =>
                                  setSchoolTypes((prev) =>
                                    prev.includes(typeKey)
                                      ? prev.filter((t) => t !== typeKey)
                                      : [...prev, typeKey]
                                  )
                                }
                                className={`px-4 py-2 rounded-xl text-sm transition-all ${
                                  schoolTypes.includes(typeKey)
                                    ? "bg-emerald-500 text-white"
                                    : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
                                }`}
                              >
                                {type}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={getPlaceholder()}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 resize-none"
                      />
                    </div>
                  )}

                  <button
                    onClick={generateAI}
                    disabled={generating || !canGenerate()}
                    className={`mt-4 w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      generating || !canGenerate()
                        ? "bg-white/5 text-slate-500 cursor-not-allowed"
                        : `bg-gradient-to-r ${selectedFeatureData?.gradient} text-white hover:opacity-90 shadow-lg`
                    }`}
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        분석 중...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        AI 생성
                      </>
                    )}
                  </button>
                </div>

                {/* Output Section */}
                {output && <div className="p-6">{renderOutput()}</div>}
              </div>
            ) : (
              <div className="h-[500px] bg-white/[0.02] border border-white/10 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">AI 기능 선택</h3>
                  <p className="text-slate-500 max-w-xs">
                    위에서 원하는 기능을 선택하면 AI가 맞춤형 분석을 제공합니다
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Status Card */}
            <div className="p-6 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">AI 상태</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400">정상 운영 중</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Gemini AI가 학생 데이터를 분석하여 맞춤형 전략을 제안합니다.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                <div className="text-2xl font-bold text-white mb-1">24/7</div>
                <div className="text-xs text-slate-500">항상 가능</div>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
                <div className="text-2xl font-bold text-white mb-1">~3초</div>
                <div className="text-xs text-slate-500">응답 시간</div>
              </div>
            </div>

            {/* Tips */}
            <div className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">💡 팁</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    성적, 활동, 목표학교를 많이 입력할수록 더 정확한 분석을 받을 수 있어요!
                  </p>
                </div>
              </div>
            </div>

            {/* Popular Questions */}
            <div className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                인기 질문
              </h4>
              <div className="space-y-2">
                {[
                  "과학고 입시 전략이 뭐야?",
                  "비교과 활동 추천해줘",
                  "면접 준비는 어떻게?",
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedFeature("quick-advice");
                      setInputText(q);
                    }}
                    className="w-full p-3 text-left text-sm text-slate-400 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/5 hover:border-white/10 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
