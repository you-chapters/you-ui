import { useNavigate } from 'react-router-dom';
import type { LocationCount } from '../../types/summary';
import LoadingSpinner from '../LoadingSpinner';
import './PlacesCard.css';

interface Props {
  locations: LocationCount[] | null;
}

export default function PlacesCard({ locations }: Props) {
  const navigate = useNavigate();

  if (locations === null) return <section className="places-card"><LoadingSpinner size="sm" /></section>;
  if (locations.length === 0) return null;

  function handleLocationClick(location: string) {
    navigate('/entries', { state: { searchQuery: location } });
  }

  return (
    <section className="places-card">
      <h2 className="places-card__title">📍 Places</h2>
      <ul className="places-card__list">
        {locations.map(({ location, count }) => (
          <li key={location}>
            <button className="places-card__place" onClick={() => handleLocationClick(location)}>
              {location} <small>×{count}</small>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}