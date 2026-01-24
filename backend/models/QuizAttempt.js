const mongoose = require('mongoose');

const userAnswerSchema = new mongoose.Schema({
  questionId: {
    type: Number,
    required: true
  },
  selectedAnswer: {
    type: String,
    enum: ['A', 'B', 'C', 'D', null],
    default: null
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  }
});

const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  quizSnapshot: {
    quizTitle: String,
    topic: String,
    difficulty: String,
    totalQuestions: Number,
    timerInMinutes: Number
  },
  userAnswers: [userAnswerSchema],
  score: {
    total: {
      type: Number,
      required: true,
      default: 0
    },
    correct: {
      type: Number,
      required: true,
      default: 0
    },
    wrong: {
      type: Number,
      required: true,
      default: 0
    },
    unattempted: {
      type: Number,
      required: true,
      default: 0
    },
    percentage: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100
    }
  },
  timeTaken: {
    type: Number, // Total time taken in seconds
    required: true
  },
  timeRemaining: {
    type: Number, // Time remaining when submitted in seconds
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isAutoSubmitted: {
    type: Boolean,
    default: false
  },
  userIp: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
quizAttemptSchema.index({ quizId: 1, submittedAt: -1 });
quizAttemptSchema.index({ submittedAt: -1 });

// Virtual for grade/performance level
quizAttemptSchema.virtual('grade').get(function() {
  const percentage = this.score.percentage;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
});

// Method to calculate statistics
quizAttemptSchema.methods.calculateScore = function(quizQuestions) {
  let correct = 0;
  let wrong = 0;
  let unattempted = 0;

  this.userAnswers.forEach((answer) => {
    const question = quizQuestions.find(q => q.questionId === answer.questionId);
    
    if (!answer.selectedAnswer) {
      unattempted++;
      answer.isCorrect = false;
    } else if (question && answer.selectedAnswer === question.correctAnswer) {
      correct++;
      answer.isCorrect = true;
    } else {
      wrong++;
      answer.isCorrect = false;
    }
  });

  const total = quizQuestions.length;
  const percentage = total > 0 ? ((correct / total) * 100).toFixed(2) : 0;

  this.score = {
    total,
    correct,
    wrong,
    unattempted,
    percentage: parseFloat(percentage)
  };
};

// Static method to get user statistics
quizAttemptSchema.statics.getUserStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score.percentage' },
        highestScore: { $max: '$score.percentage' },
        lowestScore: { $min: '$score.percentage' }
      }
    }
  ]);

  return stats[0] || {
    totalAttempts: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0
  };
};

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = QuizAttempt;
