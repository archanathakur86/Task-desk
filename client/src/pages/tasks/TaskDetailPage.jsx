import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { taskApi } from '../../api/taskApi';
import useFetch from '../../hooks/useFetch';
import { formatDate } from '../../lib/format';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { OverdueBadge, PriorityBadge, StatusBadge } from '../../components/common/Badges';
import StatusSelect from '../../components/tasks/StatusSelect';
import TaskTimeline from '../../components/tasks/TaskTimeline';
import NotFoundPage from '../NotFoundPage';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { data: task, loading, error, reload } = useFetch(() => taskApi.get(id), [id]);

  if (loading && !task) return <Spinner label="Loading task..." />;
  if (error?.status === 404) return <NotFoundPage />;
  if (error) return <EmptyState title="Could not load this task" message={error.message} />;

  const isLocked = ['Completed', 'Cancelled'].includes(task.status);

  const handleStatusChange = async (status) => {
    try {
      await taskApi.changeStatus(id, status);
      toast.success(`Moved to ${status}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      reload();
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await taskApi.remove(id);
      toast.success('Task deleted');
      navigate('/tasks');
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Link to="/tasks" className="back-link">Back to tasks</Link>
      <PageHeader title={task.title} subtitle={task.taskCode}>
        {!isLocked && (
          <Link to={`/tasks/${id}/edit`} className="btn btn-ghost">
            Edit
          </Link>
        )}
        <button type="button" className="btn btn-danger" onClick={() => setConfirmOpen(true)}>
          Delete
        </button>
      </PageHeader>

      <div className="badge-row">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
        {task.isOverdue && <OverdueBadge />}
      </div>

      <section className="panel">
        <h2>Progress</h2>
        <TaskTimeline
          status={task.status}
          startDate={task.startDate}
          dueDate={task.dueDate}
          completedDate={task.completedDate}
        />
        <div className="status-change">
          <label htmlFor="status-select">Move this task</label>
          <StatusSelect id="status-select" status={task.status} onChange={handleStatusChange} />
          {isLocked && <small className="hint">Finished tasks are locked and cannot be edited.</small>}
        </div>
      </section>

      <div className="detail-grid">
        <section className="panel">
          <h2>Details</h2>
          <dl className="detail-list">
            <dt>Department</dt>
            <dd>{task.department}</dd>
            <dt>Start date</dt>
            <dd>{formatDate(task.startDate)}</dd>
            <dt>Due date</dt>
            <dd>{formatDate(task.dueDate)}</dd>
            <dt>Completed</dt>
            <dd>{formatDate(task.completedDate)}</dd>
            <dt>Created</dt>
            <dd>{formatDate(task.createdAt)}</dd>
          </dl>
          {task.description && (
            <>
              <h3>Description</h3>
              <p className="description">{task.description}</p>
            </>
          )}
        </section>

        <section className="panel">
          <h2>Assignee</h2>
          <p className="assignee-name">{task.assignee.fullName}</p>
          {task.assignee.isDeleted ? (
            <p className="muted">
              This employee has been removed. The name above is from when the task was assigned.
            </p>
          ) : (
            <>
              <p className="muted">
                {task.assignee.employeeId} - {task.assignee.department}
              </p>
              <p className="muted">{task.assignee.email}</p>
              <Link to={`/employees/${task.assignee._id}`} className="row-link">
                View employee
              </Link>
            </>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this task?"
        message="This cannot be undone."
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
