import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DataTable from '../../components/admin/DataTable.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import * as adminService from '../../services/adminService.js';
import { toast } from '../../hooks/useToast.js';
import { formatDate, plural } from '../../utils/helpers.js';
import { formatPlace } from '../../utils/lookups.js';
import Avatar from '../../components/common/Avatar.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { SearchInput } from '../../components/tutor/SearchBar.jsx';
import { IconUsers, IconShield, IconAlert } from '../../components/common/Icons.jsx';

const ROLE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'student', label: 'Students' },
  { value: 'tutor', label: 'Tutors' },
  { value: 'admin', label: 'Admins' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'Any status' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];

/** `/admin/users` — search, filter, suspend and restore accounts. */
export default function Users() {
  const { user: currentUser } = useAuth();
  // The dashboard links straight to /admin/users?filter=suspended, so the
  // status filter is seeded from the query string.
  const [params] = useSearchParams();
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState(
    STATUS_FILTERS.some((option) => option.value === params.get('filter'))
      ? params.get('filter')
      : 'all',
  );
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null); // { user, nextStatus }
  const [, setVersion] = useState(0);

  const users = adminService.listUsers();
  const needle = search.trim().toLowerCase();

  const visible = users
    .filter((u) => (role === 'all' ? true : u.role === role))
    .filter((u) => (status === 'all' ? true : u.status === status))
    .filter((u) => {
      if (!needle) return true;
      return [u.name, u.email, u.phone, u.locality]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(needle));
    });

  const resetFilters = () => {
    setRole('all');
    setStatus('all');
    setSearch('');
  };

  const handleConfirm = () => {
    const result = adminService.setUserStatus(confirm.user.id, confirm.nextStatus);
    if (!result.ok) {
      toast.error(result.error);
    } else {
      toast.success(
        `${confirm.user.name} ${confirm.nextStatus === 'suspended' ? 'suspended' : 'reactivated'}`,
      );
      setVersion((v) => v + 1);
    }
    setConfirm(null);
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Users</h1>
          <p className="dashboard-header__subtitle">
            {plural(users.length, 'account')} registered in this browser. Suspending an account blocks
            it from signing in immediately.
          </p>
        </div>
      </div>

      <section className="card card--pad" style={{ marginBottom: 20 }}>
        <div className="form-grid" style={{ alignItems: 'end' }}>
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <label className="field__label" htmlFor="admin-user-search">Search</label>
            <SearchInput value={search} onChange={setSearch} placeholder="Name, email, phone or locality" />
          </div>

          <div className="field">
            <span className="field__label">Role</span>
            <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
              {ROLE_FILTERS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`tag ${role === option.value ? 'tag--active' : ''}`}
                  onClick={() => setRole(option.value)}
                  aria-pressed={role === option.value}
                  style={{ cursor: 'pointer' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field__label">Status</span>
            <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
              {STATUS_FILTERS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`tag ${status === option.value ? 'tag--active' : ''}`}
                  onClick={() => setStatus(option.value)}
                  aria-pressed={status === option.value}
                  style={{ cursor: 'pointer' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {visible.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={24} />}
          title="No accounts match these filters"
          text="Try a different role, status, or clear the search box."
          action={<button type="button" className="btn btn--secondary" onClick={resetFilters}>Clear filters</button>}
        />
      ) : (
        <DataTable
          headers={['User', 'Role', 'Contact', 'Location', 'Status', 'Joined', 'Actions']}
          rowKey={(_, index) => visible[index].id}
          rows={visible.map((account) => {
            const isSelf = account.id === currentUser.id;
            const canSuspend = !isSelf && account.role !== 'admin';

            return [
              {
                key: 'user',
                label: 'User',
                render: () => (
                  <div className="row" style={{ gap: 10 }}>
                    <Avatar name={account.name} size="xs" />
                    <div style={{ minWidth: 0 }}>
                      <div className="strong small">
                        {account.name}
                        {isSelf && <span className="muted"> (you)</span>}
                      </div>
                      <div className="small muted">{account.email}</div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'role',
                label: 'Role',
                render: () => <span className="badge badge--neutral">{account.role}</span>,
              },
              { key: 'contact', label: 'Contact', render: () => account.phone || '—' },
              {
                key: 'location',
                label: 'Location',
                render: () => formatPlace(account.city, account.locality) || '—',
              },
              {
                key: 'status',
                label: 'Status',
                render: () => <StatusBadge status={account.status} />,
              },
              { key: 'joined', label: 'Joined', render: () => formatDate(account.createdAt) },
              {
                key: 'actions',
                label: 'Actions',
                render: () =>
                  canSuspend ? (
                    <div className="btn-group">
                      {account.status === 'active' ? (
                        <button
                          type="button"
                          className="btn btn--danger-ghost btn--sm"
                          onClick={() => setConfirm({ user: account, nextStatus: 'suspended' })}
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          onClick={() => setConfirm({ user: account, nextStatus: 'active' })}
                        >
                          Restore
                        </button>
                      )}
                      {account.role === 'tutor' && account.tutor && (
                        <Link to="/admin/tutors" className="btn btn--ghost btn--sm">Verify</Link>
                      )}
                    </div>
                  ) : (
                    <span className="small muted">{isSelf ? 'Not available' : 'Admin'}</span>
                  ),
              },
            ];
          })}
        />
      )}

      <div className="alert alert--warning" style={{ marginTop: 18 }}>
        <IconAlert size={15} />
        <span>
          <strong>Suspending</strong> prevents an account from signing in. It does not delete their
          requests or reviews, so activity history stays intact.
        </span>
      </div>

      <div className="alert alert--info" style={{ marginTop: 12 }}>
        <IconShield size={15} />
        <span>Administrator accounts cannot be suspended or removed from this screen.</span>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.nextStatus === 'suspended' ? 'Suspend this account?' : 'Restore this account?'}
        message={
          confirm?.nextStatus === 'suspended'
            ? `${confirm?.user.name} will not be able to sign in again until the account is restored. Their existing data is kept.`
            : `${confirm?.user.name} will be able to sign in again immediately.`
        }
        confirmLabel={confirm?.nextStatus === 'suspended' ? 'Suspend account' : 'Restore account'}
        variant={confirm?.nextStatus === 'suspended' ? 'danger' : 'primary'}
        onCancel={() => setConfirm(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}