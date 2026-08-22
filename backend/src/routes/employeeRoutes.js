const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('ADMIN', 'HR'), getAllEmployees);
router.get('/:id', protect, getEmployeeById);

module.exports = router;
