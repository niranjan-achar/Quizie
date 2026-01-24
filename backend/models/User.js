const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Supports both Google OAuth and traditional username/password authentication
 */
const userSchema = new mongoose.Schema({
  // Basic Info
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9._]+$/,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },

  // Authentication
  password: {
    type: String,
    select: false // Don't return password by default
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allow null values
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },

  // Profile
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  
  // Statistics
  stats: {
    totalQuizzesTaken: {
      type: Number,
      default: 0
    },
    totalQuizzesCreated: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    highestScore: {
      type: Number,
      default: 0
    },
    totalRoomsJoined: {
      type: Number,
      default: 0
    },
    totalRoomsCreated: {
      type: Number,
      default: 0
    }
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for rooms
userSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'members.user'
});

// Hash password before saving (only for local auth)
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and exists
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update stats
userSchema.methods.updateStats = async function(statsUpdate) {
  Object.keys(statsUpdate).forEach(key => {
    if (this.stats[key] !== undefined) {
      this.stats[key] = statsUpdate[key];
    }
  });
  await this.save();
};

// Static method to find by username or email
userSchema.statics.findByUsernameOrEmail = function(identifier) {
  return this.findOne({
    $or: [
      { username: identifier.toLowerCase() },
      { email: identifier.toLowerCase() }
    ]
  });
};

// Static method to check username availability
userSchema.statics.isUsernameAvailable = async function(username) {
  const user = await this.findOne({ username: username.toLowerCase() });
  return !user;
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    displayName: this.displayName,
    avatar: this.avatar,
    bio: this.bio,
    stats: this.stats,
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
