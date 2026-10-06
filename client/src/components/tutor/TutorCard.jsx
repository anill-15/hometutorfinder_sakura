import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as tutorService from '../../services/tutorService.js';
import { toast } from '../../hooks/useToast.js';
import { formatFeeRange } from '../../utils/helpers.js';
import { formatPlace } from '../../utils/lookups.js';
import Avatar from '../common/Avatar.jsx';
import RatingStars from '../common/RatingStars.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import {
  IconVerified, IconHeart, IconLocation, IconMoney, IconBriefcase, IconVideo, IconCheck,
} from '../common/Icons.jsx';

/**
 * The main tutor listing card.
 *
 * @param {object}  props.tutor     tutor profile joined with its user record
 * @param {boolean} props.favorite  whether the viewer has saved this tutor
 * @param {object}  props.match     optional match reasons for the signed-in student
 * @param {boolean} props.compact   smaller layout, used in dashboards
 */
export default function TutorCard({ tutor, favorite = false, onFavoriteChange, match = null, compact = false }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const name = tutor.user?.name || 'Tutor';
  const rating = tutor.rating || tutorService.getRating(tutor.id);
  const place = formatPlace(tutor.city, tutor.locality);

  const handleFavorite = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast.info('Sign in to save tutors to your favourites');
      return;
    }
    if (user.role !== 'student') {
      toast.info('Only student accounts can save favourite tutors');
      return;
    }

    setBusy(true);
    const result = tutorService.toggleFavorite(user.id, tutor.id);
    setBusy(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(result.removed ? `${name} removed from favourites` : `${name} saved to favourites`);
    onFavoriteChange?.();
  };

  return (
    <article className={`tutor-card ${compact ? 'tutor-card--compact' : ''}`}>
      <div className="tutor-card__top">
        <Avatar name={name} size="lg" />
        <div className="tutor-card__info">
          <div className="tutor-card__name-row">
            <Link to={`/tutors/${tutor.id}`} className="tutor-card__name">
              {name}
            </Link>
            {tutor.verificationStatus === 'verified' && (
              <span className="tutor-card__verified" title="Verified tutor">
                <IconVerified size={16} />
              </span>
            )}
          </div>

          {tutor.headline && <p className="tutor-card__headline">{tutor.headline}</p>}

          <div className="tutor-card__ratings" style={{ marginTop: 6 }}>
            {rating.count > 0 ? (
              <>
                <RatingStars value={rating.average} />
                <span className="muted small">({rating.count})</span>
              </>
            ) : (
              <span className="small muted">No reviews yet</span>
            )}
          </div>
        </div>
      </div>

      <div className="tutor-card__body">
        {tutor.subjects?.length > 0 && (
          <div className="tag-list">
            {tutor.subjects.slice(0, 3).map((subject) => (
              <span className="tag" key={subject}>{subject}</span>
            ))}
            {tutor.subjects.length > 3 && <span className="tag">+{tutor.subjects.length - 3}</span>}
          </div>
        )}

        <div className="tutor-card__meta">
          <div className="tutor-card__meta-item">
            <span className="tutor-card__meta-icon"><IconBriefcase size={14} /></span>
            <span>{tutor.experience} {tutor.experience === 1 ? 'year' : 'years'} experience</span>
          </div>

          <div className="tutor-card__meta-item">
            <span className="tutor-card__meta-icon"><IconLocation size={14} /></span>
            <span>{place || 'Multiple cities'}</span>
          </div>

          <div className="tutor-card__meta-item">
            <span className="tutor-card__meta-icon"><IconMoney size={14} /></span>
            <span className="tutor-card__fee">{formatFeeRange(tutor)}</span>
          </div>

          {tutor.teachingModes?.length > 0 && (
            <div className="tutor-card__meta-item">
              <span className="tutor-card__meta-icon"><IconVideo size={14} /></span>
              <span className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                {tutor.teachingModes.map((mode) => (
                  <span className="badge badge--neutral" key={mode}>
                    {mode === 'offline' ? 'In-person' : 'Online'}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>

        {tutor.verificationStatus !== 'verified' && (
          <div>
            <StatusBadge status={tutor.verificationStatus} />
          </div>
        )}
      </div>

      {match && match.reasons.length > 0 && (
        <div className="tutor-card__matches">
          <div className="tutor-card__matches-title">Why this tutor matches you</div>
          <div className="tutor-card__matches-list">
            {match.reasons.slice(0, 3).map((reason) => (
              <div className="tutor-card__matches-item" key={reason}>
                <IconCheck size={13} />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tutor-card__footer">
        <Link to={`/tutors/${tutor.id}`} className="btn btn--secondary btn--sm" style={{ flex: 1 }}>
          View profile
        </Link>

        <button
          type="button"
          className={`fav-button ${favorite ? 'is-active' : ''}`}
          onClick={handleFavorite}
          disabled={busy}
          aria-pressed={favorite}
          aria-label={favorite ? `Remove ${name} from favourites` : `Save ${name} to favourites`}
          title={favorite ? 'Remove from favourites' : 'Save to favourites'}
        >
          <IconHeart size={16} filled={favorite} />
        </button>
      </div>
    </article>
  );
}