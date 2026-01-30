import express from 'express';
import { uploadProfilePicture, upload } from '../controllers/uploadController.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';

const router = express.Router();

router.post('/profile-picture', isAuthenticated, upload.single('image'), uploadProfilePicture);

export default router;