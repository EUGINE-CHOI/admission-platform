import useSWR, { SWRConfiguration, mutate } from 'swr';
import { getApiUrl, getToken } from './api';

// 기본 fetcher
const fetcher = async (url: string) => {
  const token = getToken();
  const response = await fetch(`${getApiUrl()}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// 기본 SWR 설정
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,      // 탭 포커스 시 재요청 안함
  revalidateOnReconnect: true,   // 네트워크 재연결 시 재요청
  dedupingInterval: 5000,        // 5초 내 중복 요청 방지
  errorRetryCount: 3,            // 에러 시 3회 재시도
  errorRetryInterval: 1000,      // 재시도 간격 1초
};

/**
 * API 데이터 페칭 훅
 * 자동 캐싱, 재검증, 에러 처리 포함
 */
export function useApi<T>(
  endpoint: string | null,
  config?: SWRConfiguration
) {
  return useSWR<T>(
    endpoint,
    fetcher,
    { ...defaultConfig, ...config }
  );
}

/**
 * 학교 목록 조회 (30분 캐싱)
 */
export function useSchools(type?: string, region?: string) {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (region) params.set('region', region);
  
  const query = params.toString();
  const endpoint = `/schools${query ? `?${query}` : ''}`;
  
  return useApi<{ schools: any[] }>(endpoint, {
    revalidateOnFocus: false,
    dedupingInterval: 30 * 60 * 1000, // 30분
  });
}

/**
 * 뱃지 목록 조회 (1시간 캐싱)
 */
export function useBadges() {
  return useApi<{ badges: any[] }>('/badges', {
    revalidateOnFocus: false,
    dedupingInterval: 60 * 60 * 1000, // 1시간
  });
}

/**
 * 내 뱃지 조회 (5분 캐싱)
 */
export function useMyBadges() {
  return useApi<{ badges: any[] }>('/badges/my', {
    dedupingInterval: 5 * 60 * 1000, // 5분
  });
}

/**
 * 뉴스 조회 (10분 캐싱)
 */
export function useNews(keyword?: string, page: number = 1) {
  const params = new URLSearchParams();
  if (keyword) params.set('keyword', keyword);
  params.set('page', page.toString());
  
  return useApi<{ news: any[]; total: number; totalPages: number }>(
    `/news?${params.toString()}`,
    { dedupingInterval: 10 * 60 * 1000 } // 10분
  );
}

/**
 * 알림 조회 (1분 캐싱 - 더 자주 갱신)
 */
export function useNotifications() {
  return useApi<{ notifications: any[] }>('/notifications', {
    dedupingInterval: 60 * 1000, // 1분
    revalidateOnFocus: true,     // 탭 포커스 시 재요청
  });
}

/**
 * 대시보드 데이터 (3분 캐싱)
 */
export function useDashboard(role: string) {
  return useApi<any>(`/dashboard/${role.toLowerCase()}`, {
    dedupingInterval: 3 * 60 * 1000, // 3분
  });
}

/**
 * 캐시 무효화 (데이터 변경 후 호출)
 */
export const invalidateCache = {
  schools: () => mutate((key: string) => key?.startsWith('/schools')),
  badges: () => mutate((key: string) => key?.startsWith('/badges')),
  news: () => mutate((key: string) => key?.startsWith('/news')),
  notifications: () => mutate('/notifications'),
  dashboard: (role: string) => mutate(`/dashboard/${role.toLowerCase()}`),
  all: () => mutate(() => true),
};

export { mutate };

