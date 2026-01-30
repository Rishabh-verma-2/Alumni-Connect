import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, Briefcase, Settings, Shield, Database, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout, loggingOut } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin-dashboard' },
    { icon: Users, label: 'User Management', path: '/admin-users' },
    { icon: BookOpen, label: 'Alumni Management', path: '/admin-alumni' },
    { icon: Briefcase, label: 'Student Management', path: '/admin-students' },
    { icon: BarChart3, label: 'Analytics', path: '/admin-analytics' },
    { icon: Database, label: 'System Logs', path: '/admin-logs' },
    { icon: Settings, label: 'Settings', path: '/admin-settings' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-2xl z-50 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <img
            src="/logo_new.svg"
            alt="Alumni Connect Logo"
            className="w-10 h-10 object-contain drop-shadow-md hover:scale-110 transition-transform duration-300"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Alumni Connect</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={() => {
            console.log('Logout button clicked');
            logout();
          }}
          disabled={loggingOut}
          className={`w-full flex items-center justify-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 rounded-xl transition-all duration-200 ${loggingOut
            ? 'bg-red-50 dark:bg-red-900/20 opacity-75 cursor-not-allowed'
            : 'hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
        >
          {loggingOut ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent" />
              <span className="font-medium text-red-500">Logging out...</span>
            </>
          ) : (
            <>
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;