"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Loader2, User, Users, Briefcase, School, Search, MapPin, ExternalLink, X, ArrowLeft, Check } from "lucide-react";
import { getApiUrl } from "@/lib/api";

type Role = "STUDENT" | "PARENT" | "CONSULTANT";

interface MiddleSchool {
  id: string;
  name: string;
  region: string;
  district: string | null;
  website: string | null;
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [grade, setGrade] = useState<number | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [schoolSearch, setSchoolSearch] = useState("");
  const [schoolResults, setSchoolResults] = useState<MiddleSchool[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<MiddleSchool | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const searchRef = useRef<HTMLDivElement>(null);

  const roles = [
    { id: "STUDENT" as Role, icon: User, title: "학생", description: "입시 준비를 하고 있어요" },
    { id: "PARENT" as Role, icon: Users, title: "보호자", description: "학생의 입시를 함께해요" },
    { id: "CONSULTANT" as Role, icon: Briefcase, title: "컨설턴트", description: "전문가로 활동해요" },
  ];

  useEffect(() => {
    const searchSchools = async () => {
      if (schoolSearch.length < 1) {
        setSchoolResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const params = new URLSearchParams();
        params.append("query", schoolSearch);
        if (selectedRegion) params.append("region", selectedRegion);
        const res = await fetch(`${getApiUrl()}/api/middle-schools/search?${params}`);
        const data = await res.json();
        setSchoolResults(data.schools || []);
      } catch (err) {
        console.error("학교 검색 실패:", err);
      } finally {
        setIsSearching(false);
      }
    };
    const debounceTimer = setTimeout(searchSchools, 300);
    return () => clearTimeout(debounceTimer);
  }, [schoolSearch, selectedRegion]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSchool = (school: MiddleSchool) => {
    setSelectedSchool(school);
    setSchoolSearch(school.name);
    setShowDropdown(false);
  };

  const handleClearSchool = () => {
    setSelectedSchool(null);
    setSchoolSearch("");
  };

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
      const res = await fetch(`${getApiUrl()}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, password, role,
          middleSchoolId: selectedSchool?.id,
          schoolName: selectedSchool ? undefined : (schoolSearch || undefined),
          grade: grade || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "회원가입에 실패했습니다");
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center px-4 py-12">
      {/* Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-fuchsia-600/15 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">3m5m</span>
        </Link>

        {/* Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? "bg-violet-600" : "bg-white/10"}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <div className={`w-16 h-0.5 ${step >= 2 ? "bg-violet-600" : "bg-white/10"}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? "bg-violet-600" : "bg-white/10"}`}>
              2
            </div>
          </div>

          {step === 1 ? (
            <>
              <h1 className="text-2xl font-bold text-center mb-2">회원 유형 선택</h1>
              <p className="text-slate-400 text-center mb-8">어떤 목적으로 사용하시나요?</p>

              <div className="space-y-3">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setRole(r.id); setStep(2); }}
                    className="w-full p-4 rounded-xl border border-white/10 text-left transition-all hover:border-violet-500/50 hover:bg-violet-500/10 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-violet-500/20 flex items-center justify-center transition-colors">
                        <r.icon className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{r.title}</h3>
                        <p className="text-sm text-slate-400">{r.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> 이전
              </button>

              <h1 className="text-2xl font-bold text-center mb-2">회원가입</h1>
              <p className="text-slate-400 text-center mb-6">{roles.find((r) => r.id === role)?.title}으로 가입</p>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">이름</label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">이메일</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">비밀번호</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8자 이상" required minLength={8}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all pr-12"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">비밀번호 확인</label>
                  <input
                    type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="비밀번호 재입력" required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                  />
                </div>

                {(role === "STUDENT" || role === "PARENT") && (
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    <div className="flex items-center gap-2 text-violet-400">
                      <School className="w-5 h-5" />
                      <span className="font-medium">{role === "STUDENT" ? "재학 학교" : "자녀 학교"}</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">지역</label>
                      <select
                        value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-slate-900">전체</option>
                        <option value="서울" className="bg-slate-900">서울</option>
                        <option value="인천" className="bg-slate-900">인천</option>
                      </select>
                    </div>

                    <div ref={searchRef} className="relative">
                      <label className="block text-sm font-medium text-slate-300 mb-2">중학교</label>
                      {selectedSchool ? (
                        <div className="flex items-center gap-2 p-3 bg-violet-500/10 border border-violet-500/30 rounded-xl">
                          <School className="w-5 h-5 text-violet-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{selectedSchool.name}</p>
                            <p className="text-xs text-slate-400">{selectedSchool.region} {selectedSchool.district}</p>
                          </div>
                          {selectedSchool.website && (
                            <a href={selectedSchool.website} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button type="button" onClick={handleClearSchool} className="text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="text" value={schoolSearch}
                            onChange={(e) => { setSchoolSearch(e.target.value); setShowDropdown(true); }}
                            onFocus={() => setShowDropdown(true)}
                            placeholder="학교명 검색"
                            className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                          />
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400 animate-spin" />}
                        </div>
                      )}

                      {showDropdown && !selectedSchool && schoolSearch.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                          {schoolResults.length === 0 ? (
                            <div className="p-4 text-center text-slate-400 text-sm">{isSearching ? "검색 중..." : "결과 없음"}</div>
                          ) : (
                            schoolResults.map((school) => (
                              <button key={school.id} type="button" onClick={() => handleSelectSchool(school)}
                                className="w-full px-4 py-3 text-left hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-colors">
                                <div className="flex items-center gap-2">
                                  <School className="w-4 h-4 text-slate-400" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{school.name}</p>
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                      <MapPin className="w-3 h-3" />
                                      <span>{school.region} {school.district}</span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">학년</label>
                      <select
                        value={grade} onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : "")}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-slate-900">선택</option>
                        <option value="1" className="bg-slate-900">중1</option>
                        <option value="2" className="bg-slate-900">중2</option>
                        <option value="3" className="bg-slate-900">중3</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit" disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
                >
                  {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />가입 중...</>) : "회원가입"}
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-slate-400">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
