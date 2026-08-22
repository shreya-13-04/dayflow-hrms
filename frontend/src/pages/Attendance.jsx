import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Play, Square, Filter, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function Attendance() {
  const { user, authFetch } = useAuth();
  const isAdminOrHr = user?.role === 'ADMIN' || user?.role === 'HR';

  const [roleView, setRoleView] = useState(isAdminOrHr ? 'admin' : 'employee');
  const [viewMode, setViewMode] = useState('Date'); // Date, Week, Month
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Employee punch status state
  const [todayStatus, setTodayStatus] = useState(null);
  const [punching, setPunching] = useState(false);

  // Attendance records state
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Format date YYYY-MM-DD
  const formatDateStr = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const currentDateStr = formatDateStr(currentDate);

  // Fetch today's check-in status for logged-in user
  const fetchTodayStatus = async () => {
    try {
      const { ok, data } = await authFetch('/attendance/me/today');
      if (ok && data.success) {
        setTodayStatus(data);
      }
    } catch (err) {
      console.log('Failed to fetch today status:', err);
    }
  };

  // Fetch attendance list based on view mode (Admin vs Employee)
  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      setApiError('');

      let endpoint = '';
      if (roleView === 'admin' && isAdminOrHr) {
        endpoint = `/attendance?date=${currentDateStr}&search=${encodeURIComponent(searchQuery)}`;
      } else {
        endpoint = '/attendance/me';
      }

      const { ok, data } = await authFetch(endpoint);
      if (ok && data.success) {
        setRecords(data.data || []);
      }
    } catch (err) {
      setApiError('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [roleView, currentDateStr, searchQuery]);

  // Handle Check In
  const handleCheckIn = async () => {
    try {
      setPunching(true);
      setApiError('');
      setSuccessMsg('');

      const { ok, data } = await authFetch('/attendance/check-in', { method: 'POST' });
      if (!ok || !data.success) {
        throw new Error(data.message || 'Check-in failed.');
      }

      setSuccessMsg(data.message || 'Checked in successfully!');
      fetchTodayStatus();
      fetchAttendanceRecords();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setPunching(false);
    }
  };

  // Handle Check Out
  const handleCheckOut = async () => {
    try {
      setPunching(true);
      setApiError('');
      setSuccessMsg('');

      const { ok, data } = await authFetch('/attendance/check-out', { method: 'POST' });
      if (!ok || !data.success) {
        throw new Error(data.message || 'Check-out failed.');
      }

      setSuccessMsg(data.message || 'Checked out successfully!');
      fetchTodayStatus();
      fetchAttendanceRecords();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setPunching(false);
    }
  };

  // Date Navigator Controls
  const handlePrevDate = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDate = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  // Current State Text Formatting
  const getPunchStatusDisplay = () => {
    if (!todayStatus || !todayStatus.isCheckedIn) {
      return { label: 'Not checked in', detail: 'Ready for today\'s shift', isCheckedIn: false, isCheckedOut: false };
    }
    const rec = todayStatus.data;
    if (rec && (rec.checkOut || rec.isCompleted)) {
      return {
        label: `Completed · ${rec.workHoursFormatted || '8h 00m'}`,
        detail: `Checked out at ${new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        isCheckedIn: true,
        isCheckedOut: true,
      };
    }
    return {
      label: `Working since ${new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      detail: `Checked in on ${rec.date}`,
      isCheckedIn: true,
      isCheckedOut: false,
    };
  };

  const punchInfo = getPunchStatusDisplay();

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
        title="Attendance Workspace"
        description="Daily check-in logs, work hours, overtime tracking, and attendance verification."
        action={
          isAdminOrHr ? (
            <div className="flex bg-stone-100 p-0.5 rounded border border-stone-200 text-xs font-semibold">
              <button
                onClick={() => setRoleView('admin')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  roleView === 'admin' ? 'bg-[#581c38] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900 bg-transparent'
                }`}
              >
                Admin View
              </button>
              <button
                onClick={() => setRoleView('employee')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  roleView === 'employee' ? 'bg-[#581c38] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900 bg-transparent'
                }`}
              >
                My Attendance
              </button>
            </div>
          ) : null
        }
      />

      {/* Prominent Check In / Check Out Banner */}
      <div className="bg-white border border-stone-200/90 rounded-md p-4 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-plum-50 text-[#581c38] border border-plum-200 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Current Shift Status</div>
            <div className="text-base font-bold text-stone-900 font-mono">
              {punchInfo.label}
            </div>
            <p className="text-[11px] text-stone-500">{punchInfo.detail}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!punchInfo.isCheckedIn ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleCheckIn}
              disabled={punching}
              className="px-5 py-2 font-bold"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              <span>{punching ? 'Recording Check-In...' : 'CHECK IN'}</span>
            </Button>
          ) : !punchInfo.isCheckedOut ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckOut}
              disabled={punching}
              className="px-5 py-2 font-bold border-rose-300 text-rose-800 hover:bg-rose-50"
            >
              <Square className="w-3.5 h-3.5 mr-1.5 text-rose-700" />
              <span>{punching ? 'Recording Check-Out...' : 'CHECK OUT'}</span>
            </Button>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700" />
              Shift Complete
            </span>
          )}
        </div>
      </div>

      {/* Date Navigation & Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-2.5 rounded-md border border-stone-200/80 shadow-subtle">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePrevDate}
            className="p-1 rounded hover:bg-stone-100 text-stone-600 border border-stone-200 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-stone-900 font-mono px-2">
            {currentDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          <button 
            onClick={handleNextDate}
            className="p-1 rounded hover:bg-stone-100 text-stone-600 border border-stone-200 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
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

        <div className="flex bg-stone-100 p-0.5 rounded border border-stone-200 text-xs">
          {['Date', 'Week', 'Month'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                viewMode === mode ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="bg-white border border-stone-200/90 rounded-md overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Check In</th>
                <th className="py-2.5 px-3">Check Out</th>
                <th className="py-2.5 px-3">Work Hours</th>
                <th className="py-2.5 px-3">Extra Hours</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500 font-mono text-xs">
                    Loading Attendance Records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500 text-xs">
                    No attendance records found for selected date/filter.
                  </td>
                </tr>
              ) : (
                records.map((rec) => {
                  const empName = rec.user ? (rec.user.name || `${rec.user.firstName} ${rec.user.lastName}`) : rec.employeeId;
                  
                  let badgeVariant = 'success';
                  if (rec.status === 'ABSENT') badgeVariant = 'danger';
                  if (rec.status === 'HALF_DAY') badgeVariant = 'warning';
                  if (rec.status === 'LEAVE') badgeVariant = 'lavender';

                  return (
                    <tr key={rec._id || rec.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-stone-600">{rec.date}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-stone-900">{empName}</div>
                        <div className="text-[10px] font-mono text-stone-400">{rec.employeeId}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-stone-900">
                        {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-stone-900">
                        {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </td>
                      <td className="py-2.5 px-3 text-stone-800 font-medium">{rec.workHoursFormatted || '0h 00m'}</td>
                      <td className="py-2.5 px-3 text-stone-500 font-mono">{rec.extraHoursFormatted || '0h 00m'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <Badge variant={badgeVariant} dot>
                          ● {rec.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
