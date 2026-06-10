import './CountBubbles.css';

const MAX_ITEMS = 7;

interface Props {
  items: { label: string; count: number }[];
  onLabelClick: (label: string) => void;
}

export default function CountBubbles({ items, onLabelClick }: Props) {
  const limited = items.slice(0, MAX_ITEMS);
  const maxCount = limited[0]?.count ?? 1;

  const groups = limited.reduce<Map<number, string[]>>((acc, { label, count }) => {
    acc.set(count, [...(acc.get(count) ?? []), label]);
    return acc;
  }, new Map());

  const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) => b - a);

  return (
    <div className="count-bubbles">
      {sortedGroups.map(([count, labels]) => {
        const size = Math.round(36 + (count / maxCount) * 36);
        return (
          <div key={count} className="count-bubbles__group">
            <div
              className="count-bubbles__circle"
              style={{ width: size, height: size, fontSize: size < 50 ? '0.75rem' : '0.9375rem' }}
            >
              {count}
            </div>
            <div className="count-bubbles__labels">
              {labels.map(label => (
                <button key={label} className="count-bubbles__label" onClick={() => onLabelClick(label)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}