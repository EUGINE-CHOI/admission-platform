import { cn, formatDate, formatNumber, truncate, debounce, sleep } from '../utils';

describe('cn (className utility)', () => {
  it('단일 클래스 반환', () => {
    expect(cn('text-red-500')).toBe('text-red-500');
  });

  it('여러 클래스 병합', () => {
    expect(cn('text-red-500', 'bg-white')).toBe('text-red-500 bg-white');
  });

  it('조건부 클래스 처리', () => {
    expect(cn('base', true && 'active', false && 'hidden')).toBe('base active');
  });

  it('tailwind 충돌 클래스 병합', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('formatDate', () => {
  it('Date 객체 포맷', () => {
    const date = new Date('2024-03-15');
    expect(formatDate(date)).toMatch(/2024/);
  });

  it('문자열 날짜 포맷', () => {
    expect(formatDate('2024-03-15')).toMatch(/2024/);
  });
});

describe('formatNumber', () => {
  it('숫자에 천단위 콤마 추가', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('소수점 처리', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
  });
});

describe('truncate', () => {
  it('긴 문자열 자르기', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('짧은 문자열은 그대로', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });
});

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('함수 호출 지연', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('sleep', () => {
  it('Promise 반환', () => {
    const result = sleep(100);
    expect(result).toBeInstanceOf(Promise);
  });
});
