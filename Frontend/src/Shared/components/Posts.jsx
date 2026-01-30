
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MessageSquare, Heart, Share2, Users, MapPin, Clock, Plus, X, Trash2, MoreHorizontal, Image, ChevronLeft, ChevronRight, Send, Hash, Sparkles, Globe, Award, Crop, RotateCw, Type, Sliders, Check, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../Student/components/Sidebar';
import AlumniSidebar from '../../Alumni/components/AlumniSidebar';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { postsAPI, alumniAPI } from '../../api/api';
import toast from 'react-hot-toast';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const PostSkeleton = () => (
  <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/30 rounded-3xl p-6 space-y-4 mb-6">
      <div className="flex items-start space-x-3">
        <Skeleton circle width={48} height={48} />
        <div className="flex-1">
          <Skeleton width={140} height={18} />
          <Skeleton width={100} height={14} className="mt-1" />
        </div>
      </div>
      <Skeleton width="80%" height={24} />
      <Skeleton count={2} height={16} />
      <Skeleton height={250} className="rounded-2xl" />
      <div className="flex space-x-6 pt-2">
        <Skeleton width={60} height={24} />
        <Skeleton width={60} height={24} />
        <Skeleton width={60} height={24} />
      </div>
    </div>
  </SkeletonTheme>
);

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
};

const ImageEditor = ({ imageFile, onSave, onCancel }) => {
  const cropperRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [filter, setFilter] = useState('none');

  const filters = [
    { name: 'None', value: 'none' },
    { name: 'Grayscale', value: 'grayscale(100%)' },
    { name: 'Sepia', value: 'sepia(100%)' },
    { name: 'Contrast', value: 'contrast(150%)' },
    { name: 'Brightness', value: 'brightness(120%)' },
    { name: 'Blur', value: 'blur(2px)' },
  ];

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    const imageElement = cropperRef.current;
    const cropper = imageElement?.cropper;
    cropper.rotate(90);
  };

  const handleSave = () => {
    const imageElement = cropperRef.current;
    const cropper = imageElement?.cropper;

    if (cropper) {
      const canvas = cropper.getCroppedCanvas({
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      if (filter !== 'none') {
        const filterCanvas = document.createElement('canvas');
        const ctx = filterCanvas.getContext('2d');
        filterCanvas.width = canvas.width;
        filterCanvas.height = canvas.height;

        ctx.filter = filter;
        ctx.drawImage(canvas, 0, 0);

        filterCanvas.toBlob((blob) => {
          const file = new File([blob], imageFile.name, { type: 'image/jpeg' });
          onSave(file);
        }, 'image/jpeg');
      } else {
        canvas.toBlob((blob) => {
          const file = new File([blob], imageFile.name, { type: 'image/jpeg' });
          onSave(file);
        }, 'image/jpeg');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center text-gray-900 dark:text-white">
          <h3 className="text-xl font-bold">Edit Image</h3>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 bg-gray-900 relative overflow-hidden flex items-center justify-center">
          <Cropper
            src={URL.createObjectURL(imageFile)}
            style={{ height: '100%', width: '100%', maxHeight: '60vh' }}
            initialAspectRatio={16 / 9}
            guides={true}
            ref={cropperRef}
            viewMode={1}
            dragMode="move"
            background={false}
            responsive={true}
            checkOrientation={false}
          />
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 space-y-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={handleRotate} className="flex flex-col items-center gap-1 text-xs text-gray-600 dark:text-gray-300 hover:text-blue-500">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                <RotateCw size={20} />
              </div>
              Rotate
            </button>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-1 justify-center hide-scrollbar">
              {filters.map(f => (
                <button
                  key={f.value}
                  onClick={() => {
                    setFilter(f.value);
                    if (cropperRef.current) {
                      cropperRef.current.cropper.canvas.style.filter = f.value;
                      const img = cropperRef.current.querySelector('img');
                      if (img) img.style.filter = f.value;
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors border ${filter === f.value
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
            >
              Apply & Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Posts = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create/Edit Post State
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null); // Track ID if editing
  const [postType, setPostType] = useState('general');
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    eventDate: '',
    location: '',
    description: '',
    media: [] // Final processed files
  });

  const [showDropdown, setShowDropdown] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showComments, setShowComments] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showGallery, setShowGallery] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Image Editor State
  const [editingFile, setEditingFile] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isSidebarCollapsed && toggleSidebar) {
        // toggleSidebar();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await postsAPI.getAllPosts(token);
      setPosts(response.data.posts || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleEditPost = (post) => {
    setEditingPostId(post._id);
    setPostType(post.type === 'post' ? 'post' : 'event'); // Corrected type check
    setPostData({
      title: post.title || '',
      content: post.content || '',
      eventDate: post.eventDetails?.date ? new Date(post.eventDetails.date).toISOString().split('T')[0] : '',
      location: post.eventDetails?.location || '',
      description: post.eventDetails?.description || '',
      media: post.media || [] // Load existing media URLs
    });
    setShowDropdown(null);
    setShowCreatePost(true);
  };

  const handleCreateOrUpdatePost = async () => {
    if (!postData.title.trim() || !postData.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('type', postType);
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      if (postData.description) formData.append('description', postData.description);
      if (postData.eventDate) formData.append('eventDate', postData.eventDate);
      if (postData.location) formData.append('location', postData.location);

      if (postData.media && postData.media.length > 0) {
        postData.media.forEach(item => {
          if (item instanceof File) {
            formData.append('media', item);
          } else if (typeof item === 'string') {
            formData.append('existingMedia', item);
          }
        });
      }

      if (editingPostId) {
        await postsAPI.updatePost(editingPostId, formData, token);
        toast.success('Post updated successfully!');
      } else {
        await postsAPI.createPost(formData, token);
        toast.success('Post created successfully!');
      }

      setShowCreatePost(false);
      setEditingPostId(null);
      setPostData({ title: '', content: '', eventDate: '', location: '', description: '', media: [] });
      fetchPosts(); // Refresh list

    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post. Please try again.');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await postsAPI.deletePost(postId, token);
      setPosts(posts.filter(post => post._id !== postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await postsAPI.likePost(postId, token);

      setPosts(posts.map(post => {
        if (post._id === postId) {
          const isLiked = response.data.isLiked;
          const updatedLikes = isLiked
            ? [...(post.likes || []), user._id]
            : (post.likes || []).filter(id => id !== user._id);
          return { ...post, likes: updatedLikes };
        }
        return post;
      }));
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await postsAPI.commentOnPost(postId, { content: commentText }, token);

      setPosts(posts.map(post => {
        if (post._id === postId) {
          return { ...post, comments: response.data.comments };
        }
        return post;
      }));

      setCommentText('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await postsAPI.deleteComment(postId, commentId, token);

      setPosts(posts.map(post => {
        if (post._id === postId) {
          return { ...post, comments: response.data.comments };
        }
        return post;
      }));

      toast.success('Comment deleted!');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };


  const handleAlumniProfileClick = async (userId) => {
    if (userId && user?.role === 'student') {
      const targetId = userId.alumniId || userId._id;
      // Logic simplified, assuming ID is reachable directly if possible or finding via list
      // Keeping original robust logic if ID match isn't direct
      if (userId.role === 'alumni') {
        try {
          if (userId.alumniId) {
            navigate(`/alumni-profile-view/${userId.alumniId}`);
            return;
          }
          const token = localStorage.getItem('token');
          const response = await alumniAPI.getAllAlumni();
          const currentAlumni = response.data.data.find(alum =>
            alum.email === userId.email ||
            alum.userId === userId._id ||
            alum._id === userId._id
          );
          if (currentAlumni) {
            navigate(`/alumni-profile-view/${currentAlumni._id}`);
          }
        } catch (e) { console.error(e) }
      }
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const file = files[0];
    if (postData.media.length >= 5) {
      toast.error('Maximum 5 images allowed per post');
      return;
    }
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Only images and videos are supported');
      return;
    }
    if (file.type.startsWith('video/')) {
      setPostData(prev => ({ ...prev, media: [...prev.media, file] }));
      return;
    }
    setEditingFile(file);
    e.target.value = null;
  };

  const handleEditorSave = (processedFile) => {
    setPostData(prev => ({
      ...prev,
      media: [...prev.media, processedFile]
    }));
    setEditingFile(null);
  };

  const removeMedia = (index) => {
    setPostData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const filteredPosts = activeTab === 'all' ? posts : posts.filter(post => {
    if (activeTab === 'general') return post.type === 'post';
    if (activeTab === 'event') return post.type === 'event';
    return true;
  });

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f1115] flex font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {user?.role === 'alumni' ? <AlumniSidebar /> : <Sidebar />}

      <div className={`flex-1 transition-all duration-500 relative z-10 ${isSidebarCollapsed ? 'ml-0 lg:ml-20' : 'ml-0 lg:ml-72'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight mb-2">
                Community Feed
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Connect, share, and discover what's happening.
              </p>
            </div>

            {user?.role === 'alumni' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingPostId(null);
                  setPostData({ title: '', content: '', eventDate: '', location: '', description: '', media: [] });
                  setShowCreatePost(true);
                }}
                className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg hover:shadow-blue-500/30 ring-1 ring-white/10 overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
                <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                Create New Post
              </motion.button>
            )}
          </div>

          <div className="sticky top-4 z-40 mb-8">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1.5 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-800/50 inline-flex">
              {['all', 'general', 'event'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 z-10 ${activeTab === tab
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                    } capitalize flex items-center gap-2`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {tab === 'all' && <Globe size={16} />}
                    {tab === 'general' && <MessageSquare size={16} />}
                    {tab === 'event' && <Calendar size={16} />}
                    {tab === 'all' ? 'All Updates' : tab + 's'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {loading ? (
              <>
                <PostSkeleton />
                <PostSkeleton />
              </>
            ) : filteredPosts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24 bg-white/40 dark:bg-gray-800/40 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700"
              >
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">It's quiet here...</h3>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, index) => {
                  const isEvent = post.type === 'event';
                  const isOwnPost = post.userId?._id === user?._id;

                  return (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 50, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="group relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-[32px] p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="relative cursor-pointer" onClick={() => handleAlumniProfileClick(post.userId)}>
                            {post.userId?.profilePicture ? (
                              <img
                                src={post.userId.profilePicture}
                                alt={post.userId?.name}
                                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-offset-2 ring-gray-100 dark:ring-gray-800 dark:ring-offset-gray-900 transition-transform hover:scale-105"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                                {getInitials(post.userId?.name || post.userId?.username)}
                              </div>
                            )}
                            {isEvent && (
                              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-400 to-pink-500 text-white p-1 rounded-lg shadow-sm">
                                <Calendar size={12} strokeWidth={3} />
                              </div>
                            )}
                          </div>

                          <div>
                            <h3
                              onClick={() => handleAlumniProfileClick(post.userId)}
                              className={`text-lg font-bold text-gray-900 dark:text-white leading-tight ${user?.role === 'student' ? 'hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer' : ''}`}
                            >
                              {post.userId?.name || post.userId?.username || 'Alumni Member'}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              {post.userId?.role === 'alumni' && (
                                <span className="font-medium text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md text-xs">
                                  {post.userId?.currentCompany || 'Alumni'}
                                </span>
                              )}
                              <span className="text-xs text-gray-400">•</span>
                              <span>{formatRelativeTime(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {isOwnPost && (
                          <div className="relative">
                            <button
                              onClick={() => setShowDropdown(showDropdown === post._id ? null : post._id)}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <MoreHorizontal size={20} />
                            </button>
                            <AnimatePresence>
                              {showDropdown === post._id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                  className="absolute right-0 top-10 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden min-w-[160px]"
                                >
                                  <button
                                    onClick={() => handleEditPost(post)}
                                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors gap-2"
                                  >
                                    <Edit2 size={16} className="text-blue-500" />
                                    Edit Post
                                  </button>
                                  <div className="h-px bg-gray-100 dark:bg-gray-700" />
                                  <button
                                    onClick={() => {
                                      setShowDeleteModal(post._id);
                                      setShowDropdown(null);
                                    }}
                                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors gap-2"
                                  >
                                    <Trash2 size={16} />
                                    Delete Post
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>

                      {post.title && <h2 className="text-xl font-bold mb-2 dark:text-white">{post.title}</h2>}
                      <p className="text-gray-600 dark:text-gray-300 mb-4 whitespace-pre-wrap">{isEvent ? (post.eventDetails?.description || post.content) : post.content}</p>
                      {post.media && post.media.length > 0 && (
                        <div className="mb-6 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                          <div className={`grid gap-0.5 ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
                            {post.media.slice(0, 4).map((mediaUrl, idx) => (
                              <div
                                key={idx}
                                className={`relative overflow-hidden cursor-pointer h-64`}
                                onClick={() => {
                                  setShowGallery(post.media);
                                  setCurrentImageIndex(idx);
                                }}
                              >
                                <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button onClick={() => handleLikePost(post._id)} className="flex items-center gap-2 text-gray-500 hover:text-red-500">
                          <Heart className={post.likes?.includes(user?._id) ? 'fill-red-500 text-red-500' : ''} />
                          <span>{post.likes?.length || 0}</span>
                        </button>
                        <button onClick={() => setShowComments(showComments === post._id ? null : post._id)} className="flex items-center gap-2 text-gray-500 hover:text-blue-500">
                          <MessageSquare />
                          <span>{post.comments?.length || 0}</span>
                        </button>
                      </div>

                      <AnimatePresence>
                        {showComments === post._id && (
                          <div className="mt-4 pt-4">
                            <div className="flex gap-2">
                              <input
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
                                placeholder="Write a comment..."
                              />
                              <button onClick={() => handleAddComment(post._id)} className="p-2 bg-blue-600 text-white rounded-lg">Post</button>
                            </div>
                            <div className="mt-4 space-y-2">
                              {post.comments?.map((comment, i) => (
                                <div key={i} className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                                    {getInitials(comment.userId?.name)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold dark:text-white">{comment.userId?.name}</p>
                                      <span className="text-[10px] text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-sm dark:text-gray-300">{comment.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCreatePost && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreatePost(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingPostId ? 'Edit Post' : 'Create Post'}
                </h2>
                <button onClick={() => setShowCreatePost(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="flex gap-4 mb-6">
                  {['post', 'event'].map(type => (
                    <button
                      key={type}
                      onClick={() => setPostType(type)}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${postType === type
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                      {type === 'post' ? 'General Post' : 'Event'}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={postData.title}
                    onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-transparent focus:border-blue-500 rounded-xl outline-none transition-all dark:text-white font-bold text-lg"
                  />

                  <textarea
                    placeholder={postType === 'post' ? "Share your thoughts..." : "Describe the event details..."}
                    value={postData.content}
                    onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-transparent focus:border-blue-500 rounded-xl outline-none transition-all dark:text-white min-h-[150px] resize-none"
                  />

                  {/* Media Upload (Only show upload for now, existing media handling skipped for brevity of 'edit' v1) */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${postData.media.length >= 5 ? 'pointer-events-none' : ''}`}
                    />
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mb-2">
                        <Image size={24} />
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium">Click to upload image/video</p>
                      <p className="text-sm text-gray-500">Max 5 items. Images can be edited.</p>
                    </div>
                  </div>

                  {postData.media.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                      {postData.media.map((file, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200 dark:border-gray-700">
                          {/* Check for File object first, then string URL endings */}
                          {(file instanceof File && (file.type?.startsWith('image') || file.name?.match(/\.(jpg|jpeg|png|gif)$/i))) ||
                            (typeof file === 'string' && file.match(/\.(jpg|jpeg|png|gif|webp)|cloudinary/i)) ? (
                            <img
                              src={file instanceof File ? URL.createObjectURL(file) : file}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white text-xs">Media</div>
                          )}
                          <button
                            onClick={() => removeMedia(i)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="px-6 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrUpdatePost}
                  className="px-8 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
                >
                  {editingPostId ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {editingFile && (
        <ImageEditor
          imageFile={editingFile}
          onSave={handleEditorSave}
          onCancel={() => setEditingFile(null)}
        />
      )}

      {showGallery && (
        <div className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setShowGallery(null)}>
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <img src={showGallery[currentImageIndex]} className="max-h-full max-w-full object-contain" />
            <button className="absolute top-4 right-4 text-white" onClick={() => setShowGallery(null)}><X size={32} /></button>

            {showGallery.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
                <button
                  className="pointer-events-auto p-3 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-all hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => prev === 0 ? showGallery.length - 1 : prev - 1);
                  }}
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  className="pointer-events-auto p-3 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-all hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => prev === showGallery.length - 1 ? 0 : prev + 1);
                  }}
                >
                  <ChevronRight size={32} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;