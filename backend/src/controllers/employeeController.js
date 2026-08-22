const mongoose = require('mongoose');
const User = require('../models/User');
const { generateEmployeeId } = require('../services/employeeIdService');
const { processAvatarStorage } = require('../services/storageService');

/**
 * @desc    Get all employees (Admin/HR Only)
 * @route   GET /api/employees
 * @access  Private (ADMIN, HR)
 */
const getAllEmployees = async (req, res, next) => {
  try {
    const { search, department } = req.query;

    let query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { designation: searchRegex },
        { department: searchRegex },
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    const employees = await User.find(query).sort({ createdAt: -1 });

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
        designation: emp.designation,
        department: emp.department,
        manager: emp.manager,
        location: emp.location,
        joiningDate: emp.joiningDate,
        avatarUrl: emp.avatarUrl,
        workStatus: 'Status unavailable', // Neutral work status placeholder per spec
        isEmailVerified: emp.isEmailVerified,
        createdAt: emp.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new employee (Admin/HR Only)
 * @route   POST /api/employees
 * @access  Private (ADMIN, HR)
 */
const createEmployee = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      department,
      designation,
      manager,
      location,
      joiningDate,
      role,
      password,
      avatarUrl,
    } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required.',
      });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An employee account with this email address already exists.',
      });
    }

    const compName = companyName || req.user.companyName || 'Dayflow Corp';

    // ALWAYS generate Employee ID in backend (disallow manual override)
    const idDetails = await generateEmployeeId(compName, firstName, lastName);

    const empRole = role && ['ADMIN', 'HR', 'EMPLOYEE'].includes(role.toUpperCase())
      ? role.toUpperCase()
      : 'EMPLOYEE';

    const empPassword = password || 'Dayflow2026!';

    const processedAvatar = avatarUrl ? processAvatarStorage(avatarUrl) : '';

    const newEmp = await User.create({
      employeeId: idDetails.employeeId,
      companyName: compName,
      companyPrefix: idDetails.companyPrefix,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      password: empPassword,
      role: empRole,
      department: department || 'Engineering',
      designation: designation || 'Software Engineer',
      manager: manager || 'Alex Morgan',
      location: location || 'San Francisco, CA',
      joiningDate: joiningDate ? new Date(joiningDate) : Date.now(),
      joiningYear: idDetails.joiningYear,
      serialNumber: idDetails.serialNumber,
      avatarUrl: processedAvatar,
      isFirstLogin: true,
      isEmailVerified: true,
    });

    res.status(201).json({
      success: true,
      message: `Employee created successfully. Employee ID assigned: ${newEmp.employeeId}`,
      data: {
        id: newEmp._id,
        employeeId: newEmp.employeeId,
        companyName: newEmp.companyName,
        firstName: newEmp.firstName,
        lastName: newEmp.lastName,
        name: newEmp.name,
        email: newEmp.email,
        phone: newEmp.phone,
        role: newEmp.role,
        designation: newEmp.designation,
        department: newEmp.department,
        manager: newEmp.manager,
        location: newEmp.location,
        joiningDate: newEmp.joiningDate,
        avatarUrl: newEmp.avatarUrl,
        workStatus: 'Status unavailable',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single employee profile (Admin/HR or self)
 * @route   GET /api/employees/:id or GET /api/employees/:id/profile
 * @access  Private
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const targetId = req.params.id;

    // Find employee by Employee ID or ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(targetId);
    const employee = await User.findOne({
      $or: [{ employeeId: targetId }, ...(isObjectId ? [{ _id: targetId }] : [])],
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    // RBAC Check: EMPLOYEE role can only view their OWN profile
    const isSelf = req.user.employeeId === employee.employeeId || req.user._id.toString() === employee._id.toString();
    const isAdminOrHr = req.user.role === 'ADMIN' || req.user.role === 'HR';

    if (!isAdminOrHr && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not authorized to view another employee profile.',
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
        designation: employee.designation,
        department: employee.department,
        manager: employee.manager,
        location: employee.location,
        joiningDate: employee.joiningDate,
        avatarUrl: employee.avatarUrl,
        about: employee.about,
        skills: employee.skills,
        certifications: employee.certifications,
        dateOfBirth: employee.dateOfBirth,
        residentialAddress: employee.residentialAddress,
        nationality: employee.nationality,
        personalEmail: employee.personalEmail,
        gender: employee.gender,
        maritalStatus: employee.maritalStatus,
        bankDetails: {
          accountNo: employee.bankDetails?.accountNo || '••••••••4892',
          bankName: employee.bankDetails?.bankName || 'First National Bank',
          ifsc: employee.bankDetails?.ifsc || 'FNB0001829',
          pan: employee.bankDetails?.pan || 'ABCDE1234F',
          uan: employee.bankDetails?.uan || '100982349182',
        },
        salaryInfo: {
          baseSalary: employee.salaryInfo?.baseSalary || 120000,
          hra: employee.salaryInfo?.hra || 24000,
          allowances: employee.salaryInfo?.allowances || 12000,
          netPay: employee.salaryInfo?.netPay || 10000,
        },
        workStatus: 'Status unavailable',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee information / profile
 * @route   PUT /api/employees/:id or PUT /api/employees/:id/profile
 * @access  Private (Strict field permissions enforced)
 */
const updateEmployee = async (req, res, next) => {
  try {
    const targetId = req.params.id;

    const isObjectId = mongoose.Types.ObjectId.isValid(targetId);
    const employee = await User.findOne({
      $or: [{ employeeId: targetId }, ...(isObjectId ? [{ _id: targetId }] : [])],
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found.',
      });
    }

    const isSelf = req.user.employeeId === employee.employeeId || req.user._id.toString() === employee._id.toString();
    const isAdminOrHr = req.user.role === 'ADMIN' || req.user.role === 'HR';

    // EMPLOYEE role cannot update other employees
    if (!isAdminOrHr && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own employee profile.',
      });
    }

    const body = req.body;

    // Strict Field Permission Enforcement:
    // If EMPLOYEE role is performing update:
    if (!isAdminOrHr) {
      // Forbidden fields check: role, employeeId, salary, department, designation, manager, joiningDate
      if (body.role || body.employeeId || body.salaryInfo || body.department || body.designation || body.manager || body.joiningDate || body.companyName) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Employees are not permitted to modify role, employee ID, department, designation, manager, or salary information.',
        });
      }

      // Permitted employee editable fields only
      if (body.phone !== undefined) employee.phone = body.phone;
      if (body.residentialAddress !== undefined) employee.residentialAddress = body.residentialAddress;
      if (body.personalEmail !== undefined) employee.personalEmail = body.personalEmail;
      if (body.about !== undefined) employee.about = body.about;
      if (body.skills !== undefined) employee.skills = Array.isArray(body.skills) ? body.skills : [];
      if (body.certifications !== undefined) employee.certifications = Array.isArray(body.certifications) ? body.certifications : [];
      if (body.avatarUrl !== undefined) employee.avatarUrl = processAvatarStorage(body.avatarUrl);
    } else {
      // ADMIN or HR can edit all fields
      if (body.firstName) employee.firstName = body.firstName;
      if (body.lastName) employee.lastName = body.lastName;
      if (body.phone !== undefined) employee.phone = body.phone;
      if (body.designation) employee.designation = body.designation;
      if (body.department) employee.department = body.department;
      if (body.manager) employee.manager = body.manager;
      if (body.location) employee.location = body.location;
      if (body.joiningDate) employee.joiningDate = new Date(body.joiningDate);
      if (body.role && ['ADMIN', 'HR', 'EMPLOYEE'].includes(body.role.toUpperCase())) {
        employee.role = body.role.toUpperCase();
      }
      if (body.about !== undefined) employee.about = body.about;
      if (body.skills !== undefined) employee.skills = Array.isArray(body.skills) ? body.skills : [];
      if (body.certifications !== undefined) employee.certifications = Array.isArray(body.certifications) ? body.certifications : [];
      if (body.dateOfBirth !== undefined) employee.dateOfBirth = body.dateOfBirth;
      if (body.residentialAddress !== undefined) employee.residentialAddress = body.residentialAddress;
      if (body.nationality !== undefined) employee.nationality = body.nationality;
      if (body.personalEmail !== undefined) employee.personalEmail = body.personalEmail;
      if (body.gender !== undefined) employee.gender = body.gender;
      if (body.maritalStatus !== undefined) employee.maritalStatus = body.maritalStatus;
      if (body.avatarUrl !== undefined) employee.avatarUrl = processAvatarStorage(body.avatarUrl);

      if (body.bankDetails) {
        employee.bankDetails = { ...employee.bankDetails, ...body.bankDetails };
      }
      if (body.salaryInfo) {
        employee.salaryInfo = { ...employee.salaryInfo, ...body.salaryInfo };
      }
    }

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Employee record updated successfully.',
      data: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        designation: employee.designation,
        department: employee.department,
        manager: employee.manager,
        location: employee.location,
        joiningDate: employee.joiningDate,
        avatarUrl: employee.avatarUrl,
        about: employee.about,
        skills: employee.skills,
        certifications: employee.certifications,
        dateOfBirth: employee.dateOfBirth,
        residentialAddress: employee.residentialAddress,
        nationality: employee.nationality,
        personalEmail: employee.personalEmail,
        gender: employee.gender,
        maritalStatus: employee.maritalStatus,
        bankDetails: employee.bankDetails,
        salaryInfo: employee.salaryInfo,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
};
