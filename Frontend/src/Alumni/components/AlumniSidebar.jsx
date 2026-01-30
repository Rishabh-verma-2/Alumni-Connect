import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, MessageCircle, User, Settings, LogOut, ChevronDown, Briefcase, TrendingUp, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { authAPI, studentAPI, alumniAPI, chatAPI } from '../../api/api';
import toast from 'react-hot-toast';

const AlumniSidebar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [alumniData, setAlumniData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();

  useEffect(() => {
    const fetchAlumniData = async () => {
      if (user?._id && user?.role === 'alumni') {
        try {
          // First get all alumni to find current user's alumni record
          const alumniResponse = await alumniAPI.getAllAlumni();
          const currentAlumni = alumniResponse.data.data.find(alum => alum.email === user.email);

          if (currentAlumni) {
            setAlumniData(currentAlumni);
            setProfilePicture(currentAlumni.profilePicture || '');
          }
        } catch (error) {
          console.error('Error fetching alumni data:', error);
        }
      }
    };

    fetchAlumniData();

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUnreadCount(0);
          return;
        }
        const response = await chatAPI.getUnreadCount(token);
        const count = response.data.unreadCount || 0;
        console.log('Alumni Sidebar - Unread count:', count, 'Response:', response.data);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
        // Set to 0 on error to ensure no false notifications
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    // Listen for refresh events
    const handleRefresh = () => fetchUnreadCount();
    window.addEventListener('refreshUnreadCount', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshUnreadCount', handleRefresh);
    };
  }, [user?._id, user?.email, user?.role]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      localStorage.removeItem('token');
      toast.success('Logged out successfully!');
      navigate('/login');
    } catch {
      toast.error('Logout failed. Please try again.');
    }
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/alumni-dashboard' },
    { icon: Users, label: 'Mentor Students', path: '/mentor-students' },
    { icon: Users, label: 'Communities', path: '/communities' },
    { icon: FileText, label: 'Posts', path: '/posts' },
    { icon: Briefcase, label: 'Job Postings', path: '/job-postings' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
    { icon: User, label: 'Profile', path: '/alumni-profile' },
    { icon: Settings, label: 'Settings', path: '/alumni-settings' }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 shadow-lg h-screen flex flex-col fixed z-40 transition-all duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        {/* Logo Section */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img
                src="/logo_new.svg"
                alt="Alumni Connect Logo"
                className="w-10 h-10 object-contain drop-shadow-md hover:scale-110 transition-transform duration-300"
              />
              {!isSidebarCollapsed && (
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Alumni Connect</span>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              {isSidebarCollapsed ? (
                <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-2 sm:py-4 overflow-y-auto">
          {menuItems.map((item, index) => (
            item.path ? (
              <Link
                key={index}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium transition-all duration-200 ${location.pathname === item.path
                  ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400 border-r-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20'
                  }`}
              >
                <div className="flex items-center">
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {item.label === 'Messages' && unreadCount > 0 && (
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                )}
              </Link>
            ) : (
              <div
                key={index}
                className="flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all duration-200 cursor-pointer"
              >
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </div>
            )
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-xs sm:text-sm">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() :
                    user?.username ? user.username.substring(0, 2).toUpperCase() : 'AL'}
                </span>
              </div>
            )}
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{alumniData?.name || user?.name || user?.username || 'Alumni'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{alumniData?.role || user?.role || 'Alumni'}</p>
              </div>
            )}
          </div>

          {!isSidebarCollapsed && (
            <div className="mt-2 sm:mt-3 relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-between w-full text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <span>Settings</span>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                  <Link
                    to="/alumni-settings"
                    className="flex items-center px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => {
                      setShowDropdown(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center px-3 py-2 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                  >
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AlumniSidebar;