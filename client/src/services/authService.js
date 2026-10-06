/**
 * authService.js
 * ---------------------------------------------------------------------------
 * Demo authentication backed entirely by localStorage.
 *
 * There is no real backend here: passwords are stored in plain text and any
 * password you type while registering works. The goal is to demonstrate the
 * role-based flows (student / tutor / admin), not real security.
 */

import { getAll, getData, setData, removeData, addItem, updateItem, findById, KEYS } from '../utils/storage.js';
import { clamp, normalise } from '../utils/helpers.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Creates a tutor profile record for a newly registered user. */
function createTutorProfile(user) {
  const profile = addItem(KEYS.tutors, {
    userId: user.id,
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
  return profile;
}

/**
 * Registers a new user.
 * @returns {{ok: true, user: object} | {ok: false, error: string, field?: string}}
 */
export function register({ name, email, password, phone, role = 'student', city = '', locality = '' }) {
  const cleanName = clamp(name, 80);
  const cleanEmail = normalise(email);
  const cleanPhone = clamp(phone, 15);

  if (!cleanName || cleanName.length < 2) return { ok: false, error: 'Please enter your full name', field: 'name' };
  if (!EMAIL_RE.test(cleanEmail)) return { ok: false, error: 'Please enter a valid email address', field: 'email' };
  if (!password || password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters', field: 'password' };
  }
  if (!['student', 'tutor'].includes(role)) {
    return { ok: false, error: 'Please choose whether you are a student or a tutor', field: 'role' };
  }

  const users = getAll(KEYS.users);
  if (users.some((u) => normalise(u.email) === cleanEmail)) {
    return { ok: false, error: 'An account with this email already exists. Try signing in instead.', field: 'email' };
  }

  const user = addItem(KEYS.users, {
    role,
    name: cleanName,
    email: cleanEmail,
    password, // demo only - never do this in production
    phone: cleanPhone,
    city,
    locality: clamp(locality, 60),
    status: 'active',
    ...(role === 'student'
      ? {
        profile: {
          guardianName: '',
          classLevel: '',
          board: '',
          subjects: [],
          budgetMin: 0,
          budgetMax: 0,
          preferredMode: '',
          preferredDays: [],
          preferredTime: '',
        },
      }
      : {}),
  });

  if (role === 'tutor') createTutorProfile(user);

  setData(KEYS.currentUser, { id: user.id, role: user.role, signedInAt: new Date().toISOString() });
  return { ok: true, user };
}

/**
 * Signs a user in.
 * @returns {{ok: true, user: object} | {ok: false, error: string, field?: string}}
 */
export function login({ email, password }) {
  const cleanEmail = normalise(email);
  if (!cleanEmail) return { ok: false, error: 'Please enter your email address', field: 'email' };
  if (!password) return { ok: false, error: 'Please enter your password', field: 'password' };

  const user = getAll(KEYS.users).find((u) => normalise(u.email) === cleanEmail);
  if (!user) {
    return { ok: false, error: 'We could not find an account with this email', field: 'email' };
  }
  if (user.password !== password) {
    return { ok: false, error: 'Incorrect password. Please try again.', field: 'password' };
  }
  if (user.status === 'suspended') {
    return { ok: false, error: 'This account has been suspended. Please contact the administrator.', field: 'email' };
  }

  setData(KEYS.currentUser, { id: user.id, role: user.role, signedInAt: new Date().toISOString() });
  return { ok: true, user };
}

/** Clears the session. The key is removed, not blanked. */
export function logout() {
  removeData(KEYS.currentUser);
}

/**
 * The signed-in user (without the password), or null when signed out.
 */
export function getCurrentUser() {
  const session = getData(KEYS.currentUser);
  if (!session?.id) return null;
  const user = findById(KEYS.users, session.id);
  if (!user) {
    removeData(KEYS.currentUser);
    return null;
  }
  const { password, ...safe } = user;
  return safe;
}

/** Updates the signed-in user's account fields. */
export function updateProfile(userId, updates) {
  const allowed = ['name', 'phone', 'city', 'locality'];
  const patch = {};
  allowed.forEach((key) => {
    if (updates[key] !== undefined) patch[key] = typeof updates[key] === 'string' ? clamp(updates[key]) : updates[key];
  });
  if (patch.name !== undefined && patch.name.length < 2) {
    return { ok: false, error: 'Please enter your full name', field: 'name' };
  }
  const updated = updateItem(KEYS.users, userId, patch);
  if (!updated) return { ok: false, error: 'Account not found' };
  const { password, ...safe } = updated;
  return { ok: true, user: safe };
}

/** Updates the learning preferences block on a student account. */
export function updateStudentProfile(userId, profile) {
  const user = findById(KEYS.users, userId);
  if (!user) return { ok: false, error: 'Account not found' };

  const current = user.profile || {};
  const next = {
    ...current,
    classLevel: clamp(profile.classLevel ?? current.classLevel ?? '', 20),
    board: profile.board ?? current.board ?? '',
    subjects: Array.isArray(profile.subjects) ? profile.subjects : current.subjects || [],
    budgetMin: Number(profile.budgetMin) || 0,
    budgetMax: Number(profile.budgetMax) || 0,
    preferredMode: profile.preferredMode ?? current.preferredMode ?? '',
    preferredDays: Array.isArray(profile.preferredDays) ? profile.preferredDays : current.preferredDays || [],
    preferredTime: profile.preferredTime ?? current.preferredTime ?? '',
    guardianName: clamp(profile.guardianName ?? current.guardianName ?? '', 80),
  };

  if (next.budgetMin && next.budgetMax && next.budgetMin > next.budgetMax) {
    return { ok: false, error: 'Minimum budget cannot be higher than the maximum budget', field: 'budgetMin' };
  }

  updateItem(KEYS.users, userId, { profile: next });
  return { ok: true, profile: next };
}

/** Lists users without passwords - safe to pass into UI state. */
export function listUsers() {
  return getAll(KEYS.users).map(({ password, ...rest }) => rest);
}