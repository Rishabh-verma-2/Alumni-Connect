import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Mail, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';
import Navbar from '../../Shared/components/Navbar';
import { authAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const email = location.state?.email || user?.email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [activeInput, setActiveInput] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!email && !user) {
      navigate('/signup');
    }
  }, [email, user, navigate]);

  // Mouse parallax effect
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

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    // Handle paste event or long input
    if (value.length > 1) {
      const pastedData = value.split('').slice(0, 6);
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedData.length, 5);
      setActiveInput(nextIndex);
      document.getElementById(`otp-${nextIndex}`)?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      setActiveInput(index + 1);
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setActiveInput(index - 1);
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      setActiveInput(index - 1);
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      setActiveInput(index + 1);
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit code', {
        style: { background: '#1e293b', color: '#fff', border: '1px solid #ef4444' }
      });
      return;
    }

    setLoading(true);

    try {
      await authAPI.verifyOTP({ email, otp: otpString });

      if (user) {
        const updatedUser = { ...user, isVerified: true };
        updateUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      toast.success('Account verified successfully!', {
        style: { background: '#1e293b', color: '#fff', border: '1px solid #10b981' }
      });

      setTimeout(() => {
        const dashboardRoute = user?.role === 'alumni' ? '/alumni-dashboard' : '/student-dashboard';
        navigate(dashboardRoute);
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed. Try again.', {
        style: { background: '#1e293b', color: '#fff', border: '1px solid #ef4444' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      await authAPI.resendOTP({ email });
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
      setActiveInput(0);
      toast.success('New code sent!', {
        style: { background: '#1e293b', color: '#fff', border: '1px solid #3b82f6' }
      });
    } catch (error) {
      toast.error('Failed to resend code', {
        style: { background: '#1e293b', color: '#fff', border: '1px solid #ef4444' }
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <Navbar hideSignup={true} />

      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dynamic background based on mouse position */}
        <div
          className="absolute inset-0 opacity-40 transition-opacity duration-1000"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)`
          }}
        ></div>

        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse mix-blend-screen" style={{ animationDuration: '7s' }}></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-20 relative z-10">
        <div className="w-full max-w-md">

          {/* Brand/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20 mb-6">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Check your email</h1>
            <p className="text-slate-400">
              We've sent a 6-digit verification code to <br />
              <span className="text-white font-medium">{email}</span>
            </p>
          </div>

          {/* Card Container */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/50 ring-1 ring-white/5">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* OTP Inputs */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4 text-center">Enter Verification Code</label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onFocus={() => setActiveInput(index)}
                      className={`w-11 h-12 md:w-12 md:h-14 text-center text-xl font-bold rounded-xl border bg-slate-950/50 text-white placeholder-slate-700 transition-all duration-200 outline-none
                          ${activeInput === index
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-105'
                          : 'border-slate-800 hover:border-slate-700'
                        }
                          ${digit ? 'border-indigo-500/50 bg-indigo-900/10' : ''}
                        `}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300 transform hover:translate-y-[-1px] active:translate-y-[0px] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <span className="flex items-center gap-2">Verify Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                )}
              </button>

              {/* Resend Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  {resendLoading ? (
                    <RotateCcw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Mail className="w-3 h-3" />
                  )}
                  <span>Didn't receive code? Resend</span>
                </button>
              </div>

            </form>
          </div>

          {/* Footer Back Link */}
          <div className="text-center mt-8">
            <button onClick={() => navigate('/signup')} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Back to Signup
            </button>
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

export default OTPVerificationPage;
