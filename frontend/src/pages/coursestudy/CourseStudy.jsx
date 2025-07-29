import React, { useEffect, useState } from "react";
import "./coursestudy.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";

const CourseStudy = ({ user }) => {
  const params = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  const { fetchCourse, course } = CourseData();

  if (user && user.role !== "admin" && !user.subscription.includes(params.id))
    return navigate("/");

  useEffect(() => {
    fetchCourse(params.id);
    // Simulate progress - in real app, this would come from backend
    setProgress(Math.floor(Math.random() * 40) + 20);
  }, []);

  const getProgressColor = (progress) => {
    if (progress < 30) return "#ff6b6b";
    if (progress < 70) return "#feca57";
    return "#00b894";
  };

  return (
    <>
      {course && (
        <div className="course-study-container">
          {/* Hero Section */}
          <div className="study-hero">
            <div className="hero-background"></div>
            <div className="hero-content">
              <div className="course-overview-card">
                <div className="course-image-section">
                  <img 
                    src={`${server}/${course.image}`} 
                    alt={course.title} 
                    className="course-study-image"
                  />
                  <div className="course-status-badge">
                    <span className="status-icon">📚</span>
                    <span>In Progress</span>
                  </div>
                </div>
                
                <div className="course-details-section">
                  <h1 className="course-title">{course.title}</h1>
                  <p className="course-description">{course.description}</p>
                  
                  <div className="course-meta-grid">
                    <div className="meta-card">
                      <span className="meta-icon">👨‍🏫</span>
                      <div className="meta-content">
                        <span className="meta-label">Instructor</span>
                        <span className="meta-value">{course.createdBy}</span>
                      </div>
                    </div>
                    
                    <div className="meta-card">
                      <span className="meta-icon">⏱️</span>
                      <div className="meta-content">
                        <span className="meta-label">Duration</span>
                        <span className="meta-value">{course.duration} weeks</span>
                      </div>
                    </div>
                    
                    <div className="meta-card">
                      <span className="meta-icon">📊</span>
                      <div className="meta-content">
                        <span className="meta-label">Progress</span>
                        <span className="meta-value">{progress}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress-section">
                    <div className="progress-header">
                      <span className="progress-label">Your Progress</span>
                      <span className="progress-percentage">{progress}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: getProgressColor(progress)
                        }}
                      ></div>
                    </div>
                    <p className="progress-text">
                      {progress < 30 && "Keep going! You're just getting started."}
                      {progress >= 30 && progress < 70 && "Great progress! You're halfway there."}
                      {progress >= 70 && "Almost there! You're doing amazing!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="study-actions">
            <div className="actions-container">
              <div className="action-cards">
                <Link to={`/lectures/${course._id}`} className="action-card primary">
                  <div className="action-icon">🎥</div>
                  <div className="action-content">
                    <h3>Start Learning</h3>
                    <p>Access video lectures and course materials</p>
                  </div>
                  <div className="action-arrow">→</div>
                </Link>

                <div className="action-card secondary">
                  <div className="action-icon">📝</div>
                  <div className="action-content">
                    <h3>Take Quizzes</h3>
                    <p>Test your knowledge with interactive assessments</p>
                  </div>
                  <div className="action-arrow">→</div>
                </div>

                <div className="action-card secondary">
                  <div className="action-icon">📊</div>
                  <div className="action-content">
                    <h3>View Analytics</h3>
                    <p>Track your learning progress and performance</p>
                  </div>
                  <div className="action-arrow">→</div>
                </div>

                <div className="action-card secondary">
                  <div className="action-icon">💬</div>
                  <div className="action-content">
                    <h3>Community</h3>
                    <p>Connect with fellow learners and instructors</p>
                  </div>
                  <div className="action-arrow">→</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stats-container">
              <div className="stat-card">
                <span className="stat-icon">📖</span>
                <div className="stat-info">
                  <span className="stat-number">12</span>
                  <span className="stat-label">Lessons</span>
                </div>
              </div>
              
              <div className="stat-card">
                <span className="stat-icon">⏰</span>
                <div className="stat-info">
                  <span className="stat-number">8.5</span>
                  <span className="stat-label">Hours</span>
                </div>
              </div>
              
              <div className="stat-card">
                <span className="stat-icon">🏆</span>
                <div className="stat-info">
                  <span className="stat-number">3</span>
                  <span className="stat-label">Quizzes</span>
                </div>
              </div>
              
              <div className="stat-card">
                <span className="stat-icon">📜</span>
                <div className="stat-info">
                  <span className="stat-number">1</span>
                  <span className="stat-label">Certificate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseStudy;
