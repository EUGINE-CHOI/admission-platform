"use client";

import { ReactNode } from "react";

interface LiveRegionProps {
  children: ReactNode;
  /** 
   * polite: 현재 작업이 끝난 후 알림
   * assertive: 즉시 알림 (긴급한 경우만)
   */
  politeness?: "polite" | "assertive";
  /** 관련 여부 (추가/제거/전체) */
  relevant?: "additions" | "removals" | "all";
}

/**
 * 스크린 리더에 동적 콘텐츠 변경을 알리는 라이브 리전
 * 토스트 메시지, 폼 에러, 로딩 상태 등에 사용
 */
export function LiveRegion({ 
  children, 
  politeness = "polite",
  relevant = "additions"
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      aria-relevant={relevant}
      className="sr-only"
    >
      {children}
    </div>
  );
}

/**
 * 에러 메시지용 라이브 리전
 */
export function ErrorAnnouncement({ message }: { message: string | null }) {
  if (!message) return null;
  
  return (
    <div role="alert" aria-live="assertive" className="sr-only">
      오류: {message}
    </div>
  );
}

/**
 * 로딩 상태 알림
 */
export function LoadingAnnouncement({ isLoading, message = "로딩 중입니다" }: { isLoading: boolean; message?: string }) {
  if (!isLoading) return null;
  
  return (
    <div role="status" aria-live="polite" className="sr-only">
      {message}
    </div>
  );
}



