/**
 * Centralized Salary Calculation Engine for Dayflow HRMS
 * Enforces percentage-based components, wage validation, and deduction formulas.
 */

function calculateSalaryComponents(monthlyWage, customConfig = {}) {
  const wage = Math.max(0, Number(monthlyWage) || 0);

  const basicSalary = Number((wage * 0.50).toFixed(2));
  const hra = Number((basicSalary * 0.40).toFixed(2));

  const standardAllowance = customConfig.standardAllowance !== undefined
    ? Number(customConfig.standardAllowance)
    : Number((wage * 0.05).toFixed(2));

  const performanceBonus = customConfig.performanceBonus !== undefined
    ? Number(customConfig.performanceBonus)
    : Number((wage * 0.05).toFixed(2));

  const lta = customConfig.lta !== undefined
    ? Number(customConfig.lta)
    : Number((wage * 0.05).toFixed(2));

  const componentSum = basicSalary + hra + standardAllowance + performanceBonus + lta;
  const fixedAllowance = Math.max(0, Number((wage - componentSum).toFixed(2)));

  const grossSalary = Number((basicSalary + hra + standardAllowance + performanceBonus + lta + fixedAllowance).toFixed(2));

  const pf = Number((basicSalary * 0.12).toFixed(2));
  const professionalTax = customConfig.professionalTax !== undefined
    ? Number(customConfig.professionalTax)
    : 200;

  return {
    monthlyWage: wage,
    basicSalary,
    hra,
    standardAllowance,
    performanceBonus,
    lta,
    fixedAllowance,
    grossSalary,
    pf,
    professionalTax,
  };
}

/**
 * Calculates monthly payroll breakdown integrating Attendance + Leave -> Payable Days -> Deduction.
 */
function calculateMonthlyPayroll(salaryStruct, attendanceSummary) {
  const workingDays = attendanceSummary.workingDays || 22;
  const presentDays = Math.min(workingDays, attendanceSummary.presentDays || 0);
  const paidLeaveDays = Math.min(workingDays - presentDays, attendanceSummary.paidLeaveDays || 0);
  
  // Payable days = Present days + Paid Leave days (capped at total working days)
  const payableDays = Math.min(workingDays, presentDays + paidLeaveDays);
  
  // Unpaid leave deduction applies only to missing/unpaid days
  const unpaidDeductionDays = Math.max(0, workingDays - payableDays);
  const unpaidLeaveDays = Math.max(unpaidDeductionDays, attendanceSummary.unpaidLeaveDays || 0);

  const dailyRate = workingDays > 0 ? (salaryStruct.monthlyWage / workingDays) : 0;
  const unpaidLeaveDeduction = Number((dailyRate * unpaidDeductionDays).toFixed(2));

  const pf = salaryStruct.pf || Number((salaryStruct.basicSalary * 0.12).toFixed(2));
  const professionalTax = salaryStruct.professionalTax || 200;

  const totalDeductions = Number((pf + professionalTax + unpaidLeaveDeduction).toFixed(2));
  const grossSalary = salaryStruct.grossSalary || salaryStruct.monthlyWage;
  const netSalary = Math.max(0, Number((grossSalary - totalDeductions).toFixed(2)));

  return {
    monthlyWage: salaryStruct.monthlyWage,
    workingDays,
    presentDays,
    paidLeaveDays,
    unpaidLeaveDays,
    payableDays,
    basicSalary: salaryStruct.basicSalary,
    hra: salaryStruct.hra,
    standardAllowance: salaryStruct.standardAllowance,
    performanceBonus: salaryStruct.performanceBonus,
    lta: salaryStruct.lta,
    fixedAllowance: salaryStruct.fixedAllowance,
    grossSalary,
    pf,
    professionalTax,
    unpaidLeaveDeduction,
    totalDeductions,
    netSalary,
  };
}

module.exports = {
  calculateSalaryComponents,
  calculateMonthlyPayroll,
};
