const User = require('../models/User');

/**
 * @desc    Get all employees (Admin/HR Only)
 * @route   GET /api/employees
 * @access  Private (ADMIN, HR)
 */
const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees.map((emp) => ({
        id: emp._id,
        employeeId: emp.employeeId,
        companyName: emp.companyName,
        firstName: emp.firstName,
        lastName: emp.lastName,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        role: emp.role,
        isEmailVerified: emp.isEmailVerified,
        createdAt: emp.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single employee profile (Admin/HR or self)
 * @route   GET /api/employees/:id
 * @access  Private
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const empId = req.params.id;

    // Check authorization: must be ADMIN, HR or requesting own profile
    if (
      req.user.role !== 'ADMIN' &&
      req.user.role !== 'HR' &&
      req.user.employeeId !== empId &&
      req.user._id.toString() !== empId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not authorized to view another employee profile.',
      });
    }

    const employee = await User.findOne({
      $or: [{ employeeId: empId }, { _id: mongoose.Types.ObjectId.isValid(empId) ? empId : null }],
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: employee._id,
        employeeId: employee.employeeId,
        companyName: employee.companyName,
        firstName: employee.firstName,
        lastName: employee.lastName,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        isEmailVerified: employee.isEmailVerified,
        createdAt: employee.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
};
