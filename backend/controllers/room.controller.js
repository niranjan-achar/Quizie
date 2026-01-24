const Room = require('../models/Room');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const { isRoomHost } = require('../middleware/auth');

/**
 * Room Controller
 * Handles room/group creation, management, and multiplayer features
 */

class RoomController {
  /**
   * @route   POST /api/rooms/create
   * @desc    Create a new room
   * @access  Private
   */
  async createRoom(req, res, next) {
    try {
      const { name, description, settings } = req.body;
      const userId = req.user._id;

      console.log('🏠 Creating room:', name, 'by', req.user.username);

      // Generate unique room code
      const roomCode = await Room.generateRoomCode();

      // Create room
      const room = new Room({
        roomCode,
        name,
        description: description || '',
        host: userId,
        members: [{
          user: userId,
          role: 'host',
          joinedAt: new Date()
        }],
        settings: settings || {}
      });

      await room.save();

      // Update user stats
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.totalRoomsCreated': 1 }
      });

      // Populate room details
      await room.populate('host', 'username displayName avatar');
      await room.populate('members.user', 'username displayName avatar');

      console.log('✅ Room created:', roomCode);

      res.status(201).json({
        status: 'success',
        message: 'Room created successfully',
        data: { room }
      });

    } catch (error) {
      console.error('❌ Create room error:', error);
      next(error);
    }
  }

  /**
   * @route   POST /api/rooms/join/:roomCode
   * @desc    Join a room by code
   * @access  Private
   */
  async joinRoom(req, res, next) {
    try {
      const { roomCode } = req.params;
      const userId = req.user._id;

      console.log('🚪 User', req.user.username, 'joining room:', roomCode);

      const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });

      if (!room) {
        return res.status(404).json({
          status: 'error',
          message: 'Room not found'
        });
      }

      if (room.status === 'closed') {
        return res.status(400).json({
          status: 'error',
          message: 'Room is closed'
        });
      }

      // Check if already a member
      const isMember = room.members.some(m => m.user.toString() === userId.toString());
      if (isMember) {
        await room.populate('host', 'username displayName avatar');
        await room.populate('members.user', 'username displayName avatar');
        
        return res.status(200).json({
          status: 'success',
          message: 'You are already a member of this room',
          data: { room }
        });
      }

      // Add member
      await room.addMember(userId);

      // Update user stats
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.totalRoomsJoined': 1 }
      });

      await room.populate('host', 'username displayName avatar');
      await room.populate('members.user', 'username displayName avatar');

      console.log('✅ User joined room:', roomCode);

      res.status(200).json({
        status: 'success',
        message: 'Joined room successfully',
        data: { room }
      });

    } catch (error) {
      console.error('❌ Join room error:', error);
      next(error);
    }
  }

  /**
   * @route   POST /api/rooms/:roomId/add-member
   * @desc    Add member to room by username
   * @access  Private (Host only)
   */
  async addMemberByUsername(req, res, next) {
    try {
      const { roomId } = req.params;
      const { username } = req.body;
      const userId = req.user._id;

      const room = await Room.findById(roomId);

      if (!room) {
        return res.status(404).json({
          status: 'error',
          message: 'Room not found'
        });
      }

      // Check if requester is host
      if (!isRoomHost(room, userId)) {
        return res.status(403).json({
          status: 'error',
          message: 'Only the host can add members'
        });
      }

      // Find user by username
      const userToAdd = await User.findOne({ username: username.toLowerCase() });

      if (!userToAdd) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Add member
      await room.addMember(userToAdd._id);

      await room.populate('host', 'username displayName avatar');
      await room.populate('members.user', 'username displayName avatar');

      console.log('✅ Member added to room:', username);

      res.status(200).json({
        status: 'success',
        message: 'Member added successfully',
        data: { room }
      });

    } catch (error) {
      console.error('❌ Add member error:', error);
      
      if (error.message.includes('already a member')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      
      next(error);
    }
  }

  /**
   * @route   POST /api/rooms/:roomId/leave
   * @desc    Leave a room
   * @access  Private
   */
  async leaveRoom(req, res, next) {
    try {
      const { roomId } = req.params;
      const userId = req.user._id;

      const room = await Room.findById(roomId);

      if (!room) {
        return res.status(404).json({
          status: 'error',
          message: 'Room not found'
        });
      }

      // Host cannot leave their own room
      if (isRoomHost(room, userId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Host cannot leave the room. Please delete the room or transfer host rights.'
        });
      }

      await room.removeMember(userId);

      console.log('✅ User left room:', req.user.username);

      res.status(200).json({
        status: 'success',
        message: 'Left room successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/rooms/:roomId/start-quiz
   * @desc    Start quiz in room
   * @access  Private (Host only)
   */
  async startQuiz(req, res, next) {
    try {
      const { roomId } = req.params;
      const { quizId } = req.body;
      const userId = req.user._id;

      const room = await Room.findById(roomId);

      if (!room) {
        return res.status(404).json({
          status: 'error',
          message: 'Room not found'
        });
      }

      // Check if requester is host
      if (!isRoomHost(room, userId)) {
        return res.status(403).json({
          status: 'error',
          message: 'Only the host can start the quiz'
        });
      }

      // Verify quiz exists
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({
          status: 'error',
          message: 'Quiz not found'
        });
      }

      await room.startQuiz(quizId);
      await room.populate('quiz');
      await room.populate('members.user', 'username displayName avatar');

      console.log('✅ Quiz started in room:', room.roomCode);

      res.status(200).json({
        status: 'success',
        message: 'Quiz started successfully',
        data: { room }
      });

    } catch (error) {
      console.error('❌ Start quiz error:', error);
      next(error);
    }
  }

  /**
   * @route   GET /api/rooms/:roomId
   * @desc    Get room details
   * @access  Private
   */
  async getRoomDetails(req, res, next) {
    try {
      const { roomId } = req.params;
      const userId = req.user._id;

      const room = await Room.findById(roomId)
        .populate('host', 'username displayName avatar')
        .populate('members.user', 'username displayName avatar')
        .populate('quiz')
        .populate('session.participants.user', 'username displayName avatar');

      if (!room) {
        return res.status(404).json({
          status: 'error',
          message: 'Room not found'
        });
      }

      // Check if user is a member
      const isMember = room.members.some(m => m.user._id.toString() === userId.toString());
      if (!isMember) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not a member of this room'
        });
      }

      res.status(200).json({
        status: 'success',
        data: { room }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/rooms/:roomId/leaderboard
   * @desc    Get room leaderboard
   * @access  Private
   */
  async getLeaderboard(req, res, next) {
    try {
      const { roomId } = req.params;
      const userId = req.user._id;

      const room = await Room.findById(roomId)
        .populate('session.participants.user', 'username displayName avatar');

      if (!room) {
        return res.status(404).json({
          status: 'error',
          message: 'Room not found'
        });
      }

      // Check if user is a member
      const isMember = room.members.some(m => m.user._id.toString() === userId.toString());
      if (!isMember) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not a member of this room'
        });
      }

      const leaderboard = room.getLeaderboard();

      res.status(200).json({
        status: 'success',
        data: { leaderboard }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/rooms/my-rooms
   * @desc    Get user's rooms
   * @access  Private
   */
  async getMyRooms(req, res, next) {
    try {
      const userId = req.user._id;

      const rooms = await Room.find({
        'members.user': userId,
        status: { $ne: 'closed' }
      })
        .populate('host', 'username displayName avatar')
        .populate('members.user', 'username displayName avatar')
        .sort({ createdAt: -1 });

      res.status(200).json({
        status: 'success',
        data: { rooms }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   DELETE /api/rooms/:roomId
   * @desc    Delete/close room
   * @access  Private (Host only)
   */
  async deleteRoom(req, res, next) {
    try {
      const { roomId } = req.params;
      const userId = req.user._id;

      const room = await Room.findById(roomId);

      if (!room) {
        return res.status(404).json({
          status: 'error',
          message: 'Room not found'
        });
      }

      // Check if requester is host
      if (!isRoomHost(room, userId)) {
        return res.status(403).json({
          status: 'error',
          message: 'Only the host can delete the room'
        });
      }

      room.status = 'closed';
      await room.save();

      console.log('✅ Room closed:', room.roomCode);

      res.status(200).json({
        status: 'success',
        message: 'Room closed successfully'
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoomController();
