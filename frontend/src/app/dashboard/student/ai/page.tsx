"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap,
  Brain,
  Sparkles,
  BookOpen,
  Users,
  Target,
  LogOut,
  Send,
  Loader2
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

type AIService = "record-sentence" | "club" | "subject" | "reading" | "action-plan";

export default function AIPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeService, setActiveService] = useState<AIService>("record-sentence");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "STUDENT") {
      router.push("/login");
      return;
    }
    
    setUser(parsedUser);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null;

  const services = [
    {
      id: "record-sentence" as AIService,
      icon: Sparkles,
      title: "세특 문장 생성",
      description: "활동 내용을 세특 문장으로 변환",
    },
    {
      id: "club" as AIService,
      icon: Users,
      title: "동아리 추천",
      description: "진로에 맞는 동아리 추천",
    },
    {
      id: "subject" as AIService,
      icon: BookOpen,
      title: "과목 선택 조언",
      description: "선택 과목 조언",
    },
    {
      id: "reading" as AIService,
      icon: BookOpen,
      title: "독서 추천",
      description: "진로별 추천 도서",
    },
    {
      id: "action-plan" as AIService,
      icon: Target,
      title: "실행 계획 생성",
      description: "맞춤형 실행 계획",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => router.push("/dashboard/student")}
              >
                <GraduationCap className="w-8 h-8 text-sky-600" />
                <span className="text-xl font-bold text-gray-900">입시로드맵</span>
              </div>
              <nav className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => router.push("/dashboard/student")}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  대시보드
                </button>
                <button className="text-sm text-sky-600 font-semibold">
                  AI 조언
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.name} 학생</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI 조언</h1>
          </div>
          <p className="text-gray-600">GPT-5 기반 AI가 맞춤형 조언을 제공합니다</p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {services.map((service) => {
            const Icon = service.icon;
            const isActive = activeService === service.id;
            return (
              <button
                key={service.id}
                onClick={() => {
                  setActiveService(service.id);
                  setResult(null);
                }}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  isActive
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 bg-white hover:border-purple-300"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  isActive ? "bg-purple-100" : "bg-gray-100"
                }`}>
                  <Icon className={`w-6 h-6 ${isActive ? "text-purple-600" : "text-gray-600"}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{service.title}</h3>
                <p className="text-sm text-gray-500">{service.description}</p>
              </button>
            );
          })}
        </div>

        {/* AI Service Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <AIServiceContent
            service={activeService}
            result={result}
            setResult={setResult}
            loading={loading}
            setLoading={setLoading}
          />
        </div>

        {/* Note */}
        <div className="mt-8 p-4 bg-purple-50 rounded-xl border border-purple-200">
          <p className="text-sm text-purple-700">
            💡 <strong>Tip:</strong> AI 조언은 참고용이며, 최종 결정은 본인과 선생님과 함께 하세요.
          </p>
        </div>
      </main>
    </div>
  );
}

function AIServiceContent({ service, result, setResult, loading, setLoading }: {
  service: AIService;
  result: any;
  setResult: (result: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}) {
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      let endpoint = "";
      let body: any = {};

      switch (service) {
        case "record-sentence":
          endpoint = "http://localhost:3000/api/ai/record-sentence";
          body = { activityDescription: input };
          break;
        case "club":
          endpoint = "http://localhost:3000/api/ai/recommend/club";
          body = { careerInterest: input };
          break;
        case "subject":
          endpoint = "http://localhost:3000/api/ai/advice/subject";
          body = { targetMajor: input };
          break;
        case "reading":
          endpoint = "http://localhost:3000/api/ai/recommend/reading";
          body = { careerInterest: input };
          break;
        case "action-plan":
          endpoint = "http://localhost:3000/api/ai/action-plan";
          body = { targetSchoolId: input };
          break;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const error = await res.json();
        alert(error.message || "요청에 실패했습니다");
      }
    } catch (error) {
      alert("오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (service) {
      case "record-sentence":
        return "활동 내용을 입력하세요 (예: 과학 실험 동아리에서 물리 실험 진행)";
      case "club":
        return "진로 관심사를 입력하세요 (예: 소프트웨어 개발, 의학)";
      case "subject":
        return "목표 전공을 입력하세요 (예: 컴퓨터공학, 의예과)";
      case "reading":
        return "진로 관심사를 입력하세요 (예: 경영, 법학)";
      case "action-plan":
        return "목표 학교 ID를 입력하세요";
      default:
        return "내용을 입력하세요";
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholder()}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                실행
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result */}
      {result && (
        <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-gray-900 mb-3">AI 조언 결과</h3>
          <div className="prose max-w-none">
            {service === "record-sentence" && (
              <p className="text-gray-700 whitespace-pre-wrap">{result.generatedSentence || result.output}</p>
            )}
            {service === "club" && (
              <div>
                {result.recommendations?.map((rec: string, i: number) => (
                  <div key={i} className="mb-2">
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            )}
            {service === "subject" && (
              <p className="text-gray-700 whitespace-pre-wrap">{result.advice || result.output}</p>
            )}
            {service === "reading" && (
              <div>
                {result.bookRecommendations?.map((book: any, i: number) => (
                  <div key={i} className="mb-3 pb-3 border-b border-purple-200 last:border-0">
                    <h4 className="font-semibold text-gray-900">{book.title || book}</h4>
                    {book.reason && <p className="text-sm text-gray-600 mt-1">{book.reason}</p>}
                  </div>
                ))}
              </div>
            )}
            {service === "action-plan" && (
              <div>
                <p className="text-gray-700 mb-4">{result.overview}</p>
                <div className="space-y-2">
                  {result.weeklyTasks?.map((task: any, i: number) => (
                    <div key={i} className="text-sm text-gray-600">
                      Week {i + 1}: {task.title || task}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



