import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { notificationAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    if (socket) {
      socket.on('newNotification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        if (notification.type === 'acceptedConnection') {
          toast.success(notification.message);
        } else if (notification.type === 'rejectedConnection') {
          toast.error(notification.message);
        } else {
          toast(notification.message);
        }
      });

      return () => {
        socket.off('newNotification');
      };
    }
  }, [socket]);



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await notificationAPI.getNotifications(token);
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await notificationAPI.markAsRead(notificationId, token);
      // Remove notification from list instead of just marking as read
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      await notificationAPI.clearAll(token);
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{unreadCount}</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
              >
                <Trash2 size={12} className="mr-1" />
                Clear All
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2 text-sm">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 bg-blue-50"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 relative">
                      {notification.senderId?.profilePicture ? (
                        <img
                          src={notification.senderId.profilePicture}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'acceptedConnection' ? 'bg-green-500' :
                          notification.type === 'rejectedConnection' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}>
                          <span className="text-white text-xs font-bold">
                            {notification.senderId?.name?.[0] || 'A'}
                          </span>
                        </div>
                      )}
                      {/* Notification type indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white ${notification.type === 'acceptedConnection' ? 'bg-green-500' :
                        notification.type === 'rejectedConnection' ? 'bg-red-500' :
                          notification.type === 'connectionRequest' ? 'bg-blue-500' :
                            'bg-gray-500'
                        }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="flex-shrink-0 text-blue-600 hover:text-blue-800"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;