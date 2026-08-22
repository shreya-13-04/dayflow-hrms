import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function NotificationDrawer() {
  const { authFetch } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { ok, data } = await authFetch('/notifications');
      if (ok && data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.log('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const { ok } = await authFetch('/notifications/read-all', { method: 'PUT' });
      if (ok) {
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.log('Failed to mark all as read:', err);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      const { ok } = await authFetch(`/notifications/${id}/read`, { method: 'PUT' });
      if (ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.log('Failed to mark as read:', err);
    }
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="p-1.5 text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-100 relative transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-stone-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#581c38] text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Drawer */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-stone-200 rounded-lg shadow-dropdown z-50 overflow-hidden text-left text-xs">
            <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-stone-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#f5e8ef] text-[#581c38] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-stone-600 hover:text-[#581c38] flex items-center"
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-1 text-[#581c38]" /> Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
              {loading ? (
                <div className="p-6 text-center text-stone-500 font-mono">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-stone-400 italic">No notifications yet.</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.read && handleMarkSingleRead(n._id)}
                    className={`p-3 transition-colors cursor-pointer flex items-start space-x-2.5 ${
                      !n.read ? 'bg-plum-50/40 hover:bg-plum-50/70' : 'bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="p-1 rounded bg-stone-100 text-[#581c38] shrink-0 mt-0.5">
                      {!n.read ? <AlertCircle className="w-3.5 h-3.5 text-[#581c38]" /> : <CheckCircle2 className="w-3.5 h-3.5 text-stone-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold text-stone-900 truncate ${!n.read ? 'font-bold' : ''}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400 shrink-0 ml-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-stone-600 text-[11px] mt-0.5 leading-normal">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
