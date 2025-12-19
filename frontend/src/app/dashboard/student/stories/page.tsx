"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getApiUrl } from "@/lib/api";
import {
  BookOpen,
  ThumbsUp,
  Eye,
  MessageSquare,
  Search,
  Plus,
  User,
  Clock,
  School,
  Award,
  ChevronLeft,
  ChevronRight,
  Send,
  Star,
  CheckCircle,
} from "lucide-react";

interface Story {
  id: string;
  title: string;
  content: string;
  category: string;
  admissionYear: number;
  isAnonymous: boolean;
  isVerified: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  author: { id: string; name: string } | null;
  school: { id: string; name: string; type: string } | null;
  commentCount: number;
  isLiked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
  author: { id: string; name: string } | null;
}

const categoryLabels: Record<string, string> = {
  PREPARATION: "준비 과정",
  INTERVIEW_EXP: "면접 경험",
  STUDY_METHOD: "학습 방법",
  ACTIVITY_TIP: "활동 팁",
  GENERAL: "일반 후기",
};

const categoryColors: Record<string, string> = {
  PREPARATION: "bg-violet-500/20 text-violet-400",
  INTERVIEW_EXP: "bg-rose-500/20 text-rose-400",
  STUDY_METHOD: "bg-emerald-500/20 text-emerald-400",
  ACTIVITY_TIP: "bg-amber-500/20 text-amber-400",
  GENERAL: "bg-sky-500/20 text-sky-400",
};

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [popularStories, setPopularStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<(Story & { comments: Comment[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [newStory, setNewStory] = useState({
    title: "",
    content: "",
    category: "GENERAL",
    admissionYear: new Date().getFullYear(),
    isAnonymous: false,
  });
  const [newComment, setNewComment] = useState({ content: "", isAnonymous: false });

  useEffect(() => {
    fetchStories();
    fetchPopularStories();
  }, [page, category]);

  const fetchStories = async () => {
    try {
      const API_URL = getApiUrl();
      let url = `${API_URL}/v1/stories?page=${page}&limit=10`;
      if (category) url += `&category=${category}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStories(data.stories);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularStories = async () => {
    try {
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/v1/stories/popular?limit=3`);
      if (res.ok) {
        setPopularStories(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch popular stories:", error);
    }
  };

  const fetchStoryDetail = async (storyId: string) => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();
      const endpoint = token
        ? `${API_URL}/v1/stories/detail/${storyId}`
        : `${API_URL}/v1/stories/${storyId}`;

      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(endpoint, { headers });
      if (res.ok) {
        setSelectedStory(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch story detail:", error);
    }
  };

  const handleCreateStory = async () => {
    if (!newStory.title || !newStory.content) return;

    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      const res = await fetch(`${API_URL}/v1/stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newStory),
      });

      if (res.ok) {
        setShowWriteForm(false);
        setNewStory({
          title: "",
          content: "",
          category: "GENERAL",
          admissionYear: new Date().getFullYear(),
          isAnonymous: false,
        });
        fetchStories();
      }
    } catch (error) {
      console.error("Failed to create story:", error);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.content || !selectedStory) return;

    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      const res = await fetch(`${API_URL}/v1/stories/${selectedStory.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newComment),
      });

      if (res.ok) {
        setNewComment({ content: "", isAnonymous: false });
        fetchStoryDetail(selectedStory.id);
      }
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  const handleLikeStory = async (storyId: string) => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = getApiUrl();

      await fetch(`${API_URL}/v1/stories/${storyId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (selectedStory?.id === storyId) {
        fetchStoryDetail(storyId);
      }
    } catch (error) {
      console.error("Failed to like story:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">합격생 후기</h1>
            <p className="text-slate-400">선배들의 합격 경험을 공유받으세요</p>
          </div>
        </div>
        <Button onClick={() => setShowWriteForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          후기 작성
        </Button>
      </div>

      {/* 인기 후기 */}
      {!selectedStory && popularStories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {popularStories.map((story, idx) => (
            <Card
              key={story.id}
              className="cursor-pointer hover:border-emerald-500/50 transition-colors bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30"
              onClick={() => fetchStoryDetail(story.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-400">인기 #{idx + 1}</span>
                  {story.isVerified && (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <h3 className="text-white font-medium line-clamp-2 mb-2">{story.title}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {story.school && <span>{story.school.name}</span>}
                  <span>•</span>
                  <span>{story.admissionYear}년</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 검색 및 필터 */}
      {!selectedStory && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchStories()}
              placeholder="후기 검색..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
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
      )}

      {/* 후기 작성 폼 */}
      {showWriteForm && (
        <Card className="border-emerald-500/50">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">합격 후기 작성</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={newStory.category}
                onChange={(e) => setNewStory({ ...newStory, category: e.target.value })}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <select
                value={newStory.admissionYear}
                onChange={(e) => setNewStory({ ...newStory, admissionYear: parseInt(e.target.value) })}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                {[2025, 2024, 2023, 2022, 2021].map((year) => (
                  <option key={year} value={year}>{year}년 입학</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={newStory.isAnonymous}
                  onChange={(e) => setNewStory({ ...newStory, isAnonymous: e.target.checked })}
                  className="rounded bg-slate-700 border-slate-600"
                />
                익명으로 작성
              </label>
            </div>
            <input
              type="text"
              value={newStory.title}
              onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
              placeholder="후기 제목"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
            <textarea
              value={newStory.content}
              onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
              placeholder="합격 후기를 자세히 작성해주세요. 준비 과정, 면접 경험, 조언 등을 포함해주세요."
              rows={8}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none"
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateStory}>후기 등록</Button>
              <Button variant="outline" onClick={() => setShowWriteForm(false)}>취소</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 후기 상세 */}
      {selectedStory ? (
        <Card>
          <CardContent className="p-6">
            <button
              onClick={() => setSelectedStory(null)}
              className="flex items-center gap-1 text-slate-400 hover:text-white mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              목록으로
            </button>

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[selectedStory.category]}`}>
                    {categoryLabels[selectedStory.category]}
                  </span>
                  {selectedStory.isVerified && (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      인증됨
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => handleLikeStory(selectedStory.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                    selectedStory.isLiked ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  {selectedStory.likeCount}
                </button>
              </div>

              <h2 className="text-xl font-bold text-white">{selectedStory.title}</h2>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {selectedStory.author?.name || "익명"}
                </span>
                {selectedStory.school && (
                  <span className="flex items-center gap-1">
                    <School className="w-4 h-4" />
                    {selectedStory.school.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {selectedStory.admissionYear}년 합격
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(selectedStory.createdAt).toLocaleDateString("ko-KR")}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {selectedStory.viewCount}
                </span>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedStory.content}
              </div>
            </div>

            {/* 댓글 */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                댓글 {selectedStory.comments.length}개
              </h3>

              <div className="space-y-3">
                {selectedStory.comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-300 mb-2">{comment.content}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{comment.author?.name || "익명"}</span>
                      <span>•</span>
                      <span>{new Date(comment.createdAt).toLocaleDateString("ko-KR")}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 댓글 작성 */}
              <div className="mt-4 p-4 bg-slate-800/30 rounded-lg">
                <textarea
                  value={newComment.content}
                  onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                  placeholder="댓글을 작성해주세요..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none mb-3"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-slate-300 text-sm">
                    <input
                      type="checkbox"
                      checked={newComment.isAnonymous}
                      onChange={(e) => setNewComment({ ...newComment, isAnonymous: e.target.checked })}
                      className="rounded bg-slate-700 border-slate-600"
                    />
                    익명
                  </label>
                  <Button onClick={handleCreateComment} className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    댓글 등록
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 후기 목록 */}
          <div className="space-y-3">
            {stories.length > 0 ? (
              stories.map((story) => (
                <Card
                  key={story.id}
                  className="cursor-pointer hover:border-emerald-500/50 transition-colors"
                  onClick={() => fetchStoryDetail(story.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[story.category]}`}>
                            {categoryLabels[story.category]}
                          </span>
                          {story.isVerified && (
                            <Badge variant="success" className="text-xs flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              인증
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-white font-medium mb-1">{story.title}</h3>
                        <p className="text-sm text-slate-400 line-clamp-2">{story.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                          <span>{story.author?.name || "익명"}</span>
                          {story.school && <span>{story.school.name}</span>}
                          <span>{story.admissionYear}년</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-sm">
                        <div className="flex items-center gap-1 text-slate-400">
                          <MessageSquare className="w-4 h-4" />
                          {story.commentCount}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <ThumbsUp className="w-4 h-4" />
                          {story.likeCount}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Eye className="w-4 h-4" />
                          {story.viewCount}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-slate-800/50">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">아직 등록된 후기가 없습니다.</p>
                  <p className="text-sm text-slate-500 mt-1">첫 번째 합격 후기를 작성해보세요!</p>
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

