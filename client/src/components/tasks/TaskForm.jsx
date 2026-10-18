import { useState } from 'react';
import { DEPARTMENTS, TASK_PRIORITIES } from '../../lib/constants';
import { validateTask } from '../../lib/validators';
import FormField from '../common/FormField';
import { formatDate } from '../../lib/format';

export const EMPTY_TASK = {
  title: '',
  description: '',
  assignedEmployee: '',
  department: '',
  priority: 'Medium',
  startDate: '',
  dueDate: '',
};

function employeeLabel(employee) {
  let suffix = '';
  if (employee.status === 'Inactive') suffix = ' (inactive)';
  if (employee.status === 'On Leave') {
    suffix = ` (on leave ${formatDate(employee.leaveStart)} to ${formatDate(employee.leaveEnd)})`;
  }
  return `${employee.fullName} - ${employee.employeeId}${suffix}`;
}

export default function TaskForm({ initialValues = EMPTY_TASK, employees, submitLabel, submitting, serverErrors = {}, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validateTask(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
  };

  const errorFor = (name) => errors[name] || serverErrors[name];
  const fieldProps = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    'aria-invalid': Boolean(errorFor(name)),
  });

  return (
    <form className="form-grid" onSubmit={handleSubmit} noValidate>
      <FormField label="Title" htmlFor="title" error={errorFor('title')} wide>
        <input className="input" maxLength={120} placeholder="Fix the payment API timeout" {...fieldProps('title')} />
      </FormField>

      <FormField label="Assigned employee" htmlFor="assignedEmployee" error={errorFor('assignedEmployee')}>
        <select className="input" {...fieldProps('assignedEmployee')}>
          <option value="">Select employee</option>
          {employees.map((employee) => (
            <option key={employee._id} value={employee._id} disabled={employee.status === 'Inactive'}>
              {employeeLabel(employee)}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Department" htmlFor="department" error={errorFor('department')}>
        <select className="input" {...fieldProps('department')}>
          <option value="">Select department</option>
          {DEPARTMENTS.map((department) => (
            <option key={department}>{department}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Priority" htmlFor="priority" error={errorFor('priority')}>
        <select className="input" {...fieldProps('priority')}>
          {TASK_PRIORITIES.map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Start date" htmlFor="startDate" error={errorFor('startDate')}>
        <input className="input" type="date" {...fieldProps('startDate')} />
      </FormField>

      <FormField label="Due date" htmlFor="dueDate" error={errorFor('dueDate')}>
        <input className="input" type="date" {...fieldProps('dueDate')} />
      </FormField>

      <FormField label="Description" htmlFor="description" error={errorFor('description')} wide>
        <textarea className="input" rows={4} maxLength={1000} placeholder="What needs to happen, and what counts as done?" {...fieldProps('description')} />
      </FormField>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
