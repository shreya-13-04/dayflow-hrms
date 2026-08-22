import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

export function RoleRoute({ allowedRoles = [] }) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-stone-900">403 — Unauthorized Access</h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          Your role (<strong>{user?.role || 'EMPLOYEE'}</strong>) does not have authorization to access this administrative module. Only <strong>{allowedRoles.join(' / ')}</strong> users can access this page.
        </p>
        <div>
          <Button variant="primary" size="sm" onClick={() => window.location.href = '/dashboard'}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
