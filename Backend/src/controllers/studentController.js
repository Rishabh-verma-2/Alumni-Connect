import Student from "../models/Student.js";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import Post from "../models/Posts.js";
import cloudinary from "../utils/cloudinary.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        // Verify user is admin
        const currentUser = await User.findById(req.user);
        if (!currentUser) {
            return res.status(404).json({ 
                status: 'error',
                message: 'User not found.' 
            });
        }
        
        if (currentUser.role !== 'admin') {
            return res.status(403).json({ 
                status: 'error',
                message: 'Access denied. Admin privileges required.' 
            });
        }

        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalAlumni = await User.countDocuments({ role: 'alumni' });
        const totalPosts = await Post.countDocuments();
        const verifiedUsers = await User.countDocuments({ isVerified: true });
        const totalEnrollments = await Enrollment.countDocuments();
        
        console.log('Dashboard Stats:', {
            totalUsers,
            totalStudents,
            totalAlumni,
            totalPosts,
            verifiedUsers,
            totalEnrollments
        });
        
        // Recent activities (last 5 users)
        const recentUsers = await User.find()
            .select('username role createdAt')
            .sort({ createdAt: -1 })
            .limit(5);
        
        const activities = recentUsers.map(user => ({
            message: `New ${user.role} registered: ${user.username}`,
            time: new Date(user.createdAt).toLocaleDateString(),
            color: user.role === 'student' ? 'bg-blue-500' : user.role === 'alumni' ? 'bg-green-500' : 'bg-purple-500'
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
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Create new enrollment
export const createEnrollment = async (req, res) => {
    try {
        const { enrollmentId, role } = req.body;
        
        if (!enrollmentId || !role) {
            return res.status(400).json({ message: "Enrollment ID and role are required" });
        }
        
        // Check if enrollment already exists
        const existingEnrollment = await Enrollment.findOne({ enrollmentId });
        if (existingEnrollment) {
            return res.status(409).json({ message: "Enrollment ID already exists" });
        }
        
        const newEnrollment = await Enrollment.create({ enrollmentId, role });
        
        res.status(201).json({
            status: 'success',
            message: 'Enrollment created successfully',
            data: newEnrollment
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete enrollment
export const deleteEnrollment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedEnrollment = await Enrollment.findByIdAndDelete(id);
        
        if (!deletedEnrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }
        
        res.status(200).json({
            status: 'success',
            message: 'Enrollment deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all enrollments for admin (all roles)
export const getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({})
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            status: 'success',
            count: enrollments.length,
            data: enrollments
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all students for admin
export const getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('username email name enrollmentId createdAt isVerified updatedAt')
            .lean()
            .sort({ createdAt: -1 });
        
        // Get student profiles for additional info
        const studentProfiles = await Student.find({})
            .populate('user', 'username email name enrollmentId createdAt isVerified')
            .lean();
        
        // Merge user data with profile data
        const enrichedStudents = students.map(user => {
            const profile = studentProfiles.find(p => p.user && p.user._id.toString() === user._id.toString());
            return {
                ...user,
                profile: profile ? {
                    phone: profile.phone,
                    dateOfBirth: profile.dateOfBirth,
                    gender: profile.gender,
                    address: profile.address,
                    course: profile.course,
                    year: profile.year,
                    cgpa: profile.cgpa,
                    skills: profile.skills,
                    interests: profile.interests,
                    profilePicture: profile.profilePicture,
                    bio: profile.bio,
                    isVerified: profile.isVerified,
                    socialLinks: profile.socialLinks
                } : null
            };
        });
        
        res.status(200).json({
            status: 'success',
            count: enrichedStudents.length,
            data: enrichedStudents
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get student profile by user ID
export const getStudentProfile = async (req, res) => {
    try {
        const { id } = req.params;
        
        const studentProfile = await Student.findOne({ user: id }).populate('user', 'username email name enrollmentId');
        
        if (!studentProfile) {
            return res.status(404).json({ message: "Student profile not found" });
        }
        
        res.status(200).json(studentProfile);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update student profile
export const updateStudentProfile = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('Updating profile for user ID:', id);
        console.log('Request body:', req.body);
        
        // Ensure socialLinks has default structure and set verified status
        const profileData = {
            ...req.body,
            user: id,
            isVerified: true, // Auto-verify when profile is updated
            socialLinks: {
                linkedin: '',
                github: '',
                twitter: '',
                instagram: '',
                facebook: '',
                ...(req.body.socialLinks || {})
            }
        };
        
        console.log('Profile data to save:', profileData);
        
        const updatedProfile = await Student.findOneAndUpdate(
            { user: id },
            profileData,
            { new: true, runValidators: true, upsert: true }
        ).populate('user', 'username email name enrollmentId');
        
        console.log('Profile saved successfully:', updatedProfile._id);
        res.status(200).json(updatedProfile);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Upload profile image
export const uploadProfileImage = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('Upload request for user:', id);
        console.log('File info:', req.file ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        } : 'No file');
        
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }
        
        // Validate file type
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ message: "Only image files are allowed" });
        }
        
        // Validate file size (5MB)
        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({ message: "Image size should be less than 5MB" });
        }
        
        // Convert buffer to base64 for Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        
        console.log('Uploading to Cloudinary...');
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "alumni_connect/profiles",
            public_id: `profile_${id}_${Date.now()}`,
            transformation: [
                { width: 400, height: 400, crop: "fill" },
                { quality: "auto" }
            ]
        });
        
        console.log('Cloudinary upload successful:', result.secure_url);
        
        // Update student profile with image URL
        const updatedProfile = await Student.findOneAndUpdate(
            { user: id },
            { profilePicture: result.secure_url },
            { new: true, upsert: true }
        ).populate('user', 'username email name enrollmentId');
        
        console.log('Profile updated successfully');
        
        res.status(200).json({ 
            message: "Profile image uploaded successfully", 
            profilePicture: result.secure_url,
            profile: updatedProfile 
        });
    } catch (error) {
        console.error('Upload image error:', error);
        
        if (error.message.includes('Invalid image file')) {
            return res.status(400).json({ message: "Invalid image file format" });
        }
        
        if (error.message.includes('File size too large')) {
            return res.status(400).json({ message: "Image file is too large" });
        }
        
        res.status(500).json({ 
            message: "Failed to upload image", 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Verify student manually
export const verifyStudent = async (req, res) => {
    try {
        const { id } = req.params;
        
        const updatedProfile = await Student.findOneAndUpdate(
            { user: id },
            { isVerified: true },
            { new: true, upsert: true }
        ).populate('user', 'username email name enrollmentId');
        
        res.status(200).json({ message: "Student verified successfully", profile: updatedProfile });
    } catch (error) {
        console.error('Verify student error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};