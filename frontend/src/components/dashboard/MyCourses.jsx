// ✅ Updated MyCourses.jsx (with "Start Studying" button)
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // ✅ import Link for routing
import "./MyCourses.css";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/mycourse", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  if (loading) {
    return <div className="loading">Loading your courses...</div>;
  }

  if (courses.length === 0) {
    return <div className="no-courses">You haven’t enrolled in any courses yet.</div>;
  }

  return (
    <div className="my-courses-container">
      <h1 className="heading">My Enrolled Courses</h1>
      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course._id} className="course-card">
            <img
              src={`http://localhost:5000/${course.image}`}
              alt={course.title}
              className="course-image"
            />
            <div className="course-content">
              <h2 className="course-title">{course.title}</h2>
              <p className="course-description">
                {course.description?.substring(0, 150)}...
              </p>
              <Link
                to={`/course/study/${course._id}`}
                className="start-button"
              >
                Start Studying
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCourses;
