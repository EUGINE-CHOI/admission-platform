"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Video,
  FileText,
  ChevronRight,
  Filter,
  Search,
  AlertCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Input, Select, Textarea } from "@/components/ui";
import { Modal } from "@/components/ui";

interface Consultation {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  parent: {
    name: string;
    email: string;
  };
  scheduledAt: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "REJECTED";
  topic?: string;
  notes?: ConsultationNote[];
  report?: ConsultationReport;
}

interface ConsultationNote {
  id: string;
  content: string;
  createdAt: string;
}

interface ConsultationReport {
  id: string;
  summary: string;
  recommendations: string;
  status: string;
}

type FilterStatus = "all" | "PENDING" | "CONFIRMED" | "COMPLETED";

export default function ConsultationsPage() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const getToken = () => localStorage.getItem("accessToken");

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/api/consultations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConsultations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmConsultation = async (id: string) => {
    setProcessing(true);
    try {
      const token = getToken();
      await fetch(`http://localhost:3000/api/consultations/${id}/confirm`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchConsultations();
    } catch (error) {
      console.error("Confirm error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const rejectConsultation = async (id: string) => {
    setProcessing(true);
    try {
      const token = getToken();
      await fetch(`http://localhost:3000/api/consultations/${id}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchConsultations();
    } catch (error) {
      console.error("Reject error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const completeConsultation = async (id: string) => {
    setProcessing(true);
    try {
      const token = getToken();
      await fetch(`http://localhost:3000/api/consultations/${id}/complete`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchConsultations();
      setSelectedConsultation(null);
    } catch (error) {
      console.error("Complete error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const addNote = async (id: string) => {
    if (!noteContent.trim()) return;
    setProcessing(true);
    try {
      const token = getToken();
      await fetch(`http://localhost:3000/api/consultations/${id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: noteContent }),
      });
      setNoteContent("");
      fetchConsultations();
    } catch (error) {
      console.error("Add note error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="warning">대기중</Badge>;
      case "CONFIRMED":
        return <Badge variant="info">확정</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="info">진행중</Badge>;
      case "COMPLETED":
        return <Badge variant="success">완료</Badge>;
      case "CANCELLED":
        return <Badge variant="default">취소</Badge>;
      case "REJECTED":
        return <Badge variant="danger">거절</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredConsultations = consultations.filter((c) => {
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    const matchesSearch =
      c.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topic?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = consultations.filter((c) => c.status === "PENDING").length;
  const todayCount = consultations.filter((c) => {
    const today = new Date().toISOString().split("T")[0];
    return c.scheduledAt.startsWith(today) && c.status === "CONFIRMED";
  }).length;

  return (
    <DashboardLayout requiredRole="CONSULTANT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">상담 관리</h1>
            <p className="text-slate-500 mt-1">
              상담 요청을 관리하고 진행하세요
            </p>
          </div>
          <div className="flex gap-3">
            {pendingCount > 0 && (
              <Badge variant="warning" size="md">
                <AlertCircle className="w-4 h-4 mr-1" />
                대기 {pendingCount}건
              </Badge>
            )}
            {todayCount > 0 && (
              <Badge variant="info" size="md">
                <Calendar className="w-4 h-4 mr-1" />
                오늘 {todayCount}건
              </Badge>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="학생 이름 또는 주제로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Select
                options={[
                  { value: "all", label: "전체 상태" },
                  { value: "PENDING", label: "대기중" },
                  { value: "CONFIRMED", label: "확정" },
                  { value: "COMPLETED", label: "완료" },
                ]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Consultations List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
          </div>
        ) : filteredConsultations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                상담이 없습니다
              </h3>
              <p className="text-slate-500">
                {searchQuery || filterStatus !== "all"
                  ? "검색 조건에 맞는 상담이 없습니다"
                  : "아직 예약된 상담이 없습니다"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredConsultations.map((consultation) => (
              <Card
                key={consultation.id}
                hover
                className="cursor-pointer"
                onClick={() => setSelectedConsultation(consultation)}
              >
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold">
                        {consultation.student.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">
                            {consultation.student.name}
                          </h3>
                          {getStatusBadge(consultation.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {consultation.scheduledAt}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {consultation.parent.name} 학부모
                          </span>
                        </div>
                        {consultation.topic && (
                          <p className="text-sm text-slate-600 mt-2 truncate">
                            📋 {consultation.topic}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {consultation.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmConsultation(consultation.id);
                            }}
                            isLoading={processing}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            확정
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              rejectConsultation(consultation.id);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            거절
                          </Button>
                        </>
                      )}
                      {consultation.status === "CONFIRMED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Video className="w-4 h-4" />}
                        >
                          상담 시작
                        </Button>
                      )}
                      {consultation.status === "COMPLETED" && !consultation.report && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<FileText className="w-4 h-4" />}
                        >
                          리포트 작성
                        </Button>
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
          isOpen={!!selectedConsultation}
          onClose={() => {
            setSelectedConsultation(null);
            setNoteContent("");
          }}
          title="상담 상세"
          size="lg"
        >
          {selectedConsultation && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold">
                  {selectedConsultation.student.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-lg">
                      {selectedConsultation.student.name}
                    </h3>
                    {getStatusBadge(selectedConsultation.status)}
                  </div>
                  <p className="text-slate-500">{selectedConsultation.parent.name} 학부모</p>
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">예약 일시</p>
                  <p className="font-medium text-slate-900">
                    {selectedConsultation.scheduledAt}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">이메일</p>
                  <p className="font-medium text-slate-900 text-sm">
                    {selectedConsultation.student.email}
                  </p>
                </div>
              </div>

              {selectedConsultation.topic && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">상담 주제</h4>
                  <p className="text-slate-600 p-3 bg-slate-50 rounded-xl">
                    {selectedConsultation.topic}
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">상담 노트</h4>
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {selectedConsultation.notes && selectedConsultation.notes.length > 0 ? (
                    selectedConsultation.notes.map((note) => (
                      <div key={note.id} className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-600">{note.content}</p>
                        <p className="text-xs text-slate-400 mt-1">{note.createdAt}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">
                      작성된 노트가 없습니다
                    </p>
                  )}
                </div>
                
                {(selectedConsultation.status === "CONFIRMED" || 
                  selectedConsultation.status === "IN_PROGRESS") && (
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="상담 노트를 작성하세요..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={2}
                    />
                    <Button
                      onClick={() => addNote(selectedConsultation.id)}
                      isLoading={processing}
                      disabled={!noteContent.trim()}
                    >
                      추가
                    </Button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                {selectedConsultation.status === "PENDING" && (
                  <>
                    <Button
                      className="flex-1"
                      onClick={() => confirmConsultation(selectedConsultation.id)}
                      isLoading={processing}
                    >
                      상담 확정
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => rejectConsultation(selectedConsultation.id)}
                    >
                      거절
                    </Button>
                  </>
                )}
                {selectedConsultation.status === "CONFIRMED" && (
                  <>
                    <Button variant="outline" className="flex-1" leftIcon={<Video className="w-4 h-4" />}>
                      화상 상담 시작
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => completeConsultation(selectedConsultation.id)}
                      isLoading={processing}
                    >
                      상담 완료
                    </Button>
                  </>
                )}
                {selectedConsultation.status === "COMPLETED" && !selectedConsultation.report && (
                  <Button className="w-full" leftIcon={<FileText className="w-4 h-4" />}>
                    리포트 작성하기
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
