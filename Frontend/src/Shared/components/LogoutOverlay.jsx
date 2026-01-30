import React from 'react';
import { LogOut, Loader2 } from 'lucide-react';

const LogoutOverlay = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/60 via-blue-900/40 to-purple-900/40 backdrop-blur-md">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center max-w-sm mx-4 transform animate-fade-in-up">
        {/* Modern Spinner */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>
            {/* Inner rotating ring */}
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-pink-500 border-l-cyan-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <LogOut className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Signing Out
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
          Securing your session...
        </p>
        
        {/* Modern progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mb-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-progress"></div>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Thank you for using Alumni Connect
        </p>
      </div>
      
      <style jsx>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes progress {
          0% {
            width: 0%;
            transform: translateX(-100%);
          }
          50% {
            width: 70%;
            transform: translateX(0%);
          }
          100% {
            width: 100%;
            transform: translateX(0%);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out;
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LogoutOverlay;