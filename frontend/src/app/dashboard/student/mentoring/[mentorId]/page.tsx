'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Star, Clock, MessageCircle, Calendar,
  GraduationCap, Award, User, Send, CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { getToken, formatDate } from '@/lib/utils';

interface MentorDetail {
  id: string;
  displayName: string;
  category: string;
  bio: string | null;
  admissionYear: number;
  currentGrade: number | null;
  subjects: string[];
  specialties: string[];
  hourlyRate: number;
  sessionDuration: number;
  availableDays: string[];
  rating: number;
  reviewCount: number;
  totalSessions: number;
  school: {
    id: string;
    name: string;
    type: string;
    region: string;
  } | null;
  reviews: Array<{
    id: string;
    rating: number;
    content: string | null;
    createdAt: string;
    mentee: { name: string } | null;
  }>;
}

const categoryLabels: Record<string, string> = {
  SCIENCE_HIGH: '과학고',
  FOREIGN_LANG_HIGH: '외국어고',
  INTERNATIONAL_HIGH: '국제고',
  ART_HIGH: '예술고',
  AUTONOMOUS_PRIVATE: '자사고',
  GENERAL_HIGH: '일반고',
};

const dayLabels: Record<string, string> = {
  MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토', SUN: '일'
};

export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mentorId = params.mentorId as string;

  const [mentor, setMentor] = useState<MentorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // 신청 폼 상태
  const [scheduledAt, setScheduledAt] = useState('');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState('');

  useEffect(() => {
    fetchMentorDetail();
  }, [mentorId]);

  const fetchMentorDetail = async () => {
    try {
      const res = await fetch(`/api/mentoring/mentors/${mentorId}`);
      const data = await res.json();
      setMentor(data.data);
    } catch (error) {
      console.error('Failed to fetch mentor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      alert('로그인이 필요합니다');
      return;
    }

    try {
      setRequesting(true);
      const res = await fetch('/api/mentoring/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mentorId,
          scheduledAt,
          topic,
          questions,
        }),
      });

      if (res.ok) {
        setRequestSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/student/mentoring/my-sessions');
        }, 2000);
      } else {
        const error = await res.json();
        alert(error.message || '신청에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to request session:', error);
      alert('신청 중 오류가 발생했습니다');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <LoadingState message="멘토 정보를 불러오는 중..." />;
  }

  if (!mentor) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">멘토를 찾을 수 없습니다</p>
          <Button className="mt-4" onClick={() => router.back()}>
            돌아가기
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>멘토 목록으로</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 멘토 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 프로필 카드 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 
                  flex items-center justify-center text-white font-bold text-3xl">
                  {mentor.displayName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mentor.displayName}
                    </h1>
                    <span className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 
                      text-purple-700 dark:text-purple-300 rounded-full">
                      {categoryLabels[mentor.category]}
                    </span>
                  </div>

                  {mentor.school && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                      <GraduationCap className="w-5 h-5" />
                      <span className="font-medium">{mentor.school.name}</span>
                      <span>({mentor.school.region})</span>
                      <span className="text-gray-400">•</span>
                      <span>{mentor.admissionYear}학번</span>
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-semibold text-lg">{mentor.rating.toFixed(1)}</span>
                      <span className="text-gray-400">({mentor.reviewCount}개 리뷰)</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <MessageCircle className="w-5 h-5" />
                      <span>{mentor.totalSessions}회 멘토링</span>
                    </div>
                  </div>
                </div>
              </div>

              {mentor.bio && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">자기소개</h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {mentor.bio}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 전문 분야 & 강점 과목 */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mentor.specialties.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-500" />
                      전문 분야
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {mentor.specialties.map((specialty, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 
                            text-purple-700 dark:text-purple-300 rounded-lg text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {mentor.subjects.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-500" />
                      강점 과목
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {mentor.subjects.map((subject, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 
                            text-blue-700 dark:text-blue-300 rounded-lg text-sm"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 리뷰 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-500" />
                멘티 리뷰 ({mentor.reviewCount}개)
              </h3>

              {mentor.reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">아직 리뷰가 없습니다</p>
              ) : (
                <div className="space-y-4">
                  {mentor.reviews.map((review) => (
                    <div 
                      key={review.id}
                      className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {review.mentee?.name || '익명'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      {review.content && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {review.content}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 우측: 신청 폼 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              {requestSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    신청 완료!
                  </h3>
                  <p className="text-gray-500">
                    멘토가 확정하면 알림을 보내드립니다
                  </p>
                </div>
              ) : showRequestForm ? (
                <form onSubmit={handleRequest} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    멘토링 신청
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      희망 일시
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                        bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      가능 요일: {mentor.availableDays.map(d => dayLabels[d]).join(', ')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      멘토링 주제
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="예: 과학고 면접 준비"
                      required
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                        bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      사전 질문 (선택)
                    </label>
                    <textarea
                      value={questions}
                      onChange={(e) => setQuestions(e.target.value)}
                      placeholder="멘토에게 미리 전달하고 싶은 질문이 있다면 작성해주세요"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                        bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowRequestForm(false)}
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      isLoading={requesting}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      신청하기
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                      {mentor.hourlyRate === 0 ? '무료' : `₩${mentor.hourlyRate.toLocaleString()}`}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      {mentor.sessionDuration}분 세션
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <span>가능 요일: {mentor.availableDays.map(d => dayLabels[d]).join(', ') || '미정'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>1:1 화상 멘토링</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>사전 질문 가능</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setShowRequestForm(true)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    멘토링 신청하기
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

