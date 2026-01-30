import React, { useState } from 'react';
import { X, Send, MessageCircle, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactSupport = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields', {
        style: {
          background: '#EF4444',
          color: 'white',
          borderRadius: '12px',
          padding: '12px 16px',
        },
      });
      return;
    }

    const loadingToast = toast.loading('Sending your message...', {
      style: {
        background: '#3B82F6',
        color: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
      },
    });

    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success('🎉 Message sent successfully! We\'ll get back to you soon.', {
        duration: 4000,
        style: {
          background: '#10B981',
          color: 'white',
          borderRadius: '12px',
          padding: '12px 16px',
        },
      });
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'medium'
      });
      onClose();
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Contact Support</h3>
              <p className="text-sm text-gray-600">We're here to help you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Quick Contact Options */}
        <div className="p-6 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-4">Quick contact options:</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText('+91-2668-260089');
                toast.success('📞 Phone number copied!');
              }}
              className="flex items-center space-x-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Call Us</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText('support@alumniconnect.edu');
                toast.success('📧 Email copied!');
              }}
              className="flex items-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">Email Us</span>
            </button>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of your issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe your issue or question in detail..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
          >
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactSupport;