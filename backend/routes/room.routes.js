const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const { authenticate } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validationResult } = require('express-validator');

// Validation middleware
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

// All room routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/rooms/create
 * @desc    Create a new room
 * @access  Private
 */
router.post('/create', [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Room name must be 3-100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }),
  body('quizId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid quiz ID is required'),
  validate
], roomController.createRoom);

/**
 * @route   POST /api/rooms/join/:roomCode
 * @desc    Join room by code
 * @access  Private
 */
router.post('/join/:roomCode', [
  param('roomCode')
    .isLength({ min: 6, max: 6 })
    .isAlphanumeric()
    .withMessage('Invalid room code format'),
  validate
], roomController.joinRoom);

/**
 * @route   POST /api/rooms/:roomId/add-member
 * @desc    Add member by username (host only)
 * @access  Private
 */
router.post('/:roomId/add-member', [
  param('roomId').isMongoId().withMessage('Invalid room ID'),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  validate
], roomController.addMemberByUsername);

/**
 * @route   POST /api/rooms/:roomId/leave
 * @desc    Leave room
 * @access  Private
 */
router.post('/:roomId/leave', [
  param('roomId').isMongoId().withMessage('Invalid room ID'),
  validate
], roomController.leaveRoom);

/**
 * @route   POST /api/rooms/:roomId/start-quiz
 * @desc    Start quiz (host only)
 * @access  Private
 */
router.post('/:roomId/start-quiz', [
  param('roomId').isMongoId().withMessage('Invalid room ID'),
  validate
], roomController.startQuiz);

/**
 * @route   GET /api/rooms/:roomId
 * @desc    Get room details
 * @access  Private
 */
router.get('/:roomId', [
  param('roomId').isMongoId().withMessage('Invalid room ID'),
  validate
], roomController.getRoomDetails);

/**
 * @route   GET /api/rooms/:roomId/leaderboard
 * @desc    Get room leaderboard
 * @access  Private
 */
router.get('/:roomId/leaderboard', [
  param('roomId').isMongoId().withMessage('Invalid room ID'),
  validate
], roomController.getLeaderboard);

/**
 * @route   GET /api/rooms/my-rooms
 * @desc    Get user's rooms
 * @access  Private
 */
router.get('/my-rooms', roomController.getMyRooms);

/**
 * @route   DELETE /api/rooms/:roomId
 * @desc    Delete room (host only)
 * @access  Private
 */
router.delete('/:roomId', [
  param('roomId').isMongoId().withMessage('Invalid room ID'),
  validate
], roomController.deleteRoom);

module.exports = router;
