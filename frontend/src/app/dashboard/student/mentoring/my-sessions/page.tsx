'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Calendar, Clock, User, MessageCircle,
  CheckCircle, XCircle, AlertCircle, Star, Send
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { getToken, formatDateTime } from '@/lib/utils';

interface Session {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  topic: string;
  questions: string | null;
  notes: string | null;
  summary: string | null;
  meetingUrl: string | null;
  mentor: {
    id: string;
    displayName: string;
    category: string;
    school: { name: string } | null;
  };
  review: { id: string; rating: number } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  REQUESTED: { label: '신청중', color: 'text-yellow-600 bg-yellow-100', icon: AlertCircle },
  CONFIRMED: { label: '확정', color: 'text-blue-600 bg-blue-100', icon: CheckCircle },
  COMPLETED: { label: '완료', color: 'text-green-600 bg-green-100', icon: CheckCircle },
  CANCELLED: { label: '취소됨', color: 'text-red-600 bg-red-100', icon: XCircle },
  NO_SHOW: { label: '불참', color: 'text-gray-600 bg-gray-100', icon: XCircle },
};

export default function MySessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/mentoring/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSessions(data.data || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    const reason = prompt('취소 사유를 입력해주세요:');
    if (!reason) return;

    const token = getToken();
    try {
      const res = await fetch(`/api/mentoring/sessions/${sessionId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        fetchSessions();
      } else {
        alert('취소에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to cancel:', error);
    }
  };

  const handleSubmitReview = async (sessionId: string) => {
    const token = getToken();
    try {
      setSubmittingReview(true);
      const res = await fetch('/api/mentoring/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          rating: reviewRating,
          content: reviewContent,
        }),
      });

      if (res.ok) {
        setShowReviewForm(null);
        setReviewRating(5);
        setReviewContent('');
        fetchSessions();
      } else {
        alert('리뷰 등록에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingState message="멘토링 내역을 불러오는 중..." />;
  }

  const upcomingSessions = sessions.filter(s => ['REQUESTED', 'CONFIRMED'].includes(s.status));
  const pastSessions = sessions.filter(s => ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(s.status));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/student/mentoring')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              내 멘토링
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              신청한 멘토링 세션을 관리합니다
            </p>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              신청한 멘토링이 없습니다
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              멘토를 찾아 첫 멘토링을 신청해보세요!
            </p>
            <Button onClick={() => router.push('/dashboard/student/mentoring')}>
              멘토 찾기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 예정된 멘토링 */}
          {upcomingSessions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                예정된 멘토링 ({upcomingSessions.length})
              </h2>
              <div className="space-y-4">
                {upcomingSessions.map((session) => {
                  const status = statusConfig[session.status];
                  const StatusIcon = status.icon;
                  return (
                    <Card key={session.id}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 
                              flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                              {session.mentor.displayName.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {session.mentor.displayName}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {session.mentor.school?.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                주제: {session.topic}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${status.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {status.label}
                          </span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 
                          flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDateTime(session.scheduledAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {session.duration}분
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {session.meetingUrl && session.status === 'CONFIRMED' && (
                              <Button
                                size="sm"
                                onClick={() => window.open(session.meetingUrl!, '_blank')}
                              >
                                입장하기
                              </Button>
                            )}
                            {['REQUESTED', 'CONFIRMED'].includes(session.status) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelSession(session.id)}
                              >
                                취소
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* 완료된 멘토링 */}
          {pastSessions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                지난 멘토링 ({pastSessions.length})
              </h2>
              <div className="space-y-4">
                {pastSessions.map((session) => {
                  const status = statusConfig[session.status];
                  const StatusIcon = status.icon;
                  return (
                    <Card key={session.id}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 
                              flex items-center justify-center text-gray-500 font-bold">
                              {session.mentor.displayName.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {session.mentor.displayName}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {session.topic}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDateTime(session.scheduledAt)}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${status.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {status.label}
                          </span>
                        </div>

                        {/* 리뷰 섹션 */}
                        {session.status === 'COMPLETED' && !session.review && (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            {showReviewForm === session.id ? (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">평점:</span>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => setReviewRating(star)}
                                      className="focus:outline-none"
                                    >
                                      <Star 
                                        className={`w-6 h-6 ${star <= reviewRating 
                                          ? 'text-amber-500 fill-current' 
                                          : 'text-gray-300'}`} 
                                      />
                                    </button>
                                  ))}
                                </div>
                                <textarea
                                  value={reviewContent}
                                  onChange={(e) => setReviewContent(e.target.value)}
                                  placeholder="멘토링은 어떠셨나요? 솔직한 후기를 남겨주세요."
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 
                                    rounded-lg bg-white dark:bg-slate-800 resize-none"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowReviewForm(null)}
                                  >
                                    취소
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSubmitReview(session.id)}
                                    isLoading={submittingReview}
                                  >
                                    <Send className="w-4 h-4 mr-1" />
                                    리뷰 등록
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowReviewForm(session.id)}
                              >
                                <Star className="w-4 h-4 mr-1" />
                                리뷰 작성하기
                              </Button>
                            )}
                          </div>
                        )}

                        {session.review && (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 
                            flex items-center gap-2 text-sm text-gray-500">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>리뷰 작성 완료</span>
                            <div className="flex items-center gap-1 text-amber-500">
                              {[...Array(session.review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-current" />
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

