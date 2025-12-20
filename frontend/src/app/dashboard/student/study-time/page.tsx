'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Calendar,
  TrendingUp,
  BookOpen,
  Target
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface StudySession {
  id: string;
  subject: string;
  duration: number; // minutes
  date: string;
  note?: string;
}

interface SubjectStats {
  subject: string;
  totalMinutes: number;
  sessions: number;
  avgDuration: number;
}

const SUBJECTS = [
  '국어', '영어', '수학', '사회', '과학', '한국사', '기타'
];

export default function StudyTimePage() {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // 타이머 로직
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // 로컬 스토리지에서 세션 로드
  useEffect(() => {
    const saved = localStorage.getItem('study_sessions');
    if (saved) {
      setSessions(JSON.parse(saved));
    }
  }, []);

  // 세션 저장
  const saveSessions = (newSessions: StudySession[]) => {
    setSessions(newSessions);
    localStorage.setItem('study_sessions', JSON.stringify(newSessions));
  };

  // 타이머 시작/중지
  const toggleTimer = () => {
    if (!selectedSubject && !isTimerRunning) {
      alert('과목을 선택해주세요');
      return;
    }
    setIsTimerRunning(!isTimerRunning);
  };

  // 타이머 리셋 및 세션 저장
  const saveAndReset = () => {
    if (timerSeconds < 60) {
      alert('1분 이상 학습해야 기록됩니다');
      return;
    }

    const newSession: StudySession = {
      id: Date.now().toString(),
      subject: selectedSubject,
      duration: Math.floor(timerSeconds / 60),
      date: new Date().toISOString(),
    };

    saveSessions([newSession, ...sessions]);
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setSelectedSubject('');
  };

  // 타이머 리셋
  const resetTimer = () => {
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 오늘 학습 시간
  const todayMinutes = sessions
    .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.duration, 0);

  // 이번 주 학습 시간
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekMinutes = sessions
    .filter(s => new Date(s.date) >= weekStart)
    .reduce((sum, s) => sum + s.duration, 0);

  // 과목별 통계
  const subjectStats: SubjectStats[] = SUBJECTS.map(subject => {
    const subjectSessions = sessions.filter(s => s.subject === subject);
    const totalMinutes = subjectSessions.reduce((sum, s) => sum + s.duration, 0);
    return {
      subject,
      totalMinutes,
      sessions: subjectSessions.length,
      avgDuration: subjectSessions.length > 0 ? Math.round(totalMinutes / subjectSessions.length) : 0,
    };
  }).filter(s => s.totalMinutes > 0).sort((a, b) => b.totalMinutes - a.totalMinutes);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">학습 시간 트래커</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          공부 시간을 기록하고 분석하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">오늘</p>
                <p className="text-xl font-bold">
                  {Math.floor(todayMinutes / 60)}시간 {todayMinutes % 60}분
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">이번 주</p>
                <p className="text-xl font-bold">
                  {Math.floor(weekMinutes / 60)}시간 {weekMinutes % 60}분
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">총 세션</p>
                <p className="text-xl font-bold">{sessions.length}회</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 타이머 */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            스톱워치
          </h2>
        </CardHeader>
        <CardContent>
          {/* 과목 선택 */}
          <div className="mb-6">
            <label className="text-sm text-gray-500 mb-2 block">과목 선택</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(subject => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  disabled={isTimerRunning}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSubject === subject
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {/* 타이머 디스플레이 */}
          <div className="text-center py-8">
            <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white">
              {formatTime(timerSeconds)}
            </div>
            {selectedSubject && (
              <p className="text-gray-500 mt-2">현재 과목: {selectedSubject}</p>
            )}
          </div>

          {/* 타이머 컨트롤 */}
          <div className="flex justify-center gap-4">
            <button
              onClick={toggleTimer}
              className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${
                isTimerRunning
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  일시정지
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  시작
                </>
              )}
            </button>
            
            {timerSeconds > 0 && (
              <>
                <button
                  onClick={saveAndReset}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium"
                >
                  저장 완료
                </button>
                <button
                  onClick={resetTimer}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl font-medium flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  리셋
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 과목별 통계 */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              과목별 학습 시간
            </h2>
          </CardHeader>
          <CardContent>
            {subjectStats.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                아직 기록된 학습이 없습니다
              </p>
            ) : (
              <div className="space-y-4">
                {subjectStats.map(stat => (
                  <div key={stat.subject}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{stat.subject}</span>
                      <span className="text-gray-500">
                        {Math.floor(stat.totalMinutes / 60)}시간 {stat.totalMinutes % 60}분
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (stat.totalMinutes / (subjectStats[0]?.totalMinutes || 1)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 최근 기록 */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold flex items-center gap-2">
              <Target className="w-5 h-5" />
              최근 학습 기록
            </h2>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                아직 기록된 학습이 없습니다
              </p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {sessions.slice(0, 10).map(session => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="default">{session.subject}</Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(session.date).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <span className="font-medium">
                      {session.duration}분
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




