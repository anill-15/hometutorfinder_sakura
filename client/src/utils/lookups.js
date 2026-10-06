/**
 * lookups.js
 * ---------------------------------------------------------------------------
 * Small helpers for turning the id references used in the data (city ids) into
 * human-readable names, and for listing the available options in dropdowns.
 */

import { CITIES, SUBJECTS } from './seedData.js';

const cityById = new Map(CITIES.map((c) => [c.id, c]));

/** City name for a city id, or an empty string. */
export const cityName = (id) => cityById.get(id)?.name || '';

/** Full locality list for a city id. */
export const cityLocalities = (id) => cityById.get(id)?.localities || [];

/** "Indiranagar, Bangalore" from a city id + locality. */
export const formatPlace = (cityId, locality) => {
  const city = cityName(cityId);
  if (locality && city) return `${locality}, ${city}`;
  return locality || city || '';
};

/** Dropdown options. */
export const cityOptions = (includeAll = false) => [
  ...(includeAll ? [{ value: '', label: 'All cities' }] : []),
  ...CITIES.map((c) => ({ value: c.id, label: `${c.name}, ${c.state}` })),
];

export const subjectOptions = () => SUBJECTS.map((s) => ({ value: s.name, label: s.name }));

export { CITIES, SUBJECTS };