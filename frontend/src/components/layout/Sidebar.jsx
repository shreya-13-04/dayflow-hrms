import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  CreditCard, 
  BarChart2, 
  Settings, 
  ChevronDown,
  Building2
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { name: 'People', path: '/employees', icon: Users, roles: ['ADMIN', 'HR'] },
  { name: 'Attendance', path: '/attendance', icon: Clock, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { name: 'Time Off', path: '/time-off', icon: Calendar, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { name: 'Payroll', path: '/payroll', icon: CreditCard, roles: ['ADMIN', 'HR'] },
  { name: 'Insights', path: '/analytics', icon: BarChart2, roles: ['ADMIN', 'HR'] },
  { name: 'Settings', path: '/profile', icon: Settings, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
];

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();

  const userRole = user?.role || 'ADMIN';

  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  const getInitials = (name) => {
    if (!name) return 'DF';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-56 bg-[#f8f6f0] border-r border-stone-200/90 flex flex-col transition-transform duration-200 ease-in-out
        lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand & Workspace Switcher */}
        <div className="p-3.5 border-b border-stone-200/80">
          <div className="flex items-center space-x-2 px-2 py-1">
            <div className="w-6 h-6 rounded bg-[#581c38] text-white flex items-center justify-center font-serif text-sm font-bold shadow-xs">
              D
            </div>
            <span className="text-sm font-bold tracking-wider text-stone-900 uppercase font-sans">
              DAYFLOW
            </span>
          </div>

          {/* Workspace selector pill */}
          <button className="mt-2.5 w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-white border border-stone-200 text-xs font-semibold text-stone-800 shadow-subtle hover:bg-stone-50 transition-colors">
            <div className="flex items-center space-x-2 truncate">
              <Building2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span className="truncate">{user?.companyName || 'Acme Corp'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-1" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Workspace ({userRole})
          </div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${isActive 
                    ? 'bg-[#581c38] text-white shadow-xs font-bold' 
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer User Profile Info */}
        <div className="p-3 border-t border-stone-200/80 bg-stone-100/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#581c38] text-white font-semibold text-xs flex items-center justify-center shadow-xs">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-stone-900 truncate">{user?.name || 'Alex Morgan'}</p>
              <p className="text-[10px] font-mono text-stone-500 truncate">{user?.employeeId || 'OI-ALMO-2026-0001'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
