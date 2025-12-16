/**
 * API Configuration
 * 
 * 동적으로 API URL을 결정합니다.
 * - 모바일에서 IP로 접속 시 자동으로 같은 IP의 백엔드 사용
 * - localhost 접속 시 localhost 백엔드 사용
 */

// 매번 호출 시 현재 hostname 기반으로 API URL 반환
export function getApiUrl(): string {
  // 브라우저에서 실행 중인 경우
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // localhost가 아닌 경우 (모바일 등에서 IP로 접속)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:3000`;
    }
  }
  
  // 기본값: localhost
  return 'http://localhost:3000';
}

// getter를 사용하여 매번 동적으로 URL 계산
export const API_URL = typeof window !== 'undefined' 
  ? getApiUrl() 
  : 'http://localhost:3000';

/**
 * API 요청 헬퍼 함수
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('accessToken') 
    : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * GET 요청
 */
export function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * POST 요청
 */
export function apiPost<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCH 요청
 */
export function apiPatch<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE 요청
 */
export function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

