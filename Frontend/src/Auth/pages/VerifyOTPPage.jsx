import React from 'react';
import { Link } from 'react-router-dom';
import OTPVerification from '../components/OTPVerification';

const VerifyOTPPage = () => {
  return (
    <div className="min-h-screen bg-base-200 pt-20">
      {/* Navigation */}
      <div className="navbar bg-base-100 shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl font-bold hover:bg-primary hover:text-white transition-all duration-300">
            🎓 Alumni Connect
          </Link>
        </div>
        <div className="navbar-end space-x-2">
          <Link to="/login" className="btn btn-outline btn-primary font-semibold hover:scale-105 transition-all duration-300">
            Login
          </Link>
          <Link to="/signup" className="btn btn-primary font-semibold hover:scale-105 transition-all duration-300">
            Sign Up
          </Link>
          <Link to="/" className="btn btn-neutral font-semibold hover:bg-gray-700 hover:scale-105 transition-all duration-300">
            Back to Home
          </Link>
        </div>
      </div>

      <OTPVerification />
    </div>
  );
};

export default VerifyOTPPage;
