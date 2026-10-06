import { IconSearch, IconClose, IconFilter } from '../common/Icons.jsx';
import { SORTS } from '../../utils/helpers.js';

/** Search input with a clear button. */
export function SearchInput({ value, onChange, placeholder = 'Search', autoFocus = false }) {
  return (
    <div className="search-input" style={{ width: '100%' }}>
      <span className="search-input__icon"><IconSearch size={17} /></span>
      <input
        type="search"
        className="input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus={autoFocus}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-400)',
            display: 'flex', padding: 2,
          }}
        >
          <IconClose size={15} />
        </button>
      )}
    </div>
  );
}

/** Sort dropdown for the results toolbar. */
export function SortSelect({ value, onChange }) {
  return (
    <select
      className="select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Sort tutors"
    >
      {SORTS.map((sort) => (
        <option key={sort.value} value={sort.value}>{sort.label}</option>
      ))}
    </select>
  );
}

/** Mobile "Filters" button. */
export function FilterToggle({ onClick, activeCount = 0 }) {
  return (
    <button type="button" className="btn btn--secondary filter-toggle" onClick={onClick}>
      <IconFilter size={15} />
      Filters{activeCount > 0 ? ` (${activeCount})` : ''}
    </button>
  );
}