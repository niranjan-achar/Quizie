import axios from 'axios';

// HARDCODED Production backend URL for Vercel
const API_BASE_URL = 'https://quizie-backend.vercel.app/api';

console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', process.env.NODE_ENV);
console.log('🔧 process.env.REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60 seconds for LLM generation
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Can add auth tokens here in future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);

// Quiz APIs
export const quizAPI = {
  generateQuiz: (data) => api.post('/quiz/generate', data),
  getQuiz: (id) => api.get(`/quiz/${id}`),
  getQuizPreview: (id) => api.get(`/quiz/${id}/preview`),
  getAllQuizzes: (params) => api.get('/quiz', { params }),
  deleteQuiz: (id) => api.delete(`/quiz/${id}`),
  getStats: () => api.get('/quiz/stats')
};

// Attempt APIs
export const attemptAPI = {
  submitAttempt: (data) => api.post('/attempt/submit', data),
  getAttempt: (id) => api.get(`/attempt/${id}`),
  getAttemptReview: (id) => api.get(`/attempt/${id}/review`),
  getAttemptsByQuiz: (quizId) => api.get(`/attempt/quiz/${quizId}`),
  getHistory: (params) => api.get('/attempt/history', { params }),
  deleteAttempt: (id) => api.delete(`/attempt/${id}`),
  getStats: () => api.get('/attempt/stats')
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
