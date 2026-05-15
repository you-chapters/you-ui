import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders centered wrapper with md size by default', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('.spinner-wrap')).toBeTruthy();
    expect(container.querySelector('.spinner--md')).toBeTruthy();
  });

  it('renders sm size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    expect(container.querySelector('.spinner--sm')).toBeTruthy();
  });

  it('renders without wrapper div when centered is false', () => {
    const { container } = render(<LoadingSpinner centered={false} />);
    expect(container.querySelector('.spinner-wrap')).toBeNull();
    expect(container.querySelector('.spinner')).toBeTruthy();
  });

  it('renders wrapper div when centered is true', () => {
    const { container } = render(<LoadingSpinner centered={true} />);
    expect(container.querySelector('.spinner-wrap')).toBeTruthy();
  });
});
