import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Skeleton from '.';

describe('Skeleton', () => {
  it('renders with the base skeleton class', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('skeleton');
  });

  it('appends extra className alongside base class', () => {
    const { container } = render(<Skeleton className="my-line" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('skeleton');
    expect(el).toHaveClass('my-line');
  });

  it('applies width and height as inline styles', () => {
    const { container } = render(<Skeleton width={120} height={14} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('120px');
    expect(el.style.height).toBe('14px');
  });

  it('merges arbitrary style prop', () => {
    const { container } = render(<Skeleton style={{ borderRadius: '50%' }} />);
    expect((container.firstChild as HTMLElement).style.borderRadius).toBe('50%');
  });

  it('is hidden from assistive technology', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });
});