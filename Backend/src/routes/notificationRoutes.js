import express from 'express';
import { 
  sendConnectionRequest, 
  respondToConnectionRequest, 
  getNotifications, 
  markNotificationAsRead,
  getConnectionRequests,
  getConnections,
  removeConnection,
  clearAllNotifications
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/connection-request', protect, sendConnectionRequest);
router.post('/connection-response', protect, respondToConnectionRequest);
router.get('/notifications', protect, getNotifications);
router.patch('/notifications/:notificationId/read', protect, markNotificationAsRead);
router.delete('/notifications/clear-all', protect, clearAllNotifications);
router.get('/connection-requests', protect, getConnectionRequests);
router.get('/connections', protect, getConnections);
router.delete('/connections/:connectionId', protect, removeConnection);

export default router;