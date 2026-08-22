const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const Attendance = require('../models/Attendance');

// Helper to count inclusive days between two YYYY-MM-DD strings
function getDaysDifference(startStr, endStr) {
  const d1 = new Date(startStr);
  const d2 = new Date(endStr);
  const diffTime = d2.getTime() - d1.getTime();
  if (diffTime < 0) return 0;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// Helper to generate array of YYYY-MM-DD strings for a range
function getDateRangeArray(startStr, endStr) {
  const dates = [];
  let curr = new Date(startStr);
  const end = new Date(endStr);

  while (curr <= end) {
    const year = curr.getFullYear();
    const month = String(curr.getMonth() + 1).padStart(2, '0');
    const day = String(curr.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

/**
 * @desc    Create new Leave Request
 * @route   POST /api/time-off/request
 * @access  Private (EMPLOYEE, ADMIN, HR)
 */
const createLeaveRequest = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason, attachmentUrl } = req.body;

    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Leave type, start date, and end date are required.',
      });
    }

    const totalDays = getDaysDifference(startDate, endDate);
    if (totalDays <= 0) {
      return res.status(400).json({
        success: false,
        message: 'End date must be greater than or equal to start date.',
      });
    }

    // Check overlapping leave requests for same employee
    const overlapping = await LeaveRequest.findOne({
      employeeId: req.user.employeeId,
      status: { $ne: 'REJECTED' },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: `You already have an active or pending leave request for date range (${overlapping.startDate} to ${overlapping.endDate}).`,
      });
    }

    // Fetch or initialize leave balance for current year
    const year = new Date(startDate).getFullYear();
    let balance = await LeaveBalance.findOne({ employeeId: req.user.employeeId, year });
    if (!balance) {
      balance = await LeaveBalance.create({
        user: req.user._id,
        employeeId: req.user.employeeId,
        year,
        paidAllocated: 18,
        paidUsed: 0,
        sickAllocated: 12,
        sickUsed: 0,
        unpaidUsed: 0,
      });
    }

    // Balance verification to prevent negative balances
    if (leaveType === 'PAID') {
      const remaining = balance.paidAllocated - balance.paidUsed;
      if (totalDays > remaining) {
        return res.status(400).json({
          success: false,
          message: `Insufficient Paid Leave balance. Requested: ${totalDays} days, Remaining: ${remaining} days.`,
        });
      }
    } else if (leaveType === 'SICK') {
      const remaining = balance.sickAllocated - balance.sickUsed;
      if (totalDays > remaining) {
        return res.status(400).json({
          success: false,
          message: `Insufficient Sick Leave balance. Requested: ${totalDays} days, Remaining: ${remaining} days.`,
        });
      }
    }

    const leaveRequest = await LeaveRequest.create({
      user: req.user._id,
      employeeId: req.user.employeeId,
      companyName: req.user.companyName,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason: reason || '',
      attachmentUrl: attachmentUrl || '',
      status: 'PENDING',
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully.',
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get authenticated employee's leave requests
 * @route   GET /api/time-off/me
 * @access  Private (EMPLOYEE, ADMIN, HR)
 */
const getMyLeaveRequests = async (req, res, next) => {
  try {
    const requests = await LeaveRequest.find({ employeeId: req.user.employeeId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get authenticated employee's leave balances
 * @route   GET /api/time-off/me/balance
 * @access  Private
 */
const getMyLeaveBalance = async (req, res, next) => {
  try {
    const year = new Date().getFullYear();
    let balance = await LeaveBalance.findOne({ employeeId: req.user.employeeId, year });

    if (!balance) {
      balance = await LeaveBalance.create({
        user: req.user._id,
        employeeId: req.user.employeeId,
        year,
        paidAllocated: 18,
        paidUsed: 0,
        sickAllocated: 12,
        sickUsed: 0,
        unpaidUsed: 0,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        year: balance.year,
        paidAllocated: balance.paidAllocated,
        paidUsed: balance.paidUsed,
        paidRemaining: Math.max(0, balance.paidAllocated - balance.paidUsed),
        sickAllocated: balance.sickAllocated,
        sickUsed: balance.sickUsed,
        sickRemaining: Math.max(0, balance.sickAllocated - balance.sickUsed),
        unpaidUsed: balance.unpaidUsed,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all leave requests (Admin/HR Only)
 * @route   GET /api/time-off
 * @access  Private (ADMIN, HR)
 */
const getAllLeaveRequests = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    let query = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { employeeId: searchRegex },
        { reason: searchRegex },
        { leaveType: searchRegex },
      ];
    }

    const requests = await LeaveRequest.find(query)
      .populate('user', 'firstName lastName name email department designation avatarUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve or Reject Leave Request (Admin/HR Only)
 * @route   PUT /api/time-off/:id/status
 * @access  Private (ADMIN, HR)
 */
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, adminComment } = req.body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Status must be APPROVED or REJECTED.',
      });
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request record not found.',
      });
    }

    if (leaveRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Leave request has already been ${leaveRequest.status.toLowerCase()}.`,
      });
    }

    const newStatus = status.toUpperCase();

    if (newStatus === 'APPROVED') {
      const year = new Date(leaveRequest.startDate).getFullYear();
      let balance = await LeaveBalance.findOne({ employeeId: leaveRequest.employeeId, year });
      if (!balance) {
        balance = await LeaveBalance.create({
          user: leaveRequest.user,
          employeeId: leaveRequest.employeeId,
          year,
          paidAllocated: 18,
          paidUsed: 0,
          sickAllocated: 12,
          sickUsed: 0,
          unpaidUsed: 0,
        });
      }

      // Deduct leave balance
      if (leaveRequest.leaveType === 'PAID') {
        balance.paidUsed += leaveRequest.totalDays;
      } else if (leaveRequest.leaveType === 'SICK') {
        balance.sickUsed += leaveRequest.totalDays;
      } else if (leaveRequest.leaveType === 'UNPAID') {
        balance.unpaidUsed += leaveRequest.totalDays;
      }
      await balance.save();

      // Integrate approved leave dates into the EXISTING Attendance model!
      const dateRange = getDateRangeArray(leaveRequest.startDate, leaveRequest.endDate);

      for (const dateStr of dateRange) {
        const att = await Attendance.findOne({
          employeeId: leaveRequest.employeeId,
          date: dateStr,
        });

        if (att) {
          // Preserve existing checkIn if employee punched in, otherwise set status to LEAVE
          if (!att.checkIn) {
            att.status = 'LEAVE';
            att.notes = `Approved ${leaveRequest.leaveType} Leave`;
            await att.save();
          }
        } else {
          await Attendance.create({
            user: leaveRequest.user,
            employeeId: leaveRequest.employeeId,
            companyName: leaveRequest.companyName,
            date: dateStr,
            checkIn: new Date(`${dateStr}T09:00:00.000Z`),
            checkOut: new Date(`${dateStr}T17:00:00.000Z`),
            workHours: 8,
            extraHours: 0,
            workHoursFormatted: '8h 00m',
            extraHoursFormatted: '0h 00m',
            status: 'LEAVE',
            isCompleted: true,
            notes: `Approved ${leaveRequest.leaveType} Leave`,
          });
        }
      }
    }

    leaveRequest.status = newStatus;
    leaveRequest.adminComment = adminComment || '';
    leaveRequest.approvedBy = req.user._id;
    leaveRequest.approvedAt = new Date();
    await leaveRequest.save();

    res.status(200).json({
      success: true,
      message: `Leave request has been ${newStatus.toLowerCase()}.`,
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLeaveRequest,
  getMyLeaveRequests,
  getMyLeaveBalance,
  getAllLeaveRequests,
  updateLeaveStatus,
};
