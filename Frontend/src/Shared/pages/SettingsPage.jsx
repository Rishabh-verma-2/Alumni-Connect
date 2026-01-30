import React, { useState, useRef } from 'react';
import { ArrowLeft, Palette, Bell, User, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../../Student/components/Sidebar';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { theme, changeTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const passwordFormRef = useRef(null);

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
  };

  const handleNotificationToggle = (type) => {
    if (type === 'push') {
      setNotifications(!notifications);
      toast.success(`Push notifications ${!notifications ? 'enabled' : 'disabled'}`);
    } else {
      setEmailNotifications(!emailNotifications);
      toast.success(`Email notifications ${!emailNotifications ? 'enabled' : 'disabled'}`);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/v1/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      } else {
        // Handle specific error messages from backend
        const errorMessage = data.message || 'Failed to change password';
        toast.error(errorMessage);
      }
    } catch {
      toast.error('Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/student-dashboard" className="mr-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>

        <div className="max-w-4xl space-y-6">
          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Palette className="mr-3 text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Theme</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Choose your preferred theme</p>
            
            <div className="flex space-x-4">
              <div 
                onClick={() => handleThemeChange('light')}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all flex items-center space-x-3 ${
                  theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="w-8 h-8 bg-white rounded border shadow-sm"></div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Light</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Clean and bright</p>
                </div>
              </div>
              
              <div 
                onClick={() => handleThemeChange('dark')}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all flex items-center space-x-3 ${
                  theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="w-8 h-8 bg-gray-800 rounded shadow-sm"></div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Dark</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Easy on the eyes</p>
                </div>
              </div>
              
              <div 
                onClick={() => handleThemeChange('auto')}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all flex items-center space-x-3 ${
                  theme === 'auto' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-white to-gray-800 rounded shadow-sm"></div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Auto</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Follows system</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Bell className="mr-3 text-green-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Manage your notification preferences</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications in your browser</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications}
                    onChange={() => handleNotificationToggle('push')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emailNotifications}
                    onChange={() => handleNotificationToggle('email')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <User className="mr-3 text-purple-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Manage your account settings</p>
            
            <div className="space-y-3">
              <Link to="/student-profile" className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <h3 className="font-medium text-gray-900 dark:text-white">Edit Profile</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your personal information</p>
              </Link>
              
              <div 
                onClick={() => {
                  setShowPasswordForm(!showPasswordForm);
                  if (!showPasswordForm) {
                    setTimeout(() => {
                      passwordFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }
                }}
                className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                <h3 className="font-medium text-gray-900 dark:text-white">Change Password</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
              </div>
            </div>
          </div>


          {/* Change Password Form */}
          {showPasswordForm && (
            <div ref={passwordFormRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Lock className="mr-3 text-orange-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Change Password</h2>
              </div>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
