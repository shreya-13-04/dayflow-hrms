const mongoose = require('mongoose');

const SalaryStructureSchema = new mongoose.Schema(
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
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    monthlyWage: {
      type: Number,
      required: [true, 'Monthly wage is required'],
      default: 10000,
    },
    basicSalary: {
      type: Number,
      default: 5000, // 50% of monthly wage
    },
    hra: {
      type: Number,
      default: 2000, // 40% of basic salary
    },
    standardAllowance: {
      type: Number,
      default: 500,
    },
    performanceBonus: {
      type: Number,
      default: 500,
    },
    lta: {
      type: Number,
      default: 500,
    },
    fixedAllowance: {
      type: Number,
      default: 1500, // Remainder to equal monthly wage
    },
    pf: {
      type: Number,
      default: 600, // Provident fund (12% of basic)
    },
    professionalTax: {
      type: Number,
      default: 200,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SalaryStructure', SalaryStructureSchema);
