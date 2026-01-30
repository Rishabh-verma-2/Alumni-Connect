import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, UserPlus, X } from 'lucide-react';
import { notificationAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';

const AlumniNotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());
  const dropdownRef = useRef(null);
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (socket) {
      socket.on('newNotification', (notification) => {
        if (notification.type === 'connectionRequest') {
          // Refresh connection requests when new one arrives
          fetchData();
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [notifResponse, requestsResponse] = await Promise.all([
        notificationAPI.getNotifications(token),
        notificationAPI.getConnectionRequests(token)
      ]);
      setNotifications(notifResponse.data.data || []);
      setConnectionRequests(requestsResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId, action) => {
    try {
      setProcessingIds(prev => new Set([...prev, requestId]));
      const token = localStorage.getItem('token');
      await notificationAPI.respondToConnectionRequest(requestId, action, token);
      
      // Remove the connection request from the list
      setConnectionRequests(prev => prev.filter(req => req._id !== requestId));
      
      // Also remove any related connectionRequest notifications
      setNotifications(prev => prev.filter(notif => 
        !(notif.type === 'connectionRequest' && notif.senderId?._id === 
          connectionRequests.find(req => req._id === requestId)?.senderId?._id)
      ));
      
      toast.success(`Connection request ${action}ed successfully!`);
    } catch (error) {
      console.error('Error responding to connection request:', error);
      toast.error('Failed to respond to connection request');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
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

  const pendingRequestsCount = connectionRequests.length;
  const totalCount = pendingRequestsCount;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
      >
        <Bell size={20} />
        {totalCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{totalCount}</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2 text-sm">Loading...</p>
              </div>
            ) : (
              <>
                {/* Connection Requests */}
                {connectionRequests.length > 0 && (
                  <div className="border-b border-gray-100">
                    <div className="p-3 bg-blue-50">
                      <h4 className="text-sm font-semibold text-blue-900 flex items-center">
                        <UserPlus size={16} className="mr-2" />
                        Connection Requests ({connectionRequests.length})
                      </h4>
                    </div>
                    {connectionRequests.map((request) => (
                      <div key={request._id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {request.senderId?.profilePicture ? (
                              <img
                                src={request.senderId.profilePicture}
                                alt=""
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  {request.senderId?.name?.[0] || 'S'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                              <span className="font-medium">{request.senderId?.name || request.senderId?.username}</span> sent you a connection request
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => handleResponse(request._id, 'accept')}
                                disabled={processingIds.has(request._id)}
                                className="flex items-center px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                              >
                                <Check size={12} className="mr-1" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleResponse(request._id, 'reject')}
                                disabled={processingIds.has(request._id)}
                                className="flex items-center px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                              >
                                <X size={12} className="mr-1" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {connectionRequests.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    <Bell size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No connection requests</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniNotificationDropdown;