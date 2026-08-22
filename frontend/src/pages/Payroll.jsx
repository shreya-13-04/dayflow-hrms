import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Search, Calendar, FileText, Edit3, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SalarySlipModal } from '../components/payroll/SalarySlipModal';

export function Payroll() {
  const { user, authFetch } = useAuth();
  const isAdminOrHr = user?.role === 'ADMIN' || user?.role === 'HR';

  const [roleView, setRoleView] = useState(isAdminOrHr ? 'admin' : 'employee');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');

  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Selected Salary Slip Modal State
  const [activeSlip, setActiveSlip] = useState(null);

  // Edit Salary Structure Modal State (Admin/HR)
  const [editStructModal, setEditStructModal] = useState({ show: false, empId: null, name: '', wage: 10000 });
  const [updatingWage, setUpdatingWage] = useState(false);

  // Fetch Payroll Data
  const fetchPayroll = async () => {
    try {
      setLoading(true);
      setApiError('');

      let endpoint = '';
      if (roleView === 'admin' && isAdminOrHr) {
        endpoint = `/payroll?month=${selectedMonth}&year=${selectedYear}&search=${encodeURIComponent(searchQuery)}`;
      } else {
        endpoint = '/payroll/me';
      }

      const { ok, data } = await authFetch(endpoint);
      if (ok && data.success) {
        setPayrollRecords(data.data || []);
      }
    } catch (err) {
      setApiError('Failed to fetch payroll records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [roleView, selectedMonth, selectedYear, searchQuery]);

  // Open Salary Slip
  const handleOpenSalarySlip = async (empId, m = selectedMonth, y = selectedYear) => {
    try {
      const { ok, data } = await authFetch(`/payroll/${empId}/slip/${m}/${y}`);
      if (ok && data.success) {
        setActiveSlip(data.salarySlip);
      }
    } catch (err) {
      setApiError('Failed to load salary slip statement.');
    }
  };

  // Open Edit Salary Structure Modal
  const handleOpenEditStructure = async (emp) => {
    const empId = emp.employeeId;
    try {
      const { ok, data } = await authFetch(`/payroll/${empId}/salary`);
      if (ok && data.success) {
        setEditStructModal({
          show: true,
          empId,
          name: emp.user?.name || emp.name || empId,
          wage: data.data?.monthlyWage || 10000,
        });
      }
    } catch (err) {
      setApiError('Failed to fetch salary structure.');
    }
  };

  // Submit Salary Structure Update (Admin/HR)
  const handleSaveSalaryStructure = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    try {
      setUpdatingWage(true);
      const { ok, data } = await authFetch(`/payroll/${editStructModal.empId}/salary`, {
        method: 'PUT',
        body: JSON.stringify({ monthlyWage: Number(editStructModal.wage) }),
      });

      if (!ok || !data.success) {
        throw new Error(data.message || 'Failed to update salary structure.');
      }

      setSuccessMsg(`Salary structure updated successfully for ${editStructModal.name}.`);
      setEditStructModal({ show: false, empId: null, name: '', wage: 10000 });
      fetchPayroll();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setUpdatingWage(false);
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
        title="Payroll & Compensation Workspace"
        description="Salary component configurations, attendance-driven payroll processing, and salary slips."
        action={
          isAdminOrHr ? (
            <div className="flex bg-stone-100 p-0.5 rounded border border-stone-200 text-xs font-semibold">
              <button
                onClick={() => setRoleView('admin')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  roleView === 'admin' ? 'bg-[#581c38] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900 bg-transparent'
                }`}
              >
                Admin Workspace
              </button>
              <button
                onClick={() => setRoleView('employee')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  roleView === 'employee' ? 'bg-[#581c38] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900 bg-transparent'
                }`}
              >
                My Salary Slips
              </button>
            </div>
          ) : null
        }
      />

      {/* Month Selector & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-2.5 rounded-md border border-stone-200/80 shadow-subtle">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-stone-500" />
          <span className="text-xs font-bold text-stone-900">Period:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="py-1 px-2 text-xs bg-stone-50 border border-stone-200 rounded text-stone-800 focus:outline-none focus:border-[#581c38] cursor-pointer font-semibold"
          >
            {[
              { val: 1, name: 'January' },
              { val: 2, name: 'February' },
              { val: 3, name: 'March' },
              { val: 4, name: 'April' },
              { val: 5, name: 'May' },
              { val: 6, name: 'June' },
              { val: 7, name: 'July' },
              { val: 8, name: 'August' },
              { val: 9, name: 'September' },
              { val: 10, name: 'October' },
              { val: 11, name: 'November' },
              { val: 12, name: 'December' },
            ].map(m => (
              <option key={m.val} value={m.val}>{m.name}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="py-1 px-2 text-xs bg-stone-50 border border-stone-200 rounded text-stone-800 focus:outline-none focus:border-[#581c38] cursor-pointer font-mono font-semibold"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>

        {roleView === 'admin' && isAdminOrHr && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee or ID..."
              className="w-full pl-8 pr-3 py-1 bg-stone-50 border border-stone-200 rounded text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#581c38]"
            />
          </div>
        )}
      </div>

      {/* Dense Payroll Table */}
      <div className="bg-white border border-stone-200/90 rounded-md overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Employee ID</th>
                <th className="py-2.5 px-3">Monthly Wage</th>
                <th className="py-2.5 px-3">Payable Days</th>
                <th className="py-2.5 px-3">Gross Salary</th>
                <th className="py-2.5 px-3">Deductions</th>
                <th className="py-2.5 px-3">Net Pay</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-500 font-mono text-xs">
                    Processing Payroll Records...
                  </td>
                </tr>
              ) : payrollRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-500 text-xs">
                    No payroll records found for selected month/period.
                  </td>
                </tr>
              ) : (
                payrollRecords.map((rec) => {
                  const empName = rec.user ? (rec.user.name || `${rec.user.firstName} ${rec.user.lastName}`) : rec.employeeId;

                  return (
                    <tr key={rec._id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded bg-[#581c38] text-white font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">
                            {getInitials(empName)}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900">{empName}</div>
                            <div className="text-[10px] text-stone-500">{rec.user?.designation || 'Software Engineer'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-stone-500">{rec.employeeId}</td>
                      <td className="py-2.5 px-3 font-mono text-stone-900">${(rec.monthlyWage || 10000).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-stone-800">
                        {rec.payableDays} / {rec.workingDays} days
                      </td>
                      <td className="py-2.5 px-3 font-mono text-stone-900">${(rec.grossSalary || 0).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-rose-700">${(rec.totalDeductions || 0).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#581c38] text-sm">
                        ${(rec.netSalary || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1">
                        {roleView === 'admin' && isAdminOrHr && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-2 py-0.5 text-[11px]"
                            onClick={() => handleOpenEditStructure(rec)}
                          >
                            <Edit3 className="w-3 h-3 mr-0.5" /> Wage
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          className="px-2 py-0.5 text-[11px]"
                          onClick={() => handleOpenSalarySlip(rec.employeeId, rec.month, rec.year)}
                        >
                          <FileText className="w-3 h-3 mr-0.5" /> Salary Slip
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Salary Structure Modal (Admin/HR Only) */}
      {editStructModal.show && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-lg p-5 max-w-md w-full shadow-dropdown text-left space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-sm font-bold text-stone-900">Configure Salary Structure ({editStructModal.name})</h3>
              <button onClick={() => setEditStructModal({ ...editStructModal, show: false })} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSalaryStructure} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Monthly Wage ($) *</label>
                <input
                  type="number"
                  required
                  value={editStructModal.wage}
                  onChange={(e) => setEditStructModal({ ...editStructModal, wage: e.target.value })}
                  placeholder="10000"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded text-stone-900 font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded border border-stone-200 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-stone-600">
                  <span>Basic Salary (50%):</span>
                  <span>${(editStructModal.wage * 0.5).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>HRA (40% of Basic):</span>
                  <span>${((editStructModal.wage * 0.5) * 0.4).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>PF Deduction (12%):</span>
                  <span>${((editStructModal.wage * 0.5) * 0.12).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-stone-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditStructModal({ ...editStructModal, show: false })}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={updatingWage}>
                  {updatingWage ? 'Recalculating...' : 'Save & Recalculate'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Slip Modal */}
      {activeSlip && (
        <SalarySlipModal
          slip={activeSlip}
          onClose={() => setActiveSlip(null)}
        />
      )}
    </div>
  );
}
