"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Input, Select } from "@/components/ui";
import { Modal } from "@/components/ui";

interface Report {
  id: string;
  title: string;
  type: "DIAGNOSIS" | "CONSULTATION" | "COMPREHENSIVE";
  childName: string;
  consultantName?: string;
  createdAt: string;
  summary?: string;
  content?: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const getToken = () => localStorage.getItem("accessToken");

  const downloadPDF = async (childId: string, childName: string) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3000/api/reports/student/${childId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${childName}_리포트.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('PDF 다운로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('PDF download error:', error);
      alert('PDF 다운로드 중 오류가 발생했습니다.');
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/api/reports/received", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "DIAGNOSIS":
        return { label: "진단 리포트", color: "sky" as const };
      case "CONSULTATION":
        return { label: "상담 리포트", color: "emerald" as const };
      case "COMPREHENSIVE":
        return { label: "종합 리포트", color: "purple" as const };
      default:
        return { label: type, color: "default" as const };
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesType = filterType === "all" || report.type === filterType;
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.childName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <DashboardLayout requiredRole="PARENT">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">리포트</h1>
          <p className="text-slate-500 mt-1">
            자녀의 진단 및 상담 리포트를 확인하세요
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="리포트 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Select
                options={[
                  { value: "all", label: "전체 유형" },
                  { value: "DIAGNOSIS", label: "진단 리포트" },
                  { value: "CONSULTATION", label: "상담 리포트" },
                  { value: "COMPREHENSIVE", label: "종합 리포트" },
                ]}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
          </div>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                리포트가 없습니다
              </h3>
              <p className="text-slate-500">
                {searchQuery || filterType !== "all"
                  ? "검색 조건에 맞는 리포트가 없습니다"
                  : "아직 받은 리포트가 없습니다"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => {
              const typeInfo = getTypeLabel(report.type);
              return (
                <Card
                  key={report.id}
                  hover
                  className="cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <CardContent>
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant={typeInfo.color === "default" ? "default" : typeInfo.color === "sky" ? "info" : typeInfo.color === "emerald" ? "success" : "default"}>
                        {typeInfo.label}
                      </Badge>
                      <span className="text-xs text-slate-400">{report.createdAt}</span>
                    </div>
                    
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                      {report.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <User className="w-4 h-4" />
                      <span>{report.childName}</span>
                    </div>

                    {report.summary && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                        {report.summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">
                        {report.consultantName && `작성: ${report.consultantName}`}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Report Detail Modal */}
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={selectedReport?.title || "리포트"}
          size="lg"
        >
          {selectedReport && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <Badge variant={
                      selectedReport.type === "DIAGNOSIS" ? "info" : 
                      selectedReport.type === "CONSULTATION" ? "success" : "default"
                    }>
                      {getTypeLabel(selectedReport.type).label}
                    </Badge>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedReport.childName} · {selectedReport.createdAt}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                  PDF 다운로드
                </Button>
              </div>

              {selectedReport.summary && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">요약</h4>
                  <p className="text-slate-600">{selectedReport.summary}</p>
                </div>
              )}

              {selectedReport.content && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">상세 내용</h4>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 whitespace-pre-wrap">
                      {selectedReport.content}
                    </p>
                  </div>
                </div>
              )}

              {selectedReport.consultantName && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    작성자: {selectedReport.consultantName}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}


