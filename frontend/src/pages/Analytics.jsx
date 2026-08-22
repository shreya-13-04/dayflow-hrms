import React from 'react';
import { BarChart2, TrendingUp, Users, Calendar, CreditCard, ShieldAlert, Award, FileText } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const deptData = [
  { name: 'Engineering', count: 68 },
  { name: 'Design', count: 24 },
  { name: 'HR & Ops', count: 18 },
  { name: 'Sales & Mktg', count: 32 },
  { name: 'Finance', count: 10 },
];

const leaveDistData = [
  { name: 'Paid Vacation', value: 55, color: '#581c38' },
  { name: 'Sick Leave', value: 25, color: '#9d4375' },
  { name: 'Unpaid Leave', value: 12, color: '#e0b0cc' },
  { name: 'Maternity/Paternity', value: 8, color: '#f5e8ef' },
];

export function Analytics() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="HR Insights & Workforce Intelligence"
        description="Operational metrics across workforce growth, attendance compliance, leave utilization, and payroll costs."
        action={
          <Button variant="secondary" size="sm">
            <FileText className="w-3.5 h-3.5 mr-1" />
            <span>Export Insights Audit</span>
          </Button>
        }
      />

      {/* 4 Core Intelligence Sections Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-stone-200/90 rounded-md p-3 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Workforce</span>
            <Users className="w-4 h-4 text-plum-900" />
          </div>
          <div className="text-xl font-bold font-mono text-stone-900">152 Total</div>
          <p className="text-[11px] text-emerald-800 font-medium">+4 hires this month</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-3 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Attendance</span>
            <TrendingUp className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-xl font-bold font-mono text-stone-900">95.1% Rate</div>
          <p className="text-[11px] text-stone-500">Compliance standard met</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-3 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Time Off</span>
            <Calendar className="w-4 h-4 text-amber-800" />
          </div>
          <div className="text-xl font-bold font-mono text-stone-900">12 Days Avg</div>
          <p className="text-[11px] text-amber-800 font-medium">6 pending requests</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-md p-3 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Payroll</span>
            <CreditCard className="w-4 h-4 text-stone-700" />
          </div>
          <div className="text-xl font-bold font-mono text-stone-900">$128.4K</div>
          <p className="text-[11px] text-stone-500">Disbursed on schedule</p>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Section 1: Department Workforce Breakdown */}
        <Card title="Workforce: Department Headcount" compact>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-1/2 space-y-2 text-xs">
              {deptData.map((d) => (
                <div key={d.name} className="flex justify-between items-center py-0.5 border-b border-stone-100">
                  <span className="text-stone-700 font-medium">{d.name}</span>
                  <span className="font-mono font-bold text-stone-900">{d.count} emp</span>
                </div>
              ))}
            </div>

            <div className="h-40 w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e7e5e4" vertical={false} />
                  <XAxis dataKey="name" stroke="#a8a29e" fontSize={9} tickLine={false} />
                  <YAxis stroke="#a8a29e" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e7e5e4', borderRadius: '0.375rem', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#581c38" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Section 2: Time Off Leave Distribution */}
        <Card title="Time Off: Leave Type Distribution" compact>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-1/2 space-y-2 text-xs">
              {leaveDistData.map((l) => (
                <div key={l.name} className="flex justify-between items-center py-0.5 border-b border-stone-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-stone-700 font-medium">{l.name}</span>
                  </div>
                  <span className="font-mono font-bold text-stone-900">{l.value}%</span>
                </div>
              ))}
            </div>

            <div className="h-40 w-full sm:w-1/2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveDistData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {leaveDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e7e5e4', borderRadius: '0.375rem', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
