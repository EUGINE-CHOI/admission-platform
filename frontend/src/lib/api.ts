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
 * 토큰 키 상수 (통일된 키 사용)
 */
export const TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * 토큰 조회 함수
 * - 통일된 방식으로 토큰 조회
 * - fallback으로 'token' 키도 확인 (하위 호환성)
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
}

/**
 * 토큰 저장 함수
 */
export function setToken(accessToken: string, refreshToken?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem('token', accessToken); // 하위 호환성
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

/**
 * 토큰 삭제 함수 (로그아웃 시)
 */
export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * API 요청 헬퍼 함수
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getToken();

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

/**
 * API 에러 타입
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

/**
 * 에러 메시지 추출
 * - Error 객체에서 사용자 친화적 메시지 추출
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // 네트워크 에러
    if (error.message === 'Failed to fetch') {
      return '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.';
    }
    // 인증 에러
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return '인증이 만료되었습니다. 다시 로그인해주세요.';
    }
    // 권한 에러
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return '접근 권한이 없습니다.';
    }
    // 404 에러
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return '요청한 정보를 찾을 수 없습니다.';
    }
    // 서버 에러
    if (error.message.includes('500') || error.message.includes('Internal Server')) {
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 에러 로깅 및 메시지 반환
 * - 개발 환경에서는 콘솔에 에러 출력
 * - 사용자 친화적 메시지 반환
 */
export function handleApiError(error: unknown, context?: string): string {
  const message = getErrorMessage(error);
  
  // 개발 환경에서만 콘솔 로깅
  if (process.env.NODE_ENV === 'development') {
    console.error(`[API Error${context ? ` - ${context}` : ''}]:`, error);
  }
  
  return message;
}

