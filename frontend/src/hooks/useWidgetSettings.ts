'use client';

import { useState, useEffect } from 'react';

export interface WidgetConfig {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

const DEFAULT_STUDENT_WIDGETS: WidgetConfig[] = [
  { id: 'stats', name: '통계 카드', enabled: true, order: 0 },
  { id: 'tasks', name: '오늘 할 일', enabled: true, order: 1 },
  { id: 'schedules', name: '다가오는 일정', enabled: true, order: 2 },
  { id: 'progress', name: '학습 진행률', enabled: true, order: 3 },
  { id: 'activities', name: '최근 활동', enabled: true, order: 4 },
  { id: 'badges', name: '최근 획득 뱃지', enabled: true, order: 5 },
  { id: 'targets', name: '목표 학교', enabled: true, order: 6 },
];

const DEFAULT_PARENT_WIDGETS: WidgetConfig[] = [
  { id: 'children', name: '자녀 현황', enabled: true, order: 0 },
  { id: 'schedules', name: '다가오는 일정', enabled: true, order: 1 },
  { id: 'dday', name: 'D-Day', enabled: true, order: 2 },
  { id: 'news', name: '최신 뉴스', enabled: true, order: 3 },
];

const STORAGE_KEY_PREFIX = 'widget_settings_';

export function useWidgetSettings(role: 'student' | 'parent' | 'consultant' | 'admin') {
  const storageKey = `${STORAGE_KEY_PREFIX}${role}`;
  
  const getDefaultWidgets = () => {
    switch (role) {
      case 'student':
        return DEFAULT_STUDENT_WIDGETS;
      case 'parent':
        return DEFAULT_PARENT_WIDGETS;
      default:
        return [];
    }
  };

  const [widgets, setWidgets] = useState<WidgetConfig[]>(getDefaultWidgets());
  const [isLoaded, setIsLoaded] = useState(false);

  // localStorage에서 설정 불러오기
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 기본 위젯과 병합 (새로 추가된 위젯 포함)
        const defaultWidgets = getDefaultWidgets();
        const merged = defaultWidgets.map(defaultWidget => {
          const savedWidget = parsed.find((w: WidgetConfig) => w.id === defaultWidget.id);
          return savedWidget || defaultWidget;
        });
        setWidgets(merged);
      } catch {
        setWidgets(getDefaultWidgets());
      }
    }
    setIsLoaded(true);
  }, [role, storageKey]);

  // 설정 저장
  const saveWidgets = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(newWidgets));
    }
  };

  // 위젯 활성화/비활성화 토글
  const toggleWidget = (widgetId: string) => {
    const newWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    saveWidgets(newWidgets);
  };

  // 위젯 순서 변경
  const reorderWidgets = (fromIndex: number, toIndex: number) => {
    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(fromIndex, 1);
    newWidgets.splice(toIndex, 0, removed);
    
    // order 재정렬
    const reordered = newWidgets.map((w, index) => ({ ...w, order: index }));
    saveWidgets(reordered);
  };

  // 기본값으로 리셋
  const resetToDefault = () => {
    const defaultWidgets = getDefaultWidgets();
    saveWidgets(defaultWidgets);
  };

  // 활성화된 위젯만 반환 (순서대로)
  const enabledWidgets = widgets
    .filter(w => w.enabled)
    .sort((a, b) => a.order - b.order);

  // 특정 위젯이 활성화되어 있는지 확인
  const isWidgetEnabled = (widgetId: string) => {
    return widgets.find(w => w.id === widgetId)?.enabled ?? false;
  };

  return {
    widgets,
    enabledWidgets,
    isLoaded,
    toggleWidget,
    reorderWidgets,
    resetToDefault,
    isWidgetEnabled,
  };
}

