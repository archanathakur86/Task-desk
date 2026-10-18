const express = require('express');
const employeeRoutes = require('./employeeRoutes');
const taskRoutes = require('./taskRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

router.use('/employees', employeeRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
