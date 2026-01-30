import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0  }},
  // 👆 this tells MongoDB to auto-remove after expiresAt
}, {
  timestamps: true,
  expireAfterSeconds: 600, // 👆 this tells MongoDB to auto-remove after expiresAt
});

const OtpVerification = mongoose.model("OtpVerification", otpSchema);
export default OtpVerification;
