
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Alumni from '../models/Alumni.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in .env");
        }
        await mongoose.connect(mongoUri);
        console.log('Connected to DB');

        const totalAlumni = await Alumni.countDocuments();
        const verifiedAlumni = await Alumni.countDocuments({ isVerified: true });

        console.log(`Total Alumni Profiles: ${totalAlumni}`);
        console.log(`Verified Alumni Profiles: ${verifiedAlumni}`);

        const users = await User.countDocuments({ role: 'alumni' });
        console.log(`Total Users with role 'alumni': ${users}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkDB();
