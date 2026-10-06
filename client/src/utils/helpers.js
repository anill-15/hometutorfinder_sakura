/**
 * helpers.js - small formatting and comparison utilities shared across the app.
 */

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const TIME_SLOTS = [
  { value: 'morning', label: 'Morning', hint: '6:00 AM – 12:00 PM' },
  { value: 'afternoon', label: 'Afternoon', hint: '12:00 PM – 4:00 PM' },
  { value: 'evening', label: 'Evening', hint: '4:00 PM – 8:00 PM' },
  { value: 'night', label: 'Night', hint: '8:00 PM onwards' },
];

export const CLASS_LEVELS = [
  'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12',
];

export const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'Other'];

export const TEACHING_MODES = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'In-person' },
  { value: 'both', label: 'Both' },
];


export const REPORT_REASONS = [
  'Fake profile',
  'Spam',
  'Inappropriate content',
  'Misconduct',
  'Other',
];

export const SORTS = [
  { value: 'rating', label: 'Rating: high to low' },
  { value: 'experience', label: 'Experience: high to low' },
  { value: 'fee_low', label: 'Fee: low to high' },
  { value: 'fee_high', label: 'Fee: high to low' },
  { value: 'newest', label: 'Newest first' },
];

/* ---------------------------------------------------------------- */
/* Formatting                                                      */
/* ---------------------------------------------------------------- */

/** Formats a number as Indian currency, e.g. 1500 -> "₹1,500". */
export function formatINR(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/** Formats a fee range, collapsing to whichever end was provided. */
export function formatFeeRange(tutor = {}) {
  const monthly = Number(tutor.monthlyFee) || 0;
  const hourly = Number(tutor.hourlyFee) || 0;
  if (monthly > 0 && hourly > 0) return `${formatINR(monthly)}/mo · ${formatINR(hourly)}/hr`;
  if (monthly > 0) return `${formatINR(monthly)}/month`;
  if (hourly > 0) return `${formatINR(hourly)}/hour`;
  return 'Fees on request';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** e.g. 12 Mar 2025 */
export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** e.g. 12 Mar 2025, 4:30 pm */
export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'pm' : 'am';
  const twelve = hours % 12 === 0 ? 12 : hours % 12;
  return `${formatDate(value)}, ${twelve}:${minutes} ${suffix}`;
}

/** "3 days ago", "just now" */
export function timeAgo(value) {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  return formatDate(value);
}

/** Converts "17:30" to "5:30 pm". */
export function formatTime(value) {
  if (!value) return '';
  const [h, m] = String(value).split(':');
  const hours = Number(h);
  if (Number.isNaN(hours)) return '';
  const suffix = hours >= 12 ? 'pm' : 'am';
  const twelve = hours % 12 === 0 ? 12 : hours % 12;
  return `${twelve}:${m} ${suffix}`;
}

/* ---------------------------------------------------------------- */
/* Text                                                             */
/* ---------------------------------------------------------------- */

/** Joins class names, dropping falsy values. */
export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

/** "Aarav Sharma" -> "AS" */
export function initials(name = '') {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase() || 'HT';
}

/** "Mumbai" -> "mumbai" for case-insensitive comparisons. */
export function normalise(value = '') {
  return String(value).trim().toLowerCase();
}

/** Trims and caps a string, used by form handlers. */
export function clamp(value, max = 200) {
  return String(value ?? '').trim().slice(0, max);
}

/** "no results" -> "no results", used for empty-state copy. */
export function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/* ---------------------------------------------------------------- */
/* Data helpers                                                     */
/* ---------------------------------------------------------------- */

/** Average of an array of numbers, rounded to 1 decimal. */
export function average(numbers = []) {
  const valid = numbers.filter((n) => Number.isFinite(Number(n)));
  if (valid.length === 0) return 0;
  const total = valid.reduce((sum, n) => sum + Number(n), 0);
  return Math.round((total / valid.length) * 10) / 10;
}

/** Stable pick from a list, based on a string seed. Used for avatar colours. */
export function hashIndex(text = '', length = 6) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 100000;
  }
  return hash % length;
}

/** Case-insensitive "contains" across a list of haystacks. */
export function matchesSearch(haystacks, needle) {
  if (!needle) return true;
  const target = normalise(needle);
  return haystacks.some((h) => normalise(h).includes(target));
}

/** Sorts a copy of an array by a numeric extractor. */
export function sortByNumber(list, extractor, direction = 'desc') {
  const factor = direction === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => (Number(extractor(a)) || 0) * factor - (Number(extractor(b)) || 0) * factor);
}