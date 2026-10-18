const mongoose = require('mongoose');
const { DEPARTMENTS, EMPLOYEE_STATUSES } = require('../constants');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    department: { type: String, enum: DEPARTMENTS, required: true },
    role: { type: String, required: true, trim: true },
    joiningDate: { type: Date, required: true },
    status: { type: String, enum: EMPLOYEE_STATUSES, default: 'Active' },
    skills: { type: [String], default: [] },
    leaveStart: { type: Date, default: null },
    leaveEnd: { type: Date, default: null },
  },
  { timestamps: true }
);

employeeSchema.index({ fullName: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
