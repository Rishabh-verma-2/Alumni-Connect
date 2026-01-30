import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Download, Mail, CheckCircle, XCircle, Calendar, User, GraduationCap, BookOpen, Shield, X, Send } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { adminAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ subject: '', message: '' });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers(token);
      setUsers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.enrollmentId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'verified' && user.isVerified) ||
        (statusFilter === 'unverified' && !user.isVerified);
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student': return <BookOpen className="text-blue-500" size={16} />;
      case 'alumni': return <GraduationCap className="text-green-500" size={16} />;
      case 'admin': return <Shield className="text-purple-500" size={16} />;
      default: return <User className="text-gray-500" size={16} />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'alumni': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleSelectUser = (userId) => {
    console.log('Selecting/deselecting user:', userId);
    setSelectedUsers(prev => {
      const newSelection = prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      console.log('Updated selected users:', newSelection);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  };

  const exportToCSV = () => {
    const csvData = filteredUsers.map(user => ({
      Name: user.name || user.username,
      Email: user.email,
      Role: user.role,
      'Enrollment ID': user.enrollmentId,
      Status: user.isVerified ? 'Verified' : 'Unverified',
      'Join Date': formatDate(user.createdAt)
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('User list exported successfully!');
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastData.subject.trim() || !broadcastData.message.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    console.log('Sending broadcast to user IDs:', selectedUsers);
    console.log('Selected users data:', filteredUsers.filter(user => selectedUsers.includes(user._id)));

    try {
      setSendingBroadcast(true);
      const response = await adminAPI.sendBroadcast({
        userIds: selectedUsers,
        subject: broadcastData.subject,
        message: broadcastData.message
      }, token);
      
      console.log('Broadcast response:', response.data);
      const data = response.data.data;
      const emailsSent = data.emailsSent || data.recipientCount;
      const emailsFailed = data.emailsFailed || 0;
      
      if (emailsFailed > 0) {
        toast.success(`Emails sent to ${emailsSent} users (${emailsFailed} failed)`);
      } else {
        toast.success(`Emails successfully sent to ${emailsSent} users!`);
      }
      setShowBroadcastModal(false);
      setBroadcastData({ subject: '', message: '' });
      setSelectedUsers([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send broadcast');
      console.error('Broadcast error:', error.response?.data || error);
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <AdminSidebar />
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage all users in the system</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-md">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Users: </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{users.length}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-md">
              <span className="text-sm text-gray-600 dark:text-gray-400">Selected: </span>
              <span className="font-bold text-green-600 dark:text-green-400">{selectedUsers.length}</span>
            </div>
          </div>
        </div>

        {/* Debug Info - Remove in production
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Debug Info:</h3>
            <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
              <div>Total Users: {users.length}</div>
              <div>Filtered Users: {filteredUsers.length}</div>
              <div>Selected User IDs: [{selectedUsers.join(', ')}]</div>
              <div>Selected Users: {filteredUsers.filter(user => selectedUsers.includes(user._id)).map(u => u.name || u.username).join(', ')}</div>
            </div>
          </div>
        )} */}

        {/* Filters and Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="alumni">Alumni</option>
              <option value="admin">Admins</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="role-asc">Role A-Z</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportToCSV}
              disabled={filteredUsers.length === 0}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => {
                console.log('Opening broadcast modal with selected users:', selectedUsers);
                console.log('Selected user details:', filteredUsers.filter(user => selectedUsers.includes(user._id)));
                setShowBroadcastModal(true);
              }}
              disabled={selectedUsers.length === 0}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Mail size={16} />
              <span>Send Broadcast ({selectedUsers.length})</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="text-blue-500" size={24} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                All Users ({filteredUsers.length})
              </h2>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mt-4">
                  {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                    ? 'No users found matching your filters.' 
                    : 'No users found.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">User Info</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Enrollment ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Join Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleSelectUser(user._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.name || user.username || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(user.role)}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role?.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm text-gray-900 dark:text-white">
                            {user.enrollmentId || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {user.isVerified ? (
                              <>
                                <CheckCircle className="text-green-500" size={16} />
                                <span className="text-green-600 dark:text-green-400 text-sm font-medium">Verified</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="text-red-500" size={16} />
                                <span className="text-red-600 dark:text-red-400 text-sm font-medium">Unverified</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="text-gray-400" size={16} />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(user.createdAt)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Broadcast Modal */}
        {showBroadcastModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl">
              <div className="p-6 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Send Broadcast</h3>
                  <button
                    onClick={() => setShowBroadcastModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={24} />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Sending to {selectedUsers.length} selected users
                </p>
                {selectedUsers.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Recipients: {filteredUsers.filter(user => selectedUsers.includes(user._id)).map(user => user.name || user.username).join(', ')}
                  </div>
                )}
              </div>
              
              <form onSubmit={handleBroadcast} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={broadcastData.subject}
                    onChange={(e) => setBroadcastData({ ...broadcastData, subject: e.target.value })}
                    placeholder="Enter email subject"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={broadcastData.message}
                    onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                    placeholder="Enter your message"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingBroadcast}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                    <span>{sendingBroadcast ? 'Sending...' : 'Send Broadcast'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;