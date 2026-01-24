import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, attemptAPI } from '../../services/api';
import { FiClock, FiChevronLeft, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import './ExamMode.css';

const ExamMode = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await quizAPI.getQuiz(quizId);
        setQuiz(response.data.quiz);
        setTimeRemaining(response.data.quiz.timerInMinutes * 60);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load quiz:', error);
        alert('Failed to load quiz');
        navigate('/');
      }
    };

    loadQuiz();
  }, [quizId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!quiz || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, timeRemaining]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
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

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const confirmed = window.confirm(
      'Are you sure you want to submit? You cannot change answers after submission.'
    );

    if (!confirmed) return;

    await submitQuiz(false);
  };

  const handleAutoSubmit = async () => {
    await submitQuiz(true);
  };

  const submitQuiz = async (isAuto) => {
    setIsSubmitting(true);

    try {
      // Prepare user answers
      const formattedAnswers = quiz.questions.map(q => ({
        questionId: q.questionId,
        selectedAnswer: userAnswers[q.questionId] || null
      }));

      const timeTaken = (quiz.timerInMinutes * 60) - timeRemaining;

      const response = await attemptAPI.submitAttempt({
        quizId: quiz._id,
        userAnswers: formattedAnswers,
        timeTaken,
        isAutoSubmitted: isAuto
      });

      // Navigate to results
      navigate(`/results/${response.data.attemptId}`);

    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(userAnswers).length;
  const timeWarning = timeRemaining < 300; // Last 5 minutes

  return (
    <div className="exam-mode">
      {/* Header */}
      <div className="exam-header">
        <div className="container">
          <div className="exam-header-content">
            <div className="exam-info">
              <h2>{quiz.quizTitle}</h2>
              <span className={`badge badge-${quiz.difficulty}`}>
                {quiz.difficulty}
              </span>
            </div>
            
            <div className={`timer ${timeWarning ? 'timer-warning' : ''}`}>
              <FiClock />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          </div>

          <div className="exam-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="progress-text">
              Question {currentQuestion + 1} of {quiz.questions.length}
              <span className="answered-count">
                ({answeredCount} answered)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="exam-content">
        <div className="container">
          <div className="exam-main">
            <div className="question-container card">
              <div className="question-number">Question {question.questionId}</div>
              <h3 className="question-text">{question.questionText}</h3>

              <div className="options-list">
                {Object.entries(question.options).map(([key, value]) => (
                  <div
                    key={key}
                    className={`option ${userAnswers[question.questionId] === key ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(question.questionId, key)}
                  >
                    <div className="option-indicator">{key}</div>
                    <div className="option-text">{value}</div>
                    {userAnswers[question.questionId] === key && (
                      <FiCheckCircle className="option-check" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation - Mobile only */}
            <div className="exam-navigation exam-navigation-mobile">
              
              {currentQuestion === quiz.questions.length - 1 ? (
                <button
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
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

          {/* Question Navigator */}
          <div className="question-navigator card">
            <h4>Question Navigator</h4>
            <div className="question-grid">
              {quiz.questions.map((q, index) => (
                <button
                  key={q.questionId}
                  className={`question-nav-btn ${
                    index === currentQuestion ? 'active' : ''
                  } ${userAnswers[q.questionId] ? 'answered' : ''}`}
                  onClick={() => handleQuestionNavigation(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="navigator-legend">
              <div className="legend-item">
                <div className="legend-box legend-answered"></div>
                <span>Answered</span>
              </div>
              <div className="legend-item">
                <div className="legend-box legend-current"></div>
                <span>Current</span>
              </div>
              <div className="legend-item">
                <div className="legend-box legend-unanswered"></div>
                <span>Unanswered</span>
              </div>
            </div>

            {/* Navigation - Desktop only */}
            <div className="exam-navigation exam-navigation-desktop">
             
              {currentQuestion === quiz.questions.length - 1 ? (
                <button
                  className="btn btn-success"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
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

export default ExamMode;
