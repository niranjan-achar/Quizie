const User = require('../models/User');
const { generateTokens } = require('../utils/jwt');

/**
 * Authentication Controller
 * Handles user registration, login, and Google OAuth
 */

class AuthController {
  /**
   * @route   POST /api/auth/register
   * @desc    Register new user with username/email/password
   * @access  Public
   */
  async register(req, res, next) {
    try {
      const { username, email, password, displayName } = req.body;

      console.log('📝 Registration attempt:', { username, email, displayName });

      // Check if user exists
      const existingUser = await User.findByUsernameOrEmail(username) || 
                           await User.findByUsernameOrEmail(email);

      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Username or email already exists'
        });
      }

      // Create user
      const user = new User({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
        displayName,
        authProvider: 'local',
        isVerified: true // Auto-verify for now
      });

      await user.save();

      // Generate tokens
      const tokens = generateTokens(user._id);

      console.log('✅ User registered successfully:', user.username);

      res.status(201).json({
        status: 'success',
        message: 'Registration successful',
        data: {
          user: user.getPublicProfile(),
          tokens
        }
      });

    } catch (error) {
      console.error('❌ Registration error:', error);
      next(error);
    }
  }

  /**
   * @route   POST /api/auth/login
   * @desc    Login with username/email and password
   * @access  Public
   */
  async login(req, res, next) {
    try {
      const { identifier, password } = req.body;

      console.log('🔐 Login attempt:', identifier);

      // Find user
      const user = await User.findByUsernameOrEmail(identifier).select('+password');

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);

      if (!isValidPassword) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'Account has been deactivated'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const tokens = generateTokens(user._id);

      console.log('✅ Login successful:', user.username);

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: user.getPublicProfile(),
          tokens
        }
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      next(error);
    }
  }

  /**
   * @route   GET /api/auth/me
   * @desc    Get current user profile
   * @access  Private
   */
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user._id);

      res.status(200).json({
        status: 'success',
        data: {
          user: user.getPublicProfile()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PUT /api/auth/profile
   * @desc    Update user profile
   * @access  Private
   */
  async updateProfile(req, res, next) {
    try {
      const { displayName, bio, avatar } = req.body;
      const user = await User.findById(req.user._id);

      if (displayName) user.displayName = displayName;
      if (bio !== undefined) user.bio = bio;
      if (avatar !== undefined) user.avatar = avatar;

      await user.save();

      console.log('✅ Profile updated:', user.username);

      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
          user: user.getPublicProfile()
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/auth/check-username/:username
   * @desc    Check if username is available
   * @access  Public
   */
  async checkUsername(req, res, next) {
    try {
      const { username } = req.params;
      const isAvailable = await User.isUsernameAvailable(username);

      res.status(200).json({
        status: 'success',
        data: {
          username,
          available: isAvailable
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/auth/google
   * @desc    Google OAuth callback
   * @access  Public
   */
  async googleAuth(req, res, next) {
    try {
      const { googleId, email, displayName, avatar } = req.body;

      console.log('🔐 Google OAuth attempt:', email);

      // Find or create user
      let user = await User.findOne({ googleId });

      if (!user) {
        // Check if email exists
        user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
          // Link Google account to existing user
          user.googleId = googleId;
          user.authProvider = 'google';
          if (!user.avatar) user.avatar = avatar;
        } else {
          // Create new user
          // Generate unique username from email
          let username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          let isUnique = false;
          let counter = 0;

          while (!isUnique) {
            const suffix = counter > 0 ? counter : '';
            const testUsername = username + suffix;
            isUnique = await User.isUsernameAvailable(testUsername);
            if (isUnique) {
              username = testUsername;
            }
            counter++;
          }

          user = new User({
            username,
            email: email.toLowerCase(),
            displayName,
            avatar,
            googleId,
            authProvider: 'google',
            isVerified: true
          });
        }

        await user.save();
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const tokens = generateTokens(user._id);

      console.log('✅ Google auth successful:', user.username);

      res.status(200).json({
        status: 'success',
        message: 'Google authentication successful',
        data: {
          user: user.getPublicProfile(),
          tokens
        }
      });

    } catch (error) {
      console.error('❌ Google auth error:', error);
      next(error);
    }
  }
}

module.exports = new AuthController();
