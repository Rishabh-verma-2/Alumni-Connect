import mongoose from "mongoose";

//notifications to sho on alumni & student notifications section for accepted or connect request
const notificationSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["connectionRequest", "acceptedConnection", "rejectedConnection", "message"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

}, {timestamps: true});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
