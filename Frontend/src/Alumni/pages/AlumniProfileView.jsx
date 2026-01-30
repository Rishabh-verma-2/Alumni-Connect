
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Briefcase, Calendar, Award, Users,
  MessageCircle, UserPlus, UserMinus, Mail, Linkedin,
  Github, Twitter, Instagram, Facebook, Globe, Building,
  AlertTriangle
} from 'lucide-react';
import Sidebar from '../../Student/components/Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { alumniAPI, notificationAPI } from '../../api/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AlumniProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { isSidebarCollapsed } = useSidebar();
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connections, setConnections] = useState([]);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  useEffect(() => {
    fetchAlumniProfile();
    fetchConnections();
  }, [id]);

  const fetchAlumniProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await alumniAPI.getProfile(id, token);
      setAlumni(response.data.data);
    } catch (error) {
      console.error('Error fetching alumni profile:', error);
      toast.error('Failed to load alumni profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await notificationAPI.getConnections(token);
        setConnections(response.data.data || []);
        const connected = response.data.data?.some(conn => conn._id === alumni?.userId || conn._id === alumni?._id);
        setIsConnected(connected);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  useEffect(() => {
    if (alumni && connections.length > 0) {
      const connected = connections.some(conn =>
        conn._id === alumni.userId ||
        conn._id === alumni._id ||
        conn.email === alumni.email
      );
      setIsConnected(connected);
    }
  }, [alumni, connections]);

  const handleConnect = async () => {
    if (!alumni) return;
    try {
      setConnectionLoading(true);
      const token = localStorage.getItem('token');
      const userIdToConnect = alumni.userId || alumni._id;
      await notificationAPI.sendConnectionRequest(userIdToConnect, token);
      toast.success('Connection request sent!');
      fetchConnections();
    } catch (error) {
      toast.error('Failed to send connection request');
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!alumni) return;
    try {
      setConnectionLoading(true);
      const token = localStorage.getItem('token');
      const connection = connections.find(conn =>
        conn._id === alumni.userId ||
        conn._id === alumni._id ||
        conn.email === alumni.email
      );
      if (connection) {
        await notificationAPI.removeConnection(connection._id, token);
        toast.success('Connection removed successfully!');
        fetchConnections();
        setShowDisconnectModal(false);
      }
    } catch (error) {
      toast.error('Failed to remove connection');
    } finally {
      setConnectionLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'AL';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  const coverGradient = "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />
        <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />
        <div className={`flex-1 flex flex-col items-center justify-center p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
          <button onClick={() => navigate('/browse-alumni')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex font-sans relative">
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} ml-0`}>
        <div className="pb-12">

          {/* Header / Cover */}
          <div className="relative">
            <div className={`h-48 md:h-64 w-full ${coverGradient} relative`}>
              <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 md:px-8">

            {/* Profile Info Card */}
            <div className="relative -mt-12 md:-mt-20 mb-6 z-10">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 relative min-h-[160px]">

                {/* Profile Image - Absolute Positioned to prevent layout shifts */}
                <div className="absolute -top-16 left-6 md:left-8">
                  <div className="relative group">
                    {alumni.profilePicture ? (
                      <img
                        src={alumni.profilePicture}
                        alt={alumni.name}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg bg-white dark:bg-gray-800"
                      />
                    ) : (
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
                        {getInitials(alumni.name)}
                      </div>
                    )}
                    <span className="absolute bottom-4 right-4 w-5 h-5 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full" title="Online"></span>
                  </div>
                </div>

                {/* Content Wrapper - Padded to clear image */}
                <div className="pt-20 md:pt-0 md:ml-48 flex flex-col md:flex-row items-start md:items-end justify-between">

                  <div className="flex-1 min-w-0 mr-4 w-full">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
                      {alumni.name}
                    </h1>
                    <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mt-1">
                      {alumni.currentDesignation} at {alumni.currentCompany}
                    </p>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500 dark:text-gray-400 mt-3">
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-1 flex-shrink-0" />
                        <span className="truncate max-w-[150px]">{alumni.currentLocation || "Location not specified"}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail size={16} className="mr-1 flex-shrink-0" />
                        <span className="truncate max-w-[200px] hover:text-blue-600 transition-colors cursor-pointer select-all">
                          {alumni.email}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users size={16} className="mr-1 flex-shrink-0" />
                        500+ connections
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 md:mt-0 w-full md:w-auto flex-shrink-0">
                    {isConnected ? (
                      <button
                        onClick={() => setShowDisconnectModal(true)}
                        disabled={connectionLoading}
                        className="flex-1 md:flex-none px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        {connectionLoading ? 'Pending...' : 'Following'}
                      </button>
                    ) : (
                      <button
                        onClick={handleConnect}
                        disabled={connectionLoading}
                        className="flex-1 md:flex-none px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors shadow-md shadow-blue-500/30 flex items-center justify-center gap-2"
                      >
                        <UserPlus size={18} />
                        {connectionLoading ? 'Sending...' : 'Connect'}
                      </button>
                    )}
                    <button
                      onClick={() => navigate('/messages')}
                      className="flex-1 md:flex-none px-6 py-2 bg-white dark:bg-gray-800 border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} /> Message
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column: About & Experience */}
              <div className="lg:col-span-2 space-y-6">

                {/* About Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {alumni.achievements || "Experienced professional with a demonstrated history of working in the industry. Strong engineering professional skilled in modern technologies."}
                  </p>
                </div>

                {/* Experience Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Experience</h2>

                  <div className="relative pl-2 space-y-8">
                    {/* Timeline Line */}
                    <div className="absolute top-2 bottom-0 left-[27px] w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                    {/* Current Role */}
                    <div className="flex gap-4 relative">
                      <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-4 border-white dark:border-gray-800">
                        <Building size={24} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{alumni.currentDesignation}</h3>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">{alumni.currentCompany}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                          <Calendar size={14} className="mr-1" /> Present • {alumni.currentLocation}
                        </p>
                      </div>
                    </div>

                    {/* University */}
                    <div className="flex gap-4 relative">
                      <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-4 border-white dark:border-gray-800">
                        <Award size={24} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Alumni</h3>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">University Alumni Network</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                          <Calendar size={14} className="mr-1" /> Class of {alumni.yearOfPassing}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Education</h2>
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building size={28} className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your University</h3>
                      <p className="text-gray-700 dark:text-gray-300">{alumni.branch}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {parseInt(alumni.yearOfPassing) - 4} - {alumni.yearOfPassing}
                      </p>
                      {alumni.enrollmentId && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Enrollment ID: {alumni.enrollmentId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Contact & Social */}
              <div className="space-y-6">

                {/* Contact Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact Details</h2>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Mail size={20} className="text-gray-400 mr-3 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                        <a href={`mailto:${alumni.email}`} className="text-blue-600 dark:text-blue-400 hover:underline break-words block">
                          {alumni.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Social Profiles</h2>
                  <div className="space-y-4">
                    {alumni.socialLinks?.linkedin && (
                      <a href={alumni.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Linkedin size={20} className="mr-3" />
                        <span className="font-medium">LinkedIn</span>
                      </a>
                    )}
                    {alumni.socialLinks?.github && (
                      <a href={alumni.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Github size={20} className="mr-3" />
                        <span className="font-medium">GitHub</span>
                      </a>
                    )}
                    {alumni.socialLinks?.twitter && (
                      <a href={alumni.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-400 transition-colors">
                        <Twitter size={20} className="mr-3" />
                        <span className="font-medium">Twitter</span>
                      </a>
                    )}
                    {!alumni.socialLinks && (
                      <p className="text-gray-500 italic">No social profiles added</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Disconnect Modal */}
      <AnimatePresence>
        {showDisconnectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {/* Modal Content... Same as before */}
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
                  Are you sure you want to remove <span className="font-semibold text-gray-900 dark:text-white">{alumni.name}</span> from your connections? You will need to request to connect again.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowDisconnectModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDisconnect}
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

export default AlumniProfileView;