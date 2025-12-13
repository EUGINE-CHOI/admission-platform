"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
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
  LogOut,
  Crown,
  GraduationCap,
  User,
  Clock,
  Percent,
  Mail,
  School,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolName?: string;
  grade?: number;
  createdAt: string;
}

interface Family {
  id: string;
  name: string;
  members: FamilyMember[];
  inviteCodes: { code: string; expiresAt: string }[];
}

interface FamilyStats {
  memberCount: number;
  studentCount: number;
  discountRate: number;
  discountPercent: number;
}

export default function FamilyPage() {
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<Family | null>(null);
  const [stats, setStats] = useState<FamilyStats | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setUserRole(parsed.role);
    }
    fetchFamily();
  }, []);

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const fetchFamily = async () => {
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/api/family", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFamily(data.family);
        setStats(data.stats);
      }
    } catch (e) {
      console.error("Failed to fetch family:", e);
    } finally {
      setLoading(false);
    }
  };

  const createFamily = async () => {
    if (!familyName.trim()) return;
    setCreating(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/api/family", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: familyName }),
      });
      if (res.ok) {
        fetchFamily();
        setShowCreateForm(false);
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
      const res = await fetch("http://localhost:3000/api/family/invite-code", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInviteCode(data.code);
        fetchFamily();
      }
    } catch (e) {
      console.error("Failed to generate invite code:", e);
    }
  };

  const joinFamily = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/api/family/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: joinCode }),
      });
      if (res.ok) {
        fetchFamily();
        setJoinCode("");
      } else {
        const error = await res.json();
        alert(error.message || "가족 참여에 실패했습니다");
      }
    } catch (e) {
      console.error("Failed to join family:", e);
    } finally {
      setJoining(false);
    }
  };

  const leaveFamily = async () => {
    if (!confirm("정말 가족에서 탈퇴하시겠습니까?")) return;
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/api/family/leave", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFamily(null);
        setStats(null);
      }
    } catch (e) {
      console.error("Failed to leave family:", e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "PARENT":
        return <Crown className="w-4 h-4 text-amber-500" />;
      case "STUDENT":
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-slate-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "PARENT":
        return "보호자";
      case "STUDENT":
        return "학생";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            가족 관리
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            가족 구성원을 관리하고 자녀 정보를 확인하세요
          </p>
        </div>

        {family ? (
          <>
            {/* Family Info Card */}
            <Card>
              <CardHeader icon={<Users className="w-5 h-5" />}>
                {family.name}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                      <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {stats?.memberCount || 0}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        가족 구성원
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                      <GraduationCap className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {stats?.studentCount || 0}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        학생
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                      <Percent className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {stats?.discountPercent || 0}%
                      </p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        가족 할인
                      </p>
                    </div>
                  </div>

                  {/* Family Discount Info */}
                  {stats && stats.discountPercent > 0 && (
                    <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                      <p className="font-medium">🎉 가족 할인 적용 중!</p>
                      <p className="text-sm opacity-90 mt-1">
                        자녀 {stats.studentCount}명으로 {stats.discountPercent}% 할인이 적용됩니다.
                      </p>
                    </div>
                  )}

                  {/* Members List */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      구성원
                    </h3>
                    <div className="space-y-2">
                      {family.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-medium">
                              {member.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {member.name}
                                </p>
                                {getRoleIcon(member.role)}
                                <Badge variant="outline" className="text-xs">
                                  {getRoleLabel(member.role)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <Mail className="w-3 h-3" />
                                {member.email}
                                {member.schoolName && (
                                  <>
                                    <School className="w-3 h-3 ml-2" />
                                    {member.schoolName} {member.grade}학년
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invite Code */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      가족 초대
                    </h3>
                    {inviteCode || family.inviteCodes[0]?.code ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-lg text-center">
                          {inviteCode || family.inviteCodes[0]?.code}
                        </div>
                        <Button
                          onClick={() => copyToClipboard(inviteCode || family.inviteCodes[0]?.code)}
                          variant="outline"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={generateInviteCode} variant="outline" className="w-full">
                        <UserPlus className="w-4 h-4 mr-2" />
                        초대 코드 생성
                      </Button>
                    )}
                    {(inviteCode || family.inviteCodes[0]?.expiresAt) && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        7일간 유효
                      </p>
                    )}
                  </div>

                  {/* Leave Family */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button onClick={leaveFamily} variant="ghost" className="text-red-500 hover:text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      가족 탈퇴
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Children List (for Parents) */}
            {userRole === "PARENT" && (
              <Card>
                <CardHeader icon={<GraduationCap className="w-5 h-5" />}>
                  자녀 정보
                </CardHeader>
                <CardContent>
                  {family.members.filter(m => m.role === "STUDENT").length > 0 ? (
                    <div className="space-y-3">
                      {family.members
                        .filter((m) => m.role === "STUDENT")
                        .map((child) => (
                          <a
                            key={child.id}
                            href={`/dashboard/parent/children/${child.id}`}
                            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium text-lg">
                                {child.name?.charAt(0) || "?"}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {child.name}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {child.schoolName} {child.grade}학년
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          </a>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>연결된 자녀가 없습니다</p>
                      <p className="text-sm mt-1">초대 코드를 공유하여 자녀를 초대하세요</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* No Family - Create or Join */
          <Card>
            <CardHeader icon={<Users className="w-5 h-5" />}>
              가족 연결
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-4">
                  <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    가족에 연결되어 있지 않습니다
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    가족을 생성하거나 초대 코드로 참여하세요
                  </p>
                </div>

                {/* Create Family */}
                {showCreateForm ? (
                  <div className="space-y-3">
                    <Input
                      label="가족 이름"
                      placeholder="예: 홍길동의 가족"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={createFamily}
                        disabled={creating || !familyName.trim()}
                        variant="primary"
                        className="flex-1"
                      >
                        {creating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                        가족 생성
                      </Button>
                      <Button onClick={() => setShowCreateForm(false)} variant="ghost">
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setShowCreateForm(true)} variant="primary" className="w-full">
                    <UserPlus className="w-4 h-4 mr-2" />
                    새 가족 만들기
                  </Button>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">또는</span>
                  </div>
                </div>

                {/* Join Family */}
                <div className="space-y-3">
                  <Input
                    label="초대 코드"
                    placeholder="6자리 코드 입력"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                  />
                  <Button
                    onClick={joinFamily}
                    disabled={joining || joinCode.length !== 6}
                    variant="outline"
                    className="w-full"
                  >
                    {joining ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                    가족 참여하기
                  </Button>
                </div>

                {/* Info */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">가족 연결의 장점</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                        <li>보호자가 학생의 학습 현황을 확인할 수 있습니다</li>
                        <li>자녀 2명 이상 시 10~20% 가족 할인이 적용됩니다</li>
                        <li>자녀의 활동, 성적 업데이트 알림을 받을 수 있습니다</li>
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

