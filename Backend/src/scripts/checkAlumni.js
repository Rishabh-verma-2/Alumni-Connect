
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
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const totalAlumni = await Alumni.countDocuments();
        const verifiedAlumni = await Alumni.countDocuments({ isVerified: true });

        console.log(`Total Alumni Profiles: ${totalAlumni}`);
        console.log(`Verified Alumni Profiles: ${verifiedAlumni}`);

        if (totalAlumni > 0) {
            const sample = await Alumni.findOne().populate('user');
            console.log('Sample Alumni:', JSON.stringify(sample, null, 2));
        } else {
            console.log("No alumni found. Checking Users with role 'alumni'...");
            const alumniUsers = await User.find({ role: 'alumni' });
            console.log(`Users with role 'alumni': ${alumniUsers.length}`);
            if (alumniUsers.length > 0) {
                console.log('Sample User (Alumni):', JSON.stringify(alumniUsers[0], null, 2));
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkDB();
