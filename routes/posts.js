const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Create a new post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const newPost = new Post({
      user: req.user.id,
      title,
      description,
      tags,
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Create Post Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all posts (with filtering)
router.get('/', async (req, res) => {
  try {
    const { userId, filter } = req.query;
    let postsQuery = Post.find();

    if (userId) {
      postsQuery = postsQuery.where('user').equals(userId);
    }

    if (filter === 'top') {
      postsQuery = postsQuery.sort({ likes: -1 });
    } else {
      postsQuery = postsQuery.sort({ createdAt: -1 });
    }

    const posts = await postsQuery
      .populate('user', 'username profilePicture')
      .populate({
        path: 'comments.user',
        select: 'username profilePicture',
      });

    res.json(posts);
  } catch (error) {
    console.error('Get Posts Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Like a post and send notification
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', '_id');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes.push(req.user.id);
    await post.save();

    // Fetch the sender's username
    const sender = await User.findById(req.user.id).select('username');
    if (!sender) return res.status(404).json({ message: 'Sender not found' });

    // Send notification to post owner (if not the same user)
    if (post.user._id.toString() !== req.user.id) {
      await User.findByIdAndUpdate(post.user._id, {
        $push: {
          notifications: {
            type: 'like',
            sender: req.user.id,
            postId: post._id,
            message: `${sender.username} liked your post`,
            createdAt: new Date(),
          },
        },
      });
    }

    res.json({ message: 'Post liked' });
  } catch (error) {
    console.error('Like Post Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Unlike a post
router.delete('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (!post.likes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Post not liked' });
    }

    post.likes = post.likes.filter(userId => userId.toString() !== req.user.id);
    await post.save();

    res.json({ message: 'Post unliked' });
  } catch (error) {
    console.error('Unlike Post Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add a comment to a post and send notification
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id).populate('user', '_id');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = {
      user: req.user.id,
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    // Fetch the sender's username
    const sender = await User.findById(req.user.id).select('username');
    if (!sender) return res.status(404).json({ message: 'Sender not found' });

    // Send notification to post owner (if not the same user)
    if (post.user._id.toString() !== req.user.id) {
      await User.findByIdAndUpdate(post.user._id, {
        $push: {
          notifications: {
            type: 'comment',
            sender: req.user.id,
            postId: post._id,
            message: `${sender.username} commented on your post: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`,
            createdAt: new Date(),
          },
        },
      });
    }

    // Return the updated post with populated data
    const updatedPost = await Post.findById(post._id)
      .populate('user', 'username profilePicture')
      .populate({
        path: 'comments.user',
        select: 'username profilePicture',
      });

    res.status(201).json({ message: 'Comment added', post: updatedPost });
  } catch (error) {
    console.error('Comment Post Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;