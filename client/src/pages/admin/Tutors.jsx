import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as adminService from '../../services/adminService.js';
import * as tutorService from '../../services/tutorService.js';
import { toast } from '../../hooks/useToast.js';
import { formatINR, formatDate, plural } from '../../utils/helpers.js';
import { formatPlace } from '../../utils/lookups.js';
import Avatar from '../../components/common/Avatar.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import RatingStars from '../../components/common/RatingStars.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { SearchInput } from '../../components/tutor/SearchBar.jsx';
import { IconShield, IconUser, IconCheck, IconClose } from '../../components/common/Icons.jsx';

const FILTERS = [
  { value: 'all', label: 'All tutors' },
  { value: 'pending', label: 'Awaiting verification' },
  { value: 'verified', label: 'Verified' },
];

/** `/admin/tutors` — review tutor profiles and grant or remove verification. */
export default function Tutors() {
  const [params] = useSearchParams();
  const [filter, setFilter] = useState(params.get('filter') === 'pending' ? 'pending' : 'all');
  const [search, setSearch] = useState('');
  const [reviewing, setReviewing] = useState(null); // { tutor, action }
  const [note, setNote] = useState('');
  const [confirm, setConfirm] = useState(null); // remove verification
  const [, setVersion] = useState(0);

  const tutors = adminService.listTutors();

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tutors
      .filter((t) => (filter === 'all' ? true : t.verificationStatus === filter))
      .filter((t) => {
        if (!needle) return true;
        return [t.user?.name, t.user?.email, t.headline, ...(t.subjects || [])]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(needle));
      });
  }, [tutors, filter, search]);

  const pendingCount = tutors.filter((t) => t.verificationStatus === 'pending').length;

  const closeReview = () => {
    if (!reviewing) return;

    // The service writes the change and notifies the tutor.
    const result = tutorService.setVerificationStatus(
      reviewing.tutor.id,
      reviewing.action === 'verify' ? 'verified' : 'pending',
      note,
    );

    if (!result.ok) {
      toast.error(result.error);
      setReviewing(null);
      return;
    }

    toast.success(
      reviewing.action === 'verify'
        ? `${reviewing.tutor.user?.name} verified`
        : `Verification removed from ${reviewing.tutor.user?.name}`,
    );

    setReviewing(null);
    setNote('');
    setVersion((v) => v + 1);
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Tutors &amp; verification</h1>
          <p className="dashboard-header__subtitle">
            {pendingCount > 0
              ? `${plural(pendingCount, 'tutor')} waiting for verification. Verified tutors show a badge and rank higher in search.`
              : 'No tutors are waiting for verification right now.'}
          </p>
        </div>
        {pendingCount > 0 && filter !== 'pending' && (
          <button type="button" className="btn btn--primary" onClick={() => setFilter('pending')}>
            Review {pendingCount} pending
          </button>
        )}
      </div>

      <section className="card card--pad" style={{ marginBottom: 20 }}>
        <div className="form-grid" style={{ alignItems: 'end' }}>
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <label className="field__label" htmlFor="admin-tutor-search">Search</label>
            <SearchInput value={search} onChange={setSearch} placeholder="Name, email, subject or headline" />
          </div>

          <div className="field">
            <span className="field__label">Verification</span>
            <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
              {FILTERS.map((option) => (
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
          icon={<IconShield size={24} />}
          title="No tutors match this filter"
          text="Try a different verification filter or clear the search box."
        />
      ) : (
        <div className="stack">
          {visible.map((tutor) => (
            <article className="item-card" key={tutor.id}>
              <div className="row row--between row--wrap" style={{ gap: 16, marginBottom: 14 }}>
                <div className="row row--start" style={{ gap: 13, minWidth: 0, flex: 1 }}>
                  <Avatar name={tutor.user?.name} size="lg" />
                  <div style={{ minWidth: 0 }}>
                    <div className="item-card__title row" style={{ gap: 8 }}>
                      {tutor.user?.name || 'Unknown'}
                      <StatusBadge status={tutor.verificationStatus} />
                      {tutor.user?.status === 'suspended' && <StatusBadge status="suspended" />}
                    </div>
                    <div className="item-card__subtitle">{tutor.headline || 'No headline yet'}</div>
                    <div className="item-card__meta" style={{ margin: '8px 0 0' }}>
                      <span className="item-card__meta-item">{tutor.user?.email}</span>
                      <span className="item-card__meta-item">
                        {formatPlace(tutor.city, tutor.locality) || 'Location not set'}
                      </span>
                      <span className="item-card__meta-item">Joined {formatDate(tutor.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="btn-group">
                  {tutor.verificationStatus === 'verified' ? (
                    <button
                      type="button"
                      className="btn btn--danger-ghost btn--sm"
                      onClick={() => {
                        setNote('');
                        setConfirm(tutor);
                      }}
                    >
                      <IconClose size={14} /> Remove verification
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={() => {
                          setNote('');
                          setReviewing({ tutor, action: 'verify' });
                        }}
                      >
                        <IconCheck size={14} /> Verify
                      </button>
                      {/* Only meaningful once a tutor has been verified before,
                          otherwise there is no badge to take away. */}
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => {
                          setNote('');
                          setReviewing({ tutor, action: 'reject' });
                        }}
                        disabled={!tutor.verifiedAt}
                        title={tutor.verifiedAt
                          ? 'Remove the verified badge and tell the tutor why'
                          : 'This tutor is not verified, so there is no badge to remove'}
                      >
                        Send back
                      </button>
                    </>
                  )}
                  <Link to={`/tutors/${tutor.id}`} className="btn btn--ghost btn--sm">
                    <IconUser size={14} /> Profile
                  </Link>
                </div>
              </div>

              <dl className="dl">
                <dt>Subjects</dt>
                <dd>{(tutor.subjects || []).join(', ') || 'Not added'}</dd>

                <dt>Classes</dt>
                <dd>{(tutor.classes || []).join(', ') || 'Not added'}</dd>

                <dt>Experience</dt>
                <dd>{tutor.experience} year{tutor.experience === 1 ? '' : 's'}</dd>

                <dt>Fees</dt>
                <dd>
                  {tutor.monthlyFee > 0 && `${formatINR(tutor.monthlyFee)}/month`}
                  {tutor.monthlyFee > 0 && tutor.hourlyFee > 0 && ' · '}
                  {tutor.hourlyFee > 0 && `${formatINR(tutor.hourlyFee)}/hour`}
                  {tutor.monthlyFee === 0 && tutor.hourlyFee === 0 && 'Not set'}
                </dd>

                <dt>Teaching modes</dt>
                <dd>{(tutor.teachingModes || []).join(', ') || 'Not set'}</dd>

                <dt>Qualifications</dt>
                <dd>
                  {(tutor.qualifications || []).length > 0
                    ? tutor.qualifications.map((q) => q.degree).join(' · ')
                    : 'None listed'}
                </dd>

                <dt>Availability</dt>
                <dd>
                  {(tutor.availability || []).length} day{(tutor.availability || []).length === 1 ? '' : 's'} published
                </dd>

                <dt>Rating</dt>
                <dd>
                  {tutor.rating.count > 0 ? (
                    <span className="row" style={{ gap: 6 }}>
                      <RatingStars value={tutor.rating.average} size={13} />
                      <span className="small muted">({tutor.rating.count})</span>
                    </span>
                  ) : (
                    'No reviews'
                  )}
                </dd>

                <dt>Activity</dt>
                <dd>
                  {plural(tutor.sessions, 'completed session')} · {plural(tutor.applications, 'application')}
                </dd>
              </dl>

              {(tutor.subjects || []).length === 0 && (
                <div className="alert alert--warning" style={{ marginTop: 12 }}>
                  <span>
                    This tutor has not added any subjects yet, so families cannot find them in search.
                  </span>
                </div>
              )}

              {!tutor.verifiedAt && tutor.verificationStatus !== 'verified' && (
                <div className="alert alert--info" style={{ marginTop: 12 }}>
                  <span>
                    This profile has never been verified, so &ldquo;Send back&rdquo; is disabled — there is
                    no badge to remove. Verify it, or ask the tutor to complete their profile.
                  </span>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* --------------------------- review dialog --------------------------- */}
      <Modal
        open={reviewing !== null}
        onClose={() => setReviewing(null)}
        title={reviewing?.action === 'verify' ? 'Verify this tutor' : 'Send this profile back'}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={() => setReviewing(null)}>
              Cancel
            </button>
            <button
              type="button"
              className={`btn btn--${reviewing?.action === 'verify' ? 'primary' : 'danger'}`}
              onClick={closeReview}
            >
              {reviewing?.action === 'verify' ? 'Verify tutor' : 'Remove verification'}
            </button>
          </>
        }
      >
        {reviewing && (
          <div className="stack">
            <div className="row" style={{ gap: 11 }}>
              <Avatar name={reviewing.tutor.user?.name} size="sm" />
              <div>
                <div className="strong small">{reviewing.tutor.user?.name}</div>
                <div className="small muted">
                  {(reviewing.tutor.subjects || []).slice(0, 3).join(', ') || 'No subjects listed'}
                </div>
              </div>
            </div>

            <dl className="dl">
              <dt>Qualifications</dt>
              <dd>
                {(reviewing.tutor.qualifications || []).length > 0
                  ? reviewing.tutor.qualifications.map((q) => `${q.degree}${q.year ? ` (${q.year})` : ''}`).join(' · ')
                  : 'None listed'}
              </dd>
              <dt>Experience</dt>
              <dd>{reviewing.tutor.experience} years</dd>
              <dt>Location</dt>
              <dd>{formatPlace(reviewing.tutor.city, reviewing.tutor.locality) || 'Not set'}</dd>
            </dl>

            <div className="field">
              <label className="field__label" htmlFor="field-verify-note">
                {reviewing.action === 'verify' ? 'Note (optional)' : 'Reason for the tutor'}
              </label>
              <textarea
                id="field-verify-note"
                className="textarea"
                rows={3}
                maxLength={300}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={
                  reviewing.action === 'verify'
                    ? 'Example: Qualification documents checked.'
                    : 'Example: Degree certificate year could not be confirmed. Please update and resubmit.'
                }
              />
              <span className="field__hint">The tutor sees this message in their notifications.</span>
            </div>

            {reviewing.action === 'verify' && (
              <div className="alert alert--info">
                <IconShield size={15} />
                <span>
                  The tutor will receive a notification and their profile will show a verified badge
                  in search results.
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirm !== null}
        title="Remove verification?"
        message={`${confirm?.user?.name || 'This tutor'} will lose the verified badge. They will be notified and can be verified again later.`}
        confirmLabel="Remove verification"
        cancelLabel="Keep verified"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const result = tutorService.setVerificationStatus(confirm.id, 'pending', note);
          if (!result.ok) toast.error(result.error);
          else toast.info(`Verification removed from ${confirm.user?.name}`);
          setConfirm(null);
          setVersion((v) => v + 1);
        }}
      />
    </div>
  );
}