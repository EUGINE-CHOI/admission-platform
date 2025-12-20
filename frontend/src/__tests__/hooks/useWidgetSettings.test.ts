import { renderHook, act } from '@testing-library/react';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';

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

describe('useWidgetSettings 훅', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('기본 위젯 설정 반환 (student)', () => {
    const { result } = renderHook(() => useWidgetSettings('student'));
    
    expect(result.current.widgets).toBeDefined();
    expect(Array.isArray(result.current.widgets)).toBe(true);
    expect(result.current.widgets.length).toBeGreaterThan(0);
  });

  it('기본 위젯 설정 반환 (parent)', () => {
    const { result } = renderHook(() => useWidgetSettings('parent'));
    
    expect(result.current.widgets).toBeDefined();
    expect(Array.isArray(result.current.widgets)).toBe(true);
  });

  it('위젯 활성화/비활성화 토글', () => {
    const { result } = renderHook(() => useWidgetSettings('student'));
    
    const widgetId = result.current.widgets[0]?.id;
    if (!widgetId) return;

    const initialEnabled = result.current.widgets[0].enabled;
    
    act(() => {
      result.current.toggleWidget(widgetId);
    });
    
    expect(result.current.widgets[0].enabled).toBe(!initialEnabled);
  });

  it('위젯 순서 변경', () => {
    const { result } = renderHook(() => useWidgetSettings('student'));
    
    if (result.current.widgets.length < 2) return;

    const originalOrder = result.current.widgets.map(w => w.id);
    
    act(() => {
      result.current.reorderWidgets(0, 1);
    });
    
    const newOrder = result.current.widgets.map(w => w.id);
    expect(newOrder[0]).toBe(originalOrder[1]);
    expect(newOrder[1]).toBe(originalOrder[0]);
  });

  it('설정 초기화', () => {
    const { result } = renderHook(() => useWidgetSettings('student'));
    
    // 먼저 변경
    act(() => {
      if (result.current.widgets[0]) {
        result.current.toggleWidget(result.current.widgets[0].id);
      }
    });
    
    // 초기화 (resetToDefault 사용)
    act(() => {
      result.current.resetToDefault();
    });
    
    // 모든 위젯이 enabled이어야 함
    result.current.widgets.forEach(widget => {
      expect(widget.enabled).toBe(true);
    });
  });

  it('특정 위젯 활성화 상태 확인', () => {
    const { result } = renderHook(() => useWidgetSettings('student'));
    
    const firstWidgetId = result.current.widgets[0]?.id;
    if (!firstWidgetId) return;
    
    expect(result.current.isWidgetEnabled(firstWidgetId)).toBe(true);
    
    act(() => {
      result.current.toggleWidget(firstWidgetId);
    });
    
    expect(result.current.isWidgetEnabled(firstWidgetId)).toBe(false);
  });

  it('localStorage에 저장', () => {
    const { result } = renderHook(() => useWidgetSettings('student'));
    
    const widgetId = result.current.widgets[0]?.id;
    if (!widgetId) return;

    act(() => {
      result.current.toggleWidget(widgetId);
    });
    
    const saved = localStorageMock.getItem('widget_settings_student');
    expect(saved).not.toBeNull();
  });
});
