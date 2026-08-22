const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const PayrollRecord = require('../models/PayrollRecord');
const User = require('../models/User');

/**
 * @desc    Get Attendance Report (Admin/HR Only)
 * @route   GET /api/reports/attendance
 * @access  Private (ADMIN, HR)
 */
const getAttendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, search } = req.query;

    let query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { employeeId: searchRegex },
        { companyName: searchRegex },
      ];
    }

    const records = await Attendance.find(query)
      .populate('user', 'firstName lastName name department designation email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records.map(r => ({
        id: r._id,
        employeeId: r.employeeId,
        name: r.user ? r.user.name : r.employeeId,
        department: r.user?.department || 'Engineering',
        designation: r.user?.designation || 'Software Engineer',
        date: r.date,
        checkIn: r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
        checkOut: r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
        workHours: r.workHoursFormatted || '0h 00m',
        extraHours: r.extraHoursFormatted || '0h 00m',
        status: r.status,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Leave / Time-Off Report (Admin/HR Only)
 * @route   GET /api/reports/leave
 * @access  Private (ADMIN, HR)
 */
const getLeaveReport = async (req, res, next) => {
  try {
    const { status, leaveType, search } = req.query;

    let query = {};
    if (status && status !== 'ALL') query.status = status;
    if (leaveType && leaveType !== 'ALL') query.leaveType = leaveType;

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { employeeId: searchRegex },
        { reason: searchRegex },
      ];
    }

    const records = await LeaveRequest.find(query)
      .populate('user', 'firstName lastName name department designation email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records.map(r => ({
        id: r._id,
        employeeId: r.employeeId,
        name: r.user ? r.user.name : r.employeeId,
        leaveType: r.leaveType,
        startDate: r.startDate,
        endDate: r.endDate,
        totalDays: r.totalDays,
        reason: r.reason,
        status: r.status,
        adminComment: r.adminComment,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Payroll Report (Admin/HR Only)
 * @route   GET /api/reports/payroll
 * @access  Private (ADMIN, HR)
 */
const getPayrollReport = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const search = req.query.search;

    let query = { month, year };
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { employeeId: searchRegex },
      ];
    }

    const records = await PayrollRecord.find(query)
      .populate('user', 'firstName lastName name department designation email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      month,
      year,
      count: records.length,
      data: records.map(p => ({
        id: p._id,
        employeeId: p.employeeId,
        name: p.user ? p.user.name : p.employeeId,
        department: p.user?.department || 'Engineering',
        monthlyWage: p.monthlyWage,
        workingDays: p.workingDays,
        payableDays: p.payableDays,
        grossSalary: p.grossSalary,
        totalDeductions: p.totalDeductions,
        netSalary: p.netSalary,
        status: p.status,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
};
