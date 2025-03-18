const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Branch = require('../models/Branch');
const Skill = require('../models/Skills');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Register validation middleware
const registerValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

// Register a new user
router.post('/register', registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, branch, skills, registerNumber } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const branchObj = await Branch.findById(branch);
    if (!branchObj) {
      return res.status(400).json({ message: 'Invalid branch' });
    }

    const skillObjs = await Skill.find({ _id: { $in: skills } });
    if (skillObjs.length !== skills.length) {
      return res.status(400).json({ message: 'One or more skills are invalid' });
    }

    const salt = await bcrypt.genSalt(12); // Increased cost factor
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      password: hashedPassword,
      branch: branchObj._id,
      skills: skillObjs.map(skill => skill._id),
      registerNumber,
    });

    await user.save();

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Login a user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('branch', 'name')
      .populate('skills', 'name')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile Fetch Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { username, email, branch, skills, registerNumber, profilePicture } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (branch && !(await Branch.exists({ _id: branch }))) {
      return res.status(400).json({ message: 'Invalid branch' });
    }

    if (skills && skills.length > 0) {
      const validSkills = await Skill.find({ _id: { $in: skills } });
      if (validSkills.length !== skills.length) {
        return res.status(400).json({ message: 'One or more skills are invalid' });
      }
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.branch = branch || user.branch;
    user.skills = skills || user.skills;
    user.registerNumber = registerNumber || user.registerNumber;
    user.profilePicture = profilePicture || user.profilePicture;

    const updatedUser = await user.save();
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Profile Update Error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;