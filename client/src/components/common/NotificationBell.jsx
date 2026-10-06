import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as notificationService from '../../services/notificationService.js';
import { timeAgo } from '../../utils/helpers.js';
import { IconBell, IconCheck, IconCheckCircle } from './Icons.jsx';

const BELL_PATH = {
  student: '/student/notifications',
  tutor: '/tutor/notifications',
  admin: '/admin/dashboard',
};

/**
 * Header bell with a dropdown of recent notifications, an unread count, and
 * mark-as-read / mark-all-as-read actions.
 */
export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  const load = useCallback(() => {
    setItems(user ? notificationService.listForUser(user.id).slice(0, 8) : []);
  }, [user]);

  // Reload on sign-in / sign-out and whenever the route changes, so a new
  // notification created by an action is visible without a page refresh.
  useEffect(() => {
    load();
  }, [load, location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) return null;

  const unread = items.filter((n) => !n.isRead).length;

  const handleItemClick = (item) => {
    if (!item.isRead) {
      notificationService.markRead(item.id);
      load();
    }
    setOpen(false);
    if (item.link) navigate(item.link);
  };

  const handleMarkAll = () => {
    notificationService.markAllRead(user.id);
    load();
  };

  return (
    <div className="bell" ref={ref}>
      <button
        type="button"
        className="bell__button"
        onClick={() => {
          load();
          setOpen((v) => !v);
        }}
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
      >
        <IconBell size={18} />
        {unread > 0 && <span className="bell__dot">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="bell__panel" role="dialog" aria-label="Notifications">
          <div className="bell__header">
            <strong className="small">Notifications</strong>
            {unread > 0 && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={handleMarkAll}>
                <IconCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          <div className="bell__list">
            {items.length === 0 ? (
              <div className="bell__empty">
                Nothing yet. Requests, applications and reviews will show up here.
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`bell__item ${item.isRead ? '' : 'is-unread'}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="bell__item-title">{item.title}</div>
                    {item.message && <div className="bell__item-message">{item.message}</div>}
                    <div className="bell__item-time">{timeAgo(item.createdAt)}</div>
                  </div>
                  {!item.isRead && <IconCheckCircle size={15} />}
                </button>
              ))
            )}
          </div>

          <div className="bell__footer">
            <Link to={BELL_PATH[user.role] || '/'} className="btn btn--ghost btn--sm btn--block" onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}