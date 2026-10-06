import { IconStar } from './Icons.jsx';

/**
 * Read-only star display, or an interactive 1-5 picker.
 *
 * @param {number} value      rating to display
 * @param {number} count      number of reviews (shown when showCount)
 * @param {function} onChange when provided, renders as an interactive picker
 */
export default function RatingStars({
  value = 0,
  count = null,
  onChange = null,
  size = 15,
  showCount = false,
  label = 'Rating',
}) {
  const interactive = typeof onChange === 'function';

  if (interactive) {
    return (
      <div className="stars stars--interactive" role="radiogroup" aria-label={`${label} (1 to 5 stars)`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            className={`star-button ${star <= value ? 'is-filled' : ''}`}
            onClick={() => onChange(star)}
          >
            <IconStar size={size + 5} filled={star <= value} />
          </button>
        ))}
      </div>
    );
  }

  const rounded = Math.round(value);

  return (
    <span className="rating-summary">
      <span className="stars" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <IconStar key={star} size={size} filled={star <= rounded} aria-hidden="true" />
        ))}
      </span>
      {value > 0 && <span className="rating-summary__value">{Number(value).toFixed(1)}</span>}
      {showCount && count !== null && (
        <span className="rating-summary__count">
          ({count} review{count === 1 ? '' : 's'})
        </span>
      )}
    </span>
  );
}