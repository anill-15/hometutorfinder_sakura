import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge.jsx';
import Avatar from '../common/Avatar.jsx';
import { formatINR, formatDate, clamp } from '../../utils/helpers.js';
import { formatPlace } from '../../utils/lookups.js';
import {
  IconCalendar, IconClock, IconMoney, IconLocation, IconUsers,
} from '../common/Icons.jsx';

/**
 * A posted tuition requirement.
 *
 * `showApplications` renders the tutor applications that came in for it
 * (student side only). `tutorMode` renders the apply button instead.
 */
export default function RequirementCard({
  requirement,
  applications = [],
  viewerRole = 'student',
  onAccept,
  onReject,
  onApply,
  onEdit,
  onDelete,
  onClose,
  applied = false,
}) {
  // "Open" here means a tutor can still submit an application. An assigned
  // requirement stays visible for the record but is no longer accepting.
  const isOpen = ['open', 'applications_received', 'shortlisted'].includes(requirement.status);
  const isAssigned = requirement.status === 'assigned';

  return (
    <article className="item-card">
      <div className="item-card__header">
        <div style={{ minWidth: 0 }}>
          <div className="item-card__title">{requirement.subject} · {requirement.classLevel}</div>
          <div className="item-card__subtitle">
            {[requirement.board, requirement.teachingMode === 'both' ? 'Online or in-person' : requirement.teachingMode === 'offline' ? 'In-person' : 'Online']
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>
        <StatusBadge status={requirement.status} />
      </div>

      <div className="item-card__meta">
        <span className="item-card__meta-item">
          <IconLocation size={14} />
          {formatPlace(requirement.city, requirement.locality) || 'Location flexible'}
        </span>

        {(requirement.budgetMin > 0 || requirement.budgetMax > 0) && (
          <span className="item-card__meta-item">
            <IconMoney size={14} />
            {requirement.budgetMax > 0
              ? `${formatINR(requirement.budgetMin)}–${formatINR(requirement.budgetMax)}/month`
              : `Up to ${formatINR(requirement.budgetMin)}/month`}
          </span>
        )}

        {requirement.preferredDays?.length > 0 && (
          <span className="item-card__meta-item">
            <IconClock size={14} />
            {requirement.preferredDays.join(', ')}
            {requirement.preferredTime ? ` · ${requirement.preferredTime}` : ''}
          </span>
        )}

        <span className="item-card__meta-item">
          <IconCalendar size={14} />
          Posted {formatDate(requirement.createdAt)}
        </span>
      </div>

      {requirement.description && (
        <p className="item-card__description">{clamp(requirement.description, 320)}</p>
      )}

      {applications.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div className="field__label" style={{ marginBottom: 9, display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconUsers size={14} />
            {applications.length} tutor application{applications.length === 1 ? '' : 's'}
          </div>

          {applications.map((app) => (
            <div className="application-row" key={app.id}>
              <Avatar name={app.tutorUser?.name} size="sm" />

              <div className="application-row__info">
                <div className="application-row__name">
                  {app.tutorUser?.name || 'Tutor'}
                  <StatusBadge status={app.status} />
                </div>
                <div className="application-row__meta">
                  {app.tutor?.experience ?? 0} years experience
                  {app.proposedFee > 0 && ` · ${formatINR(app.proposedFee)}/month`}
                  {app.tutor && ` · teaches ${(app.tutor.subjects || []).slice(0, 2).join(', ')}`}
                </div>

                {app.message && <div className="application-row__message">{clamp(app.message, 260)}</div>}

                {app.status === 'pending' && onAccept && (
                  <div className="application-row__actions">
                    <button type="button" className="btn btn--primary btn--sm" onClick={() => onAccept(app)}>
                      Accept
                    </button>
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => onReject(app)}>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="item-card__footer">
        {viewerRole === 'public' ? (
          <>
            <div className="item-card__footer-spacer" />
            <Link to="/login" className="btn btn--ghost btn--sm">Sign in to apply</Link>
          </>
        ) : viewerRole === 'student' ? (
          <>
            {(isOpen || isAssigned) && onEdit && (
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => onEdit(requirement)}>
                Edit
              </button>
            )}
            {(isOpen || isAssigned) && onClose && (
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => onClose(requirement)}>
                Close requirement
              </button>
            )}
            {onDelete && (
              <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => onDelete(requirement)}>
                Delete
              </button>
            )}
            <div className="item-card__footer-spacer" />
            <Link to={`/student/requirements/${requirement.id}`} className="btn btn--ghost btn--sm">
              View details
            </Link>
          </>
        ) : (
          <>
            {onApply && !applied && isOpen && (
              <button type="button" className="btn btn--primary btn--sm" onClick={() => onApply(requirement)}>
                Apply for this tuition
              </button>
            )}
            {applied && (
              <span className="badge badge--info">You have applied</span>
            )}
            {!isOpen && (
              <span className="small muted">
                {isAssigned
                  ? 'A tutor has been assigned to this requirement.'
                  : 'This requirement is no longer accepting applications.'}
              </span>
            )}
          </>
        )}
      </div>
    </article>
  );
}