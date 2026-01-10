export function notify({ type = 'success', message = '' }) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('notify', { detail: { type, message } }));
}
