"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Heart,
  Star,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent, StatCard } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";

interface ChildData {
  id: string;
  name: string;
  email: string;
  grade: string;
  school: string;
  grades: Grade[];
  activities: Activity[];
  readings: Reading[];
  volunteers: Volunteer[];
  targetSchools: TargetSchool[];
  diagnosisResults: DiagnosisResult[];
  planProgress: PlanProgress | null;
  pendingApprovals: Approval[];
}

interface Grade {
  id: string;
  subject: string;
  grade: number;
  semester: string;
  year: number;
  status: string;
}

interface Activity {
  id: string;
  title: string;
  activityType: string;
  description: string;
  status: string;
}

interface Reading {
  id: string;
  title: string;
  author: string;
  status: string;
}

interface Volunteer {
  id: string;
  organization: string;
  hours: number;
  date: string;
}

interface TargetSchool {
  id: string;
  school: { name: string; region: string };
  priority: number;
}

interface DiagnosisResult {
  id: string;
  school: { name: string };
  result: string;
  matchScore: number;
}

interface PlanProgress {
  totalTasks: number;
  completedTasks: number;
  progress: number;
  currentWeek: number;
}

interface Approval {
  id: string;
  type: string;
  title: string;
  createdAt: string;
}

type TabType = "overview" | "grades" | "activities" | "diagnosis" | "approvals";

export default function ChildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;
  
  const [child, setChild] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  useEffect(() => {
    fetchChildData();
  }, [childId]);

  const getToken = () => localStorage.getItem("accessToken");

  const fetchChildData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `http://localhost:3000/api/dashboard/parent/children/${childId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setChild(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveItem = async (type: string, id: string) => {
    try {
      const token = getToken();
      await fetch(`http://localhost:3000/api/student/${type}/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchChildData();
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  const requestRevision = async (type: string, id: string, reason: string) => {
    try {
      const token = getToken();
      await fetch(`http://localhost:3000/api/student/${type}/${id}/revision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      fetchChildData();
    } catch (error) {
      console.error("Revision error:", error);
    }
  };

  const tabs = [
    { id: "overview" as TabType, label: "개요", icon: TrendingUp },
    { id: "grades" as TabType, label: "성적", icon: Trophy },
    { id: "activities" as TabType, label: "활동", icon: BookOpen },
    { id: "diagnosis" as TabType, label: "진단", icon: Target },
    { id: "approvals" as TabType, label: "승인 대기", icon: AlertCircle },
  ];

  if (loading) {
    return (
      <DashboardLayout requiredRole="PARENT">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!child) {
    return (
      <DashboardLayout requiredRole="PARENT">
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-slate-900">
            자녀 정보를 찾을 수 없습니다
          </h2>
          <Button className="mt-4" onClick={() => router.back()}>
            돌아가기
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="PARENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {child.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{child.name}</h1>
                <p className="text-slate-500">{child.grade} · {child.school || "학교 미등록"}</p>
              </div>
            </div>
          </div>
          {child.pendingApprovals && child.pendingApprovals.length > 0 && (
            <Badge variant="warning" size="md">
              승인 대기 {child.pendingApprovals.length}건
            </Badge>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all
                ${activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === "approvals" && child.pendingApprovals?.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                  {child.pendingApprovals.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <OverviewTab child={child} />
        )}

        {activeTab === "grades" && (
          <GradesTab grades={child.grades || []} onApprove={approveItem} />
        )}

        {activeTab === "activities" && (
          <ActivitiesTab 
            activities={child.activities || []} 
            readings={child.readings || []}
            volunteers={child.volunteers || []}
            onApprove={approveItem}
          />
        )}

        {activeTab === "diagnosis" && (
          <DiagnosisTab 
            targetSchools={child.targetSchools || []}
            results={child.diagnosisResults || []}
          />
        )}

        {activeTab === "approvals" && (
          <ApprovalsTab 
            approvals={child.pendingApprovals || []}
            onApprove={approveItem}
            onRevision={requestRevision}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function OverviewTab({ child }: { child: ChildData }) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Trophy className="w-6 h-6" />}
          title="입력된 성적"
          value={child.grades?.length || 0}
          suffix="과목"
          color="sky"
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          title="활동 기록"
          value={child.activities?.length || 0}
          suffix="개"
          color="emerald"
        />
        <StatCard
          icon={<Target className="w-6 h-6" />}
          title="목표 학교"
          value={child.targetSchools?.length || 0}
          suffix="개"
          color="indigo"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          title="플랜 진행률"
          value={child.planProgress?.progress || 0}
          suffix="%"
          color="amber"
        />
      </div>

      {/* Progress & Target Schools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Progress */}
        <Card>
          <CardHeader icon={<TrendingUp className="w-5 h-5" />}>
            액션 플랜 진행 현황
          </CardHeader>
          <CardContent>
            {child.planProgress ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">전체 진행률</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {child.planProgress.progress}%
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${child.planProgress.progress}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {child.planProgress.completedTasks}
                    </p>
                    <p className="text-xs text-slate-500">완료 태스크</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {child.planProgress.currentWeek}주차
                    </p>
                    <p className="text-xs text-slate-500">현재 진행</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">
                아직 액션 플랜이 없습니다
              </p>
            )}
          </CardContent>
        </Card>

        {/* Target Schools */}
        <Card>
          <CardHeader icon={<Target className="w-5 h-5" />}>
            목표 학교
          </CardHeader>
          <CardContent>
            {child.targetSchools?.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                설정된 목표 학교가 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {child.targetSchools?.slice(0, 5).map((ts, idx) => (
                  <div key={ts.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{ts.school.name}</p>
                      <p className="text-xs text-slate-500">{ts.school.region}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Diagnosis */}
      {child.diagnosisResults && child.diagnosisResults.length > 0 && (
        <Card>
          <CardHeader icon={<Sparkles className="w-5 h-5" />}>
            최근 진단 결과
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {child.diagnosisResults.slice(0, 3).map((result) => (
                <div key={result.id} className="p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-slate-900">{result.school.name}</p>
                    <Badge 
                      variant={
                        result.result === "FIT" ? "success" : 
                        result.result === "CHALLENGE" ? "warning" : "danger"
                      }
                    >
                      {result.result === "FIT" ? "적합" : 
                       result.result === "CHALLENGE" ? "도전" : "어려움"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          result.result === "FIT" ? "bg-emerald-500" :
                          result.result === "CHALLENGE" ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${result.matchScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      {result.matchScore}점
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function GradesTab({ grades, onApprove }: { grades: Grade[]; onApprove: (type: string, id: string) => void }) {
  if (grades.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">입력된 성적이 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader icon={<Trophy className="w-5 h-5" />}>성적 목록</CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">과목</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">성적</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">학기</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">상태</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">작업</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id} className="border-b border-slate-100">
                  <td className="py-3 px-4 font-medium text-slate-900">{grade.subject}</td>
                  <td className="py-3 px-4">
                    <Badge variant={grade.grade >= 90 ? "success" : grade.grade >= 70 ? "warning" : "danger"}>
                      {grade.grade}점
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{grade.year} {grade.semester}</td>
                  <td className="py-3 px-4">
                    <Badge variant={grade.status === "APPROVED" ? "success" : "warning"}>
                      {grade.status === "APPROVED" ? "승인됨" : "대기"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {grade.status === "PENDING" && (
                      <Button size="sm" onClick={() => onApprove("grades", grade.id)}>
                        승인
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivitiesTab({ 
  activities, 
  readings, 
  volunteers,
  onApprove 
}: { 
  activities: Activity[]; 
  readings: Reading[];
  volunteers: Volunteer[];
  onApprove: (type: string, id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Activities */}
      <Card>
        <CardHeader icon={<BookOpen className="w-5 h-5" />}>활동 기록</CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-center text-slate-500 py-8">입력된 활동이 없습니다</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activities.map((activity) => (
                <div key={activity.id} className="p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <Badge>{activity.activityType}</Badge>
                    <Badge variant={activity.status === "APPROVED" ? "success" : "warning"}>
                      {activity.status === "APPROVED" ? "승인됨" : "대기"}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-slate-900">{activity.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">{activity.description}</p>
                  {activity.status === "PENDING" && (
                    <Button size="sm" className="mt-3" onClick={() => onApprove("activities", activity.id)}>
                      승인
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Readings */}
      <Card>
        <CardHeader icon={<BookOpen className="w-5 h-5" />}>독서 기록</CardHeader>
        <CardContent>
          {readings.length === 0 ? (
            <p className="text-center text-slate-500 py-8">입력된 독서가 없습니다</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {readings.map((reading) => (
                <div key={reading.id} className="p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="w-5 h-5 text-amber-500" />
                    <Badge variant={reading.status === "APPROVED" ? "success" : "warning"}>
                      {reading.status === "APPROVED" ? "승인됨" : "대기"}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-slate-900">{reading.title}</h3>
                  <p className="text-sm text-slate-500">{reading.author}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Volunteers */}
      <Card>
        <CardHeader icon={<Heart className="w-5 h-5" />}>봉사활동</CardHeader>
        <CardContent>
          {volunteers.length === 0 ? (
            <p className="text-center text-slate-500 py-8">입력된 봉사활동이 없습니다</p>
          ) : (
            <div className="space-y-3">
              {volunteers.map((vol) => (
                <div key={vol.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-rose-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{vol.organization}</p>
                    <p className="text-sm text-slate-500">{vol.date}</p>
                  </div>
                  <Badge>{vol.hours}시간</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DiagnosisTab({ targetSchools, results }: { targetSchools: TargetSchool[]; results: DiagnosisResult[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon={<Target className="w-5 h-5" />}>목표 학교</CardHeader>
        <CardContent>
          {targetSchools.length === 0 ? (
            <p className="text-center text-slate-500 py-8">설정된 목표 학교가 없습니다</p>
          ) : (
            <div className="space-y-3">
              {targetSchools.map((ts, idx) => (
                <div key={ts.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{ts.school.name}</p>
                    <p className="text-sm text-slate-500">{ts.school.region}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader icon={<Sparkles className="w-5 h-5" />}>진단 결과</CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-center text-slate-500 py-8">진단 결과가 없습니다</p>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.id} className="p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900">{result.school.name}</h3>
                    <Badge 
                      variant={
                        result.result === "FIT" ? "success" : 
                        result.result === "CHALLENGE" ? "warning" : "danger"
                      }
                    >
                      {result.result === "FIT" ? "적합" : 
                       result.result === "CHALLENGE" ? "도전" : "어려움"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          result.result === "FIT" ? "bg-emerald-500" :
                          result.result === "CHALLENGE" ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${result.matchScore}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-slate-900">{result.matchScore}점</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ApprovalsTab({ 
  approvals, 
  onApprove,
  onRevision
}: { 
  approvals: Approval[]; 
  onApprove: (type: string, id: string) => void;
  onRevision: (type: string, id: string, reason: string) => void;
}) {
  if (approvals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            모든 항목이 승인되었습니다
          </h3>
          <p className="text-slate-500">승인 대기 중인 항목이 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader icon={<AlertCircle className="w-5 h-5" />}>
        승인 대기 항목
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvals.map((approval) => (
            <div key={approval.id} className="p-4 border border-amber-200 bg-amber-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="warning">{approval.type}</Badge>
                <span className="text-xs text-slate-500">{approval.createdAt}</span>
              </div>
              <h3 className="font-medium text-slate-900 mb-3">{approval.title}</h3>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onApprove(approval.type.toLowerCase(), approval.id)}>
                  승인
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onRevision(approval.type.toLowerCase(), approval.id, "수정이 필요합니다")}
                >
                  수정 요청
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
