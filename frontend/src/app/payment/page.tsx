"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Check, Shield, Clock, Users } from "lucide-react";

interface Plan {
  name: string;
  type: string;
  originalPrice: number;
  discountRate: number;
  discountAmount: number;
  finalAmount: number;
}

interface PaymentInfo {
  clientKey: string;
  orderId: string;
  amount: number;
  orderName: string;
  customerName: string;
  successUrl: string;
  failUrl: string;
  plan: Plan;
}

declare global {
  interface Window {
    TossPayments: any;
  }
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planType = searchParams.get("plan") || "BASIC";

  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // 토스페이먼츠 SDK 로드
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v1/payment";
    script.async = true;
    document.body.appendChild(script);

    preparePayment();

    return () => {
      document.body.removeChild(script);
    };
  }, [planType]);

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const preparePayment = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("http://localhost:3000/api/payment/prepare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planType }),
      });

      if (res.ok) {
        const data = await res.json();
        setPaymentInfo(data);
      } else {
        const err = await res.json();
        setError(err.message || "결제 준비 중 오류가 발생했습니다");
      }
    } catch (e) {
      setError("서버 연결에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentInfo || !window.TossPayments) {
      setError("결제 준비가 완료되지 않았습니다");
      return;
    }

    setProcessing(true);

    try {
      const tossPayments = window.TossPayments(paymentInfo.clientKey);

      await tossPayments.requestPayment("카드", {
        amount: paymentInfo.amount,
        orderId: paymentInfo.orderId,
        orderName: paymentInfo.orderName,
        customerName: paymentInfo.customerName,
        successUrl: paymentInfo.successUrl,
        failUrl: paymentInfo.failUrl,
      });
    } catch (e: any) {
      if (e.code === "USER_CANCEL") {
        setError("결제가 취소되었습니다");
      } else {
        setError(e.message || "결제 처리 중 오류가 발생했습니다");
      }
      setProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error && !paymentInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">오류 발생</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">결제하기</h1>
          <p className="text-white/70">안전한 토스페이먼츠로 결제합니다</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full text-sm">
            <Shield className="w-4 h-4" />
            테스트 모드 - 실제 결제 없음
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 주문 정보 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              주문 정보
            </h2>

            {paymentInfo && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/70">상품명</span>
                    <span className="text-white font-medium">
                      {paymentInfo.plan.name} 구독
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/70">정가</span>
                    <span className="text-white/50 line-through">
                      {formatPrice(paymentInfo.plan.originalPrice)}원
                    </span>
                  </div>
                  {paymentInfo.plan.discountRate > 0 && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/70 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        가족 할인 ({paymentInfo.plan.discountRate * 100}%)
                      </span>
                      <span className="text-green-400">
                        -{formatPrice(paymentInfo.plan.discountAmount)}원
                      </span>
                    </div>
                  )}
                  <hr className="border-white/10 my-4" />
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">최종 결제 금액</span>
                    <span className="text-2xl font-bold text-purple-400">
                      {formatPrice(paymentInfo.plan.finalAmount)}원
                    </span>
                  </div>
                </div>

                <div className="text-sm text-white/50">
                  <p>• 결제 후 즉시 프리미엄 기능이 활성화됩니다</p>
                  <p>• 구독 기간: 결제일로부터 30일</p>
                  <p>• 언제든지 구독을 취소할 수 있습니다</p>
                </div>
              </div>
            )}
          </div>

          {/* 플랜 혜택 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              {paymentInfo?.plan.name} 플랜 혜택
            </h2>

            <ul className="space-y-3">
              {getPlanFeatures(planType).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <span className="text-white/80">{feature}</span>
                </li>
              ))}
            </ul>

            {/* 결제 버튼 */}
            <div className="mt-8">
              {error && (
                <div className="bg-red-500/20 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={processing || !paymentInfo}
                className={`w-full py-4 rounded-xl font-medium text-lg transition-all ${
                  processing
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-500/25"
                } text-white`}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5 animate-spin" />
                    결제 처리 중...
                  </span>
                ) : (
                  `${formatPrice(paymentInfo?.plan.finalAmount || 0)}원 결제하기`
                )}
              </button>

              <p className="text-center text-white/50 text-sm mt-4">
                결제를 진행하면 이용약관에 동의하는 것으로 간주됩니다
              </p>
            </div>
          </div>
        </div>

        {/* 보안 안내 */}
        <div className="mt-8 flex items-center justify-center gap-6 text-white/50 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>SSL 암호화</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>토스페이먼츠</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPlanFeatures(planType: string): string[] {
  switch (planType) {
    case "BASIC":
      return [
        "AI 학습 분석 리포트",
        "맞춤형 학습 가이드",
        "진단 평가 무제한",
        "목표 학교 3개 설정",
        "이메일 지원",
      ];
    case "PREMIUM":
      return [
        "AI 학습 분석 리포트",
        "맞춤형 학습 가이드",
        "진단 평가 무제한",
        "목표 학교 10개 설정",
        "전문 컨설턴트 상담 1회",
        "AI 생기부 문장 생성",
        "우선 고객 지원",
      ];
    case "VIP":
      return [
        "AI 학습 분석 리포트",
        "맞춤형 학습 가이드",
        "진단 평가 무제한",
        "목표 학교 무제한",
        "전문 컨설턴트 상담 무제한",
        "AI 생기부 문장 생성",
        "1:1 전담 매니저",
        "입시 전략 컨설팅",
        "모든 프리미엄 기능",
      ];
    default:
      return [];
  }
}


