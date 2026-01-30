import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../Shared/components/Navbar';
import Footer from '../../Shared/components/Footer';
import ContactSupport from '../../Shared/components/ContactSupport';
import FeatureModal from '../../Shared/components/FeatureModal';
import {
  ChevronDown, Zap, TrendingUp, Users, Globe, Star, Award,
  ArrowRight, Play, CheckCircle, MessageCircle, Briefcase,
  Calendar, Shield, BarChart2, Rocket, Code, Terminal, Quote,
  GraduationCap, UserPlus, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = () => {
  const [counters, setCounters] = useState({ alumni: 0, mentorship: 0, countries: 0, placements: 0 });
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const observerRef = useRef();

  // Testimonials data - Real names and roles
  const testimonials = [
    {
      name: "Aditya Verma",
      role: "Senior SDE at Amazon",
      company: "Amazon",
      icon: <Terminal className="w-8 h-8 text-orange-500" />,
      quote: "Alumni Connect bridged the gap between my college days and professional life. Finding a mentor here was a turning point.",
      rating: 5
    },
    {
      name: "Sneha Reddy",
      role: "Product Manager at Swiggy",
      company: "Swiggy",
      icon: <Briefcase className="w-8 h-8 text-orange-500" />,
      quote: "The job portal is fantastic! It's not just about applying; it's about getting referred by alumni who know your college value.",
      rating: 5
    },
    {
      name: "Rohan Mehta",
      role: "Founder",
      company: "AgriTech Solutions",
      icon: <Rocket className="w-8 h-8 text-orange-500" />,
      quote: "I found my co-founder through this network. The alumni events are goldmines for networking.",
      rating: 5
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Feature highlights
  const features = [
    {
      icon: <Shield className="w-10 h-10" />,
      title: "Trusted Network",
      description: "Every member is verified via university email, ensuring a safe and authentic community.",
      color: "from-blue-500 to-blue-700"
    },
    {
      icon: <MessageCircle className="w-10 h-10" />,
      title: "Direct Messaging",
      description: "Connect instantly with mentors and peers. No more cold emailing strangers.",
      color: "from-orange-400 to-orange-600"
    },
    {
      icon: <Briefcase className="w-10 h-10" />,
      title: "Exclusive Jobs",
      description: "Access job openings posted specifically for alumni, with internal referral opportunities.",
      color: "from-blue-600 to-indigo-700"
    },
    {
      icon: <Calendar className="w-10 h-10" />,
      title: "Events & Reunions",
      description: "Never miss a meetup. Register for webinars, reunions, and workshops with one click.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Mentorship",
      description: "Find a mentor who walked your path. Get guidance on career validation and growth.",
      color: "from-indigo-500 to-purple-600"
    },
    {
      icon: <BarChart2 className="w-10 h-10" />,
      title: "Career Insights",
      description: "Data-driven insights on salary trends, skills in demand, and industry shifts.",
      color: "from-slate-700 to-slate-900"
    }
  ];

  // Handle mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Intersection Observer
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id || entry.target.dataset.section;
          if (sectionId) {
            setVisibleSections(prev => new Set([...prev, sectionId]));
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section, index) => {
      if (!section.id) section.dataset.section = `section-${index}`;
      observerRef.current.observe(section);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  // Counter animation
  useEffect(() => {
    const targets = { alumni: 12500, mentorship: 850, countries: 24, placements: 450 };
    const duration = 2500;
    const steps = 60;
    const stepTime = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out

      setCounters({
        alumni: Math.floor(targets.alumni * ease),
        mentorship: Math.floor(targets.mentorship * ease),
        countries: Math.floor(targets.countries * ease),
        placements: Math.floor(targets.placements * ease)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounters(targets);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Typing animation
  useEffect(() => {
    const timer = setTimeout(() => setIsTyping(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="font-sans antialiased text-slate-800 bg-slate-50 overflow-x-hidden selection:bg-orange-200">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section id="top" className="relative min-h-[92vh] flex items-center pt-20 overflow-hidden bg-slate-900">
        {/* Background Gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-900/20 blur-3xl animate-pulse"></div>
          <div className="absolute top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-orange-900/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.15), transparent 25%)`
            }}
          />
        </div>

        <div className="container mx-auto px-4 z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-fade-in-up">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              <span className="text-slate-300 text-sm font-medium">The #1 Alumni Network Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Connect. <br />
              <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                Network. Grow.
              </span>
            </h1>

            <p className={`text-xl text-slate-400 max-w-lg transition-all duration-1000 ${isTyping ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
              Bridge the gap between campus and career. Join a thriving community of alumni and students shaping the future together.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="group relative px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] flex items-center justify-center gap-2">
                Join the Network
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/about" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl backdrop-blur-sm transition-all hover:scale-105 flex items-center justify-center">
                <Play className="w-5 h-5 mr-2 fill-white" />
                Watch Demo
              </Link>
            </div>

            <div className="flex items-center gap-4 text-slate-400 text-sm pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p>Trusted by <span className="text-white font-bold">10,000+</span> alumni</p>
            </div>
          </div>

          {/* Right Visual - Glassmorphism Card */}
          {/* Right Visual - Glassmorphism Card */}
          <div className="relative perspective-1000">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-orange-600 rounded-[2rem] blur-2xl opacity-20 animate-pulse"></div>

            {/* Main Floating Card */}
            <div
              className="relative bg-slate-900/40 border border-white/10 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl transform transition-transform duration-300 hover:scale-[1.01] animate-float"
              style={{
                transform: `rotateY(${(mousePosition.x - 50) * 0.05}deg) rotateX(${-(mousePosition.y - 50) * 0.05}deg)`,
                animation: 'float 6s ease-in-out infinite'
              }}
            >
              {/* Mock Interface */}
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <img src="/logo_v2.png" alt="Logo" className="w-10 h-10 rounded-[20%] bg-white/10 p-1 object-contain" />
                  <div>
                    <div className="h-2 w-24 bg-slate-700 rounded mb-2"></div>
                    <div className="h-2 w-16 bg-slate-800 rounded"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Chat Bubble 1 */}
                <div className="flex gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg ring-2 ring-indigo-500/30">JD</div>
                  <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none w-3/4 backdrop-blur-sm">
                    <p className="text-slate-200 text-sm">Hey! I noticed you are working at Google. Any openings for freshers?</p>
                  </div>
                </div>

                {/* Chat Bubble 2 (Reply) */}
                <div className="flex gap-4 flex-row-reverse animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                  <img src="https://i.pravatar.cc/100?img=5" className="w-10 h-10 rounded-full border-2 border-slate-700 shadow-lg" alt="Alumni" />
                  <div className="bg-blue-600/90 p-4 rounded-2xl rounded-tr-none w-3/4 shadow-lg shadow-blue-900/20 relative">
                    <p className="text-white text-sm">Hi! Yes, we have openings in the Cloud team. Send me your resume, I'll refer you! 🚀</p>
                    {/* Live Typing Indicator */}
                    <div className="absolute -bottom-6 right-0 flex gap-1 bg-white/5 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </div>

                {/* Job Card Mock */}
                <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-white/10 animate-fade-in-up shadow-xl" style={{ animationDelay: '1.5s' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-medium flex items-center gap-2">
                        Senior Software Engineer
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      </h4>
                      <p className="text-slate-400 text-xs mt-1">Microsoft • Hyderabad</p>
                    </div>
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20">Active</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/5">Full-time</span>
                    <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/5">Remote</span>
                  </div>
                </div>
              </div>

              {/* Floating Orbit Elements */}
              {/* React Icon */}
              <div className="absolute -left-12 top-1/4 bg-slate-800 p-3 rounded-2xl shadow-xl border border-white/10 animate-model-float" style={{ animationDuration: '5s' }}>
                <Code className="w-6 h-6 text-blue-400" />
              </div>

              {/* Users Icon */}
              <div className="absolute -right-6 bottom-1/3 bg-white p-3 rounded-2xl shadow-xl animate-model-float-reverse" style={{ animationDuration: '6s' }}>
                <Users className="w-6 h-6 text-orange-500" />
              </div>

              {/* Briefcase Icon */}
              <div className="absolute -left-4 bottom-10 bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-600/30 animate-bounce" style={{ animationDuration: '4s' }}>
                <Briefcase className="w-5 h-5 text-white" />
              </div>

              {/* Award Icon */}
              <div className="absolute right-10 -top-8 bg-slate-800 p-2 rounded-xl border border-orange-500/30 shadow-lg animate-pulse">
                <Award className="w-6 h-6 text-orange-400" />
              </div>

              {/* Decorative Ring */}
              <div className="absolute inset-0 border-2 border-white/5 rounded-[2.5rem] -z-10 scale-110 animate-pulse"></div>
            </div>

            {/* CSS for custom float animations */}
            <style jsx>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(1deg); }
              }
              @keyframes model-float {
                0%, 100% { transform: translateY(0px) translateX(0px); }
                25% { transform: translateY(-10px) translateX(5px); }
                50% { transform: translateY(0px) translateX(10px); }
                75% { transform: translateY(10px) translateX(5px); }
              }
              @keyframes model-float-reverse {
                0%, 100% { transform: translateY(0px) translateX(0px); }
                25% { transform: translateY(10px) translateX(-5px); }
                50% { transform: translateY(0px) translateX(-10px); }
                75% { transform: translateY(-10px) translateX(-5px); }
              }
              .animate-float {
                animation: float 6s ease-in-out infinite;
              }
              .animate-model-float {
                animation: model-float 8s ease-in-out infinite;
              }
              .animate-model-float-reverse {
                animation: model-float-reverse 9s ease-in-out infinite;
              }
              @keyframes marquee {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 30s linear infinite;
              }
            `}</style>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-slate-500">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-10 bg-white relative" data-animate>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Community Members", value: counters.alumni, icon: <Users />, color: "text-blue-600" },
              { label: "Mentorship Sessions", value: counters.mentorship, icon: <Zap />, color: "text-orange-500" },
              { label: "Partner Companies", value: counters.placements, icon: <Briefcase />, color: "text-indigo-600" },
              { label: "Global Presence", value: counters.countries, icon: <Globe />, color: "text-green-500" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center group p-6 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-slate-100 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <h3 className="text-4xl font-bold text-slate-900 mb-2">{stat.value.toLocaleString()}+</h3>
                <p className="text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TOP COMPANIES MARQUEE --- */}
      <section className="py-12 bg-white border-y border-slate-100 overflow-hidden">
        <div className="container mx-auto px-4 mb-10 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Trusted by alumni at top companies</p>
        </div>
        <div className="relative flex overflow-x-hidden group">
          <motion.div
            className="flex items-center min-w-full"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              ease: "linear",
              duration: 25,
              repeat: Infinity
            }}
          >
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                {[
                  { name: 'Google', url: 'google.com' },
                  { name: 'Facebook', url: 'facebook.com' },
                  { name: 'Pinterest', url: 'pinterest.com' },
                  { name: 'Webflow', url: 'webflow.com' },
                  { name: 'YouTube', url: 'youtube.com' },
                  { name: 'Twitch', url: 'twitch.tv' },
                  { name: 'Microsoft', url: 'microsoft.com' },
                  { name: 'Spotify', url: 'spotify.com' }
                ].map((company, idx) => (
                  <div key={`${i}-${idx}`} className="mx-12 flex items-center justify-center min-w-[120px] filter grayscale-0 hover:grayscale transition-all duration-300">
                    <img
                      src={`https://logo.clearbit.com/${company.url}`}
                      alt={company.name}
                      className="h-8 md:h-10 w-auto object-contain"
                      onError={(e) => {
                        // Fallback 1: Try Google Favicon (high res)
                        const fallbackUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${company.url}&size=128`;
                        if (e.target.src !== fallbackUrl) {
                          e.target.src = fallbackUrl;
                        } else {
                          // Fallback 2: Show text if both image sources fail
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }
                      }}
                    />
                    <span className="hidden text-xl font-bold text-slate-600">{company.name}</span>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </motion.div>

          {/* Gradient Fade Edges */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="pt-16 pb-0 bg-slate-50" id="features" data-animate>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest text-orange-600 uppercase mb-4">Why Alumni Connect?</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Empowering your professional journey</h3>
            <p className="text-lg text-slate-600">Everything you need to advance your career and stay connected with your alma mater.</p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
                }}
                whileHover={{ y: -5 }}
                onClick={() => { setSelectedFeature(feature); setIsFeatureModalOpen(true); }}
                className="group relative bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border border-slate-100 cursor-pointer overflow-hidden"
              >
                {/* Hover Gradient Border Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} style={{ padding: '2px' }}>
                  <div className="absolute inset-0 bg-white rounded-[2rem]"></div>
                </div>

                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                    {feature.icon}
                  </div>

                  <h4 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h4>
                  <p className="text-slate-500 leading-relaxed mb-6">{feature.description}</p>

                  <div className="flex items-center text-blue-600 font-bold group-hover:translate-x-2 transition-transform">
                    Learn more <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>

                {/* Decorative Background Blob */}
                <div className={`absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- HOW IT WORKS: ANIMATED TECH VERSION --- */}
      <section className="pt-8 pb-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-xs font-bold tracking-[0.2em] text-blue-600 uppercase mb-4">Streamlined Process</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Your Journey to Success</h3>
            <p className="text-lg text-slate-500">Four simple steps to unlock your professional potential.</p>
          </motion.div>

          <div className="relative">
            {/* Animated Connector Line Container */}
            <div className="hidden md:block absolute top-[100px] left-[12%] right-[12%] h-0.5 z-0 bg-slate-100/50">
              {/* Filling Progress Line */}
              <motion.div
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 via-orange-500 to-green-500"
              ></motion.div>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.3
                  }
                }
              }}
            >
              {[
                { title: "Register", desc: "Sign up with your university email", icon: <UserPlus />, color: "bg-blue-600", delay: 0 },
                { title: "Verify", desc: "We confirm your alumni status", icon: <Shield />, color: "bg-orange-500", delay: 0.2 },
                { title: "Connect", desc: "Find mentors and peers", icon: <MessageCircle />, color: "bg-indigo-600", delay: 0.4 },
                { title: "Grow", desc: "Accelerate your career", icon: <Rocket />, color: "bg-green-500", delay: 0.6 }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                  }}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  className="relative group"
                >
                  {/* Techy Card */}
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl group-hover:shadow-2xl transition-all duration-300 relative overflow-hidden">

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Step Number Watermark */}
                    <div className="absolute -right-4 -top-4 text-9xl font-black text-slate-50 z-0 group-hover:text-slate-100 transition-colors select-none">
                      {i + 1}
                    </div>

                    <div className="relative z-10 text-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-20 h-20 mx-auto rounded-2xl ${step.color} text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20 ring-4 ring-white relative`}
                      >
                        {/* Pulse behind icon */}
                        <div className={`absolute inset-0 rounded-2xl ${step.color} opacity-40 animate-ping`}></div>
                        <div className="relative z-10">
                          {React.cloneElement(step.icon, { size: 32 })}
                        </div>
                      </motion.div>

                      <h4 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{step.title}</h4>
                      <p className="text-slate-500 leading-relaxed text-sm">{step.desc}</p>
                    </div>
                  </div>

                  {/* Connecting Node Dot (Desktop only) */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 1 + (i * 0.3), type: "spring" }}
                    className="hidden md:block absolute top-[68px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-4 border-slate-200 rounded-full z-20"
                    style={{ borderColor: i === 3 ? '#22c55e' : i === 2 ? '#4f46e5' : i === 1 ? '#f97316' : '#2563eb' }}
                  ></motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      {/* --- TESTIMONIALS --- */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative" data-animate>
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left Column: Testimonial Carousel */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-4">
                  <Star className="w-4 h-4 fill-orange-400" />
                  <span>Success Stories</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  Real Stories from our <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
                    Alumni Network
                  </span>
                </h2>
              </motion.div>

              <div className="relative min-h-[300px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTestimonial}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl relative"
                  >
                    <div className="absolute -top-6 -left-6 bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-900/50">
                      <Quote className="w-8 h-8 text-white fill-current" />
                    </div>

                    <p className="text-xl md:text-2xl leading-relaxed text-slate-200 mb-8 font-light italic">
                      "{testimonials[activeTestimonial].quote}"
                    </p>

                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 p-1 ring-2 ring-orange-500/50">
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                          {testimonials[activeTestimonial].icon}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xl font-bold text-white">{testimonials[activeTestimonial].name}</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-orange-400 font-medium">{testimonials[activeTestimonial].role}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400">{testimonials[activeTestimonial].company}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Dots */}
              <div className="flex gap-3 mt-8 ml-4">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${activeTestimonial === idx ? 'w-12 bg-orange-500' : 'w-2 bg-slate-700 hover:bg-slate-600'
                      }`}
                    aria-label={`View testimonial ${idx + 1}`}
                  ></button>
                ))}
              </div>
            </div>

            {/* Right Column: Live Activity Feed */}
            <div className="relative hidden lg:block perspective-1000">
              <motion.div
                initial={{ opacity: 0, rotateY: 30, x: 50 }}
                whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/90 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl shadow-black/50"
              >
                {/* Floating Elements */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl rotate-12 flex items-center justify-center shadow-lg animate-float">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>

                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-white">Live Activity</h3>
                    <p className="text-sm text-slate-400">Real-time network updates</p>
                  </div>
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    LIVE
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { name: "Rahul Sharma", action: "started a new job at", target: "Tesla", time: "2m ago", icon: <Rocket className="w-4 h-4" />, color: "from-red-500 to-pink-600" },
                    { name: "Priya Patel", action: "mentored", target: "2 students", time: "15m ago", icon: <Users className="w-4 h-4" />, color: "from-blue-500 to-cyan-500" },
                    { name: "Amit Kumar", action: "posted a job:", target: "Senior Dev", time: "1h ago", icon: <Briefcase className="w-4 h-4" />, color: "from-purple-500 to-indigo-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors border border-white/5 group">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <div className="text-white">
                          {item.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 truncate">
                          <span className="font-bold text-white">{item.name}</span> {item.action} <span className="text-orange-400 font-medium">{item.target}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" /> {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <Link to="/signup" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 group">
                    View all activity <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section id="contact" className="py-24 bg-white text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/20 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl"></div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to expand your network?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto relative z-10">Join thousands of alumni who are accelerating their careers and giving back to their community.</p>

            <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="px-10 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-orange-50 transition-colors shadow-lg">
                Get Started for Free
              </Link>
              <Link to="/login" className="px-10 py-4 bg-blue-700 border border-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors">
                Member Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- MODALS --- */}
      <FeatureModal
        isOpen={isFeatureModalOpen}
        onClose={() => setIsFeatureModalOpen(false)}
        feature={selectedFeature}
      />

      <ContactSupport
        isOpen={false} // Managed by state in real app
        onClose={() => { }}
      />

      <Footer />
    </div>
  );
};

export default LandingPage;
