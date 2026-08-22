const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { getCanonicalDateString, calculateWorkHours } = require('../services/attendanceService');

/**
 * @desc    Employee Check In
 * @route   POST /api/attendance/check-in
 * @access  Private (EMPLOYEE, ADMIN, HR)
 */
const checkIn = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStr = getCanonicalDateString(now);

    // Check if attendance record already exists for today
    const existing = await Attendance.findOne({
      employeeId: req.user.employeeId,
      date: todayStr,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Employee has already checked in today.',
        data: existing,
      });
    }

    const record = await Attendance.create({
      user: req.user._id,
      employeeId: req.user.employeeId,
      companyName: req.user.companyName,
      date: todayStr,
      checkIn: now,
      status: 'PRESENT',
      isCompleted: false,
    });

    res.status(201).json({
      success: true,
      message: 'Check-in recorded successfully.',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Employee Check Out
 * @route   POST /api/attendance/check-out
 * @access  Private (EMPLOYEE, ADMIN, HR)
 */
const checkOut = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStr = getCanonicalDateString(now);

    // Find today's open attendance record
    const record = await Attendance.findOne({
      employeeId: req.user.employeeId,
      date: todayStr,
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'Employee has not checked in today.',
      });
    }

    if (record.checkOut || record.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Employee has already checked out today.',
        data: record,
      });
    }

    const duration = calculateWorkHours(record.checkIn, now);

    record.checkOut = now;
    record.workHours = duration.workHours;
    record.extraHours = duration.extraHours;
    record.workHoursFormatted = duration.workHoursFormatted;
    record.extraHoursFormatted = duration.extraHoursFormatted;
    record.isCompleted = true;

    await record.save();

    res.status(200).json({
      success: true,
      message: `Check-out recorded successfully. Work hours: ${duration.workHoursFormatted}`,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get authenticated employee's own attendance history
 * @route   GET /api/attendance/me
 * @access  Private (EMPLOYEE, ADMIN, HR)
 */
const getMyAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let query = { employeeId: req.user.employeeId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const records = await Attendance.find(query).sort({ date: -1, createdAt: -1 });

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
 * @desc    Get authenticated employee's today check-in status
 * @route   GET /api/attendance/me/today
 * @access  Private
 */
const getMyTodayStatus = async (req, res, next) => {
  try {
    const todayStr = getCanonicalDateString(new Date());

    const record = await Attendance.findOne({
      employeeId: req.user.employeeId,
      date: todayStr,
    });

    res.status(200).json({
      success: true,
      date: todayStr,
      isCheckedIn: !!record,
      isCheckedOut: !!(record && record.checkOut),
      data: record || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all employees attendance (Admin/HR Only)
 * @route   GET /api/attendance
 * @access  Private (ADMIN, HR)
 */
const getAllAttendance = async (req, res, next) => {
  try {
    const { date, search, department } = req.query;

    let query = {};

    if (date) {
      query.date = date;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const matchingUsers = await User.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { employeeId: searchRegex },
          { email: searchRegex },
        ],
      }).select('_id employeeId');

      const empIds = matchingUsers.map((u) => u.employeeId);
      query.employeeId = { $in: empIds };
    }

    const records = await Attendance.find(query)
      .populate('user', 'firstName lastName name designation department email avatarUrl')
      .sort({ date: -1, createdAt: -1 });

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
 * @desc    Get specific employee attendance history (Admin/HR or self)
 * @route   GET /api/attendance/:employeeId
 * @access  Private
 */
const getEmployeeAttendance = async (req, res, next) => {
  try {
    const empId = req.params.employeeId;

    const isAdminOrHr = req.user.role === 'ADMIN' || req.user.role === 'HR';
    const isSelf = req.user.employeeId === empId;

    if (!isAdminOrHr && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own attendance records.',
      });
    }

    const records = await Attendance.find({ employeeId: empId }).sort({ date: -1 });

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
 * @desc    Get real database attendance & workforce overview for Dashboard
 * @route   GET /api/attendance/overview/dashboard
 * @access  Private
 */
const getDashboardOverview = async (req, res, next) => {
  try {
    const todayStr = getCanonicalDateString(new Date());

    const totalWorkforce = await User.countDocuments({});
    const presentToday = await Attendance.countDocuments({ date: todayStr, status: 'PRESENT' });
    const onLeaveToday = await Attendance.countDocuments({ date: todayStr, status: 'LEAVE' });
    const absentToday = Math.max(0, totalWorkforce - presentToday - onLeaveToday);

    const attendanceRate = totalWorkforce > 0 
      ? Number(((presentToday / totalWorkforce) * 100).toFixed(1)) 
      : 0;

    // Recent today's attendance logs
    const todayLogs = await Attendance.find({ date: todayStr })
      .populate('user', 'firstName lastName name designation department email avatarUrl')
      .sort({ checkIn: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      todayDate: todayStr,
      metrics: {
        totalWorkforce,
        presentToday,
        onLeaveToday,
        absentToday,
        attendanceRate: `${attendanceRate}%`,
      },
      todayLogs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getMyTodayStatus,
  getAllAttendance,
  getEmployeeAttendance,
  getDashboardOverview,
};
