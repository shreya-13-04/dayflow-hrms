const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Admin / HR employee list & create
router.route('/')
  .get(protect, authorize('ADMIN', 'HR'), getAllEmployees)
  .post(protect, authorize('ADMIN', 'HR'), createEmployee);

// Employee profile retrieve & update
router.route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, updateEmployee);

// Profile aliases
router.route('/:id/profile')
  .get(protect, getEmployeeById)
  .put(protect, updateEmployee);

module.exports = router;
