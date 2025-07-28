import React, { useState } from "react";
import Layout from "../Utils/Layout";
import { useNavigate } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";
import "./admincourses.css";
import toast from "react-hot-toast";
import axios from "axios";
import { server } from "../../main";

const categories = [
  "Web Development",
  "App Development",
  "Game Development",
  "Data Science",
  "Artificial Intelligence",
];

const AdminCourses = ({ user }) => {
  const navigate = useNavigate();

  if (user && user.role !== "admin") {
    navigate("/");
    return null;
  }

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState("");
  const [imagePrev, setImagePrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const { courses, fetchCourses } = CourseData();

  const changeImageHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImagePrev(reader.result);
      setImage(file);
    };
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const myForm = new FormData();
    myForm.append("title", title);
    myForm.append("description", description);
    myForm.append("category", category);
    myForm.append("price", price);
    myForm.append("createdBy", createdBy);
    myForm.append("duration", duration);
    myForm.append("file", image);

    try {
      const { data } = await axios.post(`${server}/api/course/new`, myForm, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success(data.message);
      setBtnLoading(false);
      await fetchCourses();

      // Reset fields
      setTitle("");
      setDescription("");
      setCategory("");
      setPrice("");
      setCreatedBy("");
      setDuration("");
      setImage("");
      setImagePrev("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Layout>
      <div className="admin-courses-container">
        <div className="admin-header">
          <div className="header-content">
            <h1 className="admin-title">📚 Admin Dashboard</h1>
            <p className="admin-subtitle">Manage all your courses in one place</p>
          </div>
          <div className="stats-badges">
            <div className="stat-badge">
              <span className="stat-number">{courses?.length || 0}</span>
              <span className="stat-label">Courses</span>
            </div>
          </div>
        </div>

        <div className="admin-main-content">
          <div className="courses-section">
            <div className="section-header">
              <h2 className="section-title">📦 All Courses</h2>
              <span className="courses-count">{courses?.length || 0} Total</span>
            </div>

            {courses && courses.length > 0 ? (
              <div className="courses-grid">
                {courses.map((course) => (
                  <div className="course-card-wrapper" key={course._id}>
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🧐</div>
                <h3>No Courses Available</h3>
                <p>Start by adding a new course on the right.</p>
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-container">
              <div className="form-header">
                <h2 className="form-title">➕ Add New Course</h2>
                <p className="form-description">Fill in the details to create a course.</p>
              </div>

              <form onSubmit={submitHandler} className="course-form form-grid">
                <div className="input-group">
                  <label className="input-label">Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" required />
                </div>

                <div className="input-group">
                  <label className="input-label">Description</label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="form-input" required />
                </div>

                <div className="input-group">
                  <label className="input-label">Price</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="form-input" required />
                </div>

                <div className="input-group">
                  <label className="input-label">Created By</label>
                  <input type="text" value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} className="form-input" required />
                </div>

                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-select" required>
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option value={cat} key={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Duration (hours)</label>
                  <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="form-input" required />
                </div>

                <div className="file-upload-area">
                  <label className="file-upload-label">
                    <div className="upload-content">
                      <div className="upload-icon">📤</div>
                      <div className="upload-text">Upload Thumbnail</div>
                      <div className="upload-subtext">Only image files allowed</div>
                    </div>
                    <input type="file" accept="image/*" onChange={changeImageHandler} className="file-input" required />
                  </label>

                  {imagePrev && (
                    <div className="image-preview">
                      <div className="preview-container">
                        <img src={imagePrev} alt="Preview" className="preview-image" />
                        <div className="preview-overlay">Preview</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={btnLoading} className="submit-btn">
                    {btnLoading ? (
                      <>
                        <div className="loading-spinner" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">➕</span> Add Course
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminCourses;
