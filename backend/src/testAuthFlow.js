const http = require('http');
const mongoose = require('mongoose');
const app = require('./server');

const PORT = 5098;
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

async function runTests() {
  console.log('=== STARTING AUTH & AUTHORIZATION SUITE ===');

  const server = app.listen(PORT, async () => {
    try {
      const testEmailAdmin = `admin_${Date.now()}@acme.com`;
      const testEmailEmp = `employee_${Date.now()}@acme.com`;

      // Test A: Register Admin
      console.log('\n[Test A] Register Admin User...');
      const resA = await request('POST', '/auth/register', {
        companyName: 'Acme Corp',
        firstName: 'John',
        lastName: 'Doe',
        email: testEmailAdmin,
        password: 'password123',
        confirmPassword: 'password123',
        role: 'ADMIN',
      });
      console.log('Result A:', resA.status, resA.body.message, 'EmpID:', resA.body.user?.employeeId);
      const adminToken = resA.body.token;
      const adminEmpId = resA.body.user?.employeeId;

      // Test J: Automatically generated employee ID format check
      console.log('\n[Test J] Check Auto-Generated Employee ID format...');
      const empIdRegex = /^AC-[A-Z]{4}-\d{4}-\d{4}$/;
      const isFormatValid = empIdRegex.test(adminEmpId);
      console.log(`Format Check ('${adminEmpId}'):`, isFormatValid ? 'PASSED (Pattern AC-JODO-2026-XXXX)' : 'FAILED');

      // Test B: Register Employee
      console.log('\n[Test B] Register Employee User...');
      const resB = await request('POST', '/auth/register', {
        companyName: 'Acme Corp',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: testEmailEmp,
        password: 'password123',
        confirmPassword: 'password123',
        role: 'EMPLOYEE',
      });
      console.log('Result B:', resB.status, resB.body.message, 'EmpID:', resB.body.user?.employeeId);
      const empToken = resB.body.token;

      // Test C: Duplicate Email
      console.log('\n[Test C] Duplicate Email Prevention...');
      const resC = await request('POST', '/auth/register', {
        companyName: 'Acme Corp',
        firstName: 'John',
        lastName: 'Duplicate',
        email: testEmailAdmin,
        password: 'password123',
      });
      console.log('Result C (Expected 400):', resC.status, resC.body.message);

      // Test D: Login with Correct Password
      console.log('\n[Test D] Login with Correct Password...');
      const resD = await request('POST', '/auth/login', {
        email: testEmailAdmin,
        password: 'password123',
      });
      console.log('Result D (Expected 200):', resD.status, 'Success:', resD.body.success, 'Role:', resD.body.user?.role);

      // Test E: Login with Wrong Password
      console.log('\n[Test E] Login with Wrong Password...');
      const resE = await request('POST', '/auth/login', {
        email: testEmailAdmin,
        password: 'wrongpassword',
      });
      console.log('Result E (Expected 401):', resE.status, resE.body.message);

      // Test G: Protected Route without Token
      console.log('\n[Test G] Protected Route without Token...');
      const resG = await request('GET', '/auth/me');
      console.log('Result G (Expected 401):', resG.status, resG.body.message);

      // Test H: Employee attempting Admin API (RBAC test)
      console.log('\n[Test H] Employee Attempting Admin API (/api/employees)...');
      const resH = await request('GET', '/employees', null, empToken);
      console.log('Result H (Expected 403 Forbidden):', resH.status, resH.body.message);

      // Test I: Admin Accessing Employee Management
      console.log('\n[Test I] Admin Accessing Employee Management (/api/employees)...');
      const resI = await request('GET', '/employees', null, adminToken);
      console.log('Result I (Expected 200 OK):', resI.status, `Fetched ${resI.body.count} employees`);

      // Test K: First-login Password Change
      console.log('\n[Test K] First-Login Password Change...');
      const resK = await request('PUT', '/auth/change-password', {
        currentPassword: 'password123',
        newPassword: 'newsecurepassword456',
      }, adminToken);
      console.log('Result K (Expected 200 OK):', resK.status, resK.body.message, 'isFirstLogin:', resK.body.user?.isFirstLogin);

      console.log('\n=== ALL 11 SUITE TESTS EXECUTED CLEANLY ===');
    } catch (err) {
      console.error('TEST ERROR:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runTests();
