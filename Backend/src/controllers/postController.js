import Post from '../models/Posts.js';
import Alumni from '../models/Alumni.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const createPost = async (req, res) => {
  try {
    const { type, content, title, description, eventDate, location } = req.body;

    let mediaUrls = [];

    // Upload files to Cloudinary if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(file.buffer);
        });
        mediaUrls.push(result.secure_url);
      }
    }

    const postData = {
      userId: req.user.id,
      type: type === 'general' ? 'post' : type,
      title,
      content,
      media: mediaUrls
    };

    if (type === 'event') {
      postData.eventDetails = {
        date: eventDate ? new Date(eventDate) : null,
        location,
        description
      };
    }

    const post = new Post(postData);
    await post.save();
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { type, content, title, description, eventDate, location } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Handle new media
    let newMediaUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(file.buffer);
        });
        newMediaUrls.push(result.secure_url);
      }
    }

    // Update fields
    post.title = title || post.title;
    post.content = content || post.content;
    post.type = type || post.type;

    if (type === 'event') {
      post.eventDetails = {
        date: eventDate ? new Date(eventDate) : post.eventDetails.date,
        location: location || post.eventDetails.location,
        description: description || post.eventDetails.description
      };
    }

    // Handle Media Update
    // existingMedia comes from the frontend for every URL the user KEPT.
    // If undefined/empty, it means user removed all previous images (or there were none).
    let keptMedia = [];
    if (req.body.existingMedia) {
      keptMedia = Array.isArray(req.body.existingMedia) ? req.body.existingMedia : [req.body.existingMedia];
    }

    // Identify removed media to clean up Cloudinary
    const oldMedia = post.media || [];
    const mediaToDelete = oldMedia.filter(url => !keptMedia.includes(url));

    if (mediaToDelete.length > 0) {
      for (const mediaUrl of mediaToDelete) {
        try {
          // Extract public_id
          const publicId = mediaUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Failed to delete image from Cloudinary:', err);
        }
      }
    }

    // Combine kept + new
    post.media = [...keptMedia, ...newMediaUrls].slice(0, 5);

    await post.save();
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'name role username')
      .populate('comments.userId', 'name role username')
      .sort({ createdAt: -1 });

    // Get alumni profile pictures for users who are alumni
    const postsWithProfilePics = await Promise.all(
      posts.map(async (post) => {
        const postObj = post.toObject();
        if (postObj.userId.role === 'alumni') {
          const alumni = await Alumni.findOne({ user: postObj.userId._id }).select('profilePicture _id');
          if (alumni) {
            postObj.userId.profilePicture = alumni.profilePicture;
            postObj.userId.alumniId = alumni._id; // Add alumni ID for navigation
          }
        }
        return postObj;
      })
    );

    res.json({ success: true, posts: postsWithProfilePics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    // Delete media files from Cloudinary
    if (post.media && post.media.length > 0) {
      for (const mediaUrl of post.media) {
        try {
          // Extract public_id from Cloudinary URL
          const publicId = mediaUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.error('Error deleting media from Cloudinary:', cloudinaryError);
        }
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json({ success: true, likes: post.likes.length, isLiked: !isLiked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = {
      userId: req.user.id,
      content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    const populatedPost = await Post.findById(req.params.id)
      .populate('comments.userId', 'name role');

    res.json({ success: true, comments: populatedPost.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    post.comments.pull(commentId);
    await post.save();

    const populatedPost = await Post.findById(postId)
      .populate('comments.userId', 'name role');

    res.json({ success: true, comments: populatedPost.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};