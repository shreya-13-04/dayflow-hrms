const User = require('../models/User');
const { generateEmployeeId } = require('../services/employeeIdService');
const { generateVerificationToken, sendVerificationEmail } = require('../services/emailService');

/**
 * @desc    Register a new user / employee
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { companyName, firstName, lastName, name, email, phone, password, confirmPassword, role } = req.body;

    // Split name if full name string passed without separate firstName/lastName
    let derivedFirst = firstName;
    let derivedLast = lastName;
    if (!derivedFirst && name) {
      const parts = name.trim().split(/\s+/);
      derivedFirst = parts[0] || 'User';
      derivedLast = parts.slice(1).join(' ') || 'Employee';
    }

    if (!companyName || !derivedFirst || !derivedLast || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide company name, first name, last name, email and password.',
      });
    }

    // Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // Password rules validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Role assignment
    const userRole = role && ['ADMIN', 'HR', 'EMPLOYEE'].includes(role.toUpperCase()) 
      ? role.toUpperCase() 
      : 'EMPLOYEE';

    // Generate unique employee ID safely
    const idDetails = await generateEmployeeId(companyName, derivedFirst, derivedLast);

    // Verification token
    const { token: verificationToken, expires: verificationTokenExpires } = generateVerificationToken();

    // Create user record
    const user = await User.create({
      employeeId: idDetails.employeeId,
      companyName,
      companyPrefix: idDetails.companyPrefix,
      firstName: derivedFirst,
      lastName: derivedLast,
      email: email.toLowerCase(),
      phone: phone || '',
      password,
      role: userRole,
      isFirstLogin: true,
      isEmailVerified: false,
      verificationToken,
      verificationTokenExpires,
      joiningYear: idDetails.joiningYear,
      serialNumber: idDetails.serialNumber,
    });

    // Send dev-safe verification email
    await sendVerificationEmail(user.email, verificationToken);

    // Generate JWT token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: `User registered successfully. Employee ID assigned: ${user.employeeId}`,
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        companyName: user.companyName,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user & return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user by email and select password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        companyName: user.companyName,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        companyName: user.companyName,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password (first login or password update)
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    user.isFirstLogin = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
      user: {
        id: user._id,
        employeeId: user.employeeId,
        companyName: user.companyName,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email with verification token
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body || req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required.',
      });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is invalid or has expired.',
      });
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email address verified successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Public / Private
 */
const resendVerification = async (req, res, next) => {
  try {
    const email = req.user ? req.user.email : req.body.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with provided email address.',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email address is already verified.',
      });
    }

    const { token, expires } = generateVerificationToken();
    user.verificationToken = token;
    user.verificationTokenExpires = expires;
    await user.save();

    await sendVerificationEmail(user.email, token);

    res.status(200).json({
      success: true,
      message: `Verification link sent for ${user.email}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  verifyEmail,
  resendVerification,
};
