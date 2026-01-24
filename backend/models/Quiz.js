const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: {
    type: Number,
    required: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true }
  },
  correctAnswer: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D']
  },
  explanation: {
    type: String,
    required: true
  }
});

const quizSchema = new mongoose.Schema({
  quizTitle: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    minlength: [3, 'Quiz title must be at least 3 characters'],
    maxlength: [200, 'Quiz title cannot exceed 200 characters']
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'difficult', 'extreme'],
    lowercase: true
  },
  totalQuestions: {
    type: Number,
    required: true,
    enum: [10, 15, 20, 30, 40, 50, 100]
  },
  timerInMinutes: {
    type: Number,
    required: [true, 'Timer is required'],
    min: [1, 'Timer must be at least 1 minute'],
    max: [300, 'Timer cannot exceed 300 minutes']
  },
  additionalDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  questions: {
    type: [questionSchema],
    required: true,
    validate: {
      validator: function(questions) {
        return questions.length === this.totalQuestions;
      },
      message: props => `Questions array length must match totalQuestions (${props.value.length} !== totalQuestions)`
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    type: String,
    default: 'GROK-LLM'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
quizSchema.index({ topic: 1, difficulty: 1 });
quizSchema.index({ createdAt: -1 });

// Virtual for quiz duration in seconds
quizSchema.virtual('durationInSeconds').get(function() {
  return this.timerInMinutes * 60;
});

// Method to get quiz summary (without questions)
quizSchema.methods.getSummary = function() {
  return {
    _id: this._id,
    quizTitle: this.quizTitle,
    topic: this.topic,
    difficulty: this.difficulty,
    totalQuestions: this.totalQuestions,
    timerInMinutes: this.timerInMinutes,
    createdAt: this.createdAt
  };
};

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
