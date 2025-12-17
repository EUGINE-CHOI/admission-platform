import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ActionPlanItem {
  week: number;
  title: string;
  description: string;
  category: 'study' | 'activity' | 'reading' | 'other';
  priority: 'high' | 'medium' | 'low';
}

export interface ConversionResult {
  success: boolean;
  tasksCreated: number;
  tasks: {
    id: string;
    title: string;
    dueDate: Date;
  }[];
}

@Injectable()
export class PlanToTaskService {
  constructor(private prisma: PrismaService) {}

  // AI 액션플랜을 Task로 변환
  async convertPlanToTasks(
    studentId: string,
    planItems: ActionPlanItem[],
    startDate?: Date,
  ): Promise<ConversionResult> {
    const start = startDate || new Date();
    const tasks: ConversionResult['tasks'] = [];

    // 새 액션 플랜 생성
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + 84); // 12주

    const actionPlan = await this.prisma.actionPlan.create({
      data: {
        studentId,
        title: 'AI 생성 액션 플랜',
        startDate: start,
        endDate,
        status: 'ACTIVE',
      },
    });

    for (const item of planItems) {
      // 주차별 마감일 계산 (각 주의 일요일)
      const dueDate = new Date(start);
      dueDate.setDate(dueDate.getDate() + (item.week * 7) - 1);

      const task = await this.prisma.weeklyTask.create({
        data: {
          planId: actionPlan.id,
          weekNumber: item.week,
          theme: item.category,
          title: `[AI] ${item.title}`,
          description: item.description,
          status: 'TODO',
          dueDate,
        },
      });

      tasks.push({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate!,
      });
    }

    return {
      success: true,
      tasksCreated: tasks.length,
      tasks,
    };
  }

  // AI 응답 파싱하여 Task로 변환
  async parseAndConvertAIPlan(
    studentId: string,
    aiResponse: string,
    startDate?: Date,
  ): Promise<ConversionResult> {
    const planItems = this.parseAIPlanResponse(aiResponse);
    return this.convertPlanToTasks(studentId, planItems, startDate);
  }

  // 저장된 AI 히스토리에서 플랜 변환
  async convertFromAIHistory(
    studentId: string,
    aiOutputId: string,
  ): Promise<ConversionResult> {
    const aiOutput = await this.prisma.aIOutput.findFirst({
      where: {
        id: aiOutputId,
        studentId,
        type: 'ACTION_PLAN',
      },
    });

    if (!aiOutput) {
      throw new NotFoundException('AI 출력을 찾을 수 없습니다');
    }

    return this.parseAndConvertAIPlan(studentId, aiOutput.response);
  }

  // 3개월 기본 플랜 템플릿
  getDefaultPlanTemplate(): ActionPlanItem[] {
    return [
      // 1개월차
      { week: 1, title: '목표 학교 분석', description: '목표 학교 3곳의 입시 요강 분석하기', category: 'study', priority: 'high' },
      { week: 2, title: '1학기 성적 복습', description: '1학기 취약 과목 복습 계획 세우기', category: 'study', priority: 'high' },
      { week: 3, title: '독서 활동 시작', description: '입시에 도움되는 도서 1권 선정 및 읽기', category: 'reading', priority: 'medium' },
      { week: 4, title: '동아리 활동 정리', description: '동아리 활동 내용 및 성과 정리하기', category: 'activity', priority: 'medium' },
      
      // 2개월차
      { week: 5, title: '모의고사 대비', description: '주요 과목 모의고사 풀이 및 오답 분석', category: 'study', priority: 'high' },
      { week: 6, title: '자기소개서 초안', description: '자기소개서 1차 초안 작성', category: 'other', priority: 'high' },
      { week: 7, title: '봉사활동 계획', description: '봉사활동 일정 계획 및 실행', category: 'activity', priority: 'medium' },
      { week: 8, title: '독서 독후감 작성', description: '읽은 도서 독후감 작성 및 정리', category: 'reading', priority: 'medium' },
      
      // 3개월차
      { week: 9, title: '면접 준비 시작', description: '예상 면접 질문 정리 및 답변 준비', category: 'other', priority: 'high' },
      { week: 10, title: '자기소개서 수정', description: '자기소개서 피드백 반영 및 수정', category: 'other', priority: 'high' },
      { week: 11, title: '최종 점검', description: '원서 제출 전 서류 최종 점검', category: 'other', priority: 'high' },
      { week: 12, title: '면접 모의 연습', description: '모의 면접 연습 및 피드백 반영', category: 'other', priority: 'high' },
    ];
  }

  // AI 응답 파싱
  private parseAIPlanResponse(response: string): ActionPlanItem[] {
    const items: ActionPlanItem[] = [];
    const lines = response.split('\n');
    
    let currentWeek = 1;
    
    for (const line of lines) {
      // "주차" 또는 "Week" 패턴 찾기
      const weekMatch = line.match(/(\d+)\s*(주차|주|week)/i);
      if (weekMatch) {
        currentWeek = parseInt(weekMatch[1]);
        continue;
      }

      // 할 일 항목 찾기 (-, *, 숫자. 등으로 시작)
      const taskMatch = line.match(/^[-*•]\s*(.+)|^\d+[.)]\s*(.+)/);
      if (taskMatch) {
        const title = (taskMatch[1] || taskMatch[2]).trim();
        if (title.length > 0 && title.length < 100) {
          items.push({
            week: currentWeek,
            title,
            description: '',
            category: this.detectCategory(title),
            priority: this.detectPriority(title, currentWeek),
          });
        }
      }
    }

    // 파싱 결과가 없으면 기본 템플릿 반환
    if (items.length === 0) {
      return this.getDefaultPlanTemplate();
    }

    return items;
  }

  private detectCategory(title: string): ActionPlanItem['category'] {
    const lower = title.toLowerCase();
    if (lower.includes('독서') || lower.includes('책') || lower.includes('읽')) return 'reading';
    if (lower.includes('동아리') || lower.includes('봉사') || lower.includes('활동')) return 'activity';
    if (lower.includes('공부') || lower.includes('복습') || lower.includes('학습') || lower.includes('성적')) return 'study';
    return 'other';
  }

  private detectPriority(title: string, week: number): ActionPlanItem['priority'] {
    const lower = title.toLowerCase();
    if (lower.includes('중요') || lower.includes('필수') || lower.includes('마감')) return 'high';
    if (week <= 2 || week >= 11) return 'high'; // 초반, 마감 직전
    return 'medium';
  }

  private mapCategoryToTheme(category: string): string {
    const mapping: Record<string, string> = {
      study: '학습',
      activity: '활동',
      reading: '독서',
      other: '기타',
    };
    return mapping[category] || '기타';
  }
}

