/**
 * reportService.js
 * ---------------------------------------------------------------------------
 * Users can report a profile; admins triage the queue.
 */

import {
  getAll, addItem, updateItem, findById, where, KEYS,
} from '../utils/storage.js';
import { clamp, REPORT_REASONS } from '../utils/helpers.js';

export { REPORT_REASONS };

/** Files a report against a tutor or another account. */
export function createReport({ reporterId, reportedUserId, reportedTutorId = null, reason, details }) {
  const reporter = findById(KEYS.users, reporterId);
  if (!reporter) return { ok: false, error: 'Please sign in to file a report' };

  const reported = findById(KEYS.users, reportedUserId);
  if (!reported) return { ok: false, error: 'This profile no longer exists' };
  if (reported.id === reporterId) return { ok: false, error: 'You cannot report your own profile' };
  if (!REPORT_REASONS.includes(reason)) return { ok: false, error: 'Please choose a reason', field: 'reason' };

  const duplicate = where(KEYS.reports, (r) => r.reporterId === reporterId && r.reportedUserId === reportedUserId && r.status === 'open');
  if (duplicate.length > 0) {
    return { ok: false, error: 'You already have an open report for this profile' };
  }

  const report = addItem(KEYS.reports, {
    reporterId,
    reportedUserId,
    reportedTutorId,
    reason,
    details: clamp(details, 800),
    status: 'open',
  });

  return { ok: true, report };
}

/** Reports filed by a user. */
/** Every report, joined with reporter and reported profile. */
export function listAll() {
  const users = getAll(KEYS.users);
  const tutors = getAll(KEYS.tutors);
  return getAll(KEYS.reports)
    .map((report) => ({
      ...report,
      reporter: users.find((u) => u.id === report.reporterId) || null,
      reported: users.find((u) => u.id === report.reportedUserId) || null,
      tutor: report.reportedTutorId
        ? tutors.find((t) => t.id === report.reportedTutorId) || null
        : null,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/** Admin action: move a report through the triage states. */
export function updateStatus(reportId, status, adminNote = '') {
  const valid = ['open', 'reviewing', 'resolved', 'dismissed'];
  if (!valid.includes(status)) return { ok: false, error: 'Invalid report status' };

  const report = findById(KEYS.reports, reportId);
  if (!report) return { ok: false, error: 'Report not found' };
  if (report.status === status) return { ok: false, error: `This report is already ${status}` };

  updateItem(KEYS.reports, reportId, { status, adminNote: clamp(adminNote, 400) });
  return { ok: true };
}

export function countOpen() {
  return where(KEYS.reports, (r) => ['open', 'reviewing'].includes(r.status)).length;
}