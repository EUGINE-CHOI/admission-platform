import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  data: T;
  expireAt: number;
}

/**
 * 메모리 기반 TTL 캐시 서비스
 * - Redis 없이도 간단한 캐싱 가능
 * - 서버 재시작 시 캐시 초기화
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5분 기본 TTL

  /**
   * 캐시에서 값 조회
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // 만료 확인
    if (Date.now() > entry.expireAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * 캐시에 값 저장
   * @param key 캐시 키
   * @param data 저장할 데이터
   * @param ttl TTL (밀리초, 기본 5분)
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      expireAt: Date.now() + ttl,
    });
  }

  /**
   * 캐시 키 삭제
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 패턴에 맞는 캐시 키 모두 삭제
   * @param pattern 키 패턴 (정규식)
   */
  deleteByPattern(pattern: RegExp): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * 전체 캐시 초기화
   */
  clear(): void {
    this.cache.clear();
    this.logger.log('Cache cleared');
  }

  /**
   * 캐시 통계
   */
  getStats(): { size: number; keys: string[] } {
    // 만료된 항목 정리
    this.cleanup();
    
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * 만료된 캐시 정리
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expireAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 캐시-어사이드 패턴 헬퍼
   * 캐시에 있으면 반환, 없으면 fetcher 실행 후 캐시 저장
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }
}

// 캐시 키 상수
export const CACHE_KEYS = {
  SCHOOLS_ALL: 'schools:all',
  SCHOOLS_BY_TYPE: (type: string) => `schools:type:${type}`,
  SCHOOLS_BY_REGION: (region: string) => `schools:region:${region}`,
  BADGES_ALL: 'badges:all',
  PLANS_ALL: 'plans:all',
  MIDDLE_SCHOOLS: (region: string) => `middle-schools:${region}`,
  ADMISSION_SCHEDULES: (year: number) => `schedules:${year}`,
} as const;

// TTL 상수 (밀리초)
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000,      // 1분
  MEDIUM: 5 * 60 * 1000,     // 5분
  LONG: 30 * 60 * 1000,      // 30분
  VERY_LONG: 60 * 60 * 1000, // 1시간
} as const;



