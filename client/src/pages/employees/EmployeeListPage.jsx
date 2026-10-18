import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { employeeApi } from '../../api/employeeApi';
import useFetch from '../../hooks/useFetch';
import useSearchParamsState from '../../hooks/useSearchParamsState';
import { PAGE_SIZE } from '../../lib/constants';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmployeeFilters from '../../components/employees/EmployeeFilters';
import EmployeeTable from '../../components/employees/EmployeeTable';

const DEFAULTS = { search: '', department: '', status: '', sort: 'name', order: 'asc', page: '1' };

export default function EmployeeListPage() {
  const { params, updateParams } = useSearchParamsState(DEFAULTS);
  const { data, loading, error, reload } = useFetch(
    () => employeeApi.list({ ...params, limit: PAGE_SIZE }),
    [params]
  );
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleSort = (field) => {
    const order = params.sort === field && params.order === 'asc' ? 'desc' : 'asc';
    updateParams({ sort: field, order });
  };

  const handleReset = () => updateParams({ search: '', department: '', status: '', sort: 'name', order: 'asc' });

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await employeeApi.remove(pendingDelete._id);
      toast.success(`${pendingDelete.fullName} was removed`);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const hasFilters = useMemo(
    () => Boolean(params.search || params.department || params.status),
    [params]
  );

  return (
    <>
      <PageHeader title="Employees" subtitle="Everyone who can be assigned work.">
        <Link to="/employees/new" className="btn btn-primary">
          Add employee
        </Link>
      </PageHeader>

      <EmployeeFilters params={params} onChange={updateParams} onReset={handleReset} />

      {loading && !data ? (
        <Spinner label="Loading employees..." />
      ) : error ? (
        <EmptyState
          title="Could not load employees"
          message={error.message}
          action={<button type="button" className="btn btn-primary" onClick={reload}>Try again</button>}
        />
      ) : data.data.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No employees match these filters' : 'No employees yet'}
          message={hasFilters ? 'Try a different search or clear the filters.' : 'Add your first employee to get started.'}
        />
      ) : (
        <>
          <EmployeeTable
            employees={data.data}
            sort={params.sort}
            order={params.order}
            onSort={handleSort}
            onDelete={setPendingDelete}
          />
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onChange={(page) => updateParams({ page: String(page) }, { resetPage: false })}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this employee?"
        message={`${pendingDelete?.fullName || ''} will be removed. This is blocked if they still have Todo or In Progress tasks.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
