'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
  const { theme, isDark, setTheme, toggleDarkMode } = useDarkMode();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-400">테마</span>
      )}
      
      {/* 간단한 토글 버튼 */}
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600" />
        )}
      </button>
    </div>
  );
}

export function ThemeSelector({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useDarkMode();

  const options = [
    { value: 'light' as const, icon: Sun, label: '라이트' },
    { value: 'dark' as const, icon: Moon, label: '다크' },
    { value: 'system' as const, icon: Monitor, label: '시스템' },
  ];

  return (
    <div className={`flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${theme === value
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }
          `}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
