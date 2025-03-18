const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment', commentSchema);