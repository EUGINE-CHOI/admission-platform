/**
 * 입력값 정제 유틸리티
 * XSS 공격 방지를 위한 HTML 이스케이프 및 위험 문자 제거
 */

// HTML 특수문자 이스케이프
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return str;
  
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
}

// 위험한 HTML 태그 제거 (script, iframe, object 등)
export function stripDangerousTags(str: string): string {
  if (typeof str !== 'string') return str;
  
  // 위험한 태그 패턴
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^>]*>/gi,
    /<link\b[^>]*>/gi,
    /<meta\b[^>]*>/gi,
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi, // onclick="..." 등 이벤트 핸들러 (값 포함)
    /on\w+\s*=\s*[^\s>]+/gi, // onclick=func() 등 따옴표 없는 경우
    /data:/gi, // data: URL
  ];
  
  let result = str;
  for (const pattern of dangerousPatterns) {
    result = result.replace(pattern, '');
  }
  
  return result;
}

// SQL Injection 위험 문자 감지 (경고용 - Prisma가 이미 처리)
export function detectSqlInjection(str: string): boolean {
  if (typeof str !== 'string') return false;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\bOR\b\s*\d+\s*=\s*\d+)/i,
    /(\bAND\b\s*\d+\s*=\s*\d+)/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(str));
}

// 종합 sanitize 함수 (일반 텍스트용)
export function sanitizeText(str: string): string {
  if (typeof str !== 'string') return str;
  
  return stripDangerousTags(str.trim());
}

// 종합 sanitize 함수 (HTML 출력용 - 완전 이스케이프)
export function sanitizeForHtml(str: string): string {
  if (typeof str !== 'string') return str;
  
  return escapeHtml(str.trim());
}

// 객체의 모든 문자열 필드 sanitize (재귀)
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeText(obj) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized as T;
  }
  
  return obj;
}

