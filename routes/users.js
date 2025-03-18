const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Get the user's acquaintances
router.get('/acquaintances', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('acquaintances', 'username email profilePicture');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.acquaintances);
  } catch (error) {
    console.error('Error fetching acquaintances:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Fetch acquaintances of a specific user
router.get('/:userId/acquaintances', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate('acquaintances', 'username email profilePicture')
      .select('acquaintances');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.acquaintances);
  } catch (error) {
    console.error('Error fetching acquaintances:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Confirm an acquaintance request
router.post('/confirm-acquaintance/:userId', authMiddleware, async (req, res) => {
  try {
    const senderId = req.params.userId;
    const recipientId = req.user.id;
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    if (!recipient.pendingRequests.includes(senderId)) {
      return res.status(400).json({ message: 'No pending request from this user' });
    }
    recipient.pendingRequests = recipient.pendingRequests.filter((id) => id.toString() !== senderId);
    recipient.acquaintances.push(senderId);
    recipient.notifications = recipient.notifications.filter(
      (notification) =>
        !(notification.type === 'acquaintance_request' && notification.sender.toString() === senderId)
    );
    const sender = await User.findById(senderId);
    if (sender) {
      sender.acquaintances.push(recipientId);
      await sender.save();
    }
    await recipient.save();
    res.json({ message: 'Acquaintance confirmed successfully' });
  } catch (error) {
    console.error('Error confirming acquaintance:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Send an acquaintance request
router.post('/send-acquaintance-request/:userId', authMiddleware, async (req, res) => {
  try {
    const recipientId = req.params.userId;
    const senderId = req.user.id;

    // Fetch recipient to check conditions
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    // Check if the sender is already in the recipient's acquaintances or pending requests
    if (
      recipient.acquaintances.includes(senderId) ||
      recipient.pendingRequests.includes(senderId)
    ) {
      return res.status(400).json({ message: 'Request already sent or user is already an acquaintance' });
    }

    // Fetch sender's username
    const sender = await User.findById(senderId).select('username');
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Update recipient using findByIdAndUpdate to avoid full document validation
    await User.findByIdAndUpdate(
      recipientId,
      {
        $push: {
          pendingRequests: senderId,
          notifications: {
            type: 'acquaintance_request',
            sender: senderId,
            message: `${sender.username} sent you an acquaintance request`,
            read: false,
            createdAt: new Date(),
          },
        },
      },
      { runValidators: false } // Skip validation for the entire document
    );

    res.json({ message: 'Acquaintance request sent successfully' });
  } catch (error) {
    console.error('Error sending acquaintance request:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Reject an acquaintance request
router.post('/reject-acquaintance/:userId', authMiddleware, async (req, res) => {
  try {
    const senderId = req.params.userId;
    const recipientId = req.user.id;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    recipient.pendingRequests = recipient.pendingRequests.filter((id) => id.toString() !== senderId);
    recipient.notifications = recipient.notifications.filter(
      (notification) =>
        !(notification.type === 'acquaintance_request' && notification.sender.toString() === senderId)
    );
    await recipient.save();

    res.json({ message: 'Acquaintance request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting acquaintance:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get user profile
router.get('/profile/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('branch', 'name')
      .populate('skills', 'name')
      .select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Fetched Profile:', user);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;