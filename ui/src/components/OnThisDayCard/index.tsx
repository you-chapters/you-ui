import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOnThisDay } from '../../api/entries';
import type { Entry } from '../../types/entry';
import './OnThisDayCard.css';

export default function OnThisDayCard() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    getOnThisDay()
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);

  if (!entries || entries.length === 0) return null;

  const entry = entries[activeIndex];
  const year = entry.timestamp ? new Date(entry.timestamp).getFullYear() : '';
  const preview = entry.entry.length > 200 ? entry.entry.slice(0, 200) + '…' : entry.entry;

  const navigate = (index: number) => {
    setFading(true);
    setTimeout(() => {
      setActiveIndex(index);
      setFading(false);
    }, 120);
  };

  return (
    <section className={`on-this-day${fading ? ' on-this-day--fading' : ''}`}>
      <div className="on-this-day__header">
        <div>
          <h2 className="on-this-day__title">On this day</h2>
          <span className="on-this-day__year">{year}</span>
        </div>
        {entries.length > 1 && (
          <div className="on-this-day__nav">
            <button
              onClick={() => navigate(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="on-this-day__nav-btn"
              aria-label="Previous"
            >‹</button>
            <button
              onClick={() => navigate(activeIndex + 1)}
              disabled={activeIndex === entries.length - 1}
              className="on-this-day__nav-btn"
              aria-label="Next"
            >›</button>
          </div>
        )}
      </div>
      <p className="on-this-day__text">{preview}</p>
      <div className="on-this-day__footer">
        {entry.location && <span className="on-this-day__location">{entry.location}</span>}
        <Link to={`/entries/${entry.entry_id}`} className="on-this-day__link">View →</Link>
      </div>
    </section>
  );
}