import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { taskApi } from '../../api/taskApi';
import { employeeApi } from '../../api/employeeApi';
import useFetch from '../../hooks/useFetch';
import { toDateInput } from '../../lib/format';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import TaskForm, { EMPTY_TASK } from '../../components/tasks/TaskForm';
import NotFoundPage from '../NotFoundPage';

function toFormValues(task) {
  return {
    title: task.title,
    description: task.description,
    assignedEmployee: task.assignee._id || '',
    department: task.department,
    priority: task.priority,
    startDate: toDateInput(task.startDate),
    dueDate: toDateInput(task.dueDate),
  };
}

export default function TaskFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const employees = useFetch(() => employeeApi.lookup(), []);
  const task = useFetch(() => (isEdit ? taskApi.get(id) : Promise.resolve(null)), [id]);

  if (employees.loading || (isEdit && task.loading)) return <Spinner label="Loading form..." />;
  if (isEdit && task.error?.status === 404) return <NotFoundPage />;
  if (task.error || employees.error) {
    return <EmptyState title="Could not load the form" message={(task.error || employees.error).message} />;
  }

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setServerErrors({});
    try {
      const saved = isEdit ? await taskApi.update(id, payload) : await taskApi.create(payload);
      toast.success(isEdit ? 'Task updated' : 'Task created');
      navigate(`/tasks/${saved._id}`);
    } catch (err) {
      setServerErrors(err.details);
      toast.error(err.message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title={isEdit ? 'Edit task' : 'New task'}
        subtitle={isEdit ? task.data.taskCode : 'New tasks start in Todo.'}
      />
      <section className="panel">
        <TaskForm
          initialValues={isEdit ? toFormValues(task.data) : EMPTY_TASK}
          employees={employees.data.data}
          submitLabel={isEdit ? 'Save changes' : 'Create task'}
          submitting={submitting}
          serverErrors={serverErrors}
          onSubmit={handleSubmit}
          onCancel={() => navigate(isEdit ? `/tasks/${id}` : '/tasks')}
        />
      </section>
    </>
  );
}
