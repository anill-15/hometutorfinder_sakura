import { useEffect, useState } from 'react';

/**
 * Transient messages shown in the bottom-right corner. Replaces browser
 * alert() calls with something that looks like part of the product.
 */

let nextId = 1;
const listeners = new Set();
const toasts = [];

const emit = () => listeners.forEach((fn) => fn([...toasts]));

function pushToast(message, variant = 'success', duration = 3800) {
  const id = nextId++;
  toasts.push({ id, message, variant });
  emit();
  if (duration > 0) {
    setTimeout(() => dismissToast(id), duration);
  }
  return id;
}

export function dismissToast(id) {
  const index = toasts.findIndex((t) => t.id === id);
  if (index === -1) return;
  toasts.splice(index, 1);
  emit();
}

export const toast = {
  success: (message) => pushToast(message, 'success'),
  error: (message) => pushToast(message, 'error', 5000),
  info: (message) => pushToast(message, 'info'),
  warning: (message) => pushToast(message, 'warning', 4500),
};

export function useToasts() {
  const [items, setItems] = useState([...toasts]);
  useEffect(() => {
    listeners.add(setItems);
    return () => listeners.delete(setItems);
  }, []);
  return items;
}

export default toast;