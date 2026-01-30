import express from 'express';
import { getOrCreateChat, sendMessage, getUserChats, getUnreadCount, deleteChat, deleteMessage, leaveChat, toggleMessageReaction } from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/chats', protect, getUserChats);
router.get('/chat/:participantId', protect, getOrCreateChat);
router.post('/chat/:chatId/message', protect, sendMessage);
router.get('/unread-count', protect, getUnreadCount);
router.delete('/chat/:chatId', protect, deleteChat);
router.delete('/chat/:chatId/message/:messageId', protect, deleteMessage);
router.post('/chat/:chatId/message/:messageId/reaction', protect, toggleMessageReaction);
router.post('/chat/:chatId/leave', protect, leaveChat);

export default router;