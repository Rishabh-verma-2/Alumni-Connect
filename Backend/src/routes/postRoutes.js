import express from 'express';
// Import updatePost
import { createPost, getAllPosts, deletePost, toggleLike, addComment, deleteComment, upload, updatePost } from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/posts', protect, upload.array('media', 10), createPost);
router.get('/posts', protect, getAllPosts);
router.put('/posts/:id', protect, upload.array('media', 5), updatePost); // New Route
router.delete('/posts/:id', protect, deletePost);
router.post('/posts/:id/like', protect, toggleLike);
router.post('/posts/:id/comment', protect, addComment);
router.delete('/posts/:postId/comment/:commentId', protect, deleteComment);

export default router;