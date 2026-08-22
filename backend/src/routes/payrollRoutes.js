const express = require('express');
const router = express.Router();
const {
  getSalaryStructure,
  updateSalaryStructure,
  getEmployeePayroll,
  getMyPayroll,
  getAllPayroll,
  getSalarySlip,
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyPayroll);

router.get('/', protect, authorize('ADMIN', 'HR'), getAllPayroll);

router.route('/:employeeId/salary')
  .get(protect, getSalaryStructure)
  .put(protect, authorize('ADMIN', 'HR'), updateSalaryStructure);

router.get('/:employeeId/slip/:month/:year', protect, getSalarySlip);
router.get('/:employeeId/:month/:year', protect, getEmployeePayroll);

module.exports = router;
