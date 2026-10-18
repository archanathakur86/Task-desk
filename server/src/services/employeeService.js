const Employee = require('../models/Employee');
const Task = require('../models/Task');
const { ACTIVE_TASK_STATUSES } = require('../constants');
const { badRequest, notFound, conflict } = require('../utils/httpError');
const { readParam, parsePagination, buildPaginationMeta } = require('../utils/query');
const { escapeRegex } = require('../utils/text');

const SORT_FIELDS = { name: 'fullName', joiningDate: 'joiningDate', createdAt: 'createdAt' };

function buildEmployeeFilter(query) {
  const filter = {};
  const department = readParam(query, 'department');
  const status = readParam(query, 'status');
  const search = readParam(query, 'search');

  if (department) filter.department = department;
  if (status) filter.status = status;
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ fullName: pattern }, { email: pattern }, { employeeId: pattern }];
  }
  return filter;
}

async function listEmployees(query) {
  const filter = buildEmployeeFilter(query);
  const sortField = SORT_FIELDS[readParam(query, 'sort')] || 'fullName';
  const direction = readParam(query, 'order') === 'desc' ? -1 : 1;
  const { page, limit, skip } = parsePagination(query);

  const [employees, total] = await Promise.all([
    Employee.find(filter).sort({ [sortField]: direction, _id: 1 }).skip(skip).limit(limit).lean(),
    Employee.countDocuments(filter),
  ]);

  return { data: employees, pagination: buildPaginationMeta(page, limit, total) };
}

// Small payload used by the task form's employee dropdown
async function lookupEmployees() {
  return Employee.find({}, 'employeeId fullName department status leaveStart leaveEnd')
    .sort({ fullName: 1 })
    .limit(500)
    .lean();
}

async function getEmployee(id) {
  const employee = await Employee.findById(id).lean();
  if (!employee) throw notFound('Employee not found');

  const activeTasks = await Task.countDocuments({
    assignedEmployee: id,
    status: { $in: ACTIVE_TASK_STATUSES },
  });

  return { ...employee, activeTasks };
}

async function assertUniqueIdentity(values, excludeId = null) {
  const clash = await Employee.findOne(
    { _id: { $ne: excludeId }, $or: [{ employeeId: values.employeeId }, { email: values.email }] },
    'employeeId email'
  ).lean();
  if (!clash) return;

  const details = {};
  if (clash.employeeId === values.employeeId) details.employeeId = 'An employee with this ID already exists';
  if (clash.email === values.email) details.email = 'An employee with this email already exists';
  throw conflict(Object.values(details)[0], details);
}

async function createEmployee(values) {
  await assertUniqueIdentity(values);
  return Employee.create(values);
}

async function updateEmployee(id, values) {
  const employee = await Employee.findById(id);
  if (!employee) throw notFound('Employee not found');

  await assertUniqueIdentity(values, id);
  employee.set(values);
  await employee.save();
  return employee;
}

async function deleteEmployee(id) {
  const employee = await Employee.findById(id);
  if (!employee) throw notFound('Employee not found');

  const activeTasks = await Task.countDocuments({
    assignedEmployee: id,
    status: { $in: ACTIVE_TASK_STATUSES },
  });
  if (activeTasks > 0) {
    throw badRequest(
      `This employee still has ${activeTasks} Todo or In Progress task(s). Reassign or finish them first.`
    );
  }

  await employee.deleteOne();
}

module.exports = {
  buildEmployeeFilter,
  listEmployees,
  lookupEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
