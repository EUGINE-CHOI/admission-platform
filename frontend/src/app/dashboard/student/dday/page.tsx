'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { API_URL } from '@/lib/api';
import { 
  Calendar, Clock, Bell, Plus, 
  CheckCircle, Circle, AlertTriangle, Target 
} from 'lucide-react';

interface DDayItem {
  id: string;
  title: string;
  date: string;
  daysLeft: number;
  type: 'admission' | 'task' | 'exam' | 'custom';
  school?: string;
  priority: 'urgent' | 'important' | 'normal';
  description?: string;
}

interface DDayDashboard {
  mainDDay: DDayItem | null;
  upcoming: DDayItem[];
  passed: DDayItem[];
  milestones: {
    title: string;
    date: string;
    completed: boolean;
  }[];
  timeline: {
    month: string;
    events: DDayItem[];
  }[];
}

export default function DDayPage() {
  const [dashboard, setDashboard] = useState<DDayDashboard | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDDay, setNewDDay] = useState({ title: '', date: '', description: '' });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [dashRes, alertRes] = await Promise.all([
        fetch(`${API_URL}/v1/dday/dashboard`, { headers }),
        fetch(`${API_URL}/v1/dday/alerts`, { headers }),
      ]);

      if (dashRes.ok) {
        setDashboard(await dashRes.json());
      }
      if (alertRes.ok) {
        const data = await alertRes.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching D-Day data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCustomDDay = async () => {
    if (!newDDay.title || !newDDay.date) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/v1/dday/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newDDay),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewDDay({ title: '', date: '', description: '' });
        fetchDashboard();
      }
    } catch (error) {
      console.error('Error adding D-Day:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'important': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'admission': return <Target className="w-4 h-4 text-blue-500" />;
      case 'exam': return <Clock className="w-4 h-4 text-purple-500" />;
      case 'task': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Calendar className="w-4 h-4 text-gray-500" />;
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">D-Day 대시보드</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          D-Day 추가
        </button>
      </div>

      {/* 알림 */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <Bell className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-800">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* 메인 D-Day */}
      {dashboard?.mainDDay && (
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              {getTypeIcon(dashboard.mainDDay.type)}
              <span className="text-blue-100">{dashboard.mainDDay.school || '다가오는 일정'}</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">{dashboard.mainDDay.title}</h2>
            <div className="text-6xl font-bold mb-2">
              D{dashboard.mainDDay.daysLeft > 0 ? '-' : '+'}{Math.abs(dashboard.mainDDay.daysLeft)}
            </div>
            <p className="text-blue-100">
              {new Date(dashboard.mainDDay.date).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 다가오는 일정 */}
      <Card padding="none">
        <div className="p-4 border-b flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span className="font-semibold">다가오는 일정</span>
        </div>
        <div className="p-4">
          {dashboard?.upcoming && dashboard.upcoming.length > 0 ? (
            <div className="space-y-3">
              {dashboard.upcoming.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border ${getPriorityColor(item.priority)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(item.type)}
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.school && (
                          <p className="text-sm opacity-75">{item.school}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        D{item.daysLeft > 0 ? '-' : '+'}{Math.abs(item.daysLeft)}
                      </div>
                      <p className="text-xs opacity-75">
                        {new Date(item.date).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  {item.description && (
                    <p className="mt-2 text-sm opacity-75">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>다가오는 일정이 없습니다</p>
            </div>
          )}
        </div>
      </Card>

      {/* 마일스톤 */}
      {dashboard?.milestones && dashboard.milestones.length > 0 && (
        <Card padding="none">
          <div className="p-4 border-b flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">입시 마일스톤</span>
          </div>
          <div className="p-4">
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {dashboard.milestones.map((milestone, i) => (
                  <div key={i} className="flex items-center gap-4 relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                      milestone.completed ? 'bg-green-500' : 'bg-white border-2 border-gray-300'
                    }`}>
                      {milestone.completed ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className={milestone.completed ? 'text-gray-500 line-through' : 'font-medium'}>
                        {milestone.title}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(milestone.date).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 타임라인 */}
      {dashboard?.timeline && dashboard.timeline.length > 0 && (
        <Card padding="none">
          <div className="p-4 border-b">
            <span className="font-semibold">월별 타임라인</span>
          </div>
          <div className="p-4">
            <div className="space-y-6">
              {dashboard.timeline.map((month) => (
                <div key={month.month}>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">{month.month}</h3>
                  <div className="space-y-2">
                    {month.events.map((event) => (
                      <div key={event.id} className="flex items-center gap-3 text-sm">
                        {getTypeIcon(event.type)}
                        <span>{event.title}</span>
                        <Badge variant="outline">D-{event.daysLeft}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">D-Day 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  value={newDDay.title}
                  onChange={(e) => setNewDDay({ ...newDDay, title: e.target.value })}
                  placeholder="예: 수학 기말고사"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                <input
                  type="date"
                  value={newDDay.date}
                  onChange={(e) => setNewDDay({ ...newDDay, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명 (선택)</label>
                <textarea
                  value={newDDay.description}
                  onChange={(e) => setNewDDay({ ...newDDay, description: e.target.value })}
                  placeholder="간단한 설명을 입력하세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={addCustomDDay}
                disabled={!newDDay.title || !newDDay.date}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

