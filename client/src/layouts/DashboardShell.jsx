import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import { IconMenu, IconClose } from '../components/common/Icons.jsx';

/**
 * Shared dashboard shell: sticky header, collapsible sidebar and the page
 * content area. Role layouts supply their own link groups.
 */
export default function DashboardShell({ links, footer, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar links={[]} showBell />

      <div className="shell">
        <aside className={`sidebar ${open ? 'is-open' : ''}`}>
          {links.map((group) => (
            <div className="sidebar__group" key={group.title}>
              <div className="sidebar__title">{group.title}</div>
              {group.links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
                  >
                    <span className="sidebar__link-icon"><Icon size={16} /></span>
                    {link.label}
                    {link.badge > 0 && <span className="sidebar__badge">{link.badge}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}

          {footer && <div className="sidebar__footer">{footer}</div>}
        </aside>

        <main className="shell__main">
          <button
            type="button"
            className="btn btn--secondary btn--sm sidebar-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            style={{ marginBottom: 16 }}
          >
            {open ? <IconClose size={15} /> : <IconMenu size={15} />} Menu
          </button>

          {open && (
            <button
              type="button"
              className="filter-overlay"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            />
          )}

          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}