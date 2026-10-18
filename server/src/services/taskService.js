const Task = require('../models/Task');
const Employee = require('../models/Employee');
const Counter = require('../models/Counter');
const {
  ACTIVE_TASK_STATUSES,
  FINAL_TASK_STATUSES,
  STATUS_TRANSITIONS,
  MAX_ACTIVE_TASKS_PER_EMPLOYEE,
} = require('../constants');
const { badRequest, notFound, conflict } = require('../utils/httpError');
const { readParam, parsePagination, buildPaginationMeta } = require('../utils/query');
const { escapeRegex, toCsv } = require('../utils/text');
const { parseDateOnly, startOfTodayUTC, formatDateOnly } = require('../utils/dates');
const { isObjectId } = require('../validators');

const SORT_FIELDS = { createdAt: 'createdAt', dueDate: 'dueDate', priority: 'priorityRank', title: 'titleKey' };
const EMPLOYEE_FIELDS = 'employeeId fullName email department status';
const CSV_HEADERS = [
  'Task Code',
  'Title',
  'Assigned To',
  'Department',
  'Priority',
  'Status',
  'Start Date',
  'Due Date',
  'Overdue',
  'Completed Date',
  'Created Date',
];

const EDITABLE_FIELDS = [
  'title',
  'description',
  'assignedEmployee',
  'assigneeSnapshot',
  'department',
  'priority',
  'priorityRank',
  'titleKey',
  'startDate',
  'dueDate',
];

const isActive = (status) => ACTIVE_TASK_STATUSES.includes(status);
const isOverdue = (task) =>
  !FINAL_TASK_STATUSES.includes(task.status) && new Date(task.dueDate) < startOfTodayUTC();

function serializeTask(task) {
  const employee = task.assignedEmployee;
  const assignee = employee
    ? {
        _id: employee._id,
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        email: employee.email,
        department: employee.department,
        status: employee.status,
        isDeleted: false,
      }
    : {
        _id: null,
        employeeId: task.assigneeSnapshot?.employeeId || '',
        fullName: task.assigneeSnapshot?.fullName || 'Deleted employee',
        email: '',
        department: task.department,
        status: 'Deleted',
        isDeleted: true,
      };

  return {
    _id: task._id,
    taskCode: task.taskCode,
    title: task.title,
    description: task.description,
    department: task.department,
    priority: task.priority,
    status: task.status,
    startDate: task.startDate,
    dueDate: task.dueDate,
    completedDate: task.completedDate,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    assignee,
    isOverdue: isOverdue(task),
  };
}

async function buildTaskFilter(query) {
  const filter = {};
  const department = readParam(query, 'department');
  const priority = readParam(query, 'priority');
  const status = readParam(query, 'status');
  const assignee = readParam(query, 'assignee');
  const search = readParam(query, 'search');
  const dueFrom = readParam(query, 'dueFrom');
  const dueTo = readParam(query, 'dueTo');

  if (department) filter.department = department;
  if (priority) filter.priority = priority;
  if (status) filter.status = status;

  if (assignee) {
    if (!isObjectId(assignee)) throw badRequest('Invalid employee id');
    filter.assignedEmployee = assignee;
  }

  if (dueFrom || dueTo) {
    filter.dueDate = {};
    if (dueFrom) {
      const from = parseDateOnly(dueFrom);
      if (!from) throw badRequest('dueFrom must be a valid date (YYYY-MM-DD)');
      filter.dueDate.$gte = from;
    }
    if (dueTo) {
      const to = parseDateOnly(dueTo);
      if (!to) throw badRequest('dueTo must be a valid date (YYYY-MM-DD)');
      filter.dueDate.$lte = to;
    }
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    const matchingEmployees = await Employee.find({ fullName: pattern }, '_id').lean();
    filter.$or = [
      { title: pattern },
      { 'assigneeSnapshot.fullName': pattern },
      { assignedEmployee: { $in: matchingEmployees.map((employee) => employee._id) } },
    ];
  }

  return filter;
}

async function listTasks(query) {
  const filter = await buildTaskFilter(query);
  const sortField = SORT_FIELDS[readParam(query, 'sort')] || 'createdAt';
  const direction = readParam(query, 'order') === 'asc' ? 1 : -1;
  const { page, limit, skip } = parsePagination(query);

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({ [sortField]: direction, _id: direction })
      .skip(skip)
      .limit(limit)
      .populate('assignedEmployee', EMPLOYEE_FIELDS)
      .lean(),
    Task.countDocuments(filter),
  ]);

  return {
    data: tasks.map(serializeTask),
    pagination: buildPaginationMeta(page, limit, total),
  };
}

async function exportTasksCsv(query) {
  const filter = await buildTaskFilter(query);
  const tasks = await Task.find(filter)
    .sort({ createdAt: -1 })
    .populate('assignedEmployee', EMPLOYEE_FIELDS)
    .lean();

  const rows = tasks.map(serializeTask).map((task) => [
    task.taskCode,
    task.title,
    task.assignee.fullName,
    task.department,
    task.priority,
    task.status,
    formatDateOnly(task.startDate),
    formatDateOnly(task.dueDate),
    task.isOverdue ? 'Yes' : 'No',
    formatDateOnly(task.completedDate),
    formatDateOnly(task.createdAt),
  ]);

  return toCsv(CSV_HEADERS, rows);
}

async function getTask(id) {
  const task = await Task.findById(id).populate('assignedEmployee', EMPLOYEE_FIELDS).lean();
  if (!task) throw notFound('Task not found');
  return serializeTask(task);
}

async function findTaskOrFail(id) {
  const task = await Task.findById(id);
  if (!task) throw notFound('Task not found');
  return task;
}

async function nextTaskCode() {
  const counter = await Counter.findByIdAndUpdate(
    'task',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `TSK-${String(counter.seq).padStart(3, '0')}`;
}

async function loadAssignableEmployee(employeeId, startDate) {
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw badRequest('Selected employee does not exist', { assignedEmployee: 'Employee not found' });
  }

  if (employee.status === 'Inactive') {
    const message = `${employee.fullName} is inactive and cannot be assigned tasks`;
    throw badRequest(message, { assignedEmployee: 'Employee is inactive' });
  }

  const onLeave =
    employee.status === 'On Leave' &&
    employee.leaveStart &&
    employee.leaveEnd &&
    startDate >= employee.leaveStart &&
    startDate <= employee.leaveEnd;

  if (onLeave) {
    const from = formatDateOnly(employee.leaveStart);
    const to = formatDateOnly(employee.leaveEnd);
    const message = `${employee.fullName} is on leave from ${from} to ${to}. Pick a start date outside that period.`;
    throw badRequest(message, { assignedEmployee: 'Employee is on leave on this start date' });
  }

  return employee;
}

function countActiveTasks(employeeId, excludeTaskId) {
  const filter = { assignedEmployee: employeeId, status: { $in: ACTIVE_TASK_STATUSES } };
  if (excludeTaskId) filter._id = { $ne: excludeTaskId };
  return Task.countDocuments(filter);
}

const capacityError = () =>
  badRequest(`This employee already has ${MAX_ACTIVE_TASKS_PER_EMPLOYEE} active tasks`, {
    assignedEmployee: `Limit of ${MAX_ACTIVE_TASKS_PER_EMPLOYEE} active tasks reached`,
  });

async function assertCapacity(employeeId, excludeTaskId) {
  const count = await countActiveTasks(employeeId, excludeTaskId);
  if (count >= MAX_ACTIVE_TASKS_PER_EMPLOYEE) throw capacityError();
}

async function isWithinCapacity(employeeId) {
  return (await countActiveTasks(employeeId)) <= MAX_ACTIVE_TASKS_PER_EMPLOYEE;
}

async function createTask(values) {
  const employee = await loadAssignableEmployee(values.assignedEmployee, values.startDate);
  await assertCapacity(employee._id);

  const task = await Task.create({
    ...values,
    taskCode: await nextTaskCode(),
    assignedEmployee: employee._id,
    assigneeSnapshot: { employeeId: employee.employeeId, fullName: employee.fullName },
    status: 'Todo',
    completedDate: null,
  });

  if (!(await isWithinCapacity(employee._id))) {
    await Task.deleteOne({ _id: task._id });
    throw capacityError();
  }

  return getTask(task._id);
}

async function updateTask(id, values) {
  const task = await findTaskOrFail(id);

  if (FINAL_TASK_STATUSES.includes(task.status)) {
    throw badRequest(`A ${task.status.toLowerCase()} task cannot be edited`);
  }

  const { assignedEmployee: employeeId, ...fields } = values;
  const previous = task.toObject();
  const reassigned = String(task.assignedEmployee) !== employeeId;
  const rescheduled = task.startDate.getTime() !== values.startDate.getTime();

  let employee = null;
  if (reassigned || rescheduled) {
    employee = await loadAssignableEmployee(employeeId, values.startDate);
    await assertCapacity(employee._id, task._id);
  }

  task.set(fields);
  if (employee) {
    task.assignedEmployee = employee._id;
    task.assigneeSnapshot = { employeeId: employee.employeeId, fullName: employee.fullName };
  }
  await task.save();

  if (employee && !(await isWithinCapacity(employee._id))) {
    const restore = Object.fromEntries(EDITABLE_FIELDS.map((field) => [field, previous[field]]));
    await Task.updateOne({ _id: task._id }, { $set: restore });
    throw capacityError();
  }

  return getTask(id);
}

async function changeStatus(id, nextStatus) {
  const task = await findTaskOrFail(id);

  if (!STATUS_TRANSITIONS[task.status].includes(nextStatus)) {
    throw badRequest(`A task cannot move from ${task.status} to ${nextStatus}`, {
      status: 'This status change is not allowed',
    });
  }

  const updated = await Task.findOneAndUpdate(
    { _id: id, status: task.status },
    {
      $set: {
        status: nextStatus,
        completedDate: nextStatus === 'Completed' ? new Date() : null,
      },
    }
  );

  if (!updated) {
    throw conflict('This task was just updated by someone else. Refresh and try again.');
  }

  return getTask(id);
}

async function deleteTask(id) {
  const task = await findTaskOrFail(id);
  await task.deleteOne();
}

module.exports = {
  listTasks,
  exportTasksCsv,
  getTask,
  createTask,
  updateTask,
  changeStatus,
  deleteTask,
};
