
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Alumni from '../models/Alumni.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seed = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('Connected to DB');

        // Find the alumni user
        const alumniUser = await User.findOne({ role: 'alumni' });

        if (!alumniUser) {
            console.log('No user with role "alumni" found.');
            return;
        }

        console.log(`Found alumni user: ${alumniUser.username} (${alumniUser._id})`);

        // Check if profile exists
        const exists = await Alumni.findOne({ user: alumniUser._id });
        if (exists) {
            console.log('Alumni profile already exists. Updating to verified...');
            exists.isVerified = true;
            await exists.save();
            console.log('Updated to verified.');
        } else {
            console.log('Creating new Alumni profile...');
            await Alumni.create({
                user: alumniUser._id,
                yearOfPassing: 2023,
                branch: "Computer Science",
                currentCompany: "Tech Google",
                currentDesignation: "Software Engineer",
                currentLocation: "Bangalore, India",
                achievements: "Built a scalable AI agent system.",
                isVerified: true,
                socialLinks: {
                    linkedin: "https://linkedin.com",
                    github: "https://github.com"
                }
            });
            console.log('Created sample alumni profile.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

seed();
