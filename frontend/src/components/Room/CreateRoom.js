import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../context/RoomContext';
import './Room.css';

const CreateRoom = ({ quizId }) => {
  const navigate = useNavigate();
  const { createRoom } = useRoom();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quizId: quizId || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quizId) {
      setFormData(prev => ({ ...prev, quizId }));
    }
  }, [quizId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await createRoom(formData);
    
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
        <h2>Create Room</h2>
        <p className="room-form-subtitle">Create a multiplayer quiz room</p>

        {error && <div className="room-error">{error}</div>}

        <form onSubmit={handleSubmit} className="room-form">
          <div className="form-group">
            <label htmlFor="name">Room Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter room name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your room"
              rows="3"
              disabled={loading}
            />
          </div>

          {!quizId && (
            <div className="form-group">
              <label htmlFor="quizId">Quiz ID</label>
              <input
                type="text"
                id="quizId"
                name="quizId"
                value={formData.quizId}
                onChange={handleChange}
                placeholder="Enter quiz ID"
                required
                disabled={loading}
              />
            </div>
          )}

          <button type="submit" className="room-button" disabled={loading}>
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
