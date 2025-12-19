'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { getApiUrl, handleApiError } from '@/lib/api';
import { TrendingUp, TrendingDown, Minus, BookOpen, Target, Lightbulb } from 'lucide-react';

interface GradeTrend {
  subject: string;
  data: { period: string; score: number; rank?: number }[];
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface SubjectAnalysis {
  subject: string;
  average: number;
  highest: number;
  lowest: number;
  trend: 'up' | 'down' | 'stable';
  suggestion: string;
}

interface GradeAdvice {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export default function GradeTrendsPage() {
  const [trends, setTrends] = useState<GradeTrend[]>([]);
  const [analysis, setAnalysis] = useState<SubjectAnalysis[]>([]);
  const [overallTrend, setOverallTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [overallChange, setOverallChange] = useState(0);
  const [advice, setAdvice] = useState<GradeAdvice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [trendsRes, adviceRes] = await Promise.all([
        fetch(`${getApiUrl()}/v1/analysis/grades/trends`, { headers }),
        fetch(`${getApiUrl()}/v1/analysis/grades/advice`, { headers }),
      ]);

      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setTrends(data.trends || []);
        setAnalysis(data.subjectAnalysis || []);
        setOverallTrend(data.overallTrend);
        setOverallChange(data.overallChange);
      }

      if (adviceRes.ok) {
        setAdvice(await adviceRes.json());
      }
    } catch (error) {
      handleApiError(error, '성적 데이터 조회');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'down': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case 'up': return <Badge variant="success">상승</Badge>;
      case 'down': return <Badge variant="danger">하락</Badge>;
      default: return <Badge variant="default">유지</Badge>;
    }
  };

  if (loading) {
    return <LoadingState message="성적 트렌드를 불러오는 중..." />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">성적 추이 분석</h1>
        {getTrendBadge(overallTrend)}
      </div>

      {/* 전체 현황 카드 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 성적 추이</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {overallChange > 0 ? '+' : ''}{overallChange}점
              </p>
              <p className="text-sm text-gray-500 mt-1">최근 기간 대비 변화</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
              {getTrendIcon(overallTrend)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 과목별 추이 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analysis.map((subject) => (
          <Card key={subject.subject} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{subject.subject}</h3>
                {getTrendIcon(subject.trend)}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">평균</span>
                  <span className="font-medium">{subject.average}점</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">최고</span>
                  <span className="font-medium text-green-600">{subject.highest}점</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">최저</span>
                  <span className="font-medium text-red-600">{subject.lowest}점</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-600">{subject.suggestion}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI 분석 조언 */}
      {advice && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500" padding="sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">강점</span>
            </div>
            <ul className="space-y-1">
              {advice.strengths.map((item, i) => (
                <li key={i} className="text-sm text-gray-600">• {item}</li>
              ))}
            </ul>
          </Card>

          <Card className="border-l-4 border-l-orange-500" padding="sm">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">보완 필요</span>
            </div>
            <ul className="space-y-1">
              {advice.weaknesses.map((item, i) => (
                <li key={i} className="text-sm text-gray-600">• {item}</li>
              ))}
            </ul>
          </Card>

          <Card className="border-l-4 border-l-blue-500" padding="sm">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">추천</span>
            </div>
            <ul className="space-y-1">
              {advice.recommendations.map((item, i) => (
                <li key={i} className="text-sm text-gray-600">• {item}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {trends.length === 0 && (
        <Card className="p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">성적 데이터가 없습니다.</p>
          <p className="text-sm text-gray-400 mt-1">성적을 입력하면 추이를 분석해드립니다.</p>
        </Card>
      )}
    </div>
  );
}

