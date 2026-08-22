const mongoose = require('mongoose');

const PayrollRecordSchema = new mongoose.Schema(
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
    companyName: {
      type: String,
      required: true,
    },
    month: {
      type: Number, // 1-12
      required: true,
      index: true,
    },
    year: {
      type: Number, // e.g. 2026
      required: true,
      index: true,
    },
    monthlyWage: {
      type: Number,
      required: true,
    },
    workingDays: {
      type: Number,
      default: 22,
    },
    presentDays: {
      type: Number,
      default: 0,
    },
    paidLeaveDays: {
      type: Number,
      default: 0,
    },
    unpaidLeaveDays: {
      type: Number,
      default: 0,
    },
    payableDays: {
      type: Number,
      default: 0,
    },
    // Earnings breakdown
    basicSalary: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    standardAllowance: { type: Number, default: 0 },
    performanceBonus: { type: Number, default: 0 },
    lta: { type: Number, default: 0 },
    fixedAllowance: { type: Number, default: 0 },
    grossSalary: { type: Number, default: 0 },
    // Deductions breakdown
    pf: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    unpaidLeaveDeduction: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    // Final Net Salary
    netSalary: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'PROCESSED', 'PAID'],
      default: 'PROCESSED',
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index per employee per month/year
PayrollRecordSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('PayrollRecord', PayrollRecordSchema);
