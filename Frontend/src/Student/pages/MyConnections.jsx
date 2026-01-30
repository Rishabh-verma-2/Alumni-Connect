import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, MessageCircle, Phone, Mail, MapPin, Filter, Grid, List } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { notificationAPI } from '../../api/api';

const MyConnections = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const { isSidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useSidebar();

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await notificationAPI.getConnections(token);
        setConnections(response.data.data || []);
      } catch (error) {
        console.error('Error fetching connections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
    
    // Auto-expand sidebar when navigating to non-Messages pages
    const timer = setTimeout(() => {
      if (isSidebarCollapsed) {
        if (setSidebarCollapsed) {
          setSidebarCollapsed(false);
        } else if (toggleSidebar) {
          toggleSidebar();
        }
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isSidebarCollapsed, setSidebarCollapsed, toggleSidebar]);

  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connection.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connection.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || connection.role === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      
      <div className={`flex-1 transition-all duration-300 p-3 sm:p-4 lg:p-6 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } ml-0`}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Connections</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and connect with your network</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Connections</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : connections.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="text-green-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Alumni</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : connections.filter(c => c.role === 'alumni').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="text-purple-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : connections.filter(c => c.role === 'student').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="text-orange-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Faculty</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {loading ? '...' : connections.filter(c => c.role === 'faculty').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search connections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Connections</option>
                <option value="alumni">Alumni</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Connections Grid/List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredConnections.length} Connection{filteredConnections.length !== 1 ? 's' : ''}
            </h2>
          </div>
          
          <div className="p-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredConnections.map((connection) => (
                  <div key={connection._id} className="border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center mb-4">
                      {connection.profilePicture ? (
                        <img 
                          src={connection.profilePicture} 
                          alt={connection.name || connection.username}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {connection.name ? connection.name.split(' ').map(n => n[0]).join('') : 'U'}
                        </div>
                      )}
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{connection.name || connection.username}</h3>
                        <p className="text-blue-600 font-medium capitalize">{connection.role}</p>
                        <p className="text-sm text-gray-500">{connection.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail size={14} className="mr-2" />
                        {connection.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users size={14} className="mr-2" />
                        Connected
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link 
                        to="/messages"
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center"
                      >
                        <MessageCircle size={16} className="mr-1" />
                        Message
                      </Link>
                      <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                        <Phone size={16} />
                      </button>
                      <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                        <Mail size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredConnections.map((connection) => (
                  <div key={connection._id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {connection.profilePicture ? (
                          <img 
                            src={connection.profilePicture} 
                            alt={connection.name || connection.username}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {connection.name ? connection.name.split(' ').map(n => n[0]).join('') : 'U'}
                          </div>
                        )}
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-900">{connection.name || connection.username}</h3>
                          <p className="text-blue-600 text-sm capitalize">{connection.role}</p>
                          <p className="text-xs text-gray-500">{connection.email} • Connected</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link 
                          to="/messages"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center"
                        >
                          <MessageCircle size={16} className="mr-1" />
                          Message
                        </Link>
                        <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                          <Phone size={16} />
                        </button>
                        <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                          <Mail size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {filteredConnections.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
                <p className="text-gray-600 mb-4">Start building your network by connecting with alumni and faculty.</p>
                <Link to="/browse-alumni" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Search size={16} className="mr-2" />
                  Find Alumni
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyConnections;
