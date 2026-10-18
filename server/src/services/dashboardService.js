const Employee = require('../models/Employee');
const Task = require('../models/Task');
const { ACTIVE_TASK_STATUSES, MAX_ACTIVE_TASKS_PER_EMPLOYEE } = require('../constants');
const { startOfTodayUTC } = require('../utils/dates');

const countOf = (rows, key) => rows.find((row) => row._id === key)?.count || 0;
const sumOf = (rows) => rows.reduce((total, row) => total + row.count, 0);

async function getDashboard() {
  const today = startOfTodayUTC();

  const [employeeRows, taskRows, overdue, employees, workloadRows] = await Promise.all([
    Employee.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.countDocuments({ status: { $in: ACTIVE_TASK_STATUSES }, dueDate: { $lt: today } }),
    Employee.find({}, 'employeeId fullName status').sort({ fullName: 1 }).lean(),
    Task.aggregate([
      { $match: { status: { $in: ACTIVE_TASK_STATUSES } } },
      { $group: { _id: '$assignedEmployee', activeTasks: { $sum: 1 } } },
    ]),
  ]);

  const workloadByEmployee = new Map(workloadRows.map((row) => [String(row._id), row.activeTasks]));

  const workload = employees
    .map((employee) => ({
      _id: employee._id,
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      status: employee.status,
      activeTasks: workloadByEmployee.get(String(employee._id)) || 0,
      capacity: MAX_ACTIVE_TASKS_PER_EMPLOYEE,
    }))
    .sort((a, b) => b.activeTasks - a.activeTasks || a.fullName.localeCompare(b.fullName));

  return {
    employees: {
      total: sumOf(employeeRows),
      Active: countOf(employeeRows, 'Active'),
      Inactive: countOf(employeeRows, 'Inactive'),
      'On Leave': countOf(employeeRows, 'On Leave'),
    },
    tasks: {
      total: sumOf(taskRows),
      Todo: countOf(taskRows, 'Todo'),
      'In Progress': countOf(taskRows, 'In Progress'),
      Completed: countOf(taskRows, 'Completed'),
      Cancelled: countOf(taskRows, 'Cancelled'),
      overdue,
    },
    workload,
  };
}

module.exports = { getDashboard };
