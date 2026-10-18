export function toDateInput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
