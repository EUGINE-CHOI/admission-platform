"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Zap, 
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
  TrendingUp,
  Loader2,
  BarChart3,
  BookOpen,
  MessageSquare,
  Award,
  Calendar,
  FileText,
  Bot,
  Rocket,
  Clock,
  Timer,
} from "lucide-react";
import { getApiUrl, getToken, setToken } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);

  const handlePlanSelect = (planType: string) => {
    if (planType === "FREE") {
      router.push("/signup");
    } else {
      const token = getToken();
      if (token) {
        router.push(`/payment?plan=${planType}`);
      } else {
        localStorage.setItem("redirectAfterLogin", `/payment?plan=${planType}`);
        router.push("/login");
      }
    }
  };

  const handleDemoClick = async () => {
    setDemoLoading(true);
    
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "student@test.com",
          password: "password123",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.accessToken, data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isDemo", "true");
        router.push("/dashboard/student");
      } else {
        alert("데모 계정 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Demo login error:", error);
      alert("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setDemoLoading(false);
    }
  };

  // 질문들
  const questions = [
    "외고, 자사고 어디가 나한테 맞을까요?",
    "내신 3등급인데 어디까지 노려볼 수 있나요?",
    "비교과 활동은 뭘 해야 할지 모르겠어요...",
    "자소서는 어떻게 써야 할까요?",
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-hidden">
      {/* Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/30 rounded-full blur-[150px]" />
        <div className="absolute top-[30%] right-[-15%] w-[40%] h-[40%] bg-fuchsia-600/25 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[35%] bg-blue-600/20 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-[#0A0A0F]/70 backdrop-blur-xl border-b border-white/5" />
        <nav className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-2xl font-black italic text-white tracking-tight">
                3m<span className="text-yellow-400">⚡</span>5m
              </span>
              <span className="text-[10px] text-slate-500 -mt-1">3 Minutes Input, 5 Minutes Strategy</span>
            </div>
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
              className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg hover:opacity-90 transition-all shadow-lg shadow-violet-500/25"
            >
              회원가입
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Questions floating */}
          <div className="mb-10 flex flex-wrap gap-3 max-w-2xl">
            {questions.map((q, i) => (
              <div
                key={i}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-slate-400 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/10 transition-all cursor-default"
              >
                {q}
              </div>
            ))}
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-full text-violet-300 text-sm mb-6">
              <Timer className="w-4 h-4" />
              <span>생기부 입력 3분, 합격 전략 5분</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="text-slate-300">고입 컨설팅,</span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                AI가 5분 안에 완성
              </span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
              <span className="text-white font-black italic">3m<span className="text-yellow-400">⚡</span>5m</span>은 단순히 성적을 나열하는 것이 아니라, 
              학생의 성적과 비교과를 정밀하게 분석하여 <span className="text-violet-400">숨겨진 가능성</span>을 
              찾아내고 맞춤형 전략을 제시합니다.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-7 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold text-lg hover:opacity-90 transition-all shadow-xl shadow-violet-500/30"
              >
                <Rocket className="w-5 h-5" />
                무료로 시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={handleDemoClick}
                disabled={demoLoading}
                className="inline-flex items-center gap-2 px-7 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
              >
                {demoLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    데모 체험하기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-8 px-6 border-y border-white/5 bg-gradient-to-r from-violet-600/5 via-fuchsia-600/5 to-violet-600/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-12 md:gap-20">
            {[
              { value: "500+", label: "특목/자사고 데이터", icon: BarChart3 },
              { value: "10만+", label: "분석 완료", icon: Target },
              { value: "98%", label: "만족도", icon: Star },
              { value: "24/7", label: "AI 서비스", icon: Bot },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-300 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>핵심 서비스</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold">
              <span className="text-white font-black italic">3m<span className="text-yellow-400">⚡</span>5m</span>
              <span className="text-violet-400">만의</span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                AI 분석 솔루션
              </span>
            </h2>
          </div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* 합격 분석 */}
            <div className="group relative p-8 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/5 border border-violet-500/20 rounded-3xl hover:border-violet-500/40 transition-all duration-300">
              <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-xs font-bold">
                BEST
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">합격 분석</h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                성적 기반으로 지원 가능한 특목고/자사고 리스트를 분석하고, 
                각 학교별 합격 가능성을 예측합니다.
              </p>
              <div className="flex flex-wrap gap-2">
                {["합격 예측", "학교 비교", "시뮬레이션"].map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs text-violet-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* AI 멘토 */}
            <div className="group relative p-8 bg-gradient-to-br from-blue-600/10 to-cyan-600/5 border border-blue-500/20 rounded-3xl hover:border-blue-500/40 transition-all duration-300">
              <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full text-xs font-bold">
                NEW
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI 멘토</h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                24시간 맞춤형 조언과 학습 전략을 제공합니다. 
                궁금한 점은 언제든 AI에게 물어보세요.
              </p>
              <div className="flex flex-wrap gap-2">
                {["맞춤 조언", "학습 전략", "즉시 응답"].map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 자기소개서 */}
            <div className="group relative p-8 bg-gradient-to-br from-emerald-600/10 to-teal-600/5 border border-emerald-500/20 rounded-3xl hover:border-emerald-500/40 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">자기소개서 코칭</h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                AI가 자기소개서 초안을 작성하고, 첨삭과 피드백을 제공합니다.
                합격 자소서의 패턴을 학습했습니다.
              </p>
              <div className="flex flex-wrap gap-2">
                {["초안 작성", "첨삭", "피드백"].map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 면접 준비 */}
            <div className="group relative p-8 bg-gradient-to-br from-amber-600/10 to-orange-600/5 border border-amber-500/20 rounded-3xl hover:border-amber-500/40 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">면접 준비</h3>
              <p className="text-slate-400 leading-relaxed mb-6">
                학교별 예상 질문을 분석하고, AI와 모의 면접을 진행합니다.
                실전 감각을 키워드립니다.
              </p>
              <div className="flex flex-wrap gap-2">
                {["예상 질문", "모의 면접", "피드백"].map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More Features */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-violet-600/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Calendar, title: "학습 캘린더", desc: "D-Day와 일정 관리", gradient: "from-pink-500 to-rose-500" },
              { icon: TrendingUp, title: "성적 분석", desc: "과목별 추이 분석", gradient: "from-cyan-500 to-blue-500" },
              { icon: BookOpen, title: "비교과 추천", desc: "맞춤형 활동 추천", gradient: "from-purple-500 to-violet-500" },
              { icon: Award, title: "성취 뱃지", desc: "동기부여 시스템", gradient: "from-yellow-500 to-orange-500" },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                <p className="text-slate-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 relative" id="pricing">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full text-fuchsia-300 text-sm mb-6">
              <Zap className="w-4 h-4" />
              <span>합리적인 가격</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              입시 컨설팅 패키지
            </h2>
            <p className="text-slate-400 text-lg">
              필요에 맞게 선택하세요. 언제든 업그레이드 가능합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {/* Starter */}
            <div className="relative p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all duration-300 flex flex-col">
              {/* Header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-300">Starter</h3>
                <p className="text-slate-500 text-sm mt-1">입시 준비 시작하기</p>
              </div>

              {/* Price */}
              <div className="h-20 mb-6">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">무료</span>
                </div>
                <p className="text-slate-500 text-sm">평생 무료</p>
              </div>

              {/* Features - flex-grow to push button to bottom */}
              <ul className="space-y-3 flex-grow">
                {["기본 프로필 관리", "월 3회 AI 분석", "학교 정보 열람", "커뮤니티 접근", "-", "-"].map((feature, fi) => (
                  <li key={fi} className={`flex items-center gap-3 text-sm ${feature === "-" ? "invisible" : ""}`}>
                    <div className="w-5 h-5 rounded-full bg-slate-700/50 flex items-center justify-center">
                      <Check className="w-3 h-3 text-slate-400" />
                    </div>
                    <span className="text-slate-400">{feature === "-" ? "placeholder" : feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button - always at bottom */}
              <button
                onClick={() => handlePlanSelect("FREE")}
                className="w-full py-3.5 rounded-xl font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-all mt-8"
              >
                무료로 시작
              </button>
            </div>

            {/* Pro - Popular */}
            <div className="relative p-8 bg-gradient-to-b from-violet-600/20 to-fuchsia-600/10 border-2 border-violet-500/50 rounded-3xl md:scale-105 shadow-xl shadow-violet-500/10 flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
                <Star className="w-4 h-4" />
                BEST 선택
              </div>

              {/* Header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold">Pro</h3>
                <p className="text-slate-400 text-sm mt-1">본격적인 입시 준비</p>
              </div>

              {/* Price */}
              <div className="h-20 mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-lg text-slate-500 line-through">₩59,000</span>
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-xs font-bold rounded">33% 할인</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">₩39,900</span>
                  <span className="text-slate-400">/월</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-grow">
                {["무제한 AI 분석", "맞춤형 플래너", "상세 리포트", "비교과 추천", "자소서 코칭", "이메일 서포트"].map((feature, fi) => (
                  <li key={fi} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-violet-400" />
                    </div>
                    <span className="text-slate-200">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                onClick={() => handlePlanSelect("BASIC")}
                className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 transition-all shadow-lg shadow-violet-500/25 mt-8"
              >
                Pro 시작하기
              </button>
            </div>

            {/* Premium */}
            <div className="relative p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-all duration-300 flex flex-col">
              <div className="absolute top-4 right-4 px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
                한정 수량
              </div>

              {/* Header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-300">Premium</h3>
                <p className="text-slate-500 text-sm mt-1">전문가와 함께하는 프리미엄</p>
              </div>

              {/* Price */}
              <div className="h-20 mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-lg text-slate-500 line-through">₩150,000</span>
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-xs font-bold rounded">34% 할인</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">₩99,000</span>
                  <span className="text-slate-400">/월</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-grow">
                {["Pro의 모든 기능", "1:1 전문가 상담", "우선 서포트", "전략 리포트", "보호자 대시보드", "모의 면접"].map((feature, fi) => (
                  <li key={fi} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-amber-400" />
                    </div>
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                onClick={() => handlePlanSelect("PREMIUM")}
                className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 transition-all shadow-lg shadow-amber-500/25 mt-8"
              >
                Premium 시작
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-10 text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm">안전한 결제</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-sm">빠른 분석</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm">전문가 검증</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <Bot className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-sm">24시간 AI</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-white">지금 바로</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              3분 안에 시작하세요
            </span>
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            생기부 정보만 입력하면 5분 안에 맞춤형 합격 전략을 받아볼 수 있습니다.
            AI와 함께 합격의 꿈을 현실로 만드세요.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold text-lg hover:opacity-90 transition-all shadow-xl shadow-violet-500/30"
            >
              무료로 시작하기
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={handleDemoClick}
              disabled={demoLoading}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all"
            >
              {demoLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              데모 체험
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-[#05050A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-xl font-black italic text-white tracking-tight">
                  3m<span className="text-yellow-400">⚡</span>5m
                </span>
                <p className="text-xs text-slate-500 -mt-0.5">생기부 입력 3분, 합격 전략 5분</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/terms" className="hover:text-white transition-colors">이용약관</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
              <Link href="/contact" className="hover:text-white transition-colors">문의하기</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-slate-600">
            © 2025 3m5m. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
