const mongoose = require('mongoose');
const { DEPARTMENTS, TASK_PRIORITIES, TASK_STATUSES, PRIORITY_RANK } = require('../constants');

const taskSchema = new mongoose.Schema(
  {
    taskCode: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    assigneeSnapshot: {
      employeeId: { type: String, default: null },
      fullName: { type: String, default: null },
    },
    department: { type: String, enum: DEPARTMENTS, required: true },
    priority: { type: String, enum: TASK_PRIORITIES, required: true },
    priorityRank: { type: Number, default: 0 },
    titleKey: { type: String, default: '' },
    status: { type: String, enum: TASK_STATUSES, default: 'Todo' },
    startDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    completedDate: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.pre('validate', function setPriorityRank(next) {
  this.priorityRank = PRIORITY_RANK[this.priority] || 0;
  this.titleKey = this.title.toLowerCase();
  next();
});

taskSchema.index({ assignedEmployee: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
