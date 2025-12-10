"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, EyeOff, Loader2, User, Users, Briefcase } from "lucide-react";

type Role = "STUDENT" | "PARENT" | "CONSULTANT";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    {
      id: "STUDENT" as Role,
      icon: User,
      title: "학생",
      description: "중학생으로 입시 준비를 하고 있어요",
    },
    {
      id: "PARENT" as Role,
      icon: Users,
      title: "학부모",
      description: "자녀의 입시를 함께 준비하고 있어요",
    },
    {
      id: "CONSULTANT" as Role,
      icon: Briefcase,
      title: "컨설턴트",
      description: "전문 입시 컨설턴트로 활동하고 싶어요",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "회원가입에 실패했습니다");
      }

      // 회원가입 성공 → 로그인 페이지로
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <GraduationCap className="w-10 h-10 text-primary-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            입시로드맵
          </span>
        </Link>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-primary-600" : "bg-gray-200"}`} />
            <div className={`w-12 h-1 ${step >= 2 ? "bg-primary-600" : "bg-gray-200"}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-primary-600" : "bg-gray-200"}`} />
          </div>

          {step === 1 ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                회원 유형 선택
              </h1>
              <p className="text-gray-500 text-center mb-8">
                어떤 목적으로 사용하시나요?
              </p>

              <div className="space-y-4">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRole(r.id);
                      setStep(2);
                    }}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-primary-500 hover:bg-primary-50 ${
                      role === r.id ? "border-primary-500 bg-primary-50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                        <r.icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{r.title}</h3>
                        <p className="text-sm text-gray-500">{r.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="text-gray-500 hover:text-gray-700 text-sm mb-4"
              >
                ← 이전 단계
              </button>

              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                회원가입
              </h1>
              <p className="text-gray-500 text-center mb-8">
                {roles.find((r) => r.id === role)?.title}으로 가입합니다
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="8자 이상"
                      required
                      minLength={8}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 확인
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      가입 중...
                    </>
                  ) : (
                    "회원가입"
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

