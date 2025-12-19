/**
 * 공통 타입 정의
 * 
 * 이 파일은 프로젝트 전체에서 사용되는 공통 타입을 정의합니다.
 * 새로운 개발 시 이 파일의 타입을 import하여 사용하세요.
 */

// ============================================
// User & Auth Types
// ============================================

export type UserRole = "STUDENT" | "PARENT" | "CONSULTANT" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  lastLoginAt?: string;
  isActive?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============================================
// School Types
// ============================================

export type SchoolType = 
  | "FOREIGN_LANGUAGE" 
  | "SCIENCE" 
  | "AUTONOMOUS_PRIVATE"
  | "SPECIALIZED"
  | "GENERAL";

export interface School {
  id: string;
  name: string;
  type: SchoolType;
  region?: string;
  address?: string;
  websiteUrl?: string;
  establishedYear?: number;
}

export interface SchoolSummary {
  id: string;
  name: string;
  type: SchoolType;
}

// ============================================
// Grade Types
// ============================================

export type GradeType = "WRITTEN" | "PERFORMANCE";
export type Semester = 1 | 2;

export interface Grade {
  id: string;
  subject: string;
  type: GradeType;
  score?: number;
  rank?: number;
  totalStudents?: number;
  year: number;
  semester: Semester;
  createdAt?: string;
}

export interface GradeSummary {
  subject: string;
  averageScore: number;
  trend: "IMPROVING" | "DECLINING" | "STABLE";
}

// ============================================
// Badge Types
// ============================================

export type BadgeCategory = 
  | "ACTIVITY"
  | "ACHIEVEMENT" 
  | "COMMUNITY"
  | "STREAK";

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  iconUrl?: string;
  points: number;
}

export interface UserBadge extends Badge {
  earnedAt: string;
  isEarned: boolean;
}

// ============================================
// Diagnosis Types
// ============================================

export type FitLevel = "FIT" | "CHALLENGE" | "UNLIKELY";

export interface DiagnosisResult {
  id: string;
  schoolId: string;
  schoolName: string;
  fitLevel: FitLevel;
  score: number;
  probability?: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  createdAt: string;
}

// ============================================
// AI Types
// ============================================

export type AIOutputType = 
  | "QUICK_ADVICE"
  | "COMPREHENSIVE"
  | "SCHOOL_RECOMMENDATION"
  | "ACTION_PLAN"
  | "PERSONAL_STATEMENT"
  | "INTERVIEW_PREP";

export interface AIOutput {
  id: string;
  type: AIOutputType;
  input: Record<string, unknown>;
  output: string;
  createdAt: string;
}

// ============================================
// Community Types
// ============================================

export type QuestionCategory = 
  | "CAREER"
  | "STUDY" 
  | "ADMISSION"
  | "GENERAL";

export interface Question {
  id: string;
  title: string;
  content: string;
  category: QuestionCategory;
  authorId: string;
  authorName?: string;
  viewCount: number;
  likeCount: number;
  answerCount: number;
  isAccepted: boolean;
  createdAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  authorId: string;
  authorName?: string;
  likeCount: number;
  isAccepted: boolean;
  createdAt: string;
}

export interface SuccessStory {
  id: string;
  title: string;
  content: string;
  schoolId: string;
  schoolName?: string;
  admissionYear: number;
  authorId: string;
  authorName?: string;
  isVerified: boolean;
  likeCount: number;
  viewCount: number;
  createdAt: string;
}

// ============================================
// Goal Types
// ============================================

export interface GradeGoal {
  id: string;
  subject: string;
  targetRank: number;
  currentRank?: number;
  targetYear: number;
  targetSemester: Semester;
  isAchieved: boolean;
  achievedAt?: string;
  createdAt: string;
}

// ============================================
// D-Day Types
// ============================================

export type DDayCategory = 
  | "APPLICATION"
  | "INTERVIEW"
  | "ANNOUNCEMENT"
  | "ORIENTATION"
  | "CUSTOM";

export interface DDayEvent {
  id: string;
  title: string;
  date: string;
  category: DDayCategory;
  schoolId?: string;
  schoolName?: string;
  daysLeft: number;
}

// ============================================
// Consultation Types
// ============================================

export type ConsultationStatus = 
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export type ConsultationMethod = "ONLINE" | "OFFLINE";

export interface Consultation {
  id: string;
  studentId: string;
  consultantId: string;
  status: ConsultationStatus;
  method: ConsultationMethod;
  scheduledAt: string;
  note?: string;
  createdAt: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================
// Form Types
// ============================================

export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

