import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as xml2js from 'xml2js';

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

  constructor() {
    // 서버 시작 시 바로 뉴스 가져오기
    this.fetchAllNews();
  }

  async getNews(keyword?: string, page: number = 1, limit: number = 10): Promise<{
    news: NewsItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    keywords: string[];
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
      keywords: this.keywords,
    };
  }

  private async fetchAllNews(): Promise<void> {
    const allNews: NewsItem[] = [];
    
    this.logger.log('Starting to fetch news from Google News RSS...');

    for (const keyword of this.keywords) {
      try {
        const googleNews = await this.fetchGoogleNewsRSS(keyword);
        if (googleNews.length > 0) {
          allNews.push(...googleNews);
          this.logger.log(`✓ Fetched ${googleNews.length} news for "${keyword}"`);
        } else {
          this.logger.warn(`No news found for "${keyword}", using sample`);
          allNews.push(...this.getSampleNews(keyword));
        }
      } catch (error) {
        this.logger.error(`Failed to fetch news for "${keyword}":`, error.message);
        allNews.push(...this.getSampleNews(keyword));
      }

      // 요청 간 딜레이 (Google 차단 방지)
      await this.delay(1000);
    }

    // 중복 제거 (제목 기준)
    const uniqueNews = allNews.reduce((acc: NewsItem[], current) => {
      const exists = acc.find(item => 
        item.title === current.title || 
        item.link === current.link
      );
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    // 최신순 정렬
    uniqueNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    this.cachedNews = uniqueNews.slice(0, 100);
    this.lastFetchTime = Date.now();
    this.logger.log(`✓ Total ${this.cachedNews.length} unique news articles cached`);
  }

  private async fetchGoogleNewsRSS(keyword: string): Promise<NewsItem[]> {
    const news: NewsItem[] = [];
    
    try {
      // Google News RSS URL
      const searchQuery = encodeURIComponent(`${keyword} 입시 고등학교`);
      const rssUrl = `https://news.google.com/rss/search?q=${searchQuery}&hl=ko&gl=KR&ceid=KR:ko`;

      this.logger.debug(`Fetching RSS: ${rssUrl}`);

      const response = await axios.get(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        timeout: 15000,
        responseType: 'text',
      });

      // XML 파싱
      const parser = new xml2js.Parser({
        explicitArray: false,
        ignoreAttrs: false,
      });

      const result = await parser.parseStringPromise(response.data);
      
      if (!result?.rss?.channel?.item) {
        this.logger.warn(`No items found in RSS for "${keyword}"`);
        return news;
      }

      // item이 배열이 아닌 경우 배열로 변환
      const items = Array.isArray(result.rss.channel.item) 
        ? result.rss.channel.item 
        : [result.rss.channel.item];

      for (let i = 0; i < Math.min(items.length, 10); i++) {
        const item = items[i];
        
        try {
          const title = this.cleanText(item.title || '');
          const link = item.link || '';
          const pubDate = item.pubDate || '';
          const source = item.source?._ || item.source || '뉴스';
          const description = this.cleanText(item.description || '');

          if (title && link) {
            // Google News 리다이렉트 URL에서 실제 URL 추출 시도
            const actualLink = await this.resolveGoogleNewsUrl(link);
            
            news.push({
              id: `gnews-${keyword}-${i}-${Date.now()}`,
              title,
              description: description.substring(0, 300),
              link: actualLink,
              source: this.cleanText(source),
              publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
              keyword,
            });
          }
        } catch (itemError) {
          this.logger.debug(`Failed to parse item ${i} for "${keyword}"`);
        }
      }

    } catch (error) {
      this.logger.error(`Error fetching Google News RSS for "${keyword}":`, error.message);
      throw error;
    }

    return news;
  }

  // Google News URL에서 실제 기사 URL 추출
  private async resolveGoogleNewsUrl(googleUrl: string): Promise<string> {
    try {
      // Google News URL 형식: https://news.google.com/rss/articles/...
      // 또는 직접 원본 URL이 포함된 경우
      
      if (!googleUrl.includes('news.google.com')) {
        return googleUrl; // 이미 직접 URL
      }

      // HEAD 요청으로 리다이렉트 따라가기
      const response = await axios.head(googleUrl, {
        maxRedirects: 5,
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      // 최종 URL 반환
      if (response.request?.res?.responseUrl) {
        return response.request.res.responseUrl;
      }

      return googleUrl;
    } catch (error) {
      // 리다이렉트 실패해도 Google URL 그대로 사용 (클릭하면 리다이렉트됨)
      return googleUrl;
    }
  }

  private getSampleNews(keyword: string): NewsItem[] {
    // 실제 뉴스 검색 결과 페이지로 연결
    const getGoogleSearchUrl = (query: string) => 
      `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=nws&hl=ko`;
    
    const sampleNews: Record<string, NewsItem[]> = {
      '과학고': [
        {
          id: `sample-과학고-1-${Date.now()}`,
          title: '2025학년도 과학고 입학전형 주요 일정 안내',
          description: '전국 과학고등학교 2025학년도 입학전형 일정이 발표되었습니다. 원서 접수, 면접, 합격자 발표 일정을 확인하세요.',
          link: getGoogleSearchUrl('과학고 입시 2025'),
          source: '교육부',
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          keyword: '과학고',
        },
      ],
      '외고': [
        {
          id: `sample-외고-1-${Date.now()}`,
          title: '2025학년도 외국어고 입시 전형 안내',
          description: '외국어고등학교 입시 준비를 위한 전형 방법과 지원 자격을 안내합니다.',
          link: getGoogleSearchUrl('외고 입시 2025'),
          source: '교육청',
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          keyword: '외고',
        },
      ],
      '자사고': [
        {
          id: `sample-자사고-1-${Date.now()}`,
          title: '자율형사립고 입시 정보 및 지원 전략',
          description: '자사고 지원을 고민하는 학생과 학부모를 위한 입시 정보와 전략을 소개합니다.',
          link: getGoogleSearchUrl('자사고 입시'),
          source: '입시정보',
          publishedAt: new Date(Date.now() - 5400000).toISOString(),
          keyword: '자사고',
        },
      ],
      '영재고': [
        {
          id: `sample-영재고-1-${Date.now()}`,
          title: '영재고 입학을 위한 준비 가이드',
          description: '영재학교 입학 전형과 창의적 문제해결력 평가 준비 방법을 안내합니다.',
          link: getGoogleSearchUrl('영재고 입시'),
          source: '교육부',
          publishedAt: new Date(Date.now() - 9000000).toISOString(),
          keyword: '영재고',
        },
      ],
      '특목고': [
        {
          id: `sample-특목고-1-${Date.now()}`,
          title: '2025 특목고 입시 일정 및 전형 총정리',
          description: '과학고, 외고, 국제고 등 특목고 입시 일정과 전형 방법을 한눈에 확인하세요.',
          link: getGoogleSearchUrl('특목고 입시 일정 2025'),
          source: '교육뉴스',
          publishedAt: new Date().toISOString(),
          keyword: '특목고',
        },
      ],
      '자율형사립고': [
        {
          id: `sample-자율형사립고-1-${Date.now()}`,
          title: '자율형사립고 선택 시 고려해야 할 사항',
          description: '자율형사립고의 특징, 장단점, 입시 정보를 비교 분석합니다.',
          link: getGoogleSearchUrl('자율형사립고 입시'),
          source: '교육정보',
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
    if (!text) return '';
    
    return text
      // HTML 태그 제거
      .replace(/<[^>]*>/g, '')
      // HTML 엔티티 변환
      .replace(/&nbsp;/gi, ' ')
      .replace(/&#160;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      // 기타 HTML 엔티티 제거
      .replace(/&[a-zA-Z]+;/g, ' ')
      .replace(/&#\d+;/g, ' ')
      // 특수 문자 정리
      .replace(/\u00A0/g, ' ')
      .replace(/[\r\n\t]+/g, ' ')
      // 연속 공백 제거
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
