"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getApiUrl, handleApiError } from "@/lib/api";
import { formatDateShort } from "@/lib/utils";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  MessageCircle,
  ThumbsUp,
  Eye,
  CheckCircle,
  Search,
  Plus,
  User,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Send,
  Award,
} from "lucide-react";

interface Question {
  id: string;
  title: string;
  content: string;
  category: string;
  isAnonymous: boolean;
  viewCount: number;
  likeCount: number;
  isResolved: boolean;
  createdAt: string;
  author: { id: string; name: string } | null;
  answerCount: number;
  isLiked?: boolean;
}

interface Answer {
  id: string;
  content: string;
  isAnonymous: boolean;
  isAccepted: boolean;
  likeCount: number;
  createdAt: string;
  author: { id: string; name: string } | null;
  isLiked?: boolean;
}

const categoryLabels: Record<string, string> = {
  ADMISSION: "입시 일반",
  SCHOOL_INFO: "학교 정보",
  STUDY_TIP: "학습 방법",
  ACTIVITY: "비교과 활동",
  INTERVIEW: "면접 준비",
  OTHER: "기타",
};

const categoryColors: Record<string, string> = {
  ADMISSION: "bg-violet-500/20 text-violet-400",
  SCHOOL_INFO: "bg-sky-500/20 text-sky-400",
  STUDY_TIP: "bg-emerald-500/20 text-emerald-400",
  ACTIVITY: "bg-amber-500/20 text-amber-400",
  INTERVIEW: "bg-rose-500/20 text-rose-400",
  OTHER: "bg-slate-500/20 text-slate-400",
};

export default function QnaPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<(Question & { answers: Answer[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: "", content: "", category: "ADMISSION", isAnonymous: false });
  const [newAnswer, setNewAnswer] = useState({ content: "", isAnonymous: false });

  useEffect(() => {
    fetchQuestions();
  }, [page, category]);

  const fetchQuestions = async () => {
    try {
      const API_URL = getApiUrl();
      let url = `${API_URL}/v1/qna/questions?page=${page}&limit=10`;
      if (category) url += `&category=${category}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      handleApiError(error, "질문 목록 조회");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionDetail = async (questionId: string) => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();
      const endpoint = token 
        ? `${API_URL}/v1/qna/questions/detail/${questionId}`
        : `${API_URL}/v1/qna/questions/${questionId}`;
      
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(endpoint, { headers });
      if (res.ok) {
        setSelectedQuestion(await res.json());
      }
    } catch (error) {
      handleApiError(error, "질문 상세 조회");
    }
  };

  const handleCreateQuestion = async () => {
    if (!newQuestion.title || !newQuestion.content) return;

    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      const res = await fetch(`${API_URL}/v1/qna/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newQuestion),
      });

      if (res.ok) {
        setShowWriteForm(false);
        setNewQuestion({ title: "", content: "", category: "ADMISSION", isAnonymous: false });
        fetchQuestions();
      }
    } catch (error) {
      handleApiError(error, "질문 작성");
    }
  };

  const handleCreateAnswer = async () => {
    if (!newAnswer.content || !selectedQuestion) return;

    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      const res = await fetch(`${API_URL}/v1/qna/questions/${selectedQuestion.id}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAnswer),
      });

      if (res.ok) {
        setNewAnswer({ content: "", isAnonymous: false });
        fetchQuestionDetail(selectedQuestion.id);
      }
    } catch (error) {
      handleApiError(error, "답변 작성");
    }
  };

  const handleLikeQuestion = async (questionId: string) => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      await fetch(`${API_URL}/v1/qna/questions/${questionId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (selectedQuestion?.id === questionId) {
        fetchQuestionDetail(questionId);
      }
    } catch (error) {
      handleApiError(error, "좋아요");
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!selectedQuestion) return;

    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      await fetch(`${API_URL}/v1/qna/questions/${selectedQuestion.id}/answers/${answerId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchQuestionDetail(selectedQuestion.id);
    } catch (error) {
      handleApiError(error, "답변 채택");
    }
  };

  if (loading) {
    return <LoadingState message="Q&A를 불러오는 중..." />;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Q&A 커뮤니티</h1>
            <p className="text-slate-400">입시 관련 질문과 답변을 나눠보세요</p>
          </div>
        </div>
        <Button onClick={() => setShowWriteForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          질문하기
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchQuestions()}
            placeholder="질문 검색..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-violet-500 focus:outline-none"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
        >
          <option value="">전체 카테고리</option>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* 질문 작성 폼 */}
      {showWriteForm && (
        <Card className="border-violet-500/50">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">새 질문 작성</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={newQuestion.isAnonymous}
                  onChange={(e) => setNewQuestion({ ...newQuestion, isAnonymous: e.target.checked })}
                  className="rounded bg-slate-700 border-slate-600"
                />
                익명으로 질문하기
              </label>
            </div>
            <input
              type="text"
              value={newQuestion.title}
              onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
              placeholder="질문 제목"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
            <textarea
              value={newQuestion.content}
              onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
              placeholder="질문 내용을 자세히 작성해주세요..."
              rows={5}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none"
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateQuestion}>질문 등록</Button>
              <Button variant="outline" onClick={() => setShowWriteForm(false)}>취소</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 질문 목록 또는 상세 */}
      {selectedQuestion ? (
        <Card>
          <CardContent className="p-6">
            {/* 뒤로가기 */}
            <button
              onClick={() => setSelectedQuestion(null)}
              className="flex items-center gap-1 text-slate-400 hover:text-white mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              목록으로
            </button>

            {/* 질문 상세 */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${categoryColors[selectedQuestion.category]}`}>
                    {categoryLabels[selectedQuestion.category]}
                  </span>
                  {selectedQuestion.isResolved && (
                    <Badge variant="success" className="ml-2">해결됨</Badge>
                  )}
                </div>
                <button
                  onClick={() => handleLikeQuestion(selectedQuestion.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                    selectedQuestion.isLiked ? "bg-violet-500/20 text-violet-400" : "bg-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  {selectedQuestion.likeCount}
                </button>
              </div>

              <h2 className="text-xl font-bold text-white">{selectedQuestion.title}</h2>
              
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {selectedQuestion.author?.name || "익명"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDateShort(selectedQuestion.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {selectedQuestion.viewCount}
                </span>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg text-slate-300 whitespace-pre-wrap">
                {selectedQuestion.content}
              </div>
            </div>

            {/* 답변 목록 */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                답변 {selectedQuestion.answers.length}개
              </h3>
              
              <div className="space-y-4">
                {selectedQuestion.answers.map((answer) => (
                  <div
                    key={answer.id}
                    className={`p-4 rounded-lg ${
                      answer.isAccepted ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-slate-800/50"
                    }`}
                  >
                    {answer.isAccepted && (
                      <div className="flex items-center gap-1 text-emerald-400 text-sm mb-2">
                        <Award className="w-4 h-4" />
                        채택된 답변
                      </div>
                    )}
                    <div className="text-slate-300 whitespace-pre-wrap mb-3">{answer.content}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span>{answer.author?.name || "익명"}</span>
                        <span>{formatDateShort(answer.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 px-2 py-1 rounded text-slate-400 hover:text-white">
                          <ThumbsUp className="w-4 h-4" />
                          {answer.likeCount}
                        </button>
                        {!answer.isAccepted && !selectedQuestion.isResolved && (
                          <Button size="sm" variant="outline" onClick={() => handleAcceptAnswer(answer.id)}>
                            채택
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 답변 작성 */}
              <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
                <h4 className="text-white font-medium mb-3">답변 작성</h4>
                <textarea
                  value={newAnswer.content}
                  onChange={(e) => setNewAnswer({ ...newAnswer, content: e.target.value })}
                  placeholder="답변을 작성해주세요..."
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none mb-3"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-slate-300 text-sm">
                    <input
                      type="checkbox"
                      checked={newAnswer.isAnonymous}
                      onChange={(e) => setNewAnswer({ ...newAnswer, isAnonymous: e.target.checked })}
                      className="rounded bg-slate-700 border-slate-600"
                    />
                    익명으로 답변
                  </label>
                  <Button onClick={handleCreateAnswer} className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    답변 등록
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 질문 목록 */}
          <div className="space-y-3">
            {questions.length > 0 ? (
              questions.map((question) => (
                <Card
                  key={question.id}
                  className="cursor-pointer hover:border-violet-500/50 transition-colors"
                  onClick={() => fetchQuestionDetail(question.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[question.category]}`}>
                            {categoryLabels[question.category]}
                          </span>
                          {question.isResolved && (
                            <Badge variant="success" className="text-xs">해결됨</Badge>
                          )}
                        </div>
                        <h3 className="text-white font-medium mb-1">{question.title}</h3>
                        <p className="text-sm text-slate-400 line-clamp-2">{question.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                          <span>{question.author?.name || "익명"}</span>
                          <span>{formatDateShort(question.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-sm">
                        <div className="flex items-center gap-1 text-slate-400">
                          <MessageCircle className="w-4 h-4" />
                          {question.answerCount}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <ThumbsUp className="w-4 h-4" />
                          {question.likeCount}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Eye className="w-4 h-4" />
                          {question.viewCount}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-slate-800/50">
                <CardContent className="p-12 text-center">
                  <MessageCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">아직 등록된 질문이 없습니다.</p>
                  <p className="text-sm text-slate-500 mt-1">첫 번째 질문을 작성해보세요!</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-slate-400">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

