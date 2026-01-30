import React, { useState, useEffect, useCallback } from 'react';
import { Users, BookOpen, Briefcase, Calendar, Settings, TrendingUp, Shield, Database, UserCheck, RefreshCw } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../api/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAlumni: 0,
    totalStudents: 0,
    totalPosts: 0,
    verifiedUsers: 0,
    totalEnrollments: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (!token) {
      console.warn('No authentication token available');
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      console.log('Fetching dashboard data...');
      const response = await adminAPI.getDashboardStats(token);
      console.log('Dashboard response:', response.data);
      
      if (response.data?.status === 'success' && response.data?.data?.stats) {
        setStats(response.data.data.stats);
        setActivities(response.data.data.activities || []);
        setLastUpdated(new Date());
        
        if (isRefresh) {
          toast.success('Dashboard refreshed successfully');
        }
      } else {
        throw new Error('Invalid response structure from server');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.statusText || 
                          error.message || 
                          'Unknown error occurred';
      
      toast.error(`Failed to load dashboard: ${errorMessage}`);
      
      setStats({
        totalUsers: 0,
        totalAlumni: 0,
        totalStudents: 0,
        totalPosts: 0,
        verifiedUsers: 0,
        totalEnrollments: 0
      });
      setActivities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, fetchDashboardData]);

  const handleRefresh = () => {
    if (!refreshing) {
      fetchDashboardData(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <AdminSidebar />
      
      <div className="flex-1 p-6 ml-64">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name || user?.username || 'Admin'}</p>
            {lastUpdated && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`${refreshing ? 'animate-spin' : ''}`} size={16} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <Settings className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white cursor-pointer" size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading || refreshing ? '...' : (stats.totalUsers || 0).toLocaleString()}</p>
              </div>
              <Users className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Alumni</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading || refreshing ? '...' : (stats.totalAlumni || 0).toLocaleString()}</p>
              </div>
              <UserCheck className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Students</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading || refreshing ? '...' : (stats.totalStudents || 0).toLocaleString()}</p>
              </div>
              <BookOpen className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading || refreshing ? '...' : (stats.totalPosts || 0).toLocaleString()}</p>
              </div>
              <Briefcase className="text-orange-500" size={32} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading || refreshing ? '...' : (stats.verifiedUsers || 0).toLocaleString()}</p>
              </div>
              <UserCheck className="text-emerald-500" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Enrollments</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading || refreshing ? '...' : (stats.totalEnrollments || 0).toLocaleString()}</p>
              </div>
              <BookOpen className="text-indigo-500" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verification Rate</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {loading || refreshing ? '...' : stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) + '%' : '0%'}
                </p>
              </div>
              <TrendingUp className="text-cyan-500" size={32} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {loading || refreshing ? (
                <div className="text-center py-4 text-gray-500">Loading activities...</div>
              ) : activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center`}>
                      <Users size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No recent activities</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                <span className="text-sm text-green-600 dark:text-green-400">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">API Status</span>
                <span className="text-sm text-green-600 dark:text-green-400">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Server Load</span>
                <span className="text-sm text-yellow-600 dark:text-yellow-400">Moderate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;