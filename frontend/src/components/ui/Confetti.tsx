"use client";

import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
}

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

const COLORS = [
  "#0ea5e9", // sky
  "#8b5cf6", // violet
  "#f43f5e", // rose
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ec4899", // pink
];

/**
 * 축하 Confetti 효과
 * 뱃지 획득, 목표 달성 등 성취 순간에 사용
 */
export function Confetti({ active, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    // 50개의 confetti 조각 생성
    const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
    }));

    setPieces(newPieces);

    // 애니메이션 완료 후 정리
    const timer = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active || pieces.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 w-3 h-3 rounded-sm animate-confetti"
          style={{
            left: `${piece.x}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Confetti 훅 - 간편하게 사용
 */
export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const trigger = () => {
    setIsActive(true);
  };

  const reset = () => {
    setIsActive(false);
  };

  return { isActive, trigger, reset };
}

