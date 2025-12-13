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
        const news = await this.fetchNaverNews(keyword);
        allNews.push(...news);
      } catch (error) {
        this.logger.error(`Failed to fetch news for keyword: ${keyword}`, error);
      }
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

    this.cachedNews = uniqueNews.slice(0, 50); // 최대 50개
    this.lastFetchTime = Date.now();
    this.logger.log(`Fetched ${this.cachedNews.length} news articles`);
  }

  private async fetchNaverNews(keyword: string): Promise<NewsItem[]> {
    const news: NewsItem[] = [];
    
    try {
      // 네이버 뉴스 검색 페이지 크롤링
      const encodedKeyword = encodeURIComponent(keyword);
      const url = `https://search.naver.com/search.naver?where=news&query=${encodedKeyword}&sort=1`; // sort=1: 최신순

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);

      // 네이버 뉴스 검색 결과 파싱
      $('.news_area, .news_wrap').each((index, element) => {
        if (index >= 10) return; // 키워드당 최대 10개

        const $item = $(element);
        
        // 제목과 링크
        const $titleLink = $item.find('.news_tit, a.news_tit');
        const title = $titleLink.text().trim() || $titleLink.attr('title') || '';
        const link = $titleLink.attr('href') || '';

        // 요약
        const description = $item.find('.news_dsc, .dsc_txt').text().trim();

        // 출처
        const source = $item.find('.info_group a.info.press, .news_info .info.press').first().text().trim() 
                    || $item.find('.info_group .press').text().trim()
                    || '뉴스';

        // 날짜
        let publishedAt = '';
        const infoText = $item.find('.info_group span.info, .news_info span.info').text();
        if (infoText.includes('분 전') || infoText.includes('시간 전') || infoText.includes('일 전')) {
          publishedAt = this.parseRelativeTime(infoText);
        } else {
          publishedAt = new Date().toISOString();
        }

        // 이미지
        const imageUrl = $item.find('.dsc_thumb img, .news_thumb img').attr('src') || '';

        if (title && link) {
          news.push({
            id: `${keyword}-${index}-${Date.now()}`,
            title: this.cleanText(title),
            description: this.cleanText(description),
            link,
            source,
            publishedAt,
            imageUrl,
            keyword,
          });
        }
      });

      this.logger.log(`Fetched ${news.length} news for keyword: ${keyword}`);
    } catch (error) {
      this.logger.error(`Error fetching Naver news for ${keyword}:`, error.message);
    }

    return news;
  }

  private parseRelativeTime(text: string): string {
    const now = new Date();
    
    const minutesMatch = text.match(/(\d+)분 전/);
    if (minutesMatch) {
      now.setMinutes(now.getMinutes() - parseInt(minutesMatch[1]));
      return now.toISOString();
    }

    const hoursMatch = text.match(/(\d+)시간 전/);
    if (hoursMatch) {
      now.setHours(now.getHours() - parseInt(hoursMatch[1]));
      return now.toISOString();
    }

    const daysMatch = text.match(/(\d+)일 전/);
    if (daysMatch) {
      now.setDate(now.getDate() - parseInt(daysMatch[1]));
      return now.toISOString();
    }

    return now.toISOString();
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/<[^>]*>/g, '')
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

