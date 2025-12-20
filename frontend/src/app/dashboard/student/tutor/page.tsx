'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, Loader2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { getApiUrl, getToken } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUBJECTS = ['국어', '영어', '수학', '과학', '사회', '역사', '일반'];

const EXAMPLE_QUESTIONS = [
  '이차방정식의 근의 공식을 설명해줘',
  '영어 현재완료와 과거시제의 차이점은?',
  '광합성의 과정을 간단히 설명해줘',
  '조선 건국의 배경은 무엇인가요?',
];

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('일반');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 로컬 스토리지에서 대화 기록 로드
  useEffect(() => {
    const saved = localStorage.getItem('tutor_messages');
    if (saved) {
      const parsed = JSON.parse(saved);
      setMessages(parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })));
    }
  }, []);

  // 대화 기록 저장
  const saveMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    localStorage.setItem('tutor_messages', JSON.stringify(newMessages));
  };

  // 메시지 전송
  const sendMessage = async (content?: string) => {
    const messageContent = content || input.trim();
    if (!messageContent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    saveMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const token = getToken();
      const res = await fetch(`${getApiUrl()}/api/v1/ai/tutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: messageContent,
          subject: subject,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      let aiResponse = '';
      
      if (res.ok) {
        const data = await res.json();
        aiResponse = data.answer || data.response || '답변을 생성하지 못했습니다.';
      } else {
        // API가 없으면 시뮬레이션 응답
        aiResponse = generateSimulatedResponse(messageContent, subject);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      saveMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('AI 응답 오류:', error);
      
      // 오류 시 시뮬레이션 응답
      const simulatedResponse = generateSimulatedResponse(messageContent, subject);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: simulatedResponse,
        timestamp: new Date(),
      };

      saveMessages([...newMessages, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 시뮬레이션 응답 생성
  const generateSimulatedResponse = (question: string, subj: string): string => {
    const responses: Record<string, string[]> = {
      수학: [
        '좋은 질문이에요! 수학에서는 먼저 문제의 패턴을 파악하는 것이 중요합니다.',
        '이 개념을 이해하려면 기본 공식부터 차근차근 복습해보세요.',
        '실생활 예시를 통해 이해하면 더 쉬워요!',
      ],
      영어: [
        '영어 학습에서 가장 중요한 것은 반복적인 노출이에요.',
        '이 문법 패턴은 예문과 함께 외우면 더 쉽게 기억할 수 있어요.',
        '원어민이 자주 쓰는 표현을 익혀보세요!',
      ],
      과학: [
        '과학적 현상을 이해할 때는 원리부터 파악하는 것이 좋아요.',
        '실험을 통해 직접 확인해보면 더 잘 기억돼요!',
        '이 개념은 일상생활에서도 많이 볼 수 있어요.',
      ],
      default: [
        '흥미로운 질문이네요! 한 번 자세히 살펴볼게요.',
        '이 내용을 이해하려면 몇 가지 핵심 개념을 알아야 해요.',
        '질문해주셔서 감사해요! 함께 공부해봐요.',
      ],
    };

    const subjectResponses = responses[subj] || responses.default;
    const randomResponse = subjectResponses[Math.floor(Math.random() * subjectResponses.length)];
    
    return `${randomResponse}\n\n**${question}**에 대해 답변드릴게요:\n\n이 주제는 ${subj} 과목에서 중요한 개념이에요. 관련 교과서나 참고서를 통해 더 자세히 학습해보시는 것을 추천드려요. 추가 질문이 있으시면 언제든 물어보세요! 📚`;
  };

  // 대화 기록 삭제
  const clearHistory = () => {
    if (confirm('대화 기록을 삭제하시겠습니까?')) {
      saveMessages([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            AI 튜터
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            학습 관련 질문에 AI가 답변해드려요
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
            title="대화 기록 삭제"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 채팅 영역 */}
        <Card className="lg:col-span-3 flex flex-col h-[600px]">
          {/* 과목 선택 */}
          <div className="p-4 border-b dark:border-gray-700">
            <label className="text-sm text-gray-500 mb-2 block">과목 선택</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(subj => (
                <button
                  key={subj}
                  onClick={() => setSubject(subj)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    subject === subj
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 mx-auto text-purple-200 dark:text-purple-800 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  안녕하세요! AI 튜터입니다 👋
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  학습 관련 질문을 해주세요. 어떤 과목이든 도와드릴게요!
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {EXAMPLE_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="px-3 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm hover:bg-purple-100 dark:hover:bg-purple-900/50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                  <p className="text-sm text-gray-500">답변 생성 중...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="질문을 입력하세요..."
                className="flex-1 px-4 py-3 border dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 outline-none"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Card>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 학습 팁 */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                학습 팁
              </h3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>구체적인 질문을 하면 더 정확한 답변을 받을 수 있어요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>이해가 안 되면 예시를 요청해보세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>관련 개념을 함께 물어보면 이해가 더 쉬워요</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 통계 */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">대화 통계</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">총 질문</span>
                  <span className="font-medium">
                    {messages.filter(m => m.role === 'user').length}개
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">현재 과목</span>
                  <span className="font-medium">{subject}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}




