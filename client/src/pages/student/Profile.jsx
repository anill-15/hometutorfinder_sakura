import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as authService from '../../services/authService.js';
import { toast } from '../../hooks/useToast.js';
import FormInput, { TextAreaInput } from '../../components/common/FormInput.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { CLASS_LEVELS, BOARDS, TEACHING_MODES, TIME_SLOTS, DAYS_OF_WEEK, formatINR } from '../../utils/helpers.js';
import { cityOptions, cityLocalities, SUBJECTS } from '../../utils/lookups.js';
import { IconCheck, IconSparkle, IconUser, IconShield } from '../../components/common/Icons.jsx';

/** Tag-style multi-select used for subjects, classes, days and modes. */
function ToggleGroup({ label, options, selected, onToggle, hint = '' }) {
  return (
    <div className="field">
      <span className="field__label">{label}</span>
      {hint && <span className="field__hint" style={{ marginBottom: 8 }}>{hint}</span>}
      <div className="tag-list">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              className={`tag ${active ? 'tag--active' : ''}`}
              onClick={() => onToggle(option)}
              aria-pressed={active}
              style={{ cursor: 'pointer', border: active ? undefined : '1px solid var(--ink-200)' }}
            >
              {active && <IconCheck size={12} />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Student account details and learning preferences. */
export default function Profile() {
  const { user, refresh, resetDemo } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState({
    name: user.name,
    phone: user.phone || '',
    city: user.city || '',
    locality: user.locality || '',
  });
  const [prefs, setPrefs] = useState({
    guardianName: user.profile?.guardianName || '',
    classLevel: user.profile?.classLevel || '',
    board: user.profile?.board || '',
    subjects: user.profile?.subjects || [],
    budgetMin: user.profile?.budgetMin || 0,
    budgetMax: user.profile?.budgetMax || 0,
    preferredMode: user.profile?.preferredMode || '',
    preferredDays: user.profile?.preferredDays || [],
    preferredTime: user.profile?.preferredTime || '',
  });
  const [errors, setErrors] = useState({});
  const [resetOpen, setResetOpen] = useState(false);

  const setAccountField = (key) => (value) => {
    setAccount((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const setPref = (key) => (value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const toggleIn = (key, value) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const handleAccountSave = (event) => {
    event.preventDefault();
    const result = authService.updateProfile(user.id, account);
    if (!result.ok) {
      setErrors({ [result.field || 'name']: result.error });
      return;
    }
    refresh();
    toast.success('Account details saved');
  };

  const handlePrefsSave = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!prefs.classLevel) nextErrors.classLevel = 'Select the class you need tuition for';
    if (prefs.subjects.length === 0) nextErrors.subjects = 'Select at least one subject';
    if (Number(prefs.budgetMin) > Number(prefs.budgetMax) && Number(prefs.budgetMax) > 0) {
      nextErrors.budgetMin = 'Minimum cannot be higher than the maximum';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error('Please correct the highlighted fields');
      return;
    }

    const result = authService.updateStudentProfile(user.id, prefs);
    if (!result.ok) {
      setErrors({ [result.field || 'budgetMin']: result.error });
      return;
    }
    refresh();
    toast.success('Learning preferences saved — your tutor matches will update');
  };

  const localities = account.city ? cityLocalities(account.city) : [];

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Profile &amp; preferences</h1>
          <p className="dashboard-header__subtitle">
            Your preferences are used to explain why a tutor matches you, so keeping them accurate
            improves the suggestions you see.
          </p>
        </div>
      </div>

      <div className="stack stack--lg">
        {/* ------------------------------ account ------------------------------ */}
        <form className="card card--pad" onSubmit={handleAccountSave}>
          <div className="row" style={{ gap: 12, marginBottom: 20 }}>
            <span className="avatar avatar--sm avatar--square" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}>
              <IconUser size={16} />
            </span>
            <div>
              <h2 style={{ fontSize: '1.05rem' }}>Account details</h2>
              <p className="small muted">How tutors will identify you when you send a request.</p>
            </div>
          </div>

          <div className="form-grid">
            <FormInput
              label="Full name"
              name="profile-name"
              value={account.name}
              onChange={setAccountField('name')}
              error={errors.name}
              required
            />

            <div className="field">
              <span className="field__label">Email address</span>
              <input className="input" value={user.email} disabled aria-readonly="true" />
              <span className="field__hint">Email cannot be changed in this demo</span>
            </div>

            <FormInput
              label="Phone number"
              name="profile-phone"
              value={account.phone}
              onChange={setAccountField('phone')}
              placeholder="Optional"
              error={errors.phone}
            />

            <SelectInput
              label="City"
              name="profile-city"
              value={account.city}
              onChange={(value) => {
                setAccount((prev) => ({ ...prev, city: value, locality: '' }));
                setErrors((prev) => ({ ...prev, city: '' }));
              }}
              placeholder="Select a city"
              options={cityOptions()}
              error={errors.city}
            />

            {account.city && localities.length > 0 ? (
              <SelectInput
                label="Locality"
                name="profile-locality"
                value={account.locality}
                onChange={setAccountField('locality')}
                placeholder="Select a locality"
                options={localities.map((l) => ({ value: l, label: l }))}
              />
            ) : (
              <FormInput
                label="Locality"
                name="profile-locality"
                value={account.locality}
                onChange={setAccountField('locality')}
                placeholder="Optional"
              />
            )}
          </div>

          <div className="row" style={{ marginTop: 18 }}>
            <button type="submit" className="btn btn--primary">Save account details</button>
          </div>
        </form>

        {/* --------------------------- learning prefs --------------------------- */}
        <form className="card card--pad" onSubmit={handlePrefsSave}>
          <div className="row" style={{ gap: 12, marginBottom: 20 }}>
            <span className="avatar avatar--sm avatar--square" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}>
              <IconSparkle size={16} />
            </span>
            <div>
              <h2 style={{ fontSize: '1.05rem' }}>Learning preferences</h2>
              <p className="small muted">
                These drive the match reasons shown on tutor cards and profiles.
              </p>
            </div>
          </div>

          <div className="stack">
            <div className="form-grid">
              <FormInput
                label="Guardian / parent name"
                name="prefs-guardian"
                value={prefs.guardianName}
                onChange={setPref('guardianName')}
                placeholder="Optional"
                hint="Helps tutors know who to coordinate timings with"
              />

              <SelectInput
                label="Class or grade"
                name="prefs-class"
                value={prefs.classLevel}
                onChange={setPref('classLevel')}
                placeholder="Select a class"
                options={CLASS_LEVELS.map((level) => ({ value: level, label: level }))}
                error={errors.classLevel}
                required
              />

              <SelectInput
                label="Board"
                name="prefs-board"
                value={prefs.board}
                onChange={setPref('board')}
                placeholder="Select a board"
                options={BOARDS.map((board) => ({ value: board, label: board }))}
              />

              <SelectInput
                label="Preferred teaching mode"
                name="prefs-mode"
                value={prefs.preferredMode}
                onChange={setPref('preferredMode')}
                placeholder="No preference"
                options={TEACHING_MODES.map((mode) => ({ value: mode.value, label: mode.label }))}
              />
            </div>

            <ToggleGroup
              label="Subjects you need help with"
              options={SUBJECTS.map((s) => s.name)}
              selected={prefs.subjects}
              onToggle={(value) => toggleIn('subjects', value)}
              hint="Pick the subjects you are looking for a tutor for"
            />
            {errors.subjects && <span className="field__error" role="alert">{errors.subjects}</span>}

            <div className="form-grid">
              <FormInput
                label="Minimum monthly budget (₹)"
                name="prefs-budget-min"
                type="number"
                min="0"
                step="500"
                value={prefs.budgetMin}
                onChange={setPref('budgetMin')}
                placeholder="3000"
                error={errors.budgetMin}
              />

              <FormInput
                label="Maximum monthly budget (₹)"
                name="prefs-budget-max"
                type="number"
                min="0"
                step="500"
                value={prefs.budgetMax}
                onChange={setPref('budgetMax')}
                placeholder="8000"
                hint={Number(prefs.budgetMax) > 0 ? `Up to ${formatINR(prefs.budgetMax)} per month` : ''}
              />
            </div>

            <ToggleGroup
              label="Preferred days"
              options={DAYS_OF_WEEK}
              selected={prefs.preferredDays}
              onToggle={(value) => toggleIn('preferredDays', value)}
            />

            <SelectInput
              label="Preferred time of day"
              name="prefs-time"
              value={prefs.preferredTime}
              onChange={setPref('preferredTime')}
              placeholder="No preference"
              options={TIME_SLOTS.map((slot) => ({ value: slot.value, label: `${slot.label} (${slot.hint})` }))}
            />

            <div className="alert alert--info">
              <IconShield size={15} />
              <span>
                Your preferences stay in this browser. They are never sent anywhere, and they are
                only used to sort and explain the tutors you see.
              </span>
            </div>

            <div className="row row--between row--wrap">
              <Link to="/student/tutors" className="btn btn--secondary">See matching tutors</Link>
              <button type="submit" className="btn btn--primary">Save preferences</button>
            </div>
          </div>
        </form>

        {/* -------------------------------- danger -------------------------------- */}
        <section className="card card--pad">
          <h2 style={{ fontSize: '1.05rem', marginBottom: 6 }}>Reset demo data</h2>
          <p className="small muted" style={{ marginBottom: 16 }}>
            Clears every account, request and review from this browser and restores the original demo
            dataset. Use this to re-run the workflows from a clean state.
          </p>
          <button type="button" className="btn btn--danger-ghost" onClick={() => setResetOpen(true)}>
            Reset demo data
          </button>
        </section>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset demo data?"
        message="Every account, requirement, request, review and notification stored in this browser will be deleted and the original demo data restored. You will be signed out. This cannot be undone."
        confirmLabel="Reset everything"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          resetDemo();
          setResetOpen(false);
          toast.success('Demo data restored. Sign in again with a demo account.');
          navigate('/');
        }}
      />
    </div>
  );
}