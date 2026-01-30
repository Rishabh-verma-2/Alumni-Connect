import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { authAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authAPI.login(formData);
      if (response.data && response.data.status === 'success' && response.data.token) {
        localStorage.setItem('token', response.data.token);
        const user = response.data.data?.user || response.data.data?.admin;
        if (user) login(user, response.data.token);

        toast.success('Welcome back!', {
          style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
        });

        setTimeout(() => {
          if (user?.role === 'admin') navigate('/admin-dashboard');
          else if (user?.role === 'alumni') navigate('/alumni-dashboard');
          else navigate('/student-dashboard');
        }, 100);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed', {
        style: { background: '#1e293b', color: '#fff', border: '1px solid #ef4444' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Email Field */}
      <div className="space-y-1.5">
        <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider pl-1">Email</label>
        <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className={`h-5 w-5 transition-colors ${focusedField === 'email' ? 'text-blue-500' : 'text-slate-500'}`} />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            className={`block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-300 ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-blue-500'
              }`}
            placeholder="name@university.edu"
          />
        </div>
        {errors.email && <p className="text-red-400 text-xs pl-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider pl-1">Password</label>
        <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className={`h-5 w-5 transition-colors ${focusedField === 'password' ? 'text-blue-500' : 'text-slate-500'}`} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            className={`block w-full pl-11 pr-11 py-3.5 bg-slate-950/50 border rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-300 ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-blue-500'
              }`}
            placeholder="Enter your password"
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

      {/* Forgot Password */}
      <div className="flex justify-end pt-1">
        <Link
          to="/forgot-password"
          className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="group w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 transform hover:translate-y-[-1px] active:translate-y-[0px] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="animate-spin h-5 w-5" />
        ) : (
          <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
        )}
      </button>

      {/* Signup Link */}
      <div className="text-center pt-2">
        <p className="text-slate-400 text-sm">
          New here?{' '}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;