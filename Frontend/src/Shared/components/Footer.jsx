import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Linkedin, Twitter, Facebook, Instagram, Mail, Phone, MapPin, Send, Heart, Star, ArrowRight, CheckCircle } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSocialClick = (platform) => {
    toast(`🚀 Redirecting to ${platform}...`, {
      icon: '👋',
      style: {
        background: '#1e293b',
        color: '#fff',
        borderRadius: '10px',
      },
    });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      toast.success('Thanks for subscribing!', {
        style: {
          background: '#1e293b',
          color: '#fff',
        }
      });
      setEmail('');
    }
  };

  return (
    <footer className="relative bg-slate-950 text-slate-300 overflow-hidden pt-20 pb-10 border-t border-slate-800">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-900/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* 1. Brand Section (Cols 1-4) */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo_v2.png"
                alt="Logo"
                className="w-12 h-12 bg-white/5 p-1.5 rounded-[20%] object-contain border border-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/10"
              />
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">Alumni Connect</h3>
                <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Since 2025</p>
              </div>
            </Link>

            <p className="text-slate-400 leading-relaxed max-w-sm">
              Bridging the gap between campus and career. A premium network for alumni to mentor, hire, and inspire the next generation.
            </p>

            <div className="flex gap-3">
              {[
                { icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-[#0077b5]' },
                { icon: Twitter, label: 'Twitter', color: 'hover:bg-[#1da1f2]' },
                { icon: Instagram, label: 'Instagram', color: 'hover:bg-[#e1306c]' },
                { icon: Facebook, label: 'Facebook', color: 'hover:bg-[#1877f2]' }
              ].map((social, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSocialClick(social.label)}
                  className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 transition-all duration-300 hover:text-white hover:-translate-y-1 ${social.color} hover:border-transparent`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* 2. Platform Links (Cols 5-7) */}
          <div className="lg:col-span-3 lg:pl-8">
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-orange-500 rounded-full"></span>
              Platform
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'Home', to: '/' },
                { label: 'About Us', to: '/about' },
                { label: 'Find a Mentor', to: '/mentorship' },
                { label: 'Jobs & Internships', to: '/jobs' },
                { label: 'Events', to: '/events' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-2 text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Resources Links (Cols 8-10) */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-blue-500 rounded-full"></span>
              Resources
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'Help Center', to: '/help' },
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Terms of Service', to: '/terms' },
                { label: 'Success Stories', to: '/stories' },
                { label: 'Contact Support', to: '/contact' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-2 text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-orange-500 transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Newsletter (Cols 11-12) */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6">Stay Updated</h4>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <p className="text-sm text-slate-400 mb-4">Subscribe to our newsletter for the latest updates.</p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg px-4 py-3 transition-colors flex items-center justify-center gap-2"
                >
                  Subscribe <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; 2026 Alumni Connect. Made with <Heart className="w-4 h-4 inline text-red-500 mx-1 fill-current animate-pulse" /> in India.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="flex text-yellow-500">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <span>4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;