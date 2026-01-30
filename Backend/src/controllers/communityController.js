import Community from "../models/Community.js";
import CommunityPost from "../models/CommunityPost.js";
import User from "../models/User.js";

// Create a new community (Alumni only)
export const createCommunity = async (req, res) => {
    try {
        const { name, description, category, tags, visibility, icon, coverImage } = req.body;
        const userId = req.user._id;

        // Check if user is alumni
        const user = await User.findById(userId);
        if (user.role !== 'alumni') {
            return res.status(403).json({
                status: 'error',
                message: 'Only alumni can create communities'
            });
        }

        // Check if community name already exists
        const existingCommunity = await Community.findOne({ name });
        if (existingCommunity) {
            return res.status(400).json({
                status: 'error',
                message: 'Community name already exists'
            });
        }

        // Create new community
        const community = new Community({
            name,
            description,
            category,
            tags: tags || [],
            visibility: visibility || 'public',
            icon: icon || '👥',
            coverImage: coverImage || '',
            createdBy: userId,
            moderators: [userId],
            members: [{
                userId: userId,
                role: 'moderator',
                joinedAt: new Date(),
            }],
        });

        await community.save();

        res.status(201).json({
            status: 'success',
            message: 'Community created successfully',
            data: community,
        });
    } catch (error) {
        console.error('Error creating community:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all communities (with filters)
export const getAllCommunities = async (req, res) => {
    try {
        const { category, search, visibility } = req.query;
        const userId = req.user?._id;

        let query = { isActive: true };

        // Filter by visibility (non-hidden for non-members)
        if (!userId) {
            query.visibility = 'public';
        } else {
            query.$or = [
                { visibility: { $in: ['public', 'private'] } },
                { 'members.userId': userId },
            ];
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
            ];
        }

        const communities = await Community.find(query)
            .populate('createdBy', 'name email')
            .populate('moderators', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        // Add member count and user membership status
        const communitiesWithStatus = communities.map(community => ({
            ...community,
            memberCount: community.members.length,
            isMember: userId ? community.members.some(m => m.userId.toString() === userId.toString()) : false,
            isPendingApproval: userId ? community.pendingRequests?.some(r => r.userId.toString() === userId.toString()) : false,
        }));

        res.status(200).json({
            status: 'success',
            data: communitiesWithStatus,
        });
    } catch (error) {
        console.error('Error fetching communities:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// Get community by ID
export const getCommunityById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const community = await Community.findById(id)
            .populate('createdBy', 'name email profilePicture')
            .populate('moderators', 'name email profilePicture')
            .populate('members.userId', 'name email profilePicture role')
            .populate('pendingRequests.userId', 'name email profilePicture');

        if (!community) {
            return res.status(404).json({
                status: 'error',
                message: 'Community not found'
            });
        }

        // Check if user has access to this community
        const isMember = userId ? community.members.some(m => m.userId._id.toString() === userId.toString()) : false;
        const isModerator = userId ? community.moderators.some(m => m.toString() === userId.toString()) : false;

        if (community.visibility === 'hidden' && !isMember) {
            return res.status(403).json({
                status: 'error',
                message: 'This is a hidden community'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                ...community.toObject(),
                memberCount: community.members.length,
                isMember,
                isModerator,
            },
        });
    } catch (error) {
        console.error('Error fetching community:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// Update community (moderators only)
export const updateCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const updates = req.body;

        const community = await Community.findById(id);

        if (!community) {
            return res.status(404).json({
                status: 'error',
                message: 'Community not found'
            });
        }

        // Check if user is moderator
        const isModerator = community.moderators.some(m => m.toString() === userId.toString());
        if (!isModerator) {
            return res.status(403).json({
                status: 'error',
                message: 'Only moderators can update this community'
            });
        }

        // Update allowed fields
        const allowedUpdates = ['name', 'description', 'category', 'tags', 'visibility', 'icon', 'coverImage'];
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                community[key] = updates[key];
            }
        });

        await community.save();

        res.status(200).json({
            status: 'success',
            message: 'Community updated successfully',
            data: community,
        });
    } catch (error) {
        console.error('Error updating community:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// Delete community (creator or admin only)
export const deleteCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const community = await Community.findById(id);

        if (!community) {
            return res.status(404).json({
                status: 'error',
                message: 'Community not found'
            });
        }

        // Check if user is creator or admin
        const user = await User.findById(userId);
        if (community.createdBy.toString() !== userId.toString() && user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Only creator or admin can delete this community'
            });
        }

        // Delete all community posts
        await CommunityPost.deleteMany({ communityId: id });

        // Delete community
        await Community.findByIdAndDelete(id);

        res.status(200).json({
            status: 'success',
            message: 'Community deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting community:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// Join community
export const joinCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const community = await Community.findById(id);

        if (!community) {
            return res.status(404).json({
                status: 'error',
                message: 'Community not found'
            });
        }

        // Check if already a member
        const isMember = community.members.some(m => m.userId.toString() === userId.toString());
        if (isMember) {
            return res.status(400).json({
                status: 'error',
                message: 'Already a member of this community'
            });
        }

        // Check if already requested
        const alreadyRequested = community.pendingRequests?.some(r => r.userId.toString() === userId.toString());
        if (alreadyRequested) {
            return res.status(400).json({
                status: 'error',
                message: 'Join request already pending'
            });
        }

        // If public, add directly
        if (community.visibility === 'public') {
            community.members.push({
                userId,
                role: 'member',
                joinedAt: new Date(),
            });
            await community.save();

            return res.status(200).json({
                status: 'success',
                message: 'Joined community successfully',
                data: community,
            });
        }

        // If private, add to pending requests
        if (community.visibility === 'private') {
            if (!community.pendingRequests) {
                community.pendingRequests = [];
            }
            community.pendingRequests.push({
                userId,
                requestedAt: new Date(),
            });
            await community.save();

            return res.status(200).json({
                status: 'success',
                message: 'Join request sent successfully',
                data: community,
            });
        }

        // Hidden communities cannot be joined this way
        return res.status(403).json({
            status: 'error',
            message: 'This is a hidden community'
        });
    } catch (error) {
        console.error('Error joining community:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// Leave community
export const leaveCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const community = await Community.findById(id);

        if (!community) {
            return res.status(404).json({
                status: 'error',
                message: 'Community not found'
            });
        }

        // Check if creator (creators cannot leave their own community)
        if (community.createdBy.toString() === userId.toString()) {
            return res.status(400).json({
                status: 'error',
                message: 'Community creator cannot leave the community'
            });
        }

        // Remove from members
        community.members = community.members.filter(m => m.userId.toString() !== userId.toString());

        // Remove from moderators if applicable
        community.moderators = community.moderators.filter(m => m.toString() !== userId.toString());

        await community.save();

        res.status(200).json({
            status: 'success',
            message: 'Left community successfully',
        });
    } catch (error) {
        console.error('Error leaving community:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// Approve member (moderators only)
export const approveMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { requestUserId } = req.body;
        const userId = req.user._id;

        const community = await Community.findById(id);

        if (!community) {
            return res.status(404).json({
                status: 'error',
                message: 'Community not found'
            });
        }

        // Check if user is moderator
        const isModerator = community.moderators.some(m => m.toString() === userId.toString());
        if (!isModerator) {
            return res.status(403).json({
                status: 'error',
                message: 'Only moderators can approve members'
            });
        }

        // Find pending request
        const requestIndex = community.pendingRequests?.findIndex(r => r.userId.toString() === requestUserId);
        if (requestIndex === -1 || requestIndex === undefined) {
            return res.status(404).json({
                status: 'error',
                message: 'Join request not found'
            });
        }

        // Add to members
        community.members.push({
            userId: requestUserId,
            role: 'member',
            joinedAt: new Date(),
        });

        // Remove from pending requests
        community.pendingRequests.splice(requestIndex, 1);

        await community.save();

        res.status(200).json({
            status: 'success',
            message: 'Member approved successfully',
            data: community,
        });
    } catch (error) {
        console.error('Error approving member:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// Remove member (moderators only)
export const removeMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { memberUserId } = req.body;
        const userId = req.user._id;

        const community = await Community.findById(id);

        if (!community) {
            return res.status(404).json({
                status: 'error',
                message: 'Community not found'
            });
        }

        // Check if user is moderator
        const isModerator = community.moderators.some(m => m.toString() === userId.toString());
        if (!isModerator) {
            return res.status(403).json({
                status: 'error',
                message: 'Only moderators can remove members'
            });
        }

        // Cannot remove creator
        if (community.createdBy.toString() === memberUserId) {
            return res.status(400).json({
                status: 'error',
                message: 'Cannot remove community creator'
            });
        }

        // Remove from members
        community.members = community.members.filter(m => m.userId.toString() !== memberUserId);

        // Remove from moderators if applicable
        community.moderators = community.moderators.filter(m => m.toString() !== memberUserId);

        await community.save();

        res.status(200).json({
            status: 'success',
            message: 'Member removed successfully',
        });
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// Get community members
export const getCommunityMembers = async (req, res) => {
    try {
        const { id } = req.params;

        const community = await Community.findById(id)
            .populate('members.userId', 'name email profilePicture role');

        if (!community) {
            return res.status(404).json({
                status: 'error',
                message: 'Community not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: community.members,
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// Get community posts
export const getCommunityPosts = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const community = await Community.findById(id);

        if (!community) {
            return res.status(404).json({
                status: 'error',
                message: 'Community not found'
            });
        }

        // Check if user has access
        const isMember = userId ? community.members.some(m => m.userId.toString() === userId.toString()) : false;

        if (community.visibility === 'private' && !isMember) {
            return res.status(403).json({
                status: 'error',
                message: 'You must be a member to view posts'
            });
        }

        if (community.visibility === 'hidden' && !isMember) {
            return res.status(403).json({
                status: 'error',
                message: 'This is a hidden community'
            });
        }

        const posts = await CommunityPost.find({ communityId: id })
            .populate('userId', 'name email profilePicture role')
            .populate('comments.userId', 'name email profilePicture')
            .sort({ isPinned: -1, createdAt: -1 })
            .lean();

        res.status(200).json({
            status: 'success',
            data: posts,
        });
    } catch (error) {
        console.error('Error fetching community posts:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// Get user's communities
export const getUserCommunities = async (req, res) => {
    try {
        const { userId } = req.params;

        const communities = await Community.find({
            'members.userId': userId,
            isActive: true,
        })
            .populate('createdBy', 'name email')
            .populate('moderators', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        const communitiesWithStatus = communities.map(community => {
            const member = community.members.find(m => m.userId.toString() === userId);
            return {
                ...community,
                memberCount: community.members.length,
                userRole: member?.role || 'member',
            };
        });

        res.status(200).json({
            status: 'success',
            data: communitiesWithStatus,
        });
    } catch (error) {
        console.error('Error fetching user communities:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// Create post in community
export const createCommunityPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, media } = req.body;
        const userId = req.user._id;

        const community = await Community.findById(id);

        if (!community) {
            return res.status(404).json({
                status: 'error',
                message: 'Community not found'
            });
        }

        // Check if user is a member
        const isMember = community.members.some(m => m.userId.toString() === userId.toString());
        if (!isMember) {
            return res.status(403).json({
                status: 'error',
                message: 'Only members can post in this community'
            });
        }

        const post = new CommunityPost({
            communityId: id,
            userId,
            content,
            media: media || [],
        });

        await post.save();

        // Increment post count
        community.postCount += 1;
        await community.save();

        // Populate user details
        await post.populate('userId', 'name email profilePicture role');

        res.status(201).json({
            status: 'success',
            message: 'Post created successfully',
            data: post,
        });
    } catch (error) {
        console.error('Error creating community post:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// Update community post
export const updateCommunityPost = async (req, res) => {
    try {
        const { id, postId } = req.params;
        const { content, media } = req.body;
        const userId = req.user._id;

        const post = await CommunityPost.findById(postId);

        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        // Check if user is post author
        if (post.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'You can only update your own posts'
            });
        }

        post.content = content || post.content;
        post.media = media !== undefined ? media : post.media;

        await post.save();

        res.status(200).json({
            status: 'success',
            message: 'Post updated successfully',
            data: post,
        });
    } catch (error) {
        console.error('Error updating community post:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// Delete community post
export const deleteCommunityPost = async (req, res) => {
    try {
        const { id, postId } = req.params;
        const userId = req.user._id;

        const post = await CommunityPost.findById(postId);

        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        const community = await Community.findById(id);
        const isModerator = community.moderators.some(m => m.toString() === userId.toString());

        // Check if user is post author or moderator
        if (post.userId.toString() !== userId.toString() && !isModerator) {
            return res.status(403).json({
                status: 'error',
                message: 'You can only delete your own posts or be a moderator'
            });
        }

        await CommunityPost.findByIdAndDelete(postId);

        // Decrement post count
        community.postCount = Math.max(0, community.postCount - 1);
        await community.save();

        res.status(200).json({
            status: 'success',
            message: 'Post deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting community post:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};

// Pin/Unpin post (moderators only)
export const togglePinPost = async (req, res) => {
    try {
        const { id, postId } = req.params;
        const userId = req.user._id;

        const community = await Community.findById(id);

        if (!community) {
            return res.status(404).json({
                status: 'error',
                message: 'Community not found'
            });
        }

        // Check if user is moderator
        const isModerator = community.moderators.some(m => m.toString() === userId.toString());
        if (!isModerator) {
            return res.status(403).json({
                status: 'error',
                message: 'Only moderators can pin posts'
            });
        }

        const post = await CommunityPost.findById(postId);

        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        post.isPinned = !post.isPinned;
        await post.save();

        res.status(200).json({
            status: 'success',
            message: post.isPinned ? 'Post pinned successfully' : 'Post unpinned successfully',
            data: post,
        });
    } catch (error) {
        console.error('Error toggling pin post:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: error.message
        });
    }
};
