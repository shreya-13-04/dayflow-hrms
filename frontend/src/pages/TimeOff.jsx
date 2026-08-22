import React, { useState, useEffect } from 'react';
import { Plus, Calendar, CheckCircle2, Clock, XCircle, AlertCircle, FileText, Check, X, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function TimeOff() {
  const { user, authFetch } = useAuth();
  const isAdminOrHr = user?.role === 'ADMIN' || user?.role === 'HR';

  const [roleView, setRoleView] = useState(isAdminOrHr ? 'admin' : 'employee');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [balances, setBalances] = useState({
    paidAllocated: 18,
    paidUsed: 0,
    paidRemaining: 18,
    sickAllocated: 12,
    sickUsed: 0,
    sickRemaining: 12,
    unpaidUsed: 0,
  });

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Request Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestForm, setRequestForm] = useState({
    leaveType: 'PAID',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  // Admin Comment Modal State for Approval/Rejection
  const [actionModal, setActionModal] = useState({ show: false, reqId: null, status: 'APPROVED', comment: '' });
  const [actionProcessing, setActionProcessing] = useState(false);

  // Fetch balances for logged in user
  const fetchBalance = async () => {
    try {
      const { ok, data } = await authFetch('/time-off/me/balance');
      if (ok && data.success) {
        setBalances(data.data);
      }
    } catch (err) {
      console.log('Failed to fetch leave balance:', err);
    }
  };

  // Fetch leave requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setApiError('');
      let endpoint = '';
      if (roleView === 'admin' && isAdminOrHr) {
        endpoint = `/time-off?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`;
      } else {
        endpoint = '/time-off/me';
      }

      const { ok, data } = await authFetch(endpoint);
      if (ok && data.success) {
        setRequests(data.data || []);
      }
    } catch (err) {
      setApiError('Failed to fetch leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [roleView, statusFilter, searchQuery]);

  // Submit Leave Request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    try {
      setSubmitting(true);
      const { ok, data } = await authFetch('/time-off/request', {
        method: 'POST',
        body: JSON.stringify(requestForm),
      });

      if (!ok || !data.success) {
        throw new Error(data.message || 'Failed to submit leave request.');
      }

      setSuccessMsg('Leave request submitted successfully.');
      setShowModal(false);
      setRequestForm({
        leaveType: 'PAID',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
      });
      fetchBalance();
      fetchRequests();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Admin Approve / Reject Status Update
  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    try {
      setActionProcessing(true);
      const { ok, data } = await authFetch(`/time-off/${actionModal.reqId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: actionModal.status,
          adminComment: actionModal.comment,
        }),
      });

      if (!ok || !data.success) {
        throw new Error(data.message || 'Failed to update leave request status.');
      }

      setSuccessMsg(`Leave request has been ${actionModal.status.toLowerCase()}.`);
      setActionModal({ show: false, reqId: null, status: 'APPROVED', comment: '' });
      fetchRequests();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setActionProcessing(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'EP';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

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
        title="Time Off & Leave Management"
        description="Submit leave applications, track balance allocations, and approve time-off requests."
        action={
          <div className="flex items-center space-x-2">
            {isAdminOrHr && (
              <div className="flex bg-stone-100 p-0.5 rounded border border-stone-200 text-xs font-semibold">
                <button
                  onClick={() => setRoleView('admin')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    roleView === 'admin' ? 'bg-[#581c38] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900 bg-transparent'
                  }`}
                >
                  Admin Queue
                </button>
                <button
                  onClick={() => setRoleView('employee')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    roleView === 'employee' ? 'bg-[#581c38] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900 bg-transparent'
                  }`}
                >
                  My Requests
                </button>
              </div>
            )}
            <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Request Time Off</span>
            </Button>
          </div>
        }
      />

      {/* Real Leave Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-stone-200/90 rounded-md p-4 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Paid Time Off</span>
            <div className="text-xl font-bold font-mono text-stone-900 mt-1">
              {balances.paidRemaining} <span className="text-xs font-sans text-stone-500 font-normal">days left</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Allocated: {balances.paidAllocated} • Used: {balances.paidUsed}</p>
          </div>
          <div className="p-2.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-4 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Sick Time Off</span>
            <div className="text-xl font-bold font-mono text-stone-900 mt-1">
              {balances.sickRemaining} <span className="text-xs font-sans text-stone-500 font-normal">days left</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Allocated: {balances.sickAllocated} • Used: {balances.sickUsed}</p>
          </div>
          <div className="p-2.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-4 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Unpaid Leave</span>
            <div className="text-xl font-bold font-mono text-stone-900 mt-1">
              {balances.unpaidUsed} <span className="text-xs font-sans text-stone-500 font-normal">days taken</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Subject to payroll deduction</p>
          </div>
          <div className="p-2.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Admin Queue Filters */}
      {roleView === 'admin' && isAdminOrHr && (
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-center bg-white p-2.5 rounded-md border border-stone-200/80 shadow-subtle">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee or reason..."
              className="w-full pl-8 pr-3 py-1 bg-stone-50 border border-stone-200 rounded text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#581c38]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1 px-2.5 text-xs bg-stone-50 border border-stone-200 rounded text-stone-800 focus:outline-none focus:border-[#581c38] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>
      )}

      {/* Leave Requests Table */}
      <div className="bg-white border border-stone-200/90 rounded-md overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Leave Type</th>
                <th className="py-2.5 px-3">Dates</th>
                <th className="py-2.5 px-3">Days</th>
                <th className="py-2.5 px-3">Reason / Comment</th>
                <th className="py-2.5 px-3">Status</th>
                {roleView === 'admin' && isAdminOrHr && <th className="py-2.5 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500 font-mono text-xs">
                    Loading Leave Requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500 text-xs">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const empName = req.user ? (req.user.name || `${req.user.firstName} ${req.user.lastName}`) : req.employeeId;

                  let badgeVariant = 'warning';
                  if (req.status === 'APPROVED') badgeVariant = 'success';
                  if (req.status === 'REJECTED') badgeVariant = 'danger';

                  return (
                    <tr key={req._id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded bg-[#581c38] text-white font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">
                            {getInitials(empName)}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900">{empName}</div>
                            <div className="text-[10px] font-mono text-stone-400">{req.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-stone-800">{req.leaveType}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-stone-600">
                        {req.startDate} to {req.endDate}
                      </td>
                      <td className="py-2.5 px-3 font-bold font-mono text-stone-900">{req.totalDays} day(s)</td>
                      <td className="py-2.5 px-3 text-stone-600 max-w-xs truncate">
                        {req.reason || 'No remarks'}
                        {req.adminComment && (
                          <span className="block text-[10px] text-stone-400 italic">HR Note: {req.adminComment}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={badgeVariant} dot>
                          ● {req.status}
                        </Badge>
                      </td>
                      {roleView === 'admin' && isAdminOrHr && (
                        <td className="py-2.5 px-3 text-right space-x-1">
                          {req.status === 'PENDING' ? (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                className="px-2 py-0.5 text-[11px]"
                                onClick={() => setActionModal({ show: true, reqId: req._id, status: 'APPROVED', comment: '' })}
                              >
                                <Check className="w-3 h-3 mr-0.5" /> Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="px-2 py-0.5 text-[11px] text-rose-700 border-rose-200 hover:bg-rose-50"
                                onClick={() => setActionModal({ show: true, reqId: req._id, status: 'REJECTED', comment: '' })}
                              >
                                <X className="w-3 h-3 mr-0.5" /> Reject
                              </Button>
                            </>
                          ) : (
                            <span className="text-[10px] text-stone-400 italic">Completed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Time Off Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-lg p-5 max-w-md w-full shadow-dropdown text-left space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-sm font-bold text-stone-900">Request Time Off</h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Leave Type *</label>
                <select
                  value={requestForm.leaveType}
                  onChange={(e) => setRequestForm({ ...requestForm, leaveType: e.target.value })}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                >
                  <option value="PAID">Paid Time Off ({balances.paidRemaining} days left)</option>
                  <option value="SICK">Sick Time Off ({balances.sickRemaining} days left)</option>
                  <option value="UNPAID">Unpaid Leave (Payroll Deduction Applies)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={requestForm.startDate}
                    onChange={(e) => setRequestForm({ ...requestForm, startDate: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={requestForm.endDate}
                    onChange={(e) => setRequestForm({ ...requestForm, endDate: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Reason / Remarks</label>
                <textarea
                  rows={2}
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  placeholder="Enter reason for leave request..."
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-stone-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Action Modal (Comment & Confirm) */}
      {actionModal.show && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-lg p-5 max-w-md w-full shadow-dropdown text-left space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-sm font-bold text-stone-900">
                Confirm {actionModal.status === 'APPROVED' ? 'Approval' : 'Rejection'}
              </h3>
              <button onClick={() => setActionModal({ ...actionModal, show: false })} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">HR / Admin Comment</label>
                <textarea
                  rows={2}
                  value={actionModal.comment}
                  onChange={(e) => setActionModal({ ...actionModal, comment: e.target.value })}
                  placeholder={actionModal.status === 'REJECTED' ? 'Reason for rejection...' : 'Optional approval comment...'}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-stone-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setActionModal({ ...actionModal, show: false })}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant={actionModal.status === 'APPROVED' ? 'primary' : 'danger'} 
                  size="sm" 
                  disabled={actionProcessing}
                >
                  {actionProcessing ? 'Processing...' : `Confirm ${actionModal.status}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
