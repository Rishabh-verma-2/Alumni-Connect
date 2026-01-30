import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["post", "event"],
        default: "post"
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    media:[
        {
            type: String,   //images, videos etc.
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
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
            },
            content: {
                type: String,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    eventDetails: {
        date: Date,
        location: String,
        description: String,
        registrationink: String
    },
}, { timestamps: true });


const Post = mongoose.model("Post", postSchema);
export default Post;