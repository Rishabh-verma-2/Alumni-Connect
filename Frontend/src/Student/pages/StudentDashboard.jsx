import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, Briefcase, Calendar, Bell, Search,
  MessageCircle, TrendingUp, Settings, ArrowUp, ArrowRight,
  Zap, Award, Code, Globe, Cpu, ChevronRight, ChevronLeft, BarChart3
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import NotificationDropdown from '../components/NotificationDropdown';
import Typewriter from 'typewriter-effect';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { studentAPI, alumniAPI, notificationAPI } from '../../api/api';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { isSidebarCollapsed, setSidebarCollapsed } = useSidebar() || { isSidebarCollapsed: false, setSidebarCollapsed: () => { } };

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  const [statsPeriod, setStatsPeriod] = useState('week');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [alumni, setAlumni] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectingIds, setConnectingIds] = useState(new Set());

  // --- Data Fetching ---
  const fetchStudentProfile = useCallback(async () => {
    if (!user?._id) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await studentAPI.getProfile(user._id, token);
      console.log('DEBUG: Fetched Profile:', response.data);
      // API typically returns { status: 'success', data: { ...profile } }
      setStudentProfile(response.data?.data || response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn('Profile not found (new user), using basic info.');
      } else {
        console.error('Error fetching profile:', error);
      }
    }
  }, [user]);

  const fetchAlumni = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) { setAlumni([]); return; }
      const response = await alumniAPI.getAllAlumni(token);
      setAlumni(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching alumni:', error);
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConnections = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { setConnections([]); return; }
      const response = await notificationAPI.getConnections(token);
      setConnections(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setConnections([]);
    }
  }, []);

  useEffect(() => {
    fetchStudentProfile();
    fetchAlumni();
    fetchConnections();
  }, [fetchStudentProfile, fetchAlumni, fetchConnections]);

  // --- Handlers ---
  const handleConnect = async (person) => {
    if (connectingIds.has(person._id)) return;
    try {
      setConnectingIds(prev => new Set([...prev, person._id]));
      const token = localStorage.getItem('token');
      await notificationAPI.sendConnectionRequest(person.userId, token);
      toast.success('Request sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to connect');
    } finally {
      setConnectingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(person._id);
        return newSet;
      });
    }
  };

  const handleRemoveConnection = async (alumniUserId) => {
    try {
      const token = localStorage.getItem('token');
      await notificationAPI.removeConnection(alumniUserId, token);
      setConnections(connections.filter(conn => conn._id !== alumniUserId));
      toast.success('Removed');
    } catch (error) {
      toast.error('Failed');
    }
  };

  const isConnected = (id) => connections.some(c => c._id === id);

  // --- Derived Values ---
  // Robust data sourcing for Hero Card
  const displayName = studentProfile?.user?.name || studentProfile?.name || user?.name || user?.username || 'Student';
  const displayId = studentProfile?.enrollmentId || user?.enrollmentId || 'ID: 240501';
  const displayImage = studentProfile?.profilePicture || user?.profilePicture;

  const filteredAlumni = (Array.isArray(alumni) ? alumni : []).filter(person => {
    const term = (searchTerm || '').toLowerCase();
    const name = (person.name || '').toLowerCase();
    const company = (person.currentCompany || '').toLowerCase();
    return name.includes(term) || company.includes(term);
  }).slice(0, 5);

  const getInitials = (name) => {
    const parts = (name || 'Student').trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Calendar Logic
  const goToPreviousMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-800 font-sans selection:bg-purple-500/30 selection:text-purple-900">

      {/* TECH GRID BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      ></div>

      {/* Ambient Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[80px]" />
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-[80px]" />
      </div>

      <Sidebar />

      <div className={`relative z-10 flex-1 p-4 sm:p-6 lg:p-6 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 text-sm">Overview of your activity</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
              <Search size={16} className="text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Universal search..."
                className="bg-transparent border-none text-sm focus:outline-none w-48 text-slate-700 placeholder:text-slate-400"
              />
              <div className="text-xs text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded ml-2">⌘K</div>
            </div>
            <NotificationDropdown />
            <Link to="/settings" className="p-2.5 bg-white border border-slate-200 rounded-full hover:border-purple-300 hover:text-purple-600 transition-colors shadow-sm text-slate-400">
              <Settings size={20} />
            </Link>
          </div>
        </div>

        {/* NEW HERO: Vibrant Tech Card */}
        <div className="relative rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-purple-500/20 group hover:shadow-purple-500/40 transition-shadow duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 animate-gradient-x"></div>

          {/* Decorative Mesh Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-20 w-40 h-40 bg-blue-500/30 rounded-full blur-2xl animate-float-delayed"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

          <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-medium mb-3 backdrop-blur-sm">
                <Zap size={10} className="text-yellow-300" />
                <span>Version 2.0 Live</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                Level Up Your <br />
                <span className="text-yellow-200">
                  <Typewriter
                    options={{
                      strings: ['Career Network', 'Tech Skills', 'Future Opportunities'],
                      autoStart: true,
                      loop: true,
                      deleteSpeed: 50,
                      delay: 80,
                    }}
                  />
                </span>
              </h2>

              <p className="text-purple-100 text-sm md:text-base mb-6 max-w-sm leading-relaxed border-l-2 border-purple-400/50 pl-4">
                Connect with over 5,000 alumni. Find mentors, get referrals, and unlock your potential in the tech world.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/browse-alumni" className="px-6 py-3 bg-white text-purple-700 font-bold text-sm rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 group/btn">
                  Explore Network <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
                <Link to="/profile" className="px-6 py-3 bg-purple-800/40 text-white font-bold text-sm rounded-xl border border-white/10 hover:bg-purple-800/60 backdrop-blur-md transition-all hover:border-white/30">
                  Update Profile
                </Link>
              </div>
            </div>

            {/* 3D-ish Floating Element */}
            <div className="hidden md:block relative perspective-1000 w-80 h-64 flex items-center justify-center">
              {/* Orbiting Icons Container */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Icon 1 - Orbiting Clockwise */}
                <div className="absolute" style={{ animation: 'orbit 15s linear infinite' }}>
                  <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-2xl shadow-xl">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                </div>

                {/* Icon 2 - Orbiting Clockwise (delayed) */}
                <div className="absolute" style={{ animation: 'orbit 15s linear infinite', animationDelay: '-5s' }}>
                  <div className="bg-gradient-to-br from-pink-400 to-pink-600 p-3 rounded-2xl shadow-xl">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                </div>

                {/* Icon 3 - Orbiting Counter-clockwise */}
                <div className="absolute" style={{ animation: 'orbit-reverse 12s linear infinite' }}>
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-3 rounded-2xl shadow-xl">
                    <Award size={20} className="text-white" />
                  </div>
                </div>

                {/* Icon 4 - Orbiting Clockwise (slower) */}
                <div className="absolute" style={{ animation: 'orbit 18s linear infinite', animationDelay: '-8s' }}>
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-2xl shadow-xl">
                    <Code size={20} className="text-white" />
                  </div>
                </div>

                {/* Icon 5 - Orbiting Counter-clockwise (faster) */}
                <div className="absolute" style={{ animation: 'orbit-reverse 10s linear infinite', animationDelay: '-3s' }}>
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-2xl shadow-xl">
                    <Briefcase size={20} className="text-white" />
                  </div>
                </div>

                {/* Icon 6 - Orbiting Clockwise (medium speed) */}
                <div className="absolute" style={{ animation: 'orbit 13s linear infinite', animationDelay: '-10s' }}>
                  <div className="bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-2xl shadow-xl">
                    <Zap size={20} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Main Profile Card */}
              <div className="w-72 relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 transform rotate-6 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500 ease-out shadow-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-purple-500/20 z-10">
                <div className="w-24 h-24 rounded-full bg-white/20 p-1.5 mb-4 shadow-inner relative">
                  {displayImage ? (
                    <img src={displayImage} alt="Profile" className="w-full h-full rounded-full object-cover border-2 border-white/50" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-3xl shadow-inner">
                      {getInitials(displayName)}
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-purple-600 rounded-full"></div>
                </div>

                <div>
                  <h3 className="text-white font-bold text-xl tracking-wide mb-1 shadow-black/10 drop-shadow-md">
                    {displayName}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-purple-100 text-xs font-mono bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                      {displayId}
                    </span>
                    <span className="text-xs font-bold bg-gradient-to-r from-amber-300 to-orange-400 text-white px-2 py-0.5 rounded-md shadow-sm">PRO</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BENTO STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Total Connections', value: '1,204', sub: '+12 this week', icon: Users, grad: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20' },
            { label: 'Unread Messages', value: '5', sub: '2 from recruiters', icon: MessageCircle, grad: 'from-fuchsia-500 to-pink-500', shadow: 'shadow-fuchsia-500/20' },
            { label: 'Upcoming Events', value: '3', sub: 'Next: Tech Talk', icon: Calendar, grad: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/20' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-[1.5rem] p-5 shadow-xl shadow-slate-200/60 border border-slate-100 hover:transform hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${stat.grad} text-white shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={20} />
                </div>
                <div className="bg-slate-50 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400">
                  {i === 1 ? 'NEW' : 'AVG'}
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800 mb-0.5 tracking-tight">{stat.value}</h3>
                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                <p className="text-xs font-bold text-emerald-500 mt-1.5 flex items-center gap-1">
                  <ArrowUp size={12} /> {stat.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN LAYOUT: Modern Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: Feed (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* ALUMNI SPOTLIGHT */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-2xl"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Award size={20} className="text-yellow-300" />
                  <h3 className="text-xl font-bold">Alumni Spotlight</h3>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-3xl font-bold shadow-lg">
                    {alumni.length > 0 ? getInitials(alumni[0].name) : 'AL'}
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-2xl font-black mb-1">{alumni.length > 0 ? alumni[0].name : 'Amazing Alumni'}</h4>
                    <p className="text-purple-100 font-medium mb-3">
                      {alumni.length > 0 ? `${alumni[0].currentDesignation} at ${alumni[0].currentCompany}` : 'Senior Engineer at Tech Corp'}
                    </p>
                    <p className="text-sm text-white/90 italic bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      "Never stop learning. The tech industry rewards curiosity and persistence more than anything else."
                    </p>
                  </div>

                  {alumni.length > 0 && (
                    <button
                      onClick={() => handleConnect(alumni[0])}
                      className="px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:scale-105 transition-transform shadow-lg"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* DAILY QUESTION */}
            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl">
                  <Zap size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Daily Question</h3>
                  <p className="text-xs text-slate-400">Share your thoughts with the community</p>
                </div>
              </div>

              <p className="text-slate-700 font-medium mb-4">What tech stack are you learning right now?</p>

              <div className="grid grid-cols-2 gap-3">
                {['React & Next.js', 'Python & AI', 'Mobile Dev', 'DevOps'].map((option, i) => (
                  <button
                    key={i}
                    className="p-3 rounded-xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50 transition-all text-sm font-medium text-slate-700"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* MENTOR MATCH CARD */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={20} className="text-emerald-200" />
                  <h3 className="text-lg font-bold">Mentor Match</h3>
                </div>

                <p className="text-emerald-100 text-sm mb-4">Based on your skills and interests</p>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                      {alumni.length > 1 ? getInitials(alumni[1]?.name || alumni[0]?.name) : 'SM'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{alumni.length > 1 ? alumni[1]?.name || alumni[0]?.name : 'Sarah Miller'}</h4>
                      <p className="text-emerald-100 text-sm">
                        {alumni.length > 1 ? alumni[1]?.currentDesignation || 'Senior Engineer' : 'Senior React Developer'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">React</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">TypeScript</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">Node.js</span>
                  </div>

                  <p className="text-white/90 text-sm italic">
                    "Since you're learning React, I'd love to help guide your journey!"
                  </p>
                </div>

                {alumni.length > 1 && (
                  <button
                    onClick={() => handleConnect(alumni[1] || alumni[0])}
                    className="w-full py-3 bg-white text-emerald-600 font-bold rounded-xl hover:scale-105 transition-transform shadow-lg"
                  >
                    Request Mentorship
                  </button>
                )}
              </div>
            </div>

            {/* COMMUNITY FEED */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Community Feed</h3>
                  <p className="text-slate-400 text-sm">Latest activity from your network</p>
                </div>
                <Link to="/browse-alumni" className="text-sm font-bold text-purple-600 hover:text-purple-700 hover:underline">See All</Link>
              </div>

              {/* Search Bar */}
              <div className="relative group mb-8">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-white rounded-xl leading-none">
                  <Search className="absolute left-4 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-4 pl-12 pr-4 bg-transparent text-slate-800 font-medium placeholder:text-slate-300 focus:outline-none rounded-xl"
                    placeholder="Search by name, company, or role..."
                  />
                </div>
              </div>

              {/* Alumni Cards */}
              <div className="space-y-4">
                {loading ? (
                  <div className="h-20 bg-slate-100 rounded-xl animate-pulse"></div>
                ) : filteredAlumni.length > 0 ? (
                  filteredAlumni.map((person) => (
                    <div key={person._id} className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-purple-100 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 cursor-default">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-400 overflow-hidden transform group-hover:rotate-3 transition-transform">
                          {getInitials(person.name)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full border border-white"></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-base">{person.name}</h4>
                        <p className="text-sm font-medium text-purple-600">{person.currentDesignation || 'Alumni'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{person.currentCompany || 'N/A'}</span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs text-slate-400">{person.branch}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleConnect(person)}
                        disabled={connectingIds.has(person._id)}
                        className={`
                                 h-10 w-10 flex items-center justify-center rounded-xl transition-all
                                 ${connectingIds.has(person._id)
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-slate-50 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm hover:shadow-indigo-500/30'}
                              `}
                      >
                        {connectingIds.has(person._id) ? <Zap size={20} className="animate-pulse" /> : <ArrowRight size={20} />}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400">No matches found.</div>
                )}
              </div>
            </div>

            {/* JOBS SECTION */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
              {/* Dark Card decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>

              <div className="relative z-10 flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold">Recommended Jobs</h3>
                  <p className="text-slate-400 text-sm">Curated for {user?.role || 'students'}</p>
                </div>
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                  <Briefcase size={20} className="text-emerald-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { role: 'React Developer', company: 'Google', salary: '$5k/mo', tag: 'Remote' },
                  { role: 'UI/UX Designer', company: 'Airbnb', salary: '$4k/mo', tag: 'Hybrid' }
                ].map((job, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <div className="bg-white/20 p-2 rounded-lg text-lg font-bold">
                        {job.company[0]}
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase">{job.tag}</span>
                    </div>
                    <h4 className="font-bold text-lg mb-0.5">{job.role}</h4>
                    <p className="text-sm text-slate-400 mb-3">{job.company}</p>
                    <div className="text-sm font-medium text-white">{job.salary}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COL: Tools & Calendar */}
          <div className="space-y-8">

            {/* CAREER PATH VISUALIZER */}
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={20} className="text-cyan-200" />
                  <h3 className="text-lg font-bold">Where Alumni Work</h3>
                </div>

                <p className="text-cyan-100 text-xs mb-4">Top companies from your branch</p>

                <div className="space-y-3">
                  {[
                    { company: 'Google', percentage: 35, color: 'bg-yellow-400' },
                    { company: 'Microsoft', percentage: 25, color: 'bg-green-400' },
                    { company: 'Amazon', percentage: 20, color: 'bg-orange-400' },
                    { company: 'Startups', percentage: 20, color: 'bg-purple-400' }
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{item.company}</span>
                        <span className="text-xs font-bold">{item.percentage}%</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-500`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium text-sm backdrop-blur-sm transition-all border border-white/20">
                  View Full Report
                </button>
              </div>
            </div>

            {/* Quick Actions (Floating Grid) */}
            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Access</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Mentors', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
                  { name: 'Events', icon: Calendar, color: 'text-pink-600', bg: 'bg-pink-50', link: '/events' },
                  { name: 'Learning', icon: BookOpen, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                  { name: 'Coding', icon: Code, color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((item, i) => (
                  <Link to={item.link || '#'} key={i} className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all hover:scale-105 ${item.bg}`}>
                    <item.icon size={26} className={`${item.color} mb-2`} />
                    <span className="text-xs font-bold text-slate-700">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tech Calendar */}
            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Calendar</h3>
                <div className="flex gap-2">
                  <button onClick={goToPreviousMonth} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft size={18} /></button>
                  <button onClick={goToNextMonth} className="p-1 hover:bg-slate-100 rounded-full"><ChevronRight size={18} /></button>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-black text-slate-800 block">
                  {currentMonth.getDate()}
                </span>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide py-2">
                {[...Array(7)].map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const isActive = i === 0;
                  return (
                    <div key={i} className={`flex-shrink-0 w-12 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 ${isActive ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/40' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                      <span className="text-[10px] font-bold uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}</span>
                      <span className={`text-lg font-bold ${isActive ? 'text-white' : 'text-slate-800'}`}>{date.getDate()}</span>
                      {i === 2 && <div className="w-1 h-1 bg-red-500 rounded-full"></div>}
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 space-y-3">
                <div className="p-3 bg-purple-50 rounded-xl border-l-4 border-purple-500 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-purple-900">Tech Talk: AI Agents</p>
                    <p className="text-[10px] font-medium text-purple-600">10:00 AM • Auditorium</p>
                  </div>
                  <span className="text-xs font-bold bg-white text-purple-600 px-2 py-1 rounded-md">TODAY</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
