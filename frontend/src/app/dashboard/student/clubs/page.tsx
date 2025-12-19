"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { getApiUrl } from "@/lib/api";

interface Club {
  id: string;
  name: string;
  category: string;
  description: string | null;
  isGeneral: boolean;
  middleSchool?: {
    name: string;
    region: string;
  };
}

interface CategoryStat {
  category: string;
  name: string;
  count: number;
}

const categoryColors: Record<string, string> = {
  ACADEMIC: "bg-blue-100 text-blue-800",
  ARTS: "bg-purple-100 text-purple-800",
  SPORTS: "bg-green-100 text-green-800",
  SERVICE: "bg-yellow-100 text-yellow-800",
  CAREER: "bg-orange-100 text-orange-800",
  CULTURE: "bg-pink-100 text-pink-800",
  OTHER: "bg-gray-100 text-gray-800",
};

const categoryNames: Record<string, string> = {
  ACADEMIC: "학술",
  ARTS: "예술",
  SPORTS: "체육",
  SERVICE: "봉사",
  CAREER: "진로",
  CULTURE: "문화",
  OTHER: "기타",
};

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [myClubs, setMyClubs] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchClubs();
    loadMyClubs();
  }, []);

  useEffect(() => {
    fetchClubs();
  }, [selectedCategory]);

  const loadMyClubs = () => {
    const saved = localStorage.getItem("myClubs");
    if (saved) {
      setMyClubs(JSON.parse(saved));
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("${getApiUrl()}/api/clubs/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("카테고리 로드 실패:", error);
    }
  };

  const fetchClubs = async () => {
    setLoading(true);
    try {
      let url = "${getApiUrl()}/api/clubs?limit=100";
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      if (searchKeyword) {
        url += `&keyword=${encodeURIComponent(searchKeyword)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setClubs(data.clubs || []);
    } catch (error) {
      console.error("동아리 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchClubs();
  };

  const toggleMyClub = (clubId: string) => {
    let updated: string[];
    if (myClubs.includes(clubId)) {
      updated = myClubs.filter((id) => id !== clubId);
    } else {
      updated = [...myClubs, clubId];
    }
    setMyClubs(updated);
    localStorage.setItem("myClubs", JSON.stringify(updated));
  };

  const myClubsList = clubs.filter((c) => myClubs.includes(c.id));

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">동아리 탐색</h1>
          <p className="text-gray-600 mt-1">
            관심 있는 동아리를 찾아보고 나의 동아리를 등록하세요
          </p>
        </div>

        {/* 내 동아리 */}
        {myClubsList.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">🎯 내 동아리</h2>
            <div className="flex flex-wrap gap-2">
              {myClubsList.map((club) => (
                <span
                  key={club.id}
                  className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {club.name}
                  <button
                    onClick={() => toggleMyClub(club.id)}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 카테고리 필터 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">📋 카테고리</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === ""
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat.category
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="동아리 이름으로 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              검색
            </button>
          </div>
        </div>

        {/* 동아리 목록 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            🏫 동아리 목록 ({clubs.length}개)
          </h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          ) : clubs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              검색 결과가 없습니다
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clubs.map((club) => (
                <div
                  key={club.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    myClubs.includes(club.id)
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {club.name}
                      </h3>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                          categoryColors[club.category] || categoryColors.OTHER
                        }`}
                      >
                        {categoryNames[club.category] || "기타"}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleMyClub(club.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        myClubs.includes(club.id)
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {myClubs.includes(club.id) ? "✓" : "+"}
                    </button>
                  </div>

                  {club.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {club.description}
                    </p>
                  )}

                  {club.middleSchool && (
                    <p className="mt-2 text-xs text-gray-500">
                      📍 {club.middleSchool.name} ({club.middleSchool.region})
                    </p>
                  )}

                  {club.isGeneral && (
                    <span className="mt-2 inline-block text-xs text-indigo-600">
                      ⭐ 추천 동아리
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

