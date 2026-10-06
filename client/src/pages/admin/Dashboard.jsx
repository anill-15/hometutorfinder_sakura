import { Link } from 'react-router-dom';
import * as adminService from '../../services/adminService.js';
import { formatDateTime, plural } from '../../utils/helpers.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import {
  IconUsers, IconUser, IconShield, IconBriefcase, IconChat, IconStar, IconFlag,
  IconCheck, IconClock,
} from '../../components/common/Icons.jsx';

/** `/admin/dashboard` — platform statistics and a snapshot of recent activity. */
export default function Dashboard() {
  const stats = adminService.getStats();
  const requests = adminService.listRequests().slice(0, 8);

  const cards = [
    { label: 'Total users', value: stats.totalUsers, hint: `${stats.totalStudents} students · ${stats.totalTutors} tutors`, to: '/admin/users', icon: IconUsers },
    { label: 'Tutors', value: stats.totalTutors, hint: `${stats.verifiedTutors} verified`, to: '/admin/tutors', icon: IconUser },
    { label: 'Verified tutors', value: stats.verifiedTutors, hint: `${stats.pendingTutors} awaiting verification`, to: '/admin/tutors?filter=pending', icon: IconShield },
    { label: 'Open requirements', value: stats.openRequirements, hint: `${stats.totalApplications} applications sent`, to: '/admin/requirements', icon: IconBriefcase },
    { label: 'Active requests', value: stats.activeRequests, hint: `${stats.demoRequests} demo requests in total`, to: '/admin/requests', icon: IconChat },
    { label: 'Completed sessions', value: stats.completedSessions, hint: `${stats.totalReviews} reviews written`, to: '/admin/requests?filter=completed', icon: IconCheck },
    { label: 'Average rating', value: stats.averageRating.toFixed(1), hint: `From ${stats.totalReviews} reviews`, to: '/admin/reviews', icon: IconStar },
    { label: 'Open reports', value: stats.openReports, hint: `${stats.suspendedUsers} suspended accounts`, to: '/admin/reports', icon: IconFlag },
  ];

  const needsAttention = stats.pendingTutors + stats.openReports + stats.suspendedUsers;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Admin dashboard</h1>
          <p className="dashboard-header__subtitle">
            Every figure below is calculated live from the data in this browser.
          </p>
        </div>
      </div>

      {/* ------------------------------ attention ----------------------------- */}
      {needsAttention > 0 && (
        <div className="alert alert--warning" style={{ marginBottom: 20 }}>
          <IconClock size={15} />
          <span>
            Needs attention:{' '}
            {stats.pendingTutors > 0 && (
              <>
                <Link to="/admin/tutors?filter=pending">{plural(stats.pendingTutors, 'tutor')} awaiting verification</Link>
                {(stats.openReports > 0 || stats.suspendedUsers > 0) && ', '}
              </>
            )}
            {stats.openReports > 0 && (
              <>
                <Link to="/admin/reports">{plural(stats.openReports, 'open report')}</Link>
                {stats.suspendedUsers > 0 && ', '}
              </>
            )}
            {stats.suspendedUsers > 0 && (
              <Link to="/admin/users?filter=suspended">{plural(stats.suspendedUsers, 'suspended account')}</Link>
            )}
            .
          </span>
        </div>
      )}

      {/* -------------------------------- cards -------------------------------- */}
      <div className="grid grid--stats" style={{ marginBottom: 24 }}>
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} to={card.to} className="stat-card card--hover" style={{ color: 'inherit' }}>
              <div className="row row--between">
                <span className="stat-card__label">{card.label}</span>
                <span style={{ color: 'var(--ink-300)' }}><Icon size={16} /></span>
              </div>
              <div className="stat-card__value">{card.value}</div>
              <div className="stat-card__hint">{card.hint}</div>
            </Link>
          );
        })}
      </div>

      {/* ------------------------------ recent feed ---------------------------- */}
      <section className="card card--pad">
        <div className="row row--between" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.05rem' }}>Recent requests</h2>
          <Link className="btn btn--ghost btn--sm" to="/admin/requests">View all</Link>
        </div>

        {requests.length === 0 ? (
          <p className="small muted">No requests have been sent yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table table--responsive">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Tutor</th>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Sent</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td data-label="Student">{request.student?.name || '—'}</td>
                    <td data-label="Tutor">{request.tutorUser?.name || '—'}</td>
                    <td data-label="Subject">{request.subject || '—'}</td>
                    <td data-label="Type">{request.type === 'demo' ? 'Demo' : 'Tuition'}</td>
                    <td data-label="Status"><StatusBadge status={request.status} /></td>
                    <td data-label="Sent">{formatDateTime(request.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}