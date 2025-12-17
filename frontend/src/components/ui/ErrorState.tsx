"use client";

import { AlertCircle, RefreshCw, WifiOff, Lock, FileQuestion, Home } from "lucide-react";
import { Button } from "./Button";
import { useRouter } from "next/navigation";

interface ErrorStateProps {
  title?: string;
  message?: string;
  type?: "default" | "network" | "auth" | "notFound" | "server";
  onRetry?: () => void;
  showHomeButton?: boolean;
}

export function ErrorState({
  title,
  message,
  type = "default",
  onRetry,
  showHomeButton = false,
}: ErrorStateProps) {
  const router = useRouter();

  const errorConfig = {
    default: {
      icon: AlertCircle,
      iconColor: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      defaultTitle: "오류가 발생했습니다",
      defaultMessage: "잠시 후 다시 시도해주세요.",
    },
    network: {
      icon: WifiOff,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      defaultTitle: "네트워크 연결 오류",
      defaultMessage: "인터넷 연결을 확인하고 다시 시도해주세요.",
    },
    auth: {
      icon: Lock,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      defaultTitle: "인증이 필요합니다",
      defaultMessage: "로그인 후 다시 시도해주세요.",
    },
    notFound: {
      icon: FileQuestion,
      iconColor: "text-slate-500",
      bgColor: "bg-slate-50 dark:bg-slate-800",
      defaultTitle: "페이지를 찾을 수 없습니다",
      defaultMessage: "요청하신 페이지가 존재하지 않습니다.",
    },
    server: {
      icon: AlertCircle,
      iconColor: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      defaultTitle: "서버 오류",
      defaultMessage: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
    },
  };

  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div
        className={`w-20 h-20 rounded-2xl ${config.bgColor} flex items-center justify-center mb-6`}
      >
        <Icon className={`w-10 h-10 ${config.iconColor}`} />
      </div>

      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 text-center">
        {title || config.defaultTitle}
      </h3>

      <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
        {message || config.defaultMessage}
      </p>

      <div className="flex gap-3">
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="primary"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            다시 시도
          </Button>
        )}

        {showHomeButton && (
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            leftIcon={<Home className="w-4 h-4" />}
          >
            홈으로
          </Button>
        )}

        {type === "auth" && (
          <Button
            onClick={() => router.push("/login")}
            variant="primary"
            leftIcon={<Lock className="w-4 h-4" />}
          >
            로그인
          </Button>
        )}
      </div>
    </div>
  );
}

// 인라인 에러 메시지
export function InlineError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      <p className="text-sm text-red-700 dark:text-red-300 flex-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 font-medium"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

// 토스트 스타일 에러
export function ToastError({
  message,
  onClose,
}: {
  message: string;
  onClose?: () => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-3 p-4 bg-red-600 text-white rounded-xl shadow-lg animate-in slide-in-from-bottom-4 z-50">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-red-200 hover:text-white"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// 빈 상태
export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  message,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      {message && (
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-4">
          {message}
        </p>
      )}
      {action}
    </div>
  );
}



