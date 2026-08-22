const express = require('express');
const router = express.Router();
const {
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/attendance', protect, authorize('ADMIN', 'HR'), getAttendanceReport);
router.get('/leave', protect, authorize('ADMIN', 'HR'), getLeaveReport);
router.get('/payroll', protect, authorize('ADMIN', 'HR'), getPayrollReport);

module.exports = router;
