
import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Phone, Video, MoreVertical, ArrowLeft, Heart, Smile, Paperclip, Check, CheckCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AlumniSidebar from '../../Alumni/components/AlumniSidebar';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { notificationAPI, chatAPI } from '../../api/api';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

    // Auto-collapse sidebar after component is mounted for better space
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
      const senderId = data.message.senderId._id || data.message.senderId;

      // Increment unread count for the sender
      setUnreadCounts(prev => {
        const updated = { ...prev, [senderId]: (prev[senderId] || 0) + 1 };
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
      const response = await chatAPI.sendMessage(currentChatId, messageData, token);

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
      icon: '🔊',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  const handleVideoCall = () => {
    toast('📹 Video calls coming soon!', {
      icon: '📹',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  const handleDeleteChatForMe = async () => {
    if (!currentChatId) return;

    try {
      const token = localStorage.getItem('token');

      // Try to delete the entire chat first
      const deleteResponse = await fetch(`http://localhost:5001/api/v1/chat/${currentChatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (deleteResponse.ok) {
        toast.success('Chat deleted successfully');
      } else {
        await chatAPI.leaveChat(currentChatId, token);
        toast.success('Left chat successfully');
      }

      setSelectedChat(null);
      setCurrentChatId(null);
      setMessages([]);
      setShowChatMenu(false);

      fetchConnections();
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refreshUnreadCount'));
      }, 500);
    } catch (error) {
      console.error('Error deleting/leaving chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const filteredConnections = (connections || []).filter(conn => {
    const term = searchTerm.toLowerCase();
    const nameMatch = conn?.name?.toLowerCase().includes(term);
    const usernameMatch = conn?.username?.toLowerCase().includes(term);
    return nameMatch || usernameMatch;
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden font-sans">
      {user?.role === 'alumni' ? <AlumniSidebar /> : <Sidebar />}

      <div className={`flex-1 transition-all duration-300 flex ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
        {/* Sidebar / Chat List */}
        <div className={`w-full sm:w-80 lg:w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full ${selectedChat ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-4 pl-12 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Messages</h1>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white transition-all placeholder-gray-400"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {(filteredConnections || []).map((connection) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={connection._id}
                onClick={() => handleSelectChat(connection)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 group ${selectedChat?._id === connection._id
                  ? 'bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    {connection.profilePicture ? (
                      <img
                        src={connection.profilePicture}
                        alt={connection.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                        {getInitials(connection.name)}
                      </div>
                    )}
                    {/* Online status indicator (mock) */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`font-semibold text-sm truncate ${selectedChat?._id === connection._id
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-900 dark:text-white'
                        }`}>
                        {connection.name || connection.username}
                      </h3>
                      {unreadCounts[connection._id] > 0 && selectedChat?._id !== connection._id && (
                        <div className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-sm">
                          {unreadCounts[connection._id]}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate flex items-center">
                      {connection.role}
                      <span className="mx-1.5 opacity-50">•</span>
                      <span className="opacity-75">Click to chat</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredConnections.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500 dark:text-gray-400 px-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
                  <Search size={24} className="opacity-50" />
                </div>
                <p>No connections found</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col h-full bg-white dark:bg-gray-950 relative ${selectedChat ? 'flex' : 'hidden sm:flex'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20 flex justify-between items-center shadow-sm">
                <div className="flex items-center">
                  <button
                    onClick={handleCloseChat}
                    className="sm:hidden mr-3 p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <div className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="relative">
                      {selectedChat.profilePicture ? (
                        <img
                          src={selectedChat.profilePicture}
                          alt={selectedChat.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-100 dark:border-gray-800"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {getInitials(selectedChat.name)}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 dark:text-white leading-tight">
                        {selectedChat.name || selectedChat.username}
                      </h2>
                      <p className="text-xs text-green-500 font-medium">Online</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleVoiceCall}
                    className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all hidden sm:block"
                  >
                    <Phone size={20} />
                  </button>
                  <button
                    onClick={handleVideoCall}
                    className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all hidden sm:block"
                  >
                    <Video size={20} />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowChatMenu(!showChatMenu)}
                      className="p-2.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                    >
                      <MoreVertical size={20} />
                    </button>
                    <AnimatePresence>
                      {showChatMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
                        >
                          <div className="p-1">
                            <button
                              onClick={() => { handleCloseChat(); setShowChatMenu(false); }}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              Close Chat
                            </button>
                            <button
                              onClick={handleDeleteChatForMe}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              Delete Chat
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/50"
                style={{ backgroundImage: 'radial-gradient(circle at center, rgba(0,0,0,0.02) 2px, transparent 2.5px)', backgroundSize: '24px 24px' }}
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                      <Send className="w-10 h-10 text-blue-600 dark:text-blue-400 ml-1" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Start a new conversation</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                        Say hello to {selectedChat.name}! Messages are private and secure.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const messageId = message._id || message.id;
                    const reactions = messageReactions[messageId] || {};
                    const hasReactions = Object.keys(reactions).length > 0;
                    const isOwn = message.isOwn;

                    const messageDate = new Date(message.timestamp);
                    const prevMessage = index > 0 ? messages[index - 1] : null;
                    const prevDate = prevMessage ? new Date(prevMessage.timestamp) : null;
                    const showDateSeparator = !prevDate || messageDate.toDateString() !== prevDate.toDateString();

                    return (
                      <React.Fragment key={messageId}>
                        {showDateSeparator && (
                          <div className="flex justify-center my-6">
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium px-4 py-1.5 rounded-full shadow-sm">
                              {messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        )}

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group mb-2`}
                        >
                          <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>

                            <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                              {!isOwn && (
                                <div className="flex-shrink-0 mb-1">
                                  {selectedChat.profilePicture ? (
                                    <img src={selectedChat.profilePicture} className="w-8 h-8 rounded-full shadow-sm" alt="Avatar" />
                                  ) : (
                                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {getInitials(selectedChat.name)}
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="relative group">
                                <div
                                  className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl shadow-sm text-[15px] leading-relaxed relative ${isOwn
                                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none'
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-tl-none'
                                    }`}
                                >
                                  {/* Reply Quote */}
                                  {message.replyTo && (
                                    <div className={`mb-2 text-xs border-l-2 pl-2 py-1 rounded-r-md ${isOwn
                                      ? 'border-white/40 bg-white/10 text-white/90'
                                      : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300'
                                      }`}>
                                      <p className="font-bold mb-0.5">{message.replyTo.senderId === user._id ? 'You' : selectedChat.name}</p>
                                      <p className="truncate opacity-80">{message.replyTo.content}</p>
                                    </div>
                                  )}

                                  {/* Message Content */}
                                  <p className="whitespace-pre-wrap">{message.content}</p>

                                  {/* Time & Read Status */}
                                  <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] sm:text-[11px] font-medium ${isOwn ? 'text-blue-100' : 'text-gray-400'
                                    }`}>
                                    <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {isOwn && <CheckCheck size={14} className="opacity-80" />}
                                  </div>
                                </div>

                                {/* Reactions Overlay */}
                                {hasReactions && (
                                  <div className={`absolute -bottom-3 ${isOwn ? 'right-0' : 'left-0'} flex gap-0.5 z-10`}>
                                    {Object.entries(reactions).map(([emoji, userIds]) => (
                                      <div key={emoji} className="bg-white dark:bg-gray-800 text-xs px-1.5 py-0.5 rounded-full shadow border border-gray-100 dark:border-gray-700 flex items-center gap-0.5 animate-in zoom-in duration-200">
                                        <span>{emoji}</span>
                                        {userIds.length > 1 && <span className="font-bold text-gray-600 dark:text-gray-300">{userIds.length}</span>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions (Hover) */}
                            <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-10 ${isOwn ? 'flex-row-reverse' : ''}`}>
                              <button
                                onClick={() => handleLikeMessage(messageId)}
                                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Heart size={14} className={reactions['❤️']?.includes(user._id) ? 'fill-red-500 text-red-500' : ''} />
                              </button>
                              <button
                                onClick={() => setReplyingTo(message)}
                                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500 transition-colors"
                              >
                                <div className="rotate-180"><ArrowLeft size={14} /></div>
                              </button>
                              <div className="relative">
                                <button
                                  onClick={() => setShowReactionPicker(showReactionPicker === messageId ? null : messageId)}
                                  className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-yellow-500 transition-colors"
                                >
                                  <Smile size={14} />
                                </button>
                                {showReactionPicker === messageId && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 flex gap-2 z-50">
                                    {commonReactions.map(emoji => (
                                      <button
                                        key={emoji}
                                        onClick={() => handleMessageReaction(messageId, emoji)}
                                        className="text-lg hover:scale-125 transition-transform"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {isOwn && (
                                <div className="relative">
                                  <button
                                    onClick={() => setShowDeleteMenu(showDeleteMenu === messageId ? null : messageId)}
                                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <MoreVertical size={14} />
                                  </button>
                                  {showDeleteMenu === messageId && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                                      <button
                                        onClick={() => handleDeleteMessage(messageId)}
                                        className="px-4 py-2 text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left rounded-lg"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                {replyingTo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/30"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Replying to {replyingTo.senderId === user._id ? 'yourself' : selectedChat.name}</p>
                        <p className="text-xs text-gray-500 truncate">{replyingTo.content}</p>
                      </div>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors text-blue-500">
                      <Check size={16} className="rotate-45" />
                    </button>
                  </motion.div>
                )}

                <div className="flex items-end gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-[24px] focus-within:ring-2 ring-blue-500/20 transition-all border border-transparent focus-within:border-blue-500/30 focus-within:bg-white dark:focus-within:bg-gray-800">
                  <div className="flex items-center pb-1 pl-1">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2.5 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition-colors relative"
                    >
                      <Smile size={22} />
                      {showEmojiPicker && (
                        <div className="absolute bottom-14 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                          <EmojiPicker
                            onEmojiClick={(e) => handleEmojiSelect(e)}
                            theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                            height={350}
                            width={300}
                          />
                        </div>
                      )}
                    </button>
                    <button className="p-2.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
                      <Paperclip size={22} />
                    </button>
                  </div>

                  <textarea
                    ref={messageInputRef}
                    rows={1}
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white p-3 max-h-32 resize-none placeholder-gray-400"
                    style={{ minHeight: '44px' }}
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`p-3 m-1 rounded-full transition-all duration-200 shadow-md flex items-center justify-center ${newMessage.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    <Send size={20} className={newMessage.trim() ? 'ml-0.5' : ''} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-950 p-8 text-center">
              <div className="w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                  <Send className="w-12 h-12 text-blue-600 dark:text-blue-400 ml-2" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Messages</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md text-lg">
                Connect, collaborate, and grow your network. Select a conversation from the sidebar to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;