import React from "react";
import "./courseCard.css";
import { server } from "../../main";
import { UserData } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { CourseData } from "../../context/CourseContext";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { user, isAuth } = UserData();
  const { fetchCourses } = CourseData();

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this course")) {
      try {
        const { data } = await axios.delete(`${server}/api/course/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        toast.success(data.message);
        fetchCourses();
      } catch (error) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  // Helper function to determine user status with course
  const getUserCourseStatus = () => {
    if (!isAuth || !user) return "login";
    if (user.role === "admin") return "admin";
    if (user.subscription.includes(course._id)) return "enrolled";
    return "available";
  };

  const status = getUserCourseStatus();

  // Helper function to render action button
  const getActionButton = () => {
    switch (status) {
      case "enrolled":
        return (
          <button
            onClick={() => navigate(`/course/study/${course._id}`)}
            className="common-btn"
          >
            Continue Learning
          </button>
        );
      case "available":
        return (
          <button
            onClick={() => navigate(`/course/${course._id}`)}
            className="common-btn"
          >
            Get Started
          </button>
        );
      case "admin":
        return (
          <button
            onClick={() => navigate(`/course/study/${course._id}`)}
            className="common-btn"
          >
            Update Course
          </button>
        );
      default:
        return (
          <button onClick={() => navigate("/login")} className="common-btn">
            Get Started
          </button>
        );
    }
  };

  return (
    <div className="course-card">
      <div className="course-image-container">
        <img 
          src={`${server}/${course.image}`} 
          alt={course.title} 
          className="course-image" 
        />
        <div className="course-image-overlay"></div>
        
        {/* Status Badge */}
        {isAuth && status !== "admin" && (
          <div className={`status-badge ${status}`}>
            {status === "enrolled" ? "Enrolled" : "Available"}
          </div>
        )}
      </div>
      
      <div className="course-content">
        <h3>{course.title}</h3>
        
        <div className="course-info">
          <div className="course-detail">
            <svg className="course-detail-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>Instructor: {course.createdBy}</span>
          </div>
          
          <div className="course-detail">
            <svg className="course-detail-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Duration: {course.duration} weeks</span>
          </div>
          
          <div className="course-price">
            ₹{course.price}
          </div>
        </div>
        
        <div className="course-buttons">
          {getActionButton()}
          
          {user && user.role === "admin" && (
            <button
              onClick={() => deleteHandler(course._id)}
              className="common-btn delete-btn"
            >
              Delete Course
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;