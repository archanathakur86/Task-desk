const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPLOYEE_ID_RE = /^[A-Z0-9-]{3,20}$/i;
const PHONE_RE = /^(\d{10}|\+\d{8,15})$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateEmployee(values) {
  const errors = {};

  if (!EMPLOYEE_ID_RE.test(values.employeeId.trim())) {
    errors.employeeId = 'Use 3-20 letters, numbers or hyphens';
  }
  if (values.fullName.trim().length < 2) errors.fullName = 'Name must be at least 2 characters';
  if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email address';
  if (!PHONE_RE.test(values.phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Enter 10 digits, or + with the country code for international numbers';
  }
  if (!values.department) errors.department = 'Select a department';
  if (values.role.trim().length < 2) errors.role = 'Role must be at least 2 characters';
  if (!DATE_RE.test(values.joiningDate)) errors.joiningDate = 'Enter the joining date';

  if (values.status === 'On Leave') {
    if (!values.leaveStart) errors.leaveStart = 'Enter the leave start date';
    if (!values.leaveEnd) errors.leaveEnd = 'Enter the leave end date';
    if (values.leaveStart && values.leaveEnd && values.leaveEnd < values.leaveStart) {
      errors.leaveEnd = 'Leave end cannot be before leave start';
    }
  }

  return errors;
}

export function validateTask(values) {
  const errors = {};

  if (values.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
  if (values.description.length > 1000) errors.description = 'Keep it under 1000 characters';
  if (!values.assignedEmployee) errors.assignedEmployee = 'Select an employee';
  if (!values.department) errors.department = 'Select a department';
  if (!values.priority) errors.priority = 'Select a priority';

  if (!DATE_RE.test(values.startDate)) {
    errors.startDate = 'Enter a start date';
  }
  if (!DATE_RE.test(values.dueDate)) {
    errors.dueDate = 'Enter a due date';
  } else if (DATE_RE.test(values.startDate) && values.dueDate < values.startDate) {
    errors.dueDate = 'Due date cannot be before start date';
  }

  return errors;
}
