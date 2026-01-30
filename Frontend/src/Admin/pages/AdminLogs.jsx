import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { adminAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { Database, Plus, Edit, Trash2, User, Clock, Shield, FileText, LogIn, LogOut, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogs = () => {
  const { token } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [userActivityLogs, setUserActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [logType, setLogType] = useState('database'); // 'database' or 'user-activity'

  useEffect(() => {
    fetchAuditLogs();
    fetchUserActivityLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAuditLogs(token);
      setAuditLogs(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivityLogs = async () => {
    try {
      const response = await adminAPI.getLoginLogs(token);
      setUserActivityLogs(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch user activity logs');
    }
  };

  const deleteAllLogs = async () => {
    try {
      await adminAPI.deleteAllLogs();
      toast.success('All logs deleted');
      fetchUserActivityLogs();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete logs');
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE': return <Plus className="text-green-500" size={16} />;
      case 'UPDATE': return <Edit className="text-blue-500" size={16} />;
      case 'DELETE': return <Trash2 className="text-red-500" size={16} />;
      case 'LOGIN': return <LogIn className="text-green-500" size={16} />;
      case 'LOGOUT': return <LogOut className="text-orange-500" size={16} />;
      default: return <FileText className="text-gray-500" size={16} />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'LOGIN': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'LOGOUT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const currentLogs = logType === 'database' ? auditLogs : userActivityLogs;
  const filteredLogs = currentLogs.filter(log => {
    if (filter === 'all') return true;
    return log.action === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
        <AdminSidebar />
        <div className="flex-1 p-6 ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <AdminSidebar />
      <div className="flex-1 p-6 ml-64">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {logType === 'database' ? <Database className="text-blue-500" size={32} /> : <Activity className="text-green-500" size={32} />}
            {logType === 'database' ? 'Database Audit Logs' : 'User Activity Logs'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {logType === 'database' ? 'Track all database changes and modifications' : 'Monitor user login and logout activities'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {logType === 'database' ? 'Recent Database Activity' : 'Recent User Activity'}
            </h2>
            <div className="flex gap-3">
              {logType === 'user-activity' && (
                <button
                  onClick={deleteAllLogs}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete All Logs
                </button>
              )}
              <select
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="database">Database Logs</option>
                <option value="user-activity">User Activity</option>
              </select>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Actions</option>
                {logType === 'database' ? (
                  <>
                    <option value="CREATE">Create</option>
                    <option value="UPDATE">Update</option>
                    <option value="DELETE">Delete</option>
                  </>
                ) : (
                  <>
                    <option value="LOGIN">Login</option>
                    <option value="LOGOUT">Logout</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                {logType === 'database' ? <Database className="mx-auto h-12 w-12 text-gray-400" /> : <Activity className="mx-auto h-12 w-12 text-gray-400" />}
                <p className="text-gray-600 dark:text-gray-400 mt-4">
                  {logType === 'database' ? 'No audit logs found' : 'No user activity logs found'}
                </p>
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <div key={index} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-md">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        {logType === 'database' ? (
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.collection}
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.action === 'LOGIN' ? 'User Login' : 'User Logout'}
                          </span>
                        )}
                      </div>
                      {logType === 'database' && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Document ID: <span className="font-mono">{log.documentId}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <User size={12} />
                          <span>{log.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield size={12} />
                          <span className="capitalize">{log.userRole}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      {logType === 'database' && log.changes && (
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                          <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </div>
                      )}
                      {logType === 'user-activity' && log.deviceInfo && (
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                          <p className="text-gray-700 dark:text-gray-300">
                            Device: {log.deviceInfo}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {log.ipAddress && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      IP: {log.ipAddress}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;