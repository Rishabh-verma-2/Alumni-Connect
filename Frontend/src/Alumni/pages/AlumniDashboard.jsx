import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Briefcase, Calendar, Bell, Search, MessageCircle, TrendingUp, Settings, ArrowUp, ArrowDown, FileText, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import AlumniSidebar from '../components/AlumniSidebar';
import AlumniNotificationDropdown from '../components/AlumniNotificationDropdown';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';
import { alumniAPI, studentAPI } from '../../api/api';
import ConnectionRequests from '../components/ConnectionRequests';
//import toast from 'react-hot-toast';

const AlumniDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { theme } = useTheme();
  const { isSidebarCollapsed } = useSidebar();
  const [alumniProfile, setAlumniProfile] = useState(null);
  
  // Debug: Log current theme and check if dark class is applied
  useEffect(() => {
    console.log('Current theme:', theme);
    console.log('HTML has dark class:', document.documentElement.classList.contains('dark'));
    console.log('Body has dark class:', document.body.classList.contains('dark'));
  }, [theme]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [statsPeriod, setStatsPeriod] = useState('month');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchAlumniProfile = useCallback(async () => {
    if (!user) return;
    try {
      const response = await alumniAPI.getAllAlumni();
      const currentAlumni = response.data.data.find(alum => alum.email === user.email);
      setAlumniProfile(currentAlumni);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [user]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAllStudents();
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlumniProfile();
    fetchStudents();
  }, [fetchAlumniProfile, fetchStudents]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (showEventPopup) {
        setShowEventPopup(false);
      }
    };
    
    if (showEventPopup) {
      document.addEventListener('click', handleClickOutside);
    };
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showEventPopup]);
  
  const filteredStudents = students.filter(person => 
    person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.yearOfJoining?.toString().includes(searchTerm)
  );

  const getInitials = (name) => {
    if (!name) return 'ST';
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return nameParts[0].slice(0, 2).toUpperCase();
  };

  const getGradient = (index) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-orange-500',
      'from-pink-500 to-rose-600'
    ];
    return gradients[index % gradients.length];
  };

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isToday = (date, day) => {
    const today = new Date();
    return today.getFullYear() === date.getFullYear() && 
           today.getMonth() === date.getMonth() && 
           today.getDate() === day;
  };

  const getEventsForDate = (day) => {
    // Sample events data - replace with actual API call
    const events = {
      [`${currentMonth.getFullYear()}-${currentMonth.getMonth()}-25`]: {
        title: 'Alumni Networking Night',
        time: '6:00 PM',
        location: 'Virtual Event',
        type: 'networking'
      },
      [`${currentMonth.getFullYear()}-${currentMonth.getMonth()}-30`]: {
        title: 'Career Workshop',
        time: '2:00 PM',
        location: 'Conference Hall',
        type: 'workshop'
      }
    };
    return events[`${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`];
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 relative overflow-hidden flex">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Sidebar */}
      <AlumniSidebar />

      {/* Main Content */}
      <div className={`flex-1 p-3 sm:p-4 lg:p-6 ml-0 transition-all duration-300 relative z-10 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top Actions */}
        <div className="flex justify-end items-center space-x-4 mb-4">
          {/* Temporary theme toggle for testing */}
          {/* <button 
            onClick={toggleTheme}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button> */}
          <AlumniNotificationDropdown />
          <Link to="/alumni-settings">
            <Settings className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white cursor-pointer" size={20} />
          </Link>
        </div>
        
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 text-white overflow-hidden opacity-0 translate-y-5 animate-fade-in-up">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-10 backdrop-blur-sm"></div>
          
          {/* Floating elements */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm animate-float"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full backdrop-blur-sm animate-float animation-delay-2000"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                Welcome back,  
                <span className="animate-text-shine bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent bg-[length:200%_100%]">
                  &nbsp;{user?.name || user?.username || 'Alumni'}
                </span>!
              </h1>
              
              <style jsx>{`
                @keyframes text-shine {
                  0% {
                    background-position: -200% 0;
                  }
                  100% {
                    background-position: 200% 0;
                  }
                }
                
                @keyframes fade-in-up {
                  0% {
                    opacity: 0;
                    transform: translateY(10px);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                
                @keyframes float {
                  0% {
                    transform: translateY(0px);
                  }
                  50% {
                    transform: translateY(-10px);
                  }
                  100% {
                    transform: translateY(0px);
                  }
                }
                
                .animate-text-shine {
                  animation: text-shine 3s ease-in-out infinite;
                }
                
                .animate-fade-in-up {
                  animation: fade-in-up 0.6s ease-out forwards;
                }
                
                .animate-float {
                  animation: float 3s ease-in-out infinite;
                }
                
                .animation-delay-2000 {
                  animation-delay: 2s;
                }
                
                .animation-delay-4000 {
                  animation-delay: 4s;
                }
              `}</style>
              <p className="text-lg sm:text-xl text-white/90 mb-4 sm:mb-6 lg:mb-8">Inspire the next generation of leaders ✨</p>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Link to="/mentor-students" className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 hover:scale-105 transform">
                  <UserPlus size={20} />
                  <span className="font-medium">Mentor Students</span>
                </Link>
                <Link to="/posts" className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 hover:scale-105 transform">
                  <FileText size={20} />
                  <span className="font-medium">View Posts</span>
                </Link>
                <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 hover:scale-105 transform">
                  <Briefcase size={20} />
                  <span className="font-medium">Post Jobs</span>
                </button>
              </div>
            </div>
            
            <div className="w-full sm:w-64 bg-white/10 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center lg:ml-8 p-3 text-center border border-white/20 shadow-lg">
              {alumniProfile?.profilePicture ? (
                <img 
                  src={alumniProfile.profilePicture} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover border-4 border-white/30 mb-2"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center mb-2 border-4 border-white/30 shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {(() => {
                      const displayName = user?.name || user?.username;
                      if (displayName) {
                        const nameParts = displayName.trim().split(' ');
                        if (nameParts.length >= 2) {
                          return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
                        }
                        return nameParts[0].slice(0, 2).toUpperCase();
                      }
                      return 'AL';
                    })()}
                  </span>
                </div>
              )}
              <h3 className="text-white font-semibold text-lg mb-1 text-center">{user?.name || user?.username || 'Alumni'}</h3>
              <p className="text-white/80 text-sm mb-1 text-center">Class of {alumniProfile?.yearOfPassing || '2020'}</p>
              <span className="inline-block px-3 py-1 text-xs bg-white/20 text-white rounded-full mb-1">
                {user?.role || 'Alumni'}
              </span>
              <p className="text-white/70 text-xs text-center">
                {alumniProfile?.currentCompany || 'Company not set'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Stats Header with Filters */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Impact</h2>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button 
              onClick={() => setStatsPeriod('month')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                statsPeriod === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              This month
            </button>
            <button 
              onClick={() => setStatsPeriod('year')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                statsPeriod === 'year' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              This year
            </button>
            <button 
              onClick={() => setStatsPeriod('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                statsPeriod === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              All time
            </button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">👥 Students Mentored</p>
                <p className="text-3xl font-bold">
                  {statsPeriod === 'month' ? '8' : statsPeriod === 'year' ? '24' : '47'}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUp size={16} className="text-green-300" />
                  <span className="text-green-300 text-sm ml-1">+15% growth</span>
                </div>
              </div>
              <Users className="text-blue-200" size={32} />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">💼 Job Referrals</p>
                <p className="text-3xl font-bold">
                  {statsPeriod === 'month' ? '3' : statsPeriod === 'year' ? '12' : '28'}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUp size={16} className="text-green-300" />
                  <span className="text-green-300 text-sm ml-1">+25% success</span>
                </div>
              </div>
              <Briefcase className="text-green-200" size={32} />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">📅 Events Hosted</p>
                <p className="text-3xl font-bold">
                  {statsPeriod === 'month' ? '2' : statsPeriod === 'year' ? '8' : '15'}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUp size={16} className="text-green-300" />
                  <span className="text-green-300 text-sm ml-1">+30% attendance</span>
                </div>
              </div>
              <Calendar className="text-orange-200" size={32} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Connection Requests */}
            <ConnectionRequests />
            
            {/* Students Seeking Mentorship */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <UserPlus className="mr-2" size={20} />
                  Students Seeking Mentorship
                </h2>
              </div>
              <div className="p-6">
                <div className="flex space-x-4 mb-4">
                  <input
                    type="text"
                    placeholder="Search by name, branch, or year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm dark:bg-gray-700 dark:text-white"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg transform transition-all duration-200 hover:scale-105">
                    Search
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {loading ? (
                    <div className="col-span-2 text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">Loading students...</p>
                    </div>
                  ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((person, index) => (
                      <div key={person._id} className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                        <div className="flex items-center mb-4">
                          {person.profilePicture ? (
                            <img 
                              src={person.profilePicture} 
                              alt={person.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                            />
                          ) : (
                            <div className={`w-16 h-16 bg-gradient-to-r ${getGradient(index)} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                              {getInitials(person.name)}
                            </div>
                          )}
                          <div className="ml-4 flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{person.name}</h3>
                            <p className="text-blue-600 dark:text-blue-400 font-medium">{person.branch || 'Student'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enrollment: {person.enrollmentId || 'Not specified'}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{person.yearOfJoining} - {person.yearOfPassing}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link 
                            to={`/student-profile-view/${person._id}`}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 text-sm font-medium text-center shadow-md transform transition-all duration-200 hover:scale-105"
                          >
                            View Profile
                          </Link>
                          <button 
                            className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-sm font-medium border-2 border-blue-200 dark:border-blue-800 shadow-sm transform transition-all duration-200 hover:scale-105"
                          >
                            Mentor
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No students found matching your search.' : 'No students available for mentorship at the moment.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <Link to="/mentor-students" className="group relative bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 transform overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative text-center">
                    <div className="text-3xl mb-2">👨🏫</div>
                    <p className="text-sm font-medium text-white">Mentor Students</p>
                  </div>
                </Link>
                
                <Link to="/posts" className="group relative bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 transform overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative text-center">
                    <div className="text-3xl mb-2">📝</div>
                    <p className="text-sm font-medium text-white">View Posts</p>
                  </div>
                </Link>
                
                <button className="group relative bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 transform overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative text-center">
                    <div className="text-3xl mb-2">💼</div>
                    <p className="text-sm font-medium text-white">Post Jobs</p>
                  </div>
                </button>
                
                <button className="group relative bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 transform overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <p className="text-sm font-medium text-white">View Analytics</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Events Calendar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <Calendar className="mr-2" size={20} />
                    Events Calendar
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-100 min-w-[120px] text-center">
                      {formatMonthYear(currentMonth)}
                    </span>
                    <button
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {/* Calendar Grid */}
                <div className="mb-4">
                  {/* Days of week */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar dates */}
                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const daysInMonth = getDaysInMonth(currentMonth);
                      const firstDay = getFirstDayOfMonth(currentMonth);
                      const days = [];
                      
                      // Empty cells for days before the first day of the month
                      for (let i = 0; i < firstDay; i++) {
                        days.push(
                          <div key={`empty-${i}`} className="h-8 w-8"></div>
                        );
                      }
                      
                      // Days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const hasEvent = getEventsForDate(day);
                        const isTodayDate = isToday(currentMonth, day);
                        
                        const handleDateClick = (event) => {
                          event.stopPropagation();
                          const rect = event.target.getBoundingClientRect();
                          setPopupPosition({
                            top: rect.bottom + window.scrollY + 5,
                            left: rect.left + window.scrollX - 100
                          });
                          setSelectedDate(day);
                          setShowEventPopup(true);
                        };
                        
                        days.push(
                          <div
                            key={day}
                            onClick={handleDateClick}
                            className={`
                              h-8 w-8 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all duration-200 relative
                              ${
                                isTodayDate
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-md transform scale-110'
                                  : hasEvent
                                  ? 'bg-emerald-200 dark:bg-emerald-700 text-emerald-900 dark:text-emerald-100 font-medium hover:bg-emerald-300 dark:hover:bg-emerald-600 shadow-sm border border-emerald-400 dark:border-emerald-500'
                                  : 'text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                              }
                            `}
                          >
                            {day}
                            {hasEvent && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        );
                      }
                      
                      return days;
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Messages */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Messages</h2>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">💬</div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No Messages Yet</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Start mentoring students to see your conversations here.</p>
                  <Link 
                    to="/mentor-students" 
                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
                  >
                    Mentor Students
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Popup */}
      {showEventPopup && (
        <div>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowEventPopup(false)}
          ></div>
          <div 
            className="absolute z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 p-4 w-80 transform transition-all duration-200 scale-100"
            style={{ top: popupPosition.top, left: popupPosition.left }}
          >
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatMonthYear(currentMonth).split(' ')[0]} {selectedDate}, {currentMonth.getFullYear()}
              </h3>
            </div>
            
            {(() => {
              const event = getEventsForDate(selectedDate);
              
              if (event) {
                const eventTypeColors = {
                  networking: 'from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-500 dark:border-blue-400',
                  workshop: 'from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-500 dark:border-green-400',
                  default: 'from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-500 dark:border-purple-400'
                };
                
                const colorClass = eventTypeColors[event.type] || eventTypeColors.default;
                
                return (
                  <div className="space-y-3">
                    <div className={`p-4 bg-gradient-to-r ${colorClass} rounded-lg border-l-4 shadow-sm`}>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2">{event.title}</h4>
                      <div className="space-y-2 text-xs text-gray-700 dark:text-gray-200">
                        <div className="flex items-center">
                          <span className="mr-2">🕐</span>
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">📍</span>
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">🏷️</span>
                          <span className="capitalize">{event.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm hover:from-blue-700 hover:to-purple-700 shadow-sm transform transition-all duration-200 hover:scale-105">
                        Host Event
                      </button>
                      <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                        Share
                      </button>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-3">📅</div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">No Events Today</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">No events scheduled for this date.</p>
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs hover:from-blue-700 hover:to-purple-700 shadow-sm transform transition-all duration-200 hover:scale-105">
                      Create Event
                    </button>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniDashboard;