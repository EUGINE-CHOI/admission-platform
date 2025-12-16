"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle, RefreshCw, Home } from "lucide-react";

function PaymentFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get("code") || "UNKNOWN";
  const message = searchParams.get("message") || "결제가 실패했습니다";

  const getErrorMessage = (code: string): string => {
    switch (code) {
      case "USER_CANCEL":
        return "결제가 취소되었습니다";
      case "INVALID_CARD_COMPANY":
        return "지원하지 않는 카드사입니다";
      case "INVALID_CARD_NUMBER":
        return "유효하지 않은 카드 번호입니다";
      case "EXPIRED_CARD":
        return "만료된 카드입니다";
      case "EXCEED_MAX_AMOUNT":
        return "결제 한도를 초과했습니다";
      case "BELOW_MIN_AMOUNT":
        return "최소 결제 금액 미만입니다";
      default:
        return decodeURIComponent(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">결제 실패</h2>
        <p className="text-white/70 mb-4">{getErrorMessage(code)}</p>

        <div className="bg-white/5 rounded-xl p-4 mb-6 text-left text-sm">
          <div className="flex items-center justify-between">
            <span className="text-white/50">오류 코드</span>
            <span className="text-white/70 font-mono">{code}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도하기
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            홈으로 이동
          </button>
        </div>

        <p className="text-white/50 text-sm mt-6">
          문제가 지속되면 고객센터로 문의해주세요
        </p>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      }
    >
      <PaymentFailContent />
    </Suspense>
  );
}



