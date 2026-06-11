import { useNavigate } from 'react-router-dom';
import type { PersonCount } from '../../types/summary';
import CountBubbles from '../CountBubbles';
import Skeleton from '../Skeleton';
import './PeopleCard.css';

interface Props {
  people: PersonCount[] | null;
}

export default function PeopleCard({ people }: Props) {
  const navigate = useNavigate();

  if (people === null) return (
    <section className="people-card">
      <Skeleton className="people-card__skeleton-title" />
      <div className="people-card__skeleton-bubbles">
        {[54, 42, 38].map(size => (
          <div key={size} className="people-card__skeleton-group">
            <Skeleton style={{ width: size, height: size, borderRadius: '50%' }} />
            <Skeleton className="people-card__skeleton-label" />
          </div>
        ))}
      </div>
    </section>
  );
  if (people.length === 0) return null;

  const items = people.map(({ name, count }) => ({ label: name, count }));

  return (
    <section className="people-card">
      <h2 className="people-card__title">👥 People</h2>
      <CountBubbles items={items} onLabelClick={name => navigate('/entries', { state: { searchQuery: name } })} />
    </section>
  );
}