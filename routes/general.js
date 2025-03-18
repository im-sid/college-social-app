const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const Skill = require('../models/Skills');

// @route   GET /api/branches
// @desc    Get all branches
// @access  Public
router.get('/branches', async (req, res) => {
  try {
    const branches = await Branch.find({}, 'name'); // Fetch only the name field
    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/skills
// @desc    Get all skills
// @access  Public
router.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.find({}, 'name'); // Fetch only the name field
    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;