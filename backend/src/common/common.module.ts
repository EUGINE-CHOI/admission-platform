import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheService } from './cache.service';
import { SanitizeInterceptor } from './sanitize.interceptor';

@Global()
@Module({
  providers: [
    CacheService,
    // 전역 입력값 정제 인터셉터
    {
      provide: APP_INTERCEPTOR,
      useClass: SanitizeInterceptor,
    },
  ],
  exports: [CacheService],
})
export class CommonModule {}

