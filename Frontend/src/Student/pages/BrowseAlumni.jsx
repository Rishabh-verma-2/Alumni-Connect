
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, GraduationCap, Users, MessageCircle, UserPlus,
  User, Sun, Moon, Briefcase, Linkedin, Github, Twitter, Facebook,
  Instagram, ExternalLink, X, Clock, AlertTriangle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';
import { alumniAPI, notificationAPI } from '../../api/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const BrowseAlumni = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [alumni, setAlumni] = useState([]);
  const [connections, setConnections] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [selectedUserToRemove, setSelectedUserToRemove] = useState(null);

  const { theme, toggleTheme } = useTheme();
  const { isSidebarCollapsed } = useSidebar();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlumni();
    fetchConnections();
    fetchSentRequests();
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
      setAlumni(Array.isArray(alumniData) ? alumniData.filter(a => a) : []);
    } catch (error) {
      console.error("Error fetching alumni:", error);
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
    } catch (error) {
      console.error("Error fetching connections:", error);
      setConnections([]);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await notificationAPI.getSentConnectionRequests(token);
      setSentRequests(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching sent requests:", error);
      setSentRequests([]);
    }
  };

  const isConnected = (userId) => {
    if (!userId || !Array.isArray(connections)) return false;
    return connections.some(conn =>
      conn?._id === userId ||
      conn?.userId === userId ||
      conn?.user?._id === userId
    );
  };

  const isPending = (userId) => {
    if (!userId || !Array.isArray(sentRequests)) return false;
    return sentRequests.some(req =>
      req.receiverId === userId ||
      req.receiverId?._id === userId
    );
  };

  const initiateRemoveConnection = (user) => {
    setSelectedUserToRemove(user);
    setShowDisconnectModal(true);
  };

  const confirmRemoveConnection = async () => {
    if (!selectedUserToRemove) return;

    const userId = selectedUserToRemove.userId || selectedUserToRemove._id;
    try {
      const token = localStorage.getItem('token');
      await notificationAPI.removeConnection(userId, token);
      setConnections(prev => prev.filter(conn => conn._id !== userId));
      toast.success('Connection removed successfully!');
      setShowDisconnectModal(false);
      setSelectedUserToRemove(null);
    } catch {
      toast.error('Failed to remove connection');
    }
  };

  const handleConnect = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await notificationAPI.sendConnectionRequest(userId, token);
      toast.success('Connection request sent!');
      fetchSentRequests();
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already')) {
        toast.error('Request already sent');
        fetchSentRequests();
      } else {
        toast.error('Failed to send request');
      }
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
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-emerald-500 to-teal-500',
      'from-indigo-500 to-violet-500',
      'from-rose-500 to-orange-500'
    ];
    return gradients[index % gradients.length];
  };

  const filteredAlumni = Array.isArray(alumni) ? alumni.filter(person => {
    if (!person) return false;
    try {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        (person.name && person.name.toLowerCase().includes(term)) ||
        (person.currentDesignation && person.currentDesignation.toLowerCase().includes(term)) ||
        (person.currentCompany && person.currentCompany.toLowerCase().includes(term)) ||
        (person.branch && person.branch.toLowerCase().includes(term)) ||
        (person.achievements && person.achievements.toLowerCase().includes(term));

      const matchesCompany = !filterCompany || (person.currentCompany && person.currentCompany.toLowerCase() === filterCompany.toLowerCase());
      const matchesLocation = !filterLocation || (person.currentLocation && person.currentLocation.toLowerCase() === filterLocation.toLowerCase());
      const matchesYear = !filterYear || String(person.yearOfPassing) === String(filterYear);

      return matchesSearch && matchesCompany && matchesLocation && matchesYear;
    } catch {
      return false;
    }
  }) : [];

  const companies = Array.isArray(alumni) ? [...new Set(alumni.map(a => a?.currentCompany).filter(Boolean))].sort() : [];
  const locations = Array.isArray(alumni) ? [...new Set(alumni.map(a => a?.currentLocation).filter(Boolean))].sort() : [];
  const years = Array.isArray(alumni) ? [...new Set(alumni.map(a => a?.yearOfPassing).filter(Boolean))].sort((a, b) => b - a) : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex font-sans relative">
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} ml-0`}>

        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-4 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Alumni Network
              </h1>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                Connect with {alumni.length} graduates from your university
              </p>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

          {/* Filters & Search */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-all hover:shadow-md">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search alumni by name, company, role, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:w-auto min-w-[50%]">
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={filterCompany}
                    onChange={(e) => setFilterCompany(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="">All Companies</option>
                    {companies.map((company, idx) => (
                      <option key={`company-${idx}`} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="">All Locations</option>
                    {locations.map((location, idx) => (
                      <option key={`location-${idx}`} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="">All Years</option>
                    {years.map((year, idx) => (
                      <option key={`year-${idx}`} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {(searchTerm || filterCompany || filterLocation || filterYear) && (
              <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>Found {filteredAlumni.length} result{filteredAlumni.length !== 1 ? 's' : ''}</span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCompany('');
                    setFilterLocation('');
                    setFilterYear('');
                  }}
                  className="ml-4 flex items-center text-red-500 hover:text-red-600 transition-colors"
                >
                  <X size={14} className="mr-1" /> Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Loading network...</p>
            </div>
          ) : (
            <>
              {filteredAlumni.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Users className="text-gray-400 dark:text-gray-500" size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No alumni found</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    No alumni match your current filters. Try adjusting your search criteria or clear filters to see everyone.
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {filteredAlumni.map((person, index) => (
                    <motion.div
                      key={person?._id || `alumni-${index}`}
                      variants={itemVariants}
                      className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {/* Card Header Background */}
                      <div className={`h-24 bg-gradient-to-r ${getGradient(index)} opacity-90 group-hover:opacity-100 transition-opacity`}></div>

                      <div className="px-6 pb-6 pt-0 relative">
                        {/* Profile Picture */}
                        <div className="absolute -top-12 left-6">
                          {person?.profilePicture ? (
                            <img
                              src={person.profilePicture}
                              alt={person?.name}
                              className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                            />
                          ) : (
                            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getGradient(index)} flex items-center justify-center text-white border-4 border-white dark:border-gray-800 shadow-lg`}>
                              <span className="text-2xl font-bold">{getInitials(person?.name)}</span>
                            </div>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex justify-end pt-3 gap-2">
                          <button
                            onClick={() => navigate('/messages')}
                            className="p-2 rounded-full bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Message"
                          >
                            <MessageCircle size={18} />
                          </button>
                          <button
                            onClick={() => {
                              const alumniId = person?.userId || person?._id;
                              if (alumniId) navigate(`/alumni-profile-view/${alumniId}`);
                            }}
                            className="p-2 rounded-full bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="View Profile"
                          >
                            <ExternalLink size={18} />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="mt-4">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                            {person?.name || 'Unknown Alumni'}
                          </h3>

                          <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium mt-1 mb-3">
                            <Briefcase size={16} className="mr-1.5 flex-shrink-0" />
                            <span className="truncate">{person?.currentDesignation || 'Role not set'}</span>
                          </div>

                          <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300 mb-5">
                            <div className="flex items-center">
                              <div className="w-5 flex justify-center mr-2 text-gray-400">
                                <Briefcase size={16} />
                              </div>
                              <span className="truncate">{person?.currentCompany || 'Company not specified'}</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-5 flex justify-center mr-2 text-gray-400">
                                <MapPin size={16} />
                              </div>
                              <span className="truncate">{person?.currentLocation || 'Location not specified'}</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-5 flex justify-center mr-2 text-gray-400">
                                <GraduationCap size={16} />
                              </div>
                              <span className="truncate">{person?.branch || 'Branch N/A'} • {person?.yearOfPassing || 'Year N/A'}</span>
                            </div>
                          </div>

                          {/* Social Links */}
                          {person?.socialLinks && (
                            <div className="flex space-x-3 mb-5 border-t border-gray-100 dark:border-gray-700 pt-3">
                              {person.socialLinks.linkedin && (
                                <a href={person.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0077b5] transition-colors"><Linkedin size={18} /></a>
                              )}
                              {person.socialLinks.github && (
                                <a href={person.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><Github size={18} /></a>
                              )}
                              {person.socialLinks.twitter && (
                                <a href={person.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1da1f2] transition-colors"><Twitter size={18} /></a>
                              )}
                            </div>
                          )}

                          {/* Connect Button */}
                          <div className="mt-auto">
                            {isConnected(person?.userId) ? (
                              <button
                                onClick={() => initiateRemoveConnection(person)}
                                className="w-full py-2.5 px-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                              >
                                <UserPlus size={18} className="transform rotate-45" /> Remove
                              </button>
                            ) : isPending(person?.userId) ? (
                              <button
                                disabled
                                className="w-full py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                <Clock size={16} className="text-gray-500 dark:text-gray-400" /> Pending
                              </button>
                            ) : (
                              <button
                                onClick={() => handleConnect(person?.userId)}
                                className="w-full py-2.5 px-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <UserPlus size={18} /> Connect
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Disconnect Modal */}
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
                  Are you sure you want to remove <span className="font-semibold text-gray-900 dark:text-white">{selectedUserToRemove?.name}</span> from your connections? You will need to request to connect again.
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

export default BrowseAlumni;