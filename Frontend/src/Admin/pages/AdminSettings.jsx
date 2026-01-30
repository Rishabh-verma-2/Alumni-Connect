import React from 'react';
import AdminSidebar from '../components/AdminSidebar';

const AdminSettings = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <AdminSidebar />
      <div className="flex-1 p-6 ml-64">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Configure system settings</p>
      </div>
    </div>
  );
};

export default AdminSettings;