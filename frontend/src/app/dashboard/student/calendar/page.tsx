'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Target,
  CheckSquare,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getApiUrl, getToken } from '@/lib/api';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'dday' | 'task' | 'schedule' | 'consultation';
  status?: string;
  priority?: number;
  description?: string;
}

interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');

  // 현재 월의 첫째 날과 마지막 날
  const getMonthDays = (): DayCell[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 이전 달의 마지막 날들
    const startDay = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const days: DayCell[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 이전 달
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        events: getEventsForDate(date),
      });
    }
    
    // 현재 달
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        events: getEventsForDate(date),
      });
    }
    
    // 다음 달
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        events: getEventsForDate(date),
      });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  // 데이터 로드
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = getToken();
        const headers = { Authorization: `Bearer ${token}` };

        // D-Day 이벤트 조회
        const ddayRes = await fetch(`${getApiUrl()}/api/v1/dashboard/dday`, { headers });
        const ddayData = ddayRes.ok ? await ddayRes.json() : [];

        // 태스크 조회
        const taskRes = await fetch(`${getApiUrl()}/api/v1/students/me/action-plan`, { headers });
        const taskData = taskRes.ok ? await taskRes.json() : null;

        // 상담 일정 조회
        const consultRes = await fetch(`${getApiUrl()}/api/v1/consultations/my`, { headers });
        const consultData = consultRes.ok ? await consultRes.json() : [];

        const allEvents: CalendarEvent[] = [];

        // D-Day 이벤트 변환
        if (Array.isArray(ddayData)) {
          ddayData.forEach((item: any) => {
            allEvents.push({
              id: item.id,
              title: item.title,
              date: new Date(item.date || item.targetDate),
              type: 'dday',
              description: item.note,
            });
          });
        }

        // 태스크 변환
        if (taskData?.weeklyTasks) {
          taskData.weeklyTasks.forEach((task: any) => {
            if (task.dueDate) {
              allEvents.push({
                id: task.id,
                title: task.title,
                date: new Date(task.dueDate),
                type: 'task',
                status: task.status,
                description: task.description,
              });
            }
          });
        }

        // 상담 일정 변환
        if (Array.isArray(consultData)) {
          consultData.forEach((consult: any) => {
            if (consult.scheduledAt) {
              allEvents.push({
                id: consult.id,
                title: `상담: ${consult.topic || '예약된 상담'}`,
                date: new Date(consult.scheduledAt),
                type: 'consultation',
                status: consult.status,
              });
            }
          });
        }

        setEvents(allEvents);
      } catch (error) {
        console.error('Failed to load calendar events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'dday': return 'bg-red-500';
      case 'task': return 'bg-blue-500';
      case 'schedule': return 'bg-green-500';
      case 'consultation': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'dday': return 'D-Day';
      case 'task': return '할 일';
      case 'schedule': return '일정';
      case 'consultation': return '상담';
      default: return '기타';
    }
  };

  const days = getMonthDays();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">학습 캘린더</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            D-Day, 할 일, 상담 일정을 한눈에 확인하세요
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            오늘
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 캘린더 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <button
                onClick={goToPrevMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold">
                {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map((day, i) => (
                <div
                  key={day}
                  className={`text-center text-sm font-medium py-2 ${
                    i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dayOfWeek = day.date.getDay();
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={`
                      min-h-[80px] p-1 border rounded-lg text-left transition-colors
                      ${day.isCurrentMonth 
                        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400'
                      }
                      ${day.isToday ? 'ring-2 ring-blue-500' : ''}
                      ${selectedDate?.getTime() === day.date.getTime() ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
                      hover:bg-gray-50 dark:hover:bg-gray-700
                    `}
                  >
                    <span className={`
                      text-sm font-medium
                      ${dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : ''}
                      ${day.isToday ? 'text-blue-600 font-bold' : ''}
                    `}>
                      {day.date.getDate()}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {day.events.slice(0, 3).map((event, i) => (
                        <div
                          key={event.id}
                          className={`${getEventColor(event.type)} text-white text-xs px-1 py-0.5 rounded truncate`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {day.events.length > 3 && (
                        <div className="text-xs text-gray-400">
                          +{day.events.length - 3}개
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 사이드바 - 선택된 날짜의 이벤트 */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {selectedDate 
                ? `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`
                : '날짜를 선택하세요'
              }
            </h3>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                선택한 날짜에 일정이 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map(event => (
                  <div
                    key={event.id}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 mt-1.5 rounded-full ${getEventColor(event.type)}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="default" className="text-xs">
                            {getEventTypeLabel(event.type)}
                          </Badge>
                          {event.status && (
                            <Badge 
                              variant={event.status === 'DONE' || event.status === 'COMPLETED' ? 'success' : 'default'}
                              className="text-xs"
                            >
                              {event.status}
                            </Badge>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-600 dark:text-gray-400">D-Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-600 dark:text-gray-400">할 일</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-gray-600 dark:text-gray-400">상담</span>
        </div>
      </div>
    </div>
  );
}

