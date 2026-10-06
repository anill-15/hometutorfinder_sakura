import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as tutorService from '../../services/tutorService.js';
import { CITIES } from '../../utils/lookups.js';
import TutorCard from '../../components/tutor/TutorCard.jsx';
import FilterPanel, { ActiveFilters } from '../../components/tutor/FilterPanel.jsx';
import { SearchInput, SortSelect, FilterToggle } from '../../components/tutor/SearchBar.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination, { ResultSummary } from '../../components/common/Pagination.jsx';
import { IconSearch, IconClose } from '../../components/common/Icons.jsx';

const EMPTY_FILTERS = {
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
};

const PER_PAGE = 9;

/**
 * The tutor directory.
 *
 * Filter state lives in the URL query string, so a search can be shared or
 * bookmarked, and the browser back button behaves as expected.
 */
export default function Tutors() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = {
    search: params.get('search') || '',
    subject: params.get('subject') || '',
    classLevel: params.get('class') || '',
    city: params.get('city') || '',
    locality: params.get('locality') || '',
    mode: params.get('mode') || '',
    language: params.get('language') || '',
    feeMin: params.get('feeMin') || '',
    feeMax: params.get('feeMax') || '',
    experienceMin: params.get('experience') || '',
    ratingMin: params.get('rating') || '',
    verifiedOnly: params.get('verified') === 'true',
  };

  const sort = params.get('sort') || 'rating';

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

  const applyFilters = (next) => {
    const query = {};
    if (next.search) query.search = next.search;
    if (next.subject) query.subject = next.subject;
    if (next.classLevel) query.class = next.classLevel;
    if (next.city) query.city = next.city;
    if (next.locality) query.locality = next.locality;
    if (next.mode) query.mode = next.mode;
    if (next.language) query.language = next.language;
    if (next.feeMin) query.feeMin = next.feeMin;
    if (next.feeMax) query.feeMax = next.feeMax;
    if (next.experienceMin) query.experience = next.experienceMin;
    if (next.ratingMin) query.rating = next.ratingMin;
    if (next.verifiedOnly) query.verified = 'true';
    if (sort !== 'rating') query.sort = sort;

    setParams(query, { replace: true });
    setPage(1);
  };

  // Reset pagination whenever the query string changes.
  useEffect(() => {
    setPage(1);
  }, [params]);

  const results = useMemo(
    () => tutorService.searchTutors(filters, sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params.toString(), sort],
  );

  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const visible = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Bumped when a favourite changes, so the heart icons re-render.
  const [favVersion, setFavVersion] = useState(0);

  const favouriteIds = useMemo(
    () => new Set(
      user?.role === 'student' ? tutorService.listFavorites(user.id).map((f) => f.tutorId) : [],
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, favVersion],
  );

  const activeCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'search' && value !== '' && value !== false,
  ).length;

  const handleRemoveFilter = (key) => {
    const next = { ...filters, [key]: key === 'verifiedOnly' ? false : '' };
    applyFilters(next);
  };

  return (
    <div className="container page">
      <div className="page-header">
        <div className="page-header__text">
          <h1 className="page-header__title">Find a tutor</h1>
          <p className="page-header__subtitle">
            Compare verified tutors by subject, class, fees, availability and student reviews.
          </p>
        </div>
      </div>

      <div className="search-layout">
        {/* Filters: inline on desktop, slide-over on mobile */}
        <FilterPanel
          filters={filters}
          onChange={applyFilters}
          onReset={() => setParams({}, { replace: true })}
          options={options}
          hidden={!mobileFiltersOpen}
          onClose={mobileFiltersOpen ? () => setMobileFiltersOpen(false) : null}
        />
        {mobileFiltersOpen && (
          <div
            className="filter-overlay"
            onClick={() => setMobileFiltersOpen(false)}
            role="presentation"
          />
        )}

        <div>
          <div className="search-toolbar">
            <div className="row" style={{ flex: 1, minWidth: 220, gap: 10 }}>
              <FilterToggle
                onClick={() => setMobileFiltersOpen(true)}
                activeCount={activeCount}
              />
              <div style={{ flex: 1, maxWidth: 420 }}>
                <SearchInput
                  value={filters.search}
                  onChange={(value) => applyFilters({ ...filters, search: value })}
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
              <SortSelect
                value={sort}
                onChange={(value) => {
                  const next = { ...params };
                  if (value === 'rating') next.delete('sort');
                  else next.set('sort', value);
                  setParams(next, { replace: true });
                }}
              />
            </div>
          </div>

          <ActiveFilters
            filters={filters}
            onRemove={handleRemoveFilter}
            onClearAll={() => setParams({}, { replace: true })}
          />

          {visible.length === 0 ? (
            <EmptyState
              icon={<IconSearch size={24} />}
              title="No tutors match these filters"
              text="Try widening the fee range, clearing the city filter, or searching for a different subject."
              action={
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => setParams({}, { replace: true })}
                >
                  <IconClose size={15} /> Clear all filters
                </button>
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
                    match={user?.role === 'student' ? tutorService.matchReasons(tutor, user) : null}
                    onFavoriteChange={() => setFavVersion((v) => v + 1)}
                  />
                ))}
              </div>

              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}