import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as requirementService from '../../services/requirementService.js';
import * as tutorService from '../../services/tutorService.js';
import { toast } from '../../hooks/useToast.js';
import RequirementCard from '../../components/student/RequirementCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Modal from '../../components/common/Modal.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import FormInput from '../../components/common/FormInput.jsx';
import { CLASS_LEVELS, formatINR } from '../../utils/helpers.js';
import { cityOptions, subjectOptions, formatPlace } from '../../utils/lookups.js';
import { IconBriefcase, IconSearch, IconClose, IconCheck } from '../../components/common/Icons.jsx';

/** Apply dialog for one requirement. */
function ApplyModal({ requirement, open, onClose, onApplied }) {
  const { user } = useAuth();
  const profile = tutorService.getProfileByUserId(user.id);

  const [message, setMessage] = useState('');
  const [fee, setFee] = useState(profile?.monthlyFee || '');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (message.trim().length < 10) {
      setError('Write a short message explaining how you can help');
      return;
    }

    const result = requirementService.applyToRequirement(user.id, requirement.id, {
      message,
      proposedFee: Number(fee) || 0,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.success('Application submitted. The student has been notified.');
    setMessage('');
    setError('');
    onApplied?.();
    onClose();
  };

  if (!requirement) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Apply for ${requirement.subject} · ${requirement.classLevel}`}
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="apply-form" className="btn btn--primary">Submit application</button>
        </>
      }
    >
      <form id="apply-form" className="form" onSubmit={handleSubmit} noValidate>
        <dl className="dl">
          <dt>Location</dt>
          <dd>{formatPlace(requirement.city, requirement.locality) || 'Flexible'}</dd>

          <dt>Budget</dt>
          <dd>
            {requirement.budgetMax > 0
              ? `${formatINR(requirement.budgetMin)} – ${formatINR(requirement.budgetMax)} per month`
              : requirement.budgetMin > 0
                ? `From ${formatINR(requirement.budgetMin)} per month`
                : 'Not specified'}
          </dd>

          <dt>Preferred days</dt>
          <dd>{(requirement.preferredDays || []).join(', ') || 'Flexible'}</dd>

          <dt>Preferred time</dt>
          <dd>{requirement.preferredTime || 'Flexible'}</dd>
        </dl>

        {requirement.description && <p className="item-card__description">{requirement.description}</p>}

        <FormInput
          label="Your monthly fee (₹)"
          name="apply-fee"
          type="number"
          min="0"
          step="500"
          value={fee}
          onChange={(value) => {
            setFee(value);
            setError('');
          }}
          hint="The student will see this alongside your profile fees"
        />

        <div className="field">
          <label className="field__label" htmlFor="field-apply-message">
            Message to the student<span className="field__required" aria-hidden="true">*</span>
          </label>
          <textarea
            id="field-apply-message"
            className="textarea"
            rows={4}
            maxLength={800}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setError('');
            }}
            placeholder="Example: I teach Class 10 Mathematics and my current batch has two weekday evening slots. I can start this week."
            aria-invalid={error ? 'true' : 'false'}
          />
          {error && <span className="field__error" role="alert">{error}</span>}
        </div>
      </form>
    </Modal>
  );
}

/** `/tutor/requirements` — open requirements a tutor can apply to. */
export default function Requirements() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ subject: '', classLevel: '', city: '', budgetMin: '', budgetMax: '' });
  const [search, setSearch] = useState('');
  const [showApplied, setShowApplied] = useState(false);
  const [applying, setApplying] = useState(null);
  const [, setVersion] = useState(0);

  const profile = tutorService.getProfileByUserId(user.id);
  const myApplications = requirementService.applicationsByTutor(user.id);
  const appliedIdsList = myApplications.map((a) => a.requirementId);
  const appliedIds = new Set(appliedIdsList);

  const all = requirementService.searchRequirements({}, {
    userId: user.id,
    myApplicationIds: appliedIdsList,
  });

  const results = useMemo(() => {
    let list = all;

    if (filters.subject) list = list.filter((r) => r.subject === filters.subject);
    if (filters.classLevel) list = list.filter((r) => r.classLevel === filters.classLevel);
    if (filters.city) list = list.filter((r) => r.city === filters.city);
    if (filters.budgetMin !== '') list = list.filter((r) => (r.budgetMax || 0) >= Number(filters.budgetMin));
    if (filters.budgetMax !== '') list = list.filter((r) => (r.budgetMin || 0) <= Number(filters.budgetMax));
    if (showApplied) {
      // "Show only applied" needs the requirements that are no longer open too,
      // so the full list is filtered here instead of upstream.
      list = requirementService.listRequirements({ includeClosed: false })
        .filter((req) => req.studentId !== user.id)
        .filter((req) => appliedIdsList.includes(req.id));
    }
    if (search.trim()) {
      const needle = search.toLowerCase();
      list = list.filter((r) =>
        [r.subject, r.classLevel, r.board, r.description, r.locality]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(needle)),
      );
    }

    // Requirements matching my subjects first, then newest.
    const mySubjects = new Set(profile?.subjects || []);
    return [...list].sort((a, b) => {
      const aMatch = mySubjects.has(a.subject) ? 1 : 0;
      const bMatch = mySubjects.has(b.subject) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [all, filters, search, showApplied, profile, appliedIdsList, user.id]);

  const matchCount = profile
    ? all.filter((req) => (profile.subjects || []).includes(req.subject)).length
    : 0;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Student requirements</h1>
          <p className="dashboard-header__subtitle">
            {matchCount > 0
              ? `${matchCount} open requirement${matchCount === 1 ? '' : 's'} match your subjects. Requirements matching you are listed first.`
              : 'Browse open requirements and apply to the ones that suit you.'}
          </p>
        </div>
        <Link className="btn btn--secondary" to="/tutor/applications">
          My applications ({myApplications.length})
        </Link>
      </div>

      {!profile || (profile.subjects || []).length === 0 ? (
        <div className="alert alert--warning" style={{ marginBottom: 18 }}>
          <IconSearch size={15} />
          <span>
            Add your subjects to your profile so we can show matching requirements first.{' '}
            <Link to="/tutor/profile">Update my profile</Link>
          </span>
        </div>
      ) : (
        <div className="alert alert--success" style={{ marginBottom: 18 }}>
          <IconCheck size={15} />
          <span>
            Your subjects: {profile.subjects.join(', ')}.
            {profile.city ? ` Showing availability for your city.` : ''}
          </span>
        </div>
      )}

      <section className="card card--pad" style={{ marginBottom: 20 }}>
        <div className="form-grid" style={{ alignItems: 'end' }}>
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <label className="field__label" htmlFor="tutor-req-search">Search</label>
            <div className="search-input">
              <span className="search-input__icon"><IconSearch size={17} /></span>
              <input
                id="tutor-req-search"
                type="search"
                className="input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Subject, class or locality"
              />
            </div>
          </div>

          <SelectInput
            label="Subject"
            name="tutor-req-subject"
            value={filters.subject}
            onChange={(value) => setFilters((prev) => ({ ...prev, subject: value }))}
            placeholder="All subjects"
            options={subjectOptions()}
          />

          <SelectInput
            label="Class"
            name="tutor-req-class"
            value={filters.classLevel}
            onChange={(value) => setFilters((prev) => ({ ...prev, classLevel: value }))}
            placeholder="All classes"
            options={CLASS_LEVELS.map((level) => ({ value: level, label: level }))}
          />

          <SelectInput
            label="City"
            name="tutor-req-city"
            value={filters.city}
            onChange={(value) => setFilters((prev) => ({ ...prev, city: value }))}
            placeholder="All cities"
            options={cityOptions()}
          />

          <div className="form-grid" style={{ gap: 10 }}>
            <FormInput
              label="Budget min (₹)"
              name="tutor-req-budget-min"
              type="number"
              min="0"
              step="500"
              value={filters.budgetMin}
              onChange={(value) => setFilters((prev) => ({ ...prev, budgetMin: value }))}
              placeholder="3000"
            />
            <FormInput
              label="Budget max (₹)"
              name="tutor-req-budget-max"
              type="number"
              min="0"
              step="500"
              value={filters.budgetMax}
              onChange={(value) => setFilters((prev) => ({ ...prev, budgetMax: value }))}
              placeholder="9000"
            />
          </div>
        </div>

        <div className="row row--between row--wrap" style={{ marginTop: 14 }}>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={showApplied}
              onChange={(event) => setShowApplied(event.target.checked)}
            />
            Show only requirements I have applied to
          </label>

          {(filters.subject || filters.classLevel || filters.city || filters.budgetMin !== '' || filters.budgetMax !== '' || search) && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setFilters({ subject: '', classLevel: '', city: '', budgetMin: '', budgetMax: '' });
                setSearch('');
              }}
            >
              <IconClose size={14} /> Clear filters
            </button>
          )}
        </div>
      </section>

      {results.length === 0 ? (
        <EmptyState
          icon={<IconBriefcase size={24} />}
          title={all.length === 0 ? 'No open requirements right now' : 'No requirements match these filters'}
          text={
            all.length === 0
              ? 'All requirements are currently closed or assigned. Check back later, or post a requirement yourself if you are a student.'
              : 'Try clearing the budget range or the city filter.'
          }
          action={
            all.length === 0 ? (
              <Link className="btn btn--secondary" to="/requirements">View the public board</Link>
            ) : (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  setFilters({ subject: '', classLevel: '', city: '', budgetMin: '', budgetMax: '' });
                  setSearch('');
                }}
              >
                Clear filters
              </button>
            )
          }
        />
      ) : (
        <div className="stack">
          {results.map((requirement) => (
            <RequirementCard
              key={requirement.id}
              requirement={requirement}
              viewerRole="tutor"
              applied={appliedIds.has(requirement.id)}
              onApply={() => setApplying(requirement)}
            />
          ))}
        </div>
      )}

      <ApplyModal
        requirement={applying}
        open={applying !== null}
        onClose={() => setApplying(null)}
        onApplied={() => setVersion((v) => v + 1)}
      />

    </div>
  );
}
