import {
  getApiUrl,
  getToken,
  setToken,
  clearToken,
  getErrorMessage,
} from '@/lib/api';

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('API 유틸리티', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getApiUrl', () => {
    it('API URL 반환', () => {
      const url = getApiUrl();
      expect(typeof url).toBe('string');
      expect(url).toContain('http');
    });
  });

  describe('토큰 관리', () => {
    it('setToken - 토큰 저장', () => {
      setToken('test-access-token', 'test-refresh-token');
      expect(getToken()).toBe('test-access-token');
    });

    it('getToken - 저장된 토큰 반환', () => {
      localStorageMock.setItem('accessToken', 'saved-token');
      expect(getToken()).toBe('saved-token');
    });

    it('getToken - 토큰 없으면 null', () => {
      expect(getToken()).toBeNull();
    });

    it('clearToken - 토큰 삭제', () => {
      setToken('token-to-delete', 'refresh-to-delete');
      clearToken();
      expect(getToken()).toBeNull();
    });
  });

  describe('getErrorMessage', () => {
    it('Error 객체에서 메시지 추출', () => {
      const error = new Error('테스트 에러');
      expect(getErrorMessage(error)).toBe('테스트 에러');
    });

    it('문자열 에러 처리', () => {
      expect(getErrorMessage('문자열 에러')).toBe('문자열 에러');
    });

    it('알 수 없는 에러 기본 메시지', () => {
      // 실제 구현에서 마침표가 포함될 수 있음
      expect(getErrorMessage(null)).toContain('알 수 없는 오류');
      expect(getErrorMessage(undefined)).toContain('알 수 없는 오류');
      expect(getErrorMessage(123)).toContain('알 수 없는 오류');
    });
  });
});
