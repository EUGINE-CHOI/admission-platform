import { render, screen } from '@testing-library/react';
import { LoadingState, SkeletonCard, SkeletonList, SkeletonTable } from '@/components/ui/LoadingState';

describe('LoadingState 컴포넌트', () => {
  it('기본 로딩 스피너 렌더링', () => {
    render(<LoadingState />);
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('커스텀 메시지 표시', () => {
    render(<LoadingState message="데이터를 불러오는 중..." />);
    expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument();
  });

  it('fullScreen 모드', () => {
    const { container } = render(<LoadingState fullScreen />);
    expect(container.firstChild).toHaveClass('fixed');
  });

  it('size md (기본값)', () => {
    render(<LoadingState />);
    // 메시지 텍스트 사이즈 확인
    const message = screen.getByText('로딩 중...');
    expect(message).toHaveClass('text-base');
  });
});

describe('SkeletonCard 컴포넌트', () => {
  it('기본 렌더링', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toHaveClass('bg-white');
    expect(container.firstChild).toHaveClass('rounded-xl');
  });
});

describe('SkeletonList 컴포넌트', () => {
  it('기본 3개 아이템 렌더링', () => {
    const { container } = render(<SkeletonList />);
    const items = container.querySelectorAll('.space-y-4 > div');
    expect(items.length).toBe(3); // 기본값 count=3
  });

  it('커스텀 개수 렌더링', () => {
    const { container } = render(<SkeletonList count={5} />);
    const items = container.querySelectorAll('.space-y-4 > div');
    expect(items.length).toBe(5);
  });
});

describe('SkeletonTable 컴포넌트', () => {
  it('기본 렌더링', () => {
    const { container } = render(<SkeletonTable />);
    // 테이블 컨테이너 확인
    expect(container.firstChild).toHaveClass('bg-white');
    expect(container.firstChild).toHaveClass('rounded-xl');
  });

  it('헤더와 행 렌더링', () => {
    const { container } = render(<SkeletonTable rows={3} cols={2} />);
    // 헤더 확인
    const header = container.querySelector('.bg-slate-50');
    expect(header).toBeInTheDocument();
  });
});
