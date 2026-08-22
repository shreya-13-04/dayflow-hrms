const SalaryStructure = require('../models/SalaryStructure');
const PayrollRecord = require('../models/PayrollRecord');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { calculateSalaryComponents, calculateMonthlyPayroll } = require('../services/payrollEngine');

/**
 * @desc    Get Employee Salary Structure (Admin/HR or self)
 * @route   GET /api/payroll/:employeeId/salary
 * @access  Private
 */
const getSalaryStructure = async (req, res, next) => {
  try {
    const empId = req.params.employeeId;

    const isAdminOrHr = req.user.role === 'ADMIN' || req.user.role === 'HR';
    const isSelf = req.user.employeeId === empId;

    if (!isAdminOrHr && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own salary structure.',
      });
    }

    const employee = await User.findOne({ employeeId: empId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    let struct = await SalaryStructure.findOne({ employeeId: empId });
    if (!struct) {
      const defaultComponents = calculateSalaryComponents(10000);
      struct = await SalaryStructure.create({
        user: employee._id,
        employeeId: empId,
        companyName: employee.companyName,
        ...defaultComponents,
      });
    }

    res.status(200).json({
      success: true,
      data: struct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Employee Salary Structure (Admin/HR Only)
 * @route   PUT /api/payroll/:employeeId/salary
 * @access  Private (ADMIN, HR)
 */
const updateSalaryStructure = async (req, res, next) => {
  try {
    const empId = req.params.employeeId;
    const { monthlyWage, standardAllowance, performanceBonus, lta, professionalTax } = req.body;

    if (monthlyWage !== undefined && Number(monthlyWage) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Monthly wage must be a positive number.',
      });
    }

    const employee = await User.findOne({ employeeId: empId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    let struct = await SalaryStructure.findOne({ employeeId: empId });
    const targetWage = monthlyWage !== undefined ? Number(monthlyWage) : (struct?.monthlyWage || 10000);

    const updatedComponents = calculateSalaryComponents(targetWage, {
      standardAllowance,
      performanceBonus,
      lta,
      professionalTax,
    });

    if (!struct) {
      struct = new SalaryStructure({
        user: employee._id,
        employeeId: empId,
        companyName: employee.companyName,
      });
    }

    Object.assign(struct, updatedComponents);
    await struct.save();

    res.status(200).json({
      success: true,
      message: 'Salary structure updated and recalculated successfully.',
      data: struct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get or process specific employee payroll for a month/year
 * @route   GET /api/payroll/:employeeId/:month/:year
 * @access  Private (Admin/HR or self)
 */
const getEmployeePayroll = async (req, res, next) => {
  try {
    const empId = req.params.employeeId;
    const month = parseInt(req.params.month, 10);
    const year = parseInt(req.params.year, 10);

    const isAdminOrHr = req.user.role === 'ADMIN' || req.user.role === 'HR';
    const isSelf = req.user.employeeId === empId;

    if (!isAdminOrHr && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own payroll data.',
      });
    }

    const employee = await User.findOne({ employeeId: empId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    let struct = await SalaryStructure.findOne({ employeeId: empId });
    if (!struct) {
      const defaultComponents = calculateSalaryComponents(10000);
      struct = await SalaryStructure.create({
        user: employee._id,
        employeeId: empId,
        companyName: employee.companyName,
        ...defaultComponents,
      });
    }

    // Derive Attendance & Leave stats for the month from MongoDB!
    const monthStr = String(month).padStart(2, '0');
    const startPattern = `${year}-${monthStr}`;

    const monthAttendance = await Attendance.find({
      employeeId: empId,
      date: { $regex: `^${startPattern}` },
    });

    const presentDays = monthAttendance.filter(a => a.status === 'PRESENT' || a.checkIn).length;
    const paidLeaveDays = monthAttendance.filter(a => a.status === 'LEAVE' && a.notes.includes('PAID')).length;
    const unpaidLeaveDays = monthAttendance.filter(a => a.status === 'LEAVE' && a.notes.includes('UNPAID')).length;
    const workingDays = 22;

    const payrollBreakdown = calculateMonthlyPayroll(struct, {
      workingDays,
      presentDays,
      paidLeaveDays,
      unpaidLeaveDays,
    });

    let payrollRecord = await PayrollRecord.findOne({ employeeId: empId, month, year });
    if (!payrollRecord) {
      payrollRecord = await PayrollRecord.create({
        user: employee._id,
        employeeId: empId,
        companyName: employee.companyName,
        month,
        year,
        ...payrollBreakdown,
        status: 'PROCESSED',
      });
    } else {
      Object.assign(payrollRecord, payrollBreakdown);
      await payrollRecord.save();
    }

    res.status(200).json({
      success: true,
      data: payrollRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get authenticated employee's own payroll history
 * @route   GET /api/payroll/me
 * @access  Private
 */
const getMyPayroll = async (req, res, next) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Trigger auto-process for current month
    const employee = await User.findOne({ employeeId: req.user.employeeId });
    if (employee) {
      let struct = await SalaryStructure.findOne({ employeeId: req.user.employeeId });
      if (!struct) {
        struct = await SalaryStructure.create({
          user: employee._id,
          employeeId: req.user.employeeId,
          companyName: employee.companyName,
          ...calculateSalaryComponents(10000),
        });
      }

      const monthStr = String(currentMonth).padStart(2, '0');
      const monthAttendance = await Attendance.find({
        employeeId: req.user.employeeId,
        date: { $regex: `^${currentYear}-${monthStr}` },
      });

      const presentDays = monthAttendance.filter(a => a.status === 'PRESENT' || a.checkIn).length;
      const paidLeaveDays = monthAttendance.filter(a => a.status === 'LEAVE' && a.notes.includes('PAID')).length;
      const unpaidLeaveDays = monthAttendance.filter(a => a.status === 'LEAVE' && a.notes.includes('UNPAID')).length;

      const breakdown = calculateMonthlyPayroll(struct, {
        workingDays: 22,
        presentDays,
        paidLeaveDays,
        unpaidLeaveDays,
      });

      await PayrollRecord.findOneAndUpdate(
        { employeeId: req.user.employeeId, month: currentMonth, year: currentYear },
        {
          user: employee._id,
          companyName: employee.companyName,
          ...breakdown,
          status: 'PROCESSED',
        },
        { upsert: true, new: true }
      );
    }

    const records = await PayrollRecord.find({ employeeId: req.user.employeeId })
      .sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get organization payroll list (Admin/HR Only)
 * @route   GET /api/payroll
 * @access  Private (ADMIN, HR)
 */
const getAllPayroll = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const search = req.query.search;

    let userQuery = {};
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      userQuery.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeId: searchRegex },
      ];
    }

    const employees = await User.find(userQuery);

    // Auto process payroll for all matching employees for requested month/year
    for (const emp of employees) {
      let struct = await SalaryStructure.findOne({ employeeId: emp.employeeId });
      if (!struct) {
        struct = await SalaryStructure.create({
          user: emp._id,
          employeeId: emp.employeeId,
          companyName: emp.companyName,
          ...calculateSalaryComponents(10000),
        });
      }

      const monthStr = String(month).padStart(2, '0');
      const monthAttendance = await Attendance.find({
        employeeId: emp.employeeId,
        date: { $regex: `^${year}-${monthStr}` },
      });

      const presentDays = monthAttendance.filter(a => a.status === 'PRESENT' || a.checkIn).length;
      const paidLeaveDays = monthAttendance.filter(a => a.status === 'LEAVE' && a.notes.includes('PAID')).length;
      const unpaidLeaveDays = monthAttendance.filter(a => a.status === 'LEAVE' && a.notes.includes('UNPAID')).length;

      const breakdown = calculateMonthlyPayroll(struct, {
        workingDays: 22,
        presentDays,
        paidLeaveDays,
        unpaidLeaveDays,
      });

      await PayrollRecord.findOneAndUpdate(
        { employeeId: emp.employeeId, month, year },
        {
          user: emp._id,
          companyName: emp.companyName,
          ...breakdown,
          status: 'PROCESSED',
        },
        { upsert: true, new: true }
      );
    }

    const empIds = employees.map(e => e.employeeId);
    const records = await PayrollRecord.find({ employeeId: { $in: empIds }, month, year })
      .populate('user', 'firstName lastName name department designation avatarUrl email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      month,
      year,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get formatted printable Salary Slip (Admin/HR or self)
 * @route   GET /api/payroll/:employeeId/slip/:month/:year
 * @access  Private
 */
const getSalarySlip = async (req, res, next) => {
  try {
    const empId = req.params.employeeId;
    const month = parseInt(req.params.month, 10);
    const year = parseInt(req.params.year, 10);

    const isAdminOrHr = req.user.role === 'ADMIN' || req.user.role === 'HR';
    const isSelf = req.user.employeeId === empId;

    if (!isAdminOrHr && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own salary slip.',
      });
    }

    const employee = await User.findOne({ employeeId: empId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    let record = await PayrollRecord.findOne({ employeeId: empId, month, year });
    if (!record) {
      let struct = await SalaryStructure.findOne({ employeeId: empId });
      if (!struct) {
        struct = await SalaryStructure.create({
          user: employee._id,
          employeeId: empId,
          companyName: employee.companyName,
          ...calculateSalaryComponents(10000),
        });
      }

      const monthStr = String(month).padStart(2, '0');
      const monthAttendance = await Attendance.find({
        employeeId: empId,
        date: { $regex: `^${year}-${monthStr}` },
      });

      const presentDays = monthAttendance.filter(a => a.status === 'PRESENT' || a.checkIn).length;
      const paidLeaveDays = monthAttendance.filter(a => a.status === 'LEAVE' && a.notes.includes('PAID')).length;
      const unpaidLeaveDays = monthAttendance.filter(a => a.status === 'LEAVE' && a.notes.includes('UNPAID')).length;

      const breakdown = calculateMonthlyPayroll(struct, {
        workingDays: 22,
        presentDays,
        paidLeaveDays,
        unpaidLeaveDays,
      });

      record = await PayrollRecord.create({
        user: employee._id,
        employeeId: empId,
        companyName: employee.companyName,
        month,
        year,
        ...breakdown,
        status: 'PROCESSED',
      });
    }

    const monthName = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' });

    res.status(200).json({
      success: true,
      salarySlip: {
        companyName: employee.companyName,
        title: `Salary Slip for ${monthName} ${year}`,
        period: `${monthName} ${year}`,
        month,
        year,
        employee: {
          id: employee.employeeId,
          name: employee.name,
          email: employee.email,
          designation: employee.designation,
          department: employee.department,
          company: employee.companyName,
        },
        attendance: {
          workingDays: record.workingDays,
          presentDays: record.presentDays,
          paidLeaveDays: record.paidLeaveDays,
          unpaidLeaveDays: record.unpaidLeaveDays,
          payableDays: record.payableDays,
        },
        earnings: {
          basicSalary: record.basicSalary,
          hra: record.hra,
          standardAllowance: record.standardAllowance,
          performanceBonus: record.performanceBonus,
          lta: record.lta,
          fixedAllowance: record.fixedAllowance,
          grossSalary: record.grossSalary,
        },
        deductions: {
          pf: record.pf,
          professionalTax: record.professionalTax,
          unpaidLeaveDeduction: record.unpaidLeaveDeduction,
          totalDeductions: record.totalDeductions,
        },
        netSalary: record.netSalary,
        status: record.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalaryStructure,
  updateSalaryStructure,
  getEmployeePayroll,
  getMyPayroll,
  getAllPayroll,
  getSalarySlip,
};
