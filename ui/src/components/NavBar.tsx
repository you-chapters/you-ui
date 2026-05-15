import { NavLink } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__logo">you.</NavLink>
      <div className="navbar__links">
        <NavLink to="/new" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
          New Entry
        </NavLink>
        <NavLink to="/entries" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
          All Entries
        </NavLink>
        <span className="navbar__user">user-1</span>
      </div>
    </nav>
  );
}