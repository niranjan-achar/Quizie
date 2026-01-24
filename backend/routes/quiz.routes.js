const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { quizCreationRules, validate, mongoIdValidation } = require('../middleware/validator');

/**
 * Quiz Routes
 */

// Generate new quiz
router.post(
  '/generate',
  quizCreationRules,
  validate,
  quizController.generateQuiz
);

// Get all quizzes (with pagination and filters)
router.get('/', quizController.getAllQuizzes);

// Get quiz statistics
router.get('/stats', quizController.getStats);

// Get specific quiz by ID (full data)
router.get(
  '/:id',
  mongoIdValidation,
  validate,
  quizController.getQuizById
);

// Get quiz preview (without questions)
router.get(
  '/:id/preview',
  mongoIdValidation,
  validate,
  quizController.getQuizPreview
);

// Delete quiz
router.delete(
  '/:id',
  mongoIdValidation,
  validate,
  quizController.deleteQuiz
);

module.exports = router;
