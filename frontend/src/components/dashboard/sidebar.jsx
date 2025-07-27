import React from "react";
import { NavLink, useParams } from "react-router-dom";
import "./sidebar.css"; // ← link your CSS

const Sidebar = () => {
  const { id } = useParams();

  const menuItems = [
    { id: "my-courses", label: "📚 My Courses" },
    // Add more items here later
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">Dashboard</div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={`/${id}/dashboard/${item.id}`}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
