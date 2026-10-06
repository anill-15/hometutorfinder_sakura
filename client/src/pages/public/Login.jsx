import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import { IconCheck, IconUsers, IconShield, IconTarget } from '../../components/common/Icons.jsx';

const DEMO_ACCOUNTS = [
  { role: 'Student', email: 'student@demo.com', password: 'student123', description: 'Search tutors, post requirements, review' },
  { role: 'Tutor', email: 'tutor@demo.com', password: 'tutor123', description: 'Accept requests, apply to requirements' },
  { role: 'Admin', email: 'admin@demo.com', password: 'admin123', description: 'Verify tutors, moderate content' },
];

const POINTS = [
  { icon: IconUsers, text: 'Student, parent and tutor accounts with separate dashboards' },
  { icon: IconTarget, text: 'Transparent match reasons based on your real preferences' },
  { icon: IconShield, text: 'Administrator verification for tutor profiles' },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
    setFormError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = 'Enter your email address';
    if (!form.password) nextErrors.password = 'Enter your password';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setBusy(true);
    const result = login(form);
    setBusy(false);

    if (!result.ok) {
      setErrors({ [result.field || 'email']: result.error });
      return;
    }

    navigate(`/${result.user.role}/dashboard`, { replace: true });
  };

  const useDemo = (account) => {
    setForm({ email: account.email, password: account.password });
    setErrors({});
    setFormError('');
  };

  // Already signed in? Go straight to the right dashboard.
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;

  return (
    <div className="auth-layout">
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue to your dashboard.</p>

          <form className="form" onSubmit={handleSubmit} noValidate>
            {formError && (
              <div className="alert alert--error" role="alert">
                {formError}
              </div>
            )}

            <FormInput
              label="Email address"
              name="login-email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
              required
            />

            <FormInput
              label="Password"
              name="login-password"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Enter your password"
              autoComplete="current-password"
              error={errors.password}
              required
            />

            <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="small muted text-center" style={{ marginTop: 18 }}>
            New to Home Tutor Finder? <Link to="/register">Create an account</Link>
          </p>

          <div className="demo-accounts">
            <div className="demo-accounts__title">Demo accounts — click to fill</div>
            <div className="demo-accounts__list">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="demo-account"
                  onClick={() => useDemo(account)}
                >
                  <span>
                    <span className="demo-account__role">{account.role}</span>
                    <span className="demo-account__email" style={{ display: 'block' }}>
                      {account.email} / {account.password}
                    </span>
                  </span>
                  <span className="small muted" style={{ textAlign: 'right', maxWidth: 150 }}>
                    {account.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <aside className="auth-aside">
        <h2>Everything you need to choose a tutor with confidence</h2>
        <p>
          Compare fees, qualifications and weekly availability side by side, then request a demo class
          before you commit.
        </p>
        <div className="auth-aside__list">
          {POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <div className="auth-aside__item" key={point.text}>
                <IconCheck size={17} />
                <span>{point.text}</span>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}