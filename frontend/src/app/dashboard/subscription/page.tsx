"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { getApiUrl } from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import {
  CreditCard,
  Check,
  Clock,
  AlertCircle,
  Crown,
  Zap,
  Shield,
  RefreshCw,
  Calendar,
  History,
  ChevronRight,
  Sparkles,
  Star,
  Brain,
  MessageSquare,
  FileText,
  Target,
  Users,
  Bot,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: {
    name: string;
    type: string;
    monthlyPrice: number;
    features: string[];
  };
}

interface Payment {
  id: string;
  amount: number;
  originalAmount: number;
  discountAmount: number;
  status: string;
  planName: string;
  paidAt: string;
  createdAt: string;
}

interface Usage {
  consultations: { used: number; limit: number; unlimited: boolean };
  ai: { used: number; limit: number; unlimited: boolean };
}

const plans = [
  {
    name: "Starter",
    type: "FREE",
    price: 0,
    originalPrice: 0,
    description: "입시 준비 시작하기",
    color: "from-slate-500 to-slate-600",
    features: [
      "기본 프로필 관리",
      "월 3회 AI 분석",
      "학교 정보 열람",
      "커뮤니티 접근",
    ],
    limits: {
      ai: 3,
      consultation: 0,
    },
  },
  {
    name: "Pro",
    type: "BASIC",
    price: 39900,
    originalPrice: 59000,
    description: "본격적인 입시 준비",
    color: "from-violet-500 to-fuchsia-500",
    popular: true,
    features: [
      "무제한 AI 분석",
      "맞춤형 플래너",
      "상세 리포트",
      "비교과 추천",
      "자소서 코칭",
      "이메일 서포트",
    ],
    limits: {
      ai: -1,
      consultation: 2,
    },
  },
  {
    name: "Premium",
    type: "PREMIUM",
    price: 99000,
    originalPrice: 150000,
    description: "전문가와 함께하는 프리미엄",
    color: "from-amber-500 to-orange-500",
    features: [
      "Pro 모든 기능",
      "1:1 전문가 상담",
      "우선 서포트",
      "전략 리포트",
      "보호자 대시보드",
      "모의 면접",
    ],
    limits: {
      ai: -1,
      consultation: -1,
    },
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetchSubscription();
    fetchPaymentHistory();
  }, []);

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  };

  const fetchSubscription = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${getApiUrl()}/api/subscriptions/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription);
        setUsage(data.usage);
      }
    } catch (e) {
      console.error("Failed to fetch subscription:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${getApiUrl()}/api/subscriptions/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (e) {
      console.error("Failed to fetch payment history:", e);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("정말 구독을 취소하시겠습니까?")) return;

    setCanceling(true);
    try {
      const token = getToken();
      const res = await fetch(`${getApiUrl()}/api/subscriptions/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ immediate: false }),
      });

      if (res.ok) {
        alert("구독이 취소되었습니다. 현재 기간이 끝나면 종료됩니다.");
        fetchSubscription();
      }
    } catch (e) {
      console.error("Failed to cancel subscription:", e);
    } finally {
      setCanceling(false);
    }
  };

  const handleSelectPlan = (planType: string) => {
    if (planType === "FREE") {
      return;
    }
    router.push(`/payment?plan=${planType}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">활성</Badge>;
      case "CANCELLED":
        return <Badge variant="warning">취소됨</Badge>;
      case "EXPIRED":
        return <Badge variant="danger">만료</Badge>;
      case "PENDING":
        return <Badge variant="default">대기중</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getDiscountPercent = (original: number, current: number) => {
    if (original <= 0) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-600 dark:text-violet-400 text-sm mb-4">
            <Crown className="w-4 h-4" />
            <span>멤버십 관리</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            구독 & 멤버십
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            나에게 맞는 플랜을 선택하고 프리미엄 기능을 이용하세요
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-6 sm:p-8">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    {subscription.plan.type === "PREMIUM" ? (
                      <Crown className="w-8 h-8 text-white" />
                    ) : subscription.plan.type === "BASIC" ? (
                      <Zap className="w-8 h-8 text-white" />
                    ) : (
                      <Shield className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-white">
                        {subscription.plan.name} 플랜
                      </h2>
                      {getStatusBadge(subscription.status)}
                    </div>
                    <p className="text-slate-400">
                      {formatPrice(subscription.plan.monthlyPrice)}원 / 월
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {subscription.plan.type !== "PREMIUM" && (
                    <Button
                      onClick={() => router.push("/payment?plan=PREMIUM")}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 shadow-lg shadow-amber-500/25"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      업그레이드
                    </Button>
                  )}
                  {subscription.plan.type !== "FREE" && subscription.status === "ACTIVE" && (
                    <Button
                      onClick={handleCancelSubscription}
                      variant="ghost"
                      className="text-slate-300 border-slate-600 hover:bg-white/10"
                      disabled={canceling}
                    >
                      {canceling ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <AlertCircle className="w-4 h-4 mr-2" />
                      )}
                      구독 취소
                    </Button>
                  )}
                </div>
              </div>

              {/* Subscription Info */}
              <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 backdrop-blur rounded-xl p-4">
                  <p className="text-sm text-slate-400 mb-1">구독 시작일</p>
                  <p className="font-semibold text-white">
                    {formatDate(subscription.currentPeriodStart)}
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur rounded-xl p-4">
                  <p className="text-sm text-slate-400 mb-1">다음 결제일</p>
                  <p className="font-semibold text-white">
                    {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
                {usage && (
                  <>
                    <div className="bg-white/5 backdrop-blur rounded-xl p-4">
                      <p className="text-sm text-slate-400 mb-1">AI 사용량</p>
                      <p className="font-semibold text-violet-400">
                        {usage.ai.unlimited ? "무제한" : `${usage.ai.used} / ${usage.ai.limit}회`}
                      </p>
                    </div>
                    <div className="bg-white/5 backdrop-blur rounded-xl p-4">
                      <p className="text-sm text-slate-400 mb-1">상담 사용량</p>
                      <p className="font-semibold text-fuchsia-400">
                        {usage.consultations.unlimited ? "무제한" : `${usage.consultations.used} / ${usage.consultations.limit}회`}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Plans Comparison */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            플랜 비교
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => {
              const isCurrentPlan = subscription?.plan.type === plan.type;
              const discount = getDiscountPercent(plan.originalPrice, plan.price);
              
              return (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-b from-violet-600/20 to-fuchsia-600/10 border-2 border-violet-500/50 scale-105 shadow-xl shadow-violet-500/10"
                      : "bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-violet-500/30"
                  } p-6`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full text-sm font-bold text-white flex items-center gap-1.5 shadow-lg">
                      <Star className="w-4 h-4" />
                      BEST 선택
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-emerald-500/20 text-emerald-500 text-xs font-bold rounded-full">
                      현재 플랜
                    </div>
                  )}

                  <div className="mb-6 pt-2">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-lg`}>
                      {plan.type === "PREMIUM" ? (
                        <Crown className="w-7 h-7 text-white" />
                      ) : plan.type === "BASIC" ? (
                        <Zap className="w-7 h-7 text-white" />
                      ) : (
                        <Shield className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    {plan.originalPrice > plan.price && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg text-slate-400 line-through">
                          ₩{formatPrice(plan.originalPrice)}
                        </span>
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-500 text-xs font-bold rounded">
                          {discount}% 할인
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">
                        {plan.price === 0 ? "무료" : `₩${formatPrice(plan.price)}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-slate-500 dark:text-slate-400">/월</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-3 text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          plan.popular 
                            ? "bg-violet-500/20" 
                            : "bg-slate-100 dark:bg-slate-700"
                        }`}>
                          <Check className={`w-3 h-3 ${
                            plan.popular ? "text-violet-500" : "text-slate-500 dark:text-slate-400"
                          }`} />
                        </div>
                        <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPlan(plan.type)}
                    disabled={isCurrentPlan || plan.type === "FREE"}
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 shadow-lg shadow-violet-500/25"
                        : plan.type === "PREMIUM"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    } ${isCurrentPlan ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isCurrentPlan ? "현재 플랜" : plan.type === "FREE" ? "무료 사용 중" : "선택하기"}
                    {!isCurrentPlan && plan.type !== "FREE" && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Comparison Table */}
        <Card className="overflow-hidden">
          <CardHeader icon={<Target className="w-5 h-5" />}>
            기능 비교표
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left p-4 font-medium text-slate-500 dark:text-slate-400">기능</th>
                    <th className="text-center p-4 font-medium text-slate-500 dark:text-slate-400">Starter</th>
                    <th className="text-center p-4 font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20">Pro</th>
                    <th className="text-center p-4 font-medium text-amber-600 dark:text-amber-400">Premium</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { feature: "AI 분석", starter: "월 3회", pro: "무제한", premium: "무제한" },
                    { feature: "학교 정보 열람", starter: true, pro: true, premium: true },
                    { feature: "맞춤형 플래너", starter: false, pro: true, premium: true },
                    { feature: "상세 리포트", starter: false, pro: true, premium: true },
                    { feature: "자소서 코칭", starter: false, pro: true, premium: true },
                    { feature: "1:1 전문가 상담", starter: false, pro: "월 2회", premium: "무제한" },
                    { feature: "모의 면접", starter: false, pro: false, premium: true },
                    { feature: "보호자 대시보드", starter: false, pro: false, premium: true },
                    { feature: "우선 서포트", starter: false, pro: false, premium: true },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-4 text-slate-700 dark:text-slate-300">{row.feature}</td>
                      <td className="p-4 text-center">
                        {typeof row.starter === "boolean" ? (
                          row.starter ? (
                            <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                          )
                        ) : (
                          <span className="text-slate-600 dark:text-slate-400">{row.starter}</span>
                        )}
                      </td>
                      <td className="p-4 text-center bg-violet-50/50 dark:bg-violet-900/10">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? (
                            <Check className="w-5 h-5 text-violet-500 mx-auto" />
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                          )
                        ) : (
                          <span className="text-violet-600 dark:text-violet-400 font-medium">{row.pro}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {typeof row.premium === "boolean" ? (
                          row.premium ? (
                            <Check className="w-5 h-5 text-amber-500 mx-auto" />
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                          )
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">{row.premium}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader icon={<History className="w-5 h-5" />}>
            결제 내역
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-violet-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {payment.planName} 구독
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {payment.paidAt ? formatDate(payment.paidAt) : formatDate(payment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">
                        ₩{formatPrice(payment.amount)}
                      </p>
                      {payment.discountAmount > 0 && (
                        <p className="text-xs text-emerald-500">
                          -₩{formatPrice(payment.discountAmount)} 할인
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  아직 결제 내역이 없습니다
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FAQ or Help */}
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            결제 관련 문의가 있으신가요?
          </p>
          <Button variant="ghost" onClick={() => router.push("/contact")}>
            <MessageSquare className="w-4 h-4 mr-2" />
            문의하기
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
