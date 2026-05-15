import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import NavBar from './NavBar';

function renderNavBar() {
  render(<MemoryRouter><NavBar /></MemoryRouter>);
}

describe('NavBar', () => {
  it('renders logo linking to /', () => {
    renderNavBar();
    const logo = screen.getByText('you.');
    expect(logo.getAttribute('href')).toBe('/');
  });

  it('renders New Entry link to /new', () => {
    renderNavBar();
    expect(screen.getByText('New Entry').getAttribute('href')).toBe('/new');
  });

  it('renders All Entries link to /entries', () => {
    renderNavBar();
    expect(screen.getByText('All Entries').getAttribute('href')).toBe('/entries');
  });

  it('displays the current user label', () => {
    renderNavBar();
    expect(screen.getByText('user-1')).toBeTruthy();
  });
});
