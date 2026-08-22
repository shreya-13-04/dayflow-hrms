import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock, Calendar, CreditCard, UserPlus, X } from 'lucide-react';

const notificationsData = [
  { id: 1, title: 'Leave request submitted', time: '10m ago', desc: 'Sarah Jenkins requested 2 days Sick Leave', icon: Calendar, unread: true },
  { id: 2, title: 'Attendance reminder', time: '1h ago', desc: 'Remember to check-in before 09:30 AM', icon: Clock, unread: true },
  { id: 3, title: 'Leave approved', time: '3h ago', desc: 'PTO request for Sept 01 - 05 approved by HR', icon: Check, unread: false },
  { id: 4, title: 'Payroll updated', time: 'Yesterday', desc: 'August 2026 salary draft updated for review', icon: CreditCard, unread: false },
  { id: 5, title: 'New employee onboarded', time: '2 days ago', desc: 'David Miller assigned to Engineering team', icon: UserPlus, unread: false },
];

export function NotificationDrawer() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(notificationsData);
  const popoverRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-100 relative transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-plum-800 rounded-full ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-stone-200 rounded-lg shadow-dropdown z-50 overflow-hidden text-left">
          {/* Header */}
          <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">Activity & Alerts</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-plum-100 text-plum-900 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-plum-800 hover:text-plum-950 font-medium hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {notifications.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`p-3 text-xs flex items-start space-x-3 hover:bg-stone-50 transition-colors ${
                    item.unread ? 'bg-plum-50/20' : ''
                  }`}
                >
                  <div className="p-1.5 rounded-md bg-stone-100 text-stone-600 shrink-0 mt-0.5 border border-stone-200/60">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${item.unread ? 'text-stone-900' : 'text-stone-700'}`}>
                        {item.title}
                      </span>
                      <span className="text-[10px] text-stone-400">{item.time}</span>
                    </div>
                    <p className="text-stone-500 mt-0.5 line-clamp-2">{item.desc}</p>
                  </div>
                  {item.unread && (
                    <span className="w-1.5 h-1.5 bg-plum-800 rounded-full shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-2 border-t border-stone-100 bg-stone-50/50 text-center">
            <span className="text-[11px] text-stone-500 font-medium">End of activity log</span>
          </div>
        </div>
      )}
    </div>
  );
}
