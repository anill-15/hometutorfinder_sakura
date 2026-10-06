import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as tutorService from '../../services/tutorService.js';
import * as reviewService from '../../services/reviewService.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import RatingStars from '../../components/common/RatingStars.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import { formatDate } from '../../utils/helpers.js';
import { IconStar, IconChat } from '../../components/common/Icons.jsx';

const STAR_COPY = {
  5: 'Excellent — clear explanations and reliable attendance.',
  4: 'Good — solid teaching, minor scheduling slips.',
  3: 'Average — helpful, though progress was uneven.',
  2: 'Below average — several classes had to be rescheduled.',
  1: 'Poor — the sessions did not meet expectations.',
};

/** `/tutor/reviews` — reviews received on the tutor's profile. */
export default function Reviews() {
  const { user } = useAuth();
  const profile = tutorService.getProfileByUserId(user.id);

  if (!profile) {
    return (
      <EmptyState
        icon={<IconStar size={24} />}
        title="No profile yet"
        text="Reviews are attached to your tutor profile. Create your profile and complete a session to start collecting reviews."
        action={<Link className="btn btn--primary" to="/tutor/profile">Create my profile</Link>}
      />
    );
  }

  const summary = reviewService.ratingSummary(profile.id);
  const reviews = reviewService.listForTutor(profile.id);

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Reviews</h1>
          <p className="dashboard-header__subtitle">
            Only students from a completed session can leave a review, one review per session.
          </p>
        </div>
        <Link className="btn btn--secondary" to={`/tutors/${profile.id}`}>View public profile</Link>
      </div>

      {summary.count === 0 ? (
        <EmptyState
          icon={<IconStar size={24} />}
          title="No reviews yet"
          text="Reviews appear once a student marks a session complete and rates it. Completing your first session is the fastest way to build a rating."
          action={<Link className="btn btn--primary" to="/tutor/requests">See my requests</Link>}
        />
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 320px) minmax(0, 1fr)', gap: 22, alignItems: 'start' }}>
          {/* ----------------------------- summary ----------------------------- */}
          <aside className="stack">
            <section className="card card--pad">
              <div className="text-center" style={{ marginBottom: 18 }}>
                <div style={{ fontSize: '2.6rem', fontWeight: 700, lineHeight: 1 }}>
                  {summary.average.toFixed(1)}
                </div>
                <div style={{ marginTop: 8 }}>
                  <RatingStars value={summary.average} size={18} />
                </div>
                <div className="small muted" style={{ marginTop: 6 }}>
                  Based on {summary.count} review{summary.count === 1 ? '' : 's'}
                </div>
              </div>

              <div className="rating-bars">
                {summary.breakdown.map((row) => (
                  <div className="rating-bar-row" key={row.star}>
                    <span>{row.star} star</span>
                    <span className="progress-bar">
                      <span
                        className="progress-bar__fill"
                        style={{ width: `${(row.count / summary.count) * 100}%`, display: 'block' }}
                      />
                    </span>
                    <span className="rating-bar-row__count">{row.count}</span>
                  </div>
                ))}
              </div>
            </section>

            <div className="alert alert--info">
              <IconStar size={15} />
              <span>
                Your rating is calculated automatically from your reviews. It updates the moment a
                student submits one.
              </span>
            </div>

            {summary.average < 4.5 && summary.count >= 3 && (
              <div className="alert alert--warning">
                <IconChat size={15} />
                <span>
                  Reviews mentioning timing and cancelled classes come up most often. Publishing
                  accurate availability helps.
                </span>
              </div>
            )}
          </aside>

          {/* ----------------------------- reviews ----------------------------- */}
          <section>
            <h2 style={{ fontSize: '1.05rem', marginBottom: 14 }}>
              All reviews ({reviews.length})
            </h2>

            <div className="stack">
              {reviews.map((review) => (
                <article className="item-card" key={review.id}>
                  <div className="row row--between" style={{ marginBottom: 12 }}>
                    <div className="row" style={{ gap: 11 }}>
                      <Avatar name={review.student?.name} size="sm" />
                      <div>
                        <div className="strong small">{review.student?.name || 'Student'}</div>
                        <div className="small muted">
                          {review.subjectName || 'Tuition'} · {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>
                    <RatingStars value={review.rating} size={14} />
                  </div>

                  {review.comment && (
                    <p style={{ fontSize: '0.92rem', color: 'var(--ink-600)', lineHeight: 1.65 }}>
                      {review.comment}
                    </p>
                  )}

                  <div className="small muted" style={{ marginTop: 10, fontStyle: 'italic' }}>
                    {STAR_COPY[review.rating]}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}