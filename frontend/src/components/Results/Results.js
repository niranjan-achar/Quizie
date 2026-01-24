import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptAPI } from '../../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { FiCheckCircle, FiXCircle, FiMinusCircle, FiClock, FiAward, FiEye } from 'react-icons/fi';
import './Results.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Results = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const response = await attemptAPI.getAttempt(attemptId);
        setResult(response.data.attempt);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load results:', error);
        alert('Failed to load results');
        navigate('/');
      }
    };

    loadResults();
  }, [attemptId, navigate]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading results...</p>
      </div>
    );
  }

  const { score, timeTaken, grade, isAutoSubmitted, submittedAt, quizSnapshot } = result;

  // Pie chart data
  const pieData = {
    labels: ['Correct', 'Wrong', 'Unattempted'],
    datasets: [
      {
        data: [score.correct, score.wrong, score.unattempted],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Bar chart data
  const barData = {
    labels: ['Correct', 'Wrong', 'Unattempted'],
    datasets: [
      {
        label: 'Questions',
        data: [score.correct, score.wrong, score.unattempted],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': '#10b981',
      'A': '#059669',
      'B': '#3b82f6',
      'C': '#f59e0b',
      'D': '#ef4444',
      'F': '#991b1b'
    };
    return colors[grade] || '#6b7280';
  };

  return (
    <div className="results-page">
      <div className="container">
        {/* Header */}
        <div className="results-header">
          <h1>🎉 Quiz Completed!</h1>
          <p className="quiz-title">{quizSnapshot.quizTitle}</p>
          {isAutoSubmitted && (
            <div className="alert alert-warning">
              <span>⏰</span>
              <span>This quiz was auto-submitted due to time expiry</span>
            </div>
          )}
        </div>

        {/* Score Overview */}
        <div className="score-overview card">
          <div className="score-main">
            <div className="score-circle" style={{ borderColor: getGradeColor(grade) }}>
              <div className="score-percentage" style={{ color: getGradeColor(grade) }}>
                {score.percentage}%
              </div>
              <div className="score-grade" style={{ color: getGradeColor(grade) }}>
                Grade: {grade}
              </div>
            </div>
          </div>

          <div className="score-details">
            <div className="score-stat">
              <FiCheckCircle className="stat-icon success" />
              <div>
                <div className="stat-value">{score.correct}</div>
                <div className="stat-label">Correct</div>
              </div>
            </div>

            <div className="score-stat">
              <FiXCircle className="stat-icon error" />
              <div>
                <div className="stat-value">{score.wrong}</div>
                <div className="stat-label">Wrong</div>
              </div>
            </div>

            <div className="score-stat">
              <FiMinusCircle className="stat-icon neutral" />
              <div>
                <div className="stat-value">{score.unattempted}</div>
                <div className="stat-label">Unattempted</div>
              </div>
            </div>

            <div className="score-stat">
              <FiClock className="stat-icon primary" />
              <div>
                <div className="stat-value">{formatTime(timeTaken)}</div>
                <div className="stat-label">Time Taken</div>
              </div>
            </div>

            <div className="score-stat">
              <FiAward className="stat-icon primary" />
              <div>
                <div className="stat-value">{score.total}</div>
                <div className="stat-label">Total Questions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-section">
          <div className="chart-card card">
            <h3>Score Distribution</h3>
            <div className="chart-container">
              <Pie data={pieData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-card card">
            <h3>Performance Analysis</h3>
            <div className="chart-container">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="insights card">
          <h3>Performance Insights</h3>
          <div className="insights-grid">
            <div className="insight-item">
              <strong>Accuracy:</strong>
              <span>{((score.correct / score.total) * 100).toFixed(1)}%</span>
            </div>
            <div className="insight-item">
              <strong>Completion Rate:</strong>
              <span>{(((score.total - score.unattempted) / score.total) * 100).toFixed(1)}%</span>
            </div>
            <div className="insight-item">
              <strong>Difficulty Level:</strong>
              <span className={`badge badge-${quizSnapshot.difficulty}`}>
                {quizSnapshot.difficulty}
              </span>
            </div>
            <div className="insight-item">
              <strong>Submitted:</strong>
              <span>{new Date(submittedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="results-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate(`/review/${attemptId}`)}
          >
            <FiEye /> Review Answers
          </button>
          <button
            className="btn btn-outline btn-lg"
            onClick={() => navigate('/')}
          >
            Create New Quiz
          </button>
          <button
            className="btn btn-outline btn-lg"
            onClick={() => navigate('/history')}
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
