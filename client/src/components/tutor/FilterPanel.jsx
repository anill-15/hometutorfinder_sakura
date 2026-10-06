import { CLASS_LEVELS, TEACHING_MODES } from '../../utils/helpers.js';
import { cityOptions } from '../../utils/lookups.js';
import { IconClose } from '../common/Icons.jsx';

/**
 * The filter sidebar for /tutors.
 *
 * Filter values are plain strings; every change is reported upward through
 * `onChange` so the parent owns the filtering logic.
 */
export default function FilterPanel({
  filters,
  onChange,
  onReset,
  options,
  className = '',
  hidden = false,
  onClose = null,
}) {
  const set = (key) => (value) => onChange({ ...filters, [key]: value });

  const localities = options.localitiesByCity?.[filters.city] || [];

  return (
    <aside
      className={`filter-panel ${hidden ? 'is-hidden' : ''} ${className}`}
      aria-label="Filter tutors"
    >
      <div className="filter-panel__header">
        <strong className="small">Filters</strong>
        {onClose ? (
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close filters">
            <IconClose size={16} />
          </button>
        ) : (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onReset}>Reset</button>
        )}
      </div>

      {onClose && (
        <button type="button" className="btn btn--secondary btn--block" style={{ marginBottom: 16 }} onClick={onReset}>
          Reset all filters
        </button>
      )}

      <div className="filter-group">
        <div className="filter-group__title">Subject</div>
        <select className="select" value={filters.subject} onChange={(e) => set('subject')(e.target.value)} aria-label="Subject">
          <option value="">All subjects</option>
          {options.subjects.map((subject) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Class / grade</div>
        <select className="select" value={filters.classLevel} onChange={(e) => set('classLevel')(e.target.value)} aria-label="Class or grade">
          <option value="">All classes</option>
          {CLASS_LEVELS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <div className="filter-group__title">City</div>
        <select className="select" value={filters.city} onChange={(e) => onChange({ ...filters, city: e.target.value, locality: '' })} aria-label="City">
          <option value="">All cities</option>
          {cityOptions().map((city) => (
            <option key={city.value} value={city.value}>{city.label}</option>
          ))}
        </select>

        {filters.city && localities.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <select className="select" value={filters.locality} onChange={(e) => set('locality')(e.target.value)} aria-label="Locality">
              <option value="">All localities</option>
              {localities.map((locality) => (
                <option key={locality} value={locality}>{locality}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Monthly fee (₹)</div>
        <div className="row" style={{ gap: 8 }}>
          <input
            type="number"
            className="input"
            placeholder="Min"
            min="0"
            step="500"
            value={filters.feeMin}
            onChange={(e) => set('feeMin')(e.target.value)}
            aria-label="Minimum monthly fee"
          />
          <input
            type="number"
            className="input"
            placeholder="Max"
            min="0"
            step="500"
            value={filters.feeMax}
            onChange={(e) => set('feeMax')(e.target.value)}
            aria-label="Maximum monthly fee"
          />
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Minimum experience</div>
        <select className="select" value={filters.experienceMin} onChange={(e) => set('experienceMin')(e.target.value)} aria-label="Minimum experience">
          <option value="">Any experience</option>
          <option value="1">1 year or more</option>
          <option value="3">3 years or more</option>
          <option value="5">5 years or more</option>
          <option value="10">10 years or more</option>
        </select>
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Teaching mode</div>
        <select className="select" value={filters.mode} onChange={(e) => set('mode')(e.target.value)} aria-label="Teaching mode">
          <option value="">Any mode</option>
          {TEACHING_MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>{mode.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Language</div>
        <select className="select" value={filters.language} onChange={(e) => set('language')(e.target.value)} aria-label="Language">
          <option value="">Any language</option>
          {options.languages.map((language) => (
            <option key={language} value={language}>{language}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Minimum rating</div>
        <select className="select" value={filters.ratingMin} onChange={(e) => set('ratingMin')(e.target.value)} aria-label="Minimum rating">
          <option value="">Any rating</option>
          <option value="3">3 stars and above</option>
          <option value="4">4 stars and above</option>
          <option value="4.5">4.5 stars and above</option>
        </select>
      </div>

      <div className="filter-group">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => set('verifiedOnly')(e.target.checked)}
          />
          Show verified tutors only
        </label>
      </div>
    </aside>
  );
}

/** Chips showing the filters currently applied, each removable. */
export function ActiveFilters({ filters, onRemove, onClearAll }) {
  const chips = [];

  const add = (key, label) => {
    if (filters[key] !== '' && filters[key] !== false && filters[key] !== undefined) {
      chips.push({ key, label });
    }
  };

  add('subject', `Subject: ${filters.subject}`);
  add('classLevel', filters.classLevel);
  add('city', cityOptions().find((c) => c.value === filters.city)?.label.split(',')[0] || filters.city);
  add('locality', filters.locality);
  add('mode', TEACHING_MODES.find((m) => m.value === filters.mode)?.label || filters.mode);
  add('language', filters.language);
  add('experienceMin', `${filters.experienceMin}+ years`);
  add('ratingMin', `${filters.ratingMin}★ and above`);
  if (filters.feeMin !== '') chips.push({ key: 'feeMin', label: `Min ₹${filters.feeMin}` });
  if (filters.feeMax !== '') chips.push({ key: 'feeMax', label: `Max ₹${filters.feeMax}` });
  if (filters.verifiedOnly) chips.push({ key: 'verifiedOnly', label: 'Verified only' });

  if (chips.length === 0) return null;

  return (
    <div className="active-filters">
      {chips.map((chip) => (
        <span className="chip" key={chip.key}>
          {chip.label}
          <button type="button" onClick={() => onRemove(chip.key)} aria-label={`Remove filter ${chip.label}`}>
            <IconClose size={12} />
          </button>
        </span>
      ))}
      <button type="button" className="btn btn--ghost btn--sm" onClick={onClearAll}>
        Clear all
      </button>
    </div>
  );
}