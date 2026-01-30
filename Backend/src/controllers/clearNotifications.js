import Notification from "../models/Notification.js";
import ConnectionRequest from "../models/ConnectionRequest.js";

// Clear all notifications and connection requests
export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    await ConnectionRequest.deleteMany({});
    
    res.status(200).json({ message: 'All notifications and connection requests cleared' });
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};