import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { employeeApi } from '../../api/employeeApi';
import useFetch from '../../hooks/useFetch';
import { toDateInput } from '../../lib/format';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import EmployeeForm, { EMPTY_EMPLOYEE } from '../../components/employees/EmployeeForm';
import NotFoundPage from '../NotFoundPage';

function toFormValues(employee) {
  return {
    employeeId: employee.employeeId,
    fullName: employee.fullName,
    email: employee.email,
    phone: employee.phone,
    department: employee.department,
    role: employee.role,
    joiningDate: toDateInput(employee.joiningDate),
    status: employee.status,
    skills: employee.skills.join(', '),
    leaveStart: toDateInput(employee.leaveStart),
    leaveEnd: toDateInput(employee.leaveEnd),
  };
}

export default function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const { data: employee, loading, error } = useFetch(
    () => (isEdit ? employeeApi.get(id) : Promise.resolve(null)),
    [id]
  );

  if (isEdit && loading) return <Spinner label="Loading employee..." />;
  if (isEdit && error?.status === 404) return <NotFoundPage />;
  if (isEdit && error) {
    return <EmptyState title="Could not load this employee" message={error.message} />;
  }

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setServerErrors({});
    try {
      const saved = isEdit
        ? await employeeApi.update(id, payload)
        : await employeeApi.create(payload);
      toast.success(isEdit ? 'Employee updated' : 'Employee added');
      navigate(`/employees/${saved._id}`);
    } catch (err) {
      setServerErrors(err.details);
      toast.error(err.message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title={isEdit ? 'Edit employee' : 'Add employee'}
        subtitle={isEdit ? `${employee.fullName} (${employee.employeeId})` : 'Create a record for someone who can take on tasks.'}
      />
      <section className="panel">
        <EmployeeForm
          initialValues={isEdit ? toFormValues(employee) : EMPTY_EMPLOYEE}
          submitLabel={isEdit ? 'Save changes' : 'Add employee'}
          submitting={submitting}
          serverErrors={serverErrors}
          onSubmit={handleSubmit}
          onCancel={() => navigate(isEdit ? `/employees/${id}` : '/employees')}
        />
      </section>
    </>
  );
}
