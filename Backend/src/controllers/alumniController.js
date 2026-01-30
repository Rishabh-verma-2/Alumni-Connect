import Alumni from "../models/Alumni.js";
import User from "../models/User.js";

// Get all alumni with basic info
export async function getAllAlumni(req, res) {
    try {
        const alumni = await Alumni.find({ isVerified: true })
            .populate('user', 'name email role username')
            .select('yearOfPassing branch currentCompany currentDesignation currentLocation profilePicture socialLinks achievements');
        
        const alumniData = alumni.map(alum => ({
            _id: alum._id,
            userId: alum.user._id, // Add the user ID for connection requests
            name: alum.user.name || alum.user.username,
            email: alum.user.email,
            role: alum.user.role,
            enrollmentId: alum.user.enrollmentId,
            yearOfPassing: alum.yearOfPassing,
            branch: alum.branch,
            currentCompany: alum.currentCompany,
            currentDesignation: alum.currentDesignation,
            currentLocation: alum.currentLocation,
            profilePicture: alum.profilePicture,
            socialLinks: alum.socialLinks,
            achievements: alum.achievements
        }));

        res.status(200).json({
            status: 'success',
            results: alumniData.length,
            data: alumniData
        });
    } catch (error) {
        console.error('Get alumni error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Get all alumni for admin (includes unverified)
export async function getAllAlumniForAdmin(req, res) {
    try {
        const alumni = await User.find({ role: 'alumni' })
            .select('username email name enrollmentId createdAt isVerified updatedAt')
            .lean()
            .sort({ createdAt: -1 });
        
        // Get alumni profiles for additional info
        const alumniProfiles = await Alumni.find({})
            .populate('user', 'username email name enrollmentId createdAt isVerified')
            .lean();
        
        // Merge user data with profile data
        const enrichedAlumni = alumni.map(user => {
            const profile = alumniProfiles.find(p => p.user && p.user._id.toString() === user._id.toString());
            return {
                ...user,
                profile: profile ? {
                    phone: profile.phone,
                    dateOfBirth: profile.dateOfBirth,
                    gender: profile.gender,
                    address: profile.address,
                    course: profile.branch,
                    graduationYear: profile.yearOfPassing,
                    currentCompany: profile.currentCompany,
                    jobTitle: profile.currentDesignation,
                    experience: profile.experience,
                    skills: profile.skills,
                    achievements: profile.achievements,
                    profilePicture: profile.profilePicture,
                    bio: profile.bio,
                    isVerified: profile.isVerified,
                    socialLinks: profile.socialLinks
                } : null
            };
        });
        
        res.status(200).json({
            status: 'success',
            count: enrichedAlumni.length,
            data: enrichedAlumni
        });
    } catch (error) {
        console.error('Get alumni for admin error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Get single alumni profile
export async function getAlumniProfile(req, res) {
    try {
        const { id } = req.params;
        console.log('Fetching alumni profile for ID:', id);
        
        // Try to find by Alumni ID first
        let alumni = await Alumni.findById(id)
            .populate('user', 'name email role username enrollmentId');
        
        // If not found by Alumni ID, try to find by User ID
        if (!alumni) {
            console.log('Alumni not found by Alumni ID, trying User ID...');
            alumni = await Alumni.findOne({ user: id })
                .populate('user', 'name email role username enrollmentId');
        }
        
        if (!alumni) {
            console.log('Alumni not found by either ID');
            return res.status(404).json({ message: 'Alumni not found' });
        }

        console.log('Found alumni:', alumni);
        const alumniData = {
            _id: alumni._id,
            userId: alumni.user._id,
            name: alumni.user.name || alumni.user.username,
            email: alumni.user.email,
            role: alumni.user.role,
            enrollmentId: alumni.user.enrollmentId,
            yearOfPassing: alumni.yearOfPassing,
            branch: alumni.branch,
            currentCompany: alumni.currentCompany,
            currentDesignation: alumni.currentDesignation,
            currentLocation: alumni.currentLocation,
            profilePicture: alumni.profilePicture,
            socialLinks: alumni.socialLinks,
            achievements: alumni.achievements,
            isVerified: alumni.isVerified
        };

        res.status(200).json({
            status: 'success',
            data: alumniData
        });
    } catch (error) {
        console.error('Get alumni profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Create alumni profile
export async function createAlumniProfile(req, res) {
    try {
        const alumniData = req.body;
        console.log('Creating alumni with data:', alumniData); // Debug log
        
        const alumni = await Alumni.create(alumniData);
        
        res.status(201).json({
            status: 'success',
            data: alumni
        });
    } catch (error) {
        console.error('Create alumni profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Update alumni profile
export async function updateAlumniProfile(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        console.log('Updating alumni with data:', updateData); // Debug log
        
        const alumni = await Alumni.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        }).populate('user', 'name email role username');
        
        if (!alumni) {
            return res.status(404).json({ message: 'Alumni not found' });
        }

        console.log('Updated alumni:', alumni); // Debug log
        res.status(200).json({
            status: 'success',
            data: alumni
        });
    } catch (error) {
        console.error('Update alumni profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}