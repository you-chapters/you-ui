import { useNavigate } from 'react-router-dom';
import type { LocationCount } from '../../types/summary';
import CountBubbles from '../CountBubbles';
import LoadingSpinner from '../LoadingSpinner';
import './PlacesCard.css';

interface Props {
  locations: LocationCount[] | null;
}

export default function PlacesCard({ locations }: Props) {
  const navigate = useNavigate();

  if (locations === null) return <section className="places-card"><LoadingSpinner size="sm" /></section>;
  if (locations.length === 0) return null;

  const items = locations.map(({ location, count }) => ({ label: location, count }));

  return (
    <section className="places-card">
      <h2 className="places-card__title">📍 Places</h2>
      <CountBubbles items={items} onLabelClick={loc => navigate('/entries', { state: { searchQuery: loc } })} />
    </section>
  );
}