const dashboardService = require('../services/dashboardService');

exports.getDashboard = async (req, res) => {
  res.json(await dashboardService.getDashboard());
};
