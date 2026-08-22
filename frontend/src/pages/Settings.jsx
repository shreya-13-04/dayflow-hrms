import React, { useState } from 'react';
import { Shield, Lock, Bell, Building, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function Settings() {
  const { user, authFetch } = useAuth();

  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPass, setUpdatingPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);

  const handlePasswordChange = async (e) => {
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
      setUpdatingPass(true);
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
    } finally {
      setUpdatingPass(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl text-stone-900">
      <PageHeader
        title="Workspace & Account Settings"
        description="Manage your account profile, security credentials, and application preferences."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column: Account Summary */}
        <Card className="md:col-span-1" title="Account Credentials" compact>
          <dl className="divide-y divide-stone-100 text-xs">
            <div className="py-2">
              <dt className="text-stone-500">Full Name</dt>
              <dd className="font-semibold text-stone-900 mt-0.5">{user?.name || 'Alex Morgan'}</dd>
            </div>
            <div className="py-2">
              <dt className="text-stone-500">Employee ID</dt>
              <dd className="font-mono text-stone-900 mt-0.5">{user?.employeeId || 'DF-ALMO-2026-0001'}</dd>
            </div>
            <div className="py-2">
              <dt className="text-stone-500">Work Email</dt>
              <dd className="text-stone-900 mt-0.5">{user?.email}</dd>
            </div>
            <div className="py-2">
              <dt className="text-stone-500">Assigned Role</dt>
              <dd className="font-semibold text-[#581c38] mt-0.5">{user?.role || 'ADMIN'}</dd>
            </div>
            <div className="py-2">
              <dt className="text-stone-500">Organization</dt>
              <dd className="text-stone-900 mt-0.5">{user?.companyName || 'Dayflow Technologies'}</dd>
            </div>
          </dl>
        </Card>

        {/* Right Column: Security & Preferences */}
        <div className="md:col-span-2 space-y-4">
          <Card title="Security & Password Management" compact>
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

            <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 chars"
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
                    placeholder="Re-enter password"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:outline-none focus:border-[#581c38]"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="sm" disabled={updatingPass}>
                {updatingPass ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Card>

          <Card title="Notification Preferences" compact>
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer py-1 border-b border-stone-100">
                <div>
                  <span className="font-semibold text-stone-900 block">In-App Event Alerts</span>
                  <span className="text-stone-500">Receive leave approvals and shift notifications in header drawer.</span>
                </div>
                <input
                  type="checkbox"
                  checked={inAppNotifs}
                  onChange={(e) => setInAppNotifs(e.target.checked)}
                  className="w-4 h-4 text-[#581c38] rounded border-stone-300 focus:ring-[#581c38]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <div>
                  <span className="font-semibold text-stone-900 block">Email Digest Notifications</span>
                  <span className="text-stone-500">Receive dev-safe console email notifications for verification links.</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="w-4 h-4 text-[#581c38] rounded border-stone-300 focus:ring-[#581c38]"
                />
              </label>
            </div>
          </Card>

          <Card title="Workspace Platform Metadata" compact>
            <dl className="divide-y divide-stone-100 text-xs font-mono">
              <div className="py-1.5 flex justify-between">
                <span className="text-stone-500 font-sans">System Version</span>
                <span className="font-bold text-stone-900">Dayflow HRMS v1.0.0 (Production Build)</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-stone-500 font-sans">Database Status</span>
                <span className="text-emerald-700 font-semibold">MongoDB Connected (localhost:27017)</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-stone-500 font-sans">Authentication</span>
                <span className="text-stone-800">JWT + bcryptjs (RBAC Enforced)</span>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
