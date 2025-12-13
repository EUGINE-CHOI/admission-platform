"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  ChevronRight,
  Target,
  TrendingUp,
  BookOpen,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Input } from "@/components/ui";
import { Modal } from "@/components/ui";

interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  school?: string;
  parent: {
    name: string;
    email: string;
  };
  targetSchoolCount: number;
  activityCount: number;
  planProgress: number;
  lastConsultation?: string;
  consultationCount: number;
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const getToken = () => localStorage.getItem("accessToken");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = getToken();
      // 상담을 받은 학생 목록을 가져옵니다
      const res = await fetch("http://localhost:3000/api/consultations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const consultations = await res.json();
        // 중복 제거하여 학생 목록 생성
        const studentMap = new Map();
        if (Array.isArray(consultations)) {
          consultations.forEach((c: any) => {
            if (c.student && !studentMap.has(c.student.id)) {
              studentMap.set(c.student.id, {
                ...c.student,
                parent: c.parent || { name: "정보 없음" },
                targetSchoolCount: 0,
                activityCount: 0,
                planProgress: 0,
                lastConsultation: c.scheduledAt,
                consultationCount: 1,
              });
            } else if (c.student) {
              const existing = studentMap.get(c.student.id);
              existing.consultationCount++;
            }
          });
        }
        setStudents(Array.from(studentMap.values()));
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout requiredRole="CONSULTANT">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">학생 목록</h1>
          <p className="text-slate-500 mt-1">
            상담한 학생들의 정보를 확인하세요
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent>
            <Input
              placeholder="학생 이름 또는 이메일로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-emerald-100 text-sm">총 학생</p>
                  <p className="text-3xl font-bold">{students.length}명</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm">총 상담 횟수</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {students.reduce((sum, s) => sum + s.consultationCount, 0)}회
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm">평균 상담</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {students.length > 0
                      ? (students.reduce((sum, s) => sum + s.consultationCount, 0) / students.length).toFixed(1)
                      : 0}회
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                학생이 없습니다
              </h3>
              <p className="text-slate-500">
                {searchQuery
                  ? "검색 조건에 맞는 학생이 없습니다"
                  : "아직 상담한 학생이 없습니다"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <Card
                key={student.id}
                hover
                className="cursor-pointer"
                onClick={() => setSelectedStudent(student)}
              >
                <CardContent>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                      {student.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900">{student.name}</h3>
                      <p className="text-sm text-slate-500">{student.grade}</p>
                      <p className="text-xs text-slate-400 truncate">{student.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2 bg-slate-50 rounded-lg text-center">
                      <p className="text-lg font-bold text-slate-900">
                        {student.consultationCount}
                      </p>
                      <p className="text-xs text-slate-500">상담 횟수</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg text-center">
                      <p className="text-lg font-bold text-slate-900">
                        {student.targetSchoolCount}
                      </p>
                      <p className="text-xs text-slate-500">목표 학교</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">
                      {student.lastConsultation && `최근: ${student.lastConsultation}`}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Student Detail Modal */}
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title="학생 정보"
          size="lg"
        >
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-slate-500">{selectedStudent.grade}</p>
                  <p className="text-sm text-slate-400">{selectedStudent.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">학부모</p>
                  <p className="font-medium text-slate-900">{selectedStudent.parent.name}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">상담 횟수</p>
                  <p className="font-medium text-slate-900">{selectedStudent.consultationCount}회</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl text-center">
                  <Target className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedStudent.targetSchoolCount}
                  </p>
                  <p className="text-xs text-slate-500">목표 학교</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-xl text-center">
                  <BookOpen className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedStudent.activityCount}
                  </p>
                  <p className="text-xs text-slate-500">활동 기록</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-xl text-center">
                  <TrendingUp className="w-6 h-6 text-sky-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedStudent.planProgress}%
                  </p>
                  <p className="text-xs text-slate-500">플랜 진행률</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  상담 기록 보기
                </Button>
                <Button className="flex-1">
                  새 상담 예약
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}


