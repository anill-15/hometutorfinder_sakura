import StatusBadge from '../common/StatusBadge.jsx';
import Avatar from '../common/Avatar.jsx';
import { formatDateTime, formatDate, clamp } from '../../utils/helpers.js';
import { formatPlace } from '../../utils/lookups.js';
import {
  IconCalendar, IconClock, IconMoney, IconLocation, IconVideo, IconChat, IconUser, IconCheck, IconVerified,
} from '../common/Icons.jsx';

/**
 * Renders one request (tuition or demo).
 *
 * `viewerRole` decides which side of the request is shown and which actions
 * appear. The allowed actions come from requestService so invalid transitions
 * are never offered.
 */
export default function RequestCard({
  request,
  viewerRole,
  actions = null,
  children,
}) {
  const isStudentSide = viewerRole === 'student';
  // On the student side the counterparty is the tutor (profile + user record);
  // on the tutor side it is the student, who only exists as a user record.
  const counterpartyUser = isStudentSide ? request.tutorUser : request.student;
  const counterpartyProfile = isStudentSide ? request.tutor : null;
  const name = counterpartyUser?.name || (isStudentSide ? 'Tutor' : 'Student');

  return (
    <article className="item-card">
      <div className="item-card__header">
        <div className="row row--start" style={{ gap: 12, minWidth: 0 }}>
          {counterpartyUser ? (
            <Avatar name={name} size="sm" />
          ) : (
            <span className="avatar avatar--sm avatar--square" style={{ background: 'var(--brand-100)', color: 'var(--brand-700)' }}>
              <IconUser size={16} />
            </span>
          )}

          <div style={{ minWidth: 0 }}>
            <div className="item-card__title">{name}</div>
            <div className="item-card__subtitle">
              {request.type === 'demo' ? 'Demo class request' : 'Tuition request'}
              {request.subject ? ` · ${request.subject}` : ''}
            </div>
          </div>
        </div>

        <StatusBadge status={request.status} />
      </div>

      <div className="item-card__meta">
        {request.preferredDate && (
          <span className="item-card__meta-item">
            <IconCalendar size={14} />
            {formatDate(request.preferredDate)}
          </span>
        )}
        {request.preferredTime && (
          <span className="item-card__meta-item">
            <IconClock size={14} />
            {request.preferredTime}
          </span>
        )}
        {isStudentSide && counterpartyProfile?.monthlyFee > 0 && (
          <span className="item-card__meta-item">
            <IconMoney size={14} />
            ₹{counterpartyProfile.monthlyFee.toLocaleString('en-IN')}/month
          </span>
        )}
        {isStudentSide && counterpartyProfile?.teachingModes?.length > 0 && (
          <span className="item-card__meta-item">
            <IconVideo size={14} />
            {counterpartyProfile.teachingModes.map((m) => (m === 'offline' ? 'In-person' : 'Online')).join(' · ')}
          </span>
        )}
        {counterpartyProfile?.verificationStatus === 'verified' && (
          <span className="item-card__meta-item">
            <IconVerified size={14} /> Verified tutor
          </span>
        )}
        {!isStudentSide && request.student && (
          <span className="item-card__meta-item">
            <IconLocation size={14} />
            {formatPlace(request.student.city, request.student.locality) || 'Location not set'}
          </span>
        )}
      </div>

      {request.message && <p className="item-card__description">{clamp(request.message, 400)}</p>}

      {request.tutorNote && request.status === 'rejected' && (
        <div className="alert alert--warning">
          <IconChat size={15} />
          <span>{request.tutorNote}</span>
        </div>
      )}

      {children}

      {(actions?.length > 0 || actions !== null) && (
        <div className="item-card__footer">
          {actions?.map((action) => (
            <button
              key={action.status}
              type="button"
              className={`btn btn--${action.variant || 'secondary'} btn--sm`}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </button>
          ))}
          <div className="item-card__footer-spacer" />
          <span className="small muted">Sent {formatDateTime(request.createdAt)}</span>
        </div>
      )}
    </article>
  );
}

/** Read-only timeline of how a request progressed. */
export function RequestTimeline({ timeline = [] }) {
  if (timeline.length === 0) return null;

  return (
    <div className="timeline">
      {timeline.map((event, index) => (
        <div className="timeline__item" key={`${event.status}-${index}`}>
          <span className={`timeline__dot ${index === timeline.length - 1 ? 'is-complete' : ''}`}>
            {index === timeline.length - 1 ? <IconCheck size={12} /> : null}
          </span>
          <div>
            <div className="timeline__label">{event.label}</div>
            <div className="timeline__meta">
              {formatDateTime(event.at)}
              {event.by ? ` · by ${event.by}` : ''}
            </div>
            {event.note && <div className="timeline__note">{event.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}