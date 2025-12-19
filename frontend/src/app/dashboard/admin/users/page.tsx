"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Filter,
  Mail,
  Calendar,
  MoreVertical,
  ChevronRight,
  UserCheck,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { getToken } from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Input, Select } from "@/components/ui";
import { Modal } from "@/components/ui";

interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "PARENT" | "CONSULTANT" | "ADMIN";
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

type FilterRole = "all" | "STUDENT" | "PARENT" | "CONSULTANT" | "ADMIN";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<FilterRole>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/api/admin/stats/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // API가 users 배열을 반환한다고 가정
        setUsers(Array.isArray(data) ? data : data.users || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "STUDENT":
        return <Badge variant="info">학생</Badge>;
      case "PARENT":
        return <Badge variant="success">보호자</Badge>;
      case "CONSULTANT":
        return <Badge className="bg-purple-100 text-purple-700">컨설턴트</Badge>;
      case "ADMIN":
        return <Badge variant="danger">관리자</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "STUDENT":
        return <GraduationCap className="w-5 h-5 text-sky-600" />;
      case "PARENT":
        return <Users className="w-5 h-5 text-emerald-600" />;
      case "CONSULTANT":
        return <Briefcase className="w-5 h-5 text-purple-600" />;
      case "ADMIN":
        return <UserCheck className="w-5 h-5 text-red-600" />;
      default:
        return <Users className="w-5 h-5 text-slate-600" />;
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const userCounts = {
    total: users.length,
    students: users.filter((u) => u.role === "STUDENT").length,
    parents: users.filter((u) => u.role === "PARENT").length,
    consultants: users.filter((u) => u.role === "CONSULTANT").length,
    admins: users.filter((u) => u.role === "ADMIN").length,
  };

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">사용자 관리</h1>
          <p className="text-slate-500 mt-1">
            등록된 사용자를 관리하세요
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-slate-500">전체</p>
              <p className="text-2xl font-bold text-slate-900">{userCounts.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-sky-50 border-sky-200">
            <CardContent className="py-4">
              <p className="text-sm text-sky-600">학생</p>
              <p className="text-2xl font-bold text-sky-900">{userCounts.students}</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="py-4">
              <p className="text-sm text-emerald-600">보호자</p>
              <p className="text-2xl font-bold text-emerald-900">{userCounts.parents}</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="py-4">
              <p className="text-sm text-purple-600">컨설턴트</p>
              <p className="text-2xl font-bold text-purple-900">{userCounts.consultants}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="py-4">
              <p className="text-sm text-red-600">관리자</p>
              <p className="text-2xl font-bold text-red-900">{userCounts.admins}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="이름 또는 이메일로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Select
                options={[
                  { value: "all", label: "전체 역할" },
                  { value: "STUDENT", label: "학생" },
                  { value: "PARENT", label: "보호자" },
                  { value: "CONSULTANT", label: "컨설턴트" },
                  { value: "ADMIN", label: "관리자" },
                ]}
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as FilterRole)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                사용자가 없습니다
              </h3>
              <p className="text-slate-500">
                {searchQuery || filterRole !== "all"
                  ? "검색 조건에 맞는 사용자가 없습니다"
                  : "등록된 사용자가 없습니다"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                        사용자
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                        역할
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                        가입일
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                        상태
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                              {getRoleIcon(user.role)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{user.name}</p>
                              <p className="text-sm text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {user.createdAt}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={user.isActive ? "success" : "default"}>
                            {user.isActive ? "활성" : "비활성"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {filteredUsers.length}명 중 {(page - 1) * itemsPerPage + 1}-
                  {Math.min(page * itemsPerPage, filteredUsers.length)}명 표시
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    이전
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    다음
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* User Detail Modal */}
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title="사용자 상세"
          size="md"
        >
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
                  {getRoleIcon(selectedUser.role)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">
                    {selectedUser.name}
                  </h3>
                  {getRoleBadge(selectedUser.role)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <span>가입일: {selectedUser.createdAt}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <span className="text-slate-600">계정 상태</span>
                <Badge variant={selectedUser.isActive ? "success" : "default"} size="md">
                  {selectedUser.isActive ? "활성" : "비활성"}
                </Badge>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  비밀번호 초기화
                </Button>
                <Button
                  variant={selectedUser.isActive ? "danger" : "primary"}
                  className="flex-1"
                >
                  {selectedUser.isActive ? "계정 비활성화" : "계정 활성화"}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}


