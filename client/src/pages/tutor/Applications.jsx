import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as requirementService from '../../services/requirementService.js';
import * as tutorService from '../../services/tutorService.js';
import { toast } from '../../hooks/useToast.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { formatINR, formatDate } from '../../utils/helpers.js';
import { formatPlace } from '../../utils/lookups.js';
import { IconBriefcase, IconCheck, IconClose, IconClock } from '../../components/common/Icons.jsx';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

const EXPLAIN = {
  pending: 'The student has not decided yet. You will be notified when they respond.',
  accepted: 'The student shortlisted your application. Send them a tuition or demo request to begin.',
  rejected: 'The student went with another tutor this time.',
  withdrawn: 'You withdrew this application.',
};

/** `/tutor/applications` — the applications this tutor has sent. */
export default function Applications() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [withdrawing, setWithdrawing] = useState(null);

  const all = requirementService.applicationsByTutor(user.id);
  const visible = filter === 'all' ? all : all.filter((a) => a.status === filter);

  const profile = tutorService.getProfileByUserId(user.id);

  const handleWithdraw = (application) => {
    const result = requirementService.withdrawApplication(application.id, user.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('Application withdrawn');
    setWithdrawing(null);
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">My applications</h1>
          <p className="dashboard-header__subtitle">
            {all.length > 0
              ? `${all.length} application${all.length === 1 ? '' : 's'} sent to student requirements.`
              : 'Apply to open requirements and track the response here.'}
          </p>
        </div>
        <Link className="btn btn--primary" to="/tutor/requirements">
          <IconBriefcase size={15} /> Browse requirements
        </Link>
      </div>

      {all.length > 0 && (
        <div className="search-toolbar" style={{ marginBottom: 18 }}>
          <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map((option) => {
              const count = option.value === 'all'
                ? all.length
                : all.filter((a) => a.status === option.value).length;
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
      )}

      {visible.length === 0 ? (
        <EmptyState
          icon={<IconBriefcase size={24} />}
          title={all.length === 0 ? 'No applications sent yet' : 'Nothing in this filter'}
          text={
            all.length === 0
              ? 'Browse open requirements and apply with a short message. Requirements matching your subjects are listed first.'
              : 'Try another status filter to see your other applications.'
          }
          action={
            all.length === 0 ? (
              <Link className="btn btn--primary" to="/tutor/requirements">Browse requirements</Link>
            ) : (
              <button type="button" className="btn btn--secondary" onClick={() => setFilter('all')}>
                Show all applications
              </button>
            )
          }
        />
      ) : (
        <div className="stack">
          {visible.map((application) => {
            const requirement = application.requirement;

            return (
              <article className="item-card" key={application.id}>
                <div className="item-card__header">
                  <div style={{ minWidth: 0 }}>
                    <div className="item-card__title">
                      {requirement ? `${requirement.subject} · ${requirement.classLevel}` : 'Requirement removed'}
                    </div>
                    <div className="item-card__subtitle">
                      {requirement
                        ? `${formatPlace(requirement.city, requirement.locality) || 'Location flexible'} · posted ${formatDate(requirement.createdAt)}`
                        : 'This requirement is no longer available'}
                    </div>
                  </div>
                  <StatusBadge status={application.status} />
                </div>

                {requirement && (
                  <div className="item-card__meta">
                    <span className="item-card__meta-item">
                      <IconClock size={14} />
                      Applied {formatDate(application.createdAt)}
                    </span>
                    {application.proposedFee > 0 && (
                      <span className="item-card__meta-item">
                        You quoted {formatINR(application.proposedFee)}/month
                      </span>
                    )}
                    {requirement.budgetMax > 0 && (
                      <span className="item-card__meta-item">
                        Their budget: up to {formatINR(requirement.budgetMax)}/month
                      </span>
                    )}
                    {(requirement.preferredDays || []).length > 0 && (
                      <span className="item-card__meta-item">
                        {requirement.preferredDays.join(', ')}
                      </span>
                    )}
                  </div>
                )}

                {application.message && <p className="item-card__description">{application.message}</p>}

                {requirement?.description && (
                  <p className="small muted" style={{ marginTop: -6 }}>
                    <strong>Their requirement:</strong> {requirement.description}
                  </p>
                )}

                <div className="alert alert--info" style={{ marginBottom: 14 }}>
                  <span>{EXPLAIN[application.status]}</span>
                </div>

                <div className="item-card__footer">
                  {requirement && ['closed', 'cancelled'].includes(requirement.status) && (
                    <span className="small muted">
                      This requirement is {requirement.status} — no further applications are possible.
                    </span>
                  )}

                  {application.status === 'accepted' && requirement && (
                    <Link to="/tutor/requests" className="btn btn--primary btn--sm">
                      <IconCheck size={14} /> Send a request
                    </Link>
                  )}

                  {application.status === 'pending' && (
                    <button
                      type="button"
                      className="btn btn--danger-ghost btn--sm"
                      onClick={() => setWithdrawing(application)}
                    >
                      <IconClose size={14} /> Withdraw
                    </button>
                  )}

                  <div className="item-card__footer-spacer" />

                  {application.status === 'rejected' && (
                    <span className="small muted">
                      {all.length > 1 && 'You can apply again to similar requirements.'}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!profile && (
        <div className="alert alert--warning" style={{ marginTop: 18 }}>
          <span>
            Your tutor profile is not set up yet. Students see profiles, so complete yours before
            applying.{' '}
            <Link to="/tutor/profile">Set up my profile</Link>
          </span>
        </div>
      )}

      <ConfirmDialog
        open={withdrawing !== null}
        title="Withdraw this application?"
        message="The student will see the application as withdrawn. You can apply again later, but it will appear as a new application."
        confirmLabel="Withdraw application"
        cancelLabel="Keep application"
        onCancel={() => setWithdrawing(null)}
        onConfirm={() => handleWithdraw(withdrawing)}
      />
    </div>
  );
}