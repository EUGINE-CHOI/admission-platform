import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { AdmissionType, ScheduleType } from '@prisma/client';

export interface CrawledAdmission {
  schoolName: string;
  year: number;
  type: AdmissionType;
  name: string;
  quota?: number;
  requirements?: string;
  competitionRate?: number;
}

export interface CrawledSchedule {
  schoolName: string;
  year: number;
  type: ScheduleType;
  title: string;
  startDate: Date;
  endDate?: Date;
  note?: string;
}

@Injectable()
export class AdmissionCrawlerService {
  private readonly logger = new Logger(AdmissionCrawlerService.name);

  /**
   * 입시 전형 정보 크롤링
   */
  async crawl(source: string): Promise<CrawledAdmission[]> {
    switch (source) {
      case 'sample':
        return this.getSampleAdmissions();
      case 'hischool':
        return this.crawlHiSchoolAdmissions();
      default:
        this.logger.warn(`알 수 없는 소스: ${source}, 샘플 데이터 반환`);
        return this.getSampleAdmissions();
    }
  }

  /**
   * 입시 일정 크롤링
   */
  async crawlSchedules(source: string): Promise<CrawledSchedule[]> {
    switch (source) {
      case 'sample':
        return this.getSampleSchedules();
      case 'hischool':
        return this.crawlHiSchoolSchedules();
      default:
        return this.getSampleSchedules();
    }
  }

  /**
   * 샘플 입시 전형 데이터
   */
  private getSampleAdmissions(): CrawledAdmission[] {
    const currentYear = new Date().getFullYear() + 1;
    
    return [
      {
        schoolName: '하나고등학교',
        year: currentYear,
        type: AdmissionType.SPECIAL,
        name: '자기주도학습전형',
        quota: 180,
        requirements: '중학교 졸업(예정)자, 자기주도학습 역량 우수자',
        competitionRate: 3.5,
      },
      {
        schoolName: '용인외국어고등학교',
        year: currentYear,
        type: AdmissionType.GENERAL,
        name: '일반전형',
        quota: 240,
        requirements: '외국어 능력 및 국제적 역량을 갖춘 학생',
        competitionRate: 2.8,
      },
      {
        schoolName: '세종과학고등학교',
        year: currentYear,
        type: AdmissionType.TALENT,
        name: '과학영재전형',
        quota: 60,
        requirements: '수학, 과학 분야 영재성이 뛰어난 학생',
        competitionRate: 5.2,
      },
      {
        schoolName: '대원외국어고등학교',
        year: currentYear,
        type: AdmissionType.GENERAL,
        name: '일반전형',
        quota: 300,
        requirements: '외국어에 소질이 있고 국제적 역량을 기르고자 하는 학생',
        competitionRate: 2.5,
      },
      {
        schoolName: '민족사관고등학교',
        year: currentYear,
        type: AdmissionType.SPECIAL,
        name: '자기주도학습전형',
        quota: 160,
        requirements: '민족 정체성과 글로벌 역량을 갖춘 학생',
        competitionRate: 4.0,
      },
      {
        schoolName: '서울과학고등학교',
        year: currentYear,
        type: AdmissionType.TALENT,
        name: '영재학교전형',
        quota: 120,
        requirements: '수학, 과학 분야 영재성 및 창의적 문제해결력',
        competitionRate: 6.0,
      },
      {
        schoolName: '한국과학영재학교',
        year: currentYear,
        type: AdmissionType.TALENT,
        name: '영재학교전형',
        quota: 150,
        requirements: '과학기술 분야의 창의적 잠재력이 뛰어난 학생',
        competitionRate: 7.5,
      },
      {
        schoolName: '상산고등학교',
        year: currentYear,
        type: AdmissionType.SPECIAL,
        name: '자기주도학습전형',
        quota: 200,
        requirements: '학업 역량이 우수하고 자기주도적 학습능력을 갖춘 학생',
        competitionRate: 3.2,
      },
    ];
  }

  /**
   * 샘플 입시 일정 데이터
   */
  private getSampleSchedules(): CrawledSchedule[] {
    const currentYear = new Date().getFullYear();
    
    // 대부분의 특목고/자사고 일정 (10월~12월)
    const schools = [
      '하나고등학교',
      '용인외국어고등학교',
      '세종과학고등학교',
      '대원외국어고등학교',
      '민족사관고등학교',
      '서울과학고등학교',
      '한국과학영재학교',
      '상산고등학교',
    ];

    const schedules: CrawledSchedule[] = [];

    for (const schoolName of schools) {
      // 원서접수
      schedules.push({
        schoolName,
        year: currentYear + 1,
        type: ScheduleType.APPLICATION,
        title: `${currentYear + 1}학년도 원서접수`,
        startDate: new Date(currentYear, 9, 15), // 10월 15일
        endDate: new Date(currentYear, 9, 20),   // 10월 20일
        note: '온라인 원서접수 및 자기소개서 제출',
      });

      // 서류심사
      schedules.push({
        schoolName,
        year: currentYear + 1,
        type: ScheduleType.DOCUMENT,
        title: '1단계 서류심사',
        startDate: new Date(currentYear, 9, 25),
        endDate: new Date(currentYear, 10, 5),
        note: '자기소개서 및 학교생활기록부 평가',
      });

      // 면접
      schedules.push({
        schoolName,
        year: currentYear + 1,
        type: ScheduleType.INTERVIEW,
        title: '2단계 면접전형',
        startDate: new Date(currentYear, 10, 15),
        endDate: new Date(currentYear, 10, 20),
        note: '개별면접 또는 집단면접 실시',
      });

      // 합격자 발표
      schedules.push({
        schoolName,
        year: currentYear + 1,
        type: ScheduleType.ANNOUNCEMENT,
        title: '최종 합격자 발표',
        startDate: new Date(currentYear, 11, 5),
        note: '학교 홈페이지 및 개별 통보',
      });

      // 등록
      schedules.push({
        schoolName,
        year: currentYear + 1,
        type: ScheduleType.REGISTRATION,
        title: '합격자 등록',
        startDate: new Date(currentYear, 11, 10),
        endDate: new Date(currentYear, 11, 15),
        note: '등록금 납부 및 서류 제출',
      });
    }

    return schedules;
  }

  /**
   * 하이스쿨 입시전형 크롤링
   */
  private async crawlHiSchoolAdmissions(): Promise<CrawledAdmission[]> {
    const admissions: CrawledAdmission[] = [];
    let browser: puppeteer.Browser | null = null;

    try {
      this.logger.log('하이스쿨 입시전형 크롤링 시작...');

      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      
      await page.goto('https://hischool.go.kr', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      // 입시 전형 정보 파싱 (실제 HTML 구조에 맞게 수정 필요)
      // ...

      this.logger.log(`하이스쿨에서 ${admissions.length}개 전형 크롤링 완료`);
    } catch (error) {
      this.logger.error(`하이스쿨 입시전형 크롤링 실패: ${error.message}`);
      return this.getSampleAdmissions();
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    return admissions.length > 0 ? admissions : this.getSampleAdmissions();
  }

  /**
   * 하이스쿨 입시일정 크롤링
   */
  private async crawlHiSchoolSchedules(): Promise<CrawledSchedule[]> {
    const schedules: CrawledSchedule[] = [];
    let browser: puppeteer.Browser | null = null;

    try {
      this.logger.log('하이스쿨 입시일정 크롤링 시작...');

      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      
      await page.goto('https://hischool.go.kr', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      // 입시 일정 파싱 (실제 HTML 구조에 맞게 수정 필요)
      // ...

      this.logger.log(`하이스쿨에서 ${schedules.length}개 일정 크롤링 완료`);
    } catch (error) {
      this.logger.error(`하이스쿨 입시일정 크롤링 실패: ${error.message}`);
      return this.getSampleSchedules();
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    return schedules.length > 0 ? schedules : this.getSampleSchedules();
  }
}
