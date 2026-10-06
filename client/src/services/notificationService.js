/**
 * notificationService.js
 * ---------------------------------------------------------------------------
 * Small internal notification centre. Every service that changes a record the
 * other party cares about calls notify() so both dashboards stay in sync.
 */

import { getAll, addItem, updateItem, deleteItem, where, KEYS } from '../utils/storage.js';

/**
 * Creates one notification.
 * @param {string} userId recipient
 * @param {{type: string, title: string, message?: string, link?: string}} payload
 */
export function notify(userId, { type, title, message = '', link = '' }) {
  if (!userId || !title) return null;
  return addItem(KEYS.notifications, { userId, type, title, message, link, isRead: false });
}

/** Notifications for one user, newest first. */
export function listForUser(userId) {
  return where(KEYS.notifications, (n) => n.userId === userId).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

/** How many of a user's notifications are still unread. */
export function unreadCount(userId) {
  return listForUser(userId).filter((n) => !n.isRead).length;
}

export function markRead(id) {
  return updateItem(KEYS.notifications, id, { isRead: true });
}

export function markAllRead(userId) {
  getAll(KEYS.notifications)
    .filter((n) => n.userId === userId && !n.isRead)
    .forEach((n) => updateItem(KEYS.notifications, n.id, { isRead: true }));
  return unreadCount(userId);
}

export function remove(id) {
  return deleteItem(KEYS.notifications, id);
}