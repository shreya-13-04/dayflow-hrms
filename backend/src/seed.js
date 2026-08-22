const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Counter = require('./models/Counter');
const Attendance = require('./models/Attendance');
const LeaveRequest = require('./models/LeaveRequest');
const LeaveBalance = require('./models/LeaveBalance');
const SalaryStructure = require('./models/SalaryStructure');
const PayrollRecord = require('./models/PayrollRecord');
const Notification = require('./models/Notification');
const { getCanonicalDateString } = require('./services/attendanceService');
const { calculateSalaryComponents, calculateMonthlyPayroll } = require('./services/payrollEngine');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dayflow_hrms';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB for database seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('[MongoDB] Connected cleanly.');

    // Clear existing collections safely for clean seed
    await User.deleteMany({});
    await Counter.deleteMany({});
    await Attendance.deleteMany({});
    await LeaveRequest.deleteMany({});
    await LeaveBalance.deleteMany({});
    await SalaryStructure.deleteMany({});
    await PayrollRecord.deleteMany({});
    await Notification.deleteMany({});

    console.log('Cleared existing collections.');

    const companyName = 'Dayflow Technologies';
    const companyPrefix = 'DF';
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const todayStr = getCanonicalDateString(new Date());

    const seedUsersData = [
      { firstName: 'Alex', lastName: 'Morgan', email: 'admin@dayflow.com', role: 'ADMIN', department: 'Human Resources', designation: 'Director of People Operations', salary: 180000 },
      { firstName: 'Helen', lastName: 'Rostova', email: 'hr@dayflow.com', role: 'HR', department: 'Human Resources', designation: 'Senior HR Manager', salary: 135000 },
      { firstName: 'Sarah', lastName: 'Jenkins', email: 'sarah.j@dayflow.com', role: 'EMPLOYEE', department: 'Engineering', designation: 'Staff Frontend Engineer', salary: 150000 },
      { firstName: 'David', lastName: 'Miller', email: 'david.m@dayflow.com', role: 'EMPLOYEE', department: 'Engineering', designation: 'Senior Backend Engineer', salary: 140000 },
      { firstName: 'Emily', lastName: 'Watson', email: 'emily.w@dayflow.com', role: 'EMPLOYEE', department: 'Design', designation: 'Principal Product Designer', salary: 130000 },
      { firstName: 'Michael', lastName: 'Chen', email: 'michael.c@dayflow.com', role: 'EMPLOYEE', department: 'Engineering', designation: 'DevOps & Infra Lead', salary: 145000 },
      { firstName: 'Jessica', lastName: 'Taylor', email: 'jessica.t@dayflow.com', role: 'EMPLOYEE', department: 'Sales', designation: 'Enterprise Account Exec', salary: 125000 },
      { firstName: 'Robert', lastName: 'Davis', email: 'robert.d@dayflow.com', role: 'EMPLOYEE', department: 'Finance', designation: 'Senior Financial Analyst', salary: 120000 },
      { firstName: 'Sophia', lastName: 'Martinez', email: 'sophia.m@dayflow.com', role: 'EMPLOYEE', department: 'Design', designation: 'UX Researcher', salary: 115000 },
      { firstName: 'Daniel', lastName: 'Kim', email: 'daniel.k@dayflow.com', role: 'EMPLOYEE', department: 'Engineering', designation: 'QA Automation Engineer', salary: 110000 },
    ];

    console.log(`Seeding ${seedUsersData.length} users...`);
    const createdUsers = [];

    let serial = 1;
    for (const uData of seedUsersData) {
      const code = `${uData.firstName.substring(0, 2)}${uData.lastName.substring(0, 2)}`.toUpperCase();
      const serialStr = String(serial).padStart(4, '0');
      const empId = `${companyPrefix}-${code}-${currentYear}-${serialStr}`;
      serial++;

      const user = await User.create({
        employeeId: empId,
        companyName,
        companyPrefix,
        firstName: uData.firstName,
        lastName: uData.lastName,
        email: uData.email,
        phone: '+1 (555) ' + Math.floor(100000 + Math.random() * 900000),
        password: 'Dayflow2026!',
        role: uData.role,
        department: uData.department,
        designation: uData.designation,
        location: 'San Francisco, CA',
        joiningYear: currentYear,
        serialNumber: serial,
        isFirstLogin: false,
        isEmailVerified: true,
        about: `${uData.designation} at ${companyName}.`,
        skills: ['People Operations', 'System Architecture', 'React', 'Node.js', 'Finance'],
        certifications: ['Certified HR Professional', 'AWS Architect'],
        residentialAddress: '742 Evergreen Terrace, San Francisco, CA',
      });

      createdUsers.push({ user, salary: uData.salary });

      // Create Leave Balance for current year
      await LeaveBalance.create({
        user: user._id,
        employeeId: user.employeeId,
        year: currentYear,
        paidAllocated: 18,
        paidUsed: uData.role === 'ADMIN' ? 0 : 2,
        sickAllocated: 12,
        sickUsed: uData.role === 'ADMIN' ? 0 : 1,
        unpaidUsed: 0,
      });

      // Create Salary Structure
      const salaryComp = calculateSalaryComponents(uData.salary / 12);
      await SalaryStructure.create({
        user: user._id,
        employeeId: user.employeeId,
        companyName,
        ...salaryComp,
      });

      // Process Current Month Payroll Record
      const payrollBreakdown = calculateMonthlyPayroll(salaryComp, {
        workingDays: 22,
        presentDays: 20,
        paidLeaveDays: 2,
        unpaidLeaveDays: 0,
      });

      await PayrollRecord.create({
        user: user._id,
        employeeId: user.employeeId,
        companyName,
        month: currentMonth,
        year: currentYear,
        ...payrollBreakdown,
        status: 'PROCESSED',
      });
    }

    console.log('Seeding attendance records...');
    // Seed Attendance records for today & recent days
    for (const item of createdUsers) {
      const u = item.user;
      
      // Today's attendance
      await Attendance.create({
        user: u._id,
        employeeId: u.employeeId,
        companyName,
        date: todayStr,
        checkIn: new Date(`${todayStr}T09:00:00.000Z`),
        checkOut: new Date(`${todayStr}T17:30:00.000Z`),
        workHours: 8.5,
        extraHours: 0.5,
        workHoursFormatted: '8h 30m',
        extraHoursFormatted: '0h 30m',
        status: 'PRESENT',
        isCompleted: true,
      });
    }

    console.log('Seeding time off requests...');
    const adminUser = createdUsers[0].user;
    const empUser1 = createdUsers[2].user;
    const empUser2 = createdUsers[3].user;

    // Approved Paid Leave
    await LeaveRequest.create({
      user: empUser1._id,
      employeeId: empUser1.employeeId,
      companyName,
      leaveType: 'PAID',
      startDate: `${currentYear}-08-10`,
      endDate: `${currentYear}-08-11`,
      totalDays: 2,
      reason: 'Summer vacation',
      status: 'APPROVED',
      adminComment: 'Approved by HR',
      approvedBy: adminUser._id,
      approvedAt: new Date(),
    });

    // Pending Sick Leave
    await LeaveRequest.create({
      user: empUser2._id,
      employeeId: empUser2.employeeId,
      companyName,
      leaveType: 'SICK',
      startDate: `${currentYear}-08-28`,
      endDate: `${currentYear}-08-28`,
      totalDays: 1,
      reason: 'Doctor appointment',
      status: 'PENDING',
    });

    console.log('Seeding in-app notifications...');
    await Notification.create({
      recipient: adminUser._id,
      type: 'LEAVE_REQUEST',
      title: 'New Time-Off Request',
      message: `${empUser2.name} (${empUser2.employeeId}) requested 1 day of Sick leave.`,
      read: false,
    });

    await Notification.create({
      recipient: empUser1._id,
      type: 'LEAVE_APPROVED',
      title: 'Time-Off Request Approved',
      message: 'Your Paid leave request (2 days) was approved by HR.',
      read: true,
    });

    console.log('\n=== SEEDING COMPLETED SUCCESSFULLY ===');
    console.log('Development Credentials:');
    console.log('  Admin User : admin@dayflow.com / Dayflow2026!');
    console.log('  HR User    : hr@dayflow.com / Dayflow2026!');
    console.log('  Employee   : sarah.j@dayflow.com / Dayflow2026!');
    console.log('========================================\n');
  } catch (err) {
    console.error('SEED ERROR:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedDatabase();
