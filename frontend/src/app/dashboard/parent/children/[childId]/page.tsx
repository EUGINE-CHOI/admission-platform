"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import {
  ArrowLeft,
  GraduationCap,
  School,
  BookOpen,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Download,
  ChevronRight,
  Activity,
  Brain,
  RefreshCw,
  ExternalLink,
  Star,
  MessageCircle,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface ChildDetail {
  id: string;
  name: string;
  email: string;
  schoolName?: string;
  grade?: number;
  middleSchool?: {
    name: string;
    website?: string;
  };
}

interface Grade {
  id: string;
  subject: string;
  score: number;
  grade: number;
  semester: string;
}

interface ActivityItem {
  id: string;
  name: string;
  type: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  readDate?: string;
}

interface TargetSchool {
  id: string;
  priority: number;
  school: {
    id: string;
    name: string;
    type: string;
  };
}

export default function ChildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;
  
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState<ChildDetail | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [targetSchools, setTargetSchools] = useState<TargetSchool[]>([]);

  useEffect(() => {
    fetchChildData();
  }, [childId]);

  const getToken = () => localStorage.getItem("accessToken");

  const fetchChildData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      // 자녀 기본 정보
      const childRes = await fetch(`http://localhost:3000/api/students/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (childRes.ok) {
        const data = await childRes.json();
        setChild(data);
      }

      // 성적
      const gradesRes = await fetch(`http://localhost:3000/api/students/${childId}/grades`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (gradesRes.ok) {
        const data = await gradesRes.json();
        setGrades(Array.isArray(data) ? data : data.grades || []);
      }

      // 비교과 활동
      const activitiesRes = await fetch(`http://localhost:3000/api/students/${childId}/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setActivities(Array.isArray(data) ? data : data.activities || []);
      }

      // 독서
      const booksRes = await fetch(`http://localhost:3000/api/students/${childId}/books`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (booksRes.ok) {
        const data = await booksRes.json();
        setBooks(Array.isArray(data) ? data : data.books || []);
      }

      // 목표 학교
      const schoolsRes = await fetch(`http://localhost:3000/api/students/${childId}/target-schools`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (schoolsRes.ok) {
        const data = await schoolsRes.json();
        setTargetSchools(Array.isArray(data) ? data : []);
      }

    } catch (error) {
      console.error("Failed to fetch child data:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3000/api/reports/student/${childId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${child?.name}_리포트.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("PDF 다운로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("PDF download error:", error);
    }
  };

  // 성적 차트 데이터
  const gradeChartData = grades.slice(0, 6).map(g => ({
    subject: g.subject,
    점수: g.score,
    등급: g.grade,
  }));

  // 레이더 차트 데이터 (과목별 점수)
  const radarData = grades.slice(0, 5).map(g => ({
    subject: g.subject.length > 4 ? g.subject.slice(0, 4) + ".." : g.subject,
    score: g.score,
    fullMark: 100,
  }));

  // 활동 유형별 집계
  const activityStats = activities.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activityChartData = Object.entries(activityStats).map(([type, count]) => ({
    type: type === "VOLUNTEER" ? "봉사" : type === "COMPETITION" ? "대회" : type === "CLUB" ? "동아리" : type === "CERTIFICATE" ? "자격증" : "기타",
    count,
  }));

  if (loading) {
    return (
      <DashboardLayout requiredRole="PARENT">
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!child) {
    return (
      <DashboardLayout requiredRole="PARENT">
        <div className="text-center py-20">
          <p className="text-slate-500">자녀 정보를 찾을 수 없습니다.</p>
          <Button onClick={() => router.back()} className="mt-4">
            돌아가기
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="PARENT">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl">
                {child.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {child.name}
                </h1>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                  {child.middleSchool && (
                    <span className="flex items-center gap-1">
                      <School className="w-4 h-4" />
                      {child.middleSchool.name}
                      {child.middleSchool.website && (
                        <a
                          href={child.middleSchool.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:text-primary-600"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </span>
                  )}
                  {child.grade && <Badge variant="info">{child.grade}학년</Badge>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              leftIcon={<MessageCircle className="w-4 h-4" />}
              onClick={() => router.push("/dashboard/parent/calendar")}
            >
              상담 예약
            </Button>
            <Button
              leftIcon={<Download className="w-4 h-4" />}
              onClick={downloadPDF}
            >
              리포트 다운로드
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {grades.length > 0 ? Math.round(grades.reduce((a, g) => a + g.score, 0) / grades.length) : "-"}
                  </p>
                  <p className="text-xs text-slate-500">평균 점수</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activities.length}</p>
                  <p className="text-xs text-slate-500">비교과 활동</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{books.length}</p>
                  <p className="text-xs text-slate-500">독서 기록</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{targetSchools.length}</p>
                  <p className="text-xs text-slate-500">목표 학교</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 성적 현황 */}
          <Card>
            <CardHeader icon={<TrendingUp className="w-5 h-5" />}>성적 현황</CardHeader>
            <CardContent>
              {grades.length > 0 ? (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gradeChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="점수" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {grades.slice(0, 5).map((grade) => (
                      <div
                        key={grade.id}
                        className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300">{grade.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">{grade.score}점</span>
                          <Badge variant={grade.grade <= 2 ? "success" : grade.grade <= 4 ? "warning" : "danger"}>
                            {grade.grade}등급
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  등록된 성적이 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* 비교과 활동 */}
          <Card>
            <CardHeader icon={<Activity className="w-5 h-5" />}>비교과 활동</CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <>
                  {activityChartData.length > 0 && (
                    <div className="h-48 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activityChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis type="number" />
                          <YAxis dataKey="type" type="category" width={60} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div className="space-y-2">
                    {activities.slice(0, 5).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{activity.name}</span>
                          <Badge variant="outline" className="ml-2">{activity.type}</Badge>
                        </div>
                        {activity.startDate && (
                          <span className="text-xs text-slate-400">{activity.startDate}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  등록된 활동이 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* 목표 학교 */}
          <Card>
            <CardHeader icon={<Target className="w-5 h-5" />}>목표 학교</CardHeader>
            <CardContent>
              {targetSchools.length > 0 ? (
                <div className="space-y-3">
                  {targetSchools.map((ts) => (
                    <div
                      key={ts.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">{ts.school.name}</p>
                        <p className="text-xs text-slate-500">{ts.school.type}</p>
                      </div>
                      <Badge variant="outline">{ts.priority}순위</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  등록된 목표 학교가 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* 독서 기록 */}
          <Card>
            <CardHeader icon={<BookOpen className="w-5 h-5" />}>독서 기록</CardHeader>
            <CardContent>
              {books.length > 0 ? (
                <div className="space-y-3">
                  {books.slice(0, 5).map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">{book.title}</p>
                        <p className="text-xs text-slate-500">{book.author}</p>
                      </div>
                      {book.readDate && (
                        <span className="text-xs text-slate-400">{book.readDate}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  등록된 독서 기록이 없습니다
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 종합 분석 (레이더 차트) */}
        {radarData.length > 0 && (
          <Card>
            <CardHeader icon={<Brain className="w-5 h-5" />}>종합 역량 분석</CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar
                      name="점수"
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}


