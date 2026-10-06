import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as requirementService from '../../services/requirementService.js';
import * as tutorService from '../../services/tutorService.js';
import RequirementCard from '../../components/student/RequirementCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import SelectInput from '../../components/common/SelectInput.jsx';
import { SearchInput } from '../../components/tutor/SearchBar.jsx';
import { CLASS_LEVELS } from '../../utils/helpers.js';
import { cityOptions, subjectOptions } from '../../utils/lookups.js';
import { IconSearch, IconBriefcase } from '../../components/common/Icons.jsx';

const OPEN_STATUSES = ['open', 'applications_received', 'shortlisted', 'assigned'];

const STATUS_OPTIONS = [
  { value: '', label: 'Open requirements' },
  { value: 'open', label: 'Open' },
  { value: 'applications_received', label: 'Applications received' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'assigned', label: 'Tutor assigned' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
];

/**
 * Public board of open tuition requirements. Students can see who is looking
 * for tuition in their area; tutors can find leads to apply to.
 */
export default function Requirements() {
  const [filters, setFilters] = useState({
    subject: '',
    classLevel: '',
    city: '',
    status: '',
    search: '',
  });

  const set = (key) => (value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const requirements = useMemo(() => {
    let list = requirementService.listRequirements({ includeClosed: true });

    // No status selected means "everything still open to tutors".
    if (filters.status === '') {
      list = list.filter((r) => OPEN_STATUSES.includes(r.status));
    } else {
      list = list.filter((r) => r.status === filters.status);
    }

    if (filters.subject) list = list.filter((r) => r.subject === filters.subject);
    if (filters.classLevel) list = list.filter((r) => r.classLevel === filters.classLevel);
    if (filters.city) list = list.filter((r) => r.city === filters.city);

    if (filters.search) {
      const needle = filters.search.toLowerCase();
      list = list.filter((r) =>
        [r.subject, r.classLevel, r.board, r.description, r.locality]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(needle)),
      );
    }

    return list;
  }, [filters]);

  const tutorCount = tutorService.listTutorsWithUsers().filter((t) => t.user).length;

  return (
    <div className="container page">
      <div className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Open tuition requirements</h1>
          <p className="page-header__subtitle">
            Families actively looking for a tutor. If you are a tutor, you can sign in and apply
            directly from your dashboard.
          </p>
        </div>
        <div className="btn-group">
          <Link className="btn btn--secondary" to="/tutors">Browse tutors</Link>
          <Link className="btn btn--primary" to="/register">Post a requirement</Link>
        </div>
      </div>

      <div className="card card--pad" style={{ marginBottom: 22 }}>
        <div className="form-grid" style={{ alignItems: 'end' }}>
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <label className="field__label" htmlFor="req-search">Search</label>
            <SearchInput value={filters.search} onChange={set('search')} placeholder="Subject, class or locality" />
          </div>

          <SelectInput
            label="Subject"
            name="public-req-subject"
            value={filters.subject}
            onChange={set('subject')}
            placeholder="All subjects"
            options={subjectOptions()}
          />

          <SelectInput
            label="Class"
            name="public-req-class"
            value={filters.classLevel}
            onChange={set('classLevel')}
            placeholder="All classes"
            options={CLASS_LEVELS.map((level) => ({ value: level, label: level }))}
          />

          <SelectInput
            label="City"
            name="public-req-city"
            value={filters.city}
            onChange={set('city')}
            placeholder="All cities"
            options={cityOptions()}
          />

          <SelectInput
            label="Status"
            name="public-req-status"
            value={filters.status}
            onChange={set('status')}
            placeholder="Any status"
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      {requirements.length === 0 ? (
        <EmptyState
          icon={<IconSearch size={24} />}
          title="No requirements match these filters"
          text="Try clearing the filters, or post your own requirement so tutors can find you."
          action={
            <div className="btn-group">
              <button type="button" className="btn btn--secondary" onClick={() => setFilters({ subject: '', classLevel: '', city: '', status: '', search: '' })}>
                Clear filters
              </button>
              <Link className="btn btn--primary" to="/register">Post a requirement</Link>
            </div>
          }
        />
      ) : (
        <div className="stack">
          <div className="small muted">
            {requirements.length} requirement{requirements.length === 1 ? '' : 's'} shown
            {filters.status === '' && ' that tutors can still apply to'}
          </div>

          {requirements.map((requirement) => (
            <RequirementCard key={requirement.id} requirement={requirement} viewerRole="public" />
          ))}

          <div className="card card--pad text-center">
            <p className="muted small" style={{ marginBottom: 14 }}>
              Are you a tutor? Sign in to see requirements matched to your subjects and apply in one click.
            </p>
            <div className="btn-group" style={{ justifyContent: 'center' }}>
              <Link className="btn btn--primary" to="/register">Join as a tutor</Link>
              <span className="btn btn--ghost" aria-hidden="true">
                <IconBriefcase size={15} /> {tutorCount} tutors already listed
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}