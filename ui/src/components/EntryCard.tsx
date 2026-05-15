import { Link } from 'react-router-dom';
import type { Entry } from '../types/entry';
import './EntryCard.css';

interface Props {
  entry: Entry;
}

function formatDate(raw?: string) {
  if (!raw) return null;
  try {
    const d = new Date(raw);
    const day = d.getDate();
    const month = d.toLocaleString('en-GB', { month: 'long' });
    const year = d.getFullYear();
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return `${day} ${month} ${year}, ${time}`;
  } catch {
    return null;
  }
}

export default function EntryCard({ entry }: Props) {
  const preview = entry.entry.length > 200 ? entry.entry.slice(0, 200) + '…' : entry.entry;
  const date = formatDate(entry.timestamp);

  return (
    <Link to={`/entries/${entry.entry_id}`} className="entry-card">
      {date && <p className="entry-card__date">{date}</p>}
      <p className="entry-card__preview">{preview}</p>
    </Link>
  );
}