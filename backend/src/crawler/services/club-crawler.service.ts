import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { PrismaService } from '../../prisma/prisma.service';

export interface CrawledClub {
  schoolName: string;
  schoolId?: string;
  clubName: string;
  category?: string; // 학술, 예술, 체육, 봉사 등
  description?: string;
  memberCount?: number;
  advisor?: string;
  activities?: string[];
}

export interface ClubCrawlResult {
  success: boolean;
  schoolName: string;
  schoolUrl: string;
  clubsFound: number;
  clubs: CrawledClub[];
  error?: string;
}

// 동아리 카테고리 키워드
const CLUB_CATEGORIES: Record<string, string[]> = {
  '학술': ['과학', '수학', '영어', '토론', '독서', '역사', '경제', '프로그래밍', '코딩', '탐구', '발명'],
  '예술': ['미술', '음악', '합창', '밴드', '오케스트라', '연극', '댄스', '무용', '사진', '영상', '방송'],
  '체육': ['축구', '농구', '배구', '야구', '태권도', '수영', '배드민턴', '탁구', '육상', '체조'],
  '봉사': ['봉사', '환경', 'RCY', '적십자', '또래상담', '멘토링'],
  '진로': ['진로', '직업', '창업', '리더십', '학생회'],
  '문화': ['문화', '전통', '국악', '요리', '애니메이션', '만화', '게임'],
};

// 동아리 페이지 URL 패턴
const CLUB_URL_PATTERNS = [
  '/club',
  '/동아리',
  '/circle',
  '/activities',
  '/학교생활/동아리',
  '/menu/board',
  '/sub/club',
  '/contents/club',
  '/introduce/club',
  '/school/club',
];

// 동아리 관련 키워드
const CLUB_KEYWORDS = ['동아리', '클럽', '반', '부', '소모임', 'club', 'circle'];

@Injectable()
export class ClubCrawlerService {
  private readonly logger = new Logger(ClubCrawlerService.name);
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
          '--disable-gpu',
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
   * 단일 학교 동아리 크롤링
   */
  async crawlSchoolClubs(schoolId: string): Promise<ClubCrawlResult> {
    const school = await this.prisma.middleSchool.findUnique({
      where: { id: schoolId },
    });

    if (!school || !school.website) {
      return {
        success: false,
        schoolName: school?.name || 'Unknown',
        schoolUrl: '',
        clubsFound: 0,
        clubs: [],
        error: '학교 정보 또는 웹사이트 URL이 없습니다',
      };
    }

    return this.crawlClubsFromUrl(school.name, school.website, schoolId);
  }

  /**
   * URL에서 동아리 정보 크롤링
   */
  async crawlClubsFromUrl(
    schoolName: string,
    schoolUrl: string,
    schoolId?: string
  ): Promise<ClubCrawlResult> {
    this.logger.log(`동아리 크롤링 시작: ${schoolName} (${schoolUrl})`);

    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      page.setDefaultNavigationTimeout(30000);

      // 메인 페이지 로드
      await page.goto(schoolUrl, { waitUntil: 'networkidle2' });

      // 동아리 페이지 찾기
      const clubPageUrl = await this.findClubPage(page, schoolUrl);

      if (clubPageUrl) {
        this.logger.log(`동아리 페이지 발견: ${clubPageUrl}`);
        await page.goto(clubPageUrl, { waitUntil: 'networkidle2' });
      }

      // 페이지 내용 추출
      const content = await page.content();
      const $ = cheerio.load(content);

      // 동아리 정보 파싱
      const clubs = this.extractClubs($, content, schoolName, schoolId);

      this.logger.log(`${schoolName}: ${clubs.length}개 동아리 발견`);

      return {
        success: true,
        schoolName,
        schoolUrl: clubPageUrl || schoolUrl,
        clubsFound: clubs.length,
        clubs,
      };
    } catch (error: any) {
      this.logger.error(`크롤링 실패 (${schoolName}): ${error.message}`);
      return {
        success: false,
        schoolName,
        schoolUrl,
        clubsFound: 0,
        clubs: [],
        error: error.message,
      };
    } finally {
      await page.close();
    }
  }

  /**
   * 동아리 페이지 찾기
   */
  private async findClubPage(
    page: puppeteer.Page,
    baseUrl: string
  ): Promise<string | null> {
    try {
      // 페이지 내 링크 수집
      const links = await page.evaluate(() => {
        const anchors = document.querySelectorAll('a[href]');
        return Array.from(anchors).map((a) => ({
          href: a.getAttribute('href'),
          text: a.textContent?.trim() || '',
        }));
      });

      // 동아리 관련 링크 찾기
      for (const link of links) {
        const text = link.text.toLowerCase();
        const href = link.href || '';

        if (
          CLUB_KEYWORDS.some((kw) => text.includes(kw)) ||
          CLUB_URL_PATTERNS.some((pattern) => href.includes(pattern))
        ) {
          if (href.startsWith('/')) {
            const url = new URL(baseUrl);
            return `${url.protocol}//${url.host}${href}`;
          } else if (href.startsWith('http')) {
            return href;
          }
        }
      }

      // URL 패턴으로 직접 시도
      for (const pattern of CLUB_URL_PATTERNS) {
        const testUrl = baseUrl.replace(/\/$/, '') + pattern;
        try {
          const response = await page.goto(testUrl, {
            waitUntil: 'networkidle2',
            timeout: 10000,
          });
          if (response && response.status() === 200) {
            const content = await page.content();
            if (CLUB_KEYWORDS.some((kw) => content.includes(kw))) {
              return testUrl;
            }
          }
        } catch {
          // 해당 URL 없으면 무시
        }
      }

      return null;
    } catch (error) {
      this.logger.warn(`동아리 페이지 찾기 실패: ${error}`);
      return null;
    }
  }

  /**
   * 동아리 정보 추출
   */
  private extractClubs(
    $: any,
    content: string,
    schoolName: string,
    schoolId?: string
  ): CrawledClub[] {
    const clubs: CrawledClub[] = [];

    // 테이블에서 동아리 정보 추출
    $('table').each((_: number, table: any) => {
      const $table = $(table);
      const tableText = $table.text();

      if (!CLUB_KEYWORDS.some((kw) => tableText.includes(kw))) {
        return;
      }

      $table.find('tr').each((_: number, row: any) => {
        const $row = $(row);
        const cells = $row.find('td, th');

        if (cells.length >= 1) {
          const firstCell = $(cells[0]).text().trim();
          const secondCell = cells.length > 1 ? $(cells[1]).text().trim() : '';

          // 동아리 이름으로 보이는 경우
          if (this.looksLikeClubName(firstCell)) {
            const club: CrawledClub = {
              schoolName,
              schoolId,
              clubName: firstCell,
              category: this.detectCategory(firstCell + ' ' + secondCell),
              description: secondCell || undefined,
            };

            // 추가 정보 추출
            if (cells.length > 2) {
              club.advisor = $(cells[2]).text().trim() || undefined;
            }

            clubs.push(club);
          }
        }
      });
    });

    // 리스트에서 동아리 정보 추출
    $('ul, ol').each((_: number, list: any) => {
      const $list = $(list);
      const listText = $list.text();

      if (!CLUB_KEYWORDS.some((kw) => listText.includes(kw))) {
        return;
      }

      $list.find('li').each((_: number, item: any) => {
        const text = $(item).text().trim();
        
        if (this.looksLikeClubName(text)) {
          clubs.push({
            schoolName,
            schoolId,
            clubName: text.substring(0, 50),
            category: this.detectCategory(text),
          });
        }
      });
    });

    // div/section에서 동아리 정보 추출
    $('div, section, article').each((_: number, elem: any) => {
      const $elem = $(elem);
      const className = $elem.attr('class') || '';
      const id = $elem.attr('id') || '';

      if (
        className.toLowerCase().includes('club') ||
        id.toLowerCase().includes('club') ||
        className.includes('동아리') ||
        id.includes('동아리')
      ) {
        const heading = $elem.find('h1, h2, h3, h4, h5, strong, b').first().text().trim();
        const desc = $elem.find('p, span').first().text().trim();

        if (heading && this.looksLikeClubName(heading)) {
          clubs.push({
            schoolName,
            schoolId,
            clubName: heading,
            category: this.detectCategory(heading + ' ' + desc),
            description: desc || undefined,
          });
        }
      }
    });

    // 중복 제거
    const uniqueClubs = clubs.filter(
      (club, index, self) =>
        index === self.findIndex((c) => c.clubName === club.clubName)
    );

    return uniqueClubs;
  }

  /**
   * 동아리 이름처럼 보이는지 확인
   */
  private looksLikeClubName(text: string): boolean {
    if (!text || text.length < 2 || text.length > 50) return false;

    // 숫자로만 구성된 경우 제외
    if (/^\d+$/.test(text)) return false;

    // 날짜 형식 제외
    if (/\d{4}[.\-\/]\d{1,2}[.\-\/]\d{1,2}/.test(text)) return false;

    // 동아리 관련 접미사 확인
    const clubSuffixes = ['부', '반', '동아리', 'club', '팀', '단'];
    if (clubSuffixes.some((suffix) => text.toLowerCase().endsWith(suffix))) {
      return true;
    }

    // 카테고리 키워드 포함 확인
    for (const keywords of Object.values(CLUB_CATEGORIES)) {
      if (keywords.some((kw) => text.includes(kw))) {
        return true;
      }
    }

    return false;
  }

  /**
   * 카테고리 감지
   */
  private detectCategory(text: string): string {
    for (const [category, keywords] of Object.entries(CLUB_CATEGORIES)) {
      if (keywords.some((kw) => text.includes(kw))) {
        return category;
      }
    }
    return '기타';
  }

  /**
   * 여러 학교 동아리 크롤링
   */
  async crawlMultipleSchools(
    schoolIds: string[],
    options?: { delay?: number }
  ): Promise<ClubCrawlResult[]> {
    const results: ClubCrawlResult[] = [];
    const delay = options?.delay || 2000;

    for (const schoolId of schoolIds) {
      const result = await this.crawlSchoolClubs(schoolId);
      results.push(result);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    await this.closeBrowser();
    return results;
  }

  /**
   * 샘플 학교 동아리 크롤링 테스트
   */
  async testCrawlSampleSchools(): Promise<ClubCrawlResult[]> {
    // 샘플 학교 목록 (실제 중학교 웹사이트)
    const sampleSchools = [
      { name: '압구정중학교', url: 'https://apgujeong.sen.ms.kr' },
      { name: '역삼중학교', url: 'https://yeoksam.sen.ms.kr' },
      { name: '서초중학교', url: 'https://seocho.sen.ms.kr' },
      { name: '분당중학교', url: 'https://bundang.goe.ms.kr' },
      { name: '수지중학교', url: 'https://suji.goe.ms.kr' },
    ];

    const results: ClubCrawlResult[] = [];

    for (const school of sampleSchools) {
      this.logger.log(`샘플 크롤링: ${school.name}`);
      const result = await this.crawlClubsFromUrl(school.name, school.url);
      results.push(result);
      
      // 서버 부하 방지
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    await this.closeBrowser();

    // 결과 요약
    const totalClubs = results.reduce((sum, r) => sum + r.clubsFound, 0);
    const successCount = results.filter((r) => r.success).length;

    this.logger.log(`=== 샘플 크롤링 결과 ===`);
    this.logger.log(`총 학교: ${sampleSchools.length}`);
    this.logger.log(`성공: ${successCount}`);
    this.logger.log(`발견된 동아리: ${totalClubs}`);

    return results;
  }
}







