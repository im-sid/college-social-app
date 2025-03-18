const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tags: {
    type: [String], // Array of tags
    default: [],
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId], // Array of user IDs who liked the post
    default: [],
  },
  dislikes: {
    type: [mongoose.Schema.Types.ObjectId], // Array of user IDs who disliked the post
    default: [],
  },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
      },
      text: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  shares: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Post', postSchema);