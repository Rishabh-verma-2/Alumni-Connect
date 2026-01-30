import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    messages: [
        {
           senderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
            readBy: [
                {
                    userId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                    readAt: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
            reactions: {
                type: Map,
                of: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                }],
                default: new Map()
            },
            replyTo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Chat.messages",
                default: null
            }
        },

    ],
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;