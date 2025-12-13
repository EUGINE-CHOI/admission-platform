"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import {
  Newspaper,
  RefreshCw,
  ExternalLink,
  Clock,
  Search,
  Filter,
  TrendingUp,
  BookOpen,
  GraduationCap,
  Sparkles,
  ChevronRight,
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

  const getToken = () => localStorage.getItem("token") || localStorage.getItem("accessToken");

  const fetchNews = async (keyword?: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const url = keyword
        ? `http://localhost:3000/api/news?keyword=${encodeURIComponent(keyword)}`
        : "http://localhost:3000/api/news";

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setNews(data.news);
        setKeywords(data.keywords || []);
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
      fetchNews();
    } else {
      setSelectedKeyword(keyword);
      fetchNews(keyword);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString("ko-KR");
  };

  const filteredNews = news.filter((item) =>
    searchQuery
      ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const getKeywordStyle = (keyword: string) => {
    return keywordColors[keyword] || keywordColors["특목고"];
  };

  const getKeywordIcon = (keyword: string) => {
    return keywordIcons[keyword] || GraduationCap;
  };

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-xl shadow-rose-500/30">
              <Newspaper className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">최신 뉴스</h1>
              <p className="text-slate-500 dark:text-slate-400">특목고 입시 관련 최신 뉴스</p>
            </div>
          </div>
          <button
            onClick={() => fetchNews(selectedKeyword || undefined)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="뉴스 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          {/* Keyword Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter className="w-5 h-5 text-slate-400 flex-shrink-0" />
            {keywords.map((keyword) => {
              const style = getKeywordStyle(keyword);
              const Icon = getKeywordIcon(keyword);
              return (
                <button
                  key={keyword}
                  onClick={() => handleKeywordClick(keyword)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
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
        </div>

        {/* News Count */}
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>
            {selectedKeyword ? `"${selectedKeyword}" 관련 ` : "전체 "}
            뉴스 {filteredNews.length}건
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            30분마다 자동 업데이트
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
                <a
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300"
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
                      {formatTime(item.publishedAt)}
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
                      기사 보기
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-500" />
            인기 검색어
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "2025 특목고 입시",
              "과학고 경쟁률",
              "외고 면접",
              "자사고 폐지",
              "영재고 입학",
              "특목고 전형",
            ].map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-colors"
              >
                {term}
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

