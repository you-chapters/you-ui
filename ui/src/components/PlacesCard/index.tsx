import { useNavigate } from 'react-router-dom';
import type { LocationCount } from '../../types/summary';
import CountBubbles from '../CountBubbles';
import Skeleton from '../Skeleton';
import './PlacesCard.css';

interface Props {
  locations: LocationCount[] | null;
}

export default function PlacesCard({ locations }: Props) {
  const navigate = useNavigate();

  if (locations === null) return (
    <section className="places-card">
      <Skeleton className="places-card__skeleton-title" />
      <div className="places-card__skeleton-bubbles">
        {[54, 42, 38].map(size => (
          <div key={size} className="places-card__skeleton-group">
            <Skeleton style={{ width: size, height: size, borderRadius: '50%' }} />
            <Skeleton className="places-card__skeleton-label" />
          </div>
        ))}
      </div>
    </section>
  );
  if (locations.length === 0) return null;

  const items = locations.map(({ location, count }) => ({ label: location, count }));

  return (
    <section className="places-card">
      <h2 className="places-card__title">📍 Places</h2>
      <CountBubbles items={items} onLabelClick={loc => navigate('/entries', { state: { searchQuery: loc } })} />
    </section>
  );
}