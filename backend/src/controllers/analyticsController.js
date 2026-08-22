const User = require('../models/User');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const PayrollRecord = require('../models/PayrollRecord');
const { getCanonicalDateString } = require('../services/attendanceService');

/**
 * @desc    Get complete real MongoDB database analytics & insights
 * @route   GET /api/analytics/insights
 * @access  Private (ADMIN, HR)
 */
const getInsights = async (req, res, next) => {
  try {
    const todayStr = getCanonicalDateString(new Date());
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // 1. WORKFORCE METRICS
    const totalEmployees = await User.countDocuments({});
    const activeEmployees = totalEmployees;

    const byDepartmentRaw = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);
    const byDepartment = byDepartmentRaw.map(d => ({
      department: d._id || 'Unassigned',
      count: d.count,
    }));

    const byRoleRaw = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    const byRole = byRoleRaw.map(r => ({
      role: r._id,
      count: r.count,
    }));

    // 2. ATTENDANCE METRICS
    const presentToday = await Attendance.countDocuments({ date: todayStr, status: 'PRESENT' });
    const onLeaveToday = await Attendance.countDocuments({ date: todayStr, status: 'LEAVE' });
    const absentToday = Math.max(0, totalEmployees - presentToday - onLeaveToday);

    const attendanceRateNum = totalEmployees > 0 ? ((presentToday / totalEmployees) * 100).toFixed(1) : '0';
    const attendanceRate = `${attendanceRateNum}%`;

    const completedToday = await Attendance.find({ date: todayStr, isCompleted: true });
    let totalWorkHoursMs = 0;
    let totalOvertimeMs = 0;

    completedToday.forEach(c => {
      totalWorkHoursMs += c.workHours || 0;
      totalOvertimeMs += c.extraHours || 0;
    });

    const avgWorkHours = completedToday.length > 0
      ? Number((totalWorkHoursMs / completedToday.length).toFixed(1))
      : 8.0;

    // Past 7 Days Attendance Trend Chart Data
    const attendanceTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getCanonicalDateString(d);
      const count = await Attendance.countDocuments({ date: dateStr, status: 'PRESENT' });
      attendanceTrend.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr,
        present: count,
      });
    }

    // 3. TIME OFF METRICS
    const pendingRequests = await LeaveRequest.countDocuments({ status: 'PENDING' });
    const approvedRequests = await LeaveRequest.countDocuments({ status: 'APPROVED' });
    const rejectedRequests = await LeaveRequest.countDocuments({ status: 'REJECTED' });

    const approvedLeaves = await LeaveRequest.find({ status: 'APPROVED' });
    let paidLeaveUsage = 0;
    let sickLeaveUsage = 0;
    let unpaidLeaveUsage = 0;

    approvedLeaves.forEach(l => {
      if (l.leaveType === 'PAID') paidLeaveUsage += l.totalDays || 0;
      if (l.leaveType === 'SICK') sickLeaveUsage += l.totalDays || 0;
      if (l.leaveType === 'UNPAID') unpaidLeaveUsage += l.totalDays || 0;
    });

    const leaveDistribution = [
      { type: 'Paid Time Off', days: paidLeaveUsage },
      { type: 'Sick Time Off', days: sickLeaveUsage },
      { type: 'Unpaid Leave', days: unpaidLeaveUsage },
    ];

    // 4. PAYROLL METRICS
    const currentPayrollRecords = await PayrollRecord.find({ month: currentMonth, year: currentYear });
    let totalPayroll = 0;
    let grossPayroll = 0;
    let totalDeductions = 0;
    let unpaidDeductions = 0;

    currentPayrollRecords.forEach(p => {
      totalPayroll += p.netSalary || 0;
      grossPayroll += p.grossSalary || 0;
      totalDeductions += p.totalDeductions || 0;
      unpaidDeductions += p.unpaidLeaveDeduction || 0;
    });

    const averageSalary = currentPayrollRecords.length > 0
      ? Number((totalPayroll / currentPayrollRecords.length).toFixed(2))
      : 0;

    res.status(200).json({
      success: true,
      workforce: {
        totalEmployees,
        activeEmployees,
        byDepartment,
        byRole,
      },
      attendance: {
        presentToday,
        absentToday,
        onLeaveToday,
        attendanceRate,
        avgWorkHours,
        totalOvertimeHours: totalOvertimeMs,
        attendanceTrend,
      },
      timeOff: {
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        paidLeaveUsage,
        sickLeaveUsage,
        unpaidLeaveUsage,
        leaveDistribution,
      },
      payroll: {
        totalPayroll,
        averageSalary,
        grossPayroll,
        totalDeductions,
        unpaidDeductions,
        netPayroll: totalPayroll,
        payrollSummary: {
          gross: grossPayroll,
          deductions: totalDeductions,
          net: totalPayroll,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInsights,
};
