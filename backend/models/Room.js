const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Room Schema
 * For multiplayer quiz sessions with groups
 */
const roomSchema = new mongoose.Schema({
  // Room Identity
  roomCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },

  // Room Creator/Host
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Room Members
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['host', 'member'],
      default: 'member'
    }
  }],

  // Quiz Configuration
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    default: null
  },
  
  // Room Settings
  settings: {
    maxMembers: {
      type: Number,
      default: 50,
      min: 2,
      max: 100
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    allowMemberInvite: {
      type: Boolean,
      default: true
    },
    showLeaderboardDuringQuiz: {
      type: Boolean,
      default: false
    }
  },

  // Room Status
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'closed'],
    default: 'waiting',
    index: true
  },

  // Quiz Session Data
  session: {
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      attempt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizAttempt'
      },
      score: {
        type: Number,
        default: 0
      },
      rank: {
        type: Number,
        default: 0
      },
      completedAt: {
        type: Date,
        default: null
      }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
roomSchema.index({ roomCode: 1 });
roomSchema.index({ host: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ createdAt: -1 });
roomSchema.index({ 'members.user': 1 });

// Generate unique room code
roomSchema.statics.generateRoomCode = async function() {
  let roomCode;
  let isUnique = false;

  while (!isUnique) {
    // Generate 6-character alphanumeric code
    roomCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    // Check if code already exists
    const existingRoom = await this.findOne({ roomCode });
    if (!existingRoom) {
      isUnique = true;
    }
  }

  return roomCode;
};

// Method to add member
roomSchema.methods.addMember = async function(userId) {
  // Check if already a member
  const isMember = this.members.some(m => m.user.toString() === userId.toString());
  if (isMember) {
    throw new Error('User is already a member of this room');
  }

  // Check if room is full
  if (this.members.length >= this.settings.maxMembers) {
    throw new Error('Room is full');
  }

  // Check if room is closed
  if (this.status === 'closed') {
    throw new Error('Room is closed');
  }

  // Add member
  this.members.push({
    user: userId,
    role: 'member',
    joinedAt: new Date()
  });

  await this.save();
  return this;
};

// Method to remove member
roomSchema.methods.removeMember = async function(userId) {
  this.members = this.members.filter(m => m.user.toString() !== userId.toString());
  await this.save();
  return this;
};

// Method to start quiz
roomSchema.methods.startQuiz = async function(quizId) {
  if (this.status !== 'waiting') {
    throw new Error('Quiz can only be started from waiting status');
  }

  this.quiz = quizId;
  this.status = 'active';
  this.session.startedAt = new Date();
  
  // Initialize participants from members
  this.session.participants = this.members.map(member => ({
    user: member.user,
    score: 0,
    rank: 0,
    completedAt: null
  }));

  await this.save();
  return this;
};

// Method to submit participant attempt
roomSchema.methods.submitAttempt = async function(userId, attemptId, score) {
  const participant = this.session.participants.find(
    p => p.user.toString() === userId.toString()
  );

  if (!participant) {
    throw new Error('User is not a participant in this quiz');
  }

  participant.attempt = attemptId;
  participant.score = score;
  participant.completedAt = new Date();

  // Calculate ranks
  await this.calculateRanks();
  
  // Check if all participants completed
  const allCompleted = this.session.participants.every(p => p.completedAt);
  if (allCompleted) {
    this.status = 'completed';
    this.session.completedAt = new Date();
  }

  await this.save();
  return this;
};

// Method to calculate leaderboard ranks
roomSchema.methods.calculateRanks = async function() {
  // Sort participants by score (descending) and completion time (ascending)
  const sorted = [...this.session.participants]
    .filter(p => p.completedAt)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(a.completedAt) - new Date(b.completedAt);
    });

  // Assign ranks
  sorted.forEach((participant, index) => {
    const original = this.session.participants.find(
      p => p.user.toString() === participant.user.toString()
    );
    if (original) {
      original.rank = index + 1;
    }
  });
};

// Method to get leaderboard
roomSchema.methods.getLeaderboard = function() {
  return this.session.participants
    .filter(p => p.completedAt)
    .sort((a, b) => a.rank - b.rank)
    .map(p => ({
      user: p.user,
      score: p.score,
      rank: p.rank,
      completedAt: p.completedAt
    }));
};

// Virtual for member count
roomSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for is full
roomSchema.virtual('isFull').get(function() {
  return this.members.length >= this.settings.maxMembers;
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
