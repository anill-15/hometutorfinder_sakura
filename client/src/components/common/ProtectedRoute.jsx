import { Link } from 'react-router-dom';
import { IconShield } from './Icons.jsx';

const ROLE_HOME = {
  student: '/student/dashboard',
  tutor: '/tutor/dashboard',
  admin: '/admin/dashboard',
};

/**
 * Blocks a dashboard area unless a user is signed in and holds the right role.
 *
 * Rendered by RoleRoute, which supplies `user` from the auth context, so role
 * protection is enforced by the router itself and not merely by hiding links.
 */
export default function ProtectedRoute({ user, role, children }) {
  if (!user) {
    return (
      <div className="container page">
        <div className="empty-state">
          <div className="empty-state__icon"><IconShield size={24} /></div>
          <h1 className="empty-state__title">Please sign in to continue</h1>
          <p className="empty-state__text">
            You need a Home Tutor Finder account to view this page. Signing in takes a few seconds and
            keeps your data saved in this browser.
          </p>
          <div className="btn-group">
            <Link className="btn btn--primary" to="/login">Sign in</Link>
            <Link className="btn btn--secondary" to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    );
  }

  if (role && user.role !== role) {
    return (
      <div className="container page">
        <div className="empty-state">
          <div className="empty-state__icon"><IconShield size={24} /></div>
          <h1 className="empty-state__title">This page is not available for your account</h1>
          <p className="empty-state__text">
            You are signed in as a <strong>{user.role}</strong>. This section is only available to{' '}
            <strong>{role}s</strong>. Use the link below to go to your own dashboard.
          </p>
          <div className="btn-group">
            <Link className="btn btn--primary" to={ROLE_HOME[user.role] || '/'}>
              Go to my dashboard
            </Link>
            <Link className="btn btn--secondary" to="/">Back to home</Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
