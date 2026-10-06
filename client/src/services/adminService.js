/**
 * adminService.js
 * ---------------------------------------------------------------------------
 * Statistics and moderation actions for the admin dashboard.
 */

import { getAll, updateItem, findById, KEYS } from '../utils/storage.js';
import * as tutorService from './tutorService.js';
import * as reviewService from './reviewService.js';
import * as reportService from './reportService.js';

/** Every number shown on the admin dashboard, computed from live data. */
export function getStats() {
  const users = getAll(KEYS.users);
  const tutors = getAll(KEYS.tutors);
  const requests = getAll(KEYS.requests);
  const requirements = getAll(KEYS.requirements);
  const applications = getAll(KEYS.applications);
  const reviews = getAll(KEYS.reviews);
  const favourites = getAll(KEYS.favorites);
  const reports = getAll(KEYS.reports);

  const students = users.filter((u) => u.role === 'student');
  const tutorUsers = users.filter((u) => u.role === 'tutor');
  const verified = tutors.filter((t) => t.verificationStatus === 'verified');
  const completed = requests.filter((r) => r.status === 'completed');

  return {
    totalUsers: users.length,
    totalTutors: tutorUsers.length,
    verifiedTutors: verified.length,
    pendingTutors: tutors.filter((t) => t.verificationStatus === 'pending').length,
    totalStudents: students.length,
    openRequirements: requirements.filter((r) => ['open', 'applications_received', 'shortlisted'].includes(r.status)).length,
    totalRequirements: requirements.length,
    activeRequests: requests.filter((r) => ['pending', 'accepted'].includes(r.status)).length,
    completedSessions: completed.length,
    totalApplications: applications.length,
    totalReviews: reviews.length,
    totalFavourites: favourites.length,
    openReports: reportService.countOpen(),
    suspendedUsers: users.filter((u) => u.status === 'suspended').length,
    averageRating: reviewService.platformRating().average,
    demoRequests: requests.filter((r) => r.type === 'demo').length,
  };
}

/** Users list for the admin table. */
export function listUsers() {
  const tutors = getAll(KEYS.tutors);
  return getAll(KEYS.users).map(({ password, ...user }) => ({
    ...user,
    tutor: tutors.find((t) => t.userId === user.id) || null,
  }));
}

/** Suspends or restores an account. Admins cannot be suspended. */
export function setUserStatus(userId, status) {
  if (!['active', 'suspended'].includes(status)) return { ok: false, error: 'Status must be active or suspended' };
  const user = findById(KEYS.users, userId);
  if (!user) return { ok: false, error: 'Account not found' };
  if (user.role === 'admin') return { ok: false, error: 'Administrator accounts cannot be suspended' };
  if (user.status === status) return { ok: false, error: `This account is already ${status}` };

  updateItem(KEYS.users, userId, { status });
  return { ok: true };
}

/** Tutors list with rating and requirement counts. */
export function listTutors() {
  const users = getAll(KEYS.users);
  const requests = getAll(KEYS.requests);
  const applications = getAll(KEYS.applications);

  return getAll(KEYS.tutors).map((tutor) => {
    const user = users.find((u) => u.id === tutor.userId) || null;
    return {
      ...tutor,
      user,
      rating: tutorService.getRating(tutor.id),
      sessions: requests.filter((r) => r.tutorUserId === tutor.userId && r.status === 'completed').length,
      applications: applications.filter((a) => a.tutorUserId === tutor.userId).length,
    };
  });
}

/** Requests list for the admin table. */
export function listRequests() {
  const users = getAll(KEYS.users);
  const tutors = getAll(KEYS.tutors);
  return getAll(KEYS.requests)
    .map((request) => ({
      ...request,
      student: users.find((u) => u.id === request.studentId) || null,
      tutorUser: users.find((u) => u.id === request.tutorUserId) || null,
      tutor: tutors.find((t) => t.userId === request.tutorUserId) || null,
      review: getAll(KEYS.reviews).find((r) => r.requestId === request.id) || null,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/** Requirements list for the admin table. */
export function listRequirements() {
  const users = getAll(KEYS.users);
  const applications = getAll(KEYS.applications);
  return getAll(KEYS.requirements)
    .map((req) => ({
      ...req,
      student: users.find((u) => u.id === req.studentId) || null,
      applicationCount: applications.filter((a) => a.requirementId === req.id).length,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/** Reviews list for moderation. */
export function listReviews() {
  const users = getAll(KEYS.users);
  const tutors = getAll(KEYS.tutors);
  const requests = getAll(KEYS.requests);
  return getAll(KEYS.reviews)
    .map((review) => {
      const request = requests.find((r) => r.id === review.requestId) || null;
      return {
        ...review,
        student: users.find((u) => u.id === review.studentId) || null,
        tutorUser: users.find((u) => u.id === review.tutorUserId) || null,
        tutor: tutors.find((t) => t.userId === review.tutorUserId) || null,
        subjectName: request ? request.subject || (request.type === 'demo' ? 'Demo class' : 'Tuition') : '',
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export { tutorService, reviewService, reportService };