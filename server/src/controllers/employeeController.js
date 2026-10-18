const employeeService = require('../services/employeeService');
const { assertValid, validateEmployee } = require('../validators');

exports.list = async (req, res) => {
  res.json(await employeeService.listEmployees(req.query));
};

exports.lookup = async (req, res) => {
  res.json({ data: await employeeService.lookupEmployees() });
};

exports.getOne = async (req, res) => {
  res.json(await employeeService.getEmployee(req.params.id));
};

exports.create = async (req, res) => {
  const values = assertValid(validateEmployee(req.body));
  const employee = await employeeService.createEmployee(values);
  res.status(201).json(employee);
};

exports.update = async (req, res) => {
  const values = assertValid(validateEmployee(req.body));
  res.json(await employeeService.updateEmployee(req.params.id, values));
};

exports.remove = async (req, res) => {
  await employeeService.deleteEmployee(req.params.id);
  res.status(204).end();
};
