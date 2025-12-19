import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind CSS support
 * Combines clsx and tailwind-merge for optimal class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to Korean locale string
 * @example formatDate("2025-12-19") // "2025년 12월 19일"
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

/**
 * Format date to short format (YYYY.MM.DD)
 * @example formatDateShort("2025-12-19") // "2025.12.19"
 */
export function formatDateShort(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\. /g, ".").replace(/\.$/, "");
}

/**
 * Format date and time to Korean locale string
 * @example formatDateTime("2025-12-19T14:30:00") // "2025년 12월 19일 14:30"
 */
export function formatDateTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format time only
 * @example formatTime("2025-12-19T14:30:00") // "14:30"
 */
export function formatTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time (e.g., "1분 전", "2시간 전", "3일 전")
 * @example formatRelativeTime("2025-12-19T14:30:00") // "2시간 전"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  
  return formatDateShort(d);
}

/**
 * Get current year
 * @example getCurrentYear() // 2025
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Get today's date string in ISO format (YYYY-MM-DD)
 * @example getToday() // "2025-12-19"
 */
export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Calculate D-Day from a target date
 * @example getDDay("2025-12-25") // -6 (6일 남음)
 */
export function getDDay(targetDate: Date | string): number {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format D-Day display text
 * @example formatDDay(-6) // "D-6"
 * @example formatDDay(0) // "D-Day"
 * @example formatDDay(3) // "D+3"
 */
export function formatDDay(dday: number): string {
  if (dday === 0) return "D-Day";
  if (dday < 0) return `D${dday}`;
  return `D+${dday}`;
}

/**
 * Format number with Korean locale
 */
export function formatNumber(num: number) {
  return num.toLocaleString("ko-KR");
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


