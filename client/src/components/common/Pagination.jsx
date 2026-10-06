import { IconChevronLeft, IconChevronRight } from './Icons.jsx';

/** Page-number pagination used by the tutor search results. */
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  // Window of pages around the current one, with 1 and last always visible.
  const pages = [];
  const start = Math.max(1, page - 1);
  const end = Math.min(totalPages, page + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <IconChevronLeft size={15} />
      </button>

      {pages[0] > 1 && (
        <>
          <button type="button" className="pagination__btn" onClick={() => onChange(1)}>1</button>
          {pages[0] > 2 && <span className="muted small">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`pagination__btn ${p === page ? 'is-active' : ''}`}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="muted small">…</span>}
          <button type="button" className="pagination__btn" onClick={() => onChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        className="pagination__btn"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <IconChevronRight size={15} />
      </button>
    </nav>
  );
}

/** "Showing 1-12 of 48 tutors" style summary. */
export function ResultSummary({ from, to, total, noun = 'tutors' }) {
  if (total === 0) return <span className="search-toolbar__count">No {noun} found</span>;
  return (
    <span className="search-toolbar__count">
      Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong> {noun}
    </span>
  );
}