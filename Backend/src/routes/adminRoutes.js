import express from "express";
import { getAdminDashboardStats, testAdminConnection, getCurrentAdmin, getAllUsers, sendBroadcast, testEmail } from "../controllers/adminController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const getLoginLogs = async (req, res) => {
  try {
    const UserActivity = (await import('../models/UserActivity.js')).default;
    const activities = await UserActivity.find()
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.status(200).json({ 
      status: 'success', 
      count: activities.length, 
      data: activities 
    });
  } catch (error) {
    console.error('Login logs error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    console.log('Fetching audit logs...');
    const AuditLog = (await import('../models/AuditLog.js')).default;
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(50);
    console.log('Found logs:', logs.length);
    res.status(200).json({ status: 'success', count: logs.length, data: logs });
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const createTestLogs = async (req, res) => {
  try {
    const UserActivity = (await import('../models/UserActivity.js')).default;
    const testLogs = [
      {
        action: 'LOGIN',
        userId: '507f1f77bcf86cd799439011',
        userEmail: 'test@example.com',
        userRole: 'student',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test Browser'
      },
      {
        action: 'LOGOUT',
        userId: '507f1f77bcf86cd799439011',
        userEmail: 'test@example.com',
        userRole: 'student',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test Browser'
      }
    ];
    const created = await UserActivity.insertMany(testLogs);
    res.status(200).json({ status: 'success', message: 'Test logs created', count: created.length });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteAllLogs = async (req, res) => {
  try {
    const UserActivity = (await import('../models/UserActivity.js')).default;
    const result = await UserActivity.deleteMany({});
    res.status(200).json({ status: 'success', message: 'All logs deleted', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const router = express.Router();

// Test endpoints
router.get("/test", testAdminConnection);
router.post("/test-email", isAuthenticated, testEmail);

// Admin user routes
router.get("/me", isAuthenticated, getCurrentAdmin);
router.get("/users", isAuthenticated, getAllUsers);
router.get("/login-logs", getLoginLogs);
router.post("/create-test-logs", createTestLogs);
router.delete("/delete-all-logs", deleteAllLogs);
router.get("/audit-logs", isAuthenticated, getAuditLogs);
router.post("/broadcast", isAuthenticated, sendBroadcast);

// Admin dashboard routes
router.get("/dashboard-stats", isAuthenticated, getAdminDashboardStats);

export default router;