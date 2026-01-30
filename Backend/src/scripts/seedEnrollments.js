import mongoose from "mongoose";
import "dotenv/config";
import Enrollment from "../models/Enrollment.js";

// for inserting all the data to database 
// run this command in terminal :- node src/scripts/seedEnrollments.js

const enrollments = [
    { enrollmentId: "2403031461105", role: "student" },
    { enrollmentId: "2403031460712", role: "alumni" },
    { enrollmentId: "2403031460300", role: "student" },
    { enrollmentId: "2403031461063", role: "student" },
    { enrollmentId: "2403031460439", role: "student" },
    { enrollmentId: "2403031460675", role: "student" },
];

const seedEnrollments = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Enrollment.deleteMany({});
        console.log("Enrollments deleted successfully");
        await Enrollment.insertMany(enrollments);
        console.log("Enrollments seeded successfully");
        process.exit();
    } catch (error) {
        console.error("Error seeding enrollments:", error);
        process.exit(1);
    }
};

seedEnrollments();