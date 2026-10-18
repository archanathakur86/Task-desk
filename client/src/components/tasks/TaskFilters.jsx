import { DEPARTMENTS, TASK_PRIORITIES, TASK_STATUSES } from '../../lib/constants';
import SearchInput from '../common/SearchInput';

export default function TaskFilters({ params, onChange, onReset }) {
  return (
    <div className="filter-bar filter-bar-tasks">
      <SearchInput value={params.search} placeholder="Search task or employee" onSearch={(search) => onChange({ search })} />

      <select className="input" value={params.department} onChange={(e) => onChange({ department: e.target.value })} aria-label="Department">
        <option value="">All departments</option>
        {DEPARTMENTS.map((department) => (
          <option key={department}>{department}</option>
        ))}
      </select>

      <select className="input" value={params.priority} onChange={(e) => onChange({ priority: e.target.value })} aria-label="Priority">
        <option value="">All priorities</option>
        {TASK_PRIORITIES.map((priority) => (
          <option key={priority}>{priority}</option>
        ))}
      </select>

      <select className="input" value={params.status} onChange={(e) => onChange({ status: e.target.value })} aria-label="Status">
        <option value="">All statuses</option>
        {TASK_STATUSES.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </select>

      <label className="date-filter">
        <span>Due from</span>
        <input className="input" type="date" value={params.dueFrom} onChange={(e) => onChange({ dueFrom: e.target.value })} />
      </label>

      <label className="date-filter">
        <span>Due to</span>
        <input className="input" type="date" value={params.dueTo} onChange={(e) => onChange({ dueTo: e.target.value })} />
      </label>

      <button type="button" className="btn btn-ghost" onClick={onReset}>
        Clear filters
      </button>
    </div>
  );
}
