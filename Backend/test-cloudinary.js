import cloudinary from './src/utils/cloudinary.js';
import dotenv from 'dotenv';

dotenv.config();

// Test Cloudinary connection
const testCloudinary = async () => {
    try {
        console.log('Testing Cloudinary connection...');
        console.log('Cloud Name:', process.env.CLOUD_NAME);
        console.log('API Key:', process.env.CLOUD_API_KEY ? 'Set' : 'Not Set');
        console.log('API Secret:', process.env.CLOUD_API_SECRET ? 'Set' : 'Not Set');
        
        // Test with a simple ping
        const result = await cloudinary.api.ping();
        console.log('Cloudinary connection successful:', result);
    } catch (error) {
        console.error('Cloudinary connection failed:', error.message);
    }
};

testCloudinary();