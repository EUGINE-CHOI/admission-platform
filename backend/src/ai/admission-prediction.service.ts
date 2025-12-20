import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIOutputType } from '../../generated/prisma';

export interface PredictionResult {
  schoolId: string;
  schoolName: string;
  schoolType: string;
  predictionScore: number;  // 0-100
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  factors: {
    category: string;
    score: number;
    weight: number;
    comment: string;
  }[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  historicalComparison: {
    avgCutoff: number | null;
    yourAvg: number | null;
    gap: number | null;
    trend: 'ABOVE' | 'BELOW' | 'MATCH' | 'N/A';
  };
}

export interface SchoolRecommendation {
  schoolId: string;
  schoolName: string;
  schoolType: string;
  region: string;
  matchScore: number;
  reasons: string[];
  fitCategory: 'SAFE' | 'MATCH' | 'REACH';
}

export interface ComprehensiveAnalysis {
  overallReadiness: number;
  predictions: PredictionResult[];
  recommendations: SchoolRecommendation[];
  actionItems: string[];
  summary: string;
}

@Injectable()
export class AdmissionPredictionService {
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

  // 학생 데이터 수집
  private async getStudentData(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        grades: { where: { status: 'APPROVED' }, orderBy: [{ year: 'desc' }, { semester: 'desc' }] },
        activities: { where: { status: 'APPROVED' } },
        readingLogs: true,
        targetSchools: { include: { school: true } },
      },
    });

    if (!student) throw new NotFoundException('학생 정보를 찾을 수 없습니다.');

    // 평균 등급 계산
    const validGrades = student.grades.filter(g => g.rank !== null);
    const avgGrade = validGrades.length > 0
      ? validGrades.reduce((sum, g) => sum + (g.rank || 0), 0) / validGrades.length
      : null;

    // 주요 과목 평균 (국영수)
    const mainSubjects = ['국어', '영어', '수학'];
    const mainGrades = validGrades.filter(g => mainSubjects.some(s => g.subject.includes(s)));
    const mainAvg = mainGrades.length > 0
      ? mainGrades.reduce((sum, g) => sum + (g.rank || 0), 0) / mainGrades.length
      : null;

    return {
      student,
      avgGrade,
      mainAvg,
      activityCount: student.activities.length,
      readingCount: student.readingLogs.length,
      targetSchools: student.targetSchools,
    };
  }

  // 단일 학교 합격 예측
  async predictForSchool(studentId: string, schoolId: string): Promise<PredictionResult> {
    const { student, avgGrade, mainAvg, activityCount, readingCount } = await this.getStudentData(studentId);

    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        admissionHistories: { orderBy: { year: 'desc' }, take: 3 },
        admissions: { where: { publishStatus: 'PUBLISHED' }, orderBy: { year: 'desc' }, take: 1 },
      },
    });

    if (!school) throw new NotFoundException('학교 정보를 찾을 수 없습니다.');

    // 역대 합격선 평균
    const historyCutoffs = school.admissionHistories.filter(h => h.cutoffGrade !== null);
    const avgCutoff = historyCutoffs.length > 0
      ? historyCutoffs.reduce((sum, h) => sum + (h.cutoffGrade || 0), 0) / historyCutoffs.length
      : null;

    const studentInfo = `
학생 평균 등급: ${avgGrade?.toFixed(2) || '정보 없음'}
주요 과목(국영수) 평균: ${mainAvg?.toFixed(2) || '정보 없음'}
비교과 활동 수: ${activityCount}개
독서 기록 수: ${readingCount}권
    `;

    const schoolInfo = `
학교명: ${school.name}
학교 유형: ${school.type}
지역: ${school.region}
특징: ${school.features || '없음'}
최근 3년 평균 커트라인: ${avgCutoff?.toFixed(2) || '정보 없음'}
최근 경쟁률: ${school.admissionHistories[0]?.competitionRate || '정보 없음'}
    `;

    const systemPrompt = `당신은 대한민국 고등학교 입시 전문가입니다. 학생 데이터와 학교 정보를 분석하여 합격 가능성을 예측해주세요.

응답 형식 (JSON):
{
  "predictionScore": 0-100 점수,
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "factors": [
    {"category": "내신 성적", "score": 0-100, "weight": 가중치(0-1), "comment": "평가 코멘트"},
    {"category": "비교과 활동", "score": 0-100, "weight": 가중치(0-1), "comment": "평가 코멘트"},
    {"category": "학교 적합도", "score": 0-100, "weight": 가중치(0-1), "comment": "평가 코멘트"}
  ],
  "strengths": ["강점 1", "강점 2"],
  "weaknesses": ["약점 1", "약점 2"],
  "recommendations": ["추천 사항 1", "추천 사항 2"]
}`;

    const prompt = `## 학생 정보
${studentInfo}

## 지원 학교 정보
${schoolInfo}

위 정보를 바탕으로 합격 가능성을 예측해주세요.
JSON 형식으로만 응답하세요.`;

    const response = await this.callAI(prompt, systemPrompt);

    await this.saveAIOutput(studentId, AIOutputType.DIAGNOSIS, prompt, response, {
      schoolId,
      type: 'admission_prediction',
    });

    let result: any;
    try {
      result = JSON.parse(response);
    } catch {
      result = {
        predictionScore: 50,
        confidence: 'LOW',
        factors: [],
        strengths: [],
        weaknesses: [],
        recommendations: ['AI 응답 형식 오류'],
      };
    }

    // 역대 합격선과 비교
    let gap: number | null = null;
    let trend: 'ABOVE' | 'BELOW' | 'MATCH' | 'N/A' = 'N/A';

    if (avgCutoff !== null && avgGrade !== null) {
      gap = avgGrade - avgCutoff;
      if (gap < -0.5) trend = 'ABOVE';  // 등급이 낮을수록 좋음
      else if (gap > 0.5) trend = 'BELOW';
      else trend = 'MATCH';
    }

    return {
      schoolId: school.id,
      schoolName: school.name,
      schoolType: school.type,
      predictionScore: result.predictionScore,
      confidence: result.confidence,
      factors: result.factors,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      recommendations: result.recommendations,
      historicalComparison: {
        avgCutoff,
        yourAvg: avgGrade,
        gap,
        trend,
      },
    };
  }

  // 목표 학교들 일괄 예측
  async predictForTargetSchools(studentId: string): Promise<PredictionResult[]> {
    const { targetSchools } = await this.getStudentData(studentId);

    if (targetSchools.length === 0) {
      throw new NotFoundException('목표 학교가 설정되지 않았습니다.');
    }

    const predictions: PredictionResult[] = [];

    for (const target of targetSchools) {
      try {
        const prediction = await this.predictForSchool(studentId, target.schoolId);
        predictions.push(prediction);
      } catch (error) {
        console.error(`Prediction failed for school ${target.schoolId}:`, error);
      }
    }

    return predictions.sort((a, b) => b.predictionScore - a.predictionScore);
  }

  // AI 기반 학교 추천
  async recommendSchools(studentId: string, options?: { region?: string; type?: string; limit?: number }): Promise<SchoolRecommendation[]> {
    const { student, avgGrade, mainAvg, activityCount } = await this.getStudentData(studentId);

    const where: any = { publishStatus: 'PUBLISHED' };
    if (options?.region) where.region = options.region;
    if (options?.type) where.type = options.type;

    const schools = await this.prisma.school.findMany({
      where,
      include: {
        admissionHistories: { orderBy: { year: 'desc' }, take: 1 },
      },
      take: 50,
    });

    const studentInfo = `
학생 평균 등급: ${avgGrade?.toFixed(2) || '정보 없음'}
주요 과목 평균: ${mainAvg?.toFixed(2) || '정보 없음'}
활동 수: ${activityCount}개
    `;

    const schoolList = schools.map(s => ({
      id: s.id,
      name: s.name,
      type: s.type,
      region: s.region,
      cutoff: s.admissionHistories[0]?.cutoffGrade || null,
      competitionRate: s.admissionHistories[0]?.competitionRate || null,
    }));

    const systemPrompt = `당신은 고등학교 입시 전문가입니다. 학생 정보와 학교 목록을 분석하여 학생에게 적합한 학교를 추천해주세요.

응답 형식 (JSON):
{
  "recommendations": [
    {
      "schoolId": "학교 ID",
      "matchScore": 0-100,
      "reasons": ["추천 이유 1", "추천 이유 2"],
      "fitCategory": "SAFE" | "MATCH" | "REACH"
    }
  ]
}

fitCategory 기준:
- SAFE: 합격 가능성 높음 (안정권)
- MATCH: 적정 수준 (적정)
- REACH: 도전적 (상향)`;

    const prompt = `## 학생 정보
${studentInfo}

## 학교 목록 (최대 50개)
${JSON.stringify(schoolList, null, 2)}

학생에게 적합한 학교 ${options?.limit || 10}개를 추천해주세요.
안정권, 적정, 상향을 골고루 포함해주세요.
JSON 형식으로만 응답하세요.`;

    const response = await this.callAI(prompt, systemPrompt);

    await this.saveAIOutput(studentId, AIOutputType.DIAGNOSIS, prompt, response, {
      type: 'school_recommendation',
      options,
    });

    let result: any;
    try {
      result = JSON.parse(response);
    } catch {
      return [];
    }

    // 학교 정보 매핑
    return result.recommendations.map((rec: any) => {
      const school = schools.find(s => s.id === rec.schoolId);
      return {
        schoolId: rec.schoolId,
        schoolName: school?.name || 'Unknown',
        schoolType: school?.type || 'Unknown',
        region: school?.region || 'Unknown',
        matchScore: rec.matchScore,
        reasons: rec.reasons,
        fitCategory: rec.fitCategory,
      };
    }).slice(0, options?.limit || 10);
  }

  // 종합 분석
  async getComprehensiveAnalysis(studentId: string): Promise<ComprehensiveAnalysis> {
    const { student, avgGrade, activityCount, readingCount, targetSchools } = await this.getStudentData(studentId);

    // 목표 학교 예측
    const predictions = targetSchools.length > 0
      ? await this.predictForTargetSchools(studentId)
      : [];

    // 학교 추천
    const recommendations = await this.recommendSchools(studentId, { limit: 5 });

    // 종합 준비도 계산
    let readinessScore = 50; // 기본점
    if (avgGrade !== null) {
      if (avgGrade <= 2) readinessScore += 20;
      else if (avgGrade <= 3) readinessScore += 10;
      else if (avgGrade <= 4) readinessScore += 5;
    }
    if (activityCount >= 5) readinessScore += 15;
    else if (activityCount >= 3) readinessScore += 10;
    if (readingCount >= 10) readinessScore += 10;
    else if (readingCount >= 5) readinessScore += 5;

    readinessScore = Math.min(100, Math.max(0, readinessScore));

    // 실행 항목 생성
    const actionItems: string[] = [];
    if (avgGrade === null || avgGrade > 3) {
      actionItems.push('내신 성적 관리에 집중하세요');
    }
    if (activityCount < 3) {
      actionItems.push('비교과 활동을 더 추가하세요');
    }
    if (readingCount < 5) {
      actionItems.push('독서 활동을 늘려보세요');
    }
    if (targetSchools.length === 0) {
      actionItems.push('목표 학교를 설정해보세요');
    }
    if (actionItems.length === 0) {
      actionItems.push('현재 잘 준비하고 있습니다. 꾸준히 유지하세요!');
    }

    // 요약 생성
    const summary = `
현재 입시 준비도는 ${readinessScore}점입니다.
${avgGrade !== null ? `평균 등급 ${avgGrade.toFixed(1)}등급으로` : '성적 데이터가 부족하여'}
${predictions.length > 0 ? `목표 학교 ${predictions.length}곳 중 가장 높은 합격 예측은 ${predictions[0].schoolName}(${predictions[0].predictionScore}점)입니다.` : '목표 학교가 설정되지 않았습니다.'}
    `.trim();

    return {
      overallReadiness: readinessScore,
      predictions,
      recommendations,
      actionItems,
      summary,
    };
  }
}




