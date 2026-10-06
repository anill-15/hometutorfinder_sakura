/**
 * reviewService.js
 * ---------------------------------------------------------------------------
 * Reviews can only be written by the student, and only once per completed
 * request. The tutor's average rating is calculated from the stored reviews.
 */

import {
  getAll, addItem, deleteItem, findById, where, KEYS,
} from '../utils/storage.js';
import { clamp, average } from '../utils/helpers.js';
import { notify } from './notificationService.js';

/**
 * Creates a review for a completed request.
 * @param {object} student  the signed-in student
 * @param {object} form     { requestId, rating, comment }
 */
export function createReview(student, { requestId, rating, comment }) {
  const request = findById(KEYS.requests, requestId);
  if (!request) return { ok: false, error: 'Request not found' };
  if (request.studentId !== student.id) {
    return { ok: false, error: 'Only the student in this request can leave a review' };
  }
  if (request.status !== 'completed') {
    return { ok: false, error: 'You can review a tutor once the session is completed' };
  }

  const existing = getAll(KEYS.reviews).find((r) => r.requestId === requestId);
  if (existing) return { ok: false, error: 'You have already reviewed this session' };

  const value = Number(rating);
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return { ok: false, error: 'Please choose a rating between 1 and 5 stars', field: 'rating' };
  }

  const review = addItem(KEYS.reviews, {
    requestId,
    tutorId: tutorIdForUser(request.tutorUserId),
    tutorUserId: request.tutorUserId,
    studentId: student.id,
    rating: value,
    comment: clamp(comment, 1000),
  });

  notify(request.tutorUserId, {
    type: 'review_received',
    title: `New ${value}-star review`,
    message: `${student.name} reviewed your session.`,
    link: '/tutor/reviews',
  });

  return { ok: true, review };
}

/** Resolves the tutor profile id for a tutor user id. */
function tutorIdForUser(tutorUserId) {
  const tutor = getAll(KEYS.tutors).find((t) => t.userId === tutorUserId);
  return tutor ? tutor.id : null;
}

/** Removes a review (its author or an admin may do this). */
export function deleteReview(reviewId, user) {
  const review = findById(KEYS.reviews, reviewId);
  if (!review) return { ok: false, error: 'Review not found' };
  if (review.studentId !== user.id && user.role !== 'admin') {
    return { ok: false, error: 'You can only remove your own review' };
  }
  deleteItem(KEYS.reviews, reviewId);
  return { ok: true };
}

/** All reviews for one tutor, joined with the student and tutor record. */
export function listForTutor(tutorId) {
  const users = getAll(KEYS.users);
  const tutors = getAll(KEYS.tutors);
  const requests = getAll(KEYS.requests);
  const tutor = tutors.find((t) => t.id === tutorId) || null;

  return where(KEYS.reviews, (r) => r.tutorId === tutorId)
    .map((review) => {
      const student = users.find((u) => u.id === review.studentId);
      const request = requests.find((r) => r.id === review.requestId) || null;
      return {
        ...review,
        student: student ? { id: student.id, name: student.name, city: student.city } : null,
        tutorName: tutor ? users.find((u) => u.id === tutor.userId)?.name || '' : '',
        subjectName: request ? request.subject || (request.type === 'demo' ? 'Demo class' : 'Tuition') : '',
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/** Average rating and count for a tutor profile. */
export function ratingSummary(tutorId) {
  const reviews = where(KEYS.reviews, (r) => r.tutorId === tutorId);
  return {
    average: average(reviews.map((r) => r.rating)),
    count: reviews.length,
    breakdown: [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    })),
  };
}

/** Platform-wide rating, used by the admin dashboard. */
export function platformRating() {
  const reviews = getAll(KEYS.reviews);
  return { average: average(reviews.map((r) => r.rating)), count: reviews.length };
}