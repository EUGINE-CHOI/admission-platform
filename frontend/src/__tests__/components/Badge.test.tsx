import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge 컴포넌트', () => {
  it('기본 뱃지 렌더링', () => {
    render(<Badge>테스트</Badge>);
    expect(screen.getByText('테스트')).toBeInTheDocument();
  });

  it('success variant', () => {
    render(<Badge variant="success">성공</Badge>);
    const badge = screen.getByText('성공');
    expect(badge).toHaveClass('bg-emerald-100');
  });

  it('danger variant', () => {
    render(<Badge variant="danger">위험</Badge>);
    const badge = screen.getByText('위험');
    expect(badge).toHaveClass('bg-red-100');
  });

  it('warning variant', () => {
    render(<Badge variant="warning">경고</Badge>);
    const badge = screen.getByText('경고');
    expect(badge).toHaveClass('bg-amber-100');
  });

  it('info variant', () => {
    render(<Badge variant="info">정보</Badge>);
    const badge = screen.getByText('정보');
    expect(badge).toHaveClass('bg-sky-100');
  });

  it('outline variant', () => {
    render(<Badge variant="outline">아웃라인</Badge>);
    const badge = screen.getByText('아웃라인');
    expect(badge).toHaveClass('border');
  });

  it('size md 적용', () => {
    render(<Badge size="md">큰 뱃지</Badge>);
    const badge = screen.getByText('큰 뱃지');
    expect(badge).toHaveClass('px-2.5');
  });
});
