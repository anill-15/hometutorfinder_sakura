import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as requestService from '../../services/requestService.js';
import { toast } from '../../hooks/useToast.js';
import { plural } from '../../utils/helpers.js';
import RequestCard, { RequestTimeline } from '../../components/student/RequestCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Modal from '../../components/common/Modal.jsx';
import { IconChat, IconCheck, IconClock, IconInfo } from '../../components/common/Icons.jsx';

const FILTERS = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Declined' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'all', label: 'All' },
];

const WHY = {
  pending: 'A student is waiting for your reply. Accept if the timings work, otherwise decline politely.',
  accepted: 'This session is agreed. Mark it complete after the class so the student can leave a review.',
  completed: 'Done. The student can now review the session.',
};

/** `/tutor/requests` — incoming student requests. */
export default function Requests() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('pending');
  const [declining, setDeclining] = useState(null);
  const [note, setNote] = useState('');
  const [selected, setSelected] = useState(null);
  const [, setVersion] = useState(0);

  const all = requestService.listForTutor(user.id);
  const visible = filter === 'all' ? all : all.filter((r) => r.status === filter);
  const summary = requestService.summarise(all);

  const refresh = () => setVersion((v) => v + 1);

  const respond = (request, status, message = '') => {
    const result = requestService.updateStatus(request.id, status, user, { note: message });
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }

    const labels = {
      accepted: 'Request accepted',
      rejected: 'Request declined',
      completed: 'Session marked complete',
      cancelled: 'Request cancelled',
    };
    toast.success(labels[status] || 'Request updated');
    refresh();
    return true;
  };

  const confirmDecline = () => {
    if (declining && respond(declining, 'rejected', note)) {
      setDeclining(null);
      setNote('');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Student requests</h1>
          <p className="dashboard-header__subtitle">
            {summary.pending > 0
              ? `${plural(summary.pending, 'request')} waiting for your reply.`
              : 'No pending requests. Respond quickly to keep your response rate high.'}
          </p>
        </div>
        <div className="btn-group">
          <Link className="btn btn--secondary" to="/tutor/availability">My availability</Link>
          <Link className="btn btn--primary" to="/tutor/requirements">Find more work</Link>
        </div>
      </div>

      <div className="grid grid--stats" style={{ marginBottom: 22 }}>
        <div className="stat-card">
          <div className="stat-card__label">Pending</div>
          <div className="stat-card__value">{summary.pending}</div>
          <div className="stat-card__hint">Awaiting your reply</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Accepted</div>
          <div className="stat-card__value">{summary.accepted}</div>
          <div className="stat-card__hint">{summary.upcomingDemos} demo classes</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Completed</div>
          <div className="stat-card__value">{summary.completed}</div>
          <div className="stat-card__hint">Sessions delivered</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Declined</div>
          <div className="stat-card__value">{summary.rejected}</div>
          <div className="stat-card__hint">Not taken up</div>
        </div>
      </div>

      <div className="search-toolbar" style={{ marginBottom: 18 }}>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map((option) => {
            const count = requestService.filterByStatus(all, option.value).length;
            return (
              <button
                key={option.value}
                type="button"
                className={`tag ${filter === option.value ? 'tag--active' : ''}`}
                onClick={() => setFilter(option.value)}
                aria-pressed={filter === option.value}
                style={{ cursor: 'pointer' }}
              >
                {option.label} {count > 0 && <span>({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {WHY[filter] && (
        <div className="alert alert--info" style={{ marginBottom: 16 }}>
          <IconInfo size={15} />
          <span>{WHY[filter]}</span>
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState
          icon={<IconChat size={24} />}
          title={all.length === 0 ? 'No requests yet' : 'Nothing in this filter'}
          text={
            all.length === 0
              ? 'When a student sends you a tuition or demo request, it appears here with their message and preferred timings.'
              : 'Try another status filter to see your other requests.'
          }
          action={
            all.length === 0 ? (
              <Link className="btn btn--primary" to="/tutor/requirements">Browse student requirements</Link>
            ) : (
              <button type="button" className="btn btn--secondary" onClick={() => setFilter('all')}>
                Show all requests
              </button>
            )
          }
        />
      ) : (
        <div className="stack">
          {visible.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              viewerRole="tutor"
              actions={requestService.availableActions(request, 'tutor').map((action) => ({
                ...action,
                variant: action.status === 'rejected' ? 'secondary' : action.variant,
                onClick: () => {
                  if (action.status === 'rejected') {
                    setNote('');
                    setDeclining(request);
                  } else {
                    respond(request, action.status);
                  }
                },
              }))}
            >
              <div className="row row--wrap" style={{ gap: 10, marginBottom: 12 }}>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setSelected(request)}
                >
                  <IconClock size={14} /> Status history
                </button>

                {request.status === 'accepted' && (
                  <span className="badge badge--success">
                    <IconCheck size={12} /> Mark complete after the class
                  </span>
                )}
              </div>
            </RequestCard>
          ))}
        </div>
      )}

      {/* ------------------------- status timeline ------------------------- */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Status history · ${selected.student?.name || 'Student'}` : 'Status history'}
      >
        {selected && (
          <div className="stack">
            <p className="small muted">
              {selected.type === 'demo' ? 'Demo class request' : 'Tuition request'}
              {selected.subject ? ` for ${selected.subject}` : ''}
            </p>
            <RequestTimeline timeline={selected.timeline} />
          </div>
        )}
      </Modal>

      {/* --------------------------- decline dialog -------------------------- */}
      <Modal
        open={declining !== null}
        onClose={() => setDeclining(null)}
        title="Decline this request"
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={() => setDeclining(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn--danger" onClick={confirmDecline}>
              Decline request
            </button>
          </>
        }
      >
        <div className="stack">
          <p className="small muted">
            A short reason helps the student, and helps you look reliable when they contact another
            tutor. This note is visible to the student.
          </p>
          <div className="field">
            <label className="field__label" htmlFor="field-decline-note">Reason (optional)</label>
            <textarea
              id="field-decline-note"
              className="textarea"
              rows={3}
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Example: My schedule is full for this slot, please try again next month."
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}