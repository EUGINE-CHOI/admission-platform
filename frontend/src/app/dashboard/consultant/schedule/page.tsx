"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Select } from "@/components/ui";

interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Availability {
  slots: TimeSlot[];
}

const DAYS = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
const TIMES = Array.from({ length: 24 }, (_, i) => {
  const hour = String(i).padStart(2, "0");
  return { value: `${hour}:00`, label: `${hour}:00` };
});

export default function SchedulePage() {
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "18:00",
  });

  useEffect(() => {
    fetchAvailability();
  }, []);

  const getToken = () => localStorage.getItem("accessToken");

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/api/consultant/availability", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAvailability(data.slots || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      const token = getToken();
      await fetch("http://localhost:3000/api/consultant/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slots: availability }),
      });
      setEditMode(false);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const addSlot = () => {
    const newId = `temp-${Date.now()}`;
    setAvailability([
      ...availability,
      {
        id: newId,
        ...newSlot,
        isAvailable: true,
      },
    ]);
  };

  const removeSlot = (id: string) => {
    setAvailability(availability.filter((slot) => slot.id !== id));
  };

  const toggleSlotAvailability = (id: string) => {
    setAvailability(
      availability.map((slot) =>
        slot.id === id ? { ...slot, isAvailable: !slot.isAvailable } : slot
      )
    );
  };

  // Group slots by day
  const slotsByDay = DAYS.map((day, idx) => ({
    day,
    dayOfWeek: idx,
    slots: availability.filter((slot) => slot.dayOfWeek === idx),
  }));

  return (
    <DashboardLayout requiredRole="CONSULTANT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">일정 관리</h1>
            <p className="text-slate-500 mt-1">
              상담 가능 시간을 설정하세요
            </p>
          </div>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  취소
                </Button>
                <Button onClick={saveAvailability} isLoading={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditMode(true)}>
                일정 수정
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Add New Slot */}
            {editMode && (
              <Card className="border-dashed border-2 border-emerald-300 bg-emerald-50">
                <CardContent>
                  <h3 className="font-medium text-slate-900 mb-4">새 시간대 추가</h3>
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        요일
                      </label>
                      <Select
                        options={DAYS.map((day, idx) => ({ value: String(idx), label: day }))}
                        value={String(newSlot.dayOfWeek)}
                        onChange={(e) =>
                          setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        시작 시간
                      </label>
                      <Select
                        options={TIMES}
                        value={newSlot.startTime}
                        onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        종료 시간
                      </label>
                      <Select
                        options={TIMES}
                        value={newSlot.endTime}
                        onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      />
                    </div>
                    <Button onClick={addSlot} leftIcon={<Plus className="w-4 h-4" />}>
                      추가
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weekly Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              {slotsByDay.map(({ day, dayOfWeek, slots }) => (
                <Card
                  key={dayOfWeek}
                  className={`${
                    dayOfWeek === 0 || dayOfWeek === 6
                      ? "bg-slate-50"
                      : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <span
                      className={`font-medium ${
                        dayOfWeek === 0
                          ? "text-red-500"
                          : dayOfWeek === 6
                          ? "text-sky-500"
                          : "text-slate-900"
                      }`}
                    >
                      {day}
                    </span>
                  </CardHeader>
                  <CardContent>
                    {slots.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">
                        설정된 시간 없음
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {slots.map((slot) => (
                          <div
                            key={slot.id}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              slot.isAvailable
                                ? "bg-emerald-100"
                                : "bg-slate-100"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Clock
                                className={`w-4 h-4 ${
                                  slot.isAvailable
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                                }`}
                              />
                              <span
                                className={`text-sm font-medium ${
                                  slot.isAvailable
                                    ? "text-emerald-700"
                                    : "text-slate-500"
                                }`}
                              >
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            {editMode && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => toggleSlotAvailability(slot.id)}
                                  className={`p-1 rounded ${
                                    slot.isAvailable
                                      ? "text-emerald-600 hover:bg-emerald-200"
                                      : "text-slate-400 hover:bg-slate-200"
                                  }`}
                                >
                                  {slot.isAvailable ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => removeSlot(slot.id)}
                                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Legend */}
            <Card>
              <CardContent>
                <h4 className="text-sm font-medium text-slate-900 mb-3">범례</h4>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-100" />
                    <span className="text-sm text-slate-600">상담 가능</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-100" />
                    <span className="text-sm text-slate-600">상담 불가</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-sky-50 border-sky-200">
              <CardContent>
                <h4 className="font-medium text-sky-900 mb-2">💡 팁</h4>
                <ul className="text-sm text-sky-700 space-y-1">
                  <li>• 보호자와 학생이 예약할 수 있는 시간대를 설정하세요</li>
                  <li>• 시간대별로 가능/불가능 상태를 토글할 수 있습니다</li>
                  <li>• 변경 사항은 "저장" 버튼을 눌러야 적용됩니다</li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}


