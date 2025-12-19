import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIOutputType } from '../../generated/prisma';

export interface GenerateDraftDto {
  schoolId?: string;
  topic: string;
  maxLength?: number;
  emphasis?: string[];  // 강조할 활동/경험
}

export interface ReviewRequestDto {
  content: string;
  schoolId?: string;
  focusAreas?: ('grammar' | 'logic' | 'structure' | 'persuasion')[];
}

export interface DraftResult {
  draft: string;
  wordCount: number;
  suggestions: string[];
  structureGuide: {
    introduction: string;
    body: string;
    conclusion: string;
  };
}

export interface ReviewResult {
  overallScore: number;
  feedback: {
    area: string;
    score: number;
    comments: string[];
    suggestions: string[];
  }[];
  improvedVersion: string;
  keyStrengths: string[];
  areasToImprove: string[];
}

export interface SchoolTemplate {
  schoolId: string;
  schoolName: string;
  schoolType: string;
  requiredTopics: string[];
  tips: string[];
  sampleStructure: string;
}

@Injectable()
export class PersonalStatementService {
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

  private async callAI(prompt: string, systemPrompt?: string, retries = 0): Promise<string> {
    if (!this.gemini) {
      throw new InternalServerErrorException('AI 서비스가 설정되지 않았습니다');
    }

    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n---\n\n${prompt}` : prompt;
      const result = await this.gemini.generateContent(fullPrompt);
      const response = await result.response;
      let text = response.text() || '';
      return this.cleanJsonResponse(text);
    } catch (error) {
      if (retries < this.MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retries + 1)));
        return this.callAI(prompt, systemPrompt, retries + 1);
      }
      throw new InternalServerErrorException('AI 서비스 일시 장애: ' + error.message);
    }
  }

  private cleanJsonResponse(text: string): string {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    return cleaned.trim();
  }

  private async saveAIOutput(studentId: string, type: AIOutputType, prompt: string, response: string, metadata?: any) {
    return this.prisma.aIOutput.create({
      data: {
        studentId,
        type,
        prompt,
        response,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }

  // 자기소개서 초안 생성
  async generateDraft(studentId: string, dto: GenerateDraftDto): Promise<DraftResult> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        grades: { where: { status: 'APPROVED' }, orderBy: { year: 'desc' } },
        activities: { where: { status: 'APPROVED' } },
        readingLogs: true,
      },
    });

    if (!student) throw new NotFoundException('학생 정보를 찾을 수 없습니다.');

    let schoolInfo = '';
    if (dto.schoolId) {
      const school = await this.prisma.school.findUnique({ where: { id: dto.schoolId } });
      if (school) {
        schoolInfo = `
지원 학교: ${school.name}
학교 유형: ${school.type}
학교 특징: ${school.features || '없음'}
        `;
      }
    }

    const studentInfo = `
이름: ${student.name || '학생'}
학년: ${student.grade || '미상'}
주요 과목 성적: ${student.grades.slice(0, 5).map(g => `${g.subject} ${g.rank}등급`).join(', ') || '없음'}
주요 활동: ${student.activities.map(a => `${a.title} (${a.type}): ${a.content || ''}`).join('\n') || '없음'}
독서 기록: ${student.readingLogs.slice(0, 5).map(r => `${r.bookTitle} - ${r.review || ''}`).join('\n') || '없음'}
    `;

    const systemPrompt = `당신은 대한민국 고등학교 입시 자기소개서 전문가입니다. 학생의 정보를 바탕으로 진솔하고 설득력 있는 자기소개서 초안을 작성해주세요.

응답 형식 (JSON):
{
  "draft": "자기소개서 본문 (${dto.maxLength || 1000}자 내외)",
  "wordCount": 글자수,
  "suggestions": ["개선 제안 1", "개선 제안 2", ...],
  "structureGuide": {
    "introduction": "서론 작성 가이드",
    "body": "본론 작성 가이드", 
    "conclusion": "결론 작성 가이드"
  }
}`;

    const prompt = `## 학생 정보
${studentInfo}

${schoolInfo ? `## 지원 학교 정보\n${schoolInfo}` : ''}

## 자기소개서 주제
${dto.topic}

${dto.emphasis?.length ? `## 특히 강조할 내용\n${dto.emphasis.join(', ')}` : ''}

위 정보를 바탕으로 자기소개서 초안을 작성해주세요. 
- 학생의 실제 경험과 활동을 자연스럽게 녹여주세요
- 진솔하고 구체적인 내용으로 작성해주세요
- ${dto.maxLength || 1000}자 내외로 작성해주세요

JSON 형식으로만 응답하세요.`;

    const response = await this.callAI(prompt, systemPrompt);

    await this.saveAIOutput(studentId, AIOutputType.PERSONAL_STATEMENT, prompt, response, {
      schoolId: dto.schoolId,
      topic: dto.topic,
      type: 'draft_generation',
    });

    try {
      return JSON.parse(response);
    } catch {
      return {
        draft: response,
        wordCount: response.length,
        suggestions: ['AI 응답 형식 오류로 원본 텍스트를 반환합니다.'],
        structureGuide: { introduction: '', body: '', conclusion: '' },
      };
    }
  }

  // 자기소개서 첨삭/리뷰
  async reviewStatement(studentId: string, dto: ReviewRequestDto): Promise<ReviewResult> {
    let schoolInfo = '';
    if (dto.schoolId) {
      const school = await this.prisma.school.findUnique({ where: { id: dto.schoolId } });
      if (school) {
        schoolInfo = `지원 학교: ${school.name} (${school.type})`;
      }
    }

    const focusAreasText = dto.focusAreas?.length 
      ? `특히 다음 영역을 중점 검토: ${dto.focusAreas.join(', ')}`
      : '';

    const systemPrompt = `당신은 대한민국 고등학교 입시 자기소개서 첨삭 전문가입니다. 학생이 작성한 자기소개서를 분석하고 상세한 피드백을 제공해주세요.

응답 형식 (JSON):
{
  "overallScore": 1-100 점수,
  "feedback": [
    {
      "area": "문법" | "논리" | "구조" | "설득력",
      "score": 1-100,
      "comments": ["코멘트 1", "코멘트 2"],
      "suggestions": ["제안 1", "제안 2"]
    }
  ],
  "improvedVersion": "개선된 자기소개서 전문",
  "keyStrengths": ["강점 1", "강점 2"],
  "areasToImprove": ["개선점 1", "개선점 2"]
}`;

    const prompt = `## 자기소개서 원문
${dto.content}

${schoolInfo ? `## ${schoolInfo}` : ''}
${focusAreasText}

위 자기소개서를 분석하고 상세한 피드백을 제공해주세요.
JSON 형식으로만 응답하세요.`;

    const response = await this.callAI(prompt, systemPrompt);

    await this.saveAIOutput(studentId, AIOutputType.PERSONAL_STATEMENT, prompt, response, {
      schoolId: dto.schoolId,
      type: 'review',
      originalLength: dto.content.length,
    });

    try {
      return JSON.parse(response);
    } catch {
      return {
        overallScore: 70,
        feedback: [],
        improvedVersion: dto.content,
        keyStrengths: ['AI 응답 형식 오류'],
        areasToImprove: ['다시 시도해주세요'],
      };
    }
  }

  // 학교별 자기소개서 템플릿 조회
  async getSchoolTemplate(schoolId: string): Promise<SchoolTemplate> {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      include: { admissions: { orderBy: { year: 'desc' }, take: 1 } },
    });

    if (!school) throw new NotFoundException('학교 정보를 찾을 수 없습니다.');

    // 학교 유형별 기본 템플릿
    const templatesByType: Record<string, { topics: string[]; tips: string[] }> = {
      SCIENCE: {
        topics: ['과학적 탐구 경험', '수학/과학 분야 성취', '미래 진로 계획'],
        tips: ['실험/연구 경험을 구체적으로', '논리적 사고력 강조', '과학자로서의 비전 제시'],
      },
      FOREIGN_LANGUAGE: {
        topics: ['외국어 학습 경험', '국제교류/문화 경험', '글로벌 리더십 비전'],
        tips: ['언어 학습 과정과 성취 강조', '다문화 이해 경험 포함', '국제적 진로 계획 구체화'],
      },
      AUTONOMOUS: {
        topics: ['자기주도 학습 경험', '특별한 관심 분야', '학교 선택 이유'],
        tips: ['자율성과 주도성 강조', '깊이 있는 탐구 경험', '학교 특색과의 연결'],
      },
      SPECIALIZED: {
        topics: ['전문 분야 관심 계기', '관련 활동/경험', '진로 계획'],
        tips: ['해당 분야에 대한 열정 표현', '실질적인 경험 강조', '구체적인 목표 제시'],
      },
      GENERAL: {
        topics: ['학교생활 경험', '성장 과정', '진로 목표'],
        tips: ['성실함과 노력 강조', '구체적인 에피소드 활용', '발전 가능성 어필'],
      },
    };

    const typeTemplate = templatesByType[school.type] || templatesByType.GENERAL;

    return {
      schoolId: school.id,
      schoolName: school.name,
      schoolType: school.type,
      requiredTopics: typeTemplate.topics,
      tips: typeTemplate.tips,
      sampleStructure: `
[서론 - 약 20%]
자신을 간결하게 소개하고, ${school.name}에 지원하게 된 계기를 밝힙니다.

[본론 - 약 60%]
${typeTemplate.topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}
각 주제에 대해 구체적인 경험과 성장 과정을 서술합니다.

[결론 - 약 20%]
${school.name}에서의 학업 계획과 미래 비전을 제시합니다.
      `.trim(),
    };
  }

  // 저장된 자기소개서 목록
  async getSavedStatements(studentId: string) {
    return this.prisma.aIOutput.findMany({
      where: { studentId, type: AIOutputType.PERSONAL_STATEMENT },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // 자기소개서 주제 추천
  async suggestTopics(studentId: string): Promise<{ topics: { title: string; description: string; relevantActivities: string[] }[] }> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        activities: { where: { status: 'APPROVED' } },
        readingLogs: true,
      },
    });

    if (!student) throw new NotFoundException('학생 정보를 찾을 수 없습니다.');

    const systemPrompt = `당신은 고등학교 입시 자기소개서 전문가입니다. 학생의 활동 내역을 분석하여 자기소개서 주제를 추천해주세요.

응답 형식 (JSON):
{
  "topics": [
    {
      "title": "주제 제목",
      "description": "이 주제로 작성하면 좋은 이유",
      "relevantActivities": ["관련 활동 1", "관련 활동 2"]
    }
  ]
}`;

    const prompt = `## 학생 활동 내역
${student.activities.map(a => `- ${a.title} (${a.type}): ${a.content || ''}`).join('\n') || '활동 기록 없음'}

## 독서 기록
${student.readingLogs.map(r => `- ${r.bookTitle}`).join('\n') || '독서 기록 없음'}

위 정보를 바탕으로 자기소개서 주제 3-5개를 추천해주세요.
JSON 형식으로만 응답하세요.`;

    const response = await this.callAI(prompt, systemPrompt);

    try {
      return JSON.parse(response);
    } catch {
      return { topics: [] };
    }
  }
}

