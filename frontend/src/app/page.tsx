"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Target, 
  Brain, 
  Users,
  Star,
  ChevronRight,
  Play,
  Shield,
  Zap,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  const handlePlanSelect = (planType: string) => {
    if (planType === "FREE") {
      router.push("/signup");
    } else {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        router.push(`/payment?plan=${planType}`);
      } else {
        localStorage.setItem("redirectAfterLogin", `/payment?plan=${planType}`);
        router.push("/login");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-hidden">
      {/* Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-violet-600/30 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-fuchsia-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[40%] h-[30%] bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5">
        <div className="absolute inset-0 bg-[#0A0A0F]/80 backdrop-blur-xl" />
        <nav className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">입시로드맵</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              시작하기
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-300 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI 기반 맞춤형 입시 컨설팅</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              입시의 정답,
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                AI가 찾아드립니다
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed">
              성적, 비교과, 목표 학교를 입력하면 AI가 맞춤형 전략을 제시합니다.
              더 이상 정보 부족으로 불안해하지 마세요.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-violet-500/25"
              >
                무료로 시작하기
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-colors">
                <Play className="w-4 h-4" />
                데모 보기
              </button>
            </div>

            {/* Stats */}
            <div className="mt-16 flex gap-12">
              {[
                { value: "500+", label: "학교 데이터" },
                { value: "98%", label: "만족도" },
                { value: "24/7", label: "AI 서비스" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              왜 <span className="text-violet-400">입시로드맵</span>인가요?
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              데이터와 AI, 그리고 전문가의 노하우를 결합한 새로운 입시 솔루션
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: "AI 멘토",
                description: "24시간 맞춤형 조언과 학습 전략을 제공합니다",
                gradient: "from-violet-500 to-purple-500",
              },
              {
                icon: Target,
                title: "정밀 분석",
                description: "성적과 비교과를 분석해 합격 가능성을 예측합니다",
                gradient: "from-fuchsia-500 to-pink-500",
              },
              {
                icon: Users,
                title: "전문 컨설팅",
                description: "검증된 입시 전문가의 1:1 상담을 받으세요",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: TrendingUp,
                title: "실시간 트래킹",
                description: "목표 달성까지 진행 상황을 실시간으로 확인하세요",
                gradient: "from-emerald-500 to-teal-500",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 relative" id="pricing">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              심플한 요금제
            </h2>
            <p className="mt-4 text-slate-400">
              필요에 따라 선택하세요. 언제든 변경 가능합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                type: "FREE",
                price: "무료",
                description: "입시 준비를 시작하는 분들께",
                features: ["기본 프로필 관리", "월 3회 AI 분석", "학교 정보 열람", "커뮤니티 접근"],
                cta: "무료로 시작",
                popular: false,
              },
              {
                name: "Pro",
                type: "BASIC",
                price: "₩39,900",
                period: "/월",
                description: "본격적인 입시 준비를 위한 플랜",
                features: ["무제한 AI 분석", "맞춤형 플래너", "상세 리포트", "비교과 추천", "이메일 서포트"],
                cta: "Pro 시작하기",
                popular: true,
              },
              {
                name: "Premium",
                type: "PREMIUM",
                price: "₩99,000",
                period: "/월",
                description: "전문가와 함께하는 프리미엄 케어",
                features: ["Pro 모든 기능", "1:1 전문 상담", "우선 서포트", "전략 리포트", "학부모 대시보드"],
                cta: "Premium 시작",
                popular: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative p-8 rounded-2xl transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-b from-violet-600/20 to-fuchsia-600/10 border-2 border-violet-500/50 scale-105"
                    : "bg-white/[0.02] border border-white/5 hover:border-white/10"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    BEST
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-slate-400">{plan.period}</span>}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        plan.popular ? "bg-violet-500/20" : "bg-white/5"
                      }`}>
                        <Check className={`w-3 h-3 ${plan.popular ? "text-violet-400" : "text-slate-400"}`} />
                      </div>
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan.type)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 shadow-lg shadow-violet-500/25"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">안전한 결제</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm">빠른 분석</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">전문가 검증</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-slate-400 mb-8">
            5분이면 맞춤형 입시 전략을 받아볼 수 있습니다
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
          >
            무료로 시작하기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">입시로드맵</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2025 입시로드맵. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
