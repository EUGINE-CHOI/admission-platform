"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Trophy,
  Heart,
  Clock,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { getToken, getApiUrl } from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input, Textarea, Select } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Modal, ConfirmModal } from "@/components/ui";

type TabType = "grades" | "activities" | "readings" | "volunteers";

interface Grade {
  id: string;
  subject: string;
  written1: number;  // 1회고사 (중간고사)
  written2: number;  // 2회고사 (기말고사)
  performance: number;
  semester: number;
  year: number;
  rank?: number;
}

interface Activity {
  id: string;
  activityType: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  hours?: number;
}

interface Reading {
  id: string;
  title: string;
  author: string;
  summary?: string;
  readDate: string;
}

interface Volunteer {
  id: string;
  organization: string;
  hours: number;
  date: string;
  description?: string;
}

const tabs = [
  { id: "grades" as TabType, label: "성적", icon: Trophy },
  { id: "activities" as TabType, label: "활동", icon: GraduationCap },
  { id: "readings" as TabType, label: "독서", icon: BookOpen },
  { id: "volunteers" as TabType, label: "봉사활동", icon: Heart },
];

export default function StudentDataPage() {
  const [activeTab, setActiveTab] = useState<TabType>("grades");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const endpoint = `${getApiUrl()}/api/student/${activeTab}`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const dataArray = Array.isArray(data) ? data : [];
        switch (activeTab) {
          case "grades":
            setGrades(dataArray);
            break;
          case "activities":
            setActivities(dataArray);
            break;
          case "readings":
            setReadings(dataArray);
            break;
          case "volunteers":
            setVolunteers(dataArray);
            break;
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const token = getToken();
      const endpoint = editingItem
        ? `${getApiUrl()}/api/student/${activeTab}/${editingItem.id}`
        : `${getApiUrl()}/api/student/${activeTab}`;
      
      const res = await fetch(endpoint, {
        method: editingItem ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingItem(null);
        fetchData();
      } else {
        const errorData = await res.json();
        alert(`오류: ${errorData.message || "저장에 실패했습니다."}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    
    try {
      const token = getToken();
      const res = await fetch(
        `${getApiUrl()}/api/student/${activeTab}/${deleteConfirm.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case "grades":
        return grades;
      case "activities":
        return activities;
      case "readings":
        return readings;
      case "volunteers":
        return volunteers;
      default:
        return [];
    }
  };

  return (
    <DashboardLayout requiredRole="STUDENT">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">데이터 입력</h1>
            <p className="text-slate-500 mt-1">
              성적, 활동, 독서, 봉사활동 기록을 입력하세요
            </p>
          </div>
          <Button onClick={openAddModal} leftIcon={<Plus className="w-4 h-4" />}>
            새로 추가
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all
                ${
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <Card>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
              </div>
            ) : getCurrentData().length === 0 ? (
              <EmptyState tab={activeTab} onAdd={openAddModal} />
            ) : (
              <DataTable
                tab={activeTab}
                data={getCurrentData()}
                onEdit={openEditModal}
                onDelete={(id) => setDeleteConfirm({ isOpen: true, id })}
              />
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          title={`${editingItem ? "수정" : "추가"} - ${tabs.find((t) => t.id === activeTab)?.label}`}
          size="lg"
        >
          <DataForm
            tab={activeTab}
            initialData={editingItem}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingItem(null);
            }}
          />
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
          onConfirm={handleDelete}
          title="삭제 확인"
          message="정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
          confirmText="삭제"
          variant="danger"
        />
      </div>
    </DashboardLayout>
  );
}

function EmptyState({ tab, onAdd }: { tab: TabType; onAdd: () => void }) {
  const messages: Record<TabType, { title: string; desc: string }> = {
    grades: { title: "입력된 성적이 없습니다", desc: "교과 성적을 입력해주세요" },
    activities: { title: "입력된 활동이 없습니다", desc: "교내외 활동을 기록해주세요" },
    readings: { title: "입력된 독서가 없습니다", desc: "읽은 책을 기록해주세요" },
    volunteers: { title: "입력된 봉사활동이 없습니다", desc: "봉사활동을 기록해주세요" },
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-1">
        {messages[tab].title}
      </h3>
      <p className="text-sm text-slate-500 mb-6">{messages[tab].desc}</p>
      <Button onClick={onAdd} leftIcon={<Plus className="w-4 h-4" />}>
        첫 번째 {tabs.find((t) => t.id === tab)?.label} 추가
      </Button>
    </div>
  );
}

function DataTable({
  tab,
  data,
  onEdit,
  onDelete,
}: {
  tab: TabType;
  data: any[];
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}) {
  if (tab === "grades") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">과목</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">1회고사</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">2회고사</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">수행</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">학기</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">연도</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">작업</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm font-medium text-slate-900">{item.subject}</td>
                <td className="py-3 px-4">
                  <Badge variant={item.written1 >= 90 ? "success" : item.written1 >= 70 ? "warning" : "danger"}>
                    {item.written1}점
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={item.written2 >= 90 ? "success" : item.written2 >= 70 ? "warning" : "danger"}>
                    {item.written2}점
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={item.performance >= 90 ? "success" : item.performance >= 70 ? "warning" : "danger"}>
                    {item.performance}점
                  </Badge>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{item.semester}학기</td>
                <td className="py-3 px-4 text-sm text-slate-600">{item.year}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tab === "activities") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((item) => (
          <div
            key={item.id}
            className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <Badge>{item.activityType}</Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
            <h3 className="font-medium text-slate-900 mb-1">{item.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <span>{item.startDate}</span>
              {item.hours && <span>{item.hours}시간</span>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tab === "readings") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <div
            key={item.id}
            className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
            <h3 className="font-medium text-slate-900 mb-1">{item.title}</h3>
            <p className="text-sm text-slate-500">{item.author}</p>
            {item.summary && (
              <p className="text-sm text-slate-400 mt-2 line-clamp-2">{item.summary}</p>
            )}
            <p className="text-xs text-slate-400 mt-3">{item.readDate}</p>
          </div>
        ))}
      </div>
    );
  }

  if (tab === "volunteers") {
    return (
      <div className="space-y-3">
        {data.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{item.organization}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.hours}시간
                  </span>
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function DataForm({
  tab,
  initialData,
  onSubmit,
  onCancel,
}: {
  tab: TabType;
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  // 기본값 설정
  const getDefaultData = () => {
    if (initialData) return initialData;
    
    if (tab === "grades") {
      return {
        subject: "",
        written1: 0,
        written2: 0,
        performance: 0,
        semester: 1,
        year: new Date().getFullYear(),
      };
    }
    return {};
  };
  
  const [formData, setFormData] = useState<any>(getDefaultData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const subjectOptions = [
    { value: "", label: "과목 선택" },
    { value: "국어", label: "국어" },
    { value: "영어", label: "영어" },
    { value: "수학", label: "수학" },
    { value: "사회", label: "사회" },
    { value: "과학", label: "과학" },
    { value: "한국사", label: "한국사" },
    { value: "도덕", label: "도덕" },
    { value: "기술가정", label: "기술가정" },
    { value: "정보", label: "정보" },
    { value: "음악", label: "음악" },
    { value: "미술", label: "미술" },
    { value: "체육", label: "체육" },
    { value: "한문", label: "한문" },
    { value: "중국어", label: "중국어" },
    { value: "일본어", label: "일본어" },
    { value: "스페인어", label: "스페인어" },
    { value: "프랑스어", label: "프랑스어" },
    { value: "독일어", label: "독일어" },
  ];

  if (tab === "grades") {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="과목"
          options={subjectOptions}
          value={formData.subject || ""}
          onChange={(e) => updateField("subject", e.target.value)}
          required
        />
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="1회고사 (중간)"
            type="number"
            min={0}
            max={100}
            placeholder="0~100"
            value={formData.written1 ?? ""}
            onChange={(e) => updateField("written1", parseInt(e.target.value) || 0)}
            required
          />
          <Input
            label="2회고사 (기말)"
            type="number"
            min={0}
            max={100}
            placeholder="0~100"
            value={formData.written2 ?? ""}
            onChange={(e) => updateField("written2", parseInt(e.target.value) || 0)}
            required
          />
          <Input
            label="수행평가"
            type="number"
            min={0}
            max={100}
            placeholder="0~100"
            value={formData.performance ?? ""}
            onChange={(e) => updateField("performance", parseInt(e.target.value) || 0)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="학기"
            options={[
              { value: "", label: "학기 선택" },
              { value: "1", label: "1학기" },
              { value: "2", label: "2학기" },
            ]}
            value={formData.semester?.toString() || ""}
            onChange={(e) => updateField("semester", parseInt(e.target.value))}
            required
          />
          <Input
            label="연도"
            type="number"
            min={2020}
            max={2030}
            placeholder="2024"
            value={formData.year || new Date().getFullYear()}
            onChange={(e) => updateField("year", parseInt(e.target.value))}
            required
          />
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" className="flex-1" isLoading={isSubmitting}>
            {initialData ? "수정" : "추가"}
          </Button>
        </div>
      </form>
    );
  }

  if (tab === "activities") {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="활동 유형"
          options={[
            { value: "", label: "유형 선택" },
            { value: "CLUB", label: "동아리" },
            { value: "COMPETITION", label: "대회" },
            { value: "PROJECT", label: "프로젝트" },
            { value: "OTHER", label: "기타" },
          ]}
          value={formData.activityType || ""}
          onChange={(e) => updateField("activityType", e.target.value)}
          required
        />
        <Input
          label="활동명"
          placeholder="활동 이름을 입력하세요"
          value={formData.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          required
        />
        <Textarea
          label="설명"
          placeholder="활동에 대해 자세히 설명해주세요"
          rows={4}
          value={formData.description || ""}
          onChange={(e) => updateField("description", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="시작일"
            type="date"
            value={formData.startDate || ""}
            onChange={(e) => updateField("startDate", e.target.value)}
            required
          />
          <Input
            label="종료일"
            type="date"
            value={formData.endDate || ""}
            onChange={(e) => updateField("endDate", e.target.value)}
          />
        </div>
        <Input
          label="활동 시간 (선택)"
          type="number"
          min={0}
          placeholder="시간"
          value={formData.hours || ""}
          onChange={(e) => updateField("hours", parseInt(e.target.value))}
        />
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" className="flex-1" isLoading={isSubmitting}>
            {initialData ? "수정" : "추가"}
          </Button>
        </div>
      </form>
    );
  }

  if (tab === "readings") {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="책 제목"
          placeholder="책 제목을 입력하세요"
          value={formData.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          required
        />
        <Input
          label="저자"
          placeholder="저자명을 입력하세요"
          value={formData.author || ""}
          onChange={(e) => updateField("author", e.target.value)}
          required
        />
        <Textarea
          label="독서 감상 (선택)"
          placeholder="책을 읽고 느낀 점을 적어주세요"
          rows={4}
          value={formData.summary || ""}
          onChange={(e) => updateField("summary", e.target.value)}
        />
        <Input
          label="읽은 날짜"
          type="date"
          value={formData.readDate || ""}
          onChange={(e) => updateField("readDate", e.target.value)}
          required
        />
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" className="flex-1" isLoading={isSubmitting}>
            {initialData ? "수정" : "추가"}
          </Button>
        </div>
      </form>
    );
  }

  if (tab === "volunteers") {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="봉사 기관"
          placeholder="봉사활동을 수행한 기관명"
          value={formData.organization || ""}
          onChange={(e) => updateField("organization", e.target.value)}
          required
        />
        <Input
          label="봉사 시간"
          type="number"
          min={0}
          placeholder="시간"
          value={formData.hours || ""}
          onChange={(e) => updateField("hours", parseInt(e.target.value))}
          required
        />
        <Input
          label="봉사 날짜"
          type="date"
          value={formData.date || ""}
          onChange={(e) => updateField("date", e.target.value)}
          required
        />
        <Textarea
          label="활동 내용 (선택)"
          placeholder="어떤 봉사활동을 했는지 설명해주세요"
          rows={3}
          value={formData.description || ""}
          onChange={(e) => updateField("description", e.target.value)}
        />
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" className="flex-1" isLoading={isSubmitting}>
            {initialData ? "수정" : "추가"}
          </Button>
        </div>
      </form>
    );
  }

  return null;
}
