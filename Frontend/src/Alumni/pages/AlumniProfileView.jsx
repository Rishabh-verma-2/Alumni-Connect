import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, Calendar, Award, Users, MessageCircle, UserPlus, UserMinus, Mail, Linkedin, Github, Twitter, Instagram, Facebook } from 'lucide-react';
import Sidebar from '../../Student/components/Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { alumniAPI, notificationAPI } from '../../api/api';
import toast from 'react-hot-toast';

const AlumniProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    fetchAlumniProfile();
    fetchConnections();
  }, [id]);

  const fetchAlumniProfile = async () => {
    try {
      console.log('Fetching alumni profile for ID:', id);
      const token = localStorage.getItem('token');
      const response = await alumniAPI.getProfile(id, token);
      console.log('Alumni profile response:', response.data);
      setAlumni(response.data.data);
    } catch (error) {
      console.error('Error fetching alumni profile:', error);
      console.error('Error response:', error.response?.data);
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
        
        // Check if current alumni is in connections
        const connected = response.data.data?.some(conn => conn._id === alumni?.userId || conn._id === alumni?._id);
        setIsConnected(connected);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  // Update connection status when alumni data changes
  useEffect(() => {
    if (alumni && connections.length > 0) {
      console.log('Checking connection status for alumni:', alumni);
      console.log('Available connections:', connections);
      
      const connected = connections.some(conn => 
        conn._id === alumni.userId || 
        conn._id === alumni._id ||
        conn.email === alumni.email
      );
      
      console.log('Is connected:', connected);
      setIsConnected(connected);
    }
  }, [alumni, connections]);

  const handleConnect = async () => {
    if (!alumni) return;
    
    try {
      setConnectionLoading(true);
      const token = localStorage.getItem('token');
      
      // Get the correct user ID to connect to
      const userIdToConnect = alumni.userId || alumni._id;
      
      await notificationAPI.sendConnectionRequest(userIdToConnect, token);
      toast.success('Connection request sent!');
      
      // Refresh connections
      fetchConnections();
    } catch (error) {
      console.error('Error sending connection request:', error);
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
      
      // Find the connection to remove
      const connection = connections.find(conn => 
        conn._id === alumni.userId || 
        conn._id === alumni._id ||
        conn.email === alumni.email
      );
      
      if (connection) {
        await notificationAPI.removeConnection(connection._id, token);
        toast.success('Connection removed successfully!');
        
        // Refresh connections
        fetchConnections();
      }
    } catch (error) {
      console.error('Error removing connection:', error);
      toast.error('Failed to remove connection');
    } finally {
      setConnectionLoading(false);
    }
  };

  const getSkillColor = (skill) => {
    const skillColors = {
      'React': 'from-blue-100 to-blue-200 text-blue-700',
      'Machine Learning': 'from-green-100 to-green-200 text-green-700',
      'Python': 'from-yellow-100 to-yellow-200 text-yellow-700',
      'TensorFlow': 'from-orange-100 to-orange-200 text-orange-700',
      'Product Strategy': 'from-purple-100 to-purple-200 text-purple-700',
      'Analytics': 'from-indigo-100 to-indigo-200 text-indigo-700',
      'Leadership': 'from-red-100 to-red-200 text-red-700',
      'Node.js': 'from-green-100 to-green-200 text-green-700',
      'AWS': 'from-orange-100 to-orange-200 text-orange-700',
      'Data Analysis': 'from-teal-100 to-teal-200 text-teal-700',
      'R': 'from-blue-100 to-blue-200 text-blue-700',
      'SQL': 'from-gray-100 to-gray-200 text-gray-700',
      'UI/UX': 'from-pink-100 to-pink-200 text-pink-700',
      'Figma': 'from-purple-100 to-purple-200 text-purple-700',
      'User Research': 'from-emerald-100 to-emerald-200 text-emerald-700',
      'Digital Marketing': 'from-red-100 to-red-200 text-red-700',
      'Brand Strategy': 'from-violet-100 to-violet-200 text-violet-700'
    };
    return skillColors[skill] || 'from-gray-100 to-gray-200 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />
        <div className="flex-1 p-6 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />
        <div className="flex-1 p-6 ml-64 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The alumni profile you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/browse-alumni')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Browse Alumni
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="mb-6 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alumni Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">View detailed information about this alumni</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-6">
              <div className="text-center mb-6">
                {alumni.profilePicture ? (
                  <img
                    src={alumni.profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center border-4 border-white shadow-lg mx-auto">
                    <span className="text-white font-bold text-4xl">
                      {alumni.name ? alumni.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AL'}
                    </span>
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{alumni.name}</h2>
                <p className="text-purple-600 font-medium">{alumni.currentDesignation}</p>
                <p className="text-gray-600 dark:text-gray-400">{alumni.currentCompany}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Alumni
                  </span>
                  {isConnected && (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      ✓ Connected
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar size={16} className="mr-3" />
                  <span>Class of {alumni.yearOfPassing}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Award size={16} className="mr-3" />
                  <span>{alumni.branch}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPin size={16} className="mr-3" />
                  <span>{alumni.currentLocation || 'Location not specified'}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Mail size={16} className="mr-3" />
                  <span>{alumni.email}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isConnected ? (
                  <button 
                    onClick={handleDisconnect}
                    disabled={connectionLoading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-semibold flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserMinus size={18} className="mr-2" />
                    {connectionLoading ? 'Removing...' : 'Remove Connection'}
                  </button>
                ) : (
                  <button 
                    onClick={handleConnect}
                    disabled={connectionLoading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus size={18} className="mr-2" />
                    {connectionLoading ? 'Connecting...' : 'Connect'}
                  </button>
                )}
                <button 
                  onClick={() => navigate('/messages')}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium flex items-center justify-center transition-all duration-200"
                >
                  <MessageCircle size={18} className="mr-2" />
                  Send Message
                </button>
              </div>

              {/* Social Links */}
              {alumni.socialLinks && Object.values(alumni.socialLinks).some(link => link) && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Links</h3>
                  <div className="flex space-x-3">
                    {alumni.socialLinks?.linkedin && (
                      <a href={alumni.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">
                        <Linkedin size={20} />
                      </a>
                    )}
                    {alumni.socialLinks?.github && (
                      <a href={alumni.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Github size={20} />
                      </a>
                    )}
                    {alumni.socialLinks?.twitter && (
                      <a href={alumni.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500 transition-colors">
                        <Twitter size={20} />
                      </a>
                    )}
                    {alumni.socialLinks?.instagram && (
                      <a href={alumni.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700 transition-colors">
                        <Instagram size={20} />
                      </a>
                    )}
                    {alumni.socialLinks?.facebook && (
                      <a href={alumni.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:text-blue-900 transition-colors">
                        <Facebook size={20} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {alumni.achievements || 'No additional information provided yet.'}
              </p>
            </div>

            {/* Professional Experience */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Professional Experience</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{alumni.currentDesignation}</h4>
                  <p className="text-blue-600 font-medium">{alumni.currentCompany}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Position</p>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Education</h3>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">{alumni.branch}</h4>
                <p className="text-purple-600 font-medium">Your University</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Graduated in {alumni.yearOfPassing}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enrollment ID: {alumni.enrollmentId}</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <p className="text-gray-900 dark:text-white font-medium">{alumni.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Location</p>
                  <p className="text-gray-900 dark:text-white font-medium">{alumni.currentLocation || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfileView;