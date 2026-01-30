import Chat from '../models/Chat.js';
import User from '../models/User.js';

// Get or create chat between two users
export const getOrCreateChat = async (req, res) => {
  try {
    const { participantId } = req.params;
    const userId = req.user._id;

    // Find existing chat
    let chat = await Chat.findOne({
      participants: { $all: [userId, participantId] }
    }).populate('participants', 'name username role')
      .populate('messages.senderId', 'name username');

    // Create new chat if doesn't exist
    if (!chat) {
      chat = await Chat.create({
        participants: [userId, participantId],
        messages: []
      });
      
      chat = await Chat.findById(chat._id)
        .populate('participants', 'name username role')
        .populate('messages.senderId', 'name username');
    } else {
      // Mark all messages as read by current user
      let hasUpdates = false;
      chat.messages.forEach(message => {
        if (message.senderId._id.toString() !== userId.toString()) {
          const alreadyRead = message.readBy.some(read => read.userId.toString() === userId.toString());
          if (!alreadyRead) {
            message.readBy.push({ userId, readAt: new Date() });
            hasUpdates = true;
          }
        }
      });
      
      if (hasUpdates) {
        await chat.save();
        console.log(`Marked messages as read for user ${userId} in chat ${chat._id}`);
      }
    }

    res.json({ success: true, chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, replyTo } = req.body;
    const senderId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.includes(senderId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Find replied message if replyTo is provided
    let replyToMessage = null;
    if (replyTo) {
      replyToMessage = chat.messages.id(replyTo);
    }

    // Add message
    const messageData = {
      senderId,
      content,
      timestamp: new Date()
    };
    
    if (replyToMessage) {
      messageData.replyTo = {
        _id: replyToMessage._id,
        content: replyToMessage.content,
        senderId: replyToMessage.senderId
      };
    }
    
    chat.messages.push(messageData);

    await chat.save();

    // Populate the new message
    const updatedChat = await Chat.findById(chatId)
      .populate('messages.senderId', 'name username');

    const newMessage = updatedChat.messages[updatedChat.messages.length - 1];
    
    // Ensure reply data is included
    if (replyToMessage && newMessage.replyTo) {
      newMessage.replyTo = {
        _id: replyToMessage._id,
        content: replyToMessage.content,
        senderId: replyToMessage.senderId
      };
    }

    // Emit real-time message to other participants
    const io = req.app.get('io');
    chat.participants.forEach(participantId => {
      if (participantId.toString() !== senderId.toString()) {
        io.to(participantId.toString()).emit('newMessage', {
          chatId: chat._id,
          message: newMessage
        });
      }
    });

    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get user's chats
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Only get chats where user is still a participant
    const chats = await Chat.find({
      participants: userId
    }).populate('participants', 'name username role')
      .sort({ updatedAt: -1 });

    res.json({ success: true, chats });
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Only get chats where user is still a participant
    const chats = await Chat.find({
      participants: userId
    });

    let unreadCount = 0;
    const unreadPerChat = {};
    
    // If no chats found, return 0 count
    if (!chats || chats.length === 0) {
      console.log(`User ${userId} has no chats, returning 0 unread count`);
      return res.json({ success: true, unreadCount: 0, unreadPerChat: {} });
    }
    
    chats.forEach(chat => {
      // Skip if user is not in participants (shouldn't happen due to query, but safety check)
      if (!chat.participants.some(p => p.toString() === userId.toString())) {
        return;
      }
      
      // Skip if chat has no messages
      if (!chat.messages || chat.messages.length === 0) {
        return;
      }
      
      let chatUnreadCount = 0;
      chat.messages.forEach(message => {
        if (message.senderId.toString() !== userId.toString()) {
          const isRead = message.readBy.some(read => read.userId.toString() === userId.toString());
          if (!isRead) {
            unreadCount++;
            chatUnreadCount++;
          }
        }
      });
      
      // Find the other participant (not current user)
      const otherParticipant = chat.participants.find(p => p.toString() !== userId.toString());
      if (otherParticipant && chatUnreadCount > 0) {
        unreadPerChat[otherParticipant.toString()] = chatUnreadCount;
      }
    });

    console.log(`User ${userId} unread count: ${unreadCount}, chats found: ${chats.length}`);
    res.json({ success: true, unreadCount, unreadPerChat });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete chat
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Chat.findByIdAndDelete(chatId);
    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete specific message
export const deleteMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Find and remove the message
    const messageIndex = chat.messages.findIndex(msg => msg._id.toString() === messageId);
    if (messageIndex === -1) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Check if user owns the message
    if (chat.messages[messageIndex].senderId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Can only delete your own messages' });
    }

    chat.messages.splice(messageIndex, 1);
    await chat.save();

    // Emit real-time message deletion to other participants
    const io = req.app.get('io');
    chat.participants.forEach(participantId => {
      if (participantId.toString() !== userId.toString()) {
        io.to(participantId.toString()).emit('messageDeleted', {
          chatId: chat._id,
          messageId
        });
      }
    });

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Add or remove reaction to a message
export const toggleMessageReaction = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const { reaction } = req.body;
    const userId = req.user._id;

    if (!reaction) {
      return res.status(400).json({ success: false, message: 'Reaction is required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Find the message
    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Initialize reactions if not exists
    if (!message.reactions) {
      message.reactions = new Map();
    }

    // Get current users who reacted with this emoji
    const currentReactors = message.reactions.get(reaction) || [];
    const userIndex = currentReactors.findIndex(id => id.toString() === userId.toString());

    if (userIndex > -1) {
      // Remove reaction
      currentReactors.splice(userIndex, 1);
      if (currentReactors.length === 0) {
        message.reactions.delete(reaction);
      } else {
        message.reactions.set(reaction, currentReactors);
      }
    } else {
      // Add reaction
      currentReactors.push(userId);
      message.reactions.set(reaction, currentReactors);
    }

    await chat.save();

    // Emit real-time reaction update to other participants
    const io = req.app.get('io');
    chat.participants.forEach(participantId => {
      if (participantId.toString() !== userId.toString()) {
        io.to(participantId.toString()).emit('messageReactionUpdated', {
          chatId: chat._id,
          messageId,
          reactions: Object.fromEntries(message.reactions)
        });
      }
    });

    res.json({ 
      success: true, 
      reactions: Object.fromEntries(message.reactions)
    });
  } catch (error) {
    console.error('Toggle message reaction error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
export const leaveChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Remove user from participants
    chat.participants = chat.participants.filter(p => p.toString() !== userId.toString());
    
    // If no participants left, delete the chat
    if (chat.participants.length === 0) {
      await Chat.findByIdAndDelete(chatId);
    } else {
      await chat.save();
    }

    res.json({ success: true, message: 'Left chat successfully' });
  } catch (error) {
    console.error('Leave chat error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};