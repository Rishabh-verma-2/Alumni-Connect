import mongoose from "mongoose"

const enrollmentSchema = new mongoose.Schema({
    enrollmentId: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ["student", "faculty", "alumni", "admin"]
    }
}, { timestamps: true });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;