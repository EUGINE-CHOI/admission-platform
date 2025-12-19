'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { getApiUrl, handleApiError } from '@/lib/api';
import { 
  MessageSquare, Lightbulb, CheckCircle, 
  ChevronDown, ChevronUp, Send, School, AlertCircle 
} from 'lucide-react';

interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  tips: string[];
  sampleAnswer?: string;
}

interface InterviewPrep {
  schoolName: string;
  schoolType: string;
  interviewType: string;
  commonQuestions: InterviewQuestion[];
  personalQuestions: InterviewQuestion[];
  tips: string[];
}

interface MockResult {
  score: number;
  feedback: string;
  improvements: string[];
  modelAnswer: string;
}

export default function InterviewPrepPage() {
  const [targetSchools, setTargetSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [prepData, setPrepData] = useState<InterviewPrep | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [mockResult, setMockResult] = useState<MockResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTargetSchools();
  }, []);

  const fetchTargetSchools = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiUrl()}/api/v1/students/me/targets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTargetSchools(data.targets || []);
        if (data.targets?.length > 0) {
          setSelectedSchool(data.targets[0].schoolId);
        }
      }
    } catch (error) {
      handleApiError(error, '목표 학교 조회');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSchool) {
      fetchInterviewPrep(selectedSchool);
    }
  }, [selectedSchool]);

  const fetchInterviewPrep = async (schoolId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiUrl()}/v1/interview/prep/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPrepData(await res.json());
      }
    } catch (error) {
      handleApiError(error, '면접 준비 조회');
    }
  };

  const submitMockAnswer = async (questionId: string) => {
    if (!answer.trim() || !selectedSchool) return;
    
    setSubmitting(true);
    setMockResult(null);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiUrl()}/v1/interview/mock/${selectedSchool}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questionId, answer }),
      });
      
      if (res.ok) {
        setMockResult(await res.json());
      }
    } catch (error) {
      handleApiError(error, '답변 제출');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="면접 질문을 불러오는 중..." />;
  }

  if (targetSchools.length === 0) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <School className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">목표 학교를 먼저 설정해주세요</p>
          <p className="text-sm text-gray-400 mt-1">
            목표 학교를 설정하면 맞춤 면접 준비 자료를 제공합니다.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">면접 준비</h1>
      </div>

      {/* 학교 선택 */}
      <Card>
        <CardContent className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">목표 학교 선택</label>
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {targetSchools.map((target) => (
              <option key={target.schoolId} value={target.schoolId}>
                {target.school?.name || target.schoolId}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {prepData && (
        <>
          {/* 학교 정보 */}
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{prepData.schoolName}</h2>
                  <p className="text-sm text-gray-600">
                    {prepData.schoolType} • {prepData.interviewType}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 면접 팁 */}
          <Card padding="none">
            <div className="p-4 border-b flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">면접 TIP</span>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                {prepData.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* 공통 질문 */}
          <Card padding="none">
            <div className="p-4 border-b">
              <span className="font-semibold">공통 예상 질문</span>
            </div>
            <div className="p-4 space-y-3">
              {prepData.commonQuestions.map((q) => (
                <div key={q.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{q.category}</Badge>
                      <span className="font-medium">{q.question}</span>
                    </div>
                    {expandedQ === q.id ? <ChevronUp /> : <ChevronDown />}
                  </button>
                  
                  {expandedQ === q.id && (
                    <div className="px-4 pb-4 space-y-4 bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">답변 TIP</p>
                        <ul className="space-y-1">
                          {q.tips.map((tip, i) => (
                            <li key={i} className="text-sm text-gray-600">• {tip}</li>
                          ))}
                        </ul>
                      </div>

                      {/* 모의 면접 */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">내 답변 연습</p>
                        <textarea
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="여기에 답변을 작성해보세요..."
                          className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => submitMockAnswer(q.id)}
                          disabled={submitting || !answer.trim()}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                          {submitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          AI 평가 받기
                        </button>
                      </div>

                      {/* 평가 결과 */}
                      {mockResult && (
                        <div className="p-4 bg-white rounded-lg border">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl font-bold text-blue-600">{mockResult.score}점</div>
                            <Badge variant={mockResult.score >= 80 ? 'success' : mockResult.score >= 60 ? 'warning' : 'danger'}>
                              {mockResult.score >= 80 ? '우수' : mockResult.score >= 60 ? '보통' : '개선 필요'}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-3">{mockResult.feedback}</p>
                          
                          {mockResult.improvements.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-orange-600 mb-1">개선점</p>
                              <ul className="space-y-1">
                                {mockResult.improvements.map((imp, i) => (
                                  <li key={i} className="text-sm text-gray-600">• {imp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {mockResult.modelAnswer && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-700 mb-1">모범 답변 예시</p>
                              <p className="text-sm text-blue-900">{mockResult.modelAnswer}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* 개인 맞춤 질문 */}
          {prepData.personalQuestions.length > 0 && (
            <Card padding="none">
              <div className="p-4 border-b flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">나만의 예상 질문</span>
                <Badge variant="warning">맞춤</Badge>
              </div>
              <div className="p-4 space-y-3">
                {prepData.personalQuestions.map((q) => (
                  <div key={q.id} className="p-4 bg-orange-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">{q.question}</p>
                    <Badge variant="outline" className="mb-2">{q.category}</Badge>
                    <ul className="space-y-1">
                      {q.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-gray-600">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

