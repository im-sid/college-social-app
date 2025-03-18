const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Fetch all chats for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all chats involving the logged-in user
    const chats = await Chat.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .populate('sender', 'username profilePicture')
      .populate('recipient', 'username profilePicture')
      .sort({ createdAt: -1 });

    // Group chats by recipient/sender
    const groupedChats = {};
    chats.forEach((chat) => {
      const otherUserId = chat.sender._id.toString() === userId ? chat.recipient : chat.sender;
      if (!groupedChats[otherUserId._id]) {
        groupedChats[otherUserId._id] = {
          user: otherUserId,
          messages: [],
        };
      }
      groupedChats[otherUserId._id].messages.push({
        sender: chat.sender,
        message: chat.message,
        createdAt: chat.createdAt,
      });
    });

    // Convert grouped chats to an array and include the latest message
    const result = Object.values(groupedChats).map((chat) => ({
      user: chat.user,
      messages: chat.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      latestMessage: chat.messages[0]?.message || 'No messages yet',
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching chats:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Send a chat message
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.user.id;

    // Validate input
    if (!recipientId || !message) {
      return res.status(400).json({ message: 'Recipient ID and message are required' });
    }

    // Check if the recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Create a new chat message
    const newMessage = new Chat({
      sender: senderId,
      recipient: recipientId,
      message,
    });
    await newMessage.save();

    // Add a notification for the recipient if they're not an acquaintance
    if (!recipient.acquaintances.includes(senderId)) {
      recipient.notifications.push({
        type: 'message_request',
        sender: senderId,
        message: `You have a new message request from ${req.user.username}`,
      });
      await recipient.save();
    }

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Search for users by username
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const query = req.query.q;

    // Search for users whose username matches the query
    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.user.id }, // Exclude the logged-in user
    }).select('username profilePicture');

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;