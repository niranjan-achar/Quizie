import React, { useEffect, useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import './Room.css';

const Leaderboard = ({ roomId }) => {
  const { getLeaderboard } = useRoom();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLeaderboard = async () => {
      const result = await getLeaderboard(roomId);
      if (result.success) {
        setLeaderboard(result.leaderboard);
      } else {
        setError(result.message);
      }
      setLoading(false);
    };

    loadLeaderboard();
  }, [roomId]);

  if (loading) {
    return <div className="leaderboard-loading">Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="leaderboard-error">{error}</div>;
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p>Final Rankings</p>
      </div>

      <div className="leaderboard-list">
        {leaderboard.map((entry) => {
          const isCurrentUser = user && entry.user._id === user._id;
          
          return (
            <div 
              key={entry.user._id} 
              className={`leaderboard-item ${isCurrentUser ? 'current-user' : ''} rank-${entry.rank}`}
            >
              <div className="rank-badge">
                {getRankIcon(entry.rank)}
              </div>
              
              <div className="user-info">
                <div className="user-name">{entry.user.displayName}</div>
                <div className="user-username">@{entry.user.username}</div>
              </div>
              
              <div className="score-info">
                <div className="score">{entry.score}</div>
                <div className="score-label">points</div>
              </div>
            </div>
          );
        })}
      </div>

      {leaderboard.length === 0 && (
        <div className="no-results">
          <p>No scores yet. Complete the quiz to see results!</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
