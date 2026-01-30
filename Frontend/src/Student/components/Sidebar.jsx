import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Home, Search, Users, MessageCircle, User, BarChart3, Settings,
  LogOut, ChevronDown, FileText, Menu, X, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { authAPI, studentAPI, chatAPI } from '../../api/api';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [studentName, setStudentName] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user?._id && !profilePicture) {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const response = await studentAPI.getProfile(user._id, token);
          const profileData = response.data?.data || response.data;
          setProfilePicture(profileData.profilePicture || '');
          setStudentName(profileData.name || user.username || 'User');
        } catch (error) {
          console.error('Error fetching profile data:', error);
          setStudentName(user?.username || 'User');
        }
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUnreadCount(0);
          return;
        }
        const response = await chatAPI.getUnreadCount(token);
        const count = response.data.unreadCount || 0;
        setUnreadCount(count);
      } catch (error) {
        setUnreadCount(0);
      }
    };

    fetchProfileData();
    fetchUnreadCount();

    // Poll unread count
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?._id, profilePicture, user?.username]);

  const handleLogout = async () => {
    try {
      toast.success('Logging out...');
      await authAPI.logout();
      await logout();
    } catch {
      toast.error('Logout failed.');
    }
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/student-dashboard' },
    { icon: Search, label: 'Browse Alumni', path: '/browse-alumni' },
    { icon: Users, label: 'My Connections', path: '/my-connections' },
    { icon: Users, label: 'Communities', path: '/communities' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: FileText, label: 'Posts', path: '/posts' },
    { icon: User, label: 'Profile', path: '/student-profile' },
  ];

  return (
    <>
      {/* Mobile Menu Button - Floating Glass */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 text-indigo-600 hover:scale-105 transition-all"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed z-40 h-screen flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
          bg-white/80 backdrop-blur-2xl border-r border-slate-200/60 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.05)]
          ${isSidebarCollapsed ? 'w-20' : 'w-64'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div>
          {/* Logo Area */}
          <div className={`relative h-20 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'px-6'} border-b border-slate-100/50`}>
            <div className="flex items-center gap-3">
              <img
                src="/logo_new.svg"
                alt="Alumni Connect Logo"
                className="w-10 h-10 object-contain drop-shadow-md hover:scale-110 transition-transform duration-300"
              />
              {!isSidebarCollapsed && (
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  Alumni<span className="font-normal text-slate-500">Connect</span>
                </span>
              )}
            </div>

            {/* Collapse Toggle (Desktop) */}
            <button
              onClick={toggleSidebar}
              className={`hidden lg:flex w-6 h-6 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all absolute -right-3 top-7 shadow-md z-50`}
            >
              {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-2 mt-2 max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-hide">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    relative flex items-center px-3.5 py-3 rounded-xl transition-all duration-200 group
                    ${isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}
                    ${isSidebarCollapsed ? 'justify-center' : ''}
                  `}
                >
                  <item.icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-transform duration-300 ${!isActive && 'group-hover:scale-110'}`}
                  />

                  {!isSidebarCollapsed && (
                    <span className={`ml-3 text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                  )}

                  {/* Notification Dot */}
                  {item.label === 'Messages' && unreadCount > 0 && (
                    <span className={`
                      flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full 
                      ${isSidebarCollapsed ? 'absolute top-0 right-0 border-2 border-white' : 'ml-auto'}
                      ${isActive ? 'bg-white text-indigo-600' : 'bg-red-500 text-white shadow-sm'}
                    `}>
                      {unreadCount}
                    </span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Profile & Settings */}
        <div className="p-4 border-t border-slate-100/50 bg-slate-50/50">
          <div className={`relative ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>

            {/* Profile Card */}
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className={`
                  flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border border-transparent
                  ${showDropdown ? 'bg-white shadow-md border-slate-100' : 'hover:bg-white hover:shadow-sm'}
                `}
            >
              <div className="relative">
                {profilePicture ? (
                  <img src={profilePicture} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" alt="Profile" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-white shadow-sm">
                    <span className="text-xs font-bold text-indigo-600">
                      {studentName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>

              {!isSidebarCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{studentName || user?.username || 'User'}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.role || 'student'}</p>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </>
              )}
            </div>

            {/* Popup Menu (Glass style) */}
            {showDropdown && (
              <div className={`
                 absolute bottom-full mb-3 w-56 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-xl p-1.5 z-50
                 ${isSidebarCollapsed ? 'left-12' : 'left-0 right-0'}
                 animate-in slide-in-from-bottom-2 fade-in duration-200
               `}>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <Settings size={16} /> Settings
                </Link>
                <div className="h-px bg-slate-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;