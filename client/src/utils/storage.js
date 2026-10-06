/**
 * storage.js
 * ---------------------------------------------------------------------------
 * The only module in this app that touches localStorage.
 *
 * Everything is JSON serialised and namespaced with a `htf_` prefix so the demo
 * data never collides with anything else stored by the browser.
 *
 * Collections used by the app:
 *   users, tutors, requirements, applications, requests,
 *   favorites, reviews, notifications, reports, subjects
 *
 * Plus the special key `currentUser` which holds the signed-in session.
 */

const PREFIX = 'htf_';
const KEYS = {
  users: 'users',
  tutors: 'tutors',
  requirements: 'requirements',
  applications: 'applications',
  requests: 'requests',
  favorites: 'favorites',
  reviews: 'reviews',
  notifications: 'notifications',
  reports: 'reports',
  subjects: 'subjects',
  currentUser: 'currentUser',
};

/** True when localStorage is usable (it is not in private mode on some browsers). */
const available = () => {
  try {
    const probe = `${PREFIX}__probe`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
};

const HAS_STORAGE = typeof window !== 'undefined' && available();

/* In-memory fallback so the demo still works if storage is blocked. */
const memoryStore = new Map();

const rawGet = (fullKey) => {
  if (!HAS_STORAGE) return memoryStore.has(fullKey) ? memoryStore.get(fullKey) : null;
  return window.localStorage.getItem(fullKey);
};

const rawSet = (fullKey, value) => {
  if (!HAS_STORAGE) {
    memoryStore.set(fullKey, value);
    return;
  }
  window.localStorage.setItem(fullKey, value);
};

/**
 * Reads a collection (always returns an array) or a single object.
 * @returns {any}
 */
export function getData(key) {
  const value = rawGet(`${PREFIX}${key}`);
  if (value === null || value === undefined) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * Writes any JSON-serialisable value to a key.
 */
export function setData(key, data) {
  rawSet(`${PREFIX}${key}`, JSON.stringify(data));
  return data;
}

/** Deletes a key entirely, so a signed-out session leaves nothing behind. */
export function removeData(key) {
  if (!HAS_STORAGE) {
    memoryStore.delete(`${PREFIX}${key}`);
    return;
  }
  window.localStorage.removeItem(`${PREFIX}${key}`);
}

/**
 * Appends an item to a collection.
 * Tolerates corrupted storage (a non-array value is replaced rather than thrown on).
 * @returns {object} the item that was stored (with its id)
 */
export function addItem(key, item) {
  const list = getAll(key);
  const record = { ...item, id: item.id || genId(key), createdAt: item.createdAt || new Date().toISOString() };
  list.push(record);
  setData(key, list);
  return record;
}

/**
 * Updates an existing item by id. Only the provided keys are changed.
 * @returns {object|null} the updated item, or null when not found
 */
export function updateItem(key, id, updates) {
  const list = getAll(key);
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return null;
  list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
  setData(key, list);
  return list[index];
}

/**
 * Removes an item by id.
 * @returns {boolean} whether something was removed
 */
export function deleteItem(key, id) {
  const list = getAll(key);
  const next = list.filter((item) => item.id !== id);
  if (next.length === list.length) return false;
  setData(key, next);
  return true;
}

/* ------------------------------------------------------------------ */
/* Convenience helpers used by the service layer                       */
/* ------------------------------------------------------------------ */

/**
 * Every item in a collection.
 *
 * Always returns an array of plain objects, even if the stored value is
 * missing, unreadable or was hand-edited into a bad shape, so a corrupt
 * localStorage can never crash a page render.
 */
export function getAll(key) {
  const value = getData(key);
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item !== null && typeof item === 'object');
}

/** A single record by id. */
export function findById(key, id) {
  return getAll(key).find((item) => item.id === id) || null;
}

/** Records matching a predicate. */
export function where(key, predicate) {
  return getAll(key).filter(predicate);
}

/**
 * Generates a readable, monotonically increasing id such as `user_001`.
 * Scans the collection so ids stay short and easy to read in the demo data,
 * and uses the same prefix as the seeded records.
 */
const ID_PREFIX = {
  users: 'user',
  tutors: 'tutor',
  requirements: 'requirement',
  applications: 'application',
  requests: 'request',
  favorites: 'favorite',
  reviews: 'review',
  notifications: 'notification',
  reports: 'report',
  subjects: 'subject',
};

export function genId(key) {
  const prefix = ID_PREFIX[key] || key;
  const list = getAll(key);
  const pattern = new RegExp(`^${prefix}_(\\d+)$`);
  const highest = list.reduce((max, item) => {
    const match = pattern.exec(item?.id || '');
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  const next = highest + 1;
  return `${prefix}_${String(next).padStart(3, '0')}`;
}

/**
 * Removes every key this app owns (`htf_*`) and returns how many were deleted.
 * Used by the "reset demo data" action so unrelated site data is left alone.
 */
export function resetAll() {
  if (!HAS_STORAGE) {
    const removed = memoryStore.size;
    memoryStore.clear();
    return removed;
  }

  const doomed = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(PREFIX)) doomed.push(key);
  }
  doomed.forEach((key) => window.localStorage.removeItem(key));
  return doomed.length;
}

export { KEYS };
