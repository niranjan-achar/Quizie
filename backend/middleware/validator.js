const { body, param, validationResult } = require('express-validator');

// Validation middleware to check results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Quiz creation validation rules
const quizCreationRules = [
  body('quizTitle')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Quiz title must be between 3 and 200 characters'),
  
  body('topic')
    .trim()
    .notEmpty()
    .withMessage('Topic is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Topic must be between 2 and 100 characters'),
  
  body('numberOfQuestions')
    .isInt()
    .withMessage('Number of questions must be an integer')
    .isIn([10, 15, 20, 30, 40, 50, 100])
    .withMessage('Number of questions must be one of: 10, 15, 20, 30, 40, 50, 100'),
  
  body('difficultyLevel')
    .trim()
    .toLowerCase()
    .isIn(['easy', 'medium', 'difficult', 'extreme'])
    .withMessage('Difficulty level must be one of: easy, medium, difficult, extreme'),
  
  body('timerInMinutes')
    .isInt({ min: 1, max: 300 })
    .withMessage('Timer must be between 1 and 300 minutes'),
  
  body('additionalDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Additional description cannot exceed 500 characters')
];

// Quiz attempt submission validation
const attemptSubmissionRules = [
  body('quizId')
    .notEmpty()
    .withMessage('Quiz ID is required')
    .isMongoId()
    .withMessage('Invalid quiz ID format'),
  
  body('userAnswers')
    .isArray()
    .withMessage('User answers must be an array'),
  
  body('userAnswers.*.questionId')
    .isInt()
    .withMessage('Question ID must be an integer'),
  
  body('userAnswers.*.selectedAnswer')
    .optional()
    .isIn(['A', 'B', 'C', 'D'])
    .withMessage('Selected answer must be A, B, C, or D'),
  
  body('timeTaken')
    .isInt({ min: 0 })
    .withMessage('Time taken must be a positive integer'),
  
  body('isAutoSubmitted')
    .optional()
    .isBoolean()
    .withMessage('isAutoSubmitted must be a boolean')
];

// MongoDB ObjectId validation
const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

module.exports = {
  validate,
  quizCreationRules,
  attemptSubmissionRules,
  mongoIdValidation
};
