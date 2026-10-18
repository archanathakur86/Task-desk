import { Link } from 'react-router-dom';
import { StatusBadge } from '../common/Badges';
import SortableHeader from '../common/SortableHeader';
import { formatDate } from '../../lib/format';

export default function EmployeeTable({ employees, sort, order, onSort, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <SortableHeader label="Name" field="name" sort={sort} order={order} onSort={onSort} />
            <th scope="col">Department</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <SortableHeader label="Joined" field="joiningDate" sort={sort} order={order} onSort={onSort} />
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee._id}>
              <td>{employee.employeeId}</td>
              <td>
                <Link to={`/employees/${employee._id}`} className="row-link">
                  {employee.fullName}
                </Link>
                <span className="muted small-text">{employee.email}</span>
              </td>
              <td>{employee.department}</td>
              <td>{employee.role}</td>
              <td>
                <StatusBadge status={employee.status} />
              </td>
              <td>{formatDate(employee.joiningDate)}</td>
              <td className="row-actions">
                <Link to={`/employees/${employee._id}/edit`} className="btn btn-small btn-ghost">
                  Edit
                </Link>
                <button type="button" className="btn btn-small btn-ghost-danger" onClick={() => onDelete(employee)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
