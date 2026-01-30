import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, Briefcase, Calendar, Bell, Search,
  MessageCircle, TrendingUp, Settings, ArrowUp, ArrowRight,
  Zap, Award, Code, Globe, Cpu, ChevronRight, ChevronLeft, BarChart3,
  UserCheck, Star, PartyPopper, CheckCircle, Target, Crown
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import NotificationDropdown from '../components/NotificationDropdown';
import Typewriter from 'typewriter-effect';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { studentAPI, alumniAPI, notificationAPI } from '../../api/api';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { isSidebarCollapsed, setSidebarCollapsed } = useSidebar() || { isSidebarCollapsed: false, setSidebarCollapsed: () => { } };

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  const [statsPeriod, setStatsPeriod] = useState('week');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('week'); // 'week' or 'month'
  const [events, setEvents] = useState([
    { id: 1, title: 'Tech Talk: AI Agents', time: '10:00 AM', location: 'Auditorium', date: new Date(), category: 'tech' },
    { id: 2, title: 'Career Fair', time: '9:00 AM', location: 'Main Hall', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), category: 'career' },
    { id: 3, title: 'Coding Workshop', time: '2:00 PM', location: 'Lab 301', date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), category: 'academic' }
  ]);

  const [alumni, setAlumni] = useState([]);
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectingIds, setConnectingIds] = useState(new Set());
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const dailyQuestion = {
    question: "What tech stack are you learning right now?",
    options: ['React & Next.js', 'Python & AI', 'Mobile Dev', 'DevOps']
  };

  const [jobs] = useState([
    { id: 1, role: 'React Developer', company: 'Google', location: 'Remote', salary: '$5-7k/mo', tag: 'Remote', skills: ['React', 'TypeScript', 'Node.js'], match: 92, saved: false },
    { id: 2, role: 'UI/UX Designer', company: 'Airbnb', location: 'San Francisco', salary: '$4-6k/mo', tag: 'Hybrid', skills: ['Figma', 'Design Systems'], match: 78, saved: true },
    { id: 3, role: 'Full Stack Developer', company: 'Microsoft', location: 'Remote', salary: '$6-8k/mo', tag: 'Remote', skills: ['React', 'Python', 'Azure'], match: 85, saved: false },
    { id: 4, role: 'Frontend Engineer', company: 'Meta', location: 'New York', salary: '$5-7k/mo', tag: 'Hybrid', skills: ['React', 'GraphQL'], match: 88, saved: false }
  ]);

  const [badges] = useState([
    { id: 1, name: 'First Connection', icon: UserCheck, color: 'text-blue-400', unlocked: true, progress: 100, description: 'Made your first connection' },
    { id: 2, name: 'Active Networker', icon: Star, color: 'text-yellow-400', unlocked: connections.length >= 5, progress: Math.min((connections.length / 5) * 100, 100), description: 'Connect with 5 alumni' },
    { id: 3, name: 'Event Enthusiast', icon: PartyPopper, color: 'text-pink-400', unlocked: false, progress: 33, description: 'Attend 3 events' },
    { id: 4, name: 'Profile Complete', icon: CheckCircle, color: 'text-green-400', unlocked: true, progress: 100, description: 'Complete your profile' },
    { id: 5, name: 'Job Hunter', icon: Briefcase, color: 'text-orange-400', unlocked: false, progress: 60, description: 'Apply to 5 jobs' },
    { id: 6, name: 'Community Leader', icon: Crown, color: 'text-purple-400', unlocked: false, progress: 20, description: 'Get 10 connections' }
  ]);

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
  const goToPreviousDay = () => setSelectedDate(prev => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
  const goToNextDay = () => setSelectedDate(prev => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
  const goToPreviousMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const handleDayClick = (date) => setSelectedDate(date);

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

        {/* STATS ROW - Now with 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Stats Cards */}
          {[
            { label: 'Total Connections', value: connections.length || '0', sub: `${connections.length > 0 ? '+' + connections.length : 'No'} connections`, icon: Users, grad: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20', link: '/browse-alumni' },
            { label: 'Unread Messages', value: messages.length || '0', sub: messages.length > 0 ? `${messages.length} new` : 'No new messages', icon: MessageCircle, grad: 'from-fuchsia-500 to-pink-500', shadow: 'shadow-fuchsia-500/20', link: '/messages' },
            { label: 'Upcoming Events', value: events.length || '0', sub: events.length > 0 ? `Next: ${events[0]?.title}` : 'No events', icon: Calendar, grad: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/20', link: '/events' },
          ].map((stat, i) => (
            <Link key={i} to={stat.link} className="bg-white rounded-[1.5rem] p-5 shadow-xl shadow-slate-200/60 border border-slate-100 hover:transform hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
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
            </Link>
          ))}

          {/* Daily Question Card - Clickable */}
          <button
            onClick={() => setShowQuestionModal(true)}
            className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-[1.5rem] p-5 shadow-xl shadow-orange-200/60 border border-orange-100 hover:transform hover:-translate-y-1 transition-all duration-300 group cursor-pointer text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg">
                  <Zap size={20} />
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-white">
                  DAILY
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-1 tracking-tight">Quick Poll</h3>
                <p className="text-sm font-medium text-white/90">Daily Question</p>
                <p className="text-xs font-bold text-white/80 mt-2 line-clamp-2">
                  {dailyQuestion.question}
                </p>
                <p className="text-xs font-bold text-white mt-2 flex items-center gap-1">
                  <span>Tap to answer</span> →
                </p>
              </div>
            </div>
          </button>
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
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-lg">
                    {alumni.length > 0 && alumni[0].profilePicture ? (
                      <img
                        src={alumni[0].profilePicture}
                        alt={alumni[0].name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold">
                        {alumni.length > 0 ? getInitials(alumni[0].name) : 'AL'}
                      </span>
                    )}
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
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-400 transform group-hover:rotate-3 transition-transform">
                          {person.profilePicture ? (
                            <img
                              src={person.profilePicture}
                              alt={person.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getInitials(person.name)
                          )}
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

            {/* ENHANCED JOBS SECTION */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold">Recommended Jobs</h3>
                    <p className="text-slate-400 text-sm">Based on your skills & interests</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-md transition-colors">
                      <Briefcase size={18} className="text-emerald-400" />
                    </button>
                    <Link to="/jobs" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors">
                      View All
                    </Link>
                  </div>
                </div>

                <div className="space-y-3">
                  {jobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-3">
                          <div className="bg-white/20 p-3 rounded-xl text-xl font-bold flex-shrink-0">
                            {job.company[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg mb-1">{job.role}</h4>
                            <p className="text-sm text-slate-400">{job.company} • {job.location}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full uppercase">
                            {job.tag}
                          </span>
                          <div className={`text-xs font-bold px-2 py-1 rounded-full ${job.match >= 85 ? 'bg-green-500/20 text-green-400' :
                            job.match >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                            {job.match}% Match
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.skills.map((skill, i) => (
                          <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded-md">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold text-white">{job.salary}</div>
                        <div className="flex gap-2">
                          <button className={`p-2 rounded-lg transition-all ${job.saved ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-slate-400 hover:bg-white/20'
                            }`}>
                            <svg className="w-4 h-4" fill={job.saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>
                          <button className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-bold hover:scale-105 transition-transform">
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ACHIEVEMENTS & BADGES - ENHANCED */}
            <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 rounded-[2rem] p-8 text-white relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                {/* Header with Stats */}
                <div className="mb-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-yellow-400/20 rounded-xl">
                          <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-black">Achievements</h3>
                      </div>
                      <p className="text-purple-200 text-sm">Level up your profile & earn rewards</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30">
                      <div className="text-2xl font-black text-yellow-300">{badges.filter(b => b.unlocked).length}</div>
                      <div className="text-xs font-bold text-purple-100">/{badges.length} Badges</div>
                    </div>
                  </div>

                  {/* Overall Progress Bar */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold">Overall Progress</span>
                      <span className="text-sm font-bold text-yellow-300">{Math.round((badges.filter(b => b.unlocked).length / badges.length) * 100)}%</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-full transition-all duration-1000 shadow-lg shadow-yellow-500/50"
                        style={{ width: `${(badges.filter(b => b.unlocked).length / badges.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Badges Grid */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-purple-200 mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-yellow-400 rounded-full"></span>
                    Your Badges
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {badges.map((badge) => (
                      <div
                        key={badge.id}
                        className={`relative group cursor-pointer transition-all duration-300 ${badge.unlocked
                          ? 'hover:scale-110'
                          : 'opacity-60 hover:opacity-80'
                          }`}
                      >
                        <div className={`bg-white/10 backdrop-blur-md rounded-2xl p-5 border-2 transition-all ${badge.unlocked
                          ? 'border-yellow-400/50 shadow-lg shadow-yellow-500/20'
                          : 'border-white/20'
                          }`}>
                          {/* Badge Icon */}
                          <div className="relative mb-3">
                            <div className={`flex items-center justify-center mb-2 transition-transform ${badge.unlocked ? 'group-hover:scale-125 group-hover:rotate-12' : 'opacity-50'
                              }`}>
                              <badge.icon
                                size={48}
                                className={`${badge.unlocked ? badge.color : 'text-purple-300'} transition-colors`}
                                strokeWidth={2}
                              />
                            </div>
                            {badge.unlocked && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Badge Name */}
                          <p className={`text-xs font-bold mb-2 line-clamp-2 ${badge.unlocked ? 'text-white' : 'text-purple-200'
                            }`}>
                            {badge.name}
                          </p>

                          {/* Progress Bar for Locked Badges */}
                          {!badge.unlocked && (
                            <div>
                              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-1">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
                                  style={{ width: `${badge.progress}%` }}
                                ></div>
                              </div>
                              <p className="text-[9px] text-purple-200">{Math.round(badge.progress)}% complete</p>
                            </div>
                          )}

                          {badge.unlocked && (
                            <p className="text-[9px] text-yellow-300 font-bold">✓ Unlocked</p>
                          )}
                        </div>

                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                          {badge.description}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-2xl">
                        <Target size={32} className="text-yellow-300" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-bold mb-1">Keep Building Your Profile!</p>
                        <p className="text-xs text-purple-200">Connect, attend events, and unlock more badges</p>
                      </div>
                    </div>
                    <button className="px-5 py-2.5 bg-white text-purple-600 rounded-xl font-bold text-sm hover:scale-105 transition-transform shadow-lg">
                      View All
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COL: Calendar First, Then Tools */}
          <div className="space-y-8">

            {/* FUNCTIONAL CALENDAR */}
            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Calendar</h3>
                <div className="flex gap-2">
                  <button onClick={calendarView === 'week' ? goToPreviousDay : goToPreviousMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={calendarView === 'week' ? goToNextDay : goToNextMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block">
                  {calendarView === 'week'
                    ? selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              {/* View Toggle */}
              <div className="bg-slate-100 rounded-lg p-1 flex gap-1 mb-4">
                <button
                  onClick={() => setCalendarView('week')}
                  className={`flex-1 px-3 py-1.5 text-xs font-bold rounded transition-all ${calendarView === 'week' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  Week
                </button>
                <button
                  onClick={() => setCalendarView('month')}
                  className={`flex-1 px-3 py-1.5 text-xs font-bold rounded transition-all ${calendarView === 'month' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  Month
                </button>
              </div>

              {calendarView === 'week' ? (
                // Week View - Full Week Starting from Sunday
                <div className="grid grid-cols-7 gap-1.5 py-2">
                  {[...Array(7)].map((_, i) => {
                    const date = new Date(selectedDate);
                    date.setDate(selectedDate.getDate() - selectedDate.getDay() + i);
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const dayEvents = events.filter(e => e.date.toDateString() === date.toDateString());
                    return (
                      <button
                        key={i}
                        onClick={() => handleDayClick(date)}
                        className={`rounded-2xl flex flex-col items-center justify-center gap-1 py-3 transition-all ${isSelected ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/40' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'}`}
                      >
                        <span className="text-[10px] font-bold uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}</span>
                        <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>{date.getDate()}</span>
                        {dayEvents.length > 0 && <div className="w-1 h-1 bg-blue-500 rounded-full"></div>}
                      </button>
                    )
                  })}
                </div>
              ) : (
                // Month Grid View - Clickable Days
                <div>
                  <div className="grid grid-cols-7 gap-2 mb-3">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <div key={day} className="text-center text-xs font-bold text-slate-400">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {[...Array(getDaysInMonth(currentMonth) + getFirstDayOfMonth(currentMonth))].map((_, i) => {
                      const dayNumber = i - getFirstDayOfMonth(currentMonth) + 1;
                      const isValidDay = dayNumber > 0 && dayNumber <= getDaysInMonth(currentMonth);
                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
                      const isSelected = isValidDay && date.toDateString() === selectedDate.toDateString();
                      const dayEvents = isValidDay ? events.filter(e => e.date.toDateString() === date.toDateString()) : [];

                      return (
                        <button
                          key={i}
                          onClick={() => isValidDay && handleDayClick(date)}
                          disabled={!isValidDay}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all ${isValidDay
                            ? isSelected
                              ? 'bg-slate-900 text-white font-bold shadow-lg'
                              : 'hover:bg-slate-100 cursor-pointer text-slate-700'
                            : 'cursor-default'
                            }`}
                        >
                          {isValidDay && (
                            <>
                              <span className="mb-0.5">{dayNumber}</span>
                              {dayEvents.length > 0 && <div className="w-1 h-1 bg-blue-500 rounded-full"></div>}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upcoming Events for Selected Date */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-slate-700">
                    {selectedDate.toDateString() === new Date().toDateString()
                      ? "Today's Events"
                      : `Events on ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </h4>
                  <button className="text-xs font-bold text-purple-600 hover:text-purple-700">+ Add</button>
                </div>
                <div className="space-y-2">
                  {events.filter(e => e.date.toDateString() === selectedDate.toDateString()).map((event) => {
                    const categoryColors = {
                      tech: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-900', subtext: 'text-purple-600' },
                      career: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-900', subtext: 'text-green-600' },
                      academic: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-900', subtext: 'text-blue-600' },
                      social: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-900', subtext: 'text-orange-600' }
                    };
                    const colors = categoryColors[event.category] || categoryColors.tech;

                    return (
                      <div key={event.id} className={`p-3 ${colors.bg} rounded-xl border-l-4 ${colors.border} flex justify-between items-center hover:scale-[1.02] transition-transform cursor-pointer`}>
                        <div>
                          <p className={`text-xs font-bold ${colors.text}`}>{event.title}</p>
                          <p className={`text-[10px] font-medium ${colors.subtext}`}>{event.time} • {event.location}</p>
                        </div>
                      </div>
                    );
                  })}
                  {events.filter(e => e.date.toDateString() === selectedDate.toDateString()).length === 0 && (
                    <div className="text-center py-6 text-slate-400">
                      <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No events scheduled</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

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


          </div>
        </div>
      </div>

      {/* DAILY QUESTION MODAL */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowQuestionModal(false)}>
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl">
                  <Zap size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Daily Question</h3>
                  <p className="text-sm text-slate-400">Share your thoughts</p>
                </div>
              </div>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Question */}
            <div className="mb-6">
              <p className="text-lg font-semibold text-slate-700 mb-1">{dailyQuestion.question}</p>
              <p className="text-xs text-slate-400">Pick the option that best describes you</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {dailyQuestion.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedAnswer(option)}
                  className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${selectedAnswer === option
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 text-slate-700'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={() => {
                if (selectedAnswer) {
                  toast.success(`You selected: ${selectedAnswer}`);
                  setShowQuestionModal(false);
                  setSelectedAnswer(null);
                }
              }}
              disabled={!selectedAnswer}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all ${selectedAnswer
                ? 'bg-gradient-to-br from-orange-400 to-pink-500 hover:scale-105 shadow-lg shadow-orange-500/30'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            >
              Submit Answer
            </button>

            <p className="text-xs text-slate-400 text-center mt-4">
              {selectedAnswer ? 'Click submit to save your answer' : 'Select an option to continue'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
