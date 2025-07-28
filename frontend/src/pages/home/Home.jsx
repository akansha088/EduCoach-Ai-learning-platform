import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import Testimonials from "../../components/testimonials/Testimonials";
import { UserData } from "../../context/UserContext";

const Home = () => {
  const navigate = useNavigate();
  const { user } = UserData();

  const handleFeatureClick = (feature) => {
    if (feature === 'Personalized Learning') {
      navigate('/courses');
    } else if (feature === 'Real-Time Feedback') {
      navigate(`/${user._id}/dashboard`);
    } else if (feature === 'Voice Assistant') {
      // Voice assistant functionality
      alert('Voice Assistant activated!');
    }
  };

  return (
    <div className="home-container">
      {/* Main AI Learning Section */}
      <main className="main-content">
        <div className="container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome to EduCoach AI Learning</h1>
            <p className="welcome-subtitle">
              Master Artificial Intelligence, Machine Learning, and Data Science with curated courses and tools.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="features-grid">
            <div className="feature-card">
              <h2 className="feature-title">Personalized Learning</h2>
              <p className="feature-description">Courses adapt to your progress and interests.</p>
              <button 
                className="feature-btn"
                onClick={() => handleFeatureClick('Personalized Learning')}
              >
                Explore
              </button>
            </div>

            <div className="feature-card">
              <h2 className="feature-title">Real-Time Feedback</h2>
              <p className="feature-description">AI-powered tips and progress tracking.</p>
              <button 
                className="feature-btn secondary"
                onClick={() => handleFeatureClick('Real-Time Feedback')}
              >
                Dashboard
              </button>
            </div>

            <div className="feature-card voice-card">
              <h2 className="feature-title">Voice Assistant</h2>
              <p className="feature-description">Navigate courses with voice commands.</p>
              <button 
                className="feature-btn tertiary"
                onClick={() => handleFeatureClick('Voice Assistant')}
              >
                Try Now
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Keep your existing Testimonials component */}
      <Testimonials />
    </div>
  );
};

export default Home;