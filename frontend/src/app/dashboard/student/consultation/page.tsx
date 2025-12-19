"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  Clock,
  MessageSquare,
  Star,
  ChevronRight,
  Video,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { getToken, getApiUrl } from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Modal } from "@/components/ui";
import { Select, Textarea } from "@/components/ui";

interface Consultant {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  reviewCount: number;
  bio: string;
  profileImage?: string;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface Consultation {
  id: string;
  consultant: Consultant;
  scheduledAt: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED";
  topic?: string;
  notes?: string;
}

export default function ConsultationPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [myConsultations, setMyConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [topic, setTopic] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();

      const [consultantsRes, consultationsRes] = await Promise.all([
        fetch("${getApiUrl()}/api/consultants", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("${getApiUrl()}/api/consultations", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (consultantsRes.ok) {
        const data = await consultantsRes.json();
        setConsultants(Array.isArray(data) ? data : []);
      }
      if (consultationsRes.ok) {
        const data = await consultationsRes.json();
        setMyConsultations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (consultantId: string) => {
    try {
      const token = getToken();
      const res = await fetch(
        `${getApiUrl()}/api/consultants/${consultantId}/slots`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch slots error:", error);
    }
  };

  const bookConsultation = async () => {
    if (!selectedConsultant || !selectedSlot) return;

    setIsBooking(true);
    try {
      const token = getToken();
      const res = await fetch("${getApiUrl()}/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          consultantId: selectedConsultant.id,
          scheduledAt: selectedSlot.startTime,
          topic,
        }),
      });

      if (res.ok) {
        setSelectedConsultant(null);
        setSelectedSlot(null);
        setTopic("");
        fetchData();
      }
    } catch (error) {
      console.error("Book error:", error);
    } finally {
      setIsBooking(false);
    }
  };

  const cancelConsultation = async (id: string) => {
    try {
      const token = getToken();
      await fetch(`${getApiUrl()}/api/consultations/${id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (error) {
      console.error("Cancel error:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="success">확정</Badge>;
      case "PENDING":
        return <Badge variant="warning">대기중</Badge>;
      case "COMPLETED":
        return <Badge variant="info">완료</Badge>;
      case "CANCELLED":
        return <Badge variant="default">취소됨</Badge>;
      case "REJECTED":
        return <Badge variant="danger">거절됨</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const upcomingConsultations = myConsultations.filter(
    (c) => c.status === "CONFIRMED" || c.status === "PENDING"
  );
  const pastConsultations = myConsultations.filter(
    (c) => c.status === "COMPLETED" || c.status === "CANCELLED" || c.status === "REJECTED"
  );

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">상담</h1>
          <p className="text-slate-500 mt-1">
            전문 컨설턴트와 1:1 상담을 예약하세요
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - My Consultations */}
            <div className="lg:col-span-1 space-y-6">
              {/* Upcoming */}
              <Card>
                <CardHeader icon={<Calendar className="w-5 h-5" />}>
                  예정된 상담
                </CardHeader>
                <CardContent>
                  {upcomingConsultations.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6">
                      예정된 상담이 없습니다
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingConsultations.map((consultation) => (
                        <div
                          key={consultation.id}
                          className="p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => setSelectedConsultation(consultation)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-sm font-medium">
                                {consultation.consultant.name.charAt(0)}
                              </div>
                              <span className="font-medium text-slate-900">
                                {consultation.consultant.name}
                              </span>
                            </div>
                            {getStatusBadge(consultation.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock className="w-3 h-3" />
                            {consultation.scheduledAt}
                          </div>
                          {consultation.topic && (
                            <p className="text-sm text-slate-600 mt-2 line-clamp-1">
                              {consultation.topic}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Past */}
              <Card>
                <CardHeader icon={<FileText className="w-5 h-5" />}>
                  지난 상담
                </CardHeader>
                <CardContent>
                  {pastConsultations.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6">
                      지난 상담 기록이 없습니다
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {pastConsultations.slice(0, 5).map((consultation) => (
                        <div
                          key={consultation.id}
                          className="p-3 bg-slate-50 rounded-xl"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-slate-900 text-sm">
                              {consultation.consultant.name}
                            </span>
                            {getStatusBadge(consultation.status)}
                          </div>
                          <p className="text-xs text-slate-500">
                            {consultation.scheduledAt}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Consultants */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader icon={<Users className="w-5 h-5" />}>
                  전문 컨설턴트
                </CardHeader>
                <CardContent>
                  {consultants.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        등록된 컨설턴트가 없습니다
                      </h3>
                      <p className="text-sm text-slate-500">
                        곧 전문 컨설턴트가 등록될 예정입니다
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {consultants.map((consultant) => (
                        <div
                          key={consultant.id}
                          className="p-4 border border-slate-200 rounded-xl hover:border-sky-300 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => {
                            setSelectedConsultant(consultant);
                            fetchAvailableSlots(consultant.id);
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                              {consultant.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900">
                                {consultant.name}
                              </h3>
                              <p className="text-sm text-slate-500 mb-2">
                                {consultant.specialization}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-amber-500">
                                  <Star className="w-4 h-4 fill-current" />
                                  <span className="text-sm font-medium">
                                    {consultant.rating.toFixed(1)}
                                  </span>
                                </div>
                                <span className="text-xs text-slate-400">
                                  ({consultant.reviewCount}개 리뷰)
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          </div>
                          {consultant.bio && (
                            <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                              {consultant.bio}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Booking Modal */}
        <Modal
          isOpen={!!selectedConsultant}
          onClose={() => {
            setSelectedConsultant(null);
            setSelectedSlot(null);
            setTopic("");
          }}
          title="상담 예약"
          size="lg"
        >
          {selectedConsultant && (
            <div className="space-y-6">
              {/* Consultant Info */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedConsultant.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">
                    {selectedConsultant.name}
                  </h3>
                  <p className="text-slate-500">{selectedConsultant.specialization}</p>
                  <div className="flex items-center gap-1 mt-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">
                      {selectedConsultant.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">예약 가능 시간</h4>
                {availableSlots.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    현재 예약 가능한 시간이 없습니다
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        disabled={!slot.available}
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          selectedSlot?.id === slot.id
                            ? "border-sky-500 bg-sky-50 text-sky-700"
                            : slot.available
                            ? "border-slate-200 hover:border-slate-300"
                            : "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          {slot.startTime}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Topic */}
              <Textarea
                label="상담 주제"
                placeholder="상담받고 싶은 내용을 간단히 작성해주세요"
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedConsultant(null);
                    setSelectedSlot(null);
                    setTopic("");
                  }}
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  onClick={bookConsultation}
                  isLoading={isBooking}
                  disabled={!selectedSlot}
                >
                  예약하기
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Consultation Detail Modal */}
        <Modal
          isOpen={!!selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
          title="상담 상세"
          size="md"
        >
          {selectedConsultation && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                  {selectedConsultation.consultant.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {selectedConsultation.consultant.name}
                  </h3>
                  <p className="text-slate-500">
                    {selectedConsultation.consultant.specialization}
                  </p>
                </div>
                {getStatusBadge(selectedConsultation.status)}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <span>{selectedConsultation.scheduledAt}</span>
                </div>
                {selectedConsultation.topic && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">상담 주제</p>
                    <p className="text-slate-900">{selectedConsultation.topic}</p>
                  </div>
                )}
              </div>

              {selectedConsultation.status === "PENDING" && (
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => {
                    cancelConsultation(selectedConsultation.id);
                    setSelectedConsultation(null);
                  }}
                >
                  예약 취소
                </Button>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
