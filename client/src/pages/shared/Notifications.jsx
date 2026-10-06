import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as notificationService from '../../services/notificationService.js';
import { timeAgo } from '../../utils/helpers.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { IconBell, IconCheck, IconTrash } from '../../components/common/Icons.jsx';

/**
 * Notification centre shared by the student and tutor areas.
 * The page copy changes slightly per role.
 */
export default function Notifications({ subtitle }) {
  const { user } = useAuth();
  const [, setVersion] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);

  const items = notificationService.listForUser(user.id);
  const unread = items.filter((n) => !n.isRead).length;

  const refresh = () => setVersion((v) => v + 1);

  const handleMarkAll = () => {
    notificationService.markAllRead(user.id);
    refresh();
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Notifications</h1>
          <p className="dashboard-header__subtitle">
            {subtitle}
            {unread > 0 && ` · ${unread} unread`}
          </p>
        </div>

        {items.length > 0 && (
          <div className="btn-group">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleMarkAll}
              disabled={unread === 0}
            >
              <IconCheck size={15} /> Mark all read
            </button>
            <button type="button" className="btn btn--danger-ghost" onClick={() => setConfirmClear(true)}>
              <IconTrash size={15} /> Clear
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<IconBell size={24} />}
          title="No notifications yet"
          text="Updates about your requests, applications and reviews will appear here. Nothing is sent by email or SMS in this demo."
        />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bell__item"
              style={{
                borderBottom: index === items.length - 1 ? 'none' : undefined,
                background: item.isRead ? 'var(--white)' : 'var(--brand-50)',
                cursor: 'default',
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 999,
                  marginTop: 7,
                  flexShrink: 0,
                  background: item.isRead ? 'var(--ink-200)' : 'var(--brand-500)',
                }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row row--between" style={{ gap: 12 }}>
                  <span className="bell__item-title">{item.title}</span>
                  <span className="bell__item-time" style={{ flexShrink: 0 }}>
                    {timeAgo(item.createdAt)}
                  </span>
                </div>

                {item.message && <div className="bell__item-message">{item.message}</div>}

                <div className="row" style={{ gap: 8, marginTop: 8 }}>
                  {!item.isRead && (
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => {
                        notificationService.markRead(item.id);
                        refresh();
                      }}
                    >
                      <IconCheck size={13} /> Mark read
                    </button>
                  )}
                  {item.link && (
                    <Link
                      className="btn btn--ghost btn--sm"
                      to={item.link}
                      onClick={() => {
                        if (!item.isRead) notificationService.markRead(item.id);
                        refresh();
                      }}
                    >
                      Go to page
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Clear all notifications?"
        message="Every notification in this list will be removed. This only affects this browser and cannot be undone."
        confirmLabel="Clear notifications"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          items.forEach((item) => notificationService.remove(item.id));
          setConfirmClear(false);
          refresh();
        }}
      />
    </div>
  );
}