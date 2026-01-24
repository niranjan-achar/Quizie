import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptAPI } from '../../services/api';
import { FiCheckCircle, FiXCircle, FiMinusCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Review.css';

const Review = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [reviewData, setReviewData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReview = async () => {
      try {
        const response = await attemptAPI.getAttemptReview(attemptId);
        setReviewData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load review:', error);
        alert('Failed to load review');
        navigate('/');
      }
    };

    loadReview();
  }, [attemptId, navigate]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading review...</p>
      </div>
    );
  }

  const question = reviewData.review[currentQuestion];
  const progress = ((currentQuestion + 1) / reviewData.review.length) * 100;

  const handleNext = () => {
    if (currentQuestion < reviewData.review.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestion(index);
  };

  const getOptionClass = (optionKey) => {
    if (optionKey === question.correctAnswer) {
      return 'option-correct';
    }
    if (optionKey === question.userAnswer && optionKey !== question.correctAnswer) {
      return 'option-wrong';
    }
    return '';
  };

  const getOptionIcon = (optionKey) => {
    if (optionKey === question.correctAnswer) {
      return <FiCheckCircle className="option-icon correct" />;
    }
    if (optionKey === question.userAnswer && optionKey !== question.correctAnswer) {
      return <FiXCircle className="option-icon wrong" />;
    }
    return null;
  };

  return (
    <div className="review-page">
      {/* Header */}
      <div className="review-header">
        <div className="container">
          {/* <div className="review-header-content">
            <div>
              <h1>Answer Review</h1>
              <p>{reviewData.quizInfo.quizTitle}</p>
            </div>
            <div className="score-badge">
              <div className="score-badge-value">{reviewData.score.percentage}%</div>
              <div className="score-badge-label">Your Score</div>
            </div>
          </div> */}

          <div className="review-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-text">
              Question {currentQuestion + 1} of {reviewData.review.length}
            </div>
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div className="review-content">
        <div className="container">
          <div className="review-main">
            <div className="question-review card">
              {/* Question Status */}
              <div className="question-status">
                <span className="question-number">Question {question.questionId}</span>
                {question.isCorrect ? (
                  <span className="status-badge status-correct">
                    <FiCheckCircle /> Correct
                  </span>
                ) : question.userAnswer === null ? (
                  <span className="status-badge status-unattempted">
                    <FiMinusCircle /> Unattempted
                  </span>
                ) : (
                  <span className="status-badge status-wrong">
                    <FiXCircle /> Wrong
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h3 className="question-text">{question.questionText}</h3>

              {/* Options */}
              <div className="options-list">
                {Object.entries(question.options).map(([key, value]) => (
                  <div
                    key={key}
                    className={`option ${getOptionClass(key)}`}
                  >
                    <div className="option-indicator">{key}</div>
                    <div className="option-content">
                      <div className="option-text">{value}</div>
                      {key === question.userAnswer && (
                        <div className="user-answer-label">Your Answer</div>
                      )}
                    </div>
                    {getOptionIcon(key)}
                  </div>
                ))}
              </div>

              {/* Correct Answer Info */}
              <div className="answer-info">
                <div className="correct-answer-box">
                  <strong>Correct Answer:</strong> {question.correctAnswer}
                </div>
                {question.userAnswer && (
                  <div className={`user-answer-box ${question.isCorrect ? 'correct' : 'wrong'}`}>
                    <strong>Your Answer:</strong> {question.userAnswer}
                  </div>
                )}
                {!question.userAnswer && (
                  <div className="user-answer-box unattempted">
                    <strong>Your Answer:</strong> Not attempted
                  </div>
                )}
              </div>

              {/* Explanation */}
              <div className="explanation-box">
                <h4>📚 Explanation</h4>
                <p>{question.explanation}</p>
              </div>
            </div>

            {/* Navigation - Mobile only */}
            <div className="review-navigation review-navigation-mobile">
              <button
                className="btn btn-outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <FiChevronLeft /> Previous
              </button>

              {currentQuestion === reviewData.review.length - 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/results/${attemptId}`)}
                >
                  Back to Results
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                >
                  Next <FiChevronRight />
                </button>
              )}

            </div>
          </div>

          {/* Question Navigator */}
          <div className="question-navigator card">
            <h4>Question Navigator</h4>
            <div className="question-grid">
              {reviewData.review.map((q, index) => (
                <button
                  key={q.questionId}
                  className={`question-nav-btn ${
                    index === currentQuestion ? 'active' : ''
                  } ${
                    q.isCorrect ? 'correct' : q.userAnswer === null ? 'unattempted' : 'wrong'
                  }`}
                  onClick={() => handleQuestionNavigation(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="navigator-legend">
              <div className="legend-item">
                <div className="legend-box legend-correct"></div>
                <span>Correct</span>
              </div>
              <div className="legend-item">
                <div className="legend-box legend-wrong"></div>
                <span>Wrong</span>
              </div>
              <div className="legend-item">
                <div className="legend-box legend-unattempted"></div>
                <span>Unattempted</span>
              </div>
            </div>

            {/* Navigation - Desktop only */}
            <div className="review-navigation review-navigation-desktop">

              {currentQuestion === reviewData.review.length - 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/results/${attemptId}`)}
                >
                  Back to Results
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                >
                  Next <FiChevronRight />
                </button>
              )}

              <button
                className="btn btn-outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <FiChevronLeft /> Previous
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
