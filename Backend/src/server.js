import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./lib/db.js";
import userRoute from "./routes/userRoute.js";
import studentRoutes from "./routes/studentRoutes.js";
import alumniRoutes from "./routes/alumniRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174'],
    credentials: true
  }
});
const PORT = process.env.PORT || 5001;

// Make io available to routes
app.set('io', io);

app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/alumni", alumniRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1", chatRoutes);
app.use("/api/v1", notificationRoutes);
app.use("/api/v1", postRoutes);
app.use("/api/v1/upload", uploadRoutes);

// Test route
app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'Server working', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

try {
  server.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    connectDB();
  });
} catch (err) {
  console.error('Server startup error:', err);
}

// Socket.IO connection handling with comprehensive error handling
try {
  io.on('connection', (socket) => {
    try {
      console.log('User connected:', socket.id);
      
      socket.on('join', (userId) => {
        try {
          if (userId) {
            socket.join(userId);
            console.log(`User ${userId} joined room`);
          }
        } catch (error) {
          console.error('Error joining room:', error);
        }
      });
      
      socket.on('disconnect', () => {
        try {
          console.log('User disconnected:', socket.id);
        } catch (error) {
          console.error('Error on disconnect:', error);
        }
      });
      
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
      
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  });
  
  // Handle Socket.IO errors
  io.on('error', (error) => {
    console.error('Socket.IO error:', error);
  });
} catch (error) {
  console.error('Failed to setup Socket.IO:', error);
}