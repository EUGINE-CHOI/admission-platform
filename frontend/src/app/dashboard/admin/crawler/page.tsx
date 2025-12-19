"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { getApiUrl } from "@/lib/api";
import { formatDateShort, formatDateTime } from "@/lib/utils";
import { Card, Button, Badge, Modal } from "@/components/ui";

interface CrawlResult {
  success: boolean;
  source: string;
  itemsCrawled: number;
  itemsSaved: number;
  errors: string[];
  duration: number;
}

interface ScheduledTask {
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

interface PendingData {
  schools: any[];
  admissions: any[];
  schedules: any[];
  summary: { schools: number; admissions: number; schedules: number };
}

interface AvailableSchool {
  id: string;
  name: string;
  type: string;
  region: string;
  website: string;
}

interface RealCrawlResult {
  success: boolean;
  data?: any;
  results?: any[];
  summary?: { total: number; success: number; schedules: number };
  message?: string;
}

export default function CrawlerPage() {
  const [activeTab, setActiveTab] = useState<"manual" | "real" | "schedule" | "pending">("manual");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [pendingData, setPendingData] = useState<PendingData | null>(null);
  const [selectedSource, setSelectedSource] = useState("sample");
  
  // 실제 크롤링 관련 상태
  const [availableSchools, setAvailableSchools] = useState<AvailableSchool[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [realCrawlResult, setRealCrawlResult] = useState<RealCrawlResult | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [crawlHistory, setCrawlHistory] = useState<any[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    // 토큰 확인
    if (!token) {
      console.error("토큰이 없습니다. 로그인 페이지로 이동합니다.");
      alert("로그인이 필요합니다.");
      window.location.href = "/login";
      return;
    }
    console.log("토큰 확인됨:", token.substring(0, 20) + "...");
    // 페이지 로드 시 pending 데이터 초기 로드
    fetchPendingData();
  }, []);

  useEffect(() => {
    if (activeTab === "schedule") {
      fetchTasks();
    } else if (activeTab === "pending") {
      fetchPendingData();
    }
  }, [activeTab]);

  const fetchTasks = async () => {
    try {
      const res = await fetch("${getApiUrl()}/api/admin/crawler/scheduler/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("스케줄 작업 조회 실패:", error);
    }
  };

  const fetchPendingData = async () => {
    try {
      const res = await fetch("${getApiUrl()}/api/admin/crawler/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingData(data);
      }
    } catch (error) {
      console.error("미승인 데이터 조회 실패:", error);
    }
  };

  const runCrawl = async (type: "schools" | "admissions" | "schedules" | "all") => {
    if (!token) {
      alert("로그인이 필요합니다.");
      window.location.href = "/login";
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    const url = `${getApiUrl()}/api/admin/crawler/${type}?source=${selectedSource}`;
    console.log("크롤링 API 호출:", url);
    console.log("토큰:", token.substring(0, 30) + "...");
    
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      console.log("응답 상태:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("크롤링 결과:", data);
        setResult(type === "all" ? data.schools : data);
        // 크롤링 성공 후 pending 데이터 자동 새로고침
        await fetchPendingData();
        alert(`크롤링 완료! ${data.itemsSaved || 0}개 항목이 저장되었습니다.`);
      } else {
        const errorText = await res.text();
        console.error("에러 응답:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          alert(`크롤링 실패 (${res.status}): ${errorData.message || '알 수 없는 오류'}`);
        } catch {
          alert(`크롤링 실패 (${res.status}): ${errorText}`);
        }
      }
    } catch (error: any) {
      console.error("크롤링 네트워크 에러:", error);
      alert(`네트워크 오류: ${error.message || '서버에 연결할 수 없습니다.'}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskName: string, enabled: boolean) => {
    const action = enabled ? "stop" : "start";
    try {
      const res = await fetch(
        `${getApiUrl()}/api/admin/crawler/scheduler/tasks/${taskName}/${action}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("작업 토글 실패:", error);
    }
  };

  const executeTask = async (taskName: string) => {
    try {
      const res = await fetch(
        `${getApiUrl()}/api/admin/crawler/scheduler/tasks/${taskName}/execute`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        alert(`'${taskName}' 작업이 실행되었습니다.`);
        fetchTasks();
      }
    } catch (error) {
      console.error("작업 실행 실패:", error);
    }
  };

  const approveItem = async (type: "schools" | "admissions" | "schedules", id: string) => {
    try {
      const res = await fetch(
        `${getApiUrl()}/api/admin/crawler/${type}/${id}/approve`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        fetchPendingData();
      }
    } catch (error) {
      console.error("승인 실패:", error);
    }
  };

  const rejectItem = async (type: "schools" | "admissions" | "schedules", id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(
        `${getApiUrl()}/api/admin/crawler/${type}/${id}/reject`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        fetchPendingData();
      }
    } catch (error) {
      console.error("거절 실패:", error);
    }
  };

  const approveAll = async () => {
    if (!confirm("모든 미승인 데이터를 승인하시겠습니까?")) return;
    try {
      const res = await fetch("${getApiUrl()}/api/admin/crawler/approve-all", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        alert(`승인 완료: 학교 ${data.approved.schools}개, 전형 ${data.approved.admissions}개, 일정 ${data.approved.schedules}개`);
        fetchPendingData();
      }
    } catch (error) {
      console.error("일괄 승인 실패:", error);
    }
  };

  // 실제 크롤링 관련 함수들
  const fetchAvailableSchools = async (type?: string) => {
    try {
      const url = type 
        ? `${getApiUrl()}/api/admin/crawler/real/available-schools?type=${type}`
        : "${getApiUrl()}/api/admin/crawler/real/available-schools";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableSchools(data.schools);
      }
    } catch (error) {
      console.error("크롤링 가능 학교 조회 실패:", error);
    }
  };

  const fetchCrawlHistory = async () => {
    try {
      const res = await fetch("${getApiUrl()}/api/admin/crawler/real/crawl-history?limit=20", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCrawlHistory(data.schedules);
      }
    } catch (error) {
      console.error("크롤링 히스토리 조회 실패:", error);
    }
  };

  const runRealCrawl = async (schoolIds: string[]) => {
    setLoading(true);
    setRealCrawlResult(null);
    try {
      const res = await fetch("${getApiUrl()}/api/admin/crawler/real/schools", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schoolIds, delay: 2000 }),
      });
      if (res.ok) {
        const data = await res.json();
        setRealCrawlResult(data);
        alert(`크롤링 완료! ${data.summary.success}개 학교에서 ${data.summary.schedules}개 일정 수집`);
        fetchPendingData();
        fetchCrawlHistory();
      } else {
        const errorText = await res.text();
        alert(`크롤링 실패: ${errorText}`);
      }
    } catch (error: any) {
      alert(`네트워크 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runRealCrawlByType = async (type: string) => {
    if (!confirm(`${type} 유형의 모든 학교를 크롤링하시겠습니까? 시간이 걸릴 수 있습니다.`)) return;
    setLoading(true);
    setRealCrawlResult(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/crawler/real/type/${type}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRealCrawlResult(data);
        alert(`크롤링 완료! ${data.summary.success}개 학교에서 ${data.summary.schedules}개 일정 수집`);
        fetchPendingData();
        fetchCrawlHistory();
      }
    } catch (error: any) {
      alert(`크롤링 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSchoolSelection = (schoolId: string) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId) 
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  const selectAllSchools = () => {
    if (selectedSchools.length === availableSchools.length) {
      setSelectedSchools([]);
    } else {
      setSelectedSchools(availableSchools.map(s => s.id));
    }
  };

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (activeTab === "real") {
      fetchAvailableSchools();
      fetchCrawlHistory();
    }
  }, [activeTab]);

  const tabs = [
    { id: "manual", label: "샘플 크롤링", icon: "🔄" },
    { id: "real", label: "실제 크롤링", icon: "🌐" },
    { id: "schedule", label: "스케줄 관리", icon: "⏰" },
    { id: "pending", label: "승인 대기", icon: "📋" },
  ];

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🕷️ 크롤러 관리</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">학교 입시 정보를 자동으로 수집하고 관리합니다</p>
        </div>

        {/* 탭 */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 수동 크롤링 탭 */}
        {activeTab === "manual" && (
          <div className="space-y-6">
            {/* 소스 선택 */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">크롤링 소스 선택</h3>
                <div className="flex gap-4">
                  {[
                    { value: "sample", label: "샘플 데이터", desc: "테스트용 더미 데이터" },
                    { value: "schoolinfo", label: "학교알리미", desc: "schoolinfo.go.kr" },
                    { value: "hischool", label: "하이스쿨", desc: "hischool.go.kr" },
                  ].map((source) => (
                    <label
                      key={source.value}
                      className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedSource === source.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="source"
                        value={source.value}
                        checked={selectedSource === source.value}
                        onChange={(e) => setSelectedSource(e.target.value)}
                        className="hidden"
                      />
                      <div className="font-medium">{source.label}</div>
                      <div className="text-sm text-gray-500">{source.desc}</div>
                    </label>
                  ))}
                </div>
              </div>
            </Card>

            {/* 크롤링 버튼들 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-6 text-center">
                <div className="text-4xl mb-3">🏫</div>
                <h3 className="font-semibold mb-2">학교 정보</h3>
                <p className="text-sm text-gray-500 mb-4">기본 정보, 시설, 특징</p>
                <Button
                  onClick={() => runCrawl("schools")}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "크롤링 중..." : "크롤링 시작"}
                </Button>
              </Card>

              <Card className="p-6 text-center">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="font-semibold mb-2">입시 전형</h3>
                <p className="text-sm text-gray-500 mb-4">전형 유형, 모집 인원</p>
                <Button
                  onClick={() => runCrawl("admissions")}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "크롤링 중..." : "크롤링 시작"}
                </Button>
              </Card>

              <Card className="p-6 text-center">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="font-semibold mb-2">입시 일정</h3>
                <p className="text-sm text-gray-500 mb-4">원서접수, 면접, 발표</p>
                <Button
                  onClick={() => runCrawl("schedules")}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "크롤링 중..." : "크롤링 시작"}
                </Button>
              </Card>

              <Card className="p-6 text-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="font-semibold mb-2">전체 크롤링</h3>
                <p className="text-sm opacity-80 mb-4">모든 데이터 수집</p>
                <Button
                  onClick={() => runCrawl("all")}
                  disabled={loading}
                  variant="secondary"
                  className="w-full bg-white text-blue-600 hover:bg-gray-100"
                >
                  {loading ? "크롤링 중..." : "전체 실행"}
                </Button>
              </Card>
            </div>

            {/* 결과 표시 */}
            {result && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {result.success ? "✅" : "❌"}
                    크롤링 결과
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{result.itemsCrawled}</div>
                      <div className="text-sm text-gray-500">수집된 항목</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{result.itemsSaved}</div>
                      <div className="text-sm text-gray-500">저장된 항목</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{result.duration}ms</div>
                      <div className="text-sm text-gray-500">소요 시간</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                      <div className="text-sm text-gray-500">에러 수</div>
                    </div>
                  </div>
                  {result.errors.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">에러 목록</h4>
                      <ul className="text-sm text-red-600 space-y-1">
                        {result.errors.map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* 실제 크롤링 탭 */}
        {activeTab === "real" && (
          <div className="space-y-6">
            {/* 안내 */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                  🌐 실제 학교 홈페이지 크롤링
                </h3>
                <p className="text-blue-700 mt-2">
                  등록된 학교의 실제 홈페이지에서 입시 정보를 수집합니다. 
                  크롤링된 데이터는 관리자 승인 후 사용자에게 노출됩니다.
                </p>
                <div className="mt-3 flex gap-2 text-sm">
                  <Badge variant="warning">⚠️ 학교당 약 5~10초 소요</Badge>
                  <Badge variant="info">💡 서버 부하 방지를 위해 2초 간격으로 크롤링</Badge>
                </div>
              </div>
            </Card>

            {/* 유형별 일괄 크롤링 */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">📂 학교 유형별 일괄 크롤링</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { type: "SCIENCE", label: "과학고/영재학교", icon: "🔬", color: "blue" },
                    { type: "FOREIGN_LANGUAGE", label: "외국어고", icon: "🌍", color: "green" },
                    { type: "INTERNATIONAL", label: "국제고", icon: "🌏", color: "purple" },
                    { type: "AUTONOMOUS_PRIVATE", label: "자사고", icon: "🏫", color: "orange" },
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => runRealCrawlByType(item.type)}
                      disabled={loading}
                      className={`p-4 rounded-lg border-2 hover:shadow-md transition-all text-left ${
                        loading ? "opacity-50 cursor-not-allowed" : "hover:border-blue-400"
                      }`}
                    >
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-gray-500">전체 크롤링</div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* 개별 학교 선택 */}
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">🏫 개별 학교 선택 크롤링</h3>
                  <div className="flex gap-2">
                    <select
                      value={selectedType}
                      onChange={(e) => {
                        setSelectedType(e.target.value);
                        fetchAvailableSchools(e.target.value || undefined);
                      }}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="">전체 유형</option>
                      <option value="SCIENCE">과학고</option>
                      <option value="FOREIGN_LANGUAGE">외국어고</option>
                      <option value="INTERNATIONAL">국제고</option>
                      <option value="AUTONOMOUS_PRIVATE">자사고</option>
                      <option value="ARTS">예술고</option>
                      <option value="SPORTS">체육고</option>
                    </select>
                    <Button onClick={() => fetchAvailableSchools(selectedType || undefined)} variant="secondary" size="sm">
                      새로고침
                    </Button>
                  </div>
                </div>

                {/* 선택 컨트롤 */}
                <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSchools.length === availableSchools.length && availableSchools.length > 0}
                        onChange={selectAllSchools}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">전체 선택</span>
                    </label>
                    <span className="text-sm text-gray-500">
                      {selectedSchools.length}개 선택됨 / 총 {availableSchools.length}개
                    </span>
                  </div>
                  <Button
                    onClick={() => runRealCrawl(selectedSchools)}
                    disabled={loading || selectedSchools.length === 0}
                    variant="primary"
                    size="sm"
                  >
                    {loading ? "크롤링 중..." : `선택한 ${selectedSchools.length}개 학교 크롤링`}
                  </Button>
                </div>

                {/* 학교 목록 */}
                <div className="max-h-96 overflow-y-auto border rounded-lg">
                  {availableSchools.map((school) => (
                    <label
                      key={school.id}
                      className={`flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedSchools.includes(school.id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSchools.includes(school.id)}
                        onChange={() => toggleSchoolSelection(school.id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{school.name}</div>
                        <div className="text-sm text-gray-500">
                          {school.region} | {school.type}
                        </div>
                      </div>
                      <a
                        href={school.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        🔗 홈페이지
                      </a>
                    </label>
                  ))}
                  {availableSchools.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      크롤링 가능한 학교가 없습니다
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* 크롤링 결과 */}
            {realCrawlResult && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {realCrawlResult.success ? "✅" : "❌"} 크롤링 결과
                  </h3>
                  {realCrawlResult.summary && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{realCrawlResult.summary.total}</div>
                        <div className="text-sm text-gray-500">요청한 학교</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{realCrawlResult.summary.success}</div>
                        <div className="text-sm text-gray-500">성공</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">{realCrawlResult.summary.schedules}</div>
                        <div className="text-sm text-gray-500">수집된 일정</div>
                      </div>
                    </div>
                  )}
                  {realCrawlResult.results && realCrawlResult.results.length > 0 && (
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-2 text-left">학교명</th>
                            <th className="p-2 text-center">수집 일정</th>
                            <th className="p-2 text-left">입시 페이지</th>
                          </tr>
                        </thead>
                        <tbody>
                          {realCrawlResult.results.map((r: any, i: number) => (
                            <tr key={i} className="border-t">
                              <td className="p-2">{r.schoolName}</td>
                              <td className="p-2 text-center">
                                <Badge variant={r.schedules.length > 0 ? "success" : "default"}>
                                  {r.schedules.length}개
                                </Badge>
                              </td>
                              <td className="p-2">
                                {r.admissionUrl && (
                                  <a href={r.admissionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                    바로가기
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* 최근 크롤링 히스토리 */}
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">📜 최근 수집된 일정</h3>
                  <Button onClick={fetchCrawlHistory} variant="secondary" size="sm">
                    새로고침
                  </Button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {crawlHistory.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="p-2 text-left">학교</th>
                          <th className="p-2 text-left">일정</th>
                          <th className="p-2 text-left">유형</th>
                          <th className="p-2 text-left">날짜</th>
                          <th className="p-2 text-center">상태</th>
                        </tr>
                      </thead>
                      <tbody>
                        {crawlHistory.map((schedule: any) => (
                          <tr key={schedule.id} className="border-t hover:bg-gray-50">
                            <td className="p-2">{schedule.school?.name}</td>
                            <td className="p-2">{schedule.title}</td>
                            <td className="p-2">{schedule.type}</td>
                            <td className="p-2">
                              {formatDateShort(schedule.startDate)}
                            </td>
                            <td className="p-2 text-center">
                              <Badge variant={schedule.publishStatus === "PUBLISHED" ? "success" : "warning"}>
                                {schedule.publishStatus === "PUBLISHED" ? "승인됨" : "대기중"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      최근 수집된 일정이 없습니다
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 스케줄 관리 탭 */}
        {activeTab === "schedule" && (
          <div className="space-y-4">
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">예약된 크롤링 작업</h3>
                  <Button onClick={fetchTasks} variant="secondary" size="sm">
                    새로고침
                  </Button>
                </div>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.name}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{task.name}</span>
                          <Badge variant={task.enabled ? "success" : "default"}>
                            {task.enabled ? "활성" : "비활성"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="mr-4">📆 스케줄: {task.schedule}</span>
                          {task.lastRun && (
                            <span className="mr-4">
                              ⏱️ 마지막 실행: {formatDateTime(task.lastRun)}
                            </span>
                          )}
                          {task.nextRun && (
                            <span>
                              ⏰ 다음 실행: {formatDateTime(task.nextRun)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => executeTask(task.name)}
                          variant="secondary"
                          size="sm"
                        >
                          즉시 실행
                        </Button>
                        <Button
                          onClick={() => toggleTask(task.name, task.enabled)}
                          variant={task.enabled ? "danger" : "primary"}
                          size="sm"
                        >
                          {task.enabled ? "중지" : "시작"}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      등록된 스케줄 작업이 없습니다
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">스케줄 형식 안내</h3>
                <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                  <p className="mb-2">┌───────── 분 (0-59)</p>
                  <p className="mb-2">│ ┌─────── 시 (0-23)</p>
                  <p className="mb-2">│ │ ┌───── 일 (1-31)</p>
                  <p className="mb-2">│ │ │ ┌─── 월 (1-12)</p>
                  <p className="mb-2">│ │ │ │ ┌─ 요일 (0-7, 0과 7은 일요일)</p>
                  <p>* * * * *</p>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p><code className="bg-gray-100 px-2 py-1 rounded">0 2 * * *</code> → 매일 새벽 2시</p>
                  <p><code className="bg-gray-100 px-2 py-1 rounded">0 3 * * 1</code> → 매주 월요일 새벽 3시</p>
                  <p><code className="bg-gray-100 px-2 py-1 rounded">0 0 * * 0</code> → 매주 일요일 자정</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 승인 대기 탭 */}
        {activeTab === "pending" && (
          <div className="space-y-6">
            {/* 요약 */}
            {pendingData && (
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">{pendingData.summary.schools}</div>
                  <div className="text-gray-500">학교</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">{pendingData.summary.admissions}</div>
                  <div className="text-gray-500">입시 전형</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600">{pendingData.summary.schedules}</div>
                  <div className="text-gray-500">입시 일정</div>
                </Card>
              </div>
            )}

            {/* 일괄 승인 */}
            {pendingData && (pendingData.summary.schools + pendingData.summary.admissions + pendingData.summary.schedules) > 0 && (
              <div className="flex justify-end">
                <Button onClick={approveAll} variant="primary">
                  ✅ 모두 승인
                </Button>
              </div>
            )}

            {/* 학교 목록 */}
            {pendingData && pendingData.schools.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">🏫 미승인 학교 ({pendingData.schools.length})</h3>
                  <div className="space-y-3">
                    {pendingData.schools.map((school) => (
                      <div key={school.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{school.name}</div>
                          <div className="text-sm text-gray-500">
                            {school.region} | {school.type} | {school.address || "주소 없음"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => approveItem("schools", school.id)}
                            size="sm"
                            variant="primary"
                          >
                            승인
                          </Button>
                          <Button
                            onClick={() => rejectItem("schools", school.id)}
                            size="sm"
                            variant="danger"
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* 입시 전형 목록 */}
            {pendingData && pendingData.admissions.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">📝 미승인 입시 전형 ({pendingData.admissions.length})</h3>
                  <div className="space-y-3">
                    {pendingData.admissions.map((admission) => (
                      <div key={admission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{admission.school?.name} - {admission.type}</div>
                          <div className="text-sm text-gray-500">
                            {admission.year}학년도 | 정원 {admission.quota}명
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => approveItem("admissions", admission.id)}
                            size="sm"
                            variant="primary"
                          >
                            승인
                          </Button>
                          <Button
                            onClick={() => rejectItem("admissions", admission.id)}
                            size="sm"
                            variant="danger"
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* 입시 일정 목록 */}
            {pendingData && pendingData.schedules.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">📅 미승인 입시 일정 ({pendingData.schedules.length})</h3>
                  <div className="space-y-3">
                    {pendingData.schedules.map((schedule) => (
                      <div key={schedule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{schedule.school?.name} - {schedule.title}</div>
                          <div className="text-sm text-gray-500">
                            {schedule.eventType} | {formatDateShort(schedule.startDate)}
                            {schedule.endDate && ` ~ ${formatDateShort(schedule.endDate)}`}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => approveItem("schedules", schedule.id)}
                            size="sm"
                            variant="primary"
                          >
                            승인
                          </Button>
                          <Button
                            onClick={() => rejectItem("schedules", schedule.id)}
                            size="sm"
                            variant="danger"
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* 빈 상태 */}
            {pendingData && 
              pendingData.summary.schools === 0 && 
              pendingData.summary.admissions === 0 && 
              pendingData.summary.schedules === 0 && (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-gray-700">승인 대기 중인 데이터가 없습니다</h3>
                <p className="text-gray-500 mt-2">모든 크롤링 데이터가 승인되었습니다</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

