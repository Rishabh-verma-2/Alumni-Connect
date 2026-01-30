import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Users, Settings, UserPlus, UserMinus, Globe, Lock,
    Eye, Send, Image as ImageIcon, Pin, Trash2, Edit, MoreVertical, X
} from 'lucide-react';
import { communityAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import StudentSidebar from '../components/Sidebar';
import AlumniSidebar from '../../Alumni/components/AlumniSidebar';
import { useSidebar } from '../../context/SidebarContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import CommunityPostCard from '../components/CommunityPostCard';
import MemberList from '../components/MemberList';

const CommunityDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { isSidebarCollapsed } = useSidebar() || { isSidebarCollapsed: false };

    const [community, setCommunity] = useState(null);
    const [posts, setPosts] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postContent, setPostContent] = useState('');
    const [showMembersList, setShowMembersList] = useState(false);

    useEffect(() => {
        fetchCommunityDetails();
        fetchCommunityPosts();
        fetchCommunityMembers();
    }, [id]);

    const fetchCommunityDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await communityAPI.getCommunityById(id, token);
            setCommunity(response.data?.data || null);
        } catch (error) {
            console.error('Error fetching community:', error);
            toast.error('Failed to load community');
        } finally {
            setLoading(false);
        }
    };

    const fetchCommunityPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await communityAPI.getCommunityPosts(id, token);
            setPosts(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const fetchCommunityMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await communityAPI.getCommunityMembers(id, token);
            setMembers(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const handleLeaveCommunity = async () => {
        if (!confirm('Are you sure you want to leave this community?')) return;

        try {
            const token = localStorage.getItem('token');
            await communityAPI.leaveCommunity(id, token);
            toast.success('Left community successfully');
            navigate('/communities');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to leave community');
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!postContent.trim()) return;

        try {
            const token = localStorage.getItem('token');
            await communityAPI.createCommunityPost(id, { content: postContent }, token);
            setPostContent('');
            toast.success('Post created successfully');
            fetchCommunityPosts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create post');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const token = localStorage.getItem('token');
            await communityAPI.deleteCommunityPost(id, postId, token);
            toast.success('Post deleted successfully');
            fetchCommunityPosts();
        } catch (error) {
            toast.error('Failed to delete post');
        }
    };

    const handleTogglePin = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            await communityAPI.togglePinPost(id, postId, token);
            toast.success('Post pin status updated');
            fetchCommunityPosts();
        } catch (error) {
            toast.error('Failed to update pin status');
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0].substring(0, 2).toUpperCase();
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F3F4F6]">
                <div className="fixed inset-0 pointer-events-none z-0"
                    style={{
                        backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                ></div>

                {user?.role === 'alumni' ? <AlumniSidebar /> : <StudentSidebar />}

                <div className={`relative z-10 flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                    <Skeleton width={180} height={40} className="mb-6" />

                    {/* Header Skeleton */}
                    <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 mb-8">
                        <Skeleton height={192} className="mb-0" />
                        <div className="p-8">
                            <Skeleton height={40} width="60%" className="mb-4" />
                            <Skeleton count={2} className="mb-4" />
                            <div className="flex gap-2 mb-4">
                                <Skeleton width={80} height={28} borderRadius={16} />
                                <Skeleton width={100} height={28} borderRadius={16} />
                            </div>
                            <div className="flex gap-6">
                                <Skeleton width={120} />
                                <Skeleton width={100} />
                                <Skeleton width={80} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Posts Skeleton */}
                        <div className="lg:col-span-2 space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                                    <div className="flex gap-3 mb-4">
                                        <Skeleton circle width={48} height={48} />
                                        <div className="flex-1">
                                            <Skeleton width={150} height={20} className="mb-2" />
                                            <Skeleton width={100} height={16} />
                                        </div>
                                    </div>
                                    <Skeleton count={3} className="mb-4" />
                                    <div className="flex gap-4">
                                        <Skeleton width={80} />
                                        <Skeleton width={100} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Members Skeleton */}
                        <div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                                <Skeleton width={120} height={24} className="mb-4" />
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Skeleton circle width={40} height={40} />
                                            <div className="flex-1">
                                                <Skeleton width={100} height={16} className="mb-1" />
                                                <Skeleton width={60} height={12} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!community) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Community not found</h2>
                    <button
                        onClick={() => navigate('/communities')}
                        className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all"
                    >
                        Back to Communities
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F3F4F6] text-slate-800">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            ></div>

            {user?.role === 'alumni' ? <AlumniSidebar /> : <StudentSidebar />}

            <div className={`relative z-10 flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>

                {/* Back Button */}
                <button
                    onClick={() => navigate('/communities')}
                    className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Communities
                </button>

                {/* Community Header */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 mb-8">
                    {/* Cover Image */}
                    <div className="relative h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
                        {community.coverImage ? (
                            <img src={community.coverImage} alt={community.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-white text-8xl">
                                {community.icon}
                            </div>
                        )}
                    </div>

                    {/* Community Info */}
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <h1 className="text-4xl font-black text-slate-900 mb-2">{community.name}</h1>
                                <p className="text-slate-600 text-lg mb-4">{community.description}</p>

                                {/* Tags */}
                                {community.tags && community.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {community.tags.map((tag, index) => (
                                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-bold rounded-full">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="flex gap-6 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <Users size={18} />
                                        <span className="font-bold">{community.memberCount || 0} Members</span>
                                    </div>
                                    <div className="px-3 py-1 bg-slate-100 rounded-lg font-medium capitalize">
                                        {community.category}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {community.visibility === 'public' && <Globe size={16} className="text-green-500" />}
                                        {community.visibility === 'private' && <Lock size={16} className="text-yellow-500" />}
                                        {community.visibility === 'hidden' && <Eye size={16} className="text-gray-500" />}
                                        <span className="text-sm capitalize">{community.visibility}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                {community.isModerator && (
                                    <Link
                                        to={`/communities/${id}/settings`}
                                        className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                                    >
                                        <Settings size={20} />
                                    </Link>
                                )}
                                <button
                                    onClick={() => setShowMembersList(!showMembersList)}
                                    className="px-4 py-2 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                                >
                                    <Users size={18} />
                                    Members
                                </button>
                                {community.isMember && (
                                    <button
                                        onClick={handleLeaveCommunity}
                                        className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-all flex items-center gap-2"
                                    >
                                        <UserMinus size={18} />
                                        Leave
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Create Post */}
                        {community.isMember && (
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Create Post</h3>
                                <form onSubmit={handleCreatePost}>
                                    <textarea
                                        value={postContent}
                                        onChange={(e) => setPostContent(e.target.value)}
                                        className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                                        rows="4"
                                        placeholder="Share your thoughts with the community..."
                                    ></textarea>
                                    <div className="flex justify-end gap-3 mt-3">
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all flex items-center gap-2"
                                        >
                                            <Send size={18} />
                                            Post
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Posts Feed */}
                        <div className="space-y-4">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <CommunityPostCard
                                        key={post._id}
                                        post={post}
                                        currentUser={user}
                                        isModerator={community.isModerator}
                                        onPin={handleTogglePin}
                                        onDelete={handleDeletePost}
                                        onEdit={(post) => console.log('Edit post:', post)}
                                        onLike={(postId) => console.log('Like post:', postId)}
                                        onComment={(postId) => console.log('Comment on:', postId)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white rounded-2xl">
                                    <div className="text-6xl mb-4">📝</div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">No posts yet</h3>
                                    <p className="text-slate-500">Be the first to share something!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Members */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Members ({members.length})</h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {members.slice(0, 10).map((member) => (
                                    <div key={member.userId?._id} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                            {getInitials(member.userId?.name)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900 text-sm">{member.userId?.name || 'User'}</h4>
                                            <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {members.length > 10 && (
                                <button className="w-full mt-4 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all">
                                    View All Members
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityDetail;
