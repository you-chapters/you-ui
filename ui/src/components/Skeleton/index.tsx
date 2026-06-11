import './Skeleton.css';

interface Props {
  className?: string;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export default function Skeleton({ className = '', width, height, style }: Props) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}