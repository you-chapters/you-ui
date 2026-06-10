import { useNavigate } from 'react-router-dom';
import type { PersonCount } from '../../types/summary';
import LoadingSpinner from '../LoadingSpinner';
import './PeopleCard.css';

interface Props {
  people: PersonCount[] | null;
}

export default function PeopleCard({ people }: Props) {
  const navigate = useNavigate();

  if (people === null) return <section className="people-card"><LoadingSpinner size="sm" /></section>;
  if (people.length === 0) return null;

  function handlePersonClick(name: string) {
    navigate('/entries', { state: { searchQuery: name } });
  }

  return (
    <section className="people-card">
      <h2 className="people-card__title">👥 People</h2>
      <ul className="people-card__list">
        {people.map(({ name, count }) => (
          <li key={name}>
            <button className="people-card__person" onClick={() => handlePersonClick(name)}>
              {name} <small>×{count}</small>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
