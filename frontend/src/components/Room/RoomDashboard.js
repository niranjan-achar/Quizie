import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import Leaderboard from './Leaderboard';
import './Room.css';

const RoomDashboard = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { getRoomDetails, addMember, leaveRoom, startQuiz, deleteRoom } = useRoom();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const loadRoom = async () => {
    const result = await getRoomDetails(roomId);
    if (result.success) {
      setRoom(result.room);
      if (result.room.status === 'completed') {
        setShowLeaderboard(true);
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRoom();
    const interval = setInterval(loadRoom, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [roomId]);

  const isHost = room && user && room.host._id === user._id;

  const handleAddMember = async (e) => {
    e.preventDefault();
    const result = await addMember(roomId, addUsername);
    if (result.success) {
      setRoom(result.room);
      setAddUsername('');
      setError('');
    } else {
      setError(result.message);
    }
  };

  const handleStartQuiz = async () => {
    const result = await startQuiz(roomId);
    if (result.success) {
      setRoom(result.room);
      navigate(`/quiz/${room.quiz._id}?roomId=${roomId}`);
    } else {
      setError(result.message);
    }
  };

  const handleLeaveRoom = async () => {
    if (window.confirm('Are you sure you want to leave this room?')) {
      const result = await leaveRoom(roomId);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    }
  };

  const handleDeleteRoom = async () => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      const result = await deleteRoom(roomId);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    alert('Room code copied to clipboard!');
  };

  if (loading) {
    return <div className="room-loading">Loading room...</div>;
  }

  if (!room) {
    return <div className="room-error">Room not found</div>;
  }

  if (showLeaderboard) {
    return <Leaderboard roomId={roomId} />;
  }

  return (
    <div className="room-dashboard">
      <div className="room-header">
        <div>
          <h1>{room.name}</h1>
          {room.description && <p className="room-description">{room.description}</p>}
          <div className="room-code-display">
            <span>Room Code: <strong>{room.roomCode}</strong></span>
            <button onClick={copyRoomCode} className="copy-button">Copy</button>
          </div>
        </div>
        <div className="room-status">
          <span className={`status-badge ${room.status}`}>{room.status.toUpperCase()}</span>
        </div>
      </div>

      {error && <div className="room-error">{error}</div>}

      <div className="room-content">
        <div className="room-section">
          <h3>Members ({room.members.length})</h3>
          <div className="members-list">
            {room.members.map((member) => (
              <div key={member.user._id} className="member-item">
                <div className="member-info">
                  <span className="member-name">{member.user.displayName}</span>
                  <span className="member-username">@{member.user.username}</span>
                </div>
                {member.role === 'host' && <span className="host-badge">HOST</span>}
              </div>
            ))}
          </div>

          {isHost && room.status === 'waiting' && (
            <form onSubmit={handleAddMember} className="add-member-form">
              <input
                type="text"
                value={addUsername}
                onChange={(e) => setAddUsername(e.target.value)}
                placeholder="Enter username to add"
                className="add-member-input"
              />
              <button type="submit" className="add-member-button">Add</button>
            </form>
          )}
        </div>

        <div className="room-section">
          <h3>Quiz Information</h3>
          {room.quiz && (
            <div className="quiz-info">
              <p><strong>Title:</strong> {room.quiz.title}</p>
              <p><strong>Subject:</strong> {room.quiz.subject}</p>
              <p><strong>Questions:</strong> {room.quiz.totalQuestions}</p>
            </div>
          )}
        </div>

        {room.status === 'active' && (
          <div className="room-section">
            <h3>Quiz in Progress</h3>
            <p>Participants: {room.session.participants.length}</p>
            <button 
              onClick={() => navigate(`/quiz/${room.quiz._id}?roomId=${roomId}`)}
              className="room-button"
            >
              Go to Quiz
            </button>
          </div>
        )}

        {room.status === 'completed' && (
          <div className="room-section">
            <button 
              onClick={() => setShowLeaderboard(true)}
              className="room-button"
            >
              View Leaderboard
            </button>
          </div>
        )}
      </div>

      <div className="room-actions">
        {isHost && room.status === 'waiting' && (
          <button onClick={handleStartQuiz} className="room-button primary">
            Start Quiz
          </button>
        )}
        
        {!isHost && (
          <button onClick={handleLeaveRoom} className="room-button danger">
            Leave Room
          </button>
        )}
        
        {isHost && (
          <button onClick={handleDeleteRoom} className="room-button danger">
            Delete Room
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomDashboard;
