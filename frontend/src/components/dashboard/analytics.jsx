// Dashboard.jsx
import React from "react";
import "./analytics.css";

const Analytics = () => {
  // Static data for UI display only
  const user = {
    name: "John Doe",
    role: "user",
    problemsSolved: 127
  };

  const stats = [
    { label: "Courses Enrolled", value: 5, icon: "📚" },
    { label: "Courses Completed", value: 2, icon: "✅" },
    { label: "Learning Hours", value: 48, icon: "⏰" },
   
  ];

  const badges = [
    {
      type: "gold",
      icon: "🥇",
      title: "Gold Master",
      description: "100 problems solved",
      earned: true
    },
    {
      type: "gold",
      icon: "🥇",
      title: "Gold Expert",
      description: "50 problems solved",
      earned: true
    },
    {
      type: "silver",
      icon: "🥈",
      title: "Silver Champion",
      description: "75 problems milestone",
      earned: true
    },
    {
      type: "silver",
      icon: "🥈",
      title: "Silver Achiever",
      description: "25 problems milestone",
      earned: true
    },
    {
      type: "bronze",
      icon: "🥉",
      title: "Bronze Starter",
      description: "10 problems milestone",
      earned: true
    },
    {
      type: "gold",
      icon: "🥇",
      title: "Gold Legend",
      description: "23 more problems to unlock",
      earned: false,
      progress: 84
    }
  ];

  const recentCourses = [
    {
      id: 1,
      title: "Machine Learning Fundamentals",
      progress: 75,
      lastAccessed: "2 hours ago",
      category: "AI/ML",
    },
    {
      id: 2,
      title: "Deep Learning with Python",
      progress: 45,
      lastAccessed: "1 day ago",
      category: "AI/ML",
    },
    {
      id: 3,
      title: "Natural Language Processing",
      progress: 30,
      lastAccessed: "3 days ago",
      category: "AI/ML",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h1>Welcome back, {user.name}!</h1>
          <p>Continue your AI learning journey</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Badges Section */}
        <div className="badges-section">
          <div className="badges-header">
            <h2>🏆 Your Achievements</h2>
            <p>Earn badges by solving problems and completing challenges</p>
          </div>
          <div className="badges-grid">
            {badges.map((badge, index) => (
              <div 
                key={index} 
                className={`badge-card ${badge.earned ? 'earned' : 'locked'} badge-${badge.type}`}
              >
                <div className="badge-icon">{badge.icon}</div>
                <div className="badge-content">
                  <h3>{badge.title}</h3>
                  <p>{badge.description}</p>
                  {!badge.earned && badge.progress && (
                    <div className="badge-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${badge.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{badge.progress}%</span>
                    </div>
                  )}
                </div>
                {badge.earned && <div className="badge-checkmark">✓</div>}
                {!badge.earned && <div className="badge-lock">🔒</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Courses */}
        <div className="recent-courses">
          <h2>Continue Learning</h2>
          <div className="courses-grid">
            {recentCourses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <h3>{course.title}</h3>
                  <span className="course-category">{course.category}</span>
                </div>
                <div className="progress-section">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{course.progress}% Complete</span>
                </div>
                <div className="course-footer">
                  <span className="last-accessed">Last accessed: {course.lastAccessed}</span>
                  <button className="continue-btn">Continue</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Streak */}
        <div className="learning-streak">
          <div className="streak-content">
            <div className="streak-icon">🔥</div>
            <div className="streak-info">
              <h3>7 Day Learning Streak!</h3>
              <p>Keep it up! You're on a roll.</p>
            </div>
            <div className="streak-count">7</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;