# Profile Image Upload Feature

## Overview
This feature allows students to upload and update their profile pictures using Cloudinary for image storage and processing.

## Backend Setup

### Dependencies Added
- `cloudinary` - For image storage and processing
- `multer` - For handling multipart/form-data file uploads

### Files Created/Modified
1. **Models**: `Student.js` - Added `profilePicture` field
2. **Utils**: `cloudinary.js` - Cloudinary configuration
3. **Middleware**: `upload.js` - Multer configuration for file uploads
4. **Controllers**: `studentController.js` - Added `uploadProfileImage` function
5. **Routes**: `studentRoutes.js` - Added POST route for image upload

### Environment Variables Required
```
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

### API Endpoint
```
POST /api/v1/student/profile/:id/upload-image
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: FormData with 'profileImage' field containing the image file
```

## Frontend Setup

### Features Added
1. **Image Display**: Shows profile picture or initials fallback
2. **Upload Button**: Camera icon overlay on profile picture
3. **File Validation**: Checks file type and size (max 5MB)
4. **Loading States**: Visual feedback during upload
5. **Error Handling**: User-friendly error messages

### File Modifications
1. **API**: `api.js` - Added `uploadProfileImage` function
2. **Component**: `StudentProfile.jsx` - Added image upload functionality

## Usage

1. **Upload Image**: Click the camera icon on the profile picture
2. **File Selection**: Choose an image file (JPEG, PNG, WebP)
3. **Automatic Upload**: Image is automatically uploaded and processed
4. **Visual Feedback**: Loading spinner and success/error messages

## Image Processing
- **Size**: Automatically resized to 400x400 pixels
- **Format**: Optimized for web delivery
- **Storage**: Stored in Cloudinary with organized folder structure

## Error Handling
- File type validation (images only)
- File size validation (max 5MB)
- Network error handling
- Authentication error handling
- Cloudinary upload error handling

## Testing
1. Start the backend server: `npm run dev`
2. Ensure Cloudinary credentials are set in `.env`
3. Test the upload functionality in the frontend
4. Check Cloudinary dashboard for uploaded images