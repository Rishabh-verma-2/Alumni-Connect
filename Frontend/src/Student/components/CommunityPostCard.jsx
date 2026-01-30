import React, { useState } from 'react';
import { Pin, Trash2, Edit, MessageCircle, ThumbsUp, MoreVertical } from 'lucide-react';

const CommunityPostCard = ({
    post,
    currentUser,
    isModerator = false,
    onPin,
    onDelete,
    onEdit,
    onLike,
    onComment
}) => {
    const [showActions, setShowActions] = useState(false);
    const [isLiked, setIsLiked] = useState(post.likes?.includes(currentUser?._id));

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

    const handleLike = () => {
        setIsLiked(!isLiked);
        onLike && onLike(post._id);
    };

    const canEdit = post.userId?._id === currentUser?._id || isModerator;

    return (
        <div
            className={`bg-white rounded-2xl p-6 shadow-lg border transition-all ${post.isPinned ? 'border-yellow-400 bg-yellow-50/30' : 'border-slate-100'
                }`}
        >
            {/* Post Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {post.userId?.profilePicture ? (
                            <img
                                src={post.userId.profilePicture}
                                alt={post.userId.name}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            getInitials(post.userId?.name)
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900">{post.userId?.name || 'User'}</h4>
                            {post.isPinned && (
                                <div className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                                    <Pin size={12} />
                                    <span className="text-xs font-bold">Pinned</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">{formatDate(post.createdAt)}</p>
                    </div>
                </div>

                {/* Post Actions */}
                {canEdit && (
                    <div className="relative">
                        <button
                            onClick={() => setShowActions(!showActions)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                        >
                            <MoreVertical size={20} className="text-slate-400" />
                        </button>

                        {showActions && (
                            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-10 min-w-[150px]">
                                {isModerator && (
                                    <button
                                        onClick={() => {
                                            onPin && onPin(post._id);
                                            setShowActions(false);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium text-slate-700"
                                    >
                                        <Pin size={16} className={post.isPinned ? 'text-yellow-600' : 'text-slate-400'} />
                                        {post.isPinned ? 'Unpin' : 'Pin Post'}
                                    </button>
                                )}
                                {post.userId?._id === currentUser?._id && (
                                    <>
                                        <button
                                            onClick={() => {
                                                onEdit && onEdit(post);
                                                setShowActions(false);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium text-slate-700"
                                        >
                                            <Edit size={16} className="text-blue-600" />
                                            Edit Post
                                        </button>
                                        <button
                                            onClick={() => {
                                                onDelete && onDelete(post._id);
                                                setShowActions(false);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-red-50 transition-colors flex items-center gap-2 text-sm font-medium text-red-600"
                                        >
                                            <Trash2 size={16} />
                                            Delete Post
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Post Content */}
            <p className="text-slate-800 whitespace-pre-wrap mb-4">{post.content}</p>

            {/* Post Media */}
            {post.media && post.media.length > 0 && (
                <div className={`grid gap-2 mb-4 ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {post.media.map((url, index) => (
                        <img
                            key={index}
                            src={url}
                            alt={`Post media ${index + 1}`}
                            className="rounded-xl object-cover w-full h-48"
                        />
                    ))}
                </div>
            )}

            {/* Post Actions (Like, Comment) */}
            <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-purple-600' : 'text-slate-600 hover:text-purple-600'
                        }`}
                >
                    <ThumbsUp size={18} fill={isLiked ? 'currentColor' : 'none'} />
                    <span className="text-sm font-bold">{post.likes?.length || 0}</span>
                </button>
                <button
                    onClick={() => onComment && onComment(post._id)}
                    className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors"
                >
                    <MessageCircle size={18} />
                    <span className="text-sm font-bold">{post.comments?.length || 0}</span>
                </button>
            </div>

            {/* Click outside to close actions menu */}
            {showActions && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowActions(false)}
                />
            )}
        </div>
    );
};

export default CommunityPostCard;
