import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { taskApi } from '../../api/taskApi';
import useFetch from '../../hooks/useFetch';
import useSearchParamsState from '../../hooks/useSearchParamsState';
import { PAGE_SIZE } from '../../lib/constants';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TaskFilters from '../../components/tasks/TaskFilters';
import TaskTable from '../../components/tasks/TaskTable';

const DEFAULTS = {
  search: '',
  department: '',
  priority: '',
  status: '',
  dueFrom: '',
  dueTo: '',
  sort: 'createdAt',
  order: 'desc',
  page: '1',
};

const RESET_FILTERS = { search: '', department: '', priority: '', status: '', dueFrom: '', dueTo: '' };

export default function TaskListPage() {
  const { params, updateParams } = useSearchParamsState(DEFAULTS);
  const { data, loading, error, reload } = useFetch(
    () => taskApi.list({ ...params, limit: PAGE_SIZE }),
    [params]
  );
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleSort = (field) => {
    const order = params.sort === field && params.order === 'asc' ? 'desc' : 'asc';
    updateParams({ sort: field, order });
  };

  const handleStatusChange = async (task, status) => {
    try {
      await taskApi.changeStatus(task._id, status);
      toast.success(`Moved to ${status}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      reload();
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await taskApi.remove(pendingDelete._id);
      toast.success('Task deleted');
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const { page, ...filters } = params;
  const hasFilters = Object.entries(filters).some(([key, value]) => value && !['sort', 'order'].includes(key));

  return (
    <>
      <PageHeader title="Tasks" subtitle="Assign work, track progress and keep an eye on deadlines.">
        <a className="btn btn-ghost" href={taskApi.exportUrl(filters)} download>
          Export CSV
        </a>
        <Link to="/tasks/new" className="btn btn-primary">
          New task
        </Link>
      </PageHeader>

      <TaskFilters params={params} onChange={updateParams} onReset={() => updateParams(RESET_FILTERS)} />

      {loading && !data ? (
        <Spinner label="Loading tasks..." />
      ) : error ? (
        <EmptyState
          title="Could not load tasks"
          message={error.message}
          action={<button type="button" className="btn btn-primary" onClick={reload}>Try again</button>}
        />
      ) : data.data.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No tasks match these filters' : 'No tasks yet'}
          message={hasFilters ? 'Clear a filter to see more.' : 'Create a task and assign it to someone.'}
        />
      ) : (
        <>
          <TaskTable
            tasks={data.data}
            sort={params.sort}
            order={params.order}
            onSort={handleSort}
            onStatusChange={handleStatusChange}
            onDelete={setPendingDelete}
          />
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onChange={(next) => updateParams({ page: String(next) }, { resetPage: false })}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this task?"
        message={`"${pendingDelete?.title || ''}" will be permanently deleted.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
