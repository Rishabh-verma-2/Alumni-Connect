import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Student from "../models/Student.js";
import Alumni from "../models/Alumni.js";
import Post from "../models/Posts.js";
import Enrollment from "../models/Enrollment.js";
import { sendBroadcastEmail } from "../services/emailService.js";

// Test email function
export const testEmail = async (req, res) => {
    try {
        const testResult = await sendBroadcastEmail(
            [{ name: 'Test User', email: process.env.EMAIL_USER }],
            'Test Email from Alumni Connect',
            'This is a test email to verify the email service is working.'
        );
        
        res.status(200).json({
            status: 'success',
            message: 'Test email sent',
            data: testResult
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Test email failed',
            error: error.message
        });
    }
};

// Get admin dashboard statistics
export const getAdminDashboardStats = async (req, res) => {
    try {
        console.log('Dashboard request from user ID:', req.user);
        
        // Try to find admin in Admin model first, then User model
        let currentUser = await Admin.findById(req.user).select('role name email status');
        let isAdminModel = true;
        
        if (!currentUser) {
            // Try User model
            currentUser = await User.findById(req.user).select('role username email name');
            isAdminModel = false;
        }
        
        console.log('Found user:', currentUser, 'isAdminModel:', isAdminModel);
        
        if (!currentUser) {
            console.log('User not found in database for ID:', req.user);
            return res.status(404).json({ 
                status: 'error',
                message: 'User account not found. Please login again.' 
            });
        }
        
        // Check admin role
        const userRole = currentUser.role;
        if (userRole !== 'admin') {
            console.log('Access denied for non-admin user:', userRole);
            return res.status(403).json({ 
                status: 'error',
                message: 'Access denied. Admin privileges required.' 
            });
        }
        
        // Check admin status if from Admin model
        if (isAdminModel && currentUser.status !== 'active') {
            return res.status(403).json({ 
                status: 'error',
                message: 'Admin account is not active.' 
            });
        }
        
        console.log('Admin access granted for user:', currentUser.name || currentUser.username);

        // Get all statistics with proper error handling
        const [
            totalUsers,
            totalStudents, 
            totalAlumni,
            totalPosts,
            verifiedUsers,
            totalEnrollments,
            recentUsers
        ] = await Promise.all([
            User.countDocuments().catch(() => 0),
            User.countDocuments({ role: 'student' }).catch(() => 0),
            User.countDocuments({ role: 'alumni' }).catch(() => 0),
            Post.countDocuments().catch(() => 0),
            User.countDocuments({ isVerified: true }).catch(() => 0),
            Enrollment.countDocuments().catch(() => 0),
            User.find()
                .select('username role createdAt')
                .sort({ createdAt: -1 })
                .limit(5)
                .catch(() => [])
        ]);
        
        console.log('Admin Dashboard Stats:', {
            totalUsers,
            totalStudents,
            totalAlumni,
            totalPosts,
            verifiedUsers,
            totalEnrollments
        });
        
        // Format recent activities
        const activities = recentUsers.map(user => ({
            message: `New ${user.role} registered: ${user.username}`,
            time: new Date(user.createdAt).toLocaleDateString(),
            color: user.role === 'student' ? 'bg-blue-500' : 
                   user.role === 'alumni' ? 'bg-green-500' : 'bg-purple-500'
        }));
        
        res.status(200).json({
            status: 'success',
            data: {
                stats: {
                    totalUsers,
                    totalStudents,
                    totalAlumni,
                    totalPosts,
                    verifiedUsers,
                    totalEnrollments
                },
                activities
            }
        });
    } catch (error) {
        console.error('Admin dashboard stats error:', error);
        res.status(500).json({ 
            status: 'error',
            message: "Failed to fetch dashboard statistics",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Test admin connection
export const testAdminConnection = async (req, res) => {
    try {
        res.status(200).json({ 
            status: 'success',
            message: "Admin routes working",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Admin test error:', error);
        res.status(500).json({ 
            status: 'error',
            message: "Admin test failed",
            error: error.message
        });
    }
};

// Get current admin user info
export const getCurrentAdmin = async (req, res) => {
    try {
        // Try Admin model first
        let currentUser = await Admin.findById(req.user).select('-password');
        let isAdminModel = true;
        
        if (!currentUser) {
            // Try User model
            currentUser = await User.findById(req.user).select('-password');
            isAdminModel = false;
        }
        
        if (!currentUser) {
            return res.status(404).json({ 
                status: 'error',
                message: 'User not found' 
            });
        }
        
        // Check admin role
        if (currentUser.role !== 'admin') {
            return res.status(403).json({ 
                status: 'error',
                message: 'Access denied. Admin privileges required.' 
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: currentUser._id,
                    name: currentUser.name || currentUser.username,
                    username: currentUser.username || currentUser.name,
                    email: currentUser.email,
                    role: currentUser.role,
                    permissions: currentUser.permissions || [],
                    status: currentUser.status || 'active',
                    isVerified: currentUser.isVerified || true
                }
            }
        });
    } catch (error) {
        console.error('Get current admin error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all users for admin
export const getAllUsers = async (req, res) => {
    try {
        console.log('Getting all users for admin, user ID:', req.user);
        
        if (!req.user) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Authentication required' 
            });
        }
        
        // Verify admin access
        let currentUser = null;
        try {
            currentUser = await Admin.findById(req.user).select('role');
            if (!currentUser) {
                currentUser = await User.findById(req.user).select('role');
            }
        } catch (dbError) {
            console.error('Database error finding user:', dbError);
            return res.status(500).json({ 
                status: 'error',
                message: 'Database connection error' 
            });
        }
        
        if (!currentUser) {
            return res.status(404).json({ 
                status: 'error',
                message: 'User not found' 
            });
        }
        
        if (currentUser.role !== 'admin') {
            return res.status(403).json({ 
                status: 'error',
                message: 'Access denied. Admin privileges required.' 
            });
        }

        console.log('Admin verified, fetching users...');
        const users = await User.find({})
            .select('username email name enrollmentId role createdAt isVerified updatedAt')
            .lean()
            .sort({ createdAt: -1 });
        
        console.log(`Found ${users.length} users`);
        
        res.status(200).json({
            status: 'success',
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
        });
    }
};

// Send broadcast email/notification
export const sendBroadcast = async (req, res) => {
    try {
        console.log('Broadcast request from user:', req.user);
        console.log('Broadcast data:', req.body);
        
        if (!req.user) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Authentication required' 
            });
        }
        
        // Verify admin access
        let currentUser = null;
        try {
            currentUser = await Admin.findById(req.user).select('role');
            if (!currentUser) {
                currentUser = await User.findById(req.user).select('role');
            }
        } catch (dbError) {
            console.error('Database error in broadcast:', dbError);
            return res.status(500).json({ 
                status: 'error',
                message: 'Database connection error' 
            });
        }
        
        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ 
                status: 'error',
                message: 'Access denied. Admin privileges required.' 
            });
        }

        const { userIds, subject, message } = req.body;
        
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ 
                status: 'error',
                message: 'User IDs are required' 
            });
        }
        
        if (!subject || !message) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Subject and message are required' 
            });
        }

        // Get user emails
        const users = await User.find({ _id: { $in: userIds } }).select('email name username');
        
        console.log('Found users for broadcast:', users.map(u => ({ id: u._id, email: u.email, name: u.name || u.username })));
        
        if (users.length === 0) {
            return res.status(404).json({ 
                status: 'error',
                message: 'No users found with the provided IDs' 
            });
        }

        const recipients = users.map(u => ({ 
            id: u._id,
            email: u.email, 
            name: u.name || u.username 
        }));
        
        console.log('Broadcasting message to:', recipients.length, 'users');
        
        // Send actual emails
        const emailResult = await sendBroadcastEmail(recipients, subject, message);
        
        if (!emailResult.success) {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to send emails',
                error: emailResult.error
            });
        }
        
        res.status(200).json({
            status: 'success',
            message: `Broadcast sent to ${emailResult.sent} users${emailResult.failed > 0 ? ` (${emailResult.failed} failed)` : ''}`,
            data: {
                recipientCount: users.length,
                emailsSent: emailResult.sent,
                emailsFailed: emailResult.failed,
                recipients: recipients.map(r => ({ name: r.name, email: r.email })),
                subject,
                sentAt: new Date()
            }
        });
    } catch (error) {
        console.error('Send broadcast error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
        });
    }
};

export const getLoginLogs = async (req, res) => {
    res.status(200).json({
        status: 'success',
        count: 0,
        data: []
    });
};

export const getAuditLogs = async (req, res) => {
    res.status(200).json({
        status: 'success',
        count: 0,
        data: []
    });
};