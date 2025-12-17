import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardContent, StatCard } from '@/components/ui/Card';
import { Star } from 'lucide-react';

describe('Card 컴포넌트', () => {
  it('기본 카드 렌더링', () => {
    render(
      <Card>
        <CardContent>카드 내용</CardContent>
      </Card>
    );
    expect(screen.getByText('카드 내용')).toBeInTheDocument();
  });

  it('CardHeader 렌더링', () => {
    render(
      <Card>
        <CardHeader>제목</CardHeader>
        <CardContent>내용</CardContent>
      </Card>
    );
    expect(screen.getByText('제목')).toBeInTheDocument();
    expect(screen.getByText('내용')).toBeInTheDocument();
  });

  it('hover 효과 적용', () => {
    const { container } = render(
      <Card hover>
        <CardContent>Hover 카드</CardContent>
      </Card>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('hover:shadow-md');
  });

  it('padding 옵션 적용', () => {
    const { container } = render(
      <Card padding="lg">
        <CardContent>큰 패딩</CardContent>
      </Card>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-8');
  });
});

describe('StatCard 컴포넌트', () => {
  it('StatCard 렌더링', () => {
    render(
      <StatCard
        icon={<Star />}
        title="총 학생 수"
        value={150}
        suffix="명"
        color="sky"
      />
    );
    expect(screen.getByText('총 학생 수')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('명')).toBeInTheDocument();
  });

  it('trend 표시', () => {
    render(
      <StatCard
        icon={<Star />}
        title="성장률"
        value={85}
        suffix="%"
        trend={{ value: 12, isPositive: true }}
      />
    );
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });
});
