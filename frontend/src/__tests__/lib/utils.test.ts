import {
  cn,
  formatDate,
  formatDateShort,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  getCurrentYear,
  getToday,
  getDDay,
  formatDDay,
} from '@/lib/utils';

describe('cn (className 병합)', () => {
  it('여러 클래스 병합', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('조건부 클래스', () => {
    expect(cn('base', true && 'active', false && 'disabled')).toBe('base active');
  });

  it('Tailwind 클래스 충돌 해결', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('formatDate', () => {
  it('Date 객체를 한국어 형식으로 변환', () => {
    const date = new Date('2025-12-19');
    const result = formatDate(date);
    expect(result).toContain('2025');
    expect(result).toContain('12');
    expect(result).toContain('19');
  });

  it('문자열 날짜를 한국어 형식으로 변환', () => {
    const result = formatDate('2025-01-15');
    expect(result).toContain('2025');
    expect(result).toContain('1');
    expect(result).toContain('15');
  });
});

describe('formatDateShort', () => {
  it('날짜를 짧은 형식으로 변환', () => {
    const result = formatDateShort('2025-12-19');
    expect(result).toMatch(/2025.*12.*19/);
  });
});

describe('formatDateTime', () => {
  it('날짜와 시간을 함께 포맷', () => {
    const result = formatDateTime('2025-12-19T14:30:00');
    expect(result).toContain('2025');
    // 한국어 로케일에서 "오후 02" 형태로 표시될 수 있음
    expect(result).toContain('30');
  });
});

describe('formatTime', () => {
  it('시간만 포맷', () => {
    const result = formatTime('2025-12-19T14:30:00');
    // 한국어 로케일에서 "오후 02:30" 형태
    expect(result).toContain('30');
  });
});

describe('formatRelativeTime', () => {
  it('방금 전', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('방금 전');
  });

  it('N분 전', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('5분 전');
  });

  it('N시간 전', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('3시간 전');
  });

  it('N일 전', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('2일 전');
  });
});

describe('getCurrentYear', () => {
  it('현재 연도 반환', () => {
    const year = getCurrentYear();
    expect(year).toBe(new Date().getFullYear());
  });
});

describe('getToday', () => {
  it('오늘 날짜 반환', () => {
    const today = getToday();
    const expected = new Date().toISOString().split('T')[0];
    expect(today).toBe(expected);
  });
});

describe('getDDay', () => {
  it('미래 날짜 - 양수 반환 (D-N)', () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const dday = getDDay(future);
    // 미래는 양수로 반환 (D-10 = 10일 남음)
    expect(dday).toBeGreaterThanOrEqual(9);
  });

  it('과거 날짜 - 음수 반환 (D+N)', () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    const dday = getDDay(past);
    // 과거는 음수로 반환
    expect(dday).toBeLessThanOrEqual(-5);
  });

  it('오늘 - 0 반환', () => {
    const today = new Date();
    const dday = getDDay(today);
    expect(dday).toBe(0);
  });
});

describe('formatDDay', () => {
  it('D-Day 형식으로 포맷 (미래)', () => {
    // getDDay는 미래에 양수 반환 -> formatDDay는 음수 입력 시 D-N
    // 하지만 실제 getDDay가 미래에 양수를 반환하므로
    // formatDDay(-10) = "D-10"
    const result = formatDDay(-10);
    expect(result).toBe('D-10');
  });

  it('D-Day 당일', () => {
    const result = formatDDay(0);
    expect(result).toBe('D-Day');
  });

  it('D-Day 지남 (과거)', () => {
    // 양수는 D+N (지난 날)
    const result = formatDDay(5);
    expect(result).toBe('D+5');
  });
});
