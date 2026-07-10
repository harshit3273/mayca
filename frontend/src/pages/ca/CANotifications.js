import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaBell, FaCheck, FaCheckDouble } from 'react-icons/fa';
import API from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const typeColors = {
  deadline: 'bg-red-50 border-red-200 text-red-700',
  document: 'bg-blue-50 border-blue-200 text-blue-700',
  appointment: 'bg-purple-50 border-purple-200 text-purple-700',
  payment: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  general: 'bg-gray-50 border-gray-200 text-gray-700',
};

const CANotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    API.get('/notifications')
      .then(r => { setNotifications(r.data.notifications); setUnreadCount(r.data.unreadCount); })
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    await API.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await API.put('/notifications/mark-all-read');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaBell className="text-blue-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
            <FaCheckDouble /> Mark all read
          </button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FaBell className="mx-auto text-4xl mb-3 opacity-30" />
          <p>No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n._id} className={`flex items-start gap-3 p-4 rounded-xl border ${typeColors[n.type]} ${n.isRead ? 'opacity-60' : ''}`}>
              <div className="flex-1">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-sm mt-0.5 opacity-80">{n.message}</p>
                <p className="text-xs mt-1 opacity-60">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
              </div>
              {!n.isRead && (
                <button onClick={() => markRead(n._id)} className="flex-shrink-0 mt-0.5 text-current opacity-70 hover:opacity-100" title="Mark as read">
                  <FaCheck className="text-xs" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CANotifications;
