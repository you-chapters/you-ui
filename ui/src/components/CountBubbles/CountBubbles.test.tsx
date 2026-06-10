import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CountBubbles from '.';

const click = vi.fn();

const items = [
  { label: 'Alice', count: 5 },
  { label: 'Bob', count: 3 },
  { label: 'Carol', count: 3 },
  { label: 'Dave', count: 1 },
];

describe('CountBubbles', () => {
  it('renders all labels', () => {
    render(<CountBubbles items={items} onLabelClick={click} />);
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.getByText('Carol')).toBeTruthy();
    expect(screen.getByText('Dave')).toBeTruthy();
  });

  it('groups same-count items under one circle', () => {
    render(<CountBubbles items={items} onLabelClick={click} />);
    const circles = document.querySelectorAll('.count-bubbles__circle');
    // counts: 5, 3, 1 → 3 distinct groups
    expect(circles).toHaveLength(3);
    const circleTexts = Array.from(circles).map(el => el.textContent);
    expect(circleTexts).toContain('3');
  });

  it('sorts groups by count descending', () => {
    render(<CountBubbles items={items} onLabelClick={click} />);
    const circles = document.querySelectorAll('.count-bubbles__circle');
    const counts = Array.from(circles).map(el => Number(el.textContent));
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
  });

  it('caps display at 7 items', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ label: `Person ${i}`, count: 10 - i }));
    render(<CountBubbles items={many} onLabelClick={click} />);
    const labels = screen.getAllByRole('button');
    expect(labels).toHaveLength(7);
  });

  it('calls onLabelClick with the label when clicked', () => {
    const handler = vi.fn();
    render(<CountBubbles items={items} onLabelClick={handler} />);
    fireEvent.click(screen.getByText('Alice'));
    expect(handler).toHaveBeenCalledWith('Alice');
  });
});
