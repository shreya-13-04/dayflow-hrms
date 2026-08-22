import React, { useState, useEffect } from 'react';
import { Download, Printer, Search, Calendar, FileText, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { exportToCSV } from '../utils/csvExport';

export function Reports() {
  const { authFetch } = useAuth();
  const [reportType, setReportType] = useState('attendance'); // attendance, leave, payroll
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);

  // Attendance filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Leave filters
  const [leaveStatus, setLeaveStatus] = useState('ALL');
  const [leaveType, setLeaveType] = useState('ALL');

  // Payroll filters
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());

  const fetchReport = async () => {
    try {
      setLoading(true);
      let endpoint = '';

      if (reportType === 'attendance') {
        endpoint = `/reports/attendance?startDate=${startDate}&endDate=${endDate}&search=${encodeURIComponent(searchQuery)}`;
      } else if (reportType === 'leave') {
        endpoint = `/reports/leave?status=${leaveStatus}&leaveType=${leaveType}&search=${encodeURIComponent(searchQuery)}`;
      } else if (reportType === 'payroll') {
        endpoint = `/reports/payroll?month=${payrollMonth}&year=${payrollYear}&search=${encodeURIComponent(searchQuery)}`;
      }

      const { ok, data } = await authFetch(endpoint);
      if (ok && data.success) {
        setReportData(data.data || []);
      }
    } catch (err) {
      console.log('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, startDate, endDate, leaveStatus, leaveType, payrollMonth, payrollYear, searchQuery]);

  const handleExportCSV = () => {
    if (!reportData || !reportData.length) return;
    const filename = `dayflow_${reportType}_report_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(filename, reportData);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 text-stone-900 print:p-0">
      {/* Header controls (hidden during print) */}
      <div className="print:hidden">
        <PageHeader
          title="Organization Reports & Audit Logs"
          description="Exportable attendance records, time-off summaries, and payroll statements."
          action={
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-3.5 h-3.5 mr-1" />
                <span>Print Report</span>
              </Button>
              <Button variant="primary" size="sm" onClick={handleExportCSV}>
                <Download className="w-3.5 h-3.5 mr-1" />
                <span>Export to CSV</span>
              </Button>
            </div>
          }
        />
      </div>

      {/* Report Type Selector Tabs (hidden during print) */}
      <div className="border-b border-stone-200/80 flex space-x-4 text-xs font-medium print:hidden">
        <button
          onClick={() => setReportType('attendance')}
          className={`pb-2 transition-colors border-b-2 cursor-pointer ${
            reportType === 'attendance' ? 'border-[#581c38] text-[#581c38] font-bold' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Attendance Report
        </button>
        <button
          onClick={() => setReportType('leave')}
          className={`pb-2 transition-colors border-b-2 cursor-pointer ${
            reportType === 'leave' ? 'border-[#581c38] text-[#581c38] font-bold' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Time Off & Leave Report
        </button>
        <button
          onClick={() => setReportType('payroll')}
          className={`pb-2 transition-colors border-b-2 cursor-pointer ${
            reportType === 'payroll' ? 'border-[#581c38] text-[#581c38] font-bold' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Payroll & Salary Report
        </button>
      </div>

      {/* Filters (hidden during print) */}
      <div className="bg-white p-3 rounded-md border border-stone-200/80 shadow-subtle flex flex-col sm:flex-row gap-3 justify-between items-center print:hidden text-xs">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee or record..."
            className="w-full pl-8 pr-3 py-1 bg-stone-50 border border-stone-200 rounded text-stone-800 focus:outline-none focus:border-[#581c38]"
          />
        </div>

        {reportType === 'attendance' && (
          <div className="flex items-center space-x-2">
            <span className="font-medium text-stone-600">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="py-1 px-2 bg-stone-50 border border-stone-200 rounded text-stone-800"
            />
            <span className="font-medium text-stone-600">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="py-1 px-2 bg-stone-50 border border-stone-200 rounded text-stone-800"
            />
          </div>
        )}

        {reportType === 'leave' && (
          <div className="flex items-center space-x-2">
            <select
              value={leaveStatus}
              onChange={(e) => setLeaveStatus(e.target.value)}
              className="py-1 px-2 bg-stone-50 border border-stone-200 rounded text-stone-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        )}

        {reportType === 'payroll' && (
          <div className="flex items-center space-x-2">
            <select
              value={payrollMonth}
              onChange={(e) => setPayrollMonth(Number(e.target.value))}
              className="py-1 px-2 bg-stone-50 border border-stone-200 rounded text-stone-800 font-semibold"
            >
              {[
                { val: 1, name: 'Jan' }, { val: 2, name: 'Feb' }, { val: 3, name: 'Mar' },
                { val: 4, name: 'Apr' }, { val: 5, name: 'May' }, { val: 6, name: 'Jun' },
                { val: 7, name: 'Jul' }, { val: 8, name: 'Aug' }, { val: 9, name: 'Sep' },
                { val: 10, name: 'Oct' }, { val: 11, name: 'Nov' }, { val: 12, name: 'Dec' },
              ].map(m => (
                <option key={m.val} value={m.val}>{m.name}</option>
              ))}
            </select>
            <select
              value={payrollYear}
              onChange={(e) => setPayrollYear(Number(e.target.value))}
              className="py-1 px-2 bg-stone-50 border border-stone-200 rounded text-stone-800 font-mono font-semibold"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Report Table (Printable) */}
      <div className="bg-white border border-stone-200 rounded-md overflow-hidden shadow-subtle print:border-none print:shadow-none">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center print:border-b-2 print:border-stone-900">
          <div>
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider font-serif">
              Dayflow HRMS — {reportType.toUpperCase()} REPORT
            </h2>
            <p className="text-[11px] text-stone-500 font-mono">Generated: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right text-xs font-mono font-bold text-[#581c38]">
            Records: {reportData.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
              {reportType === 'attendance' && (
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Employee ID</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Check In</th>
                  <th className="py-2.5 px-3">Check Out</th>
                  <th className="py-2.5 px-3">Work Hours</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              )}
              {reportType === 'leave' && (
                <tr>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Leave Type</th>
                  <th className="py-2.5 px-3">Start Date</th>
                  <th className="py-2.5 px-3">End Date</th>
                  <th className="py-2.5 px-3">Total Days</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              )}
              {reportType === 'payroll' && (
                <tr>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Employee ID</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Monthly Wage</th>
                  <th className="py-2.5 px-3">Payable Days</th>
                  <th className="py-2.5 px-3">Gross Salary</th>
                  <th className="py-2.5 px-3">Deductions</th>
                  <th className="py-2.5 px-3 text-right">Net Pay</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-500 font-mono text-xs">
                    Generating Report...
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-500 text-xs">
                    No records found matching criteria.
                  </td>
                </tr>
              ) : (
                reportData.map((row, i) => (
                  <tr key={i} className="hover:bg-stone-50/80 transition-colors">
                    {reportType === 'attendance' && (
                      <>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-stone-600">{row.date}</td>
                        <td className="py-2.5 px-3 font-semibold text-stone-900">{row.name}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-stone-500">{row.employeeId}</td>
                        <td className="py-2.5 px-3 text-stone-700">{row.department}</td>
                        <td className="py-2.5 px-3 font-mono">{row.checkIn}</td>
                        <td className="py-2.5 px-3 font-mono">{row.checkOut}</td>
                        <td className="py-2.5 px-3 font-medium">{row.workHours}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-stone-900">{row.status}</td>
                      </>
                    )}
                    {reportType === 'leave' && (
                      <>
                        <td className="py-2.5 px-3 font-semibold text-stone-900">{row.name}</td>
                        <td className="py-2.5 px-3 font-bold text-stone-800">{row.leaveType}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{row.startDate}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">{row.endDate}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">{row.totalDays} day(s)</td>
                        <td className="py-2.5 px-3 text-stone-600 max-w-xs truncate">{row.reason || 'N/A'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-stone-900">{row.status}</td>
                      </>
                    )}
                    {reportType === 'payroll' && (
                      <>
                        <td className="py-2.5 px-3 font-semibold text-stone-900">{row.name}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-stone-500">{row.employeeId}</td>
                        <td className="py-2.5 px-3 text-stone-700">{row.department}</td>
                        <td className="py-2.5 px-3 font-mono">${(row.monthlyWage || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono font-medium">{row.payableDays} / {row.workingDays}</td>
                        <td className="py-2.5 px-3 font-mono">${(row.grossSalary || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono text-rose-700">${(row.totalDeductions || 0).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#581c38] text-sm">
                          ${(row.netSalary || 0).toLocaleString()}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
