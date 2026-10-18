import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { employeeApi } from '../../api/employeeApi';
import { taskApi } from '../../api/taskApi';
import useFetch from '../../hooks/useFetch';
import { formatDate } from '../../lib/format';
import { MAX_ACTIVE_TASKS } from '../../lib/constants';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { OverdueBadge, StatusBadge } from '../../components/common/Badges';
import NotFoundPage from '../NotFoundPage';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const employee = useFetch(() => employeeApi.get(id), [id]);
  const tasks = useFetch(() => taskApi.list({ assignee: id, limit: 50, sort: 'dueDate', order: 'asc' }), [id]);

  if (employee.loading) return <Spinner label="Loading employee..." />;
  if (employee.error?.status === 404) return <NotFoundPage />;
  if (employee.error) return <EmptyState title="Could not load this employee" message={employee.error.message} />;

  const profile = employee.data;
  const activeTasks = profile.activeTasks;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeApi.remove(id);
      toast.success('Employee removed');
      navigate('/employees');
    } catch (err) {
      toast.error(err.message);
      setConfirmOpen(false);
      setDeleting(false);
    }
  };

  return (
    <>
      <Link to="/employees" className="back-link">Back to employees</Link>
      <PageHeader title={profile.fullName} subtitle={`${profile.role} in ${profile.department}`}>
        <Link to={`/employees/${id}/edit`} className="btn btn-ghost">
          Edit
        </Link>
        <button type="button" className="btn btn-danger" onClick={() => setConfirmOpen(true)}>
          Delete
        </button>
      </PageHeader>

      <div className="detail-grid">
        <section className="panel">
          <h2>Profile</h2>
          <dl className="detail-list">
            <dt>Employee ID</dt>
            <dd>{profile.employeeId}</dd>
            <dt>Email</dt>
            <dd>{profile.email}</dd>
            <dt>Phone</dt>
            <dd>{profile.phone}</dd>
            <dt>Joined</dt>
            <dd>{formatDate(profile.joiningDate)}</dd>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={profile.status} />
            </dd>
            {profile.status === 'On Leave' && (
              <>
                <dt>Leave period</dt>
                <dd>
                  {formatDate(profile.leaveStart)} to {formatDate(profile.leaveEnd)}
                </dd>
              </>
            )}
          </dl>

          {profile.skills.length > 0 && (
            <>
              <h3>Skills</h3>
              <ul className="chip-list">
                {profile.skills.map((skill) => (
                  <li key={skill} className="chip">
                    {skill}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="panel">
          <h2>Current load</h2>
          <p className="big-number">
            {activeTasks} <span className="muted">of {MAX_ACTIVE_TASKS} active tasks</span>
          </p>
          <progress max={MAX_ACTIVE_TASKS} value={activeTasks} aria-label="Active task load" />
        </section>
      </div>

      <section className="panel">
        <h2>Assigned tasks</h2>
        {tasks.loading && !tasks.data ? (
          <Spinner label="Loading tasks..." />
        ) : tasks.data?.data.length ? (
          <ul className="simple-list">
            {tasks.data.data.map((task) => (
              <li key={task._id}>
                <Link to={`/tasks/${task._id}`} className="row-link">
                  {task.title}
                </Link>
                <span className="muted small-text">Due {formatDate(task.dueDate)}</span>
                <StatusBadge status={task.status} />
                {task.isOverdue && <OverdueBadge />}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No tasks assigned yet.</p>
        )}
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Remove this employee?"
        message="Removal is blocked while they have Todo or In Progress tasks. Past tasks keep their name."
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
