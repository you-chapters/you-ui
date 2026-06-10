import { useNavigate } from 'react-router-dom';
import type { PersonCount } from '../../types/summary';
import CountBubbles from '../CountBubbles';
import LoadingSpinner from '../LoadingSpinner';
import './PeopleCard.css';

interface Props {
  people: PersonCount[] | null;
}

export default function PeopleCard({ people }: Props) {
  const navigate = useNavigate();

  if (people === null) return <section className="people-card"><LoadingSpinner size="sm" /></section>;
  if (people.length === 0) return null;

  const items = people.map(({ name, count }) => ({ label: name, count }));

  return (
    <section className="people-card">
      <h2 className="people-card__title">👥 People</h2>
      <CountBubbles items={items} onLabelClick={name => navigate('/entries', { state: { searchQuery: name } })} />
    </section>
  );
}