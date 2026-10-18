const mongoose = require('mongoose');
const { DEPARTMENTS, EMPLOYEE_STATUSES, TASK_PRIORITIES, TASK_STATUSES } = require('../constants');
const { parseDateOnly } = require('../utils/dates');
const { badRequest } = require('../utils/httpError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPLOYEE_ID_RE = /^[A-Z0-9-]{3,20}$/;
const PHONE_RE = /^(\d{10}|\+\d{8,15})$/;

const text = (value) => (typeof value === 'string' ? value.trim() : '');

function validateEmployee(body = {}) {
  const errors = {};
  const employeeId = text(body.employeeId).toUpperCase();
  const fullName = text(body.fullName);
  const email = text(body.email).toLowerCase();
  const phone = text(body.phone).replace(/[\s-]/g, '');
  const department = text(body.department);
  const role = text(body.role);
  const status = text(body.status) || 'Active';
  const joiningDate = parseDateOnly(body.joiningDate);
  const skills = Array.isArray(body.skills) ? body.skills.map(text).filter(Boolean) : [];

  let leaveStart = null;
  let leaveEnd = null;

  if (!EMPLOYEE_ID_RE.test(employeeId)) errors.employeeId = 'Use 3-20 letters, numbers or hyphens';
  if (fullName.length < 2 || fullName.length > 80) errors.fullName = 'Name must be 2-80 characters';
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address';
  if (!PHONE_RE.test(phone)) {
    errors.phone = 'Enter 10 digits, or + with the country code for international numbers';
  }
  if (!DEPARTMENTS.includes(department)) errors.department = 'Select a department';
  if (role.length < 2 || role.length > 60) errors.role = 'Role must be 2-60 characters';
  if (!joiningDate) errors.joiningDate = 'Enter a valid joining date';
  if (!EMPLOYEE_STATUSES.includes(status)) errors.status = 'Select a valid status';
  if (skills.length > 20) errors.skills = 'Add at most 20 skills';

  if (status === 'On Leave') {
    leaveStart = parseDateOnly(body.leaveStart);
    leaveEnd = parseDateOnly(body.leaveEnd);
    if (!leaveStart) errors.leaveStart = 'Enter the leave start date';
    if (!leaveEnd) errors.leaveEnd = 'Enter the leave end date';
    if (leaveStart && leaveEnd && leaveEnd < leaveStart) {
      errors.leaveEnd = 'Leave end cannot be before leave start';
    }
  }

  return {
    errors,
    values: {
      employeeId,
      fullName,
      email,
      phone,
      department,
      role,
      joiningDate,
      status,
      skills,
      leaveStart,
      leaveEnd,
    },
  };
}

const isObjectId = (value) => mongoose.isValidObjectId(value) && /^[a-f\d]{24}$/i.test(value);

function validateTask(body = {}) {
  const errors = {};
  const title = text(body.title);
  const description = text(body.description);
  const assignedEmployee = text(body.assignedEmployee);
  const department = text(body.department);
  const priority = text(body.priority);
  const startDate = parseDateOnly(body.startDate);
  const dueDate = parseDateOnly(body.dueDate);

  if (title.length < 3 || title.length > 120) errors.title = 'Title must be 3-120 characters';
  if (description.length > 1000) errors.description = 'Description cannot exceed 1000 characters';
  if (!isObjectId(assignedEmployee)) errors.assignedEmployee = 'Select an employee';
  if (!DEPARTMENTS.includes(department)) errors.department = 'Select a department';
  if (!TASK_PRIORITIES.includes(priority)) errors.priority = 'Select a priority';
  if (!startDate) errors.startDate = 'Enter a valid start date';
  if (!dueDate) errors.dueDate = 'Enter a valid due date';
  if (startDate && dueDate && dueDate < startDate) {
    errors.dueDate = 'Due date cannot be before start date';
  }

  return {
    errors,
    values: { title, description, assignedEmployee, department, priority, startDate, dueDate },
  };
}

function validateStatusInput(body = {}) {
  const status = text(body.status);
  if (!TASK_STATUSES.includes(status)) {
    return { errors: { status: 'Select a valid status' }, values: null };
  }
  return { errors: {}, values: { status } };
}

function assertValid({ errors, values }) {
  if (Object.keys(errors).length > 0) {
    throw badRequest('Please fix the highlighted fields', errors);
  }
  return values;
}

module.exports = { validateEmployee, validateTask, validateStatusInput, assertValid, isObjectId };
