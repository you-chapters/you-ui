import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PeopleCard from '.';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('PeopleCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders nothing when people list is empty', () => {
    const { container } = render(<MemoryRouter><PeopleCard people={[]} /></MemoryRouter>);
    expect(container.firstChild).toBeNull();
  });

  it('renders person names and counts', () => {
    render(
      <MemoryRouter>
        <PeopleCard people={[{ name: 'Alice', count: 3 }, { name: 'Bob', count: 1 }]} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Alice/)).toBeTruthy();
    expect(screen.getByText(/Bob/)).toBeTruthy();
  });

  it('navigates to /entries with searchQuery on person click', () => {
    render(
      <MemoryRouter>
        <PeopleCard people={[{ name: 'Alice', count: 2 }]} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Alice/ }));
    expect(mockNavigate).toHaveBeenCalledWith('/entries', { state: { searchQuery: 'Alice' } });
  });
});
