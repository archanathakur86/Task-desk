const STATUS_CLASSES = {
  Todo: 'badge-todo',
  'In Progress': 'badge-progress',
  Completed: 'badge-done',
  Cancelled: 'badge-cancelled',
  Active: 'badge-done',
  Inactive: 'badge-muted',
  'On Leave': 'badge-leave',
  Deleted: 'badge-cancelled',
};

export function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_CLASSES[status] || ''}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={`badge priority-${priority.toLowerCase()}`}>{priority}</span>;
}

export function OverdueBadge() {
  return <span className="badge badge-overdue">Overdue</span>;
}
