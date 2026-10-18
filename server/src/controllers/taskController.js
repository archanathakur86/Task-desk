const taskService = require('../services/taskService');
const { assertValid, validateTask, validateStatusInput } = require('../validators');

exports.list = async (req, res) => {
  res.json(await taskService.listTasks(req.query));
};

exports.exportCsv = async (req, res) => {
  const csv = await taskService.exportTasksCsv(req.query);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="tasks.csv"');
  res.send(csv);
};

exports.getOne = async (req, res) => {
  res.json(await taskService.getTask(req.params.id));
};

exports.create = async (req, res) => {
  const values = assertValid(validateTask(req.body));
  res.status(201).json(await taskService.createTask(values));
};

exports.update = async (req, res) => {
  const values = assertValid(validateTask(req.body));
  res.json(await taskService.updateTask(req.params.id, values));
};

exports.changeStatus = async (req, res) => {
  const { status } = assertValid(validateStatusInput(req.body));
  res.json(await taskService.changeStatus(req.params.id, status));
};

exports.remove = async (req, res) => {
  await taskService.deleteTask(req.params.id);
  res.status(204).end();
};
