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
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
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
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월"
];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const getToken = () => localStorage.getItem("accessToken");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const res = await fetch(
        `http://localhost:3000/api/calendar/admissions?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
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

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((event) => event.date.startsWith(dateStr));
  };

  const selectedDateEvents = selectedDate
    ? getEventsForDate(selectedDate.getDate())
    : [];

  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <DashboardLayout requiredRole="PARENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">일정 캘린더</h1>
            <p className="text-slate-500 mt-1">
              입시 일정과 상담 예약을 관리하세요
            </p>
          </div>
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
                <h2 className="text-lg font-semibold text-slate-900">
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
                {/* Empty cells for days before the first day */}
                {Array.from({ length: firstDay }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-24 p-1" />
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const dayEvents = getEventsForDate(day);
                  const isToday =
                    today.getFullYear() === year &&
                    today.getMonth() === month &&
                    today.getDate() === day;
                  const isSelected =
                    selectedDate?.getFullYear() === year &&
                    selectedDate?.getMonth() === month &&
                    selectedDate?.getDate() === day;
                  const dayOfWeek = (firstDay + idx) % 7;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(new Date(year, month, day))}
                      className={`h-24 p-1 text-left rounded-lg border transition-all ${
                        isSelected
                          ? "border-sky-500 bg-sky-50"
                          : isToday
                          ? "border-sky-300 bg-sky-50/50"
                          : "border-transparent hover:bg-slate-50"
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
                            : "text-slate-700"
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
                          <div className="text-xs text-slate-400 px-1">
                            +{dayEvents.length - 2}개 더
                          </div>
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
                <CardHeader icon={<CalendarIcon className="w-5 h-5" />}>
                  {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
                </CardHeader>
                <CardContent>
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                      예정된 일정이 없습니다
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => {
                        const typeInfo = getEventTypeInfo(event.type);
                        return (
                          <div
                            key={event.id}
                            className="p-3 border border-slate-200 rounded-xl"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-1 h-full rounded-full ${typeInfo.color}`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={`${typeInfo.bgColor} ${typeInfo.textColor}`}>
                                    {typeInfo.label}
                                  </Badge>
                                  {event.time && (
                                    <span className="text-xs text-slate-500">
                                      {event.time}
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-medium text-slate-900">
                                  {event.title}
                                </h4>
                                {event.childName && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    <User className="w-3 h-3 inline mr-1" />
                                    {event.childName}
                                  </p>
                                )}
                                {event.schoolName && (
                                  <p className="text-xs text-slate-500">
                                    <MapPin className="w-3 h-3 inline mr-1" />
                                    {event.schoolName}
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
              <CardHeader icon={<Bell className="w-5 h-5" />}>
                다가오는 일정
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    예정된 일정이 없습니다
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => {
                      const typeInfo = getEventTypeInfo(event.type);
                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeInfo.bgColor}`}
                          >
                            <CalendarIcon className={`w-5 h-5 ${typeInfo.textColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                              {event.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>{event.date}</span>
                              {event.childName && (
                                <>
                                  <span>·</span>
                                  <span>{event.childName}</span>
                                </>
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

            {/* Legend */}
            <Card>
              <CardContent>
                <h4 className="text-sm font-medium text-slate-900 mb-3">범례</h4>
                <div className="space-y-2">
                  {[
                    { type: "ADMISSION", label: "입시 일정" },
                    { type: "CONSULTATION", label: "상담 예약" },
                    { type: "TASK", label: "태스크" },
                    { type: "CUSTOM", label: "기타 일정" },
                  ].map((item) => {
                    const typeInfo = getEventTypeInfo(item.type);
                    return (
                      <div key={item.type} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${typeInfo.color}`} />
                        <span className="text-sm text-slate-600">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


