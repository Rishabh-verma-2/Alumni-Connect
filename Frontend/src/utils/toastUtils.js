import toast from 'react-hot-toast';

/**
 * Enhanced Toast Utility Functions
 * Provides consistent styling and behavior for toast notifications across the application
 */

export const toastUtils = {
  // Success notifications
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: 4000,
      style: {
        background: '#10B981',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
      },
      icon: '🎉',
      ...options
    });
  },

  // Error notifications
  error: (message, options = {}) => {
    return toast.error(message, {
      duration: 5000,
      style: {
        background: '#EF4444',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
      },
      icon: '❌',
      ...options
    });
  },

  // Warning notifications
  warning: (message, options = {}) => {
    return toast(message, {
      duration: 4000,
      style: {
        background: '#F59E0B',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
      },
      icon: '⚠️',
      ...options
    });
  },

  // Info notifications
  info: (message, options = {}) => {
    return toast(message, {
      duration: 3000,
      style: {
        background: '#3B82F6',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
      },
      icon: 'ℹ️',
      ...options
    });
  },

  // Loading notifications
  loading: (message, options = {}) => {
    return toast.loading(message, {
      style: {
        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
      },
      ...options
    });
  },

  // Feature preview notifications (following memory pattern)
  featurePreview: (featureName, type = 'info') => {
    const configs = {
      voice: {
        message: `🎤 ${featureName} - Voice call feature preview`,
        style: { background: '#3B82F6', color: 'white' }
      },
      video: {
        message: `📹 ${featureName} - Video call feature preview`,
        style: { background: '#7C3AED', color: 'white' }
      },
      info: {
        message: `✨ ${featureName} - Feature preview`,
        style: { background: '#3B82F6', color: 'white' }
      }
    };

    const config = configs[type] || configs.info;
    
    return toast(config.message, {
      duration: 3000,
      style: {
        ...config.style,
        borderRadius: '12px',
        padding: '12px 16px',
        fontWeight: '500',
      }
    });
  },

  // Navigation notifications
  navigation: (destination, options = {}) => {
    return toast(`🚀 Navigating to ${destination}...`, {
      duration: 2000,
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(102, 126, 234, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
      },
      ...options
    });
  },

  // Copy to clipboard notifications
  copied: (item = 'Content') => {
    return toast.success(`📋 ${item} copied to clipboard!`, {
      duration: 2000,
      style: {
        background: '#10B981',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
        fontWeight: '500',
      },
      icon: '✅',
    });
  },

  // Network/connection notifications
  network: {
    offline: () => toast.error('🔌 You are offline', {
      duration: 5000,
      style: {
        background: '#EF4444',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
      },
    }),
    
    online: () => toast.success('🌐 You are back online', {
      duration: 3000,
      style: {
        background: '#10B981',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
      },
    }),

    serverError: () => toast.error('🔌 Backend server not running. Please start the server.', {
      duration: 5000,
      style: {
        background: '#F59E0B',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
      },
    })
  },

  // Authentication notifications
  auth: {
    loginSuccess: () => toast.success('🎉 Login successful! Welcome back!', {
      duration: 4000,
      style: {
        background: '#10B981',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
        fontWeight: '500',
      },
      icon: '🚀',
    }),

    signupSuccess: () => toast.success('🎉 Signup successful! Redirecting to verification...', {
      duration: 4000,
      style: {
        background: '#10B981',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
        fontWeight: '500',
      },
      icon: '✉️',
    }),

    logoutSuccess: () => toast.success('👋 Logged out successfully!', {
      duration: 3000,
      style: {
        background: '#10B981',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
      },
    }),

    invalidCredentials: () => toast.error('🔒 Invalid password. Please try again.', {
      style: {
        background: '#EF4444',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
      },
      icon: '⛔',
    }),

    userNotFound: () => toast.error('👤 User not found. Please check your email or sign up first.', {
      style: {
        background: '#EF4444',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
      },
      icon: '❓',
    }),

    verificationRequired: () => toast.error('✉️ Please verify your account first.', {
      style: {
        background: '#F59E0B',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
      },
      icon: '⚠️',
    })
  },

  // Custom gradient notifications
  gradient: (message, gradient = 'blue-purple', options = {}) => {
    const gradients = {
      'blue-purple': 'linear-gradient(135deg, #3B82F6, #7C3AED)',
      'green-blue': 'linear-gradient(135deg, #10B981, #3B82F6)',
      'purple-pink': 'linear-gradient(135deg, #7C3AED, #EC4899)',
      'orange-red': 'linear-gradient(135deg, #F59E0B, #EF4444)',
      'cyan-blue': 'linear-gradient(135deg, #06B6D4, #3B82F6)'
    };

    return toast(message, {
      duration: 3000,
      style: {
        background: gradients[gradient] || gradients['blue-purple'],
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
      },
      ...options
    });
  },

  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
  }
};

export default toastUtils;