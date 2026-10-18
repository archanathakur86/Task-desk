import { Link } from 'react-router-dom';
import { OverdueBadge, PriorityBadge } from '../common/Badges';
import SortableHeader from '../common/SortableHeader';
import StatusSelect from './StatusSelect';
import { formatDate } from '../../lib/format';

export default function TaskTable({ tasks, sort, order, onSort, onStatusChange, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <SortableHeader label="Task" field="title" sort={sort} order={order} onSort={onSort} />
            <th scope="col">Assignee</th>
            <th scope="col">Department</th>
            <SortableHeader label="Priority" field="priority" sort={sort} order={order} onSort={onSort} />
            <th scope="col">Status</th>
            <SortableHeader label="Due" field="dueDate" sort={sort} order={order} onSort={onSort} />
            <SortableHeader label="Created" field="createdAt" sort={sort} order={order} onSort={onSort} />
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task._id}>
              <td>
                <Link to={`/tasks/${task._id}`} className="row-link">
                  {task.title}
                </Link>
                <span className="muted small-text">{task.taskCode}</span>
              </td>
              <td>
                {task.assignee.fullName}
                {task.assignee.isDeleted && <span className="muted small-text">Removed employee</span>}
              </td>
              <td>{task.department}</td>
              <td>
                <PriorityBadge priority={task.priority} />
              </td>
              <td>
                <StatusSelect status={task.status} onChange={(next) => onStatusChange(task, next)} />
              </td>
              <td>
                {formatDate(task.dueDate)}
                {task.isOverdue && <OverdueBadge />}
              </td>
              <td>{formatDate(task.createdAt)}</td>
              <td className="row-actions">
                <Link to={`/tasks/${task._id}`} className="btn btn-small btn-ghost">
                  View
                </Link>
                {!['Completed', 'Cancelled'].includes(task.status) && (
                  <Link to={`/tasks/${task._id}/edit`} className="btn btn-small btn-ghost">
                    Edit
                  </Link>
                )}
                <button type="button" className="btn btn-small btn-ghost-danger" onClick={() => onDelete(task)}>
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
