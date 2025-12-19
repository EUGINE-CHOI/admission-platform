"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { getToken, getApiUrl } from "@/lib/api";
import {
  Sparkles, Users, RefreshCw,
  Copy, Check, Zap, Target, Lightbulb, Brain,
  Star, MessageCircle, Send, Bot, Compass, Rocket, 
  PenTool, Library, ClipboardList, GraduationCap,
  Clock, ChevronRight, Trash2,
} from "lucide-react";

type AIFeature =
  | "quick-advice"
  | "comprehensive-analysis"
  | "school-recommendation"
  | "record-sentence"
  | "recommend-club"
  | "recommend-reading"
  | "action-plan";

interface HistoryItem {
  id: string;
  feature: AIFeature;
  input: string;
  output: any;
  timestamp: number;
}

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

const HISTORY_KEY = "ai-mentor-history";

export default function AIAdvisePage() {
  const [selectedFeature, setSelectedFeature] = useState<AIFeature | null>(null);
  const [inputText, setInputText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [region, setRegion] = useState("");
  const [schoolTypes, setSchoolTypes] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Load history from localStorage
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (feature: AIFeature, input: string, outputData: any) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      feature,
      input,
      output: outputData,
      timestamp: Date.now(),
    };
    const newHistory = [newItem, ...history].slice(0, 10); // Keep last 10 items
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const loadFromHistory = (item: HistoryItem) => {
    setSelectedFeature(item.feature);
    setInputText(item.input);
    setOutput(item.output);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
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
          endpoint = "${getApiUrl()}/api/ai/advice/quick";
          body = { topic: inputText };
          break;
        case "comprehensive-analysis":
          endpoint = "${getApiUrl()}/api/ai/analysis/comprehensive";
          body = {};
          break;
        case "school-recommendation":
          endpoint = "${getApiUrl()}/api/ai/recommend/school";
          body = { region, schoolTypes };
          break;
        case "record-sentence":
          endpoint = "${getApiUrl()}/api/ai/record-sentence";
          body = { activityDescription: inputText };
          break;
        case "recommend-club":
          endpoint = "${getApiUrl()}/api/ai/recommend/club";
          body = { interests: inputText.split(",").map((s) => s.trim()) };
          break;
        case "recommend-reading":
          endpoint = "${getApiUrl()}/api/ai/recommend/reading";
          body = { genre: inputText };
          break;
        case "action-plan":
          endpoint = "${getApiUrl()}/api/ai/action-plan";
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
        const outputData = data.output || data;
        setOutput(outputData);
        saveToHistory(selectedFeature, inputText, outputData);
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

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  const getFeatureInfo = (featureId: AIFeature) => {
    return features.find((f) => f.id === featureId);
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
                : "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/50 border border-slate-200 dark:border-slate-600"
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
        <div className="p-5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl">
          <p className="text-red-600 dark:text-red-400 text-lg">{output.error}</p>
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
            <span className="text-lg font-semibold text-slate-900 dark:text-white">AI 멘토 응답</span>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600/50 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span className="text-sm">{copied ? "복사됨" : "복사"}</span>
          </button>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-6">
          {advice.greeting && (
            <div className="p-5 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-500/20 dark:to-fuchsia-500/20 rounded-xl border border-violet-200 dark:border-violet-500/30">
              <p className="text-violet-700 dark:text-violet-300 text-lg font-medium">{advice.greeting}</p>
            </div>
          )}

          {advice.currentStatus && (
            <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">{advice.currentStatus}</p>
          )}

          {advice.mainAdvice && (
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Lightbulb className="w-6 h-6 text-amber-500" />
                핵심 조언
              </h4>
              {advice.mainAdvice.map((item: any, idx: number) => (
                <div key={idx} className="p-5 bg-white dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600/50 shadow-sm">
                  <h5 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{item.title}</h5>
                  <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">{item.content}</p>
                  {item.actionable && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-500/20 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
                      <Zap className="w-5 h-5 text-emerald-500" />
                      <span className="text-emerald-700 dark:text-emerald-300">{item.actionable}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {advice.weeklyGoals && (
            <div className="space-y-3">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Target className="w-6 h-6 text-cyan-500" />
                이번 주 목표
              </h4>
              {advice.weeklyGoals.map((goal: string, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl border border-cyan-200 dark:border-cyan-500/30">
                  <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <span className="text-slate-700 dark:text-slate-200 text-lg">{goal}</span>
                </div>
              ))}
            </div>
          )}

          {advice.encouragement && (
            <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/20 dark:to-orange-500/20 rounded-xl border border-amber-200 dark:border-amber-500/30">
              <p className="text-amber-700 dark:text-amber-300 text-lg flex items-center gap-3">
                <Star className="w-6 h-6 text-amber-500 flex-shrink-0" />
                {advice.encouragement}
              </p>
            </div>
          )}

          {advice.nextStep && (
            <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/20 dark:to-teal-500/20 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
              <h5 className="text-emerald-600 dark:text-emerald-400 font-semibold text-lg mb-2">다음 단계</h5>
              <p className="text-emerald-700 dark:text-emerald-300/90 text-lg">{advice.nextStep}</p>
            </div>
          )}

          {!advice.greeting && !advice.mainAdvice && (
            <pre className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-base leading-relaxed">
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-xl shadow-violet-500/30">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI 멘토</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">맞춤형 입시 전략을 제안합니다</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full border border-emerald-200 dark:border-emerald-500/30">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 dark:text-emerald-400 text-sm font-medium">AI 온라인</span>
          </div>
        </div>

        {/* Feature Grid - 더 큰 카드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => {
                setSelectedFeature(feature.id);
                setOutput(null);
                setInputText("");
              }}
              className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                selectedFeature === feature.id
                  ? `bg-gradient-to-br ${feature.gradient} border-transparent shadow-xl scale-[1.02]`
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg"
              }`}
            >
              {feature.isNew && (
                <span className="absolute -top-2 -right-2 px-2.5 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                  NEW
                </span>
              )}
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                  selectedFeature === feature.id
                    ? "bg-white/20"
                    : `bg-gradient-to-br ${feature.gradient} shadow-lg`
                }`}
              >
                <feature.icon className={`w-7 h-7 ${selectedFeature === feature.id ? "text-white" : "text-white"}`} />
              </div>
              <h3 className={`font-bold text-base mb-1 ${selectedFeature === feature.id ? "text-white" : "text-slate-900 dark:text-white"}`}>
                {feature.title}
              </h3>
              <p className={`text-sm leading-snug ${selectedFeature === feature.id ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
                {feature.description}
              </p>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input & Output */}
          <div className="lg:col-span-2">
            {selectedFeature ? (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-lg">
                {/* Feature Header */}
                <div className={`p-6 bg-gradient-to-r ${selectedFeatureData?.gradient}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      {selectedFeatureData && <selectedFeatureData.icon className="w-7 h-7 text-white" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedFeatureData?.title}</h2>
                      <p className="text-white/80 text-lg">{selectedFeatureData?.description}</p>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  {renderQuickTags()}

                  {selectedFeature === "comprehensive-analysis" || selectedFeature === "action-plan" ? (
                    <div className="p-5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600/50">
                      <p className="text-slate-700 dark:text-slate-300 text-lg flex items-center gap-3">
                        <Brain className="w-6 h-6 text-cyan-500" />
                        {selectedFeature === "comprehensive-analysis"
                          ? "현재 입력된 성적, 활동, 목표학교를 종합 분석합니다"
                          : "12주 맞춤형 실행 계획을 생성합니다"}
                      </p>
                    </div>
                  ) : selectedFeature === "school-recommendation" ? (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-3">선호 지역</label>
                        <select
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        >
                          <option value="">전체 지역</option>
                          <option value="서울">서울</option>
                          <option value="경기">경기</option>
                          <option value="인천">인천</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-3">학교 유형</label>
                        <div className="flex flex-wrap gap-3">
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
                              className={`px-5 py-3 rounded-xl text-base font-medium transition-all ${
                                schoolTypes.includes(key)
                                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                                  : "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/50 border border-slate-200 dark:border-slate-600"
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
                      rows={4}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white text-lg placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none"
                    />
                  )}

                  <button
                    onClick={generateAI}
                    disabled={generating || !canGenerate()}
                    className={`mt-5 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                      generating || !canGenerate()
                        ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
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
                {output && <div className="p-6">{renderOutput()}</div>}
              </div>
            ) : (
              /* History Section */
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-500/20 dark:to-fuchsia-500/20 flex items-center justify-center mx-auto mb-6 border border-violet-200 dark:border-violet-500/30">
                    <Sparkles className="w-10 h-10 text-violet-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">AI 기능을 선택하세요</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">
                    위에서 원하는 기능을 선택하면 AI가 맞춤형 분석과 조언을 제공합니다
                  </p>
                </div>

                {/* Recent History */}
                {history.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-400" />
                        최근 사용 기록
                      </h4>
                      <button
                        onClick={clearHistory}
                        className="text-sm text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        전체 삭제
                      </button>
                    </div>
                    <div className="space-y-3">
                      {history.map((item) => {
                        const featureInfo = getFeatureInfo(item.feature);
                        return (
                          <button
                            key={item.id}
                            onClick={() => loadFromHistory(item)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600/50 transition-all group text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${featureInfo?.gradient} flex items-center justify-center shadow-md`}>
                                {featureInfo && <featureInfo.icon className="w-6 h-6 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-slate-900 dark:text-white">{featureInfo?.title}</span>
                                  <span className="text-xs text-slate-400">{formatTime(item.timestamp)}</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                  {item.input || "데이터 기반 분석"}
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {history.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>아직 사용 기록이 없습니다</p>
                    <p className="text-sm">AI 기능을 사용하면 여기에 기록됩니다</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* AI Status */}
            <div className="p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-500/20 dark:to-fuchsia-500/20 border border-violet-200 dark:border-violet-500/30 rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">AI 상태</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm">정상 운영</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                AI가 학생 데이터를 분석하여 맞춤형 전략을 제안합니다.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-center shadow-sm">
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">24/7</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">항상 이용 가능</div>
              </div>
              <div className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-center shadow-sm">
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">~3초</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">평균 응답 시간</div>
              </div>
            </div>

            {/* Tips */}
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-200 dark:border-amber-500/30 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">💡 Tip</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    성적, 활동, 목표학교를 많이 입력할수록 더 정확한 분석을 받을 수 있어요!
                  </p>
                </div>
              </div>
            </div>

            {/* Popular Questions */}
            <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                인기 질문
              </h4>
              <div className="space-y-3">
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
                    className="w-full p-4 text-left text-base text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600/50 hover:border-slate-300 dark:hover:border-slate-500 transition-all"
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
