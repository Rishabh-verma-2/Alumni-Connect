import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Globe, Lock, Eye, ArrowRight } from 'lucide-react';

const CommunityCard = ({ community, onJoin, isJoining = false }) => {
    const navigate = useNavigate();

    const getVisibilityIcon = (visibility) => {
        switch (visibility) {
            case 'public':
                return <Globe size={16} className="text-green-500" />;
            case 'private':
                return <Lock size={16} className="text-yellow-500" />;
            case 'hidden':
                return <Eye size={16} className="text-gray-500" />;
            default:
                return <Globe size={16} />;
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Career': 'bg-blue-100 text-blue-700',
            'Technical': 'bg-purple-100 text-purple-700',
            'College Background': 'bg-green-100 text-green-700',
            'Industry': 'bg-orange-100 text-orange-700',
            'Skills': 'bg-pink-100 text-pink-700',
            'Other': 'bg-slate-100 text-slate-700'
        };
        return colors[category] || colors['Other'];
    };

    return (
        <div
            className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl hover:border-purple-200 transition-all group cursor-pointer"
            onClick={() => navigate(`/communities/${community._id}`)}
        >
            {/* Cover Image */}
            <div className="relative h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 overflow-hidden">
                {community.coverImage ? (
                    <img
                        src={community.coverImage}
                        alt={community.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-6xl">
                        {community.icon || '👥'}
                    </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                        {getVisibilityIcon(community.visibility)}
                        <span className="text-white text-xs font-bold capitalize">{community.visibility}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors line-clamp-1">
                            {community.name}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                            {community.description}
                        </p>

                        {/* Category Badge */}
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(community.category)}`}>
                            {community.category}
                        </span>
                    </div>
                </div>

                {/* Tags */}
                {community.tags && community.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {community.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full"
                            >
                                #{tag}
                            </span>
                        ))}
                        {community.tags.length > 3 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                                +{community.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1 text-slate-600">
                            <Users size={16} />
                            <span className="font-bold">{community.memberCount || 0}</span>
                            <span className="text-xs">Members</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600">
                            <TrendingUp size={16} />
                            <span className="font-bold">{community.postCount || 0}</span>
                            <span className="text-xs">Posts</span>
                        </div>
                    </div>

                    {/* Join Button */}
                    {!community.isMember ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onJoin && onJoin(community._id);
                            }}
                            disabled={isJoining}
                            className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isJoining ? 'Joining...' : community.isPendingApproval ? 'Pending' : 'Join'}
                            {!isJoining && <ArrowRight size={14} />}
                        </button>
                    ) : (
                        <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-bold rounded-lg">
                            Joined ✓
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityCard;
