import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Users, Star, Zap, Home, BookOpen, Sparkles, Phone, Key, Rocket, LogIn } from 'lucide-react';

const Navbar = ({ hideSignup = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionClick = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        if (sectionId === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 100);
    } else {
      if (sectionId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  // Text color classes based on scroll state
  // Helper for link styles with glass highlight
  const getLinkClasses = (path) => {
    const isActive = location.pathname === path;
    const baseClasses = `relative px-4 ${isScrolled ? 'py-1.5' : 'py-2'} rounded-full text-sm font-medium transition-all duration-300`;

    if (isActive) {
      if (isScrolled) {
        // Active on Scrolled (Light) - Blue Glass
        return `${baseClasses} bg-blue-50 text-blue-600 shadow-sm border border-blue-100`;
      } else {
        // Active on Top (Dark) - White Glass
        return `${baseClasses} bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]`;
      }
    }

    // Inactive
    return `${baseClasses} ${isScrolled ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50' : 'text-slate-300 hover:text-white hover:bg-white/10'}`;
  };

  return (
    <div className={`fixed z-50 transition-all duration-500 ease-in-out left-1/2 -translate-x-1/2 ${isScrolled
      ? 'top-2 w-[95%] md:w-[90%] max-w-6xl rounded-full bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40'
      : 'top-0 w-full rounded-none bg-transparent border-b border-white/5 backdrop-blur-[2px]'
      }`}>
      <div className={`mx-auto px-6 ${isScrolled ? 'py-1.5' : 'py-4'}`}>
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="group flex items-center space-x-3 text-xl font-bold transition-colors duration-300"
            >
              <div className="relative">
                <img src="/logo_v2.png" alt="Alumni Connect Logo" className={`object-contain rounded-[20%] transition-all duration-300 ${isScrolled ? 'w-8 h-8' : 'w-12 h-12'}`} />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
              </div>
              <span className={`bg-clip-text text-transparent font-bold transition-all duration-300 ${isScrolled
                ? 'bg-gradient-to-r from-blue-800 to-orange-600 text-lg'
                : 'bg-gradient-to-r from-white to-orange-200 text-2xl'
                }`}>
                Alumni Connect
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <nav className={`flex items-center space-x-1 rounded-full px-2 py-1 transition-all duration-300 ${!isScrolled && 'bg-white/5 border border-white/10 backdrop-blur-sm'}`}>
              <button
                onClick={() => handleSectionClick('top')}
                type="button"
                className={getLinkClasses('/')}
              >
                Home
              </button>

              <Link
                to="/about"
                className={getLinkClasses('/about')}
              >
                About Us
              </Link>

              <button
                onClick={() => handleSectionClick('features')}
                className={getLinkClasses('/features')} // Using pseudo-path for styling consistency if needed, or default to inactive if not exact match
              >
                Features
              </button>

              {/* Dropdown Menu */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setTimeout(() => setIsDropdownOpen(false), 150);
                    }
                  }}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1 ${isScrolled ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50' : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <span>Community</span>
                  <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" />
                </button>

                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 p-2 rounded-2xl shadow-2xl border transition-all duration-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform group-hover:translate-y-0 translate-y-2 ${isScrolled ? 'bg-white border-slate-100' : 'bg-slate-900/90 backdrop-blur-xl border-white/10'
                  }`}>
                  <Link
                    to="/alumni-network"
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${isScrolled ? 'hover:bg-slate-50' : 'hover:bg-white/10'
                      }`}
                  >
                    <div className={`p-2 rounded-lg ${isScrolled ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400'}`}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`font-medium text-sm ${isScrolled ? 'text-slate-900' : 'text-white'}`}>Alumni Network</div>
                      <div className={`text-xs ${isScrolled ? 'text-slate-500' : 'text-slate-400'}`}>Connect with peers</div>
                    </div>
                  </Link>
                  <Link
                    to="/success-stories"
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${isScrolled ? 'hover:bg-slate-50' : 'hover:bg-white/10'
                      }`}
                  >
                    <div className={`p-2 rounded-lg ${isScrolled ? 'bg-green-100 text-green-600' : 'bg-green-500/20 text-green-400'}`}>
                      <Star className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`font-medium text-sm ${isScrolled ? 'text-slate-900' : 'text-white'}`}>Success Stories</div>
                      <div className={`text-xs ${isScrolled ? 'text-slate-500' : 'text-slate-400'}`}>Inspiring journeys</div>
                    </div>
                  </Link>
                </div>
              </div>

              <Link
                to="/contact"
                className={getLinkClasses('/contact')}
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Action Buttons - Right */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {location.pathname !== '/login' && (
              <Link
                to="/login"
                className={`hidden sm:inline-flex px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${isScrolled
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-white hover:bg-white/10'
                  }`}
              >
                Login
              </Link>
            )}

            {!hideSignup && (
              <Link
                to="/signup"
                className={`inline-flex items-center px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg ${isScrolled
                  ? 'bg-gradient-to-r from-blue-600 to-orange-600 text-white shadow-blue-500/20'
                  : 'bg-white text-blue-900 shadow-white/20'
                  }`}
              >
                <span>Get Started</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${isScrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
                }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 mt-2 mx-4 p-4 rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 animate-fade-in-up origin-top text-gray-800">
          <nav className="flex flex-col space-y-2">
            <button onClick={() => { handleSectionClick('top'); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">
              <Home className="w-5 h-5" /> <span>Home</span>
            </button>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">
              <BookOpen className="w-5 h-5" /> <span>About Us</span>
            </Link>
            <button onClick={() => { handleSectionClick('features'); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">
              <Sparkles className="w-5 h-5" /> <span>Features</span>
            </button>
            <button onClick={() => { handleSectionClick('contact'); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">
              <Phone className="w-5 h-5" /> <span>Contact</span>
            </button>
            <div className="h-px bg-slate-100 my-2"></div>
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">
              <Key className="w-5 h-5" /> <span>Login</span>
            </Link>
            <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-blue-600 text-white font-bold">
              <Rocket className="w-5 h-5" /> <span>Get Started</span>
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Navbar;