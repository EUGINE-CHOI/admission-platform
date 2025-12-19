"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Check,
  Crown,
  Sparkles,
  Users,
  Calendar,
  ArrowRight,
  Clock,
  AlertCircle,
  ChevronRight,
  Zap,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { getToken, getApiUrl } from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Modal } from "@/components/ui";

interface Subscription {
  id: string;
  plan: Plan;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

interface Plan {
  id: string;
  name: string;
  type: "FREE" | "BASIC" | "PREMIUM";
  price: number;
  features: string[];
  aiRequestLimit: number;
  diagnosisLimit: number;
  consultationLimit: number;
}

interface Usage {
  aiRequests: { used: number; limit: number };
  diagnoses: { used: number; limit: number };
  consultations: { used: number; limit: number };
}

interface PaymentHistory {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  plan: string;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "무료",
    type: "FREE",
    price: 0,
    features: [
      "기본 데이터 입력",
      "월 1회 진단",
      "학교 정보 조회",
    ],
    aiRequestLimit: 5,
    diagnosisLimit: 1,
    consultationLimit: 0,
  },
  {
    id: "basic",
    name: "베이직",
    type: "BASIC",
    price: 29900,
    features: [
      "무제한 진단",
      "AI 조언 무제한",
      "액션 플랜 생성",
      "진단 리포트",
      "이메일 알림",
    ],
    aiRequestLimit: -1,
    diagnosisLimit: -1,
    consultationLimit: 0,
  },
  {
    id: "premium",
    name: "프리미엄",
    type: "PREMIUM",
    price: 49900,
    features: [
      "베이직 모든 기능",
      "전문 컨설턴트 상담 2회",
      "맞춤형 상담 리포트",
      "우선 고객 지원",
      "가족 할인 적용",
    ],
    aiRequestLimit: -1,
    diagnosisLimit: -1,
    consultationLimit: 2,
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const [subRes, usageRes, historyRes] = await Promise.all([
        fetch("${getApiUrl()}/api/subscriptions/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("${getApiUrl()}/api/subscriptions/usage", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("${getApiUrl()}/api/subscriptions/history", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (subRes.ok) setSubscription(await subRes.json());
      if (usageRes.ok) setUsage(await usageRes.json());
      if (historyRes.ok) {
        const data = await historyRes.json();
        setPaymentHistory(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    setProcessing(true);
    try {
      const token = getToken();
      const endpoint = subscription 
        ? "${getApiUrl()}/api/subscriptions/upgrade"
        : "${getApiUrl()}/api/subscriptions";
      
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: selectedPlan.id }),
      });
      
      setIsUpgradeModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Upgrade error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    setProcessing(true);
    try {
      const token = getToken();
      await fetch("${getApiUrl()}/api/subscriptions/cancel", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsCancelModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Cancel error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const currentPlanType = subscription?.plan?.type || "FREE";

  return (
    <DashboardLayout requiredRole="PARENT">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">구독 관리</h1>
          <p className="text-slate-500 mt-1">
            플랜을 관리하고 사용량을 확인하세요
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-600 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Current Plan */}
            <Card className={`border-2 ${
              currentPlanType === "PREMIUM" 
                ? "border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50" 
                : currentPlanType === "BASIC"
                ? "border-sky-300 bg-gradient-to-br from-sky-50 to-indigo-50"
                : "border-slate-200"
            }`}>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      currentPlanType === "PREMIUM" 
                        ? "bg-purple-100" 
                        : currentPlanType === "BASIC"
                        ? "bg-sky-100"
                        : "bg-slate-100"
                    }`}>
                      {currentPlanType === "PREMIUM" ? (
                        <Crown className="w-7 h-7 text-purple-600" />
                      ) : currentPlanType === "BASIC" ? (
                        <Sparkles className="w-7 h-7 text-sky-600" />
                      ) : (
                        <CreditCard className="w-7 h-7 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">
                          {subscription?.plan?.name || "무료"} 플랜
                        </h2>
                        {subscription?.status === "ACTIVE" && (
                          <Badge variant="success">활성</Badge>
                        )}
                      </div>
                      {subscription && (
                        <p className="text-sm text-slate-500 mt-1">
                          {subscription.endDate}까지 · 
                          {subscription.autoRenew ? " 자동 갱신" : " 수동 갱신"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {currentPlanType !== "PREMIUM" && (
                      <Button
                        onClick={() => {
                          const nextPlan = plans.find(p => 
                            currentPlanType === "FREE" ? p.type === "BASIC" : p.type === "PREMIUM"
                          );
                          setSelectedPlan(nextPlan || null);
                          setIsUpgradeModalOpen(true);
                        }}
                        leftIcon={<Zap className="w-4 h-4" />}
                      >
                        업그레이드
                      </Button>
                    )}
                    {subscription && subscription.status === "ACTIVE" && (
                      <Button
                        variant="outline"
                        onClick={() => setIsCancelModalOpen(true)}
                      >
                        구독 취소
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage */}
            {usage && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <UsageCard
                  icon={<Sparkles className="w-5 h-5" />}
                  title="AI 요청"
                  used={usage.aiRequests.used}
                  limit={usage.aiRequests.limit}
                  color="sky"
                />
                <UsageCard
                  icon={<Zap className="w-5 h-5" />}
                  title="진단"
                  used={usage.diagnoses.used}
                  limit={usage.diagnoses.limit}
                  color="indigo"
                />
                <UsageCard
                  icon={<Users className="w-5 h-5" />}
                  title="상담"
                  used={usage.consultations.used}
                  limit={usage.consultations.limit}
                  color="purple"
                />
              </div>
            )}

            {/* Plans */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">플랜 비교</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative ${
                      plan.type === currentPlanType
                        ? "border-2 border-sky-500 ring-2 ring-sky-500/20"
                        : plan.type === "PREMIUM"
                        ? "border-2 border-purple-300"
                        : ""
                    }`}
                  >
                    {plan.type === "BASIC" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-sky-500 text-white">인기</Badge>
                      </div>
                    )}
                    <CardContent className="pt-6">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-slate-900">
                            ₩{plan.price.toLocaleString()}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-slate-500">/월</span>
                          )}
                        </div>
                      </div>
                      
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {plan.type === currentPlanType ? (
                        <Button variant="outline" className="w-full" disabled>
                          현재 플랜
                        </Button>
                      ) : plan.type === "FREE" ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setIsUpgradeModalOpen(true);
                          }}
                        >
                          다운그레이드
                        </Button>
                      ) : (
                        <Button
                          className={`w-full ${plan.type === "PREMIUM" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                          onClick={() => {
                            setSelectedPlan(plan);
                            setIsUpgradeModalOpen(true);
                          }}
                        >
                          선택하기
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Payment History */}
            <Card>
              <CardHeader icon={<Clock className="w-5 h-5" />}>
                결제 내역
              </CardHeader>
              <CardContent>
                {paymentHistory.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">
                    결제 내역이 없습니다
                  </p>
                ) : (
                  <div className="space-y-3">
                    {paymentHistory.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{payment.plan}</p>
                            <p className="text-sm text-slate-500">{payment.createdAt}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            ₩{payment.amount.toLocaleString()}
                          </p>
                          <Badge variant={payment.status === "COMPLETED" ? "success" : "warning"}>
                            {payment.status === "COMPLETED" ? "완료" : "처리중"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Upgrade Modal */}
        <Modal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          title={`${selectedPlan?.name} 플랜으로 변경`}
          size="md"
        >
          {selectedPlan && (
            <div className="space-y-6">
              <div className="text-center p-6 bg-slate-50 rounded-xl">
                <p className="text-3xl font-bold text-slate-900">
                  ₩{selectedPlan.price.toLocaleString()}
                  <span className="text-lg font-normal text-slate-500">/월</span>
                </p>
              </div>
              
              <ul className="space-y-2">
                {selectedPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsUpgradeModalOpen(false)}
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpgrade}
                  isLoading={processing}
                >
                  변경하기
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Cancel Modal */}
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title="구독 취소"
          size="sm"
        >
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">구독을 취소하시겠습니까?</p>
                  <p className="text-sm text-amber-700 mt-1">
                    현재 결제 기간이 끝나면 무료 플랜으로 변경됩니다.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsCancelModalOpen(false)}
              >
                유지하기
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleCancel}
                isLoading={processing}
              >
                구독 취소
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

function UsageCard({
  icon,
  title,
  used,
  limit,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  used: number;
  limit: number;
  color: "sky" | "indigo" | "purple";
}) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;

  const colors = {
    sky: "bg-sky-100 text-sky-600",
    indigo: "bg-indigo-100 text-indigo-600",
    purple: "bg-purple-100 text-purple-600",
  };

  const barColors = {
    sky: "bg-sky-500",
    indigo: "bg-indigo-500",
    purple: "bg-purple-500",
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="font-semibold text-slate-900">
              {used} / {isUnlimited ? "∞" : limit}
            </p>
          </div>
        </div>
        {!isUnlimited && (
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isNearLimit ? "bg-amber-500" : barColors[color]
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
        {isUnlimited && (
          <p className="text-xs text-emerald-600 font-medium">무제한 사용 가능</p>
        )}
      </CardContent>
    </Card>
  );
}




