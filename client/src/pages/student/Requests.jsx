import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as requestService from '../../services/requestService.js';
import * as reviewService from '../../services/reviewService.js';
import { toast } from '../../hooks/useToast.js';
import { plural } from '../../utils/helpers.js';
import RequestCard, { RequestTimeline } from '../../components/student/RequestCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import RatingStars from '../../components/common/RatingStars.jsx';
import { IconChat, IconStar, IconSearch } from '../../components/common/Icons.jsx';

const FILTERS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Declined' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'all', label: 'All' },
];

/** Review dialog shown after a session is completed. */
function ReviewModal({ request, open, onClose, onSubmitted }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();

    const result = reviewService.createReview(user, {
      requestId: request.id,
      rating,
      comment,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.success('Thank you — your review has been submitted');
    setComment('');
    setRating(5);
    onSubmitted?.();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Review this session"
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="review-form" className="btn btn--primary">Submit review</button>
        </>
      }
    >
      <form id="review-form" className="form" onSubmit={submit} noValidate>
        <p className="small muted">
          Your review helps other families choose with confidence. Only the student in a completed
          session can leave one review.
        </p>

        <div className="field">
          <span className="field__label">How was the session?</span>
          <RatingStars value={rating} onChange={setRating} size={22} />
          <span className="field__hint" style={{ marginTop: 6 }}>
            {rating === 5 && 'Excellent'}
            {rating === 4 && 'Good'}
            {rating === 3 && 'Average'}
            {rating === 2 && 'Below average'}
            {rating === 1 && 'Poor'}
          </span>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="field-review-comment">Your comments</label>
          <textarea
            id="field-review-comment"
            className="textarea"
            rows={4}
            maxLength={1000}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What worked well? Anything the tutor could improve?"
          />
          {error && <span className="field__error" role="alert">{error}</span>}
        </div>
      </form>
    </Modal>
  );
}

/** `/student/requests` — all requests the student has sent. */
export default function Requests() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('active');
  const [selected, setSelected] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [, setVersion] = useState(0);

  const all = requestService.listForStudent(user.id);
  const visible = requestService.filterByStatus(all, filter);
  const summary = requestService.summarise(all);

  const refresh = () => setVersion((v) => v + 1);

  const cancelRequest = (request) => {
    const result = requestService.updateStatus(request.id, 'cancelled', user);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('Request cancelled');
    refresh();
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">My requests</h1>
          <p className="dashboard-header__subtitle">
            {summary.active > 0
              ? `${plural(summary.active, 'active request')} · ${summary.awaitingReview} awaiting your review.`
              : 'Track tutoring and demo requests from pending through to completed.'}
          </p>
        </div>
        <Link className="btn btn--primary" to="/student/tutors">
          <IconSearch size={15} /> Find a tutor
        </Link>
      </div>

      <div className="search-toolbar" style={{ marginBottom: 18 }}>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map((option) => {
            const count = requestService.filterByStatus(all, option.value).length;
            return (
              <button
                key={option.value}
                type="button"
                className={`tag ${filter === option.value ? 'tag--active' : ''}`}
                onClick={() => setFilter(option.value)}
                aria-pressed={filter === option.value}
                style={{ cursor: 'pointer' }}
              >
                {option.label} {count > 0 && <span>({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {summary.awaitingReview > 0 && (
        <div className="alert alert--info" style={{ marginBottom: 16 }}>
          <IconStar size={15} />
          <span>
            {plural(summary.awaitingReview, 'completed session')} {summary.awaitingReview === 1 ? 'is' : 'are'} waiting
            for a review. Reviews are the only way a tutor gets rated.
          </span>
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState
          icon={<IconChat size={24} />}
          title={all.length === 0 ? 'No requests yet' : 'Nothing in this filter'}
          text={
            all.length === 0
              ? 'Open a tutor profile and send a tuition request, or request a demo class to start.'
              : 'Try another status filter to see your other requests.'
          }
          action={
            all.length === 0 ? (
              <Link className="btn btn--primary" to="/student/tutors">Find a tutor</Link>
            ) : (
              <button type="button" className="btn btn--secondary" onClick={() => setFilter('all')}>
                Show all requests
              </button>
            )
          }
        />
      ) : (
        <div className="stack">
          {visible.map((request) => {
            const actions = requestService.availableActions(request, 'student').map((action) => ({
              ...action,
              variant: action.status === 'cancelled' ? 'danger-ghost' : action.variant,
              onClick: () => setCancelling(request),
            }));

            if (request.status === 'completed' && !request.review) {
              actions.unshift({
                status: 'review',
                label: 'Leave a review',
                variant: 'primary',
                onClick: () => setReviewing(request),
              });
            }

            return (
              <RequestCard
                key={request.id}
                request={request}
                viewerRole="student"
                actions={actions}
              >
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  style={{ marginBottom: 10 }}
                  onClick={() => setSelected(request)}
                >
                  View status history
                </button>
              </RequestCard>
            );
          })}
        </div>
      )}

      {/* --------------------------- status timeline --------------------------- */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Status history · ${selected.subject || selected.type}` : 'Status history'}
      >
        {selected && (
          <div className="stack">
            <RequestTimeline timeline={selected.timeline} />
            {selected.review && (
              <div className="alert alert--success">
                <IconStar size={15} />
                <span>
                  You reviewed this session with {selected.review.rating} star{selected.review.rating === 1 ? '' : 's'}.
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ReviewModal
        request={reviewing}
        open={reviewing !== null}
        onClose={() => setReviewing(null)}
        onSubmitted={refresh}
      />

      <ConfirmDialog
        open={cancelling !== null}
        title="Cancel this request?"
        message="The tutor will be notified that you have cancelled. You can send a new request later if you change your mind."
        confirmLabel="Cancel request"
        cancelLabel="Keep request"
        onCancel={() => setCancelling(null)}
        onConfirm={() => {
          cancelRequest(cancelling);
          setCancelling(null);
        }}
      />
    </div>
  );
}