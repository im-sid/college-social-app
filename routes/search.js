const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// @route   GET /api/search
// @desc    Search for posts, users, and tags
// @access  Public
router.get('/', async (req, res) => {
  try {
    const query = req.query.q; // Search query from the frontend

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // Search for posts
    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [query] } },
      ],
    }).limit(5); // Limit results to 5

    // Search for users
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    }).limit(5); // Limit results to 5

    // Search for tags
    const tags = await Post.distinct('tags', { tags: { $regex: query, $options: 'i' } });

    res.json({ posts, users, tags });
  } catch (error) {
    console.error('Error in search route:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;