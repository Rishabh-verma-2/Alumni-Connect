import React, { useState, useEffect } from 'react';
import { Users, Check, X } from 'lucide-react';
import { notificationAPI } from '../../api/api';
import toast from 'react-hot-toast';

const ConnectionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    fetchConnectionRequests();
  }, []);

  const fetchConnectionRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await notificationAPI.getConnectionRequests(token);
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching connection requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId, action) => {
    try {
      setProcessingIds(prev => new Set([...prev, requestId]));
      const token = localStorage.getItem('token');
      await notificationAPI.respondToConnectionRequest(requestId, action, token);
      
      setRequests(prev => prev.filter(req => req._id !== requestId));
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading connection requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Users className="mr-2" size={20} />
          Connection Requests
          {requests.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {requests.length}
            </span>
          )}
        </h2>
      </div>
      
      <div className="p-6">
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Connection Requests</h3>
            <p className="text-gray-500">You don't have any pending connection requests.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  {request.senderId?.profilePicture ? (
                    <img
                      src={request.senderId.profilePicture}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {request.senderId?.name?.[0] || 'S'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {request.senderId?.name || request.senderId?.username}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">{request.senderId?.role}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleResponse(request._id, 'accept')}
                    disabled={processingIds.has(request._id)}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check size={16} className="mr-1" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleResponse(request._id, 'reject')}
                    disabled={processingIds.has(request._id)}
                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={16} className="mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionRequests;