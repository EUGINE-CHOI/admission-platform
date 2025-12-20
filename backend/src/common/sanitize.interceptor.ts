import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { sanitizeObject, detectSqlInjection } from './sanitize.util';

/**
 * 요청 본문 자동 정제 인터셉터
 * - 모든 POST/PUT/PATCH 요청의 body를 sanitize
 * - SQL Injection 패턴 감지 시 경고 로그
 */
@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SanitizeInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    
    // body가 있는 요청만 처리
    if (request.body && typeof request.body === 'object') {
      // SQL Injection 패턴 감지 (경고만, 차단하지 않음 - Prisma가 처리)
      this.checkForSqlInjection(request.body, request.path);
      
      // 요청 본문 sanitize
      request.body = sanitizeObject(request.body);
    }
    
    return next.handle();
  }

  private checkForSqlInjection(obj: unknown, path: string): void {
    if (typeof obj === 'string') {
      if (detectSqlInjection(obj)) {
        this.logger.warn(`[SQL Injection 의심] Path: ${path}, Value: ${obj.substring(0, 100)}`);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(item => this.checkForSqlInjection(item, path));
    } else if (obj && typeof obj === 'object') {
      Object.values(obj).forEach(value => this.checkForSqlInjection(value, path));
    }
  }
}

