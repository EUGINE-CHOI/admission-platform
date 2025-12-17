import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button 컴포넌트', () => {
  it('기본 버튼 렌더링', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('클릭');
  });

  it('클릭 이벤트 처리', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태', () => {
    render(<Button disabled>비활성화</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('variant outline 적용', () => {
    render(<Button variant="outline">아웃라인</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-2');
  });

  it('size lg 적용', () => {
    render(<Button size="lg">큰 버튼</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6');
  });

  it('isLoading 상태', () => {
    render(<Button isLoading>로딩중</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('danger variant 적용', () => {
    render(<Button variant="danger">삭제</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600');
  });
});
