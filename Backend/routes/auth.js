const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const Users = require('../Model/user');
const { generateToken } = require('../middleware/auth');
const {
  validate,
  userRegistrationSchema,
  userLoginSchema,
} = require('../middleware/validation');

const router = express.Router();

const { googleLogin } = require('../controllers/auth/googleAuth');

router.post('/google-login', googleLogin);

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register endpoint
router.post(
  '/register',
  authLimiter,
  validate(userRegistrationSchema),
  async (req, res) => {
    try {
      const { name, email, password, phone, role } = req.body;

      // Check if user already exists
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const userData = {
        name,
        email,
        passwordHash,
        phone,
        role: role || 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        orders: [],
        testimonials: [],
      };

      const user = new Users(userData);
      await user.save();

      // Generate token
      const token = generateToken(user._id, user.role);

      // Remove sensitive data from response
      const userResponse = user.toObject();
      delete userResponse.passwordHash;

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userResponse,
          token,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);

      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(409).json({
          success: false,
          message: `${field} already exists`,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error',
      });
    }
  }
);

// Login endpoint
router.post(
  '/login',
  authLimiter,
  validate(userLoginSchema),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Generate token
      const token = generateToken(user._id, user.role);

      // Remove sensitive data from response
      const userResponse = user.toObject();
      delete userResponse.passwordHash;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error',
      });
    }
  }
);

// Logout endpoint (client-side token removal, but server can blacklist if needed)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.',
  });
});

// Forgot password endpoint
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if user exists
    const user = await Users.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.json({
        success: true,
        message:
          'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // In a real application, you would:
    // 1. Generate a reset token
    // 2. Save it to the database with expiration
    // 3. Send email with reset link

    // For now, we'll just simulate the process
    console.log(`Password reset requested for: ${email}`);

    // TODO: Implement actual email sending logic here
    // You can use nodemailer, SendGrid, or similar service

    res.json({
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
    });
  }
});

// Verify token endpoint
router.get(
  '/verify',
  require('../middleware/auth').authenticateToken,
  (req, res) => {
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user,
      },
    });
  }
);

module.exports = router;
