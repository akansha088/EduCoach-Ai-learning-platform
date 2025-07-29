import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { BarChart3, TrendingUp, Target, Trophy, Medal, Award } from 'lucide-react';
import './userStats.css'; // Import the CSS file

const QuizGraphPlotter = () => {
  const quizData = [
    { week: 'Week 1', attempts: 5, solved: 4, avgScore: 78 },
    { week: 'Week 2', attempts: 8, solved: 6, avgScore: 82 },
    { week: 'Week 3', attempts: 6, solved: 5, avgScore: 75 },
   
  
  ];

  const calculateStats = () => {
    const totalAttempts = quizData.reduce((sum, item) => sum + item.attempts, 0);
    const totalSolved = quizData.reduce((sum, item) => sum + item.solved, 0);
    const overallAvgScore = quizData.reduce((sum, item) => sum + item.avgScore, 0) / quizData.length;
    const successRate = totalAttempts > 0 ? ((totalSolved / totalAttempts) * 100).toFixed(1) : 0;

    return { totalAttempts, totalSolved, overallAvgScore: overallAvgScore.toFixed(1), successRate };
  };

  const getRankingData = () => {
    return quizData
      .map((item, index) => ({
        ...item,
        successRate: ((item.solved / item.attempts) * 100).toFixed(1),
        performanceScore: (item.avgScore * 0.6) + (((item.solved / item.attempts) * 100) * 0.4)
      }))
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="rank-icon" style={{ color: '#fbbf24' }} />;
      case 2: return <Medal className="rank-icon" style={{ color: '#9ca3af' }} />;
      case 3: return <Award className="rank-icon" style={{ color: '#f59e0b' }} />;
      default: return <span className="rank-number">{rank}</span>;
    }
  };

  const getRankCardClass = (rank) => {
    switch (rank) {
      case 1: return 'ranking-card rank-1';
      case 2: return 'ranking-card rank-2';
      case 3: return 'ranking-card rank-3';
      default: return 'ranking-card rank-default';
    }
  };

  const stats = calculateStats();
  const rankingData = getRankingData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-item" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${entry.dataKey === 'avgScore' ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="quiz-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Quiz Performance Dashboard</h1>
          <p className="dashboard-subtitle">Comprehensive analysis of quiz statistics and rankings</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-blue">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Total Attempts</h3>
                <p className="stat-value">{stats.totalAttempts}</p>
              </div>
              <BarChart3 className="stat-icon" />
            </div>
          </div>
          
          <div className="stat-card stat-card-green">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Total Solved</h3>
                <p className="stat-value">{stats.totalSolved}</p>
              </div>
              <Target className="stat-icon" />
            </div>
          </div>
          
          <div className="stat-card stat-card-orange">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Avg Score</h3>
                <p className="stat-value">{stats.overallAvgScore}%</p>
              </div>
              <TrendingUp className="stat-icon" />
            </div>
          </div>
          
         
        </div>

        <div className="main-grid">
          {/* Charts Section */}
          <div className="charts-section">
            {/* Combined Chart */}
            <div className="chart-container">
              <h2 className="chart-title">Performance Trends</h2>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={quizData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
                    <XAxis dataKey="week" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="attempts" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Attempts" />
                    <Bar dataKey="solved" fill="#10b981" radius={[4, 4, 0, 0]} name="Solved" />
                    <Line type="monotone" dataKey="avgScore" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }} name="Avg Score %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line Chart */}
            <div className="chart-container">
              <h2 className="chart-title">Progress Over Time</h2>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quizData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
                    <XAxis dataKey="week" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="attempts" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} name="Attempts" />
                    <Line type="monotone" dataKey="solved" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }} name="Solved" />
                    <Line type="monotone" dataKey="avgScore" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }} name="Avg Score %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Rankings Section */}
          <div className="rankings-section">
            <div className="rankings-container">
              <div className="rankings-header">
                <Trophy className="rank-icon" style={{ color: '#fbbf24' }} />
                <h2 className="rankings-title">Weekly Rankings</h2>
              </div>
              
              <div className="rankings-list">
                {rankingData.map((item, index) => (
                  <div key={index} className={getRankCardClass(item.rank)}>
                    <div className="ranking-header">
                      <div className="ranking-info">
                        {getRankIcon(item.rank)}
                        <span className="week-name">{item.week}</span>
                      </div>
                      <div className="performance-score">
                        <div className="performance-label">Performance Score</div>
                        <div className="performance-value">{item.performanceScore.toFixed(1)}</div>
                      </div>
                    </div>
                    
                    <div className="ranking-stats">
                      <div className="stat-box">
                        <div className="stat-box-value">{item.avgScore}%</div>
                        <div className="stat-box-label">Avg Score</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-box-value">{item.successRate}%</div>
                        <div className="stat-box-label">Success Rate</div>
                      </div>
                    </div>
                    
                    <div className="solved-count">
                      {item.solved}/{item.attempts} solved
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="ranking-formula">
                <h3 className="formula-title">Ranking Formula</h3>
                <p className="formula-text">
                  Performance Score = (Average Score × 60%) + (Success Rate × 40%)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="data-table-container">
          <div className="table-header">
            <h2 className="table-title">Detailed Statistics</h2>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead className="table-head">
                <tr>
                  <th>Rank</th>
                  <th>Period</th>
                  <th>Attempts</th>
                  <th>Solved</th>
                  <th>Avg Score</th>
                  <th>Success Rate</th>
                  <th>Performance Score</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {rankingData.map((item, index) => (
                  <tr key={index} className={`table-row ${item.rank <= 3 ? 'table-row-highlight' : ''}`}>
                    <td className="table-cell">
                      <div className="table-cell-rank">
                        {getRankIcon(item.rank)}
                        <span className="rank-badge">#{item.rank}</span>
                      </div>
                    </td>
                    <td className="table-cell table-cell-bold">{item.week}</td>
                    <td className="table-cell">{item.attempts}</td>
                    <td className="table-cell">{item.solved}</td>
                    <td className="table-cell">{item.avgScore}%</td>
                    <td className="table-cell">{item.successRate}%</td>
                    <td className="table-cell table-cell-bold">{item.performanceScore.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizGraphPlotter;