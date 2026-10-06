import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as requirementService from '../../services/requirementService.js';
import * as reviewService from '../../services/reviewService.js';
import { toast } from '../../hooks/useToast.js';
import { formatINR, formatDate, formatDateTime } from '../../utils/helpers.js';
import { formatPlace } from '../../utils/lookups.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import RatingStars from '../../components/common/RatingStars.jsx';
import { RequirementForm } from './NewRequirement.jsx';
import {
  IconArrowLeft, IconEdit, IconTrash, IconUsers, IconCheck, IconBriefcase, IconCalendar,
} from '../../components/common/Icons.jsx';

const STATUS_HELP = {
  open: 'Waiting for tutor applications.',
  applications_received: 'Tutors have applied. Review them and shortlist the best fit.',
  shortlisted: 'A tutor has been accepted. Send them a tuition or demo request.',
  assigned: 'This requirement is complete — a tutor has been assigned.',
  closed: 'You closed this requirement. It is no longer visible to tutors.',
  cancelled: 'This requirement was cancelled.',
};

/** `/student/requirements/:id` — detail view, applications and editing. */
export default function RequirementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(null); // 'close' | 'delete'
  const [, setVersion] = useState(0);

  const requirement = requirementService.getRequirement(id);

  if (!requirement) {
    return (
      <EmptyState
        icon={<IconBriefcase size={24} />}
        title="Requirement not found"
        text="This requirement may have been deleted, or the link is incorrect."
        action={<Link className="btn btn--primary" to="/student/requirements">Back to my requirements</Link>}
      />
    );
  }

  // Only the owner may manage a requirement.
  if (requirement.studentId !== user.id) {
    return (
      <EmptyState
        title="This requirement belongs to another student"
        text="You can only view and manage requirements that you posted."
        action={<Link className="btn btn--primary" to="/student/requirements">My requirements</Link>}
      />
    );
  }

  const applications = requirementService.applicationsForRequirement(id);
  const pending = applications.filter((a) => a.status === 'pending');
  const isOpen = ['open', 'applications_received', 'shortlisted', 'assigned'].includes(requirement.status);
  const assignedTutorName = requirement.assignedTutor
    ? (requirement.assignedTutor.user?.name || 'Assigned tutor')
    : '';

  const refresh = () => setVersion((v) => v + 1);

  const handleSave = (form) => {
    const result = requirementService.updateRequirement(id, user.id, form);
    if (!result.ok) return result;
    setEditing(false);
    toast.success('Requirement updated');
    refresh();
    return result;
  };

  const handleAccept = (application) => {
    const result = requirementService.updateApplicationStatus(application.id, 'accepted', user.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    requirementService.assignTutor(requirement.id, application.tutorId, user.id);
    toast.success(`${application.tutorUser?.name} assigned — send them a request to begin`);
    refresh();
  };

  const handleReject = (application) => {
    const result = requirementService.updateApplicationStatus(application.id, 'rejected', user.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.info(`Application from ${application.tutorUser?.name} declined`);
    refresh();
  };

  return (
    <div>
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        onClick={() => navigate('/student/requirements')}
        style={{ marginBottom: 16 }}
      >
        <IconArrowLeft size={15} /> All requirements
      </button>

      <div className="dashboard-header">
        <div>
          <div className="row" style={{ gap: 10, marginBottom: 6 }}>
            <h1 className="dashboard-header__title" style={{ marginBottom: 0 }}>
              {requirement.subject} · {requirement.classLevel}
            </h1>
            <StatusBadge status={requirement.status} />
          </div>
          <p className="dashboard-header__subtitle">{STATUS_HELP[requirement.status]}</p>
        </div>

        {isOpen && (
          <div className="btn-group">
            {!editing && (
              <>
                <button type="button" className="btn btn--secondary" onClick={() => setEditing(true)}>
                  <IconEdit size={15} /> Edit
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => setConfirm('close')}>
                  Close requirement
                </button>
              </>
            )}
            <button type="button" className="btn btn--danger-ghost" onClick={() => setConfirm('delete')}>
              <IconTrash size={15} /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 22, alignItems: 'start' }}>
        <div className="stack">
          {/* ------------------------------ editor ------------------------------ */}
          {editing ? (
            <section className="card card--pad-lg">
              <h2 style={{ fontSize: '1.05rem', marginBottom: 16 }}>Edit requirement</h2>
              <RequirementForm
                initial={requirement}
                onSaved={handleSave}
                submitLabel="Save changes"
              />
            </section>
          ) : (
            <>
              <section className="card card--pad">
                <h2 style={{ fontSize: '1.05rem', marginBottom: 14 }}>Requirement details</h2>
                <dl className="dl">
                  <dt>Subject</dt>
                  <dd>{requirement.subject}</dd>

                  <dt>Class</dt>
                  <dd>{requirement.classLevel}{requirement.board ? ` (${requirement.board})` : ''}</dd>

                  <dt>Teaching mode</dt>
                  <dd>
                    {requirement.teachingMode === 'both'
                      ? 'Online or in-person'
                      : requirement.teachingMode === 'offline'
                        ? 'In-person'
                        : 'Online'}
                  </dd>

                  <dt>Location</dt>
                  <dd>{formatPlace(requirement.city, requirement.locality) || 'Flexible'}</dd>

                  <dt>Budget</dt>
                  <dd>
                    {requirement.budgetMax > 0
                      ? `${formatINR(requirement.budgetMin)} – ${formatINR(requirement.budgetMax)} per month`
                      : requirement.budgetMin > 0
                        ? `From ${formatINR(requirement.budgetMin)} per month`
                        : 'Not specified'}
                  </dd>

                  <dt>Preferred days</dt>
                  <dd>{(requirement.preferredDays || []).join(', ') || 'Flexible'}</dd>

                  <dt>Preferred time</dt>
                  <dd>{requirement.preferredTime || 'Flexible'}</dd>

                  <dt>Posted</dt>
                  <dd>{formatDateTime(requirement.createdAt)}</dd>
                </dl>

                {requirement.description && (
                  <>
                    <h3 style={{ fontSize: '0.92rem', margin: '18px 0 8px' }}>Description</h3>
                    <p className="item-card__description" style={{ marginBottom: 0 }}>
                      {requirement.description}
                    </p>
                  </>
                )}
              </section>

              {/* --------------------------- applications --------------------------- */}
              <section className="card card--pad">
                <div className="row row--between" style={{ marginBottom: 14 }}>
                  <h2 style={{ fontSize: '1.05rem' }}>
                    Applications ({applications.length})
                  </h2>
                  {pending.length > 0 && (
                    <span className="badge badge--warning">{pending.length} awaiting review</span>
                  )}
                </div>

                {applications.length === 0 ? (
                  <EmptyState
                    compact
                    icon={<IconUsers size={22} />}
                    title="No applications yet"
                    text="Tutors matching your subject and budget can apply while this requirement is open. Most receive their first application within a day."
                  />
                ) : (
                  <div>
                    {applications.map((application) => {
                      const rating = application.tutor
                        ? reviewService.ratingSummary(application.tutor.id)
                        : { average: 0, count: 0 };

                      return (
                        <div className="application-row" key={application.id}>
                          <Avatar name={application.tutorUser?.name} size="sm" />

                          <div className="application-row__info">
                            <div className="application-row__name">
                              {application.tutorUser?.name || 'Tutor'}
                              <StatusBadge status={application.status} />
                              {application.tutor?.verificationStatus === 'verified' && (
                                <span className="badge badge--success">Verified</span>
                              )}
                            </div>

                            <div className="application-row__meta">
                              {application.tutor?.experience ?? 0} years experience
                              {application.proposedFee > 0 && ` · ${formatINR(application.proposedFee)}/month`}
                              {application.tutor?.locality && ` · ${application.tutor.locality}`}
                              {' · applied '}{formatDate(application.createdAt)}
                            </div>

                            {rating.count > 0 && (
                              <div style={{ marginTop: 6 }}>
                                <RatingStars value={rating.average} size={13} />
                              </div>
                            )}

                            {application.message && (
                              <div className="application-row__message">{application.message}</div>
                            )}

                            {application.status === 'pending' && isOpen && (
                              <div className="application-row__actions">
                                <button
                                  type="button"
                                  className="btn btn--primary btn--sm"
                                  onClick={() => handleAccept(application)}
                                >
                                  Accept &amp; assign
                                </button>
                                <button
                                  type="button"
                                  className="btn btn--secondary btn--sm"
                                  onClick={() => handleReject(application)}
                                >
                                  Decline
                                </button>
                                {application.tutor && (
                                  <Link
                                    to={`/tutors/${application.tutor.id}`}
                                    className="btn btn--ghost btn--sm"
                                  >
                                    View profile
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        {/* ------------------------------- sidebar ------------------------------ */}
        <aside className="stack">
          <section className="card card--pad">
            <h2 style={{ fontSize: '1.05rem', marginBottom: 12 }}>At a glance</h2>
            <div className="stack stack--sm">
              <div className="row row--between">
                <span className="small muted">Applications</span>
                <span className="strong">{applications.length}</span>
              </div>
              <div className="row row--between">
                <span className="small muted">Awaiting review</span>
                <span className="strong">{pending.length}</span>
              </div>
              <div className="row row--between">
                <span className="small muted">Accepted</span>
                <span className="strong">{applications.filter((a) => a.status === 'accepted').length}</span>
              </div>
            </div>
          </section>

          {requirement.assignedTutor && (
            <section className="card card--pad">
              <h2 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Assigned tutor</h2>
              <Link to={`/tutors/${requirement.assignedTutor.id}`} className="row" style={{ gap: 11, color: 'inherit' }}>
                <Avatar name={assignedTutorName} size="sm" />
                <div style={{ minWidth: 0 }}>
                  <div className="strong small">{assignedTutorName}</div>
                  <div className="small muted">{(requirement.assignedTutor.subjects || []).slice(0, 2).join(', ')}</div>
                </div>
              </Link>
              <Link to="/student/requests" className="btn btn--primary btn--block btn--sm" style={{ marginTop: 14 }}>
                Go to my requests
              </Link>
            </section>
          )}

          <div className="alert alert--info">
            <IconCalendar size={15} />
            <span>
              Prefer to search yourself?{' '}
              <Link to={`/tutors?subject=${encodeURIComponent(requirement.subject)}`}>
                Browse tutors for {requirement.subject}
              </Link>
              .
            </span>
          </div>

          {pending.length > 0 && (
            <div className="alert alert--warning">
              <IconUsers size={15} />
              <span>
                Accepting an application assigns that tutor and stops further applications. You can
                still message them afterwards.
              </span>
            </div>
          )}

          <div className="alert alert--success">
            <IconCheck size={15} />
            <span>Tip: shortlist two tutors before deciding — it keeps the choice open.</span>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm === 'delete' ? 'Delete this requirement?' : 'Close this requirement?'}
        message={
          confirm === 'delete'
            ? 'The requirement and its applications will be permanently removed. This cannot be undone.'
            : 'Tutors will no longer be able to apply to this requirement. You can still view its applications.'
        }
        confirmLabel={confirm === 'delete' ? 'Delete requirement' : 'Close requirement'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm === 'delete') {
            const result = requirementService.deleteRequirement(id, user.id);
            if (result.ok) {
              toast.success('Requirement deleted');
              navigate('/student/requirements');
            } else {
              toast.error(result.error);
            }
          } else {
            const result = requirementService.closeRequirement(id, user.id);
            if (result.ok) toast.success('Requirement closed');
            else toast.error(result.error);
            setConfirm(null);
            refresh();
            return;
          }
          setConfirm(null);
        }}
      />
    </div>
  );
}