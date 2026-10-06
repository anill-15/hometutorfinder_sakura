/**
 * requirementService.js
 * ---------------------------------------------------------------------------
 * Tuition requirements posted by students, and the applications tutors send
 * against them.
 */

import {
  getAll, addItem, updateItem, deleteItem, findById, where, KEYS,
} from '../utils/storage.js';
import { clamp, normalise } from '../utils/helpers.js';
import { notify } from './notificationService.js';

/** Statuses in which a tutor can still submit an application. */
const OPEN_STATUSES = ['open', 'applications_received', 'shortlisted'];

/** Statuses a tutor may still browse on the open-requirements board. */
const BROWSABLE_STATUSES = [...OPEN_STATUSES, 'assigned'];

/* ------------------------------------------------------------------ */
/* Requirements                                                       */
/* ------------------------------------------------------------------ */

/** Requirements joined with the student who posted them. */
export function listRequirements({ studentId, includeClosed = true } = {}) {
  const users = getAll(KEYS.users);
  const tutors = getAll(KEYS.tutors);

  return getAll(KEYS.requirements)
    .filter((r) => (studentId ? r.studentId === studentId : true))
    .filter((r) => (includeClosed ? true : BROWSABLE_STATUSES.includes(r.status)))
    .map((req) => ({
      ...req,
      student: users.find((u) => u.id === req.studentId) || null,
      assignedTutor: req.assignedTutorId
        ? (() => {
          const assigned = tutors.find((t) => t.id === req.assignedTutorId);
          return assigned ? { ...assigned, user: users.find((u) => u.id === assigned.userId) || null } : null;
        })()
        : null,
      applications: where(KEYS.applications, (a) => a.requirementId === req.id),
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getRequirement(requirementId) {
  const req = findById(KEYS.requirements, requirementId);
  if (!req) return null;
  const users = getAll(KEYS.users);
  const tutors = getAll(KEYS.tutors);
  const assigned = req.assignedTutorId ? tutors.find((t) => t.id === req.assignedTutorId) || null : null;
  return {
    ...req,
    student: users.find((u) => u.id === req.studentId) || null,
    assignedTutor: assigned
      ? { ...assigned, user: users.find((u) => u.id === assigned.userId) || null }
      : null,
  };
}

export function applicationsForRequirement(requirementId) {
  const tutors = getAll(KEYS.tutors);
  const users = getAll(KEYS.users);
  return where(KEYS.applications, (a) => a.requirementId === requirementId)
    .map((app) => ({
      ...app,
      tutor: tutors.find((t) => t.userId === app.tutorUserId) || null,
      tutorUser: users.find((u) => u.id === app.tutorUserId) || null,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/** Keeps the requirement status in step with its applications. */
function syncStatus(requirementId) {
  const apps = where(KEYS.applications, (a) => a.requirementId === requirementId);
  const req = findById(KEYS.requirements, requirementId);
  if (!req) return;

  // Closed / cancelled / assigned stay put.
  if (['closed', 'cancelled', 'assigned'].includes(req.status)) return;

  const hasAccepted = apps.some((a) => a.status === 'accepted');
  const hasPending = apps.some((a) => a.status === 'pending');

  const status = hasAccepted ? 'shortlisted' : hasPending ? 'applications_received' : 'open';
  if (status !== req.status) updateItem(KEYS.requirements, requirementId, { status });
}

/**
 * Creates a requirement.
 * @returns {{ok: true, requirement: object} | {ok: false, error: string, field?: string}}
 */
export function createRequirement(studentId, form) {
  if (!form.subject) return { ok: false, error: 'Select a subject', field: 'subject' };
  if (!form.classLevel) return { ok: false, error: 'Select a class or grade', field: 'classLevel' };

  const budgetMin = Number(form.budgetMin) || 0;
  const budgetMax = Number(form.budgetMax) || 0;
  if (budgetMin && budgetMax && budgetMin > budgetMax) {
    return { ok: false, error: 'Minimum budget cannot be higher than the maximum budget', field: 'budgetMin' };
  }

  const requirement = addItem(KEYS.requirements, {
    studentId,
    subject: form.subject,
    classLevel: form.classLevel,
    board: form.board || '',
    city: form.city || '',
    locality: clamp(form.locality, 60),
    budgetMin,
    budgetMax,
    teachingMode: form.teachingMode || 'both',
    preferredDays: Array.isArray(form.preferredDays) ? form.preferredDays : [],
    preferredTime: form.preferredTime || 'evening',
    description: clamp(form.description, 1200),
    status: 'open',
    assignedTutorId: null,
  });

  return { ok: true, requirement };
}

/** Updates a requirement the student owns. */
export function updateRequirement(requirementId, studentId, form) {
  const req = findById(KEYS.requirements, requirementId);
  if (!req) return { ok: false, error: 'Requirement not found' };
  if (req.studentId !== studentId) return { ok: false, error: 'You can only edit your own requirement' };
  if (['closed', 'cancelled'].includes(req.status)) {
    return { ok: false, error: 'A closed or cancelled requirement can no longer be edited' };
  }

  const budgetMin = Number(form.budgetMin) || 0;
  const budgetMax = Number(form.budgetMax) || 0;
  if (budgetMin && budgetMax && budgetMin > budgetMax) {
    return { ok: false, error: 'Minimum budget cannot be higher than the maximum budget', field: 'budgetMin' };
  }

  const updated = updateItem(KEYS.requirements, requirementId, {
    subject: form.subject ?? req.subject,
    classLevel: form.classLevel ?? req.classLevel,
    board: form.board ?? req.board,
    city: form.city ?? req.city,
    locality: form.locality ?? req.locality,
    budgetMin,
    budgetMax,
    teachingMode: form.teachingMode ?? req.teachingMode,
    preferredDays: Array.isArray(form.preferredDays) ? form.preferredDays : req.preferredDays,
    preferredTime: form.preferredTime ?? req.preferredTime,
    description: clamp(form.description, 1200),
  });

  return { ok: true, requirement: updated };
}

/** Closes a requirement so it no longer appears to tutors. */
export function closeRequirement(requirementId, studentId) {
  const req = findById(KEYS.requirements, requirementId);
  if (!req) return { ok: false, error: 'Requirement not found' };
  if (req.studentId !== studentId) return { ok: false, error: 'You can only close your own requirement' };
  if (['closed', 'cancelled'].includes(req.status)) {
    return { ok: false, error: `This requirement is already ${req.status}` };
  }

  updateItem(KEYS.requirements, requirementId, { status: 'closed' });
  return { ok: true };
}

/** Deletes a requirement along with its applications. */
export function deleteRequirement(requirementId, studentId) {
  const req = findById(KEYS.requirements, requirementId);
  if (!req) return { ok: false, error: 'Requirement not found' };
  if (req.studentId !== studentId) return { ok: false, error: 'You can only delete your own requirement' };

  where(KEYS.applications, (a) => a.requirementId === requirementId).forEach((a) => {
    deleteItem(KEYS.applications, a.id);
  });
  deleteItem(KEYS.requirements, requirementId);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Applications                                                       */
/* ------------------------------------------------------------------ */

/** Filters the board of requirements a tutor may still apply to. */
export function searchRequirements(filters = {}, tutor = null) {
  const { subject = '', classLevel = '', city = '', budgetMin = '', budgetMax = '' } = filters;

  return listRequirements({ includeClosed: false })
    .filter((req) => OPEN_STATUSES.includes(req.status))
    .filter((req) => (subject ? normalise(req.subject) === normalise(subject) : true))
    .filter((req) => (classLevel ? req.classLevel === classLevel : true))
    .filter((req) => (city ? req.city === city : true))
    .filter((req) => (budgetMin !== '' && budgetMax !== '' ? req.budgetMax >= Number(budgetMin) : true))
    .filter((req) => {
      if (budgetMax === '') return true;
      if (req.budgetMax > 0) return req.budgetMax <= Number(budgetMax);
      return req.budgetMin <= Number(budgetMax);
    })
    .filter((req) => {
      // Tutors never see their own posts.
      if (tutor && req.studentId === tutor.userId) return false;
      // Already-applied requirements are hidden so the board stays actionable.
      if (tutor && tutor.myApplicationIds?.includes(req.id)) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/** Applications submitted by a tutor. */
export function applicationsByTutor(tutorUserId) {
  const requirements = getAll(KEYS.requirements);
  const users = getAll(KEYS.users);
  return where(KEYS.applications, (a) => a.tutorUserId === tutorUserId)
    .map((app) => ({
      ...app,
      requirement: requirements.find((r) => r.id === app.requirementId) || null,
      student: users.find((u) => u.id === requirements.find((r) => r.id === app.requirementId)?.studentId) || null,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * A tutor applies to a requirement.
 * @returns {{ok: true, application: object} | {ok: false, error: string}}
 */
export function applyToRequirement(tutorUserId, requirementId, { message, proposedFee }) {
  const tutorUser = findById(KEYS.users, tutorUserId);
  if (!tutorUser || tutorUser.role !== 'tutor') return { ok: false, error: 'Only a tutor account can apply' };
  if (tutorUser.status === 'suspended') return { ok: false, error: 'This account has been suspended' };

  const req = findById(KEYS.requirements, requirementId);
  if (!req) return { ok: false, error: 'Requirement not found' };
  if (req.studentId === tutorUserId) return { ok: false, error: 'You cannot apply to your own requirement' };
  if (!OPEN_STATUSES.includes(req.status)) {
    return { ok: false, error: 'This requirement is no longer accepting applications' };
  }
  if (!String(message || '').trim()) {
    return { ok: false, error: 'Add a short message so the student knows why you are a good fit', field: 'message' };
  }

  const existing = getAll(KEYS.applications).find(
    (a) => a.requirementId === requirementId && a.tutorUserId === tutorUserId,
  );
  if (existing && existing.status !== 'withdrawn') {
    return { ok: false, error: `You have already applied to this requirement (${existing.status})` };
  }

  // A withdrawn application is re-opened rather than duplicated, so the student
  // never sees two rows from the same tutor for the same requirement.
  const application = existing
    ? updateItem(KEYS.applications, existing.id, {
      message: clamp(message, 800),
      proposedFee: Number(proposedFee) || 0,
      status: 'pending',
      reAppliedAt: new Date().toISOString(),
    })
    : addItem(KEYS.applications, {
      requirementId,
      tutorUserId,
      message: clamp(message, 800),
      proposedFee: Number(proposedFee) || 0,
      status: 'pending',
    });

  syncStatus(requirementId);

  notify(req.studentId, {
    type: 'application_received',
    title: 'New tutor application',
    message: 'A tutor applied to your requirement.',
    link: `/student/requirements/${requirementId}`,
  });

  return { ok: true, application };
}

/**
 * The student who posted the requirement accepts or rejects an application.
 * Ownership is checked here so one student can never shortlist a tutor on
 * somebody else's requirement.
 */
export function updateApplicationStatus(applicationId, status, studentId = null) {
  if (!['accepted', 'rejected'].includes(status)) {
    return { ok: false, error: 'Application status must be accepted or rejected' };
  }
  const app = findById(KEYS.applications, applicationId);
  if (!app) return { ok: false, error: 'Application not found' };

  const requirement = findById(KEYS.requirements, app.requirementId);
  if (!requirement) return { ok: false, error: 'The requirement for this application no longer exists' };
  if (studentId !== null && requirement.studentId !== studentId) {
    return { ok: false, error: 'You can only respond to applications on your own requirement' };
  }
  if (['closed', 'cancelled'].includes(requirement.status)) {
    return { ok: false, error: 'This requirement is closed, so its applications cannot change' };
  }
  if (app.status === status) return { ok: false, error: `This application is already ${status}` };
  if (app.status === 'withdrawn') return { ok: false, error: 'This application was withdrawn' };
  if (app.status === 'rejected' && status === 'accepted') {
    return { ok: false, error: 'A rejected application cannot be accepted' };
  }

  updateItem(KEYS.applications, applicationId, { status });
  syncStatus(app.requirementId);

  notify(app.tutorUserId, {
    type: status === 'accepted' ? 'application_accepted' : 'application_declined',
    title: status === 'accepted' ? 'Application accepted' : 'Application declined',
    message:
      status === 'accepted'
        ? 'The student shortlisted your application. You can now start a tuition request.'
        : 'Your application was not shortlisted this time.',
    link: '/tutor/applications',
  });

  return { ok: true };
}

/**
 * Marks the assigned tutor on a requirement.
 * Only the student who posted it may do this.
 */
export function assignTutor(requirementId, tutorId, studentId = null) {
  const req = findById(KEYS.requirements, requirementId);
  if (!req) return { ok: false, error: 'Requirement not found' };
  if (studentId !== null && req.studentId !== studentId) {
    return { ok: false, error: 'You can only assign a tutor to your own requirement' };
  }
  if (!findById(KEYS.tutors, tutorId)) return { ok: false, error: 'Tutor not found' };
  updateItem(KEYS.requirements, requirementId, { assignedTutorId: tutorId, status: 'assigned' });
  return { ok: true };
}

/** The tutor withdraws their own application. */
export function withdrawApplication(applicationId, tutorUserId) {
  const app = findById(KEYS.applications, applicationId);
  if (!app) return { ok: false, error: 'Application not found' };
  if (app.tutorUserId !== tutorUserId) {
    return { ok: false, error: 'You can only withdraw your own application' };
  }
  if (app.status === 'accepted') {
    return { ok: false, error: 'An accepted application cannot be withdrawn. Message the student instead.' };
  }
  if (app.status === 'withdrawn') return { ok: false, error: 'This application is already withdrawn' };

  updateItem(KEYS.applications, applicationId, { status: 'withdrawn' });
  syncStatus(app.requirementId);
  return { ok: true };
}

/** Filters for the student's own requirements view. */
export function filterMyRequirements(requirements, status) {
  if (!status || status === 'all') return requirements;
  return requirements.filter((r) => r.status === status);
}