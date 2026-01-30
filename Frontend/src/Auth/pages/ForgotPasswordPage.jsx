import React from 'react';
import { Link } from 'react-router-dom';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import Navbar from '../../Shared/components/Navbar';
import Footer from '../../Shared/components/Footer';

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 relative flex flex-col">
      {/* Navigation */}
      <Navbar hideSignup={false} />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-2xl animate-bounce" style={{animationDuration: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-xl animate-ping" style={{animationDuration: '4s'}}></div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 pt-20 pb-10 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Centered Header */}
          <div className="text-center mb-12 mt-3">
            <h1 className="text-4xl font-bold text-white mb-2 animate-pulse">
              Reset Password
            </h1>
            <p className="text-blue-100 text-lg">
              Enter your email to receive a password reset code
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ForgotPasswordForm />
              
              {/* Footer Links */}
              <div className="text-center mt-6 space-y-2">
                <p className="text-white/80">
                  Remember your password?{' '}
                  <Link to="/login" className="text-white font-semibold hover:underline">
                    Back to Login
                  </Link>
                </p>
                <p className="text-white/80">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-white font-semibold hover:underline">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
