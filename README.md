# Dayflow HRMS — Human Resource Management System

Dayflow HRMS is a production-oriented, enterprise-grade People Operations platform built with a high-density "People Operations Workspace" design identity inspired by productivity tools like Linear, Notion, and Odoo.

---

## 🌟 Key Features

- **Authentication & RBAC**: JWT auth with bcrypt password hashing, automatic Employee ID assignment (`DF-JODO-2026-0001`), and role-based access control (`ADMIN`, `HR`, `EMPLOYEE`).
- **People Directory & Profiles**: Complete employee records management, role-restricted field edits, resume tabs, private info, and bank details.
- **Real-Time Attendance**: Server-timestamped check-in/out, duplicate punch prevention, standard shift calculation, and overtime tracking.
- **Time Off & Leave Approval**: Paid, Sick, and Unpaid leave requests with balance validation, overlap prevention, Admin/HR approval queue, and **direct integration into the Attendance module**.
- **Payroll & Salary Engine**: Percentage-based earnings (Basic, HRA, Allowances) and deductions (PF, Tax, Unpaid leave deduction), payable day calculations, and **print-ready Salary Slips**.
- **HR Insights & Analytics**: Live database workforce metrics, attendance trends, leave distribution, and payroll summaries visualized via Recharts.
- **Exportable Reports**: Comprehensive Attendance, Time Off, and Payroll reports with date range filtering, search, print formatting, and **CSV export**.
- **In-App Notification Center**: Unread badge counter, notification drawer, and real-time business action event notifications.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, React Router v6.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Bcryptjs.
- **Database**: Local MongoDB daemon (`mongodb://localhost:27017/dayflow_hrms`).

---

## 📂 Project Structure

```
dayflow-hrms/
├── frontend/                # React Vite Frontend Application
│   ├── src/
│   │   ├── components/      # UI components, layout, auth guards, salary slips
│   │   ├── context/         # AuthContext provider
│   │   ├── pages/           # Dashboard, Employees, Attendance, TimeOff, Payroll, Analytics, Reports, Profile, Settings
│   │   └── utils/           # CSV export utilities
├── backend/                 # Node.js Express REST API Server
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── controllers/     # Auth, Employee, Attendance, TimeOff, Payroll, Notification, Analytics, Report
│   │   ├── middleware/      # Auth JWT protection, RBAC, error handler
│   │   ├── models/          # User, Counter, Attendance, LeaveRequest, LeaveBalance, SalaryStructure, PayrollRecord, Notification
│   │   ├── routes/          # REST API endpoints
│   │   ├── services/        # Employee ID, Storage, Attendance calculation, Payroll Engine, Notification dispatch
│   │   └── seed.js          # Development seed script
└── README.md
```

---

## 🔑 Development Credentials (Seeded)

Run `npm run seed` in the `backend/` directory to populate the database with realistic demo records:

| Role | Email | Default Password |
|---|---|---|
| **Admin** | `admin@dayflow.com` | `Dayflow2026!` |
| **HR** | `hr@dayflow.com` | `Dayflow2026!` |
| **Employee** | `sarah.j@dayflow.com` | `Dayflow2026!` |

---

## ⚙️ Environment Variables

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dayflow_hrms
JWT_SECRET=dayflow_secret_key_2026
JWT_EXPIRE=30d
NODE_ENV=development
```

---

## 🚀 Local Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed      # Populate demo data
npm run dev       # Start API server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev       # Start dev server on http://localhost:5173
```

---

## 🧪 Automated Test Suite

Run the integration test suites from the `backend/` directory:

```bash
node src/testAuthFlow.js            # Auth & RBAC Security Tests (11 tests)
node src/testEmployeeModule.js      # Employee & Profile Permission Tests (13 tests)
node src/testAttendanceModule.js    # Attendance & Punch Tests (15 tests)
node src/testTimeOffPayrollModule.js # Integrated Time Off & Payroll Tests (40 tests)
```

---

## 📡 REST API Summary

- `POST /api/auth/login` — Credentials authentication & JWT token
- `POST /api/auth/register` — Workspace user registration & auto Employee ID
- `GET /api/employees` — Admin/HR employee list & search
- `POST /api/attendance/check-in` — Shift check-in
- `POST /api/attendance/check-out` — Shift check-out & duration calculation
- `POST /api/time-off/request` — Time-off leave submission
- `PUT /api/time-off/:id/status` — Admin approval/rejection & Attendance update
- `GET /api/payroll/:employeeId/slip/:month/:year` — Printable Salary Slip statement
- `GET /api/analytics/insights` — Real MongoDB database analytics
- `GET /api/reports/attendance` — Exportable attendance report
- `GET /api/notifications` — User notification drawer & unread count
