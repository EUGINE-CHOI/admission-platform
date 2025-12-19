'use client';

import { Users, Bell, CheckCircle, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export default function MentoringPage() {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <Card className="max-w-md text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            멘토링 프로그램
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            합격생 선배와 1:1 멘토링을 받을 수 있는 서비스가 준비 중입니다.
          </p>
          
          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <span>목표 학교 합격생 멘토 매칭</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <span>1:1 화상 멘토링</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <span>학교생활 꿀팁 공유</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Star className="w-5 h-5 text-purple-500" />
              <span>멘토 평점 시스템</span>
            </div>
          </div>

          <button className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2">
            <Bell className="w-4 h-4" />
            출시 알림 받기
          </button>
          
          <p className="text-xs text-gray-400 mt-4">
            2025년 하반기 출시 예정
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

