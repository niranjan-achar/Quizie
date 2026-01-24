const Quiz = require('../models/Quiz');
const grokService = require('../services/grok.service');

/**
 * Quiz Controller
 * Handles quiz generation, retrieval, and management
 */

class QuizController {
  /**
   * @route   POST /api/quiz/generate
   * @desc    Generate a new quiz using GROK LLM
   * @access  Public
   */
  async generateQuiz(req, res, next) {
    try {
      const {
        quizTitle,
        topic,
        numberOfQuestions,
        difficultyLevel,
        timerInMinutes,
        additionalDescription
      } = req.body;

      console.log('📋 Quiz generation request received');
      console.log('Request body:', req.body);

      // Generate quiz using GROK
      const grokResponse = await grokService.generateQuiz({
        topic,
        difficultyLevel,
        numberOfQuestions,
        additionalDescription
      });

      console.log('✅ GROK response received');

      // Create quiz document with GROK response + user inputs
      const quiz = new Quiz({
        quizTitle: quizTitle || grokResponse.quizTitle,
        topic: grokResponse.topic,
        difficulty: difficultyLevel,
        totalQuestions: numberOfQuestions,
        timerInMinutes,
        additionalDescription,
        questions: grokResponse.questions
      });

      // Save to database
      await quiz.save();

      console.log('✅ Quiz saved to database:', quiz._id);

      // Return quiz (with questions for immediate exam start)
      res.status(201).json({
        status: 'success',
        message: 'Quiz generated successfully',
        data: {
          quiz
        }
      });

    } catch (error) {
      console.error('❌ Quiz generation error:', error.message);
      console.error('Error details:', error);
      next(error);
    }
  }

  /**
   * @route   GET /api/quiz/:id
   * @desc    Get a specific quiz by ID
   * @access  Public
   */
  async getQuizById(req, res, next) {
    try {
      const quiz = await Quiz.findById(req.params.id);

      if (!quiz) {
        return res.status(404).json({
          status: 'error',
          message: 'Quiz not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: { quiz }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/quiz/:id/preview
   * @desc    Get quiz metadata without questions (for preview)
   * @access  Public
   */
  async getQuizPreview(req, res, next) {
    try {
      const quiz = await Quiz.findById(req.params.id).select('-questions');

      if (!quiz) {
        return res.status(404).json({
          status: 'error',
          message: 'Quiz not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: { quiz }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/quiz
   * @desc    Get all quizzes (paginated)
   * @access  Public
   */
  async getAllQuizzes(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Optional filters
      const filter = {};
      if (req.query.topic) filter.topic = new RegExp(req.query.topic, 'i');
      if (req.query.difficulty) filter.difficulty = req.query.difficulty;

      const quizzes = await Quiz.find(filter)
        .select('-questions') // Don't send questions in list view
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Quiz.countDocuments(filter);

      res.status(200).json({
        status: 'success',
        data: {
          quizzes,
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
   * @route   DELETE /api/quiz/:id
   * @desc    Delete a quiz
   * @access  Public
   */
  async deleteQuiz(req, res, next) {
    try {
      const quiz = await Quiz.findByIdAndDelete(req.params.id);

      if (!quiz) {
        return res.status(404).json({
          status: 'error',
          message: 'Quiz not found'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Quiz deleted successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/quiz/stats
   * @desc    Get quiz statistics
   * @access  Public
   */
  async getStats(req, res, next) {
    try {
      const stats = await Quiz.aggregate([
        {
          $group: {
            _id: null,
            totalQuizzes: { $sum: 1 },
            byDifficulty: {
              $push: '$difficulty'
            },
            avgQuestions: { $avg: '$totalQuestions' }
          }
        }
      ]);

      // Count by difficulty
      const difficultyCount = {};
      if (stats[0]) {
        stats[0].byDifficulty.forEach(diff => {
          difficultyCount[diff] = (difficultyCount[diff] || 0) + 1;
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          totalQuizzes: stats[0]?.totalQuizzes || 0,
          avgQuestions: Math.round(stats[0]?.avgQuestions || 0),
          byDifficulty: difficultyCount
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuizController();
