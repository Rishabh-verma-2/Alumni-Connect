import mongoose from "mongoose";

const communityPostSchema = new mongoose.Schema({
    communityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    media: [
        {
            type: String, // Cloudinary URLs for images/videos
        }
    ],
    isPinned: {
        type: Boolean,
        default: false,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    comments: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}, { timestamps: true });

// Indexes for better query performance
communityPostSchema.index({ communityId: 1, createdAt: -1 });
communityPostSchema.index({ userId: 1 });
communityPostSchema.index({ isPinned: 1 });

const CommunityPost = mongoose.model("CommunityPost", communityPostSchema);
export default CommunityPost;
