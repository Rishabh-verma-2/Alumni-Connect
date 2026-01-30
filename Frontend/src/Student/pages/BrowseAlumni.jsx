import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, GraduationCap, Users, MessageCircle, UserPlus, User, Sun, Moon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';
import { alumniAPI, notificationAPI } from '../../api/api';
import toast from 'react-hot-toast';

const BrowseAlumni = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [alumni, setAlumni] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const { theme, toggleTheme } = useTheme();
  const { isSidebarCollapsed } = useSidebar();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlumni();
    fetchConnections();
  }, []);

  const fetchAlumni = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }
      const response = await alumniAPI.getAllAlumni(token);
      const alumniData = response?.data?.data || [];
      setAlumni(Array.isArray(alumniData) ? alumniData : []);
    } catch {
      toast.error('Failed to load alumni data');
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await notificationAPI.getConnections(token);
      setConnections(response?.data?.data || []);
    } catch {
      setConnections([]);
    }
  };

  const isConnected = (alumniUserId) => {
    if (!alumniUserId || !Array.isArray(connections)) return false;
    return connections.some(conn => 
      conn?._id === alumniUserId || 
      conn?.userId === alumniUserId ||
      conn?.user?._id === alumniUserId
    );
  };

  const handleRemoveConnection = async (alumniUserId) => {
    try {
      const token = localStorage.getItem('token');
      await notificationAPI.removeConnection(alumniUserId, token);
      setConnections(connections.filter(conn => conn._id !== alumniUserId));
      toast.success('Connection removed successfully!');
    } catch {
      toast.error('Failed to remove connection');
    }
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'AL';
    try {
      const nameParts = name.trim().split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      }
      return nameParts[0].slice(0, 2).toUpperCase();
    } catch {
      return 'AL';
    }
  };

  const getGradient = (index) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600',
      'from-yellow-500 to-orange-500'
    ];
    return gradients[index % gradients.length];
  };

  const filteredAlumni = Array.isArray(alumni) ? alumni.filter(person => {
    if (!person) return false;
    try {
      const matchesSearch = !searchTerm || 
                           (person.name && person.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (person.currentDesignation && person.currentDesignation.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (person.currentCompany && person.currentCompany.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (person.branch && person.branch.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCompany = !filterCompany || (person.currentCompany && person.currentCompany.toLowerCase().includes(filterCompany.toLowerCase()));
      const matchesLocation = !filterLocation || (person.currentLocation && person.currentLocation.toLowerCase().includes(filterLocation.toLowerCase()));
      const matchesYear = !filterYear || String(person.yearOfPassing) === String(filterYear);
      
      return matchesSearch && matchesCompany && matchesLocation && matchesYear;
    } catch {
      return false;
    }
  }) : [];

  const companies = Array.isArray(alumni) ? [...new Set(alumni.map(a => a?.currentCompany).filter(Boolean))] : [];
  const locations = Array.isArray(alumni) ? [...new Set(alumni.map(a => a?.currentLocation).filter(Boolean))] : [];
  const years = Array.isArray(alumni) ? [...new Set(alumni.map(a => a?.yearOfPassing).filter(Boolean))].sort((a, b) => b - a) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      
      <div className={`flex-1 transition-all duration-300 p-3 sm:p-4 lg:p-6 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } ml-0`}>
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Browse Alumni</h1>
            <p className="text-gray-600 dark:text-gray-400">Connect with alumni from your university</p>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, role, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Companies</option>
              {companies.map((company, idx) => (
                <option key={`company-${idx}`} value={company}>{company}</option>
              ))}
            </select>
            
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Locations</option>
              {locations.map((location, idx) => (
                <option key={`location-${idx}`} value={location}>{location}</option>
              ))}
            </select>
            
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Years</option>
              {years.map((year, idx) => (
                <option key={`year-${idx}`} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredAlumni.length} of {alumni.length} alumni
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading alumni...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAlumni.map((person, index) => (
              <div key={person?._id || person?.userId || `alumni-${index}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-w-0">
                <div className="flex items-start mb-4 space-x-4">
                  {person?.profilePicture ? (
                    <img
                      src={person.profilePicture}
                      alt={person?.name || 'Alumni'}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-16 h-16 bg-gradient-to-r ${getGradient(index)} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                      {getInitials(person?.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{person?.name || 'Unknown'}</h3>
                    <p className="text-blue-600 font-medium">{person?.currentDesignation || 'Position not specified'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{person?.currentCompany || 'Company not specified'}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin size={14} className="mr-2" />
                    {person?.currentLocation || 'Location not specified'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <GraduationCap size={14} className="mr-2" />
                    {person?.branch || 'Branch not specified'} • Class of {person?.yearOfPassing || 'Year not specified'}
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {person?.achievements || 'No additional information provided.'}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {person?.branch && (
                    <span className="px-2 py-1 text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-md font-medium">
                      {person.branch}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {isConnected(person?.userId || person?._id) ? (
                    <button 
                      onClick={() => handleRemoveConnection(person?.userId || person?._id)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 text-sm font-semibold flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      <UserPlus size={18} className="mr-2" />
                      Remove
                    </button>
                  ) : (
                    <button 
                      onClick={() => console.log('Connect clicked')}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 text-sm font-semibold flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      <UserPlus size={18} className="mr-2" />
                      Connect
                    </button>
                  )}
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        try {
                          const alumniId = person?._id || person?.userId;
                          if (alumniId) {
                            navigate(`/alumni-profile-view/${alumniId}`);
                          } else {
                            toast.error('Alumni profile not available');
                          }
                        } catch {
                          toast.error('Error opening profile');
                        }
                      }}
                      className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white rounded-xl hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium flex items-center justify-center transition-all duration-200"
                    >
                      <User size={16} className="mr-1.5" />
                      View Profile
                    </button>
                    <button 
                      onClick={() => navigate('/messages')}
                      className="px-4 py-2.5 bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 text-gray-800 dark:text-white rounded-xl hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center transition-all duration-200"
                    >
                      <MessageCircle size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredAlumni.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No alumni found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseAlumni;