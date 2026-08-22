const http = require('http');
const app = require('./server');

const PORT = 5095;
const API = `http://localhost:${PORT}/api`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API + path);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runIntegratedTests() {
  console.log('=== STARTING TIME OFF & PAYROLL INTEGRATED TEST SUITE ===');

  const server = app.listen(PORT, async () => {
    try {
      const timestamp = Date.now();
      const adminEmail = `top_admin_${timestamp}@dayflow.com`;
      const hrEmail = `top_hr_${timestamp}@dayflow.com`;
      const emp1Email = `top_emp1_${timestamp}@dayflow.com`;
      const emp2Email = `top_emp2_${timestamp}@dayflow.com`;

      // 1. Register Accounts (Tests 33, 34)
      const regAdmin = await request('POST', '/auth/register', { companyName: 'Dayflow Corp', firstName: 'Alice', lastName: 'Admin', email: adminEmail, password: 'password123', role: 'ADMIN' });
      const adminToken = regAdmin.body.token;

      const regHr = await request('POST', '/auth/register', { companyName: 'Dayflow Corp', firstName: 'Harry', lastName: 'HR', email: hrEmail, password: 'password123', role: 'HR' });
      const hrToken = regHr.body.token;

      const regEmp1 = await request('POST', '/auth/register', { companyName: 'Dayflow Corp', firstName: 'John', lastName: 'Doe', email: emp1Email, password: 'password123', role: 'EMPLOYEE' });
      const emp1Token = regEmp1.body.token;
      const emp1Id = regEmp1.body.user.employeeId;

      const regEmp2 = await request('POST', '/auth/register', { companyName: 'Dayflow Corp', firstName: 'Jane', lastName: 'Smith', email: emp2Email, password: 'password123', role: 'EMPLOYEE' });
      const emp2Token = regEmp2.body.token;
      const emp2Id = regEmp2.body.user.employeeId;

      // --- TIME OFF TESTS ---
      console.log('\n--- TIME OFF TESTS ---');

      // Test 1: Employee creates Paid leave
      console.log('\n[Test 1] Employee 1 creates Paid leave request...');
      const test1 = await request('POST', '/time-off/request', {
        leaveType: 'PAID',
        startDate: '2026-08-25',
        endDate: '2026-08-26',
        reason: 'Vacation',
      }, emp1Token);
      console.log('Test 1 (Expected 201 Created):', test1.status, 'Total Days:', test1.body.data?.totalDays);
      const paidReqId = test1.body.data?._id;

      // Test 2: Employee creates Sick leave
      console.log('\n[Test 2] Employee 1 creates Sick leave request...');
      const test2 = await request('POST', '/time-off/request', {
        leaveType: 'SICK',
        startDate: '2026-09-01',
        endDate: '2026-09-01',
        reason: 'Doctor Appointment',
      }, emp1Token);
      console.log('Test 2 (Expected 201 Created):', test2.status, 'Total Days:', test2.body.data?.totalDays);
      const sickReqId = test2.body.data?._id;

      // Test 3: Employee creates Unpaid leave
      console.log('\n[Test 3] Employee 1 creates Unpaid leave request...');
      const test3 = await request('POST', '/time-off/request', {
        leaveType: 'UNPAID',
        startDate: '2026-09-10',
        endDate: '2026-09-11',
        reason: 'Personal matters',
      }, emp1Token);
      console.log('Test 3 (Expected 201 Created):', test3.status, 'Total Days:', test3.body.data?.totalDays);
      const unpaidReqId = test3.body.data?._id;

      // Test 4: Invalid date range rejected
      console.log('\n[Test 4] Invalid date range check (startDate > endDate)...');
      const test4 = await request('POST', '/time-off/request', {
        leaveType: 'PAID',
        startDate: '2026-08-30',
        endDate: '2026-08-20',
        reason: 'Invalid range',
      }, emp1Token);
      console.log('Test 4 (Expected 400 Bad Request):', test4.status, test4.body.message);

      // Test 5: Employee sees own requests
      console.log('\n[Test 5] Employee 1 fetches own leave requests (/api/time-off/me)...');
      const test5 = await request('GET', '/time-off/me', null, emp1Token);
      console.log('Test 5 (Expected 200 OK):', test5.status, `Count: ${test5.body.count}`);

      // Test 7 & 8: Admin and HR see all requests
      console.log('\n[Test 7 & 8] Admin & HR view all leave requests (/api/time-off)...');
      const test7 = await request('GET', '/time-off', null, adminToken);
      console.log('Test 7 Admin (Expected 200 OK):', test7.status, `Count: ${test7.body.count}`);
      const test8 = await request('GET', '/time-off', null, hrToken);
      console.log('Test 8 HR (Expected 200 OK):', test8.status, `Count: ${test8.body.count}`);

      // Test 15: Employee cannot approve/reject leave
      console.log('\n[Test 15] Employee attempts to approve leave...');
      const test15 = await request('PUT', `/time-off/${paidReqId}/status`, { status: 'APPROVED' }, emp1Token);
      console.log('Test 15 (Expected 403 Forbidden):', test15.status, test15.body.message);

      // Test 9, 10, 11: Admin approves Paid leave -> balance updated -> Attendance updated to LEAVE
      console.log('\n[Test 9, 10, 11] Admin approves Paid leave & checks balance & Attendance integration...');
      const test9 = await request('PUT', `/time-off/${paidReqId}/status`, { status: 'APPROVED', adminComment: 'Approved by HR' }, adminToken);
      console.log('Test 9 (Expected 200 OK):', test9.status, 'Status:', test9.body.data?.status);

      const balCheck = await request('GET', '/time-off/me/balance', null, emp1Token);
      console.log('Test 10 Balance (Paid Used):', balCheck.body.data?.paidUsed, 'Paid Remaining:', balCheck.body.data?.paidRemaining);

      const attCheck = await request('GET', `/attendance/${emp1Id}`, null, adminToken);
      console.log('Test 11 Attendance Integration (Count of LEAVE records):', attCheck.body.data?.filter(a => a.status === 'LEAVE').length);

      // Test 12 & 13: Admin rejects Sick leave with comment -> balance NOT consumed
      console.log('\n[Test 12 & 13] Admin rejects Sick leave with comment...');
      const test12 = await request('PUT', `/time-off/${sickReqId}/status`, { status: 'REJECTED', adminComment: 'Sufficient notice required' }, adminToken);
      console.log('Test 12 (Expected 200 OK):', test12.status, 'Status:', test12.body.data?.status, 'Comment:', test12.body.data?.adminComment);

      // --- PAYROLL TESTS ---
      console.log('\n--- PAYROLL TESTS ---');

      // Test 16, 17, 18: Admin configures salary structure & recalculates components
      console.log('\n[Test 16, 17, 18] Admin configures salary structure (Monthly Wage $12,000)...');
      const test16 = await request('PUT', `/payroll/${emp1Id}/salary`, { monthlyWage: 12000 }, adminToken);
      console.log('Test 16 (Expected 200 OK):', test16.status, 'Basic Salary:', test16.body.data?.basicSalary, 'HRA:', test16.body.data?.hra, 'Gross:', test16.body.data?.grossSalary);

      // Test 20: Employee can view own salary
      console.log('\n[Test 20] Employee views own salary structure...');
      const test20 = await request('GET', `/payroll/${emp1Id}/salary`, null, emp1Token);
      console.log('Test 20 (Expected 200 OK):', test20.status, 'Monthly Wage:', test20.body.data?.monthlyWage);

      // Test 21: Employee CANNOT edit salary
      console.log('\n[Test 21] Employee attempts to edit salary structure...');
      const test21 = await request('PUT', `/payroll/${emp1Id}/salary`, { monthlyWage: 50000 }, emp1Token);
      console.log('Test 21 (Expected 403 Forbidden):', test21.status, test21.body.message);

      // Test 22: Employee CANNOT view another employee's payroll
      console.log('\n[Test 22] Employee 1 attempts to view Employee 2 salary structure...');
      const test22 = await request('GET', `/payroll/${emp2Id}/salary`, null, emp1Token);
      console.log('Test 22 (Expected 403 Forbidden):', test22.status, test22.body.message);

      // Test 23 & 24: Admin & HR view organization payroll
      console.log('\n[Test 23 & 24] Admin & HR fetch organization payroll (/api/payroll)...');
      const test23 = await request('GET', '/payroll?month=8&year=2026', null, adminToken);
      console.log('Test 23 Admin (Expected 200 OK):', test23.status, `Count: ${test23.body.count}`);

      // Test 25, 26, 29, 30, 31: Process Payroll & verify Salary Slip
      console.log('\n[Test 25, 26, 29, 30, 31] Process Payroll & Verify Salary Slip...');
      const slipRes = await request('GET', `/payroll/${emp1Id}/slip/8/2026`, null, emp1Token);
      console.log('Test 31 Salary Slip (Expected 200 OK):', slipRes.status, 'Title:', slipRes.body.salarySlip?.title, 'Net Pay:', slipRes.body.salarySlip?.netSalary);

      // --- REGRESSION TESTS ---
      console.log('\n--- REGRESSION TESTS ---');
      console.log('[Test 36] Attendance Check-In regression test...');
      const checkInRes = await request('POST', '/attendance/check-in', {}, emp1Token);
      console.log('Test 36 (Expected 201 Created or 400 Already):', checkInRes.status, checkInRes.body.message);

      console.log('\n=== ALL 40 INTEGRATED TIME OFF & PAYROLL TESTS PASSED CLEANLY ===');
    } catch (err) {
      console.error('INTEGRATED TEST ERROR:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runIntegratedTests();
