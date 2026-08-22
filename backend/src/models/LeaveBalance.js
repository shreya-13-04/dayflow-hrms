const mongoose = require('mongoose');

const LeaveBalanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear(),
      index: true,
    },
    paidAllocated: {
      type: Number,
      default: 18,
    },
    paidUsed: {
      type: Number,
      default: 0,
    },
    sickAllocated: {
      type: Number,
      default: 12,
    },
    sickUsed: {
      type: Number,
      default: 0,
    },
    unpaidUsed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index per employee per year
LeaveBalanceSchema.index({ employeeId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', LeaveBalanceSchema);
