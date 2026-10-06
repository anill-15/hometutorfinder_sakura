import { Link } from 'react-router-dom';
import * as tutorService from '../../services/tutorService.js';
import { CITIES, SUBJECTS } from '../../utils/lookups.js';
import { IconCheck, IconSearch, IconShield, IconCalendar, IconMoney, IconChat, IconStar, IconBriefcase } from '../../components/common/Icons.jsx';

const FOR_STUDENTS = [
  'Search tutors by subject, class, city, fees, experience, language and availability.',
  'Save tutors to favourites and compare them side by side before you contact anyone.',
  'Post a tuition requirement once and let tutors apply to you.',
  'Request a demo class before committing to a monthly plan.',
  'Track every request from pending to completed, and review the tutor afterwards.',
];

const FOR_TUTORS = [
  'Publish a profile with your subjects, qualifications, fees and teaching modes.',
  'Show your weekly availability so students request times you actually work.',
  'Browse open requirements and apply with a short message about the work.',
  'Accept or decline student requests, and mark sessions complete when finished.',
  'Build a rating from reviews that only completed students can write.',
];

export default function About() {
  const tutors = tutorService.listTutorsWithUsers().filter((t) => t.user);
  const verified = tutors.filter((t) => t.verificationStatus === 'verified').length;

  return (
    <>
      <section className="page-hero-strip">
        <div className="container">
          <div className="split">
            <div>
              <h1>About Home Tutor Finder</h1>
              <p className="muted" style={{ marginTop: 8, maxWidth: 640 }}>
                A college demo of a marketplace that connects students and parents with home tutors.
                The goal is simple: give families the information they need to choose a tutor with
                confidence, and give teachers a reliable way to find regular tuition work.
              </p>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <Link className="btn btn--primary" to="/tutors">
                <IconSearch size={16} /> Find a tutor
              </Link>
              <Link className="btn btn--secondary" to="/register">Create an account</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container page">
        <div className="stack stack--lg">
          <div className="grid grid--stats">
            <div className="stat-card">
              <div className="stat-card__label">Tutors listed</div>
              <div className="stat-card__value">{tutors.length}</div>
              <div className="stat-card__hint">Across {CITIES.length} cities</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Verified tutors</div>
              <div className="stat-card__value">{verified}</div>
              <div className="stat-card__hint">Qualifications reviewed by an administrator</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Subjects covered</div>
              <div className="stat-card__value">{SUBJECTS.length}</div>
              <div className="stat-card__hint">School, board and competitive subjects</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Demo project</div>
              <div className="stat-card__value">Local</div>
              <div className="stat-card__hint">No server, no data leaves your browser</div>
            </div>
          </div>

          <div className="grid grid--2">
            <section className="card card--pad">
              <h2 style={{ marginBottom: 8 }}>For students and parents</h2>
              <p className="muted small" style={{ marginBottom: 16 }}>
                Everything you need to shortlist and start tuition.
              </p>
              <div className="checklist">
                {FOR_STUDENTS.map((item) => (
                  <div className="checklist__item" key={item}>
                    <IconCheck size={15} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card card--pad">
              <h2 style={{ marginBottom: 8 }}>For tutors</h2>
              <p className="muted small" style={{ marginBottom: 16 }}>
                Find students without chasing referrals.
              </p>
              <div className="checklist">
                {FOR_TUTORS.map((item) => (
                  <div className="checklist__item" key={item}>
                    <IconCheck size={15} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="card card--pad">
            <h2 style={{ marginBottom: 16 }}>How the platform is put together</h2>
            <div className="grid grid--3">
              <div>
                <div className="feature__icon"><IconShield size={18} /></div>
                <h3 className="feature__title">Verification</h3>
                <p className="feature__text">
                  Tutors submit their qualifications and experience. An administrator reviews each
                  profile and grants or removes the verified badge.
                </p>
              </div>
              <div>
                <div className="feature__icon"><IconCalendar size={18} /></div>
                <h3 className="feature__title">Availability</h3>
                <p className="feature__text">
                  Tutors publish the days and time windows they can teach. Students see those before
                  sending a request, which reduces rescheduling.
                </p>
              </div>
              <div>
                <div className="feature__icon"><IconMoney size={18} /></div>
                <h3 className="feature__title">Transparent fees</h3>
                <p className="feature__text">
                  Monthly and hourly fees sit on the profile, so you can compare tutors on cost and
                  not just on a headline rate.
                </p>
              </div>
              <div>
                <div className="feature__icon"><IconBriefcase size={18} /></div>
                <h3 className="feature__title">Requirements</h3>
                <p className="feature__text">
                  Families post what they need once, and tutors apply with a short message. The
                  student chooses who to shortlist.
                </p>
              </div>
              <div>
                <div className="feature__icon"><IconChat size={18} /></div>
                <h3 className="feature__title">Requests and demos</h3>
                <p className="feature__text">
                  Every request follows the same path: pending, accepted or declined, then completed.
                  Both sides can see exactly where things stand.
                </p>
              </div>
              <div>
                <div className="feature__icon"><IconStar size={18} /></div>
                <h3 className="feature__title">Honest reviews</h3>
                <p className="feature__text">
                  Only the student in a completed session can leave a review, and one review is
                  allowed per session. Ratings are therefore tied to real work.
                </p>
              </div>
            </div>
          </section>

          <section className="card card--pad">
            <h2 style={{ marginBottom: 12 }}>About this demo</h2>
            <p className="muted" style={{ lineHeight: 1.7 }}>
              This is a college project, not a commercial product. It runs entirely in the browser:
              React with React Router on the front end, and browser localStorage as the database.
              There is no backend server, no payment integration and no email or SMS delivery —
              notifications appear inside the app instead. Demo accounts are created automatically on
              first launch so the student, tutor and admin flows can be explored right away.
            </p>
            <p className="muted" style={{ lineHeight: 1.7, marginTop: 12 }}>
              Because storage is local to your browser, clearing site data resets everything. That
              makes it easy to re-run the workflows during a demonstration.
            </p>
            <div className="btn-group" style={{ marginTop: 18 }}>
              <Link className="btn btn--primary" to="/login">Sign in to a demo account</Link>
              <Link className="btn btn--secondary" to="/contact">Contact</Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}