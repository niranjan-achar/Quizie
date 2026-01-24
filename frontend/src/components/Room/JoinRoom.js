import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../context/RoomContext';
import './Room.css';

const JoinRoom = () => {
  const navigate = useNavigate();
  const { joinRoom } = useRoom();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (roomCode.length !== 6) {
      setError('Room code must be 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    const result = await joinRoom(roomCode.toUpperCase());
    
    if (result.success) {
      navigate(`/room/${result.room._id}`);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="room-form-container">
      <div className="room-form-card">
        <h2>Join Room</h2>
        <p className="room-form-subtitle">Enter the 6-character room code</p>

        {error && <div className="room-error">{error}</div>}

        <form onSubmit={handleSubmit} className="room-form">
          <div className="form-group">
            <label htmlFor="roomCode">Room Code</label>
            <input
              type="text"
              id="roomCode"
              name="roomCode"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="XXXXXX"
              maxLength="6"
              required
              disabled={loading}
              className="room-code-input"
            />
          </div>

          <button type="submit" className="room-button" disabled={loading}>
            {loading ? 'Joining...' : 'Join Room'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoom;
