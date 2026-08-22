import React from 'react';
import { Menu, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationDrawer } from './NotificationDrawer';

export function Navbar({ setMobileOpen }) {
  const navigate = useNavigate();

  return (
    <header className="h-13 bg-white/90 border-b border-stone-200/80 sticky top-0 z-30 backdrop-blur-xs px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Hamburger button + Search */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search workspace (Ctrl+K)..."
            className="w-60 md:w-72 pl-8 pr-3 py-1 text-xs bg-stone-50 border border-stone-200 rounded-md text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-plum-800 transition-colors"
          />
        </div>
      </div>

      {/* Right side: Operational status + Notifications + Log Out */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
          Operational
        </span>

        <NotificationDrawer />

        <button 
          onClick={() => navigate('/login')}
          className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200/70 rounded-md transition-colors border border-stone-200/60"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
