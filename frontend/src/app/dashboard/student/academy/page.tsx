'use client';

import { School, Bell, CheckCircle, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export default function AcademyPage() {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <Card className="max-w-md text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <School className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            학원/과외 매칭
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            나에게 맞는 학원과 과외 선생님을 찾아주는 서비스가 준비 중입니다.
          </p>
          
          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>지역별 학원 검색</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>과목별 과외 선생님 매칭</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>수강생 리뷰 및 평점</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-5 h-5 text-green-500" />
              <span>거리 기반 추천</span>
            </div>
          </div>

          <button className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2">
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




