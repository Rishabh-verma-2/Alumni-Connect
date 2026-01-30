
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Search, MessageCircle, Mail, Grid, List,
  UserMinus, ExternalLink, GraduationCap, Briefcase,
  MapPin, User, Sun, Moon, AlertTriangle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationAPI } from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const MyConnections = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [selectedUserToRemove, setSelectedUserToRemove] = useState(null);

  const { user } = useAuth();
  const { isSidebarCollapsed } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await notificationAPI.getConnections(token);
      setConnections(response.data.data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const initiateRemoveConnection = (connection) => {
    setSelectedUserToRemove(connection);
    setShowDisconnectModal(true);
  };

  const confirmRemoveConnection = async () => {
    if (!selectedUserToRemove) return;

    try {
      const token = localStorage.getItem('token');
      await notificationAPI.removeConnection(selectedUserToRemove._id, token);
      setConnections(connections.filter(conn => conn._id !== selectedUserToRemove._id));
      toast.success('Connection removed successfully');
      setShowDisconnectModal(false);
      setSelectedUserToRemove(null);
    } catch {
      toast.error('Failed to remove connection');
    }
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  const getGradient = (index) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-500',
      'from-emerald-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-cyan-500 to-blue-500',
      'from-rose-500 to-orange-500'
    ];
    return gradients[index % gradients.length];
  };

  const filteredConnections = connections.filter(connection => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (connection.name && connection.name.toLowerCase().includes(term)) ||
      (connection.username && connection.username.toLowerCase().includes(term)) ||
      (connection.email && connection.email.toLowerCase().includes(term));

    const matchesFilter = filterType === 'all' || connection.role === filterType;
    return matchesSearch && matchesFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Calculate connection stats
  const stats = [
    { label: 'Total Connections', value: connections.length, icon: Users, color: 'blue' },
    { label: 'Alumni', value: connections.filter(c => c.role === 'alumni').length, icon: GraduationCap, color: 'purple' },
    { label: 'Students', value: connections.filter(c => c.role === 'student').length, icon: Briefcase, color: 'green' }, // Assuming students are peers
    { label: 'Faculty', value: connections.filter(c => c.role === 'faculty').length, icon: User, color: 'orange' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex font-sans transition-colors duration-300 relative">
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        } ml-0`}>

        {/* Header with Glassmorphism */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                My Network
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your professional relationships
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        <div className="p-6 max-w-7xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4"
              >
                <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? '-' : stat.value}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Controls Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, role, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            {/* Filters & View Toggle */}
            <div className="flex w-full md:w-auto gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
              >
                <option value="all">All Roles</option>
                <option value="alumni">Alumni</option>
                <option value="student">Students</option>
                <option value="faculty">Faculty</option>
              </select>

              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Syncing your network...</p>
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <Users className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No connections found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                {searchTerm || filterType !== 'all'
                  ? "Try adjusting your filters to find who you're looking for."
                  : "Start building your professional network today."}
              </p>
              {(searchTerm || filterType !== 'all') ? (
                <button
                  onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  to="/browse-alumni"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                >
                  <Search size={18} className="mr-2" />
                  Find Alumni
                </Link>
              )}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
              }
            >
              <AnimatePresence>
                {filteredConnections.map((connection, index) => (
                  <motion.div
                    key={connection._id}
                    variants={itemVariants}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                    className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 ${viewMode === 'list' ? 'flex items-center p-4' : 'flex flex-col'
                      }`}
                  >
                    {/* Grid View Layout */}
                    {viewMode === 'grid' ? (
                      <>
                        <div className={`h-20 bg-gradient-to-r ${getGradient(index)} opacity-80 group-hover:opacity-100 transition-opacity relative`}>
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() => initiateRemoveConnection(connection)}
                              className="p-1.5 bg-white/20 hover:bg-red-500/20 text-white/80 hover:text-red-100 rounded-full backdrop-blur-sm transition-colors"
                              title="Remove Connection"
                            >
                              <UserMinus size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="px-6 pb-6 -mt-10 flex flex-col flex-1">
                          <div className="relative">
                            {connection.profilePicture ? (
                              <img
                                src={connection.profilePicture}
                                alt={connection.name}
                                className="w-20 h-20 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-md bg-white"
                              />
                            ) : (
                              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getGradient(index)} flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-gray-800 shadow-md`}>
                                {getInitials(connection.name)}
                              </div>
                            )}
                            <div className={`absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full`} title="Online"></div>
                          </div>

                          <div className="mt-4 mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate" title={connection.name}>
                              {connection.name || connection.username}
                            </h3>
                            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium capitalize mb-1">
                              {connection.role}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs truncate flex items-center">
                              <Mail size={12} className="mr-1.5" />
                              {connection.email}
                            </p>
                          </div>

                          <div className="mt-auto flex gap-2">
                            <Link
                              to="/messages"
                              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium flex items-center justify-center transition-colors shadow-md shadow-blue-500/20"
                            >
                              <MessageCircle size={16} className="mr-1.5" />
                              Message
                            </Link>
                            <button
                              onClick={() => navigate(`/alumni-profile-view/${connection._id}`)} // Or generic profile view if available
                              className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                              title="View Profile"
                            >
                              <ExternalLink size={18} />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* List View Layout */
                      <>
                        <div className="flex-shrink-0 mr-4">
                          {connection.profilePicture ? (
                            <img
                              src={connection.profilePicture}
                              alt={connection.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700"
                            />
                          ) : (
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getGradient(index)} flex items-center justify-center text-white font-bold shadow-sm`}>
                              {getInitials(connection.name)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 mr-4">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                            {connection.name || connection.username}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            <span className="capitalize text-blue-600 dark:text-blue-400 font-medium mr-2">{connection.role}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>
                            <span className="truncate">{connection.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link
                            to="/messages"
                            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                            title="Message"
                          >
                            <MessageCircle size={20} />
                          </Link>
                          <button
                            onClick={() => navigate(`/alumni-profile-view/${connection._id}`)}
                            className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                            title="View Profile"
                          >
                            <ExternalLink size={20} />
                          </button>
                          <button
                            onClick={() => initiateRemoveConnection(connection)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove Connection"
                          >
                            <UserMinus size={20} />
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Disconnect Warning Modal */}
      <AnimatePresence>
        {showDisconnectModal && selectedUserToRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Remove Connection?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Are you sure you want to remove <span className="font-semibold text-gray-900 dark:text-white">{selectedUserToRemove.name || selectedUserToRemove.username}</span> from your network? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => {
                      setShowDisconnectModal(false);
                      setSelectedUserToRemove(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRemoveConnection}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-red-500/30"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyConnections;
