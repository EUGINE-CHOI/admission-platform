"use client";

import { ReactNode } from "react";

interface VisuallyHiddenProps {
  children: ReactNode;
  as?: "span" | "div" | "label";
}

/**
 * 시각적으로 숨기지만 스크린 리더에서는 읽히는 컴포넌트
 * 접근성을 위한 추가 텍스트 제공에 사용
 */
export function VisuallyHidden({ children, as: Component = "span" }: VisuallyHiddenProps) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}

