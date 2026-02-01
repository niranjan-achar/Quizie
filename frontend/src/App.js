import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoomProvider } from './context/RoomContext';
import { ThemeProvider } from './context/ThemeContext';
import QuizCreation from './components/QuizCreation/QuizCreation';
import ExamMode from './components/ExamMode/ExamMode';
import Results from './components/Results/Results';
import Review from './components/Review/Review';
import History from './components/History/History';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import CreateRoom from './components/Room/CreateRoom';
import JoinRoom from './components/Room/JoinRoom';
import RoomDashboard from './components/Room/RoomDashboard';
import Sidebar from './components/Sidebar/Sidebar';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import { FiMenu, FiBookOpen, FiHome, FiClock, FiPlusCircle, FiLogIn, FiLogOut, FiUser } from 'react-icons/fi';
import './App.css';

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <nav className="navbar">
        <div className="navbar-content">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <FiMenu />
          </button>

          <Link to="/" className="logo">
            <FiBookOpen className="logo-icon" />
            <span className="logo-text">Quizie</span>
          </Link>

          <div className="desktop-nav">
            {user ? (
              <>
                <Link to="/" className="nav-link">
                  <FiHome /> Home
                </Link>
                <Link to="/history" className="nav-link">
                  <FiClock /> History
                </Link>
                {/* <Link to="/create-room" className="nav-link">
                  <FiPlusCircle /> Create Room
                </Link>
                <Link to="/join-room" className="nav-link">
                  <FiLogIn /> Join Room
                </Link> */}
                <button onClick={logout} className="nav-link nav-button">
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  <FiLogIn /> Login
                </Link>
                <Link to="/signup" className="nav-link">
                  <FiUser /> Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="nav-right">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={
            <ProtectedRoute>
              <QuizCreation />
            </ProtectedRoute>
          } />

          <Route path="/exam/:quizId" element={
            <ProtectedRoute>
              <ExamMode />
            </ProtectedRoute>
          } />

          <Route path="/results/:attemptId" element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          } />

          <Route path="/review/:attemptId" element={
            <ProtectedRoute>
              <Review />
            </ProtectedRoute>
          } />

          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />

          <Route path="/create-room" element={
            <ProtectedRoute>
              <CreateRoom />
            </ProtectedRoute>
          } />

          <Route path="/join-room" element={
            <ProtectedRoute>
              <JoinRoom />
            </ProtectedRoute>
          } />

          <Route path="/room/:roomId" element={
            <ProtectedRoute>
              <RoomDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Quizie. Powered by GROK LLM.</p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <RoomProvider>
            <AppContent />
          </RoomProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
