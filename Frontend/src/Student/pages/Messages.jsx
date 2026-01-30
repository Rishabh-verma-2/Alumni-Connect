import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Phone, Video, MoreVertical, ArrowLeft, Heart, Smile } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AlumniSidebar from '../../Alumni/components/AlumniSidebar';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { notificationAPI, chatAPI } from '../../api/api';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';


const Messages = () => {
  const [connections, setConnections] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const { user } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();

  useEffect(() => {
    fetchConnections();
    
    // Auto-collapse sidebar after component is mounted
    const timer = setTimeout(() => {
      if (!isSidebarCollapsed && toggleSidebar) {
        toggleSidebar();
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [isSidebarCollapsed, toggleSidebar]);

  useEffect(() => {
    if (!user?._id) return;
    
    const socket = io('http://localhost:5001', {
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000
    });
    
    socket.on('connect', () => {
      console.log('Socket connected for user:', user._id);
      socket.emit('join', user._id);
    });
    
    socket.on('connect_error', (error) => {
      console.warn('Socket connection failed:', error.message);
    });
    
    socket.on('newMessage', (data) => {
      console.log('NEW MESSAGE RECEIVED:', data);
      console.log('Current user ID:', user._id);
      console.log('Current chat ID:', currentChatId);
      console.log('Message chat ID:', data.chatId);
      const senderId = data.message.senderId._id || data.message.senderId;
      console.log('Sender ID:', senderId);
      
      // Increment unread count for the sender
      setUnreadCounts(prev => {
        const updated = { ...prev, [senderId]: (prev[senderId] || 0) + 1 };
        console.log('UNREAD COUNTS UPDATED:', updated);
        return updated;
      });
      
      // If current chat, add message
      if (data.chatId === currentChatId) {
        const newMessage = { ...data.message, isOwn: false };
        setMessages(prev => [...prev, newMessage]);
        
        // Initialize reactions for new message if they exist
        if (newMessage.reactions && Object.keys(newMessage.reactions).length > 0) {
          setMessageReactions(prev => ({
            ...prev,
            [newMessage._id]: newMessage.reactions
          }));
        }
        
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });

    socket.on('messageDeleted', (data) => {
      if (data.chatId === currentChatId) {
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      }
    });
    
    socket.on('messageReactionUpdated', (data) => {
      if (data.chatId === currentChatId) {
        setMessageReactions(prev => ({
          ...prev,
          [data.messageId]: data.reactions
        }));
      }
    });
    
    return () => {
      socket.disconnect();
    };
  }, [user?._id, currentChatId]);

  // Fallback: Refresh messages every 3 seconds if no real-time updates
  useEffect(() => {
    if (!currentChatId || !selectedChat) return;
    
    const refreshMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await chatAPI.getOrCreateChat(selectedChat._id, token);
        
        const chatMessages = (response.data.chat.messages || []).map(msg => ({
          ...msg,
          isOwn: (msg.senderId._id || msg.senderId) === user._id
        }));
        
        // Only update if we have new messages
        if (chatMessages.length !== messages.length) {
          setMessages(chatMessages);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      } catch (error) {
        console.error('Error refreshing messages:', error);
      }
    };
    
    const interval = setInterval(refreshMessages, 3000);
    return () => clearInterval(interval);
  }, [currentChatId, selectedChat, messages.length, user._id]);

  useEffect(() => {
    if (!window.chatSocket) return;

    const handleNewMessage = (data) => {
      const message = { ...data.message, isOwn: false };
      
      if (data.chatId === currentChatId) {
        setMessages(prev => [...prev, message]);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        // Increment unread count for the sender
        const senderId = typeof data.message.senderId === 'object' ? data.message.senderId._id : data.message.senderId;
        const senderConnection = connections.find(conn => conn._id === senderId);
        if (senderConnection) {
          setUnreadCounts(prev => ({
            ...prev,
            [senderConnection._id]: (prev[senderConnection._id] || 0) + 1
          }));
        }
      }
      
      window.dispatchEvent(new CustomEvent('refreshUnreadCount'));
    };

    const handleMessageDeleted = (data) => {
      if (data.chatId === currentChatId) {
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      }
    };

    window.chatSocket.off('newMessage');
    window.chatSocket.off('messageDeleted');
    window.chatSocket.on('newMessage', handleNewMessage);
    window.chatSocket.on('messageDeleted', handleMessageDeleted);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChatId]);

  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await notificationAPI.getConnections(token);
      console.log('Connections data:', response.data.data); // Debug log
      console.log('First connection profile picture:', response.data.data?.[0]?.profilePicture); // Debug profile picture
      setConnections(response.data.data || []);
      
      // Fetch unread counts
      const unreadResponse = await chatAPI.getUnreadCount(token);
      if (unreadResponse.data.unreadPerChat) {
        setUnreadCounts(unreadResponse.data.unreadPerChat);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChatId) return;
    
    try {
      const token = localStorage.getItem('token');
      const messageData = { content: newMessage };
      if (replyingTo) {
        messageData.replyTo = replyingTo._id;
      }
      console.log('Sending message:', { ...messageData, chatId: currentChatId, userId: user._id });
      const response = await chatAPI.sendMessage(currentChatId, messageData, token);
      console.log('Message sent response:', response.data);
      
      const message = {
        ...response.data.message,
        isOwn: response.data.message.senderId._id === user._id,
        replyTo: replyingTo ? {
          _id: replyingTo._id,
          content: replyingTo.content,
          senderId: replyingTo.senderId
        } : response.data.message.replyTo
      };
      
      setMessages([...messages, message]);
      setNewMessage('');
      setReplyingTo(null);
      
      // Initialize reactions for new message if they exist
      if (message.reactions && Object.keys(message.reactions).length > 0) {
        setMessageReactions(prev => ({
          ...prev,
          [message._id]: message.reactions
        }));
      }
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSelectChat = async (connection) => {
    console.log('Opening chat for:', connection.name);
    
    // Set selected chat immediately for UI feedback
    setSelectedChat(connection);
    setMessages([]);
    setCurrentChatId(null);
    
    try {
      const token = localStorage.getItem('token');
      const connectionId = connection._id;
      
      const response = await chatAPI.getOrCreateChat(connectionId, token);
      
      if (response?.data?.chat) {
        setCurrentChatId(response.data.chat._id);
        
        const chatMessages = (response.data.chat.messages || []).map(msg => ({
          ...msg,
          isOwn: (msg.senderId._id || msg.senderId) === user._id
        }));
        
        setMessages(chatMessages);
        
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
          messageInputRef.current?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to open chat');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await chatAPI.deleteMessage(currentChatId, messageId, token);
      
      setMessages(messages.filter(msg => msg._id !== messageId));
      setShowDeleteMenu(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleEmojiSelect = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    // Don't close picker, let user select multiple emojis
    messageInputRef.current?.focus();
  };

  const commonReactions = ['❤️', '👍', '👎', '😂', '😮', '😢', '😡', '👏'];

  const handleCloseChat = () => {
    setSelectedChat(null);
    setCurrentChatId(null);
    setMessages([]);
    setNewMessage('');
    setShowChatMenu(false);
    setShowEmojiPicker(false);
    setShowDeleteMenu(null);
    setShowReactionPicker(null);
    setMessageReactions({});
  };

  const handleMessageReaction = async (messageId, reaction) => {
    try {
      const token = localStorage.getItem('token');
      const response = await chatAPI.toggleMessageReaction(currentChatId, messageId, reaction, token);
      
      // Update local state with response from server
      setMessageReactions(prev => ({
        ...prev,
        [messageId]: response.data.reactions
      }));
      
      setShowReactionPicker(null);
    } catch (error) {
      console.error('Error toggling message reaction:', error);
      toast.error('Failed to react to message');
    }
  };

  const handleLikeMessage = (messageId) => {
    handleMessageReaction(messageId, '❤️');
  };

  const handleVoiceCall = () => {
    toast('🔊 Voice calls coming soon!', {
      duration: 3000,
      style: {
        background: '#3B82F6',
        color: 'white',
      },
    });
  };

  const handleVideoCall = () => {
    toast('📹 Video calls coming soon!', {
      duration: 3000,
      style: {
        background: '#7C3AED',
        color: 'white',
      },
    });
  };

  const handleDeleteChatForMe = async () => {
    if (!currentChatId) return;
    
    try {
      const token = localStorage.getItem('token');
      console.log('Deleting chat:', currentChatId);
      
      // Try to delete the entire chat first
      const deleteResponse = await fetch(`http://localhost:5001/api/v1/chat/${currentChatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (deleteResponse.ok) {
        console.log('Chat deleted successfully');
        toast.success('Chat deleted successfully');
      } else {
        // Fallback to leave chat if delete fails
        console.log('Delete failed, trying to leave chat');
        await chatAPI.leaveChat(currentChatId, token);
        toast.success('Left chat successfully');
      }
      
      // Reset chat state
      setSelectedChat(null);
      setCurrentChatId(null);
      setMessages([]);
      setShowChatMenu(false);
      
      // Refresh connections and force unread count refresh
      fetchConnections();
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refreshUnreadCount'));
      }, 500);
    } catch (error) {
      console.error('Error deleting/leaving chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const filteredConnections = (connections || []).filter(conn =>
    conn?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {user?.role === 'alumni' ? <AlumniSidebar /> : <Sidebar />}
      
      <div className={`flex-1 transition-all duration-300 flex ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="w-full sm:w-80 lg:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
            
          <div className="overflow-y-auto flex-1">
            {(filteredConnections || []).map((connection) => (
              <div
                key={connection._id}
                className={`p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:border-r-2 hover:border-blue-600/30 transition-all duration-200 ${
                  selectedChat?._id === connection._id ? 'bg-blue-50 dark:bg-blue-900 border-r-2 border-blue-600' : ''
                }`}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer" 
                  onClick={() => {
                    console.log('Connection clicked:', connection);
                    console.log('Connection ID:', connection._id);
                    console.log('User ID:', user._id);
                    console.log('Token exists:', !!localStorage.getItem('token'));
                    handleSelectChat(connection);
                  }}
                >
                  <div className="flex items-center flex-1">
                    {connection.profilePicture ? (
                      <img
                        src={connection.profilePicture}
                        alt={connection.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        onError={(e) => {
                          console.log('Image failed to load:', connection.profilePicture);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                        {getInitials(connection.name)}
                      </div>
                    )}
                    <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {connection.name || connection.username}
                        </h3>
                        {unreadCounts[connection._id] > 0 && selectedChat?._id !== connection._id && (
                          <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center flex-shrink-0">
                            {unreadCounts[connection._id]}
                          </div>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 capitalize truncate">
                        {connection.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredConnections.length === 0 && (
              <div className="p-6 sm:p-8 text-center">
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                  {user?.role === 'alumni' ? 'No student connections found' : 'No connections found'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={`flex-1 flex flex-col ${selectedChat ? 'flex' : 'hidden sm:flex'}`}>
          {selectedChat ? (
            <>
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <button
                      onClick={handleCloseChat}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 mr-2 transition-all duration-200"
                      title="Back to chat list"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    {selectedChat.profilePicture ? (
                      <img
                        src={selectedChat.profilePicture}
                        alt={selectedChat.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(selectedChat.name)}
                      </div>
                    )}
                    <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                      <h2 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                        {selectedChat.name || selectedChat.username}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 capitalize truncate">
                        {selectedChat.role}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    <button 
                      onClick={handleVoiceCall}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 hidden sm:block"
                      title="Voice call"
                    >
                      <Phone size={18} />
                    </button>
                    <button 
                      onClick={handleVideoCall}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 hidden sm:block"
                      title="Video call"
                    >
                      <Video size={18} />
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setShowChatMenu(!showChatMenu)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {showChatMenu && (
                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              handleCloseChat();
                              setShowChatMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-t-lg text-sm whitespace-nowrap transition-all duration-200"
                          >
                            Close Chat
                          </button>
                          <button
                            onClick={handleDeleteChatForMe}
                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg text-sm whitespace-nowrap border-t border-gray-200 dark:border-gray-700"
                          >
                            Delete Chat
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 h-0">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">Start a conversation with {selectedChat.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const messageId = message._id || message.id;
                      const reactions = messageReactions[messageId] || {};
                      const hasReactions = Object.keys(reactions).length > 0;
                      
                      // Date separator logic
                      const messageDate = new Date(message.timestamp);
                      const prevMessage = index > 0 ? messages[index - 1] : null;
                      const prevDate = prevMessage ? new Date(prevMessage.timestamp) : null;
                      
                      const showDateSeparator = !prevDate || 
                        messageDate.toDateString() !== prevDate.toDateString();
                      
                      const getDateLabel = (date) => {
                        const today = new Date();
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        
                        if (date.toDateString() === today.toDateString()) {
                          return 'Today';
                        } else if (date.toDateString() === yesterday.toDateString()) {
                          return 'Yesterday';
                        } else {
                          return date.toLocaleDateString();
                        }
                      };
                      
                      return (
                        <div key={messageId}>
                          {/* Date Separator */}
                          {showDateSeparator && (
                            <div className="flex justify-center my-4">
                              <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-xs font-medium">
                                {getDateLabel(messageDate)}
                              </div>
                            </div>
                          )}
                          
                          <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} group`}>

                          <div className={`flex items-end ${message.isOwn ? 'flex-row-reverse' : 'flex-row'} max-w-[85%] sm:max-w-[70%]`}>
                            {/* Avatar for received messages */}
                            {!message.isOwn && (
                              <div className="flex-shrink-0 mr-2">
                                {(() => {
                                  // Try multiple sources for profile picture
                                  const senderInfo = message.senderId;
                                  let profilePicture = null;
                                  let senderName = selectedChat.name;
                                  
                                  // Check message sender first
                                  if (senderInfo && typeof senderInfo === 'object') {
                                    profilePicture = senderInfo.profilePicture;
                                    senderName = senderInfo.name || senderInfo.username;
                                  }
                                  
                                  // Fallback to selectedChat
                                  if (!profilePicture) {
                                    profilePicture = selectedChat.profilePicture;
                                  }
                                  
                                  return profilePicture ? (
                                    <img
                                      src={profilePicture}
                                      alt={senderName}
                                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                      {getInitials(senderName)}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                            
                            <div className="relative">
                              <div
                                className={`px-3 sm:px-4 py-2 rounded-lg ${message.isOwn
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                                  }`}
                              >
                                {/* Reply indicator - Enhanced WhatsApp style */}
                                {message.replyTo && (
                                  <div className={`mb-3 -mx-1 px-3 py-2 rounded-md border-l-4 cursor-pointer transition-all hover:bg-opacity-80 ${
                                    message.isOwn 
                                      ? 'bg-white/10 border-white/40 text-white/90 hover:bg-white/15' 
                                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                  }`}>
                                    <div className={`text-xs font-semibold mb-1 ${
                                      message.isOwn ? 'text-white/80' : 'text-blue-600 dark:text-blue-400'
                                    }`}>
                                      {message.replyTo.senderId === user._id ? '↩ You' : `↩ ${selectedChat?.name || 'User'}`}
                                    </div>
                                    <div className={`text-sm leading-relaxed ${
                                      message.isOwn ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'
                                    }`}>
                                      {(message.replyTo?.content || '').length > 60 
                                        ? `${message.replyTo.content.substring(0, 60)}...` 
                                        : (message.replyTo?.content || '')
                                      }
                                    </div>
                                  </div>
                                )}
                                <p className="text-sm sm:text-base break-words leading-relaxed">{message.content}</p>
                              </div>
                              <p className={`text-xs mt-1 px-1 ${message.isOwn ? 'text-right' : 'text-left'} ${
                                message.isOwn ? 'text-gray-500' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </p>
                              
                              {/* Reactions Display */}
                              {hasReactions && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {Object.entries(reactions).map(([emoji, userIds]) => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleMessageReaction(messageId, emoji)}
                                      className={`flex items-center px-2 py-1 rounded-full text-xs border transition-colors ${
                                        Array.isArray(userIds) && userIds.includes(user._id)
                                          ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-300'
                                          : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                                      }`}
                                    >
                                      <span className="mr-1">{emoji}</span>
                                      <span>{Array.isArray(userIds) ? userIds.length : 0}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className={`flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${message.isOwn ? 'mr-1 sm:mr-2 flex-row-reverse' : 'ml-1 sm:ml-2'}`}>
                              {/* Like Button */}
                              <button
                                onClick={() => handleLikeMessage(messageId)}
                                className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                  Array.isArray(reactions['❤️']) && reactions['❤️'].includes(user._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                                }`}
                                title="Like message"
                              >
                                <Heart size={12} fill={Array.isArray(reactions['❤️']) && reactions['❤️'].includes(user._id) ? 'currentColor' : 'none'} />
                              </button>
                              
                              {/* Reaction Picker Button */}
                              <div className="relative">
                                <button
                                  onClick={() => setShowReactionPicker(showReactionPicker === messageId ? null : messageId)}
                                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                  title="Add reaction"
                                >
                                  <Smile size={12} />
                                </button>
                                
                                {/* Reaction Picker */}
                                {showReactionPicker === messageId && (
                                  <div className={`reaction-picker absolute ${message.isOwn ? 'right-0' : 'left-0'} top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1.5 sm:p-2 z-10`}>
                                    <div className="flex space-x-0.5 sm:space-x-1">
                                      {commonReactions.map((emoji) => (
                                        <button
                                          key={emoji}
                                          onClick={() => handleMessageReaction(messageId, emoji)}
                                          className={`p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-base sm:text-lg ${
                                            Array.isArray(reactions[emoji]) && reactions[emoji].includes(user._id) ? 'bg-blue-100 dark:bg-blue-900' : ''
                                          }`}
                                          title={`React with ${emoji}`}
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Reply Button - Enhanced */}
                              <button
                                onClick={() => {
                                  setReplyingTo(message);
                                  setTimeout(() => {
                                    messageInputRef.current?.focus();
                                  }, 100);
                                }}
                                className="p-1.5 sm:p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110"
                                title="Reply to message"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 717 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 8l3.707-3.707a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              
                              {/* Delete Menu for Own Messages */}
                              {message.isOwn && (
                                <div className="relative">
                                  <button
                                    onClick={() => setShowDeleteMenu(showDeleteMenu === messageId ? null : messageId)}
                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                  >
                                    <MoreVertical size={12} />
                                  </button>
                                  {showDeleteMenu === messageId && (
                                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                                      <button
                                        onClick={() => handleDeleteMessage(messageId)}
                                        className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm whitespace-nowrap"
                                      >
                                        Delete Message
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                {/* Reply Preview */}
                {replyingTo && (
                  <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Replying to:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{replyingTo.content}</p>
                      </div>
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2 relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="px-2 sm:px-3 py-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 z-10">
                      <EmojiPicker
                        onEmojiClick={(emojiObject) => handleEmojiSelect(emojiObject)}
                        width={window.innerWidth < 640 ? 280 : 350}
                        height={window.innerWidth < 640 ? 320 : 400}
                      />
                    </div>
                  )}
                  <input
                    ref={messageInputRef}
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      if (showEmojiPicker) {
                        setShowEmojiPicker(false);
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                      if (showEmojiPicker) {
                        setShowEmojiPicker(false);
                      }
                    }}
                    className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a connection from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;