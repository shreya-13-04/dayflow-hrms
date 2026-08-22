import React, { useState } from 'react';
import { Mail, Phone, MapPin, Building, Shield, Key, Award, User, CreditCard } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function Profile() {
  const [activeTab, setActiveTab] = useState('resume');

  const profile = {
    id: 'OI-ALMO2026-0011',
    name: 'Alex Morgan',
    designation: 'HR Administrator',
    department: 'Human Resources',
    email: 'alex.morgan@company.com',
    phone: '+1 (555) 123-4567',
    status: 'Present',
    location: 'San Francisco, CA (HQ)',
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
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <PageHeader
        title="Settings & Employee Record"
        description="Your personal HR record, authentication settings, and organizational profile."
        action={
          <Button variant="secondary" size="sm">
            <span>Edit Profile</span>
          </Button>
        }
      />

      {/* Record Header */}
      <div className="bg-white border border-stone-200/90 rounded-lg p-5 shadow-subtle flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-lg bg-plum-900 text-white font-bold text-xl flex items-center justify-center shadow-xs shrink-0 font-mono">
            {profile.avatarInitials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-stone-900 font-sans tracking-tight">{profile.name}</h1>
              <Badge variant="primary" dot>
                {profile.designation}
              </Badge>
            </div>
            <p className="text-xs font-medium text-stone-700">{profile.department}</p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 font-mono pt-1">
              <span>Employee ID: {profile.id}</span>
              <span>•</span>
              <span>Joined: {profile.joiningDate}</span>
              <span>•</span>
              <span>{profile.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
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
          Salary Info (Admin)
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

      {/* Tab Panels */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2" title="About Employee" compact>
            <p className="text-xs text-stone-700 leading-relaxed">{profile.about}</p>
            
            <div className="mt-4 pt-3 border-t border-stone-100">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">Core Skills & Expertise</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 text-[11px] bg-stone-100 text-stone-800 rounded border border-stone-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Certifications" compact>
            <ul className="space-y-2 text-xs text-stone-700">
              {profile.certifications.map((cert, i) => (
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
                <dd className="text-stone-900 font-mono">{profile.privateInfo.dob}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-stone-500 font-medium">Gender</dt>
                <dd className="text-stone-900">{profile.privateInfo.gender}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-stone-500 font-medium">Nationality</dt>
                <dd className="text-stone-900">{profile.privateInfo.nationality}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-stone-500 font-medium">Marital Status</dt>
                <dd className="text-stone-900">{profile.privateInfo.maritalStatus}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-stone-500 font-medium">Residential Address</dt>
                <dd className="text-stone-900 text-right max-w-xs">{profile.privateInfo.address}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Bank & Tax Details" compact>
            <dl className="divide-y divide-stone-100 text-xs">
              <div className="py-2 flex justify-between">
                <dt className="text-stone-500 font-medium">Bank Name</dt>
                <dd className="text-stone-900">{profile.bank.bankName}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-stone-500 font-medium">Account Number</dt>
                <dd className="text-stone-900 font-mono">{profile.bank.accountNo}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-stone-500 font-medium">IFSC Code</dt>
                <dd className="text-stone-900 font-mono">{profile.bank.ifsc}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-stone-500 font-medium">PAN Number</dt>
                <dd className="text-stone-900 font-mono">{profile.bank.pan}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-stone-500 font-medium">UAN Identifier</dt>
                <dd className="text-stone-900 font-mono">{profile.bank.uan}</dd>
              </div>
            </dl>
          </Card>
        </div>
      )}

      {activeTab === 'salary' && (
        <Card title="Salary Structure (Admin View)" compact>
          <dl className="divide-y divide-stone-100 text-xs">
            <div className="py-2 flex justify-between">
              <dt className="text-stone-500 font-medium">Annual Base Salary</dt>
              <dd className="text-stone-900 font-bold font-mono">{profile.salary.base}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-stone-500 font-medium">House Rent Allowance (HRA)</dt>
              <dd className="text-stone-900 font-mono">{profile.salary.hra}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-stone-500 font-medium">Fixed & Flexible Allowances</dt>
              <dd className="text-stone-900 font-mono">{profile.salary.allowances}</dd>
            </div>
            <div className="py-2 flex justify-between font-semibold">
              <dt className="text-stone-900">Estimated Net Monthly Payout</dt>
              <dd className="text-plum-900 font-mono">{profile.salary.netMonthly}</dd>
            </div>
          </dl>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card title="Security Credentials & Login Log" compact>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
              <div>
                <span className="font-semibold text-stone-900 block">Workplace Email</span>
                <span className="text-stone-500">{profile.email}</span>
              </div>
              <Button variant="outline" size="sm">Change Email</Button>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
              <div>
                <span className="font-semibold text-stone-900 block">Password</span>
                <span className="text-stone-500">Updated 30 days ago</span>
              </div>
              <Button variant="outline" size="sm">Update Password</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
