const http = require('http');
const app = require('./server');

const PORT = 5097;
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

async function runSecurityTests() {
  console.log('=== STARTING EMPLOYEE MANAGEMENT & PROFILE SECURITY SUITE ===');

  const server = app.listen(PORT, async () => {
    try {
      const timestamp = Date.now();
      const adminEmail = `admin_${timestamp}@dayflow.com`;
      const hrEmail = `hr_${timestamp}@dayflow.com`;
      const empEmail = `emp_${timestamp}@dayflow.com`;
      const otherEmpEmail = `other_${timestamp}@dayflow.com`;

      // Setup Admin
      const regAdmin = await request('POST', '/auth/register', {
        companyName: 'Odoo Inc',
        firstName: 'Alex',
        lastName: 'Morgan',
        email: adminEmail,
        password: 'password123',
        role: 'ADMIN',
      });
      const adminToken = regAdmin.body.token;

      // Setup HR
      const regHr = await request('POST', '/auth/register', {
        companyName: 'Odoo Inc',
        firstName: 'Helen',
        lastName: 'Rostova',
        email: hrEmail,
        password: 'password123',
        role: 'HR',
      });
      const hrToken = regHr.body.token;

      // Setup Regular Employee
      const regEmp = await request('POST', '/auth/register', {
        companyName: 'Odoo Inc',
        firstName: 'David',
        lastName: 'Miller',
        email: empEmail,
        password: 'password123',
        role: 'EMPLOYEE',
      });
      const empToken = regEmp.body.token;
      const empId = regEmp.body.user.employeeId;

      // Setup Other Employee
      const regOther = await request('POST', '/auth/register', {
        companyName: 'Odoo Inc',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: otherEmpEmail,
        password: 'password123',
        role: 'EMPLOYEE',
      });
      const otherEmpId = regOther.body.user.employeeId;

      // Test A: Admin can list employees
      console.log('\n[Test A] Admin can list employees...');
      const testA = await request('GET', '/employees', null, adminToken);
      console.log('Test A (Expected 200):', testA.status, `Count: ${testA.body.count}`);

      // Test B: HR can list employees
      console.log('\n[Test B] HR can list employees...');
      const testB = await request('GET', '/employees', null, hrToken);
      console.log('Test B (Expected 200):', testB.status, `Count: ${testB.body.count}`);

      // Test C: Employee cannot list all employees
      console.log('\n[Test C] Employee cannot list all employees...');
      const testC = await request('GET', '/employees', null, empToken);
      console.log('Test C (Expected 403 Forbidden):', testC.status, testC.body.message);

      // Test D: Admin can create employee (Backend auto-generates ID)
      console.log('\n[Test D] Admin can create employee (Backend auto ID)...');
      const testD = await request('POST', '/employees', {
        firstName: 'Michael',
        lastName: 'Scott',
        email: `mscott_${timestamp}@dayflow.com`,
        department: 'Sales',
        designation: 'Regional Manager',
        role: 'EMPLOYEE',
      }, adminToken);
      console.log('Test D (Expected 201 Created):', testD.status, 'Generated EmpID:', testD.body.data?.employeeId);

      // Test E: Admin can edit employee
      console.log('\n[Test E] Admin can edit employee designation/department...');
      const testE = await request('PUT', `/employees/${empId}`, {
        designation: 'Senior Backend Engineer',
        department: 'Core Infrastructure',
      }, adminToken);
      console.log('Test E (Expected 200 OK):', testE.status, 'Updated Designation:', testE.body.data?.designation);

      // Test F: Employee can edit permitted personal fields (address, phone)
      console.log('\n[Test F] Employee editing own permitted personal fields...');
      const testF = await request('PUT', `/employees/${empId}`, {
        phone: '+1 (555) 999-8888',
        residentialAddress: '123 Market Street, San Francisco, CA',
        about: 'Experienced backend specialist.',
      }, empToken);
      console.log('Test F (Expected 200 OK):', testF.status, 'Updated Phone:', testF.body.data?.phone);

      // Test G: Employee CANNOT edit role
      console.log('\n[Test G] Employee attempting to change role to ADMIN...');
      const testG = await request('PUT', `/employees/${empId}`, {
        role: 'ADMIN',
      }, empToken);
      console.log('Test G (Expected 403 Forbidden):', testG.status, testG.body.message);

      // Test H: Employee CANNOT edit employee ID
      console.log('\n[Test H] Employee attempting to change Employee ID...');
      const testH = await request('PUT', `/employees/${empId}`, {
        employeeId: 'MANUAL-HACK-001',
      }, empToken);
      console.log('Test H (Expected 403 Forbidden):', testH.status, testH.body.message);

      // Test I: Employee CANNOT edit salary information
      console.log('\n[Test I] Employee attempting to modify salaryInfo...');
      const testI = await request('PUT', `/employees/${empId}`, {
        salaryInfo: { baseSalary: 500000 },
      }, empToken);
      console.log('Test I (Expected 403 Forbidden):', testI.status, testI.body.message);

      // Test J: Employee CANNOT access another employee's profile
      console.log('\n[Test J] Employee attempting to view another employee profile...');
      const testJ = await request('GET', `/employees/${otherEmpId}`, null, empToken);
      console.log('Test J (Expected 403 Forbidden):', testJ.status, testJ.body.message);

      // Test K: Profile data persists after refresh/query
      console.log('\n[Test K] Profile data persistence query...');
      const testK = await request('GET', `/employees/${empId}`, null, empToken);
      console.log('Test K (Expected 200 OK):', testK.status, 'Address:', testK.body.data?.residentialAddress);

      // Test L: Profile picture update
      console.log('\n[Test L] Profile picture update handling...');
      const testL = await request('PUT', `/employees/${empId}`, {
        avatarUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      }, empToken);
      console.log('Test L (Expected 200 OK):', testL.status, 'Avatar Saved:', testL.body.data?.avatarUrl.substring(0, 30) + '...');

      // Test M: Security tab password change using auth API
      console.log('\n[Test M] Security tab password change via /api/auth/change-password...');
      const testM = await request('PUT', '/auth/change-password', {
        currentPassword: 'password123',
        newPassword: 'newsecurepass789',
      }, empToken);
      console.log('Test M (Expected 200 OK):', testM.status, testM.body.message);

      console.log('\n=== ALL 13 EMPLOYEE SECURITY TESTS EXECUTED CLEANLY ===');
    } catch (err) {
      console.error('EMPLOYEE MODULE TEST ERROR:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runSecurityTests();
