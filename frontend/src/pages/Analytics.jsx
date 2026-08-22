import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, Clock, Calendar, CreditCard, BarChart2, TrendingUp, PieChart as PieIcon, DollarSign 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';

const COLORS = ['#581c38', '#83345e', '#cd84ad', '#390c22', '#b85d90', '#9d4375'];

export function Analytics() {
  const { authFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadInsights() {
      try {
        setLoading(true);
        const { ok, data: res } = await authFetch('/analytics/insights');
        if (ok && res.success) {
          setData(res);
        }
      } catch (err) {
        console.log('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <PageHeader title="HR Insights & Analytics" description="Loading real MongoDB performance metrics..." />
        <div className="p-12 text-center text-stone-500 font-mono text-xs">Generating database analytics...</div>
      </div>
    );
  }

  const { workforce, attendance, timeOff, payroll } = data;

  return (
    <div className="space-y-5 text-stone-900">
      <PageHeader
        title="People Operations Insights"
        description="Comprehensive organizational analytics derived directly from MongoDB records."
      />

      {/* Top 4 Key Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Workforce"
          value={workforce.totalEmployees}
          change={`${workforce.byDepartment.length} Departments`}
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Attendance Rate"
          value={attendance.attendanceRate}
          change={`${attendance.presentToday} Present Today`}
          changeType="positive"
          icon={CheckCircle2}
        />
        <StatCard
          title="Pending Time Off"
          value={timeOff.pendingRequests}
          change={`${timeOff.approvedRequests} Approved Requests`}
          changeType="neutral"
          icon={Calendar}
        />
        <StatCard
          title="Net Monthly Payroll"
          value={`$${(payroll.netPayroll || 0).toLocaleString()}`}
          change={`Avg: $${(payroll.averageSalary || 0).toLocaleString()}`}
          changeType="positive"
          icon={CreditCard}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance Trend Chart */}
        <Card title="Attendance Trend (Past 7 Days)" compact>
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendance.attendanceTrend}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#581c38" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#581c38" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#78716c" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#78716c" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e7e5e4', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="present" stroke="#581c38" strokeWidth={2} fillOpacity={1} fill="url(#colorPresent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Leave Distribution Chart */}
        <Card title="Time-Off Leave Distribution (Approved Days)" compact>
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeOff.leaveDistribution}>
                <XAxis dataKey="type" tick={{ fontSize: 11 }} stroke="#78716c" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#78716c" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e7e5e4', fontSize: '12px' }} />
                <Bar dataKey="days" fill="#581c38" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Department Breakdown & Payroll Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Department Breakdown Table */}
        <Card className="lg:col-span-2" title="Department Workforce Distribution" compact>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Employees</th>
                  <th className="py-2.5 px-3">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {workforce.byDepartment.map((dept, index) => {
                  const pct = workforce.totalEmployees > 0 
                    ? ((dept.count / workforce.totalEmployees) * 100).toFixed(1)
                    : 0;

                  return (
                    <tr key={index} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-stone-900">{dept.department}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-stone-800">{dept.count} members</td>
                      <td className="py-2.5 px-3 font-mono text-stone-600">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Payroll Expense Summary */}
        <Card title="Monthly Payroll Breakdown" compact>
          <dl className="divide-y divide-stone-100 text-xs">
            <div className="py-2 flex justify-between">
              <dt className="text-stone-500">Gross Payroll</dt>
              <dd className="font-mono font-bold text-stone-900">${(payroll.grossPayroll || 0).toLocaleString()}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-stone-500">Total Deductions (PF/Tax)</dt>
              <dd className="font-mono text-rose-700">${(payroll.totalDeductions || 0).toLocaleString()}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-stone-500">Unpaid Leave Deductions</dt>
              <dd className="font-mono text-rose-700">${(payroll.unpaidDeductions || 0).toLocaleString()}</dd>
            </div>
            <div className="py-2 flex justify-between font-bold text-stone-900 pt-3 border-t border-stone-200">
              <dt className="text-stone-900">Net Payroll Disbursed</dt>
              <dd className="font-mono text-[#581c38] text-sm">${(payroll.netPayroll || 0).toLocaleString()}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
