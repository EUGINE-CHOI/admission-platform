import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { PrismaService } from '../../prisma/prisma.service';
import { SchoolType, ScheduleType, PublishStatus } from '../../../generated/prisma';

export interface CrawledAdmissionInfo {
  schoolId: string;
  schoolName: string;
  year: number;
  admissionUrl?: string;
  schedules: {
    type: ScheduleType;
    title: string;
    startDate?: Date;
    endDate?: Date;
    note?: string;
  }[];
  requirements?: string[];
  documents?: string[];
  selectionCriteria?: {
    내신: number;
    면접: number;
    기타: number;
  };
  rawContent?: string;
}

// 학교별 입시 페이지 URL 패턴
const ADMISSION_URL_PATTERNS = [
  '/admission',
  '/입학안내',
  '/입시안내',
  '/입학정보',
  '/menu/boardList.do',
  '/menu/board',
  '/sub/admission',
  '/contents/admission',
];

// 입시 관련 키워드
const ADMISSION_KEYWORDS = [
  '입학', '전형', '모집', '원서', '신입생', '2025학년도', '2026학년도',
  '면접', '서류', '합격', '발표', '등록',
];

// 일정 타입 매핑
const SCHEDULE_TYPE_KEYWORDS: Record<ScheduleType, string[]> = {
  [ScheduleType.INFO_SESSION]: ['설명회', '입학설명회', '학교설명회', '오픈스쿨'],
  [ScheduleType.APPLICATION]: ['원서', '접수', '지원', '신청'],
  [ScheduleType.DOCUMENT]: ['서류', '제출', '우편'],
  [ScheduleType.DOCUMENT_SCREENING]: ['서류심사', '서류전형', '1단계'],
  [ScheduleType.EXAM]: ['시험', '평가', '검사', '고사', '2단계'],
  [ScheduleType.INTERVIEW]: ['면접', '인터뷰', '3단계'],
  [ScheduleType.ANNOUNCEMENT]: ['발표', '공지'],
  [ScheduleType.RESULT_ANNOUNCEMENT]: ['합격', '최종발표', '합격자발표'],
  [ScheduleType.REGISTRATION]: ['등록', '납부', '수납'],
};

@Injectable()
export class RealSchoolCrawlerService {
  private readonly logger = new Logger(RealSchoolCrawlerService.name);
  private browser: puppeteer.Browser | null = null;

  constructor(private prisma: PrismaService) {}

  /**
   * 브라우저 초기화
   */
  private async initBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
        ],
      });
    }
    return this.browser;
  }

  /**
   * 브라우저 종료
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * 단일 학교 입시 정보 크롤링
   */
  async crawlSchoolAdmission(schoolId: string): Promise<CrawledAdmissionInfo | null> {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school || !school.website) {
      this.logger.warn(`학교 정보 없음 또는 웹사이트 없음: ${schoolId}`);
      return null;
    }

    this.logger.log(`크롤링 시작: ${school.name} (${school.website})`);

    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      // User-Agent 설정
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // 타임아웃 설정
      page.setDefaultNavigationTimeout(30000);

      // 메인 페이지 로드
      await page.goto(school.website, {
        waitUntil: 'networkidle2',
      });

      // 입시 페이지 URL 찾기
      const admissionUrl = await this.findAdmissionPage(page, school.website);

      if (admissionUrl) {
        await page.goto(admissionUrl, {
          waitUntil: 'networkidle2',
        });
      }

      // 페이지 내용 추출
      const content = await page.content();
      const $ = cheerio.load(content);

      // 입시 정보 파싱
      const result: CrawledAdmissionInfo = {
        schoolId: school.id,
        schoolName: school.name,
        year: new Date().getFullYear() + 1, // 다음 학년도
        admissionUrl: admissionUrl || school.website,
        schedules: [],
        rawContent: this.extractTextContent($),
      };

      // 일정 정보 추출
      result.schedules = this.extractSchedules($, content);

      // 전형 요소 추출
      const criteria = this.extractSelectionCriteria($, content);
      if (criteria) {
        result.selectionCriteria = criteria;
      }

      // 제출 서류 추출
      result.documents = this.extractDocuments($, content);

      this.logger.log(`크롤링 완료: ${school.name} - ${result.schedules.length}개 일정 발견`);

      return result;
    } catch (error: any) {
      this.logger.error(`크롤링 실패 (${school.name}): ${error.message}`);
      return null;
    } finally {
      await page.close();
    }
  }

  /**
   * 입시 페이지 URL 찾기
   */
  private async findAdmissionPage(page: puppeteer.Page, baseUrl: string): Promise<string | null> {
    try {
      // 페이지 내 링크 수집
      const links = await page.evaluate(() => {
        const anchors = document.querySelectorAll('a[href]');
        return Array.from(anchors).map((a) => ({
          href: a.getAttribute('href'),
          text: a.textContent?.trim() || '',
        }));
      });

      // 입시 관련 링크 찾기
      for (const link of links) {
        const text = link.text.toLowerCase();
        const href = link.href || '';

        // 입학/입시 관련 텍스트 확인
        if (
          text.includes('입학') ||
          text.includes('입시') ||
          text.includes('전형') ||
          text.includes('모집')
        ) {
          // 상대 URL을 절대 URL로 변환
          if (href.startsWith('/')) {
            const url = new URL(baseUrl);
            return `${url.protocol}//${url.host}${href}`;
          } else if (href.startsWith('http')) {
            return href;
          }
        }
      }

      // URL 패턴으로 찾기
      for (const pattern of ADMISSION_URL_PATTERNS) {
        const testUrl = baseUrl.replace(/\/$/, '') + pattern;
        try {
          const response = await page.goto(testUrl, {
            waitUntil: 'networkidle2',
            timeout: 10000,
          });
          if (response && response.status() === 200) {
            const content = await page.content();
            if (ADMISSION_KEYWORDS.some((kw) => content.includes(kw))) {
              return testUrl;
            }
          }
        } catch {
          // 해당 URL이 없으면 무시
        }
      }

      return null;
    } catch (error) {
      this.logger.warn(`입시 페이지 찾기 실패: ${error}`);
      return null;
    }
  }

  /**
   * 텍스트 내용 추출
   */
  private extractTextContent($: any): string {
    // 불필요한 요소 제거
    $('script, style, nav, footer, header').remove();

    // 본문 텍스트 추출
    const text = $('body').text();
    return text.replace(/\s+/g, ' ').trim().substring(0, 5000);
  }

  /**
   * 일정 정보 추출
   */
  private extractSchedules(
    $: any,
    content: string
  ): CrawledAdmissionInfo['schedules'] {
    const schedules: CrawledAdmissionInfo['schedules'] = [];

    // 날짜 패턴 (YYYY.MM.DD, YYYY-MM-DD, YYYY년 MM월 DD일 등)
    const datePatterns = [
      /(\d{4})[.\-\/년]\s*(\d{1,2})[.\-\/월]\s*(\d{1,2})일?/g,
      /(\d{1,2})[.\-\/월]\s*(\d{1,2})일?/g,
    ];

    // 테이블에서 일정 추출
    $('table').each((_, table) => {
      const $table = $(table);
      const tableText = $table.text();

      // 입시 관련 테이블인지 확인
      if (!ADMISSION_KEYWORDS.some((kw) => tableText.includes(kw))) {
        return;
      }

      $table.find('tr').each((_, row) => {
        const $row = $(row);
        const cells = $row.find('td, th');

        if (cells.length >= 2) {
          const firstCell = $(cells[0]).text().trim();
          const secondCell = $(cells[1]).text().trim();

          // 일정 타입 확인
          const scheduleType = this.detectScheduleType(firstCell + ' ' + secondCell);

          if (scheduleType) {
            const dates = this.extractDates(secondCell);

            schedules.push({
              type: scheduleType,
              title: firstCell,
              startDate: dates.start,
              endDate: dates.end,
              note: secondCell,
            });
          }
        }
      });
    });

    // 리스트에서 일정 추출
    $('ul, ol').each((_, list) => {
      const $list = $(list);
      const listText = $list.text();

      if (!ADMISSION_KEYWORDS.some((kw) => listText.includes(kw))) {
        return;
      }

      $list.find('li').each((_, item) => {
        const text = $(item).text().trim();
        const scheduleType = this.detectScheduleType(text);

        if (scheduleType) {
          const dates = this.extractDates(text);

          schedules.push({
            type: scheduleType,
            title: text.substring(0, 50),
            startDate: dates.start,
            endDate: dates.end,
            note: text,
          });
        }
      });
    });

    // 중복 제거
    const uniqueSchedules = schedules.filter(
      (schedule, index, self) =>
        index ===
        self.findIndex(
          (s) => s.type === schedule.type && s.title === schedule.title
        )
    );

    return uniqueSchedules;
  }

  /**
   * 일정 타입 감지
   */
  private detectScheduleType(text: string): ScheduleType | null {
    for (const [type, keywords] of Object.entries(SCHEDULE_TYPE_KEYWORDS)) {
      if (keywords.some((kw) => text.includes(kw))) {
        return type as ScheduleType;
      }
    }
    return null;
  }

  /**
   * 날짜 추출
   */
  private extractDates(text: string): { start?: Date; end?: Date } {
    const currentYear = new Date().getFullYear();

    // YYYY.MM.DD ~ YYYY.MM.DD 또는 YYYY.MM.DD~YYYY.MM.DD
    const rangeMatch = text.match(
      /(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})\s*[~\-]\s*(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/
    );
    if (rangeMatch) {
      return {
        start: new Date(
          parseInt(rangeMatch[1]),
          parseInt(rangeMatch[2]) - 1,
          parseInt(rangeMatch[3])
        ),
        end: new Date(
          parseInt(rangeMatch[4]),
          parseInt(rangeMatch[5]) - 1,
          parseInt(rangeMatch[6])
        ),
      };
    }

    // MM.DD ~ MM.DD (같은 해)
    const shortRangeMatch = text.match(
      /(\d{1,2})[.\-\/](\d{1,2})\s*[~\-]\s*(\d{1,2})[.\-\/](\d{1,2})/
    );
    if (shortRangeMatch) {
      const year = text.includes('2025') ? 2025 : text.includes('2024') ? 2024 : currentYear;
      return {
        start: new Date(year, parseInt(shortRangeMatch[1]) - 1, parseInt(shortRangeMatch[2])),
        end: new Date(year, parseInt(shortRangeMatch[3]) - 1, parseInt(shortRangeMatch[4])),
      };
    }

    // YYYY.MM.DD 단일 날짜
    const singleMatch = text.match(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/);
    if (singleMatch) {
      return {
        start: new Date(
          parseInt(singleMatch[1]),
          parseInt(singleMatch[2]) - 1,
          parseInt(singleMatch[3])
        ),
      };
    }

    // MM.DD 단일 날짜
    const shortSingleMatch = text.match(/(\d{1,2})[.\-\/](\d{1,2})/);
    if (shortSingleMatch) {
      const year = text.includes('2025') ? 2025 : text.includes('2024') ? 2024 : currentYear;
      return {
        start: new Date(year, parseInt(shortSingleMatch[1]) - 1, parseInt(shortSingleMatch[2])),
      };
    }

    return {};
  }

  /**
   * 전형 요소 추출
   */
  private extractSelectionCriteria(
    $: any,
    content: string
  ): { 내신: number; 면접: number; 기타: number } | null {
    // 비율 패턴 (내신 60%, 면접 40% 등)
    const criteriaPattern = /(내신|성적|교과|학업)[^\d]*(\d+)%/gi;
    const interviewPattern = /(면접|구술)[^\d]*(\d+)%/gi;

    let 내신 = 0;
    let 면접 = 0;

    const criteriaMatch = content.match(criteriaPattern);
    if (criteriaMatch) {
      const numMatch = criteriaMatch[0].match(/(\d+)/);
      if (numMatch) {
        내신 = parseInt(numMatch[1]);
      }
    }

    const interviewMatch = content.match(interviewPattern);
    if (interviewMatch) {
      const numMatch = interviewMatch[0].match(/(\d+)/);
      if (numMatch) {
        면접 = parseInt(numMatch[1]);
      }
    }

    if (내신 > 0 || 면접 > 0) {
      return {
        내신,
        면접,
        기타: 100 - 내신 - 면접,
      };
    }

    return null;
  }

  /**
   * 제출 서류 추출
   */
  private extractDocuments($: any, content: string): string[] {
    const documents: string[] = [];

    const documentKeywords = [
      '자기소개서',
      '학교생활기록부',
      '생기부',
      '추천서',
      '성적증명서',
      '재학증명서',
      '학생부',
      '원서',
    ];

    for (const keyword of documentKeywords) {
      if (content.includes(keyword)) {
        documents.push(keyword);
      }
    }

    return [...new Set(documents)];
  }

  /**
   * 여러 학교 일괄 크롤링
   */
  async crawlMultipleSchools(
    schoolIds: string[],
    options?: { delay?: number }
  ): Promise<CrawledAdmissionInfo[]> {
    const results: CrawledAdmissionInfo[] = [];
    const delay = options?.delay || 2000; // 기본 2초 딜레이

    for (const schoolId of schoolIds) {
      const result = await this.crawlSchoolAdmission(schoolId);
      if (result) {
        results.push(result);
      }

      // 서버 부하 방지를 위한 딜레이
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    await this.closeBrowser();
    return results;
  }

  /**
   * 크롤링 결과를 DB에 저장
   */
  async saveToDatabase(data: CrawledAdmissionInfo): Promise<void> {
    // 일정 저장
    for (const schedule of data.schedules) {
      if (!schedule.startDate) continue;

      try {
        // 중복 체크
        const existing = await this.prisma.admissionSchedule.findFirst({
          where: {
            schoolId: data.schoolId,
            year: data.year,
            type: schedule.type,
            title: schedule.title,
          },
        });

        if (!existing) {
          await this.prisma.admissionSchedule.create({
            data: {
              schoolId: data.schoolId,
              year: data.year,
              type: schedule.type,
              title: schedule.title,
              startDate: schedule.startDate,
              endDate: schedule.endDate,
              note: schedule.note,
              publishStatus: PublishStatus.DRAFT, // 관리자 승인 필요
            },
          });
          this.logger.log(`일정 저장: ${data.schoolName} - ${schedule.title}`);
        }
      } catch (error: any) {
        this.logger.error(`일정 저장 실패: ${error.message}`);
      }
    }
  }

  /**
   * 특정 유형의 학교들 크롤링
   */
  async crawlBySchoolType(type: SchoolType): Promise<CrawledAdmissionInfo[]> {
    const schools = await this.prisma.school.findMany({
      where: {
        type,
        website: { not: null },
        publishStatus: PublishStatus.PUBLISHED,
      },
      select: { id: true },
    });

    this.logger.log(`${type} 유형 ${schools.length}개 학교 크롤링 시작`);

    return this.crawlMultipleSchools(schools.map((s) => s.id));
  }
}

