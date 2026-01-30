import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Heart, Share2, Users, MapPin, Clock, Plus, X, Trash2, MoreHorizontal, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../Student/components/Sidebar';
import AlumniSidebar from '../../Alumni/components/AlumniSidebar';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { postsAPI, alumniAPI } from '../../api/api';
import toast from 'react-hot-toast';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PostSkeleton = () => (
  <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex items-start space-x-3">
        <Skeleton circle width={40} height={40} />
        <div className="flex-1">
          <Skeleton width={120} height={16} />
          <Skeleton width={80} height={12} className="mt-1" />
          <Skeleton width={150} height={12} className="mt-1" />
        </div>
      </div>
      <Skeleton width="60%" height={20} />
      <Skeleton count={3} height={16} />
      <Skeleton height={200} className="rounded-lg" />
      <div className="flex space-x-6">
        <Skeleton width={60} height={16} />
        <Skeleton width={80} height={16} />
        <Skeleton width={70} height={16} />
      </div>
    </div>
  </SkeletonTheme>
);

const Posts = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();
  const { isSidebarCollapsed } = useSidebar();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postType, setPostType] = useState('general');
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    eventDate: '',
    location: '',
    description: '',
    media: []
  });
  const [showDropdown, setShowDropdown] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showComments, setShowComments] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showGallery, setShowGallery] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
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

    fetchPosts();
  }, []);

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
    console.log('Alumni profile click - userId object:', userId);
    if (userId && user?.role === 'student') {
      try {
        // Try using the alumniId if available from the backend
        if (userId.alumniId) {
          console.log('Using alumniId from backend:', userId.alumniId);
          navigate(`/alumni-profile-view/${userId.alumniId}`);
          return;
        }

        // Fallback: If no alumniId, we need to find it by querying all alumni
        console.log('Fallback: searching for alumni by user info');
        const token = localStorage.getItem('token');
        const response = await alumniAPI.getAllAlumni();
        const currentAlumni = response.data.data.find(alum =>
          alum.email === userId.email ||
          alum.userId === userId._id ||
          alum._id === userId._id
        );

        console.log('Found alumni:', currentAlumni);
        if (currentAlumni) {
          navigate(`/alumni-profile-view/${currentAlumni._id}`);
        } else {
          toast.error('Alumni profile not found');
        }
      } catch (error) {
        console.error('Error finding alumni profile:', error);
        toast.error('Failed to load alumni profile');
      }
    }
  };

  const handleCreatePost = async () => {
    // Validate required fields
    if (!postData.title.trim() || !postData.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      // Add text fields
      formData.append('type', postType);
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      if (postData.description) formData.append('description', postData.description);
      if (postData.eventDate) formData.append('eventDate', postData.eventDate);
      if (postData.location) formData.append('location', postData.location);

      // Add media files
      if (postData.media && postData.media.length > 0) {
        postData.media.forEach(file => {
          formData.append('media', file);
        });
      }

      await postsAPI.createPost(formData, token);
      toast.success('Post created successfully!');
      setShowCreatePost(false);
      setPostData({ title: '', content: '', eventDate: '', location: '', description: '', media: [] });

      // Refresh posts from database
      const response = await postsAPI.getAllPosts(token);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please check your connection and try again.');
    }
  };

  const filteredPosts = activeTab === 'all' ? posts : posts.filter(post => {
    if (activeTab === 'general') return post.type === 'post';
    if (activeTab === 'event') return post.type === 'event';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {user?.role === 'alumni' ? <AlumniSidebar /> : <Sidebar />}
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-0 lg:ml-16' : 'ml-0 lg:ml-64'}`}>
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-3 sm:gap-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Posts</h1>
                {user?.role === 'alumni' && (
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Post</span>
                  </button>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Stay updated with alumni posts and upcoming events</p>
            </div>
          </div>

          {/* Tabs - Outside max-width container for full-width sticky */}
          <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-lg backdrop-blur-md bg-white/95 dark:bg-gray-800/95 mb-4 sm:mb-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'all'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  All Posts
                </button>
                <button
                  onClick={() => setActiveTab('general')}
                  className={`px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'general'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  <MessageSquare className="w-4 h-4 mr-1 sm:mr-2 inline" />
                  <span className="hidden sm:inline">General </span>Posts
                </button>
                <button
                  onClick={() => setActiveTab('event')}
                  className={`px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'event'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  <Calendar className="w-4 h-4 mr-1 sm:mr-2 inline" />
                  Events
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Posts Feed */}
            <div className="space-y-4 sm:space-y-6">
              {loading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Be the first to create a post!</p>
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const isEvent = post.type === 'event';
                  const isGeneral = post.type === 'post' || post.type === 'general';

                  return (
                    <div key={post._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
                      {isGeneral ? (
                        // General Post
                        <div>
                          <div className="flex items-start space-x-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                              {post.userId?.profilePicture ? (
                                <img
                                  src={post.userId.profilePicture}
                                  alt={post.userId?.name || 'Alumni'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-medium text-sm">
                                  {post.userId?.name ? post.userId.name.split(' ').map(n => n[0]).join('') : 'AL'}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <button
                                    onClick={() => handleAlumniProfileClick(post.userId)}
                                    className={`font-semibold text-gray-900 dark:text-white transition-colors text-left ${user?.role === 'student' && post.userId
                                        ? 'hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer'
                                        : 'cursor-default'
                                      }`}
                                    disabled={user?.role !== 'student' || !post.userId}
                                  >
                                    {post.userId?.name || 'Alumni'}
                                  </button>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Alumni</p>
                                  <p className="text-sm text-gray-400 dark:text-gray-500">
                                    {new Date(post.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {post.userId?._id === user?._id && (
                                  <div className="relative">
                                    <button
                                      onClick={() => setShowDropdown(showDropdown === post._id ? null : post._id)}
                                      className="text-gray-400 hover:text-gray-600 p-1"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                    {showDropdown === post._id && (
                                      <div className="absolute right-0 top-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                                        <button
                                          onClick={() => {
                                            setShowDeleteModal(post._id);
                                            setShowDropdown(null);
                                          }}
                                          className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                          <span>Delete</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {post.title && (
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                          )}
                          <p className="text-gray-600 dark:text-white mb-4">{post.content}</p>

                          {/* Media Display */}
                          {post.media && post.media.length > 0 && (
                            <div className="mb-4">
                              <div className={`${post.media.length === 1 ? 'grid grid-cols-1' : 'grid grid-cols-2'} gap-2`}>
                                {post.media.slice(0, 4).map((mediaUrl, index) => (
                                  <div key={index} className="relative">
                                    {mediaUrl.includes('.mp4') || mediaUrl.includes('.mov') || mediaUrl.includes('.avi') || mediaUrl.includes('video') ? (
                                      <video
                                        src={mediaUrl}
                                        controls
                                        className={`w-full ${post.media.length === 1 ? 'h-auto max-h-96' : 'h-48'} object-cover rounded-lg`}
                                      />
                                    ) : (
                                      <img
                                        src={mediaUrl}
                                        alt={`Media ${index + 1}`}
                                        className={`w-full ${post.media.length === 1 ? 'h-auto max-h-96' : 'h-48'} object-cover rounded-lg cursor-pointer`}
                                        onClick={() => {
                                          setShowGallery(post.media);
                                          setCurrentImageIndex(index);
                                        }}
                                      />
                                    )}
                                    {index === 3 && post.media.length > 4 && (
                                      <div
                                        className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg cursor-pointer"
                                        onClick={() => {
                                          setShowGallery(post.media);
                                          setCurrentImageIndex(index);
                                        }}
                                      >
                                        <span className="text-white text-xl font-semibold">+{post.media.length - 4}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-6 text-gray-500 dark:text-gray-400">
                            <button
                              onClick={() => handleLikePost(post._id)}
                              className={`flex items-center space-x-2 transition-colors ${post.likes?.includes(user?._id)
                                  ? 'text-red-500 hover:text-red-600'
                                  : 'hover:text-red-500'
                                }`}
                            >
                              <Heart className={`w-5 h-5 ${post.likes?.includes(user?._id) ? 'fill-current' : ''}`} />
                              <span>{post.likes?.length || 0}</span>
                            </button>
                            <button
                              onClick={() => setShowComments(showComments === post._id ? null : post._id)}
                              className="flex items-center space-x-2 hover:text-blue-500"
                            >
                              <MessageSquare className="w-5 h-5" />
                              <span>{post.comments?.length || 0}</span>
                            </button>
                            <button className="flex items-center space-x-2 hover:text-green-500">
                              <Share2 className="w-5 h-5" />
                              <span>Share</span>
                            </button>
                          </div>

                          {/* Comments Section */}
                          {showComments === post._id && (
                            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                              {/* Add Comment */}
                              <div className="flex space-x-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                  <span className="text-white font-medium text-xs">
                                    {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                                  </span>
                                </div>
                                <div className="flex-1 flex space-x-2">
                                  <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                                  />
                                  <button
                                    onClick={() => handleAddComment(post._id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    Post
                                  </button>
                                </div>
                              </div>

                              {/* Comments List */}
                              <div className="space-y-3">
                                {post.comments?.map((comment, index) => (
                                  <div key={comment._id || index} className="flex space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                                      <span className="text-white font-medium text-xs">
                                        {comment.userId?.name ? comment.userId.name.split(' ').map(n => n[0]).join('') : 'U'}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <p className="font-medium text-sm text-gray-900 dark:text-white">
                                              {comment.userId?.name || 'User'}
                                            </p>
                                            <p className="text-gray-300 dark:text-white">{comment.content}</p>
                                          </div>
                                          {comment.userId?._id === user?._id && (
                                            <button
                                              onClick={() => handleDeleteComment(post._id, comment._id)}
                                              className="text-gray-400 hover:text-red-500 ml-2"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {new Date(comment.createdAt).toLocaleString([], {
                                          year: 'numeric',
                                          month: 'numeric',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Event Post
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-6 h-6 text-blue-600" />
                              <span className="text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                Event
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Users className="w-4 h-4 mr-1" />
                              0 attending
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                          <p className="text-gray-600 dark:text-white mb-4">{post.eventDetails?.description || post.content}</p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">{post.eventDetails?.date ? new Date(post.eventDetails.date).toLocaleDateString() : 'TBD'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">TBD</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">{post.eventDetails?.location || 'TBD'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Organized by {' '}
                              <button
                                onClick={() => handleAlumniProfileClick(post.userId)}
                                className={`font-medium transition-colors ${user?.role === 'student' && post.userId
                                    ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer'
                                    : 'text-gray-600 dark:text-gray-400 cursor-default'
                                  }`}
                                disabled={user?.role !== 'student' || !post.userId}
                              >
                                {post.userId?.name || 'Alumni'}
                              </button>
                            </p>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              Join Event
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && user?.role === 'alumni' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Post</h2>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Post Type Selection */}
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <button
                    onClick={() => setPostType('post')}
                    className={`px-4 py-2 rounded-lg text-sm sm:text-base ${postType === 'post' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    General Post
                  </button>
                  <button
                    onClick={() => setPostType('event')}
                    className={`px-4 py-2 rounded-lg text-sm sm:text-base ${postType === 'event' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    Event Post
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={postData.title}
                  onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                />
                <textarea
                  placeholder={postType === 'post' ? "What's on your mind?" : "Event content/description"}
                  value={postData.content}
                  onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                  rows={4}
                />
                {postType === 'event' && (
                  <>
                    <textarea
                      placeholder="Event Description (optional)"
                      value={postData.description}
                      onChange={(e) => setPostData({ ...postData, description: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                      rows={3}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="date"
                        value={postData.eventDate}
                        onChange={(e) => setPostData({ ...postData, eventDate: e.target.value })}
                        className="p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={postData.location}
                        onChange={(e) => setPostData({ ...postData, location: e.target.value })}
                        className="p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 text-sm sm:text-base"
                      />
                    </div>
                  </>
                )}

                {/* Media Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Image className="w-4 h-4 inline mr-2" />
                    Media (Images/Videos)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setPostData({ ...postData, media: files });
                    }}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  {postData.media.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {postData.media.length} file(s) selected
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-6">
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors order-1 sm:order-2"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete Post</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeletePost(showDeleteModal);
                    setShowDeleteModal(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={() => setPreviewImage(null)}>
            <div className="relative max-w-4xl max-h-full p-4">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {/* Gallery Modal */}
        {showGallery && (
          <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50" onClick={() => setShowGallery(null)}>
            <div className="relative max-w-4xl max-h-full p-4 w-full">
              <button
                onClick={() => setShowGallery(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Navigation Buttons */}
              {showGallery.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : showGallery.length - 1);
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(currentImageIndex < showGallery.length - 1 ? currentImageIndex + 1 : 0);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Current Image */}
              <div className="flex items-center justify-center h-full">
                <img
                  src={showGallery[currentImageIndex]}
                  alt={`Gallery ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full">
                {currentImageIndex + 1} / {showGallery.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;