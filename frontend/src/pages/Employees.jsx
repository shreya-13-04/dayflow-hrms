import React, { useState } from 'react';
import { Plus, Search, Filter, Mail, Phone, ExternalLink, ChevronRight, User, Shield, Building, CreditCard, Award, ArrowLeft } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

const employeesData = [
  { 
    id: 'OI-SAJE2026-0012', 
    name: 'Sarah Jenkins', 
    designation: 'Software Engineer', 
    department: 'Engineering', 
    email: 'sarah.j@company.com', 
    phone: '+1 (555) 234-5678',
    status: 'Present',
    location: 'San Francisco, CA',
    joiningDate: '12 Jan 2024',
    avatarInitials: 'SJ',
    about: 'Full-stack software engineer specializing in scalable React and Node.js systems.',
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'System Architecture'],
    certifications: ['AWS Certified Solutions Architect', 'Scrum Master Professional'],
    privateInfo: {
      dob: '14 March 1995',
      address: '742 Evergreen Terrace, San Francisco, CA',
      nationality: 'United States',
      gender: 'Female',
      maritalStatus: 'Single',
    },
    bank: {
      accountNo: '••••••••4892',
      bankName: 'First National Bank',
      ifsc: 'FNB0001829',
      pan: 'ABCDE1234F',
      uan: '100982349182',
    },
    salary: {
      base: '$120,000 / year',
      hra: '$24,000',
      allowances: '$12,000',
      netMonthly: '$10,000 / month',
    }
  },
  { 
    id: 'OI-DAMI2026-0013', 
    name: 'David Miller', 
    designation: 'Backend Engineer', 
    department: 'Engineering', 
    email: 'david.m@company.com', 
    phone: '+1 (555) 345-6789',
    status: 'On Leave',
    location: 'Austin, TX',
    joiningDate: '01 June 2025',
    avatarInitials: 'DM',
    about: 'Backend software engineer focused on microservices, MongoDB databases, and cloud infrastructure.',
    skills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker'],
    certifications: ['MongoDB Certified Developer', 'Docker Certified Associate'],
    privateInfo: {
      dob: '22 August 1993',
      address: '102 Tech Boulevard, Austin, TX',
      nationality: 'United States',
      gender: 'Male',
      maritalStatus: 'Married',
    },
    bank: {
      accountNo: '••••••••9102',
      bankName: 'Chase Bank',
      ifsc: 'CHAS009182',
      pan: 'FGHIJ5678K',
      uan: '100982349900',
    },
    salary: {
      base: '$114,000 / year',
      hra: '$22,800',
      allowances: '$11,400',
      netMonthly: '$9,500 / month',
    }
  },
  { 
    id: 'OI-ALMO2026-0011', 
    name: 'Alex Morgan', 
    designation: 'HR Lead & Administrator', 
    department: 'Human Resources', 
    email: 'alex.m@company.com', 
    phone: '+1 (555) 123-4567',
    status: 'Present',
    location: 'San Francisco, CA',
    joiningDate: '15 Sept 2023',
    avatarInitials: 'AM',
    about: 'People Operations Lead managing organizational growth, talent retention, and HR strategy.',
    skills: ['People Operations', 'Payroll Compliance', 'Talent Acquisition', 'HR Strategy'],
    certifications: ['SHRM Senior Certified Professional (SHRM-SCP)', 'HRCI SPHR'],
    privateInfo: {
      dob: '08 November 1988',
      address: '450 Mission Street, San Francisco, CA',
      nationality: 'United States',
      gender: 'Non-Binary',
      maritalStatus: 'Married',
    },
    bank: {
      accountNo: '••••••••1122',
      bankName: 'Wells Fargo',
      ifsc: 'WFC0004918',
      pan: 'LMNOP9012Q',
      uan: '100982341122',
    },
    salary: {
      base: '$130,000 / year',
      hra: '$26,000',
      allowances: '$13,000',
      netMonthly: '$10,833 / month',
    }
  },
  { 
    id: 'OI-ELRO2026-0014', 
    name: 'Elena Rostova', 
    designation: 'Product Designer', 
    department: 'Design', 
    email: 'elena.r@company.com', 
    phone: '+1 (555) 456-7890',
    status: 'Present',
    location: 'New York, NY',
    joiningDate: '10 Feb 2025',
    avatarInitials: 'ER',
    about: 'UI/UX product designer specializing in dense enterprise productivity interfaces.',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research'],
    certifications: ['Nielsen Norman UX Master Certification'],
    privateInfo: {
      dob: '05 May 1996',
      address: '88 Broadway Ave, New York, NY',
      nationality: 'United States',
      gender: 'Female',
      maritalStatus: 'Single',
    },
    bank: {
      accountNo: '••••••••7741',
      bankName: 'Citibank',
      ifsc: 'CITI009281',
      pan: 'RSTUV3456W',
      uan: '100982347741',
    },
    salary: {
      base: '$105,000 / year',
      hra: '$21,000',
      allowances: '$10,500',
      netMonthly: '$8,750 / month',
    }
  },
];

export function Employees() {
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('resume');

  const filteredEmployees = employeesData.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  if (selectedEmp) {
    return (
      <div className="space-y-4">
        {/* Back navigation button */}
        <button
          onClick={() => setSelectedEmp(null)}
          className="inline-flex items-center text-xs font-semibold text-stone-600 hover:text-plum-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Employee Directory</span>
        </button>

        {/* Employee Profile Record Header */}
        <div className="bg-white border border-stone-200/90 rounded-lg p-5 shadow-subtle flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-lg bg-plum-900 text-white font-bold text-xl flex items-center justify-center shadow-xs shrink-0 font-mono">
              {selectedEmp.avatarInitials}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-stone-900 font-sans tracking-tight">{selectedEmp.name}</h1>
                <Badge variant={selectedEmp.status === 'Present' ? 'success' : 'warning'} dot>
                  {selectedEmp.status}
                </Badge>
              </div>
              <p className="text-xs font-medium text-stone-700">{selectedEmp.designation} • {selectedEmp.department}</p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 font-mono pt-1">
                <span>Employee ID: {selectedEmp.id}</span>
                <span>•</span>
                <span>Joined: {selectedEmp.joiningDate}</span>
                <span>•</span>
                <span>{selectedEmp.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Header Navigation */}
        <div className="border-b border-stone-200/80 flex space-x-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('resume')}
            className={`pb-2 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'resume' ? 'border-plum-900 text-plum-900 font-bold' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Resume & Job Details
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`pb-2 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'private' ? 'border-plum-900 text-plum-900 font-bold' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Private Info & Bank
          </button>
          <button
            onClick={() => setActiveTab('salary')}
            className={`pb-2 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'salary' ? 'border-plum-900 text-plum-900 font-bold' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Salary Info (Admin Only)
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'security' ? 'border-plum-900 text-plum-900 font-bold' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Security & Access
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'resume' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2" title="About Employee" compact>
              <p className="text-xs text-stone-700 leading-relaxed">{selectedEmp.about}</p>
              
              <div className="mt-4 pt-3 border-t border-stone-100">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">Core Skills & Expertise</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEmp.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 text-[11px] bg-stone-100 text-stone-800 rounded border border-stone-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Certifications & Training" compact>
              <ul className="space-y-2 text-xs text-stone-700">
                {selectedEmp.certifications.map((cert, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <Award className="w-4 h-4 text-plum-800 shrink-0 mt-0.5" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {activeTab === 'private' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Personal Information" compact>
              <dl className="divide-y divide-stone-100 text-xs">
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500 font-medium">Date of Birth</dt>
                  <dd className="text-stone-900 font-mono">{selectedEmp.privateInfo.dob}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500 font-medium">Gender</dt>
                  <dd className="text-stone-900">{selectedEmp.privateInfo.gender}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500 font-medium">Nationality</dt>
                  <dd className="text-stone-900">{selectedEmp.privateInfo.nationality}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500 font-medium">Marital Status</dt>
                  <dd className="text-stone-900">{selectedEmp.privateInfo.maritalStatus}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500 font-medium">Residential Address</dt>
                  <dd className="text-stone-900 text-right max-w-xs">{selectedEmp.privateInfo.address}</dd>
                </div>
              </dl>
            </Card>

            <Card title="Bank & Financial Identifiers" compact>
              <dl className="divide-y divide-stone-100 text-xs">
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500 font-medium">Bank Name</dt>
                  <dd className="text-stone-900">{selectedEmp.bank.bankName}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500 font-medium">Account Number</dt>
                  <dd className="text-stone-900 font-mono">{selectedEmp.bank.accountNo}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500 font-medium">IFSC Code</dt>
                  <dd className="text-stone-900 font-mono">{selectedEmp.bank.ifsc}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500 font-medium">PAN Number</dt>
                  <dd className="text-stone-900 font-mono">{selectedEmp.bank.pan}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500 font-medium">UAN Identifier</dt>
                  <dd className="text-stone-900 font-mono">{selectedEmp.bank.uan}</dd>
                </div>
              </dl>
            </Card>
          </div>
        )}

        {activeTab === 'salary' && (
          <Card title="Salary & Compensation Structure (Admin Restricted)" compact>
            <div className="p-3 bg-plum-50/50 border border-plum-200 rounded mb-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-plum-950">Privileged Compensation Record</span>
              <Badge variant="primary">Admin Only</Badge>
            </div>
            <dl className="divide-y divide-stone-100 text-xs">
              <div className="py-2 flex justify-between">
                <dt className="text-stone-500 font-medium">Annual Base Salary</dt>
                <dd className="text-stone-900 font-bold font-mono">{selectedEmp.salary.base}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-stone-500 font-medium">House Rent Allowance (HRA)</dt>
                <dd className="text-stone-900 font-mono">{selectedEmp.salary.hra}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-stone-500 font-medium">Special & Fixed Allowances</dt>
                <dd className="text-stone-900 font-mono">{selectedEmp.salary.allowances}</dd>
              </div>
              <div className="py-2 flex justify-between font-semibold">
                <dt className="text-stone-900">Net Estimated Monthly Pay</dt>
                <dd className="text-plum-900 font-mono">{selectedEmp.salary.netMonthly}</dd>
              </div>
            </dl>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card title="Security Credentials & Work Log" compact>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <div>
                  <span className="font-semibold text-stone-900 block">Workplace Email</span>
                  <span className="text-stone-500">{selectedEmp.email}</span>
                </div>
                <Button variant="outline" size="sm">Reset Password</Button>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <div>
                  <span className="font-semibold text-stone-900 block">Two-Factor Authentication</span>
                  <span className="text-emerald-700 font-medium">Enforced & Active</span>
                </div>
                <Badge variant="success">Secured</Badge>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="People Directory"
        description="Comprehensive organizational workforce roster and employee records."
        action={
          <Button variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add Employee</span>
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-center bg-white p-2.5 rounded-md border border-stone-200/80 shadow-subtle">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, title, or ID..."
            className="w-full pl-8 pr-3 py-1 bg-stone-50 border border-stone-200 rounded text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-plum-800"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="py-1 px-2.5 text-xs bg-stone-50 border border-stone-200 rounded text-stone-800 focus:outline-none focus:border-plum-800 cursor-pointer"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Design">Design</option>
          </select>
        </div>
      </div>

      {/* Dense Directory List */}
      <div className="bg-white border border-stone-200/90 rounded-md overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50/90 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Employee ID</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Designation</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredEmployees.map((emp) => (
                <tr 
                  key={emp.id} 
                  onClick={() => setSelectedEmp(emp)}
                  className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-2.5 px-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded bg-plum-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0 font-mono shadow-xs">
                        {emp.avatarInitials}
                      </div>
                      <div>
                        <div className="font-semibold text-stone-900 group-hover:text-plum-900 transition-colors">{emp.name}</div>
                        <div className="text-[11px] text-stone-500">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-stone-500">{emp.id}</td>
                  <td className="py-2.5 px-3 font-medium text-stone-800">{emp.department}</td>
                  <td className="py-2.5 px-3 text-stone-600">{emp.designation}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant={emp.status === 'Present' ? 'success' : 'warning'} dot>
                      {emp.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button className="text-stone-400 group-hover:text-plum-900 p-1 rounded">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
