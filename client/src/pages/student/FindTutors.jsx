import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as tutorService from '../../services/tutorService.js';
import { CITIES } from '../../utils/lookups.js';
import TutorCard from '../../components/tutor/TutorCard.jsx';
import FilterPanel, { ActiveFilters } from '../../components/tutor/FilterPanel.jsx';
import { SearchInput, SortSelect, FilterToggle } from '../../components/tutor/SearchBar.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination, { ResultSummary } from '../../components/common/Pagination.jsx';
import {
  IconSearch, IconClose, IconSparkle, IconFlag,
} from '../../components/common/Icons.jsx';

/**
 * Tutor browser for signed-in students.
 *
 * Same search logic as the public directory, plus match reasons based on the
 * student's saved learning preferences and a shortcut to post a requirement.
 */
export default function FindTutors() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    classLevel: '',
    city: '',
    locality: '',
    mode: '',
    language: '',
    feeMin: '',
    feeMax: '',
    experienceMin: '',
    ratingMin: '',
    verifiedOnly: false,
  });
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [favVersion, setFavVersion] = useState(0);

  const PER_PAGE = 9;
  const options = useMemo(() => {
    const base = tutorService.filterOptions();
    return {
      ...base,
      localitiesByCity: CITIES.reduce((acc, city) => {
        acc[city.id] = city.localities;
        return acc;
      }, {}),
    };
  }, []);

  const results = useMemo(
    () => tutorService.searchTutors(filters, sort),
    [filters, sort],
  );

  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const visible = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const favouriteIds = useMemo(
    () => new Set(tutorService.listFavorites(user.id).map((f) => f.tutorId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user.id, favVersion],
  );

  const update = (next) => {
    setFilters(next);
    setPage(1);
  };

  const activeCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'search' && value !== '' && value !== false,
  ).length;

  const prefs = user.profile || {};
  const hasPreferences = prefs.classLevel && (prefs.subjects || []).length > 0;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Find a tutor</h1>
          <p className="dashboard-header__subtitle">
            {hasPreferences
              ? `Showing matches for ${prefs.classLevel} in ${prefs.subjects.join(', ')}. Tutors that fit your preferences are highlighted.`
              : 'Set your class and subjects in your profile to see match reasons on each tutor.'}
          </p>
        </div>
        <div className="btn-group">
          <Link className="btn btn--secondary" to="/student/profile">Edit preferences</Link>
          <Link className="btn btn--primary" to="/student/requirements/new">Post a requirement</Link>
        </div>
      </div>

      {!hasPreferences && (
        <div className="alert alert--info" style={{ marginBottom: 18 }}>
          <IconSparkle size={15} />
          <span>
            Add your class, subjects, budget and preferred days in{' '}
            <Link to="/student/profile">Profile &amp; preferences</Link> and every tutor card will
            explain why — or why not — they are a good match.
          </span>
        </div>
      )}

      <div className="search-layout">
        <FilterPanel
          filters={filters}
          onChange={update}
          onReset={() => update({
            search: '', subject: '', classLevel: '', city: '', locality: '',
            mode: '', language: '', feeMin: '', feeMax: '', experienceMin: '', ratingMin: '', verifiedOnly: false,
          })}
          options={options}
          hidden={!mobileFiltersOpen}
          onClose={mobileFiltersOpen ? () => setMobileFiltersOpen(false) : null}
        />
        {mobileFiltersOpen && (
          <div className="filter-overlay" onClick={() => setMobileFiltersOpen(false)} role="presentation" />
        )}

        <div>
          <div className="search-toolbar">
            <div className="row" style={{ flex: 1, minWidth: 220, gap: 10 }}>
              <FilterToggle onClick={() => setMobileFiltersOpen(true)} activeCount={activeCount} />
              <div style={{ flex: 1, maxWidth: 420 }}>
                <SearchInput
                  value={filters.search}
                  onChange={(value) => update({ ...filters, search: value })}
                  placeholder="Search by name or subject"
                />
              </div>
            </div>

            <div className="search-toolbar__controls">
              <ResultSummary
                from={results.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}
                to={Math.min(page * PER_PAGE, results.length)}
                total={results.length}
              />
              <SortSelect value={sort} onChange={setSort} />
            </div>
          </div>

          <ActiveFilters
            filters={filters}
            onRemove={(key) => update({ ...filters, [key]: key === 'verifiedOnly' ? false : '' })}
            onClearAll={() => update({
              search: '', subject: '', classLevel: '', city: '', locality: '',
              mode: '', language: '', feeMin: '', feeMax: '', experienceMin: '', ratingMin: '', verifiedOnly: false,
            })}
          />

          {visible.length === 0 ? (
            <EmptyState
              icon={<IconSearch size={24} />}
              title="No tutors match these filters"
              text="Try widening the fee range or clearing the city filter. You can also post a requirement and let tutors come to you."
              action={
                <div className="btn-group">
                  <button type="button" className="btn btn--secondary" onClick={() => update({
                    search: '', subject: '', classLevel: '', city: '', locality: '',
                    mode: '', language: '', feeMin: '', feeMax: '', experienceMin: '', ratingMin: '', verifiedOnly: false,
                  })}>
                    <IconClose size={15} /> Clear filters
                  </button>
                  <Link className="btn btn--primary" to="/student/requirements/new">Post a requirement</Link>
                </div>
              }
            />
          ) : (
            <>
              <div className="grid grid--cards">
                {visible.map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    favorite={favouriteIds.has(tutor.id)}
                    match={tutorService.matchReasons(tutor, user)}
                    onFavoriteChange={() => setFavVersion((v) => v + 1)}
                  />
                ))}
              </div>

              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}

          <p className="small muted text-center" style={{ marginTop: 24 }}>
            <IconFlag size={12} style={{ verticalAlign: -1 }} /> Spotted something wrong on a tutor
            profile? You can report it from the profile page.
          </p>
        </div>
      </div>
    </div>
  );
}