import React from 'react';
import { Crown, Shield, UserMinus, MoreVertical } from 'lucide-react';
import { useState } from 'react';

const MemberList = ({
    members = [],
    currentUser,
    isModerator = false,
    onRemoveMember
}) => {
    const [actionMenuId, setActionMenuId] = useState(null);

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0].substring(0, 2).toUpperCase();
    };

    const getRoleBadge = (role) => {
        if (role === 'creator') {
            return {
                icon: <Crown size={14} />,
                label: 'Creator',
                className: 'bg-yellow-100 text-yellow-700'
            };
        }
        if (role === 'moderator') {
            return {
                icon: <Shield size={14} />,
                label: 'Mod',
                className: 'bg-blue-100 text-blue-700'
            };
        }
        return null;
    };

    const canRemoveMember = (member) => {
        // Can't remove yourself or creators
        if (member.userId?._id === currentUser?._id) return false;
        if (member.role === 'creator') return false;
        // Only moderators can remove members
        return isModerator;
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
                Members ({members.length})
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {members.length > 0 ? (
                    members.map((member) => {
                        const badge = getRoleBadge(member.role);

                        return (
                            <div
                                key={member.userId?._id || member._id}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                            >
                                {/* Profile Picture */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                                    {member.userId?.profilePicture ? (
                                        <img
                                            src={member.userId.profilePicture}
                                            alt={member.userId?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        getInitials(member.userId?.name)
                                    )}
                                </div>

                                {/* Member Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-900 text-sm truncate">
                                            {member.userId?.name || 'User'}
                                        </h4>
                                        {badge && (
                                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${badge.className}`}>
                                                {badge.icon}
                                                {badge.label}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {member.userId?.currentDesignation || member.userId?.email || 'Member'}
                                    </p>
                                </div>

                                {/* Actions */}
                                {canRemoveMember(member) && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setActionMenuId(
                                                actionMenuId === member.userId?._id ? null : member.userId?._id
                                            )}
                                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <MoreVertical size={16} className="text-slate-400" />
                                        </button>

                                        {actionMenuId === member.userId?._id && (
                                            <>
                                                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-10 min-w-[140px]">
                                                    <button
                                                        onClick={() => {
                                                            onRemoveMember && onRemoveMember(member.userId?._id);
                                                            setActionMenuId(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-red-50 transition-colors flex items-center gap-2 text-sm font-medium text-red-600"
                                                    >
                                                        <UserMinus size={16} />
                                                        Remove
                                                    </button>
                                                </div>
                                                <div
                                                    className="fixed inset-0 z-0"
                                                    onClick={() => setActionMenuId(null)}
                                                />
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        <p className="text-sm">No members yet</p>
                    </div>
                )}
            </div>

            {members.length > 10 && (
                <button className="w-full mt-4 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm">
                    View All Members
                </button>
            )}
        </div>
    );
};

export default MemberList;
