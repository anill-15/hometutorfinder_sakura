import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as adminService from '../../services/adminService.js';
import * as reviewService from '../../services/reviewService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from '../../hooks/useToast.js';
import { formatDateTime, plural } from '../../utils/helpers.js';
import Avatar from '../../components/common/Avatar.jsx';
import RatingStars from '../../components/common/RatingStars.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { SearchInput } from '../../components/tutor/SearchBar.jsx';
import { IconStar, IconTrash, IconAlert } from '../../components/common/Icons.jsx';

const RATING_FILTERS = [
  { value: 'all', label: 'All ratings' },
  { value: '5', label: '5 stars' },
  { value: '4', label: '4 stars' },
  { value: '3', label: '3 stars' },
  { value: '2', label: '2 stars' },
  { value: '1', label: '1 star' },
];

/** `/admin/reviews` — moderate reviews, remove inappropriate ones. */
export default function Reviews() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null); // review

  const all = adminService.listReviews();

  const needle = search.trim().toLowerCase();
  const visible = all
    .filter((r) => (filter === 'all' ? true : String(r.rating) === filter))
    .filter((r) => {
      if (!needle) return true;
      return [r.comment, r.student?.name, r.tutorUser?.name, r.subjectName]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(needle));
    });

  const summary = reviewService.platformRating();
  const lowRated = all.filter((r) => r.rating <= 2).length;

  const handleDelete = (review) => {
    const result = reviewService.deleteReview(review.id, user);
    if (!result.ok) {
      toast.error(result.error);
      setConfirm(null);
      return;
    }
    toast.success('Review removed and the tutor rating recalculated');
    setConfirm(null);
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Reviews</h1>
          <p className="dashboard-header__subtitle">
            {plural(all.length, 'review')} written by students after completed sessions. Average
            rating: {summary.average.toFixed(1)}.
          </p>
        </div>
      </div>

      {lowRated > 0 && (
        <div className="alert alert--warning" style={{ marginBottom: 18 }}>
          <IconAlert size={15} />
          <span>
            {plural(lowRated, 'review')} rated 2 stars or below. Read them before deciding whether any
            need removing — low ratings are legitimate feedback, not abuse.
          </span>
        </div>
      )}

      <section className="card card--pad" style={{ marginBottom: 20 }}>
        <div className="form-grid" style={{ alignItems: 'end' }}>
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <label className="field__label" htmlFor="admin-review-search">Search</label>
            <SearchInput value={search} onChange={setSearch} placeholder="Comment, student or tutor name" />
          </div>

          <div className="field">
            <span className="field__label">Rating</span>
            <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
              {RATING_FILTERS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`tag ${filter === option.value ? 'tag--active' : ''}`}
                  onClick={() => setFilter(option.value)}
                  aria-pressed={filter === option.value}
                  style={{ cursor: 'pointer' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {visible.length === 0 ? (
        <EmptyState
          icon={<IconStar size={24} />}
          title="No reviews match this filter"
          text="Try a different rating or clear the search box."
          action={
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setFilter('all');
                setSearch('');
              }}
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="stack">
          {visible.map((review) => (
            <article className="item-card" key={review.id}>
              <div className="row row--between row--wrap" style={{ gap: 12, marginBottom: 12 }}>
                <div className="row" style={{ gap: 11, minWidth: 0 }}>
                  <Avatar name={review.student?.name} size="sm" />
                  <div style={{ minWidth: 0 }}>
                    <div className="strong small">{review.student?.name || 'Unknown student'}</div>
                    <div className="small muted">
                      reviewed{' '}
                      <Link to={review.tutor ? `/tutors/${review.tutor.id}` : '/admin/tutors'}>
                        {review.tutorUser?.name || 'a tutor'}
                      </Link>
                      {review.subjectName ? ` · ${review.subjectName}` : ''} · {formatDateTime(review.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="btn-group">
                  <RatingStars value={review.rating} size={14} />
                  <button
                    type="button"
                    className="btn btn--danger-ghost btn--sm"
                    onClick={() => setConfirm(review)}
                  >
                    <IconTrash size={14} /> Remove
                  </button>
                </div>
              </div>

              {review.comment && (
                <p style={{ fontSize: '0.92rem', color: 'var(--ink-600)', lineHeight: 1.65 }}>
                  {review.comment}
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      <div className="alert alert--info" style={{ marginTop: 18 }}>
        <IconStar size={15} />
        <span>
          Removing a review immediately recalculates the tutor&rsquo;s average rating. Use this only
          for abuse, spam or personal information — not for criticism.
        </span>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title="Remove this review?"
        message={`The review by ${confirm?.student?.name || 'a student'} will be deleted and the tutor's rating recalculated. This cannot be undone.`}
        confirmLabel="Remove review"
        onCancel={() => setConfirm(null)}
        onConfirm={() => handleDelete(confirm)}
      >
        {confirm?.comment && (
          <div className="item-card__description" style={{ marginTop: 14, marginBottom: 0 }}>
            {confirm.comment}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}