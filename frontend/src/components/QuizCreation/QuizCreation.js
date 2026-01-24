import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import { FiPlay, FiLoader } from 'react-icons/fi';
import './QuizCreation.css';

const QuizCreation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const [formData, setFormData] = useState({
    quizTitle: '',
    topic: '',
    numberOfQuestions: 10,
    difficultyLevel: 'medium',
    timerInMinutes: 30,
    additionalDescription: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfQuestions' || name === 'timerInMinutes' 
        ? parseInt(value) 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmAndGenerate = async () => {
    setError('');
    setLoading(true);
    setShowConfirmation(false);

    try {
      const response = await quizAPI.generateQuiz(formData);
      const quizId = response.data.quiz._id;
      
      // Navigate to exam mode
      navigate(`/exam/${quizId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate quiz. Please try again.');
      console.error('Quiz generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-creation">
      <div className="container">
        <div className="quiz-creation-header">
          <h1>Create Your AI-Powered Quiz</h1>
          <p>Let GROK generate a personalized quiz tailored to your needs</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="quiz-form card">
          <div className="form-group">
            <label className="form-label">Quiz Title *</label>
            <input
              type="text"
              name="quizTitle"
              value={formData.quizTitle}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., JavaScript Fundamentals Test"
              required
              minLength={3}
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Topic *</label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., React Hooks, Machine Learning, Data Structures"
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Number of Questions *</label>
              <select
                name="numberOfQuestions"
                value={formData.numberOfQuestions}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
                <option value={30}>30 Questions</option>
                <option value={40}>40 Questions</option>
                <option value={50}>50 Questions</option>
                <option value={100}>100 Questions</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty Level *</label>
              <select
                name="difficultyLevel"
                value={formData.difficultyLevel}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="difficult">Difficult</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Timer (Minutes) *</label>
              <input
                type="number"
                name="timerInMinutes"
                value={formData.timerInMinutes}
                onChange={handleChange}
                className="form-input"
                min={1}
                max={300}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Additional Description (Optional)
            </label>
            <textarea
              name="additionalDescription"
              value={formData.additionalDescription}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Any specific requirements or focus areas for the quiz..."
              maxLength={500}
            />
            <small className="text-secondary">
              {formData.additionalDescription.length}/500 characters
            </small>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FiLoader className="spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <FiPlay />
                  Generate & Start Quiz
                </>
              )}
            </button>
          </div>

          {loading && (
            <div className="generation-info">
              <div className="spinner"></div>
              <p>🤖 GROK AI is generating your quiz...</p>
              <p className="text-secondary">This may take 20-40 seconds</p>
            </div>
          )}
        </form>

        {showConfirmation && (
          <div className="confirmation-overlay">
            <div className="confirmation-dialog">
              <h3>Ready to Start?</h3>
              <p>Are you ready to generate and start your quiz?</p>
              <div className="quiz-details">
                <p><strong>Title:</strong> {formData.quizTitle}</p>
                <p><strong>Topic:</strong> {formData.topic}</p>
                <p><strong>Questions:</strong> {formData.numberOfQuestions}</p>
                <p><strong>Difficulty:</strong> {formData.difficultyLevel}</p>
                <p><strong>Time:</strong> {formData.timerInMinutes} minutes</p>
              </div>
              <div className="confirmation-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={confirmAndGenerate}
                >
                  <FiPlay /> Start
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCreation;
