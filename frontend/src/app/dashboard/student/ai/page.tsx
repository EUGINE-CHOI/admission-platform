"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  Calendar,
  Send,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Clock,
  ChevronRight,
  Zap,
  Target,
  Lightbulb,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Textarea, Select } from "@/components/ui";
import { Badge } from "@/components/ui";

type AIFeature = "record-sentence" | "recommend-club" | "advice-subject" | "recommend-reading" | "action-plan";

interface AIOutput {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  feedback?: "positive" | "negative";
}

interface ActionPlan {
  id: string;
  title: string;
  weekCount: number;
  tasks: PlanTask[];
  createdAt: string;
}

interface PlanTask {
  id: string;
  title: string;
  weekNum: number;
  status: string;
}

const features = [
  {
    id: "record-sentence" as AIFeature,
    icon: FileText,
    title: "생기부 문장 생성",
    description: "활동 내용을 바탕으로 생기부 문장을 생성합니다",
    color: "sky",
  },
  {
    id: "recommend-club" as AIFeature,
    icon: Users,
    title: "동아리 추천",
    description: "관심사와 진로에 맞는 동아리를 추천합니다",
    color: "indigo",
  },
  {
    id: "advice-subject" as AIFeature,
    icon: GraduationCap,
    title: "과목 선택 조언",
    description: "진로에 맞는 선택 과목을 안내합니다",
    color: "emerald",
  },
  {
    id: "recommend-reading" as AIFeature,
    icon: BookOpen,
    title: "독서 추천",
    description: "관심 분야에 맞는 도서를 추천합니다",
    color: "amber",
  },
  {
    id: "action-plan" as AIFeature,
    icon: Calendar,
    title: "액션 플랜 생성",
    description: "12주 맞춤형 실행 계획을 생성합니다",
    color: "rose",
  },
];

export default function AIAdvisePage() {
  const [selectedFeature, setSelectedFeature] = useState<AIFeature | null>(null);
  const [inputText, setInputText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [history, setHistory] = useState<AIOutput[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [copied, setCopied] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState("");

  useEffect(() => {
    fetchHistory();
    fetchActivities();
    fetchActionPlans();
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
        setHistory(Array.isArray(data) ? data : []);
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
        setActivities(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch activities error:", error);
    }
  };

  const fetchActionPlans = async () => {
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/api/ai/action-plan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActionPlans(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch action plans error:", error);
    }
  };

  const generateAI = async () => {
    if (!selectedFeature) return;
    
    setGenerating(true);
    setOutput("");
    
    try {
      const token = getToken();
      let endpoint = "";
      let body: any = {};

      switch (selectedFeature) {
        case "record-sentence":
          endpoint = selectedActivityId 
            ? `http://localhost:3000/api/ai/record-sentence/${selectedActivityId}`
            : "http://localhost:3000/api/ai/record-sentence";
          body = { activityDescription: inputText };
          break;
        case "recommend-club":
          endpoint = "http://localhost:3000/api/ai/recommend/club";
          body = { interests: inputText };
          break;
        case "advice-subject":
          endpoint = "http://localhost:3000/api/ai/advice/subject";
          body = { targetMajor: inputText };
          break;
        case "recommend-reading":
          endpoint = "http://localhost:3000/api/ai/recommend/reading";
          body = { topic: inputText };
          break;
        case "action-plan":
          endpoint = "http://localhost:3000/api/ai/action-plan";
          body = { goal: inputText };
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
        if (selectedFeature === "action-plan") {
          setOutput(`액션 플랜이 생성되었습니다!\n\n제목: ${data.title}\n기간: ${data.weekCount}주\n\n태스크가 생성되었습니다. 실행 계획 탭에서 확인하세요.`);
          fetchActionPlans();
        } else {
          setOutput(data.content || data.result || JSON.stringify(data, null, 2));
        }
        fetchHistory();
      }
    } catch (error) {
      console.error("AI generation error:", error);
      setOutput("AI 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitFeedback = async (outputId: string, isPositive: boolean) => {
    try {
      const token = getToken();
      await fetch(`http://localhost:3000/api/ai/output/${outputId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPositive }),
      });
      fetchHistory();
    } catch (error) {
      console.error("Feedback error:", error);
    }
  };

  const getPlaceholder = () => {
    switch (selectedFeature) {
      case "record-sentence":
        return "활동 내용을 입력하세요. 예: 과학 탐구 동아리에서 환경 문제 해결을 위한 프로젝트를 진행했습니다...";
      case "recommend-club":
        return "관심사를 입력하세요. 예: 프로그래밍, 인공지능, 로봇 등";
      case "advice-subject":
        return "희망 전공이나 진로를 입력하세요. 예: 컴퓨터공학, 의학, 경영학 등";
      case "recommend-reading":
        return "관심 분야를 입력하세요. 예: 철학, 과학, 역사, 문학 등";
      case "action-plan":
        return "목표를 입력하세요. 예: 과학고 입시 준비, 내신 성적 향상 등";
      default:
        return "입력하세요...";
    }
  };

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI 조언</h1>
          <p className="text-slate-500 mt-1">
            AI가 맞춤형 조언과 분석을 제공합니다
          </p>
        </div>

        {/* Feature Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => {
                setSelectedFeature(feature.id);
                setOutput("");
                setInputText("");
              }}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedFeature === feature.id
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  feature.color === "sky" ? "bg-sky-100 text-sky-600" : ""
                } ${feature.color === "indigo" ? "bg-indigo-100 text-indigo-600" : ""
                } ${feature.color === "emerald" ? "bg-emerald-100 text-emerald-600" : ""
                } ${feature.color === "amber" ? "bg-amber-100 text-amber-600" : ""
                } ${feature.color === "rose" ? "bg-rose-100 text-rose-600" : ""}`}
              >
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-slate-900 text-sm mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-slate-500">{feature.description}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {selectedFeature ? (
              <Card>
                <CardHeader
                  icon={
                    <Sparkles className="w-5 h-5" />
                  }
                >
                  {features.find((f) => f.id === selectedFeature)?.title}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Activity Selection for record-sentence */}
                    {selectedFeature === "record-sentence" && activities.length > 0 && (
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
                      label="입력"
                      placeholder={getPlaceholder()}
                      rows={5}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />

                    <div className="flex justify-end">
                      <Button
                        onClick={generateAI}
                        isLoading={generating}
                        disabled={!inputText.trim()}
                        leftIcon={<Zap className="w-4 h-4" />}
                      >
                        AI 생성
                      </Button>
                    </div>

                    {/* Output */}
                    {output && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900">결과</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyToClipboard}
                            leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          >
                            {copied ? "복사됨" : "복사"}
                          </Button>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl border border-sky-100">
                          <p className="text-slate-700 whitespace-pre-wrap">{output}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    AI 기능을 선택하세요
                  </h3>
                  <p className="text-sm text-slate-500 max-w-sm">
                    위에서 원하는 AI 기능을 선택하면 맞춤형 조언을 받을 수 있습니다
                  </p>
                </div>
              </Card>
            )}

            {/* Action Plans */}
            {actionPlans.length > 0 && (
              <Card>
                <CardHeader icon={<Calendar className="w-5 h-5" />}>
                  내 액션 플랜
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {actionPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900">{plan.title}</h4>
                          <Badge>{plan.weekCount}주 과정</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {plan.tasks?.length || 0}개 태스크
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {plan.createdAt}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* History Section */}
          <div className="lg:col-span-1">
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
                  <p className="text-sm text-slate-500 text-center py-8">
                    아직 생성된 내용이 없습니다
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {history.slice(0, 10).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" size="sm">
                            {item.type}
                          </Badge>
                          <span className="text-xs text-slate-400">{item.createdAt}</span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-3">
                          {item.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => submitFeedback(item.id, true)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              item.feedback === "positive"
                                ? "bg-emerald-100 text-emerald-600"
                                : "text-slate-400 hover:bg-slate-200"
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => submitFeedback(item.id, false)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              item.feedback === "negative"
                                ? "bg-red-100 text-red-600"
                                : "text-slate-400 hover:bg-slate-200"
                            }`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">💡 팁</h4>
                    <p className="text-sm text-slate-600">
                      더 구체적인 내용을 입력할수록 AI가 더 정확한 조언을 제공합니다.
                      활동 내용, 관심사, 목표 등을 자세히 작성해보세요.
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
