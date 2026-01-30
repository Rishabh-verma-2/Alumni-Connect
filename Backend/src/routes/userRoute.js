import express from "express";
import { forgetPassword, login, logout, resendOTP, resetPassword, signup, verifyAccount, changePassword, updateUsername, adminLogin } from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import User from "../models/User.js";

const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/verify", verifyAccount);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.post("/logout", logout);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", isAuthenticated, changePassword);
router.put("/update-username", isAuthenticated, updateUsername);

// Check authentication status
router.get("/me", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ 
      status: "success",
      data: { user }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Dashboard access route
router.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: "Account not verified" });
    }
    res.status(200).json({ 
      status: "success",
      message: "Dashboard access granted",
      data: { user }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;