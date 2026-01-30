import React, { useState } from 'react';
import { User, Bell, Shield, Moon, Sun, LogOut, Trash2, Save } from 'lucide-react';
import AlumniSidebar from '../../Alumni/components/AlumniSidebar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('account');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    mentorship: true,
    events: true
  });

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
    toast.success('Notification preferences updated');
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AlumniSidebar />
      
      <div className="flex-1 p-6 ml-64">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium ${
                      activeTab === tab.id
                        ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon size={18} className="mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                        <input
                          type="text"
                          value={user?.name || ''}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center">
                        {theme === 'dark' ? <Moon size={20} className="mr-3" /> : <Sun size={20} className="mr-3" />}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('email')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.email ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.email ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Mentorship Requests</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about new mentorship requests</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('mentorship')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.mentorship ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.mentorship ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Event Updates</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Notifications about upcoming events</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('events')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.events ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.events ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy & Security</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Change Password</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Update your account password</p>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Change Password
                      </button>
                    </div>

                    <div className="p-4 border border-yellow-200 dark:border-yellow-600 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sign Out</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Sign out from your account</p>
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </button>
                    </div>

                    <div className="p-4 border border-red-200 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Danger Zone</h4>
                      <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        <Trash2 size={16} className="mr-2" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
