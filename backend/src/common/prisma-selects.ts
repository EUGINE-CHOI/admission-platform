/**
 * Prisma Select 최적화
 * 민감한 필드 제외 및 자주 사용되는 select 패턴 정의
 */

// 사용자 기본 정보 (민감 정보 제외)
export const userBasicSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  schoolName: true,
  grade: true,
  createdAt: true,
  // password, refreshToken 제외
} as const;

// 사용자 프로필 (컨설턴트 정보 포함)
export const userProfileSelect = {
  ...userBasicSelect,
  bio: true,
  specialty: true,
  experience: true,
  profileImage: true,
  consultantStatus: true,
  hasPremium: true,
} as const;

// 사용자 간략 정보 (목록용)
export const userSummarySelect = {
  id: true,
  name: true,
  role: true,
} as const;

// 학교 기본 정보
export const schoolBasicSelect = {
  id: true,
  name: true,
  type: true,
  region: true,
} as const;

// 학교 상세 정보
export const schoolDetailSelect = {
  ...schoolBasicSelect,
  district: true,
  address: true,
  website: true,
  phone: true,
  description: true,
  features: true,
} as const;

// 성적 정보
export const gradeSelect = {
  id: true,
  subject: true,
  year: true,
  semester: true,
  written: true,
  performance: true,
  rank: true,
  status: true,
  createdAt: true,
} as const;

// 활동 정보
export const activitySelect = {
  id: true,
  type: true,
  title: true,
  content: true,
  startDate: true,
  endDate: true,
  status: true,
  createdAt: true,
} as const;

// 진단 결과 (요약)
export const diagnosisSummarySelect = {
  id: true,
  level: true,
  score: true,
  createdAt: true,
} as const;

// 진단 결과 (상세)
export const diagnosisDetailSelect = {
  ...diagnosisSummarySelect,
  gradeScore: true,
  activityScore: true,
  attendanceScore: true,
  volunteerScore: true,
  strengths: true,
  weaknesses: true,
  recommendations: true,
} as const;



