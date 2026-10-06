import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as tutorService from '../../services/tutorService.js';
import * as requestService from '../../services/requestService.js';
import * as requirementService from '../../services/requirementService.js';
import * as reviewService from '../../services/reviewService.js';
import * as notificationService from '../../services/notificationService.js';
import { toast } from '../../hooks/useToast.js';
import { plural } from '../../utils/helpers.js';
import { formatPlace, CITIES } from '../../utils/lookups.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import RatingStars from '../../components/common/RatingStars.jsx';
import RequestCard from '../../components/student/RequestCard.jsx';
import {
  IconChat, IconBriefcase, IconBell, IconCalendar, IconUser,
  IconShield, IconMoney, IconClock,
} from '../../components/common/Icons.jsx';

const PROFILE_CHECKLIST = [
  { key: 'headline', label: 'Add a headline' },
  { key: 'about', label: 'Write about your teaching' },
  { key: 'subjects', label: 'Add your subjects' },
  { key: 'classes', label: 'Add the classes you teach' },
  { key: 'qualifications', label: 'Add your qualifications' },
  { key: 'fees', label: 'Set your fees' },
  { key: 'availability', label: 'Publish your availability' },
];

/** `/tutor/dashboard` */
export default function Dashboard() {
  const { user } = useAuth();
  // Bumped after any write so the derived lists below are re-read from storage.
  const [, setVersion] = useState(0);

  const profile = tutorService.getProfileByUserId(user.id);
  const requests = requestService.listForTutor(user.id);
  const summary = requestService.summarise(requests);
  const applications = requirementService.applicationsByTutor(user.id);
  const notifications = notificationService.listForUser(user.id);
  const unread = notifications.filter((n) => !n.isRead).length;

  const rating = profile ? reviewService.ratingSummary(profile.id) : { average: 0, count: 0 };
  const profileSubjects = profile?.subjects || [];

  const pendingRequirements = requirementService
    .searchRequirements({}, profile)
    .filter((req) => !profileSubjects.includes(req.subject)).length;

  const nextSteps = PROFILE_CHECKLIST.filter((item) => {
    if (!profile) return true;
    if (item.key === 'fees') return !(profile.monthlyFee > 0 || profile.hourlyFee > 0);
    if (item.key === 'availability') return (profile.availability || []).length === 0;
    if (item.key === 'subjects') return (profile.subjects || []).length === 0;
    if (item.key === 'classes') return (profile.classes || []).length === 0;
    if (item.key === 'qualifications') return (profile.qualifications || []).length === 0;
    return !profile[item.key];
  });

  const completion = Math.round(((PROFILE_CHECKLIST.length - nextSteps.length) / PROFILE_CHECKLIST.length) * 100);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const acceptedRequests = requests.filter((r) => r.status === 'accepted');

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="dashboard-header__subtitle">
            {summary.pending > 0
              ? `${plural(summary.pending, 'student request')} waiting for your reply.`
              : 'No pending requests. Browse open requirements to find new tuition work.'}
          </p>
        </div>

        {unread > 0 && (
          <Link to="/tutor/notifications" className="btn btn--secondary">
            <IconBell size={15} /> {plural(unread, 'unread notification')}
          </Link>
        )}
      </div>

      {/* ---------------------------- profile status ---------------------------- */}
      <section className="card card--pad" style={{ marginBottom: 22 }}>
        <div className="split" style={{ marginBottom: 16 }}>
          <div>
            <div className="row" style={{ gap: 10, marginBottom: 6 }}>
              <h2 style={{ fontSize: '1.1rem' }}>Your tutor profile</h2>
              <StatusBadge status={profile?.verificationStatus || 'unverified'} />
            </div>
            <p className="small muted">
              {profile?.verificationStatus === 'verified'
                ? 'Your profile carries a verified badge, so families see you higher in their search.'
                : 'Profiles are verified by an administrator. Complete your profile and request verification to stand out.'}
            </p>
          </div>

          <Link to="/tutor/profile" className="btn btn--primary">
            <IconUser size={15} /> Edit profile
          </Link>
        </div>

        <div className="row row--between small" style={{ marginBottom: 6 }}>
          <span className="muted">Profile completeness</span>
          <span className="strong">{completion}%</span>
        </div>
        <div className="progress-bar">
          <span className="progress-bar__fill" style={{ width: `${completion}%`, display: 'block' }} />
        </div>

        {nextSteps.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div className="field__label" style={{ marginBottom: 8 }}>Still to do</div>
            <div className="tag-list">
              {nextSteps.map((step) => (
                <span className="tag" key={step.key}>
                  <IconClock size={12} /> {step.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* --------------------------------- stats --------------------------------- */}
      <div className="grid grid--stats" style={{ marginBottom: 22 }}>
        <Link to="/tutor/requests" className="stat-card card--hover" style={{ color: 'inherit' }}>
          <div className="stat-card__label">Pending requests</div>
          <div className="stat-card__value">{summary.pending}</div>
          <div className="stat-card__hint">Waiting for your reply</div>
        </Link>

        <Link to="/tutor/requests" className="stat-card card--hover" style={{ color: 'inherit' }}>
          <div className="stat-card__label">Accepted requests</div>
          <div className="stat-card__value">{summary.accepted}</div>
          <div className="stat-card__hint">{summary.upcomingDemos} demo class{summary.upcomingDemos === 1 ? '' : 'es'}</div>
        </Link>

        <Link to="/tutor/applications" className="stat-card card--hover" style={{ color: 'inherit' }}>
          <div className="stat-card__label">Applications sent</div>
          <div className="stat-card__value">{applications.length}</div>
          <div className="stat-card__hint">{applications.filter((a) => a.status === 'accepted').length} accepted</div>
        </Link>

        <Link to="/tutor/reviews" className="stat-card card--hover" style={{ color: 'inherit' }}>
          <div className="stat-card__label">Rating</div>
          <div className="stat-card__value">{rating.count > 0 ? rating.average.toFixed(1) : '—'}</div>
          <div className="stat-card__hint">{plural(rating.count, 'review')}</div>
        </Link>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 22, alignItems: 'start' }}>
        {/* --------------------------- pending requests -------------------------- */}
        <section>
          <div className="row row--between" style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: '1.05rem' }}>Requests to respond to</h2>
            <Link className="btn btn--ghost btn--sm" to="/tutor/requests">View all</Link>
          </div>

          {pendingRequests.length === 0 ? (
            <EmptyState
              compact
              icon={<IconChat size={22} />}
              title="No pending requests"
              text="When a student contacts you about tuition or a demo class, it appears here."
            />
          ) : (
            <div className="stack">
              {pendingRequests.slice(0, 3).map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  viewerRole="tutor"
                  actions={[
                    {
                      status: 'accepted',
                      label: 'Accept',
                      variant: 'primary',
                      onClick: () => handleRespond(request, 'accepted'),
                    },
                    {
                      status: 'rejected',
                      label: 'Decline',
                      variant: 'secondary',
                      onClick: () => handleRespond(request, 'rejected'),
                    },
                  ]}
                />
              ))}
            </div>
          )}
        </section>

        {/* ------------------------------- sidebar ------------------------------- */}
        <aside className="stack">
          <section className="card card--pad">
            <h2 style={{ fontSize: '1.05rem', marginBottom: 14 }}>Accepted sessions</h2>
            {acceptedRequests.length === 0 ? (
              <p className="small muted">
                Accepted requests show here with the agreed timings. Mark them complete after the session
                so the student can leave a review.
              </p>
            ) : (
              <div className="stack stack--sm">
                {acceptedRequests.slice(0, 4).map((request) => (
                  <div className="row row--between" key={request.id} style={{ gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div className="small strong">{request.student?.name}</div>
                      <div className="small muted">
                        {request.type === 'demo' ? 'Demo' : 'Tuition'} · {request.subject || request.preferredTime}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => handleRespond(request, 'completed')}
                    >
                      Complete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card card--pad">
            <div className="row row--between" style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: '1.05rem' }}>Your rating</h2>
              {rating.count > 0 && <RatingStars value={rating.average} />}
            </div>

            {rating.count === 0 ? (
              <p className="small muted">
                Ratings appear after a student reviews a completed session.
              </p>
            ) : (
              <div className="rating-bars">
                {rating.breakdown.map((row) => (
                  <div className="rating-bar-row" key={row.star}>
                    <span>{row.star} star</span>
                    <span className="progress-bar">
                      <span
                        className="progress-bar__fill"
                        style={{ width: `${(row.count / rating.count) * 100}%`, display: 'block' }}
                      />
                    </span>
                    <span className="rating-bar-row__count">{row.count}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card card--pad">
            <h2 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Find more work</h2>
            <p className="small muted" style={{ marginBottom: 14 }}>
              {pendingRequirements > 0
                ? `${pendingRequirements} open requirement${pendingRequirements === 1 ? '' : 's'} need a tutor outside your listed subjects.`
                : 'There are open requirements that match your subjects and location.'}
            </p>
            <Link className="btn btn--primary btn--block" to="/tutor/requirements">
              <IconBriefcase size={15} /> Browse requirements
            </Link>
          </section>

          {profile && (
            <section className="card card--pad">
              <h2 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Your listing</h2>
              <dl className="dl">
                <dt>Location</dt>
                <dd>{formatPlace(profile.city, profile.locality) || 'Not set'}</dd>

                <dt>Subjects</dt>
                <dd>{(profile.subjects || []).join(', ') || 'Not set'}</dd>

                <dt>Monthly fee</dt>
                <dd>{profile.monthlyFee > 0 ? `₹${profile.monthlyFee.toLocaleString('en-IN')}` : 'Not set'}</dd>

                <dt>Availability</dt>
                <dd>
                  <Link to="/tutor/availability" className="row" style={{ gap: 6 }}>
                    <IconCalendar size={14} />
                    {(profile.availability || []).length} day{(profile.availability || []).length === 1 ? '' : 's'} set
                  </Link>
                </dd>
              </dl>

              <div className="tag-list" style={{ marginTop: 12 }}>
                {(profile.teachingModes || []).map((mode) => (
                  <span className="tag" key={mode}>
                    <IconMoney size={12} /> {mode === 'offline' ? 'In-person' : 'Online'}
                  </span>
                ))}
                {(profile.teachingModes || []).length === 0 && (
                  <span className="tag">Teaching modes not set</span>
                )}
              </div>

              {profile.city && !CITIES.find((c) => c.id === profile.city)?.localities.includes(profile.locality) && (
                <div className="alert alert--warning" style={{ marginTop: 12 }}>
                  <IconShield size={15} />
                  <span>Your locality is not listed under {CITIES.find((c) => c.id === profile.city)?.name}.</span>
                </div>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );

  /** Accept / decline / complete, with feedback either way. */
  function handleRespond(request, status) {
    const result = requestService.updateStatus(request.id, status, user);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    const labels = {
      accepted: 'Request accepted',
      rejected: 'Request declined',
      completed: 'Session marked complete',
    };
    toast.success(labels[status] || 'Request updated');
    setVersion((v) => v + 1);
  }
}
