import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import EntryCard from '.';
import type { Entry } from '../../types/entry';

const baseEntry: Entry = { entry_id: 'e1', user_id: 'u1', entry: 'Hello world' };

function renderCard(entry: Entry) {
  const { container } = render(
    <MemoryRouter><EntryCard entry={entry} /></MemoryRouter>
  );
  return container;
}

describe('EntryCard', () => {
  it('renders entry text', () => {
    renderCard(baseEntry);
    expect(screen.getByText('Hello world')).toBeTruthy();
  });

  it('links to the entry detail page', () => {
    renderCard(baseEntry);
    expect(screen.getByRole('link').getAttribute('href')).toBe('/entries/e1');
  });

  it('truncates entry longer than 200 characters with ellipsis', () => {
    const longText = 'a'.repeat(201);
    renderCard({ ...baseEntry, entry: longText });
    const preview = screen.getByText(/^a+…$/);
    expect(preview.textContent).toHaveLength(201);
  });

  it('does not truncate entry of exactly 200 characters', () => {
    const text = 'a'.repeat(200);
    renderCard({ ...baseEntry, entry: text });
    expect(screen.getByText(text)).toBeTruthy();
  });

  it('renders date element when timestamp is provided', () => {
    const container = renderCard({ ...baseEntry, timestamp: '2024-03-15T10:30:00.000Z' });
    expect(container.querySelector('.entry-card__date')).toBeTruthy();
  });

  it('omits date element when timestamp is absent', () => {
    const container = renderCard(baseEntry);
    expect(container.querySelector('.entry-card__date')).toBeNull();
  });

  it('renders location when provided', () => {
    const container = renderCard({ ...baseEntry, location: 'Berlin' });
    expect(container.querySelector('.entry-card__location')?.textContent).toBe('Berlin');
  });

  it('omits location element when absent', () => {
    const container = renderCard(baseEntry);
    expect(container.querySelector('.entry-card__location')).toBeNull();
  });
});
