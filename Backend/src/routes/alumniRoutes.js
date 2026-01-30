import express from 'express';
import { getAllAlumni, getAllAlumniForAdmin, getAlumniProfile, createAlumniProfile, updateAlumniProfile } from '../controllers/alumniController.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';

const router = express.Router();

// Get all alumni
router.get('/', getAllAlumni);

// Get all alumni for admin (must be before /:id route)
router.get('/all', isAuthenticated, getAllAlumniForAdmin);

// Get single alumni profile
router.get('/:id', getAlumniProfile);

// Create alumni profile (protected)
router.post('/', isAuthenticated, createAlumniProfile);

// Update alumni profile (protected)
router.put('/:id', isAuthenticated, updateAlumniProfile);

export default router;