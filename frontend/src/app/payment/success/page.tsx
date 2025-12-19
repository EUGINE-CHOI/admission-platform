"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Sparkles, ArrowRight, PartyPopper } from "lucide-react";
import { getApiUrl } from "@/lib/api";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [confirming, setConfirming] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  useEffect(() => {
    if (paymentKey && orderId && amount) {
      confirmPayment();
    } else {
      setError("결제 정보가 올바르지 않습니다");
      setConfirming(false);
    }
  }, [paymentKey, orderId, amount]);

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const confirmPayment = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("${getApiUrl()}/api/payment/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount: parseInt(amount || "0"),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(true);
        setSubscriptionInfo(data.subscription);
      } else {
        const err = await res.json();
        setError(err.message || "결제 승인에 실패했습니다");
      }
    } catch (e) {
      setError("서버 연결에 실패했습니다");
    } finally {
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">결제 확인 중...</h2>
          <p className="text-white/70">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">😢</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">결제 실패</h2>
          <p className="text-white/70 mb-8">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-xl transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md relative overflow-hidden">
        {/* 축하 효과 */}
        <div className="absolute inset-0 pointer-events-none">
          <PartyPopper className="absolute top-4 left-4 w-8 h-8 text-yellow-400 animate-bounce" />
          <Sparkles className="absolute top-4 right-4 w-8 h-8 text-pink-400 animate-pulse" />
          <Sparkles className="absolute bottom-4 left-4 w-6 h-6 text-purple-400 animate-pulse" />
          <PartyPopper className="absolute bottom-4 right-4 w-6 h-6 text-green-400 animate-bounce" />
        </div>

        <div className="relative z-10">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Check className="w-10 h-10 text-green-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            결제 완료! 🎉
          </h2>
          <p className="text-white/70 mb-6">
            프리미엄 구독이 활성화되었습니다
          </p>

          {subscriptionInfo && (
            <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70">플랜</span>
                <span className="text-white font-medium">
                  {subscriptionInfo.planName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">만료일</span>
                <span className="text-white font-medium">
                  {new Date(subscriptionInfo.periodEnd).toLocaleDateString("ko-KR")}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push("/dashboard/student")}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              대시보드로 이동
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-colors"
            >
              홈으로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}




