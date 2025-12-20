'use client';

import { GraduationCap, Bell, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export default function CollegePage() {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <Card className="max-w-md text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            대입 서비스
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            수능, 내신, 대학 입시 정보를 제공하는 서비스가 준비 중입니다.
          </p>
          
          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>수능 성적 분석 및 예측</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>대학별 입시 정보 제공</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>학과별 취업률 및 전망</span>
            </div>
          </div>

          <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2">
            <Bell className="w-4 h-4" />
            출시 알림 받기
          </button>
          
          <p className="text-xs text-gray-400 mt-4">
            2025년 상반기 출시 예정
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


