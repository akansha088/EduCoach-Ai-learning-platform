import React from "react";
import { NavLink, useParams } from "react-router-dom";
import "./sidebar.css";

const Sidebar = () => {
  const { id } = useParams();

  const menuItems = [
    { id: "my-courses", label: "📚 My Courses" },
    { id: "quiz-history", label: "📝 Quiz History" },
    { id: "quiz-analytics", label: "📊 Quiz Stats" },
    { id: "user-analytics", label: "👤 User Analytics" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">Dashboard</div>
      <nav className="sidebar-nav">
        <ul className="sidebar-list">
          {menuItems.map((item) => (
            <li key={item.id} className="sidebar-item">
              <NavLink
                to={`/${id}/dashboard/${item.id}`}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
