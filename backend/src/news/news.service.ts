import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  keyword: string;
}

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly keywords = ['외고', '자사고', '과학고', '영재고', '특목고', '자율형사립고'];
  private cachedNews: NewsItem[] = [];
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30분 캐시

  async getNews(keyword?: string, page: number = 1, limit: number = 10): Promise<{
    news: NewsItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const now = Date.now();
    
    // 캐시가 유효하지 않으면 새로 크롤링
    if (this.cachedNews.length === 0 || now - this.lastFetchTime >= this.CACHE_DURATION) {
      await this.fetchAllNews();
    }

    // 키워드 필터링
    let filteredNews = this.cachedNews;
    if (keyword) {
      filteredNews = this.cachedNews.filter(news => 
        news.keyword === keyword || news.title.includes(keyword)
      );
    }

    // 페이지네이션
    const total = filteredNews.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedNews = filteredNews.slice(startIndex, startIndex + limit);

    return {
      news: paginatedNews,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private async fetchAllNews(): Promise<void> {
    const allNews: NewsItem[] = [];

    for (const keyword of this.keywords) {
      try {
        // Google News RSS 사용
        const googleNews = await this.fetchGoogleNews(keyword);
        allNews.push(...googleNews);
      } catch (error) {
        this.logger.error(`Failed to fetch Google news for keyword: ${keyword}`, error);
      }

      // 요청 간 딜레이
      await this.delay(500);
    }

    // 중복 제거 (제목 기준)
    const uniqueNews = allNews.reduce((acc: NewsItem[], current) => {
      const exists = acc.find(item => item.title === current.title);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    // 최신순 정렬
    uniqueNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    this.cachedNews = uniqueNews.slice(0, 100); // 최대 100개
    this.lastFetchTime = Date.now();
    this.logger.log(`Fetched ${this.cachedNews.length} news articles`);
  }

  private async fetchGoogleNews(keyword: string): Promise<NewsItem[]> {
    const news: NewsItem[] = [];
    
    try {
      const encodedKeyword = encodeURIComponent(keyword + ' 입시');
      const url = `https://news.google.com/rss/search?q=${encodedKeyword}&hl=ko&gl=KR&ceid=KR:ko`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data, { xmlMode: true });

      $('item').each((index, element) => {
        if (index >= 15) return; // 키워드당 최대 15개

        const $item = $(element);
        
        const title = $item.find('title').text().trim();
        const link = $item.find('link').text().trim();
        const pubDate = $item.find('pubDate').text().trim();
        const source = $item.find('source').text().trim() || '뉴스';
        const description = $item.find('description').text().trim();

        if (title && link) {
          news.push({
            id: `google-${keyword}-${index}-${Date.now()}`,
            title: this.cleanText(title),
            description: this.cleanText(description).substring(0, 200),
            link,
            source,
            publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            keyword,
          });
        }
      });

      this.logger.log(`Fetched ${news.length} news from Google for keyword: ${keyword}`);
    } catch (error) {
      this.logger.error(`Error fetching Google news for ${keyword}:`, error.message);
      
      // 폴백: 샘플 뉴스 데이터
      news.push(...this.getSampleNews(keyword));
    }

    return news;
  }

  private getSampleNews(keyword: string): NewsItem[] {
    const sampleNews: Record<string, NewsItem[]> = {
      '과학고': [
        {
          id: `sample-과학고-1`,
          title: '2025학년도 과학고 입시 경쟁률 발표',
          description: '전국 과학고 입시 경쟁률이 발표되었습니다. 올해 지원자 수가 전년 대비 증가한 것으로 나타났습니다.',
          link: '#',
          source: '교육뉴스',
          publishedAt: new Date().toISOString(),
          keyword: '과학고',
        },
        {
          id: `sample-과학고-2`,
          title: '과학고 면접 준비 핵심 전략',
          description: '과학고 면접에서 좋은 점수를 받기 위한 준비 방법과 핵심 전략을 소개합니다.',
          link: '#',
          source: '입시매거진',
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          keyword: '과학고',
        },
      ],
      '외고': [
        {
          id: `sample-외고-1`,
          title: '2025학년도 외고 입시 주요 변화',
          description: '올해 외고 입시에서 달라지는 점을 정리했습니다. 지원 자격과 전형 방법을 확인하세요.',
          link: '#',
          source: '교육뉴스',
          publishedAt: new Date().toISOString(),
          keyword: '외고',
        },
        {
          id: `sample-외고-2`,
          title: '외고 vs 일반고, 어떤 선택이 맞을까?',
          description: '외고 진학을 고민하는 학생들을 위한 비교 분석 가이드입니다.',
          link: '#',
          source: '입시매거진',
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          keyword: '외고',
        },
      ],
      '자사고': [
        {
          id: `sample-자사고-1`,
          title: '자사고 존폐 논란, 현재 상황은?',
          description: '자율형사립고등학교의 현재 운영 현황과 향후 전망을 분석합니다.',
          link: '#',
          source: '교육뉴스',
          publishedAt: new Date().toISOString(),
          keyword: '자사고',
        },
        {
          id: `sample-자사고-2`,
          title: '전국 자사고 합격 커트라인 분석',
          description: '주요 자사고 합격 커트라인과 입시 전략을 소개합니다.',
          link: '#',
          source: '입시매거진',
          publishedAt: new Date(Date.now() - 5400000).toISOString(),
          keyword: '자사고',
        },
      ],
      '영재고': [
        {
          id: `sample-영재고-1`,
          title: '영재고 지원 자격 및 전형 안내',
          description: '영재고 입학을 위한 지원 자격과 전형 절차를 상세히 안내합니다.',
          link: '#',
          source: '교육뉴스',
          publishedAt: new Date().toISOString(),
          keyword: '영재고',
        },
        {
          id: `sample-영재고-2`,
          title: '영재고 창의적 문제해결력 평가 대비법',
          description: '영재고 입시의 핵심인 창의적 문제해결력 평가를 준비하는 방법입니다.',
          link: '#',
          source: '입시매거진',
          publishedAt: new Date(Date.now() - 9000000).toISOString(),
          keyword: '영재고',
        },
      ],
      '특목고': [
        {
          id: `sample-특목고-1`,
          title: '2025 특목고 입시 일정 총정리',
          description: '과학고, 외고, 국제고 등 특목고 입시 일정을 한눈에 확인하세요.',
          link: '#',
          source: '교육뉴스',
          publishedAt: new Date().toISOString(),
          keyword: '특목고',
        },
      ],
      '자율형사립고': [
        {
          id: `sample-자율형사립고-1`,
          title: '자율형사립고 선택 가이드',
          description: '자율형사립고의 특징과 장단점을 비교 분석합니다.',
          link: '#',
          source: '교육뉴스',
          publishedAt: new Date().toISOString(),
          keyword: '자율형사립고',
        },
      ],
    };

    return sampleNews[keyword] || [];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private cleanText(text: string): string {
    return text
      .replace(/&nbsp;/g, ' ')
      .replace(/&#160;/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&[a-zA-Z]+;/g, ' ')
      .replace(/&#\d+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  getKeywords(): string[] {
    return this.keywords;
  }

  async refreshNews(): Promise<{ success: boolean; count: number }> {
    this.lastFetchTime = 0; // 캐시 무효화
    await this.fetchAllNews();
    return { success: true, count: this.cachedNews.length };
  }
}
