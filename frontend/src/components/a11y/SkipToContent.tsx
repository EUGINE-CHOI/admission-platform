"use client";

/**
 * Skip to Content 링크
 * 키보드 사용자가 네비게이션을 건너뛰고 메인 콘텐츠로 바로 이동할 수 있게 함
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        focus:absolute focus:top-4 focus:left-4 focus:z-[100]
        focus:px-4 focus:py-2 focus:bg-sky-600 focus:text-white
        focus:rounded-lg focus:shadow-lg focus:outline-none
        focus:ring-2 focus:ring-sky-400 focus:ring-offset-2
        transition-all
      "
    >
      메인 콘텐츠로 건너뛰기
    </a>
  );
}

/**
 * 메인 콘텐츠 랜드마크
 * SkipToContent와 함께 사용
 */
export function MainContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <main id="main-content" tabIndex={-1} className={`outline-none ${className}`}>
      {children}
    </main>
  );
}

