import React from 'react';
import { Users, Clock, Calendar, CheckCircle2, AlertCircle, ArrowUpRight, ChevronRight, UserPlus, FileText } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const attendanceTimeline = [
  { time: '09:42 AM', name: 'Marcus Chen', event: 'Clocked In', dept: 'Finance', status: 'On Time' },
  { time: '09:30 AM', name: 'Elena Rostova', event: 'Requested PTO', dept: 'Design', status: 'Pending' },
  { time: '09:15 AM', name: 'Sarah Jenkins', event: 'Clocked In', dept: 'Engineering', status: 'Late (+15m)' },
  { time: '08:55 AM', name: 'David Miller', event: 'Clocked In', dept: 'Engineering', status: 'On Time' },
];

const pendingActions = [
  { id: 1, title: 'Sick Leave Request', subtitle: 'Sarah Jenkins • 2 days (Aug 24 - 25)', priority: 'High' },
  { id: 2, title: 'August Payroll Approval', subtitle: '152 records ready for disbursement', priority: 'Medium' },
  { id: 3, title: 'Address Verification', subtitle: 'New employee David Miller submitted documents', priority: 'Low' },
];

const recentEvents = [
  { id: 1, date: 'Today, 09:00 AM', title: 'Workforce Check-in Complete', desc: '142 of 152 employees accounted for.' },
  { id: 2, date: 'Yesterday, 04:30 PM', title: 'Q3 HR Policy Document Published', desc: 'Distributed to all engineering leads.' },
  { id: 3, date: 'Aug 20, 2026', title: 'New Hire Onboarding Completed', desc: 'David Miller setup in engineering workspace.' },
];

const chartData = [
  { day: 'Mon', present: 142, leave: 6 },
  { day: 'Tue', present: 148, leave: 4 },
  { day: 'Wed', present: 145, leave: 5 },
  { day: 'Thu', present: 150, leave: 2 },
  { day: 'Fri', present: 140, leave: 8 },
];

export function Dashboard() {
  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-stone-200/80 gap-2">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif tracking-tight">Good morning, Alex</h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">Today: 22 August 2026</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm">
            <FileText className="w-3.5 h-3.5 mr-1 text-stone-500" />
            <span>Generate Report</span>
          </Button>
          <Button variant="primary" size="sm">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>Clock In / Out</span>
          </Button>
        </div>
      </div>

      {/* "Today at a glance" compact metric strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-stone-200/80 rounded-md p-3 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Present</span>
            <div className="text-xl font-bold text-stone-900 font-mono mt-0.5">142</div>
          </div>
          <span className="px-1.5 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
            93.4%
          </span>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-md p-3 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Absent</span>
            <div className="text-xl font-bold text-stone-900 font-mono mt-0.5">4</div>
          </div>
          <span className="px-1.5 py-0.5 text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200 rounded">
            2.6%
          </span>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-md p-3 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">On Leave</span>
            <div className="text-xl font-bold text-stone-900 font-mono mt-0.5">6</div>
          </div>
          <span className="px-1.5 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded">
            Approved
          </span>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-md p-3 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Pending Approvals</span>
            <div className="text-xl font-bold text-plum-900 font-mono mt-0.5">8</div>
          </div>
          <span className="px-1.5 py-0.5 text-[11px] font-medium bg-plum-50 text-plum-900 border border-plum-200 rounded">
            Action Req.
          </span>
        </div>
      </div>

      {/* Main Grid: LEFT Timeline & Chart | RIGHT Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attendance activity timeline */}
        <Card className="lg:col-span-2" title="Attendance Activity & Log" compact>
          <div className="space-y-2 mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-2 px-3">Time</th>
                    <th className="py-2 px-3">Employee</th>
                    <th className="py-2 px-3">Department</th>
                    <th className="py-2 px-3">Event</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {attendanceTimeline.map((item, i) => (
                    <tr key={i} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-2 px-3 font-mono text-stone-500 text-[11px]">{item.time}</td>
                      <td className="py-2 px-3 font-medium text-stone-900">{item.name}</td>
                      <td className="py-2 px-3 text-stone-500">{item.dept}</td>
                      <td className="py-2 px-3 text-stone-800">{item.event}</td>
                      <td className="py-2 px-3 text-right">
                        <Badge variant={item.status.includes('Late') ? 'warning' : item.status === 'Pending' ? 'lavender' : 'success'}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Integrated subtle chart */}
          <div className="pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Weekly Attendance Rate</span>
              <span className="text-[11px] font-mono text-stone-500">Avg 95.1%</span>
            </div>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="plumGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#581c38" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#581c38" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e7e5e4" vertical={false} />
                  <XAxis dataKey="day" stroke="#a8a29e" fontSize={10} tickLine={false} />
                  <YAxis stroke="#a8a29e" fontSize={10} tickLine={false} domain={[120, 160]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e7e5e4', borderRadius: '0.375rem', fontSize: '11px', color: '#1c1917' }}
                  />
                  <Area type="monotone" dataKey="present" stroke="#581c38" strokeWidth={1.5} fillOpacity={1} fill="url(#plumGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Pending Actions */}
        <Card title="Pending HR Actions" compact>
          <div className="space-y-2.5">
            {pendingActions.map((act) => (
              <div key={act.id} className="p-2.5 bg-stone-50 rounded border border-stone-200/70 space-y-1">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-stone-900">{act.title}</span>
                  <Badge variant={act.priority === 'High' ? 'danger' : act.priority === 'Medium' ? 'warning' : 'default'}>
                    {act.priority}
                  </Badge>
                </div>
                <p className="text-[11px] text-stone-500">{act.subtitle}</p>
                <div className="pt-1 flex justify-end space-x-1.5">
                  <Button variant="ghost" size="sm" className="text-[11px] h-6 py-0 px-2">
                    Review
                  </Button>
                  <Button variant="primary" size="sm" className="text-[11px] h-6 py-0 px-2">
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom: Recent Employee Activity & Events */}
      <Card title="Recent Employee Activity & HR Events" compact>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recentEvents.map((ev) => (
            <div key={ev.id} className="p-3 bg-stone-50/70 border border-stone-200/60 rounded">
              <span className="text-[10px] font-mono text-stone-400">{ev.date}</span>
              <h4 className="text-xs font-semibold text-stone-900 mt-1">{ev.title}</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">{ev.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
