import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle-wrapper">
      <label className="theme-toggle">
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={toggleTheme}
          aria-label="Toggle dark mode"
        />
        <span className="theme-toggle-slider">
          <span className="theme-toggle-icon">
            {isDarkMode ? '🌙' : '☀️'}
          </span>
        </span>
      </label>
    </div>
  );
};

export default ThemeToggle;
