import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMentorDto,
  UpdateMentorDto,
  RequestSessionDto,
  UpdateSessionDto,
  CancelSessionDto,
  CreateReviewDto,
  MentorQueryDto,
} from './dto';

/**
 * Mentoring Service - 아직 스키마에 Mentor 모델이 정의되지 않음
 * TODO: Prisma 스키마에 Mentor, MentoringSession, MentorReview 모델 추가 후 구현
 */
@Injectable()
export class MentoringService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // 멘토 관리 (미구현)
  // ============================================

  async registerMentor(userId: string, dto: CreateMentorDto) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async updateMentor(userId: string, dto: UpdateMentorDto) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async getMentors(query: MentorQueryDto) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async getMentor(mentorId: string) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async getMentorDetail(mentorId: string) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async getMyMentorProfile(userId: string) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  // ============================================
  // 멘토링 세션 관리 (미구현)
  // ============================================

  async requestSession(studentId: string, dto: RequestSessionDto) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async getMySessions(userId: string) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async confirmSession(userId: string, sessionId: string) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async updateSession(userId: string, sessionId: string, dto: UpdateSessionDto) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async cancelSession(userId: string, sessionId: string, dto: CancelSessionDto) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async completeSession(userId: string, sessionId: string, dto?: UpdateSessionDto) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async getMentorSessions(mentorId: string) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async getStudentSessions(studentId: string) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  // ============================================
  // 리뷰 관리 (미구현)
  // ============================================

  async createReview(studentId: string, dto: CreateReviewDto) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async getMentorReviews(mentorId: string, page: number = 1, limit: number = 10) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  // ============================================
  // 멘토 상태 관리 (미구현)
  // ============================================

  async toggleAvailability(userId: string) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async verifyMentor(mentorId: string) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async getTopMentors() {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  // ============================================
  // 관리자 기능 (미구현)
  // ============================================

  async getPendingMentors() {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async approveMentor(mentorId: string) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }

  async rejectMentor(mentorId: string) {
    throw new NotImplementedException('멘토 기능은 아직 개발 중입니다');
  }
}
