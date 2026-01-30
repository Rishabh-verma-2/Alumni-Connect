import express from "express";
import { getDashboardStats, createEnrollment, deleteEnrollment, getAllEnrollments, getAllStudents, getStudentProfile, updateStudentProfile, verifyStudent, uploadProfileImage } from "../controllers/studentController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Test endpoint
router.get("/test", (req, res) => {
    res.json({ message: "Student routes working" });
});

// Admin routes
router.get("/dashboard-stats", isAuthenticated, getDashboardStats);
router.post("/enrollments", isAuthenticated, createEnrollment);
router.delete("/enrollments/:id", isAuthenticated, deleteEnrollment);
router.get("/enrollments", isAuthenticated, getAllEnrollments);
router.get("/all", isAuthenticated, getAllStudents);
router.get("/profile/:id", isAuthenticated, getStudentProfile);
router.put("/profile/:id", isAuthenticated, updateStudentProfile);
router.post("/profile/:id/upload-image", isAuthenticated, upload.single('profileImage'), uploadProfileImage);
router.patch("/verify/:id", isAuthenticated, verifyStudent);

export default router;