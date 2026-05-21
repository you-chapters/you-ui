import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PlacesCard from './PlacesCard';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('PlacesCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders nothing when locations list is empty', () => {
    const { container } = render(<MemoryRouter><PlacesCard locations={[]} /></MemoryRouter>);
    expect(container.firstChild).toBeNull();
  });

  it('renders location names and counts', () => {
    render(
      <MemoryRouter>
        <PlacesCard locations={[{ location: 'Paris', count: 4 }, { location: 'Berlin', count: 1 }]} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Paris/)).toBeTruthy();
    expect(screen.getByText(/Berlin/)).toBeTruthy();
  });

  it('navigates to /entries with searchQuery on location click', () => {
    render(
      <MemoryRouter>
        <PlacesCard locations={[{ location: 'Paris', count: 2 }]} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Paris/ }));
    expect(mockNavigate).toHaveBeenCalledWith('/entries', { state: { searchQuery: 'Paris' } });
  });
});