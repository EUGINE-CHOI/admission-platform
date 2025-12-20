'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // 전역 설정
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
        errorRetryCount: 3,
        
        // 에러 핸들러
        onError: (error, key) => {
          if (process.env.NODE_ENV === 'development') {
            console.error(`SWR Error [${key}]:`, error);
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}

