import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import PhaseCard from '.';
import type { PhaseRecord } from '../../types/phase';

const closed: PhaseRecord = {
  phase_id: 'p1',
  title: 'Finding Ground',
  description: 'A quieter stretch.',
  start_date: '2023-12-01',
  end_date: '2024-05-20',
  entry_count: 38,
  dominant_topics: ['reflection'],
  mean_mood: 0.58,
  top_people: ['Jake'],
  top_locations: ['Home'],
  generated_at: '2024-05-20',
  is_open: false,
};

const open: PhaseRecord = { ...closed, phase_id: 'p2', end_date: null, is_open: true };

function renderCard(phase: PhaseRecord) {
  return render(<MemoryRouter><PhaseCard phase={phase} /></MemoryRouter>);
}

describe('PhaseCard', () => {
  it('renders the phase title', () => {
    renderCard(closed);
    expect(screen.getByText('Finding Ground')).toBeTruthy();
  });

  it('renders the description', () => {
    renderCard(closed);
    expect(screen.getByText('A quieter stretch.')).toBeTruthy();
  });

  it('shows date range for a closed phase', () => {
    renderCard(closed);
    expect(screen.getByText(/2023-12-01 – 2024-05-20/)).toBeTruthy();
  });

  it('shows ongoing in date range for an open phase', () => {
    renderCard(open);
    expect(screen.getByText(/2023-12-01 – ongoing/)).toBeTruthy();
  });

  it('shows ongoing badge for an open phase', () => {
    const { container } = renderCard(open);
    expect(container.querySelector('.phase-card__badge')).toBeTruthy();
  });

  it('hides ongoing badge for a closed phase', () => {
    const { container } = renderCard(closed);
    expect(container.querySelector('.phase-card__badge')).toBeNull();
  });

  it('uses singular "entry" for count of 1', () => {
    renderCard({ ...closed, entry_count: 1 });
    expect(screen.getByText(/1 entry\b/)).toBeTruthy();
  });

  it('uses plural "entries" for count > 1', () => {
    renderCard(closed);
    expect(screen.getByText(/38 entries/)).toBeTruthy();
  });

  it('renders topic, person, and location chips', () => {
    renderCard(closed);
    expect(screen.getByText('reflection')).toBeTruthy();
    expect(screen.getByText('Jake')).toBeTruthy();
    expect(screen.getByText('Home')).toBeTruthy();
  });

  it('renders explore link with correct href for a closed phase', () => {
    renderCard(closed);
    const link = screen.getByRole('link', { name: /explore entries/i });
    expect(link.getAttribute('href')).toBe('/entries?from=2023-12-01&to=2024-05-20');
  });

  it('chips section still present when topic/people/location arrays are empty', () => {
    const { container } = renderCard({ ...closed, dominant_topics: [], top_people: [], top_locations: [] });
    expect(container.querySelector('.phase-card__chips')).toBeTruthy();
  });

  it('renders a positive mood chip for mean_mood >= 0.5', () => {
    const { container } = renderCard({ ...closed, mean_mood: 0.58 });
    const chip = container.querySelector('.phase-chip--mood-positive');
    expect(chip).toBeTruthy();
    expect(chip!.textContent).toBe('😊');
    expect(chip!.getAttribute('title')).toBe('mood: positive');
  });

  it('renders a neutral mood chip for mean_mood between -0.5 and 0.5', () => {
    const { container } = renderCard({ ...closed, mean_mood: 0.0 });
    const chip = container.querySelector('.phase-chip--mood-neutral');
    expect(chip).toBeTruthy();
    expect(chip!.textContent).toBe('😐');
    expect(chip!.getAttribute('title')).toBe('mood: neutral');
  });

  it('renders a low mood chip for mean_mood <= -0.5', () => {
    const { container } = renderCard({ ...closed, mean_mood: -1.2 });
    const chip = container.querySelector('.phase-chip--mood-low');
    expect(chip).toBeTruthy();
    expect(chip!.textContent).toBe('😔');
    expect(chip!.getAttribute('title')).toBe('mood: low');
  });

  it('renders exactly one mood chip', () => {
    const { container } = renderCard(closed);
    expect(container.querySelectorAll('[class*="phase-chip--mood"]')).toHaveLength(1);
  });
});
