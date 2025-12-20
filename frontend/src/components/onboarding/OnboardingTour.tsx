"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Target,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  position?: "center" | "top" | "bottom" | "left" | "right";
}

const STUDENT_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "3m5m에 오신 것을 환영합니다! 🎉",
    description: "생기부 입력 3분, 합격 전략 5분! 고입 준비를 위한 최적의 AI 파트너입니다.",
    icon: <Sparkles className="w-8 h-8 text-amber-500" />,
    position: "center",
  },
  {
    id: "diagnosis",
    title: "진단 분석",
    description: "현재 나의 입시 준비 상태를 분석하고, 목표 학교와의 적합도를 확인하세요. AI가 맞춤 피드백을 제공합니다.",
    icon: <Target className="w-8 h-8 text-sky-500" />,
    position: "center",
  },
  {
    id: "data-input",
    title: "데이터 입력",
    description: "성적, 비교과 활동, 독서 기록을 입력하면 더 정확한 분석이 가능합니다. 꾸준히 업데이트해주세요!",
    icon: <BookOpen className="w-8 h-8 text-emerald-500" />,
    position: "center",
  },
  {
    id: "ai-mentor",
    title: "AI 멘토",
    description: "입시 전략, 학습 계획, 동아리 추천 등 AI가 맞춤형 조언을 제공합니다. 언제든 질문해보세요!",
    icon: <Brain className="w-8 h-8 text-purple-500" />,
    position: "center",
  },
  {
    id: "complete",
    title: "준비 완료! 🚀",
    description: "이제 입시 준비를 시작해볼까요? 왼쪽 메뉴에서 원하는 기능을 선택하세요.",
    icon: <CheckCircle className="w-8 h-8 text-green-500" />,
    position: "center",
  },
];

const PARENT_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "3m5m에 오신 것을 환영합니다! 🎉",
    description: "학생의 입시 준비를 함께 관리할 수 있는 플랫폼입니다. 간단한 가이드를 통해 주요 기능을 알아보세요.",
    icon: <Sparkles className="w-8 h-8 text-amber-500" />,
    position: "center",
  },
  {
    id: "student-status",
    title: "학생 현황",
    description: "연결된 학생들의 성적, 활동, 진단 결과를 한눈에 확인할 수 있습니다.",
    icon: <Target className="w-8 h-8 text-sky-500" />,
    position: "center",
  },
  {
    id: "calendar",
    title: "캘린더 & 상담 예약",
    description: "입시 일정을 확인하고, 전문 컨설턴트와의 상담을 예약할 수 있습니다.",
    icon: <Calendar className="w-8 h-8 text-emerald-500" />,
    position: "center",
  },
  {
    id: "invite",
    title: "학생 초대하기",
    description: "'학생 현황' 메뉴에서 초대 코드를 생성하여 학생을 연결하세요.",
    icon: <BookOpen className="w-8 h-8 text-purple-500" />,
    position: "center",
  },
  {
    id: "complete",
    title: "준비 완료! 🚀",
    description: "이제 학생의 입시 준비를 함께 시작해볼까요?",
    icon: <CheckCircle className="w-8 h-8 text-green-500" />,
    position: "center",
  },
];

interface OnboardingTourProps {
  role: "STUDENT" | "PARENT" | "CONSULTANT" | "ADMIN";
  onComplete: () => void;
}

export function OnboardingTour({ role, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  const steps = role === "PARENT" ? PARENT_STEPS : STUDENT_STEPS;

  useEffect(() => {
    setMounted(true);
    // 스크롤 방지
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // 로컬 스토리지에 완료 표시
    localStorage.setItem("onboarding_completed", "true");
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_completed", "true");
    onComplete();
  };

  if (!mounted) return null;

  const step = steps[currentStep];

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress bar */}
          <div className="h-1 bg-slate-100 dark:bg-slate-700">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Icon */}
          <div className="pt-10 pb-6 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center shadow-lg">
              {step.icon}
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              {step.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 pb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-6 bg-sky-500"
                    : index < currentStep
                    ? "bg-sky-300"
                    : "bg-slate-200 dark:bg-slate-600"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="flex-1"
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                이전
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1"
              rightIcon={
                currentStep < steps.length - 1 ? (
                  <ChevronRight className="w-4 h-4" />
                ) : undefined
              }
            >
              {currentStep < steps.length - 1 ? "다음" : "시작하기"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function useOnboarding() {
  const [showTour, setShowTour] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("onboarding_completed");
    if (!completed) {
      setIsFirstVisit(true);
      // 약간의 딜레이 후 표시
      const timer = setTimeout(() => setShowTour(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTour = () => {
    setShowTour(false);
    setIsFirstVisit(false);
  };

  const resetTour = () => {
    localStorage.removeItem("onboarding_completed");
    setShowTour(true);
    setIsFirstVisit(true);
  };

  return { showTour, isFirstVisit, completeTour, resetTour };
}






