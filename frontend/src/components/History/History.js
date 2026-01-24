import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attemptAPI } from '../../services/api';
import { FiEye, FiTrash2, FiClock, FiAward, FiCalendar } from 'react-icons/fi';
import './History.css';

const History = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await attemptAPI.getHistory({ limit: 50 });
      setAttempts(response.data.attempts);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load history:', error);
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await attemptAPI.getStats();
      setStats(response.data.overall);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleDelete = async (attemptId) => {
    if (!window.confirm('Are you sure you want to delete this attempt?')) {
      return;
    }

    try {
      await attemptAPI.deleteAttempt(attemptId);
      setAttempts(prev => prev.filter(a => a._id !== attemptId));
    } catch (error) {
      console.error('Failed to delete attempt:', error);
      alert('Failed to delete attempt');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 80) return '#059669';
    if (percentage >= 70) return '#3b82f6';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading history...</p>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="container">
        <div className="history-header">
          <h1>Quiz History</h1>
          <p>View your past quiz attempts and performance</p>
        </div>

        {/* Overall Stats */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card card">
              <div className="stat-icon">
                <FiAward />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalAttempts}</div>
                <div className="stat-label">Total Attempts</div>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-icon">
                <FiAward />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.averageScore.toFixed(1)}%</div>
                <div className="stat-label">Average Score</div>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-icon">
                <FiAward />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.highestScore.toFixed(1)}%</div>
                <div className="stat-label">Highest Score</div>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-icon">
                <FiAward />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.lowestScore.toFixed(1)}%</div>
                <div className="stat-label">Lowest Score</div>
              </div>
            </div>
          </div>
        )}

        {/* Attempts List */}
        <div className="attempts-section">
          <h2>Past Attempts</h2>
          
          {attempts.length === 0 ? (
            <div className="empty-state card">
              <p>No quiz attempts yet</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/')}
              >
                Take Your First Quiz
              </button>
            </div>
          ) : (
            <div className="attempts-list">
              {attempts.map((attempt) => (
                <div key={attempt._id} className="attempt-card card">
                  <div className="attempt-header">
                    <div>
                      <h3>{attempt.quizSnapshot.quizTitle}</h3>
                      <div className="attempt-meta">
                        <span className={`badge badge-${attempt.quizSnapshot.difficulty}`}>
                          {attempt.quizSnapshot.difficulty}
                        </span>
                        <span className="meta-item">
                          <FiCalendar />
                          {formatDate(attempt.submittedAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="attempt-score">
                      <div
                        className="score-circle-small"
                        style={{ borderColor: getGradeColor(attempt.score.percentage) }}
                      >
                        <span style={{ color: getGradeColor(attempt.score.percentage) }}>
                          {attempt.score.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="attempt-stats">
                    <div className="stat-item">
                      <FiAward className="stat-icon-small" />
                      <span>{attempt.score.correct}/{attempt.score.total} Correct</span>
                    </div>
                    <div className="stat-item">
                      <FiClock className="stat-icon-small" />
                      <span>{formatTime(attempt.timeTaken)}</span>
                    </div>
                  </div>

                  <div className="attempt-actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => navigate(`/results/${attempt._id}`)}
                    >
                      <FiEye /> View Results
                    </button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => navigate(`/review/${attempt._id}`)}
                    >
                      Review Answers
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(attempt._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
