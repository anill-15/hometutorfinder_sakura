import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as tutorService from '../../services/tutorService.js';
import * as reviewService from '../../services/reviewService.js';
import { toast } from '../../hooks/useToast.js';
import FormInput, { TextAreaInput } from '../../components/common/FormInput.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import RatingStars from '../../components/common/RatingStars.jsx';
import { CLASS_LEVELS, TEACHING_MODES } from '../../utils/helpers.js';
import { cityOptions, cityLocalities, SUBJECTS } from '../../utils/lookups.js';
import { IconPlus, IconTrash, IconShield, IconInfo, IconCheck } from '../../components/common/Icons.jsx';

const LANGUAGES = [
  'English', 'Hindi', 'Marathi', 'Kannada', 'Telugu', 'Tamil', 'Bengali', 'Gujarati',
  'Malayalam', 'Punjabi', 'Urdu', 'Odia', 'Sanskrit',
];

/** Clickable chip used for the multi-select fields on this form. */
function ChipGroup({ label, options, selected, onToggle, hint = '', error = '' }) {
  return (
    <div className="field">
      <span className="field__label">{label}</span>
      {hint && <span className="field__hint" style={{ marginBottom: 8 }}>{hint}</span>}
      <div className="tag-list">
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value;
          const text = typeof option === 'string' ? option : option.label;
          const active = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              className={`tag ${active ? 'tag--active' : ''}`}
              onClick={() => onToggle(value)}
              aria-pressed={active}
              style={{ cursor: 'pointer' }}
            >
              {active && <IconCheck size={12} />}
              {text}
            </button>
          );
        })}
      </div>
      {error && <span className="field__error" role="alert">{error}</span>}
    </div>
  );
}

/** `/tutor/profile` — create and edit the tutor profile. */
export default function Profile() {
  const { user, refresh } = useAuth();
  const existing = tutorService.getProfileByUserId(user.id);

  const [name, setName] = useState(user.name);
  const [form, setForm] = useState({
    headline: existing?.headline || '',
    about: existing?.about || '',
    subjects: existing?.subjects || [],
    classes: existing?.classes || [],
    languages: existing?.languages || [],
    teachingModes: existing?.teachingModes || [],
    qualifications: existing?.qualifications || [],
    experience: existing?.experience || 0,
    monthlyFee: existing?.monthlyFee || '',
    hourlyFee: existing?.hourlyFee || '',
    city: existing?.city || user.city || '',
    locality: existing?.locality || user.locality || '',
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const toggleIn = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((i) => i !== value) : [...prev[key], value],
    }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const updateQualification = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      qualifications: prev.qualifications.map((q, i) => (i === index ? { ...q, [key]: value } : q)),
    }));
  };

  const addQualification = () => {
    setForm((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, { degree: '', institution: '', year: '' }],
    }));
  };

  const removeQualification = (index) => {
    setForm((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!name.trim() || name.trim().length < 2) nextErrors.name = 'Enter your full name';
    if (form.subjects.length === 0) nextErrors.subjects = 'Add at least one subject';
    if (form.classes.length === 0) nextErrors.classes = 'Add at least one class';
    if (!form.headline.trim()) nextErrors.headline = 'Add a short headline';
    if (form.about.trim().length < 20) nextErrors.about = 'Write at least a couple of sentences about your teaching';
    if (Number(form.monthlyFee) === 0 && Number(form.hourlyFee) === 0) {
      nextErrors.monthlyFee = 'Set a monthly or hourly fee so families can compare you';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error('Please complete the highlighted fields');
      return;
    }

    // Create the profile on first save, update afterwards.
    const target = existing || tutorService.ensureProfile(user.id);

    const result = tutorService.saveProfile(target.id, {
      headline: form.headline,
      about: form.about,
      subjects: form.subjects,
      classes: form.classes,
      languages: form.languages,
      teachingModes: form.teachingModes,
      qualifications: form.qualifications,
      experience: Number(form.experience) || 0,
      monthlyFee: Number(form.monthlyFee) || 0,
      hourlyFee: Number(form.hourlyFee) || 0,
    }, user);

    if (!result.ok) {
      setErrors({ [result.field || 'subjects']: result.error });
      return;
    }

    tutorService.saveLocation(target.id, { city: form.city, locality: form.locality });

    // Keep the account name and city in sync with the profile.
    tutorService.syncAccount(target.id, { name, city: form.city, locality: form.locality });
    refresh();

    toast.success(
      existing ? 'Profile saved' : 'Profile created. An administrator can now verify it.',
    );
  };

  const rating = existing ? reviewService.ratingSummary(existing.id) : { average: 0, count: 0 };
  const localities = form.city ? cityLocalities(form.city) : [];

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">My tutor profile</h1>
          <p className="dashboard-header__subtitle">
            This is what families see when they search for a tutor. Keep it complete and accurate.
          </p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <StatusBadge status={existing?.verificationStatus || 'unverified'} />
          {existing && (
            <Link to={`/tutors/${existing.id}`} className="btn btn--secondary">View public profile</Link>
          )}
        </div>
      </div>

      {existing?.verificationStatus === 'pending' && (
        <div className="alert alert--info" style={{ marginBottom: 18 }}>
          <IconShield size={15} />
          <span>
            Your profile is waiting for administrator verification. Only an administrator can grant
            or remove the verified badge.
          </span>
        </div>
      )}

      {rating.count > 0 && (
        <div className="alert alert--success" style={{ marginBottom: 18 }}>
          <IconShield size={15} />
          <span className="row" style={{ gap: 8 }}>
            <RatingStars value={rating.average} size={13} />
            <span>
              {rating.average.toFixed(1)} from {rating.count} completed session
              {rating.count === 1 ? '' : 's'}
            </span>
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="stack stack--lg">
          {/* ------------------------------ basics ------------------------------ */}
          <section className="card card--pad">
            <h2 style={{ fontSize: '1.05rem', marginBottom: 16 }}>Basics</h2>

            <div className="form-grid">
              <FormInput
                label="Full name"
                name="tutor-name"
                value={name}
                onChange={(value) => {
                  setName(value);
                  setErrors((prev) => ({ ...prev, name: '' }));
                }}
                error={errors.name}
                required
              />

              <div className="field">
                <span className="field__label">Profile photo</span>
                <span className="field__hint">
                  Your avatar is generated from your initials, so no image upload is needed in this demo.
                </span>
                <div className="row" style={{ marginTop: 6 }}>
                  <span className="avatar avatar--lg" style={{ background: 'var(--brand-600)' }}>
                    {name.trim().slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="stack" style={{ marginTop: 16 }}>
              <FormInput
                label="Headline"
                name="tutor-headline"
                value={form.headline}
                onChange={set('headline')}
                placeholder="e.g. Mathematics and Physics tutor for board exam success"
                hint="One line that appears on your tutor card"
                error={errors.headline}
                required
              />

              <TextAreaInput
                label="About your teaching"
                name="tutor-about"
                value={form.about}
                onChange={set('about')}
                rows={5}
                maxLength={1500}
                placeholder="Explain how you teach, which classes you focus on, and what a student can expect."
                error={errors.about}
                required
              />
            </div>
          </section>

          {/* ------------------------- subjects and classes ------------------------ */}
          <section className="card card--pad">
            <h2 style={{ fontSize: '1.05rem', marginBottom: 16 }}>What you teach</h2>

            <div className="stack">
              <ChipGroup
                label="Subjects"
                options={SUBJECTS.map((s) => s.name)}
                selected={form.subjects}
                onToggle={(value) => toggleIn('subjects', value)}
                hint="Families filter by subject, so pick everything you genuinely teach"
                error={errors.subjects}
              />

              <ChipGroup
                label="Classes you teach"
                options={CLASS_LEVELS}
                selected={form.classes}
                onToggle={(value) => toggleIn('classes', value)}
                error={errors.classes}
              />

              <ChipGroup
                label="Teaching modes"
                options={TEACHING_MODES}
                selected={form.teachingModes}
                onToggle={(value) => toggleIn('teachingModes', value)}
                hint="Online, in-person, or both"
              />

              <ChipGroup
                label="Languages you can teach in"
                options={LANGUAGES}
                selected={form.languages}
                onToggle={(value) => toggleIn('languages', value)}
              />
            </div>
          </section>

          {/* ---------------------------- qualifications -------------------------- */}
          <section className="card card--pad">
            <div className="row row--between" style={{ marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.05rem' }}>Qualifications</h2>
                <p className="small muted">Shown on your public profile and checked during verification.</p>
              </div>
              <button type="button" className="btn btn--secondary btn--sm" onClick={addQualification}>
                <IconPlus size={14} /> Add qualification
              </button>
            </div>

            {form.qualifications.length === 0 ? (
              <div className="alert alert--warning">
                <IconInfo size={15} />
                <span>
                  Adding at least one qualification usually means a higher rank in search results.
                </span>
              </div>
            ) : (
              <div className="stack">
                {form.qualifications.map((qualification, index) => (
                  <div className="availability-slot" key={index} style={{ gridTemplateColumns: '1.2fr 1.2fr 100px 44px' }}>
                    <FormInput
                      name={`qual-degree-${index}`}
                      value={qualification.degree}
                      onChange={(value) => updateQualification(index, 'degree', value)}
                      placeholder="e.g. M.Sc Mathematics"
                    />
                    <FormInput
                      name={`qual-institution-${index}`}
                      value={qualification.institution}
                      onChange={(value) => updateQualification(index, 'institution', value)}
                      placeholder="University or school"
                    />
                    <FormInput
                      name={`qual-year-${index}`}
                      type="number"
                      value={qualification.year}
                      onChange={(value) => updateQualification(index, 'year', value)}
                      placeholder="Year"
                    />
                    <button
                      type="button"
                      className="availability-slot__remove"
                      onClick={() => removeQualification(index)}
                      aria-label={`Remove qualification ${index + 1}`}
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ------------------------------- fees -------------------------------- */}
          <section className="card card--pad">
            <h2 style={{ fontSize: '1.05rem', marginBottom: 16 }}>Experience and fees</h2>

            <div className="form-grid">
              <FormInput
                label="Years of teaching experience"
                name="tutor-experience"
                type="number"
                min="0"
                max="60"
                value={form.experience}
                onChange={set('experience')}
                placeholder="5"
                error={errors.experience}
              />

              <FormInput
                label="Monthly fee (₹)"
                name="tutor-monthly-fee"
                type="number"
                min="0"
                step="500"
                value={form.monthlyFee}
                onChange={set('monthlyFee')}
                placeholder="6000"
                hint="Per student, per month"
                error={errors.monthlyFee}
              />

              <FormInput
                label="Hourly fee (₹)"
                name="tutor-hourly-fee"
                type="number"
                min="0"
                step="50"
                value={form.hourlyFee}
                onChange={set('hourlyFee')}
                placeholder="300"
                hint="Optional, for single classes"
              />

              <SelectInput
                label="Primary city"
                name="tutor-city"
                value={form.city}
                onChange={(value) => setForm((prev) => ({ ...prev, city: value, locality: '' }))}
                placeholder="Select a city"
                options={cityOptions()}
              />

              {localities.length > 0 ? (
                <SelectInput
                  label="Locality"
                  name="tutor-locality"
                  value={form.locality}
                  onChange={set('locality')}
                  placeholder="Select a locality"
                  options={localities.map((l) => ({ value: l, label: l }))}
                />
              ) : (
                <FormInput
                  label="Locality"
                  name="tutor-locality"
                  value={form.locality}
                  onChange={set('locality')}
                  placeholder="Optional"
                />
              )}
            </div>
          </section>

          <div className="row row--between row--wrap">
            <Link to="/tutor/availability" className="btn btn--secondary">Set weekly availability</Link>
            <button type="submit" className="btn btn--primary">
              {existing ? 'Save profile' : 'Create profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}