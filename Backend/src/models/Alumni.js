import mongoose from "mongoose";

const alumniSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    yearOfPassing: {
        type: Number,
        required: true,
    },
    branch: {
        type: String,
        required: true,
    },
    currentCompany: {
        type: String,
        default: "",
    },
    currentDesignation: {
        type: String,
        default: "",
    },
    currentLocation: {
        type: String,
        default: "",
    },
    profilePicture: {
        type: String,
        default: "",
    },
    // coverPicture: {
    //     type: String,
    //     default: "",
    // },
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
    achievements: {
        type: String,
        default: "",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Alumni = mongoose.model("Alumni", alumniSchema);
export default Alumni;
