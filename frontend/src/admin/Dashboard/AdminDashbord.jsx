import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Utils/Layout";
import axios from "axios";
import { server } from "../../main";
import "./dashboard.css";

const AdminDashbord = ({ user }) => {
  const navigate = useNavigate();

  if (user && user.role !== "admin") return navigate("/");

  const [stats, setStats] = useState({
    totalCoures: 0,
    totalLectures: 0,
    totalUsers: 0,
    totalRevenue: 0,
    activeUsers: 0,
    completedCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  async function fetchStats() {
    try {
      setLoading(true);
      const { data } = await axios.get(`${server}/api/stats`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      setStats(data.stats);
      
      // Simulate recent activity data
      setRecentActivity([
        { type: 'course', action: 'New course added', title: 'React Fundamentals', time: '2 hours ago' },
        { type: 'user', action: 'New user registered', title: 'john.doe@email.com', time: '4 hours ago' },
        { type: 'lecture', action: 'Lecture uploaded', title: 'JavaScript Basics', time: '6 hours ago' },
        { type: 'course', action: 'Course completed', title: 'Web Development', time: '1 day ago' },
        { type: 'user', action: 'User subscription', title: 'premium upgrade', time: '2 days ago' }
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatIcon = (type) => {
    switch (type) {
      case 'courses': return '📚';
      case 'lectures': return '🎥';
      case 'users': return '👥';
      case 'revenue': return '💰';
      case 'active': return '🔥';
      case 'completed': return '✅';
      default: return '📊';
    }
  };

  const getStatColor = (type) => {
    switch (type) {
      case 'courses': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'lectures': return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'users': return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      case 'revenue': return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
      case 'active': return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
      case 'completed': return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
      default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'course': return '📚';
      case 'user': return '👤';
      case 'lecture': return '🎥';
      case 'revenue': return '💰';
      default: return '📊';
    }
  };

  return (
    <div className="admin-dashboard">
      <Layout>
        <div className="dashboard-container">
          {/* Header Section */}
          <div className="dashboard-header">
            <div className="header-content">
              <div className="welcome-section">
                <h1 className="dashboard-title">Welcome back, {user?.name}! 👋</h1>
                <p className="dashboard-subtitle">Here's what's happening with your platform today</p>
              </div>
              <div className="header-actions">
                <button className="refresh-btn" onClick={fetchStats}>
                  <span className="refresh-icon">🔄</span>
                  Refresh Stats
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-section">
            <h2 className="section-title">Platform Overview</h2>
            <div className="stats-grid">
              <div className="stat-card" style={{ background: getStatColor('courses') }}>
                <div className="stat-icon">{getStatIcon('courses')}</div>
                <div className="stat-content">
                  <h3 className="stat-label">Total Courses</h3>
                  <p className="stat-value">{loading ? '...' : stats.totalCoures}</p>
                  <span className="stat-change">+12% from last month</span>
                </div>
              </div>

              <div className="stat-card" style={{ background: getStatColor('lectures') }}>
                <div className="stat-icon">{getStatIcon('lectures')}</div>
                <div className="stat-content">
                  <h3 className="stat-label">Total Lectures</h3>
                  <p className="stat-value">{loading ? '...' : stats.totalLectures}</p>
                  <span className="stat-change">+8% from last month</span>
                </div>
              </div>

              <div className="stat-card" style={{ background: getStatColor('users') }}>
                <div className="stat-icon">{getStatIcon('users')}</div>
                <div className="stat-content">
                  <h3 className="stat-label">Total Users</h3>
                  <p className="stat-value">{loading ? '...' : stats.totalUsers}</p>
                  <span className="stat-change">+15% from last month</span>
                </div>
              </div>

              <div className="stat-card" style={{ background: getStatColor('revenue') }}>
                <div className="stat-icon">{getStatIcon('revenue')}</div>
                <div className="stat-content">
                  <h3 className="stat-label">Total Revenue</h3>
                  <p className="stat-value">${loading ? '...' : (stats.totalRevenue || 0).toLocaleString()}</p>
                  <span className="stat-change">+23% from last month</span>
                </div>
              </div>

              <div className="stat-card" style={{ background: getStatColor('active') }}>
                <div className="stat-icon">{getStatIcon('active')}</div>
                <div className="stat-content">
                  <h3 className="stat-label">Active Users</h3>
                  <p className="stat-value">{loading ? '...' : (stats.activeUsers || Math.floor(stats.totalUsers * 0.3))}</p>
                  <span className="stat-change">+5% from last week</span>
                </div>
              </div>

              <div className="stat-card" style={{ background: getStatColor('completed') }}>
                <div className="stat-icon">{getStatIcon('completed')}</div>
                <div className="stat-content">
                  <h3 className="stat-label">Completed Courses</h3>
                  <p className="stat-value">{loading ? '...' : (stats.completedCourses || Math.floor(stats.totalCoures * 0.4))}</p>
                  <span className="stat-change">+18% from last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="activity-section">
            <h2 className="section-title">Recent Activity</h2>
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                  <div className="activity-content">
                    <h4 className="activity-title">{activity.action}</h4>
                    <p className="activity-details">{activity.title}</p>
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="quick-actions-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-card" onClick={() => navigate('/admin/course')}>
                <div className="action-icon">➕</div>
                <h3>Add New Course</h3>
                <p>Create a new course for your students</p>
              </button>
              
              <button className="action-card" onClick={() => navigate('/admin/users')}>
                <div className="action-icon">👥</div>
                <h3>Manage Users</h3>
                <p>View and manage user accounts</p>
              </button>
              
              <button className="action-card">
                <div className="action-icon">📊</div>
                <h3>View Analytics</h3>
                <p>Detailed platform analytics</p>
              </button>
              
              <button className="action-card">
                <div className="action-icon">⚙️</div>
                <h3>Settings</h3>
                <p>Platform configuration</p>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default AdminDashbord;