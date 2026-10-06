/**
 * tutorService.js
 * ---------------------------------------------------------------------------
 * Reads and writes tutor profiles, availability, favourites and reviews.
 * Also holds the transparent match-reason helper used on tutor cards.
 */

import {
  getAll, addItem, updateItem, deleteItem, findById, where, KEYS,
} from '../utils/storage.js';
import {
  clamp, average, matchesSearch, normalise, sortByNumber,
} from '../utils/helpers.js';
import { notify } from './notificationService.js';
import { cityName } from '../utils/lookups.js';

/* ------------------------------------------------------------------ */
/* Lookups                                                            */
/* ------------------------------------------------------------------ */

/** Every tutor profile joined with its user record. */
export function listTutorsWithUsers() {
  const users = getAll(KEYS.users);
  return getAll(KEYS.tutors).map((tutor) => ({
    ...tutor,
    user: users.find((u) => u.id === tutor.userId) || null,
  }));
}

export function getTutorProfile(tutorId) {
  return findById(KEYS.tutors, tutorId);
}

/** The profile belonging to a user id (what a logged-in tutor sees). */
export function getProfileByUserId(userId) {
  return getAll(KEYS.tutors).find((t) => t.userId === userId) || null;
}

/** Average rating + review count for a tutor profile. */
export function getRating(tutorId) {
  const reviews = where(KEYS.reviews, (r) => r.tutorId === tutorId);
  return {
    average: average(reviews.map((r) => r.rating)),
    count: reviews.length,
    reviews: reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  };
}

/** How many sessions a tutor has delivered. */
export function completedSessions(tutorUserId) {
  return getAll(KEYS.requests).filter(
    (r) => r.tutorUserId === tutorUserId && r.status === 'completed',
  ).length;
}

/* ------------------------------------------------------------------ */
/* Profile write operations                                           */
/* ------------------------------------------------------------------ */

/** Creates the tutor profile for a newly registered tutor. */
export function ensureProfile(userId) {
  const existing = getProfileByUserId(userId);
  if (existing) return existing;
  return addItem(KEYS.tutors, {
    userId,
    headline: '',
    about: '',
    subjects: [],
    classes: [],
    qualifications: [],
    experience: 0,
    hourlyFee: 0,
    monthlyFee: 0,
    teachingModes: [],
    languages: [],
    verificationStatus: 'pending',
    availability: [],
  });
}

/**
 * Saves the tutor's profile form.
 * @param {string} tutorId
 * @param {object} form
 * @param {object} [user] signed-in user; when given it must own this profile
 * @returns {{ok: true, tutor: object} | {ok: false, error: string, field?: string}}
 */
export function saveProfile(tutorId, form, user = null) {
  const tutor = findById(KEYS.tutors, tutorId);
  if (!tutor) return { ok: false, error: 'Tutor profile not found' };
  if (user && tutor.userId !== user.id) {
    return { ok: false, error: 'You can only edit your own tutor profile' };
  }

  const monthlyFee = Number(form.monthlyFee) || 0;
  const hourlyFee = Number(form.hourlyFee) || 0;
  const experience = Number(form.experience) || 0;

  if (monthlyFee < 0 || hourlyFee < 0) {
    return { ok: false, error: 'Fees cannot be negative', field: 'monthlyFee' };
  }
  if (experience < 0 || experience > 60) {
    return { ok: false, error: 'Experience must be between 0 and 60 years', field: 'experience' };
  }
  if (!Array.isArray(form.subjects) || form.subjects.length === 0) {
    return { ok: false, error: 'Add at least one subject you teach', field: 'subjects' };
  }

  const qualifications = (Array.isArray(form.qualifications) ? form.qualifications : [])
    .filter((q) => q && q.degree)
    .slice(0, 8)
    .map((q) => ({
      degree: clamp(q.degree, 80),
      institution: clamp(q.institution, 100),
      year: Number(q.year) || '',
    }));

  const updated = updateItem(KEYS.tutors, tutorId, {
    headline: clamp(form.headline, 140),
    about: clamp(form.about, 1500),
    subjects: form.subjects,
    classes: Array.isArray(form.classes) ? form.classes : [],
    qualifications,
    experience,
    hourlyFee,
    monthlyFee,
    teachingModes: Array.isArray(form.teachingModes) ? form.teachingModes : [],
    languages: Array.isArray(form.languages) ? form.languages : [],
  });

  return { ok: true, tutor: updated };
}

/** Updates the city / locality shown on a tutor profile. */
export function saveLocation(tutorId, { city, locality }) {
  return updateItem(KEYS.tutors, tutorId, { city, locality: clamp(locality, 60) });
}

/**
 * Keeps the linked user account in step with the tutor profile, so the name and
 * location shown everywhere in the app stay consistent.
 */
export function syncAccount(tutorId, { name, city, locality }) {
  const tutor = findById(KEYS.tutors, tutorId);
  if (!tutor) return null;
  const patch = {};
  if (name !== undefined) patch.name = clamp(name, 80);
  if (city !== undefined) patch.city = city || null;
  if (locality !== undefined) patch.locality = clamp(locality, 60);
  if (Object.keys(patch).length === 0) return null;
  return updateItem(KEYS.users, tutor.userId, patch);
}

/**
 * Admin-only: changes verification status.
 * Notifies the tutor either way, so the change is never silent.
 */
export function setVerificationStatus(tutorId, status, adminNote = '') {
  if (!['verified', 'pending'].includes(status)) {
    return { ok: false, error: 'Verification status must be verified or pending' };
  }
  const tutor = findById(KEYS.tutors, tutorId);
  if (!tutor) return { ok: false, error: 'Tutor profile not found' };
  if (tutor.verificationStatus === status) {
    return { ok: false, error: `This tutor is already ${status}` };
  }

  const updated = updateItem(KEYS.tutors, tutorId, {
    verificationStatus: status,
    verificationNote: clamp(adminNote, 300),
    verifiedAt: status === 'verified' ? new Date().toISOString() : null,
  });
  if (!updated) return { ok: false, error: 'Tutor profile not found' };

  notify(tutor.userId, {
    type: 'tutor_verified',
    title: status === 'verified' ? 'Your tutor profile is verified' : 'Verification removed',
    message:
      status === 'verified'
        ? 'You now carry a verified badge and rank higher in student search results.'
        : adminNote
          ? `Reason given: ${adminNote}`
          : 'Your profile needs attention before it can be verified again.',
    link: '/tutor/profile',
  });

  return { ok: true, tutor: updated };
}

/* ------------------------------------------------------------------ */
/* Availability                                                       */
/* ------------------------------------------------------------------ */

/**
 * Replaces a tutor's weekly availability.
 * @param {string} tutorId
 * @param {Array<{day: string, enabled: boolean, start: string, end: string}>} slots
 */
export function saveAvailability(tutorId, slots) {
  const tutor = findById(KEYS.tutors, tutorId);
  if (!tutor) return { ok: false, error: 'Tutor profile not found' };

  const cleaned = slots
    .filter((slot) => slot.enabled && slot.start && slot.end)
    .map((slot) => ({
      id: slot.id || `avail_${tutorId}_${slot.day}`,
      day: slot.day,
      start: slot.start,
      end: slot.end,
    }));

  if (cleaned.length === 0) {
    return { ok: false, error: 'Enable at least one day before saving', field: 'availability' };
  }

  const invalid = cleaned.find((slot) => slot.start >= slot.end);
  if (invalid) {
    return { ok: false, error: `${invalid.day}: end time must be later than the start time`, field: invalid.day };
  }

  updateItem(KEYS.tutors, tutorId, { availability: cleaned });
  return { ok: true, availability: cleaned };
}

/* ------------------------------------------------------------------ */
/* Favourites                                                         */
/* ------------------------------------------------------------------ */

export function listFavorites(studentId) {
  const tutors = getAll(KEYS.tutors);
  const users = getAll(KEYS.users);
  return where(KEYS.favorites, (f) => f.studentId === studentId)
    .map((fav) => {
      const tutor = tutors.find((t) => t.id === fav.tutorId);
      if (!tutor) return null;
      return {
        ...fav,
        tutor,
        user: users.find((u) => u.id === tutor.userId) || null,
        rating: getRating(tutor.id),
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function isFavorite(studentId, tutorId) {
  if (!studentId) return false;
  return getAll(KEYS.favorites).some((f) => f.studentId === studentId && f.tutorId === tutorId);
}

function addFavorite(studentId, tutorId) {
  if (!studentId) return { ok: false, error: 'Please sign in to save tutors' };
  if (!findById(KEYS.tutors, tutorId)) return { ok: false, error: 'Tutor not found' };
  if (isFavorite(studentId, tutorId)) return { ok: true, alreadyExists: true };
  addItem(KEYS.favorites, { studentId, tutorId });
  return { ok: true };
}

function removeFavorite(studentId, tutorId) {
  const fav = getAll(KEYS.favorites).find((f) => f.studentId === studentId && f.tutorId === tutorId);
  if (!fav) return { ok: false, error: 'This tutor is not in your favourites' };
  deleteItem(KEYS.favorites, fav.id);
  return { ok: true };
}

export function toggleFavorite(studentId, tutorId) {
  return isFavorite(studentId, tutorId)
    ? { ...removeFavorite(studentId, tutorId), removed: true }
    : { ...addFavorite(studentId, tutorId), removed: false };
}

/* ------------------------------------------------------------------ */
/* Search                                                             */
/* ------------------------------------------------------------------ */

const EMPTY_FILTERS = {
  search: '',
  subject: '',
  classLevel: '',
  city: '',
  locality: '',
  mode: '',
  language: '',
  feeMin: '',
  feeMax: '',
  experienceMin: '',
  ratingMin: '',
  verifiedOnly: false,
};

/**
 * Filters, searches and sorts tutors.
 * @param {object} filters  see EMPTY_FILTERS
 * @param {string} sort     one of SORTS in helpers
 */
export function searchTutors(filters = {}, sort = 'rating') {
  const f = { ...EMPTY_FILTERS, ...filters };

  let results = listTutorsWithUsers().filter((tutor) => {
    if (!tutor.user || tutor.user.status === 'suspended') return false;

    if (f.verifiedOnly && tutor.verificationStatus !== 'verified') return false;

    if (f.search) {
      const haystack = [
        tutor.user.name,
        tutor.headline,
        tutor.about,
        ...(tutor.subjects || []),
        tutor.locality,
        tutor.user?.locality,
        cityName(tutor.city),
      ];
      if (!matchesSearch(haystack, f.search)) return false;
    }
    if (f.subject && !(tutor.subjects || []).some((s) => normalise(s) === normalise(f.subject))) return false;
    if (f.classLevel && !(tutor.classes || []).includes(f.classLevel)) return false;
    if (f.city && tutor.city !== f.city) return false;
    if (f.locality && normalise(tutor.locality) !== normalise(f.locality)) return false;
    if (f.mode && !(tutor.teachingModes || []).includes(f.mode)) return false;
    if (f.language && !(tutor.languages || []).includes(f.language)) return false;

    if (f.feeMin !== '' && Number(tutor.monthlyFee) < Number(f.feeMin)) return false;
    if (f.feeMax !== '' && Number(tutor.monthlyFee) > Number(f.feeMax)) return false;
    if (f.experienceMin !== '' && Number(tutor.experience) < Number(f.experienceMin)) return false;
    if (f.ratingMin !== '' && getRating(tutor.id).average < Number(f.ratingMin)) return false;

    return true;
  });

  // Attach rating before sorting so the sort options work on real values.
  results = results.map((tutor) => ({ ...tutor, rating: getRating(tutor.id) }));

  switch (sort) {
    case 'experience':
      results = sortByNumber(results, (t) => t.experience, 'desc');
      break;
    case 'fee_low':
      results = sortByNumber(results, (t) => t.monthlyFee || Number.MAX_SAFE_INTEGER, 'asc');
      break;
    case 'fee_high':
      results = sortByNumber(results, (t) => t.monthlyFee, 'desc');
      break;
    case 'newest':
      results = [...results].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'rating':
    default:
      results = [...results].sort(
        (a, b) => b.rating.average - a.rating.average || b.rating.count - a.rating.count,
      );
  }

  return results;
}

/** Distinct filter values built from the current tutor data. */
export function filterOptions() {
  const tutors = getAll(KEYS.tutors);
  const subjects = new Set();
  const languages = new Set();
  const modes = new Set();

  tutors.forEach((t) => {
    (t.subjects || []).forEach((s) => subjects.add(s));
    (t.languages || []).forEach((l) => languages.add(l));
    (t.teachingModes || []).forEach((m) => modes.add(m));
  });

  return {
    subjects: [...subjects].sort(),
    languages: [...languages].sort(),
    modes: [...modes].sort(),
    maxFee: Math.max(0, ...tutors.map((t) => Number(t.monthlyFee) || 0)),
    maxExperience: Math.max(0, ...tutors.map((t) => Number(t.experience) || 0)),
  };
}

/* ------------------------------------------------------------------ */
/* Transparent matching                                               */
/* ------------------------------------------------------------------ */

/**
 * Explains, in plain language, why a tutor is a good match for a student.
 * Deterministic: each line is a simple comparison of real profile fields.
 * @returns {{score: number, reasons: string[]}}
 */
export function matchReasons(tutor, student) {
  const reasons = [];
  if (!tutor || !student) return { score: 0, reasons: [] };

  const prefs = student.profile || {};
  const wanted = prefs.subjects || [];
  const overlap = (tutor.subjects || []).filter((s) => wanted.includes(s));

  if (wanted.length > 0 && overlap.length > 0) {
    reasons.push(`Teaches ${overlap.join(', ')}`);
  }
  if (prefs.classLevel && (tutor.classes || []).includes(prefs.classLevel)) {
    reasons.push(`Teaches ${prefs.classLevel}`);
  }
  if (prefs.preferredMode && (tutor.teachingModes || []).includes(prefs.preferredMode)) {
    reasons.push(
      prefs.preferredMode === 'both'
        ? 'Offers online and in-person classes'
        : `Available for ${prefs.preferredMode} classes`,
    );
  }
  if (prefs.budgetMax > 0 && tutor.monthlyFee > 0 && tutor.monthlyFee <= prefs.budgetMax) {
    reasons.push('Fees are within your budget');
  }
  if (student.city && tutor.city === student.city) {
    reasons.push(tutor.locality
      ? `Based in ${tutor.locality}, same city`
      : `Available in your city`);
  }
  if ((prefs.preferredDays || []).length > 0) {
    const free = (prefs.preferredDays || []).filter((day) =>
      (tutor.availability || []).some((slot) => slot.day === day),
    );
    if (free.length > 0) {
      reasons.push(`Free on ${free.join(', ')}`);
    }
  }
  if ((tutor.languages || []).length > 0) {
    const spoken = (prefs.languages || []).filter((l) => (tutor.languages || []).includes(l));
    if (spoken.length > 0) reasons.push(`Speaks ${spoken.join(', ')}`);
  }

  return { score: Math.min(99, reasons.length * 14 + (getRating(tutor.id).average >= 4.5 ? 12 : 0)), reasons };
}