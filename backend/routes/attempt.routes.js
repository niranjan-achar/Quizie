const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attempt.controller');
const { attemptSubmissionRules, validate, mongoIdValidation } = require('../middleware/validator');

/**
 * Quiz Attempt Routes
 */

// Submit quiz attempt
router.post(
  '/submit',
  attemptSubmissionRules,
  validate,
  attemptController.submitAttempt
);

// Get all attempts history
router.get('/history', attemptController.getHistory);

// Get attempt statistics
router.get('/stats', attemptController.getStats);

// Get specific attempt by ID
router.get(
  '/:id',
  mongoIdValidation,
  validate,
  attemptController.getAttemptById
);

// Get attempt review (with correct answers)
router.get(
  '/:id/review',
  mongoIdValidation,
  validate,
  attemptController.getAttemptReview
);

// Get all attempts for a specific quiz
router.get(
  '/quiz/:quizId',
  mongoIdValidation,
  validate,
  attemptController.getAttemptsByQuiz
);

// Delete attempt
router.delete(
  '/:id',
  mongoIdValidation,
  validate,
  attemptController.deleteAttempt
);

module.exports = router;
