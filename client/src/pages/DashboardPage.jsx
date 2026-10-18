import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi';
import useFetch from '../hooks/useFetch';
import PageHeader from '../components/common/PageHeader';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import StatCard from '../components/dashboard/StatCard';
import WorkloadTable from '../components/dashboard/WorkloadTable';
import { MAX_ACTIVE_TASKS } from '../lib/constants';

export default function DashboardPage() {
  const { data, loading, error, reload } = useFetch(() => dashboardApi.get(), []);

  if (loading && !data) return <Spinner label="Loading dashboard..." />;
  if (error) {
    return (
      <EmptyState
        title="Dashboard is unavailable"
        message={error.message}
        action={<button type="button" className="btn btn-primary" onClick={reload}>Try again</button>}
      />
    );
  }

  const { employees, tasks, workload } = data;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Who is working on what, and what is running late." />

      <section className="stat-section" aria-label="Employees">
        <h2>Employees</h2>
        <div className="card-grid">
          <StatCard label="Total employees" value={employees.total} />
          <StatCard label="Active" value={employees.Active} tone="good" />
          <StatCard label="Inactive" value={employees.Inactive} tone="muted" />
          <StatCard label="On leave" value={employees['On Leave']} tone="warm" />
        </div>
      </section>

      <section className="stat-section" aria-label="Tasks">
        <h2>Tasks</h2>
        <div className="card-grid">
          <StatCard label="Total tasks" value={tasks.total} />
          <StatCard label="Todo" value={tasks.Todo} />
          <StatCard label="In progress" value={tasks['In Progress']} tone="accent" />
          <StatCard label="Completed" value={tasks.Completed} tone="good" />
          <StatCard label="Cancelled" value={tasks.Cancelled} tone="muted" />
          <StatCard label="Overdue" value={tasks.overdue} tone="alert" />
        </div>
      </section>

      <section className="panel" aria-label="Employee workload">
        <div className="panel-head">
          <h2>Workload</h2>
          <Link to="/tasks/new" className="btn btn-primary btn-small">
            New task
          </Link>
        </div>
        <p className="muted">Each employee can hold up to {MAX_ACTIVE_TASKS} active tasks at a time.</p>
        {workload.length === 0 ? (
          <EmptyState title="No employees yet" message="Add an employee to start assigning work." />
        ) : (
          <WorkloadTable rows={workload} capacity={MAX_ACTIVE_TASKS} />
        )}
      </section>
    </>
  );
}
