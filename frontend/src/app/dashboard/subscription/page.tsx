"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
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
      return localStorage.getItem("token");
    }
    return null;
  };

  const fetchSubscription = async () => {
    try {
      const token = getToken();
      const res = await fetch("http://localhost:3000/api/subscriptions/me", {
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
      const res = await fetch("http://localhost:3000/api/subscriptions/history", {
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
      const res = await fetch("http://localhost:3000/api/subscriptions/cancel", {
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

  const getPlanIcon = (type: string) => {
    switch (type) {
      case "VIP":
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case "PREMIUM":
        return <Sparkles className="w-6 h-6 text-purple-500" />;
      case "BASIC":
        return <Zap className="w-6 h-6 text-blue-500" />;
      default:
        return <Shield className="w-6 h-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            구독 관리
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            현재 구독 상태와 결제 내역을 확인하세요
          </p>
        </div>

        {/* Current Subscription */}
        <Card>
          <CardHeader icon={<CreditCard className="w-5 h-5" />}>
            현재 구독
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 rounded-xl flex items-center justify-center">
                      {getPlanIcon(subscription.plan.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {subscription.plan.name} 플랜
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatPrice(subscription.plan.monthlyPrice)}원 / 월
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(subscription.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      구독 시작일
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {formatDate(subscription.currentPeriodStart)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      다음 결제일
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                </div>

                {/* Plan Features */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    포함된 기능
                  </h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {subscription.plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Usage */}
                {usage && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                        AI 사용량
                      </p>
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                        {usage.ai.unlimited
                          ? "무제한"
                          : `${usage.ai.used} / ${usage.ai.limit}`}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                        상담 사용량
                      </p>
                      <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                        {usage.consultations.unlimited
                          ? "무제한"
                          : `${usage.consultations.used} / ${usage.consultations.limit}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  {subscription.plan.type !== "VIP" && (
                    <Button
                      onClick={() => router.push("/payment?plan=PREMIUM")}
                      variant="primary"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      업그레이드
                    </Button>
                  )}
                  {subscription.plan.type !== "FREE" &&
                    subscription.status === "ACTIVE" && (
                      <Button
                        onClick={handleCancelSubscription}
                        variant="ghost"
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
            ) : (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  구독 중인 플랜이 없습니다
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  프리미엄 기능을 이용하려면 구독을 시작하세요
                </p>
                <Button onClick={() => router.push("/#pricing")} variant="primary">
                  플랜 선택하기
                </Button>
              </div>
            )}
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
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {payment.planName} 구독
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {payment.paidAt
                            ? formatDate(payment.paidAt)
                            : formatDate(payment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {formatPrice(payment.amount)}원
                      </p>
                      {payment.discountAmount > 0 && (
                        <p className="text-xs text-green-500">
                          -{formatPrice(payment.discountAmount)}원 할인
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                결제 내역이 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade CTA */}
        {subscription && subscription.plan.type !== "PREMIUM" && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  프리미엄으로 업그레이드하세요!
                </h3>
                <p className="text-white/80">
                  전문 컨설턴트 상담, AI 무제한 사용 등 더 많은 기능을 이용하세요
                </p>
              </div>
              <Button
                onClick={() => router.push("/payment?plan=PREMIUM")}
                className="bg-white text-purple-600 hover:bg-purple-50"
              >
                업그레이드
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}




