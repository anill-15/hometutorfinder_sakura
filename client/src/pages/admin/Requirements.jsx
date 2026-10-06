import { useState } from 'react';
import DataTable from '../../components/admin/DataTable.jsx';
import * as adminService from '../../services/adminService.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { formatINR, formatDate } from '../../utils/helpers.js';
import { formatPlace } from '../../utils/lookups.js';
import { IconBriefcase, IconUsers } from '../../components/common/Icons.jsx';

const STATUS_FILTERS = ['all', 'open', 'applications_received', 'shortlisted', 'assigned', 'closed', 'cancelled'];

const LABELS = {
  applications_received: 'Applications received',
  online: 'Online',
  offline: 'In-person',
  both: 'Online / in-person',
};

/** `/admin/requirements` — every posted tuition requirement. */
export default function Requirements() {
  const [filter, setFilter] = useState('all');

  const all = adminService.listRequirements();
  const visible = filter === 'all' ? all : all.filter((r) => r.status === filter);

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Requirements</h1>
          <p className="dashboard-header__subtitle">
            {all.length} requirement{all.length === 1 ? '' : 's'} posted across all students.
          </p>
        </div>
      </div>

      <div className="search-toolbar" style={{ marginBottom: 18 }}>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((status) => {
            const count = status === 'all' ? all.length : all.filter((r) => r.status === status).length;
            return (
              <button
                key={status}
                type="button"
                className={`tag ${filter === status ? 'tag--active' : ''}`}
                onClick={() => setFilter(status)}
                aria-pressed={filter === status}
                style={{ cursor: 'pointer' }}
              >
                {LABELS[status] || status[0].toUpperCase() + status.slice(1)}
                {count > 0 && <span>({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<IconBriefcase size={24} />}
          title="No requirements here"
          text="Nothing matches this status filter."
          action={<button type="button" className="btn btn--secondary" onClick={() => setFilter('all')}>Show all</button>}
        />
      ) : (
        <DataTable
          caption="All tuition requirements"
          headers={['Subject', 'Student', 'Class', 'Location', 'Budget', 'Mode', 'Applications', 'Status', 'Posted']}
          rowKey={(_, index) => visible[index].id}
          rows={visible.map((req) => [
            { key: 'subject', label: 'Subject', render: () => <span className="strong">{req.subject}</span> },
            { key: 'student', label: 'Student', render: () => req.student?.name || '—' },
            {
              key: 'class',
              label: 'Class',
              render: () => `${req.classLevel}${req.board ? ` (${req.board})` : ''}`,
            },
            { key: 'location', label: 'Location', render: () => formatPlace(req.city, req.locality) || 'Flexible' },
            {
              key: 'budget',
              label: 'Budget',
              render: () =>
                req.budgetMax > 0
                  ? `${formatINR(req.budgetMin)}–${formatINR(req.budgetMax)}`
                  : req.budgetMin > 0
                    ? `From ${formatINR(req.budgetMin)}`
                    : '—',
            },
            {
              key: 'mode',
              label: 'Mode',
              render: () => LABELS[req.teachingMode] || 'Not specified',
            },
            {
              key: 'apps',
              label: 'Applications',
              render: () => (
                <span className="row" style={{ gap: 5 }}>
                  <IconUsers size={13} />
                  {req.applicationCount}
                </span>
              ),
            },
            { key: 'status', label: 'Status', render: () => <StatusBadge status={req.status} /> },
            { key: 'posted', label: 'Posted', render: () => formatDate(req.createdAt) },
          ])}
        />
      )}
    </div>
  );
}