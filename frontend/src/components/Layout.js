import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FaBars, FaTimes, FaSignOutAlt, FaChartLine,
  FaBell, FaUserCircle, FaChevronDown
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API from '../utils/api';

const Layout = ({ children, navItems }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get page title from current route
  const currentNav = navItems.find(n => {
    if (n.end) return location.pathname === n.path;
    return location.pathname.startsWith(n.path);
  });
  const pageTitle = currentNav?.label || 'Dashboard';

  // Fetch unread notification count
  useEffect(() => {
    API.get('/notifications')
      .then(r => setUnreadCount(r.data.unreadCount))
      .catch(() => { });
    const interval = setInterval(() => {
      API.get('/notifications')
        .then(r => setUnreadCount(r.data.unreadCount))
        .catch(() => { });
    }, 60000); // poll every 60s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const notifPath = user?.role === 'ca' ? '/ca/notifications' : '/client/notifications';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100
        flex flex-col shadow-sm
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <FaChartLine className="text-white text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 text-sm">CA Firm Portal</h1>
            <p className="text-xs text-gray-400 capitalize">{user?.role === 'ca' ? 'CA Dashboard' : 'Client Portal'}</p>
          </div>
          <button className="md:hidden p-1 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}>
            <FaTimes className="text-gray-400 text-sm" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`text-base ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.label === 'Notifications' && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div className="border-t border-gray-100 p-3">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate capitalize">{user?.role}</p>
              </div>
              <FaChevronDown className={`text-gray-400 text-xs transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(user?.role === 'ca' ? '/ca/profile' : '/client/profile');
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <FaUserCircle className="text-gray-400" /> My Profile
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3.5 flex items-center gap-4 shadow-sm">
          <button className="md:hidden p-2 rounded-xl hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}>
            <FaBars className="text-gray-600" />
          </button>

          <h2 className="text-base font-semibold text-gray-900 flex-1">{pageTitle}</h2>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button
              onClick={() => navigate(notifPath)}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
              title="Notifications"
            >
              <FaBell className="text-gray-500 text-lg" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Close profile dropdown on outside click */}
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </div>
  );
};

export default Layout;
