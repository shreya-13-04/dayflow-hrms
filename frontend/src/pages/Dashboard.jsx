import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, Clock, CalendarX, ArrowUpRight, 
  UserCheck, AlertCircle, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function Dashboard() {
  const { user, authFetch } = useAuth();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalWorkforce: 0,
    presentToday: 0,
    onLeaveToday: 0,
    absentToday: 0,
    attendanceRate: '0%',
  });
  const [todayLogs, setTodayLogs] = useState([]);

  useEffect(() => {
    async function loadRealDashboardMetrics() {
      try {
        setLoading(true);
        const { ok, data } = await authFetch('/attendance/overview/dashboard');
        if (ok && data.success) {
          setDashboardData(data.metrics || {});
          setTodayLogs(data.todayLogs || []);
        }
      } catch (err) {
        console.log('Failed to fetch dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRealDashboardMetrics();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'EP';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-5">
      {/* Workspace Header */}
      <PageHeader
        title={`Good day, ${user?.firstName || 'Workspace User'}`}
        description="People operations summary, active workforce, and real-time attendance logs."
        action={
          <div className="flex items-center space-x-2 text-xs font-mono bg-stone-100 px-3 py-1.5 rounded border border-stone-200 text-stone-700">
            <span>Server Date:</span>
            <span className="font-bold text-stone-900">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        }
      />

      {/* REAL DATABASE STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Workforce"
          value={loading ? '...' : dashboardData.totalWorkforce}
          change="Real DB Users"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Present Today"
          value={loading ? '...' : dashboardData.presentToday}
          change={`Rate: ${dashboardData.attendanceRate}`}
          changeType="positive"
          icon={CheckCircle2}
        />
        <StatCard
          title="Absent Today"
          value={loading ? '...' : dashboardData.absentToday}
          change="Pending Check-in"
          changeType="neutral"
          icon={Clock}
        />
        <StatCard
          title="On Leave Today"
          value={loading ? '...' : dashboardData.onLeaveToday}
          change="Approved Time-Off"
          changeType="neutral"
          icon={CalendarX}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Real Attendance Logs */}
        <Card className="lg:col-span-2" title="Today's Live Check-In Activity" compact>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Check In Time</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-stone-500 font-mono text-xs">
                      Fetching Live Logs...
                    </td>
                  </tr>
                ) : todayLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-stone-500 text-xs">
                      No check-in activity recorded today yet.
                    </td>
                  </tr>
                ) : (
                  todayLogs.map((log) => {
                    const empName = log.user ? (log.user.name || `${log.user.firstName} ${log.user.lastName}`) : log.employeeId;
                    const dept = log.user?.department || 'Engineering';
                    return (
                      <tr key={log._id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded bg-[#581c38] text-white font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">
                              {getInitials(empName)}
                            </div>
                            <div>
                              <div className="font-semibold text-stone-900">{empName}</div>
                              <div className="text-[10px] font-mono text-stone-400">{log.employeeId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-stone-600 font-medium">{dept}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-stone-900">
                          {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Badge variant="success" dot>
                            {log.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Operations Sidebar */}
        <Card title="Quick Operations" compact>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-stone-50 rounded border border-stone-200">
              <span className="font-semibold text-stone-900 block mb-1">Shift Verification</span>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Attendance records use server timestamps to calculate work hours and extra overtime.
              </p>
            </div>
            <div className="p-3 bg-plum-50/50 rounded border border-plum-200">
              <span className="font-semibold text-[#581c38] block mb-1">RBAC Access Active</span>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Log in as Admin/HR to view organization-wide attendance, or as Employee to record check-in.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
