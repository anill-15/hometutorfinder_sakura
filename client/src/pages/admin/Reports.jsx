import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as reportService from '../../services/reportService.js';
import { toast } from '../../hooks/useToast.js';
import { formatDateTime, plural } from '../../utils/helpers.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Modal from '../../components/common/Modal.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import { IconFlag, IconCheck, IconClose } from '../../components/common/Icons.jsx';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

const NEXT_ACTIONS = {
  open: ['reviewing', 'resolved', 'dismissed'],
  reviewing: ['resolved', 'dismissed'],
  resolved: [],
  dismissed: [],
};

/** `/admin/reports` — triage the report queue. */
export default function Reports() {
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState(null); // { report, status }
  const [note, setNote] = useState('');

  const all = reportService.listAll();
  const visible = filter === 'all' ? all : all.filter((r) => r.status === filter);

  const counts = FILTERS.reduce((acc, option) => {
    acc[option.value] = option.value === 'all' ? all.length : all.filter((r) => r.status === option.value).length;
    return acc;
  }, {});

  const openReport = (report, status) => {
    setNote(status === 'dismissed' ? 'Not a violation of the guidelines.' : report.adminNote || '');
    setActive({ report, status });
  };

  const save = () => {
    const result = reportService.updateStatus(active.report.id, active.status, note);
    if (!result.ok) {
      toast.error(result.error);
    } else {
      toast.success(`Report marked ${active.status}`);
      setActive(null);
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Reports</h1>
          <p className="dashboard-header__subtitle">
            {counts.open + counts.reviewing > 0
              ? `${plural(counts.open + counts.reviewing, 'report')} need attention out of ${all.length}.`
              : `All ${all.length} reports have been handled.`}
          </p>
        </div>
      </div>

      <div className="search-toolbar" style={{ marginBottom: 18 }}>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`tag ${filter === option.value ? 'tag--active' : ''}`}
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
              style={{ cursor: 'pointer' }}
            >
              {option.label} {counts[option.value] > 0 && <span>({counts[option.value]})</span>}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<IconFlag size={24} />}
          title={all.length === 0 ? 'No reports filed' : 'Nothing in this filter'}
          text={
            all.length === 0
              ? 'Nothing has been reported. Reports filed from tutor profiles appear here for triage.'
              : 'Try another status filter.'
          }
          action={
            all.length > 0 ? (
              <button type="button" className="btn btn--secondary" onClick={() => setFilter('all')}>
                Show all reports
              </button>
            ) : null
          }
        />
      ) : (
        <div className="stack">
          {visible.map((report) => (
            <article className="item-card" key={report.id}>
              <div className="row row--between row--wrap" style={{ gap: 12, marginBottom: 14 }}>
                <div className="row" style={{ gap: 11, minWidth: 0 }}>
                  <Avatar name={report.reported?.name} size="sm" />
                  <div style={{ minWidth: 0 }}>
                    <div className="item-card__title row" style={{ gap: 8 }}>
                      {report.reported?.name || 'Unknown profile'}
                      <StatusBadge status={report.status} />
                      <span className="badge badge--warning">{report.reason}</span>
                    </div>
                    <div className="item-card__subtitle">
                      Reported by {report.reporter?.name || 'a user'} · {formatDateTime(report.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="item-card__meta">
                <span className="item-card__meta-item">
                  Reported role: {report.reported?.role || 'unknown'}
                </span>
                {report.reported?.status === 'suspended' && (
                  <span className="item-card__meta-item">
                    <StatusBadge status="suspended" />
                  </span>
                )}
              </div>

              {report.details && <p className="item-card__description">{report.details}</p>}

              {report.adminNote && (
                <div className="alert alert--info">
                  <span>
                    <strong>Administrator note:</strong> {report.adminNote}
                  </span>
                </div>
              )}

              <div className="item-card__footer">
                {report.tutor && (
                  <Link to={`/tutors/${report.tutor.id}`} className="btn btn--secondary btn--sm">
                    View profile
                  </Link>
                )}

                {report.reported && (
                  <Link to="/admin/users" className="btn btn--ghost btn--sm">
                    Manage account
                  </Link>
                )}

                <div className="item-card__footer-spacer" />

                {NEXT_ACTIONS[report.status]?.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`btn btn--sm ${status === 'resolved' ? 'primary' : 'secondary'}`}
                    onClick={() => openReport(report, status)}
                  >
                    {status === 'reviewing' && 'Mark as reviewing'}
                    {status === 'resolved' && (
                      <>
                        <IconCheck size={14} /> Resolve
                      </>
                    )}
                    {status === 'dismissed' && (
                      <>
                        <IconClose size={14} /> Dismiss
                      </>
                    )}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={active !== null}
        onClose={() => setActive(null)}
        title={active?.status === 'dismissed' ? 'Dismiss this report' : 'Resolve this report'}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={() => setActive(null)}>
              Cancel
            </button>
            <button
              type="button"
              className={`btn btn--${active?.status === 'dismissed' ? 'secondary' : 'primary'}`}
              onClick={save}
            >
              {active?.status === 'dismissed' ? 'Dismiss report' : 'Resolve report'}
            </button>
          </>
        }
      >
        {active && (
          <div className="stack">
            <div className="item-card__description" style={{ marginBottom: 0 }}>
              <strong>{active.report.reason}</strong>
              <br />
              {active.report.details || 'No additional details were provided.'}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="field-report-note">Administrator note</label>
              <textarea
                id="field-report-note"
                className="textarea"
                rows={3}
                maxLength={400}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Record what action you took. This is visible to administrators only."
              />
            </div>

            {active.status === 'resolved' && (
              <div className="alert alert--info">
                <span>
                  Consider suspending the account from the{' '}
                  <Link to="/admin/users">users page</Link> if the report involved misconduct.
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}