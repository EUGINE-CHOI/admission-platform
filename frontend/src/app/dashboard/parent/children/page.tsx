"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { getApiUrl } from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Input } from "@/components/ui";
import {
  Users,
  UserPlus,
  Copy,
  Check,
  RefreshCw,
  GraduationCap,
  School,
  ChevronRight,
  AlertCircle,
  Clock,
  BookOpen,
  Target,
  TrendingUp,
  Percent,
} from "lucide-react";

interface Child {
  id: string;
  name: string;
  email: string;
  schoolName?: string;
  grade?: number;
  createdAt: string;
}

interface Family {
  id: string;
  name: string;
  members: any[];
}

interface FamilyStats {
  memberCount: number;
  studentCount: number;
  discountRate: number;
  discountPercent: number;
}

export default function ChildrenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<Family | null>(null);
  const [stats, setStats] = useState<FamilyStats | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const fetchData = async () => {
    try {
      const token = getToken();
      
      // 가족 정보 조회
      const familyRes = await fetch("${getApiUrl()}/api/family", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (familyRes.ok) {
        const familyData = await familyRes.json();
        setFamily(familyData.family);
        setStats(familyData.stats);
        
        if (familyData.family) {
          // 자녀 목록 조회
          const childrenRes = await fetch("${getApiUrl()}/api/family/children", {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (childrenRes.ok) {
            const childrenData = await childrenRes.json();
            setChildren(childrenData.children || []);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  };

  const createFamily = async () => {
    if (!familyName.trim()) return;
    setCreating(true);
    try {
      const token = getToken();
      const res = await fetch("${getApiUrl()}/api/family", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: familyName }),
      });
      if (res.ok) {
        fetchData();
        setFamilyName("");
      }
    } catch (e) {
      console.error("Failed to create family:", e);
    } finally {
      setCreating(false);
    }
  };

  const generateInviteCode = async () => {
    try {
      const token = getToken();
      const res = await fetch("${getApiUrl()}/api/family/invite-code", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInviteCode(data.code);
      }
    } catch (e) {
      console.error("Failed to generate invite code:", e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="PARENT">
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="PARENT">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            학생 현황
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            학생의 학습 현황을 확인하고 관리하세요
          </p>
        </div>

        {family ? (
          <>
            {/* 가족 할인 배너 */}
            {stats && stats.discountPercent > 0 && (
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Percent className="w-6 h-6" />
                  <div>
                    <p className="font-medium">가족 할인 {stats.discountPercent}% 적용 중!</p>
                    <p className="text-sm opacity-90">학생 {stats.studentCount}명 등록</p>
                  </div>
                </div>
              </div>
            )}

            {/* 학생 초대 */}
            <Card>
              <CardHeader icon={<UserPlus className="w-5 h-5" />}>
                학생 초대하기
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    {inviteCode ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-xl text-center tracking-widest">
                          {inviteCode}
                        </div>
                        <Button
                          onClick={() => copyToClipboard(inviteCode)}
                          variant="outline"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={generateInviteCode} variant="primary" className="w-full sm:w-auto">
                        <UserPlus className="w-4 h-4 mr-2" />
                        초대 코드 생성
                      </Button>
                    )}
                  </div>
                  {inviteCode && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      7일간 유효 · 학생이 회원가입 후 이 코드를 입력하면 연결됩니다
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 학생 목록 */}
            <Card>
              <CardHeader icon={<GraduationCap className="w-5 h-5" />}>
                연결된 학생 ({children.length}명)
              </CardHeader>
              <CardContent>
                {children.length > 0 ? (
                  <div className="space-y-3">
                    {children.map((child) => (
                      <div
                        key={child.id}
                        onClick={() => router.push(`/dashboard/parent/children/${child.id}`)}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                            {child.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {child.name}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                              {child.schoolName && (
                                <span className="flex items-center gap-1">
                                  <School className="w-3.5 h-3.5" />
                                  {child.schoolName}
                                </span>
                              )}
                              {child.grade && (
                                <Badge variant="outline">{child.grade}학년</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mr-4">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              활동
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              진단
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              성적
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <GraduationCap className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      아직 연결된 학생이 없습니다
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      초대 코드를 생성하여 학생에게 공유해주세요
                    </p>
                    {!inviteCode && (
                      <Button onClick={generateInviteCode} variant="primary">
                        <UserPlus className="w-4 h-4 mr-2" />
                        초대 코드 생성
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          /* 가족 연결 안됨 - 생성 필요 */
          <Card>
            <CardHeader icon={<Users className="w-5 h-5" />}>
              가족 연결
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  가족 그룹을 만들어주세요
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  가족 그룹을 만들면 학생을 초대하고 학습 현황을 확인할 수 있습니다
                </p>

                <div className="max-w-sm mx-auto space-y-4">
                  <Input
                    label="가족 이름"
                    placeholder="예: 홍길동네 가족"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                  />
                  <Button
                    onClick={createFamily}
                    disabled={creating || !familyName.trim()}
                    variant="primary"
                    className="w-full"
                  >
                    {creating ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    가족 그룹 만들기
                  </Button>
                </div>

                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-left max-w-md mx-auto">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">가족 연결의 장점</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                        <li>학생의 학습 현황 실시간 확인</li>
                        <li>학생 2명 이상 시 10~20% 할인</li>
                        <li>활동/성적 업데이트 알림</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

