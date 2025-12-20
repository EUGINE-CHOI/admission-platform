"use client";

import { useEffect, useState } from "react";

interface AnimatedCheckProps {
  active: boolean;
  size?: "sm" | "md" | "lg";
  color?: string;
  onComplete?: () => void;
}

/**
 * 애니메이션 체크 마크
 * 저장 완료, 할 일 완료 등에 사용
 */
export function AnimatedCheck({ 
  active, 
  size = "md", 
  color = "#10b981",
  onComplete 
}: AnimatedCheckProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [active, onComplete]);

  if (!isVisible) return null;

  const sizes = {
    sm: { svg: 24, stroke: 2 },
    md: { svg: 48, stroke: 3 },
    lg: { svg: 72, stroke: 4 },
  };

  const { svg, stroke } = sizes[size];
  const radius = (svg - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="inline-flex items-center justify-center" aria-hidden="true">
      <svg
        width={svg}
        height={svg}
        viewBox={`0 0 ${svg} ${svg}`}
        className="transform -rotate-90"
      >
        {/* 배경 원 */}
        <circle
          cx={svg / 2}
          cy={svg / 2}
          r={radius}
          fill="none"
          stroke={`${color}30`}
          strokeWidth={stroke}
        />
        {/* 애니메이션 원 */}
        <circle
          cx={svg / 2}
          cy={svg / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          className="animate-circle-draw"
          style={{
            "--circumference": circumference,
          } as React.CSSProperties}
        />
        {/* 체크 마크 */}
        <path
          d={`M${svg * 0.28} ${svg * 0.5} L${svg * 0.42} ${svg * 0.65} L${svg * 0.72} ${svg * 0.35}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-check-draw"
          style={{
            transformOrigin: "center",
          }}
        />
      </svg>
    </div>
  );
}



