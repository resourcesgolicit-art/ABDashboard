const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../../Model/user.js');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /auth/google
router.post('/', async (req, res) => {
  try {
    console.log('🔐 Google auth endpoint hit!');
    const { token, userInfo } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    let userData;

    if (userInfo) {
      // If user info is sent from frontend, use it directly
      userData = userInfo;
    } else {
      // Otherwise, fetch user info using the access token
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info from Google');
      }
      
      userData = await userInfoResponse.json();
    }

    const { email, name, picture, sub } = userData;

    console.log('👤 Google user:', { email, name });

    // Check if user exists → if not, create
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        picture,
        provider: 'google',
        googleId: sub // Store Google ID
      });
      console.log('✅ New user created:', user._id);
    } else {
      console.log('✅ Existing user found:', user._id);
    }

    // Generate JWT for your app
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture
      },
    });
  } catch (err) {
    console.error('❌ Google auth error:', err);
    res.status(400).json({ error: 'Authentication failed' });
  }
});

module.exports = router;