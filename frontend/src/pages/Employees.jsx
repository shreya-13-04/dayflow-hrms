import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Mail, Phone, ChevronRight, Award, ArrowLeft, 
  Edit3, Trash2, Shield, Building, CreditCard, User, Camera, Check, X, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export function Employees() {
  const { user, authFetch } = useAuth();
  const isAdminOrHr = user?.role === 'ADMIN' || user?.role === 'HR';

  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('resume');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add Employee Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: user?.companyName || 'Dayflow Corp',
    department: 'Engineering',
    designation: 'Software Engineer',
    manager: 'Alex Morgan',
    location: 'San Francisco, CA',
    joiningDate: new Date().toISOString().split('T')[0],
    role: 'EMPLOYEE',
    avatarUrl: '',
  });
  const [creating, setCreating] = useState(false);

  // Edit Profile Modal / Inline State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');
  const [updating, setUpdating] = useState(false);

  // Security Tab Password Change State
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Fetch employees list from backend
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const url = `/employees?search=${encodeURIComponent(searchQuery)}&department=${encodeURIComponent(deptFilter)}`;
      const { ok, data } = await authFetch(url);
      if (ok && data.success) {
        setEmployees(data.data || []);
      }
    } catch (err) {
      setApiError('Failed to fetch employee records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchQuery, deptFilter]);

  // Handle Add Employee Submit (Admin/HR)
  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    try {
      setCreating(true);
      const { ok, data } = await authFetch('/employees', {
        method: 'POST',
        body: JSON.stringify(addForm),
      });

      if (!ok || !data.success) {
        throw new Error(data.message || 'Failed to create employee record.');
      }

      setSuccessMsg(data.message || `Employee created successfully! ID: ${data.data?.employeeId}`);
      setShowAddModal(false);
      setAddForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: user?.companyName || 'Dayflow Corp',
        department: 'Engineering',
        designation: 'Software Engineer',
        manager: 'Alex Morgan',
        location: 'San Francisco, CA',
        joiningDate: new Date().toISOString().split('T')[0],
        role: 'EMPLOYEE',
        avatarUrl: '',
      });
      fetchEmployees();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Open Edit Profile
  const openEditModal = (emp) => {
    setEditForm({
      ...emp,
      phone: emp.phone || '',
      residentialAddress: emp.residentialAddress || '',
      personalEmail: emp.personalEmail || '',
      about: emp.about || '',
      skills: Array.isArray(emp.skills) ? [...emp.skills] : [],
      certifications: Array.isArray(emp.certifications) ? [...emp.certifications] : [],
      dateOfBirth: emp.dateOfBirth || '',
      nationality: emp.nationality || 'United States',
      gender: emp.gender || 'Unspecified',
      maritalStatus: emp.maritalStatus || 'Single',
      avatarUrl: emp.avatarUrl || '',
    });
    setShowEditModal(true);
  };

  // Handle Save Profile Edit
  const handleSaveProfileEdit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    const empId = selectedEmp.employeeId || selectedEmp.id;

    try {
      setUpdating(true);

      // Filter payload based on permissions
      let payload = {};
      if (isAdminOrHr) {
        payload = { ...editForm };
      } else {
        // Employee role can edit permitted personal fields only
        payload = {
          phone: editForm.phone,
          residentialAddress: editForm.residentialAddress,
          personalEmail: editForm.personalEmail,
          about: editForm.about,
          skills: editForm.skills,
          certifications: editForm.certifications,
          avatarUrl: editForm.avatarUrl,
        };
      }

      const { ok, data } = await authFetch(`/employees/${empId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (!ok || !data.success) {
        throw new Error(data.message || 'Failed to update employee record.');
      }

      setSuccessMsg('Employee profile updated successfully.');
      setSelectedEmp(data.data);
      setShowEditModal(false);
      fetchEmployees();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Add / Remove Skills
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setEditForm(prev => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill.trim()],
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (index) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // Add / Remove Certifications
  const handleAddCert = () => {
    if (!newCert.trim()) return;
    setEditForm(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), newCert.trim()],
    }));
    setNewCert('');
  };

  const handleRemoveCert = (index) => {
    setEditForm(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  // Password Change in Security Tab
  const handleSecurityPasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    try {
      const { ok, data } = await authFetch('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: currPassword, newPassword }),
      });

      if (!ok || !data.success) {
        throw new Error(data.message || 'Failed to update password.');
      }

      setPassSuccess('Password updated successfully!');
      setCurrPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.message);
    }
  };

  // Helper avatar initials
  const getInitials = (name) => {
    if (!name) return 'EP';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Dedicated Employee Profile Workspace View
  if (selectedEmp) {
    const isSelf = user?.employeeId === selectedEmp.employeeId || user?.id === selectedEmp.id;
    const canEdit = isAdminOrHr || isSelf;

    return (
      <div className="space-y-4">
        {/* Alerts */}
        {apiError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Back navigation */}
        <button
          onClick={() => setSelectedEmp(null)}
          className="inline-flex items-center text-xs font-semibold text-stone-600 hover:text-plum-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to People Directory</span>
        </button>

        {/* Employee Profile Header Workspace */}
        <div className="bg-white border border-stone-200/90 rounded-lg p-5 shadow-subtle flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start space-x-4">
            {selectedEmp.avatarUrl ? (
              <img
                src={selectedEmp.avatarUrl}
                alt={selectedEmp.name}
                className="w-16 h-16 rounded-lg object-cover border border-stone-200 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-[#581c38] text-white font-bold text-xl flex items-center justify-center shadow-xs shrink-0 font-mono">
                {getInitials(selectedEmp.name)}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-stone-900 font-sans tracking-tight">{selectedEmp.name}</h1>
                <Badge variant="default" dot>
                  {selectedEmp.workStatus || 'Status unavailable'}
                </Badge>
              </div>
              <p className="text-xs font-medium text-stone-700">{selectedEmp.designation} • {selectedEmp.department}</p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 font-mono pt-1">
                <span>ID: {selectedEmp.employeeId}</span>
                <span>•</span>
                <span>Manager: {selectedEmp.manager}</span>
                <span>•</span>
                <span>Location: {selectedEmp.location}</span>
              </div>
            </div>
          </div>

          {canEdit && (
            <Button variant="secondary" size="sm" onClick={() => openEditModal(selectedEmp)}>
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              <span>Edit Profile</span>
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-stone-200/80 flex space-x-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('resume')}
            className={`pb-2 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'resume' ? 'border-[#581c38] text-[#581c38] font-bold' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            1. Resume & Job
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`pb-2 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'private' ? 'border-[#581c38] text-[#581c38] font-bold' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            2. Private Info & Bank
          </button>
          <button
            onClick={() => setActiveTab('salary')}
            className={`pb-2 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'salary' ? 'border-[#581c38] text-[#581c38] font-bold' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            3. Salary Info
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'security' ? 'border-[#581c38] text-[#581c38] font-bold' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            4. Security
          </button>
        </div>

        {/* Tab Panels */}
        {activeTab === 'resume' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2" title="About Employee" compact>
              <p className="text-xs text-stone-700 leading-relaxed">
                {selectedEmp.about || 'No bio description provided.'}
              </p>

              <div className="mt-4 pt-3 border-t border-stone-100">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(selectedEmp.skills) && selectedEmp.skills.length > 0 ? (
                    selectedEmp.skills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 text-[11px] bg-stone-100 text-stone-800 rounded border border-stone-200">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-stone-400 italic">No skills added yet.</span>
                  )}
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <Card title="Certifications" compact>
                {Array.isArray(selectedEmp.certifications) && selectedEmp.certifications.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-stone-700">
                    {selectedEmp.certifications.map((cert, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <Award className="w-3.5 h-3.5 text-[#581c38] shrink-0 mt-0.5" />
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-stone-400 italic">No certifications listed.</p>
                )}
              </Card>

              <Card title="Job Information" compact>
                <dl className="divide-y divide-stone-100 text-xs">
                  <div className="py-1.5 flex justify-between">
                    <dt className="text-stone-500">Company</dt>
                    <dd className="font-medium text-stone-900">{selectedEmp.companyName}</dd>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <dt className="text-stone-500">Department</dt>
                    <dd className="font-medium text-stone-900">{selectedEmp.department}</dd>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <dt className="text-stone-500">Position</dt>
                    <dd className="font-medium text-stone-900">{selectedEmp.designation}</dd>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <dt className="text-stone-500">Manager</dt>
                    <dd className="font-medium text-stone-900">{selectedEmp.manager}</dd>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <dt className="text-stone-500">Location</dt>
                    <dd className="font-medium text-stone-900">{selectedEmp.location}</dd>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <dt className="text-stone-500">Joining Date</dt>
                    <dd className="font-mono text-stone-900">
                      {new Date(selectedEmp.joiningDate || Date.now()).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'private' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Private Information" compact>
              <dl className="divide-y divide-stone-100 text-xs">
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500">Date of Birth</dt>
                  <dd className="text-stone-900 font-mono">{selectedEmp.dateOfBirth || 'Not specified'}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500">Residential Address</dt>
                  <dd className="text-stone-900 text-right max-w-xs">{selectedEmp.residentialAddress || 'Not specified'}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500">Nationality</dt>
                  <dd className="text-stone-900">{selectedEmp.nationality || 'United States'}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500">Personal Email</dt>
                  <dd className="text-stone-900">{selectedEmp.personalEmail || selectedEmp.email}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500">Gender</dt>
                  <dd className="text-stone-900">{selectedEmp.gender || 'Unspecified'}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500">Marital Status</dt>
                  <dd className="text-stone-900">{selectedEmp.maritalStatus || 'Single'}</dd>
                </div>
              </dl>
            </Card>

            <Card title="Bank & Tax Details" compact>
              <dl className="divide-y divide-stone-100 text-xs">
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500">Account Number</dt>
                  <dd className="text-stone-900 font-mono">{selectedEmp.bankDetails?.accountNo || '••••••••4892'}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500">Bank Name</dt>
                  <dd className="text-stone-900">{selectedEmp.bankDetails?.bankName || 'First National Bank'}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500">IFSC Code</dt>
                  <dd className="text-stone-900 font-mono">{selectedEmp.bankDetails?.ifsc || 'FNB0001829'}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500">PAN Identifier</dt>
                  <dd className="text-stone-900 font-mono">{selectedEmp.bankDetails?.pan || 'ABCDE1234F'}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500">UAN Identifier</dt>
                  <dd className="text-stone-900 font-mono">{selectedEmp.bankDetails?.uan || '100982349182'}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500">Employee Code</dt>
                  <dd className="text-stone-900 font-mono font-bold">{selectedEmp.employeeId}</dd>
                </div>
              </dl>
            </Card>
          </div>
        )}

        {activeTab === 'salary' && (
          <Card title="Salary Information (Admin Access Restricted)" compact>
            <div className="p-3 bg-plum-50/50 border border-plum-200 rounded mb-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-900">Compensation Structure Record</span>
              <Badge variant="primary">{isAdminOrHr ? 'Admin View' : 'Restricted'}</Badge>
            </div>
            <dl className="divide-y divide-stone-100 text-xs">
              <div className="py-2 flex justify-between">
                <dt className="text-stone-500 font-medium">Base Salary</dt>
                <dd className="text-stone-900 font-bold font-mono">${(selectedEmp.salaryInfo?.baseSalary || 120000).toLocaleString()} / year</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-stone-500 font-medium">House Rent Allowance (HRA)</dt>
                <dd className="text-stone-900 font-mono">${(selectedEmp.salaryInfo?.hra || 24000).toLocaleString()}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-stone-500 font-medium">Fixed & Special Allowances</dt>
                <dd className="text-stone-900 font-mono">${(selectedEmp.salaryInfo?.allowances || 12000).toLocaleString()}</dd>
              </div>
              <div className="py-2 flex justify-between font-semibold">
                <dt className="text-stone-900">Estimated Net Pay</dt>
                <dd className="text-[#581c38] font-mono">${(selectedEmp.salaryInfo?.netPay || 10000).toLocaleString()} / month</dd>
              </div>
            </dl>

            {!isAdminOrHr && (
              <p className="mt-3 text-[11px] text-stone-400 italic">
                * Note: Employees are not permitted to edit salary structure. Contact HR for compensation queries.
              </p>
            )}
          </Card>
        )}

        {activeTab === 'security' && (
          <Card title="Security & Authentication" compact>
            {passError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs">
                {passError}
              </div>
            )}
            {passSuccess && (
              <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center space-x-1">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSecurityPasswordChange} className="space-y-3 max-w-md text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:outline-none focus:border-[#581c38]"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:outline-none focus:border-[#581c38]"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:outline-none focus:border-[#581c38]"
                />
              </div>

              <Button type="submit" variant="primary" size="sm">
                <span>Update Password</span>
              </Button>
            </form>
          </Card>
        )}

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-stone-200 rounded-lg p-5 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-dropdown text-left space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="text-sm font-bold text-stone-900">
                  Edit Profile ({isAdminOrHr ? 'Admin Mode' : 'Personal Fields Only'})
                </h3>
                <button onClick={() => setShowEditModal(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfileEdit} className="space-y-3 text-xs">
                {/* Permitted for ALL (Phone, Address, Personal Email, Avatar) */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Personal Email</label>
                    <input
                      type="email"
                      value={editForm.personalEmail || ''}
                      onChange={(e) => setEditForm({ ...editForm, personalEmail: e.target.value })}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={editForm.residentialAddress || ''}
                    onChange={(e) => setEditForm({ ...editForm, residentialAddress: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">About / Bio</label>
                  <textarea
                    rows={2}
                    value={editForm.about || ''}
                    onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Profile Picture URL</label>
                  <input
                    type="text"
                    value={editForm.avatarUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                    placeholder="https://... or data:image/..."
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                  />
                </div>

                {/* Skills Management */}
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill (e.g. React)..."
                      className="flex-1 p-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddSkill}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(editForm.skills || []).map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-800 border border-stone-200">
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(index)} className="ml-1 text-stone-400 hover:text-rose-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications Management */}
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Certifications</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newCert}
                      onChange={(e) => setNewCert(e.target.value)}
                      placeholder="Add certification..."
                      className="flex-1 p-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddCert}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(editForm.certifications || []).map((cert, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-800 border border-stone-200">
                        {cert}
                        <button type="button" onClick={() => handleRemoveCert(index)} className="ml-1 text-stone-400 hover:text-rose-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Admin/HR Restricted Fields */}
                {isAdminOrHr && (
                  <div className="pt-3 border-t border-stone-100 space-y-3">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Admin Restricted Fields</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">Department</label>
                        <input
                          type="text"
                          value={editForm.department || ''}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">Designation</label>
                        <input
                          type="text"
                          value={editForm.designation || ''}
                          onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                          className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">Manager</label>
                        <input
                          type="text"
                          value={editForm.manager || ''}
                          onChange={(e) => setEditForm({ ...editForm, manager: e.target.value })}
                          className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">Role</label>
                        <select
                          value={editForm.role || 'EMPLOYEE'}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                        >
                          <option value="EMPLOYEE">EMPLOYEE</option>
                          <option value="HR">HR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-3 border-t border-stone-100">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={updating}>
                    {updating ? 'Saving...' : 'Save Profile Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Employee Directory List (Admin/HR & General view)
  return (
    <div className="space-y-4">
      {/* Alerts */}
      {apiError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <PageHeader
        title="People Directory"
        description="Comprehensive organizational workforce roster and employee records."
        action={
          isAdminOrHr ? (
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Create Employee</span>
            </Button>
          ) : null
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
            className="w-full pl-8 pr-3 py-1 bg-stone-50 border border-stone-200 rounded text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#581c38]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="py-1 px-2.5 text-xs bg-stone-50 border border-stone-200 rounded text-stone-800 focus:outline-none focus:border-[#581c38] cursor-pointer"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Design">Design</option>
            <option value="Sales">Sales</option>
            <option value="Finance">Finance</option>
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500 font-mono text-xs">
                    Loading Employee Records...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500 text-xs">
                    No employee records found matching filter criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr 
                    key={emp.id || emp.employeeId} 
                    onClick={() => setSelectedEmp(emp)}
                    className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2.5">
                        {emp.avatarUrl ? (
                          <img src={emp.avatarUrl} alt={emp.name} className="w-7 h-7 rounded object-cover border border-stone-200 shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded bg-[#581c38] text-white font-bold flex items-center justify-center text-[10px] shrink-0 font-mono shadow-xs">
                            {getInitials(emp.name)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-stone-900 group-hover:text-[#581c38] transition-colors">{emp.name}</div>
                          <div className="text-[11px] text-stone-500">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-stone-500">{emp.employeeId}</td>
                    <td className="py-2.5 px-3 font-medium text-stone-800">{emp.department || 'Engineering'}</td>
                    <td className="py-2.5 px-3 text-stone-600">{emp.designation || 'Software Engineer'}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant="default" dot>
                        {emp.workStatus || 'Status unavailable'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button className="text-stone-400 group-hover:text-[#581c38] p-1 rounded">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal (Admin/HR Only) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-lg p-5 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-dropdown text-left space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-sm font-bold text-stone-900">Create New Employee (Auto Employee ID)</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.firstName}
                    onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                    placeholder="Jane"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.lastName}
                    onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                    placeholder="Doe"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="jane.doe@company.com"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={addForm.department}
                    onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={addForm.designation}
                    onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Manager</label>
                  <input
                    type="text"
                    value={addForm.manager}
                    onChange={(e) => setAddForm({ ...addForm, manager: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={addForm.location}
                    onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={addForm.joiningDate}
                    onChange={(e) => setAddForm({ ...addForm, joiningDate: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Role</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="HR">HR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Profile Picture URL (Optional)</label>
                <input
                  type="text"
                  value={addForm.avatarUrl}
                  onChange={(e) => setAddForm({ ...addForm, avatarUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                />
              </div>

              <p className="text-[11px] text-stone-400 italic">
                * Note: Employee ID will be auto-generated by the backend upon submission.
              </p>

              <div className="flex justify-end space-x-2 pt-3 border-t border-stone-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={creating}>
                  {creating ? 'Creating Employee...' : 'Create Employee'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
