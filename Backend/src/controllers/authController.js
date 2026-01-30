import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Enrollment from "../models/Enrollment.js";
import OtpVerification from "../models/OtpVerification.js";
import { generateOtp } from "../utils/generateOtp.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + 90 * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if(process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res.cookie("jwt", token, cookieOptions);

    user.password = undefined;
    user.otp = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
};

export async function signup(req,res,next) {
    const { username, email, password, enrollmentId, role } = req.body;
    console.log("Signup request:", { username, email, enrollmentId, role });

    try {
        // 1️⃣ check required fields
        if(!username || !email || !password || !enrollmentId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 2️⃣ check if user already exists
        console.log("Checking existing user...");
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        
        // 3️⃣ check enrollmentId in DB
        console.log("Checking enrollment...");
        const enrollmentExists = await Enrollment.findOne({ enrollmentId });
        if(!enrollmentExists) {
            return res.status(400).json({ message: "Invalid enrollmentId" });
        }

        // 4️⃣ hash password
        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5️⃣ create user but set isVerified = false
        console.log("Creating user...");
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            enrollmentId,
            role: enrollmentExists.role,
            isVerified: false,
        });
        console.log("User created:", newUser._id);
        
        // Log user creation
        try {
            const AuditLog = (await import('../models/AuditLog.js')).default;
            await AuditLog.create({
                action: 'CREATE',
                collection: 'User',
                documentId: newUser._id.toString(),
                userId: newUser._id.toString(),
                userRole: newUser.role,
                userEmail: newUser.email,
                changes: { username, email, role: newUser.role },
                ipAddress: req.ip
            });
        } catch (logError) {
            console.log('Audit log error:', logError);
        }

        // 6️⃣ generate OTP & expiry
        console.log("Creating OTP...");
        const otp = generateOtp(6);
        const expire = Date.now() + 10 * 60 * 1000;  // 10 minutes expiry

        await OtpVerification.create({
            userId: newUser._id,
            otp,
            expiresAt: expire,
        });
        console.log("OTP created");

        // Send OTP via email
        try {
            await sendEmail({
                email: newUser.email,
                subject: "OTP for email verification",
                html: `<h1>Your OTP is: ${otp}</h1><p>This OTP will expire in 10 minutes.</p>`
            });
            console.log(`OTP sent to ${email}: ${otp}`);
            createSendToken(newUser, 201, res);
        } catch (emailError) {
            console.log("Email error:", emailError.message);
            // Still create user but inform about email issue
            console.log(`OTP for ${email}: ${otp}`);
            createSendToken(newUser, 201, res);
        }

    } catch (error) {
        console.log("Signup error:", error.message);
        console.log("Full error:", error);
        try {
            await User.findOneAndDelete({email});
        } catch (deleteError) {
            console.log("Delete error:", deleteError);
        }
        res.status(500).json({ message: "Internal server error. Try Again" });
    }
};

// for verification of OTP
export async function verifyAccount(req, res, next) {
    const { email, otp } = req.body;
    console.log("Verify request body:", req.body);
    console.log("Email:", email, "OTP:", otp);

    try {
        // 1️⃣ check required fields
        if(!email || !otp) {
            console.log("Missing fields - email:", !!email, "otp:", !!otp);
            return res.status(400).json({ message: "All fields are required" });
        }

        // 2️⃣ check if user exists
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 3️⃣ check if OTP is valid
        const otpRecord = await OtpVerification.findOne({ userId: user._id, otp });
        if(!otpRecord) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // 4️⃣ check if OTP is expired
        if(otpRecord.expiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // 5️⃣ update user
        user.isVerified = true;
        await user.save();

        // 6️⃣ delete OTP
        await OtpVerification.deleteOne({ userId: user._id });

        res.status(200).json({ message: "Account verified" });
    } catch (error) {
        console.log("Verify account error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// for resend OTP 
export async function resendOTP (req, res, next) {
    const { email } = req.body;
    console.log("Resend OTP request:", { email });

    try {
        // 1️⃣ check if user exists
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2️⃣ check if user is already verified
        if(user.isVerified) {
            return res.status(400).json({ message: "User already verified" });
        }

        // 3️⃣ generate OTP & expiry
        const otp = generateOtp(6);
        const expire = Date.now() + 10 * 60 * 1000;  // 10 minutes expiry

        // 4️⃣ update OTP
        await OtpVerification.updateOne({ userId: user._id }, { otp, expiresAt: expire });

        // 5️⃣ send OTP via email
        await sendEmail({
            email: user.email,
            subject: "OTP for email verification",
            html: `<h1>Your OTP is: ${otp}</h1><p>This OTP will expire in 10 minutes.</p>`
        });
        console.log(`OTP sent to ${email}: ${otp}`);

        res.status(200).json({ message: "OTP resent" });
    } catch (error) {
        console.log("Resend OTP error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// login function
export async function login(req, res, next) {
    const { email, password } = req.body;
    console.log("Login request:", { email, password });

    try {
        // 1️⃣ check if user exists
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2️⃣ check if user is verified
        if(!user.isVerified) {
            return res.status(400).json({ message: "User not verified" });
        }

        // 3️⃣ check if password is correct
        const isMatch = await user.checkPassword(password);
        if(!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 4️⃣ log login activity
        try {
            const UserActivity = (await import('../models/UserActivity.js')).default;
            const activityLog = await UserActivity.create({
                action: 'LOGIN',
                userId: user._id,
                userEmail: user.email,
                userRole: user.role,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
            console.log('Login activity logged:', activityLog);
        } catch (logError) {
            console.log('Login activity log error:', logError);
        }

        // 5️⃣ create token
        createSendToken(user, 200, res);
    } catch (error) {
        console.log("Login error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// logout function
export async function logout(req, res, next) {
    try {
        // Log logout activity
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(req.user);
        if (user) {
            const UserActivity = (await import('../models/UserActivity.js')).default;
            const activityLog = await UserActivity.create({
                action: 'LOGOUT',
                userId: user._id,
                userEmail: user.email,
                userRole: user.role,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
            console.log('Logout activity logged:', activityLog);
        }
    } catch (logError) {
        console.log('Logout activity log error:', logError);
    }

    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({ message: "Logged out successfully" });
};

//forget password
export async function forgetPassword(req, res, next) {
    const { email } = req.body;
    console.log("Forget password request:", { email });

    try {
        // 1️⃣ check if user exists
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2️⃣ generate OTP & expiry
        const otp = generateOtp(6);
        const expire = Date.now() + 10 * 60 * 1000;  // 10 minutes expiry

        // 3️⃣ update OTP
        await OtpVerification.updateOne({ userId: user._id }, { otp, expiresAt: expire });

        // 4️⃣ send OTP via email
        await sendEmail({
            email: user.email,
            subject: "OTP for password reset",
            html: `<h1>Your OTP is: ${otp}</h1><p>This OTP will expire in 10 minutes.</p>`
        });
        console.log(`OTP sent to ${email}: ${otp}`);

        res.status(200).json({ message: "OTP sent" });
    } catch (error) {
        console.log("Forget password error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// reset password
export async function resetPassword(req, res, next) {
    const { email, otp, password } = req.body;
    console.log("Reset password request:", { email, otp, password });

    try {
        // 1️⃣ check if user exists
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2️⃣ check if OTP is valid
        const otpRecord = await OtpVerification.findOne({ userId: user._id, otp });
        if(!otpRecord) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // 3️⃣ check if OTP is expired
        if(otpRecord.expiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // 4️⃣ hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5️⃣ update user
        user.password = hashedPassword;
        await user.save();
        createSendToken(user, 200, res);

        // 6️⃣ delete OTP
        await OtpVerification.deleteOne({ userId: user._id });

        res.status(200).json({ message: "Password reset" });
    } catch (error) {
        console.log("Reset password error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// change password
export async function changePassword(req, res, next) {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user;
    
    try {
        // 1️⃣ check required fields
        if(!currentPassword || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        // 2️⃣ get user
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // 3️⃣ check current password
        const isMatch = await user.checkPassword(currentPassword);
        if(!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        
        // 4️⃣ hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // 5️⃣ update password
        user.password = hashedPassword;
        await user.save();
        
        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.log("Change password error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// update username
export async function updateUsername(req, res, next) {
    const { username } = req.body;
    const userId = req.user;
    
    try {
        // 1️⃣ check required fields
        if(!username) {
            return res.status(400).json({ message: "Username is required" });
        }
        
        if(username.length < 3) {
            return res.status(400).json({ message: "Username must be at least 3 characters" });
        }
        
        // 2️⃣ get user
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // 3️⃣ check if username already exists (optional - if you want unique usernames)
        const existingUser = await User.findOne({ username, _id: { $ne: userId } });
        if(existingUser) {
            return res.status(400).json({ message: "Username already taken" });
        }
        
        // 4️⃣ update username and name
        user.username = username;
        user.name = username;
        await user.save();
        
        res.status(200).json({ message: "Username updated successfully", username });
    } catch (error) {
        console.log("Update username error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// admin login function
export async function adminLogin(req, res, next) {
    const { email, password } = req.body;
    console.log("Admin login request:", { email });

    try {
        // 1️⃣ check required fields
        if(!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // 2️⃣ check if admin exists
        const admin = await Admin.findOne({ email });
        if(!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // 3️⃣ check if admin is active
        if(admin.status !== 'active') {
            return res.status(403).json({ message: "Admin account is not active" });
        }

        // 4️⃣ check if password is correct
        const isMatch = await admin.checkPassword(password);
        if(!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 5️⃣ update last login
        admin.lastLogin = new Date();
        await admin.save();

        // 6️⃣ log admin login activity
        try {
            const UserActivity = (await import('../models/UserActivity.js')).default;
            await UserActivity.create({
                action: 'LOGIN',
                userId: admin._id,
                userEmail: admin.email,
                userRole: 'admin',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
        } catch (logError) {
            console.log('Admin login activity log error:', logError);
        }

        // 7️⃣ create token
        const token = signToken(admin._id);
        const cookieOptions = {
            expires: new Date(
                Date.now() + 90 * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
        };

        if(process.env.NODE_ENV === "production") cookieOptions.secure = true;

        res.cookie("jwt", token, cookieOptions);

        admin.password = undefined;

        res.status(200).json({
            status: "success",
            token,
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    permissions: admin.permissions,
                    status: admin.status,
                    lastLogin: admin.lastLogin
                }
            },
        });
    } catch (error) {
        console.log("Admin login error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};