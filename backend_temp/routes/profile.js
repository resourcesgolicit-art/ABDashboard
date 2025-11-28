const express = require('express');
const Users = require('../Model/user');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /user/profile
 * @desc    Complete or update user profile
 * @access  Private (JWT required)
 */
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      fullName,
      phone,
      gender,
      city,
      state,
      image, // Cloudinary URL from frontend
    } = req.body;

    // Basic validation
    if (!fullName || !phone || !gender || !city || !state) {
      return res.status(400).json({
        success: false,
        message: 'All profile fields are required',
      });
    }

    const userId = req.user.id; // Extracted from JWT

    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      {
        fullName,
        phone,
        gender,
        city,
        state,
        profileImage: image || '',
        profileCompleted: true,
        updatedAt: new Date(),
      },
      { new: true }
    ).select('-passwordHash'); // remove sensitive data

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

module.exports = router;
