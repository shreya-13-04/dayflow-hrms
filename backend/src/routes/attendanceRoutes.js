const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getMyTodayStatus,
  getAllAttendance,
  getEmployeeAttendance,
  getDashboardOverview,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Employee Punch actions
router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);

// Employee own attendance
router.get('/me', protect, getMyAttendance);
router.get('/me/today', protect, getMyTodayStatus);

// Real database dashboard metrics
router.get('/overview/dashboard', protect, getDashboardOverview);

// Admin / HR all employees attendance list
router.get('/', protect, authorize('ADMIN', 'HR'), getAllAttendance);

// Single employee attendance history
router.get('/:employeeId', protect, getEmployeeAttendance);

module.exports = router;
