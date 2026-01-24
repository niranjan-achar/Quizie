import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiClock, FiUsers, FiPlusCircle, FiLogOut, FiX } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <FiX />
          </button>
        </div>

        {isAuthenticated && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.displayName}</div>
              <div className="sidebar-user-username">@{user?.username}</div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {isAuthenticated ? (
            <>
              <Link to="/" className="sidebar-link" onClick={handleLinkClick}>
                <FiHome /> Home
              </Link>
              <Link to="/history" className="sidebar-link" onClick={handleLinkClick}>
                <FiClock /> History
              </Link>
              <div className="sidebar-divider" />
              <Link to="/create-room" className="sidebar-link" onClick={handleLinkClick}>
                <FiPlusCircle /> Create Room
              </Link>
              <Link to="/join-room" className="sidebar-link" onClick={handleLinkClick}>
                <FiUsers /> Join Room
              </Link>
              <div className="sidebar-divider" />
              <button className="sidebar-link logout" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="sidebar-link" onClick={handleLinkClick}>
                Login
              </Link>
              <Link to="/signup" className="sidebar-link primary" onClick={handleLinkClick}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
