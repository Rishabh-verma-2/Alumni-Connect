import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
    createCommunity,
    getAllCommunities,
    getCommunityById,
    updateCommunity,
    deleteCommunity,
    joinCommunity,
    leaveCommunity,
    approveMember,
    removeMember,
    getCommunityMembers,
    getCommunityPosts,
    getUserCommunities,
    createCommunityPost,
    updateCommunityPost,
    deleteCommunityPost,
    togglePinPost,
} from "../controllers/communityController.js";

const router = express.Router();

// Community CRUD routes
router.post("/", protect, createCommunity);
router.get("/", getAllCommunities);
router.get("/:id", getCommunityById);
router.put("/:id", protect, updateCommunity);
router.delete("/:id", protect, deleteCommunity);

// Member management routes
router.post("/:id/join", protect, joinCommunity);
router.post("/:id/leave", protect, leaveCommunity);
router.post("/:id/approve", protect, approveMember);
router.post("/:id/remove", protect, removeMember);
router.get("/:id/members", getCommunityMembers);

// Community posts routes
router.get("/:id/posts", getCommunityPosts);
router.post("/:id/posts", protect, createCommunityPost);
router.put("/:id/posts/:postId", protect, updateCommunityPost);
router.delete("/:id/posts/:postId", protect, deleteCommunityPost);
router.post("/:id/posts/:postId/pin", protect, togglePinPost);

// User communities
router.get("/user/:userId", getUserCommunities);

export default router;
