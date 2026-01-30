import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin'
    },
    phone: {
        type: String,
    },
    //Access control of the whole website
    permissions: {
        type: [String],
        default: [
            "manageUsers",
            "manageAlumni",
            "manageStudents",
            "manageUniversities",
            "manageEvents",
            "managePosts",
            "manageJobs",
            "siteSettings",
            "viewReports"
        ]
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

// Add password comparison method
adminSchema.methods.checkPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const adminModel = mongoose.model('Admin', adminSchema);
export default adminModel;