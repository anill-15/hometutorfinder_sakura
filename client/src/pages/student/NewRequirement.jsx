import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as requirementService from '../../services/requirementService.js';
import { toast } from '../../hooks/useToast.js';
import FormInput, { TextAreaInput } from '../../components/common/FormInput.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import { CLASS_LEVELS, BOARDS, TEACHING_MODES, TIME_SLOTS, DAYS_OF_WEEK } from '../../utils/helpers.js';
import { cityOptions, cityLocalities, SUBJECTS } from '../../utils/lookups.js';
import { IconCheck, IconInfo, IconBriefcase } from '../../components/common/Icons.jsx';

/** Shared form used by both "new requirement" and "edit requirement". */
export function RequirementForm({ initial = {}, onSaved, submitLabel = 'Post requirement' }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    subject: initial.subject || (user.profile?.subjects || [])[0] || '',
    classLevel: initial.classLevel || user.profile?.classLevel || '',
    board: initial.board || '',
    city: initial.city || user.city || '',
    locality: initial.locality || user.locality || '',
    budgetMin: initial.budgetMin || user.profile?.budgetMin || '',
    budgetMax: initial.budgetMax || user.profile?.budgetMax || '',
    teachingMode: initial.teachingMode || 'both',
    preferredDays: initial.preferredDays || user.profile?.preferredDays || [],
    preferredTime: initial.preferredTime || user.profile?.preferredTime || 'evening',
    description: initial.description || '',
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter((d) => d !== day)
        : [...prev.preferredDays, day],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.subject) nextErrors.subject = 'Select a subject';
    if (!form.classLevel) nextErrors.classLevel = 'Select a class or grade';
    if (Number(form.budgetMin) > Number(form.budgetMax) && Number(form.budgetMax) > 0) {
      nextErrors.budgetMin = 'Minimum cannot be higher than the maximum';
    }
    if (form.description.trim().length < 10) {
      nextErrors.description = 'Add a short description so tutors know what they are applying for';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error('Please correct the highlighted fields');
      return;
    }

    const result = onSaved(form);
    if (result && result.ok === false) {
      setErrors({ [result.field || 'subject']: result.error });
      return;
    }
  };

  const localities = form.city ? cityLocalities(form.city) : [];

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <SelectInput
          label="Subject"
          name="req-subject"
          value={form.subject}
          onChange={set('subject')}
          placeholder="Select a subject"
          options={SUBJECTS.map((s) => ({ value: s.name, label: s.name }))}
          error={errors.subject}
          required
        />

        <SelectInput
          label="Class or grade"
          name="req-class"
          value={form.classLevel}
          onChange={set('classLevel')}
          placeholder="Select a class"
          options={CLASS_LEVELS.map((level) => ({ value: level, label: level }))}
          error={errors.classLevel}
          required
        />

        <SelectInput
          label="Board"
          name="req-board"
          value={form.board}
          onChange={set('board')}
          placeholder="Select a board"
          options={BOARDS.map((board) => ({ value: board, label: board }))}
        />

        <SelectInput
          label="Preferred teaching mode"
          name="req-mode"
          value={form.teachingMode}
          onChange={set('teachingMode')}
          placeholder="Select a mode"
          options={TEACHING_MODES.map((mode) => ({ value: mode.value, label: mode.label }))}
          required
        />
      </div>

      <div className="form-grid">
        <SelectInput
          label="City"
          name="req-city"
          value={form.city}
          onChange={(value) => setForm((prev) => ({ ...prev, city: value, locality: '' }))}
          placeholder="Select a city"
          options={cityOptions()}
        />

        {localities.length > 0 ? (
          <SelectInput
            label="Locality"
            name="req-locality"
            value={form.locality}
            onChange={set('locality')}
            placeholder="Select a locality"
            options={localities.map((l) => ({ value: l, label: l }))}
          />
        ) : (
          <FormInput
            label="Locality"
            name="req-locality"
            value={form.locality}
            onChange={set('locality')}
            placeholder="Optional"
          />
        )}

        <FormInput
          label="Minimum monthly budget (₹)"
          name="req-budget-min"
          type="number"
          min="0"
          step="500"
          value={form.budgetMin}
          onChange={set('budgetMin')}
          placeholder="3000"
          error={errors.budgetMin}
        />

        <FormInput
          label="Maximum monthly budget (₹)"
          name="req-budget-max"
          type="number"
          min="0"
          step="500"
          value={form.budgetMax}
          onChange={set('budgetMax')}
          placeholder="8000"
          hint="Tutors above this range can still apply, but they will see your budget"
        />
      </div>

      <div className="field">
        <span className="field__label">Preferred days</span>
        <span className="field__hint" style={{ marginBottom: 8 }}>
          Pick every day you would like classes on. Tutors see this when they apply.
        </span>
        <div className="tag-list">
          {DAYS_OF_WEEK.map((day) => {
            const active = form.preferredDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                className={`tag ${active ? 'tag--active' : ''}`}
                onClick={() => toggleDay(day)}
                aria-pressed={active}
                style={{ cursor: 'pointer' }}
              >
                {active && <IconCheck size={12} />}
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <SelectInput
        label="Preferred time of day"
        name="req-time"
        value={form.preferredTime}
        onChange={set('preferredTime')}
        placeholder="Select a time"
        options={TIME_SLOTS.map((slot) => ({ value: slot.value, label: `${slot.label} (${slot.hint})` }))}
      />

      <TextAreaInput
        label="Describe what you need"
        name="req-description"
        value={form.description}
        onChange={set('description')}
        rows={4}
        maxLength={1200}
        placeholder="Example: Need a Mathematics tutor for Class 10. The school syllabus is covered but we want extra practice before the pre-boards. Please prefer someone who gives regular feedback to parents."
        error={errors.description}
        required
      />

      <div className="alert alert--info">
        <IconInfo size={15} />
        <span>
          Be specific about the class, syllabus level and timings. Specific requirements get more
          relevant applications.
        </span>
      </div>

      <div className="row row--between row--wrap">
        <Link to="/student/requirements" className="btn btn--ghost">Cancel</Link>
        <button type="submit" className="btn btn--primary">{submitLabel}</button>
      </div>
    </form>
  );
}

/** `/student/requirements/new` */
export function NewRequirement() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSave = (form) => {
    const result = requirementService.createRequirement(user.id, form);
    if (!result.ok) return result;

    toast.success('Requirement posted. Tutors in your area can now apply.');
    navigate(`/student/requirements/${result.requirement.id}`);
    return result;
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Post a tuition requirement</h1>
          <p className="dashboard-header__subtitle">
            Describe what you need once, and tutors can apply to you instead of you searching
            individually.
          </p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 22, alignItems: 'start' }}>
        <section className="card card--pad-lg">
          <RequirementForm onSaved={handleSave} submitLabel="Post requirement" />
        </section>

        <aside className="stack">
          <div className="card card--pad">
            <div className="row" style={{ gap: 10, marginBottom: 12 }}>
              <IconBriefcase size={17} />
              <strong className="small">What happens next</strong>
            </div>
            <div className="timeline">
              {[
                'Your requirement appears on the open requirements board',
                'Tutors who match your subject and budget can apply',
                'You review each application and shortlist the best fit',
                'Accept one, then send a tuition or demo request',
              ].map((step, index) => (
                <div className="timeline__item" key={step}>
                  <span className={`timeline__dot ${index === 0 ? 'is-complete' : ''}`}>
                    {index === 0 && <IconCheck size={12} />}
                  </span>
                  <div className="timeline__label small">{step}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="alert alert--warning">
            <IconInfo size={15} />
            <span>
              Keep the requirement open for a few days so more tutors can see it. Closing it stops
              new applications.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default NewRequirement;