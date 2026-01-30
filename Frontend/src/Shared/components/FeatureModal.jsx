import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FeatureModal = ({ isOpen, onClose, feature }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);

    setTimeout(() => {
      onClose();
      navigate('/signup');
      setIsLoading(false);
    }, 1500);
  };

  if (!feature) return null;

  const featureDetails = {
    "Trusted Network": {
      benefits: [
        "University email verification system",
        "Two-factor authentication",
        "Encrypted data transmission",
        "Privacy-first approach",
        "Verified alumni badges"
      ],
      description: "Our robust verification system ensures that every connection you make is authentic and trustworthy. We use university email verification and advanced security measures to maintain the integrity of our alumni network.",
      stats: "99.9% verified profiles"
    },
    // ... mapped to match titles in LandingPage.jsx accurately
    "Direct Messaging": {
      benefits: [
        "Instant messaging with alumni",
        "Group chat functionality",
        "File and document sharing",
        "Video call integration",
        "Mobile notifications"
      ],
      description: "Connect instantly with alumni mentors and peers through our advanced messaging system. Share experiences, ask questions, and build meaningful relationships in real-time.",
      stats: "10K+ active conversations daily"
    },
    "Exclusive Jobs": {
      benefits: [
        "Exclusive alumni job postings",
        "Industry-specific opportunities",
        "Internship programs",
        "Referral system",
        "Career guidance sessions"
      ],
      description: "Access exclusive job opportunities shared by alumni in top companies. Get insider referrals and career guidance to accelerate your professional growth.",
      stats: "500+ job postings monthly"
    },
    "Events & Reunions": {
      benefits: [
        "Virtual networking events",
        "Industry-specific meetups",
        "Alumni reunions",
        "Professional workshops",
        "Career fairs"
      ],
      description: "Join exclusive networking events, workshops, and alumni meetups. Build connections and expand your professional network through structured events.",
      stats: "50+ events monthly"
    },
    "Mentorship": {
      benefits: [
        "One-on-one mentorship",
        "Career path guidance",
        "Skill development plans",
        "Mock interviews",
        "Networking opportunities"
      ],
      description: "Find a mentor who walked your path. Get guidance on career validation, skill development, and professional growth from experienced alumni.",
      stats: "1200+ active mentorships"
    },
    "Career Insights": {
      benefits: [
        "Salary trend analysis",
        "Skill demand reports",
        "Industry growth metrics",
        "Company reviews",
        "Market insights"
      ],
      description: "Data-driven insights on salary trends, skills in demand, and industry shifts to help you make informed career decisions.",
      stats: "Real-time market data"
    }
  };

  // Fallback if title doesn't match exactly, though ideally it should
  const currentFeature = featureDetails[feature.title] || {
    benefits: ["Feature benefits loading..."],
    description: feature.description,
    stats: "Available soon"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-200">
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-5 rounded-t-2xl`}></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{feature.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{currentFeature.stats}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">About This Feature</h4>
                <p className="text-gray-600 leading-relaxed">{currentFeature.description}</p>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Key Benefits</h4>
                <div className="space-y-3">
                  {currentFeature.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div className={`bg-gradient-to-r ${feature.color} rounded-xl p-6 shadow-lg text-white`}>
                <h4 className="text-lg font-bold mb-2">Ready to Get Started?</h4>
                <p className="text-blue-50 mb-6 max-w-lg">Join thousands of alumni already using this feature to advance their careers.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleGetStarted}
                    disabled={isLoading}
                    className="flex-1 bg-white text-slate-900 py-3 px-6 rounded-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center space-x-2 font-bold shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Redirecting...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Started</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 border border-white/30 text-white py-3 px-6 rounded-lg hover:bg-white/10 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Learn More Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FeatureModal;