"use client";

import { useEffect, useState } from "react";
import {
  UserCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Briefcase,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Input, Select } from "@/components/ui";
import { Modal, ConfirmModal } from "@/components/ui";

interface Consultant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  bio?: string;
  consultantStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

type FilterStatus = "all" | "PENDING" | "APPROVED" | "REJECTED";

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    action: "approve" | "reject";
    consultantId: string | null;
  }>({ isOpen: false, action: "approve", consultantId: null });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchConsultants();
  }, []);

  const getToken = () => localStorage.getItem("accessToken");

  const fetchConsultants = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/api/admin/consultants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConsultants(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveConsultant = async (id: string) => {
    setProcessing(true);
    try {
      const token = getToken();
      await fetch(`http://localhost:3000/api/admin/consultants/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchConsultants();
      setConfirmAction({ isOpen: false, action: "approve", consultantId: null });
    } catch (error) {
      console.error("Approve error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const rejectConsultant = async (id: string) => {
    setProcessing(true);
    try {
      const token = getToken();
      await fetch(`http://localhost:3000/api/admin/consultants/${id}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchConsultants();
      setConfirmAction({ isOpen: false, action: "reject", consultantId: null });
    } catch (error) {
      console.error("Reject error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="warning">대기중</Badge>;
      case "APPROVED":
        return <Badge variant="success">승인됨</Badge>;
      case "REJECTED":
        return <Badge variant="danger">거절됨</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredConsultants = consultants.filter((c) => {
    const matchesStatus = filterStatus === "all" || c.consultantStatus === filterStatus;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = consultants.filter((c) => c.consultantStatus === "PENDING").length;

  return (
    <DashboardLayout requiredRole="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">컨설턴트 승인</h1>
            <p className="text-slate-500 mt-1">
              컨설턴트 가입 요청을 관리하세요
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge variant="warning" size="md">
              <AlertCircle className="w-4 h-4 mr-1" />
              대기 {pendingCount}명
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-amber-700">대기중</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {consultants.filter((c) => c.consultantStatus === "PENDING").length}명
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-emerald-700">승인됨</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {consultants.filter((c) => c.consultantStatus === "APPROVED").length}명
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-700">거절됨</p>
                  <p className="text-2xl font-bold text-red-900">
                    {consultants.filter((c) => c.consultantStatus === "REJECTED").length}명
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
                  placeholder="이름 또는 이메일로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Select
                options={[
                  { value: "all", label: "전체 상태" },
                  { value: "PENDING", label: "대기중" },
                  { value: "APPROVED", label: "승인됨" },
                  { value: "REJECTED", label: "거절됨" },
                ]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Consultants List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
          </div>
        ) : filteredConsultants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                컨설턴트가 없습니다
              </h3>
              <p className="text-slate-500">
                {searchQuery || filterStatus !== "all"
                  ? "검색 조건에 맞는 컨설턴트가 없습니다"
                  : "등록된 컨설턴트가 없습니다"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredConsultants.map((consultant) => (
              <Card
                key={consultant.id}
                hover
                className={`cursor-pointer ${
                  consultant.consultantStatus === "PENDING"
                    ? "border-l-4 border-l-amber-500"
                    : ""
                }`}
                onClick={() => setSelectedConsultant(consultant)}
              >
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                        {consultant.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">
                            {consultant.name}
                          </h3>
                          {getStatusBadge(consultant.consultantStatus)}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {consultant.email}
                          </span>
                          {consultant.specialization && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {consultant.specialization}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {consultant.consultantStatus === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmAction({
                                isOpen: true,
                                action: "approve",
                                consultantId: consultant.id,
                              });
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            승인
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmAction({
                                isOpen: true,
                                action: "reject",
                                consultantId: consultant.id,
                              });
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            거절
                          </Button>
                        </>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={!!selectedConsultant}
          onClose={() => setSelectedConsultant(null)}
          title="컨설턴트 상세"
          size="lg"
        >
          {selectedConsultant && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedConsultant.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-lg">
                      {selectedConsultant.name}
                    </h3>
                    {getStatusBadge(selectedConsultant.consultantStatus)}
                  </div>
                  <p className="text-slate-500">{selectedConsultant.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">연락처</p>
                  <p className="font-medium text-slate-900">
                    {selectedConsultant.phone || "미등록"}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">전문 분야</p>
                  <p className="font-medium text-slate-900">
                    {selectedConsultant.specialization || "미등록"}
                  </p>
                </div>
              </div>

              {selectedConsultant.bio && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">소개</p>
                  <p className="text-slate-700 p-4 bg-slate-50 rounded-xl">
                    {selectedConsultant.bio}
                  </p>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">가입일</p>
                <p className="font-medium text-slate-900">
                  {selectedConsultant.createdAt}
                </p>
              </div>

              {selectedConsultant.consultantStatus === "PENDING" && (
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setSelectedConsultant(null);
                      setConfirmAction({
                        isOpen: true,
                        action: "approve",
                        consultantId: selectedConsultant.id,
                      });
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    승인하기
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedConsultant(null);
                      setConfirmAction({
                        isOpen: true,
                        action: "reject",
                        consultantId: selectedConsultant.id,
                      });
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    거절하기
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmAction.isOpen}
          onClose={() => setConfirmAction({ isOpen: false, action: "approve", consultantId: null })}
          onConfirm={() => {
            if (confirmAction.consultantId) {
              if (confirmAction.action === "approve") {
                approveConsultant(confirmAction.consultantId);
              } else {
                rejectConsultant(confirmAction.consultantId);
              }
            }
          }}
          title={confirmAction.action === "approve" ? "컨설턴트 승인" : "컨설턴트 거절"}
          message={
            confirmAction.action === "approve"
              ? "이 컨설턴트를 승인하시겠습니까? 승인 후 상담 서비스를 제공할 수 있습니다."
              : "이 컨설턴트를 거절하시겠습니까?"
          }
          confirmText={confirmAction.action === "approve" ? "승인" : "거절"}
          variant={confirmAction.action === "approve" ? "primary" : "danger"}
          isLoading={processing}
        />
      </div>
    </DashboardLayout>
  );
}



