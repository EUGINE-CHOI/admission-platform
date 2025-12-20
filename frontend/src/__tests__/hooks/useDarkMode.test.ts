import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from '@/hooks/useDarkMode';

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

// matchMedia 모킹
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('useDarkMode 훅', () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.classList.remove('dark');
  });

  it('기본 테마는 system', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.theme).toBe('system');
  });

  it('isDark 초기값은 false (시스템이 라이트 모드일 때)', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDark).toBe(false);
  });

  it('다크 모드 토글', () => {
    const { result } = renderHook(() => useDarkMode());
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    // 토글하면 dark로 변경
    expect(result.current.isDark).toBe(true);
  });

  it('테마 설정', () => {
    const { result } = renderHook(() => useDarkMode());
    
    act(() => {
      result.current.setTheme('dark');
    });
    
    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
    
    act(() => {
      result.current.setTheme('light');
    });
    
    expect(result.current.theme).toBe('light');
    expect(result.current.isDark).toBe(false);
  });

  it('localStorage에 설정 저장', () => {
    const { result } = renderHook(() => useDarkMode());
    
    act(() => {
      result.current.setTheme('dark');
    });
    
    const saved = localStorageMock.getItem('theme');
    expect(saved).toBe('dark');
  });
});
