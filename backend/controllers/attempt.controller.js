const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');

/**
 * Quiz Attempt Controller
 * Handles quiz attempts, submissions, and results
 */

class AttemptController {
  /**
   * @route   POST /api/attempt/submit
   * @desc    Submit a quiz attempt and calculate results
   * @access  Public
   */
  async submitAttempt(req, res, next) {
    try {
      const {
        quizId,
        userAnswers,
        timeTaken,
        isAutoSubmitted
      } = req.body;

      console.log('📝 Quiz attempt submission received');

      // Fetch the quiz with all questions
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({
          status: 'error',
          message: 'Quiz not found'
        });
      }

      // Create attempt document
      const attempt = new QuizAttempt({
        quizId: quiz._id,
        quizSnapshot: {
          quizTitle: quiz.quizTitle,
          topic: quiz.topic,
          difficulty: quiz.difficulty,
          totalQuestions: quiz.totalQuestions,
          timerInMinutes: quiz.timerInMinutes
        },
        userAnswers,
        timeTaken,
        timeRemaining: (quiz.timerInMinutes * 60) - timeTaken,
        isAutoSubmitted: isAutoSubmitted || false,
        userIp: req.ip,
        userAgent: req.headers['user-agent']
      });

      // Calculate score
      attempt.calculateScore(quiz.questions);

      // Save attempt
      await attempt.save();

      console.log('✅ Attempt saved:', attempt._id);
      console.log(`📊 Score: ${attempt.score.correct}/${attempt.score.total} (${attempt.score.percentage}%)`);

      // Return results
      res.status(201).json({
        status: 'success',
        message: 'Quiz submitted successfully',
        data: {
          attemptId: attempt._id,
          score: attempt.score,
          timeTaken: attempt.timeTaken,
          grade: attempt.grade,
          submittedAt: attempt.submittedAt,
          isAutoSubmitted: attempt.isAutoSubmitted
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/attempt/:id
   * @desc    Get a specific attempt with full details
   * @access  Public
   */
  async getAttemptById(req, res, next) {
    try {
      const attempt = await QuizAttempt.findById(req.params.id)
        .populate('quizId');

      if (!attempt) {
        return res.status(404).json({
          status: 'error',
          message: 'Attempt not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: { attempt }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/attempt/:id/review
   * @desc    Get attempt results with correct answers for review
   * @access  Public
   */
  async getAttemptReview(req, res, next) {
    try {
      const attempt = await QuizAttempt.findById(req.params.id);
      if (!attempt) {
        return res.status(404).json({
          status: 'error',
          message: 'Attempt not found'
        });
      }

      // Get the original quiz questions
      const quiz = await Quiz.findById(attempt.quizId);
      if (!quiz) {
        return res.status(404).json({
          status: 'error',
          message: 'Original quiz not found'
        });
      }

      // Build review data
      const reviewData = quiz.questions.map((question) => {
        const userAnswer = attempt.userAnswers.find(
          ua => ua.questionId === question.questionId
        );

        return {
          questionId: question.questionId,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          userAnswer: userAnswer?.selectedAnswer || null,
          isCorrect: userAnswer?.isCorrect || false,
          explanation: question.explanation
        };
      });

      res.status(200).json({
        status: 'success',
        data: {
          attemptId: attempt._id,
          quizInfo: attempt.quizSnapshot,
          score: attempt.score,
          grade: attempt.grade,
          timeTaken: attempt.timeTaken,
          submittedAt: attempt.submittedAt,
          review: reviewData
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/attempt/quiz/:quizId
   * @desc    Get all attempts for a specific quiz
   * @access  Public
   */
  async getAttemptsByQuiz(req, res, next) {
    try {
      const attempts = await QuizAttempt.find({ quizId: req.params.quizId })
        .select('-userAnswers')
        .sort({ submittedAt: -1 });

      res.status(200).json({
        status: 'success',
        data: {
          attempts,
          count: attempts.length
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/attempt/history
   * @desc    Get all quiz attempts (history)
   * @access  Public
   */
  async getHistory(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const attempts = await QuizAttempt.find()
        .select('-userAnswers')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await QuizAttempt.countDocuments();

      res.status(200).json({
        status: 'success',
        data: {
          attempts,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/attempt/stats
   * @desc    Get overall attempt statistics
   * @access  Public
   */
  async getStats(req, res, next) {
    try {
      const stats = await QuizAttempt.getUserStats();

      // Get recent attempts
      const recentAttempts = await QuizAttempt.find()
        .select('quizSnapshot score submittedAt')
        .sort({ submittedAt: -1 })
        .limit(5);

      // Performance over time
      const performanceData = await QuizAttempt.find()
        .select('score.percentage submittedAt')
        .sort({ submittedAt: 1 })
        .limit(20);

      res.status(200).json({
        status: 'success',
        data: {
          overall: stats,
          recent: recentAttempts,
          performance: performanceData
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   DELETE /api/attempt/:id
   * @desc    Delete an attempt
   * @access  Public
   */
  async deleteAttempt(req, res, next) {
    try {
      const attempt = await QuizAttempt.findByIdAndDelete(req.params.id);

      if (!attempt) {
        return res.status(404).json({
          status: 'error',
          message: 'Attempt not found'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Attempt deleted successfully'
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AttemptController();
