import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../../lib/constants';
import SearchInput from '../common/SearchInput';

export default function EmployeeFilters({ params, onChange, onReset }) {
  return (
    <div className="filter-bar">
      <SearchInput value={params.search} placeholder="Search name, email or ID" onSearch={(search) => onChange({ search })} />

      <select className="input" value={params.department} onChange={(e) => onChange({ department: e.target.value })} aria-label="Department">
        <option value="">All departments</option>
        {DEPARTMENTS.map((department) => (
          <option key={department} value={department}>
            {department}
          </option>
        ))}
      </select>

      <select className="input" value={params.status} onChange={(e) => onChange({ status: e.target.value })} aria-label="Status">
        <option value="">All statuses</option>
        {EMPLOYEE_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <button type="button" className="btn btn-ghost" onClick={onReset}>
        Clear filters
      </button>
    </div>
  );
}
