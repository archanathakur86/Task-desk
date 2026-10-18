const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
const EMPLOYEE_STATUSES = ['Active', 'Inactive', 'On Leave'];
const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const PRIORITY_RANK = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const TASK_STATUSES = ['Todo', 'In Progress', 'Completed', 'Cancelled'];
const ACTIVE_TASK_STATUSES = ['Todo', 'In Progress'];
const FINAL_TASK_STATUSES = ['Completed', 'Cancelled'];

const STATUS_TRANSITIONS = {
  Todo: ['In Progress', 'Cancelled'],
  'In Progress': ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

const MAX_ACTIVE_TASKS_PER_EMPLOYEE = 3;

module.exports = {
  DEPARTMENTS,
  EMPLOYEE_STATUSES,
  TASK_PRIORITIES,
  PRIORITY_RANK,
  TASK_STATUSES,
  ACTIVE_TASK_STATUSES,
  FINAL_TASK_STATUSES,
  STATUS_TRANSITIONS,
  MAX_ACTIVE_TASKS_PER_EMPLOYEE,
};
