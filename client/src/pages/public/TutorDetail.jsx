import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as tutorService from '../../services/tutorService.js';
import * as reviewService from '../../services/reviewService.js';
import { toast } from '../../hooks/useToast.js';
import { formatINR, formatTime, formatDate } from '../../utils/helpers.js';
import { formatPlace } from '../../utils/lookups.js';
import Avatar from '../../components/common/Avatar.jsx';
import RatingStars from '../../components/common/RatingStars.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import RequestModal, { ReportModal } from '../../components/tutor/RequestModal.jsx';
import {
  IconVerified, IconHeart, IconLocation, IconVideo, IconClock, IconBook,
  IconCheck, IconChat, IconFlag, IconArrowLeft, IconShield,
} from '../../components/common/Icons.jsx';

export default function TutorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [requestMode, setRequestMode] = useState(null); // 'tutoring' | 'demo' | null
  const [reportOpen, setReportOpen] = useState(false);
  const [favVersion, setFavVersion] = useState(0);

  const tutor = tutorService.getTutorProfile(id);

  if (!tutor || !tutorService.getProfileByUserId(tutor.userId)) {
    return (
      <div className="container page">
        <EmptyState
          title="Tutor not found"
          text="This profile may have been removed, or the link is incorrect."
          action={<Link className="btn btn--primary" to="/tutors">Back to tutor search</Link>}
        />
      </div>
    );
  }

  const owner = tutorService.listTutorsWithUsers().find((t) => t.id === tutor.id)?.user;
  if (!owner) {
    return (
      <div className="container page">
        <EmptyState
          title="Tutor not found"
          text="This account is no longer available."
          action={<Link className="btn btn--primary" to="/tutors">Back to tutor search</Link>}
        />
      </div>
    );
  }

  const rating = reviewService.ratingSummary(tutor.id);
  const reviews = reviewService.listForTutor(tutor.id);
  const sessions = tutorService.completedSessions(tutor.userId);
  const match = user?.role === 'student' ? tutorService.matchReasons(tutor, user) : null;
  const isFavorite = user?.role === 'student' && tutorService.isFavorite(user.id, tutor.id);
  const isOwnProfile = user?.id === owner.id;

  const handleFavorite = () => {
    if (!user) {
      toast.info('Sign in to save tutors to your favourites');
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      toast.info('Only student accounts can save favourite tutors');
      return;
    }

    const result = tutorService.toggleFavorite(user.id, tutor.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(result.removed ? 'Removed from favourites' : 'Saved to favourites');
    setFavVersion((v) => v + 1);
  };

  const requireStudent = (mode) => {
    if (!user) {
      toast.info('Please sign in to continue');
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      toast.info('Only student accounts can send tuition requests');
      return;
    }
    setRequestMode(mode);
  };

  return (
    <div className="container page">
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        <IconArrowLeft size={15} /> Back
      </button>

      {/* ----------------------------- profile header ---------------------------- */}
      <div className="profile-hero">
        <div className="profile-hero__top">
          <Avatar name={owner.name} size="xl" />

          <div className="profile-hero__identity">
            <h1 className="profile-hero__name">
              {owner.name}
              {tutor.verificationStatus === 'verified' && (
                <span className="tutor-card__verified" title="Verified tutor">
                  <IconVerified size={20} />
                </span>
              )}
            </h1>

            {tutor.headline && <p className="profile-hero__headline">{tutor.headline}</p>}

            <div className="row row--wrap" style={{ marginTop: 10, gap: 8 }}>
              {rating.count > 0 ? (
                <RatingStars value={rating.average} showCount count={rating.count} />
              ) : (
                <span className="small muted">No reviews yet</span>
              )}
              <span className="small muted">·</span>
              <span className="small muted">
                {sessions} session{sessions === 1 ? '' : 's'} completed
              </span>
            </div>

            <div className="profile-hero__badges">
              {tutor.verificationStatus === 'verified' && (
                <span className="badge badge--success"><IconShield size={12} /> Verified tutor</span>
              )}
              {tutor.verificationStatus !== 'verified' && (
                <StatusBadge status={tutor.verificationStatus} />
              )}
              {(tutor.subjects || []).slice(0, 4).map((subject) => (
                <span className="tag" key={subject}>{subject}</span>
              ))}
              {(tutor.subjects || []).length > 4 && <span className="tag">+{tutor.subjects.length - 4}</span>}
            </div>
          </div>

          {!isOwnProfile && (
            <div className="profile-hero__actions">
              <button
                type="button"
                className={`btn btn--secondary ${isFavorite ? 'is-favorite' : ''}`}
                onClick={handleFavorite}
                style={isFavorite ? { borderColor: 'var(--danger-600)', color: 'var(--danger-600)' } : undefined}
              >
                <IconHeart size={16} filled={isFavorite} />
                {isFavorite ? 'Saved' : 'Save'}
              </button>

              <button type="button" className="btn btn--primary" onClick={() => requireStudent('tutoring')}>
                <IconChat size={16} /> Send request
              </button>

              <button type="button" className="btn btn--accent" onClick={() => requireStudent('demo')}>
                Request demo
              </button>
            </div>
          )}
        </div>

        {isOwnProfile && (
          <div className="alert alert--info" style={{ marginTop: 18 }}>
            <IconCheck size={15} />
            <span>This is your own profile. Manage it from the tutor dashboard.</span>
          </div>
        )}
      </div>

      {/* -------------------------------- body ---------------------------------- */}
      <div className="profile-grid">
        <div className="stack stack--lg">
          {tutor.about && (
            <section className="card profile-section">
              <h2 className="profile-section__title">About</h2>
              <p className="profile-section__body">{tutor.about}</p>
            </section>
          )}

          <section className="card profile-section">
            <h2 className="profile-section__title">Teaching details</h2>
            <dl className="dl">
              <dt>Subjects</dt>
              <dd>{(tutor.subjects || []).join(', ') || 'Not specified'}</dd>

              <dt>Classes taught</dt>
              <dd>{(tutor.classes || []).join(', ') || 'Not specified'}</dd>

              <dt>Experience</dt>
              <dd>{tutor.experience} {tutor.experience === 1 ? 'year' : 'years'}</dd>

              <dt>Monthly fee</dt>
              <dd>{tutor.monthlyFee > 0 ? formatINR(tutor.monthlyFee) : 'On request'}</dd>

              <dt>Hourly fee</dt>
              <dd>{tutor.hourlyFee > 0 ? formatINR(tutor.hourlyFee) : 'On request'}</dd>

              <dt>Teaching modes</dt>
              <dd>
                {(tutor.teachingModes || []).map((mode) => (
                  <span className="badge badge--neutral" key={mode} style={{ marginRight: 6 }}>
                    {mode === 'offline' ? 'In-person' : 'Online'}
                  </span>
                ))}
                {(tutor.teachingModes || []).length === 0 && 'Not specified'}
              </dd>

              <dt>Languages</dt>
              <dd>{(tutor.languages || []).join(', ') || 'Not specified'}</dd>

              <dt>Location</dt>
              <dd>{formatPlace(tutor.city, tutor.locality) || 'Multiple cities'}</dd>

              <dt>On platform since</dt>
              <dd>{formatDate(tutor.createdAt)}</dd>
            </dl>
          </section>

          {tutor.qualifications?.length > 0 && (
            <section className="card profile-section">
              <h2 className="profile-section__title">
                <IconBook size={17} /> Qualifications
              </h2>
              <div className="qualification-list">
                {tutor.qualifications.map((qual, index) => (
                  <div className="qualification-item" key={`${qual.degree}-${index}`}>
                    <div className="qualification-item__degree">{qual.degree}</div>
                    <div className="qualification-item__meta">
                      {[qual.institution, qual.year].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="card profile-section">
            <div className="row row--between" style={{ marginBottom: 14 }}>
              <h2 className="profile-section__title" style={{ marginBottom: 0 }}>
                Reviews {rating.count > 0 && <span className="muted">({rating.count})</span>}
              </h2>
              {rating.count > 0 && <RatingStars value={rating.average} />}
            </div>

            {rating.count === 0 ? (
              <EmptyState
                compact
                title="No reviews yet"
                text="This tutor has not completed a session on the platform so far."
              />
            ) : (
              <>
                <div className="rating-bars" style={{ marginBottom: 20 }}>
                  {rating.breakdown.map((row) => (
                    <div className="rating-bar-row" key={row.star}>
                      <span>{row.star} star</span>
                      <span className="progress-bar">
                        <span
                          className="progress-bar__fill"
                          style={{
                            width: `${rating.count > 0 ? (row.count / rating.count) * 100 : 0}%`,
                            display: 'block',
                          }}
                        />
                      </span>
                      <span className="rating-bar-row__count">{row.count}</span>
                    </div>
                  ))}
                </div>

                <div className="list-plain">
                  {reviews.slice(0, 8).map((review) => (
                    <div key={review.id} className="item-card">
                      <div className="row row--between" style={{ marginBottom: 8 }}>
                        <div className="row" style={{ gap: 10 }}>
                          <Avatar name={review.student?.name} size="sm" />
                          <div>
                            <div className="strong small">{review.student?.name || 'Student'}</div>
                            <div className="small muted">{formatDate(review.createdAt)}</div>
                          </div>
                        </div>
                        <RatingStars value={review.rating} size={13} />
                      </div>
                      {review.comment && <p style={{ fontSize: '0.9rem', color: 'var(--ink-600)' }}>{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        {/* ------------------------------ sidebar ------------------------------ */}
        <div className="stack">
          {match && match.reasons.length > 0 && (
            <div className="match-box">
              <div className="match-box__title">Good match because</div>
              <div className="match-box__list">
                {match.reasons.map((reason) => (
                  <div className="match-box__item" key={reason}>
                    <IconCheck size={14} />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <section className="card profile-section">
            <h2 className="profile-section__title">
              <IconClock size={17} /> Weekly availability
            </h2>
            {(tutor.availability || []).length === 0 ? (
              <p className="small muted">This tutor has not published availability yet.</p>
            ) : (
              <div className="availability-list">
                {tutor.availability.map((slot) => (
                  <div className="availability-row" key={`${slot.day}-${slot.start}`}>
                    <span className="availability-row__day">{slot.day}</span>
                    <span className="availability-row__time">
                      {formatTime(slot.start)} – {formatTime(slot.end)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card profile-section">
            <h2 className="profile-section__title">
              <IconLocation size={17} /> Teaches at
            </h2>
            <div className="tag-list">
              <span className="tag">{formatPlace(tutor.city, tutor.locality) || 'Multiple cities'}</span>
              {(tutor.teachingModes || []).map((mode) => (
                <span className="tag" key={mode}>
                  <IconVideo size={12} /> {mode === 'offline' ? 'In-person' : 'Online'}
                </span>
              ))}
            </div>
          </section>

          {!isOwnProfile && user && (
            <button
              type="button"
              className="btn btn--ghost btn--sm btn--block"
              onClick={() => setReportOpen(true)}
            >
              <IconFlag size={14} /> Report this profile
            </button>
          )}
        </div>
      </div>

      <RequestModal
        open={requestMode !== null}
        onClose={() => setRequestMode(null)}
        tutor={{ ...tutor, user: owner }}
        mode={requestMode || 'tutoring'}
        onSent={() => navigate('/student/requests')}
      />

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetUserId={owner.id}
        targetTutorId={tutor.id}
      />
    </div>
  );
}