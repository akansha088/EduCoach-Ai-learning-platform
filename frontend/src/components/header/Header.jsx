import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import "./header.css"; // Make sure to create this CSS file

const Header = ({ isAuth }) => {
  const navigate = useNavigate();
  const { user, setIsAuth, setUser } = UserData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logoutHandler = () => {
    localStorage.clear();
    setUser([]);
    setIsAuth(false);
    navigate("/login");
  };

  const handleVoiceAssistant = () => {
    // Trigger voice assistant functionality
    alert('Voice Assistant activated!');
    // You can dispatch an event or call a function to activate voice mode
  };

  return (
    <header className="modern-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <span className="logo-text">EduCoach AI</span>
        </Link>

        {/* Navigation Links - Desktop */}
        <nav className="desktop-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/courses" className="nav-link">Courses</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to={`/${user?._id}/dashboard`} className="nav-link">Dashboard</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
        </nav>

        {/* Right Side Buttons */}
        <div className="header-actions">
          {isAuth ? (
            <>
              {/* Voice Assistant Button */}
              <button 
                className="action-btn voice-btn"
                onClick={handleVoiceAssistant}
                title="Voice Assistant"
              >
                🎤
              </button>

              {/* Profile Dropdown */}
              <div className="profile-dropdown">
                <button 
                  className="profile-btn"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <div className="profile-avatar">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="profile-name">{user?.name || 'User'}</span>
                  <svg className={`dropdown-arrow ${isMenuOpen ? 'rotate' : ''}`} width="12" height="12" viewBox="0 0 12 12">
                    <path d="M6 8L2 4h8l-4 4z" fill="currentColor"/>
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="dropdown-menu">
                    <Link to="/account" className="dropdown-item">
                      <span className="dropdown-icon">👤</span>
                      Profile
                    </Link>
                    <Link to={`/${user?._id}/dashboard`} className="dropdown-item">
                      <span className="dropdown-icon">📊</span>
                      Dashboard
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin/dashboard" className="dropdown-item">
                        <span className="dropdown-icon">⚙️</span>
                        Admin
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <button onClick={logoutHandler} className="dropdown-item logout">
                      <span className="dropdown-icon">🚪</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/premium" className="btn-primary">Premium</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;