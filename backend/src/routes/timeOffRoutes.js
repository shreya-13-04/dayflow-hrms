const express = require('express');
const router = express.Router();
const {
  createLeaveRequest,
  getMyLeaveRequests,
  getMyLeaveBalance,
  getAllLeaveRequests,
  updateLeaveStatus,
} = require('../controllers/timeOffController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/request', protect, createLeaveRequest);
router.get('/me', protect, getMyLeaveRequests);
router.get('/me/balance', protect, getMyLeaveBalance);

router.get('/', protect, authorize('ADMIN', 'HR'), getAllLeaveRequests);
router.put('/:id/status', protect, authorize('ADMIN', 'HR'), updateLeaveStatus);

module.exports = router;
