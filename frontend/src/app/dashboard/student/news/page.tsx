"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { getToken, getApiUrl } from "@/lib/api";
import { formatRelativeTime, formatDateTime } from "@/lib/utils";
import {
  Newspaper,
  RefreshCw,
  ExternalLink,
  Clock,
  Search,
  TrendingUp,
  BookOpen,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Globe,
  Share2,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  keyword: string;
}

const keywordColors: Record<string, { bg: string; text: string; border: string }> = {
  "외고": { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-500/30" },
  "자사고": { bg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-700 dark:text-purple-400", border: "border-purple-200 dark:border-purple-500/30" },
  "과학고": { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/30" },
  "영재고": { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/30" },
  "특목고": { bg: "bg-rose-100 dark:bg-rose-500/20", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-500/30" },
  "자율형사립고": { bg: "bg-indigo-100 dark:bg-indigo-500/20", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-500/30" },
};

const keywordIcons: Record<string, React.ElementType> = {
  "외고": BookOpen,
  "자사고": GraduationCap,
  "과학고": Sparkles,
  "영재고": TrendingUp,
  "특목고": GraduationCap,
  "자율형사립고": GraduationCap,
};

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const ITEMS_PER_PAGE = 10;

  // 북마크 로드
  useEffect(() => {
    const saved = localStorage.getItem('newsBookmarks');
    if (saved) {
      const parsed = JSON.parse(saved);
      setBookmarks(parsed.map((b: NewsItem) => b.id));
    }
  }, []);

  const fetchNews = async (keyword?: string, page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      let url = `${getApiUrl()}/api/news?page=${page}&limit=${ITEMS_PER_PAGE}`;
      if (keyword) {
        url += `&keyword=${encodeURIComponent(keyword)}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setNews(data.news || []);
        setKeywords(data.keywords || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
        setCurrentPage(data.page || 1);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "뉴스를 불러오는데 실패했습니다.");
      }
    } catch (err) {
      setError("서버에 연결할 수 없습니다.");
      console.error("Failed to fetch news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleKeywordClick = (keyword: string) => {
    if (selectedKeyword === keyword) {
      setSelectedKeyword(null);
      setCurrentPage(1);
      fetchNews(undefined, 1);
    } else {
      setSelectedKeyword(keyword);
      setCurrentPage(1);
      fetchNews(keyword, 1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchNews(selectedKeyword || undefined, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsClick = (item: NewsItem) => {
    setSelectedNews(item);
  };

  const closeModal = () => {
    setSelectedNews(null);
  };

  const toggleBookmark = (item: NewsItem) => {
    const saved = JSON.parse(localStorage.getItem('newsBookmarks') || '[]');
    const isBookmarked = saved.some((b: NewsItem) => b.id === item.id);
    
    if (isBookmarked) {
      const newBookmarks = saved.filter((b: NewsItem) => b.id !== item.id);
      localStorage.setItem('newsBookmarks', JSON.stringify(newBookmarks));
      setBookmarks(newBookmarks.map((b: NewsItem) => b.id));
    } else {
      saved.push(item);
      localStorage.setItem('newsBookmarks', JSON.stringify(saved));
      setBookmarks(saved.map((b: NewsItem) => b.id));
    }
  };

  // 날짜 포맷 함수는 @/lib/utils에서 import (formatRelativeTime, formatDateTime)

  const filteredNews = searchQuery
    ? news.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : news;

  const getKeywordStyle = (keyword: string) => {
    return keywordColors[keyword] || keywordColors["특목고"];
  };

  const getKeywordIcon = (keyword: string) => {
    return keywordIcons[keyword] || GraduationCap;
  };

  return (
    <DashboardLayout requiredRole={["STUDENT", "PARENT"]}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-xl shadow-rose-500/30">
              <Newspaper className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                최신뉴스
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                특목고 입시 관련 최신 뉴스
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchNews(selectedKeyword || undefined, currentPage)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="뉴스 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Keyword Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedKeyword(null);
              setCurrentPage(1);
              fetchNews(undefined, 1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !selectedKeyword
                ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            전체
          </button>
          {["외고", "자사고", "과학고", "영재고", "특목고", "자율형사립고"].map((keyword) => {
            const style = getKeywordStyle(keyword);
            const Icon = getKeywordIcon(keyword);
            return (
              <button
                key={keyword}
                onClick={() => handleKeywordClick(keyword)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedKeyword === keyword
                    ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg"
                    : `${style.bg} ${style.text} border ${style.border} hover:shadow-md`
                }`}
              >
                <Icon className="w-4 h-4" />
                {keyword}
              </button>
            );
          })}
        </div>

        {/* News Count */}
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>
            {selectedKeyword ? `"${selectedKeyword}" 관련 ` : "전체 "}
            뉴스 {total}건
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            클릭하면 상세 내용을 볼 수 있습니다
          </span>
        </div>

        {/* News List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-3" />
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-8 text-center">
            <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
            <button
              onClick={() => fetchNews()}
              className="mt-4 px-6 py-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-12 text-center">
            <Newspaper className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              뉴스가 없습니다
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery
                ? "검색 결과가 없습니다. 다른 키워드로 검색해보세요."
                : "잠시 후 다시 시도해주세요."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNews.map((item) => {
              const style = getKeywordStyle(item.keyword);
              const Icon = getKeywordIcon(item.keyword);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNewsClick(item)}
                  className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 text-left"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
                    >
                      <Icon className="w-3 h-3" />
                      {item.keyword}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(item.publishedAt)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {item.source}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      자세히 보기
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === pageNum
                      ? "bg-rose-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* News Detail Modal */}
      {selectedNews && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-rose-500 to-orange-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Newspaper className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-white/90 text-sm font-medium">{selectedNews.keyword}</span>
                  <p className="text-white/70 text-xs">{selectedNews.source}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              {/* News Title & Meta */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                  {selectedNews.title}
                </h2>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-6">
                  <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4" />
                    {formatDateTime(selectedNews.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                    <Globe className="w-4 h-4" />
                    {selectedNews.source}
                  </span>
                </div>

                {/* News Description */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-rose-500" />
                    뉴스 요약
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                    {selectedNews.description || "뉴스 요약 내용이 없습니다. 아래 버튼을 클릭하여 전체 기사를 확인해주세요."}
                  </p>
                </div>

                {/* Related Keywords */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    관련 키워드
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[selectedNews.keyword, '입시', '2025학년도', '고등학교'].map((tag, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <a
                    href={selectedNews.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-xl transition-all font-semibold text-lg shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40"
                  >
                    <ExternalLink className="w-5 h-5" />
                    전체 기사 보기
                  </a>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedNews.link);
                        alert('링크가 복사되었습니다!');
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      링크 복사
                    </button>
                    <button
                      onClick={() => toggleBookmark(selectedNews)}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${
                        bookmarks.includes(selectedNews.id)
                          ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"
                          : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {bookmarks.includes(selectedNews.id) ? (
                        <>
                          <BookmarkCheck className="w-4 h-4" />
                          저장됨
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          북마크
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-center p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={closeModal}
                className="px-6 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
