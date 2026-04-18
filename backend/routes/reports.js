const express = require('express');
const jwt = require('jsonwebtoken');
const Report = require('../models/Report');
const User = require('../models/User');

const router = express.Router();

const auth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'karyon_secret_key');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
  }
};

// @route POST /api/reports
// @desc Create a report against a user
// @access Private
router.post('/', auth, async (req, res) => {
  try {
    const { targetUserId, reason, details, bookingId } = req.body;

    if (!targetUserId || !reason || !details) {
      return res.status(400).json({ success: false, message: 'targetUserId, reason, and details are required' });
    }

    if (String(targetUserId) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot report yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    const report = await Report.create({
      reporter: {
        userId: req.user._id,
        name: req.user.name,
        email: req.user.email
      },
      target: {
        userId: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        userType: targetUser.userType || 'unknown'
      },
      bookingId: bookingId || null,
      reason,
      details
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });
  } catch (error) {
    console.error('Create report error:', error);
    return res.status(500).json({ success: false, message: 'Server error while creating report' });
  }
});

// @route GET /api/reports/mine
// @desc List reports created by current user
// @access Private
router.get('/mine', auth, async (req, res) => {
  try {
    const reports = await Report.find({ 'reporter.userId': req.user._id }).sort({ createdAt: -1 }).limit(100);

    return res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Get my reports error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching reports' });
  }
});

module.exports = router;
