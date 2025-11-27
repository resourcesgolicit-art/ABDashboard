const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../../Model/user');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body; // token from frontend

    if (!credential) {
      return res.status(400).json({ message: 'Google token missing' });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'No email returned from Google' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // If a local account exists, DO NOT override password or provider
      if (user.provider === 'local') {
        // Login allowed (same email)
      } else if (user.provider === 'google') {
        // Already Google user
      }
    } else {
      // Create new Google user
      user = await User.create({
        name,
        email,
        provider: 'google',
        picture,
        passwordHash: null,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};
