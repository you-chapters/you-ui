import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './NavBar.css';

export default function NavBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__logo">you.</NavLink>
      <div className="navbar__links">
        {user && (
          <>
            <NavLink to="/new" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
              New Entry
            </NavLink>
            <NavLink to="/entries" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
              All Entries
            </NavLink>
            <NavLink to="/phases" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
              Timeline
            </NavLink>
            <NavLink to="/ask" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
              Ask
            </NavLink>
          </>
        )}
        {user ? (
          <div className="navbar__user">
            <span className="navbar__username">{user.displayName}</span>
            <button className="navbar__signout" onClick={handleSignOut}>Sign out</button>
          </div>
        ) : (
          <NavLink to="/login" className="navbar__link">Sign in</NavLink>
        )}
      </div>
    </nav>
  );
}