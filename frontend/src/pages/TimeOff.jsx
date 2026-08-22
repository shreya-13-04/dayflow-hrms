import React, { useState } from 'react';
import { Calendar, Plus, Check, X, MessageSquare, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const requestsData = [
  { id: 'REQ-201', employee: 'Sarah Jenkins', empId: 'OI-SAJE2026-0012', type: 'Sick Leave', start: '2026-08-24', end: '2026-08-25', days: 2, status: 'Pending' },
  { id: 'REQ-202', employee: 'David Miller', empId: 'OI-DAMI2026-0013', type: 'Paid Time Off', start: '2026-09-01', end: '2026-09-05', days: 5, status: 'Approved' },
  { id: 'REQ-203', employee: 'Elena Rostova', empId: 'OI-ELRO2026-0014', type: 'Unpaid Leave', start: '2026-08-18', end: '2026-08-19', days: 2, status: 'Rejected', comment: 'Department sprint milestone' },
];

export function TimeOff() {
  const [requests, setRequests] = useState(requestsData);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const [roleView, setRoleView] = useState('hr'); // 'hr' or 'employee'

  const handleApprove = (id) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  };

  const handleConfirmReject = () => {
    if (!rejectingId) return;
    setRequests(requests.map(r => r.id === rejectingId ? { ...r, status: 'Rejected', comment: rejectComment } : r));
    setRejectingId(null);
    setRejectComment('');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Time-Off Workspace"
        description="Leave balances, policy allocations, and approval administration."
        action={
          <div className="flex items-center space-x-2">
            <div className="flex bg-stone-100 p-0.5 rounded border border-stone-200 text-xs">
              <button
                onClick={() => setRoleView('hr')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  roleView === 'hr' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                HR View
              </button>
              <button
                onClick={() => setRoleView('employee')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  roleView === 'employee' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                My Requests
              </button>
            </div>
            <Button variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Apply for Time Off</span>
            </Button>
          </div>
        }
      />

      {/* Allocation Summary Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-stone-200/90 rounded-md p-3.5 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Paid Time Off</span>
            <div className="text-xl font-bold text-stone-900 font-mono mt-0.5">24 Days</div>
            <p className="text-[11px] text-emerald-800 mt-0.5">Available for 2026</p>
          </div>
          <div className="p-2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-3.5 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Sick Time Off</span>
            <div className="text-xl font-bold text-stone-900 font-mono mt-0.5">07 Days</div>
            <p className="text-[11px] text-amber-800 mt-0.5">Available for 2026</p>
          </div>
          <div className="p-2 rounded bg-amber-50 text-amber-800 border border-amber-200">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-3.5 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Unpaid Leave</span>
            <div className="text-xl font-bold text-stone-900 font-mono mt-0.5">02 Days</div>
            <p className="text-[11px] text-stone-500 mt-0.5">Taken this year</p>
          </div>
          <div className="p-2 rounded bg-stone-100 text-stone-600 border border-stone-200">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-stone-200/90 rounded-md overflow-hidden shadow-subtle">
        <div className="px-3.5 py-2.5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Time-Off Requests Administration</h3>
          <span className="text-[11px] text-stone-500">Showing {requests.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Start Date</th>
                <th className="py-2.5 px-3">End Date</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-stone-900">{req.employee}</div>
                    <div className="text-[10px] font-mono text-stone-400">{req.empId}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-stone-800">{req.type}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-stone-600">{req.start}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-stone-600">{req.end}</td>
                  <td className="py-2.5 px-3 text-stone-800">{req.days} days</td>
                  <td className="py-2.5 px-3">
                    <Badge variant={req.status === 'Approved' ? 'success' : req.status === 'Pending' ? 'warning' : 'danger'}>
                      {req.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {req.status === 'Pending' && roleView === 'hr' ? (
                      <div className="flex items-center justify-end space-x-1">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => handleApprove(req.id)}
                          className="h-6 py-0 px-2 text-[11px]"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setRejectingId(req.id)}
                          className="h-6 py-0 px-2 text-[11px] border-rose-200 text-rose-800 hover:bg-rose-50"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-stone-400 italic">
                        {req.comment ? `Reason: ${req.comment}` : 'No action required'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Contextual Dialog Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-lg p-5 max-w-md w-full shadow-dropdown space-y-4 text-left">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-700" />
              <h3 className="text-sm font-bold text-stone-900">Provide Rejection Reason</h3>
            </div>
            <p className="text-xs text-stone-500">
              Please enter an explanation for rejecting this leave request. This will be recorded in the employee's audit log.
            </p>
            <textarea
              rows={3}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="e.g. Milestone deployment scheduled during this window..."
              className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded text-stone-900 focus:outline-none focus:bg-white focus:border-plum-800"
            />
            <div className="flex justify-end space-x-2 pt-2 border-t border-stone-100">
              <Button variant="outline" size="sm" onClick={() => setRejectingId(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmReject}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
