import React, { useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../main";
import "./UserQuizAnalytics.css"; // create your CSS file or use Tailwind

const UserQuizAnalytics = () => {
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${server}/api/user/quiz/attempts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats({
          totalQuizzes: data.totalQuizzes,
          totalAttempts: data.totalAttempts,
          averageScore: data.averageScore,
        });
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="quiz-analytics-container">
      <h2 className="section-title">📊 Your Quiz Analytics</h2>

      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <div className="cards-container">
          <div className="stat-card">
            <h3>Total Quizzes Taken</h3>
            <p>{stats.totalQuizzes}</p>
          </div>
          <div className="stat-card">
            <h3>Total Attempts</h3>
            <p>{stats.totalAttempts}</p>
          </div>
          <div className="stat-card">
            <h3>Average Score</h3>
            <p>{stats.averageScore}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserQuizAnalytics;
