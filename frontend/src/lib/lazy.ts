import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Skeleton 컴포넌트 타입
interface SkeletonProps {
  className?: string;
}

// 기본 로딩 컴포넌트
const DefaultLoading = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64 w-full" />
);

// 카드 형태 로딩
const CardLoading = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
    </div>
  </div>
);

// 테이블 형태 로딩
const TableLoading = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded" />
    ))}
  </div>
);

// 차트 형태 로딩
const ChartLoading = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
      <span className="text-gray-400">차트 로딩 중...</span>
    </div>
  </div>
);

/**
 * 지연 로딩 컴포넌트 생성 헬퍼
 * SSR을 비활성화하고 로딩 상태를 표시
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    loading?: ComponentType<any>;
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: options?.loading || DefaultLoading,
    ssr: options?.ssr ?? false,
  });
}

/**
 * 차트 컴포넌트 지연 로딩
 * recharts, chart.js 등 무거운 차트 라이브러리용
 */
export function lazyLoadChart<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return dynamic(importFn, {
    loading: ChartLoading,
    ssr: false,
  });
}

/**
 * 테이블 컴포넌트 지연 로딩
 * 데이터 그리드, 복잡한 테이블용
 */
export function lazyLoadTable<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return dynamic(importFn, {
    loading: TableLoading,
    ssr: false,
  });
}

/**
 * 카드 컴포넌트 지연 로딩
 */
export function lazyLoadCard<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return dynamic(importFn, {
    loading: CardLoading,
    ssr: false,
  });
}

// 자주 사용하는 지연 로딩 컴포넌트들
export const LazyWidgetSettings = dynamic(
  () => import('@/components/dashboard/WidgetSettings'),
  { loading: CardLoading, ssr: false }
);

export const LazyThemeToggle = dynamic(
  () => import('@/components/ui/ThemeToggle'),
  { ssr: false }
);



