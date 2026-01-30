import Notification from "../models/Notification.js";
import ConnectionRequest from "../models/ConnectionRequest.js";
import User from "../models/User.js";

// Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    console.log('Send connection request - senderId:', senderId, 'receiverId:', receiverId);
    console.log('User object:', req.user);

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Sender ID and Receiver ID are required' });
    }

    // Check if request already exists
    const existingRequest = await ConnectionRequest.findOne({
      senderId,
      receiverId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Connection request already exists' });
    }

    // Create connection request
    const connectionRequest = await ConnectionRequest.create({
      senderId,
      receiverId
    });

    // Get sender info
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Create notification for receiver
    const notification = await Notification.create({
      senderId,
      receiverId,
      message: `${sender.name || sender.username} sent you a connection request`,
      type: 'connectionRequest'
    });

    // Emit real-time notification
    const io = req.app.get('io');
    io.to(receiverId.toString()).emit('newNotification', {
      ...notification.toObject(),
      senderId: { name: sender.name, username: sender.username }
    });

    res.status(201).json({ message: 'Connection request sent successfully' });
  } catch (error) {
    console.error('Send connection request error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Accept/Reject connection request
export const respondToConnectionRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; // action: 'accept' or 'reject'
    const userId = req.user._id;

    const connectionRequest = await ConnectionRequest.findById(requestId);
    if (!connectionRequest) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    if (connectionRequest.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    connectionRequest.status = action === 'accept' ? 'accepted' : 'rejected';
    await connectionRequest.save();

    const receiver = await User.findById(userId);

    // Remove any existing connectionRequest notifications for this request
    await Notification.deleteMany({
      senderId: connectionRequest.senderId,
      receiverId: userId,
      type: 'connectionRequest'
    });

    const io = req.app.get('io');

    if (action === 'accept') {
      // Add both users to each other's connections
      await User.findByIdAndUpdate(userId, {
        $addToSet: { connections: connectionRequest.senderId }
      });

      await User.findByIdAndUpdate(connectionRequest.senderId, {
        $addToSet: { connections: userId }
      });

      // Create notification for sender
      const notification = await Notification.create({
        senderId: userId,
        receiverId: connectionRequest.senderId,
        message: `${receiver.name || receiver.username} accepted your connection request`,
        type: 'acceptedConnection'
      });

      // Emit real-time notification
      io.to(connectionRequest.senderId.toString()).emit('newNotification', {
        ...notification.toObject(),
        senderId: { name: receiver.name, username: receiver.username }
      });
    } else if (action === 'reject') {
      // Create notification for sender about rejection
      const notification = await Notification.create({
        senderId: userId,
        receiverId: connectionRequest.senderId,
        message: `${receiver.name || receiver.username} rejected your connection request`,
        type: 'rejectedConnection'
      });

      // Emit real-time notification
      io.to(connectionRequest.senderId.toString()).emit('newNotification', {
        ...notification.toObject(),
        senderId: { name: receiver.name, username: receiver.username }
      });
    }

    res.status(200).json({ message: `Connection request ${action}ed successfully` });
  } catch (error) {
    console.error('Respond to connection request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ receiverId: userId })
      .populate('senderId', 'name username profilePicture')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ data: notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark notification as read (delete it)
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    await Notification.findOneAndDelete(
      { _id: notificationId, receiverId: userId }
    );

    res.status(200).json({ message: 'Notification removed' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Clear all notifications for user
export const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ receiverId: userId });

    res.status(200).json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get connection requests for alumni
export const getConnectionRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ConnectionRequest.find({
      receiverId: userId,
      status: 'pending'
    })
      .populate('senderId', 'name username profilePicture role')
      .sort({ createdAt: -1 });

    res.status(200).json({ data: requests });
  } catch (error) {
    console.error('Get connection requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get connection requests sent by user
export const getSentConnectionRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ConnectionRequest.find({
      senderId: userId,
      status: 'pending'
    })
      .populate('receiverId', 'name username profilePicture role');

    res.status(200).json({ data: requests });
  } catch (error) {
    console.error('Get sent connection requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user connections
export const getConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate('connections', 'name username role email')
      .select('connections');

    // Get alumni data for connections who are alumni
    const connections = user?.connections || [];
    const enrichedConnections = await Promise.all(
      connections.map(async (connection) => {
        if (connection.role === 'alumni') {
          const Alumni = (await import('../models/Alumni.js')).default;
          const alumniData = await Alumni.findOne({ user: connection._id });
          return {
            ...connection.toObject(),
            profilePicture: alumniData?.profilePicture || '',
            currentCompany: alumniData?.currentCompany || '',
            currentDesignation: alumniData?.currentDesignation || '',
            branch: alumniData?.branch || ''
          };
        } else if (connection.role === 'student') {
          const Student = (await import('../models/Student.js')).default;
          const studentData = await Student.findOne({ user: connection._id });
          return {
            ...connection.toObject(),
            profilePicture: studentData?.profilePicture || '',
            branch: studentData?.branch || '',
            yearOfPassing: studentData?.yearOfPassing || ''
          };
        }
        return connection.toObject();
      })
    );

    res.status(200).json({ data: enrichedConnections });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove connection
export const removeConnection = async (req, res) => {
  try {
    const userId = req.user._id;
    const { connectionId } = req.params;

    // Remove from both users' connections
    await User.findByIdAndUpdate(userId, {
      $pull: { connections: connectionId }
    });

    await User.findByIdAndUpdate(connectionId, {
      $pull: { connections: userId }
    });

    // Remove the connection request record
    await ConnectionRequest.deleteMany({
      $or: [
        { senderId: userId, receiverId: connectionId },
        { senderId: connectionId, receiverId: userId }
      ]
    });

    res.json({ success: true, message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};