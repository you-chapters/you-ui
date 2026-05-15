import './LoadingSpinner.css';

interface Props {
  size?: 'sm' | 'md';
  centered?: boolean;
}

export default function LoadingSpinner({ size = 'md', centered = true }: Props) {
  const el = <span className={`spinner spinner--${size}`} />;
  return centered ? <div className="spinner-wrap">{el}</div> : el;
}