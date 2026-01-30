import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import Navbar from '../../Shared/components/Navbar';
import Footer from '../../Shared/components/Footer';
import { Shield } from 'lucide-react';

const LoginPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  return (
    <div className="min-h-screen bg-slate-950 relative flex flex-col font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <Navbar hideSignup={false} />

      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dynamic background based on mouse position */}
        <div
          className="absolute inset-0 opacity-40 transition-opacity duration-1000"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)`
          }}
        ></div>

        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse mix-blend-screen" style={{ animationDuration: '7s' }}></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-20 relative z-10">
        <div className="w-full max-w-md">

          {/* Brand/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 mb-6">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-400">Sign in to access your alumni network</p>
          </div>

          {/* Card Container */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/50 ring-1 ring-white/5">
            <LoginForm />
          </div>

          {/* Footer Terms */}
          <div className="text-center mt-8">
            <p className="text-xs text-slate-500">
              By signing in, you agree to our{' '}
              <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              {' '}and{' '}
              <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            </p>
          </div>

        </div>
      </div>

      {/* Simple Footer */}
      <div className="py-6 text-center text-slate-600 text-sm relative z-10 border-t border-slate-900/50">
        © 2026 Alumni Connect. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;
