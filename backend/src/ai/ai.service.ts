import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
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
  private gemini: GenerativeModel | null = null;
  private model: string;
  private readonly MAX_RETRIES = 3;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.model = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.0-flash';

    if (geminiKey && geminiKey !== 'your-gemini-api-key-here') {
      const genAI = new GoogleGenerativeAI(geminiKey);
      this.gemini = genAI.getGenerativeModel({ model: this.model });
    }
  }

  // ========== WP5.1: AI Orchestrator ==========
  async checkHealth() {
    if (!this.gemini) {
      return {
        status: 'unavailable',
        message: 'AI 서비스가 설정되지 않았습니다. GEMINI_API_KEY를 확인해주세요.',
      };
    }

    try {
      const result = await this.gemini.generateContent('Hello');
      const response = await result.response;
      return {
        status: 'available',
        model: this.model,
        provider: 'Google Gemini',
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

  private async callAI(
    prompt: string,
    systemPrompt?: string,
    retries = 0,
  ): Promise<string> {
    if (!this.gemini) {
      throw new InternalServerErrorException(
        'AI 서비스가 설정되지 않았습니다',
      );
    }

    try {
      // Gemini에서는 시스템 프롬프트를 사용자 프롬프트에 포함
      const fullPrompt = systemPrompt 
        ? `${systemPrompt}\n\n---\n\n${prompt}`
        : prompt;

      const result = await this.gemini.generateContent(fullPrompt);
      const response = await result.response;
      let text = response.text() || '';
      
      // Gemini가 ```json으로 감싸서 응답하는 경우 처리
      text = this.cleanJsonResponse(text);
      
      return text;
    } catch (error) {
      if (retries < this.MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retries + 1)));
        return this.callAI(prompt, systemPrompt, retries + 1);
      }
      throw new InternalServerErrorException('AI 서비스 일시 장애: ' + error.message);
    }
  }
  
  // JSON 응답에서 markdown 코드 블록 제거
  private cleanJsonResponse(text: string): string {
    // ```json ... ``` 형식 제거
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    return cleaned.trim();
  }
  
  // 기존 callOpenAI를 callAI로 별칭 (호환성)
  private async callOpenAI(
    prompt: string,
    systemPrompt?: string,
    retries = 0,
  ): Promise<string> {
    return this.callAI(prompt, systemPrompt, retries);
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
      include: { middleSchool: true },
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

    // DB에서 동아리 데이터 조회
    const existingClubs = await this.prisma.club.findMany({
      where: { isGeneral: true },
      take: 50,
    });

    const clubCategories = [...new Set(existingClubs.map(c => c.category))];

    const gradeInfo = grades.length > 0
      ? grades.map(g => `${g.subject}: ${g.rank}등급`).join(', ')
      : '성적 정보 없음';

    const activityInfo = activities.length > 0
      ? activities.map(a => `${a.title}(${a.type})`).join(', ')
      : '활동 기록 없음';

    const targetInfo = targetSchools.length > 0
      ? targetSchools.map(t => `${t.school.name}(${t.school.type})`).join(', ')
      : '목표 학교 미설정';

    const systemPrompt = `당신은 15년 경력의 고입 전문 컨설턴트입니다. 
학생의 관심사, 목표학교, 성적을 분석하여 가장 적합한 동아리를 추천해주세요.

## 핵심 원칙:
1. 목표 학교 유형에 맞는 동아리 우선 추천 (과학고→과학 동아리, 외고→영어/토론 동아리)
2. 학생의 관심사와 기존 활동을 고려한 시너지 효과 분석
3. 구체적인 활동 내용과 생기부 기재 예시 제공
4. 입시에서 어필 가능한 포인트 설명

## 동아리 카테고리 참고: ${clubCategories.join(', ')}

## 응답 형식 (반드시 JSON으로만):
{
  "recommendations": [
    {
      "name": "동아리명",
      "category": "카테고리 (학술/예술/체육/봉사/진로/문화)",
      "type": "동아리 유형 (학교 정규/자율/온라인 등)",
      "matchScore": 85,
      "reason": "이 학생에게 추천하는 구체적 이유 (목표학교, 관심사 연결)",
      "activities": ["구체적 활동 예시 1", "구체적 활동 예시 2", "구체적 활동 예시 3"],
      "benefits": ["입시에서 어필할 수 있는 포인트 1", "포인트 2"],
      "recordExample": "생기부 기재 예시 문장"
    }
  ],
  "additionalAdvice": "동아리 활동에 대한 전반적인 조언"
}`;

    const prompt = `## 학생 프로필
- 학년: ${student?.grade || '미입력'}학년
- 재학 중학교: ${student?.middleSchool?.name || student?.schoolName || '미입력'}
- 관심 분야: ${dto.interests?.join(', ') || '미입력'}

## 현재 상태
- 성적: ${gradeInfo}
- 기존 활동: ${activityInfo}
- 목표 학교: ${targetInfo}

위 정보를 바탕으로 이 학생에게 가장 적합한 동아리 5개를 추천해주세요.
JSON 형식으로만 응답하세요. 코드 블록(\`\`\`)을 사용하지 마세요.`;

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
      recommendations = { 
        recommendations: [{
          name: "AI 추천 동아리",
          category: "학술",
          type: "정규",
          matchScore: 80,
          reason: response,
          activities: ["활동 예시"],
          benefits: ["입시 어필 포인트"],
          recordExample: "생기부 기재 예시"
        }],
        additionalAdvice: "더 정확한 추천을 위해 관심사를 입력해주세요."
      };
    }

    return {
      output: {
        id: output.id,
        type: output.type,
        recommendations: recommendations.recommendations || [],
        additionalAdvice: recommendations.additionalAdvice || '',
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
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { middleSchool: true },
    });

    const existingBooks = await this.prisma.readingLog.findMany({
      where: { studentId },
      select: { bookTitle: true, author: true },
    });

    const targetSchools = await this.prisma.targetSchool.findMany({
      where: { studentId },
      include: { school: true },
    });

    const activities = await this.prisma.activity.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
      take: 5,
    });

    const targetInfo = targetSchools.length > 0
      ? targetSchools.map(t => `${t.school.name}(${t.school.type})`).join(', ')
      : '미설정';

    const activityInfo = activities.length > 0
      ? activities.map(a => a.title).join(', ')
      : '없음';

    const systemPrompt = `당신은 15년 경력의 독서 교육 전문가이자 고입 컨설턴트입니다.
학생의 목표 학교, 관심사, 활동을 분석하여 입시에 도움이 되는 맞춤형 도서를 추천해주세요.

## 핵심 원칙:
1. 목표 학교 유형에 맞는 도서 우선 (과학고→과학/수학 서적, 외고→인문/언어 서적)
2. 단순 교양서가 아닌 깊이 있는 탐구가 가능한 도서
3. 독후 활동으로 확장할 수 있는 도서
4. 자기소개서/면접에서 어필 가능한 도서

## 응답 형식 (반드시 JSON으로만):
{
  "books": [
    {
      "title": "책 제목",
      "author": "저자",
      "publisher": "출판사",
      "genre": "장르",
      "difficulty": "난이도 (입문/중급/심화)",
      "pageCount": "약 300p",
      "reason": "이 학생에게 추천하는 구체적 이유",
      "keyPoints": ["핵심 내용 1", "핵심 내용 2"],
      "relatedSubjects": ["관련 교과목"],
      "discussionTopics": ["독후 토론 주제 1", "주제 2"],
      "activityIdeas": ["독후 활동 아이디어 1", "아이디어 2"],
      "interviewTip": "면접에서 이 책을 어떻게 어필할 수 있는지"
    }
  ],
  "readingStrategy": "효과적인 독서 전략 조언",
  "monthlyGoal": "월간 독서 목표 제안"
}`;

    const prompt = `## 학생 프로필
- 학년: ${student?.grade || '미입력'}학년
- 목표 학교: ${targetInfo}
- 관심 분야/장르: ${dto.genre || '미입력'}
- 독서 목적: ${dto.purpose || '입시 준비'}
- 기존 활동: ${activityInfo}

## 기존 독서 기록
${existingBooks.length > 0 ? existingBooks.map(b => `- ${b.bookTitle} (${b.author})`).join('\n') : '- 독서 기록 없음'}

위 정보를 바탕으로 이 학생에게 가장 적합한 도서 5권을 추천해주세요.
기존에 읽은 책은 제외하고, 새로운 책만 추천해주세요.
JSON 형식으로만 응답하세요. 코드 블록(\`\`\`)을 사용하지 마세요.`;

    const response = await this.callOpenAI(prompt, systemPrompt);

    const output = await this.saveAIOutput(
      studentId,
      AIOutputType.READING_GUIDE,
      prompt,
      response,
      undefined,
      { genre: dto.genre, purpose: dto.purpose },
    );

    let result;
    try {
      result = JSON.parse(response);
    } catch {
      result = { 
        books: [{
          title: "추천 도서",
          author: "저자",
          genre: dto.genre || "일반",
          difficulty: "중급",
          reason: response,
          keyPoints: ["핵심 내용"],
          relatedSubjects: ["관련 과목"],
          discussionTopics: ["토론 주제"],
          activityIdeas: ["독후 활동"],
          interviewTip: "면접 활용 팁"
        }],
        readingStrategy: "꾸준히 읽고 기록하세요.",
        monthlyGoal: "월 2권 이상"
      };
    }

    return {
      output: {
        id: output.id,
        type: output.type,
        books: result.books || [],
        readingStrategy: result.readingStrategy || '',
        monthlyGoal: result.monthlyGoal || '',
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

  // ========== WP 추가: AI 종합 진단 분석 ==========
  async generateComprehensiveAnalysis(studentId: string) {
    // 학생 전체 데이터 수집
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        middleSchool: true,
      },
    });

    const grades = await this.prisma.grade.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
    });

    const activities = await this.prisma.activity.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
    });

    const readingLogs = await this.prisma.readingLog.findMany({
      where: { studentId },
    });

    const volunteers = await this.prisma.volunteer.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
    });

    const targetSchools = await this.prisma.targetSchool.findMany({
      where: { studentId },
      include: {
        school: {
          include: {
            admissions: { where: { publishStatus: 'PUBLISHED' }, take: 1 },
            admissionHistories: { orderBy: { year: 'desc' }, take: 3 },
          },
        },
      },
    });

    const latestDiagnosis = await this.prisma.diagnosisResult.findFirst({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: { school: true },
    });

    // 성적 분석
    const gradesBySubject: Record<string, any[]> = {};
    grades.forEach(g => {
      if (!gradesBySubject[g.subject]) gradesBySubject[g.subject] = [];
      gradesBySubject[g.subject].push({
        year: g.year,
        semester: g.semester,
        rank: g.rank,
        written: g.written,
        performance: g.performance,
      });
    });

    const averageRank = grades.length > 0
      ? grades.filter(g => g.rank).reduce((sum, g) => sum + (g.rank || 0), 0) / grades.filter(g => g.rank).length
      : null;

    // 활동 분석
    const activityTypes = activities.reduce((acc: Record<string, number>, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {});

    const totalVolunteerHours = volunteers.reduce((sum, v) => sum + v.hours, 0);

    const systemPrompt = `당신은 고입 전문 컨설턴트입니다. 학생의 전체 데이터를 분석하여 종합적인 평가와 맞춤형 조언을 제공해주세요.

응답은 반드시 다음 JSON 형식으로:
{
  "overallAssessment": {
    "score": 0-100,
    "grade": "A/B/C/D/F",
    "summary": "종합 평가 요약 (2-3문장)"
  },
  "academicAnalysis": {
    "strengths": ["강점 과목들"],
    "weaknesses": ["보완 필요 과목들"],
    "trend": "상승/유지/하락",
    "advice": "학업 관련 조언"
  },
  "activityAnalysis": {
    "diversity": "다양성 평가",
    "depth": "심화도 평가",
    "recommendations": ["추천 활동들"]
  },
  "schoolFitAnalysis": [
    {
      "schoolName": "학교명",
      "fitLevel": "적합/도전/어려움",
      "probability": "0-100%",
      "keyFactors": ["주요 요인들"],
      "improvementAreas": ["개선 필요 영역"]
    }
  ],
  "actionItems": [
    {
      "priority": "high/medium/low",
      "category": "학업/활동/기타",
      "task": "구체적 과제",
      "timeline": "기한"
    }
  ],
  "motivationalMessage": "학생을 위한 격려 메시지"
}`;

    const prompt = `학생 정보:
- 이름: ${student?.name || '학생'}
- 학년: ${student?.grade || '미정'}학년
- 학교: ${student?.middleSchool?.name || student?.schoolName || '미정'}

📚 성적 현황:
- 평균 등급: ${averageRank ? averageRank.toFixed(1) : '데이터 없음'}등급
- 등록 과목: ${Object.keys(gradesBySubject).join(', ') || '없음'}
${Object.entries(gradesBySubject).map(([subject, data]) => 
  `- ${subject}: 최근 ${(data as any[])[0]?.rank || '-'}등급`
).join('\n')}

🏆 비교과 활동:
- 총 활동 수: ${activities.length}개
- 유형별: ${Object.entries(activityTypes).map(([type, count]) => `${type}(${count})`).join(', ') || '없음'}
- 주요 활동: ${activities.slice(0, 3).map(a => a.title).join(', ') || '없음'}

📖 독서 활동:
- 총 독서: ${readingLogs.length}권
- 최근 독서: ${readingLogs.slice(0, 3).map(r => r.bookTitle).join(', ') || '없음'}

🤝 봉사 활동:
- 총 봉사 시간: ${totalVolunteerHours}시간

🎯 목표 학교:
${targetSchools.map(t => {
  const competitionRate = t.school.admissionHistories?.[0]?.competitionRate;
  return `- ${t.school.name} (${t.school.type}) - 경쟁률: ${competitionRate ? competitionRate + ':1' : '정보없음'}`;
}).join('\n') || '- 미설정'}

📊 최근 진단 결과:
${latestDiagnosis ? `- 점수: ${latestDiagnosis.score}점, 판정: ${latestDiagnosis.level}` : '- 진단 미실시'}

이 학생에 대한 종합 분석과 맞춤형 조언을 제공해주세요.`;

    const response = await this.callOpenAI(prompt, systemPrompt);

    const output = await this.saveAIOutput(
      studentId,
      AIOutputType.SUBJECT_ADVICE, // 종합 분석용
      prompt,
      response,
      undefined,
      { type: 'comprehensive_analysis' },
    );

    let analysis;
    try {
      analysis = JSON.parse(response);
    } catch {
      analysis = { raw: response };
    }

    return {
      output: {
        id: output.id,
        type: 'COMPREHENSIVE_ANALYSIS',
        analysis,
        createdAt: output.createdAt,
      },
    };
  }

  // ========== WP 추가: AI 학교 추천 ==========
  async generateSchoolRecommendations(studentId: string, preferences?: {
    region?: string;
    schoolTypes?: string[];
    priorities?: string[];
  }) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { middleSchool: true },
    });

    const grades = await this.prisma.grade.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
    });

    const activities = await this.prisma.activity.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
    });

    const averageRank = grades.length > 0
      ? grades.filter(g => g.rank).reduce((sum, g) => sum + (g.rank || 0), 0) / grades.filter(g => g.rank).length
      : null;

    // 학교 목록 조회 (경쟁률 포함)
    const whereClause: any = { publishStatus: 'PUBLISHED' };
    if (preferences?.region) whereClause.region = preferences.region;
    if (preferences?.schoolTypes?.length) whereClause.type = { in: preferences.schoolTypes };

    const schools = await this.prisma.school.findMany({
      where: whereClause,
      include: {
        admissions: { where: { publishStatus: 'PUBLISHED' }, take: 1 },
        admissionHistories: { orderBy: { year: 'desc' }, take: 3 },
      },
      take: 50,
    });

    const schoolInfo = schools.map(s => ({
      name: s.name,
      type: s.type,
      region: s.region,
      competitionRate: s.admissionHistories?.[0]?.competitionRate || null,
      cutoffGrade: s.admissions?.[0]?.cutoffGrade || null,
    }));

    const activityTypes = activities.reduce((acc: Record<string, number>, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {});

    const systemPrompt = `당신은 고입 전문 컨설턴트입니다. 학생 데이터와 학교 정보를 분석하여 최적의 학교를 추천해주세요.

응답은 반드시 다음 JSON 형식으로:
{
  "recommendations": [
    {
      "rank": 1,
      "schoolName": "학교명",
      "schoolType": "학교유형",
      "region": "지역",
      "fitScore": 0-100,
      "fitLevel": "최적합/적합/도전/고려",
      "reasons": ["추천 이유 1", "추천 이유 2"],
      "requirements": ["합격을 위해 필요한 것들"],
      "competitionRate": "경쟁률",
      "admissionTips": "입시 팁"
    }
  ],
  "alternativeOptions": [
    {
      "schoolName": "학교명",
      "reason": "대안으로 고려할 이유"
    }
  ],
  "generalAdvice": "전반적인 입시 전략 조언"
}`;

    const prompt = `학생 정보:
- 학년: ${student?.grade || '미정'}학년
- 평균 등급: ${averageRank ? averageRank.toFixed(1) : '데이터 없음'}등급
- 활동 현황: ${Object.entries(activityTypes).map(([type, count]) => `${type}(${count}개)`).join(', ') || '없음'}
- 총 활동 수: ${activities.length}개

${preferences?.region ? `선호 지역: ${preferences.region}` : ''}
${preferences?.schoolTypes?.length ? `선호 학교 유형: ${preferences.schoolTypes.join(', ')}` : ''}
${preferences?.priorities?.length ? `우선순위: ${preferences.priorities.join(', ')}` : ''}

분석 가능한 학교 목록:
${schoolInfo.map(s => 
  `- ${s.name} (${s.type}, ${s.region}) - 경쟁률: ${s.competitionRate ? s.competitionRate + ':1' : '미정'}, 커트라인: ${s.cutoffGrade ? s.cutoffGrade + '등급' : '미정'}`
).join('\n')}

이 학생에게 가장 적합한 학교 5개를 추천해주세요.`;

    const response = await this.callOpenAI(prompt, systemPrompt);

    const output = await this.saveAIOutput(
      studentId,
      AIOutputType.CLUB_RECOMMENDATION, // 추천용
      prompt,
      response,
      undefined,
      { type: 'school_recommendations', preferences },
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
        type: 'SCHOOL_RECOMMENDATIONS',
        recommendations: recommendations.recommendations || [],
        alternativeOptions: recommendations.alternativeOptions || [],
        generalAdvice: recommendations.generalAdvice || '',
        createdAt: output.createdAt,
      },
    };
  }

  // ========== WP 추가: AI 맞춤 조언 (Quick Advice) ==========
  async generateQuickAdvice(studentId: string, topic?: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { middleSchool: true },
    });

    const grades = await this.prisma.grade.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    const activities = await this.prisma.activity.findMany({
      where: { studentId, status: ApprovalStatus.APPROVED },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const targetSchools = await this.prisma.targetSchool.findMany({
      where: { studentId },
      include: { 
        school: {
          include: {
            admissionHistories: { orderBy: { year: 'desc' }, take: 1 },
          },
        },
      },
      take: 3,
    });

    const latestDiagnosis = await this.prisma.diagnosisResult.findFirst({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });

    const averageRank = grades.length > 0
      ? grades.filter(g => g.rank).reduce((sum, g) => sum + (g.rank || 0), 0) / grades.filter(g => g.rank).length
      : null;

    // 목표 학교 상세 정보
    const targetSchoolsInfo = targetSchools.map(t => {
      const rate = t.school.admissionHistories?.[0]?.competitionRate;
      return `${t.school.name}(${t.school.type}, 경쟁률 ${rate ? rate + ':1' : '미정'})`;
    }).join(', ');

    const systemPrompt = `당신은 15년 경력의 전문 고입 컨설턴트입니다. 
실제 데이터와 구체적인 수치를 기반으로 전문적인 조언을 제공합니다.

## 핵심 원칙:
1. 구체적인 숫자와 기간을 포함하세요 (예: "3개월간", "주 5시간", "상위 10%")
2. 실제 입시에서 통하는 전략을 알려주세요
3. 막연한 조언 대신 당장 실행 가능한 액션을 제시하세요
4. 학교별 특성과 입시 트렌드를 반영하세요

## 응답 형식 (반드시 아래 JSON 형식으로만 응답):
{
  "greeting": "간단한 인사 (20자 이내)",
  "currentStatus": "현재 상태에 대한 정확한 분석 (데이터 기반)",
  "mainAdvice": [
    {
      "title": "핵심 조언 제목",
      "content": "구체적이고 전문적인 조언 (100자 이상). 실제 통계나 사례 포함",
      "actionable": "오늘/이번 주 바로 실행할 구체적 행동 (시간, 횟수 포함)"
    }
  ],
  "weeklyGoals": ["구체적 목표1 (측정 가능)", "구체적 목표2", "구체적 목표3"],
  "encouragement": "학생 상황에 맞는 현실적 격려",
  "nextStep": "가장 시급하고 중요한 다음 단계 (구체적)"
}`;

    const topicPrompt = topic ? `

📌 학생의 질문: "${topic}"
이 질문에 대해 전문가 수준의 상세하고 실용적인 답변을 제공해주세요.` : '';

    const prompt = `## 학생 프로필
- 이름: ${student?.name || '학생'}
- 학년: ${student?.grade || '미입력'}학년
- 재학 중학교: ${student?.middleSchool?.name || student?.schoolName || '미입력'}
- 평균 내신 등급: ${averageRank ? averageRank.toFixed(1) + '등급' : '미입력'}

## 비교과 활동
${activities.length > 0 ? activities.map(a => `- ${a.title} (${a.type})`).join('\n') : '- 등록된 활동 없음'}

## 목표 학교
${targetSchoolsInfo || '미설정'}

## 진단 결과
${latestDiagnosis ? `점수: ${latestDiagnosis.score}점, 판정: ${latestDiagnosis.level}` : '진단 미실시'}
${topicPrompt}

위 정보를 바탕으로 이 학생에게 전문적이고 구체적인 맞춤 조언을 제공해주세요.
반드시 JSON 형식으로만 응답하세요. 코드 블록(\`\`\`)을 사용하지 마세요.`;

    const response = await this.callOpenAI(prompt, systemPrompt);

    const output = await this.saveAIOutput(
      studentId,
      AIOutputType.SUBJECT_ADVICE,
      prompt,
      response,
      undefined,
      { type: 'quick_advice', topic },
    );

    let advice;
    try {
      advice = JSON.parse(response);
    } catch {
      // JSON 파싱 실패시 텍스트로 표시
      advice = { 
        greeting: "안녕하세요!",
        currentStatus: "AI 분석 결과입니다.",
        mainAdvice: [{
          title: "AI 조언",
          content: response,
          actionable: "위 내용을 참고하여 계획을 세워보세요."
        }],
        weeklyGoals: ["이번 주 목표를 설정해보세요"],
        encouragement: "꾸준히 노력하면 좋은 결과가 있을 거예요!",
        nextStep: "구체적인 실행 계획을 세워보세요."
      };
    }

    return {
      output: {
        id: output.id,
        type: 'QUICK_ADVICE',
        advice,
        createdAt: output.createdAt,
      },
    };
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

