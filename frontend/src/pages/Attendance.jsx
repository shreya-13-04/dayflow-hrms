import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Play, Square, Filter, Users, User } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const allAttendanceLogs = [
  { id: 1, empId: 'OI-ALMO2026-0011', name: 'Alex Morgan', checkIn: '09:02 AM', checkOut: '06:15 PM', workHours: '8h 45m', extraHours: '0h 30m', status: 'Present' },
  { id: 2, empId: 'OI-SAJE2026-0012', name: 'Sarah Jenkins', checkIn: '09:15 AM', checkOut: '06:00 PM', workHours: '8h 15m', extraHours: '0h 00m', status: 'Present' },
  { id: 3, empId: 'OI-DAMI2026-0013', name: 'David Miller', checkIn: '--', checkOut: '--', workHours: '0h 00m', extraHours: '0h 00m', status: 'Leave' },
  { id: 4, empId: 'OI-ELRO2026-0014', name: 'Elena Rostova', checkIn: '10:00 AM', checkOut: '02:00 PM', workHours: '4h 00m', extraHours: '0h 00m', status: 'Half Day' },
  { id: 5, empId: 'OI-MACH2026-0015', name: 'Marcus Chen', checkIn: '--', checkOut: '--', workHours: '0h 00m', extraHours: '0h 00m', status: 'Absent' },
];

export function Attendance() {
  const [viewMode, setViewMode] = useState('Date'); // Date, Week, Month
  const [roleView, setRoleView] = useState('admin'); // 'admin' or 'employee'
  const [isCheckedIn, setIsCheckedIn] = useState(true);

  const displayedLogs = roleView === 'employee' 
    ? allAttendanceLogs.filter(log => log.empId === 'OI-ALMO2026-0011')
    : allAttendanceLogs;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Attendance Workspace"
        description="Daily check-in logs, work hours, overtime tracking, and attendance verification."
        action={
          <div className="flex items-center space-x-2">
            {/* View Switcher: Admin vs Employee */}
            <div className="flex bg-stone-100 p-0.5 rounded border border-stone-200 text-xs">
              <button
                onClick={() => setRoleView('admin')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  roleView === 'admin' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Admin View
              </button>
              <button
                onClick={() => setRoleView('employee')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  roleView === 'employee' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                My Records
              </button>
            </div>
          </div>
        }
      />

      {/* Prominent Check In / Check Out Card Banner */}
      <div className="bg-white border border-stone-200/90 rounded-md p-4 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded bg-plum-50 text-plum-900 border border-plum-200 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">Quick Attendance Punch</div>
            <div className="text-base font-bold text-stone-900 font-mono">
              Status: {isCheckedIn ? 'Checked In (09:02 AM)' : 'Checked Out'}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isCheckedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCheckedIn(false)}
              className="border-rose-300 text-rose-800 hover:bg-rose-50"
            >
              <Square className="w-3.5 h-3.5 mr-1 text-rose-700" />
              <span>Punch Check Out</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCheckedIn(true)}
            >
              <Play className="w-3.5 h-3.5 mr-1" />
              <span>Punch Check In</span>
            </Button>
          )}
        </div>
      </div>

      {/* Workspace Top Controls: Date Navigator & Granularity Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-2.5 rounded-md border border-stone-200/80 shadow-subtle">
        {/* Date Navigator */}
        <div className="flex items-center space-x-2">
          <button className="p-1 rounded hover:bg-stone-100 text-stone-600 border border-stone-200 cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-stone-900 font-mono px-2">
            Saturday, 22 August 2026
          </span>
          <button className="p-1 rounded hover:bg-stone-100 text-stone-600 border border-stone-200 cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Granularity Selector */}
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

      {/* Structured Attendance Table */}
      <div className="bg-white border border-stone-200/90 rounded-md overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Check In</th>
                <th className="py-2.5 px-3">Check Out</th>
                <th className="py-2.5 px-3">Work Hours</th>
                <th className="py-2.5 px-3">Extra Hours</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {displayedLogs.map((log) => {
                let badgeVariant = 'success';
                if (log.status === 'Absent') badgeVariant = 'danger';
                if (log.status === 'Half Day') badgeVariant = 'warning';
                if (log.status === 'Leave') badgeVariant = 'lavender';

                return (
                  <tr key={log.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-stone-900">{log.name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{log.empId}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-stone-800">{log.checkIn}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-stone-800">{log.checkOut}</td>
                    <td className="py-2.5 px-3 text-stone-700">{log.workHours}</td>
                    <td className="py-2.5 px-3 text-stone-500 font-mono">{log.extraHours}</td>
                    <td className="py-2.5 px-3 text-right">
                      <Badge variant={badgeVariant} dot>
                        ● {log.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
