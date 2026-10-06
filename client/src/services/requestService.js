/**
 * requestService.js
 * ---------------------------------------------------------------------------
 * Tuition and demo requests, plus the status transition rules that keep the
 * workflow honest (no accepting an already-cancelled request, and so on).
 */

import {
  getAll, addItem, updateItem, findById, where, KEYS,
} from '../utils/storage.js';
import { clamp } from '../utils/helpers.js';
import { notify } from './notificationService.js';

/**
 * Allowed status changes.
 *   pending   -> accepted | rejected | cancelled
 *   accepted  -> completed | cancelled
 *   completed -> (final)  a review can be added by the student
 *   rejected  -> (final)
 *   cancelled -> (final)
 */
const TRANSITIONS = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['completed', 'cancelled'],
  completed: [],
  rejected: [],
  cancelled: [],
};

/** Who is allowed to make each transition. */
const ACTOR = {
  accepted: ['tutor'],
  rejected: ['tutor'],
  completed: ['tutor'],
  cancelled: ['student'],
};

/** Which actions each role sees on a given request. */
export function availableActions(request, role) {
  const allowed = TRANSITIONS[request.status] || [];
  return allowed
    .filter((next) => (ACTOR[next] || []).includes(role))
    .map((next) => {
      if (next === 'accepted') return { status: 'accepted', label: 'Accept request', variant: 'primary' };
      if (next === 'rejected') return { status: 'rejected', label: 'Decline', variant: 'ghost' };
      if (next === 'completed') return { status: 'completed', label: 'Mark as completed', variant: 'primary' };
      if (next === 'cancelled') return { status: 'cancelled', label: 'Cancel request', variant: 'ghost' };
      return { status: next, label: next, variant: 'ghost' };
    });
}

/* ------------------------------------------------------------------ */
/* Reads                                                              */
/* ------------------------------------------------------------------ */

function decorate(request) {
  const users = getAll(KEYS.users);
  const tutors = getAll(KEYS.tutors);
  const reviews = getAll(KEYS.reviews);
  const student = users.find((u) => u.id === request.studentId) || null;
  const tutorUser = users.find((u) => u.id === request.tutorUserId) || null;
  const tutor = tutors.find((t) => t.userId === request.tutorUserId) || null;

  return {
    ...request,
    student: student ? { id: student.id, name: student.name, city: student.city, locality: student.locality } : null,
    tutorUser: tutorUser ? { id: tutorUser.id, name: tutorUser.name } : null,
    tutor,
    review: reviews.find((r) => r.requestId === request.id) || null,
  };
}

/** Requests where the user is the student. */
export function listForStudent(studentId) {
  return where(KEYS.requests, (r) => r.studentId === studentId)
    .map(decorate)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/** Requests where the user is the tutor. */
export function listForTutor(tutorUserId) {
  return where(KEYS.requests, (r) => r.tutorUserId === tutorUserId)
    .map(decorate)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/** Filters by status for either list. */
export function filterByStatus(list, status) {
  if (!status || status === 'all') return list;
  if (status === 'active') return list.filter((r) => ['pending', 'accepted'].includes(r.status));
  return list.filter((r) => r.status === status);
}

/* ------------------------------------------------------------------ */
/* Writes                                                             */
/* ------------------------------------------------------------------ */

/**
 * Student sends a request to a tutor.
 * @returns {{ok: true, request: object} | {ok: false, error: string}}
 */
export function createRequest(studentId, form) {
  const tutorUser = getAll(KEYS.users).find((u) => u.id === form.tutorUserId && u.role === 'tutor');
  if (!tutorUser) return { ok: false, error: 'Tutor not found' };
  if (tutorUser.status === 'suspended') return { ok: false, error: 'This tutor is currently unavailable' };
  if (tutorUser.id === studentId) return { ok: false, error: 'You cannot send a request to yourself' };

  const type = form.type === 'demo' ? 'demo' : 'tutoring';

  // One open request of the same type at a time.
  const existing = getAll(KEYS.requests).find(
    (r) =>
      r.studentId === studentId &&
      r.tutorUserId === form.tutorUserId &&
      r.type === type &&
      ['pending', 'accepted'].includes(r.status),
  );
  if (existing) {
    return { ok: false, error: `You already have a ${existing.status} ${type} request with this tutor` };
  }

  const request = addItem(KEYS.requests, {
    studentId,
    tutorUserId: form.tutorUserId,
    subject: form.subject || '',
    message: clamp(form.message, 800),
    type,
    preferredDate: form.preferredDate || '',
    preferredTime: form.preferredTime || 'evening',
    status: 'pending',
    timeline: [
      { status: 'pending', label: 'Request sent', by: 'student', at: new Date().toISOString() },
    ],
  });

  notify(form.tutorUserId, {
    type: 'request_received',
    title: type === 'demo' ? 'New demo request' : 'New tuition request',
    message: `${studentName(studentId)} sent you a ${type} request${form.subject ? ` for ${form.subject}` : ''}.`,
    link: '/tutor/requests',
  });

  return { ok: true, request: decorate(request) };
}

function studentName(studentId) {
  const user = getAll(KEYS.users).find((u) => u.id === studentId);
  return user ? user.name : 'A student';
}

/**
 * Moves a request to a new status after validating the transition.
 * @param {string} requestId
 * @param {string} nextStatus
 * @param {object} user the signed-in user (role is enforced here)
 * @param {{note?: string}} options
 */
export function updateStatus(requestId, nextStatus, user, options = {}) {
  const request = findById(KEYS.requests, requestId);
  if (!request) return { ok: false, error: 'Request not found' };

  const isParticipant = request.studentId === user.id || request.tutorUserId === user.id;
  if (!isParticipant && user.role !== 'admin') {
    return { ok: false, error: 'You do not have access to this request' };
  }

  const allowed = TRANSITIONS[request.status] || [];
  if (!allowed.includes(nextStatus)) {
    if (request.status === nextStatus) {
      return { ok: false, error: `This request is already ${nextStatus}` };
    }
    return {
      ok: false,
      error: `A ${request.status} request cannot be marked as ${nextStatus}`,
    };
  }

  const allowedActors = ACTOR[nextStatus] || [];
  if (user.role !== 'admin' && !allowedActors.includes(user.role)) {
    return { ok: false, error: `Only the ${allowedActors.join(' or ')} can do this` };
  }

  const label = {
    accepted: request.type === 'demo' ? 'Demo accepted' : 'Request accepted',
    rejected: 'Declined by tutor',
    completed: 'Session completed',
    cancelled: 'Cancelled by student',
  }[nextStatus];

  const timeline = [
    ...(request.timeline || []),
    { status: nextStatus, label, by: user.role, at: new Date().toISOString(), note: clamp(options.note, 300) },
  ];

  updateItem(KEYS.requests, requestId, {
    status: nextStatus,
    timeline,
    tutorNote: nextStatus === 'rejected' ? clamp(options.note, 300) : request.tutorNote,
  });

  // Tell the other side what happened.
  const counterparty = user.role === 'tutor' ? request.studentId : request.tutorUserId;
  const notifications = {
    accepted: {
      title: request.type === 'demo' ? 'Demo request accepted' : 'Request accepted',
      message: `${studentName(request.studentId)}'s ${request.type} request was accepted.`,
    },
    rejected: {
      title: 'Request declined',
      message: `${studentName(request.studentId)}'s ${request.type} request could not be taken.`,
    },
    cancelled: {
      title: 'Request cancelled',
      message: `A ${request.type} request was cancelled.`,
    },
    completed: {
      title: 'Session completed',
      message: 'The session is complete. You can now leave a review.',
    },
  };
  if (notifications[nextStatus]) {
    // The link always points at the side of the workflow that did not act.
    const recipientIsStudent = counterparty === request.studentId;
    notify(counterparty, {
      type: `request_${nextStatus}`,
      ...notifications[nextStatus],
      link: recipientIsStudent ? '/student/requests' : '/tutor/requests',
    });
  }

  return { ok: true, request: decorate(findById(KEYS.requests, requestId)) };
}

/** Requests split into the buckets used by the dashboards. */
export function summarise(requests) {
  return {
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    completed: requests.filter((r) => r.status === 'completed').length,
    cancelled: requests.filter((r) => r.status === 'cancelled').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
    active: requests.filter((r) => ['pending', 'accepted'].includes(r.status)).length,
    upcomingDemos: requests.filter((r) => r.type === 'demo' && r.status === 'accepted').length,
    awaitingReview: requests.filter((r) => r.status === 'completed' && !r.review).length,
  };
}