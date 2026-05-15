import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="landing">
      <h1 className="landing__headline">A place for your thoughts.</h1>
      <p className="landing__sub">Write freely. Read later. No clutter, no noise.</p>
      <div className="landing__actions">
        <button className="btn btn--primary" onClick={() => navigate('/new')}>
          Write
        </button>
        <button className="btn btn--outline" onClick={() => navigate('/entries')}>
          List entries
        </button>
      </div>
    </main>
  );
}