import { useState } from 'react';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../../lib/constants';
import { validateEmployee } from '../../lib/validators';
import FormField from '../common/FormField';

export const EMPTY_EMPLOYEE = {
  employeeId: '',
  fullName: '',
  email: '',
  phone: '',
  department: '',
  role: '',
  joiningDate: '',
  status: 'Active',
  skills: '',
  leaveStart: '',
  leaveEnd: '',
};

export default function EmployeeForm({ initialValues = EMPTY_EMPLOYEE, submitLabel, submitting, serverErrors = {}, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validateEmployee(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const onLeave = values.status === 'On Leave';
    onSubmit({
      ...values,
      skills: values.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      leaveStart: onLeave ? values.leaveStart : '',
      leaveEnd: onLeave ? values.leaveEnd : '',
    });
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
      <FormField label="Employee ID" htmlFor="employeeId" error={errorFor('employeeId')}>
        <input className="input" maxLength={20} placeholder="EMP-014" {...fieldProps('employeeId')} />
      </FormField>

      <FormField label="Full name" htmlFor="fullName" error={errorFor('fullName')}>
        <input className="input" maxLength={80} {...fieldProps('fullName')} />
      </FormField>

      <FormField label="Email" htmlFor="email" error={errorFor('email')}>
        <input className="input" type="email" {...fieldProps('email')} />
      </FormField>

      <FormField label="Phone" htmlFor="phone" error={errorFor('phone')}>
        <input className="input" type="tel" placeholder="9876543210 or +44 7700 900123" {...fieldProps('phone')} />
      </FormField>

      <FormField label="Department" htmlFor="department" error={errorFor('department')}>
        <select className="input" {...fieldProps('department')}>
          <option value="">Select department</option>
          {DEPARTMENTS.map((department) => (
            <option key={department}>{department}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Role" htmlFor="role" error={errorFor('role')}>
        <input className="input" maxLength={60} placeholder="Frontend developer" {...fieldProps('role')} />
      </FormField>

      <FormField label="Joining date" htmlFor="joiningDate" error={errorFor('joiningDate')}>
        <input className="input" type="date" {...fieldProps('joiningDate')} />
      </FormField>

      <FormField label="Status" htmlFor="status" error={errorFor('status')}>
        <select className="input" {...fieldProps('status')}>
          {EMPLOYEE_STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </FormField>

      {values.status === 'On Leave' && (
        <>
          <FormField label="Leave starts" htmlFor="leaveStart" error={errorFor('leaveStart')}>
            <input className="input" type="date" {...fieldProps('leaveStart')} />
          </FormField>
          <FormField label="Leave ends" htmlFor="leaveEnd" error={errorFor('leaveEnd')}>
            <input className="input" type="date" {...fieldProps('leaveEnd')} />
          </FormField>
        </>
      )}

      <FormField label="Skills" htmlFor="skills" error={errorFor('skills')} wide>
        <input className="input" placeholder="React, Node.js, MongoDB" {...fieldProps('skills')} />
        <small className="hint">Separate skills with commas.</small>
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
