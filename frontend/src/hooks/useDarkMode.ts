'use client';

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 시스템 다크 모드 감지
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 저장된 테마 불러오기
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // 시스템 다크 모드 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        setIsDark(mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    setIsLoaded(true);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // 테마 변경 시 적용
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    let shouldBeDark: boolean;
    if (theme === 'system') {
      shouldBeDark = mediaQuery.matches;
    } else {
      shouldBeDark = theme === 'dark';
    }

    setIsDark(shouldBeDark);

    // HTML 클래스 업데이트
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // 테마 변경 함수
  const setThemeAndSave = (newTheme: Theme) => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  // 토글 함수 (라이트 <-> 다크)
  const toggleDarkMode = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setThemeAndSave(newTheme);
  };

  return {
    theme,
    isDark,
    isLoaded,
    setTheme: setThemeAndSave,
    toggleDarkMode,
  };
}




