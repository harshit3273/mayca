import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaBell, FaCheck, FaTrash, FaCircle } from 'react-icons/fa';

const ClientNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    API.get('/notifications')
      .then(r => setNotifications(r.data.notifications))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      // Dispatch storage event to trigger Layout update for bell count
      window.dispatchEvent(new Event('storage'));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event('storage'));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
      window.dispatchEvent(new Event('storage'));
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <FaBell className="text-yellow-500" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button onClick={markAllRead} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
              <FaCheck className="text-xs" /> Mark all read
            </button>
          )}
        </div>
        {loading ? <LoadingSpinner /> : notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No notifications.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(n => (
              <div key={n._id} className={`flex items-start justify-between p-4 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                <div className="flex gap-3 items-start">
                  <div className="mt-1">
                    {!n.isRead ? <FaCircle className="text-blue-500 text-[10px]" /> : <FaCircle className="text-gray-300 text-[10px]" />}
                  </div>
                  <div>
                    <p className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
                      {new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!n.isRead && (
                    <button onClick={() => markAsRead(n._id)} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors" title="Mark as Read">
                      <FaCheck className="text-sm" />
                    </button>
                  )}
                  <button onClick={() => deleteNotification(n._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientNotifications;
