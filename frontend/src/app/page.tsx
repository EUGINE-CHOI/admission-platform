"use client";

import Link from "next/link";
import { GraduationCap, Users, BarChart3, BookOpen, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              입시로드맵
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              무료로 시작하기
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              입시 정보 격차,{" "}
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                이제 없애세요
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              AI 기반 맞춤형 진단과 전문 컨설턴트의 조언으로
              <br />
              우리 아이에게 딱 맞는 고등학교를 찾아드립니다.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-primary-600/30"
              >
                무료 진단 시작하기
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition-colors border border-gray-200"
              >
                서비스 소개
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              왜 입시로드맵인가요?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              데이터와 AI로 더 정확하게, 전문가와 함께 더 안전하게
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BarChart3,
                title: "AI 맞춤 진단",
                description: "학생 데이터를 분석하여 최적의 학교를 추천합니다",
                color: "primary",
              },
              {
                icon: BookOpen,
                title: "생기부 작성 가이드",
                description: "AI가 활동 기록을 바탕으로 문장을 생성합니다",
                color: "accent",
              },
              {
                icon: Users,
                title: "전문 컨설팅",
                description: "검증된 전문가의 1:1 맞춤 상담을 받으세요",
                color: "primary",
              },
              {
                icon: GraduationCap,
                title: "입시 정보",
                description: "전국 학교의 입시 정보를 한눈에 확인하세요",
                color: "accent",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    feature.color === "primary"
                      ? "bg-primary-100 text-primary-600"
                      : "bg-accent-100 text-accent-600"
                  } group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              합리적인 가격
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              무료로 시작하고, 필요할 때 업그레이드하세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "무료",
                price: "₩0",
                features: ["기본 데이터 입력", "월 1회 진단", "학교 정보 조회"],
                cta: "무료로 시작",
                popular: false,
              },
              {
                name: "베이직",
                price: "₩29,900",
                period: "/월",
                features: ["무제한 진단", "AI 조언 무제한", "액션 플랜 생성", "진단 리포트"],
                cta: "베이직 시작",
                popular: true,
              },
              {
                name: "프리미엄",
                price: "₩49,900",
                period: "/월",
                features: ["베이직 모든 기능", "전문 컨설턴트 상담 2회", "맞춤형 상담 리포트", "우선 고객 지원"],
                cta: "프리미엄 시작",
                popular: false,
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl ${
                  plan.popular
                    ? "bg-primary-600 text-white ring-4 ring-primary-600 ring-offset-4"
                    : "bg-white border border-gray-200"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    인기
                  </span>
                )}
                <h3
                  className={`text-xl font-semibold ${
                    plan.popular ? "text-white" : "text-gray-900"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span
                      className={`ml-1 ${
                        plan.popular ? "text-primary-100" : "text-gray-500"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-5 h-5 ${
                          plan.popular ? "text-primary-200" : "text-primary-500"
                        }`}
                      />
                      <span
                        className={plan.popular ? "text-primary-50" : "text-gray-600"}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`mt-8 w-full py-3 rounded-xl font-semibold transition-colors ${
                    plan.popular
                      ? "bg-white text-primary-600 hover:bg-primary-50"
                      : "bg-primary-600 text-white hover:bg-primary-700"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            지금 바로 시작하세요
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            3분이면 우리 아이에게 맞는 학교를 찾을 수 있습니다
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 mt-8 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg"
          >
            무료로 시작하기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary-400" />
              <span className="text-lg font-semibold text-white">입시로드맵</span>
            </div>
            <p className="text-sm">
              © 2025 입시로드맵. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}




