import { StatusBadge } from '../common/Badges';

export default function WorkloadTable({ rows, capacity }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Employee</th>
            <th scope="col">Status</th>
            <th scope="col">Active tasks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id}>
              <td>
                <strong>{row.fullName}</strong>
                <span className="muted small-text"> {row.employeeId}</span>
              </td>
              <td>
                <StatusBadge status={row.status} />
              </td>
              <td className="workload-cell">
                <progress max={capacity} value={row.activeTasks} aria-label={`${row.activeTasks} of ${capacity}`} />
                <span>
                  {row.activeTasks} / {capacity}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
