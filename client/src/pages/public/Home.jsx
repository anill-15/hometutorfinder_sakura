import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as tutorService from '../../services/tutorService.js';
import * as requirementService from '../../services/requirementService.js';
import { plural } from '../../utils/helpers.js';
import { formatPlace, cityOptions } from '../../utils/lookups.js';
import TutorCard from '../../components/tutor/TutorCard.jsx';
import Avatar from '../../components/common/Avatar.jsx';
import RatingStars from '../../components/common/RatingStars.jsx';
import {
  IconSearch, IconCheck, IconShield, IconMoney, IconCalendar, IconChat, IconStar,
  IconUsers, IconSparkle,
} from '../../components/common/Icons.jsx';

/** Short, stable initials for a subject tile. */
const SUBJECT_ICON = {
  Mathematics: '∑',
  Physics: 'π',
  Chemistry: '⚗',
  Biology: '⚕',
  English: 'A',
  'Computer Science': '{ }',
  Hindi: 'अ',
  'Social Science': '◎',
  Economics: '₹',
  Statistics: 'σ',
};

const SUBJECT_TILES = [
  'Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science', 'Biology',
  'Social Science', 'Economics', 'Hindi', 'Statistics', 'Geography', 'Information Technology',
];

const STEPS = [
  {
    title: 'Tell us what you need',
    text: 'Post a tuition requirement with the subject, class, budget and the days and times that suit you.',
  },
  {
    title: 'Compare tutors',
    text: 'Browse verified profiles with real fees, weekly availability, qualifications and student reviews.',
  },
  {
    title: 'Request a demo class',
    text: 'Send a request or book a trial class first. No long commitment before you have met.',
  },
  {
    title: 'Start regular tuition',
    text: 'Once a tutor accepts, agree on timings and keep everything tracked on one screen.',
  },
];

const FEATURES = [
  {
    icon: IconShield,
    title: 'Verification you can check',
    text: 'Every tutor profile lists qualifications, experience and teaching modes. Verified tutors carry a visible badge.',
  },
  {
    icon: IconMoney,
    title: 'Fees shown up front',
    text: 'Monthly and hourly fees are published on each profile, so comparisons are meaningful before you contact anyone.',
  },
  {
    icon: IconCalendar,
    title: 'Weekly availability',
    text: 'Tutors publish the days and time windows they can teach, so you only request slots that actually work.',
  },
  {
    icon: IconStar,
    title: 'Reviews from real sessions',
    text: 'Only a student in a completed session can review a tutor, which keeps ratings meaningful.',
  },
  {
    icon: IconChat,
    title: 'Requests and demo classes',
    text: 'Send a tuition request or ask for a demo class. Both sides see the status at every step.',
  },
  {
    icon: IconUsers,
    title: 'Tutors find work too',
    text: 'Tutors can browse open requirements, apply with a short message and build a regular student base.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'We compared six tutors on fees and availability in one evening and booked a demo the next morning. The availability list made the decision much easier than word of mouth.',
    name: 'Meenakshi Sharma',
    role: 'Parent, Bangalore',
  },
  {
    quote: 'As a tutor I use the open requirements board to find regular students near my area instead of waiting for phone calls. Being able to publish my weekly timings saves a lot of back and forth.',
    name: 'Rohit Verma',
    role: 'Physics tutor, Bangalore',
  },
  {
    quote: 'The review system is what convinced me. Ratings only appear after a completed session, so it does not feel like marketing.',
    name: 'Sneha Kulkarni',
    role: 'Parent, Hyderabad',
  },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [subject, setSubject] = useState('');
  const [city, setCity] = useState('');

  const allTutors = tutorService.listTutorsWithUsers().filter((t) => t.user);
  const openRequirements = requirementService.listRequirements({ includeClosed: false });
  const featured = [...allTutors]
    .sort((a, b) => {
      const ra = tutorService.getRating(a.id).average;
      const rb = tutorService.getRating(b.id).average;
      return rb - ra || b.experience - a.experience;
    })
    .slice(0, 4);

  const favouriteIds = new Set(
    user?.role === 'student' ? tutorService.listFavorites(user.id).map((f) => f.tutorId) : [],
  );

  const subjectCounts = SUBJECT_TILES.reduce((acc, subjectName) => {
    acc[subjectName] = allTutors.filter((t) => (t.subjects || []).includes(subjectName)).length;
    return acc;
  }, {});

  // Builds the /tutors query string from the hero search fields.
  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('search', keyword.trim());
    if (subject) params.set('subject', subject);
    if (city) params.set('city', city);
    return `/tutors${params.toString() ? `?${params}` : ''}`;
  };

  return (
    <>
      {/* ------------------------------ hero ------------------------------ */}
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <span className="hero__eyebrow">
              <IconSparkle size={13} /> Verified tutors in {cityOptions().length} cities
            </span>

            <h1 className="hero__title">
              Find the right tutor for your <em>learning journey</em>
            </h1>

            <p className="hero__text">
              Search tutors by subject, class, budget and location. Compare real fees, weekly
              availability and verified reviews, then request a demo class before you commit.
            </p>

            <div className="hero__search">
              <div className="hero__search-row">
                <div className="field">
                  <label className="field__label" htmlFor="hero-search">What do you want to learn?</label>
                  <div className="search-input">
                    <span className="search-input__icon"><IconSearch size={17} /></span>
                    <input
                      id="hero-search"
                      type="search"
                      className="input"
                      value={keyword}
                      onChange={(event) => setKeyword(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') navigate(buildSearchUrl());
                      }}
                      placeholder="Subject or tutor name"
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="hero-subject">Subject</label>
                  <select
                    id="hero-subject"
                    className="select"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                  >
                    <option value="">Any subject</option>
                    {SUBJECT_TILES.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <Link className="btn btn--primary btn--lg" to={buildSearchUrl()}>
                  <IconSearch size={17} /> Search
                </Link>
              </div>

              <div className="hero__search-row" style={{ gridTemplateColumns: '1fr', marginTop: 4 }}>
                <div className="field">
                  <label className="field__label" htmlFor="hero-city">Where?</label>
                  <select
                    id="hero-city"
                    className="select"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                  >
                    <option value="">Any city</option>
                    {cityOptions().map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="hero__meta">
              <span className="hero__meta-item"><IconCheck size={15} /> No middlemen</span>
              <span className="hero__meta-item"><IconCheck size={15} /> Demo class option</span>
              <span className="hero__meta-item"><IconCheck size={15} /> Reviews after completed sessions</span>
            </div>
          </div>

          <div className="hero__panel">
            <div className="hero__panel-grid">
              <div className="hero__panel-stat">
                <div className="hero__panel-stat-value">{allTutors.length}</div>
                <div className="hero__panel-stat-label">Tutors listed</div>
              </div>
              <div className="hero__panel-stat">
                <div className="hero__panel-stat-value">{openRequirements.length}</div>
                <div className="hero__panel-stat-label">Open requirements</div>
              </div>
              <div className="hero__panel-stat">
                <div className="hero__panel-stat-value">
                  {allTutors.filter((t) => t.verificationStatus === 'verified').length}
                </div>
                <div className="hero__panel-stat-label">Verified tutors</div>
              </div>
              <div className="hero__panel-stat">
                <div className="hero__panel-stat-value">
                  {cityOptions().length}
                </div>
                <div className="hero__panel-stat-label">Cities covered</div>
              </div>
            </div>

            <div className="field__label" style={{ marginBottom: 10 }}>Top rated this week</div>
            <div className="hero__panel-list">
              {featured.slice(0, 3).map((tutor) => {
                const rating = tutorService.getRating(tutor.id);
                return (
                  <Link
                    key={tutor.id}
                    to={`/tutors/${tutor.id}`}
                    className="hero__panel-item"
                    style={{ color: 'inherit' }}
                  >
                    <Avatar name={tutor.user.name} size="sm" />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="hero__panel-item-name">{tutor.user.name}</div>
                      <div className="hero__panel-item-meta">
                        {tutor.subjects.slice(0, 2).join(', ')} · {formatPlace(tutor.city, tutor.locality)}
                      </div>
                    </div>
                    {rating.count > 0 && (
                      <span className="row" style={{ gap: 4, flexShrink: 0 }}>
                        <IconStar size={12} filled />
                        <span className="small strong">{rating.average.toFixed(1)}</span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------- subject tiles -------------------------- */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <h2>Popular subjects</h2>
            <p>Jump straight to tutors for the subjects most families look for.</p>
          </div>

          <div className="subject-grid">
            {SUBJECT_TILES.map((item) => (
              <Link key={item} to={`/tutors?subject=${encodeURIComponent(item)}`} className="subject-tile">
                <span className="subject-tile__icon" aria-hidden="true">{SUBJECT_ICON[item] || item[0]}</span>
                <span>
                  <span className="subject-tile__name">{item}</span>
                  <span className="subject-tile__count">
                    {plural(subjectCounts[item] || 0, 'tutor')}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------- featured tutors ------------------------ */}
      <section className="section">
        <div className="container">
          <div className="row row--between row--wrap" style={{ marginBottom: 26 }}>
            <div>
              <h2>Featured tutors</h2>
              <p className="muted" style={{ marginTop: 6 }}>
                Highly rated tutors with published availability.
              </p>
            </div>
            <Link className="btn btn--secondary" to="/tutors">View all tutors</Link>
          </div>

          <div className="grid grid--cards">
            {featured.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                favorite={favouriteIds.has(tutor.id)}
                match={
                  user?.role === 'student'
                    ? tutorService.matchReasons(tutor, user)
                    : null
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- how it works -------------------------- */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <h2>How it works</h2>
            <p>Four steps from a requirement to regular tuition.</p>
          </div>

          <div className="steps-grid">
            {STEPS.map((step, index) => (
              <div className="step" key={step.title}>
                <div className="step__number">{index + 1}</div>
                <h3 className="step__title">{step.title}</h3>
                <p className="step__text">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- why choose --------------------------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Why families choose this platform</h2>
            <p>Built around the information families actually need before choosing a tutor.</p>
          </div>

          <div className="feature-grid">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div className="feature" key={feature.title}>
                  <div className="feature__icon"><Icon size={19} /></div>
                  <h3 className="feature__title">{feature.title}</h3>
                  <p className="feature__text">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------- testimonials ------------------------- */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <h2>What families say</h2>
            <p>Feedback from students and tutors using the platform.</p>
          </div>

          <div className="testimonial-grid">
            {TESTIMONIALS.map((item) => (
              <div className="testimonial" key={item.name}>
                <RatingStars value={5} />
                <p className="testimonial__quote">“{item.quote}”</p>
                <div className="testimonial__author">
                  <Avatar name={item.name} size="sm" />
                  <div>
                    <div className="testimonial__name">{item.name}</div>
                    <div className="testimonial__role">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- CTAs ------------------------------ */}
      <section className="section">
        <div className="container stack stack--lg">
          <div className="cta">
            <h2>Looking for a tutor?</h2>
            <p>
              Post your requirement and let tutors come to you, or search the directory yourself.
              Both paths are free and take a couple of minutes.
            </p>
            <div className="btn-group" style={{ justifyContent: 'center' }}>
              <Link className="btn btn--accent btn--lg" to="/register">Create a student account</Link>
              <Link className="btn btn--secondary btn--lg" to="/tutors">Browse tutors</Link>
            </div>
          </div>

          <div className="cta" style={{ background: 'var(--brand-900)' }}>
            <h2>Are you a tutor?</h2>
            <p>
              Create a profile with your subjects, qualifications and fees, publish your weekly
              availability, and apply to requirements near you.
            </p>
            <div className="btn-group" style={{ justifyContent: 'center' }}>
              <Link className="btn btn--accent btn--lg" to="/register">Create a tutor account</Link>
              <Link className="btn btn--secondary btn--lg" to="/requirements">See open requirements</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

