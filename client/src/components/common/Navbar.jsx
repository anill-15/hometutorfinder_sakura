import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../assets/logo.svg';
import Avatar from './Avatar.jsx';
import NotificationBell from './NotificationBell.jsx';
import {
  IconMenu, IconClose, IconChevronDown, IconUser, IconLogout, IconDashboard, IconShield,
} from './Icons.jsx';

const ROLE_HOME = {
  student: '/student/dashboard',
  tutor: '/tutor/dashboard',
  admin: '/admin/dashboard',
};

const ROLE_LABEL = {
  student: 'Student',
  tutor: 'Tutor',
  admin: 'Admin',
};

export default function Navbar({ links = [], showBell = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the dropdown when clicking outside it.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  // Any navigation closes both menus.
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="header">
        <div className="container header__inner">
          <Link to="/" className="logo">
            <img className="logo__mark" src={logo} alt="" width="34" height="34" />
            <span>Home Tutor Finder</span>
          </Link>

          <nav className="nav" aria-label="Main navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__actions">
            {showBell && user && <NotificationBell />}

            {user ? (
              <div className="user-menu" ref={menuRef}>
                <button
                  type="button"
                  className="user-menu__trigger"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                >
                  <Avatar name={user.name} size="sm" />
                  <span className="user-menu__trigger-text">
                    <span className="user-menu__name">{user.name}</span>
                    <span className="user-menu__role">{ROLE_LABEL[user.role]}</span>
                  </span>
                  <IconChevronDown size={14} />
                </button>

                {menuOpen && (
                  <div className="user-menu__panel" role="menu">
                    <div className="user-menu__header">
                      <div className="strong small">{user.name}</div>
                      <div className="small muted" style={{ wordBreak: 'break-all' }}>{user.email}</div>
                    </div>

                    {user.role === 'student' && (
                      <>
                        <Link to="/student/profile" className="user-menu__item" role="menuitem">
                          <IconUser size={15} /> Profile &amp; preferences
                        </Link>
                        <Link to="/student/dashboard" className="user-menu__item" role="menuitem">
                          <IconDashboard size={15} /> Dashboard
                        </Link>
                      </>
                    )}

                    {user.role === 'tutor' && (
                      <>
                        <Link to="/tutor/profile" className="user-menu__item" role="menuitem">
                          <IconUser size={15} /> Tutor profile
                        </Link>
                        <Link to="/tutor/dashboard" className="user-menu__item" role="menuitem">
                          <IconDashboard size={15} /> Dashboard
                        </Link>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <Link to="/admin/dashboard" className="user-menu__item" role="menuitem">
                        <IconShield size={15} /> Admin panel
                      </Link>
                    )}

                    <button
                      type="button"
                      className="user-menu__item user-menu__item--danger"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      <IconLogout size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn--ghost btn--sm">Sign in</Link>
                <Link to="/register" className="btn btn--primary btn--sm">Get started</Link>
              </>
            )}

            <button
              type="button"
              className="nav-toggle"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mobile-nav is-open">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
            {user && (
              <NavLink to={ROLE_HOME[user.role]} className="nav__link">
                My dashboard
              </NavLink>
            )}
            {!user && (
              <>
                <NavLink to="/login" className="nav__link">Sign in</NavLink>
                <NavLink to="/register" className="nav__link">Create an account</NavLink>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}