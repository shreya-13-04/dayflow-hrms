import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Key, ShieldAlert, Check } from 'lucide-react';
import { Button } from '../ui/Button';

export function ProtectedRoute() {
  const { isAuthenticated, loading, user, changePassword } = useAuth();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-stone-600 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-plum-900 animate-ping"></span>
          <span>Authenticating Dayflow Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (newPassword.length < 6) {
      setModalError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setModalError('New passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await changePassword(currentPassword, newPassword);
      setModalSuccess('Password changed successfully!');
      setTimeout(() => {
        setShowPasswordModal(false);
      }, 1200);
    } catch (err) {
      setModalError(err.message || 'Failed to change password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* First Login Password Change Banner */}
      {user?.isFirstLogin && !showPasswordModal && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>First Login Notice:</strong> You are using an initial password. Please update your password for security compliance.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordModal(true)}
            className="h-6 py-0 px-2 text-[11px] border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
          >
            Change Password Now
          </Button>
        </div>
      )}

      {/* Main Protected Route Content */}
      <Outlet />

      {/* First-Login Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-lg p-5 max-w-md w-full shadow-dropdown space-y-4 text-left">
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-plum-900" />
              <h3 className="text-sm font-bold text-stone-900">Update First-Login Password</h3>
            </div>
            <p className="text-xs text-stone-500">
              Set a permanent password for your Dayflow HR account (Employee ID: <strong>{user?.employeeId}</strong>).
            </p>

            {modalError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs">
                {modalError}
              </div>
            )}

            {modalSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Current / Initial Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:outline-none focus:border-plum-800"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">New Secure Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:outline-none focus:border-plum-800"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 focus:outline-none focus:border-plum-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Dismiss
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
