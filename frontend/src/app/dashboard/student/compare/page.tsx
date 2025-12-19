'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { getApiUrl } from '@/lib/api';
import { Building2, BarChart3, CheckCircle, Info, Search } from 'lucide-react';

interface SchoolCompareItem {
  id: string;
  name: string;
  type: string;
  region: string;
  competitionRate?: number;
  cutoffGrade?: number;
  admissionType?: string;
  specialFeatures: string[];
}

interface CompareResult {
  schools: SchoolCompareItem[];
  comparison: {
    category: string;
    values: (string | number | null)[];
    winner?: number;
  }[];
  recommendation?: string;
}

export default function SchoolComparePage() {
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTargetComparison();
  }, []);

  const fetchTargetComparison = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiUrl()}/v1/schools/compare/targets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setResult(await res.json());
      } else {
        const data = await res.json();
        setError(data.message || '비교할 목표 학교가 필요합니다');
      }
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="학교 비교 정보를 불러오는 중..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">{error}</p>
          <p className="text-sm text-gray-400 mt-2">
            목표 학교를 2개 이상 설정하면 비교 분석을 해드립니다.
          </p>
        </Card>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">학교 비교</h1>
        <Badge variant="info">{result.schools.length}개 학교 비교 중</Badge>
      </div>

      {/* 학교 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {result.schools.map((school, idx) => (
          <Card key={school.id} className={`relative ${idx === 0 ? 'ring-2 ring-blue-500' : ''}`}>
            {idx === 0 && (
              <div className="absolute -top-2 -right-2">
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">1지망</span>
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{school.name}</h3>
                  <p className="text-sm text-gray-500">{school.type} • {school.region}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {school.competitionRate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">경쟁률</span>
                    <span className="font-medium">{school.competitionRate}:1</span>
                  </div>
                )}
                {school.cutoffGrade && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">커트라인</span>
                    <span className="font-medium">{school.cutoffGrade}등급</span>
                  </div>
                )}
              </div>

              {school.specialFeatures.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {school.specialFeatures.map((feature, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{feature}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 비교 테이블 */}
      <Card padding="none">
        <div className="p-4 border-b flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          <span className="font-semibold">상세 비교</span>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">항목</th>
                  {result.schools.map((school) => (
                    <th key={school.id} className="text-center py-3 px-4 font-medium text-gray-600">
                      {school.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.comparison.map((row, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-3 px-4 font-medium text-gray-900">{row.category}</td>
                    {row.values.map((value, vIdx) => (
                      <td 
                        key={vIdx} 
                        className={`py-3 px-4 text-center ${row.winner === vIdx ? 'bg-green-50' : ''}`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {value ?? '-'}
                          {row.winner === vIdx && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* 추천 메시지 */}
      {result.recommendation && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">{result.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

