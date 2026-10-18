import { STATUS_TRANSITIONS } from '../../lib/constants';

export default function StatusSelect({ id, status, onChange, disabled = false }) {
  const options = [status, ...(STATUS_TRANSITIONS[status] || [])];
  const locked = disabled || options.length === 1;

  return (
    <select
      id={id}
      className="input input-compact"
      value={status}
      disabled={locked}
      aria-label="Task status"
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
