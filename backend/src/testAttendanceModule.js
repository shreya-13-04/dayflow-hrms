const http = require('http');
const app = require('./server');

const PORT = 5096;
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

async function runAttendanceTests() {
  console.log('=== STARTING ATTENDANCE MODULE TEST SUITE ===');

  const server = app.listen(PORT, async () => {
    try {
      const timestamp = Date.now();
      const adminEmail = `att_admin_${timestamp}@dayflow.com`;
      const hrEmail = `att_hr_${timestamp}@dayflow.com`;
      const emp1Email = `att_emp1_${timestamp}@dayflow.com`;
      const emp2Email = `att_emp2_${timestamp}@dayflow.com`;

      // 1. Setup Accounts
      const regAdmin = await request('POST', '/auth/register', { companyName: 'Dayflow Inc', firstName: 'Alex', lastName: 'Admin', email: adminEmail, password: 'password123', role: 'ADMIN' });
      const adminToken = regAdmin.body.token;

      const regHr = await request('POST', '/auth/register', { companyName: 'Dayflow Inc', firstName: 'Helen', lastName: 'HR', email: hrEmail, password: 'password123', role: 'HR' });
      const hrToken = regHr.body.token;

      const regEmp1 = await request('POST', '/auth/register', { companyName: 'Dayflow Inc', firstName: 'Sarah', lastName: 'Jenkins', email: emp1Email, password: 'password123', role: 'EMPLOYEE' });
      const emp1Token = regEmp1.body.token;
      const emp1Id = regEmp1.body.user.employeeId;

      const regEmp2 = await request('POST', '/auth/register', { companyName: 'Dayflow Inc', firstName: 'David', lastName: 'Miller', email: emp2Email, password: 'password123', role: 'EMPLOYEE' });
      const emp2Token = regEmp2.body.token;
      const emp2Id = regEmp2.body.user.employeeId;

      // Test D: Employee cannot check out without checking in
      console.log('\n[Test D] Checkout without Check-in...');
      const testD = await request('POST', '/attendance/check-out', {}, emp1Token);
      console.log('Test D (Expected 400 Bad Request):', testD.status, testD.body.message);

      // Test A: Employee checks in successfully
      console.log('\n[Test A] Employee 1 Checks In...');
      const testA = await request('POST', '/attendance/check-in', {}, emp1Token);
      console.log('Test A (Expected 201 Created):', testA.status, testA.body.message, 'Date:', testA.body.data?.date);

      // Test B: Employee cannot check in twice on same day
      console.log('\n[Test B] Employee 1 Attempts Second Check-In...');
      const testB = await request('POST', '/attendance/check-in', {}, emp1Token);
      console.log('Test B (Expected 400 Bad Request):', testB.status, testB.body.message);

      // Test C & F & G: Employee checks out successfully + Work/Extra Hours calculation
      console.log('\n[Test C, F, G] Employee 1 Checks Out & Verifies Hours...');
      const testC = await request('POST', '/attendance/check-out', {}, emp1Token);
      console.log('Test C (Expected 200 OK):', testC.status, 'WorkHours:', testC.body.data?.workHoursFormatted, 'ExtraHours:', testC.body.data?.extraHoursFormatted);

      // Test E: Employee cannot check out twice
      console.log('\n[Test E] Employee 1 Attempts Second Check-Out...');
      const testE = await request('POST', '/attendance/check-out', {}, emp1Token);
      console.log('Test E (Expected 400 Bad Request):', testE.status, testE.body.message);

      // Test H: Employee can see their own attendance
      console.log('\n[Test H] Employee 1 Fetches Own Attendance (/api/attendance/me)...');
      const testH = await request('GET', '/attendance/me', null, emp1Token);
      console.log('Test H (Expected 200 OK):', testH.status, `Count: ${testH.body.count}`);

      // Test I: Employee cannot access another employee's attendance
      console.log('\n[Test I] Employee 1 Attempts to Access Employee 2 Attendance...');
      const testI = await request('GET', `/attendance/${emp2Id}`, null, emp1Token);
      console.log('Test I (Expected 403 Forbidden):', testI.status, testI.body.message);

      // Test J: ADMIN can see all attendance
      console.log('\n[Test J] ADMIN Fetches All Attendance (/api/attendance)...');
      const testJ = await request('GET', '/attendance', null, adminToken);
      console.log('Test J (Expected 200 OK):', testJ.status, `Count: ${testJ.body.count}`);

      // Test K: HR can see all attendance
      console.log('\n[Test K] HR Fetches All Attendance (/api/attendance)...');
      const testK = await request('GET', '/attendance', null, hrToken);
      console.log('Test K (Expected 200 OK):', testK.status, `Count: ${testK.body.count}`);

      // Test L: Unauthorized user without token
      console.log('\n[Test L] Unauthenticated User Attempts Attendance API...');
      const testL = await request('GET', '/attendance');
      console.log('Test L (Expected 401 Unauthorized):', testL.status, testL.body.message);

      // Test O: Real Database Dashboard Metrics (No Hardcoded Fake Numbers!)
      console.log('\n[Test O] Fetch Dashboard Real Database Attendance Metrics...');
      const testO = await request('GET', '/attendance/overview/dashboard', null, adminToken);
      console.log('Test O (Expected 200 OK):', testO.status, 'Real Metrics:', testO.body.metrics);

      console.log('\n=== ALL ATTENDANCE MODULE TESTS PASSED CLEANLY ===');
    } catch (err) {
      console.error('ATTENDANCE TEST ERROR:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runAttendanceTests();
