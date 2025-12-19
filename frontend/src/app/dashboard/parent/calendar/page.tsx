"use client";

import { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Bell,
  Plus,
  X,
  Video,
  Phone,
  Users,
  Loader2,
  Check,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { getToken, getApiUrl } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/utils";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "ADMISSION" | "CONSULTATION" | "TASK" | "CUSTOM";
  childName?: string;
  schoolName?: string;
  description?: string;
  status?: string;
}

interface Consultant {
  id: string;
  name: string;
  specialization?: string;
}

interface Child {
  id: string;
  name: string;
  grade?: number;
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월"
];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // 예약 모달 상태
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState<string>("");
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [consultationType, setConsultationType] = useState<"ONLINE" | "PHONE" | "VISIT">("ONLINE");
  const [topic, setTopic] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchConsultants();
    fetchChildren();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      // 입시 일정
      const admissionRes = await fetch(
        `${getApiUrl()}/api/calendar/admissions?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // 상담 일정
      const consultationRes = await fetch(
        `${getApiUrl()}/api/consultations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let allEvents: CalendarEvent[] = [];

      if (admissionRes.ok) {
        const admissionData = await admissionRes.json();
        if (Array.isArray(admissionData)) {
          allEvents = [...allEvents, ...admissionData];
        }
      }

      if (consultationRes.ok) {
        const consultationData = await consultationRes.json();
        if (Array.isArray(consultationData)) {
          const consultationEvents = consultationData.map((c: any) => ({
            id: c.id,
            title: `${c.consultant?.name || '컨설턴트'} 상담`,
            date: c.scheduledAt?.split('T')[0],
            time: formatTime(c.scheduledAt),
            type: "CONSULTATION" as const,
            childName: c.student?.name,
            status: c.status,
            description: c.topic,
          }));
          allEvents = [...allEvents, ...consultationEvents];
        }
      }

      setEvents(allEvents);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultants = async () => {
    try {
      const token = getToken();
      const res = await fetch("${getApiUrl()}/api/consultants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConsultants(Array.isArray(data) ? data : data.consultants || []);
      }
    } catch (error) {
      console.error("Failed to fetch consultants:", error);
    }
  };

  const fetchChildren = async () => {
    try {
      const token = getToken();
      const res = await fetch("${getApiUrl()}/api/family/children", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChildren(data.children || []);
      }
    } catch (error) {
      console.error("Failed to fetch children:", error);
    }
  };

  const handleBookConsultation = async () => {
    if (!selectedDate || !selectedConsultant || !selectedChild || !selectedTime) {
      alert("모든 필수 항목을 선택해주세요.");
      return;
    }

    setBookingLoading(true);
    try {
      const token = getToken();
      const scheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":");
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const res = await fetch("${getApiUrl()}/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          consultantId: selectedConsultant,
          studentId: selectedChild,
          scheduledAt: scheduledAt.toISOString(),
          method: consultationType,
          topic: topic || undefined,
          duration: 60,
        }),
      });

      if (res.ok) {
        setBookingSuccess(true);
        setTimeout(() => {
          setShowBookingModal(false);
          setBookingSuccess(false);
          resetBookingForm();
          fetchEvents();
        }, 1500);
      } else {
        const error = await res.json();
        alert(error.message || "예약에 실패했습니다.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("서버에 연결할 수 없습니다.");
    } finally {
      setBookingLoading(false);
    }
  };

  const resetBookingForm = () => {
    setSelectedConsultant("");
    setSelectedChild("");
    setSelectedTime("");
    setConsultationType("ONLINE");
    setTopic("");
  };

  const getEventTypeInfo = (type: string) => {
    switch (type) {
      case "ADMISSION":
        return { label: "입시", color: "bg-sky-500", textColor: "text-sky-600", bgColor: "bg-sky-100" };
      case "CONSULTATION":
        return { label: "상담", color: "bg-emerald-500", textColor: "text-emerald-600", bgColor: "bg-emerald-100" };
      case "TASK":
        return { label: "태스크", color: "bg-amber-500", textColor: "text-amber-600", bgColor: "bg-amber-100" };
      default:
        return { label: "일정", color: "bg-slate-500", textColor: "text-slate-600", bgColor: "bg-slate-100" };
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="warning">대기중</Badge>;
      case "CONFIRMED":
        return <Badge variant="success">확정</Badge>;
      case "COMPLETED":
        return <Badge variant="info">완료</Badge>;
      case "CANCELLED":
        return <Badge variant="danger">취소</Badge>;
      default:
        return null;
    }
  };

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((event) => event.date?.startsWith(dateStr));
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate.getDate()) : [];

  const upcomingEvents = events
    .filter((event) => event.date && new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <DashboardLayout requiredRole="PARENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">캘린더</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              입시 일정과 상담 예약을 관리하세요
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedDate(new Date());
              setShowBookingModal(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            상담 예약
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardContent>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="sm" onClick={prevMonth}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {year}년 {MONTHS[month]}
                </h2>
                <Button variant="ghost" size="sm" onClick={nextMonth}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((day, idx) => (
                  <div
                    key={day}
                    className={`text-center text-sm font-medium py-2 ${
                      idx === 0 ? "text-red-500" : idx === 6 ? "text-sky-500" : "text-slate-500"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-24 p-1" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const dayEvents = getEventsForDate(day);
                  const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                  const isSelected = selectedDate?.getFullYear() === year && selectedDate?.getMonth() === month && selectedDate?.getDate() === day;
                  const dayOfWeek = (firstDay + idx) % 7;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(new Date(year, month, day))}
                      className={`h-24 p-1 text-left rounded-lg border transition-all ${
                        isSelected
                          ? "border-sky-500 bg-sky-50 dark:bg-sky-900/30"
                          : isToday
                          ? "border-sky-300 bg-sky-50/50 dark:bg-sky-900/20"
                          : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full ${
                          isToday
                            ? "bg-sky-500 text-white"
                            : dayOfWeek === 0
                            ? "text-red-500"
                            : dayOfWeek === 6
                            ? "text-sky-500"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 2).map((event) => {
                          const typeInfo = getEventTypeInfo(event.type);
                          return (
                            <div
                              key={event.id}
                              className={`text-xs truncate px-1 py-0.5 rounded ${typeInfo.bgColor} ${typeInfo.textColor}`}
                            >
                              {event.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-slate-400 px-1">+{dayEvents.length - 2}개</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Events */}
            {selectedDate && (
              <Card>
                <CardHeader 
                  icon={<CalendarIcon className="w-5 h-5" />}
                  action={
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setShowBookingModal(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  }
                >
                  {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
                </CardHeader>
                <CardContent>
                  {selectedDateEvents.length === 0 ? (
                    <div className="text-center py-6">
                      <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">예정된 일정이 없습니다</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => setShowBookingModal(true)}
                      >
                        상담 예약하기
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => {
                        const typeInfo = getEventTypeInfo(event.type);
                        return (
                          <div key={event.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <div className="flex items-start gap-3">
                              <div className={`w-1 h-12 rounded-full ${typeInfo.color}`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <Badge className={`${typeInfo.bgColor} ${typeInfo.textColor}`}>
                                    {typeInfo.label}
                                  </Badge>
                                  {getStatusBadge(event.status)}
                                  {event.time && (
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {event.time}
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-medium text-slate-900 dark:text-white">{event.title}</h4>
                                {event.childName && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    <User className="w-3 h-3 inline mr-1" />
                                    {event.childName}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Events */}
            <Card>
              <CardHeader icon={<Bell className="w-5 h-5" />}>다가오는 일정</CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">예정된 일정이 없습니다</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => {
                      const typeInfo = getEventTypeInfo(event.type);
                      return (
                        <div key={event.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeInfo.bgColor}`}>
                            <CalendarIcon className={`w-5 h-5 ${typeInfo.textColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white truncate">{event.title}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>{event.date}</span>
                              {event.time && <span>{event.time}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardContent>
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">범례</h4>
                <div className="space-y-2">
                  {[
                    { type: "ADMISSION", label: "입시 일정" },
                    { type: "CONSULTATION", label: "상담 예약" },
                    { type: "TASK", label: "태스크" },
                  ].map((item) => {
                    const typeInfo = getEventTypeInfo(item.type);
                    return (
                      <div key={item.type} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${typeInfo.color}`} />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">상담 예약</h2>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  resetBookingForm();
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">예약 완료!</h3>
                <p className="text-slate-500">상담 예약이 접수되었습니다.</p>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* 날짜 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    예약 날짜
                  </label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white">
                    {selectedDate && formatDate(selectedDate, { weekday: 'long' })}
                  </div>
                </div>

                {/* 시간 선택 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    시간 선택 *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === time
                            ? "bg-sky-500 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 자녀 선택 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    상담 대상 자녀 *
                  </label>
                  {children.length === 0 ? (
                    <p className="text-sm text-slate-500">연결된 자녀가 없습니다.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => setSelectedChild(child.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            selectedChild === child.id
                              ? "bg-sky-500 text-white"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          <User className="w-4 h-4" />
                          {child.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 컨설턴트 선택 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    컨설턴트 선택 *
                  </label>
                  {consultants.length === 0 ? (
                    <p className="text-sm text-slate-500">등록된 컨설턴트가 없습니다.</p>
                  ) : (
                    <div className="space-y-2">
                      {consultants.map((consultant) => (
                        <button
                          key={consultant.id}
                          onClick={() => setSelectedConsultant(consultant.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            selectedConsultant === consultant.id
                              ? "border-sky-500 bg-sky-50 dark:bg-sky-900/30"
                              : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-medium">
                            {consultant.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-slate-900 dark:text-white">{consultant.name}</p>
                            {consultant.specialization && (
                              <p className="text-xs text-slate-500">{consultant.specialization}</p>
                            )}
                          </div>
                          {selectedConsultant === consultant.id && (
                            <Check className="w-5 h-5 text-sky-500 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 상담 방식 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    상담 방식
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "ONLINE", icon: Video, label: "화상" },
                      { value: "PHONE", icon: Phone, label: "전화" },
                      { value: "VISIT", icon: Users, label: "방문" },
                    ].map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setConsultationType(method.value as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                          consultationType === method.value
                            ? "bg-sky-500 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        <method.icon className="w-4 h-4" />
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 상담 주제 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    상담 주제 (선택)
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="예: 과학고 입시 상담, 학습 계획 수립 등"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* 버튼 */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowBookingModal(false);
                      resetBookingForm();
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleBookConsultation}
                    isLoading={bookingLoading}
                    disabled={!selectedTime || !selectedChild || !selectedConsultant}
                  >
                    예약하기
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
