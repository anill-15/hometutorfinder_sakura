import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DataTable from '../../components/admin/DataTable.jsx';
import * as adminService from '../../services/adminService.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import RatingStars from '../../components/common/RatingStars.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Modal from '../../components/common/Modal.jsx';
import { formatDate, formatDateTime } from '../../utils/helpers.js';
import RequestCard, { RequestTimeline } from '../../components/student/RequestCard.jsx';
import { IconChat } from '../../components/common/Icons.jsx';

const FILTERS = ['all', 'pending', 'accepted', 'completed', 'rejected', 'cancelled'];

/** `/admin/requests` — every tutoring and demo request. */
export default function Requests() {
  // The dashboard links to /admin/requests?filter=completed.
  const [params] = useSearchParams();
  const [filter, setFilter] = useState(
    FILTERS.includes(params.get('filter')) ? params.get('filter') : 'all',
  );
  const [selected, setSelected] = useState(null);

  const all = adminService.listRequests();
  const visible = filter === 'all' ? all : all.filter((r) => r.status === filter);

  const counts = FILTERS.reduce((acc, status) => {
    acc[status] = status === 'all' ? all.length : all.filter((r) => r.status === status).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Requests</h1>
          <p className="dashboard-header__subtitle">
            {all.length} request{all.length === 1 ? '' : 's'} sent between students and tutors.
          </p>
        </div>
      </div>

      <div className="search-toolbar" style={{ marginBottom: 18 }}>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              className={`tag ${filter === status ? 'tag--active' : ''}`}
              onClick={() => setFilter(status)}
              aria-pressed={filter === status}
              style={{ cursor: 'pointer' }}
            >
              {status[0].toUpperCase() + status.slice(1)}
              {counts[status] > 0 && <span>({counts[status]})</span>}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<IconChat size={24} />}
          title="No requests here"
          text="Nothing matches this status filter."
          action={<button type="button" className="btn btn--secondary" onClick={() => setFilter('all')}>Show all</button>}
        />
      ) : (
        <DataTable
          caption="All tuition and demo requests"
          headers={['Student', 'Tutor', 'Subject', 'Type', 'Status', 'Review', 'Sent', 'Details']}
          rowKey={(_, index) => visible[index].id}
          rows={visible.map((request) => [
            { key: 'student', label: 'Student', render: () => request.student?.name || '—' },
            { key: 'tutor', label: 'Tutor', render: () => request.tutorUser?.name || '—' },
            { key: 'subject', label: 'Subject', render: () => request.subject || '—' },
            { key: 'type', label: 'Type', render: () => (request.type === 'demo' ? 'Demo' : 'Tuition') },
            { key: 'status', label: 'Status', render: () => <StatusBadge status={request.status} /> },
            {
              key: 'review',
              label: 'Review',
              render: () =>
                request.review ? (
                  <RatingStars value={request.review.rating} size={12} />
                ) : (
                  <span className="small muted">
                    {request.status === 'completed' ? 'Awaiting' : '—'}
                  </span>
                ),
            },
            { key: 'sent', label: 'Sent', render: () => formatDate(request.createdAt) },
            {
              key: 'details',
              label: 'Details',
              render: () => (
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setSelected(request)}>
                  View
                </button>
              ),
            },
          ])}
        />
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.type === 'demo' ? 'Demo' : 'Tuition'} request` : 'Request'}
        wide
      >
        {selected && (
          <div className="stack">
            <RequestCard request={selected} viewerRole="admin" actions={null}>
              <div>
                <div className="field__label" style={{ margin: '4px 0 10px' }}>Status history</div>
                <RequestTimeline timeline={selected.timeline} />
              </div>
            </RequestCard>

            {selected.review && (
              <div className="card card--pad">
                <div className="field__label" style={{ marginBottom: 8 }}>Review</div>
                <RatingStars value={selected.review.rating} size={16} />
                {selected.review.comment && (
                  <p className="small" style={{ marginTop: 8, color: 'var(--ink-600)' }}>
                    {selected.review.comment}
                  </p>
                )}
                <p className="small muted" style={{ marginTop: 8 }}>
                  Submitted {formatDateTime(selected.review.createdAt)}
                </p>
              </div>
            )}

            {selected.tutor && (
              <Link className="btn btn--secondary" to={`/tutors/${selected.tutor.id}`}>
                View tutor profile
              </Link>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}