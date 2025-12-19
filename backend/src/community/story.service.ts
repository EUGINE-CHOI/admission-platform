import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StoryCategory } from '../../generated/prisma';

export interface CreateStoryDto {
  title: string;
  content: string;
  category: StoryCategory;
  schoolId?: string;
  admissionYear: number;
  isAnonymous?: boolean;
}

export interface CreateCommentDto {
  content: string;
  isAnonymous?: boolean;
}

export interface StoryWithDetails {
  id: string;
  title: string;
  content: string;
  category: StoryCategory;
  admissionYear: number;
  isAnonymous: boolean;
  isVerified: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: Date;
  author: { id: string; name: string | null } | null;
  school: { id: string; name: string; type: string } | null;
  commentCount: number;
  isLiked?: boolean;
}

@Injectable()
export class StoryService {
  constructor(private prisma: PrismaService) {}

  // 후기 목록 조회
  async getStories(options: {
    category?: StoryCategory;
    schoolId?: string;
    search?: string;
    page?: number;
    limit?: number;
    userId?: string;
  }): Promise<{ stories: StoryWithDetails[]; total: number; page: number; totalPages: number }> {
    const { category, schoolId, search, page = 1, limit = 10, userId } = options;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (schoolId) {
      where.schoolId = schoolId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [stories, total] = await Promise.all([
      this.prisma.successStory.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
          school: { select: { id: true, name: true, type: true } },
          _count: { select: { comments: true } },
          likes: userId ? { where: { userId } } : false,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.successStory.count({ where }),
    ]);

    const formattedStories: StoryWithDetails[] = stories.map((s) => ({
      id: s.id,
      title: s.title,
      content: s.content,
      category: s.category,
      admissionYear: s.admissionYear,
      isAnonymous: s.isAnonymous,
      isVerified: s.isVerified,
      viewCount: s.viewCount,
      likeCount: s.likeCount,
      createdAt: s.createdAt,
      author: s.isAnonymous ? null : s.author,
      school: s.school,
      commentCount: s._count.comments,
      isLiked: userId ? (s.likes as any[]).length > 0 : undefined,
    }));

    return {
      stories: formattedStories,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 후기 상세 조회
  async getStory(storyId: string, userId?: string): Promise<StoryWithDetails & { comments: any[] }> {
    const story = await this.prisma.successStory.findUnique({
      where: { id: storyId },
      include: {
        author: { select: { id: true, name: true } },
        school: { select: { id: true, name: true, type: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        likes: userId ? { where: { userId } } : false,
        _count: { select: { comments: true } },
      },
    });

    if (!story) {
      throw new NotFoundException('후기를 찾을 수 없습니다.');
    }

    // 조회수 증가
    await this.prisma.successStory.update({
      where: { id: storyId },
      data: { viewCount: { increment: 1 } },
    });

    const formattedComments = story.comments.map((c) => ({
      id: c.id,
      content: c.content,
      isAnonymous: c.isAnonymous,
      createdAt: c.createdAt,
      author: c.isAnonymous ? null : c.author,
    }));

    return {
      id: story.id,
      title: story.title,
      content: story.content,
      category: story.category,
      admissionYear: story.admissionYear,
      isAnonymous: story.isAnonymous,
      isVerified: story.isVerified,
      viewCount: story.viewCount + 1,
      likeCount: story.likeCount,
      createdAt: story.createdAt,
      author: story.isAnonymous ? null : story.author,
      school: story.school,
      commentCount: story._count.comments,
      isLiked: userId ? (story.likes as any[]).length > 0 : undefined,
      comments: formattedComments,
    };
  }

  // 후기 작성
  async createStory(userId: string, dto: CreateStoryDto) {
    return this.prisma.successStory.create({
      data: {
        authorId: userId,
        title: dto.title,
        content: dto.content,
        category: dto.category,
        schoolId: dto.schoolId,
        admissionYear: dto.admissionYear,
        isAnonymous: dto.isAnonymous ?? false,
      },
      include: {
        author: { select: { id: true, name: true } },
        school: { select: { id: true, name: true, type: true } },
      },
    });
  }

  // 후기 수정
  async updateStory(userId: string, storyId: string, dto: Partial<CreateStoryDto>) {
    const story = await this.prisma.successStory.findUnique({ where: { id: storyId } });

    if (!story) {
      throw new NotFoundException('후기를 찾을 수 없습니다.');
    }

    if (story.authorId !== userId) {
      throw new ForbiddenException('본인의 후기만 수정할 수 있습니다.');
    }

    return this.prisma.successStory.update({
      where: { id: storyId },
      data: dto,
    });
  }

  // 후기 삭제
  async deleteStory(userId: string, storyId: string, isAdmin = false) {
    const story = await this.prisma.successStory.findUnique({ where: { id: storyId } });

    if (!story) {
      throw new NotFoundException('후기를 찾을 수 없습니다.');
    }

    if (!isAdmin && story.authorId !== userId) {
      throw new ForbiddenException('본인의 후기만 삭제할 수 있습니다.');
    }

    await this.prisma.successStory.delete({ where: { id: storyId } });
    return { message: '후기가 삭제되었습니다.' };
  }

  // 후기 인증 (관리자)
  async verifyStory(storyId: string, isVerified: boolean) {
    const story = await this.prisma.successStory.findUnique({ where: { id: storyId } });

    if (!story) {
      throw new NotFoundException('후기를 찾을 수 없습니다.');
    }

    return this.prisma.successStory.update({
      where: { id: storyId },
      data: { isVerified },
    });
  }

  // 댓글 작성
  async createComment(userId: string, storyId: string, dto: CreateCommentDto) {
    const story = await this.prisma.successStory.findUnique({ where: { id: storyId } });

    if (!story) {
      throw new NotFoundException('후기를 찾을 수 없습니다.');
    }

    return this.prisma.storyComment.create({
      data: {
        storyId,
        authorId: userId,
        content: dto.content,
        isAnonymous: dto.isAnonymous ?? false,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  }

  // 댓글 삭제
  async deleteComment(userId: string, commentId: string, isAdmin = false) {
    const comment = await this.prisma.storyComment.findUnique({ where: { id: commentId } });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (!isAdmin && comment.authorId !== userId) {
      throw new ForbiddenException('본인의 댓글만 삭제할 수 있습니다.');
    }

    await this.prisma.storyComment.delete({ where: { id: commentId } });
    return { message: '댓글이 삭제되었습니다.' };
  }

  // 후기 좋아요
  async likeStory(userId: string, storyId: string) {
    const existing = await this.prisma.storyLike.findUnique({
      where: { storyId_userId: { storyId, userId } },
    });

    if (existing) {
      await this.prisma.storyLike.delete({
        where: { storyId_userId: { storyId, userId } },
      });
      await this.prisma.successStory.update({
        where: { id: storyId },
        data: { likeCount: { decrement: 1 } },
      });
      return { liked: false };
    } else {
      await this.prisma.storyLike.create({
        data: { storyId, userId },
      });
      await this.prisma.successStory.update({
        where: { id: storyId },
        data: { likeCount: { increment: 1 } },
      });
      return { liked: true };
    }
  }

  // 학교별 후기 통계
  async getSchoolStoryStats(schoolId: string) {
    const [total, verified, categories] = await Promise.all([
      this.prisma.successStory.count({ where: { schoolId } }),
      this.prisma.successStory.count({ where: { schoolId, isVerified: true } }),
      this.prisma.successStory.groupBy({
        by: ['category'],
        where: { schoolId },
        _count: { id: true },
      }),
    ]);

    return {
      totalStories: total,
      verifiedStories: verified,
      byCategory: categories.map((c) => ({
        category: c.category,
        count: c._count.id,
      })),
    };
  }

  // 카테고리 목록
  getCategories() {
    return [
      { value: 'PREPARATION', label: '준비 과정' },
      { value: 'INTERVIEW_EXP', label: '면접 경험' },
      { value: 'STUDY_METHOD', label: '학습 방법' },
      { value: 'ACTIVITY_TIP', label: '활동 팁' },
      { value: 'GENERAL', label: '일반 후기' },
    ];
  }

  // 인기 후기
  async getPopularStories(limit = 5) {
    return this.prisma.successStory.findMany({
      where: { isVerified: true },
      include: {
        author: { select: { id: true, name: true } },
        school: { select: { id: true, name: true, type: true } },
        _count: { select: { comments: true } },
      },
      orderBy: [{ likeCount: 'desc' }, { viewCount: 'desc' }],
      take: limit,
    });
  }
}

