import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  tips: string[];
  sampleAnswer?: string;
}

export interface InterviewPrepResult {
  schoolName: string;
  schoolType: string;
  interviewType: string;
  commonQuestions: InterviewQuestion[];
  personalQuestions: InterviewQuestion[];
  tips: string[];
}

@Injectable()
export class InterviewPrepService {
  private gemini: GenerativeModel | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (geminiKey && geminiKey !== 'your-gemini-api-key-here') {
      const genAI = new GoogleGenerativeAI(geminiKey);
      this.gemini = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
  }

  private async callAI(prompt: string): Promise<string> {
    if (!this.gemini) {
      return '{"score": 75, "feedback": "AI 서비스가 설정되지 않았습니다.", "improvements": ["답변에 구체적인 사례를 추가하세요"], "modelAnswer": ""}';
    }
    try {
      const result = await this.gemini.generateContent(prompt);
      const response = await result.response;
      return response.text() || '';
    } catch (error) {
      return '{"score": 70, "feedback": "AI 평가 중 오류가 발생했습니다.", "improvements": ["다시 시도해주세요"], "modelAnswer": ""}';
    }
  }

  // 학교별 면접 준비 자료 생성
  async getInterviewPrep(studentId: string, schoolId: string): Promise<InterviewPrepResult> {
    // 학교 정보 조회
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      throw new Error('학교를 찾을 수 없습니다');
    }

    // 학생 활동 정보 조회 (개인 맞춤 질문 생성용)
    const [activities, readings, grades] = await Promise.all([
      this.prisma.activity.findMany({
        where: { studentId },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.readingLog.findMany({
        where: { studentId },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.grade.findMany({
        where: { studentId },
        take: 10,
      }),
    ]);

    // 학교 유형별 공통 질문
    const commonQuestions = this.getCommonQuestions(school.type);

    // 학생 활동 기반 개인 맞춤 질문 생성
    const personalQuestions = await this.generatePersonalQuestions(
      activities,
      readings,
      grades,
      school.type,
    );

    // 면접 팁
    const tips = this.getInterviewTips(school.type);

    return {
      schoolName: school.name,
      schoolType: this.getSchoolTypeName(school.type),
      interviewType: this.getInterviewType(school.type),
      commonQuestions,
      personalQuestions,
      tips,
    };
  }

  // AI 모의 면접
  async conductMockInterview(
    studentId: string,
    schoolId: string,
    questionId: string,
    answer: string,
  ): Promise<{
    score: number;
    feedback: string;
    improvements: string[];
    modelAnswer: string;
  }> {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
    });

    const prompt = `
당신은 ${school?.name || '특목고'} 면접관입니다. 
학생의 답변을 평가해주세요.

[평가 기준]
1. 논리성 (답변의 구조와 일관성)
2. 진정성 (자신만의 경험과 생각)
3. 구체성 (구체적인 사례와 근거)
4. 학교 적합성 (지원 학교에 맞는 답변)

[학생 답변]
${answer}

[평가 형식]
- 점수: 100점 만점
- 피드백: 구체적인 강점과 약점
- 개선점: 3가지
- 모범 답변 예시
`;

    try {
      const aiResponse = await this.callAI(prompt);
      
      // AI 응답 파싱
      const score = this.extractScore(aiResponse);
      const feedback = this.extractFeedback(aiResponse);
      const improvements = this.extractImprovements(aiResponse);
      const modelAnswer = this.extractModelAnswer(aiResponse);

      return { score, feedback, improvements, modelAnswer };
    } catch (error) {
      return {
        score: 70,
        feedback: '답변이 접수되었습니다. AI 평가를 일시적으로 사용할 수 없습니다.',
        improvements: [
          '답변에 구체적인 사례를 추가하세요',
          '지원 동기와 연결지어 설명하세요',
          '결론을 명확하게 정리하세요',
        ],
        modelAnswer: '모범 답변 생성 중 오류가 발생했습니다.',
      };
    }
  }

  // 학교 유형별 공통 질문
  private getCommonQuestions(schoolType: string): InterviewQuestion[] {
    const commonBase: InterviewQuestion[] = [
      {
        id: 'common-1',
        category: '지원 동기',
        question: '우리 학교에 지원한 동기가 무엇인가요?',
        tips: [
          '학교의 특성과 자신의 목표를 연결하세요',
          '구체적인 프로그램이나 커리큘럼을 언급하세요',
          '진정성 있는 답변이 중요합니다',
        ],
      },
      {
        id: 'common-2',
        category: '자기소개',
        question: '1분 동안 자기소개를 해주세요',
        tips: [
          '이름, 학교, 특기/관심사 순으로 구성하세요',
          '지원 학교와 관련된 경험을 강조하세요',
          '시간을 지켜 연습하세요',
        ],
      },
      {
        id: 'common-3',
        category: '장래희망',
        question: '장래희망과 그 이유를 말해주세요',
        tips: [
          '구체적인 직업/분야를 말하세요',
          '그 꿈을 갖게 된 계기를 설명하세요',
          '이 학교가 어떻게 도움이 될지 연결하세요',
        ],
      },
    ];

    // 학교 유형별 추가 질문
    const typeSpecific: Record<string, InterviewQuestion[]> = {
      SPECIAL: [
        {
          id: 'special-1',
          category: '전문 분야',
          question: '가장 흥미로웠던 탐구 활동은 무엇인가요?',
          tips: ['과정과 결과를 논리적으로 설명하세요', '실패 경험도 좋은 소재입니다'],
        },
        {
          id: 'special-2',
          category: '관심사',
          question: '최근 관심 있는 분야의 이슈가 있나요?',
          tips: ['시사적인 뉴스를 준비하세요', '자신의 의견을 덧붙이세요'],
        },
      ],
      AUTONOMOUS: [
        {
          id: 'auto-1',
          category: '자기주도학습',
          question: '자기주도학습 경험을 말해주세요',
          tips: ['구체적인 계획과 실천 과정을 설명하세요', '결과보다 과정이 중요합니다'],
        },
        {
          id: 'auto-2',
          category: '학교 선택',
          question: '왜 자율형 사립고를 선택했나요?',
          tips: ['학교의 특색 프로그램을 언급하세요', '진로와 연결지으세요'],
        },
      ],
      SPECIALIZED: [
        {
          id: 'specialized-1',
          category: '전공',
          question: '이 분야를 선택한 이유가 무엇인가요?',
          tips: ['관심을 갖게 된 계기를 말하세요', '진로 계획과 연결하세요'],
        },
      ],
    };

    return [...commonBase, ...(typeSpecific[schoolType] || [])];
  }

  // 학생 활동 기반 개인 맞춤 질문 생성
  private async generatePersonalQuestions(
    activities: any[],
    readings: any[],
    grades: any[],
    schoolType: string,
  ): Promise<InterviewQuestion[]> {
    const questions: InterviewQuestion[] = [];

    // 동아리 활동 기반 질문
    const clubActivities = activities.filter((a) => a.type === 'CLUB');
    if (clubActivities.length > 0) {
      questions.push({
        id: 'personal-club',
        category: '동아리 활동',
        question: `${clubActivities[0].title}에서 활동하면서 가장 기억에 남는 경험은 무엇인가요?`,
        tips: [
          '구체적인 에피소드를 준비하세요',
          '배운 점과 성장한 점을 말하세요',
          '팀워크 경험을 강조하세요',
        ],
      });
    }

    // 독서 기반 질문
    if (readings.length > 0) {
      questions.push({
        id: 'personal-reading',
        category: '독서',
        question: `"${readings[0].bookTitle}"을 읽고 가장 인상 깊었던 부분은 무엇인가요?`,
        tips: [
          '책의 핵심 메시지를 파악하세요',
          '자신의 삶과 연결지어 설명하세요',
          '비판적 사고를 보여주세요',
        ],
      });
    }

    // 봉사활동 기반 질문
    const volunteerActivities = activities.filter((a) => a.type === 'VOLUNTEER');
    if (volunteerActivities.length > 0) {
      questions.push({
        id: 'personal-volunteer',
        category: '봉사활동',
        question: '봉사활동을 하면서 느낀 점이 있나요?',
        tips: [
          '봉사의 의미를 진지하게 생각해보세요',
          '앞으로의 계획도 말하세요',
        ],
      });
    }

    // 성적 기반 질문
    if (grades.length > 0) {
      const subjects = [...new Set(grades.map((g) => g.subject))];
      const strongSubject = subjects[0];
      questions.push({
        id: 'personal-study',
        category: '학습',
        question: `${strongSubject} 과목을 좋아하는 이유가 있나요?`,
        tips: [
          '관심을 갖게 된 계기를 말하세요',
          '학습 방법을 공유하세요',
        ],
      });
    }

    return questions;
  }

  // 면접 팁
  private getInterviewTips(schoolType: string): string[] {
    const commonTips = [
      '면접 전 학교 홈페이지와 입학 요강을 꼼꼼히 읽어보세요',
      '예상 질문에 대한 답변을 미리 준비하되, 암기하지는 마세요',
      '면접관의 눈을 보며 자신 있게 말하세요',
      '모르는 질문은 솔직하게 "잘 모르겠습니다"라고 답하세요',
      '복장은 단정하게, 너무 튀지 않게 준비하세요',
      '면접장에 10분 전에 도착하세요',
    ];

    const typeTips: Record<string, string[]> = {
      SCIENCE: [
        '과학 관련 시사 이슈를 준비하세요',
        '탐구 보고서나 실험 결과를 설명할 준비를 하세요',
      ],
      FOREIGN: [
        '영어 면접이 있을 수 있으니 준비하세요',
        '국제 이슈에 대한 의견을 정리하세요',
      ],
    };

    return [...commonTips, ...(typeTips[schoolType] || [])];
  }

  private getSchoolTypeName(type: string): string {
    const names: Record<string, string> = {
      SPECIAL: '특목고',
      AUTONOMOUS: '자사고',
      SPECIALIZED: '특성화고',
      GENERAL: '일반고',
    };
    return names[type] || '고등학교';
  }

  private getInterviewType(type: string): string {
    const types: Record<string, string> = {
      SPECIAL: '심층 면접',
      AUTONOMOUS: '인성 면접',
      SPECIALIZED: '전공 면접',
      GENERAL: '인성 면접',
    };
    return types[type] || '인성 면접';
  }

  // AI 응답 파싱 헬퍼
  private extractScore(response: string): number {
    const match = response.match(/점수[:\s]*(\d+)/);
    return match ? parseInt(match[1]) : 75;
  }

  private extractFeedback(response: string): string {
    const match = response.match(/피드백[:\s]*([^\n]+)/);
    return match ? match[1] : '전반적으로 좋은 답변입니다.';
  }

  private extractImprovements(response: string): string[] {
    const improvements: string[] = [];
    const lines = response.split('\n');
    let inSection = false;
    
    for (const line of lines) {
      if (line.includes('개선') || line.includes('보완')) {
        inSection = true;
        continue;
      }
      if (inSection && line.match(/^[-•*]\s*.+/)) {
        improvements.push(line.replace(/^[-•*]\s*/, ''));
      }
      if (improvements.length >= 3) break;
    }
    
    return improvements.length > 0 ? improvements : ['더 구체적인 사례를 추가하세요'];
  }

  private extractModelAnswer(response: string): string {
    const match = response.match(/모범\s*답변[:\s]*([^]*?)(?=\n\n|$)/);
    return match ? match[1].trim() : '';
  }
}

