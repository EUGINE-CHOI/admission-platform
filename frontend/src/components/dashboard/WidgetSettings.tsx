'use client';

import { useState } from 'react';
import { Settings, Eye, EyeOff, GripVertical, RotateCcw, X } from 'lucide-react';
import { WidgetConfig } from '@/hooks/useWidgetSettings';

interface WidgetSettingsProps {
  widgets: WidgetConfig[];
  onToggle: (widgetId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onReset: () => void;
}

export function WidgetSettingsButton({
  widgets,
  onToggle,
  onReorder,
  onReset,
}: WidgetSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    onReorder(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <>
      {/* 설정 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="위젯 설정"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* 설정 모달 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">대시보드 위젯 설정</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 위젯 목록 */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <p className="text-sm text-gray-500 mb-4">
                드래그하여 순서를 변경하고, 토글로 위젯을 숨기거나 표시하세요.
              </p>
              
              <div className="space-y-2">
                {widgets.map((widget, index) => (
                  <div
                    key={widget.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`
                      flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-move
                      ${draggedIndex === index ? 'opacity-50' : ''}
                      ${widget.enabled ? '' : 'opacity-60'}
                    `}
                  >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    
                    <span className="flex-1 font-medium text-sm">
                      {widget.name}
                    </span>
                    
                    <button
                      onClick={() => onToggle(widget.id)}
                      className={`
                        p-1.5 rounded-lg transition-colors
                        ${widget.enabled 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-100'
                        }
                      `}
                    >
                      {widget.enabled ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 푸터 */}
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg"
              >
                <RotateCcw className="w-4 h-4" />
                기본값 복원
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


