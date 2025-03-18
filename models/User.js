const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: 'https://via.placeholder.com/150',
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch', // Reference to the Branch model
  },
  skills: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill', // Reference to the Skill model
    },
  ],
  registerNumber: {
    type: String, // Register number as a string
    trim: true, // Remove leading/trailing whitespace
  },
  notifications: [
    {
      type: {
        type: String,
        enum: ['acquaintance_request', 'like', 'comment', 'message'],
        required: true,
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
      message: {
        type: String,
      },
      read: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  acquaintances: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  pendingRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

module.exports = mongoose.model('User', userSchema);