import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Eye, EyeOff, Mail, Lock, User, IdCard, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const SignupForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    enrollmentId: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.enrollmentId) newErrors.enrollmentId = 'Enrollment ID is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authAPI.signup(formData);
      if (response.data && response.data.status === 'success') {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          const user = response.data.data?.user;
          if (user) login(user, response.data.token);
        }
        toast.success('Account created! Verify OTP.', {
          style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
        });
        navigate('/verify-otp');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed', {
        style: { background: '#1e293b', color: '#fff', border: '1px solid #ef4444' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Full Name */}
      <div className="space-y-1">
        <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider pl-1">Full Name</label>
        <div className={`relative group transition-all duration-300 ${focusedField === 'username' ? 'scale-[1.01]' : ''}`}>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className={`h-5 w-5 transition-colors ${focusedField === 'username' ? 'text-emerald-500' : 'text-slate-500'}`} />
          </div>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
            className={`block w-full pl-11 pr-4 py-3 bg-slate-950/50 border rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300 ${errors.username ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
              }`}
            placeholder="John Doe"
          />
        </div>
        {errors.username && <p className="text-red-400 text-xs pl-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.username}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider pl-1">Email</label>
        <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className={`h-5 w-5 transition-colors ${focusedField === 'email' ? 'text-emerald-500' : 'text-slate-500'}`} />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            className={`block w-full pl-11 pr-4 py-3 bg-slate-950/50 border rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300 ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
              }`}
            placeholder="name@university.edu"
          />
        </div>
        {errors.email && <p className="text-red-400 text-xs pl-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider pl-1">Password</label>
        <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className={`h-5 w-5 transition-colors ${focusedField === 'password' ? 'text-emerald-500' : 'text-slate-500'}`} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            className={`block w-full pl-11 pr-11 py-3 bg-slate-950/50 border rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300 ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
              }`}
            placeholder="Min. 6 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs pl-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.password}</p>}
      </div>

      {/* Enrollment ID */}
      <div className="space-y-1">
        <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider pl-1">Enrollment ID</label>
        <div className={`relative group transition-all duration-300 ${focusedField === 'enrollmentId' ? 'scale-[1.01]' : ''}`}>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <IdCard className={`h-5 w-5 transition-colors ${focusedField === 'enrollmentId' ? 'text-emerald-500' : 'text-slate-500'}`} />
          </div>
          <input
            type="text"
            name="enrollmentId"
            value={formData.enrollmentId}
            onChange={handleChange}
            onFocus={() => setFocusedField('enrollmentId')}
            onBlur={() => setFocusedField(null)}
            className={`block w-full pl-11 pr-4 py-3 bg-slate-950/50 border rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300 ${errors.enrollmentId ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-emerald-500'
              }`}
            placeholder="University ID"
          />
        </div>
        {errors.enrollmentId && <p className="text-red-400 text-xs pl-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.enrollmentId}</p>}
      </div>

      {/* Info Note */}
      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50 flex gap-2 items-start">
        <AlertCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
        <p className="text-slate-400 text-xs">Role (Student/Alumni) is assigned automatically based on your ID.</p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="group w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 transform hover:translate-y-[-1px] active:translate-y-[0px] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="animate-spin h-5 w-5" />
        ) : (
          <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
        )}
      </button>

      {/* Login Link */}
      <div className="text-center pt-2">
        <p className="text-slate-400 text-sm">
          Existing user?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
};

export default SignupForm;