import {
  escapeHtml,
  stripDangerousTags,
  detectSqlInjection,
  sanitizeText,
  sanitizeObject,
} from './sanitize.util';

describe('Sanitize Utilities', () => {
  describe('escapeHtml', () => {
    it('HTML 특수문자를 이스케이프한다', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('문자열이 아니면 그대로 반환', () => {
      expect(escapeHtml(123 as unknown as string)).toBe(123);
    });
  });

  describe('stripDangerousTags', () => {
    it('script 태그를 제거한다', () => {
      expect(stripDangerousTags('Hello<script>alert("xss")</script>World')).toBe(
        'HelloWorld'
      );
    });

    it('iframe 태그를 제거한다', () => {
      expect(stripDangerousTags('<iframe src="http://evil.com"></iframe>')).toBe('');
    });

    it('onclick 이벤트 핸들러를 제거한다', () => {
      expect(stripDangerousTags('<button onclick="alert()">Click</button>')).toBe(
        '<button >Click</button>'
      );
    });

    it('javascript: URL을 제거한다', () => {
      expect(stripDangerousTags('<a href="javascript:alert()">Link</a>')).toBe(
        '<a href="alert()">Link</a>'
      );
    });

    it('일반 텍스트는 그대로 유지', () => {
      expect(stripDangerousTags('안녕하세요. 일반 텍스트입니다.')).toBe(
        '안녕하세요. 일반 텍스트입니다.'
      );
    });
  });

  describe('detectSqlInjection', () => {
    it('SQL SELECT 문을 감지한다', () => {
      expect(detectSqlInjection('SELECT * FROM users')).toBe(true);
    });

    it('SQL UNION 공격을 감지한다', () => {
      expect(detectSqlInjection("' UNION SELECT password FROM users--")).toBe(true);
    });

    it('OR 1=1 패턴을 감지한다', () => {
      expect(detectSqlInjection("admin' OR 1=1--")).toBe(true);
    });

    it('일반 텍스트는 false 반환', () => {
      expect(detectSqlInjection('일반 텍스트입니다')).toBe(false);
    });

    it('문자열이 아니면 false 반환', () => {
      expect(detectSqlInjection(123 as unknown as string)).toBe(false);
    });
  });

  describe('sanitizeText', () => {
    it('위험한 태그를 제거하고 trim한다', () => {
      expect(sanitizeText('  <script>alert()</script>Hello  ')).toBe('Hello');
    });
  });

  describe('sanitizeObject', () => {
    it('객체의 모든 문자열 필드를 sanitize한다', () => {
      const input = {
        name: '  <script>xss</script>홍길동  ',
        email: 'test@example.com',
        nested: {
          description: '<iframe>evil</iframe>설명',
        },
      };

      const result = sanitizeObject(input);

      expect(result.name).toBe('홍길동');
      expect(result.email).toBe('test@example.com');
      expect(result.nested.description).toBe('설명');
    });

    it('배열 내 문자열도 sanitize한다', () => {
      const input = ['<script>xss</script>item1', 'item2'];
      const result = sanitizeObject(input);

      expect(result[0]).toBe('item1');
      expect(result[1]).toBe('item2');
    });

    it('null/undefined는 그대로 반환', () => {
      expect(sanitizeObject(null)).toBe(null);
      expect(sanitizeObject(undefined)).toBe(undefined);
    });

    it('숫자는 그대로 반환', () => {
      expect(sanitizeObject(123)).toBe(123);
    });
  });
});

