import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as tutorService from '../../services/tutorService.js';
import * as requirementService from '../../services/requirementService.js';
import * as requestService from '../../services/requestService.js';
import * as notificationService from '../../services/notificationService.js';
import { plural } from '../../utils/helpers.js';
import Avatar from '../../components/common/Avatar.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import RequestCard from '../../components/student/RequestCard.jsx';
import {
  IconSearch, IconBriefcase, IconChat, IconHeart, IconPlus,
  IconChevronRight, IconBell, IconStar,
} from '../../components/common/Icons.jsx';

/** Student dashboard: overview of requests, requirements, favourites and alerts. */
export default function Dashboard() {
  const { user } = useAuth();

  const requests = requestService.listForStudent(user.id);
  const summary = requestService.summarise(requests);
  const requirements = requirementService.listRequirements({ studentId: user.id });
  const favourites = tutorService.listFavorites(user.id);
  const notifications = notificationService.listForUser(user.id);
  const unread = notifications.filter((n) => !n.isRead).length;

  const awaitingReview = requests.filter((r) => r.status === 'completed' && !r.review);
  const upcomingDemos = requests.filter((r) => r.type === 'demo' && r.status === 'accepted');
  const openRequirements = requirements.filter((r) => ['open', 'applications_received', 'shortlisted'].includes(r.status));

  const recent = requests.slice(0, 3);

  const quickActions = [
    { to: '/student/tutors', label: 'Find a tutor', icon: IconSearch, hint: 'Search by subject and budget' },
    { to: '/student/requirements/new', label: 'Post requirement', icon: IconPlus, hint: 'Let tutors come to you' },
    { to: '/student/requests', label: 'View requests', icon: IconChat, hint: 'Track status and review' },
  ];

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="dashboard-header__subtitle">
            {summary.active > 0
              ? `You have ${plural(summary.active, 'active request')}.`
              : 'No active requests right now. Find a tutor or post a requirement to get started.'}
          </p>
        </div>

        {unread > 0 && (
          <Link to="/student/notifications" className="btn btn--secondary">
            <IconBell size={15} /> {plural(unread, 'unread notification')}
          </Link>
        )}
      </div>

      {/* ------------------------------ quick actions ----------------------------- */}
      <div className="grid grid--3" style={{ marginBottom: 22 }}>
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="card card--pad card--hover"
              style={{ color: 'inherit' }}
            >
              <div className="row" style={{ gap: 12 }}>
                <span className="avatar avatar--sm avatar--square" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}>
                  <Icon size={16} />
                </span>
                <div>
                  <div className="strong small">{action.label}</div>
                  <div className="small muted">{action.hint}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* --------------------------------- stats ---------------------------------- */}
      <div className="grid grid--stats" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card__label">Active requests</div>
          <div className="stat-card__value">{summary.active}</div>
          <div className="stat-card__hint">{summary.pending} awaiting a reply</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Upcoming demos</div>
          <div className="stat-card__value">{upcomingDemos.length}</div>
          <div className="stat-card__hint">Accepted demo classes</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Completed sessions</div>
          <div className="stat-card__value">{summary.completed}</div>
          <div className="stat-card__hint">{awaitingReview.length} waiting for your review</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Favourite tutors</div>
          <div className="stat-card__value">{favourites.length}</div>
          <div className="stat-card__hint">Saved for comparison</div>
        </div>
      </div>

      <div className="grid grid--2" style={{ marginBottom: 24 }}>
        {/* ------------------------------ favourites ------------------------------ */}
        <section className="card card--pad">
          <div className="row row--between" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.05rem' }}>Favourite tutors</h2>
            <Link className="btn btn--ghost btn--sm" to="/student/favorites">
              View all
            </Link>
          </div>

          {favourites.length === 0 ? (
            <EmptyState
              compact
              icon={<IconHeart size={22} />}
              title="No favourites yet"
              text="Save tutors while browsing and they will appear here for comparison."
              action={<Link className="btn btn--primary btn--sm" to="/student/tutors">Browse tutors</Link>}
            />
          ) : (
            <div className="stack stack--sm">
              {favourites.slice(0, 3).map((fav) => (
                <Link
                  key={fav.id}
                  to={`/tutors/${fav.tutor.id}`}
                  className="row"
                  style={{ color: 'inherit', gap: 11 }}
                >
                  <Avatar name={fav.user?.name} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="strong small">{fav.user?.name}</div>
                    <div className="small muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(fav.tutor.subjects || []).slice(0, 2).join(', ')}
                    </div>
                  </div>
                  {fav.rating.count > 0 && (
                    <span className="row small muted" style={{ gap: 4, flexShrink: 0 }}>
                      <IconStar size={12} filled />
                      {fav.rating.average.toFixed(1)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ----------------------------- notifications ---------------------------- */}
        <section className="card card--pad">
          <div className="row row--between" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.05rem' }}>Recent notifications</h2>
            <Link className="btn btn--ghost btn--sm" to="/student/notifications">
              View all
            </Link>
          </div>

          {notifications.length === 0 ? (
            <EmptyState
              compact
              icon={<IconBell size={22} />}
              title="Nothing new"
              text="Updates on your requests and applications will show up here."
            />
          ) : (
            <div className="stack stack--sm">
              {notifications.slice(0, 4).map((item) => (
                <div className="row row--start" key={item.id} style={{ gap: 10 }}>
                  <span
                    style={{
                      width: 7, height: 7, borderRadius: 999, marginTop: 7, flexShrink: 0,
                      background: item.isRead ? 'var(--ink-200)' : 'var(--brand-500)',
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div className="small strong">{item.title}</div>
                    {item.message && <div className="small muted">{item.message}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ------------------------------ requirements ----------------------------- */}
      <section className="card card--pad" style={{ marginBottom: 24 }}>
        <div className="row row--between" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.05rem' }}>My requirements</h2>
          <div className="btn-group">
            <Link className="btn btn--ghost btn--sm" to="/student/requirements">View all</Link>
            <Link className="btn btn--primary btn--sm" to="/student/requirements/new">
              <IconPlus size={14} /> Post requirement
            </Link>
          </div>
        </div>

        {openRequirements.length === 0 ? (
          <EmptyState
            compact
            icon={<IconBriefcase size={22} />}
            title="No open requirements"
            text="Post what you need and tutors in your area can apply to you."
            action={<Link className="btn btn--primary btn--sm" to="/student/requirements/new">Post a requirement</Link>}
          />
        ) : (
          <div className="table-wrap">
            <table className="table table--responsive">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Budget</th>
                  <th>Applications</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {openRequirements.slice(0, 5).map((req) => (
                  <tr key={req.id}>
                    <td data-label="Subject">
                      <Link to={`/student/requirements/${req.id}`} className="strong">{req.subject}</Link>
                    </td>
                    <td data-label="Class">{req.classLevel}</td>
                    <td data-label="Budget">
                      {req.budgetMax > 0 ? `₹${req.budgetMax.toLocaleString('en-IN')}` : 'Flexible'}
                    </td>
                    <td data-label="Applications">{req.applications.length}</td>
                    <td data-label="Status"><StatusBadge status={req.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* -------------------------------- requests -------------------------------- */}
      <section>
        <div className="row row--between" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.05rem' }}>Recent requests</h2>
          <Link className="btn btn--ghost btn--sm" to="/student/requests">
            View all <IconChevronRight size={14} />
          </Link>
        </div>

        {awaitingReview.length > 0 && (
          <div className="alert alert--info" style={{ marginBottom: 14 }}>
            <IconStar size={15} />
            <span>
              You have {plural(awaitingReview.length, 'completed session')} waiting for a review. Reviews
              help other families and are the only way a tutor gets rated.{' '}
              <Link to="/student/requests">Write a review</Link>
            </span>
          </div>
        )}

        {recent.length === 0 ? (
          <EmptyState
            icon={<IconChat size={22} />}
            title="No requests yet"
            text="Find a tutor and send a request, or book a demo class to start."
            action={<Link className="btn btn--primary" to="/student/tutors">Find a tutor</Link>}
          />
        ) : (
          <div className="stack">
            {recent.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                viewerRole="student"
                actions={[]}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}