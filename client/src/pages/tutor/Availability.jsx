import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as tutorService from '../../services/tutorService.js';
import { toast } from '../../hooks/useToast.js';
import AvailabilityEditor from '../../components/tutor/AvailabilityEditor.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { formatTime } from '../../utils/helpers.js';
import { IconCalendar, IconCheck, IconInfo } from '../../components/common/Icons.jsx';

/** `/tutor/availability` — weekly availability editor. */
export default function Availability() {
  const { user } = useAuth();
  const [, setVersion] = useState(0);

  const profile = tutorService.getProfileByUserId(user.id);

  if (!profile) {
    return (
      <EmptyState
        icon={<IconCalendar size={24} />}
        title="Create your profile first"
        text="Availability is part of your tutor listing. Add your subjects, fees and location before setting the days you can teach."
        action={<Link className="btn btn--primary" to="/tutor/profile">Create my profile</Link>}
      />
    );
  }

  const slots = profile.availability || [];

  const handleSave = (next) => {
    const result = tutorService.saveAvailability(profile.id, next);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('Availability saved — students can now see your free slots');
    setVersion((v) => v + 1);
  };

  const enabledDays = slots.length;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Weekly availability</h1>
          <p className="dashboard-header__subtitle">
            Students see these timings on your profile and use them when they request a class.
          </p>
        </div>
        {profile && (
          <Link to={`/tutors/${profile.id}`} className="btn btn--secondary">View public profile</Link>
        )}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 22, alignItems: 'start' }}>
        <section className="card card--pad-lg">
          <AvailabilityEditor initial={slots} onSave={handleSave} />
        </section>

        <aside className="stack">
          <section className="card card--pad">
            <h2 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Currently published</h2>

            {enabledDays === 0 ? (
              <p className="small muted">
                You have not published any timings yet. Students cannot see when you are free until
                you save at least one day.
              </p>
            ) : (
              <>
                <div className="availability-list">
                  {slots.map((slot) => (
                    <div className="availability-row" key={`${slot.day}-${slot.start}`}>
                      <span className="availability-row__day">{slot.day}</span>
                      <span className="availability-row__time">
                        {formatTime(slot.start)} – {formatTime(slot.end)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="small muted" style={{ marginTop: 12 }}>
                  {enabledDays} day{enabledDays === 1 ? '' : 's'} available per week.
                </p>
              </>
            )}
          </section>

          <div className="alert alert--info">
            <IconInfo size={15} />
            <span>
              Publishing realistic availability reduces reschedules. Tutors with published timings
              receive noticeably more accepted requests.
            </span>
          </div>

          {enabledDays > 0 && (
            <div className="alert alert--success">
              <IconCheck size={15} />
              <span>
                Students searching for a {profile.subjects?.[0] || 'subject'} in your area will see
                these slots when they compare you.
              </span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}