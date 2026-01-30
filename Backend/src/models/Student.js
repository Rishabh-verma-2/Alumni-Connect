import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    bio: { 
        type: String,
         default: "" 
    },
    yearOfJoining: {
        type: Number,
        default: null,
    },
    yearOfPassing: {
        type: Number,
        default: null,
    },
    branch: {
        type: String,
        default: "",
    },
    phoneNumber: {
        type: String,
        default: "",
    },
    interests: {
        type: [String],
        default: [],
    },
    skills: {
        type: [String],
        default: [],
    },
    socialLinks: {
        linkedin: {
            type: String,
            default: "",
        },
        github: {
            type: String,
            default: "",
        },
        twitter: {
            type: String,
            default: "",
        },
        instagram: {
            type: String,
            default: "",
        },
        facebook: {
            type: String,
            default: "",
        },
    },
    profilePicture: {
        type: String,
        default: "",
    },
    // coverPicture: {
    //     type: String,
    // },
    isVerified: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);
export default Student;
