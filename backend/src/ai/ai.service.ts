import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import {
  AIOutputType,
  FeedbackType,
  ActionPlanStatus,
  TaskStatus,
  ApprovalStatus,
} from '../../generated/prisma';
import {
  GenerateRecordSentenceDto,
  GenerateClubRecommendationDto,
  GenerateSubjectAdviceDto,
  GenerateReadingRecommendationDto,
  GenerateReadingGuideDto,
  GenerateActionPlanDto,
  CreateFeedbackDto,
  UpdateFeedbackDto,
} from './dto';

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;
  private model: string;
  private readonly MAX_RETRIES = 3;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-5';

    if (apiKey && apiKey !== 'your-openai-api-key-here') {
      this.openai = new OpenAI({ apiKey });
    }
  }

  // ========== WP5.1: AI Orchestrator ==========
  async checkHealth() {
    if (!this.openai) {
      return {
        status: 'unavailable',
        message: 'AI 서비스가 설정되지 않았습니다. OPENAI_API_KEY를 확인해주세요.',
      };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });
      return {
        status: 'available',
        model: this.model,
        message: 'AI 서비스가 정상 작동 중입니다.',
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'AI 서비스 연결 실패',
        error: error.message,
      };
    }
  }

  private async callOpenAI(
    prompt: string,
    systemPrompt?: string,
    retries = 0,
  ): Promise<string> {
    if (!this.openai) {
      throw new InternalServerErrorException(
        'AI 서비스가 설정되지 않았습니다',
      );
    }

    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      if (retries < this.MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retries + 1)));
        return this.callOpenAI(prompt, systemPrompt, retries + 1);
      }
      throw new InternalServerErrorException('AI 서비스 일시 장애');
    }
  }

  private async saveAIOutput(
    studentId: string,
    type: AIOutputType,
    prompt: string,
    response: string,
    activityId?: string,
    metadata?: any,
  ) {
    return this.prisma.aIOutput.create({
      data: {
        studentId,
        type,
        prompt,
        response,
        activityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }

  // ========== WP5.2: 생기부 문장 생성 ==========
  async generateRecordSentence(studentId: string, dto: GenerateRecordSentenceDto) {
    // 활동 데이터 조회
    const whereClause: any = {
      studentId,
      status: ApprovalStatus.APPROVED,
    };

    if (dto.activityId) {
      whereClause.id = dto.activityId;
    }

    const activities = await this.prisma.activity.findMany({
      where: whereClause,
      orderBy: { startDate: 'desc' },
    });

    if (activities.length === 0) {
      throw new BadRequestException('생성할 활동 데이터가 없습니다');
    }

    const activityData = activities
      .map(
        (a) =>
          `- [${a.type}] ${a.title}: ${a.content} (${a.startDate.toISOString().split('T')[0]}~${a.endDate?.toISOString().split('T')[0] || '진행중'})`,
      )
      .join('\n');

    const systemPrompt = `당신은 고등학교 학생생활기록부 문장 작성 전문가입니다. 
주어진 활동 정보를 바탕으로 학생생활기록부에 기재될 수 있는 형식의 문장을 작성해주세요.
- 3인칭 관찰자 시점으로 작성
- 구체적인 활동 내용과 성과 포함
- 학생의 역량과 성장을 드러내는 표현 사용
- 200~300자 내외로 작성`;

    const prompt = dto.activityId
      ? `다음 활동에 대한 생기부 문장을 작성해주세요:\n${activityData}`
      : `다음 활동들을 종합하여 생기부 문장을 작성해주세요:\n${activityData}`;

    const response = await this.callOpenAI(prompt, systemPrompt);

    const output = await this.saveAIOutput(
      studentId,
      AIOutputType.RECORD_SENTENCE,
      prompt,
      response,
      dto.activityId,
      { activitiesCount: activities.length },
    );

    return {
      output: {
        id: output.id,
        type: output.type,
        activityId: dto.activityId,
        response: output.response,
        createdAt: output.createdAt,
      },
    };
  }

  async getRecordSentenceHistory(studentId: string, limit = 10) {
    const outputs = await this.prisma.aIOutput.findMany({
      where: {
        studentId,
        type: AIOutputType.RECORD_SENTENCE,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        activity: {
          select: { id: true, title: true, type: true },
        },
      },
    });

    return { outputs };
  }

  // ========== WP5.3: 동아리/교과/독서 조언 ==========
  async generateClubRecommendation(studentId: string, dto: GenerateClubRecommendationDto) {
    // 학생 데이터 수집
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { name: true, grade: true, schoolName: true },
    });

    const grades = await this.prisma.grade.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
    });

    const activities = await this.prisma.activity.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
    });

    const targetSchools = await this.prisma.targetSchool.findMany({
      where: { studentId },
      include: { school: true },
    });

    const gradeInfo = grades.length > 0
      ? `성적: ${[...new Set(grades.map((g) => g.subject))].join(', ')} 과목 등록`
      : '성적 정보 없음';

    const activityInfo = activities.length > 0
      ? `기존 활동: ${activities.map((a) => `${a.type}-${a.title}`).join(', ')}`
      : '활동 기록 없음';

    const targetInfo = targetSchools.length > 0
      ? `목표 학교: ${targetSchools.map((t) => `${t.school.name}(${t.school.type})`).join(', ')}`
      : '목표 학교 미설정';

    const systemPrompt = `당신은 고입 컨설턴트입니다. 학생에게 적합한 동아리를 추천해주세요.
JSON 형식으로 3개의 동아리를 추천해주세요.
형식: {"recommendations": [{"name": "동아리명", "type": "유형", "reason": "추천 이유", "activities": ["활동 예시1", "활동 예시2"]}]}`;

    const prompt = `학생 정보:
- ${student?.grade || ''}학년
- ${gradeInfo}
- ${activityInfo}
- ${targetInfo}
${dto.interests ? `- 관심 분야: ${dto.interests.join(', ')}` : ''}

이 학생에게 적합한 동아리 3개를 추천해주세요.`;

    const response = await this.callOpenAI(prompt, systemPrompt);

    const output = await this.saveAIOutput(
      studentId,
      AIOutputType.CLUB_RECOMMENDATION,
      prompt,
      response,
      undefined,
      { interests: dto.interests },
    );

    let recommendations;
    try {
      recommendations = JSON.parse(response);
    } catch {
      recommendations = { raw: response };
    }

    return {
      output: {
        id: output.id,
        type: output.type,
        recommendations: recommendations.recommendations || recommendations,
        createdAt: output.createdAt,
      },
    };
  }

  async generateSubjectAdvice(studentId: string, dto: GenerateSubjectAdviceDto) {
    const grades = await this.prisma.grade.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
    });

    if (grades.length === 0) {
      throw new BadRequestException('성적 데이터가 필요합니다');
    }

    const targetSchools = await this.prisma.targetSchool.findMany({
      where: { studentId },
      include: {
        school: {
          include: {
            admissions: {
              where: { publishStatus: 'PUBLISHED' },
              take: 1,
            },
          },
        },
      },
    });

    const gradesBySubject = grades.reduce((acc: any, g) => {
      if (!acc[g.subject]) acc[g.subject] = [];
      acc[g.subject].push({
        year: g.year,
        semester: g.semester,
        written: g.written,
        performance: g.performance,
        rank: g.rank,
      });
      return acc;
    }, {});

    const systemPrompt = `당신은 교과 학습 전문 컨설턴트입니다.
학생의 성적 데이터를 분석하고 맞춤형 학습 전략을 제시해주세요.
JSON 형식으로 응답: {"analysis": {"strengths": [], "weaknesses": []}, "strategies": [{"subject": "과목", "advice": "조언", "priority": "high/medium/low"}]}`;

    const prompt = `과목별 성적:
${Object.entries(gradesBySubject)
  .map(([subject, data]: [string, any]) => `${subject}: ${JSON.stringify(data)}`)
  .join('\n')}

${targetSchools.length > 0 ? `목표 학교: ${targetSchools.map((t) => t.school.name).join(', ')}` : ''}
${dto.focusSubject ? `집중 과목: ${dto.focusSubject}` : ''}

이 학생을 위한 교과 학습 전략을 제시해주세요.`;

    const response = await this.callOpenAI(prompt, systemPrompt);

    const output = await this.saveAIOutput(
      studentId,
      AIOutputType.SUBJECT_ADVICE,
      prompt,
      response,
      undefined,
      { focusSubject: dto.focusSubject },
    );

    let advice;
    try {
      advice = JSON.parse(response);
    } catch {
      advice = { raw: response };
    }

    return {
      output: {
        id: output.id,
        type: output.type,
        advice,
        createdAt: output.createdAt,
      },
    };
  }

  async generateReadingRecommendation(studentId: string, dto: GenerateReadingRecommendationDto) {
    const existingBooks = await this.prisma.readingLog.findMany({
      where: { studentId },
      select: { bookTitle: true, author: true },
    });

    const targetSchools = await this.prisma.targetSchool.findMany({
      where: { studentId },
      include: { school: true },
    });

    const systemPrompt = `당신은 독서 교육 전문가입니다.
학생에게 적합한 도서를 추천해주세요.
JSON 형식: {"books": [{"title": "책 제목", "author": "저자", "genre": "장르", "reason": "추천 이유", "keyPoints": ["핵심 포인트"]}]}`;

    const prompt = `학생 정보:
${targetSchools.length > 0 ? `- 목표 학교: ${targetSchools.map((t) => `${t.school.name}(${t.school.type})`).join(', ')}` : '- 목표 학교 미설정'}
${existingBooks.length > 0 ? `- 기존 독서: ${existingBooks.map((b) => b.bookTitle).join(', ')}` : '- 독서 기록 없음'}
${dto.genre ? `- 선호 장르: ${dto.genre}` : ''}
${dto.purpose ? `- 독서 목적: ${dto.purpose}` : ''}

기존에 읽은 책을 제외하고 3권의 도서를 추천해주세요.`;

    const response = await this.callOpenAI(prompt, systemPrompt);

    const output = await this.saveAIOutput(
      studentId,
      AIOutputType.READING_GUIDE,
      prompt,
      response,
      undefined,
      { genre: dto.genre, purpose: dto.purpose },
    );

    let books;
    try {
      books = JSON.parse(response);
    } catch {
      books = { raw: response };
    }

    return {
      output: {
        id: output.id,
        type: output.type,
        books: books.books || books,
        createdAt: output.createdAt,
      },
    };
  }

  async generateReadingGuide(studentId: string, dto: GenerateReadingGuideDto) {
    const systemPrompt = `당신은 독서 교육 전문가입니다.
해당 책에 대한 독후 활동 가이드를 작성해주세요.
JSON 형식: {"guide": {"summary": "책 요약", "themes": ["주제"], "discussionQuestions": ["토론 질문"], "activities": ["활동 아이디어"], "relatedBooks": ["연관 도서"]}}`;

    const prompt = `책 제목: ${dto.bookTitle}
${dto.author ? `저자: ${dto.author}` : ''}

이 책에 대한 독후 활동 가이드를 작성해주세요.`;

    const response = await this.callOpenAI(prompt, systemPrompt);

    const output = await this.saveAIOutput(
      studentId,
      AIOutputType.READING_GUIDE,
      prompt,
      response,
      undefined,
      { bookTitle: dto.bookTitle, author: dto.author },
    );

    let guide;
    try {
      guide = JSON.parse(response);
    } catch {
      guide = { raw: response };
    }

    return {
      output: {
        id: output.id,
        type: output.type,
        guide: guide.guide || guide,
        createdAt: output.createdAt,
      },
    };
  }

  // ========== WP5.4: 액션 플랜 생성 ==========
  async generateActionPlan(studentId: string, dto: GenerateActionPlanDto) {
    // 최신 진단 결과 확인
    const latestDiagnosis = await this.prisma.diagnosisResult.findFirst({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: { school: true },
    });

    if (!latestDiagnosis) {
      throw new BadRequestException('진단 결과가 먼저 필요합니다');
    }

    // 기존 활성 플랜 아카이브
    await this.prisma.actionPlan.updateMany({
      where: { studentId, status: ActionPlanStatus.ACTIVE },
      data: { status: ActionPlanStatus.ARCHIVED },
    });

    // 학생 데이터 수집
    const targetSchools = await this.prisma.targetSchool.findMany({
      where: { studentId },
      include: {
        school: {
          include: { schedules: { where: { publishStatus: 'PUBLISHED' } } },
        },
      },
    });

    const strengths = JSON.parse(latestDiagnosis.strengths || '[]');
    const weaknesses = JSON.parse(latestDiagnosis.weaknesses || '[]');
    const recommendations = JSON.parse(latestDiagnosis.recommendations || '[]');

    const systemPrompt = `당신은 고입 컨설턴트입니다. 학생을 위한 12주 액션 플랜을 작성해주세요.
JSON 형식으로 응답:
{
  "title": "플랜 제목",
  "goals": ["목표1", "목표2", "목표3"],
  "weeks": [
    {"week": 1, "theme": "주제", "tasks": [{"title": "할 일", "description": "설명"}]}
  ]
}`;

    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 84); // 12주

    const prompt = `학생 진단 결과:
- 종합 점수: ${latestDiagnosis.score}
- 판정: ${latestDiagnosis.level}
- 강점: ${strengths.join(', ')}
- 약점: ${weaknesses.join(', ')}
- 추천사항: ${recommendations.join(', ')}

목표 학교: ${targetSchools.map((t) => `${t.school.name}(${t.school.type})`).join(', ')}

시작일: ${startDate.toISOString().split('T')[0]}
기간: 12주

이 학생을 위한 맞춤형 12주 액션 플랜을 작성해주세요.`;

    const response = await this.callOpenAI(prompt, systemPrompt);

    let planData;
    try {
      planData = JSON.parse(response);
    } catch {
      planData = {
        title: '맞춤형 고입 준비 플랜',
        goals: ['목표 학교 합격'],
        weeks: [],
      };
    }

    // AI Output 저장
    const aiOutput = await this.saveAIOutput(
      studentId,
      AIOutputType.ACTION_PLAN,
      prompt,
      response,
    );

    // ActionPlan 저장
    const actionPlan = await this.prisma.actionPlan.create({
      data: {
        studentId,
        title: planData.title || '맞춤형 고입 준비 플랜',
        description: `진단 결과 기반 12주 액션 플랜 (${latestDiagnosis.level})`,
        startDate,
        endDate,
        goals: JSON.stringify(planData.goals || []),
        status: ActionPlanStatus.ACTIVE,
        aiOutputId: aiOutput.id,
      },
    });

    // WeeklyTasks 저장
    if (planData.weeks && Array.isArray(planData.weeks)) {
      for (const week of planData.weeks) {
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + (week.week - 1) * 7);

        if (week.tasks && Array.isArray(week.tasks)) {
          for (const task of week.tasks) {
            await this.prisma.weeklyTask.create({
              data: {
                planId: actionPlan.id,
                weekNumber: week.week,
                theme: week.theme,
                title: task.title,
                description: task.description,
                status: TaskStatus.TODO,
                dueDate: weekStart,
              },
            });
          }
        }
      }
    }

    // 결과 조회
    const result = await this.prisma.actionPlan.findUnique({
      where: { id: actionPlan.id },
      include: {
        tasks: {
          orderBy: [{ weekNumber: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    return {
      actionPlan: {
        ...result,
        goals: JSON.parse(result?.goals || '[]'),
      },
    };
  }

  async getActionPlans(studentId: string, status?: ActionPlanStatus) {
    const where: any = { studentId };
    if (status) {
      where.status = status;
    }

    const plans = await this.prisma.actionPlan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { tasks: true } },
      },
    });

    return {
      plans: plans.map((p) => ({
        ...p,
        goals: JSON.parse(p.goals || '[]'),
      })),
    };
  }

  async getActionPlanDetail(studentId: string, planId: string) {
    const plan = await this.prisma.actionPlan.findFirst({
      where: { id: planId, studentId },
      include: {
        tasks: {
          orderBy: [{ weekNumber: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('액션 플랜을 찾을 수 없습니다');
    }

    return {
      actionPlan: {
        ...plan,
        goals: JSON.parse(plan.goals || '[]'),
      },
    };
  }

  async getWeeklyTasks(studentId: string, planId: string, weekNum: number) {
    const plan = await this.prisma.actionPlan.findFirst({
      where: { id: planId, studentId },
    });

    if (!plan) {
      throw new NotFoundException('액션 플랜을 찾을 수 없습니다');
    }

    const tasks = await this.prisma.weeklyTask.findMany({
      where: { planId, weekNumber: weekNum },
      orderBy: { createdAt: 'asc' },
    });

    return { weekNumber: weekNum, tasks };
  }

  async getChildActionPlans(parentId: string, childId: string) {
    await this.validateFamilyRelation(parentId, childId);

    return this.getActionPlans(childId);
  }

  // ========== WP5.5: 피드백 시스템 ==========
  async createFeedback(userId: string, outputId: string, dto: CreateFeedbackDto) {
    const output = await this.prisma.aIOutput.findUnique({
      where: { id: outputId },
    });

    if (!output) {
      throw new NotFoundException('AI 출력물을 찾을 수 없습니다');
    }

    const existing = await this.prisma.aIFeedback.findUnique({
      where: { outputId_userId: { outputId, userId } },
    });

    if (existing) {
      throw new ConflictException('이미 피드백을 남겼습니다');
    }

    const feedback = await this.prisma.aIFeedback.create({
      data: {
        outputId,
        userId,
        type: dto.type as FeedbackType,
        comment: dto.comment,
        editedContent: dto.editedContent,
      },
    });

    return {
      message: '피드백이 등록되었습니다',
      feedback,
    };
  }

  async updateFeedback(userId: string, outputId: string, dto: UpdateFeedbackDto) {
    const existing = await this.prisma.aIFeedback.findUnique({
      where: { outputId_userId: { outputId, userId } },
    });

    if (!existing) {
      throw new NotFoundException('피드백을 찾을 수 없습니다');
    }

    const updated = await this.prisma.aIFeedback.update({
      where: { id: existing.id },
      data: {
        type: dto.type as FeedbackType,
        comment: dto.comment,
        editedContent: dto.editedContent,
      },
    });

    return {
      message: '피드백이 수정되었습니다',
      feedback: updated,
    };
  }

  async getFeedbackStats() {
    const stats = await this.prisma.aIFeedback.groupBy({
      by: ['type'],
      _count: true,
    });

    const byOutputType = await this.prisma.$queryRaw`
      SELECT o.type as "outputType", f.type as "feedbackType", COUNT(*)::int as count
      FROM ai_feedbacks f
      JOIN ai_outputs o ON f."outputId" = o.id
      GROUP BY o.type, f.type
    `;

    return {
      overall: stats.map((s) => ({ type: s.type, count: s._count })),
      byOutputType,
    };
  }

  // ========== WP8.4: 상담 리포트 생성 ==========
  async generateConsultationReport(
    student: any,
    studentSummary: any,
    notes: string[],
    topic?: string,
  ): Promise<{ summary: string; content: string }> {
    const systemPrompt = `당신은 전문 고입 컨설턴트입니다. 학생 상담 후 학부모에게 전달할 리포트를 작성해주세요.

리포트는 다음 구조로 작성해주세요:
1. 상담 요약 (3-5줄)
2. 학생 현황 분석
   - 학업 역량
   - 비교과 활동
   - 진단 결과 해석
3. 주요 논의 사항
4. 권장 사항 및 다음 단계
5. 학부모 협조 사항

전문적이면서도 이해하기 쉬운 언어로 작성하고, 학생의 강점을 강조하면서 개선점도 건설적으로 제시해주세요.`;

    const prompt = `학생 정보:
- 이름: ${student.name || '학생'}
- 학년: ${student.grade || '미정'}학년
- 학교: ${student.schoolName || '미정'}

${topic ? `상담 주제: ${topic}\n` : ''}

학생 데이터 요약:
- 성적: ${studentSummary.grades?.count || 0}개 과목 기록
- 활동: ${studentSummary.activities?.count || 0}개 활동 기록
- 진단 결과: ${studentSummary.diagnosis ? `${studentSummary.diagnosis.score}점 (${studentSummary.diagnosis.level})` : '미실시'}
- 추천 학교: ${studentSummary.recommendations?.map((r: any) => r.school).join(', ') || '없음'}
- 액션 플랜: ${studentSummary.actionPlan ? `${studentSummary.actionPlan.title} (진행률 ${studentSummary.actionPlan.progressRate}%)` : '미생성'}

상담 노트:
${notes.map((n, i) => `${i + 1}. ${n}`).join('\n')}

위 정보를 바탕으로 학부모에게 전달할 상담 리포트를 작성해주세요.`;

    const response = await this.callOpenAI(prompt, systemPrompt);

    // 요약과 본문 분리 (첫 문단을 요약으로)
    const paragraphs = response.split('\n\n').filter((p) => p.trim());
    const summary = paragraphs[0] || '상담이 완료되었습니다.';
    const content = response;

    return { summary, content };
  }

  // ========== 유틸리티 ==========
  private async validateFamilyRelation(parentId: string, childId: string) {
    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
      select: { familyId: true },
    });

    const child = await this.prisma.user.findUnique({
      where: { id: childId },
      select: { familyId: true },
    });

    if (
      !parent?.familyId ||
      !child?.familyId ||
      parent.familyId !== child.familyId
    ) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }
  }
}

