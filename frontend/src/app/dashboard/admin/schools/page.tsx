"use client";

import { useEffect, useState } from "react";
import {
  School,
  Search,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Input, Select, Textarea } from "@/components/ui";
import { Modal, ConfirmModal } from "@/components/ui";

interface SchoolData {
  id: string;
  name: string;
  type: string;
  region: string;
  address?: string;
  description?: string;
  isPublished: boolean;
  admissionCount: number;
  scheduleCount: number;
  createdAt: string;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });
  const [formData, setFormData] = useState({
    name: "",
    type: "일반고",
    region: "",
    address: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const getToken = () => localStorage.getItem("accessToken");

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/api/school/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSchools(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSchool = async () => {
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/api/school", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({ name: "", type: "일반고", region: "", address: "", description: "" });
        fetchSchools();
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const publishSchool = async (id: string) => {
    try {
      const token = getToken();
      await fetch(`http://localhost:3000/api/school/${id}/publish`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSchools();
    } catch (error) {
      console.error("Publish error:", error);
    }
  };

  const filteredSchools = schools.filter((school) => {
    const matchesType = filterType === "all" || school.type === filterType;
    const matchesSearch =
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.region.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const schoolTypes = [...new Set(schools.map((s) => s.type))];

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">학교 관리</h1>
            <p className="text-slate-500 mt-1">
              학교 정보와 입시 전형을 관리하세요
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            학교 추가
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                  <School className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">전체 학교</p>
                  <p className="text-2xl font-bold text-slate-900">{schools.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">게시됨</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {schools.filter((s) => s.isPublished).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">전형 정보</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {schools.reduce((sum, s) => sum + s.admissionCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">일정</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {schools.reduce((sum, s) => sum + s.scheduleCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="학교명 또는 지역으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Select
                options={[
                  { value: "all", label: "전체 유형" },
                  ...schoolTypes.map((type) => ({ value: type, label: type })),
                ]}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schools List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
          </div>
        ) : filteredSchools.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <School className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                학교가 없습니다
              </h3>
              <p className="text-slate-500 mb-4">
                {searchQuery || filterType !== "all"
                  ? "검색 조건에 맞는 학교가 없습니다"
                  : "등록된 학교가 없습니다"}
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                첫 번째 학교 추가
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchools.map((school) => (
              <Card
                key={school.id}
                hover
                className="cursor-pointer"
                onClick={() => setSelectedSchool(school)}
              >
                <CardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge>{school.type}</Badge>
                      {school.isPublished ? (
                        <Badge variant="success">게시됨</Badge>
                      ) : (
                        <Badge variant="warning">미게시</Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-slate-900 mb-2">{school.name}</h3>
                  
                  <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    {school.region}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>전형 {school.admissionCount}개</span>
                      <span>일정 {school.scheduleCount}개</span>
                    </div>
                    {!school.isPublished && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          publishSchool(school.id);
                        }}
                      >
                        게시
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="학교 추가"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="학교명"
              placeholder="학교 이름을 입력하세요"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="학교 유형"
                options={[
                  { value: "일반고", label: "일반고" },
                  { value: "자사고", label: "자율형 사립고" },
                  { value: "특목고", label: "특수목적고" },
                  { value: "영재학교", label: "영재학교" },
                  { value: "과학고", label: "과학고" },
                  { value: "외고", label: "외국어고" },
                  { value: "국제고", label: "국제고" },
                ]}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
              <Input
                label="지역"
                placeholder="예: 서울, 경기"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                required
              />
            </div>
            <Input
              label="주소"
              placeholder="학교 주소를 입력하세요"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Textarea
              label="설명"
              placeholder="학교에 대한 설명을 입력하세요"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsAddModalOpen(false)}
              >
                취소
              </Button>
              <Button
                className="flex-1"
                onClick={saveSchool}
                isLoading={saving}
                disabled={!formData.name || !formData.region}
              >
                추가
              </Button>
            </div>
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal
          isOpen={!!selectedSchool}
          onClose={() => setSelectedSchool(null)}
          title={selectedSchool?.name || "학교 상세"}
          size="lg"
        >
          {selectedSchool && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge>{selectedSchool.type}</Badge>
                {selectedSchool.isPublished ? (
                  <Badge variant="success">게시됨</Badge>
                ) : (
                  <Badge variant="warning">미게시</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">지역</p>
                  <p className="font-medium text-slate-900">{selectedSchool.region}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">등록일</p>
                  <p className="font-medium text-slate-900">{selectedSchool.createdAt}</p>
                </div>
              </div>

              {selectedSchool.address && (
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">주소</p>
                  <p className="font-medium text-slate-900">{selectedSchool.address}</p>
                </div>
              )}

              {selectedSchool.description && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">설명</p>
                  <p className="text-slate-700">{selectedSchool.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedSchool.admissionCount}
                  </p>
                  <p className="text-sm text-slate-500">전형 정보</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-xl text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedSchool.scheduleCount}
                  </p>
                  <p className="text-sm text-slate-500">입시 일정</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" leftIcon={<Edit className="w-4 h-4" />}>
                  수정
                </Button>
                {!selectedSchool.isPublished && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      publishSchool(selectedSchool.id);
                      setSelectedSchool(null);
                    }}
                  >
                    게시하기
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}

