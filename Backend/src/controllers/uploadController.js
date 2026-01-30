import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

export const uploadProfilePicture = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ 
        status: 'error',
        message: 'No image file provided' 
      });
    }

    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Only image files are allowed' 
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'alumni-connect/profile-pictures',
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload successful:', result.secure_url);
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    res.status(200).json({
      status: 'success',
      imageUrl: result.secure_url
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to upload image',
      error: error.message 
    });
  }
};