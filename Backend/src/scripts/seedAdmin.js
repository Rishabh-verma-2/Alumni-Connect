import adminModel from "../models/Admin.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import "dotenv/config";

// for inserting all the data to database 
// run this command in terminal :- node src/scripts/seedAdmin.js

// Default admin credentials (secret for owner only)
const adminEmail = "superadmin@alumniconnect.com";
const adminPassword = "Admin@123456"; // Strong admin password

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // delete all exisiting admins
        await adminModel.deleteMany({});
        console.log("🗑️ All existing admins deleted");

        // hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // create one super admin
        await adminModel.create({
            name: "Super Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
            status: "active",
            permissions: [
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
        });
        
        console.log("✅ Super admin created successfully");
        process.exit();
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();