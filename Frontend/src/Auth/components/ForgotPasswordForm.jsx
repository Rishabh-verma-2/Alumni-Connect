import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Mail } from 'lucide-react';
import { authAPI } from '../../api/api';

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    if (email.length > 254) return 'Email is too long';
    return '';
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError(validateEmail(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    setLoading(true);
    
    try {
      await authAPI.forgotPassword({ email });
      toast.success('Password reset code sent to your email!');
      
      // Navigate to reset password page with email
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-l-[3rem] rounded-r-[3rem] p-8 shadow-2xl">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
          <Mail className="text-white" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
        <p className="text-white/80 text-sm">
          No worries! Enter your email and we'll send you a reset code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            value={email}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {error && (
            <p className="text-red-300 text-sm mt-1">{error}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !!error}
          className="btn btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Sending Code...
            </>
          ) : (
            'Send Reset Code'
          )}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;