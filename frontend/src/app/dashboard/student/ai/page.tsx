"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import {
  Sparkles, Users, RefreshCw,
  Copy, Check, Zap, Target, Lightbulb, Brain,
  Star, MessageCircle, Send, Bot, Compass, Rocket, 
  PenTool, Library, ClipboardList, GraduationCap,
} from "lucide-react";

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
    icon: MessageCircle,
    title: "빠른 질문",
    description: "무엇이든 물어보세요",
    gradient: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    textColor: "text-violet-400",
    isNew: true,
  },
  {
    id: "comprehensive-analysis" as AIFeature,
    icon: Compass,
    title: "종합 분석",
    description: "학업/활동 역량 분석",
    gradient: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    textColor: "text-cyan-400",
    isNew: true,
  },
  {
    id: "school-recommendation" as AIFeature,
    icon: GraduationCap,
    title: "학교 추천",
    description: "맞춤 학교 찾기",
    gradient: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    textColor: "text-emerald-400",
  },
  {
    id: "record-sentence" as AIFeature,
    icon: PenTool,
    title: "생기부 작성",
    description: "활동 기록 문장 생성",
    gradient: "from-indigo-500 to-violet-600",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    textColor: "text-indigo-400",
  },
  {
    id: "recommend-club" as AIFeature,
    icon: Users,
    title: "동아리 추천",
    description: "맞춤 동아리 찾기",
    gradient: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-400",
  },
  {
    id: "recommend-reading" as AIFeature,
    icon: Library,
    title: "독서 추천",
    description: "입시용 도서 추천",
    gradient: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    textColor: "text-rose-400",
  },
  {
    id: "action-plan" as AIFeature,
    icon: ClipboardList,
    title: "실행 계획",
    description: "12주 맞춤 플랜",
    gradient: "from-sky-500 to-cyan-600",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
    textColor: "text-sky-400",
  },
];

export default function AIAdvisePage() {
  const router = useRouter();
  const [selectedFeature, setSelectedFeature] = useState<AIFeature | null>(null);
  const [inputText, setInputText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [region, setRegion] = useState("");
  const [schoolTypes, setSchoolTypes] = useState<string[]>([]);

  const getToken = () => localStorage.getItem("token") || localStorage.getItem("accessToken");

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
          endpoint = "http://localhost:3000/api/ai/record-sentence";
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

  const getPlaceholder = () => {
    switch (selectedFeature) {
      case "quick-advice":
        return "예: 과학고 입시 준비는 어떻게 해야 할까요?";
      case "record-sentence":
        return "활동 내용을 자세히 입력하세요...";
      case "recommend-club":
        return "예: 과학, 프로그래밍, 토론";
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

  const quickTags: Record<string, string[]> = {
    "quick-advice": ["과학고 준비법", "외고 vs 자사고", "내신 관리법", "면접 준비"],
    "recommend-club": ["과학/수학", "프로그래밍", "토론/영어", "예술", "봉사"],
    "recommend-reading": ["과학", "인문학", "경제", "문학", "자기계발"],
  };

  const renderQuickTags = () => {
    const tags = selectedFeature ? quickTags[selectedFeature] : [];
    if (!tags || tags.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setInputText(tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              inputText === tag
                ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600"
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
        <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <p className="text-red-400 text-lg">{output.error}</p>
        </div>
      );
    }

    const advice = output.advice || output.analysis || output;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">AI 멘토 응답</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-slate-300 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span className="text-sm">{copied ? "복사됨" : "복사"}</span>
          </button>
        </div>

        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-6">
          {advice.greeting && (
            <div className="p-5 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-xl border border-violet-500/30">
              <p className="text-violet-300 text-lg font-medium">{advice.greeting}</p>
            </div>
          )}

          {advice.currentStatus && (
            <p className="text-slate-300 text-lg leading-relaxed">{advice.currentStatus}</p>
          )}

          {advice.mainAdvice && (
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-white flex items-center gap-3">
                <Lightbulb className="w-6 h-6 text-amber-400" />
                핵심 조언
              </h4>
              {advice.mainAdvice.map((item: any, idx: number) => (
                <div key={idx} className="p-5 bg-slate-700/30 rounded-xl border border-slate-600/50">
                  <h5 className="text-lg font-semibold text-white mb-3">{item.title}</h5>
                  <p className="text-slate-300 mb-4 leading-relaxed">{item.content}</p>
                  {item.actionable && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                      <Zap className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-300">{item.actionable}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {advice.weeklyGoals && (
            <div className="space-y-3">
              <h4 className="text-xl font-bold text-white flex items-center gap-3">
                <Target className="w-6 h-6 text-cyan-400" />
                이번 주 목표
              </h4>
              {advice.weeklyGoals.map((goal: string, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                  <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <span className="text-slate-200 text-lg">{goal}</span>
                </div>
              ))}
            </div>
          )}

          {advice.encouragement && (
            <div className="p-5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30">
              <p className="text-amber-300 text-lg flex items-center gap-3">
                <Star className="w-6 h-6 text-amber-400 flex-shrink-0" />
                {advice.encouragement}
              </p>
            </div>
          )}

          {advice.nextStep && (
            <div className="p-5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30">
              <h5 className="text-emerald-400 font-semibold text-lg mb-2">다음 단계</h5>
              <p className="text-emerald-300/90 text-lg">{advice.nextStep}</p>
            </div>
          )}

          {!advice.greeting && !advice.mainAdvice && (
            <pre className="text-slate-300 whitespace-pre-wrap text-base leading-relaxed">
              {typeof advice === "string" ? advice : JSON.stringify(advice, null, 2)}
            </pre>
          )}
        </div>
      </div>
    );
  };

  const selectedFeatureData = features.find((f) => f.id === selectedFeature);

  return (
    <DashboardLayout requiredRole="STUDENT">
      {/* Dark Theme Container */}
      <div className="min-h-[calc(100vh-4rem)] -m-6 p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 relative">
        {/* Ambient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-xl shadow-violet-500/30">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI 멘토</h1>
                <p className="text-slate-400 text-lg">맞춤형 입시 전략을 제안합니다</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-sm font-medium">AI 온라인</span>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => {
                  setSelectedFeature(feature.id);
                  setOutput(null);
                  setInputText("");
                }}
                className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                  selectedFeature === feature.id
                    ? `${feature.bgColor} ${feature.borderColor} scale-[1.02]`
                    : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                }`}
              >
                {feature.isNew && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                    NEW
                  </span>
                )}
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-sm mb-0.5">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-snug">{feature.description}</p>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input & Output */}
            <div className="lg:col-span-2">
              {selectedFeature ? (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl overflow-hidden backdrop-blur-sm">
                  {/* Feature Header */}
                  <div className={`p-5 bg-gradient-to-r ${selectedFeatureData?.gradient}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        {selectedFeatureData && <selectedFeatureData.icon className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedFeatureData?.title}</h2>
                        <p className="text-white/80">{selectedFeatureData?.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="p-5 border-b border-slate-700/50">
                    {renderQuickTags()}

                    {selectedFeature === "comprehensive-analysis" || selectedFeature === "action-plan" ? (
                      <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                        <p className="text-slate-300 flex items-center gap-3">
                          <Brain className="w-5 h-5 text-cyan-400" />
                          {selectedFeature === "comprehensive-analysis"
                            ? "현재 입력된 성적, 활동, 목표학교를 종합 분석합니다"
                            : "12주 맞춤형 실행 계획을 생성합니다"}
                        </p>
                      </div>
                    ) : selectedFeature === "school-recommendation" ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">선호 지역</label>
                          <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="">전체 지역</option>
                            <option value="서울">서울</option>
                            <option value="경기">경기</option>
                            <option value="인천">인천</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">학교 유형</label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { key: "SCIENCE", label: "과학고" },
                              { key: "FOREIGN_LANGUAGE", label: "외국어고" },
                              { key: "INTERNATIONAL", label: "국제고" },
                              { key: "AUTONOMOUS_PRIVATE", label: "자사고" },
                              { key: "ARTS", label: "예술고" },
                            ].map(({ key, label }) => (
                              <button
                                key={key}
                                onClick={() =>
                                  setSchoolTypes((prev) =>
                                    prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
                                  )
                                }
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                  schoolTypes.includes(key)
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={getPlaceholder()}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 resize-none"
                      />
                    )}

                    <button
                      onClick={generateAI}
                      disabled={generating || !canGenerate()}
                      className={`mt-4 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
                        generating || !canGenerate()
                          ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                          : `bg-gradient-to-r ${selectedFeatureData?.gradient} text-white hover:opacity-90 shadow-xl`
                      }`}
                    >
                      {generating ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          분석 중...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          AI 생성하기
                        </>
                      )}
                    </button>
                  </div>

                  {/* Output */}
                  {output && <div className="p-5">{renderOutput()}</div>}
                </div>
              ) : (
                <div className="h-[500px] bg-slate-800/50 border border-slate-700/50 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center px-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto mb-6 border border-violet-500/30">
                      <Sparkles className="w-10 h-10 text-violet-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">AI 기능을 선택하세요</h3>
                    <p className="text-slate-400 max-w-md">
                      위에서 원하는 기능을 선택하면 AI가 맞춤형 분석과 조언을 제공합니다
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* AI Status */}
              <div className="p-5 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">AI 상태</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 text-sm">정상 운영</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">
                  AI가 학생 데이터를 분석하여 맞춤형 전략을 제안합니다.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-white mb-0.5">24/7</div>
                  <div className="text-xs text-slate-400">항상 이용 가능</div>
                </div>
                <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-white mb-0.5">~3초</div>
                  <div className="text-xs text-slate-400">평균 응답 시간</div>
                </div>
              </div>

              {/* Tips */}
              <div className="p-5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/30 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">💡 Tip</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      성적, 활동, 목표학교를 많이 입력할수록 더 정확한 분석을 받을 수 있어요!
                    </p>
                  </div>
                </div>
              </div>

              {/* Popular Questions */}
              <div className="p-5 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  인기 질문
                </h4>
                <div className="space-y-2">
                  {[
                    "과학고 입시 전략은?",
                    "비교과 활동 추천해줘",
                    "면접 준비는 어떻게?",
                  ].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedFeature("quick-advice");
                        setInputText(q);
                      }}
                      className="w-full p-3 text-left text-sm text-slate-300 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl border border-slate-600/50 hover:border-slate-500 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
