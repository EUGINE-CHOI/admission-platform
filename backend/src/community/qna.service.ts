import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionCategory } from '../../generated/prisma';

export interface CreateQuestionDto {
  title: string;
  content: string;
  category: QuestionCategory;
  isAnonymous?: boolean;
}

export interface CreateAnswerDto {
  content: string;
  isAnonymous?: boolean;
}

export interface QuestionWithDetails {
  id: string;
  title: string;
  content: string;
  category: QuestionCategory;
  isAnonymous: boolean;
  viewCount: number;
  likeCount: number;
  isResolved: boolean;
  createdAt: Date;
  author: { id: string; name: string | null } | null;
  answerCount: number;
  isLiked?: boolean;
}

@Injectable()
export class QnaService {
  constructor(private prisma: PrismaService) {}

  // 질문 목록 조회
  async getQuestions(options: {
    category?: QuestionCategory;
    search?: string;
    page?: number;
    limit?: number;
    userId?: string;
  }): Promise<{ questions: QuestionWithDetails[]; total: number; page: number; totalPages: number }> {
    const { category, search, page = 1, limit = 10, userId } = options;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { answers: true } },
          likes: userId ? { where: { userId } } : false,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.question.count({ where }),
    ]);

    const formattedQuestions: QuestionWithDetails[] = questions.map((q) => ({
      id: q.id,
      title: q.title,
      content: q.content,
      category: q.category,
      isAnonymous: q.isAnonymous,
      viewCount: q.viewCount,
      likeCount: q.likeCount,
      isResolved: q.isResolved,
      createdAt: q.createdAt,
      author: q.isAnonymous ? null : q.author,
      answerCount: q._count.answers,
      isLiked: userId ? (q.likes as any[]).length > 0 : undefined,
    }));

    return {
      questions: formattedQuestions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 질문 상세 조회
  async getQuestion(questionId: string, userId?: string): Promise<QuestionWithDetails & { answers: any[] }> {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        author: { select: { id: true, name: true } },
        answers: {
          include: {
            author: { select: { id: true, name: true } },
            likes: userId ? { where: { userId } } : false,
          },
          orderBy: [{ isAccepted: 'desc' }, { likeCount: 'desc' }, { createdAt: 'asc' }],
        },
        likes: userId ? { where: { userId } } : false,
        _count: { select: { answers: true } },
      },
    });

    if (!question) {
      throw new NotFoundException('질문을 찾을 수 없습니다.');
    }

    // 조회수 증가
    await this.prisma.question.update({
      where: { id: questionId },
      data: { viewCount: { increment: 1 } },
    });

    const formattedAnswers = question.answers.map((a) => ({
      id: a.id,
      content: a.content,
      isAnonymous: a.isAnonymous,
      isAccepted: a.isAccepted,
      likeCount: a.likeCount,
      createdAt: a.createdAt,
      author: a.isAnonymous ? null : a.author,
      isLiked: userId ? (a.likes as any[]).length > 0 : undefined,
    }));

    return {
      id: question.id,
      title: question.title,
      content: question.content,
      category: question.category,
      isAnonymous: question.isAnonymous,
      viewCount: question.viewCount + 1,
      likeCount: question.likeCount,
      isResolved: question.isResolved,
      createdAt: question.createdAt,
      author: question.isAnonymous ? null : question.author,
      answerCount: question._count.answers,
      isLiked: userId ? (question.likes as any[]).length > 0 : undefined,
      answers: formattedAnswers,
    };
  }

  // 질문 작성
  async createQuestion(userId: string, dto: CreateQuestionDto) {
    return this.prisma.question.create({
      data: {
        authorId: userId,
        title: dto.title,
        content: dto.content,
        category: dto.category,
        isAnonymous: dto.isAnonymous ?? false,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  }

  // 질문 수정
  async updateQuestion(userId: string, questionId: string, dto: Partial<CreateQuestionDto>) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });

    if (!question) {
      throw new NotFoundException('질문을 찾을 수 없습니다.');
    }

    if (question.authorId !== userId) {
      throw new ForbiddenException('본인의 질문만 수정할 수 있습니다.');
    }

    return this.prisma.question.update({
      where: { id: questionId },
      data: dto,
    });
  }

  // 질문 삭제
  async deleteQuestion(userId: string, questionId: string, isAdmin = false) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });

    if (!question) {
      throw new NotFoundException('질문을 찾을 수 없습니다.');
    }

    if (!isAdmin && question.authorId !== userId) {
      throw new ForbiddenException('본인의 질문만 삭제할 수 있습니다.');
    }

    await this.prisma.question.delete({ where: { id: questionId } });
    return { message: '질문이 삭제되었습니다.' };
  }

  // 답변 작성
  async createAnswer(userId: string, questionId: string, dto: CreateAnswerDto) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });

    if (!question) {
      throw new NotFoundException('질문을 찾을 수 없습니다.');
    }

    return this.prisma.answer.create({
      data: {
        questionId,
        authorId: userId,
        content: dto.content,
        isAnonymous: dto.isAnonymous ?? false,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  }

  // 답변 채택
  async acceptAnswer(userId: string, questionId: string, answerId: string) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });

    if (!question) {
      throw new NotFoundException('질문을 찾을 수 없습니다.');
    }

    if (question.authorId !== userId) {
      throw new ForbiddenException('질문 작성자만 답변을 채택할 수 있습니다.');
    }

    // 기존 채택 취소
    await this.prisma.answer.updateMany({
      where: { questionId, isAccepted: true },
      data: { isAccepted: false },
    });

    // 새 답변 채택
    await this.prisma.answer.update({
      where: { id: answerId },
      data: { isAccepted: true },
    });

    // 질문 해결 상태로 변경
    await this.prisma.question.update({
      where: { id: questionId },
      data: { isResolved: true },
    });

    return { message: '답변이 채택되었습니다.' };
  }

  // 답변 삭제
  async deleteAnswer(userId: string, answerId: string, isAdmin = false) {
    const answer = await this.prisma.answer.findUnique({ where: { id: answerId } });

    if (!answer) {
      throw new NotFoundException('답변을 찾을 수 없습니다.');
    }

    if (!isAdmin && answer.authorId !== userId) {
      throw new ForbiddenException('본인의 답변만 삭제할 수 있습니다.');
    }

    await this.prisma.answer.delete({ where: { id: answerId } });
    return { message: '답변이 삭제되었습니다.' };
  }

  // 질문 좋아요
  async likeQuestion(userId: string, questionId: string) {
    const existing = await this.prisma.questionLike.findUnique({
      where: { questionId_userId: { questionId, userId } },
    });

    if (existing) {
      // 좋아요 취소
      await this.prisma.questionLike.delete({
        where: { questionId_userId: { questionId, userId } },
      });
      await this.prisma.question.update({
        where: { id: questionId },
        data: { likeCount: { decrement: 1 } },
      });
      return { liked: false };
    } else {
      // 좋아요
      await this.prisma.questionLike.create({
        data: { questionId, userId },
      });
      await this.prisma.question.update({
        where: { id: questionId },
        data: { likeCount: { increment: 1 } },
      });
      return { liked: true };
    }
  }

  // 답변 좋아요
  async likeAnswer(userId: string, answerId: string) {
    const existing = await this.prisma.answerLike.findUnique({
      where: { answerId_userId: { answerId, userId } },
    });

    if (existing) {
      await this.prisma.answerLike.delete({
        where: { answerId_userId: { answerId, userId } },
      });
      await this.prisma.answer.update({
        where: { id: answerId },
        data: { likeCount: { decrement: 1 } },
      });
      return { liked: false };
    } else {
      await this.prisma.answerLike.create({
        data: { answerId, userId },
      });
      await this.prisma.answer.update({
        where: { id: answerId },
        data: { likeCount: { increment: 1 } },
      });
      return { liked: true };
    }
  }

  // 카테고리 목록
  getCategories() {
    return [
      { value: 'ADMISSION', label: '입시 일반' },
      { value: 'SCHOOL_INFO', label: '학교 정보' },
      { value: 'STUDY_TIP', label: '학습 방법' },
      { value: 'ACTIVITY', label: '비교과 활동' },
      { value: 'INTERVIEW', label: '면접 준비' },
      { value: 'OTHER', label: '기타' },
    ];
  }
}

