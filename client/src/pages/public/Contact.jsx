import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '../../hooks/useToast.js';
import FormInput, { TextAreaInput } from '../../components/common/FormInput.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import { CITIES } from '../../utils/lookups.js';
import { IconMail, IconPhone, IconLocation, IconChat, IconCheck } from '../../components/common/Icons.jsx';

const REASONS = ['Finding a tutor', 'Looking for tuition work', 'Feedback', 'Something else'];

/**
 * Contact page. There is no backend, so the form validates and confirms
 * locally rather than sending anything.
 */
export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', reason: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const set = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(form.email)) nextErrors.email = 'Enter a valid email address';
    if (form.message.trim().length < 10) nextErrors.message = 'Please write at least a short message';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSent(true);
    toast.success('Thanks — your message has been noted for the demo');
  };

  return (
    <div className="container page">
      <div className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Contact us</h1>
          <p className="page-header__subtitle">
            Questions about finding a tutor, listing your profile, or the platform in general.
          </p>
        </div>
      </div>

      <div className="contact-grid">
        <div className="stack">
          <section className="card card--pad">
            <h2 style={{ marginBottom: 16, fontSize: '1.05rem' }}>Reach the team</h2>
            <div className="stack">
              <div className="row row--start" style={{ gap: 12 }}>
                <span className="avatar avatar--sm avatar--square" style={{ background: 'var(--brand-100)', color: 'var(--brand-700)' }}>
                  <IconMail size={16} />
                </span>
                <div>
                  <div className="small strong">Email</div>
                  <div className="small muted">hello@hometutorfinder.demo</div>
                </div>
              </div>

              <div className="row row--start" style={{ gap: 12 }}>
                <span className="avatar avatar--sm avatar--square" style={{ background: 'var(--brand-100)', color: 'var(--brand-700)' }}>
                  <IconPhone size={16} />
                </span>
                <div>
                  <div className="small strong">Phone</div>
                  <div className="small muted">+91 80 4000 1200</div>
                </div>
              </div>

              <div className="row row--start" style={{ gap: 12 }}>
                <span className="avatar avatar--sm avatar--square" style={{ background: 'var(--brand-100)', color: 'var(--brand-700)' }}>
                  <IconLocation size={16} />
                </span>
                <div>
                  <div className="small strong">Coverage</div>
                  <div className="small muted">{CITIES.map((c) => c.name).join(', ')}</div>
                </div>
              </div>

              <div className="row row--start" style={{ gap: 12 }}>
                <span className="avatar avatar--sm avatar--square" style={{ background: 'var(--brand-100)', color: 'var(--brand-700)' }}>
                  <IconChat size={16} />
                </span>
                <div>
                  <div className="small strong">Support hours</div>
                  <div className="small muted">Monday to Saturday, 9:00 am – 7:00 pm</div>
                </div>
              </div>
            </div>
          </section>

          <section className="card card--pad">
            <h2 style={{ marginBottom: 12, fontSize: '1.05rem' }}>Before you write</h2>
            <p className="muted small" style={{ marginBottom: 14 }}>
              Most questions are answered faster from the platform itself:
            </p>
            <div className="checklist">
              <div className="checklist__item">
                <IconCheck size={15} />
                <span>
                  Want to compare tutors?{' '}
                  <Link to="/tutors">Browse the tutor directory</Link>.
                </span>
              </div>
              <div className="checklist__item">
                <IconCheck size={15} />
                <span>
                  Want tuition work?{' '}
                  <Link to="/requirements">See open requirements</Link>.
                </span>
              </div>
              <div className="checklist__item">
                <IconCheck size={15} />
                <span>
                  Need an account? <Link to="/register">Create one in a minute</Link>.
                </span>
              </div>
            </div>
          </section>

          <div className="alert alert--warning">
            <IconChat size={15} />
            <span>
              <strong>Demo note:</strong> this project has no backend, so nothing is actually sent.
              The form validates your input and shows a confirmation locally.
            </span>
          </div>
        </div>

        <section className="card card--pad-lg">
          <h2 style={{ marginBottom: 6 }}>Send a message</h2>
          <p className="muted small" style={{ marginBottom: 20 }}>
            Fill in the form and we will get back to you during support hours.
          </p>

          {sent ? (
            <div className="stack">
              <div className="alert alert--success">
                <IconCheck size={15} />
                <span>
                  Thanks {form.name.split(' ')[0]} — your message has been recorded for this demo.
                </span>
              </div>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  setForm({ name: '', email: '', reason: '', message: '' });
                  setSent(false);
                }}
              >
                Write another message
              </button>
            </div>
          ) : (
            <form className="form" onSubmit={handleSubmit} noValidate>
              <FormInput
                label="Your name"
                name="contact-name"
                value={form.name}
                onChange={set('name')}
                placeholder="Full name"
                error={errors.name}
                required
              />

              <FormInput
                label="Email address"
                name="contact-email"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                error={errors.email}
                required
              />

              <SelectInput
                label="What is this about?"
                name="contact-reason"
                value={form.reason}
                onChange={set('reason')}
                placeholder="Choose a topic"
                options={REASONS.map((r) => ({ value: r, label: r }))}
              />

              <TextAreaInput
                label="Message"
                name="contact-message"
                value={form.message}
                onChange={set('message')}
                placeholder="Tell us how we can help"
                error={errors.message}
                rows={5}
                required
              />

              <button type="submit" className="btn btn--primary">Send message</button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}