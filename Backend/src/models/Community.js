import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['Career', 'Technical', 'College Background', 'Industry', 'Skills', 'Other'],
        default: 'Other',
    },
    tags: {
        type: [String],
        default: [],
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'hidden'],
        default: 'public',
    },
    moderators: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    members: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            role: {
                type: String,
                enum: ['member', 'moderator'],
                default: 'member',
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    pendingRequests: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            requestedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    coverImage: {
        type: String,
        default: "",
    },
    icon: {
        type: String,
        default: "👥", // Default emoji
    },
    postCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

// Virtual for member count
communitySchema.virtual('memberCount').get(function () {
    return this.members.length;
});

// Indexes for better query performance
communitySchema.index({ name: 1 });
communitySchema.index({ category: 1 });
communitySchema.index({ tags: 1 });
communitySchema.index({ visibility: 1 });

const Community = mongoose.model("Community", communitySchema);
export default Community;
