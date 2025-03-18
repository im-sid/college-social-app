const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Fetch all notifications for the logged-in user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching notifications for user:', userId); // Debug log

    const user = await User.findById(userId).populate('notifications.sender', 'username profilePicture');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/notifications/:index
// @desc    Mark a specific notification as read
// @access  Private
router.put('/:index', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const index = parseInt(req.params.index);
    console.log('Marking notification as read for user:', userId, 'at index:', index); // Debug log

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isNaN(index) || index < 0 || index >= user.notifications.length) {
      return res.status(400).json({ message: 'Invalid notification index' });
    }

    // Update the specific notification's read status without validating the entire document
    await User.findByIdAndUpdate(
      userId,
      { $set: { [`notifications.${index}.read`]: true } },
      { runValidators: false } // Skip validation for the entire document
    );

    // Fetch the updated user to return the modified notification
    const updatedUser = await User.findById(userId).populate('notifications.sender', 'username profilePicture');
    res.json({ message: 'Notification marked as read', notification: updatedUser.notifications[index] });
  } catch (error) {
    console.error('Error marking notification as read:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;