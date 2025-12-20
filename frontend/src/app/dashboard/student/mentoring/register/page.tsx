'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Award, GraduationCap, BookOpen, Clock,
  CheckCircle, Users, AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getToken } from '@/lib/utils';

const categories = [
  { value: 'SCIENCE_HIGH', label: '과학고', icon: '🔬' },
  { value: 'FOREIGN_LANG_HIGH', label: '외국어고', icon: '🌍' },
  { value: 'INTERNATIONAL_HIGH', label: '국제고', icon: '🌐' },
  { value: 'ART_HIGH', label: '예술고', icon: '🎨' },
  { value: 'AUTONOMOUS_PRIVATE', label: '자사고', icon: '🏫' },
  { value: 'GENERAL_HIGH', label: '일반고', icon: '📚' },
];

const specialtyOptions = [
  '면접 준비', '자기소개서', '학습 방법', '생활기록부', 
  '동아리 활동', '봉사활동', '수학', '과학', '영어', '국어'
];

const dayOptions = [
  { value: 'MON', label: '월' },
  { value: 'TUE', label: '화' },
  { value: 'WED', label: '수' },
  { value: 'THU', label: '목' },
  { value: 'FRI', label: '금' },
  { value: 'SAT', label: '토' },
  { value: 'SUN', label: '일' },
];

export default function MentorRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // 폼 상태
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState('');
  const [admissionYear, setAdmissionYear] = useState(new Date().getFullYear());
  const [currentGrade, setCurrentGrade] = useState(1);
  const [bio, setBio] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [sessionDuration, setSessionDuration] = useState(30);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [availableDays, setAvailableDays] = useState<string[]>([]);

  const toggleSpecialty = (specialty: string) => {
    setSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const toggleDay = (day: string) => {
    setAvailableDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSubmit = async () => {
    const token = getToken();
    if (!token) {
      alert('로그인이 필요합니다');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/mentoring/mentor/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName,
          category,
          admissionYear,
          currentGrade,
          bio,
          subjects,
          specialties,
          sessionDuration,
          hourlyRate,
          availableDays,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const error = await res.json();
        alert(error.message || '등록에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to register:', error);
      alert('등록 중 오류가 발생했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              멘토 등록 신청 완료!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              관리자 승인 후 멘토 활동을 시작할 수 있습니다.
              <br />
              승인 결과는 알림으로 안내드립니다.
            </p>
            <Button onClick={() => router.push('/dashboard/student/mentoring')}>
              멘토링 페이지로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-7 h-7 text-purple-500" />
            멘토 등록
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            후배들에게 경험을 나눠주세요
          </p>
        </div>
      </div>

      {/* 진행 단계 */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium 
              ${step >= s 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={`w-12 h-1 ${step > s ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Step 1: 기본 정보 */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                기본 정보
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  표시 이름 (닉네임 가능)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="예: 과학고 선배 A"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                    bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  학교 유형
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-3 rounded-lg border text-left transition-all
                        ${category === cat.value 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'}`}
                    >
                      <span className="text-xl mr-2">{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    입학 연도
                  </label>
                  <select
                    value={admissionYear}
                    onChange={(e) => setAdmissionYear(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                      bg-white dark:bg-slate-800"
                  >
                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return <option key={year} value={year}>{year}년</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    현재 학년
                  </label>
                  <select
                    value={currentGrade}
                    onChange={(e) => setCurrentGrade(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                      bg-white dark:bg-slate-800"
                  >
                    <option value={1}>1학년</option>
                    <option value={2}>2학년</option>
                    <option value={3}>3학년</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!displayName || !category}
                >
                  다음
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: 전문 분야 */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                전문 분야
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  자기소개
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="후배들에게 어떤 도움을 줄 수 있는지 소개해주세요..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                    bg-white dark:bg-slate-800 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  전문 분야 (복수 선택)
                </label>
                <div className="flex flex-wrap gap-2">
                  {specialtyOptions.map((specialty) => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => toggleSpecialty(specialty)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all
                        ${specialties.includes(specialty)
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100'}`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  이전
                </Button>
                <Button onClick={() => setStep(3)}>
                  다음
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: 멘토링 설정 */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                멘토링 설정
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  세션 시간
                </label>
                <div className="flex gap-2">
                  {[30, 45, 60].map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => setSessionDuration(duration)}
                      className={`flex-1 py-2 rounded-lg border transition-all
                        ${sessionDuration === duration
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700'
                          : 'border-gray-200 dark:border-gray-700'}`}
                    >
                      {duration}분
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  요금 설정
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={hourlyRate === 0}
                      onChange={() => setHourlyRate(0)}
                      className="text-purple-500"
                    />
                    <span>무료 멘토링</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={hourlyRate > 0}
                      onChange={() => setHourlyRate(10000)}
                      className="text-purple-500"
                    />
                    <span>유료</span>
                    {hourlyRate > 0 && (
                      <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="w-24 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded"
                        min={0}
                        step={1000}
                      />
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  가능한 요일
                </label>
                <div className="flex gap-2">
                  {dayOptions.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`w-10 h-10 rounded-full border transition-all
                        ${availableDays.includes(day.value)
                          ? 'border-purple-500 bg-purple-500 text-white'
                          : 'border-gray-200 dark:border-gray-700'}`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 안내 */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">관리자 승인이 필요합니다</p>
                  <p className="mt-1 text-yellow-700 dark:text-yellow-300">
                    등록 신청 후 관리자 검토를 거쳐 멘토 활동이 가능합니다.
                    재학 증명이 필요할 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  이전
                </Button>
                <Button
                  onClick={handleSubmit}
                  isLoading={submitting}
                  disabled={availableDays.length === 0}
                >
                  <Award className="w-4 h-4 mr-2" />
                  멘토 등록 신청
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

