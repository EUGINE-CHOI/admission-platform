"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getApiUrl } from "@/lib/api";
import {
  FileText,
  Sparkles,
  CheckCircle,
  Lightbulb,
  School,
  RefreshCw,
  Copy,
  Download,
  Edit3,
  BookOpen,
  Target,
  Wand2,
} from "lucide-react";

interface DraftResult {
  draft: string;
  wordCount: number;
  suggestions: string[];
  structureGuide: {
    introduction: string;
    body: string;
    conclusion: string;
  };
}

interface ReviewResult {
  overallScore: number;
  feedback: {
    area: string;
    score: number;
    comments: string[];
    suggestions: string[];
  }[];
  improvedVersion: string;
  keyStrengths: string[];
  areasToImprove: string[];
}

interface TopicSuggestion {
  title: string;
  description: string;
  relevantActivities: string[];
}

export default function PersonalStatementPage() {
  const [activeTab, setActiveTab] = useState<"write" | "review" | "topics">("topics");
  const [loading, setLoading] = useState(false);
  const [draftResult, setDraftResult] = useState<DraftResult | null>(null);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [topics, setTopics] = useState<TopicSuggestion[]>([]);
  
  // 작성 폼
  const [topic, setTopic] = useState("");
  const [maxLength, setMaxLength] = useState(1000);
  const [emphasis, setEmphasis] = useState("");

  // 첨삭 폼
  const [reviewContent, setReviewContent] = useState("");

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      const res = await fetch(`${API_URL}/v1/ai/personal-statement/suggest-topics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    }
  };

  const generateDraft = async () => {
    if (!topic) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      const res = await fetch(`${API_URL}/v1/ai/personal-statement/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          maxLength,
          emphasis: emphasis ? emphasis.split(",").map(e => e.trim()) : undefined,
        }),
      });

      if (res.ok) {
        setDraftResult(await res.json());
      }
    } catch (error) {
      console.error("Failed to generate draft:", error);
    } finally {
      setLoading(false);
    }
  };

  const reviewStatement = async () => {
    if (!reviewContent) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      const res = await fetch(`${API_URL}/v1/ai/personal-statement/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: reviewContent }),
      });

      if (res.ok) {
        setReviewResult(await res.json());
      }
    } catch (error) {
      console.error("Failed to review statement:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("클립보드에 복사되었습니다!");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI 자기소개서 도우미</h1>
          <p className="text-slate-400">AI가 자기소개서 작성과 첨삭을 도와드립니다</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2">
        {[
          { id: "topics", label: "주제 추천", icon: Lightbulb },
          { id: "write", label: "초안 작성", icon: Edit3 },
          { id: "review", label: "첨삭 받기", icon: CheckCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-violet-500 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 주제 추천 탭 */}
      {activeTab === "topics" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold text-white">추천 주제</h3>
              <Button variant="outline" size="sm" onClick={fetchTopics}>
                <RefreshCw className="w-4 h-4 mr-1" />
                새로고침
              </Button>
            </CardHeader>
            <CardContent>
              {topics.length > 0 ? (
                <div className="grid gap-4">
                  {topics.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                      onClick={() => { setTopic(t.title); setActiveTab("write"); }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-violet-500/20">
                          <Lightbulb className="w-5 h-5 text-violet-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">{t.title}</h4>
                          <p className="text-sm text-slate-400 mb-2">{t.description}</p>
                          {t.relevantActivities?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {t.relevantActivities.map((act, i) => (
                                <Badge key={i} variant="info" className="text-xs">{act}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); setTopic(t.title); setActiveTab("write"); }}>
                          선택
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">
                  활동 데이터를 기반으로 주제를 추천해드립니다.<br />
                  먼저 비교과 활동을 입력해주세요.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 초안 작성 탭 */}
      {activeTab === "write" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 입력 폼 */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">자기소개서 주제 입력</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">주제 / 질문</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="예: 나를 변화시킨 경험, 지원 동기, 학업 계획 등"
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">글자 수</label>
                  <select
                    value={maxLength}
                    onChange={(e) => setMaxLength(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value={500}>500자</option>
                    <option value={800}>800자</option>
                    <option value={1000}>1000자</option>
                    <option value={1500}>1500자</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">강조 내용 (선택)</label>
                  <input
                    type="text"
                    value={emphasis}
                    onChange={(e) => setEmphasis(e.target.value)}
                    placeholder="쉼표로 구분"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <Button onClick={generateDraft} disabled={loading || !topic} className="w-full">
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    AI 초안 생성
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 결과 */}
          {draftResult && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold text-white">생성된 초안</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(draftResult.draft)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{draftResult.draft}</p>
                  <div className="mt-2 text-right text-sm text-slate-500">
                    {draftResult.wordCount}자
                  </div>
                </div>

                {draftResult.suggestions?.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      개선 제안
                    </h4>
                    <ul className="space-y-1">
                      {draftResult.suggestions.map((s, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-amber-400">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setReviewContent(draftResult.draft); setActiveTab("review"); }}
                >
                  이 초안으로 첨삭 받기
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 첨삭 탭 */}
      {activeTab === "review" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 입력 폼 */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">자기소개서 첨삭</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">자기소개서 내용</label>
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="첨삭받을 자기소개서 내용을 붙여넣기 해주세요..."
                  rows={12}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none"
                />
                <div className="text-right text-sm text-slate-500 mt-1">
                  {reviewContent.length}자
                </div>
              </div>
              <Button onClick={reviewStatement} disabled={loading || !reviewContent} className="w-full">
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    AI 첨삭 받기
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 결과 */}
          {reviewResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">첨삭 결과</h3>
                  <div className={`text-3xl font-bold ${getScoreColor(reviewResult.overallScore)}`}>
                    {reviewResult.overallScore}점
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 영역별 평가 */}
                <div className="grid grid-cols-2 gap-3">
                  {reviewResult.feedback?.map((f, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">{f.area}</span>
                        <span className={`font-bold ${getScoreColor(f.score)}`}>{f.score}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            f.score >= 80 ? "bg-emerald-500" : f.score >= 60 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${f.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 강점 & 개선점 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-emerald-400 font-medium mb-2">강점</h4>
                    <ul className="space-y-1">
                      {reviewResult.keyStrengths?.map((s, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-amber-400 font-medium mb-2">개선점</h4>
                    <ul className="space-y-1">
                      {reviewResult.areasToImprove?.map((s, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <Target className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 개선 버전 */}
                {reviewResult.improvedVersion && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">AI 개선 버전</h4>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(reviewResult.improvedVersion)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg max-h-64 overflow-y-auto">
                      <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                        {reviewResult.improvedVersion}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}




