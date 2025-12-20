'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { getApiUrl, getToken } from '@/lib/api';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'consultant' | 'system';
  senderName?: string;
  timestamp: Date;
}

interface Consultation {
  id: string;
  topic: string;
  status: string;
  consultant?: {
    name: string;
  };
}

export default function ChatPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 상담 목록 로드
  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${getApiUrl()}/api/v1/consultations/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setConsultations(data.filter((c: Consultation) => 
            c.status === 'CONFIRMED' || c.status === 'IN_PROGRESS'
          ));
        }
      } catch (error) {
        console.error('Failed to load consultations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 상담 선택 시 메시지 로드
  const selectConsultation = async (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setMessages([
      {
        id: '1',
        content: `${consultation.consultant?.name || '컨설턴트'}와의 상담이 시작되었습니다. 주제: ${consultation.topic}`,
        sender: 'system',
        timestamp: new Date(),
      },
    ]);
    
    // TODO: 실제 메시지 로드 API 연동
    // const messages = await fetchMessages(consultation.id);
    // setMessages(messages);
  };

  // 메시지 전송
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConsultation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      senderName: '나',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setSending(true);

    // TODO: 실제 메시지 전송 API 연동
    // await sendMessageApi(selectedConsultation.id, newMessage);

    // 시뮬레이션 응답
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: '메시지를 확인했습니다. 곧 답변 드리겠습니다.',
        sender: 'consultant',
        senderName: selectedConsultation.consultant?.name || '컨설턴트',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, response]);
      setSending(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">상담 채팅</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          컨설턴트와 실시간으로 대화하세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* 상담 목록 */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardHeader>
            <h3 className="font-semibold">진행 중인 상담</h3>
          </CardHeader>
          <CardContent className="p-0">
            {consultations.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8 px-4">
                진행 중인 상담이 없습니다
              </p>
            ) : (
              <div className="divide-y dark:divide-gray-700">
                {consultations.map(consultation => (
                  <button
                    key={consultation.id}
                    onClick={() => selectConsultation(consultation)}
                    className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedConsultation?.id === consultation.id
                        ? 'bg-blue-50 dark:bg-blue-900/30'
                        : ''
                    }`}
                  >
                    <p className="font-medium text-sm truncate">{consultation.topic}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {consultation.consultant?.name || '컨설턴트'}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 채팅 영역 */}
        <Card className="lg:col-span-3 flex flex-col overflow-hidden">
          {!selectedConsultation ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              상담을 선택해주세요
            </div>
          ) : (
            <>
              {/* 채팅 헤더 */}
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="font-semibold">{selectedConsultation.topic}</h3>
                <p className="text-sm text-gray-500">
                  {selectedConsultation.consultant?.name || '컨설턴트'}
                </p>
              </div>

              {/* 메시지 영역 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'system' ? (
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-sm text-gray-500 text-center max-w-md">
                        {message.content}
                      </div>
                    ) : (
                      <div className={`flex gap-2 max-w-[70%] ${
                        message.sender === 'user' ? 'flex-row-reverse' : ''
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div className={`rounded-lg px-4 py-2 ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'user'
                              ? 'text-blue-100'
                              : 'text-gray-400'
                          }`}>
                            {message.timestamp.toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* 입력 영역 */}
              <div className="p-4 border-t dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 px-4 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={sending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}




