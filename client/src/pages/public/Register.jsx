import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import { toast } from '../../hooks/useToast.js';
import { cityOptions } from '../../utils/lookups.js';
import { IconCheck, IconShield } from '../../components/common/Icons.jsx';

const ROLES = [
  { value: 'student', title: 'Student or parent', text: 'Find tutors, post requirements and review sessions' },
  { value: 'tutor', title: 'Tutor', text: 'Publish a profile, set availability and apply for tuition' },
];

const ASIDE = {
  student: {
    title: 'Find a tutor you can trust',
    text: 'Search by subject, class, budget and location. Compare real fees and weekly availability, and request a demo class before you decide.',
    points: [
      'Save tutors to favourites and compare them later',
      'Post a requirement and let tutors come to you',
      'Track requests from pending through to completed',
      'Leave a review once a session is finished',
    ],
  },
  tutor: {
    title: 'Find regular tuition work',
    text: 'Publish your subjects, qualifications and fees, show when you are free, and apply to requirements posted by families near you.',
    points: [
      'Your profile is public and includes your qualifications',
      'Weekly availability stops unnecessary rescheduling',
      'Apply to open requirements with a short message',
      'Build a rating from reviews by completed students',
    ],
  },
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: 'student',
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    locality: '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.name.trim() || form.name.trim().length < 2) nextErrors.name = 'Enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(form.email)) nextErrors.email = 'Enter a valid email address';
    if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    if (form.phone && !/^[+]?[\d\s-]{8,15}$/.test(form.phone)) nextErrors.phone = 'Enter a valid phone number';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setBusy(true);
    const result = register(form);
    setBusy(false);

    if (!result.ok) {
      setErrors({ [result.field || 'email']: result.error });
      return;
    }

    toast.success(`Account created. Welcome, ${result.user.name.split(' ')[0]}!`);
    navigate(`/${result.user.role}/dashboard`, { replace: true });
  };

  const aside = ASIDE[form.role];

  return (
    <div className="auth-layout">
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">It takes a minute and stores everything in your browser.</p>

          <form className="form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <span className="field__label">I am joining as</span>
              <div className="role-picker">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    className={`role-option ${form.role === role.value ? 'is-selected' : ''}`}
                    onClick={() => set('role')(role.value)}
                    aria-pressed={form.role === role.value}
                  >
                    <span className="role-option__title">{role.title}</span>
                    <span className="role-option__text">{role.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <FormInput
              label="Full name"
              name="register-name"
              value={form.name}
              onChange={set('name')}
              placeholder={form.role === 'tutor' ? 'e.g. Anita Sharma' : 'e.g. Ananya Sharma'}
              autoComplete="name"
              error={errors.name}
              required
            />

            <FormInput
              label="Email address"
              name="register-email"
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
              name="register-password"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              hint="Demo only — stored in plain text in this browser"
              error={errors.password}
              required
            />

            <FormInput
              label="Phone number"
              name="register-phone"
              value={form.phone}
              onChange={set('phone')}
              placeholder="Optional"
              autoComplete="tel"
              error={errors.phone}
            />

            <div className="form-grid">
              <SelectInput
                label="City"
                name="register-city"
                value={form.city}
                onChange={set('city')}
                placeholder="Select a city"
                options={cityOptions()}
              />

              <FormInput
                label="Locality"
                name="register-locality"
                value={form.locality}
                onChange={set('locality')}
                placeholder="Optional"
                autoComplete="address-level2"
              />
            </div>

            <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={busy}>
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="small muted text-center" style={{ marginTop: 18 }}>
            Already registered? <Link to="/login">Sign in instead</Link>
          </p>
        </div>
      </div>

      <aside className="auth-aside">
        <h2>{aside.title}</h2>
        <p>{aside.text}</p>
        <div className="auth-aside__list">
          {aside.points.map((point) => (
            <div className="auth-aside__item" key={point}>
              <IconCheck size={17} />
              <span>{point}</span>
            </div>
          ))}
        </div>
        <div className="auth-aside__item" style={{ marginTop: 24 }}>
          <IconShield size={17} />
          <span>Tutor profiles are reviewed by an administrator before they carry a verified badge.</span>
        </div>
      </aside>
    </div>
  );
}